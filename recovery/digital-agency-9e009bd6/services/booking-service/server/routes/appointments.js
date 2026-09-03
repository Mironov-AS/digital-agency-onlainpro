const { Router } = require('express');
const { db, getClientSetting } = require('../database');
const { requireAuth } = require('../../../../shared/middleware/auth');
const { logAction } = require('../services/logging');
const { emitAsync } = require('../services/webhooks');
const { v4: uuid } = require('uuid');

const router = Router();

const PHONE_RE = /^\+7\s?\d{3}\s?\d{3}\s?\d{2}\s?\d{2}$/;
const CAR_RE = /^[A-ZА-Я0-9\s-]{1,12}$/i;

router.get('/', requireAuth, async (req, res) => {
  try {
    const clientId = req.user.clientId || '';
    const { date, date_from, date_to, service_id, status } = req.query;

    let sql = `
      SELECT a.*, s.name as service_name, s.color as service_color, s.duration as service_duration,
             sp.name as specialist_name
      FROM appointments a
      LEFT JOIN services s ON a.service_id = s.id
      LEFT JOIN specialists sp ON a.specialist_id = sp.id
      WHERE a.client_id = ?
    `;
    const params = [clientId];

    if (date) { sql += ' AND a.appointment_date = ?'; params.push(date); }
    else {
      if (date_from) { sql += ' AND a.appointment_date >= ?'; params.push(date_from); }
      if (date_to) { sql += ' AND a.appointment_date <= ?'; params.push(date_to); }
    }
    if (service_id) { sql += ' AND a.service_id = ?'; params.push(service_id); }
    if (status) { sql += ' AND a.status = ?'; params.push(status); }

    sql += ' ORDER BY a.appointment_date, a.appointment_time';

    const appointments = await db.prepare(sql).all(...params);
    res.json(appointments);
  } catch (err) {
    console.error('Get appointments error:', err);
    res.status(500).json({ error: 'Ошибка загрузки записей' });
  }
});

router.get('/:id', requireAuth, async (req, res) => {
  try {
    const row = await db.prepare(`
      SELECT a.*, s.name as service_name, s.color as service_color, sp.name as specialist_name
      FROM appointments a LEFT JOIN services s ON a.service_id = s.id LEFT JOIN specialists sp ON a.specialist_id = sp.id
      WHERE a.id = ? AND a.client_id = ?
    `).get(req.params.id, req.user.clientId || '');
    if (!row) return res.status(404).json({ error: 'Запись не найдена' });
    res.json(row);
  } catch (err) { res.status(500).json({ error: 'Ошибка сервера' }); }
});

router.post('/', requireAuth, async (req, res) => {
  try {
    const clientId = req.user.clientId || '';
    const { appointment_date, appointment_time, vehicle_number, phone, service_id, comment, customer_name, specialist_id } = req.body;

    if (!appointment_date || !appointment_time || !service_id) {
      return res.status(400).json({ error: 'Дата, время и услуга обязательны' });
    }
    if (phone && !PHONE_RE.test(phone.replace(/\s/g, ''))) {
      return res.status(400).json({ error: 'Неверный формат телефона. Используйте +7XXXXXXXXXX' });
    }
    if (vehicle_number && !CAR_RE.test(vehicle_number)) {
      return res.status(400).json({ error: 'Неверный формат номера автомобиля' });
    }
    if (comment && comment.length > 1000) {
      return res.status(400).json({ error: 'Комментарий не более 1000 символов' });
    }

    const service = await db.prepare("SELECT * FROM services WHERE id = ? AND client_id = ? AND status = 'active'").get(service_id, clientId);
    if (!service) return res.status(404).json({ error: 'Услуга не найдена или неактивна' });

    const workStart = await getClientSetting('working_hours_start', clientId, '08:00');
    const workEnd = await getClientSetting('working_hours_end', clientId, '21:00');
    const workDays = await getClientSetting('working_days', clientId, '1,2,3,4,5,6');

    const bookDate = new Date(appointment_date + 'T12:00:00');
    const dow = bookDate.getDay();
    const isoDow = dow === 0 ? 7 : dow;
    if (!workDays.split(',').map(Number).includes(isoDow)) {
      return res.status(400).json({ error: 'Запись недоступна в выходной день' });
    }

    const [h, m] = appointment_time.split(':').map(Number);
    const appointmentMin = h * 60 + m;
    const [wsH, wsM] = workStart.split(':').map(Number);
    const [weH, weM] = workEnd.split(':').map(Number);
    const duration = service.duration || 60;
    if (appointmentMin < wsH * 60 + (wsM || 0) || appointmentMin + duration > weH * 60 + (weM || 0)) {
      return res.status(400).json({ error: 'Запись возможна только в рабочее время' });
    }

    const endMinutes = h * 60 + m + duration;
    const end_time = `${String(Math.floor(endMinutes / 60)).padStart(2, '0')}:${String(endMinutes % 60).padStart(2, '0')}:00`;

    const conflict = await db.prepare(`
      SELECT id FROM appointments
      WHERE client_id = ? AND appointment_date = ? AND status != 'canceled'
        AND appointment_time < ? AND end_time > ?
    `).get(clientId, appointment_date, end_time, appointment_time + ':00');
    if (conflict) {
      return res.status(409).json({ error: 'На это время уже есть запись. Выберите другое время.' });
    }

    const id = uuid();
    await db.prepare(`
      INSERT INTO appointments (id, client_id, service_id, specialist_id, appointment_date, appointment_time, end_time, vehicle_number, phone, customer_name, comment, status, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'confirmed', ?)
    `).run(id, clientId, service_id, specialist_id || null, appointment_date, appointment_time + ':00', end_time, vehicle_number || '', phone || '', customer_name || '', comment || '', req.user.username);

    await logAction({ clientId, userId: req.user.id, username: req.user.username, action: 'appointment_created', entityType: 'appointment', entityId: id, details: `${appointment_date} ${appointment_time}` });

    const created = await db.prepare("SELECT a.*, s.name as service_name, s.color as service_color, sp.name as specialist_name FROM appointments a LEFT JOIN services s ON a.service_id = s.id LEFT JOIN specialists sp ON a.specialist_id = sp.id WHERE a.id = ?").get(id);

    emitAsync('appointment.created', { ...created, client_id: clientId });

    res.status(201).json(created);
  } catch (err) {
    console.error('Create appointment error:', err);
    res.status(500).json({ error: 'Ошибка создания записи' });
  }
});

router.put('/:id', requireAuth, async (req, res) => {
  try {
    const clientId = req.user.clientId || '';
    const existing = await db.prepare("SELECT * FROM appointments WHERE id = ? AND client_id = ?").get(req.params.id, clientId);
    if (!existing) return res.status(404).json({ error: 'Запись не найдена' });

    const { appointment_date, appointment_time, vehicle_number, phone, service_id, comment, customer_name, status, specialist_id } = req.body;

    let end_time = existing.end_time;
    if ((appointment_time || appointment_date) && service_id) {
      const service = await db.prepare("SELECT duration FROM services WHERE id = ?").get(service_id || existing.service_id);
      const timeStr = appointment_time || existing.appointment_time.slice(0, 5);
      const [h, m] = timeStr.split(':').map(Number);
      const endMin = h * 60 + m + (service?.duration || 60);
      end_time = `${String(Math.floor(endMin / 60)).padStart(2, '0')}:${String(endMin % 60).padStart(2, '0')}:00`;
    }

    await db.prepare(`
      UPDATE appointments SET
        appointment_date = COALESCE(?, appointment_date),
        appointment_time = COALESCE(?, appointment_time),
        end_time = ?,
        vehicle_number = COALESCE(?, vehicle_number),
        phone = COALESCE(?, phone),
        service_id = COALESCE(?, service_id),
        comment = COALESCE(?, comment),
        customer_name = COALESCE(?, customer_name),
        status = COALESCE(?, status),
        specialist_id = COALESCE(?, specialist_id),
        updated_at = NOW()
      WHERE id = ? AND client_id = ?
    `).run(
      appointment_date ?? null, appointment_time ? appointment_time + ':00' : null, end_time,
      vehicle_number ?? null, phone ?? null, service_id ?? null, comment ?? null,
      customer_name ?? null, status ?? null, specialist_id ?? null,
      req.params.id, clientId
    );

    await logAction({ clientId, userId: req.user.id, username: req.user.username, action: 'appointment_updated', entityType: 'appointment', entityId: req.params.id, details: status || 'updated' });

    const updated = await db.prepare("SELECT a.*, s.name as service_name, s.color as service_color, sp.name as specialist_name FROM appointments a LEFT JOIN services s ON a.service_id = s.id LEFT JOIN specialists sp ON a.specialist_id = sp.id WHERE a.id = ?").get(req.params.id);

    emitAsync('appointment.updated', { ...updated, client_id: clientId });

    res.json(updated);
  } catch (err) {
    console.error('Update appointment error:', err);
    res.status(500).json({ error: 'Ошибка обновления записи' });
  }
});

router.put('/:id/confirm', requireAuth, async (req, res) => {
  try {
    const clientId = req.user.clientId || '';
    const existing = await db.prepare("SELECT * FROM appointments WHERE id = ? AND client_id = ?").get(req.params.id, clientId);
    if (!existing) return res.status(404).json({ error: 'Запись не найдена' });
    if (existing.status !== 'pending_review') {
      return res.status(400).json({ error: 'Только записи со статусом «На проверке» можно подтвердить' });
    }

    await db.prepare("UPDATE appointments SET status = 'confirmed', updated_at = NOW() WHERE id = ? AND client_id = ?")
      .run(req.params.id, clientId);

    await logAction({ clientId, userId: req.user.id, username: req.user.username, action: 'appointment_confirmed', entityType: 'appointment', entityId: req.params.id, details: 'Самозапись подтверждена' });

    const updated = await db.prepare("SELECT a.*, s.name as service_name, s.color as service_color, sp.name as specialist_name FROM appointments a LEFT JOIN services s ON a.service_id = s.id LEFT JOIN specialists sp ON a.specialist_id = sp.id WHERE a.id = ?").get(req.params.id);

    emitAsync('appointment.confirmed', { ...updated, client_id: clientId });

    res.json(updated);
  } catch (err) {
    console.error('Confirm appointment error:', err);
    res.status(500).json({ error: 'Ошибка подтверждения записи' });
  }
});

router.put('/:id/reject', requireAuth, async (req, res) => {
  try {
    const clientId = req.user.clientId || '';
    const existing = await db.prepare("SELECT * FROM appointments WHERE id = ? AND client_id = ?").get(req.params.id, clientId);
    if (!existing) return res.status(404).json({ error: 'Запись не найдена' });
    if (existing.status !== 'pending_review') {
      return res.status(400).json({ error: 'Только записи со статусом «На проверке» можно отклонить' });
    }

    await db.prepare("UPDATE appointments SET status = 'canceled', canceled_at = NOW(), canceled_by = ?, updated_at = NOW() WHERE id = ? AND client_id = ?")
      .run(req.user.username, req.params.id, clientId);

    await logAction({ clientId, userId: req.user.id, username: req.user.username, action: 'appointment_rejected', entityType: 'appointment', entityId: req.params.id, details: 'Самозапись отклонена' });

    const updated = await db.prepare("SELECT a.*, s.name as service_name, s.color as service_color, sp.name as specialist_name FROM appointments a LEFT JOIN services s ON a.service_id = s.id LEFT JOIN specialists sp ON a.specialist_id = sp.id WHERE a.id = ?").get(req.params.id);

    emitAsync('appointment.canceled', { ...updated, client_id: clientId });

    res.json(updated);
  } catch (err) {
    console.error('Reject appointment error:', err);
    res.status(500).json({ error: 'Ошибка отклонения записи' });
  }
});

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const clientId = req.user.clientId || '';
    const existing = await db.prepare("SELECT * FROM appointments WHERE id = ? AND client_id = ?").get(req.params.id, clientId);
    if (!existing) return res.status(404).json({ error: 'Запись не найдена' });

    await db.prepare("DELETE FROM appointments WHERE id = ? AND client_id = ?").run(req.params.id, clientId);
    await logAction({ clientId, userId: req.user.id, username: req.user.username, action: 'appointment_deleted', entityType: 'appointment', entityId: req.params.id });

    emitAsync('appointment.deleted', { id: req.params.id, client_id: clientId });

    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: 'Ошибка удаления' }); }
});

module.exports = router;

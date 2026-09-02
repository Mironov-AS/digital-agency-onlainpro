const { Router } = require('express');
const { db, getClientSetting } = require('../database');
const { logAction } = require('../services/logging');
const { emitAsync } = require('../services/webhooks');
const { v4: uuid } = require('uuid');

const router = Router();

const PHONE_RE = /^\+7\s?\d{3}\s?\d{3}\s?\d{2}\s?\d{2}$/;
const SLOT_STEP = 15;

function parseTime(t) { const [h, m] = t.split(':').map(Number); return h * 60 + (m || 0); }
function isWorkingDay(dateStr, workDays) {
  const d = new Date(dateStr + 'T12:00:00');
  const dow = d.getDay();
  const isoDow = dow === 0 ? 7 : dow;
  return workDays.split(',').map(Number).includes(isoDow);
}

router.get('/:clientId/services', async (req, res) => {
  try {
    const { clientId } = req.params;
    const services = await db.prepare(
      "SELECT id, name, description, duration, price, color FROM services WHERE client_id = ? AND status = 'active' ORDER BY sort_order, name"
    ).all(clientId);
    res.json(services);
  } catch (err) {
    console.error('Public services error:', err);
    res.status(500).json({ error: 'Ошибка загрузки услуг' });
  }
});

router.get('/:clientId/slots', async (req, res) => {
  try {
    const { clientId } = req.params;
    const { date, service_id } = req.query;
    if (!date || !service_id) {
      return res.status(400).json({ error: 'Параметры date и service_id обязательны' });
    }

    const workStart = await getClientSetting('working_hours_start', clientId, '08:00');
    const workEnd = await getClientSetting('working_hours_end', clientId, '21:00');
    const workDays = await getClientSetting('working_days', clientId, '1,2,3,4,5,6');

    const service = await db.prepare(
      "SELECT duration FROM services WHERE id = ? AND client_id = ? AND status = 'active'"
    ).get(service_id, clientId);
    if (!service) return res.status(404).json({ error: 'Услуга не найдена' });

    const duration = service.duration || 60;

    if (!isWorkingDay(date, workDays)) {
      return res.json({ date, service_id, duration, slots: [] });
    }

    const booked = await db.prepare(`
      SELECT appointment_time, end_time FROM appointments
      WHERE client_id = ? AND appointment_date = ? AND status != 'canceled'
    `).all(clientId, date);

    const bookedRanges = booked.map(b => ({
      start: timeToMin(b.appointment_time),
      end: timeToMin(b.end_time),
    }));

    const today = new Date().toISOString().slice(0, 10);
    const nowMin = date === today ? new Date().getHours() * 60 + new Date().getMinutes() : 0;

    const workStartMin = parseTime(workStart);
    const workEndMin = parseTime(workEnd);

    const slots = [];
    for (let min = workStartMin; min + duration <= workEndMin; min += SLOT_STEP) {
      if (min < nowMin) continue;
      const slotEnd = min + duration;
      const conflict = bookedRanges.some(r => min < r.end && slotEnd > r.start);
      if (!conflict) {
        slots.push(minToTime(min));
      }
    }

    res.json({ date, service_id, duration, slots });
  } catch (err) {
    console.error('Public slots error:', err);
    res.status(500).json({ error: 'Ошибка загрузки слотов' });
  }
});

router.post('/:clientId/book', async (req, res) => {
  try {
    const { clientId } = req.params;
    const { service_id, appointment_date, appointment_time, customer_name, phone, comment } = req.body;

    if (!service_id || !appointment_date || !appointment_time) {
      return res.status(400).json({ error: 'Услуга, дата и время обязательны' });
    }
    if (customer_name && customer_name.length > 200) {
      return res.status(400).json({ error: 'Имя не более 200 символов' });
    }
    if (phone && !PHONE_RE.test(phone.replace(/\s/g, ''))) {
      return res.status(400).json({ error: 'Неверный формат телефона. Используйте +7XXXXXXXXXX' });
    }
    if (comment && comment.length > 1000) {
      return res.status(400).json({ error: 'Комментарий не более 1000 символов' });
    }

    const service = await db.prepare(
      "SELECT * FROM services WHERE id = ? AND client_id = ? AND status = 'active'"
    ).get(service_id, clientId);
    if (!service) return res.status(404).json({ error: 'Услуга не найдена' });

    const workStart = await getClientSetting('working_hours_start', clientId, '08:00');
    const workEnd = await getClientSetting('working_hours_end', clientId, '21:00');
    const workDays = await getClientSetting('working_days', clientId, '1,2,3,4,5,6');

    if (!isWorkingDay(appointment_date, workDays)) {
      return res.status(400).json({ error: 'Запись недоступна в выходной день' });
    }

    const [h, m] = appointment_time.split(':').map(Number);
    const appointmentMin = h * 60 + m;
    const workStartMin = parseTime(workStart);
    const workEndMin = parseTime(workEnd);
    const duration = service.duration || 60;

    if (appointmentMin < workStartMin || appointmentMin + duration > workEndMin) {
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
      return res.status(409).json({ error: 'Это время уже занято. Выберите другое.' });
    }

    const confirmationRequired = await getClientSetting('self_booking_confirmation', clientId, 'false');
    const appointmentStatus = confirmationRequired === 'true' ? 'pending_review' : 'confirmed';

    const id = uuid();
    await db.prepare(`
      INSERT INTO appointments (id, client_id, service_id, appointment_date, appointment_time, end_time,
        phone, customer_name, comment, status, created_by, source)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'self-booking', 'self-booking')
    `).run(id, clientId, service_id, appointment_date, appointment_time + ':00', end_time,
      phone || '', customer_name || '', comment || '', appointmentStatus);

    await logAction({
      clientId, userId: '', username: 'self-booking',
      action: 'appointment_created', entityType: 'appointment', entityId: id,
      details: `Самозапись: ${appointment_date} ${appointment_time}${appointmentStatus === 'pending_review' ? ' (на проверке)' : ''}`
    });

    emitAsync('appointment.created', {
      id, client_id: clientId, service_id, appointment_date, appointment_time,
      customer_name: customer_name || '', phone: phone || '', status: appointmentStatus,
      source: 'self-booking',
    });

    res.status(201).json({
      id,
      appointment_date,
      appointment_time,
      service_name: service.name,
      customer_name: customer_name || '',
      status: appointmentStatus,
    });
  } catch (err) {
    console.error('Public booking error:', err);
    res.status(500).json({ error: 'Ошибка создания записи' });
  }
});

function timeToMin(t) {
  const parts = String(t).split(':');
  return parseInt(parts[0]) * 60 + parseInt(parts[1]);
}

function minToTime(m) {
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
}

module.exports = router;

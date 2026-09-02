const { Router } = require('express');
const { v4: uuidv4 } = require('uuid');
const { requireAuth } = require('../../../../shared/middleware/auth');
const { db } = require('../db');

const router = Router();
const BOOKING_URL = process.env.BOOKING_SERVICE_URL || 'http://localhost:4008';

const ACTIVITY_TYPES = ['call', 'meeting', 'task', 'service', 'other'];
const ACTIVITY_STATUSES = ['planned', 'completed', 'canceled'];

function getClientId(req) {
  if (req.user.role === 'admin') return req.query.client_id || req.body?.client_id || '';
  return req.user.clientId || '';
}

async function getBookingToken(authToken, clientId) {
  try {
    if (clientId) {
      const ssoRes = await fetch(`${BOOKING_URL}/api/booking/auth/sso`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: authToken, client_id: clientId }),
      });
      if (ssoRes.ok) {
        const data = await ssoRes.json();
        if (data.token) return data.token;
      }
    }
    const loginRes = await fetch(`${BOOKING_URL}/api/booking/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'admin123456', client_id: clientId || '' }),
    });
    if (!loginRes.ok) return null;
    const loginData = await loginRes.json();
    return loginData.token;
  } catch {
    return null;
  }
}

router.get('/', requireAuth, async (req, res) => {
  try {
    const clientId = getClientId(req);
    const { date_from, date_to, customer_id, status, employee_id, order_id } = req.query;

    let sql = `
      SELECT a.*, c.full_name as customer_name, c.phone as customer_phone,
             s.name as service_name, e.full_name as employee_name, o.title as order_title
      FROM activities a
      LEFT JOIN customers c ON a.customer_id = c.id
      LEFT JOIN services s ON a.service_id = s.id
      LEFT JOIN employees e ON a.employee_id = e.id
      LEFT JOIN orders o ON a.order_id = o.id
      WHERE a.client_id = ?
    `;
    const params = [clientId];

    if (date_from) { sql += ' AND a.planned_date >= ?'; params.push(date_from); }
    if (date_to) { sql += ' AND a.planned_date <= ?'; params.push(date_to); }
    if (customer_id) { sql += ' AND a.customer_id = ?'; params.push(customer_id); }
    if (status) { sql += ' AND a.status = ?'; params.push(status); }
    if (employee_id) { sql += ' AND a.employee_id = ?'; params.push(employee_id); }
    if (order_id) { sql += ' AND a.order_id = ?'; params.push(order_id); }

    sql += ' ORDER BY a.planned_date, a.planned_time NULLS LAST';

    const rows = await db.prepare(sql).all(...params);
    res.json(rows);
  } catch (err) {
    console.error('[crm] get activities', err);
    res.status(500).json({ error: 'Ошибка загрузки активностей' });
  }
});

router.get('/reminders', requireAuth, async (req, res) => {
  try {
    const clientId = getClientId(req);
    const today = new Date().toISOString().slice(0, 10);

    const rows = await db.prepare(`
      SELECT a.*, c.full_name as customer_name, c.phone as customer_phone,
             s.name as service_name, e.full_name as employee_name, o.title as order_title
      FROM activities a
      LEFT JOIN customers c ON a.customer_id = c.id
      LEFT JOIN services s ON a.service_id = s.id
      LEFT JOIN employees e ON a.employee_id = e.id
      LEFT JOIN orders o ON a.order_id = o.id
      WHERE a.client_id = ? AND a.planned_date = ? AND a.status = 'planned'
      ORDER BY a.planned_time NULLS LAST
    `).all(clientId, today);

    res.json({ date: today, activities: rows, count: rows.length });
  } catch (err) {
    console.error('[crm] get reminders', err);
    res.status(500).json({ error: 'Ошибка загрузки напоминаний' });
  }
});

router.post('/reminders/mark-sent', requireAuth, async (req, res) => {
  try {
    const clientId = getClientId(req);
    const { activity_ids } = req.body;
    if (!Array.isArray(activity_ids) || !activity_ids.length) {
      return res.status(400).json({ error: 'Укажите список ID активностей' });
    }

    const placeholders = activity_ids.map(() => '?').join(',');
    await db.prepare(
      `UPDATE activities SET reminder_sent = TRUE, updated_at = NOW()
       WHERE client_id = ? AND id IN (${placeholders})`
    ).run(clientId, ...activity_ids);

    res.json({ ok: true, marked: activity_ids.length });
  } catch (err) {
    console.error('[crm] mark reminders sent', err);
    res.status(500).json({ error: 'Ошибка обновления напоминаний' });
  }
});

router.get('/calendar', requireAuth, async (req, res) => {
  try {
    const clientId = getClientId(req);
    const { month, year } = req.query;

    const y = parseInt(year) || new Date().getFullYear();
    const m = parseInt(month) || (new Date().getMonth() + 1);
    const dateFrom = `${y}-${String(m).padStart(2, '0')}-01`;
    const lastDay = new Date(y, m, 0).getDate();
    const dateTo = `${y}-${String(m).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

    const rows = await db.prepare(`
      SELECT a.id, a.title, a.activity_type, a.planned_date, a.planned_time,
             a.status, a.customer_id, c.full_name as customer_name,
             s.name as service_name
      FROM activities a
      LEFT JOIN customers c ON a.customer_id = c.id
      LEFT JOIN services s ON a.service_id = s.id
      WHERE a.client_id = ? AND a.planned_date >= ? AND a.planned_date <= ?
      ORDER BY a.planned_date, a.planned_time NULLS LAST
    `).all(clientId, dateFrom, dateTo);

    const grouped = {};
    for (const row of rows) {
      const d = typeof row.planned_date === 'string'
        ? row.planned_date.slice(0, 10)
        : new Date(row.planned_date).toISOString().slice(0, 10);
      if (!grouped[d]) grouped[d] = [];
      grouped[d].push(row);
    }

    res.json({ year: y, month: m, days: grouped });
  } catch (err) {
    console.error('[crm] get calendar', err);
    res.status(500).json({ error: 'Ошибка загрузки календаря' });
  }
});

router.get('/:id', requireAuth, async (req, res) => {
  try {
    const clientId = getClientId(req);
    const row = await db.prepare(`
      SELECT a.*, c.full_name as customer_name, c.phone as customer_phone,
             s.name as service_name, e.full_name as employee_name, o.title as order_title
      FROM activities a
      LEFT JOIN customers c ON a.customer_id = c.id
      LEFT JOIN services s ON a.service_id = s.id
      LEFT JOIN employees e ON a.employee_id = e.id
      LEFT JOIN orders o ON a.order_id = o.id
      WHERE a.id = ? AND a.client_id = ?
    `).get(req.params.id, clientId);

    if (!row) return res.status(404).json({ error: 'Активность не найдена' });
    res.json(row);
  } catch (err) {
    console.error('[crm] get activity', err);
    res.status(500).json({ error: 'Ошибка загрузки активности' });
  }
});

router.post('/', requireAuth, async (req, res) => {
  try {
    const clientId = getClientId(req);
    const { customer_id, title, description, activity_type, planned_date, planned_time, duration, service_id, order_id, employee_id } = req.body;

    if (!customer_id) return res.status(400).json({ error: 'Клиент обязателен' });
    if (!title || !title.trim()) return res.status(400).json({ error: 'Название обязательно' });
    if (!planned_date) return res.status(400).json({ error: 'Дата обязательна' });

    const type = ACTIVITY_TYPES.includes(activity_type) ? activity_type : 'task';

    const customer = await db.prepare('SELECT id, full_name, phone FROM customers WHERE id = ? AND client_id = ?').get(customer_id, clientId);
    if (!customer) return res.status(404).json({ error: 'Клиент не найден' });

    if (service_id) {
      const svc = await db.prepare('SELECT id FROM services WHERE id = ? AND client_id = ?').get(service_id, clientId);
      if (!svc) return res.status(404).json({ error: 'Услуга не найдена' });
    }

    if (employee_id) {
      const emp = await db.prepare('SELECT id FROM employees WHERE id = ? AND client_id = ?').get(employee_id, clientId);
      if (!emp) return res.status(404).json({ error: 'Сотрудник не найден' });
    }
    if (order_id) {
      const order = await db.prepare('SELECT id FROM orders WHERE id = ? AND client_id = ? AND customer_id = ?').get(order_id, clientId, customer_id);
      if (!order) return res.status(404).json({ error: 'Заказ не найден для выбранного клиента' });
    }

    const id = uuidv4();
    let bookingAppointmentId = null;

    if (service_id && planned_time) {
      bookingAppointmentId = await syncToBooking(req, clientId, {
        customer, service_id, planned_date, planned_time, employee_id, description,
      });
    }

    await db.prepare(`
      INSERT INTO activities (id, client_id, customer_id, title, description, activity_type,
        planned_date, planned_time, duration, service_id, order_id, employee_id, booking_appointment_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, clientId, customer_id, title.trim(), description || '', type,
      planned_date, planned_time || null, duration || 60,
      service_id || null, order_id || null, employee_id || null, bookingAppointmentId);

    const created = await db.prepare(`
      SELECT a.*, c.full_name as customer_name, c.phone as customer_phone,
             s.name as service_name, e.full_name as employee_name, o.title as order_title
      FROM activities a
      LEFT JOIN customers c ON a.customer_id = c.id
      LEFT JOIN services s ON a.service_id = s.id
      LEFT JOIN employees e ON a.employee_id = e.id
      LEFT JOIN orders o ON a.order_id = o.id
      WHERE a.id = ?
    `).get(id);

    res.status(201).json(created);
  } catch (err) {
    console.error('[crm] create activity', err);
    res.status(500).json({ error: 'Ошибка создания активности: ' + err.message });
  }
});

router.put('/:id', requireAuth, async (req, res) => {
  try {
    const clientId = getClientId(req);
    const existing = await db.prepare('SELECT * FROM activities WHERE id = ? AND client_id = ?').get(req.params.id, clientId);
    if (!existing) return res.status(404).json({ error: 'Активность не найдена' });

    const { title, description, activity_type, planned_date, planned_time, duration, service_id, order_id, employee_id, status } = req.body;

    if (status && !ACTIVITY_STATUSES.includes(status)) {
      return res.status(400).json({ error: 'Недопустимый статус' });
    }

    await db.prepare(`
      UPDATE activities SET
        title = COALESCE(?, title),
        description = COALESCE(?, description),
        activity_type = COALESCE(?, activity_type),
        planned_date = COALESCE(?, planned_date),
        planned_time = COALESCE(?, planned_time),
        duration = COALESCE(?, duration),
        service_id = COALESCE(?, service_id),
        order_id = COALESCE(?, order_id),
        employee_id = COALESCE(?, employee_id),
        status = COALESCE(?, status),
        updated_at = NOW()
      WHERE id = ? AND client_id = ?
    `).run(
      title ?? null, description ?? null,
      activity_type && ACTIVITY_TYPES.includes(activity_type) ? activity_type : null,
      planned_date ?? null, planned_time ?? null, duration ?? null,
      service_id ?? null, order_id ?? null, employee_id ?? null, status ?? null,
      req.params.id, clientId,
    );

    // Sync status change to Booking if appointment is linked
    if (status && existing.booking_appointment_id) {
      syncStatusToBooking(req, clientId, existing.booking_appointment_id, status);
    }

    // If adding service+time to activity that wasn't synced yet → create in Booking
    const finalServiceId = service_id || existing.service_id;
    const finalTime = planned_time || existing.planned_time;
    const finalDate = planned_date || (typeof existing.planned_date === 'string' ? existing.planned_date.slice(0, 10) : existing.planned_date?.toISOString().slice(0, 10));
    if (finalServiceId && finalTime && !existing.booking_appointment_id) {
      const customer = await db.prepare('SELECT id, full_name, phone FROM customers WHERE id = ?').get(existing.customer_id);
      if (customer) {
        const aptId = await syncToBooking(req, clientId, {
          customer, service_id: finalServiceId, planned_date: finalDate,
          planned_time: finalTime, employee_id: employee_id || existing.employee_id,
          description: description || existing.description,
        });
        if (aptId) {
          await db.prepare('UPDATE activities SET booking_appointment_id = ? WHERE id = ?').run(aptId, req.params.id);
        }
      }
    }

    const updated = await db.prepare(`
      SELECT a.*, c.full_name as customer_name, c.phone as customer_phone,
             s.name as service_name, e.full_name as employee_name, o.title as order_title
      FROM activities a
      LEFT JOIN customers c ON a.customer_id = c.id
      LEFT JOIN services s ON a.service_id = s.id
      LEFT JOIN employees e ON a.employee_id = e.id
      LEFT JOIN orders o ON a.order_id = o.id
      WHERE a.id = ?
    `).get(req.params.id);

    res.json(updated);
  } catch (err) {
    console.error('[crm] update activity', err);
    res.status(500).json({ error: 'Ошибка обновления активности' });
  }
});

router.post('/:id/complete', requireAuth, async (req, res) => {
  try {
    const clientId = getClientId(req);
    const existing = await db.prepare('SELECT * FROM activities WHERE id = ? AND client_id = ?').get(req.params.id, clientId);
    if (!existing) return res.status(404).json({ error: 'Активность не найдена' });

    await db.prepare(
      "UPDATE activities SET status = 'completed', updated_at = NOW() WHERE id = ? AND client_id = ?"
    ).run(req.params.id, clientId);

    if (existing.booking_appointment_id) {
      syncStatusToBooking(req, clientId, existing.booking_appointment_id, 'completed');
    }

    const updated = await db.prepare(`
      SELECT a.*, c.full_name as customer_name, c.phone as customer_phone,
             s.name as service_name, e.full_name as employee_name, o.title as order_title
      FROM activities a
      LEFT JOIN customers c ON a.customer_id = c.id
      LEFT JOIN services s ON a.service_id = s.id
      LEFT JOIN employees e ON a.employee_id = e.id
      LEFT JOIN orders o ON a.order_id = o.id
      WHERE a.id = ?
    `).get(req.params.id);

    res.json(updated);
  } catch (err) {
    console.error('[crm] complete activity', err);
    res.status(500).json({ error: 'Ошибка завершения активности' });
  }
});

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const clientId = getClientId(req);
    const existing = await db.prepare('SELECT * FROM activities WHERE id = ? AND client_id = ?').get(req.params.id, clientId);
    if (!existing) return res.status(404).json({ error: 'Активность не найдена' });

    await db.prepare('DELETE FROM activities WHERE id = ? AND client_id = ?').run(req.params.id, clientId);
    res.json({ ok: true });
  } catch (err) {
    console.error('[crm] delete activity', err);
    res.status(500).json({ error: 'Ошибка удаления активности' });
  }
});

async function syncStatusToBooking(req, clientId, bookingAppointmentId, crmStatus) {
  try {
    const authToken = req.headers.authorization?.replace('Bearer ', '');
    const bookingToken = await getBookingToken(authToken, clientId);
    if (!bookingToken) return;

    let bookingStatus = null;
    if (crmStatus === 'canceled') bookingStatus = 'canceled';
    else if (crmStatus === 'completed') bookingStatus = 'confirmed';
    if (!bookingStatus) return;

    await fetch(`${BOOKING_URL}/api/booking/appointments/${bookingAppointmentId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${bookingToken}` },
      body: JSON.stringify({ status: bookingStatus }),
    });
  } catch (err) {
    console.error('[crm] sync status to booking', err.message);
  }
}

async function syncToBooking(req, clientId, { customer, service_id, planned_date, planned_time, employee_id, description }) {
  try {
    const healthRes = await fetch(`${BOOKING_URL}/api/health`, { signal: AbortSignal.timeout(3000) });
    if (!healthRes.ok) return null;

    const serviceMap = await db.pool.query(
      "SELECT booking_id FROM booking_sync_map WHERE client_id = $1 AND entity_type = 'service' AND crm_id = $2",
      [clientId, service_id],
    );
    if (!serviceMap.rows.length) return null;
    const bookingServiceId = serviceMap.rows[0].booking_id;

    let bookingSpecialistId = null;
    if (employee_id) {
      const empMap = await db.pool.query(
        "SELECT booking_id FROM booking_sync_map WHERE client_id = $1 AND entity_type = 'specialist' AND crm_id = $2",
        [clientId, employee_id],
      );
      if (empMap.rows.length) bookingSpecialistId = empMap.rows[0].booking_id;
    }

    const authToken = req.headers.authorization?.replace('Bearer ', '');
    const bookingToken = await getBookingToken(authToken, clientId);
    if (!bookingToken) return null;

    const appointmentRes = await fetch(`${BOOKING_URL}/api/booking/appointments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${bookingToken}`,
      },
      body: JSON.stringify({
        appointment_date: planned_date,
        appointment_time: planned_time,
        service_id: bookingServiceId,
        specialist_id: bookingSpecialistId,
        customer_name: customer.full_name,
        phone: customer.phone || '',
        comment: description ? `CRM: ${description}` : 'Создано из CRM Light',
      }),
    });

    if (appointmentRes.ok) {
      const apt = await appointmentRes.json();
      await db.prepare('INSERT INTO booking_sync_map (id, client_id, entity_type, booking_id, crm_id) VALUES (?, ?, ?, ?, ?)')
        .run(uuidv4(), clientId, 'appointment', apt.id, 'activity-sync');
      return apt.id;
    }

    return null;
  } catch (err) {
    console.error('[crm] sync activity to booking', err);
    return null;
  }
}

module.exports = router;

const { Router } = require('express');
const { v4: uuidv4 } = require('uuid');
const { requireAuth } = require('../../../../shared/middleware/auth');
const { db } = require('../db');
const { handleWebhookEvent, runFullSync } = require('../services/bookingSync');

const router = Router();
const BOOKING_URL = process.env.BOOKING_SERVICE_URL || 'http://localhost:4008';

function getClientId(req) {
  if (req.user.role === 'admin') return req.query.client_id || req.body?.client_id || '';
  return req.user.clientId || '';
}

async function isIntegrationEnabled(clientId) {
  const row = await db.prepare('SELECT config FROM display_settings WHERE client_id = ?').get(clientId);
  if (!row) return true;
  const config = typeof row.config === 'string' ? JSON.parse(row.config) : row.config;
  return config.booking_integration_enabled !== false;
}

async function getBookingToken(authToken, clientId) {
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
}

async function bookingFetch(path, bookingToken) {
  const res = await fetch(`${BOOKING_URL}${path}`, {
    headers: {
      'Authorization': `Bearer ${bookingToken}`,
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) throw new Error(`Booking API ${path}: ${res.status}`);
  return res.json();
}

function normalizePhone(phone) {
  return (phone || '').replace(/[^+\d]/g, '');
}

router.get('/status', requireAuth, async (req, res) => {
  try {
    const healthRes = await fetch(`${BOOKING_URL}/health`, { signal: AbortSignal.timeout(5000) });
    const clientId = getClientId(req);

    const syncStats = await db.pool.query(
      `SELECT entity_type, COUNT(*) as count, MAX(synced_at) as last_sync
       FROM booking_sync_map WHERE client_id = $1
       GROUP BY entity_type`, [clientId],
    );
    const stats = {};
    syncStats.rows.forEach(r => { stats[r.entity_type] = { count: +r.count, last_sync: r.last_sync }; });

    const enabled = await isIntegrationEnabled(clientId);
    res.json({
      booking_available: healthRes.ok,
      booking_url: BOOKING_URL,
      integration_enabled: enabled,
      sync_stats: stats,
    });
  } catch (err) {
    res.json({ booking_available: false, booking_url: BOOKING_URL, sync_stats: {}, error: err.message });
  }
});

router.post('/sync-services', requireAuth, async (req, res) => {
  try {
    const clientId = getClientId(req);
    if (!(await isIntegrationEnabled(clientId))) {
      return res.status(403).json({ error: 'Интеграция с Booking отключена в настройках' });
    }
    const authToken = req.headers.authorization?.replace('Bearer ', '');
    const bookingToken = await getBookingToken(authToken, clientId);
    if (!bookingToken) return res.status(502).json({ error: 'Не удалось авторизоваться в Booking' });

    const bookingServices = await bookingFetch('/api/booking/catalog', bookingToken);
    const serviceList = Array.isArray(bookingServices) ? bookingServices : (bookingServices.items || bookingServices.services || []);

    let created = 0, updated = 0, skipped = 0;

    for (const bs of serviceList) {
      const existing = await db.pool.query(
        'SELECT crm_id FROM booking_sync_map WHERE client_id = $1 AND entity_type = $2 AND booking_id = $3',
        [clientId, 'service', bs.id],
      );

      if (existing.rows.length) {
        const crmId = existing.rows[0].crm_id;
        await db.prepare(`
          UPDATE services SET name = ?, description = ?, duration = ?, price = ?, status = ?, updated_at = NOW()
          WHERE id = ?
        `).run(bs.name, bs.description || '', bs.duration || 60, bs.price || 0, bs.status || 'active', crmId);
        await db.prepare('UPDATE booking_sync_map SET synced_at = NOW() WHERE client_id = ? AND entity_type = ? AND booking_id = ?')
          .run(clientId, 'service', bs.id);
        updated++;
      } else {
        const dup = await db.pool.query(
          'SELECT id FROM services WHERE client_id = $1 AND LOWER(name) = LOWER($2)', [clientId, bs.name],
        );
        if (dup.rows.length) {
          const crmId = dup.rows[0].id;
          await db.prepare('INSERT INTO booking_sync_map (id, client_id, entity_type, booking_id, crm_id) VALUES (?, ?, ?, ?, ?)')
            .run(uuidv4(), clientId, 'service', bs.id, crmId);
          skipped++;
        } else {
          const crmId = uuidv4();
          await db.prepare(`
            INSERT INTO services (id, client_id, name, description, duration, price, status)
            VALUES (?, ?, ?, ?, ?, ?, ?)
          `).run(crmId, clientId, bs.name, bs.description || '', bs.duration || 60, bs.price || 0, bs.status || 'active');
          await db.prepare('INSERT INTO booking_sync_map (id, client_id, entity_type, booking_id, crm_id) VALUES (?, ?, ?, ?, ?)')
            .run(uuidv4(), clientId, 'service', bs.id, crmId);
          created++;
        }
      }
    }

    res.json({ total: serviceList.length, created, updated, skipped });
  } catch (err) {
    console.error('[crm] sync-services', err);
    res.status(500).json({ error: 'Ошибка синхронизации услуг: ' + err.message });
  }
});

router.post('/sync-specialists', requireAuth, async (req, res) => {
  try {
    const clientId = getClientId(req);
    if (!(await isIntegrationEnabled(clientId))) {
      return res.status(403).json({ error: 'Интеграция с Booking отключена в настройках' });
    }
    const authToken = req.headers.authorization?.replace('Bearer ', '');
    const bookingToken = await getBookingToken(authToken, clientId);
    if (!bookingToken) return res.status(502).json({ error: 'Не удалось авторизоваться в Booking' });

    const bookingSpecs = await bookingFetch('/api/booking/specialists', bookingToken);
    const specList = Array.isArray(bookingSpecs) ? bookingSpecs : (bookingSpecs.items || bookingSpecs.specialists || []);

    let created = 0, updated = 0, skipped = 0;

    for (const bs of specList) {
      const existing = await db.pool.query(
        'SELECT crm_id FROM booking_sync_map WHERE client_id = $1 AND entity_type = $2 AND booking_id = $3',
        [clientId, 'specialist', bs.id],
      );

      if (existing.rows.length) {
        const crmId = existing.rows[0].crm_id;
        await db.prepare(`
          UPDATE employees SET full_name = ?, position = ?, is_active = ?, updated_at = NOW()
          WHERE id = ?
        `).run(bs.name, bs.position || '', bs.is_active !== false, crmId);
        await db.prepare('UPDATE booking_sync_map SET synced_at = NOW() WHERE client_id = ? AND entity_type = ? AND booking_id = ?')
          .run(clientId, 'specialist', bs.id);
        updated++;
      } else {
        const dup = await db.pool.query(
          'SELECT id FROM employees WHERE client_id = $1 AND LOWER(full_name) = LOWER($2)', [clientId, bs.name],
        );
        if (dup.rows.length) {
          const crmId = dup.rows[0].id;
          await db.prepare('INSERT INTO booking_sync_map (id, client_id, entity_type, booking_id, crm_id) VALUES (?, ?, ?, ?, ?)')
            .run(uuidv4(), clientId, 'specialist', bs.id, crmId);
          skipped++;
        } else {
          const crmId = uuidv4();
          await db.prepare(`
            INSERT INTO employees (id, client_id, full_name, position, is_active)
            VALUES (?, ?, ?, ?, ?)
          `).run(crmId, clientId, bs.name, bs.position || '', bs.is_active !== false);
          await db.prepare('INSERT INTO booking_sync_map (id, client_id, entity_type, booking_id, crm_id) VALUES (?, ?, ?, ?, ?)')
            .run(uuidv4(), clientId, 'specialist', bs.id, crmId);
          created++;
        }
      }
    }

    res.json({ total: specList.length, created, updated, skipped });
  } catch (err) {
    console.error('[crm] sync-specialists', err);
    res.status(500).json({ error: 'Ошибка синхронизации специалистов: ' + err.message });
  }
});

router.post('/sync-customers', requireAuth, async (req, res) => {
  try {
    const clientId = getClientId(req);
    if (!(await isIntegrationEnabled(clientId))) {
      return res.status(403).json({ error: 'Интеграция с Booking отключена в настройках' });
    }
    const authToken = req.headers.authorization?.replace('Bearer ', '');
    const bookingToken = await getBookingToken(authToken, clientId);
    if (!bookingToken) return res.status(502).json({ error: 'Не удалось авторизоваться в Booking' });

    const { date_from, date_to } = req.body;
    let url = '/api/booking/appointments?limit=1000';
    if (date_from) url += `&date_from=${date_from}`;
    if (date_to) url += `&date_to=${date_to}`;

    const appointmentsData = await bookingFetch(url, bookingToken);
    const appointments = Array.isArray(appointmentsData) ? appointmentsData : (appointmentsData.items || appointmentsData.appointments || []);

    const selfBookings = appointments.filter(a => a.source === 'self-booking' || a.created_by === 'self-booking');
    const uniqueCustomers = new Map();
    for (const apt of appointments) {
      if (!apt.phone && !apt.customer_name) continue;
      const phoneKey = normalizePhone(apt.phone);
      const key = phoneKey || apt.customer_name?.toLowerCase();
      if (!key) continue;
      if (!uniqueCustomers.has(key)) {
        const isSelfReg = apt.source === 'self-booking' || apt.created_by === 'self-booking';
        uniqueCustomers.set(key, { name: apt.customer_name || '', phone: phoneKey, isSelfReg });
      }
    }

    let created = 0, matched = 0, selfRegistered = 0;

    for (const [, customer] of uniqueCustomers) {
      if (!customer.phone && !customer.name) continue;

      let existingCustomer = null;
      if (customer.phone) {
        existingCustomer = await db.pool.query(
          'SELECT id FROM customers WHERE client_id = $1 AND phone = $2 LIMIT 1',
          [clientId, customer.phone],
        );
      }
      if (!existingCustomer?.rows?.length && customer.name) {
        existingCustomer = await db.pool.query(
          'SELECT id FROM customers WHERE client_id = $1 AND LOWER(full_name) = LOWER($2) LIMIT 1',
          [clientId, customer.name],
        );
      }

      if (existingCustomer?.rows?.length) {
        matched++;
      } else {
        const crmId = uuidv4();
        const isSelf = customer.isSelfReg;
        await db.prepare(`
          INSERT INTO customers (id, client_id, full_name, phone, notes, is_self_registered, self_reg_source)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(crmId, clientId, customer.name || 'Без имени', customer.phone || '',
          isSelf ? 'Самозапись из Электронной записи' : 'Импортирован из Электронной записи',
          isSelf, isSelf ? 'booking-self' : '');
        created++;
        if (isSelf) selfRegistered++;
      }
    }

    res.json({ total_appointments: appointments.length, unique_customers: uniqueCustomers.size, created, matched, self_registered: selfRegistered });
  } catch (err) {
    console.error('[crm] sync-customers', err);
    res.status(500).json({ error: 'Ошибка синхронизации клиентов: ' + err.message });
  }
});

router.post('/import-records', requireAuth, async (req, res) => {
  try {
    const clientId = getClientId(req);
    if (!(await isIntegrationEnabled(clientId))) {
      return res.status(403).json({ error: 'Интеграция с Booking отключена в настройках' });
    }
    const authToken = req.headers.authorization?.replace('Bearer ', '');
    const bookingToken = await getBookingToken(authToken, clientId);
    if (!bookingToken) return res.status(502).json({ error: 'Не удалось авторизоваться в Booking' });

    const { date_from, date_to } = req.body;
    let url = '/api/booking/appointments?limit=1000';
    if (date_from) url += `&date_from=${date_from}`;
    if (date_to) url += `&date_to=${date_to}`;

    const appointmentsData = await bookingFetch(url, bookingToken);
    const appointments = Array.isArray(appointmentsData) ? appointmentsData : (appointmentsData.items || appointmentsData.appointments || []);

    const confirmedAppts = appointments.filter(a => a.status === 'confirmed');

    let created = 0, skipped = 0;

    for (const apt of confirmedAppts) {
      const alreadyImported = await db.pool.query(
        'SELECT crm_id FROM booking_sync_map WHERE client_id = $1 AND entity_type = $2 AND booking_id = $3',
        [clientId, 'appointment', apt.id],
      );
      if (alreadyImported.rows.length) { skipped++; continue; }

      let customerId = null;
      const phoneNorm = normalizePhone(apt.phone);
      if (phoneNorm) {
        const found = await db.pool.query(
          'SELECT id FROM customers WHERE client_id = $1 AND phone = $2 LIMIT 1', [clientId, phoneNorm],
        );
        customerId = found.rows[0]?.id;
      }
      if (!customerId && apt.customer_name) {
        const found = await db.pool.query(
          'SELECT id FROM customers WHERE client_id = $1 AND LOWER(full_name) = LOWER($2) LIMIT 1',
          [clientId, apt.customer_name],
        );
        customerId = found.rows[0]?.id;
      }
      if (!customerId) {
        customerId = uuidv4();
        const isSelf = apt.source === 'self-booking' || apt.created_by === 'self-booking';
        await db.prepare('INSERT INTO customers (id, client_id, full_name, phone, notes, is_self_registered, self_reg_source) VALUES (?, ?, ?, ?, ?, ?, ?)')
          .run(customerId, clientId, apt.customer_name || 'Без имени', phoneNorm || '',
            isSelf ? 'Самозапись из Электронной записи' : 'Создан при импорте записи из Booking',
            isSelf, isSelf ? 'booking-self' : '');
      }

      let serviceId = null;
      if (apt.service_id) {
        const smap = await db.pool.query(
          'SELECT crm_id FROM booking_sync_map WHERE client_id = $1 AND entity_type = $2 AND booking_id = $3',
          [clientId, 'service', apt.service_id],
        );
        serviceId = smap.rows[0]?.crm_id || null;
      }

      let employeeId = null;
      if (apt.specialist_id) {
        const emap = await db.pool.query(
          'SELECT crm_id FROM booking_sync_map WHERE client_id = $1 AND entity_type = $2 AND booking_id = $3',
          [clientId, 'specialist', apt.specialist_id],
        );
        employeeId = emap.rows[0]?.crm_id || null;
      }

      const performedAt = apt.appointment_date
        ? `${apt.appointment_date}T${apt.appointment_time || '00:00'}:00`
        : apt.created_at;

      let duration = 0;
      if (apt.appointment_time && apt.end_time) {
        const [sh, sm] = apt.appointment_time.split(':').map(Number);
        const [eh, em] = apt.end_time.split(':').map(Number);
        duration = (eh * 60 + em) - (sh * 60 + sm);
      }

      const recordId = uuidv4();
      await db.prepare(`
        INSERT INTO work_records (id, client_id, customer_id, service_id, employee_id, performed_at, duration, price, comment)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(recordId, clientId, customerId, serviceId, employeeId,
        performedAt, duration > 0 ? duration : 0, apt.price || 0,
        apt.comment ? `Booking: ${apt.comment}` : 'Импорт из Электронной записи');

      await db.prepare('INSERT INTO booking_sync_map (id, client_id, entity_type, booking_id, crm_id) VALUES (?, ?, ?, ?, ?)')
        .run(uuidv4(), clientId, 'appointment', apt.id, recordId);
      created++;
    }

    res.json({ total: appointments.length, confirmed: confirmedAppts.length, imported: created, skipped });
  } catch (err) {
    console.error('[crm] import-records', err);
    res.status(500).json({ error: 'Ошибка импорта записей: ' + err.message });
  }
});

router.get('/appointments', requireAuth, async (req, res) => {
  try {
    const clientId = getClientId(req);
    const authToken = req.headers.authorization?.replace('Bearer ', '');
    const bookingToken = await getBookingToken(authToken, clientId);
    if (!bookingToken) return res.status(502).json({ error: 'Не удалось авторизоваться в Booking' });

    const { date, date_from, date_to } = req.query;
    let url = '/api/booking/appointments?limit=100';
    if (date) url += `&date=${date}`;
    if (date_from) url += `&date_from=${date_from}`;
    if (date_to) url += `&date_to=${date_to}`;

    const data = await bookingFetch(url, bookingToken);
    const appointments = Array.isArray(data) ? data : (data.items || data.appointments || []);

    for (const apt of appointments) {
      apt.crm_customer = null;
      const phoneNorm = normalizePhone(apt.phone);
      if (phoneNorm) {
        const found = await db.pool.query(
          'SELECT id, full_name, phone, email FROM customers WHERE client_id = $1 AND phone = $2 LIMIT 1',
          [clientId, phoneNorm],
        );
        if (found.rows.length) apt.crm_customer = found.rows[0];
      }
      if (!apt.crm_customer && apt.customer_name) {
        const found = await db.pool.query(
          'SELECT id, full_name, phone, email FROM customers WHERE client_id = $1 AND LOWER(full_name) = LOWER($2) LIMIT 1',
          [clientId, apt.customer_name],
        );
        if (found.rows.length) apt.crm_customer = found.rows[0];
      }

      const imported = await db.pool.query(
        'SELECT crm_id FROM booking_sync_map WHERE client_id = $1 AND entity_type = $2 AND booking_id = $3',
        [clientId, 'appointment', apt.id],
      );
      apt.imported_to_crm = !!imported.rows.length;
    }

    res.json(appointments);
  } catch (err) {
    console.error('[crm] get booking appointments', err);
    res.status(500).json({ error: 'Ошибка получения записей из Booking: ' + err.message });
  }
});

router.post('/webhook', async (req, res) => {
  try {
    const { event, data } = req.body;
    if (!event || !data) {
      return res.status(400).json({ error: 'Missing event or data' });
    }
    const clientId = data.client_id || '';
    const enabled = await isIntegrationEnabled(clientId);
    if (!enabled) {
      return res.json({ ok: true, skipped: true, reason: 'integration_disabled' });
    }
    await handleWebhookEvent(event, data);
    res.json({ ok: true, event });
  } catch (err) {
    console.error('[crm] webhook handler error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

router.post('/full-sync', requireAuth, async (req, res) => {
  try {
    await runFullSync();
    res.json({ ok: true, message: 'Full sync completed' });
  } catch (err) {
    console.error('[crm] full-sync error:', err);
    res.status(500).json({ error: 'Ошибка полной синхронизации: ' + err.message });
  }
});

module.exports = router;

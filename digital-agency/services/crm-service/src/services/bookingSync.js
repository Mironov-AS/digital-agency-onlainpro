const { v4: uuidv4 } = require('uuid');
const { db } = require('../db');

const BOOKING_URL = process.env.BOOKING_SERVICE_URL || 'http://localhost:4008';
const SYNC_INTERVAL = 10 * 60 * 1000; // 10 minutes

let syncTimer = null;

function normalizePhone(phone) {
  return (phone || '').replace(/[^+\d]/g, '');
}

async function getBookingToken(clientId) {
  const loginRes = await fetch(`${BOOKING_URL}/api/booking/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'admin123456', client_id: clientId || '' }),
  });
  if (!loginRes.ok) return null;
  const data = await loginRes.json();
  return data.token;
}

async function bookingFetch(path, token) {
  const res = await fetch(`${BOOKING_URL}${path}`, {
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error(`Booking ${path}: ${res.status}`);
  return res.json();
}

async function getActiveClientIds() {
  const { rows } = await db.pool.query(
    'SELECT DISTINCT client_id FROM booking_sync_map'
  );
  return rows.map(r => r.client_id);
}

async function syncServicesForClient(clientId, token) {
  const bookingServices = await bookingFetch('/api/booking/catalog', token);
  const serviceList = Array.isArray(bookingServices) ? bookingServices : (bookingServices.items || bookingServices.services || []);

  let created = 0, updated = 0;

  for (const bs of serviceList) {
    const existing = await db.pool.query(
      'SELECT crm_id FROM booking_sync_map WHERE client_id = $1 AND entity_type = $2 AND booking_id = $3',
      [clientId, 'service', bs.id],
    );

    if (existing.rows.length) {
      await db.prepare(`
        UPDATE services SET name = ?, description = ?, duration = ?, price = ?, status = ?, updated_at = NOW()
        WHERE id = ?
      `).run(bs.name, bs.description || '', bs.duration || 60, bs.price || 0, bs.status || 'active', existing.rows[0].crm_id);
      await db.prepare('UPDATE booking_sync_map SET synced_at = NOW() WHERE client_id = ? AND entity_type = ? AND booking_id = ?')
        .run(clientId, 'service', bs.id);
      updated++;
    } else {
      const dup = await db.pool.query(
        'SELECT id FROM services WHERE client_id = $1 AND LOWER(name) = LOWER($2)', [clientId, bs.name],
      );
      if (dup.rows.length) {
        await db.prepare('INSERT INTO booking_sync_map (id, client_id, entity_type, booking_id, crm_id) VALUES (?, ?, ?, ?, ?)')
          .run(uuidv4(), clientId, 'service', bs.id, dup.rows[0].id);
      } else {
        const crmId = uuidv4();
        await db.prepare(
          'INSERT INTO services (id, client_id, name, description, duration, price, status) VALUES (?, ?, ?, ?, ?, ?, ?)'
        ).run(crmId, clientId, bs.name, bs.description || '', bs.duration || 60, bs.price || 0, bs.status || 'active');
        await db.prepare('INSERT INTO booking_sync_map (id, client_id, entity_type, booking_id, crm_id) VALUES (?, ?, ?, ?, ?)')
          .run(uuidv4(), clientId, 'service', bs.id, crmId);
        created++;
      }
    }
  }
  return { services: { total: serviceList.length, created, updated } };
}

async function syncSpecialistsForClient(clientId, token) {
  const bookingSpecs = await bookingFetch('/api/booking/specialists', token);
  const specList = Array.isArray(bookingSpecs) ? bookingSpecs : (bookingSpecs.items || bookingSpecs.specialists || []);

  let created = 0, updated = 0;

  for (const bs of specList) {
    const existing = await db.pool.query(
      'SELECT crm_id FROM booking_sync_map WHERE client_id = $1 AND entity_type = $2 AND booking_id = $3',
      [clientId, 'specialist', bs.id],
    );

    if (existing.rows.length) {
      await db.prepare(`
        UPDATE employees SET full_name = ?, position = ?, is_active = ?, updated_at = NOW() WHERE id = ?
      `).run(bs.name, bs.position || '', bs.is_active !== false, existing.rows[0].crm_id);
      await db.prepare('UPDATE booking_sync_map SET synced_at = NOW() WHERE client_id = ? AND entity_type = ? AND booking_id = ?')
        .run(clientId, 'specialist', bs.id);
      updated++;
    } else {
      const dup = await db.pool.query(
        'SELECT id FROM employees WHERE client_id = $1 AND LOWER(full_name) = LOWER($2)', [clientId, bs.name],
      );
      if (dup.rows.length) {
        await db.prepare('INSERT INTO booking_sync_map (id, client_id, entity_type, booking_id, crm_id) VALUES (?, ?, ?, ?, ?)')
          .run(uuidv4(), clientId, 'specialist', bs.id, dup.rows[0].id);
      } else {
        const crmId = uuidv4();
        await db.prepare(
          'INSERT INTO employees (id, client_id, full_name, position, is_active) VALUES (?, ?, ?, ?, ?)'
        ).run(crmId, clientId, bs.name, bs.position || '', bs.is_active !== false);
        await db.prepare('INSERT INTO booking_sync_map (id, client_id, entity_type, booking_id, crm_id) VALUES (?, ?, ?, ?, ?)')
          .run(uuidv4(), clientId, 'specialist', bs.id, crmId);
        created++;
      }
    }
  }
  return { specialists: { total: specList.length, created, updated } };
}

async function syncNewAppointmentsForClient(clientId, token) {
  const today = new Date().toISOString().slice(0, 10);
  const data = await bookingFetch(`/api/booking/appointments?date_from=${today}&limit=500`, token);
  const appointments = Array.isArray(data) ? data : (data.items || data.appointments || []);

  let created = 0, skipped = 0;

  for (const apt of appointments) {
    const alreadyImported = await db.pool.query(
      'SELECT crm_id FROM booking_sync_map WHERE client_id = $1 AND entity_type = $2 AND booking_id = $3',
      [clientId, 'appointment', apt.id],
    );
    if (alreadyImported.rows.length) { skipped++; continue; }
    if (apt.status === 'canceled') continue;

    const phoneNorm = normalizePhone(apt.phone);
    let customerId = null;

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
      await db.prepare(
        'INSERT INTO customers (id, client_id, full_name, phone, notes, is_self_registered, self_reg_source) VALUES (?, ?, ?, ?, ?, ?, ?)'
      ).run(customerId, clientId, apt.customer_name || 'Без имени', phoneNorm || '',
        isSelf ? 'Самозапись из Электронной записи' : 'Автосинхронизация из Booking',
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
      'Автосинхронизация из Электронной записи');

    await db.prepare('INSERT INTO booking_sync_map (id, client_id, entity_type, booking_id, crm_id) VALUES (?, ?, ?, ?, ?)')
      .run(uuidv4(), clientId, 'appointment', apt.id, recordId);
    created++;
  }

  return { appointments: { total: appointments.length, created, skipped } };
}

async function runFullSync() {
  try {
    const healthRes = await fetch(`${BOOKING_URL}/health`, { signal: AbortSignal.timeout(5000) });
    if (!healthRes.ok) {
      console.log('[crm-sync] Booking unavailable, skipping');
      return;
    }
  } catch {
    console.log('[crm-sync] Booking unreachable, skipping');
    return;
  }

  const clientIds = await getActiveClientIds();
  if (!clientIds.length) {
    console.log('[crm-sync] No synced clients, skipping');
    return;
  }

  for (const clientId of clientIds) {
    try {
      const token = await getBookingToken(clientId);
      if (!token) continue;

      const svcResult = await syncServicesForClient(clientId, token);
      const specResult = await syncSpecialistsForClient(clientId, token);
      const aptResult = await syncNewAppointmentsForClient(clientId, token);

      console.log(`[crm-sync] client=${clientId || 'default'}`, JSON.stringify({ ...svcResult, ...specResult, ...aptResult }));
    } catch (err) {
      console.error(`[crm-sync] Error for client ${clientId}:`, err.message);
    }
  }
}

// --- Webhook event handlers (real-time from Booking) ---

async function handleAppointmentCreated(data) {
  const clientId = data.client_id || '';
  const aptId = data.id;
  if (!aptId) return;

  const alreadyImported = await db.pool.query(
    'SELECT crm_id FROM booking_sync_map WHERE client_id = $1 AND entity_type = $2 AND booking_id = $3',
    [clientId, 'appointment', aptId],
  );
  if (alreadyImported.rows.length) return;
  if (data.status === 'canceled') return;

  const phoneNorm = normalizePhone(data.phone);
  let customerId = null;

  if (phoneNorm) {
    const found = await db.pool.query(
      'SELECT id FROM customers WHERE client_id = $1 AND phone = $2 LIMIT 1', [clientId, phoneNorm],
    );
    customerId = found.rows[0]?.id;
  }
  if (!customerId && data.customer_name) {
    const found = await db.pool.query(
      'SELECT id FROM customers WHERE client_id = $1 AND LOWER(full_name) = LOWER($2) LIMIT 1',
      [clientId, data.customer_name],
    );
    customerId = found.rows[0]?.id;
  }
  if (!customerId) {
    customerId = uuidv4();
    const isSelf = data.source === 'self-booking' || data.created_by === 'self-booking';
    await db.prepare(
      'INSERT INTO customers (id, client_id, full_name, phone, notes, is_self_registered, self_reg_source) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).run(customerId, clientId, data.customer_name || 'Без имени', phoneNorm || '',
      isSelf ? 'Самозапись из Электронной записи' : 'Автосинхронизация из Booking',
      isSelf, isSelf ? 'booking-self' : '');
  }

  let serviceId = null;
  if (data.service_id) {
    const smap = await db.pool.query(
      'SELECT crm_id FROM booking_sync_map WHERE client_id = $1 AND entity_type = $2 AND booking_id = $3',
      [clientId, 'service', data.service_id],
    );
    serviceId = smap.rows[0]?.crm_id || null;
  }

  let employeeId = null;
  if (data.specialist_id) {
    const emap = await db.pool.query(
      'SELECT crm_id FROM booking_sync_map WHERE client_id = $1 AND entity_type = $2 AND booking_id = $3',
      [clientId, 'specialist', data.specialist_id],
    );
    employeeId = emap.rows[0]?.crm_id || null;
  }

  const performedAt = data.appointment_date
    ? `${data.appointment_date}T${(data.appointment_time || '00:00').slice(0, 5)}:00`
    : new Date().toISOString();

  let duration = 0;
  if (data.appointment_time && data.end_time) {
    const [sh, sm] = data.appointment_time.split(':').map(Number);
    const [eh, em] = data.end_time.split(':').map(Number);
    duration = (eh * 60 + em) - (sh * 60 + sm);
  }

  const recordId = uuidv4();
  await db.prepare(`
    INSERT INTO work_records (id, client_id, customer_id, service_id, employee_id, performed_at, duration, price, comment)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(recordId, clientId, customerId, serviceId, employeeId,
    performedAt, duration > 0 ? duration : 0, data.price || 0,
    'Webhook: новая запись из Электронной записи');

  await db.prepare('INSERT INTO booking_sync_map (id, client_id, entity_type, booking_id, crm_id) VALUES (?, ?, ?, ?, ?)')
    .run(uuidv4(), clientId, 'appointment', aptId, recordId);

  console.log(`[crm-sync] webhook: appointment ${aptId} → work_record ${recordId}`);
}

async function handleServiceChanged(data) {
  const clientId = data.client_id || '';
  const bookingId = data.id;
  if (!bookingId) return;

  const existing = await db.pool.query(
    'SELECT crm_id FROM booking_sync_map WHERE client_id = $1 AND entity_type = $2 AND booking_id = $3',
    [clientId, 'service', bookingId],
  );

  if (existing.rows.length) {
    await db.prepare(`
      UPDATE services SET name = ?, description = ?, duration = ?, price = ?, status = ?, updated_at = NOW() WHERE id = ?
    `).run(data.name, data.description || '', data.duration || 60, data.price || 0, data.status || 'active', existing.rows[0].crm_id);
    await db.prepare('UPDATE booking_sync_map SET synced_at = NOW() WHERE client_id = ? AND entity_type = ? AND booking_id = ?')
      .run(clientId, 'service', bookingId);
  } else {
    const crmId = uuidv4();
    await db.prepare(
      'INSERT INTO services (id, client_id, name, description, duration, price, status) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).run(crmId, clientId, data.name, data.description || '', data.duration || 60, data.price || 0, data.status || 'active');
    await db.prepare('INSERT INTO booking_sync_map (id, client_id, entity_type, booking_id, crm_id) VALUES (?, ?, ?, ?, ?)')
      .run(uuidv4(), clientId, 'service', bookingId, crmId);
  }

  console.log(`[crm-sync] webhook: service ${bookingId} synced`);
}

async function handleSpecialistChanged(data) {
  const clientId = data.client_id || '';
  const bookingId = data.id;
  if (!bookingId) return;

  const existing = await db.pool.query(
    'SELECT crm_id FROM booking_sync_map WHERE client_id = $1 AND entity_type = $2 AND booking_id = $3',
    [clientId, 'specialist', bookingId],
  );

  if (existing.rows.length) {
    await db.prepare(`
      UPDATE employees SET full_name = ?, position = ?, is_active = ?, updated_at = NOW() WHERE id = ?
    `).run(data.name, data.position || '', data.is_active !== false, existing.rows[0].crm_id);
    await db.prepare('UPDATE booking_sync_map SET synced_at = NOW() WHERE client_id = ? AND entity_type = ? AND booking_id = ?')
      .run(clientId, 'specialist', bookingId);
  } else {
    const crmId = uuidv4();
    await db.prepare(
      'INSERT INTO employees (id, client_id, full_name, position, is_active) VALUES (?, ?, ?, ?, ?)'
    ).run(crmId, clientId, data.name, data.position || '', data.is_active !== false);
    await db.prepare('INSERT INTO booking_sync_map (id, client_id, entity_type, booking_id, crm_id) VALUES (?, ?, ?, ?, ?)')
      .run(uuidv4(), clientId, 'specialist', bookingId, crmId);
  }

  console.log(`[crm-sync] webhook: specialist ${bookingId} synced`);
}

async function handleWebhookEvent(event, data) {
  switch (event) {
    case 'appointment.created':
    case 'appointment.confirmed':
      await handleAppointmentCreated(data);
      break;
    case 'appointment.updated':
      await handleAppointmentCreated(data);
      break;
    case 'appointment.canceled':
    case 'appointment.deleted':
      // Mark in sync map but don't delete work record
      break;
    case 'service.created':
    case 'service.updated':
      await handleServiceChanged(data);
      break;
    case 'service.deleted':
      // Don't delete CRM service, just unlink
      if (data.id && data.client_id !== undefined) {
        await db.prepare('DELETE FROM booking_sync_map WHERE client_id = ? AND entity_type = ? AND booking_id = ?')
          .run(data.client_id || '', 'service', data.id);
      }
      break;
    case 'specialist.created':
    case 'specialist.updated':
      await handleSpecialistChanged(data);
      break;
    case 'specialist.deleted':
      if (data.id && data.client_id !== undefined) {
        await db.prepare('DELETE FROM booking_sync_map WHERE client_id = ? AND entity_type = ? AND booking_id = ?')
          .run(data.client_id || '', 'specialist', data.id);
      }
      break;
    default:
      console.log(`[crm-sync] Unknown event: ${event}`);
  }
}

function startBackgroundSync() {
  if (syncTimer) return;
  console.log('[crm-sync] Background sync started (interval: 10min)');
  syncTimer = setInterval(async () => {
    try {
      await runFullSync();
    } catch (err) {
      console.error('[crm-sync] Background sync error:', err.message);
    }
  }, SYNC_INTERVAL);

  setTimeout(() => runFullSync().catch(() => {}), 30000);
}

function stopBackgroundSync() {
  if (syncTimer) {
    clearInterval(syncTimer);
    syncTimer = null;
  }
}

module.exports = {
  handleWebhookEvent,
  runFullSync,
  startBackgroundSync,
  stopBackgroundSync,
};

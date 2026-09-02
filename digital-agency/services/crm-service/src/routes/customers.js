const { Router } = require('express');
const { v4: uuidv4 } = require('uuid');
const { requireAuth } = require('../../../../shared/middleware/auth');
const { db } = require('../db');

const router = Router();

const DEFAULT_DISPLAY_COLUMNS = ['full_name', 'phone', 'email', 'created_at'];
const SEARCHABLE_STANDARD = ['full_name', 'phone', 'email', 'additional_contacts', 'notes'];

function getClientId(req) {
  if (req.user.role === 'admin') return req.query.client_id || req.body?.client_id || '';
  return req.user.clientId || '';
}

async function getDisplayColumns(clientId) {
  const row = await db.prepare('SELECT config FROM display_settings WHERE client_id = ?').get(clientId);
  if (!row) return DEFAULT_DISPLAY_COLUMNS;
  const config = typeof row.config === 'string' ? JSON.parse(row.config) : row.config;
  return config.columns || DEFAULT_DISPLAY_COLUMNS;
}

async function attachCustomValues(customers, clientId) {
  if (!customers.length) return;
  const ids = customers.map(c => c.id);
  const placeholders = ids.map((_, i) => `$${i + 1}`).join(',');
  const params = [...ids];
  let tenantJoin = '';
  if (clientId) {
    params.push(clientId);
    tenantJoin = `JOIN custom_fields cf ON cf.id = ccv.field_id AND cf.client_id = $${params.length}`;
  }
  const { rows } = await db.pool.query(
    `SELECT ccv.* FROM customer_custom_values ccv ${tenantJoin} WHERE ccv.customer_id IN (${placeholders})`,
    params,
  );
  const map = {};
  rows.forEach(r => {
    if (!map[r.customer_id]) map[r.customer_id] = {};
    map[r.customer_id][r.field_id] = r.value;
  });
  customers.forEach(c => { c.custom_values = map[c.id] || {}; });
}

async function saveCustomValues(customerId, customValues, clientId) {
  if (!customValues || typeof customValues !== 'object') return;
  for (const [fieldId, value] of Object.entries(customValues)) {
    const field = await db.prepare(
      'SELECT id FROM custom_fields WHERE id = ? AND client_id = ? AND is_deleted = FALSE',
    ).get(fieldId, clientId);
    if (!field) continue;

    const val = String(value ?? '');
    const id = uuidv4();
    await db.pool.query(
      `INSERT INTO customer_custom_values (id, customer_id, field_id, value)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (customer_id, field_id) DO UPDATE SET value = $4`,
      [id, customerId, fieldId, val],
    );
  }
}

router.get('/', requireAuth, async (req, res) => {
  try {
    const clientId = getClientId(req);
    const { search, sort_by, sort_dir, page = 1, limit = 50, self_registered_only } = req.query;
    const offset = (Math.max(1, +page) - 1) * +limit;

    let where = 'WHERE c.client_id = $1';
    const params = [clientId];
    let idx = 2;

    if (self_registered_only === 'true') {
      where += ' AND c.is_self_registered = TRUE';
    }

    if (search) {
      const displayCols = await getDisplayColumns(clientId);
      const searchClauses = [];
      const stdVisible = SEARCHABLE_STANDARD.filter(f => displayCols.includes(f));
      const searchParam = `%${search}%`;
      if (stdVisible.length) {
        stdVisible.forEach(f => searchClauses.push(`c.${f} ILIKE $${idx}`));
        params.push(searchParam);
        idx++;
      } else {
        searchClauses.push(`c.full_name ILIKE $${idx}`);
        params.push(searchParam);
        idx++;
      }
      const cfCols = displayCols.filter(k => k.startsWith('cf_'));
      for (const cfKey of cfCols) {
        const fieldId = cfKey.slice(3);
        searchClauses.push(
          `EXISTS (SELECT 1 FROM customer_custom_values ccv WHERE ccv.customer_id = c.id AND ccv.field_id = $${idx} AND ccv.value ILIKE $${idx + 1})`,
        );
        params.push(fieldId, searchParam);
        idx += 2;
      }
      where += ` AND (${searchClauses.join(' OR ')})`;
    }

    const allowed = ['full_name', 'phone', 'email', 'created_at', 'updated_at'];
    const orderCol = allowed.includes(sort_by) ? sort_by : 'created_at';
    const orderDir = sort_dir === 'asc' ? 'ASC' : 'DESC';

    const countRes = await db.pool.query(
      `SELECT COUNT(*) as total FROM customers c ${where}`, params,
    );
    const total = +countRes.rows[0].total;

    const { rows } = await db.pool.query(
      `SELECT c.* FROM customers c
       ${where}
       ORDER BY c.${orderCol} ${orderDir}
       LIMIT $${idx} OFFSET $${idx + 1}`,
      [...params, +limit, offset],
    );

    await attachCustomValues(rows, clientId);
    res.json({ items: rows, total, page: +page, limit: +limit });
  } catch (err) {
    console.error('[crm] GET /customers', err);
    res.status(500).json({ error: 'Ошибка при получении клиентов' });
  }
});

router.get('/self-registered/count', requireAuth, async (req, res) => {
  try {
    const clientId = getClientId(req);
    const result = await db.pool.query(
      'SELECT COUNT(*) as total FROM customers WHERE client_id = $1 AND is_self_registered = TRUE',
      [clientId],
    );
    res.json({ count: +result.rows[0].total });
  } catch (err) {
    console.error('[crm] GET /customers/self-registered/count', err);
    res.status(500).json({ error: 'Ошибка' });
  }
});

router.get('/self-registered', requireAuth, async (req, res) => {
  try {
    const clientId = getClientId(req);
    const { page = 1, limit = 30 } = req.query;
    const offset = (Math.max(1, +page) - 1) * +limit;

    const countRes = await db.pool.query(
      'SELECT COUNT(*) as total FROM customers WHERE client_id = $1 AND is_self_registered = TRUE',
      [clientId],
    );
    const total = +countRes.rows[0].total;

    const { rows } = await db.pool.query(
      `SELECT * FROM customers WHERE client_id = $1 AND is_self_registered = TRUE
       ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
      [clientId, +limit, offset],
    );

    await attachCustomValues(rows, clientId);
    res.json({ items: rows, total, page: +page, limit: +limit });
  } catch (err) {
    console.error('[crm] GET /customers/self-registered', err);
    res.status(500).json({ error: 'Ошибка' });
  }
});

router.get('/:id', requireAuth, async (req, res) => {
  try {
    const clientId = getClientId(req);
    const customer = await db.prepare('SELECT * FROM customers WHERE id = ? AND client_id = ?').get(req.params.id, clientId);
    if (!customer) return res.status(404).json({ error: 'Клиент не найден' });

    await attachCustomValues([customer], clientId);
    res.json(customer);
  } catch (err) {
    console.error('[crm] GET /customers/:id', err);
    res.status(500).json({ error: 'Ошибка при получении клиента' });
  }
});

router.get('/:id/history', requireAuth, async (req, res) => {
  try {
    const clientId = getClientId(req);
    const customer = await db.prepare('SELECT id FROM customers WHERE id = ? AND client_id = ?').get(req.params.id, clientId);
    if (!customer) return res.status(404).json({ error: 'Клиент не найден' });

    const records = await db.prepare(`
      SELECT wr.*, s.name as service_name, e.full_name as employee_name
      FROM work_records wr
      LEFT JOIN services s ON s.id = wr.service_id
      LEFT JOIN employees e ON e.id = wr.employee_id
      WHERE wr.customer_id = ? AND wr.client_id = ?
      ORDER BY wr.performed_at DESC
    `).all(req.params.id, clientId);
    res.json(records);
  } catch (err) {
    console.error('[crm] GET /customers/:id/history', err);
    res.status(500).json({ error: 'Ошибка при получении истории' });
  }
});

router.get('/:id/orders', requireAuth, async (req, res) => {
  try {
    const clientId = getClientId(req);
    const orders = await db.prepare(`
      SELECT o.*,
             COUNT(oi.id)::INT AS items_count
      FROM orders o
      LEFT JOIN order_items oi ON oi.order_id = o.id
      WHERE o.customer_id = ? AND o.client_id = ?
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `).all(req.params.id, clientId);
    res.json(orders);
  } catch (err) {
    console.error('[crm] GET /customers/:id/orders', err);
    res.status(500).json({ error: 'Ошибка при получении заказов клиента' });
  }
});

router.post('/', requireAuth, async (req, res) => {
  try {
    const clientId = req.user.role === 'admin'
      ? (req.body.client_id || '') : (req.user.clientId || '');
    const { full_name, phone, email, additional_contacts, notes, custom_values } = req.body;

    if (!full_name || !phone) {
      return res.status(400).json({ error: 'ФИО и телефон обязательны' });
    }

    const id = uuidv4();
    await db.prepare(`
      INSERT INTO customers (id, client_id, full_name, phone, email, additional_contacts, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(id, clientId, full_name, phone, email || '', additional_contacts || '', notes || '');

    await saveCustomValues(id, custom_values, clientId);

    const created = await db.prepare('SELECT * FROM customers WHERE id = ? AND client_id = ?').get(id, clientId);
    await attachCustomValues([created], clientId);
    res.status(201).json(created);
  } catch (err) {
    console.error('[crm] POST /customers', err);
    res.status(500).json({ error: 'Ошибка при создании клиента' });
  }
});

router.put('/:id', requireAuth, async (req, res) => {
  try {
    const clientId = getClientId(req);
    const { full_name, phone, email, additional_contacts, notes, custom_values } = req.body;

    if (!full_name || !phone) {
      return res.status(400).json({ error: 'ФИО и телефон обязательны' });
    }

    const existing = await db.prepare('SELECT id FROM customers WHERE id = ? AND client_id = ?').get(req.params.id, clientId);
    if (!existing) return res.status(404).json({ error: 'Клиент не найден' });

    await db.prepare(`
      UPDATE customers
      SET full_name = ?, phone = ?, email = ?, additional_contacts = ?, notes = ?, updated_at = NOW()
      WHERE id = ? AND client_id = ?
    `).run(full_name, phone, email || '', additional_contacts || '', notes || '', req.params.id, clientId);

    await saveCustomValues(req.params.id, custom_values, clientId);

    const updated = await db.prepare('SELECT * FROM customers WHERE id = ? AND client_id = ?').get(req.params.id, clientId);
    await attachCustomValues([updated], clientId);
    res.json(updated);
  } catch (err) {
    console.error('[crm] PUT /customers/:id', err);
    res.status(500).json({ error: 'Ошибка при обновлении клиента' });
  }
});

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const clientId = getClientId(req);
    const existing = await db.prepare('SELECT id FROM customers WHERE id = ? AND client_id = ?').get(req.params.id, clientId);
    if (!existing) return res.status(404).json({ error: 'Клиент не найден' });

    await db.prepare('DELETE FROM customer_custom_values WHERE customer_id = ?').run(req.params.id);
    await db.prepare('DELETE FROM customers WHERE id = ? AND client_id = ?').run(req.params.id, clientId);
    res.json({ ok: true });
  } catch (err) {
    console.error('[crm] DELETE /customers/:id', err);
    res.status(500).json({ error: 'Ошибка при удалении клиента' });
  }
});

function normalizePhone(phone) {
  return (phone || '').replace(/[^+\d]/g, '');
}

router.post('/:id/find-matches', requireAuth, async (req, res) => {
  try {
    const clientId = getClientId(req);
    const sourceCustomer = await db.prepare('SELECT * FROM customers WHERE id = ? AND client_id = ?').get(req.params.id, clientId);
    if (!sourceCustomer) return res.status(404).json({ error: 'Клиент не найден' });

    await attachCustomValues([sourceCustomer], clientId);
    const srcPhone = normalizePhone(sourceCustomer.phone);
    const srcName = (sourceCustomer.full_name || '').toLowerCase().trim();
    const srcEmail = (sourceCustomer.email || '').toLowerCase().trim();
    const srcContacts = (sourceCustomer.additional_contacts || '').toLowerCase().trim();
    const srcNotes = (sourceCustomer.notes || '').toLowerCase().trim();
    const srcCV = sourceCustomer.custom_values || {};

    const { rows: candidates } = await db.pool.query(
      'SELECT * FROM customers WHERE client_id = $1 AND id != $2 ORDER BY created_at DESC LIMIT 200',
      [clientId, req.params.id],
    );

    await attachCustomValues(candidates, clientId);

    const customFields = await db.prepare(
      'SELECT id, name, field_type FROM custom_fields WHERE client_id = ? AND is_deleted = FALSE'
    ).all(clientId);

    const matches = [];

    for (const c of candidates) {
      let score = 0;
      const reasons = [];
      const cPhone = normalizePhone(c.phone);
      const cName = (c.full_name || '').toLowerCase().trim();
      const cEmail = (c.email || '').toLowerCase().trim();
      const cContacts = (c.additional_contacts || '').toLowerCase().trim();
      const cNotes = (c.notes || '').toLowerCase().trim();
      const cCV = c.custom_values || {};

      if (srcPhone && cPhone && srcPhone === cPhone) {
        score += 50;
        reasons.push('Телефон совпадает');
      } else if (srcPhone && cPhone && srcPhone.length >= 10 && cPhone.length >= 10) {
        const srcLast = srcPhone.slice(-10);
        const cLast = cPhone.slice(-10);
        if (srcLast === cLast) {
          score += 30;
          reasons.push('Телефон частично совпадает');
        }
      }

      if (srcName && cName && srcName === cName) {
        score += 40;
        reasons.push('ФИО совпадает');
      } else if (srcName && cName) {
        const srcParts = srcName.split(/\s+/);
        const cParts = cName.split(/\s+/);
        const commonParts = srcParts.filter(p => p.length > 1 && cParts.some(cp => cp === p));
        if (commonParts.length >= 2) {
          score += 20;
          reasons.push('ФИО частично совпадает');
        } else if (commonParts.length === 1 && commonParts[0].length > 2) {
          score += 10;
          reasons.push('Часть ФИО совпадает');
        }
      }

      if (srcEmail && cEmail && srcEmail === cEmail) {
        score += 35;
        reasons.push('E-mail совпадает');
      }

      if (srcContacts && cContacts && srcContacts.length > 2 && cContacts.length > 2) {
        if (cContacts.includes(srcContacts) || srcContacts.includes(cContacts)) {
          score += 15;
          reasons.push('Доп. контакты совпадают');
        }
      }

      if (srcNotes && cNotes && srcNotes.length > 3 && cNotes.length > 3) {
        if (cNotes.includes(srcNotes) || srcNotes.includes(cNotes)) {
          score += 5;
          reasons.push('Примечания похожи');
        }
      }

      for (const cf of customFields) {
        const srcVal = (srcCV[cf.id] || '').toLowerCase().trim();
        const cVal = (cCV[cf.id] || '').toLowerCase().trim();
        if (!srcVal || !cVal) continue;

        if (srcVal === cVal) {
          const fieldScore = (cf.field_type === 'phone' || cf.field_type === 'email') ? 25 : 10;
          score += fieldScore;
          reasons.push(`${cf.name} совпадает`);
        } else if (cf.field_type === 'phone') {
          const normSrc = normalizePhone(srcVal);
          const normC = normalizePhone(cVal);
          if (normSrc && normC && normSrc.length >= 10 && normC.length >= 10 &&
              normSrc.slice(-10) === normC.slice(-10)) {
            score += 15;
            reasons.push(`${cf.name} частично совпадает`);
          }
        } else if (['text', 'email'].includes(cf.field_type) && srcVal.length > 2 && cVal.length > 2) {
          if (cVal.includes(srcVal) || srcVal.includes(cVal)) {
            score += 5;
            reasons.push(`${cf.name} похож`);
          }
        }
      }

      if (score >= 10) {
        matches.push({
          id: c.id,
          full_name: c.full_name,
          phone: c.phone,
          email: c.email,
          additional_contacts: c.additional_contacts,
          notes: c.notes,
          custom_values: cCV,
          is_self_registered: c.is_self_registered,
          created_at: c.created_at,
          score,
          reasons,
        });
      }
    }

    matches.sort((a, b) => b.score - a.score);

    res.json({ source: sourceCustomer, matches: matches.slice(0, 20) });
  } catch (err) {
    console.error('[crm] POST /customers/:id/find-matches', err);
    res.status(500).json({ error: 'Ошибка поиска совпадений' });
  }
});

router.post('/:id/link-to/:targetId', requireAuth, async (req, res) => {
  try {
    const clientId = getClientId(req);
    const sourceId = req.params.id;
    const targetId = req.params.targetId;

    const source = await db.prepare('SELECT * FROM customers WHERE id = ? AND client_id = ?').get(sourceId, clientId);
    if (!source) return res.status(404).json({ error: 'Исходный клиент не найден' });

    const target = await db.prepare('SELECT * FROM customers WHERE id = ? AND client_id = ?').get(targetId, clientId);
    if (!target) return res.status(404).json({ error: 'Целевой клиент не найден' });

    await db.pool.query(
      'UPDATE work_records SET customer_id = $1 WHERE customer_id = $2 AND client_id = $3',
      [targetId, sourceId, clientId],
    );

    await db.pool.query(
      'UPDATE orders SET customer_id = $1, updated_at = NOW() WHERE customer_id = $2 AND client_id = $3',
      [targetId, sourceId, clientId],
    );

    await db.pool.query(
      'UPDATE booking_sync_map SET crm_id = $1 WHERE crm_id = $2 AND client_id = $3 AND entity_type = $4',
      [targetId, sourceId, clientId, 'customer'],
    );

    const { merge_data } = req.body || {};
    if (merge_data) {
      const updates = [];
      const updateParams = [];
      let pIdx = 1;
      if (!target.email && source.email) {
        updates.push(`email = $${pIdx++}`);
        updateParams.push(source.email);
      }
      if (!target.additional_contacts && source.additional_contacts) {
        updates.push(`additional_contacts = $${pIdx++}`);
        updateParams.push(source.additional_contacts);
      }
      if (updates.length) {
        updates.push(`updated_at = NOW()`);
        await db.pool.query(
          `UPDATE customers SET ${updates.join(', ')} WHERE id = $${pIdx} AND client_id = $${pIdx + 1}`,
          [...updateParams, targetId, clientId],
        );
      }

      await attachCustomValues([source], clientId);
      if (source.custom_values && Object.keys(source.custom_values).length) {
        await attachCustomValues([target], clientId);
        for (const [fieldId, value] of Object.entries(source.custom_values)) {
          if (value && !target.custom_values?.[fieldId]) {
            const id = uuidv4();
            await db.pool.query(
              `INSERT INTO customer_custom_values (id, customer_id, field_id, value)
               VALUES ($1, $2, $3, $4)
               ON CONFLICT (customer_id, field_id) DO NOTHING`,
              [id, targetId, fieldId, value],
            );
          }
        }
      }
    }

    await db.prepare('DELETE FROM customer_custom_values WHERE customer_id = ?').run(sourceId);
    await db.prepare('DELETE FROM customers WHERE id = ? AND client_id = ?').run(sourceId, clientId);

    const updated = await db.prepare('SELECT * FROM customers WHERE id = ? AND client_id = ?').get(targetId, clientId);
    await attachCustomValues([updated], clientId);

    res.json({ ok: true, customer: updated });
  } catch (err) {
    console.error('[crm] POST /customers/:id/link-to/:targetId', err);
    res.status(500).json({ error: 'Ошибка привязки клиента' });
  }
});

router.post('/:id/confirm-self', requireAuth, async (req, res) => {
  try {
    const clientId = getClientId(req);
    const customerId = req.params.id;
    const customer = await db.prepare('SELECT * FROM customers WHERE id = ? AND client_id = ?').get(customerId, clientId);
    if (!customer) return res.status(404).json({ error: 'Клиент не найден' });

    await db.prepare(
      'UPDATE customers SET is_self_registered = FALSE, self_reg_source = ?, updated_at = NOW() WHERE id = ? AND client_id = ?'
    ).run('', customerId, clientId);

    const updated = await db.prepare('SELECT * FROM customers WHERE id = ? AND client_id = ?').get(customerId, clientId);
    await attachCustomValues([updated], clientId);
    res.json(updated);
  } catch (err) {
    console.error('[crm] POST /customers/:id/confirm-self', err);
    res.status(500).json({ error: 'Ошибка подтверждения' });
  }
});

const STANDARD_FIELDS = ['full_name', 'phone', 'email', 'additional_contacts', 'notes'];

router.post('/search', requireAuth, async (req, res) => {
  try {
    const clientId = getClientId(req);
    const { conditions = [], logic = 'and', page = 1, limit = 30, sort_by, sort_dir } = req.body;

    const params = [clientId];
    let idx = 2;
    const clauses = [];

    for (const cond of conditions) {
      if (!cond.field || !cond.operator) continue;
      const val = cond.value;

      if (STANDARD_FIELDS.includes(cond.field)) {
        if (cond.operator === 'contains') {
          clauses.push(`c.${cond.field} ILIKE $${idx}`);
          params.push(`%${val}%`);
          idx++;
        } else if (cond.operator === 'equals') {
          clauses.push(`c.${cond.field} = $${idx}`);
          params.push(val);
          idx++;
        } else if (cond.operator === 'starts_with') {
          clauses.push(`c.${cond.field} ILIKE $${idx}`);
          params.push(`${val}%`);
          idx++;
        } else if (cond.operator === 'not_empty') {
          clauses.push(`c.${cond.field} IS NOT NULL AND c.${cond.field} != ''`);
        } else if (cond.operator === 'is_empty') {
          clauses.push(`(c.${cond.field} IS NULL OR c.${cond.field} = '')`);
        }
      } else if (cond.field === 'created_at') {
        if (cond.operator === 'equals') {
          clauses.push(`DATE(c.created_at) = $${idx}`);
          params.push(val);
          idx++;
        } else if (cond.operator === 'gt') {
          clauses.push(`c.created_at >= $${idx}::timestamptz`);
          params.push(val);
          idx++;
        } else if (cond.operator === 'lt') {
          clauses.push(`c.created_at <= $${idx}::timestamptz`);
          params.push(val);
          idx++;
        } else if (cond.operator === 'range') {
          clauses.push(`c.created_at >= $${idx}::timestamptz AND c.created_at <= $${idx + 1}::timestamptz`);
          params.push(cond.value_from, cond.value_to);
          idx += 2;
        }
      } else if (cond.field.startsWith('cf_')) {
        const fieldId = cond.field.slice(3);

        if (cond.operator === 'not_empty') {
          clauses.push(
            `EXISTS (SELECT 1 FROM customer_custom_values ccv WHERE ccv.customer_id = c.id AND ccv.field_id = $${idx} AND ccv.value != '')`,
          );
          params.push(fieldId);
          idx++;
        } else if (cond.operator === 'is_empty') {
          clauses.push(
            `NOT EXISTS (SELECT 1 FROM customer_custom_values ccv WHERE ccv.customer_id = c.id AND ccv.field_id = $${idx} AND ccv.value != '')`,
          );
          params.push(fieldId);
          idx++;
        } else if (cond.operator === 'contains') {
          clauses.push(
            `EXISTS (SELECT 1 FROM customer_custom_values ccv WHERE ccv.customer_id = c.id AND ccv.field_id = $${idx} AND ccv.value ILIKE $${idx + 1})`,
          );
          params.push(fieldId, `%${val}%`);
          idx += 2;
        } else if (cond.operator === 'equals') {
          clauses.push(
            `EXISTS (SELECT 1 FROM customer_custom_values ccv WHERE ccv.customer_id = c.id AND ccv.field_id = $${idx} AND ccv.value = $${idx + 1})`,
          );
          params.push(fieldId, String(val));
          idx += 2;
        } else if (cond.operator === 'starts_with') {
          clauses.push(
            `EXISTS (SELECT 1 FROM customer_custom_values ccv WHERE ccv.customer_id = c.id AND ccv.field_id = $${idx} AND ccv.value ILIKE $${idx + 1})`,
          );
          params.push(fieldId, `${val}%`);
          idx += 2;
        } else if (cond.operator === 'gt') {
          clauses.push(
            `EXISTS (SELECT 1 FROM customer_custom_values ccv WHERE ccv.customer_id = c.id AND ccv.field_id = $${idx} AND ccv.value::numeric > $${idx + 1}::numeric)`,
          );
          params.push(fieldId, val);
          idx += 2;
        } else if (cond.operator === 'lt') {
          clauses.push(
            `EXISTS (SELECT 1 FROM customer_custom_values ccv WHERE ccv.customer_id = c.id AND ccv.field_id = $${idx} AND ccv.value::numeric < $${idx + 1}::numeric)`,
          );
          params.push(fieldId, val);
          idx += 2;
        }
      }
    }

    const joiner = logic === 'or' ? ' OR ' : ' AND ';
    const condSql = clauses.length ? ` AND (${clauses.join(joiner)})` : '';

    const countRes = await db.pool.query(
      `SELECT COUNT(*) as total FROM customers c WHERE c.client_id = $1${condSql}`, params,
    );
    const total = +countRes.rows[0].total;

    const allowed = ['full_name', 'phone', 'email', 'created_at', 'updated_at'];
    const orderCol = allowed.includes(sort_by) ? `c.${sort_by}` : 'c.created_at';
    const orderDir = sort_dir === 'asc' ? 'ASC' : 'DESC';
    const offset = (Math.max(1, +page) - 1) * +limit;

    const { rows } = await db.pool.query(
      `SELECT c.* FROM customers c WHERE c.client_id = $1${condSql}
       ORDER BY ${orderCol} ${orderDir}
       LIMIT $${idx} OFFSET $${idx + 1}`,
      [...params, +limit, offset],
    );

    await attachCustomValues(rows, clientId);
    res.json({ items: rows, total, page: +page, limit: +limit });
  } catch (err) {
    console.error('[crm] POST /customers/search', err);
    res.status(500).json({ error: 'Ошибка при поиске клиентов' });
  }
});

module.exports = router;

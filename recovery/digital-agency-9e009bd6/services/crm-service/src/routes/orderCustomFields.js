const { Router } = require('express');
const { v4: uuidv4 } = require('uuid');
const { requireAuth } = require('../../../../shared/middleware/auth');
const { db } = require('../db');

const router = Router();
const MAX_FIELDS_PER_ORDER = 30;
const FIELD_TYPES = ['text', 'number', 'phone', 'email', 'date', 'list', 'checkbox'];

function getClientId(req) {
  if (req.user.role === 'admin') return req.query.client_id || req.body?.client_id || '';
  return req.user.clientId || '';
}

function parseOptions(row) {
  if (!row) return row;
  if (row.options) {
    try { row.options = JSON.parse(row.options); } catch { row.options = []; }
  } else {
    row.options = [];
  }
  return row;
}

async function getOrder(orderId, clientId) {
  return db.prepare('SELECT id FROM orders WHERE id = ? AND client_id = ?').get(orderId, clientId);
}

router.get('/', requireAuth, async (req, res) => {
  try {
    const clientId = getClientId(req);
    const { order_id } = req.query;
    if (!order_id) return res.status(400).json({ error: 'order_id обязателен' });

    const order = await getOrder(order_id, clientId);
    if (!order) return res.status(404).json({ error: 'Заказ не найден' });

    const { rows } = await db.pool.query(
      `SELECT f.*, COALESCE(v.value, '') AS value
       FROM order_custom_fields f
       LEFT JOIN order_field_values v ON v.field_id = f.id AND v.order_id = f.order_id
       WHERE f.order_id = $1 AND f.client_id = $2 AND f.is_deleted = FALSE
       ORDER BY f.sort_order, f.name`,
      [order_id, clientId],
    );
    rows.forEach(parseOptions);
    res.json(rows);
  } catch (err) {
    console.error('[crm] GET /order-fields', err);
    res.status(500).json({ error: 'Ошибка при получении полей заказа' });
  }
});

router.post('/', requireAuth, async (req, res) => {
  try {
    const clientId = getClientId(req);
    const { order_id, name, field_type, is_required, sort_order, options, value } = req.body;

    if (!order_id) return res.status(400).json({ error: 'order_id обязателен' });
    if (!name || !name.trim()) return res.status(400).json({ error: 'Название поля обязательно' });
    if (!FIELD_TYPES.includes(field_type)) return res.status(400).json({ error: 'Неверный тип поля' });

    const order = await getOrder(order_id, clientId);
    if (!order) return res.status(404).json({ error: 'Заказ не найден' });

    const existing = await db.pool.query(
      'SELECT COUNT(*) as c FROM order_custom_fields WHERE order_id = $1 AND client_id = $2 AND is_deleted = FALSE',
      [order_id, clientId],
    );
    if (+existing.rows[0].c >= MAX_FIELDS_PER_ORDER) {
      return res.status(400).json({ error: `Максимум ${MAX_FIELDS_PER_ORDER} полей на заказ` });
    }

    const duplicate = await db.pool.query(
      `SELECT id FROM order_custom_fields
       WHERE order_id = $1 AND client_id = $2 AND LOWER(name) = LOWER($3) AND is_deleted = FALSE`,
      [order_id, clientId, name.trim()],
    );
    if (duplicate.rows.length) return res.status(400).json({ error: 'Поле с таким названием уже существует' });

    const id = uuidv4();
    await db.prepare(`
      INSERT INTO order_custom_fields (id, client_id, order_id, name, field_type, is_required, sort_order, options)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, clientId, order_id, name.trim(), field_type, !!is_required, sort_order || 0, JSON.stringify(options || []));

    if (value != null) {
      await db.prepare(`
        INSERT INTO order_field_values (id, order_id, field_id, value)
        VALUES (?, ?, ?, ?)
        ON CONFLICT (order_id, field_id) DO UPDATE SET value = EXCLUDED.value
      `).run(uuidv4(), order_id, id, String(value ?? ''));
    }

    const created = await db.prepare('SELECT * FROM order_custom_fields WHERE id = ?').get(id);
    parseOptions(created);
    created.value = value == null ? '' : String(value);
    res.status(201).json(created);
  } catch (err) {
    console.error('[crm] POST /order-fields', err);
    res.status(500).json({ error: 'Ошибка при создании поля заказа' });
  }
});

router.put('/:id', requireAuth, async (req, res) => {
  try {
    const clientId = getClientId(req);
    const { name, field_type, is_required, sort_order, options } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ error: 'Название поля обязательно' });

    const field = await db.prepare('SELECT * FROM order_custom_fields WHERE id = ? AND client_id = ?').get(req.params.id, clientId);
    if (!field) return res.status(404).json({ error: 'Поле не найдено' });

    const duplicate = await db.pool.query(
      `SELECT id FROM order_custom_fields
       WHERE order_id = $1 AND client_id = $2 AND LOWER(name) = LOWER($3) AND is_deleted = FALSE AND id != $4`,
      [field.order_id, clientId, name.trim(), req.params.id],
    );
    if (duplicate.rows.length) return res.status(400).json({ error: 'Поле с таким названием уже существует' });

    await db.prepare(`
      UPDATE order_custom_fields SET name = ?, field_type = ?, is_required = ?, sort_order = ?, options = ?
      WHERE id = ? AND client_id = ?
    `).run(
      name.trim(),
      field_type || field.field_type,
      !!is_required,
      sort_order ?? field.sort_order,
      JSON.stringify(options || []),
      req.params.id,
      clientId,
    );

    const updated = await db.prepare('SELECT * FROM order_custom_fields WHERE id = ?').get(req.params.id);
    parseOptions(updated);
    res.json(updated);
  } catch (err) {
    console.error('[crm] PUT /order-fields/:id', err);
    res.status(500).json({ error: 'Ошибка при обновлении поля заказа' });
  }
});

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const clientId = getClientId(req);
    await db.prepare('UPDATE order_custom_fields SET is_deleted = TRUE WHERE id = ? AND client_id = ?').run(req.params.id, clientId);
    res.json({ ok: true });
  } catch (err) {
    console.error('[crm] DELETE /order-fields/:id', err);
    res.status(500).json({ error: 'Ошибка при удалении поля заказа' });
  }
});

router.post('/values', requireAuth, async (req, res) => {
  try {
    const clientId = getClientId(req);
    const { order_id, values } = req.body;
    if (!order_id) return res.status(400).json({ error: 'order_id обязателен' });
    if (!Array.isArray(values)) return res.status(400).json({ error: 'values должен быть массивом' });

    const order = await getOrder(order_id, clientId);
    if (!order) return res.status(404).json({ error: 'Заказ не найден' });

    for (const item of values) {
      if (!item.field_id) continue;
      const field = await db.prepare(
        'SELECT id FROM order_custom_fields WHERE id = ? AND order_id = ? AND client_id = ? AND is_deleted = FALSE',
      ).get(item.field_id, order_id, clientId);
      if (!field) continue;

      await db.prepare(`
        INSERT INTO order_field_values (id, order_id, field_id, value)
        VALUES (?, ?, ?, ?)
        ON CONFLICT (order_id, field_id) DO UPDATE SET value = EXCLUDED.value
      `).run(uuidv4(), order_id, item.field_id, String(item.value ?? ''));
    }

    res.json({ ok: true });
  } catch (err) {
    console.error('[crm] POST /order-fields/values', err);
    res.status(500).json({ error: 'Ошибка при сохранении значений полей заказа' });
  }
});

module.exports = router;

const { Router } = require('express');
const { v4: uuidv4 } = require('uuid');
const { requireAuth } = require('../../../../shared/middleware/auth');
const { db } = require('../db');

const router = Router();
const MAX_FIELDS_PER_ITEM = 30;
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

router.get('/', requireAuth, async (req, res) => {
  try {
    const clientId = getClientId(req);
    const { sales_item_id } = req.query;
    if (!sales_item_id) return res.status(400).json({ error: 'sales_item_id обязателен' });

    const item = await db.prepare('SELECT id FROM sales_items WHERE id = ? AND client_id = ?').get(sales_item_id, clientId);
    if (!item) return res.status(404).json({ error: 'Позиция номенклатуры не найдена' });

    const { rows } = await db.pool.query(
      `SELECT * FROM sales_item_custom_fields
       WHERE sales_item_id = $1 AND client_id = $2 AND is_deleted = FALSE
       ORDER BY sort_order, name`,
      [sales_item_id, clientId],
    );
    rows.forEach(parseOptions);
    res.json(rows);
  } catch (err) {
    console.error('[crm] GET /sales-item-fields', err);
    res.status(500).json({ error: 'Ошибка при получении полей номенклатуры' });
  }
});

router.post('/', requireAuth, async (req, res) => {
  try {
    const clientId = getClientId(req);
    const { sales_item_id, name, field_type, is_required, sort_order, options } = req.body;

    if (!sales_item_id) return res.status(400).json({ error: 'sales_item_id обязателен' });
    if (!name || !name.trim()) return res.status(400).json({ error: 'Название поля обязательно' });
    if (!FIELD_TYPES.includes(field_type)) return res.status(400).json({ error: 'Неверный тип поля' });

    const item = await db.prepare('SELECT id FROM sales_items WHERE id = ? AND client_id = ?').get(sales_item_id, clientId);
    if (!item) return res.status(404).json({ error: 'Позиция номенклатуры не найдена' });

    const existing = await db.pool.query(
      'SELECT COUNT(*) as c FROM sales_item_custom_fields WHERE sales_item_id = $1 AND client_id = $2 AND is_deleted = FALSE',
      [sales_item_id, clientId],
    );
    if (+existing.rows[0].c >= MAX_FIELDS_PER_ITEM) {
      return res.status(400).json({ error: `Максимум ${MAX_FIELDS_PER_ITEM} полей на позицию` });
    }

    const duplicate = await db.pool.query(
      `SELECT id FROM sales_item_custom_fields
       WHERE sales_item_id = $1 AND client_id = $2 AND LOWER(name) = LOWER($3) AND is_deleted = FALSE`,
      [sales_item_id, clientId, name.trim()],
    );
    if (duplicate.rows.length) return res.status(400).json({ error: 'Поле с таким названием уже существует' });

    const id = uuidv4();
    await db.prepare(`
      INSERT INTO sales_item_custom_fields (id, client_id, sales_item_id, name, field_type, is_required, sort_order, options)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, clientId, sales_item_id, name.trim(), field_type, !!is_required, sort_order || 0, JSON.stringify(options || []));

    const created = await db.prepare('SELECT * FROM sales_item_custom_fields WHERE id = ?').get(id);
    parseOptions(created);
    res.status(201).json(created);
  } catch (err) {
    console.error('[crm] POST /sales-item-fields', err);
    res.status(500).json({ error: 'Ошибка при создании поля номенклатуры' });
  }
});

router.put('/:id', requireAuth, async (req, res) => {
  try {
    const clientId = getClientId(req);
    const { name, field_type, is_required, sort_order, options } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ error: 'Название поля обязательно' });

    const field = await db.prepare('SELECT * FROM sales_item_custom_fields WHERE id = ? AND client_id = ?').get(req.params.id, clientId);
    if (!field) return res.status(404).json({ error: 'Поле не найдено' });

    const duplicate = await db.pool.query(
      `SELECT id FROM sales_item_custom_fields
       WHERE sales_item_id = $1 AND client_id = $2 AND LOWER(name) = LOWER($3) AND is_deleted = FALSE AND id != $4`,
      [field.sales_item_id, clientId, name.trim(), req.params.id],
    );
    if (duplicate.rows.length) return res.status(400).json({ error: 'Поле с таким названием уже существует' });

    await db.prepare(`
      UPDATE sales_item_custom_fields SET name = ?, field_type = ?, is_required = ?, sort_order = ?, options = ?
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

    const updated = await db.prepare('SELECT * FROM sales_item_custom_fields WHERE id = ?').get(req.params.id);
    parseOptions(updated);
    res.json(updated);
  } catch (err) {
    console.error('[crm] PUT /sales-item-fields/:id', err);
    res.status(500).json({ error: 'Ошибка при обновлении поля номенклатуры' });
  }
});

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const clientId = getClientId(req);
    await db.prepare('UPDATE sales_item_custom_fields SET is_deleted = TRUE WHERE id = ? AND client_id = ?').run(req.params.id, clientId);
    res.json({ ok: true });
  } catch (err) {
    console.error('[crm] DELETE /sales-item-fields/:id', err);
    res.status(500).json({ error: 'Ошибка при удалении поля номенклатуры' });
  }
});

module.exports = router;

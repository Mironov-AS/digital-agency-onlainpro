const { Router } = require('express');
const { v4: uuidv4 } = require('uuid');
const { requireAuth } = require('../../../../shared/middleware/auth');
const { db } = require('../db');

const router = Router();
const MAX_CUSTOM_FIELDS = 50;

const FIELD_TYPES = ['text', 'number', 'phone', 'email', 'date', 'list', 'checkbox'];

function getClientId(req) {
  if (req.user.role === 'admin') return req.query.client_id || req.body?.client_id || '';
  return req.user.clientId || '';
}

router.get('/', requireAuth, async (req, res) => {
  try {
    const clientId = getClientId(req);
    const includeDeleted = req.query.include_deleted === 'true';
    const where = includeDeleted
      ? 'WHERE client_id = $1'
      : 'WHERE client_id = $1 AND is_deleted = FALSE';
    const { rows } = await db.pool.query(
      `SELECT * FROM custom_fields ${where} ORDER BY sort_order, name`, [clientId],
    );
    rows.forEach(r => {
      if (r.options) try { r.options = JSON.parse(r.options); } catch { r.options = []; }
    });
    res.json(rows);
  } catch (err) {
    console.error('[crm] GET /custom-fields', err);
    res.status(500).json({ error: 'Ошибка при получении полей' });
  }
});

router.post('/', requireAuth, async (req, res) => {
  try {
    const clientId = getClientId(req);
    const { name, field_type, is_required, is_visible, sort_order, options } = req.body;

    if (!name || !name.trim()) return res.status(400).json({ error: 'Название поля обязательно' });
    if (!FIELD_TYPES.includes(field_type)) return res.status(400).json({ error: 'Неверный тип поля' });

    const existing = await db.pool.query(
      'SELECT COUNT(*) as c FROM custom_fields WHERE client_id = $1 AND is_deleted = FALSE', [clientId],
    );
    if (+existing.rows[0].c >= MAX_CUSTOM_FIELDS) {
      return res.status(400).json({ error: `Максимум ${MAX_CUSTOM_FIELDS} пользовательских полей` });
    }

    const duplicate = await db.pool.query(
      'SELECT id FROM custom_fields WHERE client_id = $1 AND LOWER(name) = LOWER($2) AND is_deleted = FALSE',
      [clientId, name.trim()],
    );
    if (duplicate.rows.length) return res.status(400).json({ error: 'Поле с таким названием уже существует' });

    const id = uuidv4();
    await db.prepare(`
      INSERT INTO custom_fields (id, client_id, name, field_type, is_required, is_visible, sort_order, options)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, clientId, name.trim(), field_type, !!is_required, is_visible !== false,
      sort_order || 0, JSON.stringify(options || []));

    const created = await db.prepare('SELECT * FROM custom_fields WHERE id = ?').get(id);
    if (created.options) try { created.options = JSON.parse(created.options); } catch { created.options = []; }
    res.status(201).json(created);
  } catch (err) {
    console.error('[crm] POST /custom-fields', err);
    res.status(500).json({ error: 'Ошибка при создании поля' });
  }
});

router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { name, field_type, is_required, is_visible, sort_order, options } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ error: 'Название поля обязательно' });

    const field = await db.prepare('SELECT * FROM custom_fields WHERE id = ?').get(req.params.id);
    if (!field) return res.status(404).json({ error: 'Поле не найдено' });

    const clientId = getClientId(req);
    const duplicate = await db.pool.query(
      'SELECT id FROM custom_fields WHERE client_id = $1 AND LOWER(name) = LOWER($2) AND is_deleted = FALSE AND id != $3',
      [clientId, name.trim(), req.params.id],
    );
    if (duplicate.rows.length) return res.status(400).json({ error: 'Поле с таким названием уже существует' });

    await db.prepare(`
      UPDATE custom_fields SET name = ?, field_type = ?, is_required = ?, is_visible = ?,
        sort_order = ?, options = ?
      WHERE id = ?
    `).run(name.trim(), field_type || field.field_type, !!is_required, is_visible !== false,
      sort_order ?? field.sort_order, JSON.stringify(options || []), req.params.id);

    const updated = await db.prepare('SELECT * FROM custom_fields WHERE id = ?').get(req.params.id);
    if (updated.options) try { updated.options = JSON.parse(updated.options); } catch { updated.options = []; }
    res.json(updated);
  } catch (err) {
    console.error('[crm] PUT /custom-fields/:id', err);
    res.status(500).json({ error: 'Ошибка при обновлении поля' });
  }
});

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    await db.prepare('UPDATE custom_fields SET is_deleted = TRUE WHERE id = ?').run(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    console.error('[crm] DELETE /custom-fields/:id', err);
    res.status(500).json({ error: 'Ошибка при удалении поля' });
  }
});

router.post('/:id/restore', requireAuth, async (req, res) => {
  try {
    await db.prepare('UPDATE custom_fields SET is_deleted = FALSE WHERE id = ?').run(req.params.id);
    const restored = await db.prepare('SELECT * FROM custom_fields WHERE id = ?').get(req.params.id);
    if (restored?.options) try { restored.options = JSON.parse(restored.options); } catch { restored.options = []; }
    res.json(restored);
  } catch (err) {
    console.error('[crm] POST /custom-fields/:id/restore', err);
    res.status(500).json({ error: 'Ошибка при восстановлении поля' });
  }
});

module.exports = router;

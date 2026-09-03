const { Router } = require('express');
const { v4: uuidv4 } = require('uuid');
const { requireAuth } = require('../../../../shared/middleware/auth');
const { db } = require('../db');

const router = Router();
const MAX_FIELDS_PER_SERVICE = 30;
const FIELD_TYPES = ['text', 'number', 'phone', 'email', 'date', 'list', 'checkbox'];

function getClientId(req) {
  if (req.user.role === 'admin') return req.query.client_id || req.body?.client_id || '';
  return req.user.clientId || '';
}

router.get('/', requireAuth, async (req, res) => {
  try {
    const { service_id } = req.query;
    if (!service_id) return res.status(400).json({ error: 'service_id обязателен' });

    const { rows } = await db.pool.query(
      `SELECT * FROM service_custom_fields
       WHERE service_id = $1 AND is_deleted = FALSE
       ORDER BY sort_order, name`,
      [service_id],
    );
    rows.forEach(r => {
      if (r.options) try { r.options = JSON.parse(r.options); } catch { r.options = []; }
    });
    res.json(rows);
  } catch (err) {
    console.error('[crm] GET /service-fields', err);
    res.status(500).json({ error: 'Ошибка при получении полей услуги' });
  }
});

router.post('/', requireAuth, async (req, res) => {
  try {
    const clientId = getClientId(req);
    const { service_id, name, field_type, is_required, sort_order, options } = req.body;

    if (!service_id) return res.status(400).json({ error: 'service_id обязателен' });
    if (!name || !name.trim()) return res.status(400).json({ error: 'Название поля обязательно' });
    if (!FIELD_TYPES.includes(field_type)) return res.status(400).json({ error: 'Неверный тип поля' });

    const existing = await db.pool.query(
      'SELECT COUNT(*) as c FROM service_custom_fields WHERE service_id = $1 AND is_deleted = FALSE',
      [service_id],
    );
    if (+existing.rows[0].c >= MAX_FIELDS_PER_SERVICE) {
      return res.status(400).json({ error: `Максимум ${MAX_FIELDS_PER_SERVICE} полей на услугу` });
    }

    const duplicate = await db.pool.query(
      `SELECT id FROM service_custom_fields
       WHERE service_id = $1 AND LOWER(name) = LOWER($2) AND is_deleted = FALSE`,
      [service_id, name.trim()],
    );
    if (duplicate.rows.length) return res.status(400).json({ error: 'Поле с таким названием уже существует' });

    const id = uuidv4();
    await db.prepare(`
      INSERT INTO service_custom_fields (id, client_id, service_id, name, field_type, is_required, sort_order, options)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, clientId, service_id, name.trim(), field_type, !!is_required, sort_order || 0, JSON.stringify(options || []));

    const created = await db.prepare('SELECT * FROM service_custom_fields WHERE id = ?').get(id);
    if (created.options) try { created.options = JSON.parse(created.options); } catch { created.options = []; }
    res.status(201).json(created);
  } catch (err) {
    console.error('[crm] POST /service-fields', err);
    res.status(500).json({ error: 'Ошибка при создании поля' });
  }
});

router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { name, field_type, is_required, sort_order, options } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ error: 'Название поля обязательно' });

    const field = await db.prepare('SELECT * FROM service_custom_fields WHERE id = ?').get(req.params.id);
    if (!field) return res.status(404).json({ error: 'Поле не найдено' });

    const duplicate = await db.pool.query(
      `SELECT id FROM service_custom_fields
       WHERE service_id = $1 AND LOWER(name) = LOWER($2) AND is_deleted = FALSE AND id != $3`,
      [field.service_id, name.trim(), req.params.id],
    );
    if (duplicate.rows.length) return res.status(400).json({ error: 'Поле с таким названием уже существует' });

    await db.prepare(`
      UPDATE service_custom_fields SET name = ?, field_type = ?, is_required = ?, sort_order = ?, options = ?
      WHERE id = ?
    `).run(name.trim(), field_type || field.field_type, !!is_required, sort_order ?? field.sort_order,
      JSON.stringify(options || []), req.params.id);

    const updated = await db.prepare('SELECT * FROM service_custom_fields WHERE id = ?').get(req.params.id);
    if (updated.options) try { updated.options = JSON.parse(updated.options); } catch { updated.options = []; }
    res.json(updated);
  } catch (err) {
    console.error('[crm] PUT /service-fields/:id', err);
    res.status(500).json({ error: 'Ошибка при обновлении поля' });
  }
});

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    await db.prepare('UPDATE service_custom_fields SET is_deleted = TRUE WHERE id = ?').run(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    console.error('[crm] DELETE /service-fields/:id', err);
    res.status(500).json({ error: 'Ошибка при удалении поля' });
  }
});

router.get('/values', requireAuth, async (req, res) => {
  try {
    const { work_record_id } = req.query;
    if (!work_record_id) return res.status(400).json({ error: 'work_record_id обязателен' });

    const { rows } = await db.pool.query(
      `SELECT wv.*, sf.name as field_name, sf.field_type
       FROM work_record_field_values wv
       JOIN service_custom_fields sf ON sf.id = wv.field_id
       WHERE wv.work_record_id = $1`,
      [work_record_id],
    );
    res.json(rows);
  } catch (err) {
    console.error('[crm] GET /service-fields/values', err);
    res.status(500).json({ error: 'Ошибка при получении значений полей' });
  }
});

router.post('/values', requireAuth, async (req, res) => {
  try {
    const { work_record_id, values } = req.body;
    if (!work_record_id) return res.status(400).json({ error: 'work_record_id обязателен' });
    if (!Array.isArray(values)) return res.status(400).json({ error: 'values должен быть массивом' });

    for (const v of values) {
      if (!v.field_id) continue;
      const id = uuidv4();
      await db.prepare(`
        INSERT INTO work_record_field_values (id, work_record_id, field_id, value)
        VALUES (?, ?, ?, ?)
        ON CONFLICT (work_record_id, field_id) DO UPDATE SET value = EXCLUDED.value
      `).run(id, work_record_id, v.field_id, v.value ?? '');
    }
    res.json({ ok: true });
  } catch (err) {
    console.error('[crm] POST /service-fields/values', err);
    res.status(500).json({ error: 'Ошибка при сохранении значений полей' });
  }
});

module.exports = router;

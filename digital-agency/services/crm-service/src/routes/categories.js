const { Router } = require('express');
const { v4: uuidv4 } = require('uuid');
const { requireAuth } = require('../../../../shared/middleware/auth');
const { db } = require('../db');

const router = Router();

function getClientId(req) {
  if (req.user.role === 'admin') return req.query.client_id || '';
  return req.user.clientId || '';
}

router.get('/', requireAuth, async (req, res) => {
  try {
    const clientId = getClientId(req);
    const rows = await db.prepare(
      'SELECT * FROM service_categories WHERE client_id = ? AND is_active = TRUE ORDER BY sort_order, name',
    ).all(clientId);
    res.json(rows);
  } catch (err) {
    console.error('[crm] GET /categories', err);
    res.status(500).json({ error: 'Ошибка при получении категорий' });
  }
});

router.post('/', requireAuth, async (req, res) => {
  try {
    const clientId = req.user.role === 'admin'
      ? (req.body.client_id || '') : (req.user.clientId || '');
    const { name, parent_id, sort_order } = req.body;

    if (!name) return res.status(400).json({ error: 'Название обязательно' });

    const id = uuidv4();
    await db.prepare(
      'INSERT INTO service_categories (id, client_id, name, parent_id, sort_order) VALUES (?, ?, ?, ?, ?)',
    ).run(id, clientId, name, parent_id || null, sort_order || 0);

    const created = await db.prepare('SELECT * FROM service_categories WHERE id = ?').get(id);
    res.status(201).json(created);
  } catch (err) {
    console.error('[crm] POST /categories', err);
    res.status(500).json({ error: 'Ошибка при создании категории' });
  }
});

router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { name, parent_id, sort_order } = req.body;
    if (!name) return res.status(400).json({ error: 'Название обязательно' });

    await db.prepare(
      'UPDATE service_categories SET name = ?, parent_id = ?, sort_order = ? WHERE id = ?',
    ).run(name, parent_id || null, sort_order || 0, req.params.id);

    const updated = await db.prepare('SELECT * FROM service_categories WHERE id = ?').get(req.params.id);
    if (!updated) return res.status(404).json({ error: 'Категория не найдена' });
    res.json(updated);
  } catch (err) {
    console.error('[crm] PUT /categories/:id', err);
    res.status(500).json({ error: 'Ошибка при обновлении категории' });
  }
});

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    await db.prepare(
      'UPDATE service_categories SET is_active = FALSE WHERE id = ?',
    ).run(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    console.error('[crm] DELETE /categories/:id', err);
    res.status(500).json({ error: 'Ошибка при архивировании категории' });
  }
});

module.exports = router;

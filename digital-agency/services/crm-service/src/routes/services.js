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
    const { category_id, status, search } = req.query;

    let where = 'WHERE s.client_id = $1';
    const params = [clientId];
    let idx = 2;

    if (category_id) {
      where += ` AND s.category_id = $${idx}`;
      params.push(category_id);
      idx++;
    }
    if (status) {
      where += ` AND s.status = $${idx}`;
      params.push(status);
      idx++;
    }
    if (search) {
      where += ` AND (s.name ILIKE $${idx} OR s.description ILIKE $${idx})`;
      params.push(`%${search}%`);
      idx++;
    }

    const { rows } = await db.pool.query(`
      SELECT s.*, sc.name as category_name
      FROM services s
      LEFT JOIN service_categories sc ON sc.id = s.category_id
      ${where}
      ORDER BY s.sort_order, s.name
    `, params);

    res.json(rows);
  } catch (err) {
    console.error('[crm] GET /services', err);
    res.status(500).json({ error: 'Ошибка при получении услуг' });
  }
});

router.get('/:id', requireAuth, async (req, res) => {
  try {
    const row = await db.prepare(`
      SELECT s.*, sc.name as category_name
      FROM services s
      LEFT JOIN service_categories sc ON sc.id = s.category_id
      WHERE s.id = ?
    `).get(req.params.id);
    if (!row) return res.status(404).json({ error: 'Услуга не найдена' });
    res.json(row);
  } catch (err) {
    console.error('[crm] GET /services/:id', err);
    res.status(500).json({ error: 'Ошибка при получении услуги' });
  }
});

router.post('/', requireAuth, async (req, res) => {
  try {
    const clientId = req.user.role === 'admin'
      ? (req.body.client_id || '') : (req.user.clientId || '');
    const { name, description, category_id, duration, price, sort_order } = req.body;

    if (!name) return res.status(400).json({ error: 'Название обязательно' });

    const id = uuidv4();
    await db.prepare(`
      INSERT INTO services (id, client_id, category_id, name, description, duration, price, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, clientId, category_id || null, name, description || '', duration || 60, price || 0, sort_order || 0);

    const created = await db.prepare('SELECT * FROM services WHERE id = ?').get(id);
    res.status(201).json(created);
  } catch (err) {
    console.error('[crm] POST /services', err);
    res.status(500).json({ error: 'Ошибка при создании услуги' });
  }
});

router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { name, description, category_id, duration, price, status, sort_order } = req.body;
    if (!name) return res.status(400).json({ error: 'Название обязательно' });

    await db.prepare(`
      UPDATE services
      SET name = ?, description = ?, category_id = ?, duration = ?, price = ?,
          status = ?, sort_order = ?, updated_at = NOW()
      WHERE id = ?
    `).run(name, description || '', category_id || null, duration || 60, price || 0,
      status || 'active', sort_order || 0, req.params.id);

    const updated = await db.prepare('SELECT * FROM services WHERE id = ?').get(req.params.id);
    if (!updated) return res.status(404).json({ error: 'Услуга не найдена' });
    res.json(updated);
  } catch (err) {
    console.error('[crm] PUT /services/:id', err);
    res.status(500).json({ error: 'Ошибка при обновлении услуги' });
  }
});

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    await db.prepare("UPDATE services SET status = 'archived', updated_at = NOW() WHERE id = ?").run(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    console.error('[crm] DELETE /services/:id', err);
    res.status(500).json({ error: 'Ошибка при архивировании услуги' });
  }
});

module.exports = router;

const router = require('express').Router();
const { v4: uuidv4 } = require('uuid');
const { db } = require('../db');
const { requireAdmin } = require('../middleware/auth');

// GET /api/catalog/services — публичный, используется лендингом
router.get('/', async (req, res, next) => {
  try {
    const { category, active_only = '1' } = req.query;
    let sql = 'SELECT * FROM services';
    const params = [];
    const where = [];
    let idx = 0;
    if (active_only !== '0') where.push('is_active = TRUE');
    if (category) { idx++; where.push(`category = $${idx}`); params.push(category); }
    if (where.length) sql += ' WHERE ' + where.join(' AND ');
    sql += ' ORDER BY sort_order ASC, created_at ASC';
    const { rows } = await db.pool.query(sql, params);
    res.json(rows);
  } catch (err) { next(err); }
});

// GET /api/catalog/services/:id — публичный
router.get('/:id', async (req, res, next) => {
  try {
    const service = await db.prepare('SELECT * FROM services WHERE id = ?').get(req.params.id);
    if (!service) return res.status(404).json({ error: 'Not found' });
    res.json(service);
  } catch (err) { next(err); }
});

// POST /api/catalog/services — только admin
router.post('/', requireAdmin, async (req, res, next) => {
  try {
    const { title, description = '', price, price_type = 'from', price_label, photo_url, category = 'websites', sort_order = 0 } = req.body;
    if (!title) return res.status(400).json({ error: 'title required' });
    const id = uuidv4();
    await db.prepare(
      'INSERT INTO services (id, title, description, price, price_type, price_label, photo_url, category, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    ).run(id, title, description, price ?? null, price_type, price_label ?? null, photo_url ?? null, category, sort_order);
    const created = await db.prepare('SELECT * FROM services WHERE id = ?').get(id);
    res.status(201).json(created);
  } catch (err) { next(err); }
});

// PUT /api/catalog/services/:id — только admin
router.put('/:id', requireAdmin, async (req, res, next) => {
  try {
    const service = await db.prepare('SELECT * FROM services WHERE id = ?').get(req.params.id);
    if (!service) return res.status(404).json({ error: 'Not found' });

    const fields = ['title', 'description', 'price', 'price_type', 'price_label', 'photo_url', 'category', 'is_active', 'sort_order'];
    const updates = {};
    for (const f of fields) {
      if (req.body[f] !== undefined) updates[f] = req.body[f];
    }
    if (updates.is_active !== undefined) updates.is_active = !!updates.is_active;
    updates.updated_at = new Date().toISOString();

    const keys = Object.keys(updates);
    const values = Object.values(updates);
    const sets = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
    await db.pool.query(`UPDATE services SET ${sets} WHERE id = $${keys.length + 1}`, [...values, req.params.id]);
    const updated = await db.prepare('SELECT * FROM services WHERE id = ?').get(req.params.id);
    res.json(updated);
  } catch (err) { next(err); }
});

// DELETE /api/catalog/services/:id — только admin
router.delete('/:id', requireAdmin, async (req, res, next) => {
  try {
    const result = await db.prepare('DELETE FROM services WHERE id = ?').run(req.params.id);
    if (result.changes === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ ok: true });
  } catch (err) { next(err); }
});

// PATCH /api/catalog/services/reorder — обновить sort_order
router.patch('/reorder', requireAdmin, async (req, res, next) => {
  try {
    const { order } = req.body;
    if (!Array.isArray(order)) return res.status(400).json({ error: 'order array required' });
    await db.runTransaction(async (txDb) => {
      for (const item of order) {
        await txDb.prepare('UPDATE services SET sort_order = ? WHERE id = ?').run(item.sort_order, item.id);
      }
    });
    res.json({ ok: true });
  } catch (err) { next(err); }
});

module.exports = router;

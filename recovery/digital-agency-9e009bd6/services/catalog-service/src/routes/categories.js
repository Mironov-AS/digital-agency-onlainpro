const router = require('express').Router();
const { v4: uuidv4 } = require('uuid');
const { db } = require('../db');
const { requireAdmin } = require('../middleware/auth');

// GET /api/catalog/categories — публичный
router.get('/', async (req, res, next) => {
  try {
    const rows = await db.prepare('SELECT * FROM categories ORDER BY sort_order ASC, created_at ASC').all();
    res.json(rows);
  } catch (err) { next(err); }
});

// POST /api/catalog/categories — admin only
router.post('/', requireAdmin, async (req, res, next) => {
  try {
    const { value, label, color = '#3b82f6', sort_order = 0 } = req.body;
    if (!value?.trim()) return res.status(400).json({ error: 'value обязателен' });
    if (!label?.trim()) return res.status(400).json({ error: 'label обязателен' });
    const slug = value.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-_а-яё]/gi, '');
    if (!slug) return res.status(400).json({ error: 'Некорректный slug' });
    const exists = await db.prepare('SELECT id FROM categories WHERE value = ?').get(slug);
    if (exists) return res.status(409).json({ error: 'Вид услуги с таким кодом уже существует' });
    const id = uuidv4();
    await db.prepare('INSERT INTO categories (id, value, label, color, sort_order) VALUES (?, ?, ?, ?, ?)').run(id, slug, label.trim(), color, Number(sort_order) || 0);
    const created = await db.prepare('SELECT * FROM categories WHERE id = ?').get(id);
    res.status(201).json(created);
  } catch (err) { next(err); }
});

// PUT /api/catalog/categories/:id — admin only
router.put('/:id', requireAdmin, async (req, res, next) => {
  try {
    const cat = await db.prepare('SELECT * FROM categories WHERE id = ?').get(req.params.id);
    if (!cat) return res.status(404).json({ error: 'Not found' });
    const { label, color, sort_order } = req.body;
    const updates = {};
    if (label !== undefined) updates.label = label.trim();
    if (color !== undefined) updates.color = color;
    if (sort_order !== undefined) updates.sort_order = Number(sort_order) || 0;
    if (Object.keys(updates).length === 0) return res.json(cat);
    const keys = Object.keys(updates);
    const values = Object.values(updates);
    const sets = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
    await db.pool.query(`UPDATE categories SET ${sets} WHERE id = $${keys.length + 1}`, [...values, req.params.id]);
    const updated = await db.prepare('SELECT * FROM categories WHERE id = ?').get(req.params.id);
    res.json(updated);
  } catch (err) { next(err); }
});

// DELETE /api/catalog/categories/:id — admin only
router.delete('/:id', requireAdmin, async (req, res, next) => {
  try {
    const cat = await db.prepare('SELECT * FROM categories WHERE id = ?').get(req.params.id);
    if (!cat) return res.status(404).json({ error: 'Not found' });
    const inUseRow = await db.prepare('SELECT COUNT(*) as n FROM services WHERE category = ?').get(cat.value);
    if (parseInt(inUseRow.n) > 0) return res.status(409).json({ error: `Нельзя удалить: ${inUseRow.n} услуг используют этот вид` });
    await db.prepare('DELETE FROM categories WHERE id = ?').run(req.params.id);
    res.json({ ok: true });
  } catch (err) { next(err); }
});

module.exports = router;

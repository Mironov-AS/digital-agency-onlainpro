const router = require('express').Router();
const { v4: uuidv4 } = require('uuid');
const { db } = require('../db');
const { requireAdmin } = require('../middleware/auth');

// GET /api/products — list all active products
router.get('/', async (req, res, next) => {
  try {
    const products = await db.prepare('SELECT * FROM products WHERE is_active = TRUE ORDER BY name ASC').all();
    res.json(products.map(p => ({ ...p, config: JSON.parse(p.config || '{}') })));
  } catch (err) { next(err); }
});

// GET /api/products/landing
router.get('/landing', async (req, res, next) => {
  try {
    const products = await db.prepare('SELECT * FROM products WHERE is_active = TRUE AND show_on_landing = TRUE ORDER BY name ASC').all();
    res.json(products.map(p => ({ ...p, config: JSON.parse(p.config || '{}') })));
  } catch (err) { next(err); }
});

// GET /api/products/:code
router.get('/:code', async (req, res, next) => {
  try {
    const product = await db.prepare('SELECT * FROM products WHERE code = ?').get(req.params.code);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json({ ...product, config: JSON.parse(product.config || '{}') });
  } catch (err) { next(err); }
});

// POST /api/products
router.post('/', requireAdmin, async (req, res, next) => {
  try {
    const { code, name, description = '', icon = '', config = {}, show_on_landing = false, landing_description = '', price_monthly = 0, price_yearly = 0, billing_period = 'monthly' } = req.body;
    if (!code || !name) return res.status(400).json({ error: 'code and name required' });
    const exists = await db.prepare('SELECT id FROM products WHERE code = ?').get(code);
    if (exists) return res.status(409).json({ error: 'Product with this code already exists' });
    const id = uuidv4();
    await db.prepare(
      'INSERT INTO products (id, code, name, description, icon, config, show_on_landing, landing_description, price_monthly, price_yearly, billing_period) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    ).run(id, code, name, description, icon, JSON.stringify(config), !!show_on_landing, landing_description, price_monthly, price_yearly, billing_period);
    const product = await db.prepare('SELECT * FROM products WHERE id = ?').get(id);
    res.status(201).json({ ...product, config: JSON.parse(product.config || '{}') });
  } catch (err) { next(err); }
});

// PUT /api/products/:code
router.put('/:code', requireAdmin, async (req, res, next) => {
  try {
    const product = await db.prepare('SELECT * FROM products WHERE code = ?').get(req.params.code);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    const { name, description, icon, config, is_active, show_on_landing, landing_description, price_monthly, price_yearly, billing_period } = req.body;
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (icon !== undefined) updates.icon = icon;
    if (config !== undefined) updates.config = JSON.stringify(config);
    if (is_active !== undefined) updates.is_active = !!is_active;
    if (show_on_landing !== undefined) updates.show_on_landing = !!show_on_landing;
    if (landing_description !== undefined) updates.landing_description = landing_description;
    if (price_monthly !== undefined) updates.price_monthly = price_monthly;
    if (price_yearly !== undefined) updates.price_yearly = price_yearly;
    if (billing_period !== undefined) updates.billing_period = billing_period;
    if (Object.keys(updates).length === 0) return res.status(400).json({ error: 'Nothing to update' });
    const keys = Object.keys(updates);
    const values = Object.values(updates);
    const sets = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
    await db.pool.query(`UPDATE products SET ${sets} WHERE code = $${keys.length + 1}`, [...values, req.params.code]);
    const updated = await db.prepare('SELECT * FROM products WHERE code = ?').get(req.params.code);
    res.json({ ...updated, config: JSON.parse(updated.config || '{}') });
  } catch (err) { next(err); }
});

// DELETE /api/products/:code
router.delete('/:code', requireAdmin, async (req, res, next) => {
  try {
    const r = await db.prepare('DELETE FROM products WHERE code = ?').run(req.params.code);
    if (r.changes === 0) return res.status(404).json({ error: 'Product not found' });
    res.json({ ok: true });
  } catch (err) { next(err); }
});

module.exports = router;

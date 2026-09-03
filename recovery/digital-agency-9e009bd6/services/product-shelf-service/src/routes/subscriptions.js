const router = require('express').Router();
const { v4: uuidv4 } = require('uuid');
const { db } = require('../db');
const { requireAdmin, requireAuth } = require('../middleware/auth');

// GET /api/subscriptions
router.get('/', requireAuth, async (req, res, next) => {
  try {
    let subscriptions;
    if (req.user.role === 'admin') {
      subscriptions = await db.prepare(`
        SELECT ps.*, p.name as product_name, p.description as product_description, p.icon, p.config as product_config
        FROM product_subscriptions ps
        JOIN products p ON p.code = ps.product_code
        ORDER BY ps.created_at DESC
      `).all();
    } else {
      const clientId = req.user.clientId;
      if (!clientId) return res.json([]);
      subscriptions = await db.prepare(`
        SELECT ps.*, p.name as product_name, p.description as product_description, p.icon, p.config as product_config
        FROM product_subscriptions ps
        JOIN products p ON p.code = ps.product_code
        WHERE ps.client_id = ? AND ps.status IN ('active', 'trial') AND p.is_active = TRUE
        ORDER BY ps.created_at DESC
      `).all(clientId);
    }
    const now = new Date();
    res.json(subscriptions.map(s => {
      const item = { ...s, product_config: s.product_config ? JSON.parse(s.product_config) : {} };
      if (s.status === 'trial' && s.trial_ends_at) {
        const ends = new Date(s.trial_ends_at);
        item.trial_days_left = Math.max(0, Math.ceil((ends - now) / (1000 * 60 * 60 * 24)));
        item.trial_expired = now > ends;
      }
      return item;
    }));
  } catch (err) { next(err); }
});

// POST /api/subscriptions/trial — internal endpoint for self-registration
router.post('/trial', async (req, res, next) => {
  try {
    const { product_code, client_id } = req.body;
    if (!product_code || !client_id) return res.status(400).json({ error: 'product_code and client_id required' });
    const product = await db.prepare('SELECT * FROM products WHERE code = ? AND is_active = TRUE').get(product_code);
    if (!product) return res.status(404).json({ error: 'Product not found or inactive' });
    const existing = await db.prepare('SELECT id FROM product_subscriptions WHERE product_code = ? AND client_id = ?').get(product_code, client_id);
    if (existing) return res.status(409).json({ error: 'Subscription already exists' });
    const id = uuidv4();
    const trialDays = product.trial_days || 14;
    const trialEndsAt = new Date(Date.now() + trialDays * 24 * 60 * 60 * 1000).toISOString();
    await db.prepare(
      `INSERT INTO product_subscriptions (id, product_code, client_id, status, billing_amount, billing_period, trial_days, trial_ends_at)
       VALUES (?, ?, ?, 'trial', 0, 'monthly', ?, ?)`
    ).run(id, product_code, client_id, trialDays, trialEndsAt);
    const sub = await db.prepare('SELECT * FROM product_subscriptions WHERE id = ?').get(id);
    res.status(201).json(sub);
  } catch (err) { next(err); }
});

// POST /api/subscriptions
router.post('/', requireAdmin, async (req, res, next) => {
  try {
    const { product_code, client_id, billing_amount, billing_period, next_billing_date } = req.body;
    if (!product_code || !client_id) return res.status(400).json({ error: 'product_code and client_id required' });
    const product = await db.prepare('SELECT * FROM products WHERE code = ? AND is_active = TRUE').get(product_code);
    if (!product) return res.status(404).json({ error: 'Product not found or inactive' });
    const existing = await db.prepare('SELECT id FROM product_subscriptions WHERE product_code = ? AND client_id = ?').get(product_code, client_id);
    if (existing) return res.status(409).json({ error: 'Subscription already exists' });
    const id = uuidv4();
    const period = billing_period || 'monthly';
    const effectiveBillingDate = next_billing_date || (period !== 'once' ? new Date().toISOString().slice(0, 10) : null);
    await db.prepare('INSERT INTO product_subscriptions (id, product_code, client_id, billing_amount, billing_period, next_billing_date) VALUES (?, ?, ?, ?, ?, ?)').run(
      id, product_code, client_id, billing_amount || 0, period, effectiveBillingDate
    );
    const sub = await db.prepare('SELECT * FROM product_subscriptions WHERE id = ?').get(id);
    res.status(201).json(sub);
  } catch (err) { next(err); }
});

// PATCH /api/subscriptions/:id
router.patch('/:id', requireAdmin, async (req, res, next) => {
  try {
    const sub = await db.prepare('SELECT * FROM product_subscriptions WHERE id = ?').get(req.params.id);
    if (!sub) return res.status(404).json({ error: 'Subscription not found' });
    const { status, billing_amount, billing_period, next_billing_date, trial_days } = req.body;
    const updates = {};
    const values = [];
    if (status !== undefined) { updates.status = status; values.push(status); }
    if (billing_amount !== undefined) { updates.billing_amount = billing_amount; values.push(billing_amount); }
    if (billing_period !== undefined) { updates.billing_period = billing_period; values.push(billing_period); }
    if (next_billing_date !== undefined) { updates.next_billing_date = next_billing_date; values.push(next_billing_date); }
    if (trial_days !== undefined) {
      updates.trial_days = trial_days;
      values.push(trial_days);
      const newTrialEndsAt = new Date(new Date(sub.created_at).getTime() + trial_days * 24 * 60 * 60 * 1000).toISOString();
      updates.trial_ends_at = newTrialEndsAt;
      values.push(newTrialEndsAt);
    }
    if (Object.keys(updates).length > 0) {
      const keys = Object.keys(updates);
      const sets = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
      values.push(req.params.id);
      await db.pool.query(`UPDATE product_subscriptions SET ${sets} WHERE id = $${keys.length + 1}`, values);
    }
    const updated = await db.prepare('SELECT * FROM product_subscriptions WHERE id = ?').get(req.params.id);
    res.json(updated);
  } catch (err) { next(err); }
});

// DELETE /api/subscriptions/:id
router.delete('/:id', requireAdmin, async (req, res, next) => {
  try {
    const r = await db.prepare('DELETE FROM product_subscriptions WHERE id = ?').run(req.params.id);
    if (r.changes === 0) return res.status(404).json({ error: 'Subscription not found' });
    res.json({ ok: true });
  } catch (err) { next(err); }
});

module.exports = router;

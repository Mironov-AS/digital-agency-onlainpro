const router = require('express').Router();
const { v4: uuidv4 } = require('uuid');
const { db } = require('../db');
const { requireAdmin } = require('../middleware/auth');

// ── Cost types (справочник затрат) ───────────────────────────────────────────

router.get('/types', async (req, res, next) => {
  try {
    const rows = await db.prepare('SELECT * FROM cost_types ORDER BY sort_order ASC, name ASC').all();
    res.json(rows);
  } catch (err) { next(err); }
});

router.post('/types', requireAdmin, async (req, res, next) => {
  try {
    const { name, description = '', sort_order = 0 } = req.body;
    if (!name?.trim()) return res.status(400).json({ error: 'name required' });
    const id = uuidv4();
    await db.prepare('INSERT INTO cost_types (id, name, description, sort_order) VALUES (?, ?, ?, ?)')
      .run(id, name.trim(), description, Number(sort_order));
    const row = await db.prepare('SELECT * FROM cost_types WHERE id = ?').get(id);
    res.status(201).json(row);
  } catch (err) { next(err); }
});

router.put('/types/:id', requireAdmin, async (req, res, next) => {
  try {
    const { name, description, sort_order } = req.body;
    const updates = {};
    if (name !== undefined) updates.name = name.trim();
    if (description !== undefined) updates.description = description;
    if (sort_order !== undefined) updates.sort_order = Number(sort_order);
    if (!Object.keys(updates).length) return res.status(400).json({ error: 'Nothing to update' });
    const keys = Object.keys(updates);
    const values = Object.values(updates);
    const sets = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
    await db.pool.query(`UPDATE cost_types SET ${sets} WHERE id = $${keys.length + 1}`, [...values, req.params.id]);
    const row = await db.prepare('SELECT * FROM cost_types WHERE id = ?').get(req.params.id);
    if (!row) return res.status(404).json({ error: 'Not found' });
    res.json(row);
  } catch (err) { next(err); }
});

router.delete('/types/:id', requireAdmin, async (req, res, next) => {
  try {
    const r = await db.prepare('DELETE FROM cost_types WHERE id = ?').run(req.params.id);
    if (r.changes === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ ok: true });
  } catch (err) { next(err); }
});

// ── Service costs (nested под конкретной услугой каталога) ───────────────────

router.get('/services/:serviceId', async (req, res, next) => {
  try {
    const rows = await db.prepare('SELECT * FROM service_costs WHERE service_id = ? ORDER BY created_at ASC')
      .all(req.params.serviceId);
    res.json(rows);
  } catch (err) { next(err); }
});

router.post('/services/:serviceId', requireAdmin, async (req, res, next) => {
  try {
    const svc = await db.prepare('SELECT id FROM services WHERE id = ?').get(req.params.serviceId);
    if (!svc) return res.status(404).json({ error: 'Service not found' });
    const { cost_name, amount = 0, period = 'monthly', note = '' } = req.body;
    if (!cost_name?.trim()) return res.status(400).json({ error: 'cost_name required' });
    const id = uuidv4();
    await db.prepare('INSERT INTO service_costs (id, service_id, cost_name, amount, period, note) VALUES (?, ?, ?, ?, ?, ?)')
      .run(id, req.params.serviceId, cost_name.trim(), Number(amount), period, note);
    const row = await db.prepare('SELECT * FROM service_costs WHERE id = ?').get(id);
    res.status(201).json(row);
  } catch (err) { next(err); }
});

router.put('/services/:serviceId/:costId', requireAdmin, async (req, res, next) => {
  try {
    const { cost_name, amount, period, note } = req.body;
    const updates = {};
    if (cost_name !== undefined) updates.cost_name = cost_name.trim();
    if (amount !== undefined) updates.amount = Number(amount);
    if (period !== undefined) updates.period = period;
    if (note !== undefined) updates.note = note;
    if (!Object.keys(updates).length) return res.status(400).json({ error: 'Nothing to update' });
    const keys = Object.keys(updates);
    const values = Object.values(updates);
    const sets = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
    await db.pool.query(
      `UPDATE service_costs SET ${sets} WHERE id = $${keys.length + 1} AND service_id = $${keys.length + 2}`,
      [...values, req.params.costId, req.params.serviceId],
    );
    const row = await db.prepare('SELECT * FROM service_costs WHERE id = ?').get(req.params.costId);
    if (!row) return res.status(404).json({ error: 'Not found' });
    res.json(row);
  } catch (err) { next(err); }
});

router.delete('/services/:serviceId/:costId', requireAdmin, async (req, res, next) => {
  try {
    const { rowCount } = await db.pool.query(
      'DELETE FROM service_costs WHERE id = $1 AND service_id = $2',
      [req.params.costId, req.params.serviceId],
    );
    if (rowCount === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ ok: true });
  } catch (err) { next(err); }
});

module.exports = router;

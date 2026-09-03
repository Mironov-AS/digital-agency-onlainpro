const { Router } = require('express');
const { v4: uuidv4 } = require('uuid');
const { requireAuth } = require('../../../../shared/middleware/auth');
const { db } = require('../db');

const router = Router();

function getClientId(req) {
  if (req.user.role === 'admin') return req.query.client_id || req.body?.client_id || '';
  return req.user.clientId || '';
}

router.get('/', requireAuth, async (req, res) => {
  try {
    const clientId = getClientId(req);
    const { status, search } = req.query;
    let where = 'WHERE client_id = ?';
    const params = [clientId];

    if (status) {
      where += ' AND status = ?';
      params.push(status);
    }
    if (search) {
      where += ' AND (name ILIKE ? OR sku ILIKE ? OR description ILIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    const rows = await db.prepare(`
      SELECT *
      FROM sales_items
      ${where}
      ORDER BY sort_order, name
    `).all(...params);
    res.json(rows);
  } catch (err) {
    console.error('[crm] GET /sales-items', err);
    res.status(500).json({ error: 'Ошибка при получении номенклатуры продаж' });
  }
});

router.post('/', requireAuth, async (req, res) => {
  try {
    const clientId = getClientId(req);
    const { name, sku, description, unit, price, sort_order } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ error: 'Название обязательно' });

    const id = uuidv4();
    await db.prepare(`
      INSERT INTO sales_items (id, client_id, name, sku, description, unit, price, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      clientId,
      name.trim(),
      sku || '',
      description || '',
      unit || 'шт',
      Number(price) || 0,
      Number(sort_order) || 0,
    );

    const created = await db.prepare('SELECT * FROM sales_items WHERE id = ?').get(id);
    res.status(201).json(created);
  } catch (err) {
    console.error('[crm] POST /sales-items', err);
    res.status(500).json({ error: 'Ошибка при создании позиции продаж' });
  }
});

router.put('/:id', requireAuth, async (req, res) => {
  try {
    const clientId = getClientId(req);
    const existing = await db.prepare('SELECT id FROM sales_items WHERE id = ? AND client_id = ?').get(req.params.id, clientId);
    if (!existing) return res.status(404).json({ error: 'Позиция продаж не найдена' });

    const { name, sku, description, unit, price, status, sort_order } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ error: 'Название обязательно' });

    await db.prepare(`
      UPDATE sales_items
      SET name = ?, sku = ?, description = ?, unit = ?, price = ?, status = ?,
          sort_order = ?, updated_at = NOW()
      WHERE id = ? AND client_id = ?
    `).run(
      name.trim(),
      sku || '',
      description || '',
      unit || 'шт',
      Number(price) || 0,
      status || 'active',
      Number(sort_order) || 0,
      req.params.id,
      clientId,
    );

    const updated = await db.prepare('SELECT * FROM sales_items WHERE id = ?').get(req.params.id);
    res.json(updated);
  } catch (err) {
    console.error('[crm] PUT /sales-items/:id', err);
    res.status(500).json({ error: 'Ошибка при обновлении позиции продаж' });
  }
});

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const clientId = getClientId(req);
    await db.prepare("UPDATE sales_items SET status = 'archived', updated_at = NOW() WHERE id = ? AND client_id = ?")
      .run(req.params.id, clientId);
    res.json({ ok: true });
  } catch (err) {
    console.error('[crm] DELETE /sales-items/:id', err);
    res.status(500).json({ error: 'Ошибка при архивировании позиции продаж' });
  }
});

module.exports = router;

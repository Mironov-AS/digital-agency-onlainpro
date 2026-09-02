const { Router } = require('express');
const { v4: uuidv4 } = require('uuid');
const { requireAuth } = require('../../../../shared/middleware/auth');
const { db } = require('../db');

const router = Router();
const ORDER_STATUSES = ['active', 'completed', 'canceled'];

function getClientId(req) {
  if (req.user.role === 'admin') return req.query.client_id || req.body?.client_id || '';
  return req.user.clientId || '';
}

function normalizeItems(items = []) {
  if (!Array.isArray(items)) return [];
  const normalized = [];
  for (const item of items) {
    if (!item.sales_item_id) {
      const err = new Error('Выберите позицию номенклатуры');
      err.status = 400;
      throw err;
    }

    const name = (item.name || '').trim();
    if (!name) continue;

    const quantity = Number(item.quantity);
    if (!Number.isInteger(quantity) || quantity < 1) {
      const err = new Error('Количество позиции должно быть целым числом от 1');
      err.status = 400;
      throw err;
    }

    normalized.push({
      sales_item_id: item.sales_item_id || null,
      name,
      quantity,
      price: Number(item.price) || 0,
      comment: item.comment || '',
    });
  }
  if (!normalized.length) {
    const err = new Error('Выберите позицию номенклатуры');
    err.status = 400;
    throw err;
  }
  return normalized;
}

async function saveOrderItems(orderId, items) {
  await db.prepare('DELETE FROM order_items WHERE order_id = ?').run(orderId);
  for (const item of items) {
    await db.prepare(`
      INSERT INTO order_items (id, order_id, sales_item_id, name, quantity, price, comment)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(uuidv4(), orderId, item.sales_item_id, item.name, item.quantity, item.price, item.comment);
  }
  const total = items.reduce((sum, item) => sum + item.quantity * item.price, 0);
  await db.prepare('UPDATE orders SET total_amount = ?, updated_at = NOW() WHERE id = ?').run(total, orderId);
}

async function validateOrderItemsBelongToClient(items, clientId) {
  for (const item of items) {
    const salesItem = await db.prepare(
      "SELECT id FROM sales_items WHERE id = ? AND client_id = ? AND status != 'archived'",
    ).get(item.sales_item_id, clientId);
    if (!salesItem) {
      const err = new Error('Позиция номенклатуры не найдена');
      err.status = 404;
      throw err;
    }
  }
}

async function getOrderById(id, clientId) {
  const order = await db.prepare(`
    SELECT o.*, c.full_name AS customer_name, c.phone AS customer_phone
    FROM orders o
    LEFT JOIN customers c ON c.id = o.customer_id
    WHERE o.id = ? AND o.client_id = ?
  `).get(id, clientId);
  if (!order) return null;

  order.items = await db.prepare(`
    SELECT oi.*, si.sku, si.unit
    FROM order_items oi
    LEFT JOIN sales_items si ON si.id = oi.sales_item_id
    WHERE oi.order_id = ?
    ORDER BY oi.created_at
  `).all(id);

  order.activities = await db.prepare(`
    SELECT a.*, e.full_name AS employee_name
    FROM activities a
    LEFT JOIN employees e ON e.id = a.employee_id
    WHERE a.order_id = ? AND a.client_id = ?
    ORDER BY a.planned_date, a.planned_time NULLS LAST
  `).all(id, clientId);

  return order;
}

router.get('/', requireAuth, async (req, res) => {
  try {
    const clientId = getClientId(req);
    const { customer_id, status, from, to, search } = req.query;

    let where = 'WHERE o.client_id = ?';
    const params = [clientId];
    if (customer_id) { where += ' AND o.customer_id = ?'; params.push(customer_id); }
    if (status) { where += ' AND o.status = ?'; params.push(status); }
    if (from) { where += ' AND o.created_at >= ?::DATE'; params.push(from); }
    if (to) { where += " AND o.created_at < (?::DATE + INTERVAL '1 day')"; params.push(to); }
    if (search) {
      where += ' AND (o.title ILIKE ? OR o.description ILIKE ? OR c.full_name ILIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    const rows = await db.prepare(`
      SELECT o.*, c.full_name AS customer_name, c.phone AS customer_phone,
             COUNT(oi.id)::INT AS items_count
      FROM orders o
      LEFT JOIN customers c ON c.id = o.customer_id
      LEFT JOIN order_items oi ON oi.order_id = o.id
      ${where}
      GROUP BY o.id, c.full_name, c.phone
      ORDER BY o.updated_at DESC, o.created_at DESC
    `).all(...params);

    res.json(rows);
  } catch (err) {
    console.error('[crm] GET /orders', err);
    res.status(500).json({ error: 'Ошибка при получении заказов' });
  }
});

router.get('/:id', requireAuth, async (req, res) => {
  try {
    const clientId = getClientId(req);
    const order = await getOrderById(req.params.id, clientId);
    if (!order) return res.status(404).json({ error: 'Заказ не найден' });
    res.json(order);
  } catch (err) {
    console.error('[crm] GET /orders/:id', err);
    res.status(500).json({ error: 'Ошибка при получении заказа' });
  }
});

router.post('/', requireAuth, async (req, res) => {
  try {
    const clientId = getClientId(req);
    const { customer_id, title, description, items } = req.body;
    if (!customer_id) return res.status(400).json({ error: 'Клиент обязателен' });
    if (!title || !title.trim()) return res.status(400).json({ error: 'Номер заказа обязателен' });
    const normalizedItems = normalizeItems(items);
    await validateOrderItemsBelongToClient(normalizedItems, clientId);

    const customer = await db.prepare('SELECT id FROM customers WHERE id = ? AND client_id = ?').get(customer_id, clientId);
    if (!customer) return res.status(404).json({ error: 'Клиент не найден' });

    const id = uuidv4();
    await db.prepare(`
      INSERT INTO orders (id, client_id, customer_id, title, description)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, clientId, customer_id, title.trim(), description || '');

    await saveOrderItems(id, normalizedItems);
    const created = await getOrderById(id, clientId);
    res.status(201).json(created);
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    console.error('[crm] POST /orders', err);
    res.status(500).json({ error: 'Ошибка при создании заказа' });
  }
});

router.put('/:id', requireAuth, async (req, res) => {
  try {
    const clientId = getClientId(req);
    const existing = await db.prepare('SELECT * FROM orders WHERE id = ? AND client_id = ?').get(req.params.id, clientId);
    if (!existing) return res.status(404).json({ error: 'Заказ не найден' });
    if (existing.status !== 'active') return res.status(400).json({ error: 'Закрытый заказ нельзя редактировать' });

    const { customer_id, title, description, items } = req.body;
    if (!customer_id) return res.status(400).json({ error: 'Клиент обязателен' });
    if (!title || !title.trim()) return res.status(400).json({ error: 'Номер заказа обязателен' });
    const normalizedItems = normalizeItems(items);
    await validateOrderItemsBelongToClient(normalizedItems, clientId);

    const customer = await db.prepare('SELECT id FROM customers WHERE id = ? AND client_id = ?').get(customer_id, clientId);
    if (!customer) return res.status(404).json({ error: 'Клиент не найден' });

    await db.prepare(`
      UPDATE orders
      SET customer_id = ?, title = ?, description = ?, updated_at = NOW()
      WHERE id = ? AND client_id = ?
    `).run(customer_id, title.trim(), description || '', req.params.id, clientId);

    await saveOrderItems(req.params.id, normalizedItems);
    const updated = await getOrderById(req.params.id, clientId);
    res.json(updated);
  } catch (err) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    console.error('[crm] PUT /orders/:id', err);
    res.status(500).json({ error: 'Ошибка при обновлении заказа' });
  }
});

router.post('/:id/close', requireAuth, async (req, res) => {
  try {
    const clientId = getClientId(req);
    const { status, outcome } = req.body;
    if (!['completed', 'canceled'].includes(status)) {
      return res.status(400).json({ error: 'Заказ можно закрыть только как выполненный или отмененный' });
    }
    if (!outcome || !outcome.trim()) return res.status(400).json({ error: 'Заполните итог по заказу' });

    const existing = await db.prepare('SELECT id FROM orders WHERE id = ? AND client_id = ?').get(req.params.id, clientId);
    if (!existing) return res.status(404).json({ error: 'Заказ не найден' });

    await db.prepare(`
      UPDATE orders
      SET status = ?, outcome = ?, closed_at = NOW(), updated_at = NOW()
      WHERE id = ? AND client_id = ?
    `).run(status, outcome.trim(), req.params.id, clientId);

    const updated = await getOrderById(req.params.id, clientId);
    res.json(updated);
  } catch (err) {
    console.error('[crm] POST /orders/:id/close', err);
    res.status(500).json({ error: 'Ошибка при закрытии заказа' });
  }
});

module.exports = router;

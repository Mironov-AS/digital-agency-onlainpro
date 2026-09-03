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
    const { customer_id, employee_id, service_id, from, to, page = 1, limit = 50 } = req.query;
    const offset = (Math.max(1, +page) - 1) * +limit;

    let where = 'WHERE wr.client_id = $1';
    const params = [clientId];
    let idx = 2;

    if (customer_id) {
      where += ` AND wr.customer_id = $${idx}`;
      params.push(customer_id);
      idx++;
    }
    if (employee_id) {
      where += ` AND wr.employee_id = $${idx}`;
      params.push(employee_id);
      idx++;
    }
    if (service_id) {
      where += ` AND wr.service_id = $${idx}`;
      params.push(service_id);
      idx++;
    }
    if (from) {
      where += ` AND wr.performed_at >= $${idx}`;
      params.push(from);
      idx++;
    }
    if (to) {
      where += ` AND wr.performed_at <= $${idx}`;
      params.push(to);
      idx++;
    }

    const countRes = await db.pool.query(
      `SELECT COUNT(*) as total FROM work_records wr ${where}`, params,
    );
    const total = +countRes.rows[0].total;

    const { rows } = await db.pool.query(`
      SELECT wr.*, s.name as service_name, e.full_name as employee_name,
             c.full_name as customer_name, c.phone as customer_phone
      FROM work_records wr
      LEFT JOIN services s ON s.id = wr.service_id
      LEFT JOIN employees e ON e.id = wr.employee_id
      LEFT JOIN customers c ON c.id = wr.customer_id
      ${where}
      ORDER BY wr.performed_at DESC
      LIMIT $${idx} OFFSET $${idx + 1}
    `, [...params, +limit, offset]);

    res.json({ items: rows, total, page: +page, limit: +limit });
  } catch (err) {
    console.error('[crm] GET /work-records', err);
    res.status(500).json({ error: 'Ошибка при получении записей работ' });
  }
});

router.post('/', requireAuth, async (req, res) => {
  try {
    const clientId = req.user.role === 'admin'
      ? (req.body.client_id || '') : (req.user.clientId || '');
    const { customer_id, service_id, employee_id, performed_at, duration, price, comment } = req.body;

    if (!customer_id) return res.status(400).json({ error: 'Клиент обязателен' });

    const id = uuidv4();
    await db.prepare(`
      INSERT INTO work_records (id, client_id, customer_id, service_id, employee_id, performed_at, duration, price, comment)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, clientId, customer_id, service_id || null, employee_id || null,
      performed_at || new Date().toISOString(), duration || 0, price || 0, comment || '');

    const created = await db.prepare(`
      SELECT wr.*, s.name as service_name, e.full_name as employee_name,
             c.full_name as customer_name
      FROM work_records wr
      LEFT JOIN services s ON s.id = wr.service_id
      LEFT JOIN employees e ON e.id = wr.employee_id
      LEFT JOIN customers c ON c.id = wr.customer_id
      WHERE wr.id = ?
    `).get(id);
    res.status(201).json(created);
  } catch (err) {
    console.error('[crm] POST /work-records', err);
    res.status(500).json({ error: 'Ошибка при создании записи работы' });
  }
});

router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { customer_id, service_id, employee_id, performed_at, duration, price, comment } = req.body;
    if (!customer_id) return res.status(400).json({ error: 'Клиент обязателен' });

    await db.prepare(`
      UPDATE work_records
      SET customer_id = ?, service_id = ?, employee_id = ?, performed_at = ?,
          duration = ?, price = ?, comment = ?
      WHERE id = ?
    `).run(customer_id, service_id || null, employee_id || null,
      performed_at || new Date().toISOString(), duration || 0, price || 0,
      comment || '', req.params.id);

    const updated = await db.prepare('SELECT * FROM work_records WHERE id = ?').get(req.params.id);
    if (!updated) return res.status(404).json({ error: 'Запись не найдена' });
    res.json(updated);
  } catch (err) {
    console.error('[crm] PUT /work-records/:id', err);
    res.status(500).json({ error: 'Ошибка при обновлении записи' });
  }
});

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { changes } = await db.prepare('DELETE FROM work_records WHERE id = ?').run(req.params.id);
    if (!changes) return res.status(404).json({ error: 'Запись не найдена' });
    res.json({ ok: true });
  } catch (err) {
    console.error('[crm] DELETE /work-records/:id', err);
    res.status(500).json({ error: 'Ошибка при удалении записи' });
  }
});

module.exports = router;

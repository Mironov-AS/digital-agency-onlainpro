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
    const { search, active_only } = req.query;

    let where = 'WHERE client_id = $1';
    const params = [clientId];
    let idx = 2;

    if (active_only === 'true') {
      where += ' AND is_active = TRUE';
    }
    if (search) {
      where += ` AND (full_name ILIKE $${idx} OR position ILIKE $${idx} OR email ILIKE $${idx})`;
      params.push(`%${search}%`);
      idx++;
    }

    const { rows } = await db.pool.query(
      `SELECT * FROM employees ${where} ORDER BY full_name`, params,
    );
    res.json(rows);
  } catch (err) {
    console.error('[crm] GET /employees', err);
    res.status(500).json({ error: 'Ошибка при получении сотрудников' });
  }
});

router.get('/:id', requireAuth, async (req, res) => {
  try {
    const row = await db.prepare('SELECT * FROM employees WHERE id = ?').get(req.params.id);
    if (!row) return res.status(404).json({ error: 'Сотрудник не найден' });

    if (row.schedule) try { row.schedule = JSON.parse(row.schedule); } catch {}
    if (row.specializations) try { row.specializations = JSON.parse(row.specializations); } catch {}

    res.json(row);
  } catch (err) {
    console.error('[crm] GET /employees/:id', err);
    res.status(500).json({ error: 'Ошибка при получении сотрудника' });
  }
});

router.get('/:id/workload', requireAuth, async (req, res) => {
  try {
    const { from, to } = req.query;
    let where = 'WHERE employee_id = $1';
    const params = [req.params.id];
    let idx = 2;

    if (from) {
      where += ` AND performed_at >= $${idx}`;
      params.push(from);
      idx++;
    }
    if (to) {
      where += ` AND performed_at <= $${idx}`;
      params.push(to);
      idx++;
    }

    const { rows } = await db.pool.query(`
      SELECT wr.*, s.name as service_name, c.full_name as customer_name
      FROM work_records wr
      LEFT JOIN services s ON s.id = wr.service_id
      LEFT JOIN customers c ON c.id = wr.customer_id
      ${where}
      ORDER BY wr.performed_at DESC
    `, params);

    const totalHours = rows.reduce((sum, r) => sum + (r.duration || 0), 0) / 60;
    res.json({ records: rows, total_records: rows.length, total_hours: Math.round(totalHours * 10) / 10 });
  } catch (err) {
    console.error('[crm] GET /employees/:id/workload', err);
    res.status(500).json({ error: 'Ошибка при получении загрузки' });
  }
});

router.post('/', requireAuth, async (req, res) => {
  try {
    const clientId = req.user.role === 'admin'
      ? (req.body.client_id || '') : (req.user.clientId || '');
    const { full_name, position, phone, email, schedule, specializations } = req.body;

    if (!full_name) return res.status(400).json({ error: 'ФИО обязательно' });

    const id = uuidv4();
    await db.prepare(`
      INSERT INTO employees (id, client_id, full_name, position, phone, email, schedule, specializations)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, clientId, full_name, position || '', phone || '', email || '',
      JSON.stringify(schedule || {}), JSON.stringify(specializations || []));

    const created = await db.prepare('SELECT * FROM employees WHERE id = ?').get(id);
    res.status(201).json(created);
  } catch (err) {
    console.error('[crm] POST /employees', err);
    res.status(500).json({ error: 'Ошибка при создании сотрудника' });
  }
});

router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { full_name, position, phone, email, schedule, specializations, is_active } = req.body;
    if (!full_name) return res.status(400).json({ error: 'ФИО обязательно' });

    await db.prepare(`
      UPDATE employees
      SET full_name = ?, position = ?, phone = ?, email = ?, schedule = ?,
          specializations = ?, is_active = ?, updated_at = NOW()
      WHERE id = ?
    `).run(full_name, position || '', phone || '', email || '',
      JSON.stringify(schedule || {}), JSON.stringify(specializations || []),
      is_active !== false, req.params.id);

    const updated = await db.prepare('SELECT * FROM employees WHERE id = ?').get(req.params.id);
    if (!updated) return res.status(404).json({ error: 'Сотрудник не найден' });
    res.json(updated);
  } catch (err) {
    console.error('[crm] PUT /employees/:id', err);
    res.status(500).json({ error: 'Ошибка при обновлении сотрудника' });
  }
});

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    await db.prepare('UPDATE employees SET is_active = FALSE, updated_at = NOW() WHERE id = ?').run(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    console.error('[crm] DELETE /employees/:id', err);
    res.status(500).json({ error: 'Ошибка при деактивации сотрудника' });
  }
});

module.exports = router;

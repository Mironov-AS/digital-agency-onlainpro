const { Router } = require('express');
const { requireAuth } = require('../../../../shared/middleware/auth');
const { db } = require('../db');

const router = Router();

function getClientId(req) {
  if (req.user.role === 'admin') return req.query.client_id || '';
  return req.user.clientId || '';
}

function toCsv(rows, columns) {
  if (!rows.length) return columns.map(c => c.label).join(';') + '\n';
  const header = columns.map(c => c.label).join(';');
  const body = rows.map(row =>
    columns.map(c => {
      let val = typeof c.getter === 'function' ? c.getter(row) : (row[c.key] ?? '');
      val = String(val).replace(/"/g, '""');
      if (val.includes(';') || val.includes('"') || val.includes('\n')) val = `"${val}"`;
      return val;
    }).join(';'),
  ).join('\n');
  return '﻿' + header + '\n' + body + '\n';
}

router.get('/customers', requireAuth, async (req, res) => {
  try {
    const clientId = getClientId(req);
    const rows = await db.prepare(
      'SELECT * FROM customers WHERE client_id = ? ORDER BY full_name',
    ).all(clientId);

    const fields = await db.prepare(
      'SELECT * FROM custom_fields WHERE client_id = ? AND is_deleted = FALSE ORDER BY sort_order, name',
    ).all(clientId);

    if (rows.length && fields.length) {
      const ids = rows.map(r => r.id);
      const placeholders = ids.map((_, i) => `$${i + 1}`).join(',');
      const { rows: vals } = await db.pool.query(
        `SELECT * FROM customer_custom_values WHERE customer_id IN (${placeholders})`, ids,
      );
      const map = {};
      vals.forEach(v => {
        if (!map[v.customer_id]) map[v.customer_id] = {};
        map[v.customer_id][v.field_id] = v.value;
      });
      rows.forEach(r => { r._cv = map[r.id] || {}; });
    }

    const columns = [
      { key: 'full_name', label: 'ФИО' },
      { key: 'phone', label: 'Телефон' },
      { key: 'email', label: 'E-mail' },
      { key: 'additional_contacts', label: 'Доп. контакты' },
      { key: 'notes', label: 'Примечания' },
      { key: 'created_at', label: 'Дата создания' },
      ...fields.map(f => ({
        key: `_cf_${f.id}`,
        label: f.name,
        getter: (row) => (row._cv && row._cv[f.id]) || '',
      })),
    ];

    const csv = toCsv(rows, columns);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="customers.csv"');
    res.send(csv);
  } catch (err) {
    console.error('[crm] export customers', err);
    res.status(500).json({ error: 'Ошибка экспорта' });
  }
});

router.get('/services', requireAuth, async (req, res) => {
  try {
    const clientId = getClientId(req);
    const { rows } = await db.pool.query(`
      SELECT s.*, sc.name as category_name
      FROM services s
      LEFT JOIN service_categories sc ON sc.id = s.category_id
      WHERE s.client_id = $1
      ORDER BY s.sort_order, s.name
    `, [clientId]);

    const csv = toCsv(rows, [
      { key: 'name', label: 'Название' },
      { key: 'category_name', label: 'Категория' },
      { key: 'description', label: 'Описание' },
      { key: 'duration', label: 'Длительность (мин)' },
      { key: 'price', label: 'Цена' },
      { key: 'status', label: 'Статус' },
    ]);

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="services.csv"');
    res.send(csv);
  } catch (err) {
    console.error('[crm] export services', err);
    res.status(500).json({ error: 'Ошибка экспорта' });
  }
});

router.get('/employees', requireAuth, async (req, res) => {
  try {
    const clientId = getClientId(req);
    const rows = await db.prepare(
      'SELECT * FROM employees WHERE client_id = ? ORDER BY full_name',
    ).all(clientId);

    const csv = toCsv(rows, [
      { key: 'full_name', label: 'ФИО' },
      { key: 'position', label: 'Должность' },
      { key: 'phone', label: 'Телефон' },
      { key: 'email', label: 'E-mail' },
      { key: 'is_active', label: 'Активен' },
    ]);

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="employees.csv"');
    res.send(csv);
  } catch (err) {
    console.error('[crm] export employees', err);
    res.status(500).json({ error: 'Ошибка экспорта' });
  }
});

router.get('/work-records', requireAuth, async (req, res) => {
  try {
    const clientId = getClientId(req);
    const { from, to } = req.query;

    let where = 'WHERE wr.client_id = $1';
    const params = [clientId];
    let idx = 2;
    if (from) { where += ` AND wr.performed_at >= $${idx}`; params.push(from); idx++; }
    if (to) { where += ` AND wr.performed_at <= $${idx}`; params.push(to); idx++; }

    const { rows } = await db.pool.query(`
      SELECT wr.*, s.name as service_name, e.full_name as employee_name,
             c.full_name as customer_name, c.phone as customer_phone
      FROM work_records wr
      LEFT JOIN services s ON s.id = wr.service_id
      LEFT JOIN employees e ON e.id = wr.employee_id
      LEFT JOIN customers c ON c.id = wr.customer_id
      ${where}
      ORDER BY wr.performed_at DESC
    `, params);

    const csv = toCsv(rows, [
      { key: 'performed_at', label: 'Дата' },
      { key: 'customer_name', label: 'Клиент' },
      { key: 'customer_phone', label: 'Телефон клиента' },
      { key: 'service_name', label: 'Услуга' },
      { key: 'employee_name', label: 'Исполнитель' },
      { key: 'duration', label: 'Длительность (мин)' },
      { key: 'price', label: 'Стоимость' },
      { key: 'comment', label: 'Комментарий' },
    ]);

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="work-records.csv"');
    res.send(csv);
  } catch (err) {
    console.error('[crm] export work-records', err);
    res.status(500).json({ error: 'Ошибка экспорта' });
  }
});

module.exports = router;

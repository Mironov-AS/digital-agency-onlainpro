const { Router } = require('express');
const { db } = require('../database');
const { requireAuth } = require('../../../../shared/middleware/auth');

const router = Router();

function toCSV(rows) {
  if (!rows.length) return '';
  const headers = Object.keys(rows[0]);
  const escape = v => {
    if (v == null) return '';
    const s = String(v).replace(/"/g, '""');
    return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s}"` : s;
  };
  return [headers.join(','), ...rows.map(r => headers.map(h => escape(r[h])).join(','))].join('\n');
}

router.get('/appointments', requireAuth, async (req, res) => {
  try {
    const clientId = req.user.clientId || '';
    const { date_from, date_to } = req.query;

    let sql = `
      SELECT
        a.id, a.appointment_date as "Дата", a.appointment_time as "Время",
        s.name as "Услуга", a.vehicle_number as "Номер авто", a.phone as "Телефон",
        a.customer_name as "Имя клиента", a.status as "Статус",
        a.comment as "Комментарий", a.created_by as "Создал", a.created_at as "Дата создания"
      FROM appointments a
      LEFT JOIN services s ON a.service_id = s.id
      WHERE a.client_id = ?
    `;
    const params = [clientId];
    if (date_from) { sql += ' AND a.appointment_date >= ?'; params.push(date_from); }
    if (date_to) { sql += ' AND a.appointment_date <= ?'; params.push(date_to); }
    sql += ' ORDER BY a.appointment_date, a.appointment_time';

    const rows = await db.prepare(sql).all(...params);

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="appointments_${Date.now()}.csv"`);
    res.send('﻿' + toCSV(rows));
  } catch (err) {
    console.error('Export error:', err);
    res.status(500).json({ error: 'Ошибка экспорта' });
  }
});

module.exports = router;

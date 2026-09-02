const { Router } = require('express');
const { db } = require('../database');
const { requireAuth } = require('../../../../shared/middleware/auth');

const router = Router();

router.get('/', requireAuth, async (req, res) => {
  try {
    const clientId = req.user.clientId || '';
    const { date_from, date_to, service_id } = req.query;

    let sql = `
      SELECT a.*, s.name as service_name, s.color as service_color, s.duration as service_duration,
             sp.name as specialist_name
      FROM appointments a
      LEFT JOIN services s ON a.service_id = s.id
      LEFT JOIN specialists sp ON a.specialist_id = sp.id
      WHERE a.client_id = ? AND a.status != 'canceled'
    `;
    const params = [clientId];

    if (date_from) { sql += ' AND a.appointment_date >= ?'; params.push(date_from); }
    if (date_to) { sql += ' AND a.appointment_date <= ?'; params.push(date_to); }
    if (service_id) { sql += ' AND a.service_id = ?'; params.push(service_id); }

    sql += ' ORDER BY a.appointment_date, a.appointment_time';

    const [appointments, services, specialists] = await Promise.all([
      db.prepare(sql).all(...params),
      db.prepare("SELECT id, name, color, duration, status FROM services WHERE client_id = ? AND status = 'active' ORDER BY name").all(clientId),
      db.prepare("SELECT id, name, position FROM specialists WHERE client_id = ? AND is_active = TRUE ORDER BY name").all(clientId),
    ]);

    res.json({ appointments, services, specialists });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json({ error: 'Ошибка загрузки дашборда' });
  }
});

router.get('/month-summary', requireAuth, async (req, res) => {
  try {
    const clientId = req.user.clientId || '';
    const { year, month } = req.query;
    if (!year || !month) return res.status(400).json({ error: 'Укажите год и месяц' });

    const from = `${year}-${String(month).padStart(2, '0')}-01`;
    const lastDay = new Date(Number(year), Number(month), 0).getDate();
    const to = `${year}-${String(month).padStart(2, '0')}-${lastDay}`;

    const summary = await db.prepare(`
      SELECT appointment_date, COUNT(*) as total,
             COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed,
             COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending
      FROM appointments
      WHERE client_id = ? AND appointment_date BETWEEN ? AND ? AND status != 'canceled'
      GROUP BY appointment_date
      ORDER BY appointment_date
    `).all(clientId, from, to);

    res.json({ year: Number(year), month: Number(month), summary });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка загрузки' });
  }
});

router.get('/stats', requireAuth, async (req, res) => {
  try {
    const clientId = req.user.clientId || '';
    const today = new Date().toISOString().slice(0, 10);

    const todayCount = await db.prepare(
      "SELECT COUNT(*) as cnt FROM appointments WHERE client_id = ? AND appointment_date = ? AND status != 'canceled'"
    ).get(clientId, today);

    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    const weekCount = await db.prepare(
      "SELECT COUNT(*) as cnt FROM appointments WHERE client_id = ? AND appointment_date BETWEEN ? AND ? AND status != 'canceled'"
    ).get(clientId, weekStart.toISOString().slice(0, 10), weekEnd.toISOString().slice(0, 10));

    const servicesCount = await db.prepare(
      "SELECT COUNT(*) as cnt FROM services WHERE client_id = ? AND status = 'active'"
    ).get(clientId);

    const byService = await db.prepare(`
      SELECT s.name, s.color, COUNT(a.id) as count
      FROM appointments a JOIN services s ON a.service_id = s.id
      WHERE a.client_id = ? AND a.appointment_date = ? AND a.status != 'canceled'
      GROUP BY s.id, s.name, s.color
    `).all(clientId, today);

    res.json({ today: todayCount.cnt, thisWeek: weekCount.cnt, activeServices: servicesCount.cnt, todayByService: byService });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка загрузки статистики' });
  }
});

router.get('/public/:clientId', async (req, res) => {
  try {
    const clientId = req.params.clientId === 'default' ? '' : req.params.clientId;
    const today = new Date().toISOString().slice(0, 10);
    const weekEnd = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);

    const [appointments, specialists] = await Promise.all([
      db.prepare(`
        SELECT a.appointment_date, a.appointment_time, a.end_time, a.status,
               a.customer_name, a.vehicle_number, a.specialist_id,
               s.name as service_name, s.color as service_color,
               sp.name as specialist_name
        FROM appointments a
        LEFT JOIN services s ON a.service_id = s.id
        LEFT JOIN specialists sp ON a.specialist_id = sp.id
        WHERE a.client_id = ? AND a.appointment_date BETWEEN ? AND ? AND a.status != 'canceled'
        ORDER BY a.appointment_date, a.appointment_time
      `).all(clientId, today, weekEnd),
      db.prepare("SELECT id, name, position FROM specialists WHERE client_id = ? AND is_active = TRUE ORDER BY name").all(clientId),
    ]);

    res.json({ appointments, specialists });
  } catch (err) { res.status(500).json({ error: 'Ошибка' }); }
});

module.exports = router;

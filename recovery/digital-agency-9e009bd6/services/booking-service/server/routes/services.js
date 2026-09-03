const { Router } = require('express');
const { db } = require('../database');
const { requireAuth } = require('../../../../shared/middleware/auth');
const { logAction } = require('../services/logging');
const { emitAsync } = require('../services/webhooks');
const { v4: uuid } = require('uuid');

const router = Router();

const SERVICE_COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];

router.get('/', requireAuth, async (req, res) => {
  try {
    const clientId = req.user.clientId || '';
    const { status, search, sort } = req.query;

    let sql = "SELECT * FROM services WHERE client_id = ?";
    const params = [clientId];

    if (status && status !== 'all') {
      sql += " AND status = ?";
      params.push(status);
    }
    if (search) {
      sql += " AND LOWER(name) LIKE ?";
      params.push(`%${search.toLowerCase()}%`);
    }

    switch (sort) {
      case 'name': sql += " ORDER BY name"; break;
      case 'duration': sql += " ORDER BY duration"; break;
      case 'price': sql += " ORDER BY price DESC"; break;
      default: sql += " ORDER BY sort_order, name";
    }

    const services = await db.prepare(sql).all(...params);
    res.json(services);
  } catch (err) {
    res.status(500).json({ error: 'Ошибка загрузки услуг' });
  }
});

router.get('/:id', requireAuth, async (req, res) => {
  try {
    const service = await db.prepare("SELECT * FROM services WHERE id = ? AND client_id = ?").get(req.params.id, req.user.clientId || '');
    if (!service) return res.status(404).json({ error: 'Услуга не найдена' });
    res.json(service);
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

router.post('/', requireAuth, async (req, res) => {
  try {
    const clientId = req.user.clientId || '';
    const { name, description, duration, price, color, status } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ error: 'Название услуги обязательно' });
    if (name.length > 100) return res.status(400).json({ error: 'Название не более 100 символов' });

    const id = uuid();
    const count = await db.prepare("SELECT COUNT(*) as cnt FROM services WHERE client_id = ?").get(clientId);
    const assignedColor = color || SERVICE_COLORS[count.cnt % SERVICE_COLORS.length];

    await db.prepare(
      `INSERT INTO services (id, client_id, name, description, duration, price, color, status, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(id, clientId, name.trim(), (description || '').slice(0, 500), duration || 60, price || 0, assignedColor, status || 'active', count.cnt);

    await logAction({ clientId, userId: req.user.id, username: req.user.username, action: 'service_created', entityType: 'service', entityId: id, details: name });

    const created = await db.prepare("SELECT * FROM services WHERE id = ?").get(id);
    emitAsync('service.created', { ...created, client_id: clientId });
    res.status(201).json(created);
  } catch (err) {
    console.error('Create service error:', err);
    res.status(500).json({ error: 'Ошибка создания услуги' });
  }
});

router.put('/:id', requireAuth, async (req, res) => {
  try {
    const clientId = req.user.clientId || '';
    const { name, description, duration, price, color, status, sort_order } = req.body;

    const existing = await db.prepare("SELECT * FROM services WHERE id = ? AND client_id = ?").get(req.params.id, clientId);
    if (!existing) return res.status(404).json({ error: 'Услуга не найдена' });

    if (name !== undefined && name.length > 100) return res.status(400).json({ error: 'Название не более 100 символов' });

    await db.prepare(
      `UPDATE services SET
        name = COALESCE(?, name),
        description = COALESCE(?, description),
        duration = COALESCE(?, duration),
        price = COALESCE(?, price),
        color = COALESCE(?, color),
        status = COALESCE(?, status),
        sort_order = COALESCE(?, sort_order),
        updated_at = NOW()
      WHERE id = ? AND client_id = ?`
    ).run(name ?? null, description ?? null, duration ?? null, price ?? null, color ?? null, status ?? null, sort_order ?? null, req.params.id, clientId);

    await logAction({ clientId, userId: req.user.id, username: req.user.username, action: 'service_updated', entityType: 'service', entityId: req.params.id, details: name || existing.name });

    const updated = await db.prepare("SELECT * FROM services WHERE id = ?").get(req.params.id);
    emitAsync('service.updated', { ...updated, client_id: clientId });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Ошибка обновления услуги' });
  }
});

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const clientId = req.user.clientId || '';
    const service = await db.prepare("SELECT * FROM services WHERE id = ? AND client_id = ?").get(req.params.id, clientId);
    if (!service) return res.status(404).json({ error: 'Услуга не найдена' });

    const appointments = await db.prepare(
      "SELECT COUNT(*) as cnt FROM appointments WHERE service_id = ? AND status != 'canceled'"
    ).get(req.params.id);

    if (appointments.cnt > 0) {
      return res.status(409).json({ error: `Невозможно удалить: ${appointments.cnt} активных записей связано с этой услугой` });
    }

    await db.prepare("DELETE FROM services WHERE id = ? AND client_id = ?").run(req.params.id, clientId);

    await logAction({ clientId, userId: req.user.id, username: req.user.username, action: 'service_deleted', entityType: 'service', entityId: req.params.id, details: service.name });

    emitAsync('service.deleted', { id: req.params.id, client_id: clientId, name: service.name });

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка удаления услуги' });
  }
});

module.exports = router;

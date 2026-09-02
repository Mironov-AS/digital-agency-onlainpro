const { Router } = require('express');
const { db } = require('../database');
const { requireAuth } = require('../../../../shared/middleware/auth');
const { logAction } = require('../services/logging');
const { emitAsync } = require('../services/webhooks');
const { v4: uuid } = require('uuid');

const router = Router();

router.get('/', requireAuth, async (req, res) => {
  try {
    const clientId = req.user.clientId || '';
    const { status } = req.query;
    let sql = 'SELECT * FROM specialists WHERE client_id = ?';
    const params = [clientId];
    if (status === 'active') { sql += ' AND is_active = TRUE'; }
    else if (status === 'inactive') { sql += ' AND is_active = FALSE'; }
    sql += ' ORDER BY name';
    const rows = await db.prepare(sql).all(...params);
    res.json(rows);
  } catch (err) {
    console.error('Get specialists error:', err);
    res.status(500).json({ error: 'Ошибка загрузки сотрудников' });
  }
});

router.get('/:id', requireAuth, async (req, res) => {
  try {
    const row = await db.prepare('SELECT * FROM specialists WHERE id = ? AND client_id = ?')
      .get(req.params.id, req.user.clientId || '');
    if (!row) return res.status(404).json({ error: 'Сотрудник не найден' });
    res.json(row);
  } catch (err) { res.status(500).json({ error: 'Ошибка сервера' }); }
});

router.post('/', requireAuth, async (req, res) => {
  try {
    const clientId = req.user.clientId || '';
    const { name, position } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ error: 'Имя сотрудника обязательно' });
    if (name.length > 200) return res.status(400).json({ error: 'Имя не более 200 символов' });

    const id = uuid();
    await db.prepare(
      'INSERT INTO specialists (id, client_id, name, position, is_active) VALUES (?, ?, ?, ?, TRUE)'
    ).run(id, clientId, name.trim(), (position || '').trim());

    await logAction({ clientId, userId: req.user.id, username: req.user.username, action: 'specialist_created', entityType: 'specialist', entityId: id, details: name.trim() });

    const created = await db.prepare('SELECT * FROM specialists WHERE id = ?').get(id);
    emitAsync('specialist.created', { ...created, client_id: clientId });
    res.status(201).json(created);
  } catch (err) {
    console.error('Create specialist error:', err);
    res.status(500).json({ error: 'Ошибка создания сотрудника' });
  }
});

router.put('/:id', requireAuth, async (req, res) => {
  try {
    const clientId = req.user.clientId || '';
    const existing = await db.prepare('SELECT * FROM specialists WHERE id = ? AND client_id = ?')
      .get(req.params.id, clientId);
    if (!existing) return res.status(404).json({ error: 'Сотрудник не найден' });

    const { name, position, is_active } = req.body;
    if (name !== undefined && !name.trim()) return res.status(400).json({ error: 'Имя сотрудника обязательно' });

    await db.prepare(
      'UPDATE specialists SET name = COALESCE(?, name), position = COALESCE(?, position), is_active = COALESCE(?, is_active) WHERE id = ? AND client_id = ?'
    ).run(name?.trim() ?? null, position?.trim() ?? null, is_active ?? null, req.params.id, clientId);

    await logAction({ clientId, userId: req.user.id, username: req.user.username, action: 'specialist_updated', entityType: 'specialist', entityId: req.params.id, details: name || existing.name });

    const updated = await db.prepare('SELECT * FROM specialists WHERE id = ?').get(req.params.id);
    emitAsync('specialist.updated', { ...updated, client_id: clientId });
    res.json(updated);
  } catch (err) {
    console.error('Update specialist error:', err);
    res.status(500).json({ error: 'Ошибка обновления сотрудника' });
  }
});

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const clientId = req.user.clientId || '';
    const existing = await db.prepare('SELECT * FROM specialists WHERE id = ? AND client_id = ?')
      .get(req.params.id, clientId);
    if (!existing) return res.status(404).json({ error: 'Сотрудник не найден' });

    const usedCount = await db.prepare(
      "SELECT COUNT(*) as cnt FROM appointments WHERE specialist_id = ? AND client_id = ? AND status != 'canceled'"
    ).get(req.params.id, clientId);

    if (usedCount.cnt > 0) {
      await db.prepare('UPDATE specialists SET is_active = FALSE WHERE id = ? AND client_id = ?')
        .run(req.params.id, clientId);
      await logAction({ clientId, userId: req.user.id, username: req.user.username, action: 'specialist_deactivated', entityType: 'specialist', entityId: req.params.id });
      const updated = await db.prepare('SELECT * FROM specialists WHERE id = ?').get(req.params.id);
      return res.json({ ok: true, deactivated: true, specialist: updated });
    }

    await db.prepare('DELETE FROM specialists WHERE id = ? AND client_id = ?').run(req.params.id, clientId);
    await logAction({ clientId, userId: req.user.id, username: req.user.username, action: 'specialist_deleted', entityType: 'specialist', entityId: req.params.id });
    emitAsync('specialist.deleted', { id: req.params.id, client_id: clientId });
    res.json({ ok: true });
  } catch (err) {
    console.error('Delete specialist error:', err);
    res.status(500).json({ error: 'Ошибка удаления сотрудника' });
  }
});

module.exports = router;

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
    const includeInactive = req.query.include_inactive === 'true';
    const where = includeInactive
      ? 'WHERE client_id = $1'
      : 'WHERE client_id = $1 AND is_active = TRUE';
    const { rows } = await db.pool.query(
      `SELECT * FROM recommendations ${where} ORDER BY sort_order, name`, [clientId],
    );
    res.json(rows);
  } catch (err) {
    console.error('[crm] GET /recommendations', err);
    res.status(500).json({ error: 'Ошибка при получении рекомендаций' });
  }
});

router.post('/', requireAuth, async (req, res) => {
  try {
    const clientId = getClientId(req);
    const { name, sort_order } = req.body;

    if (!name || !name.trim()) return res.status(400).json({ error: 'Название обязательно' });

    const duplicate = await db.pool.query(
      'SELECT id FROM recommendations WHERE client_id = $1 AND LOWER(name) = LOWER($2) AND is_active = TRUE',
      [clientId, name.trim()],
    );
    if (duplicate.rows.length) return res.status(400).json({ error: 'Рекомендация с таким названием уже существует' });

    const id = uuidv4();
    await db.prepare(`
      INSERT INTO recommendations (id, client_id, name, sort_order)
      VALUES (?, ?, ?, ?)
    `).run(id, clientId, name.trim(), sort_order || 0);

    const created = await db.prepare('SELECT * FROM recommendations WHERE id = ?').get(id);
    res.status(201).json(created);
  } catch (err) {
    console.error('[crm] POST /recommendations', err);
    res.status(500).json({ error: 'Ошибка при создании рекомендации' });
  }
});

router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { name, sort_order } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ error: 'Название обязательно' });

    const rec = await db.prepare('SELECT * FROM recommendations WHERE id = ?').get(req.params.id);
    if (!rec) return res.status(404).json({ error: 'Рекомендация не найдена' });

    const clientId = getClientId(req);
    const duplicate = await db.pool.query(
      'SELECT id FROM recommendations WHERE client_id = $1 AND LOWER(name) = LOWER($2) AND is_active = TRUE AND id != $3',
      [clientId, name.trim(), req.params.id],
    );
    if (duplicate.rows.length) return res.status(400).json({ error: 'Рекомендация с таким названием уже существует' });

    await db.prepare(`
      UPDATE recommendations SET name = ?, sort_order = ? WHERE id = ?
    `).run(name.trim(), sort_order ?? rec.sort_order, req.params.id);

    const updated = await db.prepare('SELECT * FROM recommendations WHERE id = ?').get(req.params.id);
    res.json(updated);
  } catch (err) {
    console.error('[crm] PUT /recommendations/:id', err);
    res.status(500).json({ error: 'Ошибка при обновлении рекомендации' });
  }
});

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    await db.prepare('UPDATE recommendations SET is_active = FALSE WHERE id = ?').run(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    console.error('[crm] DELETE /recommendations/:id', err);
    res.status(500).json({ error: 'Ошибка при удалении рекомендации' });
  }
});

router.post('/:id/restore', requireAuth, async (req, res) => {
  try {
    await db.prepare('UPDATE recommendations SET is_active = TRUE WHERE id = ?').run(req.params.id);
    const restored = await db.prepare('SELECT * FROM recommendations WHERE id = ?').get(req.params.id);
    res.json(restored);
  } catch (err) {
    console.error('[crm] POST /recommendations/:id/restore', err);
    res.status(500).json({ error: 'Ошибка при восстановлении рекомендации' });
  }
});

module.exports = router;

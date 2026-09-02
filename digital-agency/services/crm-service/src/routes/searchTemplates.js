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
    const rows = await db.prepare(
      'SELECT * FROM search_templates WHERE client_id = ? ORDER BY name',
    ).all(clientId);
    rows.forEach(r => {
      if (r.config) try { r.config = JSON.parse(r.config); } catch { r.config = {}; }
    });
    res.json(rows);
  } catch (err) {
    console.error('[crm] GET /search-templates', err);
    res.status(500).json({ error: 'Ошибка при получении шаблонов' });
  }
});

router.post('/', requireAuth, async (req, res) => {
  try {
    const clientId = getClientId(req);
    const { name, config } = req.body;
    if (!name) return res.status(400).json({ error: 'Название обязательно' });

    const id = uuidv4();
    await db.prepare(
      'INSERT INTO search_templates (id, client_id, name, config) VALUES (?, ?, ?, ?)',
    ).run(id, clientId, name, JSON.stringify(config || {}));

    const created = await db.prepare('SELECT * FROM search_templates WHERE id = ?').get(id);
    if (created.config) try { created.config = JSON.parse(created.config); } catch { created.config = {}; }
    res.status(201).json(created);
  } catch (err) {
    console.error('[crm] POST /search-templates', err);
    res.status(500).json({ error: 'Ошибка при создании шаблона' });
  }
});

router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { name, config } = req.body;
    if (!name) return res.status(400).json({ error: 'Название обязательно' });

    const existing = await db.prepare('SELECT * FROM search_templates WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Шаблон не найден' });

    await db.prepare(
      'UPDATE search_templates SET name = ?, config = ? WHERE id = ?',
    ).run(name, JSON.stringify(config || {}), req.params.id);

    const updated = await db.prepare('SELECT * FROM search_templates WHERE id = ?').get(req.params.id);
    if (updated.config) try { updated.config = JSON.parse(updated.config); } catch { updated.config = {}; }
    res.json(updated);
  } catch (err) {
    console.error('[crm] PUT /search-templates/:id', err);
    res.status(500).json({ error: 'Ошибка при обновлении шаблона' });
  }
});

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { changes } = await db.prepare('DELETE FROM search_templates WHERE id = ?').run(req.params.id);
    if (!changes) return res.status(404).json({ error: 'Шаблон не найден' });
    res.json({ ok: true });
  } catch (err) {
    console.error('[crm] DELETE /search-templates/:id', err);
    res.status(500).json({ error: 'Ошибка при удалении шаблона' });
  }
});

module.exports = router;

const { Router } = require('express');
const { db } = require('../database');
const { requireAuth } = require('../../../../shared/middleware/auth');

const router = Router();

router.get('/', requireAuth, async (req, res) => {
  try {
    const clientId = req.user.clientId || '';
    const { limit = 100, offset = 0 } = req.query;
    const logs = await db.prepare(
      "SELECT * FROM action_logs WHERE client_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?"
    ).all(clientId, Number(limit), Number(offset));
    res.json(logs);
  } catch (err) { res.status(500).json({ error: 'Ошибка загрузки логов' }); }
});

module.exports = router;

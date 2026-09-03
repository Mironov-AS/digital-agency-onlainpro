const express = require('express');
const { db } = require('../database');
const { requireAuth } = require('../../../../shared/middleware/auth');

const router = express.Router();
router.use(requireAuth);

// GET /api/audit — admin and director only
router.get('/', async (req, res) => {
  try {
    const clientId = req.user.clientId || null;
    const limit = Math.min(parseInt(req.query.limit) || 50, 200);
    const offset = parseInt(req.query.offset) || 0;

    let rows, totalRow;
    if (clientId) {
      // Client users see only audit logs from their own users
      rows = await db.all(`
        SELECT al.* FROM audit_log al
        JOIN users u ON al.user_id = u.id
        WHERE u.client_id = $1
        ORDER BY al.created_at DESC LIMIT $2 OFFSET $3
      `, [clientId, limit, offset]);
      totalRow = await db.get(`
        SELECT COUNT(*) as cnt FROM audit_log al
        JOIN users u ON al.user_id = u.id
        WHERE u.client_id = $1
      `, [clientId]);
    } else {
      rows = await db.all('SELECT * FROM audit_log ORDER BY created_at DESC LIMIT $1 OFFSET $2', [limit, offset]);
      totalRow = await db.get('SELECT COUNT(*) as cnt FROM audit_log');
    }
    const total = parseInt(totalRow.cnt);

    res.json({
      data: rows.map(r => ({
        id: r.id,
        user: r.user_name,
        action: r.action,
        entity: r.entity_type,
        entityId: r.entity_id,
        date: r.created_at,
        ip: r.ip,
      })),
      total,
      limit,
      offset,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/audit/counterparties
router.get('/counterparties', async (req, res) => {
  try {
    const clientId = req.user.clientId || null;
    const rows = clientId
      ? await db.all('SELECT * FROM counterparties WHERE client_id = $1 ORDER BY name', [clientId])
      : await db.all('SELECT * FROM counterparties ORDER BY name');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

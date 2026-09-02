const express = require('express');
const { db } = require('../database');
const { requireAuth } = require('../../../../shared/middleware/auth');

const router = express.Router();
router.use(requireAuth);

// GET /api/settings — get all settings (scoped to client)
router.get('/', async (req, res) => {
  try {
    const clientId = req.user.clientId || null;
    // Settings are stored as key-value pairs. Client-scoped settings use prefix "client_{clientId}:"
    const prefix = clientId ? `client_${clientId}:` : null;
    const rows = await db.all('SELECT key, value FROM app_settings');
    const settings = {};
    for (const row of rows) {
      if (prefix && row.key.startsWith(prefix)) {
        // Strip prefix for client-scoped settings
        settings[row.key.slice(prefix.length)] = row.value;
      } else if (!prefix || !row.key.startsWith('client_')) {
        // Global settings visible to admin or when no clientId
        settings[row.key] = row.value;
      }
    }
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/settings — update settings
router.put('/', async (req, res) => {
  try {
    const clientId = req.user.clientId || null;
    const prefix = clientId ? `client_${clientId}:` : '';
    const allowed = ['company_name'];
    await db.transaction(async (client) => {
      for (const [key, value] of Object.entries(req.body)) {
        if (allowed.includes(key)) {
          const fullKey = `${prefix}${key}`;
          await client.run(
            'INSERT INTO app_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value',
            [fullKey, String(value ?? '')]
          );
        }
      }
    });
    // Re-read settings with same logic
    const rows = await db.all('SELECT key, value FROM app_settings');
    const settings = {};
    const p = clientId ? `client_${clientId}:` : null;
    for (const row of rows) {
      if (p && row.key.startsWith(p)) {
        settings[row.key.slice(p.length)] = row.value;
      } else if (!p || !row.key.startsWith('client_')) {
        settings[row.key] = row.value;
      }
    }
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

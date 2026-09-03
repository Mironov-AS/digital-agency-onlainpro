const { Router } = require('express');
const { getClientSetting, setClientSetting } = require('../database');
const { requireAuth } = require('../../../../shared/middleware/auth');
const { logAction } = require('../services/logging');

const router = Router();

const ALLOWED_KEYS = ['self_booking_confirmation', 'display_board_interval', 'working_hours_start', 'working_hours_end', 'working_days'];

router.get('/public/:clientId', async (req, res) => {
  try {
    const clientId = req.params.clientId === 'default' ? '' : req.params.clientId;
    const interval = await getClientSetting('display_board_interval', clientId, 'day');
    const workStart = await getClientSetting('working_hours_start', clientId, '08:00');
    const workEnd = await getClientSetting('working_hours_end', clientId, '21:00');
    const workDays = await getClientSetting('working_days', clientId, '1,2,3,4,5,6');
    res.json({ display_board_interval: interval, working_hours_start: workStart, working_hours_end: workEnd, working_days: workDays });
  } catch (err) {
    res.json({ display_board_interval: 'day', working_hours_start: '08:00', working_hours_end: '21:00', working_days: '1,2,3,4,5,6' });
  }
});

router.get('/', requireAuth, async (req, res) => {
  try {
    const clientId = req.user.clientId || '';
    const result = {};
    const DEFAULTS = { self_booking_confirmation: 'false', display_board_interval: 'day', working_hours_start: '08:00', working_hours_end: '21:00', working_days: '1,2,3,4,5,6' };
    for (const key of ALLOWED_KEYS) {
      result[key] = await getClientSetting(key, clientId, DEFAULTS[key] || 'false');
    }
    res.json(result);
  } catch (err) {
    console.error('Get settings error:', err);
    res.status(500).json({ error: 'Ошибка загрузки настроек' });
  }
});

router.put('/', requireAuth, async (req, res) => {
  try {
    const clientId = req.user.clientId || '';
    const updates = req.body;

    for (const [key, value] of Object.entries(updates)) {
      if (!ALLOWED_KEYS.includes(key)) continue;
      await setClientSetting(key, String(value), clientId);
    }

    await logAction({
      clientId,
      userId: req.user.id,
      username: req.user.username,
      action: 'settings_updated',
      entityType: 'settings',
      entityId: '',
      details: JSON.stringify(updates),
    });

    const result = {};
    for (const key of ALLOWED_KEYS) {
      result[key] = await getClientSetting(key, clientId, 'false');
    }
    res.json(result);
  } catch (err) {
    console.error('Update settings error:', err);
    res.status(500).json({ error: 'Ошибка сохранения настроек' });
  }
});

module.exports = router;

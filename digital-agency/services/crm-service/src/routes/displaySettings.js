const { Router } = require('express');
const { v4: uuidv4 } = require('uuid');
const { requireAuth } = require('../../../../shared/middleware/auth');
const { db } = require('../db');

const router = Router();

const ALL_STANDARD_FIELDS = [
  { key: 'full_name', label: 'ФИО', always: true },
  { key: 'phone', label: 'Телефон' },
  { key: 'email', label: 'E-mail' },
  { key: 'additional_contacts', label: 'Доп. контакты' },
  { key: 'notes', label: 'Примечания' },
  { key: 'created_at', label: 'Дата создания' },
];

const DEFAULT_COLUMNS = ['full_name', 'phone', 'email', 'created_at'];
const CRM_MODES = ['services', 'sales', 'both'];

function getClientId(req) {
  if (req.user.role === 'admin') return req.query.client_id || req.body?.client_id || '';
  return req.user.clientId || '';
}

router.get('/', requireAuth, async (req, res) => {
  try {
    const clientId = getClientId(req);
    const row = await db.prepare('SELECT * FROM display_settings WHERE client_id = ?').get(clientId);

    const customFields = await db.prepare(
      'SELECT id, name, field_type FROM custom_fields WHERE client_id = ? AND is_deleted = FALSE ORDER BY sort_order, name',
    ).all(clientId);

    const config = row ? (typeof row.config === 'string' ? JSON.parse(row.config) : row.config) : {};
    const rawColumns = config.columns || DEFAULT_COLUMNS;

    const validKeys = new Set([
      ...ALL_STANDARD_FIELDS.map(f => f.key),
      ...customFields.map(f => `cf_${f.id}`),
    ]);
    const columns = rawColumns.filter(k => validKeys.has(k));

    res.json({
      columns: columns.length ? columns : DEFAULT_COLUMNS,
      crm_mode: CRM_MODES.includes(config.crm_mode) ? config.crm_mode : 'both',
      booking_integration_enabled: config.booking_integration_enabled !== false,
      available_standard: ALL_STANDARD_FIELDS,
      available_custom: customFields.map(f => ({ key: `cf_${f.id}`, label: f.name, field_type: f.field_type })),
    });
  } catch (err) {
    console.error('[crm] GET /display-settings', err);
    res.status(500).json({ error: 'Ошибка при получении настроек отображения' });
  }
});

router.put('/', requireAuth, async (req, res) => {
  try {
    const clientId = getClientId(req);
    const { columns, crm_mode } = req.body;
    const existingRow = await db.prepare('SELECT * FROM display_settings WHERE client_id = ?').get(clientId);
    const existingConfig = existingRow
      ? (typeof existingRow.config === 'string' ? JSON.parse(existingRow.config) : existingRow.config)
      : {};

    let nextColumns = Array.isArray(columns) ? [...columns] : (existingConfig.columns || DEFAULT_COLUMNS);
    if (!Array.isArray(nextColumns) || nextColumns.length === 0) {
      return res.status(400).json({ error: 'Нужно выбрать хотя бы одно поле' });
    }

    if (!nextColumns.includes('full_name')) {
      nextColumns.unshift('full_name');
    }

    const nextMode = CRM_MODES.includes(crm_mode) ? crm_mode : (CRM_MODES.includes(existingConfig.crm_mode) ? existingConfig.crm_mode : 'both');
    const nextBookingEnabled = req.body.booking_integration_enabled !== undefined
      ? !!req.body.booking_integration_enabled
      : (existingConfig.booking_integration_enabled !== false);
    const config = JSON.stringify({ ...existingConfig, columns: nextColumns, crm_mode: nextMode, booking_integration_enabled: nextBookingEnabled });

    if (existingRow) {
      await db.pool.query(
        'UPDATE display_settings SET config = $1::jsonb, updated_at = NOW() WHERE client_id = $2',
        [config, clientId],
      );
    } else {
      await db.pool.query(
        'INSERT INTO display_settings (id, client_id, config) VALUES ($1, $2, $3::jsonb)',
        [uuidv4(), clientId, config],
      );
    }

    res.json({ ok: true, columns: nextColumns, crm_mode: nextMode, booking_integration_enabled: nextBookingEnabled });
  } catch (err) {
    console.error('[crm] PUT /display-settings', err);
    res.status(500).json({ error: 'Ошибка при сохранении настроек отображения' });
  }
});

module.exports = router;

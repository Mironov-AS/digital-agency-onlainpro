const createPgDb = require('../../../shared/db');

const db = createPgDb(process.env.DATABASE_URL);

async function initDb() {
  await db.ensureSchema();

  await db.exec(`
    CREATE TABLE IF NOT EXISTS services (
      id TEXT PRIMARY KEY,
      client_id TEXT NOT NULL DEFAULT '',
      name TEXT NOT NULL,
      description TEXT DEFAULT '',
      duration INTEGER NOT NULL DEFAULT 60,
      price NUMERIC(10,2) DEFAULT 0,
      color TEXT DEFAULT '#3b82f6',
      status TEXT DEFAULT 'active',
      sort_order INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS specialists (
      id TEXT PRIMARY KEY,
      client_id TEXT NOT NULL DEFAULT '',
      name TEXT NOT NULL,
      position TEXT DEFAULT '',
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS appointments (
      id TEXT PRIMARY KEY,
      client_id TEXT NOT NULL DEFAULT '',
      service_id TEXT NOT NULL REFERENCES services(id),
      specialist_id TEXT REFERENCES specialists(id),
      appointment_date DATE NOT NULL,
      appointment_time TIME NOT NULL,
      end_time TIME NOT NULL,
      vehicle_number TEXT DEFAULT '',
      phone TEXT DEFAULT '',
      customer_name TEXT DEFAULT '',
      comment TEXT DEFAULT '',
      status TEXT DEFAULT 'confirmed',
      created_by TEXT DEFAULT '',
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      client_id TEXT NOT NULL DEFAULT '',
      username TEXT NOT NULL,
      password TEXT NOT NULL,
      display_name TEXT DEFAULT '',
      role TEXT DEFAULT 'operator',
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS action_logs (
      id SERIAL PRIMARY KEY,
      client_id TEXT NOT NULL DEFAULT '',
      user_id TEXT DEFAULT '',
      username TEXT DEFAULT '',
      action TEXT NOT NULL,
      entity_type TEXT DEFAULT '',
      entity_id TEXT DEFAULT '',
      details TEXT DEFAULT '',
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS settings (
      id SERIAL PRIMARY KEY,
      client_id TEXT NOT NULL DEFAULT '',
      key TEXT NOT NULL,
      value TEXT DEFAULT '',
      UNIQUE(client_id, key)
    );
  `);

  await db.exec(`
    CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
    CREATE INDEX IF NOT EXISTS idx_appointments_client_date ON appointments(client_id, appointment_date);
    CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
    CREATE INDEX IF NOT EXISTS idx_services_client ON services(client_id);
    CREATE INDEX IF NOT EXISTS idx_specialists_client ON specialists(client_id);
    CREATE INDEX IF NOT EXISTS idx_action_logs_client ON action_logs(client_id);
    CREATE INDEX IF NOT EXISTS idx_users_client ON users(client_id);
  `);

  await runMigrations();
  await seedDefaults();
}

async function runMigrations() {
  await db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version INTEGER PRIMARY KEY,
      applied_at TIMESTAMP DEFAULT NOW()
    );
  `);

  const applied = await db.prepare("SELECT version FROM schema_migrations").all();
  const appliedSet = new Set(applied.map(r => r.version));

  if (!appliedSet.has(100)) {
    await db.exec(`
      ALTER TABLE appointments ADD COLUMN IF NOT EXISTS canceled_at TIMESTAMP;
      ALTER TABLE appointments ADD COLUMN IF NOT EXISTS canceled_by TEXT DEFAULT '';
    `);
    await db.prepare("INSERT INTO schema_migrations (version) VALUES (?)").run(100);
  }

  if (!appliedSet.has(101)) {
    await db.exec(`
      ALTER TABLE appointments ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'admin';
    `);
    await db.prepare("INSERT INTO schema_migrations (version) VALUES (?)").run(101);
  }
}

async function seedDefaults() {
  const admin = await db.prepare("SELECT id FROM users WHERE username = 'admin' AND client_id = ''").get();
  if (!admin) {
    const bcrypt = require('bcryptjs');
    const { v4: uuid } = require('uuid');
    const hash = await bcrypt.hash('admin123456', 10);
    await db.prepare(
      "INSERT INTO users (id, client_id, username, password, display_name, role) VALUES (?, '', 'admin', ?, 'Администратор', 'admin')"
    ).run(uuid(), hash);
  }
}

async function getClientSetting(key, clientId, defaultValue = null) {
  if (clientId) {
    const row = await db.prepare("SELECT value FROM settings WHERE key = ? AND client_id = ?").get(key, clientId);
    if (row) return row.value;
  }
  const globalRow = await db.prepare("SELECT value FROM settings WHERE key = ? AND client_id = ''").get(key);
  return globalRow?.value ?? defaultValue;
}

async function setClientSetting(key, value, clientId = '') {
  await db.prepare(`
    INSERT INTO settings (client_id, key, value) VALUES (?, ?, ?)
    ON CONFLICT (client_id, key) DO UPDATE SET value = EXCLUDED.value
  `).run(clientId, key, value);
}

module.exports = { db, initDb, getClientSetting, setClientSetting };

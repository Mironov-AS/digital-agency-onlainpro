const createPgDb = require('../../../shared/db');

const pgDb = createPgDb(process.env.DATABASE_URL);

const db = {
  async get(sql, params = []) {
    const { rows } = await pgDb.pool.query(sql, params);
    return rows[0] || null;
  },
  async all(sql, params = []) {
    const { rows } = await pgDb.pool.query(sql, params);
    return rows;
  },
  async run(sql, params = []) {
    const result = await pgDb.pool.query(sql, params);
    return { changes: result.rowCount };
  },
  async runReturning(sql, params = []) {
    const s = sql.trimEnd().replace(/;$/, '') + ' RETURNING id';
    const result = await pgDb.pool.query(s, params);
    return { lastInsertRowid: result.rows[0]?.id };
  },
  async transaction(fn) {
    const client = await pgDb.pool.connect();
    try {
      await client.query('BEGIN');
      const txClient = {
        get: async (sql, params = []) => { const r = await client.query(sql, params); return r.rows[0] || null; },
        all: async (sql, params = []) => { const r = await client.query(sql, params); return r.rows; },
        run: async (sql, params = []) => { const r = await client.query(sql, params); return { changes: r.rowCount }; },
        runReturning: async (sql, params = []) => {
          const s = sql.trimEnd().replace(/;$/, '') + ' RETURNING id';
          const r = await client.query(s, params);
          return { lastInsertRowid: r.rows[0]?.id };
        },
      };
      const result = await fn(txClient);
      await client.query('COMMIT');
      return result;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },
  prepare: pgDb.prepare.bind(pgDb),
  exec: pgDb.exec.bind(pgDb),
  ensureSchema: pgDb.ensureSchema.bind(pgDb),
};

async function initDb() {
  await db.ensureSchema();

  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL,
      position TEXT,
      active INTEGER DEFAULT 1,
      mfa_enabled INTEGER DEFAULT 0,
      mfa_secret TEXT,
      last_login TEXT,
      failed_attempts INTEGER DEFAULT 0,
      locked_until TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS refresh_tokens (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token TEXT UNIQUE NOT NULL,
      expires_at TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS counterparties (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      inn TEXT,
      kpp TEXT,
      address TEXT,
      contact TEXT,
      phone TEXT,
      email TEXT,
      priority TEXT DEFAULT 'medium',
      delivery_address TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS contracts (
      id SERIAL PRIMARY KEY,
      number TEXT UNIQUE NOT NULL,
      counterparty_id INTEGER REFERENCES counterparties(id),
      date TEXT,
      valid_until TEXT,
      status TEXT DEFAULT 'draft',
      amount REAL DEFAULT 0,
      subject TEXT,
      payment_delay INTEGER DEFAULT 30,
      penalty_rate REAL DEFAULT 0.1,
      file_name TEXT,
      created_by INTEGER REFERENCES users(id),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS contract_conditions (
      id SERIAL PRIMARY KEY,
      contract_id INTEGER NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
      text TEXT NOT NULL,
      fulfilled INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS contract_obligations (
      id SERIAL PRIMARY KEY,
      contract_id INTEGER NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
      party TEXT NOT NULL,
      text TEXT NOT NULL,
      deadline TEXT,
      status TEXT DEFAULT 'pending'
    );

    CREATE TABLE IF NOT EXISTS contract_versions (
      id SERIAL PRIMARY KEY,
      contract_id INTEGER NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
      version_num INTEGER NOT NULL,
      date TEXT NOT NULL,
      author TEXT,
      changes TEXT
    );

    CREATE TABLE IF NOT EXISTS contract_files (
      id SERIAL PRIMARY KEY,
      contract_id INTEGER NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
      original_name TEXT NOT NULL,
      stored_name TEXT NOT NULL,
      mimetype TEXT,
      size INTEGER DEFAULT 0,
      uploaded_by INTEGER REFERENCES users(id),
      uploaded_by_name TEXT,
      content_text TEXT,
      uploaded_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS orders (
      id SERIAL PRIMARY KEY,
      number TEXT UNIQUE NOT NULL,
      contract_id INTEGER REFERENCES contracts(id),
      counterparty_id INTEGER REFERENCES counterparties(id),
      date TEXT,
      shipment_deadline TEXT,
      priority TEXT DEFAULT 'medium',
      status TEXT DEFAULT 'planned',
      total_amount REAL DEFAULT 0,
      notes TEXT,
      created_by INTEGER,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id SERIAL PRIMARY KEY,
      order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      article TEXT,
      quantity INTEGER DEFAULT 0,
      price REAL DEFAULT 0,
      category TEXT,
      status TEXT DEFAULT 'planned',
      shipped INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS shipments (
      id SERIAL PRIMARY KEY,
      order_id INTEGER REFERENCES orders(id),
      order_number TEXT,
      counterparty_id INTEGER REFERENCES counterparties(id),
      date TEXT,
      invoice_number TEXT,
      amount REAL DEFAULT 0,
      status TEXT DEFAULT 'shipped',
      payment_due_date TEXT,
      paid_amount REAL DEFAULT 0,
      paid_date TEXT,
      delivery_type TEXT DEFAULT 'pickup',
      delivery_address TEXT,
      scheduled_date TEXT
    );

    CREATE TABLE IF NOT EXISTS shipment_items (
      id SERIAL PRIMARY KEY,
      shipment_id INTEGER NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
      order_item_id INTEGER,
      name TEXT,
      quantity INTEGER DEFAULT 0,
      price REAL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS payments (
      id SERIAL PRIMARY KEY,
      shipment_id INTEGER REFERENCES shipments(id),
      counterparty_id INTEGER REFERENCES counterparties(id),
      amount REAL DEFAULT 0,
      due_date TEXT,
      paid_date TEXT,
      status TEXT DEFAULT 'pending',
      invoice_number TEXT,
      penalty_days INTEGER DEFAULT 0,
      penalty_amount REAL DEFAULT 0,
      invoice_id INTEGER
    );

    CREATE TABLE IF NOT EXISTS claims (
      id SERIAL PRIMARY KEY,
      number TEXT UNIQUE NOT NULL,
      contract_id INTEGER REFERENCES contracts(id),
      shipment_id INTEGER REFERENCES shipments(id),
      counterparty_id INTEGER,
      order_item_id INTEGER,
      date TEXT,
      deadline TEXT,
      description TEXT,
      status TEXT DEFAULT 'open',
      responsible TEXT,
      resolution TEXT,
      pause_payments INTEGER DEFAULT 0,
      affected_payment_id INTEGER,
      created_by INTEGER,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS production_tasks (
      id SERIAL PRIMARY KEY,
      order_id INTEGER REFERENCES orders(id),
      order_number TEXT,
      name TEXT,
      line_id INTEGER,
      start_date TEXT,
      end_date TEXT,
      progress INTEGER DEFAULT 0,
      status TEXT DEFAULT 'planned',
      responsible TEXT,
      priority TEXT DEFAULT 'medium',
      color TEXT DEFAULT '#3b82f6'
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      type TEXT DEFAULT 'info',
      title TEXT,
      text TEXT,
      date TEXT,
      read INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS chat_messages (
      id SERIAL PRIMARY KEY,
      contract_id INTEGER REFERENCES contracts(id),
      counterparty_id INTEGER,
      from_type TEXT,
      author TEXT,
      text TEXT,
      date TEXT,
      read INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS audit_log (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id),
      user_name TEXT,
      action TEXT,
      entity_type TEXT,
      entity_id INTEGER,
      ip TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS invoices (
      id SERIAL PRIMARY KEY,
      order_id INTEGER REFERENCES orders(id),
      invoice_number TEXT,
      amount REAL DEFAULT 0,
      paid_amount REAL DEFAULT 0,
      status TEXT DEFAULT 'pending',
      due_date TEXT,
      counterparty_id INTEGER REFERENCES counterparties(id),
      notes TEXT,
      invoice_date TEXT,
      is_active INTEGER DEFAULT 1,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS drivers (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT,
      vehicle TEXT,
      active INTEGER DEFAULT 1,
      license TEXT,
      vehicle_brand TEXT,
      vehicle_model TEXT,
      vehicle_year TEXT,
      vehicle_notes TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS delivery_routes (
      id SERIAL PRIMARY KEY,
      driver_id INTEGER REFERENCES drivers(id),
      route_date TEXT NOT NULL,
      status TEXT DEFAULT 'planned',
      notes TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS route_shipments (
      id SERIAL PRIMARY KEY,
      route_id INTEGER NOT NULL REFERENCES delivery_routes(id) ON DELETE CASCADE,
      shipment_id INTEGER NOT NULL REFERENCES shipments(id),
      delivery_order INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS password_reset_tokens (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token TEXT UNIQUE NOT NULL,
      expires_at TEXT NOT NULL,
      used INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS app_settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );

    CREATE TABLE IF NOT EXISTS llm_providers (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      provider_type TEXT NOT NULL DEFAULT 'openai',
      api_key TEXT,
      base_url TEXT,
      model TEXT,
      temperature REAL DEFAULT 0.7,
      max_tokens INTEGER DEFAULT 4000,
      is_active INTEGER DEFAULT 0,
      extra_config TEXT DEFAULT '{}',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  // Multi-tenant migration: add client_id to business tables
  const tenantTables = [
    'counterparties', 'contracts', 'orders', 'invoices', 'payments',
    'shipments', 'claims', 'production_tasks', 'drivers', 'delivery_routes', 'chat_messages',
  ];
  for (const table of tenantTables) {
    await db.exec(`ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS client_id TEXT`).catch(() => {});
  }

  const existingCo = await db.prepare("SELECT value FROM app_settings WHERE key = 'company_name'").get();
  if (!existingCo) {
    await db.prepare("INSERT INTO app_settings (key, value) VALUES (?, '')").run('company_name');
  }

  await seedDefaultUser();
}

async function seedDefaultUser() {
  const admin = await db.prepare("SELECT id FROM users WHERE email = 'admin@erp.local'").get();
  if (!admin) {
    const bcrypt = require('bcryptjs');
    const hash = await bcrypt.hash('password123', 10);
    await db.prepare(
      "INSERT INTO users (name, email, password_hash, role, position) VALUES (?, ?, ?, ?, ?)"
    ).run('Администратор ERP', 'admin@erp.local', hash, 'admin', 'Администратор');
  }
}

function logAudit(userId, userName, action, entityType, entityId, ip) {
  db.prepare(
    'INSERT INTO audit_log (user_id, user_name, action, entity_type, entity_id, ip) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(userId || null, userName || '', action, entityType, entityId || null, ip || null)
    .catch(err => console.warn('Audit log failed:', err.message));
}

module.exports = { db, initDb, logAudit };

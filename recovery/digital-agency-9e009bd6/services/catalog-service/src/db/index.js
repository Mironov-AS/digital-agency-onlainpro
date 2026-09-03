const { v4: uuidv4 } = require('uuid');
const createPgDb = require('../../../../shared/db');

const db = createPgDb(process.env.DATABASE_URL);

async function initDb() {
  await db.ensureSchema();
  await db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id         TEXT PRIMARY KEY,
      value      TEXT NOT NULL UNIQUE,
      label      TEXT NOT NULL,
      color      TEXT NOT NULL DEFAULT '#3b82f6',
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS services (
      id          TEXT PRIMARY KEY,
      title       TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      price       DOUBLE PRECISION DEFAULT NULL,
      price_type  TEXT NOT NULL DEFAULT 'from',
      price_label TEXT DEFAULT NULL,
      photo_url   TEXT DEFAULT NULL,
      category    TEXT NOT NULL DEFAULT 'websites',
      is_active   BOOLEAN NOT NULL DEFAULT TRUE,
      sort_order  INTEGER NOT NULL DEFAULT 0,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS cost_types (
      id          TEXT PRIMARY KEY,
      name        TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      sort_order  INTEGER NOT NULL DEFAULT 0,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS service_costs (
      id          TEXT PRIMARY KEY,
      service_id  TEXT NOT NULL REFERENCES services(id) ON DELETE CASCADE,
      cost_name   TEXT NOT NULL,
      amount      DOUBLE PRECISION NOT NULL DEFAULT 0,
      period      TEXT NOT NULL DEFAULT 'monthly',
      note        TEXT NOT NULL DEFAULT '',
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_services_category ON services(category);
    CREATE INDEX IF NOT EXISTS idx_services_is_active ON services(is_active);
  `);

  // Seed default cost types if empty
  const { rows: ctRows } = await db.pool.query('SELECT COUNT(*) as n FROM cost_types');
  if (parseInt(ctRows[0].n) === 0) {
    const stmt = db.prepare('INSERT INTO cost_types (id, name, description, sort_order) VALUES (?, ?, ?, ?)');
    await stmt.run(uuidv4(), 'Хостинг',        'Оплата хостинга для сайта', 0);
    await stmt.run(uuidv4(), 'Домен',           'Оплата доменного имени',    1);
    await stmt.run(uuidv4(), 'SSL-сертификат',  'Оплата SSL-сертификата',    2);
    await stmt.run(uuidv4(), 'Лицензия ПО',     'Лицензии на ПО',           3);
  }

  const { rows: catRows } = await db.pool.query('SELECT COUNT(*) as n FROM categories');
  if (parseInt(catRows[0].n) === 0) {
    const stmt = db.prepare('INSERT INTO categories (id, value, label, color, sort_order) VALUES (?, ?, ?, ?, ?)');
    await stmt.run(uuidv4(), 'websites',   'Цифровые продукты', '#3b82f6', 0);
    await stmt.run(uuidv4(), 'webapps',    'Веб-приложения',    '#8b5cf6', 1);
    await stmt.run(uuidv4(), 'automation', 'Автоматизация',     '#10b981', 2);
  }
}

module.exports = { db, initDb };

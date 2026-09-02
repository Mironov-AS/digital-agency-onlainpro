const createPgDb = require('../../../../shared/db');

const db = createPgDb(process.env.DATABASE_URL);

async function initDb() {
  await db.ensureSchema();
  await db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id          TEXT PRIMARY KEY,
      code        TEXT UNIQUE NOT NULL,
      name        TEXT NOT NULL,
      description TEXT DEFAULT '',
      icon        TEXT DEFAULT '',
      config      TEXT DEFAULT '{}',
      is_active   BOOLEAN NOT NULL DEFAULT TRUE,
      show_on_landing BOOLEAN NOT NULL DEFAULT FALSE,
      landing_description TEXT DEFAULT '',
      price_monthly DOUBLE PRECISION DEFAULT 0,
      price_yearly DOUBLE PRECISION DEFAULT 0,
      billing_period TEXT DEFAULT 'monthly',
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS product_subscriptions (
      id           TEXT PRIMARY KEY,
      product_code TEXT NOT NULL REFERENCES products(code),
      client_id    TEXT NOT NULL,
      status       TEXT NOT NULL DEFAULT 'active',
      billing_amount DOUBLE PRECISION NOT NULL DEFAULT 0,
      billing_period TEXT DEFAULT 'monthly',
      next_billing_date TIMESTAMPTZ,
      created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    ALTER TABLE product_subscriptions ADD COLUMN IF NOT EXISTS trial_days INTEGER DEFAULT 14;
    ALTER TABLE product_subscriptions ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ DEFAULT NULL;

    CREATE INDEX IF NOT EXISTS idx_subscriptions_product_code ON product_subscriptions(product_code);
    CREATE INDEX IF NOT EXISTS idx_subscriptions_client_id ON product_subscriptions(client_id);
    CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON product_subscriptions(status);

    CREATE TABLE IF NOT EXISTS clients (
      id          TEXT PRIMARY KEY,
      name        TEXT NOT NULL,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS client_users (
      id           TEXT PRIMARY KEY,
      client_id    TEXT NOT NULL,
      email        TEXT UNIQUE NOT NULL,
      name         TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      is_active    BOOLEAN NOT NULL DEFAULT TRUE,
      created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
}

module.exports = { db, initDb };

const createPgDb = require("../../../../shared/db");

const db = createPgDb(process.env.DATABASE_URL);

async function initDb() {
	await db.ensureSchema();
	await db.exec(`
    CREATE TABLE IF NOT EXISTS clients (
      id                  TEXT PRIMARY KEY,
      name                TEXT NOT NULL,
      address             TEXT DEFAULT '',
      phone               TEXT DEFAULT '',
      email               TEXT DEFAULT '',
      contact_person      TEXT DEFAULT '',
      notes               TEXT DEFAULT '',
      is_active           BOOLEAN NOT NULL DEFAULT TRUE,
      created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    -- Добавляем столбец для хранения времени последней активности пользователей клиента
    ALTER TABLE clients ADD COLUMN IF NOT EXISTS last_user_activity TIMESTAMPTZ DEFAULT NULL;

    CREATE TABLE IF NOT EXISTS client_services (
      id                  TEXT PRIMARY KEY,
      client_id           TEXT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
      service_id          TEXT NOT NULL,
      service_name        TEXT NOT NULL DEFAULT '',
      product_code        TEXT DEFAULT NULL,
      price               DOUBLE PRECISION DEFAULT NULL,
      payment_interval    TEXT DEFAULT 'monthly',
      service_end_date    TEXT DEFAULT NULL,
      status              TEXT NOT NULL DEFAULT 'active',
      is_active           BOOLEAN NOT NULL DEFAULT TRUE,
      created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    ALTER TABLE client_services ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active';

    CREATE TABLE IF NOT EXISTS payments (
      id                 TEXT PRIMARY KEY,
      client_id          TEXT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
      client_service_id  TEXT DEFAULT NULL REFERENCES client_services(id) ON DELETE SET NULL,
      client_product_subscription_id TEXT DEFAULT NULL,
      amount             DOUBLE PRECISION NOT NULL,
      planned_date       TEXT NOT NULL,
      paid_date          TEXT DEFAULT NULL,
      status             TEXT NOT NULL DEFAULT 'pending',
      note               TEXT DEFAULT '',
      created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS client_service_costs (
      id                TEXT PRIMARY KEY,
      client_service_id TEXT NOT NULL REFERENCES client_services(id) ON DELETE CASCADE,
      client_id         TEXT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
      cost_name         TEXT NOT NULL,
      amount            DOUBLE PRECISION NOT NULL DEFAULT 0,
      period            TEXT NOT NULL DEFAULT 'monthly',
      note              TEXT NOT NULL DEFAULT '',
      created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS org_costs (
      id          TEXT PRIMARY KEY,
      name        TEXT NOT NULL,
      amount      DOUBLE PRECISION NOT NULL DEFAULT 0,
      period      TEXT NOT NULL DEFAULT 'monthly',
      note        TEXT NOT NULL DEFAULT '',
      is_active   BOOLEAN NOT NULL DEFAULT TRUE,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    ALTER TABLE clients ADD COLUMN IF NOT EXISTS address TEXT DEFAULT '';
    ALTER TABLE clients ADD COLUMN IF NOT EXISTS phone TEXT DEFAULT '';
    ALTER TABLE clients ADD COLUMN IF NOT EXISTS email TEXT DEFAULT '';
    ALTER TABLE clients ADD COLUMN IF NOT EXISTS contact_person TEXT DEFAULT '';
    ALTER TABLE clients ADD COLUMN IF NOT EXISTS notes TEXT DEFAULT '';
    ALTER TABLE clients ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;
    ALTER TABLE clients ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
    ALTER TABLE clients ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active';

    CREATE INDEX IF NOT EXISTS idx_payments_client_id ON payments(client_id);
    CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
    CREATE INDEX IF NOT EXISTS idx_payments_planned_date ON payments(planned_date);
    CREATE INDEX IF NOT EXISTS idx_payments_client_service_id ON payments(client_service_id);
    CREATE INDEX IF NOT EXISTS idx_client_services_client_id ON client_services(client_id);
    CREATE INDEX IF NOT EXISTS idx_client_service_costs_client_service_id ON client_service_costs(client_service_id);

    CREATE TABLE IF NOT EXISTS payment_notifications (
      id                  TEXT PRIMARY KEY,
      payment_id          TEXT NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
      scheduled_for       TIMESTAMPTZ NOT NULL,
      notification_type   TEXT NOT NULL DEFAULT 'email',
      channel             TEXT NOT NULL DEFAULT 'email',
      subject             TEXT DEFAULT '',
      message             TEXT DEFAULT '',
      status              TEXT NOT NULL DEFAULT 'pending',
      sent_at             TIMESTAMPTZ DEFAULT NULL,
      error_message       TEXT DEFAULT '',
      created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_payment_notifications_payment ON payment_notifications(payment_id);
    CREATE INDEX IF NOT EXISTS idx_payment_notifications_scheduled ON payment_notifications(scheduled_for, status);
    CREATE INDEX IF NOT EXISTS idx_payment_notifications_status ON payment_notifications(status);

    CREATE TABLE IF NOT EXISTS payment_notification_settings (
      id                  TEXT PRIMARY KEY,
      client_id           TEXT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
      enabled             BOOLEAN NOT NULL DEFAULT TRUE,
      days_before         TEXT DEFAULT '5,3,0',
      channel             TEXT DEFAULT 'email',
      email_template_id   TEXT DEFAULT NULL,
      created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE(client_id)
    );

    CREATE INDEX IF NOT EXISTS idx_payment_notification_settings_client ON payment_notification_settings(client_id);
  `);
}

module.exports = { db, initDb };

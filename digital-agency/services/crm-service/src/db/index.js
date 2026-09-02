const createPgDb = require('../../../../shared/db');

const db = createPgDb(process.env.DATABASE_URL);

async function initDb() {
  await db.ensureSchema();

  await db.exec(`
    CREATE TABLE IF NOT EXISTS customers (
      id              TEXT PRIMARY KEY,
      client_id       TEXT NOT NULL DEFAULT '',
      full_name       TEXT NOT NULL,
      phone           TEXT NOT NULL,
      email           TEXT DEFAULT '',
      additional_contacts TEXT DEFAULT '',
      notes           TEXT DEFAULT '',
      is_active       BOOLEAN NOT NULL DEFAULT TRUE,
      created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS service_categories (
      id              TEXT PRIMARY KEY,
      client_id       TEXT NOT NULL DEFAULT '',
      name            TEXT NOT NULL,
      parent_id       TEXT DEFAULT NULL,
      sort_order      INTEGER DEFAULT 0,
      is_active       BOOLEAN NOT NULL DEFAULT TRUE,
      created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS services (
      id              TEXT PRIMARY KEY,
      client_id       TEXT NOT NULL DEFAULT '',
      category_id     TEXT DEFAULT NULL,
      name            TEXT NOT NULL,
      description     TEXT DEFAULT '',
      duration        INTEGER DEFAULT 60,
      price           NUMERIC(10,2) DEFAULT 0,
      status          TEXT DEFAULT 'active',
      sort_order      INTEGER DEFAULT 0,
      created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS employees (
      id              TEXT PRIMARY KEY,
      client_id       TEXT NOT NULL DEFAULT '',
      full_name       TEXT NOT NULL,
      position        TEXT DEFAULT '',
      phone           TEXT DEFAULT '',
      email           TEXT DEFAULT '',
      schedule        TEXT DEFAULT '{}',
      specializations TEXT DEFAULT '[]',
      is_active       BOOLEAN NOT NULL DEFAULT TRUE,
      created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS work_records (
      id              TEXT PRIMARY KEY,
      client_id       TEXT NOT NULL DEFAULT '',
      customer_id     TEXT NOT NULL,
      service_id      TEXT DEFAULT NULL,
      employee_id     TEXT DEFAULT NULL,
      performed_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      duration        INTEGER DEFAULT 0,
      price           NUMERIC(10,2) DEFAULT 0,
      comment         TEXT DEFAULT '',
      created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_customers_client ON customers(client_id);
    CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
    CREATE INDEX IF NOT EXISTS idx_customers_name ON customers(full_name);
    CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);

    CREATE INDEX IF NOT EXISTS idx_service_categories_client ON service_categories(client_id);
    CREATE INDEX IF NOT EXISTS idx_services_client ON services(client_id);
    CREATE INDEX IF NOT EXISTS idx_services_category ON services(category_id);

    CREATE INDEX IF NOT EXISTS idx_employees_client ON employees(client_id);

    CREATE INDEX IF NOT EXISTS idx_work_records_client ON work_records(client_id);
    CREATE INDEX IF NOT EXISTS idx_work_records_customer ON work_records(customer_id);
    CREATE INDEX IF NOT EXISTS idx_work_records_employee ON work_records(employee_id);
    CREATE INDEX IF NOT EXISTS idx_work_records_performed ON work_records(performed_at);

    CREATE TABLE IF NOT EXISTS custom_fields (
      id              TEXT PRIMARY KEY,
      client_id       TEXT NOT NULL DEFAULT '',
      name            TEXT NOT NULL,
      field_type      TEXT NOT NULL DEFAULT 'text',
      is_required     BOOLEAN NOT NULL DEFAULT FALSE,
      is_visible      BOOLEAN NOT NULL DEFAULT TRUE,
      sort_order      INTEGER DEFAULT 0,
      options         TEXT DEFAULT '[]',
      is_deleted      BOOLEAN NOT NULL DEFAULT FALSE,
      created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS customer_custom_values (
      id              TEXT PRIMARY KEY,
      customer_id     TEXT NOT NULL,
      field_id        TEXT NOT NULL,
      value           TEXT DEFAULT '',
      UNIQUE(customer_id, field_id)
    );

    CREATE TABLE IF NOT EXISTS search_templates (
      id              TEXT PRIMARY KEY,
      client_id       TEXT NOT NULL DEFAULT '',
      name            TEXT NOT NULL,
      config          TEXT NOT NULL DEFAULT '{}',
      created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_custom_fields_client ON custom_fields(client_id);
    CREATE INDEX IF NOT EXISTS idx_custom_values_customer ON customer_custom_values(customer_id);
    CREATE INDEX IF NOT EXISTS idx_custom_values_field ON customer_custom_values(field_id);
    CREATE INDEX IF NOT EXISTS idx_search_templates_client ON search_templates(client_id);

    CREATE TABLE IF NOT EXISTS service_custom_fields (
      id              TEXT PRIMARY KEY,
      client_id       TEXT NOT NULL DEFAULT '',
      service_id      TEXT NOT NULL,
      name            TEXT NOT NULL,
      field_type      TEXT NOT NULL DEFAULT 'text',
      is_required     BOOLEAN NOT NULL DEFAULT FALSE,
      sort_order      INTEGER DEFAULT 0,
      options         TEXT DEFAULT '[]',
      is_deleted      BOOLEAN NOT NULL DEFAULT FALSE,
      created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS work_record_field_values (
      id              TEXT PRIMARY KEY,
      work_record_id  TEXT NOT NULL,
      field_id        TEXT NOT NULL,
      value           TEXT DEFAULT '',
      UNIQUE(work_record_id, field_id)
    );

    CREATE INDEX IF NOT EXISTS idx_service_custom_fields_service ON service_custom_fields(service_id);
    CREATE INDEX IF NOT EXISTS idx_service_custom_fields_client ON service_custom_fields(client_id);
    CREATE INDEX IF NOT EXISTS idx_work_record_field_values_record ON work_record_field_values(work_record_id);
    CREATE INDEX IF NOT EXISTS idx_work_record_field_values_field ON work_record_field_values(field_id);

    CREATE TABLE IF NOT EXISTS booking_sync_map (
      id              TEXT PRIMARY KEY,
      client_id       TEXT NOT NULL DEFAULT '',
      entity_type     TEXT NOT NULL,
      booking_id      TEXT NOT NULL,
      crm_id          TEXT NOT NULL,
      synced_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE(client_id, entity_type, booking_id)
    );

    CREATE INDEX IF NOT EXISTS idx_sync_map_client ON booking_sync_map(client_id);
    CREATE INDEX IF NOT EXISTS idx_sync_map_booking ON booking_sync_map(entity_type, booking_id);
    CREATE INDEX IF NOT EXISTS idx_sync_map_crm ON booking_sync_map(entity_type, crm_id);

    CREATE TABLE IF NOT EXISTS recommendations (
      id              TEXT PRIMARY KEY,
      client_id       TEXT NOT NULL DEFAULT '',
      name            TEXT NOT NULL,
      sort_order      INTEGER DEFAULT 0,
      is_active       BOOLEAN NOT NULL DEFAULT TRUE,
      created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_recommendations_client ON recommendations(client_id);

    ALTER TABLE customers ADD COLUMN IF NOT EXISTS is_self_registered BOOLEAN NOT NULL DEFAULT FALSE;
    ALTER TABLE customers ADD COLUMN IF NOT EXISTS self_reg_source TEXT DEFAULT '';
    CREATE INDEX IF NOT EXISTS idx_customers_self_reg ON customers(client_id, is_self_registered);

    CREATE TABLE IF NOT EXISTS display_settings (
      id              TEXT PRIMARY KEY,
      client_id       TEXT NOT NULL DEFAULT '',
      config          JSONB NOT NULL DEFAULT '{}',
      updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE(client_id)
    );

    CREATE TABLE IF NOT EXISTS activities (
      id                      TEXT PRIMARY KEY,
      client_id               TEXT NOT NULL DEFAULT '',
      customer_id             TEXT NOT NULL,
      title                   TEXT NOT NULL,
      description             TEXT DEFAULT '',
      activity_type           TEXT NOT NULL DEFAULT 'task',
      planned_date            DATE NOT NULL,
      planned_time            TIME DEFAULT NULL,
      duration                INTEGER DEFAULT 60,
      service_id              TEXT DEFAULT NULL,
      order_id                TEXT DEFAULT NULL,
      employee_id             TEXT DEFAULT NULL,
      status                  TEXT NOT NULL DEFAULT 'planned',
      reminder_sent           BOOLEAN NOT NULL DEFAULT FALSE,
      booking_appointment_id  TEXT DEFAULT NULL,
      created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_activities_client ON activities(client_id);
    CREATE INDEX IF NOT EXISTS idx_activities_customer ON activities(customer_id);
    CREATE INDEX IF NOT EXISTS idx_activities_date ON activities(planned_date);
    CREATE INDEX IF NOT EXISTS idx_activities_status ON activities(client_id, status);
    CREATE INDEX IF NOT EXISTS idx_activities_reminder ON activities(client_id, planned_date, reminder_sent);

    CREATE TABLE IF NOT EXISTS sales_items (
      id              TEXT PRIMARY KEY,
      client_id       TEXT NOT NULL DEFAULT '',
      name            TEXT NOT NULL,
      sku             TEXT DEFAULT '',
      description     TEXT DEFAULT '',
      unit            TEXT DEFAULT 'шт',
      price           NUMERIC(10,2) DEFAULT 0,
      status          TEXT DEFAULT 'active',
      sort_order      INTEGER DEFAULT 0,
      created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    ALTER TABLE sales_items ADD COLUMN IF NOT EXISTS client_id TEXT NOT NULL DEFAULT '';
    ALTER TABLE sales_items ADD COLUMN IF NOT EXISTS sku TEXT DEFAULT '';
    ALTER TABLE sales_items ADD COLUMN IF NOT EXISTS description TEXT DEFAULT '';
    ALTER TABLE sales_items ADD COLUMN IF NOT EXISTS unit TEXT DEFAULT 'шт';
    ALTER TABLE sales_items ADD COLUMN IF NOT EXISTS price NUMERIC(10,2) DEFAULT 0;
    ALTER TABLE sales_items ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
    ALTER TABLE sales_items ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;
    ALTER TABLE sales_items ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
    ALTER TABLE sales_items ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

    CREATE TABLE IF NOT EXISTS sales_item_custom_fields (
      id              TEXT PRIMARY KEY,
      client_id       TEXT NOT NULL DEFAULT '',
      sales_item_id   TEXT NOT NULL,
      name            TEXT NOT NULL,
      field_type      TEXT NOT NULL DEFAULT 'text',
      is_required     BOOLEAN NOT NULL DEFAULT FALSE,
      sort_order      INTEGER DEFAULT 0,
      options         TEXT DEFAULT '[]',
      is_deleted      BOOLEAN NOT NULL DEFAULT FALSE,
      created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS orders (
      id              TEXT PRIMARY KEY,
      client_id       TEXT NOT NULL DEFAULT '',
      customer_id     TEXT NOT NULL,
      title           TEXT NOT NULL,
      description     TEXT DEFAULT '',
      status          TEXT NOT NULL DEFAULT 'active',
      outcome         TEXT DEFAULT '',
      total_amount    NUMERIC(10,2) DEFAULT 0,
      created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      closed_at       TIMESTAMPTZ DEFAULT NULL,
      updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id              TEXT PRIMARY KEY,
      order_id        TEXT NOT NULL,
      sales_item_id   TEXT DEFAULT NULL,
      name            TEXT NOT NULL,
      quantity        NUMERIC(10,2) DEFAULT 1,
      price           NUMERIC(10,2) DEFAULT 0,
      comment         TEXT DEFAULT '',
      created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS order_custom_fields (
      id              TEXT PRIMARY KEY,
      client_id       TEXT NOT NULL DEFAULT '',
      order_id        TEXT NOT NULL,
      name            TEXT NOT NULL,
      field_type      TEXT NOT NULL DEFAULT 'text',
      is_required     BOOLEAN NOT NULL DEFAULT FALSE,
      sort_order      INTEGER DEFAULT 0,
      options         TEXT DEFAULT '[]',
      is_deleted      BOOLEAN NOT NULL DEFAULT FALSE,
      created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS order_field_values (
      id              TEXT PRIMARY KEY,
      order_id        TEXT NOT NULL,
      field_id        TEXT NOT NULL,
      value           TEXT DEFAULT '',
      UNIQUE(order_id, field_id)
    );

    ALTER TABLE activities ADD COLUMN IF NOT EXISTS order_id TEXT DEFAULT NULL;

    CREATE INDEX IF NOT EXISTS idx_sales_items_client ON sales_items(client_id);
    CREATE INDEX IF NOT EXISTS idx_sales_items_status ON sales_items(client_id, status);
    CREATE INDEX IF NOT EXISTS idx_sales_item_custom_fields_item ON sales_item_custom_fields(sales_item_id);
    CREATE INDEX IF NOT EXISTS idx_sales_item_custom_fields_client ON sales_item_custom_fields(client_id);
    CREATE INDEX IF NOT EXISTS idx_orders_client ON orders(client_id);
    CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
    CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(client_id, status);
    CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at);
    CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
    CREATE INDEX IF NOT EXISTS idx_order_items_sales_item ON order_items(sales_item_id);
    CREATE INDEX IF NOT EXISTS idx_order_custom_fields_order ON order_custom_fields(order_id);
    CREATE INDEX IF NOT EXISTS idx_order_custom_fields_client ON order_custom_fields(client_id);
    CREATE INDEX IF NOT EXISTS idx_order_field_values_order ON order_field_values(order_id);
    CREATE INDEX IF NOT EXISTS idx_order_field_values_field ON order_field_values(field_id);
    CREATE INDEX IF NOT EXISTS idx_activities_order ON activities(order_id);
  `);
}

module.exports = { db, initDb };

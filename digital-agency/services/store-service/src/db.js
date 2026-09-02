const createPgDb = require('../../../shared/db');

const db = createPgDb(process.env.DATABASE_URL);

async function initDb() {
  await db.ensureSchema();
  await db.exec(`
    CREATE TABLE IF NOT EXISTS locations (
      id TEXT PRIMARY KEY,
      client_id TEXT NOT NULL DEFAULT '',
      name TEXT NOT NULL,
      location_type TEXT NOT NULL DEFAULT 'store',
      address TEXT DEFAULT '',
      is_central BOOLEAN NOT NULL DEFAULT FALSE,
      linked_warehouse_ids JSONB NOT NULL DEFAULT '[]',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS suppliers (
      id TEXT PRIMARY KEY,
      client_id TEXT NOT NULL DEFAULT '',
      name TEXT NOT NULL,
      phone TEXT DEFAULT '',
      email TEXT DEFAULT '',
      contact_person TEXT DEFAULT '',
      terms TEXT DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS product_groups (
      id TEXT PRIMARY KEY,
      client_id TEXT NOT NULL DEFAULT '',
      name TEXT NOT NULL,
      description TEXT DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE(client_id, name)
    );

    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      client_id TEXT NOT NULL DEFAULT '',
      name TEXT NOT NULL,
      sku TEXT NOT NULL,
      barcode TEXT DEFAULT '',
      group_name TEXT DEFAULT '',
      purchase_price NUMERIC(12,2) NOT NULL DEFAULT 0,
      markup_percent NUMERIC(8,2) NOT NULL DEFAULT 0,
      markup_fixed NUMERIC(12,2) NOT NULL DEFAULT 0,
      sale_price NUMERIC(12,2) NOT NULL DEFAULT 0,
      unit TEXT DEFAULT 'шт',
      description TEXT DEFAULT '',
      attributes JSONB NOT NULL DEFAULT '{}',
      image_url TEXT DEFAULT '',
      is_public BOOLEAN NOT NULL DEFAULT TRUE,
      min_quantity NUMERIC(12,3) NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE(client_id, sku)
    );

    -- Migration: add min_quantity column if it doesn't exist (for existing databases)
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'min_quantity') THEN
        ALTER TABLE products ADD COLUMN min_quantity NUMERIC(12,3) NOT NULL DEFAULT 0;
      END IF;
    END $$;

    CREATE TABLE IF NOT EXISTS stock_balances (
      id TEXT PRIMARY KEY,
      client_id TEXT NOT NULL DEFAULT '',
      product_id TEXT NOT NULL,
      location_id TEXT NOT NULL,
      quantity NUMERIC(12,3) NOT NULL DEFAULT 0,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE(client_id, product_id, location_id)
    );

    CREATE TABLE IF NOT EXISTS purchase_orders (
      id TEXT PRIMARY KEY,
      client_id TEXT NOT NULL DEFAULT '',
      supplier_id TEXT,
      number TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'draft',
      invoice_number TEXT DEFAULT '',
      purchased_at DATE DEFAULT CURRENT_DATE,
      items JSONB NOT NULL DEFAULT '[]',
      total NUMERIC(12,2) NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS transfers (
      id TEXT PRIMARY KEY,
      client_id TEXT NOT NULL DEFAULT '',
      number TEXT NOT NULL,
      from_location_id TEXT NOT NULL,
      to_location_id TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'created',
      items JSONB NOT NULL DEFAULT '[]',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS inventory_counts (
      id TEXT PRIMARY KEY,
      client_id TEXT NOT NULL DEFAULT '',
      number TEXT NOT NULL,
      location_id TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'draft',
      items JSONB NOT NULL DEFAULT '[]',
      differences JSONB NOT NULL DEFAULT '[]',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS sales (
      id TEXT PRIMARY KEY,
      client_id TEXT NOT NULL DEFAULT '',
      number TEXT NOT NULL,
      location_id TEXT NOT NULL,
      cashier_name TEXT DEFAULT '',
      items JSONB NOT NULL DEFAULT '[]',
      total NUMERIC(12,2) NOT NULL DEFAULT 0,
      profit NUMERIC(12,2) NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS online_orders (
      id TEXT PRIMARY KEY,
      client_id TEXT NOT NULL DEFAULT '',
      number TEXT NOT NULL,
      customer_name TEXT NOT NULL,
      customer_phone TEXT DEFAULT '',
      status TEXT NOT NULL DEFAULT 'new',
      items JSONB NOT NULL DEFAULT '[]',
      total NUMERIC(12,2) NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      client_id TEXT NOT NULL DEFAULT '',
      user_id TEXT DEFAULT '',
      user_email TEXT DEFAULT '',
      action TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id TEXT DEFAULT '',
      details JSONB NOT NULL DEFAULT '{}',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_store_locations_client ON locations(client_id);
    CREATE INDEX IF NOT EXISTS idx_store_product_groups_client ON product_groups(client_id);
    CREATE INDEX IF NOT EXISTS idx_store_products_client ON products(client_id);
    CREATE INDEX IF NOT EXISTS idx_store_stock_client ON stock_balances(client_id);
    CREATE INDEX IF NOT EXISTS idx_store_purchases_client ON purchase_orders(client_id);
    CREATE INDEX IF NOT EXISTS idx_store_sales_client ON sales(client_id);
    CREATE INDEX IF NOT EXISTS idx_store_orders_client ON online_orders(client_id);
    CREATE INDEX IF NOT EXISTS idx_store_audit_client ON audit_logs(client_id);

    INSERT INTO product_groups (id, client_id, name)
    SELECT 'group-' || md5(client_id || ':' || group_name), client_id, group_name
    FROM (
      SELECT DISTINCT client_id, TRIM(group_name) AS group_name
      FROM products
      WHERE TRIM(COALESCE(group_name, '')) <> ''
    ) existing_groups
    ON CONFLICT (client_id, name) DO NOTHING;
  `);
}

module.exports = { db, initDb };

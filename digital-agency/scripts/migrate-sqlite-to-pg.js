#!/usr/bin/env node
/**
 * SQLite → PostgreSQL data migration script
 * Migrates all existing data from SQLite databases to PostgreSQL.
 *
 * Usage:
 *   DATABASE_URL=postgresql://agency:password@localhost:5432/digital_agency node scripts/migrate-sqlite-to-pg.js
 *
 * Prerequisites:
 *   - PostgreSQL must be running with schemas created (init-db.sql)
 *   - Each service's initDb() should have run at least once to create tables
 *   - npm install better-sqlite3 pg (in this script's context)
 */

const { Pool } = require('pg');
const path = require('path');

let Database;
try {
  Database = require('better-sqlite3');
} catch {
  console.error('better-sqlite3 is required for migration. Run: npm install better-sqlite3');
  process.exit(1);
}

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://agency:agency_secret_2024@localhost:5432/digital_agency';

const SERVICES = [
  {
    name: 'auth-service',
    schema: 'auth',
    dbPath: path.join(__dirname, '../services/auth-service/data/auth.sqlite'),
    tables: [
      { name: 'users', columns: ['id', 'username', 'email', 'password_hash', 'role', 'is_active', 'created_at', 'updated_at'] },
      { name: 'refresh_tokens', columns: ['id', 'user_id', 'token', 'expires_at', 'created_at'] },
    ],
  },
  {
    name: 'catalog-service',
    schema: 'catalog',
    dbPath: path.join(__dirname, '../services/catalog-service/data/catalog.sqlite'),
    tables: [
      { name: 'cost_types', columns: ['id', 'name', 'description', 'created_at'] },
      { name: 'categories', columns: ['id', 'name', 'description', 'order_index', 'created_at'] },
      { name: 'services', columns: ['id', 'name', 'description', 'category_id', 'base_price', 'unit', 'is_active', 'order_index', 'created_at', 'updated_at'] },
      { name: 'service_costs', columns: ['id', 'service_id', 'cost_type_id', 'amount', 'created_at'] },
    ],
  },
  {
    name: 'clients-service',
    schema: 'clients',
    dbPath: path.join(__dirname, '../services/clients-service/data/clients.sqlite'),
    tables: [
      { name: 'clients', columns: null },
      { name: 'contacts', columns: null },
      { name: 'client_services', columns: null },
      { name: 'payments', columns: null },
      { name: 'payment_history', columns: null },
    ],
  },
  {
    name: 'projects-service',
    schema: 'projects',
    dbPath: path.join(__dirname, '../services/projects-service/data/projects.sqlite'),
    tables: [
      { name: 'projects', columns: null },
      { name: 'project_files', columns: null },
      { name: 'project_links', columns: null },
    ],
  },
  {
    name: 'product-shelf-service',
    schema: 'shelf',
    dbPath: path.join(__dirname, '../services/product-shelf-service/data/shelf.sqlite'),
    tables: [
      { name: 'products', columns: null },
      { name: 'subscriptions', columns: null },
      { name: 'clients', columns: null },
      { name: 'client_users', columns: null },
    ],
  },
  {
    name: 'queue-service',
    schema: 'queue',
    dbPath: path.join(__dirname, '../services/queue-service/server/queue.db'),
    tables: [
      { name: 'services', columns: null },
      { name: 'service_fields', columns: null },
      { name: 'tickets', columns: null },
      { name: 'users', columns: null },
      { name: 'action_logs', columns: null },
      { name: 'settings', columns: null },
      { name: 'advertisements', columns: null },
    ],
  },
];

async function migrateTable(pool, schema, sqliteDb, tableName) {
  let rows;
  try {
    rows = sqliteDb.prepare(`SELECT * FROM ${tableName}`).all();
  } catch (err) {
    console.log(`    ⚠ Table "${tableName}" not found in SQLite — skipping`);
    return 0;
  }

  if (!rows.length) {
    console.log(`    ○ ${tableName}: 0 rows (empty)`);
    return 0;
  }

  const columns = Object.keys(rows[0]);
  const columnList = columns.map(c => `"${c}"`).join(', ');
  const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(`SET search_path TO ${schema}`);

    // Check if target table exists
    const tableCheck = await client.query(
      `SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = $1 AND table_name = $2)`,
      [schema, tableName]
    );
    if (!tableCheck.rows[0].exists) {
      console.log(`    ⚠ Table "${schema}.${tableName}" doesn't exist in PostgreSQL — skipping`);
      await client.query('ROLLBACK');
      return 0;
    }

    // Check if already has data
    const countResult = await client.query(`SELECT COUNT(*) AS c FROM "${tableName}"`);
    if (parseInt(countResult.rows[0].c) > 0) {
      console.log(`    ⊘ ${tableName}: already has ${countResult.rows[0].c} rows — skipping (delete manually to re-import)`);
      await client.query('ROLLBACK');
      return 0;
    }

    let imported = 0;
    for (const row of rows) {
      const values = columns.map(c => row[c]);
      try {
        await client.query(
          `INSERT INTO "${tableName}" (${columnList}) VALUES (${placeholders}) ON CONFLICT DO NOTHING`,
          values
        );
        imported++;
      } catch (err) {
        console.log(`    ⚠ Row error in ${tableName}: ${err.message}`);
      }
    }

    // Reset sequence if table has id column with SERIAL
    if (columns.includes('id')) {
      try {
        await client.query(`SELECT setval(pg_get_serial_sequence('"${tableName}"', 'id'), COALESCE((SELECT MAX(id) FROM "${tableName}"), 0) + 1, false)`);
      } catch { /* no sequence — ok */ }
    }

    await client.query('COMMIT');
    console.log(`    ✓ ${tableName}: ${imported} rows imported`);
    return imported;
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(`    ✗ ${tableName}: ${err.message}`);
    return 0;
  } finally {
    client.release();
  }
}

async function main() {
  console.log('╔══════════════════════════════════════════════════════╗');
  console.log('║  SQLite → PostgreSQL Data Migration                 ║');
  console.log('╚══════════════════════════════════════════════════════╝\n');

  const pool = new Pool({ connectionString: DATABASE_URL, max: 5 });

  try {
    await pool.query('SELECT 1');
    console.log('✓ Connected to PostgreSQL\n');
  } catch (err) {
    console.error('✗ Cannot connect to PostgreSQL:', err.message);
    process.exit(1);
  }

  let totalRows = 0;
  let totalTables = 0;

  for (const service of SERVICES) {
    console.log(`\n── ${service.name} (schema: ${service.schema}) ──`);

    const fs = require('fs');
    if (!fs.existsSync(service.dbPath)) {
      console.log(`  ⚠ SQLite file not found: ${service.dbPath} — skipping`);
      continue;
    }

    let sqliteDb;
    try {
      sqliteDb = new Database(service.dbPath, { readonly: true });
    } catch (err) {
      console.log(`  ✗ Cannot open SQLite: ${err.message}`);
      continue;
    }

    // Discover tables if columns not specified
    const existingTables = sqliteDb.prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
    ).all().map(r => r.name);

    const tablesToMigrate = service.tables
      .map(t => t.name)
      .filter(name => existingTables.includes(name));

    console.log(`  SQLite tables found: ${existingTables.join(', ')}`);
    console.log(`  Migrating: ${tablesToMigrate.join(', ')}\n`);

    for (const tableName of tablesToMigrate) {
      const count = await migrateTable(pool, service.schema, sqliteDb, tableName);
      totalRows += count;
      if (count > 0) totalTables++;
    }

    sqliteDb.close();
  }

  console.log('\n══════════════════════════════════════════════════════');
  console.log(`  Migration complete: ${totalRows} rows across ${totalTables} tables`);
  console.log('══════════════════════════════════════════════════════\n');

  await pool.end();
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});

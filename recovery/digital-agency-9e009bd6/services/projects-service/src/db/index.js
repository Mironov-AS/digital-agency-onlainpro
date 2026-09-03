const createPgDb = require('../../../../shared/db');

const db = createPgDb(process.env.DATABASE_URL);

async function initDb() {
  await db.ensureSchema();
  await db.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id           TEXT PRIMARY KEY,
      title        TEXT NOT NULL,
      client_id    TEXT DEFAULT NULL,
      client_name  TEXT DEFAULT '',
      service_id   TEXT DEFAULT NULL,
      service_name TEXT DEFAULT '',
      prod_url     TEXT DEFAULT '',
      description  TEXT DEFAULT '',
      notes        TEXT DEFAULT '',
      status       TEXT NOT NULL DEFAULT 'active',
      created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS project_files (
      id          TEXT PRIMARY KEY,
      project_id  TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      filename    TEXT NOT NULL,
      original_name TEXT NOT NULL,
      file_type   TEXT NOT NULL DEFAULT 'other',
      mime_type   TEXT DEFAULT '',
      size        INTEGER DEFAULT 0,
      uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS project_links (
      id          TEXT PRIMARY KEY,
      project_id  TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      label       TEXT NOT NULL,
      url         TEXT NOT NULL,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
}

module.exports = { db, initDb };

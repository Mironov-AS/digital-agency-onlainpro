const createPgDb = require("../../shared/db");

const db = createPgDb(process.env.DATABASE_URL);

async function initDb() {
	await db.ensureSchema();

	// jobs must be created in the current schema (label_merger),
	// not accidentally in shelf due to search_path order.
	// We drop and recreate to ensure correct schema ownership.
	// DROP IF EXISTS is safe — data is ephemeral (expires daily).
	await db.exec(`
    DROP TABLE IF EXISTS jobs;
    CREATE TABLE jobs (
      id          TEXT PRIMARY KEY,
      client_id   TEXT NOT NULL,
      user_id     TEXT DEFAULT '',
      status      TEXT NOT NULL DEFAULT 'pending',
      assembly_name TEXT DEFAULT '',
      tickets_name  TEXT DEFAULT '',
      output_name   TEXT DEFAULT '',
      item_count    INTEGER DEFAULT 0,
      matched_count INTEGER DEFAULT 0,
      error_message TEXT DEFAULT '',
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      expires_at  TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '24 hours'
    );
    CREATE INDEX IF NOT EXISTS idx_jobs_client_id ON jobs(client_id);
    CREATE INDEX IF NOT EXISTS idx_jobs_expires ON jobs(expires_at);
  `);
}

module.exports = { db, initDb };

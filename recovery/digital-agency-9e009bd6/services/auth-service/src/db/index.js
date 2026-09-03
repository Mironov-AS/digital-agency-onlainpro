const createPgDb = require('../../../../shared/db');
const createFileDb = require('./fileDb');

function shouldUseFileDb() {
  if (process.env.AUTH_DB_DRIVER === 'file') return true;
  if (!process.env.DATABASE_URL) return true;
  try {
    const url = new URL(process.env.DATABASE_URL);
    return url.hostname === 'base';
  } catch {
    return true;
  }
}

const db = shouldUseFileDb()
  ? createFileDb()
  : createPgDb(process.env.DATABASE_URL);

async function initDb() {
  if (shouldUseFileDb()) {
    await db.exec('');
    return;
  }

  await db.ensureSchema();
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id          TEXT PRIMARY KEY,
      email       TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name        TEXT NOT NULL,
      role        TEXT NOT NULL DEFAULT 'user',
      apps        TEXT NOT NULL DEFAULT '[]',
      client_id   TEXT DEFAULT NULL,
      is_active   BOOLEAN NOT NULL DEFAULT TRUE,
      plan        TEXT DEFAULT NULL,
      plan_expires_at TIMESTAMPTZ DEFAULT NULL,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS refresh_tokens (
      id         TEXT PRIMARY KEY,
      user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token_hash TEXT NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token_hash ON refresh_tokens(token_hash);
    CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
  `);
}

module.exports = { db, initDb };

require('dotenv').config();
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

function withAuthSchema(connectionString) {
  if (!connectionString) return connectionString;
  if (connectionString.includes('search_path=')) return connectionString;
  const separator = connectionString.includes('?') ? '&' : '?';
  return `${connectionString}${separator}options=-c%20search_path%3Dauth`;
}

const pool = new Pool({ connectionString: withAuthSchema(process.env.DATABASE_URL) });

async function main() {
  const email = process.env.ADMIN_EMAIL || 'admin@digital-agency.ru';
  const password = process.env.ADMIN_PASSWORD || 'Bynthrjvntk1';
  const hash = bcrypt.hashSync(password, 10);

  const res = await pool.query(
    'UPDATE users SET password_hash = $1 WHERE email = $2 RETURNING id, email',
    [hash, email]
  );

  if (res.rowCount === 0) {
    const { v4: uuidv4 } = require('uuid');
    await pool.query(
      'INSERT INTO users (id, email, password_hash, name, role, apps, is_active) VALUES ($1, $2, $3, $4, $5, $6, $7)',
      [uuidv4(), email, hash, 'Администратор', 'admin', JSON.stringify(['clients', 'catalog', 'projects']), true]
    );
    console.log(`Admin created: ${email}`);
  } else {
    console.log(`Admin updated via PG: ${email}`);
  }

  await pool.end();
}

main().catch(e => { console.error(e); process.exit(1); });

require('dotenv').config();
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { db, initDb } = require('./db');

async function seed() {
  await initDb();

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@digital-agency.ru';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin1234!';

  const passwordHash = bcrypt.hashSync(adminPassword, 10);
  const apps = JSON.stringify(['clients', 'catalog', 'projects']);

  const existing = await db.prepare('SELECT id FROM users WHERE email = ?').get(adminEmail);
  if (existing) {
    await db.prepare(
      'UPDATE users SET password_hash = ?, name = ?, role = ?, apps = ?, is_active = TRUE, updated_at = NOW() WHERE id = ?',
    ).run(passwordHash, 'Администратор', 'admin', apps, existing.id);
    console.log(`Admin updated: ${adminEmail}`);
    await db.close();
    process.exit(0);
  }

  await db.prepare(
    'INSERT INTO users (id, email, password_hash, name, role, apps) VALUES (?, ?, ?, ?, ?, ?)',
  ).run(
    uuidv4(),
    adminEmail,
    passwordHash,
    'Администратор',
    'admin',
    apps,
  );

  console.log(`Admin created: ${adminEmail}`);
  await db.close();
}

seed().catch(err => { console.error(err); process.exit(1); });

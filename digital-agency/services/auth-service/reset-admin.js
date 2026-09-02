const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const dbPath = process.env.DB_PATH || path.join(__dirname, 'data/auth.sqlite');
const Database = require('better-sqlite3');
const db = new Database(dbPath);

const newEmail = process.env.ADMIN_EMAIL || 'admin@digital-agency.ru';
const newPassword = process.env.ADMIN_PASSWORD || 'Bynthrjvntk1';

const passwordHash = bcrypt.hashSync(newPassword, 10);

const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(newEmail);
if (existing) {
  db.prepare('UPDATE users SET email = ?, password_hash = ?, name = ?, role = ?, apps = ?, is_active = 1 WHERE id = ?')
    .run(newEmail, passwordHash, 'Администратор', 'admin', JSON.stringify(['clients', 'catalog', 'projects']), existing.id);
  console.log(`✅ Admin updated: ${newEmail} / ${newPassword}`);
} else {
  const { v4: uuidv4 } = require('uuid');
  db.prepare('INSERT INTO users (id, email, password_hash, name, role, apps, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .run(uuidv4(), newEmail, passwordHash, 'Администратор', 'admin', JSON.stringify(['clients', 'catalog', 'projects']), 1);
  console.log(`✅ Admin created: ${newEmail} / ${newPassword}`);
}

db.close();
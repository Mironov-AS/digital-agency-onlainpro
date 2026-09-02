require('dotenv').config();
const { v4: uuidv4 } = require('uuid');
const { db, initDb } = require('./db');

async function seed() {
  await initDb();

  const existing = await db.prepare('SELECT COUNT(*) as c FROM projects').get();
  if (parseInt(existing.c) > 0) { console.log('Already seeded'); await db.close(); process.exit(0); }

  const projects = [
    { title: 'Лендинг для ООО «Пример»', client_name: 'ООО «Пример»', service_name: 'Landing Page', prod_url: 'https://primer.ru', description: 'Одностраничный сайт с формой обратной связи', status: 'completed' },
    { title: 'Корпоративный сайт АО «ТехноСтарт»', client_name: 'АО «ТехноСтарт»', service_name: 'Сайт компании', prod_url: 'https://technostart.ru', description: 'Полный корпоративный сайт с каталогом', status: 'active' },
    { title: 'MVP мобильного приложения', client_name: 'ИП Иванов А.А.', service_name: 'MVP', prod_url: '', description: 'Приложение для учёта рабочего времени', status: 'active' },
  ];

  await db.runTransaction(async (txDb) => {
    for (const p of projects) {
      await txDb.prepare(
        'INSERT INTO projects (id, title, client_name, service_name, prod_url, description, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      ).run(uuidv4(), p.title, p.client_name, p.service_name, p.prod_url, p.description, p.status);
    }
  });

  console.log(`✅ Seeded ${projects.length} projects`);
  await db.close();
}

seed().catch(err => { console.error(err); process.exit(1); });

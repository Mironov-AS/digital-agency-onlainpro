require('dotenv').config();
const { v4: uuidv4 } = require('uuid');
const { db, initDb } = require('./db');

async function seed() {
  await initDb();

  const existing = await db.prepare('SELECT COUNT(*) as cnt FROM services').get();
  if (parseInt(existing.cnt) > 0) { console.log('Already seeded'); await db.close(); process.exit(0); }

  const services = [
    { title: 'Landing Page', description: 'Сайт с одной страницей и нужными функциями', price: 35000, price_type: 'from', price_label: 'от 35 000 ₽', category: 'websites', sort_order: 1 },
    { title: 'Сайт-визитка', description: 'Простой сайт с основной информацией о компании', price: 15000, price_type: 'from', price_label: 'от 15 000 ₽', category: 'websites', sort_order: 2 },
    { title: 'Сайт компании', description: 'Полный сайт для вашей компании со всеми разделами', price: 45000, price_type: 'from', price_label: 'от 45 000 ₽', category: 'websites', sort_order: 3 },
    { title: 'Интернет-магазин', description: 'Готовый магазин для онлайн-продаж с корзиной и оплатой', price: 60000, price_type: 'from', price_label: 'от 60 000 ₽', category: 'websites', sort_order: 4 },
    { title: 'MVP', description: 'Быстрый запуск рабочего приложения с возможностью дальнейшего роста', price: 150000, price_type: 'from', price_label: 'от 150 000 ₽', category: 'webapps', sort_order: 5 },
    { title: 'Optimum', description: 'Более полный вариант с доработками и расширенным функционалом', price: 300000, price_type: 'from', price_label: 'от 300 000 ₽', category: 'webapps', sort_order: 6 },
    { title: 'Advanced', description: 'Полное решение с командой специалистов под ключ', price: 1000000, price_type: 'from', price_label: 'от 1 000 000 ₽', category: 'webapps', sort_order: 7 },
    { title: 'Проверка процессов', description: 'Анализ бизнес-процессов и подготовка плана автоматизации', price: 2000, price_type: 'hourly', price_label: 'от 2 000 ₽/час', category: 'automation', sort_order: 8 },
    { title: 'Полная цифровизация', description: 'Комплексный перевод бизнеса в цифру под ключ', price: null, price_type: 'fixed', price_label: 'Индивидуально', category: 'automation', sort_order: 9 },
  ];

  await db.runTransaction(async (txDb) => {
    for (const s of services) {
      await txDb.prepare(
        'INSERT INTO services (id, title, description, price, price_type, price_label, category, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      ).run(uuidv4(), s.title, s.description, s.price ?? null, s.price_type, s.price_label, s.category, s.sort_order);
    }
  });

  console.log(`✅ Seeded ${services.length} services`);
  await db.close();
}

seed().catch(err => { console.error(err); process.exit(1); });

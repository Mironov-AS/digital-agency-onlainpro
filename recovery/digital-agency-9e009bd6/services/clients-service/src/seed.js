require('dotenv').config();
const { v4: uuidv4 } = require('uuid');
const { db, initDb } = require('./db');

async function seed() {
  await initDb();

  const existing = await db.prepare('SELECT COUNT(*) as c FROM clients').get();
  if (parseInt(existing.c) > 0) { console.log('Already seeded'); await db.close(); process.exit(0); }

  const clients = [
    { name: 'ООО «Пример»', address: 'г. Москва, ул. Тверская, 1', phone: '+7 (495) 000-00-01', email: 'info@primer.ru' },
    { name: 'ИП Иванов А.А.', address: 'г. Санкт-Петербург, пр. Невский, 10', phone: '+7 (812) 000-00-02', email: 'ivanov@mail.ru' },
    { name: 'АО «ТехноСтарт»', address: 'г. Казань, ул. Баумана, 5', phone: '+7 (843) 000-00-03', email: 'info@technostart.ru' },
  ];

  await db.runTransaction(async (txDb) => {
    for (const c of clients) {
      await txDb.prepare(
        'INSERT INTO clients (id, name, address, phone, email) VALUES (?, ?, ?, ?, ?)'
      ).run(uuidv4(), c.name, c.address, c.phone, c.email);
    }
  });

  console.log(`✅ Seeded ${clients.length} clients`);
  await db.close();
}

seed().catch(err => { console.error(err); process.exit(1); });

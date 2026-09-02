const request = require('supertest');
const express = require('express');
const cookieParser = require('cookie-parser');

jest.mock('../server/database', () => ({
  db: { get: jest.fn(), all: jest.fn(), run: jest.fn(), runReturning: jest.fn() },
  logAudit: jest.fn(),
  initDb: jest.fn(),
}));

jest.mock('../../../shared/middleware/auth', () => {
  const jwt = require('jsonwebtoken');
  const SECRET = 'test-secret-for-erp-tests';
  return {
    requireAuth: (req, res, next) => {
      try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) return res.status(401).json({ error: 'Требуется авторизация' });
        req.user = jwt.verify(token, SECRET);
        next();
      } catch { return res.status(401).json({ error: 'Недействительный токен' }); }
    },
  };
});

const jwt = require('jsonwebtoken');
const { db } = require('../server/database');
const counterpartiesRouter = require('../server/routes/counterparties');

const TEST_SECRET = 'test-secret-for-erp-tests';

function createApp() {
  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.use('/api/erp/counterparties', counterpartiesRouter);
  return app;
}

function makeToken(payload = {}) {
  return jwt.sign({ userId: 'u1', email: 'test@test.ru', name: 'Test', role: 'client', clientId: 'c1', ...payload }, TEST_SECRET, { expiresIn: '1h' });
}

describe('ERP Counterparties API', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('GET /', () => {
    it('возвращает список контрагентов', async () => {
      db.all.mockResolvedValue([{ id: 1, name: 'ООО Рога и Копыта', priority: 'medium' }]);
      const res = await request(createApp())
        .get('/api/erp/counterparties')
        .set('Authorization', `Bearer ${makeToken()}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
    });

    it('возвращает 401 без токена', async () => {
      const res = await request(createApp()).get('/api/erp/counterparties');
      expect(res.status).toBe(401);
    });
  });

  describe('GET /:id', () => {
    it('возвращает контрагента по ID', async () => {
      db.get.mockResolvedValue({ id: 1, name: 'ООО Тест', client_id: 'c1' });
      const res = await request(createApp())
        .get('/api/erp/counterparties/1')
        .set('Authorization', `Bearer ${makeToken()}`);
      expect(res.status).toBe(200);
      expect(res.body.name).toBe('ООО Тест');
    });

    it('возвращает 404 для несуществующего', async () => {
      db.get.mockResolvedValue(null);
      const res = await request(createApp())
        .get('/api/erp/counterparties/999')
        .set('Authorization', `Bearer ${makeToken()}`);
      expect(res.status).toBe(404);
    });
  });

  describe('POST /', () => {
    it('создаёт контрагента', async () => {
      db.runReturning.mockResolvedValue({ lastInsertRowid: 5 });
      db.get.mockResolvedValue({ id: 5, name: 'Новый контрагент', priority: 'medium', client_id: 'c1' });
      const res = await request(createApp())
        .post('/api/erp/counterparties')
        .set('Authorization', `Bearer ${makeToken()}`)
        .send({ name: 'Новый контрагент' });
      expect(res.status).toBe(201);
      expect(res.body.name).toBe('Новый контрагент');
    });

    it('возвращает 400 без названия', async () => {
      const res = await request(createApp())
        .post('/api/erp/counterparties')
        .set('Authorization', `Bearer ${makeToken()}`)
        .send({});
      expect(res.status).toBe(400);
      expect(res.body.error).toContain('Название обязательно');
    });
  });

  describe('PUT /:id', () => {
    it('обновляет контрагента', async () => {
      db.get.mockResolvedValueOnce({ id: 1, name: 'Старое имя', client_id: 'c1' });
      db.run.mockResolvedValue({ changes: 1 });
      db.get.mockResolvedValueOnce({ id: 1, name: 'Новое имя', client_id: 'c1' });
      const res = await request(createApp())
        .put('/api/erp/counterparties/1')
        .set('Authorization', `Bearer ${makeToken()}`)
        .send({ name: 'Новое имя' });
      expect(res.status).toBe(200);
    });

    it('возвращает 404 для несуществующего', async () => {
      db.get.mockResolvedValue(null);
      const res = await request(createApp())
        .put('/api/erp/counterparties/999')
        .set('Authorization', `Bearer ${makeToken()}`)
        .send({ name: 'test' });
      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /:id', () => {
    it('удаляет контрагента без договоров', async () => {
      db.get.mockResolvedValueOnce({ id: 1, name: 'Тест', client_id: 'c1' });
      db.get.mockResolvedValueOnce({ count: '0' });
      db.run.mockResolvedValue({ changes: 1 });
      const res = await request(createApp())
        .delete('/api/erp/counterparties/1')
        .set('Authorization', `Bearer ${makeToken()}`);
      expect(res.status).toBe(200);
      expect(res.body.message).toContain('удалён');
    });

    it('возвращает 409 если есть связанные договоры', async () => {
      db.get.mockResolvedValueOnce({ id: 1, name: 'Тест', client_id: 'c1' });
      db.get.mockResolvedValueOnce({ count: '3' });
      const res = await request(createApp())
        .delete('/api/erp/counterparties/1')
        .set('Authorization', `Bearer ${makeToken()}`);
      expect(res.status).toBe(409);
      expect(res.body.error).toContain('договоры');
    });
  });
});

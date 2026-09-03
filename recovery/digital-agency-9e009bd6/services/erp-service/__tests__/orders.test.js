const request = require('supertest');
const express = require('express');
const cookieParser = require('cookie-parser');

// Mock the database module
jest.mock('../server/database', () => ({
  db: { get: jest.fn(), all: jest.fn(), run: jest.fn(), runReturning: jest.fn() },
  logAudit: jest.fn(),
  initDb: jest.fn(),
}));

// Mock auth middleware — use jest.fn() factories
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
    requireAdmin: (req, res, next) => {
      try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) return res.status(401).json({ error: 'Требуется авторизация' });
        req.user = jwt.verify(token, SECRET);
        if (req.user.role !== 'admin') return res.status(403).json({ error: 'Доступ запрещён' });
        next();
      } catch { return res.status(401).json({ error: 'Недействительный токен' }); }
    },
  };
});

const jwt = require('jsonwebtoken');
const { db } = require('../server/database');
const ordersRouter = require('../server/routes/orders');

const TEST_SECRET = 'test-secret-for-erp-tests';

function createApp() {
  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.use('/api/erp/orders', ordersRouter);
  return app;
}

function makeToken(payload = {}) {
  return jwt.sign({ userId: 'u1', email: 'test@test.ru', name: 'Test', role: 'client', clientId: 'c1', ...payload }, TEST_SECRET, { expiresIn: '1h' });
}

describe('ERP Orders API', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('GET /', () => {
    it('возвращает список заказов', async () => {
      db.all.mockResolvedValue([{ id: 1, number: 'ORD-001', status: 'planned', client_id: 'c1' }]);
      db.all.mockResolvedValueOnce([{ id: 1, number: 'ORD-001', status: 'planned', client_id: 'c1' }]);
      db.all.mockResolvedValueOnce([]); // order_items
      const res = await request(createApp())
        .get('/api/erp/orders')
        .set('Authorization', `Bearer ${makeToken()}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].number).toBe('ORD-001');
    });

    it('возвращает 401 без токена', async () => {
      const res = await request(createApp()).get('/api/erp/orders');
      expect(res.status).toBe(401);
    });
  });

  describe('GET /:id', () => {
    it('возвращает заказ по ID', async () => {
      db.get.mockResolvedValueOnce({ id: 1, number: 'ORD-001', status: 'planned', client_id: 'c1' });
      db.all.mockResolvedValue([]);
      const res = await request(createApp())
        .get('/api/erp/orders/1')
        .set('Authorization', `Bearer ${makeToken()}`);
      expect(res.status).toBe(200);
      expect(res.body.number).toBe('ORD-001');
    });

    it('возвращает 404 для несуществующего заказа', async () => {
      db.get.mockResolvedValue(null);
      const res = await request(createApp())
        .get('/api/erp/orders/999')
        .set('Authorization', `Bearer ${makeToken()}`);
      expect(res.status).toBe(404);
    });
  });

  describe('POST /', () => {
    it('создаёт заказ с обязательными полями', async () => {
      db.runReturning.mockResolvedValue({ lastInsertRowid: 10 });
      db.get.mockResolvedValue({ id: 10, number: 'ORD-NEW', status: 'planned', client_id: 'c1' });
      db.all.mockResolvedValue([]);
      const res = await request(createApp())
        .post('/api/erp/orders')
        .set('Authorization', `Bearer ${makeToken()}`)
        .send({ number: 'ORD-NEW' });
      expect(res.status).toBe(201);
      expect(res.body.number).toBe('ORD-NEW');
    });

    it('возвращает 400 без номера заказа', async () => {
      const res = await request(createApp())
        .post('/api/erp/orders')
        .set('Authorization', `Bearer ${makeToken()}`)
        .send({});
      expect(res.status).toBe(400);
      expect(res.body.error).toContain('Номер заказа обязателен');
    });

    it('возвращает 400 для недопустимого статуса', async () => {
      const res = await request(createApp())
        .post('/api/erp/orders')
        .set('Authorization', `Bearer ${makeToken()}`)
        .send({ number: 'ORD-001', status: 'invalid_status' });
      expect(res.status).toBe(400);
      expect(res.body.error).toContain('Недопустимый статус');
    });

    it('возвращает 400 для отрицательной цены', async () => {
      const res = await request(createApp())
        .post('/api/erp/orders')
        .set('Authorization', `Bearer ${makeToken()}`)
        .send({ number: 'ORD-001', specification: [{ name: 'Item', quantity: 1, price: -10 }] });
      expect(res.status).toBe(400);
      expect(res.body.error).toContain('Цена не может быть отрицательной');
    });

    it('возвращает 400 для нулевого количества', async () => {
      const res = await request(createApp())
        .post('/api/erp/orders')
        .set('Authorization', `Bearer ${makeToken()}`)
        .send({ number: 'ORD-001', specification: [{ name: 'Item', quantity: 0, price: 10 }] });
      expect(res.status).toBe(400);
      expect(res.body.error).toContain('Количество должно быть положительным');
    });
  });

  describe('PUT /:id', () => {
    it('обновляет заказ', async () => {
      db.get.mockResolvedValueOnce({ id: 1, number: 'ORD-001', client_id: 'c1' });
      db.run.mockResolvedValue({ changes: 1 });
      db.get.mockResolvedValueOnce({ id: 1, number: 'ORD-UPDATED', status: 'planned', client_id: 'c1' });
      db.all.mockResolvedValue([]);
      const res = await request(createApp())
        .put('/api/erp/orders/1')
        .set('Authorization', `Bearer ${makeToken()}`)
        .send({ number: 'ORD-UPDATED' });
      expect(res.status).toBe(200);
    });

    it('возвращает 404 для несуществующего заказа', async () => {
      db.get.mockResolvedValue(null);
      const res = await request(createApp())
        .put('/api/erp/orders/999')
        .set('Authorization', `Bearer ${makeToken()}`)
        .send({ number: 'test' });
      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /:id', () => {
    it('удаляет заказ', async () => {
      db.get.mockResolvedValue({ id: 1, number: 'ORD-001', client_id: 'c1' });
      db.run.mockResolvedValue({ changes: 1 });
      const res = await request(createApp())
        .delete('/api/erp/orders/1')
        .set('Authorization', `Bearer ${makeToken()}`);
      expect(res.status).toBe(200);
      expect(res.body.message).toContain('удалён');
    });

    it('возвращает 404 для несуществующего заказа', async () => {
      db.get.mockResolvedValue(null);
      const res = await request(createApp())
        .delete('/api/erp/orders/999')
        .set('Authorization', `Bearer ${makeToken()}`);
      expect(res.status).toBe(404);
    });
  });
});

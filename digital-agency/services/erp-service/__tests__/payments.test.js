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
const paymentsRouter = require('../server/routes/payments');

const TEST_SECRET = 'test-secret-for-erp-tests';

function createApp() {
  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.use('/api/erp/payments', paymentsRouter);
  return app;
}

function makeToken() {
  return jwt.sign({ userId: 'u1', email: 'test@test.ru', name: 'Test', role: 'client', clientId: 'c1' }, TEST_SECRET, { expiresIn: '1h' });
}

describe('ERP Payments API', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('GET /', () => {
    it('возвращает список платежей', async () => {
      db.all.mockResolvedValue([{ id: 1, amount: 50000, status: 'pending', client_id: 'c1' }]);
      const res = await request(createApp())
        .get('/api/erp/payments')
        .set('Authorization', `Bearer ${makeToken()}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
    });
  });

  describe('GET /:id', () => {
    it('возвращает платёж по ID', async () => {
      db.get.mockResolvedValue({ id: 1, amount: 50000, status: 'pending', client_id: 'c1' });
      const res = await request(createApp())
        .get('/api/erp/payments/1')
        .set('Authorization', `Bearer ${makeToken()}`);
      expect(res.status).toBe(200);
      expect(res.body.amount).toBe(50000);
    });

    it('возвращает 404 для несуществующего', async () => {
      db.get.mockResolvedValue(null);
      const res = await request(createApp())
        .get('/api/erp/payments/999')
        .set('Authorization', `Bearer ${makeToken()}`);
      expect(res.status).toBe(404);
    });
  });

  describe('POST /', () => {
    it('создаёт платёж', async () => {
      db.runReturning.mockResolvedValue({ lastInsertRowid: 1 });
      db.get.mockResolvedValue({ id: 1, amount: 50000, status: 'pending', client_id: 'c1' });
      const res = await request(createApp())
        .post('/api/erp/payments')
        .set('Authorization', `Bearer ${makeToken()}`)
        .send({ amount: 50000, dueDate: '2026-06-01', counterpartyId: 1 });
      expect(res.status).toBe(201);
    });
  });

  describe('PUT /:id/register', () => {
    it('регистрирует оплату', async () => {
      db.get.mockResolvedValueOnce({ id: 1, amount: 50000, status: 'pending', due_date: '2026-06-01', client_id: 'c1' });
      db.run.mockResolvedValue({ changes: 1 });
      db.get.mockResolvedValueOnce({ id: 1, amount: 50000, status: 'paid', paid_amount: 50000, client_id: 'c1' });
      const res = await request(createApp())
        .put('/api/erp/payments/1/register')
        .set('Authorization', `Bearer ${makeToken()}`)
        .send({ paidAmount: 50000, paidDate: '2026-05-01' });
      expect(res.status).toBe(200);
    });

    it('возвращает 404 для несуществующего', async () => {
      db.get.mockResolvedValue(null);
      const res = await request(createApp())
        .put('/api/erp/payments/999/register')
        .set('Authorization', `Bearer ${makeToken()}`)
        .send({ paidAmount: 50000, paidDate: '2026-05-01' });
      expect(res.status).toBe(404);
    });
  });

  describe('PUT /:id', () => {
    it('обновляет платёж', async () => {
      db.get.mockResolvedValueOnce({ id: 1, amount: 50000, status: 'pending', client_id: 'c1' });
      db.run.mockResolvedValue({ changes: 1 });
      db.get.mockResolvedValueOnce({ id: 1, amount: 50000, status: 'paid', client_id: 'c1' });
      const res = await request(createApp())
        .put('/api/erp/payments/1')
        .set('Authorization', `Bearer ${makeToken()}`)
        .send({ status: 'paid', paidDate: '2026-05-01' });
      expect(res.status).toBe(200);
    });

    it('возвращает 400 для недопустимого статуса', async () => {
      db.get.mockResolvedValue({ id: 1, client_id: 'c1' });
      const res = await request(createApp())
        .put('/api/erp/payments/1')
        .set('Authorization', `Bearer ${makeToken()}`)
        .send({ status: 'invalid' });
      expect(res.status).toBe(400);
    });
  });
});

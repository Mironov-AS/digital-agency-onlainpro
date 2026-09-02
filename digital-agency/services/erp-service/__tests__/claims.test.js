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
const claimsRouter = require('../server/routes/claims');

const TEST_SECRET = 'test-secret-for-erp-tests';

function createApp() {
  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.use('/api/erp/claims', claimsRouter);
  return app;
}

function makeToken() {
  return jwt.sign({ userId: 'u1', email: 'test@test.ru', name: 'Test', role: 'client', clientId: 'c1' }, TEST_SECRET, { expiresIn: '1h' });
}

describe('ERP Claims API', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('GET /', () => {
    it('возвращает список рекламаций', async () => {
      db.all.mockResolvedValue([{ id: 1, number: 'CLM-001', status: 'open', client_id: 'c1', pause_payments: 0 }]);
      const res = await request(createApp())
        .get('/api/erp/claims')
        .set('Authorization', `Bearer ${makeToken()}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].number).toBe('CLM-001');
    });
  });

  describe('GET /:id', () => {
    it('возвращает рекламацию по ID', async () => {
      db.get.mockResolvedValue({ id: 1, number: 'CLM-001', status: 'open', client_id: 'c1', pause_payments: 0 });
      const res = await request(createApp())
        .get('/api/erp/claims/1')
        .set('Authorization', `Bearer ${makeToken()}`);
      expect(res.status).toBe(200);
      expect(res.body.number).toBe('CLM-001');
    });

    it('возвращает 404 для несуществующей', async () => {
      db.get.mockResolvedValue(null);
      const res = await request(createApp())
        .get('/api/erp/claims/999')
        .set('Authorization', `Bearer ${makeToken()}`);
      expect(res.status).toBe(404);
    });
  });

  describe('POST /', () => {
    it('создаёт рекламацию', async () => {
      db.runReturning.mockResolvedValue({ lastInsertRowid: 1 });
      db.get.mockResolvedValue({ id: 1, number: 'CLM-NEW', status: 'open', client_id: 'c1', pause_payments: 0 });
      const res = await request(createApp())
        .post('/api/erp/claims')
        .set('Authorization', `Bearer ${makeToken()}`)
        .send({ number: 'CLM-NEW', description: 'Брак продукции' });
      expect(res.status).toBe(201);
      expect(res.body.status).toBe('open');
    });

    it('возвращает 400 без номера', async () => {
      const res = await request(createApp())
        .post('/api/erp/claims')
        .set('Authorization', `Bearer ${makeToken()}`)
        .send({});
      expect(res.status).toBe(400);
      expect(res.body.error).toContain('Номер рекламации обязателен');
    });

    it('создаёт рекламацию с паузой платежей', async () => {
      db.runReturning.mockResolvedValue({ lastInsertRowid: 3 });
      db.get.mockResolvedValue({ id: 3, number: 'CLM-PAUSE', pause_payments: 1, status: 'open', client_id: 'c1' });
      const res = await request(createApp())
        .post('/api/erp/claims')
        .set('Authorization', `Bearer ${makeToken()}`)
        .send({ number: 'CLM-PAUSE', pausePayments: true, affectedPaymentId: 7 });
      expect(res.status).toBe(201);
      expect(res.body.pausePayments).toBe(true);
    });
  });

  describe('PUT /:id', () => {
    it('обновляет статус рекламации', async () => {
      db.get.mockResolvedValueOnce({ id: 1, number: 'CLM-001', client_id: 'c1' });
      db.run.mockResolvedValue({ changes: 1 });
      db.get.mockResolvedValueOnce({ id: 1, number: 'CLM-001', status: 'resolved', client_id: 'c1', pause_payments: 0 });
      const res = await request(createApp())
        .put('/api/erp/claims/1')
        .set('Authorization', `Bearer ${makeToken()}`)
        .send({ status: 'resolved', resolution: 'Замена выполнена' });
      expect(res.status).toBe(200);
    });

    it('возвращает 400 для недопустимого статуса', async () => {
      db.get.mockResolvedValue({ id: 1, number: 'CLM-001', client_id: 'c1' });
      const res = await request(createApp())
        .put('/api/erp/claims/1')
        .set('Authorization', `Bearer ${makeToken()}`)
        .send({ status: 'invalid' });
      expect(res.status).toBe(400);
      expect(res.body.error).toContain('Недопустимый статус');
    });

    it('возвращает 404 для несуществующей', async () => {
      db.get.mockResolvedValue(null);
      const res = await request(createApp())
        .put('/api/erp/claims/999')
        .set('Authorization', `Bearer ${makeToken()}`)
        .send({ status: 'closed' });
      expect(res.status).toBe(404);
    });
  });
});

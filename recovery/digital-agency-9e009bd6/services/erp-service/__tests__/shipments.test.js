const request = require('supertest');
const express = require('express');
const cookieParser = require('cookie-parser');

jest.mock('../server/database', () => ({
  db: { get: jest.fn(), all: jest.fn(), run: jest.fn(), runReturning: jest.fn(), transaction: jest.fn() },
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
const shipmentsRouter = require('../server/routes/shipments');

const TEST_SECRET = 'test-secret-for-erp-tests';

function createApp() {
  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.use('/api/erp/shipments', shipmentsRouter);
  return app;
}

function makeToken() {
  return jwt.sign({ userId: 'u1', email: 'test@test.ru', name: 'Test', role: 'client', clientId: 'c1' }, TEST_SECRET, { expiresIn: '1h' });
}

describe('ERP Shipments API', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('GET /', () => {
    it('возвращает список поставок', async () => {
      db.all.mockResolvedValue([{ id: 1, invoice_number: 'INV-001', status: 'shipped', client_id: 'c1' }]);
      const res = await request(createApp())
        .get('/api/erp/shipments')
        .set('Authorization', `Bearer ${makeToken()}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
    });
  });

  describe('GET /:id', () => {
    it('возвращает поставку по ID', async () => {
      db.get.mockResolvedValue({ id: 1, invoice_number: 'INV-001', status: 'shipped', client_id: 'c1' });
      db.all.mockResolvedValue([]);
      const res = await request(createApp())
        .get('/api/erp/shipments/1')
        .set('Authorization', `Bearer ${makeToken()}`);
      expect(res.status).toBe(200);
    });

    it('возвращает 404 для несуществующей', async () => {
      db.get.mockResolvedValue(null);
      const res = await request(createApp())
        .get('/api/erp/shipments/999')
        .set('Authorization', `Bearer ${makeToken()}`);
      expect(res.status).toBe(404);
    });
  });

  describe('POST /', () => {
    it('создаёт поставку', async () => {
      db.runReturning.mockResolvedValue({ lastInsertRowid: 1 });
      db.run.mockResolvedValue({ changes: 1 });
      db.get.mockResolvedValue({ id: 1, invoice_number: 'INV-NEW', status: 'shipped', client_id: 'c1' });
      db.all.mockResolvedValue([]);
      const res = await request(createApp())
        .post('/api/erp/shipments')
        .set('Authorization', `Bearer ${makeToken()}`)
        .send({ invoiceNumber: 'INV-NEW', amount: 50000 });
      expect(res.status).toBe(201);
    });

    it('возвращает 400 без номера накладной', async () => {
      const res = await request(createApp())
        .post('/api/erp/shipments')
        .set('Authorization', `Bearer ${makeToken()}`)
        .send({});
      expect(res.status).toBe(400);
    });
  });

  describe('PUT /:id', () => {
    it('обновляет поставку', async () => {
      db.get.mockResolvedValueOnce({ id: 1, invoice_number: 'INV-001', client_id: 'c1' });
      db.run.mockResolvedValue({ changes: 1 });
      db.get.mockResolvedValueOnce({ id: 1, invoice_number: 'INV-001', status: 'shipped', client_id: 'c1' });
      db.all.mockResolvedValue([]);
      const res = await request(createApp())
        .put('/api/erp/shipments/1')
        .set('Authorization', `Bearer ${makeToken()}`)
        .send({ paidAmount: 25000 });
      expect(res.status).toBe(200);
    });
  });
});

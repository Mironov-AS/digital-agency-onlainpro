const request = require('supertest');
const express = require('express');
const cookieParser = require('cookie-parser');

// Mock database
const mockAll = jest.fn().mockResolvedValue([]);
const mockGet = jest.fn().mockResolvedValue(null);
const mockRun = jest.fn().mockResolvedValue({ changes: 1 });
const mockPrepare = jest.fn().mockReturnValue({ get: mockGet, all: mockAll, run: mockRun });

jest.mock('../server/database', () => ({
  db: {
    prepare: mockPrepare,
    pool: { query: jest.fn().mockResolvedValue({ rows: [], rowCount: 0 }) },
  },
  getClientSetting: jest.fn().mockResolvedValue(null),
  initDb: jest.fn(),
}));

jest.mock('../server/services/logging', () => ({
  logAction: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../server/services/webhooks', () => ({
  emitAsync: jest.fn(),
}));

jest.mock('../../../shared/middleware/auth', () => {
  const jwt = require('jsonwebtoken');
  const SECRET = 'test-secret-for-booking-tests';
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
const servicesRouter = require('../server/routes/services');

const TEST_SECRET = 'test-secret-for-booking-tests';

function createApp() {
  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.use('/api/booking/catalog', servicesRouter);
  return app;
}

function makeToken(payload = {}) {
  return jwt.sign({ userId: 'u1', username: 'test', clientId: 'c1', displayName: 'Test', ...payload }, TEST_SECRET, { expiresIn: '1h' });
}

describe('Booking Services API', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('GET /', () => {
    it('возвращает список услуг', async () => {
      mockPrepare.mockReturnValueOnce({
        all: jest.fn().mockResolvedValue([{ id: '1', name: 'Мойка', status: 'active' }]),
        get: mockGet, run: mockRun,
      });
      const res = await request(createApp())
        .get('/api/booking/catalog')
        .set('Authorization', `Bearer ${makeToken()}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
    });

    it('возвращает 401 без токена', async () => {
      const res = await request(createApp()).get('/api/booking/catalog');
      expect(res.status).toBe(401);
    });
  });

  describe('GET /:id', () => {
    it('возвращает услугу по ID', async () => {
      mockPrepare.mockReturnValueOnce({
        get: jest.fn().mockResolvedValue({ id: '1', name: 'Мойка', client_id: 'c1' }),
        all: mockAll, run: mockRun,
      });
      const res = await request(createApp())
        .get('/api/booking/catalog/1')
        .set('Authorization', `Bearer ${makeToken()}`);
      expect(res.status).toBe(200);
      expect(res.body.name).toBe('Мойка');
    });

    it('возвращает 404 для несуществующей', async () => {
      mockPrepare.mockReturnValueOnce({
        get: jest.fn().mockResolvedValue(null),
        all: mockAll, run: mockRun,
      });
      const res = await request(createApp())
        .get('/api/booking/catalog/999')
        .set('Authorization', `Bearer ${makeToken()}`);
      expect(res.status).toBe(404);
    });
  });

  describe('POST /', () => {
    it('возвращает 400 без названия', async () => {
      const res = await request(createApp())
        .post('/api/booking/catalog')
        .set('Authorization', `Bearer ${makeToken()}`)
        .send({});
      expect(res.status).toBe(400);
      expect(res.body.error).toContain('обязательно');
    });

    it('возвращает 400 для слишком длинного названия', async () => {
      const res = await request(createApp())
        .post('/api/booking/catalog')
        .set('Authorization', `Bearer ${makeToken()}`)
        .send({ name: 'a'.repeat(101) });
      expect(res.status).toBe(400);
      expect(res.body.error).toContain('100');
    });
  });

  describe('DELETE /:id', () => {
    it('возвращает 409 если есть активные записи', async () => {
      mockPrepare.mockReturnValueOnce({
        get: jest.fn().mockResolvedValue({ id: '1', name: 'Мойка', client_id: 'c1' }),
        all: mockAll, run: mockRun,
      });
      mockPrepare.mockReturnValueOnce({
        get: jest.fn().mockResolvedValue({ cnt: 3 }),
        all: mockAll, run: mockRun,
      });
      const res = await request(createApp())
        .delete('/api/booking/catalog/1')
        .set('Authorization', `Bearer ${makeToken()}`);
      expect(res.status).toBe(409);
    });
  });
});

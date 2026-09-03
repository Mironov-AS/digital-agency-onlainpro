const request = require('supertest');
const express = require('express');
const cookieParser = require('cookie-parser');

const mockAll = jest.fn().mockResolvedValue([]);
const mockGet = jest.fn().mockResolvedValue(null);
const mockRun = jest.fn().mockResolvedValue({ changes: 1 });
const mockPrepare = jest.fn().mockReturnValue({ get: mockGet, all: mockAll, run: mockRun });

jest.mock('../server/database', () => ({
  db: { prepare: mockPrepare, pool: { query: jest.fn().mockResolvedValue({ rows: [], rowCount: 0 }) } },
  initDb: jest.fn(),
}));

jest.mock('../server/services/logging', () => ({ logAction: jest.fn().mockResolvedValue(undefined) }));
jest.mock('../server/services/webhooks', () => ({ emitAsync: jest.fn() }));

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
const specialistsRouter = require('../server/routes/specialists');

const TEST_SECRET = 'test-secret-for-booking-tests';

function createApp() {
  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.use('/api/booking/specialists', specialistsRouter);
  return app;
}

function makeToken() {
  return jwt.sign({ userId: 'u1', username: 'test', clientId: 'c1', displayName: 'Test' }, TEST_SECRET, { expiresIn: '1h' });
}

describe('Booking Specialists API', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('GET /', () => {
    it('возвращает список специалистов', async () => {
      mockPrepare.mockReturnValueOnce({
        all: jest.fn().mockResolvedValue([{ id: '1', name: 'Иванов', is_active: true }]),
        get: mockGet, run: mockRun,
      });
      const res = await request(createApp())
        .get('/api/booking/specialists')
        .set('Authorization', `Bearer ${makeToken()}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
    });
  });

  describe('POST /', () => {
    it('возвращает 400 без имени', async () => {
      const res = await request(createApp())
        .post('/api/booking/specialists')
        .set('Authorization', `Bearer ${makeToken()}`)
        .send({});
      expect(res.status).toBe(400);
    });
  });

  describe('DELETE /:id', () => {
    it('деактивирует специалиста с активными записями', async () => {
      mockPrepare.mockReturnValueOnce({
        get: jest.fn().mockResolvedValue({ id: '1', name: 'Иванов', client_id: 'c1' }),
        all: mockAll, run: mockRun,
      });
      mockPrepare.mockReturnValueOnce({
        get: jest.fn().mockResolvedValue({ cnt: 5 }),
        all: mockAll, run: mockRun,
      });
      mockPrepare.mockReturnValueOnce({
        run: jest.fn().mockResolvedValue({ changes: 1 }),
        get: mockGet, all: mockAll,
      });
      mockPrepare.mockReturnValueOnce({
        get: jest.fn().mockResolvedValue({ id: '1', name: 'Иванов', is_active: false }),
        all: mockAll, run: mockRun,
      });
      const res = await request(createApp())
        .delete('/api/booking/specialists/1')
        .set('Authorization', `Bearer ${makeToken()}`);
      expect(res.status).toBe(200);
      expect(res.body.deactivated).toBe(true);
    });
  });
});

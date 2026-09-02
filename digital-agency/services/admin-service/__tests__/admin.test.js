const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

const TEST_SECRET = 'test-secret';

// Mock shared/db
const mockAll = jest.fn().mockResolvedValue([]);
const mockGet = jest.fn().mockResolvedValue(null);
const mockRun = jest.fn().mockResolvedValue({ changes: 1 });
const mockPrepare = jest.fn().mockReturnValue({ get: mockGet, all: mockAll, run: mockRun });

jest.mock('../../../shared/db', () => () => ({
  prepare: mockPrepare,
  pool: { query: jest.fn().mockResolvedValue({ rows: [], rowCount: 0 }) },
  exec: jest.fn().mockResolvedValue(undefined),
  ensureSchema: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../../../shared/middleware/auth', () => {
  const jwt = require('jsonwebtoken');
  const SECRET = 'test-secret';
  return {
    requireAdmin: (req, res, next) => {
      try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) return res.status(401).json({ error: 'Требуется авторизация' });
        const user = jwt.verify(token, SECRET);
        if (user.role !== 'admin') return res.status(403).json({ error: 'Доступ запрещён' });
        req.user = user;
        next();
      } catch { return res.status(401).json({ error: 'Недействительный токен' }); }
    },
  };
});

jest.mock('nodemailer', () => ({
  createTransport: () => ({
    sendMail: jest.fn().mockResolvedValue({ messageId: 'test' }),
    verify: jest.fn().mockResolvedValue(true),
  }),
}));

jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  existsSync: jest.fn().mockReturnValue(true),
  mkdirSync: jest.fn(),
  appendFileSync: jest.fn(),
}));

// Build a test app that mirrors admin-service routes without starting a server
function createAdminApp() {
  const db = require('../../../shared/db')();
  const { requireAdmin } = require('../../../shared/middleware/auth');

  const app = express();
  app.use(express.json());
  app.use(cookieParser());

  // Public endpoints
  app.get('/api/health', (req, res) => {
    res.json({ service: 'admin-service', status: 'ok' });
  });

  app.post('/api/admin/leads', async (req, res) => {
    try {
      const { name, email, phone, subject, source } = req.body;
      if (!name || !email) return res.status(400).json({ error: 'Имя и email обязательны' });
      const id = require('crypto').randomUUID();
      const created_at = new Date().toISOString();
      await db.prepare('INSERT INTO leads (id, name, email, phone, subject, source, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
        .run(id, name.trim(), email.trim(), (phone || '').trim(), subject || 'Заявка с сайта', source || '', created_at);
      res.status(201).json({ ok: true });
    } catch (e) { res.status(500).json({ error: e.message }); }
  });

  app.get('/api/admin/smtp-status', async (_req, res) => {
    try {
      const row = await db.prepare('SELECT is_enabled FROM smtp_settings WHERE id = ?').get('default');
      res.json({ is_enabled: !!(row && row.is_enabled) });
    } catch (_e) { res.json({ is_enabled: false }); }
  });

  app.post('/api/admin/payment-request', async (req, res) => {
    try {
      const { client_name, product_name } = req.body;
      if (!client_name || !product_name) return res.status(400).json({ error: 'client_name и product_name обязательны' });
      res.json({ ok: true, message: 'Запрос на оплату отправлен' });
    } catch (e) { res.status(500).json({ error: e.message }); }
  });

  // Admin endpoints
  app.use(requireAdmin);

  app.get('/api/admin/services', (req, res) => {
    res.json({ services: {} });
  });

  app.get('/api/admin/lead-emails', async (req, res) => {
    const rows = await db.prepare('SELECT * FROM lead_emails ORDER BY created_at DESC').all();
    res.json(rows);
  });

  app.post('/api/admin/lead-emails', async (req, res) => {
    const { email, label } = req.body;
    if (!email) return res.status(400).json({ error: 'Email обязателен' });
    const id = require('crypto').randomUUID();
    await db.prepare('INSERT INTO lead_emails (id, email, label) VALUES (?, ?, ?)').run(id, email.trim().toLowerCase(), (label || '').trim());
    const row = await db.prepare('SELECT * FROM lead_emails WHERE id = ?').get(id);
    res.status(201).json(row);
  });

  app.get('/api/admin/smtp-settings', async (req, res) => {
    let row = await db.prepare('SELECT * FROM smtp_settings WHERE id = ?').get('default');
    if (!row) row = { host: '', port: 587, username: '', password: '', from_email: '', from_name: '', use_ssl: true, is_enabled: false };
    if (row.password) row.password = '********';
    res.json(row);
  });

  app.get('/api/admin/leads', async (req, res) => {
    const rows = await db.prepare('SELECT * FROM leads ORDER BY created_at DESC').all();
    res.json(rows);
  });

  return app;
}

function makeToken(role = 'admin') {
  return jwt.sign({ userId: 'u1', email: 'admin@test.ru', name: 'Admin', role }, TEST_SECRET, { expiresIn: '1h' });
}

describe('Admin Service API', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('Public Endpoints', () => {
    describe('GET /api/health', () => {
      it('возвращает health check', async () => {
        const res = await request(createAdminApp()).get('/api/health');
        expect(res.status).toBe(200);
        expect(res.body.status).toBe('ok');
        expect(res.body.service).toBe('admin-service');
      });
    });

    describe('POST /api/admin/leads', () => {
      it('создаёт лид', async () => {
        mockPrepare.mockReturnValueOnce({
          run: jest.fn().mockResolvedValue({ changes: 1 }),
          get: mockGet, all: mockAll,
        });
        const res = await request(createAdminApp())
          .post('/api/admin/leads')
          .send({ name: 'Иван', email: 'ivan@test.ru' });
        expect(res.status).toBe(201);
        expect(res.body.ok).toBe(true);
      });

      it('возвращает 400 без имени', async () => {
        const res = await request(createAdminApp())
          .post('/api/admin/leads')
          .send({ email: 'test@test.ru' });
        expect(res.status).toBe(400);
      });

      it('возвращает 400 без email', async () => {
        const res = await request(createAdminApp())
          .post('/api/admin/leads')
          .send({ name: 'Иван' });
        expect(res.status).toBe(400);
      });
    });

    describe('GET /api/admin/smtp-status', () => {
      it('возвращает статус SMTP', async () => {
        mockPrepare.mockReturnValueOnce({
          get: jest.fn().mockResolvedValue({ is_enabled: true }),
          all: mockAll, run: mockRun,
        });
        const res = await request(createAdminApp()).get('/api/admin/smtp-status');
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('is_enabled');
      });
    });

    describe('POST /api/admin/payment-request', () => {
      it('возвращает 400 без обязательных полей', async () => {
        const res = await request(createAdminApp())
          .post('/api/admin/payment-request')
          .send({});
        expect(res.status).toBe(400);
      });

      it('обрабатывает запрос с обязательными полями', async () => {
        const res = await request(createAdminApp())
          .post('/api/admin/payment-request')
          .send({ client_name: 'Клиент', product_name: 'Продукт' });
        expect(res.status).toBe(200);
        expect(res.body.ok).toBe(true);
      });
    });
  });

  describe('Admin-Authenticated Endpoints', () => {
    describe('GET /api/admin/services', () => {
      it('возвращает список сервисов', async () => {
        const res = await request(createAdminApp())
          .get('/api/admin/services')
          .set('Authorization', `Bearer ${makeToken()}`);
        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('services');
      });

      it('возвращает 401 без токена', async () => {
        const res = await request(createAdminApp()).get('/api/admin/services');
        expect(res.status).toBe(401);
      });

      it('возвращает 403 для не-admin', async () => {
        const res = await request(createAdminApp())
          .get('/api/admin/services')
          .set('Authorization', `Bearer ${makeToken('client')}`);
        expect(res.status).toBe(403);
      });
    });

    describe('GET /api/admin/lead-emails', () => {
      it('возвращает список email получателей', async () => {
        mockPrepare.mockReturnValueOnce({
          all: jest.fn().mockResolvedValue([{ id: 1, email: 'test@test.ru', is_active: true }]),
          get: mockGet, run: mockRun,
        });
        const res = await request(createAdminApp())
          .get('/api/admin/lead-emails')
          .set('Authorization', `Bearer ${makeToken()}`);
        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(1);
      });
    });

    describe('GET /api/admin/smtp-settings', () => {
      it('возвращает настройки SMTP с замаскированным паролем', async () => {
        mockPrepare.mockReturnValueOnce({
          get: jest.fn().mockResolvedValue({ id: 'default', host: 'smtp.test.ru', username: 'user', password: 'secret' }),
          all: mockAll, run: mockRun,
        });
        const res = await request(createAdminApp())
          .get('/api/admin/smtp-settings')
          .set('Authorization', `Bearer ${makeToken()}`);
        expect(res.status).toBe(200);
        expect(res.body.password).toBe('********');
      });
    });

    describe('GET /api/admin/leads', () => {
      it('возвращает список лидов', async () => {
        mockPrepare.mockReturnValueOnce({
          all: jest.fn().mockResolvedValue([{ id: 1, name: 'Иван', email: 'ivan@test.ru' }]),
          get: mockGet, run: mockRun,
        });
        const res = await request(createAdminApp())
          .get('/api/admin/leads')
          .set('Authorization', `Bearer ${makeToken()}`);
        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(1);
      });
    });
  });
});

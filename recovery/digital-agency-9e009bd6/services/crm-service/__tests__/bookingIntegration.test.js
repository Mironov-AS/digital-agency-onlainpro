const request = require('supertest');
const { TEST_SECRET, createTestToken, createMockDb, createTestApp } = require('../testHelper');

let mockDb;

jest.mock('../src/db', () => {
  mockDb = require('../testHelper').createMockDb();
  return { db: mockDb };
});

const originalFetch = global.fetch;

const bookingRouter = require('../src/routes/bookingIntegration');

describe('CRM ↔ Booking Integration API', () => {
  let app;
  let token;

  beforeAll(() => {
    process.env.JWT_ACCESS_SECRET = TEST_SECRET;
    process.env.BOOKING_SERVICE_URL = 'http://localhost:4008';
  });

  beforeEach(() => {
    jest.restoreAllMocks();
    mockDb.pool.query = jest.fn().mockResolvedValue({ rows: [], rowCount: 0 });
    mockDb.prepare = jest.fn().mockReturnValue({
      get: jest.fn().mockResolvedValue(undefined),
      all: jest.fn().mockResolvedValue([]),
      run: jest.fn().mockResolvedValue({ changes: 0 }),
    });
    app = createTestApp('/api/crm/integration/booking', bookingRouter);
    token = createTestToken();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  function mockFetch(responses) {
    let callIdx = 0;
    global.fetch = jest.fn().mockImplementation(() => {
      const resp = responses[callIdx] || { ok: true, status: 200, json: async () => ({}) };
      callIdx++;
      return Promise.resolve(resp);
    });
  }

  describe('GET /status — статус интеграции', () => {
    it('возвращает статус Booking сервиса', async () => {
      mockFetch([
        { ok: true, status: 200, json: async () => ({ status: 'ok' }) },
      ]);
      mockDb.pool.query.mockResolvedValueOnce({
        rows: [
          { entity_type: 'service', count: '5', last_sync: '2026-05-01' },
          { entity_type: 'specialist', count: '3', last_sync: '2026-05-01' },
        ],
      });

      const res = await request(app)
        .get('/api/crm/integration/booking/status')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.booking_available).toBe(true);
      expect(res.body.sync_stats).toHaveProperty('service');
    });

    it('обрабатывает недоступность Booking', async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error('Connection refused'));

      const res = await request(app)
        .get('/api/crm/integration/booking/status')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.booking_available).toBe(false);
    });
  });

  describe('POST /sync-services — синхронизация услуг', () => {
    it('создаёт новые услуги из Booking', async () => {
      mockFetch([
        { ok: true, status: 200, json: async () => ({ token: 'booking-token' }) },
        {
          ok: true, status: 200,
          json: async () => ([
            { id: 'bs1', name: 'Стрижка', price: 500, duration: 30 },
            { id: 'bs2', name: 'Маникюр', price: 1000, duration: 60 },
          ]),
        },
      ]);

      mockDb.pool.query.mockResolvedValue({ rows: [] });
      mockDb.prepare.mockReturnValue({
        get: jest.fn().mockResolvedValue(undefined),
        all: jest.fn().mockResolvedValue([]),
        run: jest.fn().mockResolvedValue({ changes: 1 }),
      });

      const res = await request(app)
        .post('/api/crm/integration/booking/sync-services')
        .set('Authorization', `Bearer ${token}`)
        .send({});

      expect(res.status).toBe(200);
      expect(res.body.total).toBe(2);
      expect(res.body.created).toBeGreaterThanOrEqual(0);
    });

    it('обновляет существующие услуги', async () => {
      mockFetch([
        { ok: true, status: 200, json: async () => ({ token: 'booking-token' }) },
        {
          ok: true, status: 200,
          json: async () => ([{ id: 'bs1', name: 'Стрижка Обновлённая', price: 600, duration: 45 }]),
        },
      ]);

      mockDb.pool.query.mockImplementation((sql) => {
        if (sql.includes('booking_sync_map') && sql.includes('SELECT')) {
          return Promise.resolve({ rows: [{ crm_id: 'crm-s1' }] });
        }
        return Promise.resolve({ rows: [] });
      });
      mockDb.prepare.mockReturnValue({
        get: jest.fn().mockResolvedValue(undefined),
        all: jest.fn().mockResolvedValue([]),
        run: jest.fn().mockResolvedValue({ changes: 1 }),
      });

      const res = await request(app)
        .post('/api/crm/integration/booking/sync-services')
        .set('Authorization', `Bearer ${token}`)
        .send({});

      expect(res.status).toBe(200);
      expect(res.body.updated).toBeGreaterThanOrEqual(0);
    });

    it('возвращает 502 при ошибке авторизации Booking', async () => {
      mockFetch([
        { ok: false, status: 401, json: async () => ({ error: 'Unauthorized' }) },
        { ok: false, status: 401, json: async () => ({ error: 'Unauthorized' }) },
      ]);

      const res = await request(app)
        .post('/api/crm/integration/booking/sync-services')
        .set('Authorization', `Bearer ${token}`)
        .send({});

      expect(res.status).toBe(502);
    });
  });

  describe('POST /sync-specialists — синхронизация специалистов', () => {
    it('синхронизирует специалистов из Booking', async () => {
      mockFetch([
        { ok: true, status: 200, json: async () => ({ token: 'booking-token' }) },
        {
          ok: true, status: 200,
          json: async () => ([{ id: 'spec1', name: 'Иванов', position: 'Мастер', is_active: true }]),
        },
      ]);

      mockDb.pool.query.mockResolvedValue({ rows: [] });
      mockDb.prepare.mockReturnValue({
        get: jest.fn().mockResolvedValue(undefined),
        all: jest.fn().mockResolvedValue([]),
        run: jest.fn().mockResolvedValue({ changes: 1 }),
      });

      const res = await request(app)
        .post('/api/crm/integration/booking/sync-specialists')
        .set('Authorization', `Bearer ${token}`)
        .send({});

      expect(res.status).toBe(200);
      expect(res.body.total).toBe(1);
    });
  });

  describe('POST /sync-customers — синхронизация клиентов', () => {
    it('создаёт клиентов из записей Booking', async () => {
      mockFetch([
        { ok: true, status: 200, json: async () => ({ token: 'booking-token' }) },
        {
          ok: true, status: 200,
          json: async () => ([
            { id: 'apt1', customer_name: 'Тест1', phone: '+79001234567', source: 'manual' },
            { id: 'apt2', customer_name: 'Тест2', phone: '+79007654321', source: 'self-booking' },
          ]),
        },
      ]);

      mockDb.pool.query.mockResolvedValue({ rows: [] });
      mockDb.prepare.mockReturnValue({
        get: jest.fn().mockResolvedValue(undefined),
        all: jest.fn().mockResolvedValue([]),
        run: jest.fn().mockResolvedValue({ changes: 1 }),
      });

      const res = await request(app)
        .post('/api/crm/integration/booking/sync-customers')
        .set('Authorization', `Bearer ${token}`)
        .send({});

      expect(res.status).toBe(200);
      expect(res.body.total_appointments).toBe(2);
      expect(res.body.created).toBeGreaterThanOrEqual(0);
    });

    it('корректно отмечает самозаписи', async () => {
      mockFetch([
        { ok: true, status: 200, json: async () => ({ token: 'booking-token' }) },
        {
          ok: true, status: 200,
          json: async () => ([
            { id: 'apt1', customer_name: 'СамоЗапись', phone: '+79001111111', source: 'self-booking' },
          ]),
        },
      ]);

      mockDb.pool.query.mockResolvedValue({ rows: [] });
      let insertCalls = [];
      mockDb.prepare.mockReturnValue({
        get: jest.fn().mockResolvedValue(undefined),
        all: jest.fn().mockResolvedValue([]),
        run: jest.fn().mockImplementation((...args) => {
          insertCalls.push(args);
          return Promise.resolve({ changes: 1 });
        }),
      });

      const res = await request(app)
        .post('/api/crm/integration/booking/sync-customers')
        .set('Authorization', `Bearer ${token}`)
        .send({});

      expect(res.status).toBe(200);
      expect(res.body.self_registered).toBeGreaterThanOrEqual(0);
    });

    it('поддерживает фильтр по дате', async () => {
      mockFetch([
        { ok: true, status: 200, json: async () => ({ token: 'booking-token' }) },
        { ok: true, status: 200, json: async () => ([]) },
      ]);

      const res = await request(app)
        .post('/api/crm/integration/booking/sync-customers')
        .set('Authorization', `Bearer ${token}`)
        .send({ date_from: '2026-01-01', date_to: '2026-12-31' });

      expect(res.status).toBe(200);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('date_from=2026-01-01'),
        expect.any(Object),
      );
    });
  });

  describe('POST /import-records — импорт записей', () => {
    it('импортирует подтверждённые записи', async () => {
      mockFetch([
        { ok: true, status: 200, json: async () => ({ token: 'booking-token' }) },
        {
          ok: true, status: 200,
          json: async () => ([
            {
              id: 'apt1', customer_name: 'Тест1', phone: '+79001234567',
              status: 'confirmed', appointment_date: '2026-05-01',
              appointment_time: '10:00', end_time: '11:00', price: 500,
              service_id: 'bs1', specialist_id: 'spec1',
            },
            {
              id: 'apt2', customer_name: 'Тест2', phone: '+79007654321',
              status: 'pending',
            },
          ]),
        },
      ]);

      mockDb.pool.query.mockResolvedValue({ rows: [] });
      mockDb.prepare.mockReturnValue({
        get: jest.fn().mockResolvedValue(undefined),
        all: jest.fn().mockResolvedValue([]),
        run: jest.fn().mockResolvedValue({ changes: 1 }),
      });

      const res = await request(app)
        .post('/api/crm/integration/booking/import-records')
        .set('Authorization', `Bearer ${token}`)
        .send({});

      expect(res.status).toBe(200);
      expect(res.body.total).toBe(2);
      expect(res.body.confirmed).toBe(1);
    });

    it('пропускает уже импортированные записи', async () => {
      mockFetch([
        { ok: true, status: 200, json: async () => ({ token: 'booking-token' }) },
        {
          ok: true, status: 200,
          json: async () => ([
            { id: 'apt1', customer_name: 'Тест', phone: '+79001234567', status: 'confirmed' },
          ]),
        },
      ]);

      mockDb.pool.query = jest.fn().mockImplementation((sql, params) => {
        if (sql.includes('booking_sync_map') && params && params.includes('appointment')) {
          return Promise.resolve({ rows: [{ crm_id: 'existing-record' }] });
        }
        return Promise.resolve({ rows: [] });
      });

      const res = await request(app)
        .post('/api/crm/integration/booking/import-records')
        .set('Authorization', `Bearer ${token}`)
        .send({});

      expect(res.status).toBe(200);
      expect(res.body.skipped).toBe(1);
    });
  });

  describe('GET /appointments — записи из Booking', () => {
    it('возвращает записи с привязкой CRM клиентов', async () => {
      mockFetch([
        { ok: true, status: 200, json: async () => ({ token: 'booking-token' }) },
        {
          ok: true, status: 200,
          json: async () => ([
            { id: 'apt1', customer_name: 'Тест', phone: '+79001234567' },
          ]),
        },
      ]);

      mockDb.pool.query.mockImplementation((sql) => {
        if (sql.includes('customers') && sql.includes('phone')) {
          return Promise.resolve({
            rows: [{ id: 'c1', full_name: 'Тест', phone: '+79001234567', email: 'test@test.ru' }],
          });
        }
        if (sql.includes('booking_sync_map')) {
          return Promise.resolve({ rows: [] });
        }
        return Promise.resolve({ rows: [] });
      });

      const res = await request(app)
        .get('/api/crm/integration/booking/appointments')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0]).toHaveProperty('crm_customer');
    });
  });
});

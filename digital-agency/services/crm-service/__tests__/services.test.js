const request = require('supertest');
const { TEST_SECRET, createTestToken, createMockDb, createTestApp } = require('../testHelper');

let mockDb;

jest.mock('../src/db', () => {
  mockDb = require('../testHelper').createMockDb();
  return { db: mockDb };
});

const servicesRouter = require('../src/routes/services');

describe('CRM Services API', () => {
  let app;
  let token;

  beforeAll(() => {
    process.env.JWT_ACCESS_SECRET = TEST_SECRET;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockDb.pool.query.mockResolvedValue({ rows: [], rowCount: 0 });
    mockDb.prepare.mockReturnValue({
      get: jest.fn().mockResolvedValue(undefined),
      all: jest.fn().mockResolvedValue([]),
      run: jest.fn().mockResolvedValue({ changes: 0 }),
    });
    app = createTestApp('/api/crm/services', servicesRouter);
    token = createTestToken();
  });

  describe('GET / — список услуг', () => {
    it('возвращает все услуги', async () => {
      const services = [
        { id: 's1', name: 'Стрижка', price: 500, duration: 30 },
        { id: 's2', name: 'Маникюр', price: 1000, duration: 60 },
      ];
      mockDb.pool.query.mockResolvedValueOnce({ rows: services });

      const res = await request(app)
        .get('/api/crm/services')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);
    });

    it('фильтрует по категории', async () => {
      mockDb.pool.query.mockResolvedValueOnce({ rows: [] });

      const res = await request(app)
        .get('/api/crm/services?category_id=cat1')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(mockDb.pool.query).toHaveBeenCalledWith(
        expect.stringContaining('category_id'),
        expect.arrayContaining(['cat1']),
      );
    });

    it('фильтрует по статусу', async () => {
      mockDb.pool.query.mockResolvedValueOnce({ rows: [] });

      const res = await request(app)
        .get('/api/crm/services?status=active')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
    });

    it('поддерживает текстовый поиск', async () => {
      mockDb.pool.query.mockResolvedValueOnce({ rows: [] });

      const res = await request(app)
        .get('/api/crm/services?search=Стрижка')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
    });
  });

  describe('POST / — создание услуги', () => {
    it('создаёт новую услугу', async () => {
      const created = { id: 'new-s', name: 'Стрижка', price: 500, duration: 30 };
      mockDb.prepare.mockReturnValue({
        get: jest.fn().mockResolvedValue(created),
        all: jest.fn().mockResolvedValue([]),
        run: jest.fn().mockResolvedValue({ changes: 1 }),
      });

      const res = await request(app)
        .post('/api/crm/services')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Стрижка', price: 500, duration: 30 });

      expect(res.status).toBe(201);
      expect(res.body.name).toBe('Стрижка');
    });

    it('возвращает 400 без названия', async () => {
      const res = await request(app)
        .post('/api/crm/services')
        .set('Authorization', `Bearer ${token}`)
        .send({ price: 500 });

      expect(res.status).toBe(400);
    });
  });

  describe('PUT /:id — обновление услуги', () => {
    it('обновляет данные услуги', async () => {
      const updated = { id: 's1', name: 'Обновлённая', price: 700 };
      mockDb.prepare.mockReturnValue({
        get: jest.fn().mockResolvedValue(updated),
        all: jest.fn().mockResolvedValue([]),
        run: jest.fn().mockResolvedValue({ changes: 1 }),
      });

      const res = await request(app)
        .put('/api/crm/services/s1')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Обновлённая', price: 700 });

      expect(res.status).toBe(200);
    });

    it('возвращает 404 если услуга не найдена', async () => {
      mockDb.prepare.mockReturnValue({
        get: jest.fn().mockResolvedValue(undefined),
        all: jest.fn().mockResolvedValue([]),
        run: jest.fn().mockResolvedValue({ changes: 0 }),
      });

      const res = await request(app)
        .put('/api/crm/services/nonexistent')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Test' });

      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /:id — архивация услуги', () => {
    it('архивирует услугу (soft delete)', async () => {
      mockDb.prepare.mockReturnValue({
        get: jest.fn().mockResolvedValue(undefined),
        all: jest.fn().mockResolvedValue([]),
        run: jest.fn().mockResolvedValue({ changes: 1 }),
      });

      const res = await request(app)
        .delete('/api/crm/services/s1')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
    });
  });
});

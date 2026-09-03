const request = require('supertest');
const { TEST_SECRET, createTestToken, createMockDb, createTestApp } = require('../testHelper');

let mockDb;

jest.mock('../src/db', () => {
  mockDb = require('../testHelper').createMockDb();
  return { db: mockDb };
});

const workRecordsRouter = require('../src/routes/workRecords');

describe('CRM Work Records API', () => {
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
    app = createTestApp('/api/crm/work-records', workRecordsRouter);
    token = createTestToken();
  });

  describe('GET / — список записей', () => {
    it('возвращает записи работ с пагинацией', async () => {
      mockDb.pool.query
        .mockResolvedValueOnce({ rows: [{ total: '1' }] })
        .mockResolvedValueOnce({
          rows: [{ id: 'wr1', customer_name: 'Тест', service_name: 'Стрижка', duration: 60, price: 500 }],
        });

      const res = await request(app)
        .get('/api/crm/work-records?page=1&limit=50')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.items).toHaveLength(1);
      expect(res.body.total).toBe(1);
    });

    it('фильтрует по клиенту', async () => {
      mockDb.pool.query
        .mockResolvedValueOnce({ rows: [{ total: '0' }] })
        .mockResolvedValueOnce({ rows: [] });

      const res = await request(app)
        .get('/api/crm/work-records?customer_id=c1')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(mockDb.pool.query).toHaveBeenCalledWith(
        expect.stringContaining('customer_id'),
        expect.arrayContaining(['c1']),
      );
    });

    it('фильтрует по дате', async () => {
      mockDb.pool.query
        .mockResolvedValueOnce({ rows: [{ total: '0' }] })
        .mockResolvedValueOnce({ rows: [] });

      const res = await request(app)
        .get('/api/crm/work-records?from=2026-01-01&to=2026-12-31')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
    });

    it('фильтрует по сотруднику и услуге', async () => {
      mockDb.pool.query
        .mockResolvedValueOnce({ rows: [{ total: '0' }] })
        .mockResolvedValueOnce({ rows: [] });

      const res = await request(app)
        .get('/api/crm/work-records?employee_id=e1&service_id=s1')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
    });
  });

  describe('POST / — создание записи', () => {
    it('создаёт запись работы', async () => {
      const created = { id: 'wr-new', customer_id: 'c1', service_id: 's1', duration: 60, price: 500 };
      mockDb.prepare.mockReturnValue({
        get: jest.fn().mockResolvedValue(created),
        all: jest.fn().mockResolvedValue([]),
        run: jest.fn().mockResolvedValue({ changes: 1 }),
      });

      const res = await request(app)
        .post('/api/crm/work-records')
        .set('Authorization', `Bearer ${token}`)
        .send({
          customer_id: 'c1',
          service_id: 's1',
          employee_id: 'e1',
          performed_at: '2026-05-01T10:00:00',
          duration: 60,
          price: 500,
        });

      expect(res.status).toBe(201);
    });

    it('возвращает 400 без customer_id', async () => {
      const res = await request(app)
        .post('/api/crm/work-records')
        .set('Authorization', `Bearer ${token}`)
        .send({ service_id: 's1', duration: 60 });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('Клиент');
    });
  });

  describe('PUT /:id — обновление записи', () => {
    it('обновляет запись работы', async () => {
      const updated = { id: 'wr1', customer_id: 'c1', duration: 90, price: 700 };
      mockDb.prepare.mockReturnValue({
        get: jest.fn().mockResolvedValue(updated),
        all: jest.fn().mockResolvedValue([]),
        run: jest.fn().mockResolvedValue({ changes: 1 }),
      });

      const res = await request(app)
        .put('/api/crm/work-records/wr1')
        .set('Authorization', `Bearer ${token}`)
        .send({ customer_id: 'c1', duration: 90, price: 700 });

      expect(res.status).toBe(200);
    });
  });

  describe('DELETE /:id — удаление записи', () => {
    it('удаляет запись работы', async () => {
      mockDb.prepare.mockReturnValue({
        get: jest.fn().mockResolvedValue(undefined),
        all: jest.fn().mockResolvedValue([]),
        run: jest.fn().mockResolvedValue({ changes: 1 }),
      });

      const res = await request(app)
        .delete('/api/crm/work-records/wr1')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
    });

    it('возвращает 404 если запись не найдена', async () => {
      mockDb.prepare.mockReturnValue({
        get: jest.fn().mockResolvedValue(undefined),
        all: jest.fn().mockResolvedValue([]),
        run: jest.fn().mockResolvedValue({ changes: 0 }),
      });

      const res = await request(app)
        .delete('/api/crm/work-records/nonexistent')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
    });
  });
});

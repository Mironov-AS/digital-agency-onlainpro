const request = require('supertest');
const { TEST_SECRET, createTestToken, createMockDb, createTestApp } = require('../testHelper');

let mockDb;

jest.mock('../src/db', () => {
  mockDb = require('../testHelper').createMockDb();
  return { db: mockDb };
});

const employeesRouter = require('../src/routes/employees');

describe('CRM Employees API', () => {
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
    app = createTestApp('/api/crm/employees', employeesRouter);
    token = createTestToken();
  });

  describe('GET / — список сотрудников', () => {
    it('возвращает всех сотрудников', async () => {
      const employees = [
        { id: 'e1', full_name: 'Иванов Иван', position: 'Мастер', is_active: true },
      ];
      mockDb.pool.query.mockResolvedValueOnce({ rows: employees });

      const res = await request(app)
        .get('/api/crm/employees')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
    });

    it('фильтрует только активных', async () => {
      mockDb.pool.query.mockResolvedValueOnce({ rows: [] });

      const res = await request(app)
        .get('/api/crm/employees?active_only=true')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(mockDb.pool.query).toHaveBeenCalledWith(
        expect.stringContaining('is_active'),
        expect.any(Array),
      );
    });

    it('поддерживает поиск', async () => {
      mockDb.pool.query.mockResolvedValueOnce({ rows: [] });

      const res = await request(app)
        .get('/api/crm/employees?search=Иванов')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
    });
  });

  describe('POST / — создание сотрудника', () => {
    it('создаёт сотрудника', async () => {
      const created = { id: 'new-e', full_name: 'Петров Пётр', position: 'Мастер' };
      mockDb.prepare.mockReturnValue({
        get: jest.fn().mockResolvedValue(created),
        all: jest.fn().mockResolvedValue([]),
        run: jest.fn().mockResolvedValue({ changes: 1 }),
      });

      const res = await request(app)
        .post('/api/crm/employees')
        .set('Authorization', `Bearer ${token}`)
        .send({ full_name: 'Петров Пётр', position: 'Мастер', phone: '+79001234567' });

      expect(res.status).toBe(201);
    });

    it('возвращает 400 без ФИО', async () => {
      const res = await request(app)
        .post('/api/crm/employees')
        .set('Authorization', `Bearer ${token}`)
        .send({ position: 'Мастер' });

      expect(res.status).toBe(400);
    });
  });

  describe('PUT /:id — обновление сотрудника', () => {
    it('обновляет данные сотрудника', async () => {
      const updated = { id: 'e1', full_name: 'Обновлённый', position: 'Старший мастер' };
      mockDb.prepare.mockReturnValue({
        get: jest.fn().mockResolvedValue(updated),
        all: jest.fn().mockResolvedValue([]),
        run: jest.fn().mockResolvedValue({ changes: 1 }),
      });

      const res = await request(app)
        .put('/api/crm/employees/e1')
        .set('Authorization', `Bearer ${token}`)
        .send({ full_name: 'Обновлённый', position: 'Старший мастер' });

      expect(res.status).toBe(200);
    });
  });

  describe('GET /:id/workload — загрузка сотрудника', () => {
    it('возвращает загрузку с часами', async () => {
      const records = [
        { id: 'wr1', duration: 60, service_name: 'Стрижка', customer_name: 'Тест' },
        { id: 'wr2', duration: 120, service_name: 'Маникюр', customer_name: 'Тест2' },
      ];
      mockDb.pool.query.mockResolvedValueOnce({ rows: records });

      const res = await request(app)
        .get('/api/crm/employees/e1/workload')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.total_records).toBe(2);
      expect(res.body.total_hours).toBe(3);
    });

    it('фильтрует по дате', async () => {
      mockDb.pool.query.mockResolvedValueOnce({ rows: [] });

      const res = await request(app)
        .get('/api/crm/employees/e1/workload?from=2026-01-01&to=2026-12-31')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(mockDb.pool.query).toHaveBeenCalledWith(
        expect.stringContaining('performed_at'),
        expect.any(Array),
      );
    });
  });

  describe('DELETE /:id — деактивация сотрудника', () => {
    it('деактивирует сотрудника (soft delete)', async () => {
      mockDb.prepare.mockReturnValue({
        get: jest.fn().mockResolvedValue(undefined),
        all: jest.fn().mockResolvedValue([]),
        run: jest.fn().mockResolvedValue({ changes: 1 }),
      });

      const res = await request(app)
        .delete('/api/crm/employees/e1')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
    });
  });
});

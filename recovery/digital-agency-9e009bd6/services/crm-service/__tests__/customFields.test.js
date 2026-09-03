const request = require('supertest');
const { TEST_SECRET, createTestToken, createMockDb, createTestApp } = require('../testHelper');

let mockDb;

jest.mock('../src/db', () => {
  mockDb = require('../testHelper').createMockDb();
  return { db: mockDb };
});

const customFieldsRouter = require('../src/routes/customFields');

describe('CRM Custom Fields API', () => {
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
    app = createTestApp('/api/crm/custom-fields', customFieldsRouter);
    token = createTestToken();
  });

  describe('GET / — список полей', () => {
    it('возвращает только активные поля', async () => {
      const fields = [
        { id: 'f1', name: 'ИНН', field_type: 'text', options: '[]', is_deleted: false },
        { id: 'f2', name: 'Скидка', field_type: 'number', options: '[]', is_deleted: false },
      ];
      mockDb.pool.query.mockResolvedValueOnce({ rows: fields });

      const res = await request(app)
        .get('/api/crm/custom-fields')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);
    });

    it('включает удалённые при include_deleted=true', async () => {
      mockDb.pool.query.mockResolvedValueOnce({ rows: [] });

      const res = await request(app)
        .get('/api/crm/custom-fields?include_deleted=true')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(mockDb.pool.query).toHaveBeenCalledWith(
        expect.not.stringContaining('is_deleted = FALSE'),
        expect.any(Array),
      );
    });
  });

  describe('POST / — создание поля', () => {
    it('создаёт текстовое поле', async () => {
      const created = { id: 'new-f', name: 'ИНН', field_type: 'text', options: '[]' };
      mockDb.pool.query
        .mockResolvedValueOnce({ rows: [{ c: '0' }] })
        .mockResolvedValueOnce({ rows: [] });
      mockDb.prepare.mockReturnValue({
        get: jest.fn().mockResolvedValue(created),
        all: jest.fn().mockResolvedValue([]),
        run: jest.fn().mockResolvedValue({ changes: 1 }),
      });

      const res = await request(app)
        .post('/api/crm/custom-fields')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'ИНН', field_type: 'text' });

      expect(res.status).toBe(201);
    });

    it('создаёт поле типа список с опциями', async () => {
      const created = { id: 'new-f', name: 'Статус', field_type: 'list', options: '["Активный","Неактивный"]' };
      mockDb.pool.query
        .mockResolvedValueOnce({ rows: [{ c: '0' }] })
        .mockResolvedValueOnce({ rows: [] });
      mockDb.prepare.mockReturnValue({
        get: jest.fn().mockResolvedValue(created),
        all: jest.fn().mockResolvedValue([]),
        run: jest.fn().mockResolvedValue({ changes: 1 }),
      });

      const res = await request(app)
        .post('/api/crm/custom-fields')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Статус', field_type: 'list', options: ['Активный', 'Неактивный'] });

      expect(res.status).toBe(201);
    });

    it('возвращает 400 без названия', async () => {
      const res = await request(app)
        .post('/api/crm/custom-fields')
        .set('Authorization', `Bearer ${token}`)
        .send({ field_type: 'text' });

      expect(res.status).toBe(400);
    });

    it('возвращает 400 для неверного типа', async () => {
      const res = await request(app)
        .post('/api/crm/custom-fields')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Тест', field_type: 'invalid' });

      expect(res.status).toBe(400);
    });

    it('отклоняет превышение лимита полей', async () => {
      mockDb.pool.query.mockResolvedValueOnce({ rows: [{ c: '50' }] });

      const res = await request(app)
        .post('/api/crm/custom-fields')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Новое', field_type: 'text' });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('Максимум');
    });

    it('отклоняет дубликаты названий', async () => {
      mockDb.pool.query
        .mockResolvedValueOnce({ rows: [{ c: '5' }] })
        .mockResolvedValueOnce({ rows: [{ id: 'existing' }] });

      const res = await request(app)
        .post('/api/crm/custom-fields')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Существующее', field_type: 'text' });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('уже существует');
    });
  });

  describe('PUT /:id — обновление поля', () => {
    it('обновляет название поля', async () => {
      const field = { id: 'f1', name: 'Старое', field_type: 'text', sort_order: 0 };
      const updated = { ...field, name: 'Новое', options: '[]' };

      mockDb.prepare.mockReturnValue({
        get: jest.fn().mockResolvedValueOnce(field).mockResolvedValueOnce(updated),
        all: jest.fn().mockResolvedValue([]),
        run: jest.fn().mockResolvedValue({ changes: 1 }),
      });
      mockDb.pool.query.mockResolvedValue({ rows: [] });

      const res = await request(app)
        .put('/api/crm/custom-fields/f1')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Новое', field_type: 'text' });

      expect(res.status).toBe(200);
    });
  });

  describe('DELETE /:id — удаление поля', () => {
    it('soft-delete поля', async () => {
      mockDb.prepare.mockReturnValue({
        get: jest.fn().mockResolvedValue(undefined),
        all: jest.fn().mockResolvedValue([]),
        run: jest.fn().mockResolvedValue({ changes: 1 }),
      });

      const res = await request(app)
        .delete('/api/crm/custom-fields/f1')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
    });
  });

  describe('POST /:id/restore — восстановление поля', () => {
    it('восстанавливает удалённое поле', async () => {
      const restored = { id: 'f1', name: 'Восстановленное', is_deleted: false, options: '[]' };
      mockDb.prepare.mockReturnValue({
        get: jest.fn().mockResolvedValue(restored),
        all: jest.fn().mockResolvedValue([]),
        run: jest.fn().mockResolvedValue({ changes: 1 }),
      });

      const res = await request(app)
        .post('/api/crm/custom-fields/f1/restore')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
    });
  });
});

const request = require('supertest');
const { TEST_SECRET, createTestToken, createAdminToken, createMockDb, createTestApp } = require('../testHelper');

let mockDb;

jest.mock('../src/db', () => {
  mockDb = require('../testHelper').createMockDb();
  return { db: mockDb };
});

const customersRouter = require('../src/routes/customers');

describe('CRM Customers API', () => {
  let app;
  let token;
  let adminToken;

  beforeAll(() => {
    process.env.JWT_ACCESS_SECRET = TEST_SECRET;
  });

  beforeEach(() => {
    jest.restoreAllMocks();
    mockDb.pool.query = jest.fn().mockResolvedValue({ rows: [], rowCount: 0 });
    mockDb.prepare = jest.fn().mockReturnValue({
      get: jest.fn().mockResolvedValue(undefined),
      all: jest.fn().mockResolvedValue([]),
      run: jest.fn().mockResolvedValue({ changes: 0 }),
    });

    app = createTestApp('/api/crm/customers', customersRouter);
    token = createTestToken({ email: 'test1@test.ru', clientId: 'test-client-1' });
    adminToken = createAdminToken();
  });

  describe('GET / — список клиентов', () => {
    it('возвращает 401 без токена', async () => {
      const res = await request(app).get('/api/crm/customers');
      expect(res.status).toBe(401);
    });

    it('возвращает список клиентов с пагинацией', async () => {
      let n = 0;
      mockDb.pool.query = jest.fn().mockImplementation(() => {
        n++;
        if (n === 1) return Promise.resolve({ rows: [{ total: '2' }] });
        if (n === 2) return Promise.resolve({
          rows: [
            { id: 'c1', full_name: 'Тест1', phone: '+79001234567', client_id: 'test-client-1' },
            { id: 'c2', full_name: 'Тест2', phone: '+79007654321', client_id: 'test-client-1' },
          ],
        });
        return Promise.resolve({ rows: [] });
      });

      const res = await request(app)
        .get('/api/crm/customers?page=1&limit=30')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('items');
      expect(res.body).toHaveProperty('total');
      expect(res.body).toHaveProperty('page');
    });

    it('фильтрует self-registered клиентов', async () => {
      let callNum = 0;
      mockDb.pool.query = jest.fn().mockImplementation(() => {
        callNum++;
        if (callNum === 1) return Promise.resolve({ rows: [{ total: '1' }] });
        if (callNum === 2) return Promise.resolve({
          rows: [{ id: 'c1', full_name: 'СамоЗапись', is_self_registered: true, client_id: 'test-client-1' }],
        });
        return Promise.resolve({ rows: [] });
      });

      const res = await request(app)
        .get('/api/crm/customers?self_registered_only=true')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
    });

    it('поддерживает текстовый поиск', async () => {
      mockDb.prepare = jest.fn().mockReturnValue({
        get: jest.fn().mockResolvedValue({ config: JSON.stringify({ columns: ['full_name', 'phone', 'email'] }) }),
        all: jest.fn().mockResolvedValue([]),
        run: jest.fn().mockResolvedValue({ changes: 0 }),
      });
      let callNum = 0;
      mockDb.pool.query = jest.fn().mockImplementation(() => {
        callNum++;
        if (callNum === 1) return Promise.resolve({ rows: [{ total: '1' }] });
        if (callNum === 2) return Promise.resolve({
          rows: [{ id: 'c1', full_name: 'Тест1', phone: '+79001234567', email: 'test1@test.ru' }],
        });
        return Promise.resolve({ rows: [] });
      });

      const res = await request(app)
        .get('/api/crm/customers?search=Тест1')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
    });
  });

  describe('GET /self-registered/count', () => {
    it('возвращает количество самозаписавшихся', async () => {
      mockDb.pool.query = jest.fn().mockResolvedValue({ rows: [{ total: '5' }] });

      const res = await request(app)
        .get('/api/crm/customers/self-registered/count')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ count: 5 });
    });
  });

  describe('GET /self-registered', () => {
    it('возвращает список самозаписавшихся с пагинацией', async () => {
      let n = 0;
      mockDb.pool.query = jest.fn().mockImplementation(() => {
        n++;
        if (n === 1) return Promise.resolve({ rows: [{ total: '1' }] });
        if (n === 2) return Promise.resolve({
          rows: [{ id: 'sr1', full_name: 'Самозапись', is_self_registered: true }],
        });
        return Promise.resolve({ rows: [] });
      });

      const res = await request(app)
        .get('/api/crm/customers/self-registered?page=1&limit=30')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.items).toHaveLength(1);
    });
  });

  describe('GET /:id — детали клиента', () => {
    it('возвращает клиента по id', async () => {
      const customer = { id: 'c1', full_name: 'Тест1', phone: '+79001234567', email: 'test1@test.ru' };
      const get = jest.fn().mockResolvedValue(customer);
      mockDb.prepare.mockReturnValue({
        get,
        all: jest.fn().mockResolvedValue([]),
        run: jest.fn().mockResolvedValue({ changes: 0 }),
      });
      mockDb.pool.query.mockResolvedValue({ rows: [] });

      const res = await request(app)
        .get('/api/crm/customers/c1')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.full_name).toBe('Тест1');
      expect(get).toHaveBeenCalledWith('c1', 'test-client-1');
    });

    it('возвращает 404 если клиент не найден', async () => {
      mockDb.prepare.mockReturnValue({
        get: jest.fn().mockResolvedValue(undefined),
        all: jest.fn().mockResolvedValue([]),
        run: jest.fn().mockResolvedValue({ changes: 0 }),
      });

      const res = await request(app)
        .get('/api/crm/customers/nonexistent')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
    });
  });

  describe('POST / — создание клиента', () => {
    it('создаёт клиента с обязательными полями', async () => {
      const created = { id: 'new-id', full_name: 'Тест1', phone: '+79001234567', email: 'test1@test.ru', client_id: 'test-client-1' };
      const mockPrepare = {
        get: jest.fn().mockResolvedValue(created),
        all: jest.fn().mockResolvedValue([]),
        run: jest.fn().mockResolvedValue({ changes: 1 }),
      };
      mockDb.prepare.mockReturnValue(mockPrepare);
      mockDb.pool.query.mockResolvedValue({ rows: [] });

      const res = await request(app)
        .post('/api/crm/customers')
        .set('Authorization', `Bearer ${token}`)
        .send({ full_name: 'Тест1', phone: '+79001234567', email: 'test1@test.ru' });

      expect(res.status).toBe(201);
      expect(res.body.full_name).toBe('Тест1');
    });

    it('возвращает 400 без ФИО', async () => {
      const res = await request(app)
        .post('/api/crm/customers')
        .set('Authorization', `Bearer ${token}`)
        .send({ phone: '+79001234567' });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('ФИО');
    });

    it('возвращает 400 без телефона', async () => {
      const res = await request(app)
        .post('/api/crm/customers')
        .set('Authorization', `Bearer ${token}`)
        .send({ full_name: 'Тест' });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('телефон');
    });

    it('сохраняет custom values', async () => {
      const created = { id: 'cust-1', full_name: 'Тест1', phone: '+79001234567' };
      const mockPrepare = {
        get: jest.fn().mockResolvedValue(created),
        all: jest.fn().mockResolvedValue([]),
        run: jest.fn().mockResolvedValue({ changes: 1 }),
      };
      mockDb.prepare.mockReturnValue(mockPrepare);
      mockDb.pool.query.mockResolvedValue({ rows: [] });

      const res = await request(app)
        .post('/api/crm/customers')
        .set('Authorization', `Bearer ${token}`)
        .send({
          full_name: 'Тест1',
          phone: '+79001234567',
          custom_values: { 'field-1': 'value-1', 'field-2': 'value-2' },
        });

      expect(res.status).toBe(201);
      expect(mockDb.pool.query).toHaveBeenCalled();
    });
  });

  describe('PUT /:id — обновление клиента', () => {
    it('обновляет данные клиента', async () => {
      const updated = { id: 'c1', full_name: 'Обновлённый', phone: '+79001234567', email: 'new@test.ru' };
      const mockPrepare = {
        get: jest.fn().mockResolvedValue(updated),
        all: jest.fn().mockResolvedValue([]),
        run: jest.fn().mockResolvedValue({ changes: 1 }),
      };
      mockDb.prepare.mockReturnValue(mockPrepare);
      mockDb.pool.query.mockResolvedValue({ rows: [] });

      const res = await request(app)
        .put('/api/crm/customers/c1')
        .set('Authorization', `Bearer ${token}`)
        .send({ full_name: 'Обновлённый', phone: '+79001234567', email: 'new@test.ru' });

      expect(res.status).toBe(200);
      expect(res.body.full_name).toBe('Обновлённый');
    });

    it('возвращает 400 без обязательных полей', async () => {
      const res = await request(app)
        .put('/api/crm/customers/c1')
        .set('Authorization', `Bearer ${token}`)
        .send({ email: 'new@test.ru' });

      expect(res.status).toBe(400);
    });
  });

  describe('DELETE /:id — удаление клиента', () => {
    it('удаляет клиента и его custom values', async () => {
      const mockPrepare = {
        get: jest.fn().mockResolvedValue({ id: 'c1' }),
        all: jest.fn().mockResolvedValue([]),
        run: jest.fn().mockResolvedValue({ changes: 1 }),
      };
      mockDb.prepare.mockReturnValue(mockPrepare);

      const res = await request(app)
        .delete('/api/crm/customers/c1')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(mockPrepare.get).toHaveBeenCalledWith('c1', 'test-client-1');
      expect(mockPrepare.run).toHaveBeenCalledWith('c1', 'test-client-1');
    });

    it('возвращает 404 если клиент не найден', async () => {
      const mockPrepare = {
        get: jest.fn().mockResolvedValue(undefined),
        all: jest.fn().mockResolvedValue([]),
        run: jest.fn().mockResolvedValue({ changes: 0 }),
      };
      mockDb.prepare.mockReturnValue(mockPrepare);

      const res = await request(app)
        .delete('/api/crm/customers/nonexistent')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
    });
  });

  describe('POST /:id/find-matches — поиск совпадений', () => {
    it('находит совпадения по телефону', async () => {
      const source = {
        id: 'src', full_name: 'Тест', phone: '+79001234567',
        email: 'test@test.ru', client_id: 'test-client-1',
        additional_contacts: '', notes: '',
      };
      const candidate = {
        id: 'cand', full_name: 'Тестовый', phone: '+79001234567',
        email: '', client_id: 'test-client-1',
        additional_contacts: '', notes: '', is_self_registered: false,
        created_at: '2026-01-01',
      };

      let prepareCallCount = 0;
      mockDb.prepare.mockImplementation(() => ({
        get: jest.fn().mockImplementation((...args) => {
          prepareCallCount++;
          if (prepareCallCount === 1) return Promise.resolve(source);
          return Promise.resolve(undefined);
        }),
        all: jest.fn().mockResolvedValue([]),
        run: jest.fn().mockResolvedValue({ changes: 0 }),
      }));

      mockDb.pool.query.mockImplementation((sql) => {
        if (sql.includes('customer_custom_values')) return Promise.resolve({ rows: [] });
        if (sql.includes('SELECT * FROM customers WHERE client_id')) {
          return Promise.resolve({ rows: [candidate] });
        }
        if (sql.includes('custom_fields')) return Promise.resolve({ rows: [] });
        return Promise.resolve({ rows: [] });
      });

      const res = await request(app)
        .post('/api/crm/customers/src/find-matches')
        .set('Authorization', `Bearer ${token}`)
        .send({});

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('source');
      expect(res.body).toHaveProperty('matches');
    });

    it('возвращает 404 если исходный клиент не найден', async () => {
      mockDb.prepare.mockReturnValue({
        get: jest.fn().mockResolvedValue(undefined),
        all: jest.fn().mockResolvedValue([]),
        run: jest.fn().mockResolvedValue({ changes: 0 }),
      });

      const res = await request(app)
        .post('/api/crm/customers/nonexistent/find-matches')
        .set('Authorization', `Bearer ${token}`)
        .send({});

      expect(res.status).toBe(404);
    });
  });

  describe('POST /:id/confirm-self — подтверждение самозаписи', () => {
    it('подтверждает клиента самозаписи', async () => {
      const customer = { id: 'sr1', full_name: 'Тест', is_self_registered: true, client_id: 'test-client-1' };
      const confirmed = { ...customer, is_self_registered: false };

      let callCount = 0;
      mockDb.prepare.mockReturnValue({
        get: jest.fn().mockImplementation(() => {
          callCount++;
          if (callCount === 1) return Promise.resolve(customer);
          return Promise.resolve(confirmed);
        }),
        all: jest.fn().mockResolvedValue([]),
        run: jest.fn().mockResolvedValue({ changes: 1 }),
      });
      mockDb.pool.query.mockResolvedValue({ rows: [] });

      const res = await request(app)
        .post('/api/crm/customers/sr1/confirm-self')
        .set('Authorization', `Bearer ${token}`)
        .send({});

      expect(res.status).toBe(200);
    });
  });

  describe('POST /:id/link-to/:targetId — привязка клиента', () => {
    it('привязывает самозапись к существующему клиенту', async () => {
      const source = { id: 'src', full_name: 'Самозапись', phone: '+79001234567', email: '', client_id: 'test-client-1', custom_values: {} };
      const target = { id: 'tgt', full_name: 'Существующий', phone: '+79001234567', email: 'test@test.ru', client_id: 'test-client-1', custom_values: {} };

      let callCount = 0;
      mockDb.prepare.mockReturnValue({
        get: jest.fn().mockImplementation(() => {
          callCount++;
          if (callCount <= 2) return Promise.resolve(callCount === 1 ? source : target);
          return Promise.resolve(target);
        }),
        all: jest.fn().mockResolvedValue([]),
        run: jest.fn().mockResolvedValue({ changes: 1 }),
      });
      mockDb.pool.query.mockResolvedValue({ rows: [], rowCount: 0 });

      const res = await request(app)
        .post('/api/crm/customers/src/link-to/tgt')
        .set('Authorization', `Bearer ${token}`)
        .send({ merge_data: true });

      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(mockDb.pool.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE orders SET customer_id'),
        ['tgt', 'src', 'test-client-1'],
      );
    });
  });

  describe('POST /search — расширенный поиск', () => {
    it('ищет по условиям contains', async () => {
      let n = 0;
      mockDb.pool.query = jest.fn().mockImplementation(() => {
        n++;
        if (n === 1) return Promise.resolve({ rows: [{ total: '1' }] });
        if (n === 2) return Promise.resolve({
          rows: [{ id: 'c1', full_name: 'Тест1', phone: '+79001234567' }],
        });
        return Promise.resolve({ rows: [] });
      });

      const res = await request(app)
        .post('/api/crm/customers/search')
        .set('Authorization', `Bearer ${token}`)
        .send({
          conditions: [{ field: 'full_name', operator: 'contains', value: 'Тест' }],
          logic: 'and',
          page: 1,
          limit: 30,
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('items');
      expect(res.body).toHaveProperty('total');
    });

    it('ищет по дате создания (range)', async () => {
      let n = 0;
      mockDb.pool.query = jest.fn().mockImplementation(() => {
        n++;
        if (n === 1) return Promise.resolve({ rows: [{ total: '0' }] });
        return Promise.resolve({ rows: [] });
      });

      const res = await request(app)
        .post('/api/crm/customers/search')
        .set('Authorization', `Bearer ${token}`)
        .send({
          conditions: [{
            field: 'created_at', operator: 'range',
            value_from: '2026-01-01', value_to: '2026-12-31',
          }],
          logic: 'and',
        });

      expect(res.status).toBe(200);
    });

    it('ищет по custom полям', async () => {
      let n = 0;
      mockDb.pool.query = jest.fn().mockImplementation(() => {
        n++;
        if (n === 1) return Promise.resolve({ rows: [{ total: '0' }] });
        return Promise.resolve({ rows: [] });
      });

      const res = await request(app)
        .post('/api/crm/customers/search')
        .set('Authorization', `Bearer ${token}`)
        .send({
          conditions: [{ field: 'cf_field-1', operator: 'contains', value: 'test' }],
          logic: 'and',
        });

      expect(res.status).toBe(200);
    });

    it('поддерживает OR логику', async () => {
      let n = 0;
      mockDb.pool.query = jest.fn().mockImplementation(() => {
        n++;
        if (n === 1) return Promise.resolve({ rows: [{ total: '0' }] });
        return Promise.resolve({ rows: [] });
      });

      const res = await request(app)
        .post('/api/crm/customers/search')
        .set('Authorization', `Bearer ${token}`)
        .send({
          conditions: [
            { field: 'full_name', operator: 'contains', value: 'Тест' },
            { field: 'email', operator: 'not_empty' },
          ],
          logic: 'or',
        });

      expect(res.status).toBe(200);
    });
  });

  describe('GET /:id/history — история работ', () => {
    it('возвращает историю работ клиента', async () => {
      const records = [
        { id: 'wr1', customer_id: 'c1', service_name: 'Стрижка', employee_name: 'Иван' },
      ];
      const get = jest.fn().mockResolvedValue({ id: 'c1' });
      const all = jest.fn().mockResolvedValue(records);
      mockDb.prepare.mockReturnValue({
        get,
        all,
        run: jest.fn().mockResolvedValue({ changes: 0 }),
      });

      const res = await request(app)
        .get('/api/crm/customers/c1/history')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].service_name).toBe('Стрижка');
      expect(get).toHaveBeenCalledWith('c1', 'test-client-1');
      expect(all).toHaveBeenCalledWith('c1', 'test-client-1');
    });

    it('не возвращает историю клиента другого tenant', async () => {
      const get = jest.fn().mockResolvedValue(undefined);
      const all = jest.fn().mockResolvedValue([]);
      mockDb.prepare.mockReturnValue({
        get,
        all,
        run: jest.fn().mockResolvedValue({ changes: 0 }),
      });

      const res = await request(app)
        .get('/api/crm/customers/foreign/history')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(404);
      expect(get).toHaveBeenCalledWith('foreign', 'test-client-1');
      expect(all).not.toHaveBeenCalled();
    });
  });

  describe('GET /:id/orders — заказы клиента', () => {
    it('возвращает заказы клиента', async () => {
      const orders = [
        { id: 'o1', customer_id: 'c1', title: 'стоодин', status: 'completed', items_count: 1 },
      ];
      mockDb.prepare.mockReturnValue({
        get: jest.fn().mockResolvedValue(undefined),
        all: jest.fn().mockResolvedValue(orders),
        run: jest.fn().mockResolvedValue({ changes: 0 }),
      });

      const res = await request(app)
        .get('/api/crm/customers/c1/orders')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0].title).toBe('стоодин');
    });
  });

  describe('Аутентификация и авторизация', () => {
    it('отклоняет запросы с истёкшим токеном', async () => {
      const expiredToken = jwt.sign(
        { userId: 'test', email: 'test@test.ru', role: 'client', clientId: 'test' },
        TEST_SECRET,
        { expiresIn: '-1s' },
      );

      const res = await request(app)
        .get('/api/crm/customers')
        .set('Authorization', `Bearer ${expiredToken}`);

      expect(res.status).toBe(401);
    });

    it('отклоняет запросы с невалидным токеном', async () => {
      const res = await request(app)
        .get('/api/crm/customers')
        .set('Authorization', 'Bearer invalid-token');

      expect(res.status).toBe(401);
    });

    it('admin использует client_id из query', async () => {
      let n = 0;
      mockDb.pool.query = jest.fn().mockImplementation(() => {
        n++;
        if (n === 1) return Promise.resolve({ rows: [{ total: '0' }] });
        return Promise.resolve({ rows: [] });
      });

      const res = await request(app)
        .get('/api/crm/customers?client_id=custom-client')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(mockDb.pool.query).toHaveBeenCalledWith(
        expect.stringContaining('client_id'),
        expect.arrayContaining(['custom-client']),
      );
    });
  });
});

const jwt = require('jsonwebtoken');

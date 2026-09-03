const request = require('supertest');
const { TEST_SECRET, createTestToken, createTestApp } = require('../testHelper');

let mockDb;

jest.mock('../src/db', () => {
  mockDb = require('../testHelper').createMockDb();
  return { db: mockDb };
});

const orderFieldsRouter = require('../src/routes/orderCustomFields');

describe('CRM Order Custom Fields API', () => {
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
    app = createTestApp('/api/crm/order-fields', orderFieldsRouter);
    token = createTestToken();
  });

  it('возвращает поля заказа со значениями', async () => {
    const get = jest.fn().mockResolvedValue({ id: 'o1' });
    mockDb.prepare.mockReturnValue({ get, all: jest.fn(), run: jest.fn() });
    mockDb.pool.query.mockResolvedValueOnce({
      rows: [{ id: 'f1', order_id: 'o1', name: 'Номер договора', field_type: 'text', options: '[]', value: 'A-10' }],
    });

    const res = await request(app)
      .get('/api/crm/order-fields?order_id=o1')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual([
      expect.objectContaining({ id: 'f1', name: 'Номер договора', value: 'A-10', options: [] }),
    ]);
  });

  it('создаёт поле заказа', async () => {
    const get = jest.fn()
      .mockResolvedValueOnce({ id: 'o1' })
      .mockResolvedValueOnce({ id: 'new-f', order_id: 'o1', name: 'Статус оплаты', field_type: 'list', options: '["Да","Нет"]' });
    const run = jest.fn().mockResolvedValue({ changes: 1 });
    mockDb.prepare.mockReturnValue({ get, all: jest.fn(), run });
    mockDb.pool.query
      .mockResolvedValueOnce({ rows: [{ c: '0' }] })
      .mockResolvedValueOnce({ rows: [] });

    const res = await request(app)
      .post('/api/crm/order-fields')
      .set('Authorization', `Bearer ${token}`)
      .send({ order_id: 'o1', name: 'Статус оплаты', field_type: 'list', options: ['Да', 'Нет'] });

    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Статус оплаты');
    expect(res.body.options).toEqual(['Да', 'Нет']);
    expect(run).toHaveBeenCalledWith(
      expect.any(String),
      'test-client-1',
      'o1',
      'Статус оплаты',
      'list',
      false,
      0,
      '["Да","Нет"]',
    );
  });

  it('сохраняет значения полей заказа', async () => {
    const get = jest.fn()
      .mockResolvedValueOnce({ id: 'o1' })
      .mockResolvedValueOnce({ id: 'f1' });
    const run = jest.fn().mockResolvedValue({ changes: 1 });
    mockDb.prepare.mockReturnValue({ get, all: jest.fn(), run });

    const res = await request(app)
      .post('/api/crm/order-fields/values')
      .set('Authorization', `Bearer ${token}`)
      .send({ order_id: 'o1', values: [{ field_id: 'f1', value: 'A-10' }] });

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(run).toHaveBeenCalledWith(expect.any(String), 'o1', 'f1', 'A-10');
  });
});

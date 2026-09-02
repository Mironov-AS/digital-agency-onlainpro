const request = require('supertest');
const { TEST_SECRET, createTestToken, createTestApp } = require('../testHelper');

let mockDb;

jest.mock('../src/db', () => {
  mockDb = require('../testHelper').createMockDb();
  return { db: mockDb };
});

const ordersRouter = require('../src/routes/orders');

describe('CRM Orders API', () => {
  let app;
  let token;

  beforeAll(() => {
    process.env.JWT_ACCESS_SECRET = TEST_SECRET;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockDb.prepare.mockReturnValue({
      get: jest.fn().mockResolvedValue(undefined),
      all: jest.fn().mockResolvedValue([]),
      run: jest.fn().mockResolvedValue({ changes: 0 }),
    });
    app = createTestApp('/api/crm/orders', ordersRouter);
    token = createTestToken();
  });

  it('возвращает список заказов', async () => {
    const all = jest.fn().mockResolvedValue([{ id: 'o1', title: 'Заказ', status: 'active' }]);
    mockDb.prepare.mockReturnValue({ get: jest.fn(), all, run: jest.fn() });

    const res = await request(app)
      .get('/api/crm/orders?status=active')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(all).toHaveBeenCalledWith('test-client-1', 'active');
  });

  it('требует итог при закрытии заказа', async () => {
    const res = await request(app)
      .post('/api/crm/orders/o1/close')
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'completed', outcome: '' });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('итог');
  });

  it('отклоняет дробное количество позиции заказа', async () => {
    const run = jest.fn().mockResolvedValue({ changes: 1 });
    mockDb.prepare.mockReturnValue({ get: jest.fn().mockResolvedValue({ id: 'c1' }), all: jest.fn(), run });

    const res = await request(app)
      .post('/api/crm/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({
        customer_id: 'c1',
        title: 'Заказ',
        items: [{ sales_item_id: 'item-1', name: 'Товар', quantity: 1.5, price: 100 }],
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('целым числом');
    expect(run).not.toHaveBeenCalled();
  });

  it('требует позицию из номенклатуры в заказе', async () => {
    const run = jest.fn().mockResolvedValue({ changes: 1 });
    mockDb.prepare.mockReturnValue({ get: jest.fn().mockResolvedValue({ id: 'c1' }), all: jest.fn(), run });

    const res = await request(app)
      .post('/api/crm/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({
        customer_id: 'c1',
        title: 'Заказ',
        items: [{ name: 'Своя позиция', quantity: 1, price: 100 }],
      });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('номенклатуры');
    expect(run).not.toHaveBeenCalled();
  });

  it('не создаёт заказ с позицией номенклатуры другого клиента', async () => {
    const get = jest.fn().mockResolvedValue(undefined);
    const run = jest.fn().mockResolvedValue({ changes: 1 });
    mockDb.prepare.mockReturnValue({ get, all: jest.fn(), run });

    const res = await request(app)
      .post('/api/crm/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({
        customer_id: 'c1',
        title: 'Заказ',
        items: [{ sales_item_id: 'foreign-item', name: 'Товар', quantity: 1, price: 100 }],
      });

    expect(res.status).toBe(404);
    expect(res.body.error).toContain('номенклатуры');
    expect(get).toHaveBeenCalledWith('foreign-item', 'test-client-1');
    expect(run).not.toHaveBeenCalled();
  });

  it('не переводит заказ на клиента другого tenant при редактировании', async () => {
    const get = jest.fn()
      .mockResolvedValueOnce({ id: 'o1', status: 'active' })
      .mockResolvedValueOnce({ id: 'item-1' })
      .mockResolvedValueOnce(undefined);
    const run = jest.fn().mockResolvedValue({ changes: 1 });
    mockDb.prepare.mockReturnValue({ get, all: jest.fn(), run });

    const res = await request(app)
      .put('/api/crm/orders/o1')
      .set('Authorization', `Bearer ${token}`)
      .send({
        customer_id: 'foreign-customer',
        title: 'Заказ',
        items: [{ sales_item_id: 'item-1', name: 'Товар', quantity: 1, price: 100 }],
      });

    expect(res.status).toBe(404);
    expect(res.body.error).toContain('Клиент');
    expect(get).toHaveBeenNthCalledWith(3, 'foreign-customer', 'test-client-1');
    expect(run).not.toHaveBeenCalled();
  });

  it('закрывает заказ как выполненный', async () => {
    const get = jest.fn()
      .mockResolvedValueOnce({ id: 'o1' })
      .mockResolvedValueOnce({ id: 'o1', title: 'Заказ', status: 'completed', outcome: 'Продано' });
    const all = jest.fn().mockResolvedValue([]);
    const run = jest.fn().mockResolvedValue({ changes: 1 });
    mockDb.prepare.mockReturnValue({ get, all, run });

    const res = await request(app)
      .post('/api/crm/orders/o1/close')
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'completed', outcome: 'Продано' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('completed');
    expect(run).toHaveBeenCalledWith('completed', 'Продано', 'o1', 'test-client-1');
  });
});

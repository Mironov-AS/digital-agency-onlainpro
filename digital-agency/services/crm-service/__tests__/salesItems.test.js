const request = require('supertest');
const { TEST_SECRET, createTestToken, createTestApp } = require('../testHelper');

let mockDb;

jest.mock('../src/db', () => {
  mockDb = require('../testHelper').createMockDb();
  return { db: mockDb };
});

const salesItemsRouter = require('../src/routes/salesItems');

describe('CRM Sales Items API', () => {
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
    app = createTestApp('/api/crm/sales-items', salesItemsRouter);
    token = createTestToken();
  });

  it('возвращает список номенклатуры продаж', async () => {
    const all = jest.fn().mockResolvedValue([{ id: 'i1', name: 'Абонемент', price: 5000 }]);
    mockDb.prepare.mockReturnValue({ get: jest.fn(), all, run: jest.fn() });

    const res = await request(app)
      .get('/api/crm/sales-items?status=active')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(all).toHaveBeenCalledWith('test-client-1', 'active');
  });

  it('создаёт позицию продаж', async () => {
    const get = jest.fn().mockResolvedValue({ id: 'i1', name: 'Абонемент', price: 5000 });
    const run = jest.fn().mockResolvedValue({ changes: 1 });
    mockDb.prepare.mockReturnValue({ get, all: jest.fn(), run });

    const res = await request(app)
      .post('/api/crm/sales-items')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Абонемент', price: 5000 });

    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Абонемент');
    expect(run).toHaveBeenCalled();
  });

  it('требует название позиции', async () => {
    const res = await request(app)
      .post('/api/crm/sales-items')
      .set('Authorization', `Bearer ${token}`)
      .send({ price: 5000 });

    expect(res.status).toBe(400);
  });
});

const request = require('supertest');
const { TEST_SECRET, createTestToken, createTestApp } = require('../testHelper');

let mockDb;

jest.mock('../src/db', () => {
  mockDb = require('../testHelper').createMockDb();
  return { db: mockDb };
});

const salesItemCustomFieldsRouter = require('../src/routes/salesItemCustomFields');

describe('CRM Sales Item Custom Fields API', () => {
  let app;
  let token;

  beforeAll(() => {
    process.env.JWT_ACCESS_SECRET = TEST_SECRET;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockDb.pool.query.mockResolvedValue({ rows: [], rowCount: 0 });
    mockDb.prepare.mockReturnValue({
      get: jest.fn().mockResolvedValue({ id: 'item-1' }),
      all: jest.fn().mockResolvedValue([]),
      run: jest.fn().mockResolvedValue({ changes: 1 }),
    });
    app = createTestApp('/api/crm/sales-item-fields', salesItemCustomFieldsRouter);
    token = createTestToken();
  });

  it('возвращает поля позиции номенклатуры', async () => {
    mockDb.pool.query.mockResolvedValueOnce({
      rows: [{ id: 'field-1', name: 'Размер', field_type: 'list', options: '["S","M"]' }],
    });

    const res = await request(app)
      .get('/api/crm/sales-item-fields?sales_item_id=item-1')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].options).toEqual(['S', 'M']);
  });

  it('создаёт поле позиции номенклатуры', async () => {
    mockDb.pool.query
      .mockResolvedValueOnce({ rows: [{ c: 0 }] })
      .mockResolvedValueOnce({ rows: [] });

    const run = jest.fn().mockResolvedValue({ changes: 1 });
    mockDb.prepare.mockImplementation(sql => {
      if (sql.includes('SELECT id FROM sales_items')) {
        return { get: jest.fn().mockResolvedValue({ id: 'item-1' }), all: jest.fn(), run: jest.fn() };
      }
      if (sql.includes('SELECT * FROM sales_item_custom_fields')) {
        return {
          get: jest.fn().mockResolvedValue({
            id: 'field-1',
            sales_item_id: 'item-1',
            name: 'Цвет',
            field_type: 'text',
            options: '[]',
          }),
          all: jest.fn(),
          run: jest.fn(),
        };
      }
      return { get: jest.fn(), all: jest.fn(), run };
    });

    const res = await request(app)
      .post('/api/crm/sales-item-fields')
      .set('Authorization', `Bearer ${token}`)
      .send({ sales_item_id: 'item-1', name: 'Цвет', field_type: 'text' });

    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Цвет');
    expect(run).toHaveBeenCalled();
  });

  it('требует идентификатор позиции', async () => {
    const res = await request(app)
      .post('/api/crm/sales-item-fields')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Цвет', field_type: 'text' });

    expect(res.status).toBe(400);
  });
});

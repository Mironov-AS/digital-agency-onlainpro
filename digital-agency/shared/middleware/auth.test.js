const jwt = require('jsonwebtoken');
const { requireAdmin } = require('./auth');

function createResponse() {
  return {
    statusCode: null,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };
}

describe('requireAdmin', () => {
  const previousSecret = process.env.JWT_ACCESS_SECRET;

  beforeEach(() => {
    process.env.JWT_ACCESS_SECRET = 'test-secret';
  });

  afterAll(() => {
    process.env.JWT_ACCESS_SECRET = previousSecret;
  });

  it('rejects authenticated client users', () => {
    const token = jwt.sign(
      { userId: 'client-user', email: 'client@example.com', role: 'client', clientId: 'client-id' },
      'test-secret',
    );
    const req = {
      cookies: {},
      headers: { authorization: `Bearer ${token}` },
    };
    const res = createResponse();
    const next = jest.fn();

    requireAdmin(req, res, next);

    expect(res.statusCode).toBe(403);
    expect(res.body).toEqual({ error: 'Forbidden' });
    expect(next).not.toHaveBeenCalled();
  });

  it('allows authenticated admin users', () => {
    const token = jwt.sign(
      { userId: 'admin-user', email: 'admin@example.com', role: 'admin' },
      'test-secret',
    );
    const req = {
      cookies: {},
      headers: { authorization: `Bearer ${token}` },
    };
    const res = createResponse();
    const next = jest.fn();

    requireAdmin(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.statusCode).toBeNull();
  });

  it('prefers bearer token over a stale auth cookie', () => {
    const staleCookie = jwt.sign(
      { userId: 'old-admin', email: 'old-admin@example.com', role: 'admin' },
      'old-secret',
    );
    const bearerToken = jwt.sign(
      { userId: 'admin-user', email: 'admin@example.com', role: 'admin' },
      'test-secret',
    );
    const req = {
      cookies: { access_token: staleCookie },
      headers: { authorization: `Bearer ${bearerToken}` },
    };
    const res = createResponse();
    const next = jest.fn();

    requireAdmin(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(req.user.userId).toBe('admin-user');
    expect(res.statusCode).toBeNull();
  });
});

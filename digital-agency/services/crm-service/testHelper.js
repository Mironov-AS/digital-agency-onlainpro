const jwt = require('jsonwebtoken');
const express = require('express');
const cookieParser = require('cookie-parser');

const TEST_SECRET = 'test-secret-for-crm-tests';

function createTestToken(payload = {}) {
  const defaults = {
    userId: 'test-user-id',
    email: 'test1@test.ru',
    role: 'client',
    clientId: 'test-client-1',
  };
  return jwt.sign({ ...defaults, ...payload }, TEST_SECRET, { expiresIn: '1h' });
}

function createAdminToken(payload = {}) {
  return createTestToken({ role: 'admin', clientId: '', ...payload });
}

function createMockDb() {
  const mockPool = {
    query: jest.fn().mockResolvedValue({ rows: [], rowCount: 0 }),
  };

  const mockPrepare = jest.fn().mockReturnValue({
    get: jest.fn().mockResolvedValue(undefined),
    all: jest.fn().mockResolvedValue([]),
    run: jest.fn().mockResolvedValue({ changes: 0 }),
  });

  return {
    pool: mockPool,
    prepare: mockPrepare,
  };
}

function createTestApp(routePath, router) {
  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.use(routePath, router);
  app.use((err, _req, res, _next) => {
    console.error('Test error:', err);
    res.status(500).json({ error: 'Internal server error' });
  });
  return app;
}

module.exports = {
  TEST_SECRET,
  createTestToken,
  createAdminToken,
  createMockDb,
  createTestApp,
};

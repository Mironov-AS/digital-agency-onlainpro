const jwt = require('jsonwebtoken');
const express = require('express');
const cookieParser = require('cookie-parser');

const TEST_SECRET = 'test-secret-for-booking-tests';

function createTestToken(payload = {}) {
  const defaults = {
    userId: 'test-user-id',
    username: 'testuser',
    clientId: 'test-client-1',
    displayName: 'Тестовый пользователь',
  };
  return jwt.sign({ ...defaults, ...payload }, TEST_SECRET, { expiresIn: '1h' });
}

function createAdminToken(payload = {}) {
  return createTestToken({ role: 'admin', ...payload });
}

function createMockDb() {
  const mockAll = jest.fn().mockResolvedValue([]);
  const mockGet = jest.fn().mockResolvedValue(null);
  const mockRun = jest.fn().mockResolvedValue({ changes: 1 });

  const mockPrepare = jest.fn().mockReturnValue({
    get: mockGet,
    all: mockAll,
    run: mockRun,
  });

  return {
    prepare: mockPrepare,
    pool: { query: jest.fn().mockResolvedValue({ rows: [], rowCount: 0 }) },
    _mocks: { all: mockAll, get: mockGet, run: mockRun, prepare: mockPrepare },
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

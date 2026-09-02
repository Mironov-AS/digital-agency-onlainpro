const jwt = require('jsonwebtoken');
const express = require('express');
const cookieParser = require('cookie-parser');

const TEST_SECRET = 'test-secret-for-erp-tests';

function createTestToken(payload = {}) {
  const defaults = {
    userId: 'test-user-id',
    email: 'test@erp.local',
    name: 'Тестовый пользователь',
    role: 'client',
    clientId: 'test-client-1',
  };
  return jwt.sign({ ...defaults, ...payload }, TEST_SECRET, { expiresIn: '1h' });
}

function createAdminToken(payload = {}) {
  return createTestToken({ role: 'admin', clientId: '', ...payload });
}

function createMockDb() {
  const mockGet = jest.fn().mockResolvedValue(null);
  const mockAll = jest.fn().mockResolvedValue([]);
  const mockRun = jest.fn().mockResolvedValue({ changes: 1 });
  const mockRunReturning = jest.fn().mockResolvedValue({ lastInsertRowid: 1 });

  return {
    get: mockGet,
    all: mockAll,
    run: mockRun,
    runReturning: mockRunReturning,
    transaction: jest.fn().mockImplementation(async (fn) => {
      const txDb = { get: mockGet, all: mockAll, run: mockRun, runReturning: mockRunReturning };
      return fn(txDb);
    }),
    prepare: jest.fn().mockReturnValue({ get: mockGet, all: mockAll, run: mockRun }),
    exec: jest.fn().mockResolvedValue(undefined),
    ensureSchema: jest.fn().mockResolvedValue(undefined),
    pool: { query: jest.fn().mockResolvedValue({ rows: [], rowCount: 0 }) },
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

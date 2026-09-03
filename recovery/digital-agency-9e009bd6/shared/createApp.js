/**
 * createApp — стандартный bootstrap Express-приложения для микросервисов.
 *
 * Применение:
 *   const { createApp, startServer } = require('../../shared/createApp');
 *   const app = createApp({ name: 'auth-service' });
 *   app.use('/api/auth', authRoutes);
 *   startServer(app, { name: 'auth-service', port: process.env.PORT || 4001 });
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');

function buildCorsOptions(corsOrigin) {
  const allowed = String(corsOrigin)
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  return {
    credentials: true,
    origin(origin, callback) {
      if (!origin || allowed.includes('*') || allowed.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(null, false);
    },
  };
}

function createApp({
  name,
  helmetOptions,
  corsOrigin = process.env.CORS_ORIGIN,
  trustProxy = process.env.NODE_ENV === 'production',
} = {}) {
  if (!corsOrigin) {
    throw new Error('CORS_ORIGIN environment variable must be set');
  }
  const app = express();

  if (trustProxy) app.set('trust proxy', 1);

  app.use(helmet(helmetOptions));
  app.use(cors(buildCorsOptions(corsOrigin)));
  app.use(express.json({ limit: '100kb' }));
  app.use(cookieParser());

  app.locals.serviceName = name || 'service';
  return app;
}

function attachHealthAndErrors(app, name) {
  app.get('/api/health', (_, res) => res.json({ service: name, status: 'ok' }));

  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    console.error(`[${name}]`, err);
    const body = { error: status < 500 ? err.message : 'Internal server error' };
    if (process.env.NODE_ENV !== 'production' && err.stack) body.stack = err.stack;
    res.status(status).json(body);
  });
}

async function startServer(app, { name, port, init }) {
  if (init) await init();
  attachHealthAndErrors(app, name);
  return app.listen(port, '0.0.0.0', () => {
    console.log(`✅ ${name} running on port ${port}`);
  });
}

module.exports = { createApp, startServer, attachHealthAndErrors };

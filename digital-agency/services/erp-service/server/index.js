require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const { initDb } = require('./database');

const authRouter = require('./routes/auth');
const contractsRouter = require('./routes/contracts');
const ordersRouter = require('./routes/orders');
const invoicesRouter = require('./routes/invoices');
const paymentsRouter = require('./routes/payments');
const shipmentsRouter = require('./routes/shipments');
const claimsRouter = require('./routes/claims');
const productionRouter = require('./routes/production');
const notificationsRouter = require('./routes/notifications');
const auditRouter = require('./routes/audit');
const counterpartiesRouter = require('./routes/counterparties');
const settingsRouter = require('./routes/settings');
const driversRouter = require('./routes/drivers');
const deliveryRoutesRouter = require('./routes/deliveryRoutes');
const llmRouter = require('./routes/llm');

const app = express();

const corsOrigin = process.env.CORS_ORIGIN || '*';
app.set('trust proxy', 1);
app.use(cors({ origin: corsOrigin }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  next();
});

app.use('/api', (_req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  next();
});

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'erp-service' }));

app.use('/api/erp/auth', authRouter);
app.use('/api/erp/contracts', contractsRouter);
app.use('/api/erp/orders', ordersRouter);
app.use('/api/erp/invoices', invoicesRouter);
app.use('/api/erp/payments', paymentsRouter);
app.use('/api/erp/shipments', shipmentsRouter);
app.use('/api/erp/claims', claimsRouter);
app.use('/api/erp/production', productionRouter);
app.use('/api/erp/notifications', notificationsRouter);
app.use('/api/erp/audit', auditRouter);
app.use('/api/erp/counterparties', counterpartiesRouter);
app.use('/api/erp/settings', settingsRouter);
app.use('/api/erp/drivers', driversRouter);
app.use('/api/erp/delivery-routes', deliveryRoutesRouter);
app.use('/api/erp', llmRouter);
// Standalone /api/ai-chat endpoint — mount the same router with path rewrite
const aiChatProxy = express.Router();
aiChatProxy.use((req, _res, next) => { req.url = '/ai-chat' + (req.url === '/' ? '' : req.url); next(); }, llmRouter);
app.use('/api/ai-chat', aiChatProxy);

app.get('/api/erp/health', (req, res) => {
  res.json({ status: 'ok', service: 'erp-service', timestamp: new Date().toISOString() });
});

app.use('/api/erp/*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

const path = require('path');
const fs = require('fs');
const publicDir = path.join(__dirname, 'public');
if (fs.existsSync(publicDir)) {
  app.use(express.static(publicDir));
  app.get('*', (req, res) => {
    res.sendFile(path.join(publicDir, 'index.html'));
  });
}

app.use((err, req, res, _next) => {
  console.error('[erp-service]', err);
  res.status(500).json({ error: 'Внутренняя ошибка сервера' });
});

const PORT = process.env.PORT || 4010;

initDb()
  .then(() => {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`✅ erp-service running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('[erp-service] Failed to init DB:', err);
    process.exit(1);
  });

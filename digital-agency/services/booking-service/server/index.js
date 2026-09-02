require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const { initDb } = require('./database');
const { getJwtSecret } = require('./config');

const authRouter = require('./routes/auth');
const catalogRouter = require('./routes/services');
const appointmentsRouter = require('./routes/appointments');
const dashboardRouter = require('./routes/dashboard');
const logsRouter = require('./routes/logs');
const exportRouter = require('./routes/export');
const publicRouter = require('./routes/public');
const qrRouter = require('./routes/qrcode');
const settingsRouter = require('./routes/settings');
const specialistsRouter = require('./routes/specialists');

const app = express();

const corsOrigin = process.env.CORS_ORIGIN || '*';
app.set('trust proxy', 1);
app.use('/api/booking/public', cors({ origin: '*' }));
app.use('/api/booking/widget.js', cors({ origin: '*' }));
app.use(cors({ origin: corsOrigin }));
app.use(express.json({ limit: '100kb' }));

app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  next();
});

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'booking-service' }));

app.use('/api/booking/auth', authRouter);
app.use('/api/booking/catalog', catalogRouter);
app.use('/api/booking/appointments', appointmentsRouter);
app.use('/api/booking/dashboard', dashboardRouter);
app.use('/api/booking/logs', logsRouter);
app.use('/api/booking/export', exportRouter);
app.use('/api/booking/public', publicRouter);
app.use('/api/booking/qrcode', qrRouter);
app.use('/api/booking/settings', settingsRouter);
app.use('/api/booking/specialists', specialistsRouter);

app.get('/api/booking/widget.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  const widgetPath = require('path').join(__dirname, 'widget.js');
  res.sendFile(widgetPath);
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

app.use((err, req, res, next) => {
  console.error('[booking-service]', err);
  res.status(500).json({ error: 'Внутренняя ошибка сервера' });
});

const PORT = process.env.PORT || 4008;

initDb()
  .then(() => {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`✅ booking-service running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('[booking-service] Failed to init DB:', err);
    process.exit(1);
  });

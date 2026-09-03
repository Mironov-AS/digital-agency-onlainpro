const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const { createApp, startServer } = require('../../../shared/createApp');
const { initDb } = require('./db');

const servicesRoutes = require('./routes/services');
const categoriesRoutes = require('./routes/categories');
const costsRoutes = require('./routes/costs');

const app = createApp({ name: 'catalog-service' });

app.use('/api/catalog/services', servicesRoutes);
app.use('/api/catalog/categories', categoriesRoutes);
app.use('/api/catalog/costs', costsRoutes);

startServer(app, { name: 'catalog-service', port: process.env.PORT || 4002, init: initDb });

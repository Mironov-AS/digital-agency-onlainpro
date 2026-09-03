require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const path = require('path');
const fs = require('fs');
const express = require('express');
const { createApp, startServer } = require('../../../shared/createApp');
const { initDb } = require('./db');

const { startBackgroundSync } = require('./services/bookingSync');
const customersRoutes = require('./routes/customers');
const servicesRoutes = require('./routes/services');
const categoriesRoutes = require('./routes/categories');
const employeesRoutes = require('./routes/employees');
const workRecordsRoutes = require('./routes/workRecords');
const exportRoutes = require('./routes/export');
const customFieldsRoutes = require('./routes/customFields');
const searchTemplatesRoutes = require('./routes/searchTemplates');
const serviceCustomFieldsRoutes = require('./routes/serviceCustomFields');
const bookingIntegrationRoutes = require('./routes/bookingIntegration');
const displaySettingsRoutes = require('./routes/displaySettings');
const statisticsRoutes = require('./routes/statistics');
const activitiesRoutes = require('./routes/activities');
const salesItemsRoutes = require('./routes/salesItems');
const salesItemCustomFieldsRoutes = require('./routes/salesItemCustomFields');
const ordersRoutes = require('./routes/orders');
const orderCustomFieldsRoutes = require('./routes/orderCustomFields');

const app = createApp({ name: 'crm-service' });

app.use('/api/crm/customers', customersRoutes);
app.use('/api/crm/services', servicesRoutes);
app.use('/api/crm/categories', categoriesRoutes);
app.use('/api/crm/employees', employeesRoutes);
app.use('/api/crm/work-records', workRecordsRoutes);
app.use('/api/crm/export', exportRoutes);
app.use('/api/crm/custom-fields', customFieldsRoutes);
app.use('/api/crm/search-templates', searchTemplatesRoutes);
app.use('/api/crm/service-fields', serviceCustomFieldsRoutes);
app.use('/api/crm/integration/booking', bookingIntegrationRoutes);
app.use('/api/crm/display-settings', displaySettingsRoutes);
app.use('/api/crm/statistics', statisticsRoutes);
app.use('/api/crm/activities', activitiesRoutes);
app.use('/api/crm/sales-items', salesItemsRoutes);
app.use('/api/crm/sales-item-fields', salesItemCustomFieldsRoutes);
app.use('/api/crm/orders', ordersRoutes);
app.use('/api/crm/order-fields', orderCustomFieldsRoutes);

const publicDir = path.join(__dirname, '../public');
if (fs.existsSync(publicDir)) {
  app.use(express.static(publicDir));
  app.get('*', (req, res) => {
    res.sendFile(path.join(publicDir, 'index.html'));
  });
}

startServer(app, { name: 'crm-service', port: process.env.PORT || 4009, init: async () => {
  await initDb();
  startBackgroundSync();
}});

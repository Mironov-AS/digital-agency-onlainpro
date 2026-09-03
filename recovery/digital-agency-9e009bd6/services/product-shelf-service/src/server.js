require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const { createApp, startServer } = require('../../../shared/createApp');
const { initDb } = require('./db');

const productsRoutes = require('./routes/products');
const subscriptionsRoutes = require('./routes/subscriptions');
const statsRoutes = require('./routes/stats');

const app = createApp({ name: 'product-shelf-service' });

app.use('/api/product-shelf/products', productsRoutes);
app.use('/api/product-shelf/subscriptions', subscriptionsRoutes);
app.use('/api/product-shelf/stats', statsRoutes);

startServer(app, { name: 'product-shelf-service', port: process.env.PORT || 4006, init: initDb });

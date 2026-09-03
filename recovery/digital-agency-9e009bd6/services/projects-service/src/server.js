const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const express = require('express');
const { createApp, startServer } = require('../../../shared/createApp');
const { initDb } = require('./db');

const projectsRoutes = require('./routes/projects');

const app = createApp({
  name: 'projects-service',
  helmetOptions: { crossOriginResourcePolicy: { policy: 'cross-origin' } },
});

app.use('/api/projects', projectsRoutes);

const uploadDir = process.env.UPLOAD_DIR || path.join(__dirname, '../uploads');
app.use('/uploads', express.static(uploadDir));

startServer(app, { name: 'projects-service', port: process.env.PORT || 4004, init: initDb });

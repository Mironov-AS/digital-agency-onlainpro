/**
 * Shared Logging Utility
 * Централизованное логирование для всех микросервисов
 *
 * Использование:
 *   const logger = require('./shared/logger')('auth-service')
 *   logger.info('User logged in', { userId: '123' })
 *   logger.error('Failed to connect', { error: err.message })
 */

const fs = require('fs');
const path = require('path');

// Determine log directory
const LOG_DIR = process.env.LOG_DIR || path.join(__dirname, '../logs');
const MAX_LOG_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_LOG_FILES = 5;

// Ensure log directory exists
function ensureLogDir() {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
}

// Rotate log files if needed
function rotateLog(serviceId) {
  const logFile = path.join(LOG_DIR, `${serviceId}.log`);

  try {
    if (fs.existsSync(logFile)) {
      const stats = fs.statSync(logFile);
      if (stats.size > MAX_LOG_SIZE) {
        // Rotate: move current to .1, .1 to .2, etc.
        for (let i = MAX_LOG_FILES - 1; i > 0; i--) {
          const oldFile = `${logFile}.${i}`;
          const newFile = `${logFile}.${i + 1}`;
          if (fs.existsSync(newFile)) {
            fs.unlinkSync(newFile);
          }
          if (fs.existsSync(oldFile)) {
            fs.renameSync(oldFile, newFile);
          }
        }
        // Move current to .1
        fs.renameSync(logFile, `${logFile}.1`);
      }
    }
  } catch (err) {
    console.error('Log rotation failed:', err.message);
  }
}

// Write to log file
function writeLog(serviceId, level, message, data) {
  ensureLogDir();
  rotateLog(serviceId);

  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level,
    service: serviceId,
    message,
    ...(data && { data }),
  };

  const logLine = JSON.stringify(logEntry);

  // Console output with color
  const colors = {
    error: '\x1b[31m',
    warn: '\x1b[33m',
    info: '\x1b[36m',
    debug: '\x1b[90m',
  };
  const reset = '\x1b[0m';
  const color = colors[level] || '';

  console.log(`${color}[${timestamp}] [${level.toUpperCase()}] [${serviceId}] ${message}${reset}`);

  if (data) {
    console.log(`${color}  Data: ${JSON.stringify(data)}${reset}`);
  }

  // Write to file
  const logFile = path.join(LOG_DIR, `${serviceId}.log`);
  fs.appendFileSync(logFile, logLine + '\n');
}

// Create logger for a service
function createLogger(serviceId) {
  return {
    debug: (message, data) => writeLog(serviceId, 'debug', message, data),
    info: (message, data) => writeLog(serviceId, 'info', message, data),
    warn: (message, data) => writeLog(serviceId, 'warn', message, data),
    error: (message, data) => writeLog(serviceId, 'error', message, data),
  };
}

// Read logs
function readLogs(serviceId, options = {}) {
  ensureLogDir();

  const logFile = path.join(LOG_DIR, `${serviceId}.log`);
  if (!fs.existsSync(logFile)) {
    return [];
  }

  let content = fs.readFileSync(logFile, 'utf8');
  const lines = content.split('\n').filter(Boolean);

  // Filter by level
  let logs = lines.map(line => {
    try {
      return JSON.parse(line);
    } catch {
      return null;
    }
  }).filter(Boolean);

  if (options.level) {
    logs = logs.filter(l => l.level === options.level);
  }

  if (options.search) {
    const search = options.search.toLowerCase();
    logs = logs.filter(l =>
      l.message.toLowerCase().includes(search) ||
      (l.data && JSON.stringify(l.data).toLowerCase().includes(search))
    );
  }

  // Sort by timestamp descending
  logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  if (options.limit) {
    logs = logs.slice(0, options.limit);
  }

  return logs;
}

// Read all logs from all services
function readAllLogs(options = {}) {
  ensureLogDir();

  const files = fs.readdirSync(LOG_DIR).filter(f => f.endsWith('.log'));
  let allLogs = [];

  for (const file of files) {
    const serviceId = file.replace('.log', '');
    const logs = readLogs(serviceId, options);
    allLogs = allLogs.concat(logs);
  }

  // Sort by timestamp descending
  allLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  if (options.limit) {
    allLogs = allLogs.slice(0, options.limit);
  }

  return allLogs;
}

module.exports = {
  createLogger,
  readLogs,
  readAllLogs,
  LOG_DIR,
};
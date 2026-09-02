#!/usr/bin/env node
/**
 * Service Monitor & Auto-restart Script
 * Цифровое агентство ОнлайнПро.РФ — мониторинг микросервисов
 *
 * Использование:
 *   node service-monitor.js              # интерактивный режим
 *   node service-monitor.js --daemon      # фоновый режим
 *   node service-monitor.js --once        # проверка один раз
 *   node service-monitor.js --status      # показать статус всех сервисов
 */

const { exec, spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  checkInterval: 10000, // 10 seconds
  maxRetries: 3,
  restartDelay: 3000,
  logFile: path.join(__dirname, 'monitor.log'),
  services: [
    {
      id: 'auth',
      name: 'Auth Service',
      port: 4001,
      path: path.join(__dirname, '../services/auth-service'),
      devScript: 'npm run dev',
    },
    {
      id: 'catalog',
      name: 'Catalog Service',
      port: 4002,
      path: path.join(__dirname, '../services/catalog-service'),
      devScript: 'npm run dev',
    },
    {
      id: 'clients',
      name: 'Clients Service',
      port: 4003,
      path: path.join(__dirname, '../services/clients-service'),
      devScript: 'npm run dev',
    },
    {
      id: 'projects',
      name: 'Projects Service',
      port: 4004,
      path: path.join(__dirname, '../services/projects-service'),
      devScript: 'npm run dev',
    },
  ],
};

// Logging utility
function log(level, service, message) {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] [${level.toUpperCase()}] [${service}] ${message}`;

  console.log(logEntry);

  try {
    fs.appendFileSync(CONFIG.logFile, logEntry + '\n');
  } catch (err) {
    console.error('Failed to write to log file:', err.message);
  }
}

// Check service health
function checkServiceHealth(port) {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:${port}/api/health`, { timeout: 3000 }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ healthy: true, response: json });
        } catch {
          resolve({ healthy: true, response: null });
        }
      });
    });

    req.on('error', (err) => {
      resolve({ healthy: false, error: err.message });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({ healthy: false, error: 'Timeout' });
    });
  });
}

// Kill process on port
function killPort(port) {
  return new Promise((resolve) => {
    exec(`lsof -ti :${port}`, (err, stdout) => {
      if (err || !stdout.trim()) {
        resolve(false);
        return;
      }
      const pids = stdout.trim().split('\n');
      let killed = false;
      pids.forEach((pid) => {
        try {
          process.kill(parseInt(pid), 'SIGTERM');
          killed = true;
        } catch (e) {
          log('warn', 'monitor', `Failed to kill process ${pid}: ${e.message}`);
        }
      });
      setTimeout(() => resolve(killed), 500);
    });
  });
}

// Start service
function startService(service) {
  return new Promise((resolve) => {
    log('info', service.id, `Starting ${service.name}...`);

    const child = spawn('sh', ['-c', `cd ${service.path} && ${service.devScript}`], {
      detached: true,
      stdio: 'ignore',
    });

    child.unref();

    setTimeout(() => {
      log('info', service.id, `${service.name} started (PID: ${child.pid})`);
      resolve(true);
    }, 2000);
  });
}

// Restart service
async function restartService(service) {
  log('warn', service.id, `Restarting ${service.name}...`);

  await killPort(service.port);

  await new Promise(r => setTimeout(r, CONFIG.restartDelay));

  await startService(service);
}

// Check all services
async function checkAllServices() {
  const results = [];

  for (const service of CONFIG.services) {
    const health = await checkServiceHealth(service.port);
    const status = health.healthy ? 'running' : 'stopped';

    results.push({
      service,
      status,
      health,
    });

    if (!health.healthy) {
      log('warn', service.id, `${service.name} is ${status} (${health.error || 'No response'})`);
    } else {
      log('info', service.id, `${service.name} is running`);
    }
  }

  return results;
}

// Auto-heal services
async function healServices(results) {
  const retries = {};

  for (const result of results) {
    if (result.status !== 'running') {
      retries[result.service.id] = (retries[result.service.id] || 0) + 1;

      if (retries[result.service.id] >= CONFIG.maxRetries) {
        log('error', result.service.id, `Max retries reached for ${result.service.name}, restarting...`);
        await restartService(result.service);
        retries[result.service.id] = 0;
      } else {
        log('warn', result.service.id, `Attempt ${retries[result.service.id]} to restart ${result.service.name}`);
      }
    }
  }
}

// Print status table
function printStatusTable(results) {
  console.log('\n╔════════════════════════════════════════════════════════════════════╗');
  console.log('║               SERVICE STATUS — Цифровое агентство ОнлайнПро.РФ                 ║');
  console.log('╠═══════════════════╦════════╦═════════════════╦════════════════════╣');
  console.log('║ Service           ║ Status ║ Port            ║ Last Check          ║');
  console.log('╠═══════════════════╬════════╬═════════════════╬════════════════════╣');

  for (const r of results) {
    const statusIcon = r.status === 'running' ? '🟢' : '🔴';
    const statusStr = r.status === 'running' ? 'Running ' : 'Stopped';
    console.log(
      `║ ${r.service.name.padEnd(16)} ║ ${statusIcon} ${statusStr.padEnd(6)} ║ ${r.service.port}           ║ ${new Date().toLocaleTimeString('ru-RU').padEnd(16)} ║`
    );
  }

  console.log('╚═══════════════════╩════════╩═════════════════╩════════════════════╝\n');
}

// Daemon mode
async function daemonMode() {
  log('info', 'monitor', 'Service monitor started in DAEMON mode');

  while (true) {
    try {
      const results = await checkAllServices();
      await healServices(results);
      printStatusTable(results);
    } catch (err) {
      log('error', 'monitor', `Error in daemon loop: ${err.message}`);
    }

    await new Promise(r => setTimeout(r, CONFIG.checkInterval));
  }
}

// Interactive mode
async function interactiveMode() {
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║    Service Monitor — Цифровое агентство ОнлайнПро.РФ (Interactive)     ║');
  console.log('╚═══════════════════════════════════════════════════════════╝');
  console.log('Commands: status, restart <id>, start <id>, stop <id>, quit\n');

  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  async function prompt() {
    rl.question('monitor> ', async (cmd) => {
      const [action, serviceId] = cmd.trim().split(' ');

      if (action === 'quit' || action === 'exit') {
        console.log('Shutting down monitor...');
        rl.close();
        process.exit(0);
      }

      if (action === 'status') {
        const results = await checkAllServices();
        printStatusTable(results);
      }

      if (action === 'restart' && serviceId) {
        const svc = CONFIG.services.find(s => s.id === serviceId);
        if (svc) {
          await restartService(svc);
          console.log(`Service ${svc.name} restarted`);
        } else {
          console.log(`Unknown service: ${serviceId}`);
        }
      }

      if (action === 'start' && serviceId) {
        const svc = CONFIG.services.find(s => s.id === serviceId);
        if (svc) {
          await startService(svc);
          console.log(`Service ${svc.name} started`);
        } else {
          console.log(`Unknown service: ${serviceId}`);
        }
      }

      if (action === 'stop' && serviceId) {
        const svc = CONFIG.services.find(s => s.id === serviceId);
        if (svc) {
          await killPort(svc.port);
          console.log(`Service ${svc.name} stopped`);
        } else {
          console.log(`Unknown service: ${serviceId}`);
        }
      }

      if (action === 'help') {
        console.log('Commands: status, restart <id>, start <id>, stop <id>, quit');
      }

      prompt();
    });
  }

  prompt();
}

// Main
const args = process.argv.slice(2);

if (args.includes('--daemon')) {
  daemonMode();
} else if (args.includes('--once')) {
  checkAllServices().then(results => {
    printStatusTable(results);
    process.exit(0);
  });
} else if (args.includes('--status')) {
  checkAllServices().then(results => {
    printStatusTable(results);
    process.exit(0);
  });
} else {
  interactiveMode();
}
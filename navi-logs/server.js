const express = require("express");
const cors = require("cors");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

// Generate UUID v4 using crypto
function uuidv4() {
	return crypto.randomUUID();
}

const app = express();
const PORT = 3005;

// Хранилище логов в памяти (можно заменить на базу данных)
const logs = new Map(); // deviceId -> { info: {}, logs: [] }
const devices = new Map(); // deviceId -> { id, name, lastSeen, logCount }

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));

// HTML интерфейс
app.get("/", (_req, res) => {
	res.send(getHtml());
});

// === API ===

// Получить список устройств
app.get("/api/devices", (_req, res) => {
	const deviceList = Array.from(devices.values()).map((d) => ({
		id: d.id,
		name: d.name || d.id,
		lastSeen: d.lastSeen,
		logCount: d.logCount,
		appVersion: d.appVersion,
		androidVersion: d.androidVersion,
	}));
	res.json(deviceList);
});

// Получить логи устройства
app.get("/api/logs/:deviceId", (req, res) => {
	const { deviceId } = req.params;
	const data = logs.get(deviceId);

	if (!data) {
		return res.json({ info: {}, logs: [] });
	}

	res.json(data);
});

// Отправить логи (вызывается из Android приложения)
app.post("/api/logs", (req, res) => {
	const {
		deviceId,
		deviceName,
		appVersion,
		androidVersion,
		level,
		tag,
		message,
		timestamp,
	} = req.body;

	if (!deviceId) {
		return res.status(400).json({ error: "deviceId required" });
	}

	// Инициализируем устройство
	if (!logs.has(deviceId)) {
		logs.set(deviceId, { info: {}, logs: [] });
		devices.set(deviceId, {
			id: deviceId,
			name: deviceName || deviceId,
			lastSeen: new Date().toISOString(),
			logCount: 0,
			appVersion,
			androidVersion,
		});
	}

	// Обновляем информацию об устройстве
	const device = devices.get(deviceId);
	device.lastSeen = new Date().toISOString();
	if (deviceName) device.name = deviceName;
	if (appVersion) device.appVersion = appVersion;
	if (androidVersion) device.androidVersion = androidVersion;

	// Сохраняем лог
	const logEntry = {
		id: uuidv4(),
		level: level || "INFO",
		tag: tag || "App",
		message: message || "",
		timestamp: timestamp || new Date().toISOString(),
	};

	logs.get(deviceId).logs.push(logEntry);
	device.logCount++;

	// Ограничиваем количество логов (последние 1000)
	if (logs.get(deviceId).logs.length > 1000) {
		logs.get(deviceId).logs = logs.get(deviceId).logs.slice(-1000);
	}

	// Сохраняем в файл
	saveToFile(deviceId, logEntry);

	res.json({ success: true, logId: logEntry.id });
});

// Очистить логи устройства
app.delete("/api/logs/:deviceId", (req, res) => {
	const { deviceId } = req.params;
	logs.delete(deviceId);
	if (devices.has(deviceId)) {
		devices.get(deviceId).logCount = 0;
	}
	res.json({ success: true });
});

// Сохранить лог в файл
function saveToFile(deviceId, logEntry) {
	const logDir = path.join(__dirname, "logs");
	if (!fs.existsSync(logDir)) {
		fs.mkdirSync(logDir, { recursive: true });
	}

	const fileName = path.join(logDir, `${deviceId}.log`);
	const line = `[${logEntry.timestamp}] [${logEntry.level}] [${logEntry.tag}] ${logEntry.message}\n`;

	fs.appendFileSync(fileName, line);
}

// HTML интерфейс
function getHtml() {
	return `
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>OSM Navigator - Логи</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #1a1a2e; color: #eee; min-height: 100vh; }
        .container { max-width: 1400px; margin: 0 auto; padding: 20px; }
        h1 { color: #00d4ff; margin-bottom: 20px; display: flex; align-items: center; gap: 10px; }
        h1 span { font-size: 14px; color: #888; font-weight: normal; }
        .devices { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 15px; margin-bottom: 30px; }
        .device-card { background: #16213e; border-radius: 10px; padding: 15px; cursor: pointer; transition: all 0.2s; border: 2px solid transparent; }
        .device-card:hover { border-color: #00d4ff; transform: translateY(-2px); }
        .device-card.active { border-color: #00ff88; background: #1a2a4a; }
        .device-name { font-size: 16px; font-weight: bold; color: #fff; margin-bottom: 8px; }
        .device-info { font-size: 12px; color: #888; }
        .device-info span { display: block; margin-top: 4px; }
        .logs-container { background: #16213e; border-radius: 10px; padding: 20px; }
        .logs-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px solid #333; }
        .logs-title { font-size: 18px; color: #00d4ff; }
        .btn { background: #00d4ff; color: #1a1a2e; border: none; padding: 8px 16px; border-radius: 5px; cursor: pointer; font-weight: bold; }
        .btn-danger { background: #ff4757; color: #fff; }
        .btn-refresh { background: #2ed573; color: #fff; }
        .logs-list { max-height: 70vh; overflow-y: auto; font-family: 'Monaco', 'Menlo', monospace; font-size: 12px; }
        .log-entry { padding: 8px 12px; border-bottom: 1px solid #2a2a4a; display: flex; gap: 10px; }
        .log-entry:hover { background: #1a2a4a; }
        .log-time { color: #666; flex-shrink: 0; }
        .log-level { width: 50px; flex-shrink: 0; font-weight: bold; }
        .log-level.DEBUG { color: #888; }
        .log-level.INFO { color: #00d4ff; }
        .log-level.WARN { color: #ffa502; }
        .log-level.ERROR { color: #ff4757; }
        .log-tag { color: #a55eea; width: 120px; flex-shrink: 0; overflow: hidden; text-overflow: ellipsis; }
        .log-message { color: #eee; word-break: break-all; }
        .no-logs { text-align: center; padding: 40px; color: #666; }
        .empty { text-align: center; padding: 60px; color: #666; }
        .refresh-info { font-size: 12px; color: #666; }
        .selected-device { background: #0f3460; padding: 10px 20px; border-radius: 10px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }
        .selected-device-name { font-weight: bold; color: #00d4ff; }
        .status { display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #2ed573; margin-right: 8px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚗 OSM Navigator Logs <span>Удалённый сбор логов</span></h1>
        
        <div class="devices" id="devices">
            <div class="empty">Загрузка устройств...</div>
        </div>
        
        <div id="logsSection" style="display: none;">
            <div class="selected-device">
                <div>
                    <span class="status"></span>
                    <span class="selected-device-name" id="selectedDeviceName">-</span>
                    <span id="selectedDeviceInfo" style="color: #888; margin-left: 15px; font-size: 12px;">-</span>
                </div>
                <div>
                    <button class="btn btn-refresh" onclick="loadDevices()">🔄 Обновить</button>
                    <button class="btn btn-danger" onclick="clearLogs()">🗑️ Очистить</button>
                </div>
            </div>
            
            <div class="logs-container">
                <div class="logs-header">
                    <div class="logs-title">📋 Логи</div>
                    <span class="refresh-info">Автообновление каждые 5 сек <span id="nextRefresh"></span></span>
                </div>
                <div class="logs-list" id="logsList">
                    <div class="no-logs">Выберите устройство</div>
                </div>
            </div>
        </div>
    </div>

    <script>
        let selectedDevice = null;
        let refreshTimer = null;
        let countdown = 5;
        
        async function loadDevices() {
            try {
                const res = await fetch('/api/devices');
                const devices = await res.json();
                
                const container = document.getElementById('devices');
                
                if (devices.length === 0) {
                    container.innerHTML = '<div class="empty">Нет устройств. Подключите приложение для сбора логов.</div>';
                    return;
                }
                
                container.innerHTML = devices.map(d => \`
                    <div class="device-card \${selectedDevice === d.id ? 'active' : ''}" onclick="selectDevice('\${d.id}')">
                        <div class="device-name">\${d.name}</div>
                        <div class="device-info">
                            <span>ID: \${d.id.substring(0, 8)}...</span>
                            <span>Логов: \${d.logCount}</span>
                            <span>Последний: \${formatTime(d.lastSeen)}</span>
                            \${d.appVersion ? '<span>Версия: ' + d.appVersion + '</span>' : ''}
                            \${d.androidVersion ? '<span>Android: ' + d.androidVersion + '</span>' : ''}
                        </div>
                    </div>
                \`).join('');
            } catch (e) {
                console.error('Error loading devices:', e);
            }
        }
        
        function selectDevice(deviceId) {
            selectedDevice = deviceId;
            document.getElementById('logsSection').style.display = 'block';
            loadDevices();
            loadLogs();
            startAutoRefresh();
        }
        
        async function loadLogs() {
            if (!selectedDevice) return;
            
            try {
                const res = await fetch('/api/logs/' + selectedDevice);
                const data = await res.json();
                
                const device = data.info || {};
                document.getElementById('selectedDeviceName').textContent = device.name || selectedDevice;
                document.getElementById('selectedDeviceInfo').textContent = 
                    (device.appVersion ? 'v' + device.appVersion : '') + 
                    (device.androidVersion ? ' | Android ' + device.androidVersion : '');
                
                const logs = data.logs || [];
                const container = document.getElementById('logsList');
                
                if (logs.length === 0) {
                    container.innerHTML = '<div class="no-logs">Нет логов для этого устройства</div>';
                    return;
                }
                
                container.innerHTML = logs.map(log => \`
                    <div class="log-entry">
                        <span class="log-time">\${formatTime(log.timestamp)}</span>
                        <span class="log-level \${log.level}">\${log.level}</span>
                        <span class="log-tag">\${log.tag || 'App'}</span>
                        <span class="log-message">\${escapeHtml(log.message)}</span>
                    </div>
                \`).join('');
                
                // Прокрутка вниз
                container.scrollTop = container.scrollHeight;
                
            } catch (e) {
                console.error('Error loading logs:', e);
            }
        }
        
        function clearLogs() {
            if (!selectedDevice) return;
            if (!confirm('Очистить все логи этого устройства?')) return;
            
            fetch('/api/logs/' + selectedDevice, { method: 'DELETE' })
                .then(() => {
                    loadDevices();
                    loadLogs();
                });
        }
        
        function startAutoRefresh() {
            if (refreshTimer) clearInterval(refreshTimer);
            countdown = 5;
            updateCountdown();
            
            refreshTimer = setInterval(() => {
                countdown--;
                updateCountdown();
                if (countdown <= 0) {
                    loadLogs();
                    loadDevices();
                    countdown = 5;
                }
            }, 1000);
        }
        
        function updateCountdown() {
            document.getElementById('nextRefresh').textContent = countdown > 0 ? '(' + countdown + ')' : '';
        }
        
        function formatTime(isoString) {
            if (!isoString) return '-';
            const d = new Date(isoString);
            return d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        }
        
        function escapeHtml(text) {
            if (!text) return '';
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }
        
        // Загрузка при старте
        loadDevices();
        
        // Подсветка уровней логов по regex
        setInterval(() => {
            document.querySelectorAll('.log-message').forEach(el => {
                const text = el.textContent;
                // Подсветка ошибок
                if (text.match(/exception|error|failed|fatal/i)) {
                    el.style.color = '#ff6b6b';
                }
            });
        }, 1000);
    </script>
</body>
</html>
    `;
}

// Start server
app.listen(PORT, "0.0.0.0", () => {
	console.log(`🚀 Navi Logs Server running on port ${PORT}`);
	console.log(`📱 Web interface: http://localhost:${PORT}`);
	console.log(`📡 API endpoint: http://localhost:${PORT}/api/logs`);
});

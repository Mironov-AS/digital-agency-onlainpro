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

// Хранилище данных в памяти
const logs = new Map(); // deviceId -> { info: {}, logs: [] }
const devices = new Map(); // deviceId -> { id, name, lastSeen, logCount, ... }
const telemetry = new Map(); // deviceId -> { battery, motor, vehicle, charging, tpms, satellites, lastUpdate }
const satelliteInfo = new Map(); // deviceId -> { gps, glonass, beidou, galileo, total, used, lastUpdate }

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
		telemetry: telemetry.has(d.id),
		satellites: satelliteInfo.has(d.id),
	}));
	res.json(deviceList);
});

// Получить логи устройства
app.get("/api/logs/:deviceId", (req, res) => {
	const { deviceId } = req.params;
	const data = logs.get(deviceId) || { info: {}, logs: [] };

	// Добавляем телематику
	data.telemetry = telemetry.get(deviceId) || null;
	data.satelliteInfo = satelliteInfo.get(deviceId) || null;

	res.json(data);
});

// Получить телематику устройства
app.get("/api/telemetry/:deviceId", (req, res) => {
	const { deviceId } = req.params;
	const tel = telemetry.get(deviceId);
	const sat = satelliteInfo.get(deviceId);

	res.json({
		telemetry: tel || null,
		satelliteInfo: sat || null,
	});
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

// Отправить телематику (вызывается из Android приложения)
app.post("/api/telemetry", (req, res) => {
	const { deviceId, telemetry: telData, satelliteInfo: satData } = req.body;

	if (!deviceId) {
		return res.status(400).json({ error: "deviceId required" });
	}

	const now = new Date().toISOString();

	// Сохраняем телематику
	if (telData) {
		telemetry.set(deviceId, {
			...telData,
			lastUpdate: now,
		});

		// Обновляем устройство
		if (!devices.has(deviceId)) {
			devices.set(deviceId, {
				id: deviceId,
				name: deviceId,
				lastSeen: now,
				logCount: 0,
			});
		}
		devices.get(deviceId).lastSeen = now;
	}

	// Сохраняем satellite info
	if (satData) {
		satelliteInfo.set(deviceId, {
			...satData,
			lastUpdate: now,
		});
	}

	res.json({ success: true });
});

// Очистить логи устройства
app.delete("/api/logs/:deviceId", (req, res) => {
	const { deviceId } = req.params;
	logs.delete(deviceId);
	telemetry.delete(deviceId);
	satelliteInfo.delete(deviceId);
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

// HTML интерфейс с телематикой
function getHtml() {
	return `
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>OSM Navigator - Логи и Телематика</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #1a1a2e; color: #eee; min-height: 100vh; }
        .container { max-width: 1600px; margin: 0 auto; padding: 20px; }
        h1 { color: #00d4ff; margin-bottom: 20px; display: flex; align-items: center; gap: 10px; }
        h1 span { font-size: 14px; color: #888; font-weight: normal; }
        .tabs { display: flex; gap: 10px; margin-bottom: 20px; }
        .tab { background: #16213e; padding: 12px 24px; border-radius: 8px; cursor: pointer; border: 2px solid transparent; transition: all 0.2s; }
        .tab:hover { border-color: #00d4ff; }
        .tab.active { background: #0f3460; border-color: #00d4ff; color: #00d4ff; }
        .devices { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 15px; margin-bottom: 30px; }
        .device-card { background: #16213e; border-radius: 10px; padding: 15px; cursor: pointer; transition: all 0.2s; border: 2px solid transparent; }
        .device-card:hover { border-color: #00d4ff; transform: translateY(-2px); }
        .device-card.active { border-color: #00ff88; background: #1a2a4a; }
        .device-name { font-size: 16px; font-weight: bold; color: #fff; margin-bottom: 8px; display: flex; align-items: center; gap: 8px; }
        .device-info { font-size: 12px; color: #888; }
        .device-info span { display: block; margin-top: 4px; }
        .status-dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; }
        .status-dot.online { background: #2ed573; }
        .status-dot.offline { background: #ff4757; }
        .panel { background: #16213e; border-radius: 10px; padding: 20px; margin-bottom: 20px; }
        .panel-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px solid #333; }
        .panel-title { font-size: 18px; color: #00d4ff; display: flex; align-items: center; gap: 10px; }
        .btn { background: #00d4ff; color: #1a1a2e; border: none; padding: 8px 16px; border-radius: 5px; cursor: pointer; font-weight: bold; transition: all 0.2s; }
        .btn:hover { background: #00b8e6; }
        .btn-danger { background: #ff4757; color: #fff; }
        .btn-danger:hover { background: #ff3344; }
        .btn-refresh { background: #2ed573; color: #fff; }
        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; }
        .grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; }
        .stat-card { background: #0f3460; border-radius: 8px; padding: 15px; text-align: center; }
        .stat-value { font-size: 28px; font-weight: bold; margin-bottom: 5px; }
        .stat-label { font-size: 12px; color: #888; text-transform: uppercase; }
        .stat-card.green .stat-value { color: #2ed573; }
        .stat-card.blue .stat-value { color: #00d4ff; }
        .stat-card.orange .stat-value { color: #ffa502; }
        .stat-card.red .stat-value { color: #ff4757; }
        .stat-card.purple .stat-value { color: #a55eea; }
        .telemetry-section { margin-top: 20px; }
        .telemetry-section h3 { color: #888; font-size: 14px; text-transform: uppercase; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid #333; }
        .telemetry-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #2a2a4a; }
        .telemetry-row:last-child { border-bottom: none; }
        .telemetry-label { color: #888; }
        .telemetry-value { font-weight: bold; color: #fff; }
        .logs-list { max-height: 50vh; overflow-y: auto; font-family: 'Monaco', 'Menlo', monospace; font-size: 12px; }
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
        .progress-bar { height: 8px; background: #333; border-radius: 4px; overflow: hidden; margin-top: 8px; }
        .progress-fill { height: 100%; border-radius: 4px; transition: width 0.3s; }
        .progress-fill.green { background: linear-gradient(90deg, #2ed573, #7bed9f); }
        .progress-fill.orange { background: linear-gradient(90deg, #ffa502, #ffcc00); }
        .progress-fill.red { background: linear-gradient(90deg, #ff4757, #ff6b81); }
        .no-data { text-align: center; padding: 40px; color: #666; }
        .no-data-icon { font-size: 48px; margin-bottom: 10px; }
        .empty { text-align: center; padding: 60px; color: #666; }
        .selected-device { background: #0f3460; padding: 10px 20px; border-radius: 10px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; }
        .selected-device-name { font-weight: bold; color: #00d4ff; display: flex; align-items: center; gap: 8px; }
        .badge { background: #333; padding: 4px 8px; border-radius: 4px; font-size: 11px; }
        .badge.success { background: #2ed573; color: #000; }
        .badge.warning { background: #ffa502; color: #000; }
        .badge.danger { background: #ff4757; color: #fff; }
        .refresh-info { font-size: 12px; color: #666; }
        .tab-content { display: none; }
        .tab-content.active { display: block; }
        .tire-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .tire-card { background: #0f3460; border-radius: 8px; padding: 12px; text-align: center; }
        .tire-icon { font-size: 24px; margin-bottom: 5px; }
        .tire-pressure { font-size: 18px; font-weight: bold; }
        .tire-temp { font-size: 12px; color: #888; }
        @media (max-width: 768px) {
            .grid-2, .grid-3, .grid-4 { grid-template-columns: 1fr; }
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚗 OSM Navigator <span>Телематика и Логи</span></h1>
        
        <div class="devices" id="devices">
            <div class="empty">Загрузка устройств...</div>
        </div>
        
        <div id="deviceDetail" style="display: none;">
            <div class="selected-device">
                <div class="selected-device-name">
                    <span class="status-dot" id="deviceStatus"></span>
                    <span id="selectedDeviceName">-</span>
                    <span class="badge" id="deviceAppVersion"></span>
                    <span class="badge" id="deviceAndroidVersion"></span>
                </div>
                <div style="display: flex; gap: 10px; align-items: center;">
                    <span class="refresh-info">Автообновление <span id="nextRefresh"></span></span>
                    <button class="btn btn-refresh" onclick="loadDevices()">🔄</button>
                    <button class="btn btn-danger" onclick="clearAll()">🗑️ Сброс</button>
                </div>
            </div>
            
            <div class="tabs">
                <div class="tab active" onclick="showTab('telemetry')">📊 Телематика</div>
                <div class="tab" onclick="showTab('satellites')">🛰️ Спутники</div>
                <div class="tab" onclick="showTab('logs')">📋 Логи</div>
            </div>
            
            <!-- Телематика -->
            <div id="tabTelemetry" class="tab-content active">
                <div id="telemetryContent">
                    <div class="no-data">
                        <div class="no-data-icon">📡</div>
                        <div>Нет данных телематики</div>
                        <div style="font-size: 12px; margin-top: 10px;">Данные появятся при движении автомобиля</div>
                    </div>
                </div>
            </div>
            
            <!-- Спутники -->
            <div id="tabSatellites" class="tab-content">
                <div id="satellitesContent">
                    <div class="no-data">
                        <div class="no-data-icon">🛰️</div>
                        <div>Нет данных о спутниках</div>
                    </div>
                </div>
            </div>
            
            <!-- Логи -->
            <div id="tabLogs" class="tab-content">
                <div class="panel">
                    <div class="panel-header">
                        <div class="panel-title">📋 Последние логи</div>
                        <span id="logCount" style="color: #888; font-size: 12px;"></span>
                    </div>
                    <div class="logs-list" id="logsList">
                        <div class="no-data">Нет логов</div>
                    </div>
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
                    container.innerHTML = '<div class="empty">Нет устройств. Подключите приложение для сбора данных.</div>';
                    return;
                }
                
                container.innerHTML = devices.map(d => {
                    const lastSeen = new Date(d.lastSeen);
                    const isOnline = (Date.now() - lastSeen.getTime()) < 60000;
                    return \`
                    <div class="device-card \${selectedDevice === d.id ? 'active' : ''}" onclick="selectDevice('\${d.id}')">
                        <div class="device-name">
                            <span class="status-dot \${isOnline ? 'online' : 'offline'}"></span>
                            \${d.name}
                        </div>
                        <div class="device-info">
                            <span>ID: \${d.id.substring(0, 8)}...</span>
                            <span>Последний: \${formatTime(d.lastSeen)}</span>
                            \${d.telemetry ? '<span class="badge success">Телематика</span>' : ''}
                            \${d.satellites ? '<span class="badge">Спутники</span>' : ''}
                        </div>
                    </div>
                \`;
                }).join('');
            } catch (e) {
                console.error('Error loading devices:', e);
            }
        }
        
        function selectDevice(deviceId) {
            selectedDevice = deviceId;
            document.getElementById('deviceDetail').style.display = 'block';
            loadDevices();
            loadFullData();
            startAutoRefresh();
        }
        
        async function loadFullData() {
            if (!selectedDevice) return;
            
            try {
                // Загружаем данные
                const [logsRes, telRes] = await Promise.all([
                    fetch('/api/logs/' + selectedDevice),
                    fetch('/api/telemetry/' + selectedDevice)
                ]);
                
                const logsData = await logsRes.json();
                const telData = await telRes.json();
                
                // Обновляем заголовок
                const device = logsData.info || {};
                document.getElementById('selectedDeviceName').textContent = device.name || selectedDevice;
                document.getElementById('deviceAppVersion').textContent = device.appVersion ? 'v' + device.appVersion : '';
                document.getElementById('deviceAndroidVersion').textContent = device.androidVersion ? 'Android ' + device.androidVersion : '';
                
                const isOnline = (Date.now() - new Date(device.lastSeen || 0).getTime()) < 60000;
                document.getElementById('deviceStatus').className = 'status-dot ' + (isOnline ? 'online' : 'offline');
                
                // Рендерим телематику
                renderTelemetry(telData.telemetry);
                
                // Рендерим спутники
                renderSatellites(telData.satelliteInfo);
                
                // Рендерим логи
                renderLogs(logsData.logs || []);
                
            } catch (e) {
                console.error('Error loading data:', e);
            }
        }
        
        function renderTelemetry(tel) {
            const container = document.getElementById('telemetryContent');
            
            if (!tel) {
                container.innerHTML = \`
                    <div class="no-data">
                        <div class="no-data-icon">📡</div>
                        <div>Нет данных телематики</div>
                        <div style="font-size: 12px; margin-top: 10px;">Т-Бокс не подключён или автомобиль не двигается</div>
                    </div>
                \`;
                return;
            }
            
            const soc = tel.batterySoc || 0;
            const socColor = soc <= 20 ? 'red' : soc <= 50 ? 'orange' : 'green';
            
            container.innerHTML = \`
                <div class="grid-4">
                    <div class="stat-card \${socColor}">
                        <div class="stat-value">\${soc}%</div>
                        <div class="stat-label">🔋 Заряд</div>
                        <div class="progress-bar"><div class="progress-fill \${socColor}" style="width: \${soc}%"></div></div>
                    </div>
                    <div class="stat-card blue">
                        <div class="stat-value">\${tel.speed || 0}</div>
                        <div class="stat-label">🚗 Скорость</div>
                        <div class="stat-label">км/ч</div>
                    </div>
                    <div class="stat-card purple">
                        <div class="stat-value">\${tel.batteryVoltage ? tel.batteryVoltage.toFixed(1) : '--'}</div>
                        <div class="stat-label">⚡ Напряжение</div>
                        <div class="stat-label">Вольт</div>
                    </div>
                    <div class="stat-card orange">
                        <div class="stat-value">\${tel.batteryTemp || '--'}</div>
                        <div class="stat-label">🌡️ Батарея</div>
                        <div class="stat-label">°C</div>
                    </div>
                </div>
                
                <div class="panel" style="margin-top: 20px;">
                    <div class="panel-title">🔋 Аккумуляторная батарея</div>
                    <div class="telemetry-section">
                        <div class="telemetry-row">
                            <span class="telemetry-label">Уровень заряда (SOC)</span>
                            <span class="telemetry-value">\${soc}%</span>
                        </div>
                        <div class="telemetry-row">
                            <span class="telemetry-label">Напряжение HV</span>
                            <span class="telemetry-value">\${tel.batteryVoltage ? tel.batteryVoltage.toFixed(1) + ' V' : '--'}</span>
                        </div>
                        <div class="telemetry-row">
                            <span class="telemetry-label">Ток</span>
                            <span class="telemetry-value">\${tel.batteryCurrent ? tel.batteryCurrent.toFixed(1) + ' A' : '--'}</span>
                        </div>
                        <div class="telemetry-row">
                            <span class="telemetry-label">Температура батареи</span>
                            <span class="telemetry-value">\${tel.batteryTemp || '--'} °C</span>
                        </div>
                        <div class="telemetry-row">
                            <span class="telemetry-label">Макс/Мин темп. ячеек</span>
                            <span class="telemetry-value">\${tel.batteryMaxTemp || '--'}/\${tel.batteryMinTemp || '--'} °C</span>
                        </div>
                    </div>
                </div>
                
                <div class="grid-2">
                    <div class="panel">
                        <div class="panel-title">⚡ Двигатель</div>
                        <div class="telemetry-section">
                            <div class="telemetry-row">
                                <span class="telemetry-label">Скорость</span>
                                <span class="telemetry-value">\${tel.speed || 0} км/ч</span>
                            </div>
                            <div class="telemetry-row">
                                <span class="telemetry-label">Обороты мотора</span>
                                <span class="telemetry-value">\${tel.motorSpeed || 0} об/мин</span>
                            </div>
                            <div class="telemetry-row">
                                <span class="telemetry-label">Крутящий момент</span>
                                <span class="telemetry-value">\${tel.motorTorque ? tel.motorTorque.toFixed(1) : '--'} Нм</span>
                            </div>
                            <div class="telemetry-row">
                                <span class="telemetry-label">Мощность</span>
                                <span class="telemetry-value">\${tel.motorPower || 0} кВт</span>
                            </div>
                            <div class="telemetry-row">
                                <span class="telemetry-label">Температура мотора</span>
                                <span class="telemetry-value">\${tel.motorTemp || '--'} °C</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="panel">
                        <div class="panel-title">🚗 Статус автомобиля</div>
                        <div class="telemetry-section">
                            <div class="telemetry-row">
                                <span class="telemetry-label">Общий пробег</span>
                                <span class="telemetry-value">\${tel.odometer || 0} км</span>
                            </div>
                            <div class="telemetry-row">
                                <span class="telemetry-label">Передача</span>
                                <span class="telemetry-value">\${tel.gear || 'P'}</span>
                            </div>
                            <div class="telemetry-row">
                                <span class="telemetry-label">Зажигание</span>
                                <span class="telemetry-value">\${tel.ignitionStatus || 'Выкл'}</span>
                            </div>
                            <div class="telemetry-row">
                                <span class="telemetry-label">Двери</span>
                                <span class="telemetry-value">\${tel.doorStatus || 'Закрыты'}</span>
                            </div>
                            <div class="telemetry-row">
                                <span class="telemetry-label">Угол поворота руля</span>
                                <span class="telemetry-value">\${tel.steeringAngle || 0}°</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="grid-2">
                    <div class="panel">
                        <div class="panel-title">🔌 Зарядка</div>
                        <div class="telemetry-section">
                            <div class="telemetry-row">
                                <span class="telemetry-label">Статус</span>
                                <span class="telemetry-value">\${tel.chargingStatus || 'Не заряжается'}</span>
                            </div>
                            <div class="telemetry-row">
                                <span class="telemetry-label">Разъём</span>
                                <span class="telemetry-value">\${tel.chargeGunConnected ? 'Подключен' : 'Отключен'}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="panel">
                        <div class="panel-title">🌡️ Охлаждение</div>
                        <div class="telemetry-section">
                            <div class="telemetry-row">
                                <span class="telemetry-label">Температура ОЖ</span>
                                <span class="telemetry-value">\${tel.coolantTemp || '--'} °C</span>
                            </div>
                            <div class="telemetry-row">
                                <span class="telemetry-label">ОЖ BMS</span>
                                <span class="telemetry-value">\${tel.bmsCoolantTemp || '--'} °C</span>
                            </div>
                            <div class="telemetry-row">
                                <span class="telemetry-label">ОЖ мотора</span>
                                <span class="telemetry-value">\${tel.motorCoolantTemp || '--'} °C</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="panel">
                    <div class="panel-title">🛞 Давление в шинах</div>
                    <div class="tire-grid" style="margin-top: 15px;">
                        <div class="tire-card">
                            <div class="tire-icon">🚗</div>
                            <div class="tire-pressure">\${tel.tireFLPressure ? tel.tireFLPressure.toFixed(1) : '--'} PSI</div>
                            <div class="tire-temp">Передняя левая \${tel.tireFLTemp ? tel.tireFLTemp + '°C' : ''}</div>
                        </div>
                        <div class="tire-card">
                            <div class="tire-icon">🚗</div>
                            <div class="tire-pressure">\${tel.tireFRPressure ? tel.tireFRPressure.toFixed(1) : '--'} PSI</div>
                            <div class="tire-temp">Передняя правая \${tel.tireFRTemp ? tel.tireFRTemp + '°C' : ''}</div>
                        </div>
                        <div class="tire-card">
                            <div class="tire-icon">🚗</div>
                            <div class="tire-pressure">\${tel.tireRLPressure ? tel.tireRLPressure.toFixed(1) : '--'} PSI</div>
                            <div class="tire-temp">Задняя левая \${tel.tireRLTemp ? tel.tireRLTemp + '°C' : ''}</div>
                        </div>
                        <div class="tire-card">
                            <div class="tire-icon">🚗</div>
                            <div class="tire-pressure">\${tel.tireRRPressure ? tel.tireRRPressure.toFixed(1) : '--'} PSI</div>
                            <div class="tire-temp">Задняя правая \${tel.tireRRTemp ? tel.tireRRTemp + '°C' : ''}</div>
                        </div>
                    </div>
                </div>
                
                <div class="panel">
                    <div class="panel-title">🔋 12V Аккумулятор</div>
                    <div class="telemetry-section">
                        <div class="telemetry-row">
                            <span class="telemetry-label">Напряжение</span>
                            <span class="telemetry-value">\${tel.battery12V ? tel.battery12V.toFixed(1) + ' V' : '--'}</span>
                        </div>
                        <div class="telemetry-row">
                            <span class="telemetry-label">Температура</span>
                            <span class="telemetry-value">\${tel.battery12VTemp || '--'} °C</span>
                        </div>
                    </div>
                </div>
                
                <div class="panel">
                    <div class="telemetry-row">
                        <span class="telemetry-label">🖥️ CAN фреймов</span>
                        <span class="telemetry-value">\${tel.canFramesReceived || 0}</span>
                    </div>
                    <div class="telemetry-row">
                        <span class="telemetry-label">🕐 Последнее обновление</span>
                        <span class="telemetry-value">\${tel.lastUpdate ? formatTime(tel.lastUpdate) : '--'}</span>
                    </div>
                </div>
            \`;
        }
        
        function renderSatellites(sat) {
            const container = document.getElementById('satellitesContent');
            
            if (!sat) {
                container.innerHTML = \`
                    <div class="no-data">
                        <div class="no-data-icon">🛰️</div>
                        <div>Нет данных о спутниках</div>
                    </div>
                \`;
                return;
            }
            
            const total = sat.totalSatellites || 0;
            const used = sat.usedInFix || 0;
            
            container.innerHTML = \`
                <div class="grid-4">
                    <div class="stat-card green">
                        <div class="stat-value">\${total}</div>
                        <div class="stat-label">🛰️ Всего</div>
                    </div>
                    <div class="stat-card blue">
                        <div class="stat-value">\${used}</div>
                        <div class="stat-label">✓ В фиксе</div>
                    </div>
                    <div class="stat-card purple">
                        <div class="stat-value">\${sat.gps || 0}</div>
                        <div class="stat-label">📍 GPS</div>
                    </div>
                    <div class="stat-card purple">
                        <div class="stat-value">\${sat.glonass || 0}</div>
                        <div class="stat-label">🛰️ ГЛОНАСС</div>
                    </div>
                </div>
                
                <div class="grid-2" style="margin-top: 20px;">
                    <div class="panel">
                        <div class="panel-title">📡 По созвездиям</div>
                        <div class="telemetry-section">
                            <div class="telemetry-row">
                                <span class="telemetry-label">🛰️ GPS</span>
                                <span class="telemetry-value">\${sat.gps || 0} спутников</span>
                            </div>
                            <div class="telemetry-row">
                                <span class="telemetry-label">🛰️ ГЛОНАСС</span>
                                <span class="telemetry-value">\${sat.glonass || 0} спутников</span>
                            </div>
                            <div class="telemetry-row">
                                <span class="telemetry-label">🛰️ BeiDou</span>
                                <span class="telemetry-value">\${sat.beidou || 0} спутников</span>
                            </div>
                            <div class="telemetry-row">
                                <span class="telemetry-label">🛰️ Galileo</span>
                                <span class="telemetry-value">\${sat.galileo || 0} спутников</span>
                            </div>
                            <div class="telemetry-row">
                                <span class="telemetry-label">🛰️ QZSS</span>
                                <span class="telemetry-value">\${sat.qzss || 0} спутников</span>
                            </div>
                            <div class="telemetry-row">
                                <span class="telemetry-label">🛰️ SBAS</span>
                                <span class="telemetry-value">\${sat.sbas || 0} спутников</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="panel">
                        <div class="panel-title">📊 Дополнительно</div>
                        <div class="telemetry-section">
                            <div class="telemetry-row">
                                <span class="telemetry-label">📍 Латчитуд</span>
                                <span class="telemetry-value">\${sat.latitude ? sat.latitude.toFixed(6) : '--'}</span>
                            </div>
                            <div class="telemetry-row">
                                <span class="telemetry-label">📍 Лонглитуд</span>
                                <span class="telemetry-value">\${sat.longitude ? sat.longitude.toFixed(6) : '--'}</span>
                            </div>
                            <div class="telemetry-row">
                                <span class="telemetry-label">📏 Высота</span>
                                <span class="telemetry-value">\${sat.altitude ? sat.altitude.toFixed(1) : '--'} м</span>
                            </div>
                            <div class="telemetry-row">
                                <span class="telemetry-label">📐 Точность</span>
                                <span class="telemetry-value">\${sat.accuracy ? sat.accuracy.toFixed(1) : '--'} м</span>
                            </div>
                            <div class="telemetry-row">
                                <span class="telemetry-label">🕐 Последнее обновление</span>
                                <span class="telemetry-value">\${sat.lastUpdate ? formatTime(sat.lastUpdate) : '--'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            \`;
        }
        
        function renderLogs(logs) {
            const container = document.getElementById('logsList');
            document.getElementById('logCount').textContent = logs.length + ' записей';
            
            if (logs.length === 0) {
                container.innerHTML = '<div class="no-data">Нет логов</div>';
                return;
            }
            
            // Показываем последние 100
            const recentLogs = logs.slice(-100);
            
            container.innerHTML = recentLogs.map(log => \`
                <div class="log-entry">
                    <span class="log-time">\${formatTime(log.timestamp)}</span>
                    <span class="log-level \${log.level}">\${log.level}</span>
                    <span class="log-tag">\${log.tag || 'App'}</span>
                    <span class="log-message">\${escapeHtml(log.message)}</span>
                </div>
            \`).join('');
            
            container.scrollTop = container.scrollHeight;
        }
        
        function showTab(tabName) {
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            
            document.querySelector(\`.tab[onclick="showTab('\${tabName}')"]\`).classList.add('active');
            document.getElementById('tab' + tabName.charAt(0).toUpperCase() + tabName.slice(1)).classList.add('active');
        }
        
        function clearAll() {
            if (!selectedDevice) return;
            if (!confirm('Очистить все данные этого устройства?')) return;
            
            fetch('/api/logs/' + selectedDevice, { method: 'DELETE' })
                .then(() => {
                    loadDevices();
                    loadFullData();
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
                    loadFullData();
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
    </script>
</body>
</html>
    `;
}

// Start server
app.listen(PORT, "0.0.0.0", () => {
	console.log(`Server running on port ${PORT}`);
	console.log(`Web interface: http://localhost:${PORT}`);
	console.log(`API endpoints:
   POST /api/logs      - send log
   POST /api/telemetry - send telemetry
   GET  /api/devices   - list devices
   GET  /api/logs/:id  - device logs
   GET  /api/telemetry/:id - device telemetry`);
});

/**
 * Local API Server - Fallback для разработки без внешних сервисов
 */
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");
const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Пути для навигатора
const NAVIGATOR_APK_DIR = path.join(__dirname, "public", "navigator-apk");
const NAVIGATOR_VERSION_FILE = path.join(NAVIGATOR_APK_DIR, "version.json");
const NAVIGATOR_APK_FILE = path.join(NAVIGATOR_APK_DIR, "osm-navigator.apk");

// Fallback данные для услуг
const services = [
	{
		id: 1,
		name: "Разработка сайтов",
		category_id: 1,
		price: 45000,
		description: "Создание современных веб-сайтов любой сложности",
		active: true,
	},
	{
		id: 2,
		name: "Продвижение в соцсетях",
		category_id: 2,
		price: 25000,
		description: "Ведение и продвижение в Instagram, VK, Telegram",
		active: true,
	},
	{
		id: 3,
		name: "SEO-оптимизация",
		category_id: 3,
		price: 35000,
		description: "Поисковая оптимизация сайта для повышения позиций",
		active: true,
	},
	{
		id: 4,
		name: "Дизайн",
		category_id: 1,
		price: 30000,
		description: "Разработка дизайна сайтов, логотипов, баннеров",
		active: true,
	},
	{
		id: 5,
		name: "Техподдержка",
		category_id: 4,
		price: 15000,
		description: "Ежемесячная техническая поддержка сайта",
		active: true,
	},
];

const categories = [
	{ id: 1, name: "Разработка", icon: "code" },
	{ id: 2, name: "Маркетинг", icon: "trending" },
	{ id: 3, name: "SEO", icon: "search" },
	{ id: 4, name: "Поддержка", icon: "support" },
];

// API Routes
app.get("/api/catalog/services", (req, res) => {
	res.json({ success: true, data: services });
});

app.get("/api/catalog/services/:id", (req, res) => {
	const service = services.find((s) => s.id === parseInt(req.params.id));
	if (service) {
		res.json({ success: true, data: service });
	} else {
		res.status(404).json({ success: false, error: "Service not found" });
	}
});

app.get("/api/catalog/categories", (req, res) => {
	res.json({ success: true, data: categories });
});

app.get("/api/catalog/costs", (req, res) => {
	res.json({ success: true, data: [] });
});

// Health check
app.get("/api/health", (req, res) => {
	res.json({ status: "ok", mode: "local-fallback" });
});

// Admin API
app.get("/api/admin/stats", (req, res) => {
	res.json({
		success: true,
		data: {
			clients: 24,
			projects: 87,
			revenue: 1250000,
			pending: 3,
		},
	});
});

app.get("/api/admin/leads", (req, res) => {
	res.json({
		success: true,
		data: [
			{
				id: 1,
				name: "ООО Компания",
				phone: "+7 999 123-45-67",
				status: "new",
				created: new Date().toISOString(),
			},
			{
				id: 2,
				name: "ИП Сидоров",
				phone: "+7 999 765-43-21",
				status: "processing",
				created: new Date().toISOString(),
			},
		],
	});
});

// Navigator API - информация о сборке
app.get("/navigator-api/info", (req, res) => {
	try {
		const apkExists = fs.existsSync(NAVIGATOR_APK_FILE);
		let info = {
			exists: apkExists,
			version: null,
			buildDate: null,
			fileSize: null,
			changelog: [
				"Голосовые подсказки на русском",
				"Проекция на приборную панель",
				"Запись треков",
				"OSRM роутинг",
				"Камеры ГИБДД",
			],
		};

		if (apkExists) {
			const stat = fs.statSync(NAVIGATOR_APK_FILE);
			info.fileSize = stat.size;

			// Читаем version.json если есть
			if (fs.existsSync(NAVIGATOR_VERSION_FILE)) {
				const versionData = JSON.parse(
					fs.readFileSync(NAVIGATOR_VERSION_FILE, "utf8"),
				);
				info = { ...info, ...versionData };
			}
		}

		res.json(info);
	} catch (e) {
		res.status(500).json({ error: e.message });
	}
});

// Navigator API - запуск сборки
app.post("/navigator-api/build", (req, res) => {
	const buildScript = path.join(__dirname, "build-navigator.sh");

	if (!fs.existsSync(buildScript)) {
		return res.status(500).json({ error: "Build script not found" });
	}

	// Запускаем асинхронно
	exec(`bash ${buildScript} > /tmp/navigator-build.log 2>&1 &`, (err) => {
		if (err) {
			return res
				.status(500)
				.json({ error: "Failed to start build: " + err.message });
		}
		res.json({
			success: true,
			message: "Build started. Check status with GET /navigator-api/info",
		});
	});
});

// Раздача APK статикой
app.use("/navigator-apk", express.static(NAVIGATOR_APK_DIR));

app.listen(PORT, "0.0.0.0", () => {
	console.log(`Local API server running on port ${PORT}`);
});

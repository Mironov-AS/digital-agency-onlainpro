// Mock сервер для лендинга — возвращает услуги без базы данных
/* eslint-disable no-undef */
/* global process:readonly */
const http = require("http");

const MOCK_CATEGORIES = [
	{ value: "websites", label: "Сайты и веб-приложения", color: "#a855f7" },
	{ value: "webapps", label: "Веб-приложения и сервисы", color: "#22d3ee" },
	{ value: "automation", label: "Автоматизация", color: "#7c3aed" },
];

const MOCK_SERVICES = [
	// Websites
	{
		id: "1",
		title: "Лендинг",
		description: "Одностраничный сайт для продвижения продукта или услуги",
		price: 35000,
		price_type: "fixed",
		price_label: "от 35 000 ₽",
		category: "websites",
		sort_order: 1,
	},
	{
		id: "2",
		title: "Корпоративный сайт",
		description: "Многостраничный сайт с полной информацией о компании",
		price: 80000,
		price_type: "from",
		price_label: "от 80 000 ₽",
		category: "websites",
		sort_order: 2,
	},
	{
		id: "3",
		title: "Интернет-магазин",
		description: "Полноценный магазин с корзиной и оплатой",
		price: 150000,
		price_type: "from",
		price_label: "от 150 000 ₽",
		category: "websites",
		sort_order: 3,
	},

	// Webapps
	{
		id: "4",
		title: "MVP за 2 недели",
		description:
			"Быстрый запуск вашей идеи. Прототип, готовый к проверке спроса",
		price: 120000,
		price_type: "fixed",
		price_label: "от 120 000 ₽",
		category: "webapps",
		sort_order: 4,
	},
	{
		id: "5",
		title: "CRM-система",
		description: "Система управления клиентами и продажами",
		price: 90000,
		price_type: "from",
		price_label: "от 90 000 ₽",
		category: "webapps",
		sort_order: 5,
	},
	{
		id: "6",
		title: "ERP-система",
		description: "Комплексная система управления ресурсами предприятия",
		price: 200000,
		price_type: "from",
		price_label: "от 200 000 ₽",
		category: "webapps",
		sort_order: 6,
	},

	// Automation
	{
		id: "7",
		title: "Электронная очередь",
		description: "Система записи и управления очередью для клиник, МФЦ, банков",
		price: 50000,
		price_type: "from",
		price_label: "от 50 000 ₽",
		category: "automation",
		sort_order: 7,
	},
	{
		id: "8",
		title: "Автоматизация бизнеса",
		description: "Замена бумажных процессов на удобные цифровые решения",
		price: 80000,
		price_type: "from",
		price_label: "от 80 000 ₽",
		category: "automation",
		sort_order: 8,
	},
	{
		id: "9",
		title: "Внедрение ИИ",
		description: "Интеграция AI-решений в ваши бизнес-процессы",
		price: 100000,
		price_type: "from",
		price_label: "от 100 000 ₽",
		category: "automation",
		sort_order: 9,
	},
];

const server = http.createServer((req, res) => {
	// CORS
	res.setHeader("Access-Control-Allow-Origin", "*");
	res.setHeader(
		"Access-Control-Allow-Methods",
		"GET, POST, PUT, DELETE, OPTIONS",
	);
	res.setHeader("Access-Control-Allow-Headers", "Content-Type");

	if (req.method === "OPTIONS") {
		res.writeHead(200);
		res.end();
		return;
	}

	const url = new URL(req.url, `http://${req.headers.host}`);

	// Mock endpoints
	if (url.pathname === "/api/catalog/services") {
		res.writeHead(200, { "Content-Type": "application/json" });
		res.end(JSON.stringify(MOCK_SERVICES));
		return;
	}

	if (url.pathname === "/api/catalog/categories") {
		res.writeHead(200, { "Content-Type": "application/json" });
		res.end(JSON.stringify(MOCK_CATEGORIES));
		return;
	}

	if (url.pathname === "/api/admin/smtp-status") {
		res.writeHead(200, { "Content-Type": "application/json" });
		res.end(JSON.stringify({ is_enabled: true }));
		return;
	}

	// Fallback
	res.writeHead(404, { "Content-Type": "application/json" });
	res.end(JSON.stringify({ error: "Not found" }));
});

const PORT = process.env.PORT || 8005;
server.listen(PORT, () => {
	console.log(`[Mock Server] Запущен на порту ${PORT}`);
	console.log("Endpoints:");
	console.log("  GET /api/catalog/services");
	console.log("  GET /api/catalog/categories");
	console.log("  GET /api/admin/smtp-status");
});

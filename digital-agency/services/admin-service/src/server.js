/**
 * Admin Service — Monitoring, Service Management & Lead Management API
 */
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const http = require("http");
const path = require("path");
const nodemailer = require("nodemailer");
const createPgDb = require("../../../shared/db");
const projectRoot = path.resolve(__dirname, "../..");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const { requireAdmin } = require("../../../shared/middleware/auth");
const db = createPgDb();

// Simple inline logger for admin-service (no shared dependency needed)
const fs = require("fs");
const LOG_DIR = path.join(projectRoot, "logs");

function ensureLogDir() {
	if (!fs.existsSync(LOG_DIR)) {
		fs.mkdirSync(LOG_DIR, { recursive: true });
	}
}

function writeLog(level, message, data) {
	ensureLogDir();
	const timestamp = new Date().toISOString();
	const logEntry = JSON.stringify({
		timestamp,
		level,
		service: "admin-service",
		message,
		...(data && { data }),
	});
	console.log(
		`[${timestamp}] [${level.toUpperCase()}] [admin-service] ${message}`,
	);
	if (data) console.log(`  Data: ${JSON.stringify(data)}`);
	const logFile = path.join(LOG_DIR, "admin-service.log");
	fs.appendFileSync(logFile, logEntry + "\n");
}

const logger = {
	debug: (msg, data) => writeLog("debug", msg, data),
	info: (msg, data) => writeLog("info", msg, data),
	warn: (msg, data) => writeLog("warn", msg, data),
	error: (msg, data) => writeLog("error", msg, data),
	readLogs: () => [],
	readAllLogs: () => [],
};

const app = express();

app.use(helmet());
app.use(
	cors({
		origin: process.env.CORS_ORIGIN || "http://localhost",
		credentials: true,
	}),
);
app.use(express.json());
app.use(cookieParser());

// Middleware to add request logging
app.use((req, res, next) => {
	logger.info(`${req.method} ${req.path}`, { query: req.query });
	next();
});

// Service definitions
const SERVICES = [
	{ id: "auth", name: "Auth Service", port: 4001 },
	{ id: "catalog", name: "Catalog Service", port: 4002 },
	{ id: "clients", name: "Clients Service", port: 4003 },
	{ id: "projects", name: "Projects Service", port: 4004 },
	{ id: "product-shelf", name: "Product Shelf Service", port: 4006 },
];

// Check service health
function checkService(port) {
	return new Promise((resolve) => {
		const req = http.get(
			`http://localhost:${port}/api/health`,
			{ timeout: 2000 },
			(res) => {
				let data = "";
				res.on("data", (chunk) => (data += chunk));
				res.on("end", () => {
					try {
						resolve({ healthy: true, response: JSON.parse(data) });
					} catch {
						resolve({ healthy: true, response: null });
					}
				});
			},
		);

		req.on("error", (err) => {
			resolve({ healthy: false, error: err.message });
		});

		req.on("timeout", () => {
			req.destroy();
			resolve({ healthy: false, error: "Timeout" });
		});
	});
}

// Restart service (simulated for demo)
async function restartService(serviceId) {
	const service = SERVICES.find((s) => s.id === serviceId);
	if (!service) {
		return { success: false, error: "Service not found" };
	}

	logger.warn(`Restarting service ${service.name}`, {
		serviceId,
		port: service.port,
	});

	// In real implementation, this would:
	// 1. Send SIGTERM to process on the port
	// 2. Wait for graceful shutdown
	// 3. Start the service again

	return {
		success: true,
		message: `Service ${service.name} restart initiated`,
	};
}

// Stop service (simulated for demo)
async function stopService(serviceId) {
	const service = SERVICES.find((s) => s.id === serviceId);
	if (!service) {
		return { success: false, error: "Service not found" };
	}

	logger.warn(`Stopping service ${service.name}`, {
		serviceId,
		port: service.port,
	});

	return { success: true, message: `Service ${service.name} stop initiated` };
}

// Health check (before auth middleware so monitoring works without token)
app.get("/api/health", (req, res) => {
	res.json({ service: "admin-service", status: "ok" });
});

// Public payment request (no auth required — called from client portal)
app.post("/api/admin/payment-request", async (req, res) => {
	try {
		const { client_name, product_name, client_email } = req.body;
		if (!client_name || !product_name)
			return res
				.status(400)
				.json({ error: "client_name и product_name обязательны" });

		const subject = `${client_name}, ${product_name}, хочет оплатить`;
		const html = `
      <h2>Запрос на оплату</h2>
      <table style="border-collapse:collapse;font-family:sans-serif;">
        <tr><td style="padding:6px 12px;font-weight:bold;">Клиент:</td><td style="padding:6px 12px;">${client_name}</td></tr>
        <tr><td style="padding:6px 12px;font-weight:bold;">Продукт:</td><td style="padding:6px 12px;">${product_name}</td></tr>
        ${client_email ? `<tr><td style="padding:6px 12px;font-weight:bold;">Email клиента:</td><td style="padding:6px 12px;"><a href="mailto:${client_email}">${client_email}</a></td></tr>` : ""}
      </table>
      <p style="color:#6b7280;font-size:13px;margin-top:16px;">Запрос получен ${new Date().toLocaleString("ru-RU")}</p>
    `;

		const recipients = await db
			.prepare("SELECT email FROM lead_emails WHERE is_active = TRUE")
			.all();
		if (recipients.length === 0) {
			logger.warn("Нет получателей для запроса оплаты");
			return res.json({ ok: true, message: "Запрос принят" });
		}

		const to = recipients.map((r) => r.email);

		const smtpSettings = await db
			.prepare("SELECT * FROM smtp_settings WHERE id = ? AND is_enabled = TRUE")
			.get("default");
		if (smtpSettings && smtpSettings.host && smtpSettings.username) {
			await sendViaSmtpWithSettings(to.join(", "), subject, html, smtpSettings);
		} else if (process.env.SMTP_HOST && process.env.SMTP_USER) {
			await sendViaSmtpEnv(to.join(", "), subject, html);
		} else {
			logger.warn("Email не настроен — запрос оплаты не отправлен");
		}

		logger.info("Payment request email sent", { client_name, product_name });
		res.json({ ok: true, message: "Запрос на оплату отправлен" });
	} catch (e) {
		logger.error("Payment request email error", { error: e.message });
		res.status(500).json({ error: e.message });
	}
});

// Public SMTP status check (no auth required — used by landing page)
app.get("/api/admin/smtp-status", async (_req, res) => {
	try {
		const row = await db
			.prepare("SELECT is_enabled FROM smtp_settings WHERE id = ?")
			.get("default");
		res.json({ is_enabled: !!(row && row.is_enabled) });
	} catch (_e) {
		res.json({ is_enabled: false });
	}
});

// Public lead submission (no auth required)
app.post("/api/admin/leads", async (req, res) => {
	try {
		const { name, email, phone, subject, source } = req.body;
		if (!name || !email)
			return res.status(400).json({ error: "Имя и email обязательны" });
		const id = require("crypto").randomUUID();
		const created_at = new Date().toISOString();
		await db
			.prepare(
				"INSERT INTO leads (id, name, email, phone, subject, source, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
			)
			.run(
				id,
				name.trim(),
				email.trim(),
				(phone || "").trim(),
				subject || "Заявка с сайта",
				source || "",
				created_at,
			);
		const lead = {
			id,
			name: name.trim(),
			email: email.trim(),
			phone: (phone || "").trim(),
			subject: subject || "Заявка с сайта",
			source: source || "",
			created_at,
		};
		sendLeadEmail(lead).catch(() => {});
		res.status(201).json({ ok: true });
	} catch (e) {
		res.status(500).json({ error: e.message });
	}
});

// Routes — all require admin authentication
app.use(requireAdmin);

// GET /api/admin/services — list all services with status
app.get("/api/admin/services", async (req, res) => {
	const statuses = {};

	for (const svc of SERVICES) {
		const health = await checkService(svc.port);
		statuses[svc.id] = {
			...svc,
			status: health.healthy ? "running" : "stopped",
			health: health,
		};
	}

	res.json({ services: statuses });
});

// GET /api/admin/services/:id — get single service status
app.get("/api/admin/services/:id", async (req, res) => {
	const service = SERVICES.find((s) => s.id === req.params.id);
	if (!service) {
		return res.status(404).json({ error: "Service not found" });
	}

	const health = await checkService(service.port);
	res.json({
		...service,
		status: health.healthy ? "running" : "stopped",
		health,
	});
});

// POST /api/admin/services/:id/restart — restart service
app.post("/api/admin/services/:id/restart", async (req, res) => {
	const result = await restartService(req.params.id);
	if (result.success) {
		res.json(result);
	} else {
		res.status(404).json(result);
	}
});

// POST /api/admin/services/:id/stop — stop service
app.post("/api/admin/services/:id/stop", async (req, res) => {
	const result = await stopService(req.params.id);
	if (result.success) {
		res.json(result);
	} else {
		res.status(404).json(result);
	}
});

// POST /api/admin/services/:id/start — start service
app.post("/api/admin/services/:id/start", async (req, res) => {
	const service = SERVICES.find((s) => s.id === req.params.id);
	if (!service) {
		return res.status(404).json({ error: "Service not found" });
	}

	logger.info(`Starting service ${service.name}`, { serviceId: service.id });
	res.json({
		success: true,
		message: `Service ${service.name} start initiated`,
	});
});

// GET /api/admin/logs — get all logs
app.get("/api/admin/logs", (req, res) => {
	const { level, search, service, limit = 100 } = req.query;

	const options = {
		level: level || undefined,
		search: search || undefined,
		limit: parseInt(limit, 10) || 100,
	};

	let logs;
	if (service) {
		logs = logger.readLogs(service, options);
	} else {
		logs = logger.readAllLogs(options);
	}

	res.json({ logs, total: logs.length });
});

// GET /api/admin/logs/:service — get logs for specific service
app.get("/api/admin/logs/:service", (req, res) => {
	const { level, search, limit = 100 } = req.query;

	const options = {
		level: level || undefined,
		search: search || undefined,
		limit: parseInt(limit, 10) || 100,
	};

	const logs = logger.readLogs(req.params.service, options);
	res.json({ logs, total: logs.length });
});

// ─── Lead Emails (справочник получателей) ─────────────────────────────────

app.get("/api/admin/lead-emails", async (req, res) => {
	try {
		const rows = await db
			.prepare("SELECT * FROM lead_emails ORDER BY created_at DESC")
			.all();
		res.json(rows);
	} catch (e) {
		res.status(500).json({ error: e.message });
	}
});

app.post("/api/admin/lead-emails", async (req, res) => {
	try {
		const { email, label } = req.body;
		if (!email) return res.status(400).json({ error: "Email обязателен" });
		const id = require("crypto").randomUUID();
		await db
			.prepare("INSERT INTO lead_emails (id, email, label) VALUES (?, ?, ?)")
			.run(id, email.trim().toLowerCase(), (label || "").trim());
		const row = await db
			.prepare("SELECT * FROM lead_emails WHERE id = ?")
			.get(id);
		res.status(201).json(row);
	} catch (e) {
		if (e.message?.includes("unique") || e.code === "23505")
			return res.status(409).json({ error: "Этот email уже добавлен" });
		res.status(500).json({ error: e.message });
	}
});

app.patch("/api/admin/lead-emails/:id", async (req, res) => {
	try {
		const { email, label, is_active } = req.body;
		const existing = await db
			.prepare("SELECT * FROM lead_emails WHERE id = ?")
			.get(req.params.id);
		if (!existing) return res.status(404).json({ error: "Не найден" });
		await db
			.prepare(
				"UPDATE lead_emails SET email = ?, label = ?, is_active = ? WHERE id = ?",
			)
			.run(
				email || existing.email,
				label ?? existing.label,
				is_active ?? existing.is_active,
				req.params.id,
			);
		const row = await db
			.prepare("SELECT * FROM lead_emails WHERE id = ?")
			.get(req.params.id);
		res.json(row);
	} catch (e) {
		res.status(500).json({ error: e.message });
	}
});

app.delete("/api/admin/lead-emails/:id", async (req, res) => {
	try {
		await db.prepare("DELETE FROM lead_emails WHERE id = ?").run(req.params.id);
		res.json({ ok: true });
	} catch (e) {
		res.status(500).json({ error: e.message });
	}
});

// ─── SMTP Settings ───────────────────────────────────────────────────────

app.get("/api/admin/smtp-settings", async (req, res) => {
	try {
		let row = await db
			.prepare("SELECT * FROM smtp_settings WHERE id = ?")
			.get("default");
		if (!row) {
			row = {
				id: "default",
				host: process.env.SMTP_HOST || "",
				port: Number(process.env.SMTP_PORT) || 465,
				username: process.env.SMTP_USER || "",
				password: "",
				from_email: process.env.SMTP_FROM || process.env.SMTP_USER || "",
				from_name: "",
				use_ssl: true,
				is_enabled: false,
			};
		}
		res.json({ ...row, password: row.password ? "••••••••" : "" });
	} catch (e) {
		res.status(500).json({ error: e.message });
	}
});

app.put("/api/admin/smtp-settings", async (req, res) => {
	try {
		const {
			host,
			port,
			username,
			password,
			from_email,
			from_name,
			use_ssl,
			is_enabled,
		} = req.body;
		if (!host || !username || !from_email) {
			return res
				.status(400)
				.json({
					error: "Хост, имя пользователя и email отправителя обязательны",
				});
		}
		const existing = await db
			.prepare("SELECT * FROM smtp_settings WHERE id = ?")
			.get("default");
		const finalPassword =
			password && password !== "••••••••" ? password : existing?.password || "";
		const now = new Date().toISOString();
		if (existing) {
			await db
				.prepare(
					"UPDATE smtp_settings SET host = ?, port = ?, username = ?, password = ?, from_email = ?, from_name = ?, use_ssl = ?, is_enabled = ?, updated_at = ? WHERE id = ?",
				)
				.run(
					host.trim(),
					Number(port) || 465,
					username.trim(),
					finalPassword,
					from_email.trim(),
					(from_name || "").trim(),
					use_ssl ?? true,
					is_enabled ?? false,
					now,
					"default",
				);
		} else {
			await db
				.prepare(
					"INSERT INTO smtp_settings (id, host, port, username, password, from_email, from_name, use_ssl, is_enabled, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
				)
				.run(
					"default",
					host.trim(),
					Number(port) || 465,
					username.trim(),
					finalPassword,
					from_email.trim(),
					(from_name || "").trim(),
					use_ssl ?? true,
					is_enabled ?? false,
					now,
				);
		}
		const row = await db
			.prepare("SELECT * FROM smtp_settings WHERE id = ?")
			.get("default");
		logger.info("SMTP settings updated", {
			host: row.host,
			port: row.port,
			is_enabled: row.is_enabled,
		});
		res.json({ ...row, password: row.password ? "••••••••" : "" });
	} catch (e) {
		res.status(500).json({ error: e.message });
	}
});

app.post("/api/admin/smtp-test", async (req, res) => {
	try {
		const { test_email } = req.body;
		if (!test_email)
			return res
				.status(400)
				.json({ error: "Укажите email для тестового письма" });

		const subject = "Тестовое письмо — ОнлайнПро.РФ";
		const html = `<h2>Тестовое письмо</h2><p>Email настроен корректно.</p><p style="color:#6b7280;font-size:13px;">Отправлено: ${new Date().toLocaleString("ru-RU")}</p>`;

		const settings = await db
			.prepare("SELECT * FROM smtp_settings WHERE id = ?")
			.get("default");
		if (!settings || !settings.host || !settings.username) {
			return res
				.status(400)
				.json({
					error:
						"Email не настроен. Настройте SMTP в разделе администрирования.",
				});
		}

		await sendViaSmtpWithSettings(test_email, subject, html, settings);
		logger.info("Test email sent (SMTP)", {
			to: test_email,
			host: settings.host,
		});
		res.json({ ok: true, message: "Тестовое письмо отправлено (SMTP)" });
	} catch (e) {
		logger.error("Email test failed", { error: e.message });
		res.status(500).json({ error: `Ошибка отправки: ${e.message}` });
	}
});

// ─── Leads (заявки — публичный POST, админский GET) ───────────────────────

// POST lead — public, no auth required. Mounted BEFORE requireAuth above, so we need a separate handler.
// We handle it via a special path that's registered before the auth middleware (see below).

app.get("/api/admin/leads", async (req, res) => {
	try {
		const rows = await db
			.prepare("SELECT * FROM leads ORDER BY created_at DESC")
			.all();
		res.json(rows);
	} catch (e) {
		res.status(500).json({ error: e.message });
	}
});

// Error handler
app.use((err, req, res, next) => {
	logger.error("Request error", { error: err.message, path: req.path });
	res.status(500).json({ error: "Internal server error" });
});

// ─── DB Init & Start ──────────────────────────────────────────────────────

async function initDb() {
	if (db.ensureSchema) await db.ensureSchema();
	await db.exec(`
    CREATE TABLE IF NOT EXISTS lead_emails (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      label TEXT DEFAULT '',
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS leads (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT DEFAULT '',
      subject TEXT DEFAULT 'Заявка с сайта',
      source TEXT DEFAULT '',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS smtp_settings (
      id TEXT PRIMARY KEY DEFAULT 'default',
      host TEXT NOT NULL DEFAULT '',
      port INTEGER NOT NULL DEFAULT 465,
      username TEXT NOT NULL DEFAULT '',
      password TEXT NOT NULL DEFAULT '',
      from_email TEXT NOT NULL DEFAULT '',
      from_name TEXT NOT NULL DEFAULT '',
      use_ssl BOOLEAN DEFAULT TRUE,
      is_enabled BOOLEAN DEFAULT FALSE,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
	logger.info("DB tables initialized");
}

function buildLeadHtml(lead) {
	return `
    <h2>${lead.subject}</h2>
    <table style="border-collapse:collapse;font-family:sans-serif;">
      <tr><td style="padding:6px 12px;font-weight:bold;">Имя:</td><td style="padding:6px 12px;">${lead.name}</td></tr>
      <tr><td style="padding:6px 12px;font-weight:bold;">Email:</td><td style="padding:6px 12px;"><a href="mailto:${lead.email}">${lead.email}</a></td></tr>
      ${lead.phone ? `<tr><td style="padding:6px 12px;font-weight:bold;">Телефон:</td><td style="padding:6px 12px;"><a href="tel:${lead.phone}">${lead.phone}</a></td></tr>` : ""}
      ${lead.source ? `<tr><td style="padding:6px 12px;font-weight:bold;">Источник:</td><td style="padding:6px 12px;">${lead.source}</td></tr>` : ""}
    </table>
    <p style="color:#6b7280;font-size:13px;margin-top:16px;">Заявка получена ${new Date(lead.created_at).toLocaleString("ru-RU")}</p>
  `;
}

async function sendViaSmtpWithSettings(to, subject, html, settings) {
	const fromAddr = settings.from_name
		? `${settings.from_name} <${settings.from_email}>`
		: settings.from_email;
	const transporter = nodemailer.createTransport({
		host: settings.host,
		port: settings.port,
		secure: settings.use_ssl,
		auth: { user: settings.username, pass: settings.password },
		connectionTimeout: 15000,
	});
	await transporter.sendMail({ from: fromAddr, to, subject, html });
}

async function sendViaSmtpEnv(to, subject, html) {
	const transporter = nodemailer.createTransport({
		host: process.env.SMTP_HOST,
		port: Number(process.env.SMTP_PORT || 587),
		secure: Number(process.env.SMTP_PORT) === 465,
		auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
		connectionTimeout: 15000,
	});
	const from = process.env.SMTP_FROM || process.env.SMTP_USER;
	await transporter.sendMail({ from, to, subject, html });
}

async function sendLeadEmail(lead) {
	try {
		const recipients = await db
			.prepare("SELECT email FROM lead_emails WHERE is_active = TRUE")
			.all();
		if (recipients.length === 0) {
			logger.warn("Нет активных получателей для заявки");
			return;
		}

		const to = recipients.map((r) => r.email);
		const html = buildLeadHtml(lead);

		const smtpSettings = await db
			.prepare("SELECT * FROM smtp_settings WHERE id = ? AND is_enabled = TRUE")
			.get("default");
		if (smtpSettings && smtpSettings.host && smtpSettings.username) {
			await sendViaSmtpWithSettings(
				to.join(", "),
				lead.subject,
				html,
				smtpSettings,
			);
			logger.info("Письмо отправлено (SMTP/DB)", {
				to: to.join(", "),
				subject: lead.subject,
			});
		} else if (process.env.SMTP_HOST && process.env.SMTP_USER) {
			await sendViaSmtpEnv(to.join(", "), lead.subject, html);
			logger.info("Письмо отправлено (SMTP/ENV)", {
				to: to.join(", "),
				subject: lead.subject,
			});
		} else {
			logger.warn("Email не настроен — письмо не отправлено", {
				lead: lead.id,
			});
		}
	} catch (e) {
		logger.error("Ошибка отправки email", { error: e.message });
	}
}

const PORT = process.env.PORT || 4005;

initDb()
	.then(() => {
		app.listen(PORT, "0.0.0.0", () => {
			logger.info(`Admin service running on port ${PORT}`);
		});
	})
	.catch((err) => {
		logger.error("Failed to init DB", { error: err.message });
		process.exit(1);
	});

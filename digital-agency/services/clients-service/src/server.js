const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const { v4: uuidv4 } = require("uuid");
const rateLimit = require("express-rate-limit");
const { createApp, startServer } = require("../../../shared/createApp");
const { initDb, db } = require("./db");

const clientsRoutes = require("./routes/clients");
const { runBilling, startBillingSchedule } = require("./jobs/billing");
const { run: runPaymentReminders } = require("./jobs/payment-reminder.job");

const AUTH_URL = process.env.AUTH_SERVICE_URL || "http://localhost:4001";
const SHELF_URL = process.env.PRODUCT_SHELF_URL || "http://localhost:4006";

const app = createApp({ name: "clients-service" });

const registerLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 5,
	standardHeaders: true,
	legacyHeaders: false,
	message: {
		error: "Слишком много попыток регистрации. Попробуйте через 15 минут.",
	},
});

app.post("/api/clients/register", registerLimiter, async (req, res, next) => {
	try {
		const {
			name,
			phone,
			email,
			address,
			contact_person,
			notes,
			product_code,
			user_email,
			user_password,
			user_name,
		} = req.body;
		if (!name?.trim())
			return res.status(400).json({ error: "Название клиента обязательно" });
		if (!user_email?.trim())
			return res.status(400).json({ error: "Email пользователя обязателен" });
		if (!user_password || user_password.length < 6)
			return res
				.status(400)
				.json({ error: "Пароль должен быть не менее 6 символов" });
		if (!product_code?.trim())
			return res.status(400).json({ error: "Код продукта обязателен" });

		const emailLower = user_email.toLowerCase().trim();

		const prodRes = await fetch(
			`${SHELF_URL}/api/product-shelf/products/${encodeURIComponent(product_code)}`,
		);
		if (!prodRes.ok)
			return res.status(404).json({ error: "Продукт не найден" });

		const clientId = uuidv4();

		await db
			.prepare(
				`INSERT INTO clients (id, name, address, phone, email, contact_person, notes, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'testing')`,
			)
			.run(
				clientId,
				name.trim(),
				(address || "").trim(),
				(phone || "").trim(),
				(email || emailLower).trim(),
				(contact_person || "").trim(),
				(notes || "").trim(),
			);

		const userRes = await fetch(`${AUTH_URL}/api/auth/users/register`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				email: emailLower,
				password: user_password,
				name: (user_name || name).trim(),
				role: "client",
				client_id: clientId,
			}),
		});
		const userData = await userRes.json();
		if (!userRes.ok) {
			await db.prepare("DELETE FROM clients WHERE id = ?").run(clientId);
			return res
				.status(userRes.status)
				.json({ error: userData.error || "Ошибка создания пользователя" });
		}

		const subRes = await fetch(
			`${SHELF_URL}/api/product-shelf/subscriptions/trial`,
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ product_code, client_id: clientId }),
			},
		);
		const subData = await subRes.json();
		if (!subRes.ok) {
			await db.prepare("DELETE FROM clients WHERE id = ?").run(clientId);
			await fetch(`${AUTH_URL}/api/auth/users/internal/${userData.id}`, {
				method: "DELETE",
			}).catch(() => {});
			return res
				.status(subRes.status)
				.json({ error: subData.error || "Ошибка создания подписки" });
		}

		res.status(201).json({
			ok: true,
			client_id: clientId,
			trial_days: subData.trial_days || 14,
			trial_ends_at: subData.trial_ends_at,
		});
	} catch (err) {
		next(err);
	}
});

app.use("/api/clients", clientsRoutes);

const { requireAdmin } = require("./middleware/auth");
app.post("/api/clients/billing/run", requireAdmin, async (_req, res) => {
	const result = await runBilling();
	res.json(result);
});

app.get("/api/products", async (_req, res, next) => {
	try {
		const response = await fetch(`${SHELF_URL}/api/product-shelf/products`);
		res.json(await response.json());
	} catch (err) {
		next(err);
	}
});

app.get("/api/products/:code", async (req, res, next) => {
	try {
		const response = await fetch(
			`${SHELF_URL}/api/product-shelf/products/${req.params.code}`,
		);
		const data = await response.json();
		if (response.status === 404)
			return res.status(404).json({ error: "Product not found" });
		res.json(data);
	} catch (err) {
		next(err);
	}
});

// GET /api/clients/:clientId/online-status — проверка онлайн-статуса пользователей клиента
app.get("/api/clients/:clientId/online-status", async (req, res) => {
	try {
		const { clientId } = req.params;

		// Запрашиваем статус через auth-service
		const authResponse = await fetch(
			`${AUTH_URL}/api/auth/clients/${clientId}/online-users`,
			{
				headers: {
					Authorization: req.headers.authorization || "",
				},
			},
		);

		if (!authResponse.ok) {
			// Auth service недоступен — возвращаем базовую информацию
			return res.json({
				client_id: clientId,
				is_online: false,
				online_users: [],
				total_users: 0,
				online_count: 0,
			});
		}

		const authData = await authResponse.json();

		res.json({
			client_id: clientId,
			is_online: authData.online_count > 0,
			online_users: authData.users.filter((u) => u.is_online),
			total_users: authData.total_users,
			online_count: authData.online_count,
			last_user_activity:
				authData.users.length > 0 ? new Date().toISOString() : null,
		});
	} catch (err) {
		// При ошибке возвращаем offline статус
		res.json({
			client_id: req.params.clientId,
			is_online: false,
			online_users: [],
			total_users: 0,
			online_count: 0,
			error: "Service unavailable",
		});
	}
});

startServer(app, {
	name: "clients-service",
	port: process.env.PORT || 4003,
	init: initDb,
}).then(() => {
	startBillingSchedule();
	// Payment reminder job — every 15 minutes
	setInterval(runPaymentReminders, 15 * 60 * 1000);
	// Run once shortly after startup
	setTimeout(runPaymentReminders, 30 * 1000);
});

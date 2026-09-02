const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { v4: uuidv4 } = require("uuid");
const { db } = require("../db");
const { requireAuth } = require("../middleware/auth");

const ACCESS_TTL = process.env.JWT_ACCESS_EXPIRES || "15m";
const REFRESH_TTL_MS =
	parseInt(process.env.JWT_REFRESH_EXPIRES_MS, 10) || 24 * 60 * 60 * 1000; // 24 hours (configurable)
const ACCESS_COOKIE_MS = 15 * 60 * 1000;

function safeParseApps(apps) {
	if (apps === null || apps === undefined) return [];
	try {
		return JSON.parse(apps);
	} catch {
		return [];
	}
}

function signAccess(user) {
	return jwt.sign(
		{
			userId: user.id,
			email: user.email,
			role: user.role || 'user',
			apps: safeParseApps(user.apps),
			clientId: user.client_id || null,
		},
		process.env.JWT_ACCESS_SECRET,
		{ expiresIn: ACCESS_TTL },
	);
}

function hashToken(token) {
	return crypto.createHash("sha256").update(token).digest("hex");
}

function setAccessCookie(res, token) {
	res.cookie("access_token", token, {
		httpOnly: true,
		sameSite: "lax",
		secure: process.env.NODE_ENV === "production",
		maxAge: ACCESS_COOKIE_MS,
	});
}

function setRefreshCookie(res, token) {
	res.cookie("refresh_token", token, {
		httpOnly: true,
		sameSite: "lax",
		secure: process.env.NODE_ENV === "production",
		maxAge: REFRESH_TTL_MS,
	});
}

function publicUser(row) {
	return {
		id: row.id,
		email: row.email,
		name: row.name,
		role: row.role || 'user',
		apps: safeParseApps(row.apps),
		clientId: row.client_id || null,
	};
}

// POST /api/auth/login
const {
	validateMiddleware,
	required,
	isString,
	maxLen,
	isEmail: checkEmail,
} = require("../../../../shared/validate");
const loginValidation = validateMiddleware({
	email: [required, isString, maxLen(255), checkEmail],
	password: [required, isString, maxLen(128)],
});

router.post("/login", loginValidation, async (req, res, next) => {
	try {
		const { email, password } = req.body;

		const user = await db
			.prepare("SELECT * FROM users WHERE email = ?")
			.get(email.toLowerCase().trim());
		if (!user || !user.is_active)
			return res.status(401).json({ error: "Invalid credentials" });

		if (!bcrypt.compareSync(password, user.password_hash)) {
			return res.status(401).json({ error: "Invalid credentials" });
		}

		const accessToken = signAccess(user);
		const refreshToken = uuidv4();
		const expiresAt = new Date(Date.now() + REFRESH_TTL_MS).toISOString();

		// Удаляем старые токены пользователя — ограничиваем одну активную сессию
		await db
			.prepare("DELETE FROM refresh_tokens WHERE user_id = ?")
			.run(user.id);

		await db
			.prepare(
				"INSERT INTO refresh_tokens (id, user_id, token_hash, expires_at) VALUES (?, ?, ?, ?)",
			)
			.run(uuidv4(), user.id, hashToken(refreshToken), expiresAt);

		setAccessCookie(res, accessToken);
		setRefreshCookie(res, refreshToken);

		res.json({ user: publicUser(user), accessToken });
	} catch (err) {
		next(err);
	}
});

// POST /api/auth/refresh
router.post("/refresh", async (req, res, next) => {
	try {
		const refreshToken = req.cookies?.refresh_token || req.body?.refreshToken;
		if (!refreshToken)
			return res.status(401).json({ error: "No refresh token" });

		const stored = await db
			.prepare(
				"SELECT rt.*, u.email, u.role, u.apps, u.client_id, u.is_active FROM refresh_tokens rt JOIN users u ON u.id = rt.user_id WHERE rt.token_hash = ? AND rt.expires_at > NOW()",
			)
			.get(hashToken(refreshToken));

		if (!stored || !stored.is_active)
			return res
				.status(401)
				.json({ error: "Invalid or expired refresh token" });

		const accessToken = signAccess({
			id: stored.user_id,
			email: stored.email,
			role: stored.role,
			apps: stored.apps,
			client_id: stored.client_id,
		});

		setAccessCookie(res, accessToken);
		res.json({ accessToken });
	} catch (err) {
		next(err);
	}
});

// POST /api/auth/logout — удаляем ВСЕ refresh-токены пользователя
router.post("/logout", async (req, res, next) => {
	try {
		const refreshToken = req.cookies?.refresh_token;
		if (refreshToken) {
			const stored = await db
				.prepare("SELECT user_id FROM refresh_tokens WHERE token_hash = ?")
				.get(hashToken(refreshToken));
			if (stored?.user_id) {
				await db
					.prepare("DELETE FROM refresh_tokens WHERE user_id = ?")
					.run(stored.user_id);
			}
		}
		res.clearCookie("access_token");
		res.clearCookie("refresh_token");
		res.json({ ok: true });
	} catch (err) {
		next(err);
	}
});

// GET /api/auth/verify — для других сервисов
router.get("/verify", requireAuth, (req, res) => {
	res.json({ ok: true, user: req.user });
});

// GET /api/auth/me
router.get("/me", requireAuth, async (req, res, next) => {
	try {
		const user = await db
			.prepare(
				"SELECT id, email, name, role, apps, client_id, is_active, plan, plan_expires_at, created_at FROM users WHERE id = ?",
			)
			.get(req.user.userId);
		if (!user) return res.status(401).json({ error: "User not found" });
		res.json({
			...user,
			apps: safeParseApps(user.apps),
			clientId: user.client_id || null,
		});
	} catch (err) {
		next(err);
	}
});

function canReadClientOnlineStatus(user, clientId) {
	return user?.role === "admin" || user?.clientId === clientId;
}

async function buildOnlineStatus(clientIds) {
	if (!clientIds.length) return {};
	const placeholders = clientIds.map(() => "?").join(",");
	const users = await db
		.prepare(
			`SELECT id, email, name, role, client_id, is_active, created_at
			 FROM users
			 WHERE client_id IN (${placeholders})`,
		)
		.all(...clientIds);

	const onlineRows = await db
		.prepare(
			`SELECT DISTINCT u.id
			 FROM users u
			 JOIN refresh_tokens rt ON rt.user_id = u.id
			 WHERE u.client_id IN (${placeholders}) AND rt.expires_at > NOW()`,
		)
		.all(...clientIds);
	const onlineUserIds = new Set(onlineRows.map((u) => u.id));

	const statusByClient = {};
	for (const clientId of clientIds) {
		statusByClient[clientId] = {
			client_id: clientId,
			is_online: false,
			total_users: 0,
			online_count: 0,
			users: [],
		};
	}

	for (const user of users) {
		const isOnline = onlineUserIds.has(user.id);
		const clientStatus = statusByClient[user.client_id];
		if (!clientStatus) continue;
		clientStatus.total_users++;
		if (isOnline) clientStatus.online_count++;
		clientStatus.is_online = clientStatus.online_count > 0;
		clientStatus.users.push({
			id: user.id,
			email: user.email,
			name: user.name,
			role: user.role,
			is_active: user.is_active,
			created_at: user.created_at,
			is_online: isOnline,
		});
	}

	return statusByClient;
}

// GET /api/auth/clients/online-status?client_ids=a,b — пакетный онлайн-статус клиентов
router.get("/clients/online-status", requireAuth, async (req, res, next) => {
	try {
		const clientIds = String(req.query.client_ids || "")
			.split(",")
			.map((id) => id.trim())
			.filter(Boolean);
		const allowedClientIds =
			req.user.role === "admin"
				? clientIds
				: clientIds.filter((id) => id === req.user.clientId);
		const statuses = await buildOnlineStatus([...new Set(allowedClientIds)]);
		res.json({ statuses });
	} catch (err) {
		next(err);
	}
});

// GET /api/auth/clients/:clientId/online-users — пользователи клиента с онлайн-статусом
router.get(
	"/clients/:clientId/online-users",
	requireAuth,
	async (req, res, next) => {
		try {
			const { clientId } = req.params;
			if (!canReadClientOnlineStatus(req.user, clientId)) {
				return res.status(403).json({ error: "Forbidden" });
			}
			const statuses = await buildOnlineStatus([clientId]);
			res.json(statuses[clientId]);
		} catch (err) {
			next(err);
		}
	},
);

module.exports = router;

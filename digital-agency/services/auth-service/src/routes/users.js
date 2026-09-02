const router = require("express").Router();
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");
const { db } = require("../db");
const { requireAuth, requireAdmin } = require("../middleware/auth");

function safeParseApps(apps) {
	if (apps === null || apps === undefined) return [];
	try {
		return JSON.parse(apps);
	} catch {
		return [];
	}
}

// POST /api/auth/users/register — публичная регистрация клиента (без авторизации)
router.post("/register", async (req, res, next) => {
	try {
		const { email, password, name, role, client_id } = req.body;
		if (!email || !password || !name)
			return res.status(400).json({ error: "email, password, name required" });
		if (role && role !== "client")
			return res
				.status(403)
				.json({ error: "Only client role allowed for self-registration" });

		const emailLower = email.toLowerCase().trim();
		const existing = await db
			.prepare("SELECT id FROM users WHERE email = ?")
			.get(emailLower);
		if (existing)
			return res
				.status(409)
				.json({ error: "User with this email already exists" });

		const id = uuidv4();
		const passwordHash = bcrypt.hashSync(password, 10);
		// Сервисы-потребители (например, clients-service) передают внешний client_id,
		// чтобы связать пользователя портала с записью клиента.
		const effectiveClientId = client_id || id;

		await db
			.prepare(
				"INSERT INTO users (id, email, password_hash, name, role, apps, client_id) VALUES (?, ?, ?, ?, ?, ?, ?)",
			)
			.run(
				id,
				emailLower,
				passwordHash,
				name,
				"client",
				"[]",
				effectiveClientId,
			);

		const user = await db
			.prepare(
				"SELECT id, email, name, role, apps, client_id, is_active, created_at FROM users WHERE id = ?",
			)
			.get(id);
		res.status(201).json({ ...user, apps: safeParseApps(user.apps) });
	} catch (err) {
		next(err);
	}
});

// GET /api/auth/users — список (только admin)
router.get("/", requireAdmin, async (_req, res, next) => {
	try {
		const users = await db
			.prepare(
				"SELECT id, email, name, role, apps, client_id, is_active, plan, plan_expires_at, created_at FROM users ORDER BY created_at DESC",
			)
			.all();
		res.json(users.map((u) => ({ ...u, apps: safeParseApps(u.apps) })));
	} catch (err) {
		next(err);
	}
});

// POST /api/auth/users — создать пользователя (только admin)
router.post("/", requireAdmin, async (req, res, next) => {
	try {
		const {
			email,
			password,
			name,
			role = "user",
			apps = [],
			client_id = null,
		} = req.body;
		const safeApps = Array.isArray(apps) ? apps : [];
		if (!email || !password || !name)
			return res.status(400).json({ error: "email, password, name required" });

		const existing = await db
			.prepare("SELECT id FROM users WHERE email = ?")
			.get(email.toLowerCase().trim());
		if (existing)
			return res
				.status(409)
				.json({ error: "User with this email already exists" });

		const id = uuidv4();
		const passwordHash = bcrypt.hashSync(password, 10);

		await db
			.prepare(
				"INSERT INTO users (id, email, password_hash, name, role, apps, client_id) VALUES (?, ?, ?, ?, ?, ?, ?)",
			)
			.run(
				id,
				email.toLowerCase().trim(),
				passwordHash,
				name,
				role,
				JSON.stringify(safeApps),
				client_id,
			);

		const user = await db
			.prepare(
				"SELECT id, email, name, role, apps, client_id, is_active, plan, created_at FROM users WHERE id = ?",
			)
			.get(id);
		res.status(201).json({ ...user, apps: safeParseApps(user.apps) });
	} catch (err) {
		next(err);
	}
});

// PATCH /api/auth/users/:id — обновить (admin или сам пользователь для смены пароля)
router.patch("/:id", requireAuth, async (req, res, next) => {
	try {
		const isAdmin = req.user.role === "admin";
		const isSelf = req.user.userId === req.params.id;
		if (!isAdmin && !isSelf)
			return res.status(403).json({ error: "Forbidden" });

		const user = await db
			.prepare("SELECT * FROM users WHERE id = ?")
			.get(req.params.id);
		if (!user) return res.status(404).json({ error: "User not found" });

		const updates = {};
		if (req.body.name) updates.name = req.body.name;
		if (req.body.password)
			updates.password_hash = bcrypt.hashSync(req.body.password, 10);

		if (isAdmin) {
			if (req.body.role !== undefined) updates.role = req.body.role;
			if (req.body.apps !== undefined)
				updates.apps = JSON.stringify(
					Array.isArray(req.body.apps) ? req.body.apps : [],
				);
			if (req.body.is_active !== undefined)
				updates.is_active = !!req.body.is_active;
			if (req.body.plan !== undefined) updates.plan = req.body.plan;
			if (req.body.plan_expires_at !== undefined)
				updates.plan_expires_at = req.body.plan_expires_at;
		}

		if (Object.keys(updates).length === 0)
			return res.status(400).json({ error: "Nothing to update" });

		updates.updated_at = new Date().toISOString();
		const keys = Object.keys(updates);
		const values = Object.values(updates);
		const sets = keys.map((k, i) => `${k} = $${i + 1}`).join(", ");
		await db.pool.query(
			`UPDATE users SET ${sets} WHERE id = $${keys.length + 1}`,
			[...values, req.params.id],
		);

		const updated = await db
			.prepare(
				"SELECT id, email, name, role, apps, is_active, plan, plan_expires_at, created_at FROM users WHERE id = ?",
			)
			.get(req.params.id);
		res.json({ ...updated, apps: safeParseApps(updated.apps) });
	} catch (err) {
		next(err);
	}
});

// DELETE /api/auth/users/internal/:id — внутренний cleanup (service-to-service, без авторизации)
router.delete("/internal/:id", async (req, res, next) => {
	try {
		const result = await db
			.prepare("DELETE FROM users WHERE id = ?")
			.run(req.params.id);
		res.json({ ok: true, deleted: result.changes > 0 });
	} catch (err) {
		next(err);
	}
});

// DELETE /api/auth/users/:id — удалить (только admin)
router.delete("/:id", requireAdmin, async (req, res, next) => {
	try {
		if (req.user.userId === req.params.id)
			return res.status(400).json({ error: "Cannot delete yourself" });
		const result = await db
			.prepare("DELETE FROM users WHERE id = ?")
			.run(req.params.id);
		if (result.changes === 0)
			return res.status(404).json({ error: "User not found" });
		res.json({ ok: true });
	} catch (err) {
		next(err);
	}
});

module.exports = router;

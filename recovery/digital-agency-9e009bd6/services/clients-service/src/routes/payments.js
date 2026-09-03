const router = require("express").Router({ mergeParams: true });
const { v4: uuidv4 } = require("uuid");
const { db } = require("../db");
const { requireAdmin } = require("../middleware/auth");
const {
	createNotificationsForPayment,
	cancelPendingNotificationsForPayment,
} = require("../services/paymentNotifications");

router.use(requireAdmin);

// GET /api/clients/:clientId/payments
router.get("/", async (req, res, next) => {
	try {
		const payments = await db
			.prepare(
				"SELECT * FROM payments WHERE client_id = ? ORDER BY planned_date ASC",
			)
			.all(req.params.clientId);
		res.json(payments);
	} catch (err) {
		next(err);
	}
});

// POST /api/clients/:clientId/payments
router.post("/", async (req, res, next) => {
	try {
		const {
			amount,
			planned_date,
			note = "",
			client_service_id = null,
			client_product_subscription_id = null,
		} = req.body;
		if (!amount || !planned_date)
			return res
				.status(400)
				.json({ error: "amount and planned_date required" });
		const client = await db
			.prepare("SELECT id FROM clients WHERE id = ?")
			.get(req.params.clientId);
		if (!client) return res.status(404).json({ error: "Client not found" });
		const id = uuidv4();
		await db
			.prepare(
				"INSERT INTO payments (id, client_id, amount, planned_date, note, client_service_id, client_product_subscription_id) VALUES (?, ?, ?, ?, ?, ?, ?)",
			)
			.run(
				id,
				req.params.clientId,
				amount,
				planned_date,
				note,
				client_service_id,
				client_product_subscription_id,
			);

		// Создаём запланированные уведомления
		await createNotificationsForPayment(id, planned_date, req.params.clientId);

		const payment = await db
			.prepare("SELECT * FROM payments WHERE id = ?")
			.get(id);
		res.status(201).json(payment);
	} catch (err) {
		next(err);
	}
});

// PATCH /api/clients/:clientId/payments/:id/pay
router.patch("/:id/pay", async (req, res, next) => {
	try {
		const { paid_date } = req.body;
		const payment = await db
			.prepare("SELECT * FROM payments WHERE id = ? AND client_id = ?")
			.get(req.params.id, req.params.clientId);
		if (!payment) return res.status(404).json({ error: "Not found" });

		const paidAt = paid_date || new Date().toISOString().split("T")[0];
		await db.pool.query(
			"UPDATE payments SET status = $1, paid_date = $2 WHERE id = $3",
			["paid", paidAt, req.params.id],
		);

		// Отменяем запланированные уведомления — клиент уже оплатил
		await cancelPendingNotificationsForPayment(req.params.id);

		const updated = await db
			.prepare("SELECT * FROM payments WHERE id = ?")
			.get(req.params.id);
		res.json(updated);
	} catch (err) {
		next(err);
	}
});

// PATCH /api/clients/:clientId/payments/:id/overdue
router.patch("/:id/overdue", async (req, res, next) => {
	try {
		await db.pool.query(
			"UPDATE payments SET status = $1 WHERE id = $2 AND client_id = $3",
			["overdue", req.params.id, req.params.clientId],
		);
		const updated = await db
			.prepare("SELECT * FROM payments WHERE id = ?")
			.get(req.params.id);
		res.json(updated);
	} catch (err) {
		next(err);
	}
});

// PUT /api/clients/:clientId/payments/:id
router.put("/:id", async (req, res, next) => {
	try {
		const {
			amount,
			planned_date,
			paid_date,
			note,
			client_service_id,
			client_product_subscription_id,
		} = req.body;
		const payment = await db
			.prepare("SELECT * FROM payments WHERE id = ? AND client_id = ?")
			.get(req.params.id, req.params.clientId);
		if (!payment) return res.status(404).json({ error: "Not found" });
		const updates = {};
		if (amount !== undefined) updates.amount = amount;
		if (planned_date !== undefined) updates.planned_date = planned_date;
		if (paid_date !== undefined) updates.paid_date = paid_date || null;
		if (note !== undefined) updates.note = note;
		if (client_service_id !== undefined)
			updates.client_service_id = client_service_id || null;
		if (client_product_subscription_id !== undefined)
			updates.client_product_subscription_id =
				client_product_subscription_id || null;
		if (Object.keys(updates).length) {
			const keys = Object.keys(updates);
			const values = Object.values(updates);
			const sets = keys.map((k, i) => `${k} = $${i + 1}`).join(", ");
			await db.pool.query(
				`UPDATE payments SET ${sets} WHERE id = $${keys.length + 1}`,
				[...values, req.params.id],
			);
		}
		const updated = await db
			.prepare("SELECT * FROM payments WHERE id = ?")
			.get(req.params.id);
		res.json(updated);
	} catch (err) {
		next(err);
	}
});

// DELETE /api/clients/:clientId/payments/:id
router.delete("/:id", async (req, res, next) => {
	try {
		const { rowCount } = await db.pool.query(
			"DELETE FROM payments WHERE id = $1 AND client_id = $2",
			[req.params.id, req.params.clientId],
		);
		if (rowCount === 0) return res.status(404).json({ error: "Not found" });
		res.json({ ok: true });
	} catch (err) {
		next(err);
	}
});

module.exports = router;

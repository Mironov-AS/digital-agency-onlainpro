const router = require("express").Router();
const { v4: uuidv4 } = require("uuid");
const { db } = require("../db");
const { requireAdmin } = require("../middleware/auth");
const {
	validateMiddleware,
	required,
	isString,
	maxLen,
} = require("../../../../shared/validate");
const {
	createNotificationsForPayment,
	cancelPendingNotificationsForPayment,
} = require("../services/paymentNotifications");
const {
	fetchClientsOnlineStatus,
	applyClientOnlineStatus,
} = require("../services/onlineStatus");

function isMissingOptionalShelf(err) {
	return (
		err?.code === "42P01" ||
		/relation "shelf\.(product_subscriptions|products)" does not exist/i.test(
			err?.message || "",
		)
	);
}

function toMonthly(amount, period) {
	switch (period) {
		case "monthly":
			return amount;
		case "quarterly":
			return amount / 3;
		case "yearly":
			return amount / 12;
		case "once":
			return amount / 12;
		default:
			return 0;
	}
}

function computePaymentTotals(payments) {
	const paidByService = {};
	const totalByService = {};
	for (const p of payments) {
		if (p.client_service_id) {
			paidByService[p.client_service_id] =
				(paidByService[p.client_service_id] || 0) +
				(p.status === "paid" ? p.amount : 0);
			totalByService[p.client_service_id] =
				(totalByService[p.client_service_id] || 0) + p.amount;
		}
	}
	return { paidByService, totalByService };
}

function enrichServicesWithPaymentTotals(services, payments) {
	const { paidByService, totalByService } = computePaymentTotals(payments);
	for (const s of services) {
		s.paid_amount = paidByService[s.id] || 0;
		s.total_billed = totalByService[s.id] || 0;
	}
}

async function getProductServicesForClient(clientId) {
	try {
		return await db
			.prepare(`
        SELECT ps.id, ps.status, ps.billing_amount, ps.billing_period, p.name as product_name
        FROM shelf.product_subscriptions ps
        JOIN shelf.products p ON p.code = ps.product_code
        WHERE ps.client_id = ? AND ps.status IN ('active', 'trial')
      `)
			.all(clientId);
	} catch (err) {
		if (isMissingOptionalShelf(err)) return [];
		throw err;
	}
}

async function getPaymentScheduleRows({
	today,
	in30days,
	overdueOnly = false,
}) {
	const shelfJoin = `
      LEFT JOIN shelf.product_subscriptions ps ON ps.id = p.client_product_subscription_id
      LEFT JOIN shelf.products sp ON sp.code = ps.product_code
    `;
	const baseSelect = `
      SELECT p.id, p.client_id, p.amount, p.planned_date, p.client_service_id,
        p.client_product_subscription_id, p.note,
        c.name as client_name,
        COALESCE(cs.service_name, sp.name, NULLIF(p.note, '')) as service_name
      FROM payments p
      JOIN clients c ON c.id = p.client_id
      LEFT JOIN client_services cs ON cs.id = p.client_service_id
      ${shelfJoin}
    `;
	const fallbackSelect = `
      SELECT p.id, p.client_id, p.amount, p.planned_date, p.client_service_id,
        p.client_product_subscription_id, p.note,
        c.name as client_name,
        COALESCE(cs.service_name, NULLIF(p.note, '')) as service_name
      FROM payments p
      JOIN clients c ON c.id = p.client_id
      LEFT JOIN client_services cs ON cs.id = p.client_service_id
    `;
	const where = overdueOnly
		? `WHERE (p.status = 'overdue' OR (p.status = 'pending' AND p.planned_date < ?))
      ORDER BY p.planned_date ASC`
		: `WHERE p.status = 'pending' AND p.planned_date >= ? AND p.planned_date <= ?
        AND (
          p.client_product_subscription_id IS NULL
          OR p.id = (
            SELECT p2.id FROM payments p2
            WHERE p2.client_product_subscription_id = p.client_product_subscription_id
              AND p2.status = 'pending' AND p2.planned_date >= ?
            ORDER BY p2.planned_date ASC LIMIT 1
          )
        )
      ORDER BY p.planned_date ASC
      LIMIT 30`;
	const params = overdueOnly ? [today] : [today, in30days, today];

	try {
		return await db.prepare(`${baseSelect} ${where}`).all(...params);
	} catch (err) {
		if (!isMissingOptionalShelf(err)) throw err;
		return db.prepare(`${fallbackSelect} ${where}`).all(...params);
	}
}

router.use(requireAdmin);

// GET /api/clients — список клиентов с сервисами
router.get("/", async (req, res, next) => {
	try {
		if (req.user.role === "client") {
			const client = await db
				.prepare("SELECT * FROM clients WHERE id = ?")
				.get(req.user.clientId);
			if (!client) return res.json([]);
			const services = await db
				.prepare("SELECT * FROM client_services WHERE client_id = ?")
				.all(client.id);
			const payments = await db
				.prepare("SELECT * FROM payments WHERE client_id = ?")
				.all(client.id);
			enrichServicesWithPaymentTotals(services, payments);
			client.services = services;
			const onlineStatus = await fetchClientsOnlineStatus(
				[client.id],
				req.headers.authorization || "",
			);
			applyClientOnlineStatus(client, onlineStatus);
			return res.json([client]);
		}

		const { search, active_only = "1" } = req.query;
		let sql = `
      SELECT c.*,
        (SELECT COUNT(*) FROM payments p WHERE p.client_id = c.id AND p.status IN ('pending', 'overdue')) AS pending_payments,
        (SELECT MIN(p.planned_date) FROM payments p WHERE p.client_id = c.id AND p.status IN ('pending', 'overdue')) AS next_payment_date,
        (SELECT COUNT(*) FROM payments p WHERE p.client_id = c.id AND (p.status = 'overdue' OR (p.status = 'pending' AND p.planned_date::date < CURRENT_DATE))) AS overdue_payments,
        (SELECT COALESCE(SUM(p.amount), 0) FROM payments p WHERE p.client_id = c.id AND (p.status = 'overdue' OR (p.status = 'pending' AND p.planned_date::date < CURRENT_DATE))) AS overdue_amount
      FROM clients c
    `;
		const where = [];
		const params = [];
		let idx = 0;
		if (active_only !== "0") {
			where.push("c.is_active = TRUE");
		}
		if (search) {
			idx++;
			const pi = idx;
			idx++;
			const pi2 = idx;
			idx++;
			const pi3 = idx;
			where.push(
				`(c.name ILIKE $${pi} OR c.email ILIKE $${pi2} OR c.phone ILIKE $${pi3})`,
			);
			const q = `%${search}%`;
			params.push(q, q, q);
		}
		if (where.length) sql += " WHERE " + where.join(" AND ");
		sql += " ORDER BY c.name ASC";

		const { rows: clients } = await db.pool.query(sql, params);
		const onlineStatus = await fetchClientsOnlineStatus(
			clients.map((client) => client.id),
			req.headers.authorization || "",
		);

		for (const c of clients) {
			applyClientOnlineStatus(c, onlineStatus);
			c.pending_payments = parseInt(c.pending_payments) || 0;
			c.overdue_payments = parseInt(c.overdue_payments) || 0;
			c.overdue_amount = parseFloat(c.overdue_amount) || 0;
			const services = await db
				.prepare(
					"SELECT * FROM client_services WHERE client_id = ? ORDER BY created_at ASC",
				)
				.all(c.id);
			const payments = await db
				.prepare("SELECT * FROM payments WHERE client_id = ?")
				.all(c.id);
			enrichServicesWithPaymentTotals(services, payments);

			const productSubs = await getProductServicesForClient(c.id);
			const productServices = productSubs.map((ps) => ({
				id: `ps-${ps.id}`,
				service_name: ps.product_name,
				is_active: true,
				_type: "product",
				_status: ps.status,
				price: ps.billing_amount,
				payment_interval: ps.billing_period,
			}));

			c.services = [...services, ...productServices];
		}

		res.json(clients);
	} catch (err) {
		next(err);
	}
});

// GET /api/clients/stats — сводная статистика для дашборда
router.get("/stats", async (req, res, next) => {
	try {
		if (req.user.role !== "admin")
			return res.status(403).json({ error: "Access denied" });

		const today = new Date().toISOString().split("T")[0];
		const in30days = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
			.toISOString()
			.split("T")[0];

		const clientsTotal = (
			await db.prepare("SELECT COUNT(*) as cnt FROM clients").get()
		).cnt;
		const clientsActive = (
			await db
				.prepare("SELECT COUNT(*) as cnt FROM clients WHERE is_active = TRUE")
				.get()
		).cnt;

		const servicesTotal = (
			await db.prepare("SELECT COUNT(*) as cnt FROM client_services").get()
		).cnt;
		const servicesActive = (
			await db
				.prepare(
					"SELECT COUNT(*) as cnt FROM client_services WHERE is_active = TRUE",
				)
				.get()
		).cnt;
		const servicesCompleted = (
			await db
				.prepare(
					"SELECT COUNT(*) as cnt FROM client_services WHERE status = 'completed'",
				)
				.get()
		).cnt;
		const byInterval = await db
			.prepare(
				"SELECT payment_interval, COUNT(*) as cnt FROM client_services WHERE is_active = TRUE GROUP BY payment_interval",
			)
			.all();

		let byStatus = [];
		try {
			byStatus = await db
				.prepare(
					"SELECT status, COUNT(*) as cnt FROM client_services GROUP BY status",
				)
				.all();
		} catch (e) {
			// Column might not exist yet on existing installations
			byStatus = [{ status: "active", cnt: parseInt(servicesActive) }];
		}

		const finance = await db
			.prepare(`
      SELECT
        COALESCE(SUM(amount), 0) as total_billed,
        COALESCE(SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END), 0) as total_paid,
        COALESCE(SUM(CASE WHEN status IN ('pending','overdue') THEN amount ELSE 0 END), 0) as outstanding,
        COALESCE(SUM(CASE WHEN status = 'overdue' OR (status = 'pending' AND planned_date < ?) THEN amount ELSE 0 END), 0) as overdue_amount
      FROM payments
    `)
			.get(today);

		const mrrRows = await db
			.prepare(`
      SELECT cs.payment_interval, SUM(cs.price) as total_price
      FROM client_services cs
      WHERE cs.is_active = TRUE AND cs.price IS NOT NULL
      GROUP BY cs.payment_interval
    `)
			.all();
		let mrr = 0;
		for (const r of mrrRows) {
			if (r.payment_interval !== "once")
				mrr += toMonthly(r.total_price, r.payment_interval);
		}

		// One-time revenue from actual PAID payments with once interval
		const oneTimeRows = await db
			.prepare(`
      SELECT COALESCE(SUM(p.amount), 0) as total
      FROM payments p
      JOIN client_services cs ON cs.id = p.client_service_id
      WHERE cs.payment_interval = 'once' AND p.status = 'paid'
    `)
			.get();
		const oneTimeRevenue = parseFloat(oneTimeRows?.total) || 0;

		const costsRows = await db
			.prepare(`
      SELECT csc.period, SUM(csc.amount) as total_amount, csc.cost_name
      FROM client_service_costs csc
      JOIN client_services cs ON cs.id = csc.client_service_id
      WHERE cs.is_active = TRUE
      GROUP BY csc.cost_name, csc.period
    `)
			.all();

		const orgCostsRows = await db
			.prepare(`
      SELECT period, SUM(amount) as total_amount, name
      FROM org_costs WHERE is_active = TRUE
      GROUP BY name, period
    `)
			.all();

		let mrc = 0;
		const costsByName = {};
		for (const r of costsRows) {
			const monthly = toMonthly(r.total_amount, r.period);
			mrc += monthly;
			costsByName[r.cost_name] = (costsByName[r.cost_name] || 0) + monthly;
		}
		for (const r of orgCostsRows) {
			const monthly = toMonthly(r.total_amount, r.period);
			mrc += monthly;
			costsByName[r.name] = (costsByName[r.name] || 0) + monthly;
		}
		const topCosts = Object.entries(costsByName)
			.map(([name, monthly]) => ({ name, monthly: Math.round(monthly) }))
			.sort((a, b) => b.monthly - a.monthly)
			.slice(0, 8);

		const overdue = await getPaymentScheduleRows({ today, overdueOnly: true });
		const upcoming = await getPaymentScheduleRows({ today, in30days });

		const debtors = await db
			.prepare(`
      SELECT p.client_id, c.name as client_name,
        SUM(p.amount) as pending_amount,
        SUM(CASE WHEN p.status = 'overdue' OR p.planned_date < ? THEN p.amount ELSE 0 END) as overdue_amount,
        COUNT(*) as payments_count
      FROM payments p
      JOIN clients c ON c.id = p.client_id
      WHERE p.status IN ('pending','overdue')
      GROUP BY p.client_id, c.name
      ORDER BY pending_amount DESC
    `)
			.all(today);

		res.json({
			clients: {
				total: parseInt(clientsTotal),
				active: parseInt(clientsActive),
			},
			services: {
				total: parseInt(servicesTotal),
				active: parseInt(servicesActive),
				completed: parseInt(servicesCompleted),
				by_interval: Object.fromEntries(
					byInterval.map((r) => [r.payment_interval, parseInt(r.cnt)]),
				),
				by_status: Object.fromEntries(
					byStatus.map((r) => [r.status, parseInt(r.cnt)]),
				),
			},
			finance: {
				total_billed: parseFloat(finance.total_billed),
				total_paid: parseFloat(finance.total_paid),
				outstanding: parseFloat(finance.outstanding),
				overdue_amount: parseFloat(finance.overdue_amount),
				mrr: Math.round(mrr),
				mrc: Math.round(mrc),
				margin: Math.round(mrr - mrc),
				top_costs: topCosts,
				one_time_revenue: Math.round(oneTimeRevenue),
			},
			overdue,
			upcoming,
			debtors,
		});
	} catch (err) {
		next(err);
	}
});

// POST /api/clients
const createClientValidation = validateMiddleware({
	name: [required, isString, maxLen(255)],
});

router.post(
	"/",
	requireAdmin,
	createClientValidation,
	async (req, res, next) => {
		try {
			const {
				name,
				address = "",
				phone = "",
				email = "",
				notes = "",
				contact_person = "",
				services = [],
			} = req.body;

			const clientId = uuidv4();
			await db.runTransaction(async (txDb) => {
				await txDb
					.prepare(
						"INSERT INTO clients (id, name, address, phone, email, notes, contact_person) VALUES (?, ?, ?, ?, ?, ?, ?)",
					)
					.run(clientId, name, address, phone, email, notes, contact_person);
				for (const svc of services) {
					await txDb
						.prepare(
							"INSERT INTO client_services (id, client_id, service_id, service_name, price, payment_interval, service_end_date, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
						)
						.run(
							uuidv4(),
							clientId,
							svc.service_id || null,
							svc.service_name || "",
							svc.price !== undefined ? svc.price : null,
							svc.payment_interval || "monthly",
							svc.service_end_date || null,
							svc.is_active !== false,
						);
				}
			});

			const client = await db
				.prepare("SELECT * FROM clients WHERE id = ?")
				.get(clientId);
			const clientServices = await db
				.prepare("SELECT * FROM client_services WHERE client_id = ?")
				.all(clientId);
			res.status(201).json({ ...client, services: clientServices });
		} catch (err) {
			next(err);
		}
	},
);

// PUT /api/clients/:id
router.put("/:id", requireAdmin, async (req, res, next) => {
	try {
		const client = await db
			.prepare("SELECT * FROM clients WHERE id = ?")
			.get(req.params.id);
		if (!client) return res.status(404).json({ error: "Not found" });

		const {
			name,
			address,
			phone,
			email,
			notes,
			contact_person,
			is_active,
			status,
		} = req.body;
		const updates = { updated_at: new Date().toISOString() };
		if (name !== undefined) updates.name = name;
		if (address !== undefined) updates.address = address;
		if (phone !== undefined) updates.phone = phone;
		if (email !== undefined) updates.email = email;
		if (notes !== undefined) updates.notes = notes;
		if (contact_person !== undefined) updates.contact_person = contact_person;
		if (is_active !== undefined) updates.is_active = !!is_active;
		if (status !== undefined) updates.status = status;

		const keys = Object.keys(updates);
		const values = Object.values(updates);
		const sets = keys.map((k, i) => `${k} = $${i + 1}`).join(", ");
		await db.pool.query(
			`UPDATE clients SET ${sets} WHERE id = $${keys.length + 1}`,
			[...values, req.params.id],
		);

		const updated = await db
			.prepare("SELECT * FROM clients WHERE id = ?")
			.get(req.params.id);
		const svcList = await db
			.prepare(
				"SELECT * FROM client_services WHERE client_id = ? ORDER BY created_at ASC",
			)
			.all(req.params.id);
		res.json({ ...updated, services: svcList });
	} catch (err) {
		next(err);
	}
});

// DELETE /api/clients/:id
router.delete("/:id", requireAdmin, async (req, res, next) => {
	try {
		const r = await db
			.prepare("DELETE FROM clients WHERE id = ?")
			.run(req.params.id);
		if (r.changes === 0) return res.status(404).json({ error: "Not found" });
		res.json({ ok: true });
	} catch (err) {
		next(err);
	}
});

// ── Client Services ──────────────────────────────────────────────────────────

router.get("/:id/services", async (req, res, next) => {
	try {
		if (req.user.role === "client" && req.user.clientId !== req.params.id) {
			return res.status(403).json({ error: "Access denied" });
		}
		const client = await db
			.prepare("SELECT id FROM clients WHERE id = ?")
			.get(req.params.id);
		if (!client) return res.status(404).json({ error: "Not found" });
		const services = await db
			.prepare(
				"SELECT * FROM client_services WHERE client_id = ? ORDER BY created_at ASC",
			)
			.all(req.params.id);
		res.json(services);
	} catch (err) {
		next(err);
	}
});

router.post("/:id/services", requireAdmin, async (req, res, next) => {
	try {
		const client = await db
			.prepare("SELECT id FROM clients WHERE id = ?")
			.get(req.params.id);
		if (!client) return res.status(404).json({ error: "Not found" });

		const {
			service_id,
			service_name,
			product_code = null,
			price = null,
			payment_interval = "monthly",
			service_end_date = null,
			status = "active",
		} = req.body;
		if (!service_name)
			return res.status(400).json({ error: "service_name required" });

		const id = uuidv4();
		await db
			.prepare(
				"INSERT INTO client_services (id, client_id, service_id, service_name, product_code, price, payment_interval, service_end_date, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
			)
			.run(
				id,
				req.params.id,
				service_id || null,
				service_name,
				product_code,
				price,
				payment_interval,
				service_end_date,
				status,
			);

		const service = await db
			.prepare("SELECT * FROM client_services WHERE id = ?")
			.get(id);
		res.status(201).json(service);
	} catch (err) {
		next(err);
	}
});

router.put("/:id/services/:serviceId", async (req, res, next) => {
	try {
		const svc = await db
			.prepare("SELECT * FROM client_services WHERE id = ? AND client_id = ?")
			.get(req.params.serviceId, req.params.id);
		if (!svc) return res.status(404).json({ error: "Service not found" });

		const {
			service_name,
			product_code,
			price,
			payment_interval,
			service_end_date,
			is_active,
			status,
		} = req.body;
		const updates = { updated_at: new Date().toISOString() };
		if (service_name !== undefined) updates.service_name = service_name;
		if (product_code !== undefined) updates.product_code = product_code;
		if (price !== undefined) updates.price = price;
		if (payment_interval !== undefined)
			updates.payment_interval = payment_interval;
		if (service_end_date !== undefined)
			updates.service_end_date = service_end_date;
		if (is_active !== undefined) updates.is_active = !!is_active;
		if (status !== undefined) updates.status = status;

		const keys = Object.keys(updates);
		const values = Object.values(updates);
		const sets = keys.map((k, i) => `${k} = $${i + 1}`).join(", ");
		await db.pool.query(
			`UPDATE client_services SET ${sets} WHERE id = $${keys.length + 1}`,
			[...values, req.params.serviceId],
		);

		const updated = await db
			.prepare("SELECT * FROM client_services WHERE id = ?")
			.get(req.params.serviceId);
		res.json(updated);
	} catch (err) {
		next(err);
	}
});

router.delete("/:id/services/:serviceId", async (req, res, next) => {
	try {
		const { rowCount } = await db.pool.query(
			"DELETE FROM client_services WHERE id = $1 AND client_id = $2",
			[req.params.serviceId, req.params.id],
		);
		if (rowCount === 0)
			return res.status(404).json({ error: "Service not found" });
		res.json({ ok: true });
	} catch (err) {
		next(err);
	}
});

router.patch("/:id/services/:serviceId/complete", async (req, res, next) => {
	try {
		const svc = await db
			.prepare("SELECT * FROM client_services WHERE id = ? AND client_id = ?")
			.get(req.params.serviceId, req.params.id);
		if (!svc) return res.status(404).json({ error: "Service not found" });
		await db.pool.query(
			"UPDATE client_services SET status = $1, is_active = $2, updated_at = $3 WHERE id = $4",
			["completed", false, new Date().toISOString(), req.params.serviceId],
		);
		const updated = await db
			.prepare("SELECT * FROM client_services WHERE id = ?")
			.get(req.params.serviceId);
		res.json(updated);
	} catch (err) {
		next(err);
	}
});

router.patch("/:id/services/:serviceId/stop", async (req, res, next) => {
	try {
		const svc = await db
			.prepare("SELECT * FROM client_services WHERE id = ? AND client_id = ?")
			.get(req.params.serviceId, req.params.id);
		if (!svc) return res.status(404).json({ error: "Service not found" });
		await db.pool.query(
			"UPDATE client_services SET is_active = FALSE, updated_at = $1 WHERE id = $2",
			[new Date().toISOString(), req.params.serviceId],
		);
		const updated = await db
			.prepare("SELECT * FROM client_services WHERE id = ?")
			.get(req.params.serviceId);
		res.json(updated);
	} catch (err) {
		next(err);
	}
});

router.patch("/:id/services/:serviceId/resume", async (req, res, next) => {
	try {
		const svc = await db
			.prepare("SELECT * FROM client_services WHERE id = ? AND client_id = ?")
			.get(req.params.serviceId, req.params.id);
		if (!svc) return res.status(404).json({ error: "Service not found" });
		await db.pool.query(
			"UPDATE client_services SET is_active = TRUE, status = $1, updated_at = $2 WHERE id = $3",
			[
				svc.status === "completed" ? "active" : svc.status,
				new Date().toISOString(),
				req.params.serviceId,
			],
		);
		const updated = await db
			.prepare("SELECT * FROM client_services WHERE id = ?")
			.get(req.params.serviceId);
		res.json(updated);
	} catch (err) {
		next(err);
	}
});

// ── Payments ─────────────────────────────────────────────────────────────────

router.get("/:id/payments", async (req, res, next) => {
	try {
		if (req.user.role === "client" && req.user.clientId !== req.params.id) {
			return res.status(403).json({ error: "Access denied" });
		}
		const payments = await db
			.prepare(
				"SELECT * FROM payments WHERE client_id = ? ORDER BY planned_date ASC",
			)
			.all(req.params.id);
		res.json(payments);
	} catch (err) {
		next(err);
	}
});

router.post("/:id/payments", requireAdmin, async (req, res, next) => {
	try {
		const client = await db
			.prepare("SELECT id FROM clients WHERE id = ?")
			.get(req.params.id);
		if (!client) return res.status(404).json({ error: "Client not found" });

		const {
			amount,
			planned_date,
			client_service_id = null,
			client_product_subscription_id = null,
			note = "",
		} = req.body;
		if (!amount || !planned_date)
			return res
				.status(400)
				.json({ error: "amount and planned_date required" });

		const id = uuidv4();
		await db
			.prepare(
				"INSERT INTO payments (id, client_id, client_service_id, client_product_subscription_id, amount, planned_date, note) VALUES (?, ?, ?, ?, ?, ?, ?)",
			)
			.run(
				id,
				req.params.id,
				client_service_id,
				client_product_subscription_id,
				amount,
				planned_date,
				note,
			);

		// Создаём запланированные уведомления
		await createNotificationsForPayment(id, planned_date, req.params.id);

		const payment = await db
			.prepare("SELECT * FROM payments WHERE id = ?")
			.get(id);
		res.status(201).json(payment);
	} catch (err) {
		next(err);
	}
});

router.put("/:id/payments/:paymentId", requireAdmin, async (req, res, next) => {
	try {
		const payment = await db
			.prepare("SELECT * FROM payments WHERE id = ? AND client_id = ?")
			.get(req.params.paymentId, req.params.id);
		if (!payment) return res.status(404).json({ error: "Payment not found" });

		const {
			amount,
			planned_date,
			paid_date,
			client_service_id,
			client_product_subscription_id,
			note,
		} = req.body;
		const updates = {};
		if (amount !== undefined) updates.amount = amount;
		if (planned_date !== undefined) updates.planned_date = planned_date;
		if (paid_date !== undefined) updates.paid_date = paid_date || null;
		if (client_service_id !== undefined)
			updates.client_service_id = client_service_id;
		if (client_product_subscription_id !== undefined)
			updates.client_product_subscription_id = client_product_subscription_id;
		if (note !== undefined) updates.note = note;

		if (Object.keys(updates).length) {
			const keys = Object.keys(updates);
			const values = Object.values(updates);
			const sets = keys.map((k, i) => `${k} = $${i + 1}`).join(", ");
			await db.pool.query(
				`UPDATE payments SET ${sets} WHERE id = $${keys.length + 1}`,
				[...values, req.params.paymentId],
			);
		}

		const updated = await db
			.prepare("SELECT * FROM payments WHERE id = ?")
			.get(req.params.paymentId);
		res.json(updated);
	} catch (err) {
		next(err);
	}
});

router.patch(
	"/:id/payments/:paymentId/pay",
	requireAdmin,
	async (req, res, next) => {
		try {
			const { paid_date } = req.body;
			const payment = await db
				.prepare("SELECT * FROM payments WHERE id = ? AND client_id = ?")
				.get(req.params.paymentId, req.params.id);
			if (!payment) return res.status(404).json({ error: "Not found" });

			const paidAt = paid_date || new Date().toISOString().split("T")[0];
			await db.pool.query(
				"UPDATE payments SET status = $1, paid_date = $2 WHERE id = $3",
				["paid", paidAt, req.params.paymentId],
			);

			// Отменяем запланированные уведомления — клиент уже оплатил
			await cancelPendingNotificationsForPayment(req.params.paymentId);

			const updated = await db
				.prepare("SELECT * FROM payments WHERE id = ?")
				.get(req.params.paymentId);
			res.json(updated);
		} catch (err) {
			next(err);
		}
	},
);

router.delete(
	"/:id/payments/:paymentId",
	requireAdmin,
	async (req, res, next) => {
		try {
			const { rowCount } = await db.pool.query(
				"DELETE FROM payments WHERE id = $1 AND client_id = $2",
				[req.params.paymentId, req.params.id],
			);
			if (rowCount === 0) return res.status(404).json({ error: "Not found" });
			res.json({ ok: true });
		} catch (err) {
			next(err);
		}
	},
);

// ── Client Service Costs ─────────────────────────────────────────────────────

router.get("/:id/services/:serviceId/costs", async (req, res, next) => {
	try {
		const costs = await db
			.prepare(
				"SELECT * FROM client_service_costs WHERE client_service_id = ? AND client_id = ? ORDER BY created_at ASC",
			)
			.all(req.params.serviceId, req.params.id);
		res.json(costs);
	} catch (err) {
		next(err);
	}
});

router.post("/:id/services/:serviceId/costs", async (req, res, next) => {
	try {
		const svc = await db
			.prepare("SELECT id FROM client_services WHERE id = ? AND client_id = ?")
			.get(req.params.serviceId, req.params.id);
		if (!svc) return res.status(404).json({ error: "Service not found" });
		const { cost_name, amount = 0, period = "monthly", note = "" } = req.body;
		if (!cost_name?.trim())
			return res.status(400).json({ error: "cost_name required" });
		const costId = uuidv4();
		await db
			.prepare(
				"INSERT INTO client_service_costs (id, client_service_id, client_id, cost_name, amount, period, note) VALUES (?, ?, ?, ?, ?, ?, ?)",
			)
			.run(
				costId,
				req.params.serviceId,
				req.params.id,
				cost_name.trim(),
				Number(amount),
				period,
				note,
			);
		const row = await db
			.prepare("SELECT * FROM client_service_costs WHERE id = ?")
			.get(costId);
		res.status(201).json(row);
	} catch (err) {
		next(err);
	}
});

router.put("/:id/services/:serviceId/costs/:costId", async (req, res, next) => {
	try {
		const { cost_name, amount, period, note } = req.body;
		const updates = {};
		if (cost_name !== undefined) updates.cost_name = cost_name.trim();
		if (amount !== undefined) updates.amount = Number(amount);
		if (period !== undefined) updates.period = period;
		if (note !== undefined) updates.note = note;
		if (!Object.keys(updates).length)
			return res.status(400).json({ error: "Nothing to update" });
		const keys = Object.keys(updates);
		const values = Object.values(updates);
		const sets = keys.map((k, i) => `${k} = $${i + 1}`).join(", ");
		await db.pool.query(
			`UPDATE client_service_costs SET ${sets} WHERE id = $${keys.length + 1} AND client_service_id = $${keys.length + 2}`,
			[...values, req.params.costId, req.params.serviceId],
		);
		const row = await db
			.prepare("SELECT * FROM client_service_costs WHERE id = ?")
			.get(req.params.costId);
		if (!row) return res.status(404).json({ error: "Not found" });
		res.json(row);
	} catch (err) {
		next(err);
	}
});

router.delete(
	"/:id/services/:serviceId/costs/:costId",
	async (req, res, next) => {
		try {
			const { rowCount } = await db.pool.query(
				"DELETE FROM client_service_costs WHERE id = $1 AND client_service_id = $2",
				[req.params.costId, req.params.serviceId],
			);
			if (rowCount === 0) return res.status(404).json({ error: "Not found" });
			res.json({ ok: true });
		} catch (err) {
			next(err);
		}
	},
);

// ── Organization-wide costs ────────────────────────────────────────────────────

router.get("/org-costs", requireAdmin, async (_req, res, next) => {
	try {
		const costs = await db
			.prepare("SELECT * FROM org_costs ORDER BY is_active DESC, name ASC")
			.all();
		res.json(costs);
	} catch (err) {
		next(err);
	}
});

router.post("/org-costs", requireAdmin, async (req, res, next) => {
	try {
		const {
			name,
			amount = 0,
			period = "monthly",
			note = "",
			is_active = true,
		} = req.body;
		if (!name?.trim()) return res.status(400).json({ error: "name required" });
		const id = uuidv4();
		await db
			.prepare(
				"INSERT INTO org_costs (id, name, amount, period, note, is_active) VALUES (?, ?, ?, ?, ?, ?)",
			)
			.run(id, name.trim(), Number(amount), period, note, !!is_active);
		const row = await db
			.prepare("SELECT * FROM org_costs WHERE id = ?")
			.get(id);
		res.status(201).json(row);
	} catch (err) {
		next(err);
	}
});

router.put("/org-costs/:costId", requireAdmin, async (req, res, next) => {
	try {
		const { name, amount, period, note, is_active } = req.body;
		const updates = { updated_at: new Date().toISOString() };
		if (name !== undefined) updates.name = name.trim();
		if (amount !== undefined) updates.amount = Number(amount);
		if (period !== undefined) updates.period = period;
		if (note !== undefined) updates.note = note;
		if (is_active !== undefined) updates.is_active = !!is_active;
		const keys = Object.keys(updates);
		const values = Object.values(updates);
		const sets = keys.map((k, i) => `${k} = $${i + 1}`).join(", ");
		await db.pool.query(
			`UPDATE org_costs SET ${sets} WHERE id = $${keys.length + 1}`,
			[...values, req.params.costId],
		);
		const row = await db
			.prepare("SELECT * FROM org_costs WHERE id = ?")
			.get(req.params.costId);
		if (!row) return res.status(404).json({ error: "Not found" });
		res.json(row);
	} catch (err) {
		next(err);
	}
});

router.delete("/org-costs/:costId", requireAdmin, async (req, res, next) => {
	try {
		const r = await db
			.prepare("DELETE FROM org_costs WHERE id = ?")
			.run(req.params.costId);
		if (r.changes === 0) return res.status(404).json({ error: "Not found" });
		res.json({ ok: true });
	} catch (err) {
		next(err);
	}
});

// GET /api/clients/:id — клиент с детализацией
router.get("/:id", async (req, res, next) => {
	try {
		if (req.user.role === "client" && req.user.clientId !== req.params.id) {
			return res.status(403).json({ error: "Access denied" });
		}

		const client = await db
			.prepare("SELECT * FROM clients WHERE id = ?")
			.get(req.params.id);
		if (!client) return res.status(404).json({ error: "Not found" });

		const services = await db
			.prepare(
				"SELECT * FROM client_services WHERE client_id = ? ORDER BY created_at ASC",
			)
			.all(req.params.id);
		const payments = await db
			.prepare(
				"SELECT * FROM payments WHERE client_id = ? ORDER BY planned_date ASC",
			)
			.all(req.params.id);
		const allCosts = await db
			.prepare(
				"SELECT * FROM client_service_costs WHERE client_id = ? ORDER BY created_at ASC",
			)
			.all(req.params.id);

		enrichServicesWithPaymentTotals(services, payments);

		for (const s of services) {
			s.costs = allCosts.filter((c) => c.client_service_id === s.id);
		}

		const onlineStatus = await fetchClientsOnlineStatus(
			[client.id],
			req.headers.authorization || "",
		);
		applyClientOnlineStatus(client, onlineStatus);

		res.json({ ...client, services, payments });
	} catch (err) {
		next(err);
	}
});

module.exports = router;
module.exports.getPaymentScheduleRows = getPaymentScheduleRows;

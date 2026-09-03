const { v4: uuid } = require("uuid");
const { db } = require("../db");

const MAX_CATCHUP = 12;

function addInterval(dateStr, interval) {
	const d = new Date(dateStr + "T12:00:00Z");
	switch (interval) {
		case "monthly":
			d.setUTCMonth(d.getUTCMonth() + 1);
			break;
		case "quarterly":
			d.setUTCMonth(d.getUTCMonth() + 3);
			break;
		case "yearly":
			d.setUTCFullYear(d.getUTCFullYear() + 1);
			break;
		default:
			return null;
	}
	return d.toISOString().slice(0, 10);
}

function toDateStr(d) {
	return d instanceof Date
		? d.toISOString().slice(0, 10)
		: String(d).slice(0, 10);
}

function isMissingOptionalShelf(err) {
	return (
		err?.code === "42P01" ||
		/relation "shelf\.(product_subscriptions|products)" does not exist/i.test(
			err?.message || "",
		)
	);
}

async function processClientServices() {
	const today = toDateStr(new Date());

	const services = await db
		.prepare(`
    SELECT cs.id, cs.client_id, cs.service_name, cs.price, cs.payment_interval,
           cs.created_at
    FROM client_services cs
    WHERE cs.is_active = TRUE AND cs.status = 'active'
      AND cs.payment_interval NOT IN ('once') AND cs.price > 0
  `)
		.all();

	if (!services.length) return 0;

	// Batch-fetch latest payment date per service in one query (eliminates N queries)
	const serviceIds = services.map((s) => s.id);
	const placeholders = serviceIds.map(() => "?").join(",");
	const latestRows = await db
		.prepare(`
    SELECT client_service_id, MAX(planned_date) AS latest_date
    FROM payments
    WHERE client_service_id IN (${placeholders})
    GROUP BY client_service_id
  `)
		.all(...serviceIds);

	const latestByService = new Map();
	for (const row of latestRows) {
		latestByService.set(row.client_service_id, row.latest_date);
	}

	let created = 0;
	for (const svc of services) {
		const latestDate = latestByService.get(svc.id);
		let anchor = latestDate || toDateStr(svc.created_at);
		let catchup = 0;

		let nextDue = addInterval(anchor, svc.payment_interval);
		while (nextDue && nextDue <= today && catchup < MAX_CATCHUP) {
			const exists = await db
				.prepare(
					`SELECT id FROM payments WHERE client_service_id = ? AND planned_date = ?`,
				)
				.get(svc.id, nextDue);

			if (!exists) {
				await db
					.prepare(`
          INSERT INTO payments (id, client_id, client_service_id, amount, planned_date, status, note)
          VALUES (?, ?, ?, ?, ?, 'pending', ?)
        `)
					.run(
						uuid(),
						svc.client_id,
						svc.id,
						svc.price,
						nextDue,
						`Авто: ${svc.service_name}`,
					);
				created++;
			}
			anchor = nextDue;
			nextDue = addInterval(anchor, svc.payment_interval);
			catchup++;
		}
	}
	return created;
}

async function processProductSubscriptions() {
	const today = toDateStr(new Date());

	let subs;
	try {
		subs = await db.pool.query(
			`
      SELECT ps.id, ps.client_id, ps.billing_amount, ps.billing_period,
             ps.next_billing_date, p.name as product_name
      FROM shelf.product_subscriptions ps
      JOIN shelf.products p ON p.code = ps.product_code
      WHERE ps.status = 'active' AND ps.billing_amount > 0
        AND ps.next_billing_date IS NOT NULL
        AND ps.next_billing_date::date <= $1::date
    `,
			[today],
		);
	} catch (err) {
		if (isMissingOptionalShelf(err)) {
			console.warn(
				"[billing] Product shelf tables are unavailable; subscription billing skipped",
			);
			return 0;
		}
		throw err;
	}

	if (!subs.rows.length) return 0;

	// Batch-fetch existing payments for all subscription IDs (eliminates N queries per iteration)
	const subIds = subs.rows.map((s) => s.id);
	const placeholders = subIds.map(() => "?").join(",");
	const existingRows = await db
		.prepare(`
    SELECT client_product_subscription_id, planned_date
    FROM payments
    WHERE client_product_subscription_id IN (${placeholders})
  `)
		.all(...subIds);

	// Build a Set of "subId|date" keys for O(1) existence checks
	const existingPayments = new Set();
	for (const row of existingRows) {
		existingPayments.add(
			`${row.client_product_subscription_id}|${row.planned_date}`,
		);
	}

	let created = 0;
	for (const sub of subs.rows) {
		let billingDate = toDateStr(sub.next_billing_date);
		let catchup = 0;

		while (billingDate <= today && catchup < MAX_CATCHUP) {
			const key = `${sub.id}|${billingDate}`;
			if (!existingPayments.has(key)) {
				await db
					.prepare(`
          INSERT INTO payments (id, client_id, client_product_subscription_id, amount, planned_date, status, note)
          VALUES (?, ?, ?, ?, ?, 'pending', ?)
        `)
					.run(
						uuid(),
						sub.client_id,
						sub.id,
						sub.billing_amount,
						billingDate,
						`Подписка: ${sub.product_name}`,
					);
				// Track the newly inserted payment so duplicate iterations within this run are safe
				existingPayments.add(key);
				created++;
			}

			const nextDate = addInterval(billingDate, sub.billing_period);
			if (!nextDate) break;
			billingDate = nextDate;
			catchup++;
		}

		await db.pool.query(
			`UPDATE shelf.product_subscriptions SET next_billing_date = $1 WHERE id = $2`,
			[billingDate, sub.id],
		);
	}
	return created;
}

async function markOverdue() {
	const today = toDateStr(new Date());
	const result = await db
		.prepare(
			`UPDATE payments SET status = 'overdue' WHERE status = 'pending' AND planned_date < ?`,
		)
		.run(today);
	return result.changes || 0;
}

async function runBilling() {
	const ts = new Date().toISOString();
	console.log(`[billing] Starting billing run at ${ts}`);
	let svcCount = 0;
	let subCount = 0;
	let overdueCount = 0;
	let error = null;
	try {
		svcCount = await processClientServices();
		subCount = await processProductSubscriptions();
	} catch (err) {
		console.error("[billing] Error during payment creation:", err.message);
		error = err.message;
	} finally {
		// Проставлять просроченные платежи нужно в любом случае,
		// даже если генерация подписок упала из-за недоступности схемы shelf.
		try {
			overdueCount = await markOverdue();
		} catch (overdueErr) {
			console.error(
				"[billing] Error marking overdue payments:",
				overdueErr.message,
			);
			if (!error) error = overdueErr.message;
		}
	}
	console.log(
		`[billing] Done: ${svcCount} service payments, ${subCount} subscription payments, ${overdueCount} marked overdue`,
	);
	const result = {
		services: svcCount,
		subscriptions: subCount,
		overdue: overdueCount,
	};
	if (error) result.error = error;
	return result;
}

let billingInterval = null;

function startBillingSchedule() {
	setTimeout(() => runBilling(), 10_000);
	billingInterval = setInterval(
		() => {
			const hour = new Date().getUTCHours();
			if (hour === 3) runBilling();
		},
		60 * 60 * 1000,
	);
	console.log("[billing] Scheduled: runs daily at 03:00 UTC");
}

function stopBillingSchedule() {
	if (billingInterval) clearInterval(billingInterval);
}

module.exports = {
	runBilling,
	startBillingSchedule,
	stopBillingSchedule,
	processClientServices,
	processProductSubscriptions,
	markOverdue,
	isMissingOptionalShelf,
};

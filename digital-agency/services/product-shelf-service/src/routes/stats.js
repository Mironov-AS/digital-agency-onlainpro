const express = require("express");
const router = express.Router();
const { db } = require("../db");
const { requireAdmin } = require("../middleware/auth");

router.use(requireAdmin);

// GET /api/product-shelf/stats
router.get("/", async (req, res, next) => {
	try {
		const subsTotal = (
			await db
				.prepare("SELECT COUNT(*) as cnt FROM product_subscriptions")
				.get()
		).cnt;
		const subsActive = (
			await db
				.prepare(
					"SELECT COUNT(*) as cnt FROM product_subscriptions WHERE status = 'active'",
				)
				.get()
		).cnt;
		const byPeriod = await db
			.prepare(
				"SELECT billing_period, COUNT(*) as cnt, COALESCE(SUM(billing_amount), 0) as total_amount FROM product_subscriptions WHERE status = 'active' GROUP BY billing_period",
			)
			.all();

		let mrr = 0;
		for (const r of byPeriod) {
			const amount = parseFloat(r.total_amount);
			switch (r.billing_period) {
				case "monthly":
					mrr += amount;
					break;
				case "quarterly":
					mrr += amount / 3;
					break;
				case "yearly":
					mrr += amount / 12;
					break;
			}
		}

		// Upcoming payments формируются единообразно в clients-service на основе
		// реальных записей payments. Возвращаем пустой массив, чтобы дашборд не
		// показывал фиктивные "платежи" из самих подписок (особенно бесплатных
		// trial-подписок с billing_amount = 0), которых нет в clients.payments.
		res.json({
			subscriptions: {
				total: parseInt(subsTotal),
				active: parseInt(subsActive),
				by_period: byPeriod.map((r) => ({
					...r,
					cnt: parseInt(r.cnt),
					total_amount: parseFloat(r.total_amount),
				})),
				mrr: Math.round(mrr),
			},
			upcoming: [],
		});
	} catch (err) {
		next(err);
	}
});

module.exports = router;

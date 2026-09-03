const { requireAuth } = require("../../../../shared/middleware/auth");
const { db } = require("../database");

const PRODUCT_CODE = "furniture-photo-sorter";

/**
 * Проверяет, что у пользователя есть активная подписка на продукт.
 * Для admin пропускает без проверки.
 * Для client проверяет product_subscriptions в схеме product-shelf (search_path=shelf).
 */
function requireSubscription(req, res, next) {
	requireAuth(req, res, async (err) => {
		if (err) return next(err);

		// Администраторы имеют доступ ко всему
		if (req.user.role === "admin") {
			return next();
		}

		const clientId = req.user.clientId || req.user.client_id || null;
		if (!clientId) {
			return res
				.status(403)
				.json({ error: "Доступ запрещён: клиент не привязан к аккаунту" });
		}

		try {
			// Проверяем активную подписку на продукт
			const sub = await db
				.prepare(`
        SELECT s.status, s.trial_ends_at
        FROM product_subscriptions s
        JOIN products p ON p.code = s.product_code
        WHERE s.client_id = ?
          AND p.code = ?
          AND s.status IN ('active', 'trial')
        LIMIT 1
      `)
				.get(clientId, PRODUCT_CODE);

			if (!sub) {
				return res.status(403).json({
					error: "Доступ запрещён: у вас нет активной подписки на этот продукт",
					productCode: PRODUCT_CODE,
				});
			}

			// Если триал — проверяем, не истёк ли
			if (sub.status === "trial" && sub.trial_ends_at) {
				const trialEnd = new Date(sub.trial_ends_at);
				if (trialEnd < new Date()) {
					return res.status(403).json({
						error: "Триальный период истёк. Оформите подписку для продолжения.",
						productCode: PRODUCT_CODE,
					});
				}
			}

			// Сохраняем clientId в request для дальнейшей изоляции данных
			req.clientId = clientId;
			next();
		} catch (e) {
			console.error("[requireSubscription]", e);
			// 42P01 = relation does not exist — схема shelf ещё не инициализирована
			if (e.code === "42P01") {
				return res.status(500).json({
					error:
						"База данных продукта не инициализирована. Обратитесь в поддержку.",
					productCode: PRODUCT_CODE,
				});
			}
			return res.status(500).json({ error: "Ошибка проверки подписки" });
		}
	});
}

module.exports = { requireSubscription };

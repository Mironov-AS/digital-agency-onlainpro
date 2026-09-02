const { v4: uuidv4 } = require("uuid");
const { db } = require("../db");

/**
 * Создаёт записи уведомлений при создании платежа.
 * @param {string} paymentId
 * @param {string} plannedDate — YYYY-MM-DD
 * @param {string} clientId
 */
async function createNotificationsForPayment(paymentId, plannedDate, clientId) {
	// Получаем настройки клиента
	let settings = await db
		.prepare("SELECT * FROM payment_notification_settings WHERE client_id = ?")
		.get(clientId);

	// Если настроек нет — создаём по умолчанию
	if (!settings) {
		const id = uuidv4();
		await db
			.prepare(
				"INSERT INTO payment_notification_settings (id, client_id, enabled, days_before, channel) VALUES (?, ?, ?, ?, ?)",
			)
			.run(id, clientId, true, "5,3,0", "email");
		settings = { enabled: true, days_before: "5,3,0", channel: "email" };
	}

	if (!settings.enabled) return [];

	const daysList = settings.days_before
		.split(",")
		.map((s) => parseInt(s.trim(), 10))
		.filter((n) => !isNaN(n) && n >= 0);

	const planned = new Date(plannedDate + "T00:00:00.000Z");
	const notifications = [];

	for (const daysBefore of daysList) {
		const scheduledFor = new Date(
			planned.getTime() - daysBefore * 24 * 60 * 60 * 1000,
		);
		const id = uuidv4();

		const label =
			daysBefore === 0 ? `Оплата сегодня` : `Оплата через ${daysBefore} дн.`;

		const subject =
			daysBefore === 0
				? "⏰ Оплата сегодня"
				: `📅 Напоминание: оплата через ${daysBefore} ${declination(daysBefore, "день", "дня", "дней")}`;

		const message =
			daysBefore === 0
				? `У вас запланирован платёж на сегодня. Пожалуйста, убедитесь, что оплата произведена вовремя.`
				: `Напоминаем, что через ${daysBefore} ${declination(daysBefore, "день", "дня", "дней")} ожидается платёж. Подготовьте средства заранее.`;

		await db
			.prepare(`
      INSERT INTO payment_notifications
        (id, payment_id, scheduled_for, notification_type, channel, subject, message, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `)
			.run(
				id,
				paymentId,
				scheduledFor.toISOString(),
				"email",
				settings.channel,
				subject,
				message,
				"pending",
			);

		notifications.push({
			id,
			daysBefore,
			scheduledFor: scheduledFor.toISOString(),
		});
	}

	return notifications;
}

/**
 * Отменяет все pending уведомления для платежа (вызывается при оплате).
 * @param {string} paymentId
 */
async function cancelPendingNotificationsForPayment(paymentId) {
	await db
		.prepare(`
    UPDATE payment_notifications
    SET status = 'canceled'
    WHERE payment_id = ? AND status = 'pending'
  `)
		.run(paymentId);
}

/**
 * Получает список уведомлений для платежа.
 */
async function getNotificationsForPayment(paymentId) {
	return db
		.prepare(
			"SELECT * FROM payment_notifications WHERE payment_id = ? ORDER BY scheduled_for ASC",
		)
		.all(paymentId);
}

/**
 * Находит overdue платежи и ставит им статус.
 * Вызывается из job для корректировки статусов.
 */
async function markOverduePayments() {
	const today = new Date().toISOString().split("T")[0];
	const result = await db.pool.query(
		`
    UPDATE payments
    SET status = 'overdue'
    WHERE status = 'pending' AND planned_date < $1
  `,
		[today],
	);
	return result.rowCount;
}

/**
 * Находит overdue уведомления и отменяет их.
 */
async function cancelNotificationsForOverduePayments() {
	await db.pool.query(`
    UPDATE payment_notifications pn
    SET status = 'canceled'
    FROM payments p
    WHERE pn.payment_id = p.id
      AND pn.status = 'pending'
      AND p.status = 'overdue'
  `);
}

/**
 * Возвращает pending уведомления, которые пора отправить.
 */
async function getPendingNotificationsToSend() {
	return db
		.prepare(`
    SELECT pn.*, p.amount, p.planned_date, p.status AS payment_status,
           c.name AS client_name, c.email AS client_email,
           cs.service_name,
           sp.name AS product_name
    FROM payment_notifications pn
    JOIN payments p ON p.id = pn.payment_id
    JOIN clients c ON c.id = p.client_id
    LEFT JOIN client_services cs ON cs.id = p.client_service_id
    LEFT JOIN shelf.product_subscriptions ps ON ps.id = p.client_product_subscription_id
    LEFT JOIN shelf.products sp ON sp.code = ps.product_code
    WHERE pn.scheduled_for <= NOW()
      AND pn.status = 'pending'
      AND p.status IN ('pending', 'overdue')
    ORDER BY pn.scheduled_for ASC
  `)
		.all();
}

/**
 * Отмечает уведомление как отправленное.
 */
async function markNotificationSent(id) {
	await db
		.prepare(`
    UPDATE payment_notifications
    SET status = 'sent', sent_at = NOW()
    WHERE id = ?
  `)
		.run(id);
}

/**
 * Отмечает уведомление как failed.
 */
async function markNotificationFailed(id, errorMessage) {
	await db
		.prepare(`
    UPDATE payment_notifications
    SET status = 'failed', error_message = ?, sent_at = NOW()
    WHERE id = ?
  `)
		.run(errorMessage, id);
}

function declination(n, one, few, many) {
	const m = Math.abs(n);
	const t = [2, 0, 1, 1, 1, 2];
	return many;
}

module.exports = {
	createNotificationsForPayment,
	cancelPendingNotificationsForPayment,
	getNotificationsForPayment,
	markOverduePayments,
	cancelNotificationsForOverduePayments,
	getPendingNotificationsToSend,
	markNotificationSent,
	markNotificationFailed,
};

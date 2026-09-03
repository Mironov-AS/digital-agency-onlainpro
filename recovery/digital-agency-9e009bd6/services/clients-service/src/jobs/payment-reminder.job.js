/**
 * Job: payment-reminder.job.js
 *
 * Находит pending email-уведомления, время которых наступило,
 * отправляет их через SMTP Яндекса и обновляет статус.
 */

const {
	getPendingNotificationsToSend,
	markNotificationSent,
	markNotificationFailed,
} = require("../services/paymentNotifications");

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = parseInt(process.env.SMTP_PORT, 10) || 465;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const SMTP_FROM = process.env.SMTP_FROM || SMTP_USER;

async function sendViaSmtp(to, subject, text) {
	const nodemailer = require("nodemailer");
	const transporter = nodemailer.createTransporter({
		host: SMTP_HOST,
		port: SMTP_PORT,
		secure: SMTP_PORT === 465,
		auth: { user: SMTP_USER, pass: SMTP_PASS },
	});
	await transporter.sendMail({
		from: SMTP_FROM,
		to,
		subject,
		text,
	});
}

async function sendEmail(to, subject, text) {
	if (SMTP_HOST && SMTP_USER && SMTP_PASS) {
		return sendViaSmtp(to, subject, text);
	}
	console.log(`[payment-reminder] EMAIL MOCK to ${to}: ${subject}`);
	return { ok: true };
}

async function run() {
	console.log(`[payment-reminder] Job started at ${new Date().toISOString()}`);

	const notifications = await getPendingNotificationsToSend();

	if (notifications.length === 0) {
		console.log("[payment-reminder] No notifications to send.");
		return;
	}

	console.log(
		`[payment-reminder] Found ${notifications.length} notification(s) to process`,
	);

	const results = { sent: 0, failed: 0 };

	for (const n of notifications) {
		try {
			if (!n.client_email) {
				console.warn(
					`[payment-reminder] No email for notification ${n.id} (client: ${n.client_name})`,
				);
				await markNotificationFailed(n.id, "No client email");
				results.failed++;
				continue;
			}

			const serviceName =
				n.service_name || n.product_name || n.note || "услуга";
			const amountFormatted = Number(n.amount).toLocaleString("ru-RU");
			const subject = n.subject || `Напоминание: оплата ${amountFormatted} ₽`;
			const message =
				n.message ||
				`Уважаемый(ая) ${n.client_name}!\n\n` +
					`Напоминаем, что ${n.planned_date} ожидается оплата за ${serviceName} на сумму ${amountFormatted} ₽.\n\n` +
					`Пожалуйста, убедитесь, что средства подготовлены.`;

			await sendEmail(n.client_email, subject, message);

			await markNotificationSent(n.id);
			results.sent++;
			console.log(
				`[payment-reminder] Sent notification ${n.id} to ${n.client_email}`,
			);
		} catch (err) {
			console.error(
				`[payment-reminder] Failed to send notification ${n.id}:`,
				err.message,
			);
			await markNotificationFailed(n.id, err.message);
			results.failed++;
		}
	}

	console.log(
		`[payment-reminder] Job finished. Sent: ${results.sent}, Failed: ${results.failed}`,
	);
}

// Запуск как standalone
if (require.main === module) {
	run()
		.then(() => process.exit(0))
		.catch((err) => {
			console.error("[payment-reminder] Fatal error:", err);
			process.exit(1);
		});
}

module.exports = { run };

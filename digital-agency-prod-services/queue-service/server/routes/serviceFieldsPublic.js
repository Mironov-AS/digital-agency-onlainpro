const express = require("express");
const { db } = require("../database");

const router = express.Router();

function parseId(val) {
	const id = parseInt(val, 10);
	return Number.isInteger(id) && id > 0 ? id : null;
}

// POST /api/service-fields/check-duplicate — публичный: проверяет, есть ли активный талон
// для этой услуги с такими же значениями полей, помеченных require_check=1
router.post("/check-duplicate", async (req, res, next) => {
	try {
		const serviceId = parseId(req.body?.service_id);
		const fieldValues = Array.isArray(req.body?.field_values)
			? req.body.field_values
			: [];
		if (!serviceId || fieldValues.length === 0) {
			return res.json({ duplicate: false, ticket: null });
		}

		// Поля с require_check=1 для этой услуги
		const checkFields = await db
			.prepare(
				"SELECT * FROM service_fields WHERE service_id = ? AND require_check = 1",
			)
			.all(serviceId);
		if (checkFields.length === 0) {
			return res.json({ duplicate: false, ticket: null });
		}

		const checkFieldIds = new Set(checkFields.map((f) => f.id));
		const valuesToCheck = fieldValues.filter(
			(fv) =>
				checkFieldIds.has(fv.field_id) &&
				(fv.value || "").toString().trim() !== "",
		);
		if (valuesToCheck.length === 0) {
			return res.json({ duplicate: false, ticket: null });
		}

		const today = new Date().toISOString().split("T")[0];
		const activeTickets = await db
			.prepare(
				`SELECT t.*, s.name AS service_name
       FROM tickets t
       LEFT JOIN services s ON t.service_id = s.id
       WHERE t.service_id = ? AND t.date = ? AND t.status IN ('waiting','called')`,
			)
			.all(serviceId, today);

		const normalize = (v) => (v || "").toString().trim().toLowerCase();

		for (const ticket of activeTickets) {
			let ticketFields = [];
			if (ticket.field_values) {
				try {
					ticketFields =
						typeof ticket.field_values === "string"
							? JSON.parse(ticket.field_values)
							: ticket.field_values;
				} catch {
					ticketFields = [];
				}
			}
			if (!Array.isArray(ticketFields) || ticketFields.length === 0) continue;

			let allMatch = true;
			for (const cv of valuesToCheck) {
				const match = ticketFields.some(
					(tf) =>
						tf.field_id === cv.field_id &&
						normalize(tf.value) === normalize(cv.value),
				);
				if (!match) {
					allMatch = false;
					break;
				}
			}

			if (allMatch) {
				return res.json({
					duplicate: true,
					ticket: {
						id: ticket.id,
						number: ticket.number,
						status: ticket.status,
						service_name: ticket.service_name,
					},
				});
			}
		}

		res.json({ duplicate: false, ticket: null });
	} catch (err) {
		next(err);
	}
});

module.exports = router;

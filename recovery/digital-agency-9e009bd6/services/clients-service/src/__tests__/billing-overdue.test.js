/**
 * Unit tests for billing job overdue handling.
 *
 * Verifies that markOverdue runs even when processProductSubscriptions fails.
 */

const { v4: uuidv4 } = require("uuid");

jest.mock("../db", () => {
	const db = {
		pool: {
			query: jest.fn(),
		},
		prepare: jest.fn(),
	};
	return { db };
});

const { db } = require("../db");

const today = new Date().toISOString().slice(0, 10);

function buildMockPrepare(overrides = {}) {
	return jest.fn().mockImplementation((sql) => {
		if (/FROM\s+client_services/i.test(sql)) {
			return {
				all: jest.fn().mockResolvedValue(overrides.services || []),
				get: jest.fn().mockResolvedValue(undefined),
				run: jest.fn().mockResolvedValue({ changes: 0 }),
			};
		}
		if (/UPDATE\s+payments\s+SET\s+status\s*=\s*'overdue'/i.test(sql)) {
			return {
				all: jest.fn().mockResolvedValue([]),
				get: jest.fn().mockResolvedValue(undefined),
				run: jest
					.fn()
					.mockResolvedValue({ changes: overrides.overdueChanges ?? 0 }),
			};
		}
		if (/FROM\s+payments/i.test(sql) || /SELECT.*payments/.test(sql)) {
			return {
				all: jest.fn().mockResolvedValue(overrides.payments || []),
				get: jest.fn().mockResolvedValue(overrides.payments?.[0]),
				run: jest.fn().mockResolvedValue({ changes: 0 }),
			};
		}
		return {
			all: jest.fn().mockResolvedValue([]),
			get: jest.fn().mockResolvedValue(undefined),
			run: jest.fn().mockResolvedValue({ changes: 0 }),
		};
	});
}

describe("billing job markOverdue resilience", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("marks overdue payments when shelf schema is missing (handled gracefully)", async () => {
		const clientId = uuidv4();
		const serviceId = uuidv4();

		db.prepare.mockImplementation(
			buildMockPrepare({
				services: [
					{
						id: serviceId,
						client_id: clientId,
						service_name: "Test Service",
						price: 5000,
						payment_interval: "monthly",
						created_at: `${today}T00:00:00.000Z`,
					},
				],
				payments: [{ client_service_id: serviceId, latest_date: today }],
				overdueChanges: 3,
			}),
		);

		// Simulate missing shelf schema error for subscriptions
		db.pool.query.mockImplementation((sql) => {
			if (/shelf\.product_subscriptions/i.test(sql)) {
				const err = new Error(
					'relation "shelf.product_subscriptions" does not exist',
				);
				err.code = "42P01";
				return Promise.reject(err);
			}
			if (/UPDATE\s+shelf\.product_subscriptions/i.test(sql)) {
				return Promise.resolve({ rowCount: 0 });
			}
			return Promise.resolve({ rows: [], rowCount: 0 });
		});

		const { runBilling } = require("../jobs/billing");
		const result = await runBilling();

		expect(result).toHaveProperty("overdue", 3);
		expect(result).toHaveProperty("services", 0);
		expect(result).toHaveProperty("subscriptions", 0);
		// Gracefully handled missing shelf schema should not report an error
		expect(result).not.toHaveProperty("error");
	});

	it("marks overdue payments even when product subscriptions query throws unexpected error", async () => {
		db.prepare.mockImplementation(
			buildMockPrepare({
				services: [],
				payments: [],
				overdueChanges: 3,
			}),
		);

		// Simulate an unexpected error from product subscriptions query
		db.pool.query.mockImplementation((sql) => {
			if (/shelf\.product_subscriptions/i.test(sql)) {
				return Promise.reject(new Error("connection timeout"));
			}
			if (/UPDATE\s+shelf\.product_subscriptions/i.test(sql)) {
				return Promise.resolve({ rowCount: 0 });
			}
			return Promise.resolve({ rows: [], rowCount: 0 });
		});

		const { runBilling } = require("../jobs/billing");
		const result = await runBilling();

		expect(result).toHaveProperty("overdue", 3);
		expect(result).toHaveProperty("services", 0);
		expect(result).toHaveProperty("subscriptions", 0);
		expect(result).toHaveProperty("error");
		expect(result.error).toContain("connection timeout");
	});

	it("marks overdue payments when product subscriptions query succeeds", async () => {
		db.prepare.mockImplementation(
			buildMockPrepare({
				services: [],
				payments: [],
				overdueChanges: 5,
			}),
		);

		db.pool.query.mockImplementation((sql) => {
			if (/shelf\.product_subscriptions/i.test(sql)) {
				return Promise.resolve({ rows: [] });
			}
			if (/UPDATE\s+shelf\.product_subscriptions/i.test(sql)) {
				return Promise.resolve({ rowCount: 0 });
			}
			return Promise.resolve({ rows: [], rowCount: 0 });
		});

		const { runBilling } = require("../jobs/billing");
		const result = await runBilling();

		expect(result).toEqual({
			services: 0,
			subscriptions: 0,
			overdue: 5,
		});
	});
});

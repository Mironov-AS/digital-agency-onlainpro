/**
 * Unit tests for dashboard stats data sources.
 *
 * Verifies that upcoming payments are built only from real pending payment
 * rows and do not include product subscriptions that have no payment record.
 * This prevents the dashboard from showing fake overdue items for clients
 * whose client page shows no payments.
 */

const { v4: uuidv4 } = require("uuid");

jest.mock("../db", () => {
	const db = {
		pool: { query: jest.fn() },
		prepare: jest.fn(),
	};
	return { db };
});

const { db } = require("../db");
const { getPaymentScheduleRows } = require("../routes/clients");

const today = new Date().toISOString().split("T")[0];
const in30days = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
	.toISOString()
	.split("T")[0];

function buildMockPrepare(overrides = {}) {
	return jest.fn().mockImplementation((sql) => {
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

describe("getPaymentScheduleRows", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("returns only real pending payments as upcoming", async () => {
		const payment = {
			id: uuidv4(),
			client_id: uuidv4(),
			amount: 500,
			planned_date: in30days,
			client_service_id: uuidv4(),
			client_product_subscription_id: null,
			client_name: "Test Client",
			service_name: "Real Service",
		};

		db.prepare.mockImplementation(buildMockPrepare({ payments: [payment] }));

		const upcoming = await getPaymentScheduleRows({ today, in30days });

		expect(upcoming).toHaveLength(1);
		expect(upcoming[0].client_name).toBe("Test Client");
		expect(upcoming[0].service_name).toBe("Real Service");
		expect(upcoming[0].amount).toBe(500);
	});

	it("returns empty upcoming when no pending payments exist", async () => {
		db.prepare.mockImplementation(buildMockPrepare({ payments: [] }));

		const upcoming = await getPaymentScheduleRows({ today, in30days });

		expect(upcoming).toEqual([]);
	});

	it("includes product subscription payments but not subscriptions without payments", async () => {
		const payment = {
			id: uuidv4(),
			client_id: uuidv4(),
			amount: 1200,
			planned_date: in30days,
			client_service_id: null,
			client_product_subscription_id: uuidv4(),
			client_name: "Product Client",
			service_name: "Product Subscription",
		};

		db.prepare.mockImplementation(buildMockPrepare({ payments: [payment] }));

		const upcoming = await getPaymentScheduleRows({ today, in30days });

		expect(upcoming).toHaveLength(1);
		expect(upcoming[0].service_name).toBe("Product Subscription");
	});
});

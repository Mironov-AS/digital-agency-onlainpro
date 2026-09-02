/**
 * Unit tests for product-shelf stats route.
 *
 * Verifies that /api/product-shelf/stats does not expose fake upcoming
 * payments derived from subscriptions themselves. Upcoming payments must
 * come from the clients-service (real payment rows), otherwise free/trial
 * subscriptions with billing_amount = 0 appear as overdue on the dashboard
 * while the client page shows no payments at all.
 */

const request = require("supertest");
const express = require("express");
const jwt = require("jsonwebtoken");

process.env.JWT_ACCESS_SECRET =
	process.env.JWT_ACCESS_SECRET || "test-secret-for-stats";

jest.mock("../db", () => {
	const db = {
		prepare: jest.fn(),
	};
	return { db };
});

const { db } = require("../db");
const statsRoutes = require("../routes/stats");

function adminToken() {
	return jwt.sign({ role: "admin" }, process.env.JWT_ACCESS_SECRET);
}

function mockPrepare(overrides = {}) {
	return jest.fn().mockImplementation((sql) => {
		if (
			/SELECT\s+COUNT\(\*\)\s+as\s+cnt\s+FROM\s+product_subscriptions\s+WHERE\s+status\s*=\s*'active'/i.test(
				sql,
			)
		) {
			return {
				get: jest.fn().mockResolvedValue({ cnt: overrides.activeSubs ?? 0 }),
			};
		}
		if (
			/SELECT\s+COUNT\(\*\)\s+as\s+cnt\s+FROM\s+product_subscriptions/i.test(
				sql,
			)
		) {
			return {
				get: jest.fn().mockResolvedValue({ cnt: overrides.totalSubs ?? 0 }),
			};
		}
		if (/SELECT\s+billing_period,\s*COUNT\(\*\)\s+as\s+cnt/i.test(sql)) {
			return { all: jest.fn().mockResolvedValue(overrides.byPeriod ?? []) };
		}
		return {
			all: jest.fn().mockResolvedValue([]),
			get: jest.fn().mockResolvedValue(undefined),
		};
	});
}

function buildApp() {
	const app = express();
	app.use(express.json());
	app.use((req, _res, next) => {
		req.user = { role: "admin" };
		next();
	});
	app.use("/api/product-shelf/stats", statsRoutes);
	return app;
}

describe("GET /api/product-shelf/stats", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("returns empty upcoming array even when active subscriptions exist", async () => {
		db.prepare.mockImplementation(
			mockPrepare({
				totalSubs: 5,
				activeSubs: 3,
				byPeriod: [
					{ billing_period: "monthly", cnt: 2, total_amount: 1000 },
					{ billing_period: "yearly", cnt: 1, total_amount: 12000 },
				],
			}),
		);

		const app = buildApp();
		const res = await request(app)
			.get("/api/product-shelf/stats")
			.set("Authorization", `Bearer ${adminToken()}`);

		expect(res.status).toBe(200);
		expect(res.body.subscriptions.total).toBe(5);
		expect(res.body.subscriptions.active).toBe(3);
		expect(res.body.subscriptions.mrr).toBe(2000); // 1000 + 12000/12
		expect(res.body.upcoming).toEqual([]);
	});

	it("does not derive upcoming rows from subscriptions with zero billing amount", async () => {
		db.prepare.mockImplementation(
			mockPrepare({
				totalSubs: 1,
				activeSubs: 1,
				byPeriod: [{ billing_period: "monthly", cnt: 1, total_amount: 0 }],
			}),
		);

		const app = buildApp();
		const res = await request(app)
			.get("/api/product-shelf/stats")
			.set("Authorization", `Bearer ${adminToken()}`);

		expect(res.status).toBe(200);
		expect(res.body.subscriptions.mrr).toBe(0);
		expect(res.body.upcoming).toEqual([]);
	});
});

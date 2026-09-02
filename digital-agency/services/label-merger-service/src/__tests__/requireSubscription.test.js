/**
 * Unit tests for label-merger requireSubscription middleware.
 *
 * Verifies that the middleware queries product_subscriptions/products
 * using the correct schema (no hard-coded product_shelf prefix).
 */
const { describe, it, beforeEach, afterEach } = require("node:test");
const assert = require("node:assert");

const SHARED_AUTH_PATH = require.resolve("../../../../shared/middleware/auth");
const DB_PATH = require.resolve("../db");
const MIDDLEWARE_PATH = require.resolve("../middleware/requireSubscription");

function clearModuleCache() {
	delete require.cache[SHARED_AUTH_PATH];
	delete require.cache[DB_PATH];
	delete require.cache[MIDDLEWARE_PATH];
}

function mockAuth(impl) {
	require.cache[SHARED_AUTH_PATH] = {
		id: SHARED_AUTH_PATH,
		filename: SHARED_AUTH_PATH,
		loaded: true,
		exports: { requireAuth: impl },
	};
}

function mockDb(db) {
	require.cache[DB_PATH] = {
		id: DB_PATH,
		filename: DB_PATH,
		loaded: true,
		exports: { db },
	};
}

function createMocks(overrides = {}) {
	const calls = { status: [], json: [], nextErrors: [] };
	return {
		req: {
			headers: {},
			user: { role: "client", clientId: "client-123" },
			...(overrides.req || {}),
		},
		res: {
			status(code) {
				calls.status.push(code);
				return this;
			},
			json(body) {
				calls.json.push(body);
				return this;
			},
			_calls: calls,
		},
		next: (err) => {
			calls.nextErrors.push(err);
		},
		calls,
	};
}

function waitForResponse(calls, timeout = 500) {
	return new Promise((resolve, reject) => {
		const start = Date.now();
		const check = () => {
			if (calls.json.length > 0 || calls.nextErrors.length > 0) {
				resolve();
				return;
			}
			if (Date.now() - start > timeout) {
				reject(new Error("Timeout waiting for middleware response"));
				return;
			}
			setImmediate(check);
		};
		setImmediate(check);
	});
}

describe("label-merger requireSubscription", () => {
	beforeEach(clearModuleCache);
	afterEach(clearModuleCache);

	it("queries product_subscriptions without product_shelf schema prefix", async () => {
		const preparedSql = [];
		const dbMock = {
			prepare: (sql) => {
				preparedSql.push(sql);
				return { get: async () => ({ status: "active" }) };
			},
		};

		mockAuth((_req, _res, next) => next());
		mockDb(dbMock);

		const { requireSubscription } = require(MIDDLEWARE_PATH);
		const { req, res, next, calls } = createMocks();

		requireSubscription(req, res, next);
		await waitForResponse(calls);

		assert.strictEqual(calls.nextErrors[0], undefined);
		assert.strictEqual(preparedSql.length, 1);
		assert.ok(preparedSql[0].includes("FROM product_subscriptions s"));
		assert.ok(preparedSql[0].includes("JOIN products p ON p.code = s.product_code"));
		assert.ok(!preparedSql[0].includes("product_shelf"));
		assert.strictEqual(req.clientId, "client-123");
	});

	it("returns 403 when subscription is missing", async () => {
		const dbMock = {
			prepare: () => ({ get: async () => undefined }),
		};

		mockAuth((_req, _res, next) => next());
		mockDb(dbMock);

		const { requireSubscription } = require(MIDDLEWARE_PATH);
		const { req, res, next, calls } = createMocks();

		requireSubscription(req, res, next);
		await waitForResponse(calls);

		assert.strictEqual(calls.status[0], 403);
		assert.ok(calls.json[0].error.includes("нет активной подписки"));
		assert.strictEqual(calls.json[0].productCode, "ozon-labels");
	});

	it("allows admin without subscription check", async () => {
		const dbMock = { prepare: () => ({ get: async () => undefined }) };

		mockAuth((_req, _res, next) => next());
		mockDb(dbMock);

		const { requireSubscription } = require(MIDDLEWARE_PATH);
		const { req, res, next, calls } = createMocks({
			req: { user: { role: "admin" } },
		});

		requireSubscription(req, res, next);
		await waitForResponse(calls);

		assert.strictEqual(calls.nextErrors[0], undefined);
	});
});

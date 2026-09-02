const request = require("supertest");
const { spawn } = require("child_process");
const path = require("path");

let proc;

beforeAll(async () => {
	proc = spawn("node", ["src/server.js"], {
		cwd: path.join(__dirname, "../.."),
		env: {
			...process.env,
			AUTH_DB_DRIVER: "file",
			JWT_ACCESS_SECRET: "test-secret",
			JWT_REFRESH_SECRET: "test-refresh-secret",
		},
		stdio: ["ignore", "pipe", "pipe"],
	});
	await new Promise((r) => setTimeout(r, 2000));
});

afterAll(() => {
	proc.kill();
});

describe("auth-service", () => {
	it("GET /api/health returns ok", async () => {
		const res = await request("http://localhost:4001").get("/api/health");
		expect(res.status).toBe(200);
		expect(res.body.status).toBe("ok");
		expect(res.body.service).toBe("auth-service");
	});

	it("POST /api/auth/login without credentials returns 400", async () => {
		const res = await request("http://localhost:4001")
			.post("/api/auth/login")
			.send({});
		expect(res.status).toBe(400);
		expect(res.body.error).toBeDefined();
	});

	it("POST /api/auth/login with invalid credentials returns 401", async () => {
		const res = await request("http://localhost:4001")
			.post("/api/auth/login")
			.send({ email: "fake@test.com", password: "wrong" });
		expect(res.status).toBe(401);
	});

	it("login replaces old refresh tokens (single session per user)", async () => {
		// Register a user
		const email = `session-test-${Date.now()}@test.ru`;
		await request("http://localhost:4001")
			.post("/api/auth/users/register")
			.send({ email, password: "password123", name: "Session Test" });

		// First login
		const login1 = await request("http://localhost:4001")
			.post("/api/auth/login")
			.send({ email, password: "password123" });
		expect(login1.status).toBe(200);
		const cookie1 = login1.headers["set-cookie"];
		expect(cookie1).toBeDefined();

		// Second login — should invalidate the first token
		const login2 = await request("http://localhost:4001")
			.post("/api/auth/login")
			.send({ email, password: "password123" });
		expect(login2.status).toBe(200);
		const cookie2 = login2.headers["set-cookie"];
		expect(cookie2).toBeDefined();

		// Refresh with first token should fail
		const refresh1 = await request("http://localhost:4001")
			.post("/api/auth/refresh")
			.set("Cookie", cookie1);
		expect(refresh1.status).toBe(401);

		// Refresh with second token should succeed
		const refresh2 = await request("http://localhost:4001")
			.post("/api/auth/refresh")
			.set("Cookie", cookie2);
		expect(refresh2.status).toBe(200);
	});

	it("logout removes all user refresh tokens", async () => {
		const email = `logout-test-${Date.now()}@test.ru`;
		await request("http://localhost:4001")
			.post("/api/auth/users/register")
			.send({ email, password: "password123", name: "Logout Test" });

		const login = await request("http://localhost:4001")
			.post("/api/auth/login")
			.send({ email, password: "password123" });
		const cookie = login.headers["set-cookie"];

		// Logout
		const logout = await request("http://localhost:4001")
			.post("/api/auth/logout")
			.set("Cookie", cookie);
		expect(logout.status).toBe(200);

		// Refresh after logout should fail
		const refresh = await request("http://localhost:4001")
			.post("/api/auth/refresh")
			.set("Cookie", cookie);
		expect(refresh.status).toBe(401);
	});
});

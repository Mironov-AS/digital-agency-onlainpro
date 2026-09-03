/**
 * HTTP integration tests for label-merger routes.
 * Starts a real Express server with mocked auth and DB.
 */
const { describe, it, before, after } = require("node:test");
const assert = require("node:assert");
const fs = require("fs");
const path = require("path");
const os = require("os");
const http = require("http");
const express = require("express");

const SHARED_AUTH_PATH = require.resolve("../../../../shared/middleware/auth");
const DB_PATH = require.resolve("../db");
const ROUTES_PATH = require.resolve("../routes/labels");

const {
	FIXTURE_ITEMS,
	createAssemblyListPdf,
	createTicketsPdf,
	createEmptyTicketsPdf,
} = require("./fixtures");

function clearModuleCache() {
	delete require.cache[SHARED_AUTH_PATH];
	delete require.cache[DB_PATH];
	delete require.cache[ROUTES_PATH];
}

function mockAuth() {
	require.cache[SHARED_AUTH_PATH] = {
		id: SHARED_AUTH_PATH,
		filename: SHARED_AUTH_PATH,
		loaded: true,
		exports: {
			requireAuth: (req, _res, next) => {
				req.user = { role: "client", clientId: "client-123", id: "user-1" };
				next();
			},
		},
	};
}

function mockDb() {
	const jobs = [];
	require.cache[DB_PATH] = {
		id: DB_PATH,
		filename: DB_PATH,
		loaded: true,
		exports: {
			db: {
				prepare: (sql) => ({
					run: async (...params) => {
						if (sql.toLowerCase().includes("insert into jobs")) {
							const [
										id,
										client_id,
										user_id,
										status,
										assembly_name,
										tickets_name,
										output_name,
										item_count,
										matched_count,
										error_message,
										expires_at,
							] = params;
							jobs.push({
										id,
										client_id,
										user_id,
										status,
										assembly_name,
										tickets_name,
										output_name,
										item_count,
										matched_count,
										error_message,
										expires_at,
							});
						}
						return { changes: 1 };
					},
					get: async (...params) => {
						if (sql.toLowerCase().includes("product_subscriptions")) {
							return { status: "active" };
						}
						return jobs.find((j) => j.id === params[0]) || undefined;
					},
					all: async () => jobs,
				}),
			},
			initDb: async () => {},
		},
	};
}

function buildApp() {
	clearModuleCache();
	mockAuth();
	mockDb();

	const labelsRoutes = require(ROUTES_PATH);
	const app = express();
	app.use("/api/label-merger", labelsRoutes);
	app.use((err, _req, res, _next) => {
		const status = err.status || err.statusCode || 500;
		res.status(status).json({ error: err.message || "Internal server error" });
	});
	return app;
}

function startServer(app) {
	return new Promise((resolve) => {
		const server = http.createServer(app);
		server.listen(0, "127.0.0.1", () => {
			const { port } = server.address();
			resolve({ server, port });
		});
	});
}

async function writeTempPdf(name, buffer) {
	const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "label-merger-test-"));
	const filePath = path.join(tmpDir, name);
	fs.writeFileSync(filePath, buffer);
	return filePath;
}

describe("label-merger routes", () => {
	let server;
	let port;
	let baseUrl;
	let assemblyPath;
	let ticketsPath;

	before(async () => {
		const app = buildApp();
		const started = await startServer(app);
		server = started.server;
		port = started.port;
		baseUrl = `http://127.0.0.1:${port}/api/label-merger`;

		assemblyPath = await writeTempPdf("assembly_list.pdf", await createAssemblyListPdf());
		ticketsPath = await writeTempPdf("tickets.pdf", await createTicketsPdf());
	});

	after(() => {
		server.close();
		try { fs.rmSync(path.dirname(assemblyPath), { recursive: true, force: true }); } catch {}
		try { fs.rmSync(path.dirname(ticketsPath), { recursive: true, force: true }); } catch {}
	});

	it("POST /process creates a merged label job", async () => {
		const form = new FormData();
		form.append("assembly_pdf", new Blob([fs.readFileSync(assemblyPath)]), "assembly_list.pdf");
		form.append("tickets_pdf", new Blob([fs.readFileSync(ticketsPath)]), "tickets.pdf");

		const res = await fetch(`${baseUrl}/process`, {
			method: "POST",
			body: form,
		});

		assert.strictEqual(res.status, 200);
		const body = await res.json();
		assert.ok(body.id);
		assert.strictEqual(body.status, "completed");
		assert.strictEqual(body.itemCount, FIXTURE_ITEMS.length);
		assert.strictEqual(body.matchedCount, FIXTURE_ITEMS.length);
		assert.ok(body.downloadUrl);
	});

	it("POST /process returns 400 when assembly file is missing", async () => {
		const form = new FormData();
		form.append("tickets_pdf", new Blob([fs.readFileSync(ticketsPath)]), "tickets.pdf");

		const res = await fetch(`${baseUrl}/process`, {
			method: "POST",
			body: form,
		});

		assert.strictEqual(res.status, 400);
		const body = await res.json();
		assert.ok(body.error.includes("Необходимо загрузить"));
	});

	it("POST /process returns 400 when tickets do not match assembly", async () => {
		const emptyTicketsBuffer = await createEmptyTicketsPdf();

		const form = new FormData();
		form.append("assembly_pdf", new Blob([fs.readFileSync(assemblyPath)]), "assembly_list.pdf");
		form.append("tickets_pdf", new Blob([emptyTicketsBuffer]), "tickets.pdf");

		const res = await fetch(`${baseUrl}/process`, {
			method: "POST",
			body: form,
		});

		assert.strictEqual(res.status, 400);
		const body = await res.json();
		assert.ok(body.error.includes("Не удалось сопоставить"));
	});

	it("GET /jobs/:id/preview returns inline PDF", async () => {
		const form = new FormData();
		form.append("assembly_pdf", new Blob([fs.readFileSync(assemblyPath)]), "assembly_list.pdf");
		form.append("tickets_pdf", new Blob([fs.readFileSync(ticketsPath)]), "tickets.pdf");

		const processRes = await fetch(`${baseUrl}/process`, {
			method: "POST",
			body: form,
		});
		const { id } = await processRes.json();

		const res = await fetch(`${baseUrl}/jobs/${id}/preview`);
		assert.strictEqual(res.status, 200);
		assert.strictEqual(res.headers.get("content-type"), "application/pdf");
		const disposition = res.headers.get("content-disposition");
		assert.ok(disposition.includes("inline"));
		const buffer = Buffer.from(await res.arrayBuffer());
		assert.ok(buffer.length > 1000);
	});
});

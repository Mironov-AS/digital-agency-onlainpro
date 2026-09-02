const { Pool } = require("pg");

function pgify(sql) {
	let idx = 0;
	return sql.replace(/\?/g, () => `$${++idx}`);
}

function parsePgUrl(connStr) {
	if (!connStr || typeof connStr !== "string") return null;
	if (!connStr.startsWith("postgres://") && !connStr.startsWith("postgresql://")) {
		return null;
	}
	const url = new URL(connStr);
	const params = {};
	for (const [key, value] of url.searchParams) {
		params[key] = value;
	}
	return {
		host: url.hostname,
		port: url.port ? Number.parseInt(url.port, 10) : 5432,
		user: decodeURIComponent(url.username || ""),
		password: decodeURIComponent(url.password || ""),
		database: url.pathname ? decodeURIComponent(url.pathname.slice(1)) : undefined,
		options: params.options,
		params,
	};
}

function createPgDb(connectionString) {
	const connStr = connectionString || process.env.DATABASE_URL;
	const poolMax = Number.parseInt(process.env.PG_POOL_MAX || "3", 10);
	const parsed = parsePgUrl(connStr);
	const poolConfig = parsed
		? {
				host: parsed.host,
				port: parsed.port,
				user: parsed.user,
				password: parsed.password,
				database: parsed.database,
				max: Number.isFinite(poolMax) && poolMax > 0 ? poolMax : 3,
				idleTimeoutMillis: 30000,
				connectionTimeoutMillis: 5000,
				ssl: { rejectUnauthorized: false },
				...(parsed.options ? { options: parsed.options } : {}),
			}
		: {
				connectionString: connStr,
				max: Number.isFinite(poolMax) && poolMax > 0 ? poolMax : 3,
				idleTimeoutMillis: 30000,
				connectionTimeoutMillis: 5000,
				ssl: { rejectUnauthorized: false },
			};
	const pool = new Pool(poolConfig);

	pool.on("error", (err) => {
		console.error("[pg] unexpected pool error", err);
	});

	const schemaMatch = (connStr || "").match(
		/search_path(?:=|%3D)([a-zA-Z_][a-zA-Z0-9_]*)/i,
	);
	const schema = schemaMatch ? schemaMatch[1] : null;

	const db = {
		pool,

		async ensureSchema() {
			if (schema) {
				await pool.query(`CREATE SCHEMA IF NOT EXISTS "${schema}"`);
				console.log(`[pg] Schema "${schema}" ensured`);
			}
		},

		prepare(sql) {
			const pgSql = pgify(sql);
			return {
				async get(...params) {
					const { rows } = await pool.query(pgSql, params);
					return rows[0] || undefined;
				},
				async all(...params) {
					const { rows } = await pool.query(pgSql, params);
					return rows;
				},
				async run(...params) {
					const result = await pool.query(pgSql, params);
					return { changes: result.rowCount };
				},
			};
		},

		async exec(sql) {
			await pool.query(sql);
		},

		async runTransaction(fn) {
			const client = await pool.connect();
			const txDb = {
				prepare(sql) {
					const pgSql = pgify(sql);
					return {
						async get(...params) {
							const { rows } = await client.query(pgSql, params);
							return rows[0] || undefined;
						},
						async all(...params) {
							const { rows } = await client.query(pgSql, params);
							return rows;
						},
						async run(...params) {
							const result = await client.query(pgSql, params);
							return { changes: result.rowCount };
						},
					};
				},
				async exec(sql) {
					await client.query(sql);
				},
			};
			try {
				await client.query("BEGIN");
				await fn(txDb);
				await client.query("COMMIT");
			} catch (e) {
				await client.query("ROLLBACK");
				throw e;
			} finally {
				client.release();
			}
		},

		async close() {
			await pool.end();
		},
	};

	return db;
}

function buildUpdate(
	table,
	data,
	allowedFields,
	whereClause,
	whereParams = [],
) {
	const filtered = {};
	for (const key of Object.keys(data)) {
		if (allowedFields.includes(key)) filtered[key] = data[key];
	}
	const keys = Object.keys(filtered);
	if (keys.length === 0) return null;
	const values = keys.map((k) => filtered[k]);
	const sets = keys.map((k, i) => `${k} = $${i + 1}`).join(", ");
	const offset = keys.length;
	const where = whereClause.replace(
		/\$(\d+)/g,
		(_, n) => `$${offset + parseInt(n)}`,
	);
	return {
		sql: `UPDATE ${table} SET ${sets} WHERE ${where}`,
		params: [...values, ...whereParams],
		count: keys.length,
	};
}

module.exports = createPgDb;
module.exports.buildUpdate = buildUpdate;

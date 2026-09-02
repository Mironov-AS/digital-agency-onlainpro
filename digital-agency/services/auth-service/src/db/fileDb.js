const fs = require("fs");
const path = require("path");

const DEFAULT_STATE = { users: [], refresh_tokens: [] };

function now() {
	return new Date().toISOString();
}

function clone(row) {
	return row ? JSON.parse(JSON.stringify(row)) : undefined;
}

function createFileDb(filePath) {
	const statePath =
		filePath ||
		process.env.AUTH_DB_PATH ||
		path.join(__dirname, "../../data/auth.json");
	let state = DEFAULT_STATE;

	function load() {
		if (!fs.existsSync(statePath)) {
			state = clone(DEFAULT_STATE);
			return;
		}
		const parsed = JSON.parse(fs.readFileSync(statePath, "utf8"));
		state = {
			users: Array.isArray(parsed.users) ? parsed.users : [],
			refresh_tokens: Array.isArray(parsed.refresh_tokens)
				? parsed.refresh_tokens
				: [],
		};
	}

	function save() {
		fs.mkdirSync(path.dirname(statePath), { recursive: true });
		fs.writeFileSync(statePath, JSON.stringify(state, null, 2));
	}

	function findUserByEmail(email) {
		return state.users.find(
			(user) => user.email === String(email).toLowerCase().trim(),
		);
	}

	function findUserById(id) {
		return state.users.find((user) => user.id === id);
	}

	function selectFields(row, fields) {
		if (!row) return undefined;
		return Object.fromEntries(fields.map((field) => [field, row[field]]));
	}

	function parseSelectedFields(compact) {
		const match = compact.match(/^SELECT (.+) FROM users WHERE id = \?$/i);
		if (!match || match[1] === "*") return null;
		return match[1].split(",").map((field) => field.trim());
	}

	function prepare(sql) {
		const compact = sql.replace(/\s+/g, " ").trim();
		return {
			async get(...params) {
				if (compact === "SELECT id FROM users WHERE email = ?") {
					const user = findUserByEmail(params[0]);
					return user ? { id: user.id } : undefined;
				}
				if (compact === "SELECT * FROM users WHERE email = ?") {
					return clone(findUserByEmail(params[0]));
				}
				if (compact === "SELECT * FROM users WHERE id = ?") {
					return clone(findUserById(params[0]));
				}
				const selectedFields = parseSelectedFields(compact);
				if (selectedFields) {
					return clone(selectFields(findUserById(params[0]), selectedFields));
				}
				if (
					compact.includes(
						"FROM refresh_tokens rt JOIN users u ON u.id = rt.user_id",
					)
				) {
					const tokenHash = params[0];
					const token = state.refresh_tokens.find(
						(item) =>
							item.token_hash === tokenHash &&
							new Date(item.expires_at) > new Date(),
					);
					if (!token) return undefined;
					const user = findUserById(token.user_id);
					if (!user) return undefined;
					return clone({
						...token,
						email: user.email,
						role: user.role,
						apps: user.apps,
						client_id: user.client_id,
						is_active: user.is_active,
					});
				}
				if (compact.includes("FROM users WHERE id = ?")) {
					return clone(findUserById(params[0]));
				}
				if (
					compact === "SELECT user_id FROM refresh_tokens WHERE token_hash = ?"
				) {
					const token = state.refresh_tokens.find(
						(item) => item.token_hash === params[0],
					);
					return token ? { user_id: token.user_id } : undefined;
				}
				throw new Error(`Unsupported file auth query: ${compact}`);
			},

			async all(...params) {
				if (compact.includes("FROM users ORDER BY created_at DESC")) {
					return clone(state.users).sort(
						(a, b) => new Date(b.created_at) - new Date(a.created_at),
					);
				}
				if (compact.includes("FROM users WHERE client_id IN")) {
					const clientIds = new Set(params.map(String));
					return clone(
						state.users
							.filter(
								(user) =>
									user.client_id && clientIds.has(String(user.client_id)),
							)
							.map((user) =>
								selectFields(user, [
									"id",
									"email",
									"name",
									"role",
									"client_id",
									"is_active",
									"created_at",
								]),
							),
					);
				}
				if (
					compact.includes(
						"SELECT DISTINCT u.id FROM users u JOIN refresh_tokens rt ON rt.user_id = u.id",
					)
				) {
					const clientIds = new Set(params.map(String));
					const onlineUserIds = new Set(
						state.refresh_tokens
							.filter((token) => new Date(token.expires_at) > new Date())
							.map((token) => token.user_id),
					);
					return clone(
						state.users
							.filter(
								(user) =>
									user.client_id &&
									clientIds.has(String(user.client_id)) &&
									onlineUserIds.has(user.id),
							)
							.map((user) => ({ id: user.id })),
					);
				}
				throw new Error(`Unsupported file auth query: ${compact}`);
			},

			async run(...params) {
				if (compact.startsWith("UPDATE users SET password_hash = ?")) {
					const [password_hash, name, role, apps, id] = params;
					const user = findUserById(id);
					if (!user) return { changes: 0 };
					Object.assign(user, {
						password_hash,
						name,
						role,
						apps,
						is_active: true,
						updated_at: now(),
					});
					save();
					return { changes: 1 };
				}
				if (
					compact ===
					"INSERT INTO users (id, email, password_hash, name, role, apps) VALUES (?, ?, ?, ?, ?, ?)"
				) {
					const [id, email, password_hash, name, role, apps] = params;
					state.users.push({
						id,
						email: String(email).toLowerCase().trim(),
						password_hash,
						name,
						role,
						apps,
						client_id: null,
						is_active: true,
						plan: null,
						plan_expires_at: null,
						created_at: now(),
						updated_at: now(),
					});
					save();
					return { changes: 1 };
				}
				if (
					compact ===
					"INSERT INTO users (id, email, password_hash, name, role, apps, client_id) VALUES (?, ?, ?, ?, ?, ?, ?)"
				) {
					const [id, email, password_hash, name, role, apps, client_id] =
						params;
					state.users.push({
						id,
						email: String(email).toLowerCase().trim(),
						password_hash,
						name,
						role,
						apps,
						client_id,
						is_active: true,
						plan: null,
						plan_expires_at: null,
						created_at: now(),
						updated_at: now(),
					});
					save();
					return { changes: 1 };
				}
				if (
					compact ===
					"INSERT INTO refresh_tokens (id, user_id, token_hash, expires_at) VALUES (?, ?, ?, ?)"
				) {
					const [id, user_id, token_hash, expires_at] = params;
					state.refresh_tokens.push({
						id,
						user_id,
						token_hash,
						expires_at,
						created_at: now(),
					});
					save();
					return { changes: 1 };
				}
				if (compact === "DELETE FROM refresh_tokens WHERE token_hash = ?") {
					const before = state.refresh_tokens.length;
					state.refresh_tokens = state.refresh_tokens.filter(
						(item) => item.token_hash !== params[0],
					);
					save();
					return { changes: before - state.refresh_tokens.length };
				}
				if (compact === "DELETE FROM refresh_tokens WHERE user_id = ?") {
					const before = state.refresh_tokens.length;
					state.refresh_tokens = state.refresh_tokens.filter(
						(item) => item.user_id !== params[0],
					);
					save();
					return { changes: before - state.refresh_tokens.length };
				}
				if (compact === "DELETE FROM refresh_tokens WHERE expires_at < NOW()") {
					const before = state.refresh_tokens.length;
					state.refresh_tokens = state.refresh_tokens.filter(
						(item) => new Date(item.expires_at) > new Date(),
					);
					save();
					return { changes: before - state.refresh_tokens.length };
				}
				if (compact === "DELETE FROM users WHERE id = ?") {
					const before = state.users.length;
					state.users = state.users.filter((user) => user.id !== params[0]);
					state.refresh_tokens = state.refresh_tokens.filter(
						(token) => token.user_id !== params[0],
					);
					save();
					return { changes: before - state.users.length };
				}
				throw new Error(`Unsupported file auth query: ${compact}`);
			},
		};
	}

	load();

	return {
		prepare,
		async exec() {
			save();
		},
		pool: {
			async query(sql, params) {
				if (!sql.startsWith("UPDATE users SET "))
					throw new Error(`Unsupported file auth query: ${sql}`);
				const id = params[params.length - 1];
				const user = findUserById(id);
				if (!user) return { rowCount: 0, rows: [] };
				const assignments = sql
					.match(/^UPDATE users SET (.+) WHERE id = /)[1]
					.split(",")
					.map((item) => item.trim().split(" = ")[0]);
				assignments.forEach((key, index) => {
					user[key] = params[index];
				});
				save();
				return { rowCount: 1, rows: [] };
			},
		},
		async close() {
			save();
		},
	};
}

module.exports = createFileDb;

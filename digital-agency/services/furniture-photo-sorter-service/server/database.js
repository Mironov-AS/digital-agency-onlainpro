const createPgDb = require("../../../shared/db");

const db = createPgDb(process.env.DATABASE_URL);

async function initDb() {
	await db.ensureSchema();

	// Ensure tables are created in the current service schema (furniture_sorter),
	// not accidentally in shelf due to search_path order.
	// DROP IF EXISTS + recreate is safe — sessions expire daily and settings are seeded.
	await db.exec(`
    DROP TABLE IF EXISTS templates;
    CREATE TABLE templates (
      id TEXT PRIMARY KEY,
      client_id TEXT NOT NULL DEFAULT '',
      name TEXT NOT NULL,
      view_types TEXT NOT NULL DEFAULT '[]',
      settings TEXT NOT NULL DEFAULT '{}',
      is_default BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT NOW()
    );

    DROP TABLE IF EXISTS sessions;
    CREATE TABLE sessions (
      id TEXT PRIMARY KEY,
      client_id TEXT NOT NULL DEFAULT '',
      user_id TEXT DEFAULT '',
      settings TEXT NOT NULL DEFAULT '{}',
      files TEXT NOT NULL DEFAULT '[]',
      classifications TEXT NOT NULL DEFAULT '[]',
      is_classifying BOOLEAN DEFAULT FALSE,
      is_processing BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT NOW(),
      expires_at TIMESTAMP DEFAULT NOW() + INTERVAL '24 hours'
    );

    DROP TABLE IF EXISTS settings;
    CREATE TABLE settings (
      id SERIAL PRIMARY KEY,
      client_id TEXT NOT NULL DEFAULT '',
      key TEXT NOT NULL,
      value TEXT DEFAULT '',
      UNIQUE(client_id, key)
    );

    CREATE INDEX IF NOT EXISTS idx_templates_client ON templates(client_id);
    CREATE INDEX IF NOT EXISTS idx_sessions_client ON sessions(client_id);
    CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);
  `);

	await seedDefaults();
}

async function seedDefaults() {
	// Seed default view types reference as a setting
	const defaultViewTypes = [
		{
			id: "1",
			name: "Прямой вид",
			description: "Вид спереди, симметричный ракурс",
		},
		{
			id: "2",
			name: "Угловой вид",
			description: "Вид под углом, асимметричный ракурс",
		},
		{ id: "3", name: "Вид сверху", description: "Вид сверху на поверхность" },
		{ id: "4", name: "Вид сбоку (слева)", description: "Вид с левой стороны" },
		{
			id: "5",
			name: "Вид сбоку (справа)",
			description: "Вид с правой стороны",
		},
		{ id: "6", name: "Вид сзади", description: "Вид с задней стороны" },
		{ id: "7", name: "Вид снизу", description: "Вид снизу, днище" },
	];

	const existing = await db
		.prepare(
			"SELECT value FROM settings WHERE key = 'view_types' AND client_id = ''",
		)
		.get();
	if (!existing) {
		await db
			.prepare(
				"INSERT INTO settings (client_id, key, value) VALUES ('', 'view_types', ?)",
			)
			.run(JSON.stringify(defaultViewTypes));
	}

	// Seed default template
	const defaultTemplate = await db
		.prepare(
			"SELECT id FROM templates WHERE is_default = TRUE AND client_id = ''",
		)
		.get();
	if (!defaultTemplate) {
		const { v4: uuid } = require("uuid");
		await db
			.prepare(`
      INSERT INTO templates (id, client_id, name, view_types, settings, is_default)
      VALUES (?, '', 'Стандартный набор', ?, ?, TRUE)
    `)
			.run(
				uuid(),
				JSON.stringify([
					{ id: "1", name: "Прямой вид", order: 1, isCustom: false },
					{ id: "2", name: "Угловой вид", order: 2, isCustom: false },
					{ id: "4", name: "Вид сбоку (слева)", order: 3, isCustom: false },
					{ id: "5", name: "Вид сбоку (справа)", order: 4, isCustom: false },
					{ id: "6", name: "Вид сзади", order: 5, isCustom: false },
				]),
				JSON.stringify({
					article: "",
					includeArticle: true,
					includeViewType: true,
					separator: "_",
				}),
			);
	}
}

async function getClientSetting(key, clientId, defaultValue = null) {
	if (clientId) {
		const row = await db
			.prepare("SELECT value FROM settings WHERE key = ? AND client_id = ?")
			.get(key, clientId);
		if (row) return row.value;
	}
	const globalRow = await db
		.prepare("SELECT value FROM settings WHERE key = ? AND client_id = ''")
		.get(key);
	return globalRow?.value ?? defaultValue;
}

async function setClientSetting(key, value, clientId = "") {
	await db
		.prepare(`
    INSERT INTO settings (client_id, key, value) VALUES (?, ?, ?)
    ON CONFLICT (client_id, key) DO UPDATE SET value = EXCLUDED.value
  `)
		.run(clientId, key, value);
}

module.exports = { db, initDb, getClientSetting, setClientSetting };

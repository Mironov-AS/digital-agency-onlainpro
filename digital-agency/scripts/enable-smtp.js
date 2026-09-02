#!/usr/bin/env node
/**
 * Enable SMTP settings in the database
 * Usage: node scripts/enable-smtp.js
 */

require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const { Client } = require("pg");

const config = {
	connectionString: process.env.DATABASE_URL,
};

async function enableSMTP() {
	// First, try to connect without search_path to check if database exists
	const baseUrl = process.env.DATABASE_URL;
	if (!baseUrl) {
		console.error("❌ DATABASE_URL not found in .env");
		process.exit(1);
	}

	const client = new Client({
		connectionString: baseUrl
			.replace(/search_path=[^&]+&?/, "")
			.replace(/[?&]$/, ""),
	});

	try {
		console.log("🔌 Connecting to database...");
		await client.connect();

		// First ensure the admin schema exists and we can write to it
		await client.query(`CREATE SCHEMA IF NOT EXISTS admin`);

		// Create the smtp_settings table if it doesn't exist
		await client.query(`
      CREATE TABLE IF NOT EXISTS admin.smtp_settings (
        id TEXT PRIMARY KEY DEFAULT 'default',
        host TEXT NOT NULL DEFAULT '',
        port INTEGER NOT NULL DEFAULT 465,
        username TEXT NOT NULL DEFAULT '',
        password TEXT NOT NULL DEFAULT '',
        from_email TEXT NOT NULL DEFAULT '',
        from_name TEXT NOT NULL DEFAULT '',
        use_ssl BOOLEAN DEFAULT TRUE,
        is_enabled BOOLEAN DEFAULT FALSE,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

		console.log("📧 Configuring SMTP settings...");

		// Upsert SMTP settings
		const result = await client.query(
			`
      INSERT INTO admin.smtp_settings (id, host, port, username, password, from_email, from_name, use_ssl, is_enabled, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
      ON CONFLICT (id) DO UPDATE SET
        host = EXCLUDED.host,
        port = EXCLUDED.port,
        username = EXCLUDED.username,
        password = EXCLUDED.password,
        from_email = EXCLUDED.from_email,
        from_name = EXCLUDED.from_name,
        use_ssl = EXCLUDED.use_ssl,
        is_enabled = EXCLUDED.is_enabled,
        updated_at = NOW()
      RETURNING *
    `,
			[
				"default",
				process.env.SMTP_HOST || "smtp.yandex.ru",
				parseInt(process.env.SMTP_PORT) || 465,
				process.env.SMTP_USER || "andrey.onlinepro@yandex.ru",
				process.env.SMTP_PASS || "ddzbgdwdcpsjfswb",
				process.env.SMTP_FROM || "andrey.onlinepro@yandex.ru",
				"Цифровое агентство ОнлайнПро",
				true,
				true,
			],
		);

		console.log("✅ SMTP settings saved:");
		console.log(`   Host: ${result.rows[0].host}`);
		console.log(`   Port: ${result.rows[0].port}`);
		console.log(`   User: ${result.rows[0].username}`);
		console.log(`   Enabled: ${result.rows[0].is_enabled}`);
		console.log("\n🎉 SMTP is now configured and enabled!");
	} catch (err) {
		console.error("❌ Error:", err.message);
		process.exit(1);
	} finally {
		await client.end();
	}
}

enableSMTP();

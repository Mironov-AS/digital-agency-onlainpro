const { db, initDb } = require("/repo/services/queue-service/server/database");
(async () => {
	await initDb();
	const cols = await db.pool.query(
		"SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_schema = current_schema() AND table_name = 'service_fields' ORDER BY ordinal_position",
	);
	console.log("=== service_fields schema ===");
	console.log(cols.rows);
	const tix = await db.pool.query(
		"SELECT column_name, data_type FROM information_schema.columns WHERE table_schema = current_schema() AND table_name = 'tickets' ORDER BY ordinal_position",
	);
	console.log("=== tickets schema ===");
	console.log(tix.rows);
	process.exit(0);
})();

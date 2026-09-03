const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const rateLimit = require("express-rate-limit");
const { createApp, startServer } = require("../../../shared/createApp");
const { initDb, db } = require("./db");

const authRoutes = require("./routes/auth");
const usersRoutes = require("./routes/users");

const app = createApp({
	name: "auth-service",
	corsOrigin: process.env.CORS_ORIGIN || "http://localhost",
	trustProxy: true,
});

const loginLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 20,
	message: { error: "Too many requests" },
});

app.use("/api/auth/login", loginLimiter);
app.use("/api/auth", authRoutes);
app.use("/api/auth/users", usersRoutes);

// Cleanup expired refresh tokens on startup and periodically
async function cleanupExpiredTokens() {
	try {
		const result = await db
			.prepare("DELETE FROM refresh_tokens WHERE expires_at < NOW()")
			.run();
		if (result?.changes > 0) {
			console.log(
				`[auth-service] Cleaned up ${result.changes} expired refresh token(s)`,
			);
		}
	} catch (err) {
		console.warn(
			"[auth-service] Failed to cleanup expired tokens:",
			err.message,
		);
	}
}

startServer(app, {
	name: "auth-service",
	port: process.env.PORT || 4001,
	init: initDb,
}).then(() => {
	cleanupExpiredTokens();
	setInterval(cleanupExpiredTokens, 6 * 60 * 60 * 1000); // every 6 hours
});

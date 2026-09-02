const jwt = require("jsonwebtoken");
const { getJwtSecret } = require("../config");

function parseCookies(cookieHeader) {
	const out = {};
	if (!cookieHeader) return out;
	cookieHeader.split(";").forEach((pair) => {
		const eq = pair.indexOf("=");
		if (eq < 0) return;
		out[pair.slice(0, eq).trim()] = pair.slice(eq + 1).trim();
	});
	return out;
}

async function requireAuth(req, res, next) {
	// 1) Cookie HttpOnly (SPA main auth flow)
	const cookies = parseCookies(req.headers.cookie || "");
	let token = cookies.access_token;

	// 2) Query param fallback (queue terminal / public display)
	if (!token) token = req.query.auth_token;

	// 3) Bearer header fallback (direct API callers)
	if (!token) token = (req.headers.authorization || "").replace("Bearer ", "");

	if (!token) return res.status(401).json({ error: "Не авторизован" });
	try {
		const secret = await getJwtSecret();
		const payload = jwt.verify(token, secret);
		req.user = {
			id: payload.userId || payload.id,
			username: payload.email || payload.username,
			role: payload.role,
			clientId: payload.clientId || null,
		};
		next();
	} catch (e) {
		res.status(401).json({ error: "Недействительный токен" });
	}
}

module.exports = { requireAuth };

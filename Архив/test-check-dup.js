const http = require("http");
const data = JSON.stringify({ service_id: 1, field_values: [] });
const req = http.request(
	{
		hostname: "127.0.0.1",
		port: 3001,
		path: "/api/service-fields/check-duplicate",
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"Content-Length": Buffer.byteLength(data),
		},
	},
	(res) => {
		let body = "";
		res.on("data", (c) => (body += c));
		res.on("end", () => console.log("STATUS", res.statusCode, "BODY:", body));
	},
);
req.write(data);
req.end();

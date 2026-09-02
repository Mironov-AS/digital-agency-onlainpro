import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
	plugins: [react()],
	base: "/app/",
	cacheDir: "/home/user/.vite-cache-appdev-fresh",
	server: {
		host: "0.0.0.0",
		port: 5201,
		proxy: {
			"/api/auth": { target: "http://localhost:4001", changeOrigin: false },
			"/api/catalog": { target: "http://localhost:4002", changeOrigin: false },
			"/api/clients": { target: "http://localhost:4003", changeOrigin: false },
			"/api/projects": { target: "http://localhost:4004", changeOrigin: false },
			"/api/admin": { target: "http://localhost:4005", changeOrigin: false },
			"/api/product-shelf": {
				target: "http://localhost:4006",
				changeOrigin: false,
			},
			"/api/products": { target: "http://localhost:4006", changeOrigin: false },
			// Electronic Queue (formerly standalone queue-service) — shares the same
			// cookie-based JWT auth handled by /api/auth above.
			"/api/services": { target: "http://localhost:4007", changeOrigin: false },
			"/api/service-fields": {
				target: "http://localhost:4007",
				changeOrigin: false,
			},
			"/api/tickets": { target: "http://localhost:4007", changeOrigin: false },
			"/api/queue": { target: "http://localhost:4007", changeOrigin: false },
			"/api/stats": { target: "http://localhost:4007", changeOrigin: false },
			"/api/users": { target: "http://localhost:4007", changeOrigin: false },
			"/api/settings": { target: "http://localhost:4007", changeOrigin: false },
			"/api/qrcode": { target: "http://localhost:4007", changeOrigin: false },
			"/api/logs": { target: "http://localhost:4007", changeOrigin: false },
			"/api/ads": { target: "http://localhost:4007", changeOrigin: false },
		},
	},
});

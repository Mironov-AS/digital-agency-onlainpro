import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
	plugins: [react()],
	base: "/app/",
	server: {
		host: "0.0.0.0",
		port: 5175,
		proxy: {
			// Strip /app prefix before forwarding to backend services
			"/app/api/auth": {
				target: "http://localhost:4001",
				changeOrigin: true,
				rewrite: (path) => path.replace(/^\/app/, ""),
			},
			"/app/api/catalog": {
				target: "http://localhost:4002",
				changeOrigin: true,
				rewrite: (path) => path.replace(/^\/app/, ""),
			},
			"/app/api/clients": {
				target: "http://localhost:4003",
				changeOrigin: true,
				rewrite: (path) => path.replace(/^\/app/, ""),
			},
			"/app/api/projects": {
				target: "http://localhost:4004",
				changeOrigin: true,
				rewrite: (path) => path.replace(/^\/app/, ""),
			},
			"/app/api/admin": {
				target: "http://localhost:4005",
				changeOrigin: true,
				rewrite: (path) => path.replace(/^\/app/, ""),
			},
			"/app/api/product-shelf": {
				target: "http://localhost:4006",
				changeOrigin: true,
				rewrite: (path) => path.replace(/^\/app/, ""),
			},
			"/app/api/products": {
				target: "http://localhost:4006",
				changeOrigin: true,
				rewrite: (path) => path.replace(/^\/app/, ""),
			},
			"/app/api/booking": {
				target: "http://localhost:4008",
				changeOrigin: true,
				rewrite: (path) => path.replace(/^\/app/, ""),
			},
			"/app/api/crm": {
				target: "http://localhost:4009",
				changeOrigin: true,
				rewrite: (path) => path.replace(/^\/app/, ""),
			},
			"/app/api/erp": {
				target: "http://localhost:4010",
				changeOrigin: true,
				rewrite: (path) => path.replace(/^\/app/, ""),
			},
			"/app/api/store": {
				target: "http://localhost:4011",
				changeOrigin: true,
				rewrite: (path) => path.replace(/^\/app/, ""),
			},
			"/app/api/label-merger": {
				target: "http://localhost:4013",
				changeOrigin: true,
				rewrite: (path) => path.replace(/^\/app/, ""),
			},
			// Fallback without /app prefix
			"/api/auth": { target: "http://localhost:4001", changeOrigin: true },
			"/api/catalog": { target: "http://localhost:4002", changeOrigin: true },
			"/api/clients": { target: "http://localhost:4003", changeOrigin: true },
			"/api/projects": { target: "http://localhost:4004", changeOrigin: true },
			"/api/admin": { target: "http://localhost:4005", changeOrigin: true },
			"/api/product-shelf": {
				target: "http://localhost:4006",
				changeOrigin: true,
			},
			"/api/products": { target: "http://localhost:4006", changeOrigin: true },
			"/api/booking": { target: "http://localhost:4008", changeOrigin: true },
			"/api/crm": { target: "http://localhost:4009", changeOrigin: true },
			"/api/erp": { target: "http://localhost:4010", changeOrigin: true },
			"/api/store": { target: "http://localhost:4011", changeOrigin: true },
			"/api/label-merger": {
				target: "http://localhost:4013",
				changeOrigin: true,
			},
		},
	},
});

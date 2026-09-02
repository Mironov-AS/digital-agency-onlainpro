import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
	plugins: [react()],
	base: process.env.VITE_BASE || "/client-portal/",
	server: {
		host: "0.0.0.0",
		port: 5202,
		proxy: {
			"/api/auth": {
				target: "http://localhost:4001",
				changeOrigin: true,
			},
			"/api/product-shelf": {
				target: "http://localhost:4006",
				changeOrigin: true,
			},
			"/queue": {
				target: "http://localhost:3002",
				changeOrigin: true,
				rewrite: (path) => path.replace(/^\/queue/, ""),
			},
			"/queue/src/": {
				target: "http://localhost:3002",
				changeOrigin: true,
				rewrite: (path) => path.replace(/^\/queue\/src/, "/src"),
			},
			"/queue/assets/": {
				target: "http://localhost:3002",
				changeOrigin: true,
				rewrite: (path) => path.replace(/^\/queue\/assets/, "/assets"),
			},
			"/queue/node_modules/": {
				target: "http://localhost:3002",
				changeOrigin: true,
				rewrite: (path) =>
					path.replace(/^\/queue\/node_modules/, "/node_modules"),
			},
			"/queue-api/": {
				target: "http://localhost:3002",
				changeOrigin: true,
				rewrite: (path) => path.replace(/^\/queue-api/, "/api"),
			},
			"/queue-socket.io/": {
				target: "http://localhost:3002",
				ws: true,
				changeOrigin: true,
				rewrite: (path) => path.replace(/^\/queue-socket.io/, "/socket.io"),
			},
			"/api/booking": {
				target: "http://localhost:4008",
				changeOrigin: true,
			},
			"/booking": {
				target: "http://localhost:3003",
				changeOrigin: true,
				rewrite: (path) => path.replace(/^\/booking/, ""),
			},
			"/api/erp": {
				target: "http://localhost:4010",
				changeOrigin: true,
			},
			"/api/label-merger": {
				target: "http://localhost:4013",
				changeOrigin: true,
			},
			"/erp": {
				target: "http://localhost:4010",
				changeOrigin: true,
				rewrite: (path) => path.replace(/^\/erp/, ""),
			},
			"/@hmr": {
				target: "http://localhost:3002",
				changeOrigin: true,
			},
			"/@react-refresh": {
				target: "http://localhost:3002",
				changeOrigin: true,
			},
		},
	},
});

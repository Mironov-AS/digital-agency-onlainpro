import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
	plugins: [
		react(),
		{
			name: "rewrite-middleware",
			configureServer(server) {
				server.middlewares.use((req, _res, next) => {
					const rewrites = {
						"/product/queue": "/product-queue.html",
						"/product/crm-light": "/product-crm-light.html",
						"/product/booking": "/product-booking.html",
						"/product/erp-light": "/product-erp-light.html",
						"/product/store-management": "/product-store.html",
						"/product/furniture-photo-sorter":
							"/product-furniture-photo-sorter.html",
						"/product/ozon-labels": "/product-ozon-labels.html",
						"/about": "/about.html",
						"/cases": "/cases.html",
					};
					if (rewrites[req.url]) {
						req.url = rewrites[req.url];
					}
					next();
				});
			},
			configurePreviewServer(server) {
				server.middlewares.use((req, _res, next) => {
					const rewrites = {
						"/product/queue": "/product-queue.html",
						"/product/crm-light": "/product-crm-light.html",
						"/product/booking": "/product-booking.html",
						"/product/erp-light": "/product-erp-light.html",
						"/product/store-management": "/product-store.html",
						"/product/furniture-photo-sorter":
							"/product-furniture-photo-sorter.html",
						"/product/ozon-labels": "/product-ozon-labels.html",
						"/about": "/about.html",
						"/cases": "/cases.html",
					};
					if (rewrites[req.url]) {
						req.url = rewrites[req.url];
					}
					next();
				});
			},
		},
	],
	cacheDir: "node_modules/.vite",
	build: {
		rollupOptions: {
			input: {
				main: path.resolve(__dirname, "index.html"),
				"product-queue": path.resolve(__dirname, "product-queue.html"),
				"product-crm-light": path.resolve(__dirname, "product-crm-light.html"),
				"product-booking": path.resolve(__dirname, "product-booking.html"),
				"product-erp-light": path.resolve(__dirname, "product-erp-light.html"),
				"product-store": path.resolve(__dirname, "product-store.html"),
				"product-furniture-photo-sorter": path.resolve(
					__dirname,
					"product-furniture-photo-sorter.html",
				),
				"product-ozon-labels": path.resolve(
					__dirname,
					"product-ozon-labels.html",
				),
				about: path.resolve(__dirname, "about.html"),
				cases: path.resolve(__dirname, "cases.html"),
			},
		},
	},
	server: {
		host: "0.0.0.0",
		port: 5173,
		proxy: {
			"/api/catalog": {
				target: "http://localhost:3001",
				changeOrigin: true,
				rewrite: (path) => path,
			},
			"/api/product-shelf": {
				target: "http://5.129.252.107:3000",
				changeOrigin: true,
			},
			"/api/admin": {
				target: "http://5.129.252.107:3000",
				changeOrigin: true,
			},
			"/api/clients": {
				target: "http://5.129.252.107:3000",
				changeOrigin: true,
			},
			"/api/products": {
				target: "http://5.129.252.107:3000",
				changeOrigin: true,
			},
			"/api/auth": { target: "http://5.129.252.107:3000", changeOrigin: true },
			"/api/furniture-sorter": {
				target: "http://5.129.252.107:3000",
				changeOrigin: true,
			},
			"/api/label-merger": {
				target: "http://5.129.252.107:3000",
				changeOrigin: true,
			},
			"/api/booking": {
				target: "http://5.129.252.107:3000",
				changeOrigin: true,
			},
			"/api/crm": {
				target: "http://5.129.252.107:3000",
				changeOrigin: true,
			},
			"/api/erp": {
				target: "http://5.129.252.107:3000",
				changeOrigin: true,
			},
			"/api/store": {
				target: "http://5.129.252.107:3000",
				changeOrigin: true,
			},
			"/client-portal": {
				target: "http://5.129.252.107:5202",
				changeOrigin: true,
			},
		},
	},
});

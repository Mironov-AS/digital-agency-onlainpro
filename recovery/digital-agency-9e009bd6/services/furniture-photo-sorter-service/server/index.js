require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const express = require("express");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const archiver = require("archiver");
const { initDb, db } = require("./database");
const { requireSubscription } = require("./middleware/requireSubscription");

const app = express();
const UPLOADS_DIR = path.join(__dirname, "uploads");
const RESULTS_DIR = path.join(__dirname, "results");

// Ensure directories exist
[UPLOADS_DIR, RESULTS_DIR].forEach((dir) => {
	if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const corsOrigin = process.env.CORS_ORIGIN || "*";
app.set("trust proxy", 1);
app.use("/api/furniture-sorter/files/preview", express.static(UPLOADS_DIR));
app.use(require("cors")({ origin: corsOrigin, credentials: true }));
app.use(express.json({ limit: "100kb" }));

app.use((req, res, next) => {
	res.setHeader("X-Content-Type-Options", "nosniff");
	res.setHeader("X-Frame-Options", "SAMEORIGIN");
	if (process.env.NODE_ENV === "production") {
		res.setHeader(
			"Strict-Transport-Security",
			"max-age=31536000; includeSubDomains",
		);
	}
	next();
});

app.get("/health", (req, res) =>
	res.json({ status: "ok", service: "furniture-photo-sorter-service" }),
);

// ===== VIEW TYPES =====
app.get("/api/furniture-sorter/view-types", async (req, res, next) => {
	try {
		const row = await db
			.prepare(
				"SELECT value FROM settings WHERE key = 'view_types' AND client_id = ''",
			)
			.get();
		const viewTypes = row ? JSON.parse(row.value) : [];
		res.json(viewTypes);
	} catch (err) {
		next(err);
	}
});

// ===== TEMPLATES =====
app.get(
	"/api/furniture-sorter/templates",
	requireSubscription,
	async (req, res, next) => {
		try {
			const clientId = req.clientId || req.user?.clientId || "";
			const rows = await db
				.prepare(
					"SELECT * FROM templates WHERE client_id = ? OR is_default = TRUE ORDER BY created_at DESC",
				)
				.all(clientId);
			res.json(
				rows.map((r) => ({
					id: r.id,
					name: r.name,
					viewTypes: JSON.parse(r.view_types || "[]"),
					settings: JSON.parse(r.settings || "{}"),
					isDefault: r.is_default,
					createdAt: r.created_at,
				})),
			);
		} catch (err) {
			next(err);
		}
	},
);

app.post(
	"/api/furniture-sorter/templates",
	requireSubscription,
	async (req, res, next) => {
		try {
			const { name, viewTypes, settings } = req.body;
			if (!name) return res.status(400).json({ error: "name required" });
			const clientId = req.clientId || req.user?.clientId || "";
			const id = uuidv4();
			await db
				.prepare(
					"INSERT INTO templates (id, client_id, name, view_types, settings) VALUES (?, ?, ?, ?, ?)",
				)
				.run(
					id,
					clientId,
					name,
					JSON.stringify(viewTypes || []),
					JSON.stringify(settings || {}),
				);
			const row = await db
				.prepare("SELECT * FROM templates WHERE id = ?")
				.get(id);
			res.status(201).json({
				id: row.id,
				name: row.name,
				viewTypes: JSON.parse(row.view_types || "[]"),
				settings: JSON.parse(row.settings || "{}"),
				isDefault: row.is_default,
				createdAt: row.created_at,
			});
		} catch (err) {
			next(err);
		}
	},
);

app.put(
	"/api/furniture-sorter/templates/:id",
	requireSubscription,
	async (req, res, next) => {
		try {
			const clientId = req.clientId || req.user?.clientId || "";
			const exists = await db
				.prepare("SELECT id FROM templates WHERE id = ? AND client_id = ?")
				.get(req.params.id, clientId);
			if (!exists) return res.status(404).json({ error: "Template not found" });
			const { name, viewTypes, settings } = req.body;
			const updates = {};
			if (name !== undefined) updates.name = name;
			if (viewTypes !== undefined)
				updates.view_types = JSON.stringify(viewTypes);
			if (settings !== undefined) updates.settings = JSON.stringify(settings);
			if (Object.keys(updates).length === 0)
				return res.status(400).json({ error: "Nothing to update" });
			const keys = Object.keys(updates);
			const sets = keys.map((k, i) => `${k} = $${i + 1}`).join(", ");
			await db.pool.query(
				`UPDATE templates SET ${sets} WHERE id = $${keys.length + 1}`,
				[...Object.values(updates), req.params.id],
			);
			const row = await db
				.prepare("SELECT * FROM templates WHERE id = ?")
				.get(req.params.id);
			res.json({
				id: row.id,
				name: row.name,
				viewTypes: JSON.parse(row.view_types || "[]"),
				settings: JSON.parse(row.settings || "{}"),
				isDefault: row.is_default,
				createdAt: row.created_at,
			});
		} catch (err) {
			next(err);
		}
	},
);

app.delete(
	"/api/furniture-sorter/templates/:id",
	requireSubscription,
	async (req, res, next) => {
		try {
			const clientId = req.clientId || req.user?.clientId || "";
			const r = await db
				.prepare("DELETE FROM templates WHERE id = ? AND client_id = ?")
				.run(req.params.id, clientId);
			if (r.changes === 0)
				return res.status(404).json({ error: "Template not found" });
			res.json({ success: true });
		} catch (err) {
			next(err);
		}
	},
);

// ===== SESSIONS =====
app.post(
	"/api/furniture-sorter/session",
	requireSubscription,
	async (req, res, next) => {
		try {
			const { viewTypes, article, includeArticle, includeViewType, separator } =
				req.body;
			const clientId = req.clientId || req.user?.clientId || "";
			const userId = req.user?.id || req.user?.userId || "";
			const id = uuidv4();
			const settings = {
				viewTypes: viewTypes || [],
				article: article || "",
				includeArticle: includeArticle !== false,
				includeViewType: includeViewType !== false,
				separator: separator || "_",
			};
			const now = new Date();
			const expires = new Date(now.getTime() + 24 * 60 * 60 * 1000);
			await db
				.prepare(
					"INSERT INTO sessions (id, client_id, user_id, settings, expires_at) VALUES (?, ?, ?, ?, ?)",
				)
				.run(
					id,
					clientId,
					userId,
					JSON.stringify(settings),
					expires.toISOString(),
				);

			// Create upload directory
			fs.mkdirSync(path.join(UPLOADS_DIR, id), { recursive: true });

			res
				.status(201)
				.json({
					id,
					settings,
					files: [],
					classifications: [],
					createdAt: now.toISOString(),
					expiresAt: expires.toISOString(),
				});
		} catch (err) {
			next(err);
		}
	},
);

app.get(
	"/api/furniture-sorter/session/:id",
	requireSubscription,
	async (req, res, next) => {
		try {
			const clientId = req.clientId || req.user?.clientId || "";
			const row = await db
				.prepare("SELECT * FROM sessions WHERE id = ? AND client_id = ?")
				.get(req.params.id, clientId);
			if (!row) return res.status(404).json({ error: "Session not found" });
			res.json({
				id: row.id,
				settings: JSON.parse(row.settings || "{}"),
				files: JSON.parse(row.files || "[]"),
				classifications: JSON.parse(row.classifications || "[]"),
				isClassifying: row.is_classifying,
				isProcessing: row.is_processing,
				createdAt: row.created_at,
				expiresAt: row.expires_at,
			});
		} catch (err) {
			next(err);
		}
	},
);

app.put(
	"/api/furniture-sorter/settings/:id",
	requireSubscription,
	async (req, res, next) => {
		try {
			const clientId = req.clientId || req.user?.clientId || "";
			const exists = await db
				.prepare("SELECT id FROM sessions WHERE id = ? AND client_id = ?")
				.get(req.params.id, clientId);
			if (!exists) return res.status(404).json({ error: "Session not found" });
			await db
				.prepare("UPDATE sessions SET settings = ? WHERE id = ?")
				.run(JSON.stringify(req.body), req.params.id);
			res.json({ success: true });
		} catch (err) {
			next(err);
		}
	},
);

// ===== FILE UPLOAD =====
const upload = multer({
	storage: multer.memoryStorage(),
	limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
	fileFilter: (req, file, cb) => {
		const allowed = ["image/jpeg", "image/png", "image/webp"];
		const ext = path.extname(file.originalname).toLowerCase();
		const validExt = [".jpg", ".jpeg", ".png", ".webp"];
		if (allowed.includes(file.mimetype) && validExt.includes(ext)) {
			cb(null, true);
		} else {
			cb(new Error("Only JPG, PNG, WEBP images allowed"));
		}
	},
});

app.post(
	"/api/furniture-sorter/upload/:sessionId",
	requireSubscription,
	upload.array("files", 50),
	async (req, res, next) => {
		try {
			const clientId = req.clientId || req.user?.clientId || "";
			const sessionRow = await db
				.prepare("SELECT files FROM sessions WHERE id = ? AND client_id = ?")
				.get(req.params.sessionId, clientId);
			if (!sessionRow)
				return res.status(404).json({ error: "Session not found" });

			const sessionFiles = JSON.parse(sessionRow.files || "[]");
			const uploaded = [];
			const errors = [];

			for (const file of req.files || []) {
				const fileId = uuidv4();
				const ext = path.extname(file.originalname).toLowerCase();
				const newFilename = `${fileId}${ext}`;
				const filePath = path.join(
					UPLOADS_DIR,
					req.params.sessionId,
					newFilename,
				);
				fs.writeFileSync(filePath, file.buffer);

				uploaded.push({
					id: fileId,
					filename: newFilename,
					originalName: file.originalname,
					size: file.size,
					uploadedAt: new Date().toISOString(),
					previewUrl: `/api/furniture-sorter/files/preview/${req.params.sessionId}/${newFilename}`,
					viewType: req.body.default_view_type || "",
					order: 0,
				});
			}

			sessionFiles.push(...uploaded);
			await db
				.prepare("UPDATE sessions SET files = ? WHERE id = ?")
				.run(JSON.stringify(sessionFiles), req.params.sessionId);

			res.json({ uploaded, errors, total: sessionFiles.length });
		} catch (err) {
			next(err);
		}
	},
);

app.get(
	"/api/furniture-sorter/files/:sessionId",
	requireSubscription,
	async (req, res, next) => {
		try {
			const clientId = req.clientId || req.user?.clientId || "";
			const row = await db
				.prepare(
					"SELECT files, classifications FROM sessions WHERE id = ? AND client_id = ?",
				)
				.get(req.params.sessionId, clientId);
			if (!row) return res.status(404).json({ error: "Session not found" });
			res.json({
				files: JSON.parse(row.files || "[]"),
				classifications: JSON.parse(row.classifications || "[]"),
			});
		} catch (err) {
			next(err);
		}
	},
);

app.delete(
	"/api/furniture-sorter/upload/:sessionId/:fileId",
	requireSubscription,
	async (req, res, next) => {
		try {
			const clientId = req.clientId || req.user?.clientId || "";
			const row = await db
				.prepare("SELECT files FROM sessions WHERE id = ? AND client_id = ?")
				.get(req.params.sessionId, clientId);
			if (!row) return res.status(404).json({ error: "Session not found" });

			let files = JSON.parse(row.files || "[]");
			const fileToDelete = files.find((f) => f.id === req.params.fileId);
			if (fileToDelete) {
				const filePath = path.join(
					UPLOADS_DIR,
					req.params.sessionId,
					fileToDelete.filename,
				);
				if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
			}

			files = files.filter((f) => f.id !== req.params.fileId);
			await db
				.prepare("UPDATE sessions SET files = ? WHERE id = ?")
				.run(JSON.stringify(files), req.params.sessionId);
			res.json({ success: true });
		} catch (err) {
			next(err);
		}
	},
);

app.put(
	"/api/furniture-sorter/files/:sessionId/:fileId",
	requireSubscription,
	async (req, res, next) => {
		try {
			const clientId = req.clientId || req.user?.clientId || "";
			const row = await db
				.prepare("SELECT files FROM sessions WHERE id = ? AND client_id = ?")
				.get(req.params.sessionId, clientId);
			if (!row) return res.status(404).json({ error: "Session not found" });

			const files = JSON.parse(row.files || "[]");
			const { view_type, order } = req.body;
			for (const file of files) {
				if (file.id === req.params.fileId) {
					if (view_type !== undefined) file.viewType = view_type;
					if (order !== undefined) file.order = order;
					break;
				}
			}
			await db
				.prepare("UPDATE sessions SET files = ? WHERE id = ?")
				.run(JSON.stringify(files), req.params.sessionId);
			res.json({ success: true });
		} catch (err) {
			next(err);
		}
	},
);

// Serve preview files
app.get(
	"/api/furniture-sorter/files/preview/:sessionId/:filename",
	(req, res, next) => {
		try {
			const filePath = path.join(
				UPLOADS_DIR,
				req.params.sessionId,
				req.params.filename,
			);
			if (!fs.existsSync(filePath))
				return res.status(404).json({ error: "File not found" });
			const ext = path.extname(filePath).toLowerCase();
			const mimeTypes = {
				".jpg": "image/jpeg",
				".jpeg": "image/jpeg",
				".png": "image/png",
				".webp": "image/webp",
			};
			res.setHeader(
				"Content-Type",
				mimeTypes[ext] || "application/octet-stream",
			);
			res.sendFile(filePath);
		} catch (err) {
			next(err);
		}
	},
);

// ===== CLASSIFICATION (simplified — manual only) =====
app.get(
	"/api/furniture-sorter/classify/status/:sessionId",
	requireSubscription,
	async (req, res, next) => {
		try {
			const clientId = req.clientId || req.user?.clientId || "";
			const row = await db
				.prepare(
					"SELECT files, classifications, is_classifying FROM sessions WHERE id = ? AND client_id = ?",
				)
				.get(req.params.sessionId, clientId);
			if (!row) return res.status(404).json({ error: "Session not found" });
			const files = JSON.parse(row.files || "[]");
			const classifications = JSON.parse(row.classifications || "[]");
			res.json({
				isClassifying: row.is_classifying,
				results: classifications,
				total: files.length,
				classified: classifications.filter((c) => c.confidence > 0).length,
			});
		} catch (err) {
			next(err);
		}
	},
);

app.put(
	"/api/furniture-sorter/classify/:sessionId/:fileId",
	requireSubscription,
	async (req, res, next) => {
		try {
			const clientId = req.clientId || req.user?.clientId || "";
			const row = await db
				.prepare(
					"SELECT classifications FROM sessions WHERE id = ? AND client_id = ?",
				)
				.get(req.params.sessionId, clientId);
			if (!row) return res.status(404).json({ error: "Session not found" });

			const classifications = JSON.parse(row.classifications || "[]");
			const { view_type } = req.body;
			const idx = classifications.findIndex(
				(c) => c.fileId === req.params.fileId,
			);
			const newClass = {
				fileId: req.params.fileId,
				viewType: view_type || "Неопределённая",
				confidence: 100,
				needsReview: false,
				reasoning: "Скорректировано вручную",
			};
			if (idx >= 0) classifications[idx] = newClass;
			else classifications.push(newClass);

			await db
				.prepare("UPDATE sessions SET classifications = ? WHERE id = ?")
				.run(JSON.stringify(classifications), req.params.sessionId);
			res.json({ success: true, classification: newClass });
		} catch (err) {
			next(err);
		}
	},
);

app.put(
	"/api/furniture-sorter/classify/batch/:sessionId",
	requireSubscription,
	async (req, res, next) => {
		try {
			const clientId = req.clientId || req.user?.clientId || "";
			const row = await db
				.prepare(
					"SELECT classifications FROM sessions WHERE id = ? AND client_id = ?",
				)
				.get(req.params.sessionId, clientId);
			if (!row) return res.status(404).json({ error: "Session not found" });

			const classifications = JSON.parse(row.classifications || "[]");
			const { file_ids, view_type } = req.body;
			let updated = 0;
			for (const fileId of file_ids || []) {
				const idx = classifications.findIndex((c) => c.fileId === fileId);
				const newClass = {
					fileId,
					viewType: view_type || "Неопределённая",
					confidence: 100,
					needsReview: false,
					reasoning: "Скорректировано вручную",
				};
				if (idx >= 0) classifications[idx] = newClass;
				else classifications.push(newClass);
				updated++;
			}
			await db
				.prepare("UPDATE sessions SET classifications = ? WHERE id = ?")
				.run(JSON.stringify(classifications), req.params.sessionId);
			res.json({ success: true, updatedCount: updated });
		} catch (err) {
			next(err);
		}
	},
);

// ===== PROCESS / EXPORT =====
app.post(
	"/api/furniture-sorter/process/:sessionId",
	requireSubscription,
	async (req, res, next) => {
		try {
			const clientId = req.clientId || req.user?.clientId || "";
			const row = await db
				.prepare("SELECT * FROM sessions WHERE id = ? AND client_id = ?")
				.get(req.params.sessionId, clientId);
			if (!row) return res.status(404).json({ error: "Session not found" });

			const files = JSON.parse(row.files || "[]");
			const classifications = JSON.parse(row.classifications || "[]");
			const settings = JSON.parse(row.settings || "{}");

			if (!files.length)
				return res.status(400).json({ error: "Нет файлов для обработки" });

			// Build file mapping
			const viewTypes = settings.viewTypes || [];
			const grouped = {};
			for (const file of files) {
				const cls = classifications.find((c) => c.fileId === file.id);
				const vt = cls ? cls.viewType : file.viewType || "Без типа";
				if (!grouped[vt]) grouped[vt] = [];
				grouped[vt].push(file);
			}

			// Sort view types by order
			const sortedViewTypes = [...viewTypes].sort(
				(a, b) => (a.order || 0) - (b.order || 0),
			);
			const result = [];
			let counter = 0;

			for (const vt of sortedViewTypes) {
				const groupFiles = grouped[vt.name] || [];
				for (const file of groupFiles) {
					counter++;
					const ext = path.extname(file.originalName).toLowerCase();
					const parts = [];
					if (settings.article && settings.includeArticle !== false)
						parts.push(settings.article);
					parts.push(String(counter).padStart(2, "0"));
					if (settings.includeViewType !== false && vt.name) {
						const clean = vt.name
							.replace(/[()]/g, "")
							.trim()
							.replace(/\s+/g, settings.separator || "_");
						if (clean) parts.push(clean);
					}
					const newName = parts.join(settings.separator || "_") + ext;
					result.push({
						fileId: file.id,
						oldName: file.filename,
						newName,
						viewType: vt.name,
						sortOrder: counter,
					});
				}
			}

			// Add unclassified files at the end
			for (const file of files) {
				if (!result.find((r) => r.fileId === file.id)) {
					counter++;
					const ext = path.extname(file.originalName).toLowerCase();
					const parts = [];
					if (settings.article && settings.includeArticle !== false)
						parts.push(settings.article);
					parts.push(String(counter).padStart(2, "0"));
					const newName = parts.join(settings.separator || "_") + ext;
					result.push({
						fileId: file.id,
						oldName: file.filename,
						newName,
						viewType: "Без типа",
						sortOrder: counter,
					});
				}
			}

			// Create ZIP
			const zipPath = path.join(RESULTS_DIR, `${req.params.sessionId}.zip`);
			const output = fs.createWriteStream(zipPath);
			const archive = archiver("zip", { zlib: { level: 9 } });

			await new Promise((resolve, reject) => {
				output.on("close", resolve);
				archive.on("error", reject);
				archive.on("warning", (err) => {
					if (err.code !== "ENOENT") reject(err);
				});
				archive.pipe(output);

				for (const mapping of result) {
					const filePath = path.join(
						UPLOADS_DIR,
						req.params.sessionId,
						mapping.oldName,
					);
					if (fs.existsSync(filePath)) {
						archive.file(filePath, { name: mapping.newName });
					}
				}

				archive.finalize();
			});

			res.json({
				sessionId: req.params.sessionId,
				status: "completed",
				zipPath: `/api/furniture-sorter/download/${req.params.sessionId}`,
			});
		} catch (err) {
			next(err);
		}
	},
);

app.get(
	"/api/furniture-sorter/download/:sessionId",
	requireSubscription,
	async (req, res, next) => {
		try {
			const clientId = req.clientId || req.user?.clientId || "";
			const row = await db
				.prepare("SELECT id FROM sessions WHERE id = ? AND client_id = ?")
				.get(req.params.sessionId, clientId);
			if (!row) return res.status(404).json({ error: "Session not found" });

			const zipPath = path.join(RESULTS_DIR, `${req.params.sessionId}.zip`);
			if (!fs.existsSync(zipPath))
				return res.status(404).json({ error: "Архив не найден" });

			res.setHeader("Content-Type", "application/zip");
			res.setHeader(
				"Content-Disposition",
				`attachment; filename="furniture-photos-${req.params.sessionId.slice(0, 8)}.zip"`,
			);
			res.sendFile(zipPath);
		} catch (err) {
			next(err);
		}
	},
);

// ===== CLEANUP =====
app.post("/api/furniture-sorter/cleanup", async (req, res, next) => {
	try {
		const now = new Date().toISOString();
		const expired = await db
			.prepare("SELECT id FROM sessions WHERE expires_at < ?")
			.all(now);
		let cleaned = 0;
		for (const { id } of expired) {
			const uploadDir = path.join(UPLOADS_DIR, id);
			if (fs.existsSync(uploadDir))
				fs.rmSync(uploadDir, { recursive: true, force: true });
			const zipPath = path.join(RESULTS_DIR, `${id}.zip`);
			if (fs.existsSync(zipPath)) fs.unlinkSync(zipPath);
			await db.prepare("DELETE FROM sessions WHERE id = ?").run(id);
			cleaned++;
		}
		res.json({ cleaned });
	} catch (err) {
		next(err);
	}
});

// Error handler
app.use((err, _req, res, _next) => {
	console.error("[furniture-photo-sorter]", err);
	const status = err.status || err.statusCode || 500;
	res
		.status(status)
		.json({ error: status < 500 ? err.message : "Internal server error" });
});

const PORT = process.env.PORT || 4011;

initDb()
	.then(() => {
		app.listen(PORT, "0.0.0.0", () => {
			console.log(`✅ furniture-photo-sorter-service running on port ${PORT}`);
		});
	})
	.catch((err) => {
		console.error("[furniture-photo-sorter] Failed to init DB:", err);
		process.exit(1);
	});

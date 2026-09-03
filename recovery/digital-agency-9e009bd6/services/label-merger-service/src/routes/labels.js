const router = require("express").Router();
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const { db } = require("../db");
const { requireSubscription } = require("../middleware/requireSubscription");
const { mergeLabels } = require("../lib/labelMerger");

const UPLOADS_DIR = path.join(__dirname, "../../uploads");
const RESULTS_DIR = path.join(__dirname, "../../results");

[UPLOADS_DIR, RESULTS_DIR].forEach((dir) => {
	if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

const upload = multer({
	storage: multer.diskStorage({
		destination: UPLOADS_DIR,
		filename: (_req, file, cb) => {
			const id = uuidv4();
			const ext = path.extname(file.originalname).toLowerCase() || ".pdf";
			cb(null, `${id}${ext}`);
		},
	}),
	limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB
	fileFilter: (_req, file, cb) => {
		const ext = path.extname(file.originalname || "").toLowerCase();
		if (ext === ".pdf") cb(null, true);
		else cb(new Error("Only PDF files allowed"));
	},
});

// POST /api/label-merger/process
router.post(
	"/process",
	requireSubscription,
	upload.fields([
		{ name: "assembly_pdf", maxCount: 1 },
		{ name: "tickets_pdf", maxCount: 1 },
	]),
	async (req, res, next) => {
		try {
			const clientId = req.clientId || req.user?.clientId || "";
			const userId = req.user?.id || req.user?.userId || "";
			const assemblyFile = req.files?.assembly_pdf?.[0];
			const ticketsFile = req.files?.tickets_pdf?.[0];

			if (!assemblyFile || !ticketsFile) {
				return res
					.status(400)
					.json({ error: "Необходимо загрузить лист подбора и этикетки" });
			}

			const { parseAssemblyList, matchTickets } = require("../lib/labelMerger");
			let assemblyItems;
			let matches;
			let outputBuffer;

			try {
				// Парсим PDF только один раз
				assemblyItems = await parseAssemblyList(assemblyFile.path);
				matches = await matchTickets(ticketsFile.path, assemblyItems);

				// Передаём буфер этикеток и уже готовые matches (без повторного парсинга)
				const ticketsBuffer = fs.readFileSync(ticketsFile.path);
				outputBuffer = await mergeLabels(ticketsBuffer, matches);
			} finally {
				// Удаляем временные загруженные файлы
				try { if (assemblyFile?.path) fs.unlinkSync(assemblyFile.path); } catch {}
				try { if (ticketsFile?.path) fs.unlinkSync(ticketsFile.path); } catch {}
			}

			if (!outputBuffer) {
				throw new Error("Не удалось сформировать PDF с этикетками");
			}

			const jobId = uuidv4();
			const outputName = `${path.basename(
				ticketsFile.originalname,
				".pdf",
			)}_merged.pdf`;
			const outputPath = path.join(RESULTS_DIR, `${jobId}.pdf`);
			fs.writeFileSync(outputPath, outputBuffer);

			const itemCount = assemblyItems.length;
			const matchedCount = matches.filter((m) => m.matched).length;

			await db
				.prepare(
					`INSERT INTO jobs (id, client_id, user_id, status, assembly_name, tickets_name, output_name, item_count, matched_count, error_message, expires_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW() + INTERVAL '24 hours')`,
				)
				.run(
					jobId,
					clientId,
					userId,
					"completed",
					assemblyFile.originalname,
					ticketsFile.originalname,
					outputName,
					itemCount,
					matchedCount,
					"",
				);

			res.json({
				id: jobId,
				status: "completed",
				itemCount,
				matchedCount,
				downloadUrl: `/api/label-merger/jobs/${jobId}/download`,
			});
		} catch (err) {
			if (err.status < 500) {
				console.log("[label-merger/process] User input error:", err.message);
			} else {
				console.error("[label-merger/process] Error:", err.message, err.stack);
			}
			if (!res.headersSent) {
				next(err);
			}
		}
	},
);

// GET /api/label-merger/jobs
router.get("/jobs", requireSubscription, async (req, res, next) => {
	try {
		const clientId = req.clientId || req.user?.clientId || "";
		const jobs = await db
			.prepare(
				`SELECT id, status, assembly_name, tickets_name, output_name, item_count, matched_count, error_message, created_at, expires_at
         FROM jobs
         WHERE client_id = ?
         ORDER BY created_at DESC`,
			)
			.all(clientId);
		res.json(jobs);
	} catch (err) {
		next(err);
	}
});

// GET /api/label-merger/jobs/:id/preview
router.get(
	"/jobs/:id/preview",
	requireSubscription,
	async (req, res, next) => {
		try {
			const clientId = req.clientId || req.user?.clientId || "";
			const job = await db
				.prepare("SELECT * FROM jobs WHERE id = ? AND client_id = ?")
				.get(req.params.id, clientId);
			if (!job) return res.status(404).json({ error: "Job not found" });

			const outputPath = path.join(RESULTS_DIR, `${job.id}.pdf`);
			if (!fs.existsSync(outputPath))
				return res.status(404).json({ error: "File not found" });

			res.setHeader("Content-Type", "application/pdf");
			res.setHeader(
				"Content-Disposition",
				`inline; filename="${job.output_name}"`,
			);
			fs.createReadStream(outputPath).pipe(res);
		} catch (err) {
			next(err);
		}
	},
);

// GET /api/label-merger/jobs/:id/download
router.get(
	"/jobs/:id/download",
	requireSubscription,
	async (req, res, next) => {
		try {
			const clientId = req.clientId || req.user?.clientId || "";
			const job = await db
				.prepare("SELECT * FROM jobs WHERE id = ? AND client_id = ?")
				.get(req.params.id, clientId);
			if (!job) return res.status(404).json({ error: "Job not found" });

			const outputPath = path.join(RESULTS_DIR, `${job.id}.pdf`);
			if (!fs.existsSync(outputPath))
				return res.status(404).json({ error: "File not found" });

			res.setHeader("Content-Type", "application/pdf");
			res.setHeader(
				"Content-Disposition",
				`attachment; filename="${job.output_name}"`,
			);
			fs.createReadStream(outputPath).pipe(res);
		} catch (err) {
			next(err);
		}
	},
);

// POST /api/label-merger/cleanup
router.post("/cleanup", requireSubscription, async (_req, res, next) => {
	try {
		const now = new Date().toISOString();
		const expired = await db
			.prepare("SELECT id FROM jobs WHERE expires_at < ?")
			.all(now);
		let cleaned = 0;
		for (const { id } of expired) {
			const outputPath = path.join(RESULTS_DIR, `${id}.pdf`);
			if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
			await db.prepare("DELETE FROM jobs WHERE id = ?").run(id);
			cleaned++;
		}
		res.json({ cleaned });
	} catch (err) {
		next(err);
	}
});

module.exports = router;

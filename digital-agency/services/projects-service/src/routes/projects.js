const router = require('express').Router();
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { db } = require('../db');
const { requireAdmin } = require('../middleware/auth');

router.use(requireAdmin);

const uploadDir = process.env.UPLOAD_DIR || path.join(__dirname, '../../uploads');
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, uuidv4() + path.extname(file.originalname)),
});
const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } });

// GET /api/projects
router.get('/', async (req, res, next) => {
  try {
    const { search, status, client_id } = req.query;
    let sql = 'SELECT * FROM projects';
    const where = [], params = [];
    let idx = 0;
    if (status) { idx++; where.push(`status = $${idx}`); params.push(status); }
    if (client_id) { idx++; where.push(`client_id = $${idx}`); params.push(client_id); }
    if (search) { idx++; const p1 = idx; idx++; const p2 = idx; where.push(`(title ILIKE $${p1} OR description ILIKE $${p2})`); const q = `%${search}%`; params.push(q, q); }
    if (where.length) sql += ' WHERE ' + where.join(' AND ');
    sql += ' ORDER BY created_at DESC';
    const { rows } = await db.pool.query(sql, params);
    res.json(rows);
  } catch (err) { next(err); }
});

// GET /api/projects/:id
router.get('/:id', async (req, res, next) => {
  try {
    const project = await db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id);
    if (!project) return res.status(404).json({ error: 'Not found' });
    const files = await db.prepare('SELECT * FROM project_files WHERE project_id = ? ORDER BY uploaded_at DESC').all(req.params.id);
    const links = await db.prepare('SELECT * FROM project_links WHERE project_id = ? ORDER BY created_at ASC').all(req.params.id);
    res.json({ ...project, files, links });
  } catch (err) { next(err); }
});

// POST /api/projects
router.post('/', async (req, res, next) => {
  try {
    const { title, client_id, client_name = '', service_id, service_name = '', prod_url = '', description = '', notes = '', status = 'active' } = req.body;
    if (!title) return res.status(400).json({ error: 'title required' });
    const id = uuidv4();
    await db.prepare(
      'INSERT INTO projects (id, title, client_id, client_name, service_id, service_name, prod_url, description, notes, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    ).run(id, title, client_id ?? null, client_name, service_id ?? null, service_name, prod_url, description, notes, status);
    const created = await db.prepare('SELECT * FROM projects WHERE id = ?').get(id);
    res.status(201).json(created);
  } catch (err) { next(err); }
});

// PUT /api/projects/:id
router.put('/:id', async (req, res, next) => {
  try {
    const exists = await db.prepare('SELECT id FROM projects WHERE id = ?').get(req.params.id);
    if (!exists) return res.status(404).json({ error: 'Not found' });
    const fields = ['title', 'client_id', 'client_name', 'service_id', 'service_name', 'prod_url', 'description', 'notes', 'status'];
    const updates = { updated_at: new Date().toISOString() };
    for (const f of fields) { if (req.body[f] !== undefined) updates[f] = req.body[f]; }
    const keys = Object.keys(updates);
    const values = Object.values(updates);
    const sets = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
    await db.pool.query(`UPDATE projects SET ${sets} WHERE id = $${keys.length + 1}`, [...values, req.params.id]);
    const updated = await db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id);
    res.json(updated);
  } catch (err) { next(err); }
});

// DELETE /api/projects/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const r = await db.prepare('DELETE FROM projects WHERE id = ?').run(req.params.id);
    if (r.changes === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ ok: true });
  } catch (err) { next(err); }
});

// POST /api/projects/:id/files
router.post('/:id/files', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'file required' });
    const project = await db.prepare('SELECT id FROM projects WHERE id = ?').get(req.params.id);
    if (!project) { fs.unlinkSync(req.file.path); return res.status(404).json({ error: 'Project not found' }); }
    const { file_type = 'other' } = req.body;
    const id = uuidv4();
    await db.prepare(
      'INSERT INTO project_files (id, project_id, filename, original_name, file_type, mime_type, size) VALUES (?, ?, ?, ?, ?, ?, ?)',
    ).run(id, req.params.id, req.file.filename, req.file.originalname, file_type, req.file.mimetype, req.file.size);
    const file = await db.prepare('SELECT * FROM project_files WHERE id = ?').get(id);
    res.status(201).json(file);
  } catch (err) { next(err); }
});

// DELETE /api/projects/:id/files/:fileId
router.delete('/:id/files/:fileId', async (req, res, next) => {
  try {
    const file = await db.prepare('SELECT * FROM project_files WHERE id = ? AND project_id = ?').get(req.params.fileId, req.params.id);
    if (!file) return res.status(404).json({ error: 'Not found' });
    try { fs.unlinkSync(path.join(uploadDir, file.filename)); } catch {}
    await db.prepare('DELETE FROM project_files WHERE id = ?').run(req.params.fileId);
    res.json({ ok: true });
  } catch (err) { next(err); }
});

// GET /api/projects/:id/files/:fileId/download
router.get('/:id/files/:fileId/download', async (req, res, next) => {
  try {
    const file = await db.prepare('SELECT * FROM project_files WHERE id = ? AND project_id = ?').get(req.params.fileId, req.params.id);
    if (!file) return res.status(404).json({ error: 'Not found' });
    res.download(path.join(uploadDir, file.filename), file.original_name);
  } catch (err) { next(err); }
});

// POST /api/projects/:id/links
router.post('/:id/links', async (req, res, next) => {
  try {
    const { label, url } = req.body;
    if (!label || !url) return res.status(400).json({ error: 'label and url required' });
    const id = uuidv4();
    await db.prepare('INSERT INTO project_links (id, project_id, label, url) VALUES (?, ?, ?, ?)').run(id, req.params.id, label, url);
    const link = await db.prepare('SELECT * FROM project_links WHERE id = ?').get(id);
    res.status(201).json(link);
  } catch (err) { next(err); }
});

// DELETE /api/projects/:id/links/:linkId
router.delete('/:id/links/:linkId', async (req, res, next) => {
  try {
    const { rowCount } = await db.pool.query('DELETE FROM project_links WHERE id = $1 AND project_id = $2', [req.params.linkId, req.params.id]);
    if (rowCount === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ ok: true });
  } catch (err) { next(err); }
});

module.exports = router;

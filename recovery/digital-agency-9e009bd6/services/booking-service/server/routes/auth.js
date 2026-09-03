const { Router } = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db } = require('../database');
const { getJwtSecret } = require('../config');
const { requireAuth } = require('../../../../shared/middleware/auth');
const { v4: uuid } = require('uuid');

const router = Router();

function sanitizeClientId(val) {
  if (!val || typeof val !== 'string') return null;
  const trimmed = val.trim();
  return /^[a-zA-Z0-9_-]{1,80}$/.test(trimmed) ? trimmed : null;
}

router.post('/login', async (req, res) => {
  try {
    const { username, password, client_id } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Логин и пароль обязательны' });

    const clientId = sanitizeClientId(client_id) || '';
    const user = await db.prepare(
      "SELECT * FROM users WHERE username = ? AND client_id = ? AND is_active = TRUE"
    ).get(username, clientId);

    if (!user) return res.status(401).json({ error: 'Неверный логин или пароль' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Неверный логин или пароль' });

    const secret = await getJwtSecret();
    const token = jwt.sign(
      { id: user.id, username: user.username, clientId: user.client_id, displayName: user.display_name },
      secret,
      { expiresIn: '24h' }
    );

    res.json({ token, user: { id: user.id, username: user.username, displayName: user.display_name, clientId: user.client_id } });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

router.post('/sso', async (req, res) => {
  try {
    const { token, client_id } = req.body;
    if (!token) return res.status(400).json({ error: 'Токен обязателен' });

    const clientId = sanitizeClientId(client_id) || '';
    if (!clientId) return res.status(400).json({ error: 'client_id обязателен' });

    const authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://localhost:4001';
    const meRes = await fetch(`${authServiceUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!meRes.ok) return res.status(401).json({ error: 'Недействительный токен авторизации' });

    const portalUser = await meRes.json();
    if (!portalUser?.id) return res.status(401).json({ error: 'Не удалось получить данные пользователя' });

    const portalUsername = portalUser.email || portalUser.name || `user_${portalUser.id.substring(0, 8)}`;

    let user = await db.prepare(
      "SELECT * FROM users WHERE client_id = ? AND username = ? AND is_active = TRUE"
    ).get(clientId, portalUsername);

    if (!user) {
      const id = uuid();
      const hash = await bcrypt.hash(uuid(), 10);
      const displayName = portalUser.name || portalUser.email || 'Пользователь';
      await db.prepare(
        "INSERT INTO users (id, client_id, username, password, display_name, role) VALUES (?, ?, ?, ?, ?, 'user')"
      ).run(id, clientId, portalUsername, hash, displayName);
      user = await db.prepare("SELECT * FROM users WHERE id = ?").get(id);
    }

    const secret = await getJwtSecret();
    const bookingToken = jwt.sign(
      { id: user.id, username: user.username, clientId: user.client_id, displayName: user.display_name },
      secret,
      { expiresIn: '24h' }
    );

    res.json({
      token: bookingToken,
      user: { id: user.id, username: user.username, displayName: user.display_name, clientId: user.client_id },
    });
  } catch (err) {
    console.error('[SSO] error:', err);
    res.status(500).json({ error: 'Ошибка SSO авторизации' });
  }
});

router.get('/me', requireAuth, async (req, res) => {
  try {
    const user = await db.prepare("SELECT id, username, display_name, client_id FROM users WHERE id = ?").get(req.user.id);
    if (!user) return res.status(404).json({ error: 'Пользователь не найден' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

module.exports = router;

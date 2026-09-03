const { Router } = require('express');
const jwt = require('jsonwebtoken');
const { db } = require('../database');
const { requireAuth } = require('../../../../shared/middleware/auth');

const router = Router();

router.post('/sso', async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ error: 'Токен обязателен' });

    const authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://localhost:4001';
    const meRes = await fetch(`${authServiceUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!meRes.ok) return res.status(401).json({ error: 'Недействительный токен авторизации' });

    const portalUser = await meRes.json();
    if (!portalUser?.id) return res.status(401).json({ error: 'Не удалось получить данные пользователя' });

    const secret = process.env.JWT_ACCESS_SECRET;
    const erpToken = jwt.sign(
      { id: portalUser.id, email: portalUser.email, name: portalUser.name, role: portalUser.role, clientId: portalUser.clientId || null },
      secret,
      { expiresIn: '24h' }
    );

    res.json({
      token: erpToken,
      user: { id: portalUser.id, email: portalUser.email, name: portalUser.name, role: portalUser.role, clientId: portalUser.clientId || null },
    });
  } catch (err) {
    console.error('[ERP SSO] error:', err);
    res.status(500).json({ error: 'Ошибка SSO авторизации' });
  }
});

router.get('/me', requireAuth, async (req, res) => {
  try {
    res.json({
      id: req.user.id,
      email: req.user.email,
      name: req.user.name,
      role: req.user.role,
      clientId: req.user.clientId || null,
    });
  } catch (err) {
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

module.exports = router;

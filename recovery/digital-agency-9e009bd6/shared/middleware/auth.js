/**
 * Shared Authentication Middleware
 * Централизованная аутентификация для всех микросервисов
 *
 * Использование:
 *   const { requireAuth, requireAdmin } = require('../../shared/middleware/auth')
 */

const jwt = require('jsonwebtoken');

const ROLES = {
  ADMIN: 'admin',
  CLIENT: 'client',
};

const AUTH_ERRORS = {
  NO_TOKEN: { status: 401, message: 'Unauthorized' },
  INVALID_TOKEN: { status: 401, message: 'Invalid token' },
  TOKEN_EXPIRED: { status: 401, message: 'Token expired' },
  FORBIDDEN: { status: 403, message: 'Forbidden' },
};

function getSecret() {
  const secret = process.env.JWT_ACCESS_SECRET;
  if (!secret) {
    throw new Error('JWT_ACCESS_SECRET environment variable is not set');
  }
  return secret;
}

function extractToken(req) {
  return req.headers.authorization?.startsWith('Bearer ')
    ? req.headers.authorization.slice(7)
    : req.cookies?.access_token || req.query?.auth_token || null;
}

function requireAuth(req, res, next) {
  const token = extractToken(req);
  if (!token) {
    return res.status(401).json({ error: AUTH_ERRORS.NO_TOKEN.message });
  }
  try {
    req.user = jwt.verify(token, getSecret());
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: AUTH_ERRORS.TOKEN_EXPIRED.message });
    }
    return res.status(401).json({ error: AUTH_ERRORS.INVALID_TOKEN.message });
  }
}

function requireAdmin(req, res, next) {
  requireAuth(req, res, () => {
    if (req.user.role !== ROLES.ADMIN) {
      return res.status(403).json({ error: AUTH_ERRORS.FORBIDDEN.message });
    }
    next();
  });
}

function requireClient(req, res, next) {
  requireAuth(req, res, () => {
    if (req.user.role !== ROLES.CLIENT && req.user.role !== ROLES.ADMIN) {
      return res.status(403).json({ error: AUTH_ERRORS.FORBIDDEN.message });
    }
    next();
  });
}

module.exports = { requireAuth, requireAdmin, requireClient, ROLES };

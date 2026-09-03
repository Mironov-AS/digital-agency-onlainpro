const { db } = require('../database');
const { v4: uuid } = require('uuid');

async function logAction({ clientId = '', userId = '', username = '', action, entityType = '', entityId = '', details = '' }) {
  try {
    await db.prepare(
      `INSERT INTO action_logs (client_id, user_id, username, action, entity_type, entity_id, details)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).run(clientId, userId, username, action, entityType, entityId, typeof details === 'object' ? JSON.stringify(details) : details);
  } catch (err) {
    console.error('Log action error:', err.message);
  }
}

module.exports = { logAction };

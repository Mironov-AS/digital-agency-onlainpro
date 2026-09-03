function cleanTenantId(value) {
  return String(value || '').trim();
}

function resolveStoreClientId(req) {
  const user = req?.user || {};
  if (user.role === 'admin') {
    return cleanTenantId(req?.query?.client_id || req?.body?.client_id || user.clientId || user.userId || user.id);
  }
  return cleanTenantId(user.clientId || user.userId || user.id);
}

function requireStoreClientId(req) {
  const clientId = resolveStoreClientId(req);
  if (!clientId) {
    const err = new Error('Не удалось определить клиента магазина');
    err.status = 403;
    throw err;
  }
  return clientId;
}

module.exports = { resolveStoreClientId, requireStoreClientId };

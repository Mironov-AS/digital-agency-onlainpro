const CRM_SERVICE_URL = process.env.CRM_SERVICE_URL || 'http://localhost:4009';
const WEBHOOK_TIMEOUT = 5000;

async function emitEvent(eventType, payload) {
  const url = `${CRM_SERVICE_URL}/api/crm/integration/booking/webhook`;
  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event: eventType, data: payload, timestamp: new Date().toISOString() }),
      signal: AbortSignal.timeout(WEBHOOK_TIMEOUT),
    });
  } catch (err) {
    console.error(`[booking] webhook ${eventType} failed:`, err.message);
  }
}

function emitAsync(eventType, payload) {
  setImmediate(() => emitEvent(eventType, payload));
}

module.exports = { emitAsync };

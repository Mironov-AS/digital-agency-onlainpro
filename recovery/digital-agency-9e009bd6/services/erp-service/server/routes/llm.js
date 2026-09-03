const express = require('express');
const https = require('https');
const http = require('http');
const { db } = require('../database');
const { requireAuth } = require('../../../../shared/middleware/auth');

const router = express.Router();
router.use(requireAuth);

// ─── Helpers ───────────────────────────────────────────────────────────────────

function maskKey(key) {
  if (!key || key.length < 8) return '••••••••';
  return key.slice(0, 4) + '••••••' + key.slice(-4);
}

function sanitizeProvider(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    providerType: row.provider_type,
    apiKeySet: !!row.api_key,
    apiKeyMasked: row.api_key ? maskKey(row.api_key) : null,
    baseUrl: row.base_url || null,
    model: row.model || null,
    temperature: row.temperature ?? 0.7,
    maxTokens: row.max_tokens ?? 4000,
    isActive: !!row.is_active,
    extraConfig: (() => { try { return JSON.parse(row.extra_config || '{}'); } catch { return {}; } })(),
  };
}

// Build the request options for calling an LLM provider
function buildLlmRequest(p, messages, { stream = false } = {}) {
  const type = p.provider_type || 'openai';
  const extra = (() => { try { return JSON.parse(p.extra_config || '{}'); } catch { return {}; } })();

  if (type === 'anthropic') {
    const url = new URL((p.base_url || 'https://api.anthropic.com').replace(/\/$/, ''));
    url.pathname = (url.pathname.replace(/\/$/, '')) + '/v1/messages';
    const body = JSON.stringify({
      model: p.model || 'claude-sonnet-4-6',
      max_tokens: p.max_tokens || 4000,
      temperature: p.temperature ?? 0.7,
      stream,
      messages: messages.map(m => ({ role: m.role, content: m.content })),
    });
    return {
      url: url.toString(),
      method: 'POST',
      headers: {
        'x-api-key': p.api_key,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
        ...extra.headers,
      },
      body,
    };
  }

  // openai-compatible (default)
  const url = new URL((p.base_url || 'https://api.openai.com/v1').replace(/\/$/, ''));
  url.pathname = (url.pathname.replace(/\/$/, '')) + '/chat/completions';
  const body = JSON.stringify({
    model: p.model || 'gpt-4o',
    messages: messages.map(m => ({ role: m.role, content: m.content })),
    max_tokens: p.max_tokens || 4000,
    temperature: p.temperature ?? 0.7,
    stream,
  });
  return {
    url: url.toString(),
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${p.api_key}`,
      'Content-Type': 'application/json',
      ...extra.headers,
    },
    body,
  };
}

// Execute an HTTPS request and return the full response body
function httpsRequest(opts) {
  return new Promise((resolve, reject) => {
    const url = new URL(opts.url);
    const transport = url.protocol === 'https:' ? https : http;
    const req = transport.request({
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname + url.search,
      method: opts.method || 'POST',
      timeout: 60000,
      headers: opts.headers,
    }, (res) => {
      let data = '';
      res.on('data', c => { data += c; });
      res.on('end', () => resolve({ status: res.statusCode, data }));
      res.on('error', reject);
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(new Error('Request timeout')); });
    if (opts.body) req.write(opts.body);
    req.end();
  });
}

// Execute an HTTPS request and return the response stream
function httpsRequestStream(opts) {
  return new Promise((resolve, reject) => {
    const url = new URL(opts.url);
    const transport = url.protocol === 'https:' ? https : http;
    const req = transport.request({
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname + url.search,
      method: opts.method || 'POST',
      timeout: 120000,
      headers: opts.headers,
    }, (res) => {
      resolve({ status: res.statusCode, stream: res });
      res.on('error', reject);
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(new Error('Request timeout')); });
    if (opts.body) req.write(opts.body);
    req.end();
  });
}

// Parse SSE chunks from a stream, extracting text tokens
function parseSSEStream(stream, providerType) {
  return {
    [Symbol.asyncIterator]() {
      let buffer = '';
      let done = false;
      return {
        async next() {
          if (done) return { done: true, value: null };
          while (!done) {
            const idx = buffer.indexOf('\n\n');
            if (idx === -1) {
              // Read more data
              const chunk = await new Promise((resolve, reject) => {
                const onData = (c) => { stream.removeListener('end', onEnd); stream.removeListener('error', onErr); resolve(c); };
                const onEnd = () => { stream.removeListener('data', onData); stream.removeListener('error', onErr); resolve(null); };
                const onErr = (e) => { stream.removeListener('data', onData); stream.removeListener('end', onEnd); reject(e); };
                stream.once('data', onData);
                stream.once('end', onEnd);
                stream.once('error', onErr);
              });
              if (chunk === null) { done = true; break; }
              buffer += chunk.toString();
              continue;
            }
            const part = buffer.slice(0, idx);
            buffer = buffer.slice(idx + 2);
            if (!part.startsWith('data: ')) continue;
            const raw = part.slice(6).trim();
            if (raw === '[DONE]') { done = true; break; }
            try {
              const json = JSON.parse(raw);
              let text = '';
              if (providerType === 'anthropic') {
                // Anthropic SSE: { type: "content_block_delta", delta: { type: "text_delta", text: "..." } }
                if (json.type === 'content_block_delta' && json.delta?.text) {
                  text = json.delta.text;
                }
              } else {
                // OpenAI-compatible: { choices: [{ delta: { content: "..." } }] }
                text = json.choices?.[0]?.delta?.content || '';
              }
              if (text) return { done: false, value: text };
            } catch { /* skip unparseable chunks */ }
          }
          return { done: true, value: null };
        },
      };
    },
  };
}

// ─── GET /llm-config ───────────────────────────────────────────────────────────

router.get('/llm-config', async (req, res) => {
  try {
    const rows = await db.all('SELECT * FROM llm_providers ORDER BY id');
    const providers = {};
    let activeProvider = null;
    for (const row of rows) {
      providers[row.id] = sanitizeProvider(row);
      if (row.is_active) activeProvider = row.id;
    }
    res.json({ activeProvider, providers });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── PUT /llm-config ───────────────────────────────────────────────────────────

router.put('/llm-config', async (req, res) => {
  try {
    const { activeProvider, provider } = req.body;

    // Set active provider
    if (activeProvider !== undefined) {
      await db.transaction(async (client) => {
        await client.run('UPDATE llm_providers SET is_active = 0');
        if (activeProvider) {
          await client.run('UPDATE llm_providers SET is_active = 1 WHERE id = $1', [activeProvider]);
        }
      });
    }

    // Create or update a provider
    if (provider) {
      const { id, name, providerType, apiKey, baseUrl, model, temperature, maxTokens, extraConfig } = provider;
      const extra = JSON.stringify(extraConfig || {});
      if (id) {
        // Update
        const sets = [];
        const params = [];
        let idx = 1;
        if (name !== undefined) { sets.push(`name = $${idx++}`); params.push(name); }
        if (providerType !== undefined) { sets.push(`provider_type = $${idx++}`); params.push(providerType); }
        if (apiKey !== undefined && apiKey !== '') { sets.push(`api_key = $${idx++}`); params.push(apiKey); }
        if (baseUrl !== undefined) { sets.push(`base_url = $${idx++}`); params.push(baseUrl || null); }
        if (model !== undefined) { sets.push(`model = $${idx++}`); params.push(model); }
        if (temperature !== undefined) { sets.push(`temperature = $${idx++}`); params.push(temperature); }
        if (maxTokens !== undefined) { sets.push(`max_tokens = $${idx++}`); params.push(maxTokens); }
        if (extraConfig !== undefined) { sets.push(`extra_config = $${idx++}`); params.push(extra); }
        if (sets.length > 0) {
          params.push(id);
          await db.run(`UPDATE llm_providers SET ${sets.join(', ')} WHERE id = $${idx}`, params);
        }
      } else {
        // Create
        await db.run(
          `INSERT INTO llm_providers (name, provider_type, api_key, base_url, model, temperature, max_tokens, extra_config)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [name || 'Новый провайдер', providerType || 'openai', apiKey || null, baseUrl || null,
           model || null, temperature ?? 0.7, maxTokens ?? 4000, extra]
        );
      }
    }

    // Re-read
    const rows = await db.all('SELECT * FROM llm_providers ORDER BY id');
    const providers = {};
    let active = null;
    for (const row of rows) {
      providers[row.id] = sanitizeProvider(row);
      if (row.is_active) active = row.id;
    }
    res.json({ activeProvider: active, providers });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── DELETE /llm-config/:id ────────────────────────────────────────────────────

router.delete('/llm-config/:id', async (req, res) => {
  try {
    await db.run('DELETE FROM llm_providers WHERE id = $1', [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── POST /llm-config/test/:id ─────────────────────────────────────────────────

router.post('/llm-config/test/:id', async (req, res) => {
  try {
    const row = await db.get('SELECT * FROM llm_providers WHERE id = $1', [req.params.id]);
    if (!row) return res.status(404).json({ ok: false, error: 'Провайдер не найден' });
    if (!row.api_key) return res.json({ ok: false, error: 'API ключ не задан' });

    const messages = [{ role: 'user', content: 'Reply with the word "pong" and nothing else.' }];
    const opts = buildLlmRequest(row, messages, { stream: false });

    const response = await httpsRequest(opts);
    if (response.status >= 400) {
      let errMsg = `HTTP ${response.status}`;
      try {
        const j = JSON.parse(response.data);
        errMsg = j.error?.message || j.error || errMsg;
      } catch {}
      return res.json({ ok: false, error: errMsg });
    }

    res.json({ ok: true });
  } catch (err) {
    res.json({ ok: false, error: err.message });
  }
});

// ─── GET /ai-chat/status ───────────────────────────────────────────────────────

router.get('/ai-chat/status', async (req, res) => {
  try {
    const row = await db.get('SELECT id, name, provider_type, model FROM llm_providers WHERE is_active = 1');
    if (!row) return res.json({ configured: false });
    res.json({
      configured: true,
      provider: row.name,
      providerType: row.provider_type,
      model: row.model,
    });
  } catch (err) {
    res.json({ configured: false });
  }
});

// ─── POST /ai-chat (SSE streaming) ─────────────────────────────────────────────

router.post('/ai-chat', async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message) return res.status(400).json({ error: 'message is required' });

    const provider = await db.get('SELECT * FROM llm_providers WHERE is_active = 1');
    if (!provider) return res.status(400).json({ error: 'LLM провайдер не настроен. Настройте его в Администрировании → ИИ-модели.' });
    if (!provider.api_key) return res.status(400).json({ error: 'API ключ не задан для активного провайдера.' });

    // Build system prompt with ERP context
    const systemPrompt = `Ты — ИИ-ассистент ERP-системы ContractPro/ERP Light. Ты помогаешь пользователю работать с системой: отвечаешь на вопросы о договорах, заказах, платежах, контрагентах, производстве, рекламациях. Отвечай на русском языке. Будь краток и точен. Если нужна дополнительная информация — попроси уточнить.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...(history || []).map(m => ({ role: m.role, content: m.content })),
      { role: 'user', content: message },
    ];

    // Anthropic doesn't support system role in messages array — handle separately
    let apiMessages;
    const extra = (() => { try { return JSON.parse(provider.extra_config || '{}'); } catch { return {}; } })();

    if (provider.provider_type === 'anthropic') {
      apiMessages = messages.filter(m => m.role !== 'system');
    } else {
      apiMessages = messages;
    }

    const opts = buildLlmRequest(provider, apiMessages, { stream: true });

    // Add system prompt for Anthropic at top level
    if (provider.provider_type === 'anthropic') {
      const body = JSON.parse(opts.body);
      body.system = systemPrompt;
      opts.body = JSON.stringify(body);
    }

    // Set SSE headers
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    });

    const response = await httpsRequestStream(opts);

    if (response.status >= 400) {
      let data = '';
      for await (const chunk of response.stream) data += chunk.toString();
      let errMsg = `LLM API error: HTTP ${response.status}`;
      try {
        const j = JSON.parse(data);
        errMsg = j.error?.message || j.error || errMsg;
      } catch {}
      res.write(`data: ${JSON.stringify({ error: errMsg })}\n\n`);
      res.write('data: [DONE]\n\n');
      res.end();
      return;
    }

    let fullText = '';
    for await (const text of parseSSEStream(response.stream, provider.provider_type)) {
      fullText += text;
      res.write(`data: ${JSON.stringify({ text })}\n\n`);
    }
    res.write('data: [DONE]\n\n');
    res.end();
  } catch (err) {
    console.error('[ai-chat]', err.message);
    try {
      res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
      res.write('data: [DONE]\n\n');
      res.end();
    } catch {}
  }
});

module.exports = router;

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const path = require('path');
const fs = require('fs');
const os = require('os');
const { execFile } = require('child_process');
const { promisify } = require('util');
const express = require('express');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');
const { createApp, startServer } = require('../../../shared/createApp');
const { requireAuth } = require('../../../shared/middleware/auth');
const { db, initDb } = require('./db');
const { requireStoreClientId } = require('./tenant');
const execFileAsync = promisify(execFile);

const app = createApp({ name: 'store-service' });
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 },
});

function json(value, fallback) {
  if (value === null || value === undefined) return fallback;
  if (typeof value !== 'string') return value;
  try { return JSON.parse(value); } catch { return fallback; }
}

function arr(value) {
  return Array.isArray(value) ? value : [];
}

function toNum(value) {
  if (typeof value === 'string') {
    const normalized = value.replace(/\s/g, '').replace(',', '.');
    const n = Number(normalized);
    return Number.isFinite(n) ? n : 0;
  }
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function cleanText(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function normalizeSku(value) {
  return cleanText(value).replace(/[^\p{L}\p{N}._/-]/gu, '').slice(0, 80);
}

function roundMoney(value) {
  return Math.round(toNum(value) * 100) / 100;
}

function normalizeDate(value) {
  const text = cleanText(value);
  const iso = text.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (iso) return text;
  const ru = text.match(/^(\d{2})[.\-/](\d{2})[.\-/](\d{4})$/);
  if (ru) return `${ru[3]}-${ru[2]}-${ru[1]}`;
  const monthNames = {
    января: '01', январь: '01',
    февраля: '02', февраль: '02',
    марта: '03', март: '03',
    апреля: '04', апрель: '04',
    мая: '05', май: '05',
    июня: '06', июнь: '06',
    июля: '07', июль: '07',
    августа: '08', август: '08',
    сентября: '09', сентябрь: '09',
    октября: '10', октябрь: '10',
    ноября: '11', ноябрь: '11',
    декабря: '12', декабрь: '12',
  };
  const words = text.toLowerCase().match(/^(\d{1,2})\s+([а-яё]+)\s+(\d{4})$/i);
  if (words && monthNames[words[2]]) {
    return `${words[3]}-${monthNames[words[2]]}-${words[1].padStart(2, '0')}`;
  }
  return '';
}

function jsonFromText(text) {
  const match = String(text || '').match(/\{[\s\S]*\}/);
  if (!match) return null;
  try { return JSON.parse(match[0]); } catch { return null; }
}

function normalizeInvoiceItem(item, index = 0) {
  const name = cleanText(item.name || item.title || item.product || item.product_name);
  const sku = normalizeSku(item.sku || item.article || item.articul || item.code || item.barcode);
  const qty = toNum(item.qty ?? item.quantity ?? item.count ?? item.amount);
  const purchasePrice = roundMoney(item.purchase_price ?? item.price ?? item.unit_price ?? item.cost);
  const total = roundMoney(item.total ?? item.sum ?? item.amount_total);
  if (!name && !sku) return null;
  return {
    sku: sku || `NEW-${Date.now().toString().slice(-6)}-${index + 1}`,
    name: name || `Товар ${sku || index + 1}`,
    qty: qty > 0 ? qty : 1,
    unit: cleanText(item.unit || item.measure || item.uom) || 'шт',
    purchase_price: purchasePrice || (qty > 0 && total > 0 ? roundMoney(total / qty) : 0),
    total,
  };
}

function parseNumberToken(value) {
  const match = String(value || '').match(/-?\d+(?:[\s.,]\d{1,3})*/);
  return match ? toNum(match[0]) : 0;
}

function parseNumericTokens(tokens) {
  return tokens
    .map(token => {
      const text = String(token || '').replace(/[₽%]/g, '');
      if (!/\d/.test(text)) return null;
      const number = parseNumberToken(text);
      return number > 0 ? number : null;
    })
    .filter(value => value !== null);
}

function normalizeUnitToken(token) {
  const unit = String(token || '').toLowerCase().replace(/[.,;:]/g, '');
  const units = {
    шт: 'шт',
    штук: 'шт',
    кг: 'кг',
    г: 'г',
    л: 'л',
    м: 'м',
    уп: 'уп',
    упак: 'уп',
    компл: 'компл',
    pcs: 'шт',
    kg: 'кг',
  };
  return units[unit] || '';
}

function parseTorg12Line(line, index = 0) {
  const row = String(line || '').trim().match(/^\d{1,4}\s+(.+)$/);
  if (!row) return null;
  const tokens = row[1].split(/\s+/).filter(Boolean);
  const unitIndex = tokens.findIndex(token => normalizeUnitToken(token));
  if (unitIndex <= 0) return null;
  const nameTokens = tokens.slice(0, unitIndex).filter(token => token !== '-' && !/^\d{3,4}$/.test(token));
  const name = cleanText(nameTokens.join(' '));
  if (!name || /^(итого|всего)\b/i.test(name)) return null;
  const numbers = parseNumericTokens(tokens.slice(unitIndex + 1));
  if (numbers.length < 3) return null;
  const qty = numbers.length >= 6 ? numbers[numbers.length - 6] : numbers[0];
  const purchasePrice = numbers.length >= 5 ? numbers[numbers.length - 5] : numbers[1];
  const total = numbers[numbers.length - 1];
  if (!qty || !purchasePrice) return null;
  return normalizeInvoiceItem({
    sku: '',
    name,
    qty,
    unit: normalizeUnitToken(tokens[unitIndex]) || tokens[unitIndex],
    purchase_price: purchasePrice,
    total,
  }, index);
}

function parseInvoiceText(text) {
  const source = String(text || '').replace(/\r/g, '\n');
  const invoiceNumber = source.match(/(?:накладн\w*|счет|сч[её]т|упд|номер)\s*(?:№|N|No|#)?\s*([A-Za-zА-Яа-я0-9._/-]+)/i)?.[1] || '';
  const invoiceDate = normalizeDate(source.match(/\b(\d{2}[.\-/]\d{2}[.\-/]\d{4})\b/)?.[1] || '');
  const supplierName = source.match(/(?:поставщик|продавец)\s*[:\-]\s*([^\n]+)/i)?.[1] || '';
  const lines = source.split('\n').map(line => line.trim()).filter(Boolean);
  const items = [];

  for (const line of lines) {
    if (/^(итого|всего|поставщик|покупатель|накладная|счет|сч[её]т|упд)\b/i.test(line)) continue;
    const torg12Item = parseTorg12Line(line, items.length);
    if (torg12Item) {
      items.push(torg12Item);
      continue;
    }
    const separated = line.split(/[;\t|]/).map(part => part.trim()).filter(Boolean);
    if (separated.length >= 4) {
      const [first, second, ...rest] = separated;
      const qty = parseNumberToken(rest[0]);
      const price = parseNumberToken(rest[1]);
      const maybeSku = normalizeSku(first);
      const item = normalizeInvoiceItem({
        sku: maybeSku && maybeSku.length <= 32 ? maybeSku : '',
        name: maybeSku && maybeSku.length <= 32 ? second : first,
        qty,
        unit: rest[2] && !parseNumberToken(rest[2]) ? rest[2] : 'шт',
        purchase_price: price,
        total: parseNumberToken(rest[2] || rest[3]),
      }, items.length);
      if (item && (item.qty > 0 || item.purchase_price > 0)) items.push(item);
      continue;
    }

    const regex = line.match(/^(\S{2,32})\s+(.+?)\s+(\d+(?:[.,]\d+)?)\s*(шт|кг|л|м|уп|pcs|kg)?\s+(\d+(?:[\s.,]\d+)?)\s*(?:\d+(?:[\s.,]\d+)?)?$/i);
    if (regex) {
      const item = normalizeInvoiceItem({
        sku: regex[1],
        name: regex[2],
        qty: regex[3],
        unit: regex[4] || 'шт',
        purchase_price: regex[5],
      }, items.length);
      if (item) items.push(item);
    }
  }

  return {
    supplier_name: cleanText(supplierName),
    invoice_number: cleanText(invoiceNumber),
    invoice_date: cleanText(invoiceDate),
    items,
  };
}

async function extractInvoiceText(file) {
  if (!file) throw badRequest('Загрузите файл накладной');
  const mime = file.mimetype || '';
  if (mime === 'application/pdf' || file.originalname?.toLowerCase().endsWith('.pdf')) {
    const parsed = await pdfParse(file.buffer);
    return parsed.text || '';
  }
  if (mime.startsWith('text/') || /\.(txt|csv|tsv)$/i.test(file.originalname || '')) {
    return file.buffer.toString('utf8');
  }
  return '';
}

async function extractInvoiceOcrText(file) {
  const isImage = file?.mimetype?.startsWith('image/');
  const isPdf = file?.mimetype === 'application/pdf' || /\.pdf$/i.test(file?.originalname || '');
  if (!isImage && !isPdf) return '';
  const tempDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'store-ocr-'));
  const extension = path.extname(file.originalname || '') || '.png';
  const inputPath = path.join(tempDir, `invoice${extension}`);
  try {
    await fs.promises.writeFile(inputPath, file.buffer);
    const imagePaths = [];
    if (isPdf) {
      const outputPrefix = path.join(tempDir, 'page');
      await execFileAsync('pdftoppm', [
        '-png',
        '-f',
        '1',
        '-l',
        String(toNum(process.env.STORE_OCR_PDF_MAX_PAGES) || 3),
        '-r',
        String(toNum(process.env.STORE_OCR_PDF_DPI) || 220),
        inputPath,
        outputPrefix,
      ], {
        timeout: toNum(process.env.STORE_OCR_TIMEOUT_MS) || 90000,
        maxBuffer: 8 * 1024 * 1024,
      });
      const files = await fs.promises.readdir(tempDir);
      imagePaths.push(...files.filter(name => /^page-\d+\.png$/i.test(name)).sort().map(name => path.join(tempDir, name)));
    } else {
      imagePaths.push(inputPath);
    }

    const chunks = [];
    for (const imagePath of imagePaths) {
      const { stdout } = await execFileAsync('tesseract', [
        imagePath,
        'stdout',
        '-l',
        process.env.STORE_OCR_LANG || 'rus+eng',
        '--psm',
        process.env.STORE_OCR_PSM || '6',
      ], {
        timeout: toNum(process.env.STORE_OCR_TIMEOUT_MS) || 90000,
        maxBuffer: 8 * 1024 * 1024,
      });
      if (stdout) chunks.push(stdout);
    }
    return chunks.join('\n');
  } catch (err) {
    if (err.code === 'ENOENT') return '';
    throw badRequest(`OCR не смог прочитать файл накладной: ${cleanText(err.message).slice(0, 180)}`);
  } finally {
    await fs.promises.rm(tempDir, { recursive: true, force: true }).catch(() => {});
  }
}

function parseExtraConfig(value) {
  try { return JSON.parse(value || '{}'); } catch { return {}; }
}

function invoiceVisionPrompt() {
  return [
    'Распознай товарную накладную на русском языке и верни только валидный JSON без пояснений.',
    'Особенно внимательно обработай форму ТОРГ-12: таблица товаров находится в середине документа.',
    'Для строк ТОРГ-12 бери: name из колонки 2 "наименование товара", unit из колонки 4, qty из колонки 10 "количество/масса нетто", purchase_price из колонки 11 "Цена, руб. коп.", total из колонки 15 "Сумма с учетом НДС".',
    'Не добавляй строку "Всего по накладной" и другие итоги как товар.',
    'Если артикул или код товара в документе пустой или указан "-", верни sku пустой строкой.',
    'Даты возвращай строго в формате YYYY-MM-DD. Например, "17 мая 2014" это "2014-05-17".',
    'Числа возвращай числом, без пробелов, валюты, процентов и кавычек.',
    'Формат ответа: {"supplier_name":"","invoice_number":"","invoice_date":"YYYY-MM-DD","items":[{"sku":"","name":"","qty":0,"unit":"шт","purchase_price":0,"total":0}]}',
  ].join('\n');
}

async function responseErrorText(response) {
  const raw = await response.text().catch(() => '');
  if (!raw) return '';
  try {
    const parsed = JSON.parse(raw);
    return cleanText(parsed.error?.message || parsed.message || raw).slice(0, 240);
  } catch {
    return cleanText(raw).slice(0, 240);
  }
}

function visionProviderError(response, details = '') {
  const status = response.status;
  if (status === 401 || status === 403) {
    return badRequest('ИИ-распознавание накладных не настроено: активный API-ключ LLM-провайдера не принят. Обновите ключ в ERPLight → Администрирование → ИИ-модели или задайте STORE_VISION_API_KEY.');
  }
  if (status === 404) {
    return badRequest('ИИ-распознавание накладных не настроено: активная модель или адрес LLM-провайдера недоступны. Проверьте модель и Base URL в ERPLight → Администрирование → ИИ-модели.');
  }
  if (status === 429) {
    return badRequest('ИИ-провайдер временно ограничил распознавание накладных. Повторите позже или проверьте лимиты активного LLM-провайдера.');
  }
  return badRequest(`Не удалось распознать изображение накладной через ИИ-провайдера${details ? `: ${details}` : ''}`);
}

async function visionConfig() {
  const apiKey = cleanText(process.env.STORE_VISION_API_KEY || process.env.OPENAI_API_KEY || process.env.LLM_API_KEY);
  if (apiKey) {
    return {
      providerType: 'openai',
      apiKey,
      baseUrl: (process.env.STORE_VISION_BASE_URL || process.env.OPENAI_BASE_URL || process.env.LLM_BASE_URL || 'https://api.openai.com/v1').replace(/\/$/, ''),
      model: process.env.STORE_VISION_MODEL || process.env.OPENAI_MODEL || process.env.LLM_MODEL || 'gpt-4o-mini',
      temperature: 0,
      maxTokens: 4000,
      extraConfig: {},
    };
  }
  try {
    const { rows } = await db.pool.query('SELECT * FROM erp.llm_providers WHERE is_active = 1 AND api_key IS NOT NULL ORDER BY id LIMIT 1');
    const provider = rows[0];
    if (!provider) return null;
    return {
      providerType: provider.provider_type || 'openai',
      apiKey: cleanText(provider.api_key),
      baseUrl: (provider.base_url || (provider.provider_type === 'anthropic' ? 'https://api.anthropic.com' : 'https://api.openai.com/v1')).replace(/\/$/, ''),
      model: provider.model || (provider.provider_type === 'anthropic' ? 'claude-sonnet-4-6' : 'gpt-4o-mini'),
      temperature: 0,
      maxTokens: Math.max(toNum(provider.max_tokens) || 4000, 4000),
      extraConfig: parseExtraConfig(provider.extra_config),
    };
  } catch {
    return null;
  }
}

async function recognizeInvoiceImage(file) {
  const config = await visionConfig();
  if (!file?.mimetype?.startsWith('image/')) return null;
  if (!config) {
    throw badRequest('ИИ-распознавание накладных не настроено: добавьте LLM-провайдера в ERPLight → Администрирование → ИИ-модели или задайте STORE_VISION_API_KEY.');
  }
  const prompt = invoiceVisionPrompt();
  const imageBase64 = file.buffer.toString('base64');
  const dataUrl = `data:${file.mimetype};base64,${imageBase64}`;

  if (config.providerType === 'anthropic') {
    const url = new URL(config.baseUrl);
    url.pathname = `${url.pathname.replace(/\/$/, '')}/v1/messages`;
    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'x-api-key': config.apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
        ...(config.extraConfig.headers || {}),
      },
      body: JSON.stringify({
        model: config.model,
        max_tokens: config.maxTokens,
        temperature: config.temperature,
        messages: [{
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'image', source: { type: 'base64', media_type: file.mimetype, data: imageBase64 } },
          ],
        }],
      }),
    });
    if (!response.ok) throw visionProviderError(response, await responseErrorText(response));
    const data = await response.json();
    const parsed = jsonFromText(arr(data.content).map(part => part.text || '').join('\n'));
    if (!parsed) return null;
    return {
      supplier_name: cleanText(parsed.supplier_name),
      invoice_number: cleanText(parsed.invoice_number),
      invoice_date: normalizeDate(parsed.invoice_date),
      items: arr(parsed.items).map(normalizeInvoiceItem).filter(Boolean),
    };
  }

  const response = await fetch(`${config.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json',
      ...(config.extraConfig.headers || {}),
    },
    body: JSON.stringify({
      model: config.model,
      temperature: config.temperature,
      max_tokens: config.maxTokens,
      messages: [{
        role: 'user',
        content: [
          { type: 'text', text: prompt },
          { type: 'image_url', image_url: { url: dataUrl } },
        ],
      }],
    }),
  });
  if (!response.ok) throw visionProviderError(response, await responseErrorText(response));
  const data = await response.json();
  const parsed = jsonFromText(data.choices?.[0]?.message?.content || '');
  if (!parsed) return null;
  return {
    supplier_name: cleanText(parsed.supplier_name),
    invoice_number: cleanText(parsed.invoice_number),
    invoice_date: normalizeDate(parsed.invoice_date),
    items: arr(parsed.items).map(normalizeInvoiceItem).filter(Boolean),
  };
}

function badRequest(message) {
  const err = new Error(message);
  err.status = 400;
  return err;
}

function clientId(req) {
  return requireStoreClientId(req);
}

async function audit(req, action, entityType, entityId, details = {}) {
  const cid = clientId(req);
  await db.pool.query(
    `INSERT INTO audit_logs (id, client_id, user_id, user_email, action, entity_type, entity_id, details)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb)`,
    [uuidv4(), cid, req.user?.userId || req.user?.id || '', req.user?.email || '', action, entityType, entityId || '', JSON.stringify(details)],
  );
}

function normalizeRows(rows) {
  return rows.map((row) => ({
    ...row,
    linked_warehouse_ids: json(row.linked_warehouse_ids, []),
    attributes: json(row.attributes, {}),
    items: json(row.items, []),
    differences: json(row.differences, []),
    purchase_price: toNum(row.purchase_price),
    markup_percent: toNum(row.markup_percent),
    markup_fixed: toNum(row.markup_fixed),
    sale_price: toNum(row.sale_price),
    quantity: toNum(row.quantity),
    total: toNum(row.total),
    profit: toNum(row.profit),
    min_quantity: toNum(row.min_quantity),
  }));
}

async function ensureProductGroup(cid, name, description = '') {
  const groupName = cleanText(name);
  if (!groupName) return null;
  const existing = await db.prepare('SELECT * FROM product_groups WHERE client_id = ? AND LOWER(name) = LOWER(?) LIMIT 1')
    .get(cid, groupName);
  if (existing) return normalizeRows([existing])[0];
  const id = uuidv4();
  await db.pool.query(
    `INSERT INTO product_groups (id, client_id, name, description)
     VALUES ($1,$2,$3,$4)`,
    [id, cid, groupName, cleanText(description)],
  );
  return normalizeRows(await db.prepare('SELECT * FROM product_groups WHERE client_id = ? AND id = ?').all(cid, id))[0];
}

async function ensureDemoData(cid) {
  const existing = await db.prepare('SELECT id FROM locations WHERE client_id = ? LIMIT 1').get(cid);
  if (existing) return;

  const central = uuidv4();
  const shop = uuidv4();
  const secondShop = uuidv4();
  const supplier = uuidv4();
  const products = [
    { id: uuidv4(), name: 'Кофе зерновой 1 кг', sku: 'COF-001', group: 'Бакалея', purchase: 780, markup: 45, unit: 'кг', qty: [42, 12, 8] },
    { id: uuidv4(), name: 'Подарочный набор', sku: 'GFT-112', group: 'Подарки', purchase: 1250, markup: 55, unit: 'шт', qty: [15, 5, 3] },
    { id: uuidv4(), name: 'Термокружка', sku: 'MUG-204', group: 'Посуда', purchase: 520, markup: 70, unit: 'шт', qty: [25, 9, 11] },
    { id: uuidv4(), name: 'Шоколад ремесленный', sku: 'CHO-021', group: 'Сладости', purchase: 190, markup: 80, unit: 'шт', qty: [120, 35, 28] },
  ];

  await db.pool.query(
    `INSERT INTO locations (id, client_id, name, location_type, address, is_central, linked_warehouse_ids)
     VALUES
     ($1,$2,'Центральный склад','warehouse','Промышленная, 12',TRUE,$5::jsonb),
     ($3,$2,'Магазин на Ленина','store','Ленина, 8',FALSE,$6::jsonb),
     ($4,$2,'Магазин у вокзала','store','Вокзальная, 3',FALSE,$6::jsonb)`,
    [central, cid, shop, secondShop, JSON.stringify([shop, secondShop]), JSON.stringify([central])],
  );
  await db.pool.query(
    `INSERT INTO suppliers (id, client_id, name, phone, email, contact_person, terms)
     VALUES ($1,$2,'ООО Прайм Поставка','+7 900 100-20-30','supply@example.ru','Марина Иванова','Отсрочка 14 дней, доставка по вторникам')`,
    [supplier, cid],
  );
  for (const groupName of [...new Set(products.map(product => product.group))]) {
    await ensureProductGroup(cid, groupName);
  }

  for (const p of products) {
    const sale = Math.round((p.purchase * (1 + p.markup / 100)) * 100) / 100;
    await db.pool.query(
      `INSERT INTO products (id, client_id, name, sku, barcode, group_name, purchase_price, markup_percent, sale_price, unit, description, attributes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12::jsonb)`,
      [p.id, cid, p.name, p.sku, p.sku.replace(/\D/g, '').padEnd(12, '0'), p.group, p.purchase, p.markup, sale, p.unit, 'Демо-товар для витрины и управленческого учёта', JSON.stringify({ бренд: 'OnlinePro Demo' })],
    );
    const locations = [central, shop, secondShop];
    for (let i = 0; i < locations.length; i += 1) {
      await db.pool.query(
        `INSERT INTO stock_balances (id, client_id, product_id, location_id, quantity)
         VALUES ($1,$2,$3,$4,$5)`,
        [uuidv4(), cid, p.id, locations[i], p.qty[i]],
      );
    }
  }

  const saleItems = [{ product_id: products[0].id, name: products[0].name, qty: 2, price: 1131, purchase_price: 780 }];
  await db.pool.query(
    `INSERT INTO sales (id, client_id, number, location_id, cashier_name, items, total, profit)
     VALUES ($1,$2,'SALE-0001',$3,'Анна Смирнова',$4::jsonb,2262,702)`,
    [uuidv4(), cid, shop, JSON.stringify(saleItems)],
  );
  await db.pool.query(
    `INSERT INTO online_orders (id, client_id, number, customer_name, customer_phone, status, items, total)
     VALUES ($1,$2,'WEB-0001','Ирина Сергеева','+7 900 333-44-55','new',$3::jsonb,2262)`,
    [uuidv4(), cid, JSON.stringify(saleItems)],
  );
}

async function scoped(req, table, order = 'created_at DESC') {
  const cid = clientId(req);
  const rows = await db.prepare(`SELECT * FROM ${table} WHERE client_id = ? ORDER BY ${order}`).all(cid);
  return normalizeRows(rows);
}

app.get('/api/store/dashboard', requireAuth, async (req, res, next) => {
  try {
    const cid = clientId(req);
    await ensureDemoData(cid);
    const [locations, suppliers, groups, products, stock, purchases, transfers, inventories, sales, orders, auditRows] = await Promise.all([
      scoped(req, 'locations', 'location_type, name'),
      scoped(req, 'suppliers', 'name'),
      scoped(req, 'product_groups', 'name'),
      scoped(req, 'products', 'name'),
      scoped(req, 'stock_balances', 'updated_at DESC'),
      scoped(req, 'purchase_orders'),
      scoped(req, 'transfers'),
      scoped(req, 'inventory_counts'),
      scoped(req, 'sales'),
      scoped(req, 'online_orders'),
      scoped(req, 'audit_logs'),
    ]);
    const stockValue = stock.reduce((sum, item) => {
      const product = products.find(p => p.id === item.product_id);
      return sum + item.quantity * (product?.purchase_price || 0);
    }, 0);
    const revenue = sales.reduce((sum, item) => sum + item.total, 0);
    const profit = sales.reduce((sum, item) => sum + item.profit, 0);
    const lowStock = stock.filter(s => s.quantity <= 5).length;

    // Build attention items: low stock (below product min_quantity) + unprocessed orders
    const productMinQty = {};
    for (const p of products) { productMinQty[p.id] = toNum(p.min_quantity) || 0; }
    const attentionItems = [];
    for (const s of stock) {
      const threshold = productMinQty[s.product_id] || 0;
      if (threshold > 0 && s.quantity < threshold) {
        const prod = products.find(p => p.id === s.product_id);
        attentionItems.push({ type: 'low_stock', product_id: s.product_id, product_name: prod?.name || '—', location_id: s.location_id, quantity: s.quantity, min_quantity: threshold });
      }
    }
    for (const o of orders) {
      if (o.status === 'new' || o.status === 'processing') {
        attentionItems.push({ type: 'order', id: o.id, number: o.number, customer_name: o.customer_name, status: o.status, total: o.total, created_at: o.created_at });
      }
    }

    const storefrontUrl = `/store/public/${encodeURIComponent(cid)}`;
    const storefrontQr = await QRCode.toDataURL(storefrontUrl, { margin: 1, width: 160 });
    res.json({
      locations, suppliers, groups, products, stock, purchases, transfers, inventories, sales, orders, audit: auditRows,
      summary: {
        stores: locations.filter(l => l.location_type === 'store').length,
        warehouses: locations.filter(l => l.location_type === 'warehouse').length,
        products: products.length,
        stock_value: stockValue,
        revenue,
        profit,
        low_stock: lowStock,
        new_orders: orders.filter(o => o.status === 'new').length,
      },
      attention: attentionItems.slice(0, 20),
      storefront: { url: storefrontUrl, qr: storefrontQr },
    });
  } catch (err) { next(err); }
});

app.get('/api/store/locations', requireAuth, async (req, res, next) => {
  try { await ensureDemoData(clientId(req)); res.json(await scoped(req, 'locations', 'location_type, name')); } catch (err) { next(err); }
});

app.post('/api/store/locations', requireAuth, async (req, res, next) => {
  try {
    const cid = clientId(req);
    const id = uuidv4();
    await db.pool.query(
      `INSERT INTO locations (id, client_id, name, location_type, address, is_central, linked_warehouse_ids)
       VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb)`,
      [id, cid, req.body.name, req.body.location_type || 'store', req.body.address || '', !!req.body.is_central, JSON.stringify(req.body.linked_warehouse_ids || [])],
    );
    await audit(req, 'created', 'location', id, req.body);
    res.status(201).json((await scoped(req, 'locations', 'location_type, name')).find(i => i.id === id));
  } catch (err) { next(err); }
});

app.put('/api/store/locations/:id', requireAuth, async (req, res, next) => {
  try {
    const cid = clientId(req);
    const { id } = req.params;
    const existing = await db.prepare('SELECT id FROM locations WHERE id = ? AND client_id = ?').get(id, cid);
    if (!existing) return res.status(404).json({ error: 'Место хранения не найдено' });
    await db.pool.query(
      `UPDATE locations SET name = $1, location_type = $2, address = $3, is_central = $4, linked_warehouse_ids = $5::jsonb, updated_at = NOW()
       WHERE id = $6 AND client_id = $7`,
      [req.body.name, req.body.location_type || 'store', req.body.address || '', !!req.body.is_central, JSON.stringify(req.body.linked_warehouse_ids || []), id, cid],
    );
    await audit(req, 'updated', 'location', id, req.body);
    res.json((await scoped(req, 'locations', 'location_type, name')).find(i => i.id === id));
  } catch (err) { next(err); }
});

app.delete('/api/store/locations/:id', requireAuth, async (req, res, next) => {
  try {
    const cid = clientId(req);
    const { id } = req.params;
    const { move_to_location_id } = req.body;
    const existing = await db.prepare('SELECT id, name FROM locations WHERE id = ? AND client_id = ?').get(id, cid);
    if (!existing) return res.status(404).json({ error: 'Место хранения не найдено' });

    // Check if location has stock
    const stockRows = await db.prepare('SELECT product_id, quantity FROM stock_balances WHERE client_id = ? AND location_id = ? AND quantity > 0').all(cid, id);
    if (stockRows.length > 0 && !move_to_location_id) {
      return res.status(400).json({ error: 'На складе есть товары. Укажите, куда их переместить.', need_transfer: true });
    }

    // Transfer stock if needed
    if (stockRows.length > 0 && move_to_location_id) {
      const target = await db.prepare('SELECT id FROM locations WHERE id = ? AND client_id = ?').get(move_to_location_id, cid);
      if (!target) return res.status(400).json({ error: 'Целевое место хранения не найдено' });
      for (const row of stockRows) {
        const currentTarget = await getStockQuantity(cid, row.product_id, move_to_location_id);
        await setStock(cid, row.product_id, move_to_location_id, currentTarget + toNum(row.quantity));
        await db.pool.query('DELETE FROM stock_balances WHERE client_id = $1 AND product_id = $2 AND location_id = $3', [cid, row.product_id, id]);
      }
    }

    await db.pool.query('DELETE FROM locations WHERE id = $1 AND client_id = $2', [id, cid]);
    await audit(req, 'deleted', 'location', id, { name: existing.name, moved_to: move_to_location_id });
    res.json({ ok: true });
  } catch (err) { next(err); }
});

app.get('/api/store/suppliers', requireAuth, async (req, res, next) => {
  try { await ensureDemoData(clientId(req)); res.json(await scoped(req, 'suppliers', 'name')); } catch (err) { next(err); }
});

app.post('/api/store/suppliers', requireAuth, async (req, res, next) => {
  try {
    const cid = clientId(req);
    const id = uuidv4();
    await db.pool.query(
      `INSERT INTO suppliers (id, client_id, name, phone, email, contact_person, terms)
       VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [id, cid, req.body.name, req.body.phone || '', req.body.email || '', req.body.contact_person || '', req.body.terms || ''],
    );
    await audit(req, 'created', 'supplier', id, req.body);
    res.status(201).json((await scoped(req, 'suppliers', 'name')).find(i => i.id === id));
  } catch (err) { next(err); }
});

app.get('/api/store/groups', requireAuth, async (req, res, next) => {
  try { await ensureDemoData(clientId(req)); res.json(await scoped(req, 'product_groups', 'name')); } catch (err) { next(err); }
});

app.post('/api/store/groups', requireAuth, async (req, res, next) => {
  try {
    const cid = clientId(req);
    const name = cleanText(req.body.name);
    if (!name) throw badRequest('Укажите название группы');
    const duplicate = await db.prepare('SELECT id FROM product_groups WHERE client_id = ? AND LOWER(name) = LOWER(?) LIMIT 1').get(cid, name);
    if (duplicate) throw badRequest('Группа с таким названием уже есть');
    const id = uuidv4();
    await db.pool.query(
      `INSERT INTO product_groups (id, client_id, name, description)
       VALUES ($1,$2,$3,$4)`,
      [id, cid, name, cleanText(req.body.description)],
    );
    await audit(req, 'created', 'product_group', id, req.body);
    res.status(201).json((await scoped(req, 'product_groups', 'name')).find(i => i.id === id));
  } catch (err) {
    if (err.code === '23505') return next(badRequest('Группа с таким названием уже есть'));
    return next(err);
  }
});

app.put('/api/store/groups/:id', requireAuth, async (req, res, next) => {
  try {
    const cid = clientId(req);
    const name = cleanText(req.body.name);
    if (!name) throw badRequest('Укажите название группы');
    const current = await db.prepare('SELECT * FROM product_groups WHERE client_id = ? AND id = ?').get(cid, req.params.id);
    if (!current) throw badRequest('Группа не найдена');
    const duplicate = await db.prepare('SELECT id FROM product_groups WHERE client_id = ? AND LOWER(name) = LOWER(?) AND id <> ? LIMIT 1')
      .get(cid, name, req.params.id);
    if (duplicate) throw badRequest('Группа с таким названием уже есть');
    await db.pool.query(
      `UPDATE product_groups
       SET name = $1, description = $2, updated_at = NOW()
       WHERE id = $3 AND client_id = $4`,
      [name, cleanText(req.body.description), req.params.id, cid],
    );
    if (current.name !== name) {
      await db.pool.query(
        'UPDATE products SET group_name = $1, updated_at = NOW() WHERE client_id = $2 AND group_name = $3',
        [name, cid, current.name],
      );
    }
    await audit(req, 'updated', 'product_group', req.params.id, req.body);
    res.json((await scoped(req, 'product_groups', 'name')).find(i => i.id === req.params.id));
  } catch (err) {
    if (err.code === '23505') return next(badRequest('Группа с таким названием уже есть'));
    return next(err);
  }
});

app.delete('/api/store/groups/:id', requireAuth, async (req, res, next) => {
  try {
    const cid = clientId(req);
    const group = await db.prepare('SELECT * FROM product_groups WHERE client_id = ? AND id = ?').get(cid, req.params.id);
    if (!group) throw badRequest('Группа не найдена');
    const product = await db.prepare('SELECT id FROM products WHERE client_id = ? AND group_name = ? LIMIT 1').get(cid, group.name);
    if (product) throw badRequest('В группе есть товары. Перенесите товары в другую группу перед удалением.');
    await db.prepare('DELETE FROM product_groups WHERE id = ? AND client_id = ?').run(req.params.id, cid);
    await audit(req, 'deleted', 'product_group', req.params.id, { name: group.name });
    res.json({ ok: true });
  } catch (err) { next(err); }
});

app.get('/api/store/products', requireAuth, async (req, res, next) => {
  try { await ensureDemoData(clientId(req)); res.json(await scoped(req, 'products', 'name')); } catch (err) { next(err); }
});

app.post('/api/store/products', requireAuth, async (req, res, next) => {
  try {
    if (!cleanText(req.body.name)) throw badRequest('Укажите название товара');
    if (!cleanText(req.body.sku)) throw badRequest('Укажите артикул товара');
    const cid = clientId(req);
    const id = uuidv4();
    const purchase = toNum(req.body.purchase_price);
    const markupPercent = toNum(req.body.markup_percent);
    const markupFixed = toNum(req.body.markup_fixed);
    const groupName = cleanText(req.body.group_name);
    if (groupName) await ensureProductGroup(cid, groupName);
    const salePrice = req.body.sale_price !== undefined
      ? toNum(req.body.sale_price)
      : Math.round((purchase * (1 + markupPercent / 100) + markupFixed) * 100) / 100;
    await db.pool.query(
      `INSERT INTO products (id, client_id, name, sku, barcode, group_name, purchase_price, markup_percent, markup_fixed, sale_price, unit, description, attributes, image_url, is_public, min_quantity)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13::jsonb,$14,$15,$16)`,
      [id, cid, req.body.name, req.body.sku, req.body.barcode || '', groupName, purchase, markupPercent, markupFixed, salePrice, req.body.unit || 'шт', req.body.description || '', JSON.stringify(req.body.attributes || {}), req.body.image_url || '', req.body.is_public !== false, toNum(req.body.min_quantity) || 0],
    );
    await audit(req, 'created', 'product', id, req.body);
    res.status(201).json((await scoped(req, 'products', 'name')).find(i => i.id === id));
  } catch (err) {
    if (err.code === '23505') return next(badRequest('Товар с таким артикулом уже есть'));
    return next(err);
  }
});

app.put('/api/store/products/:id', requireAuth, async (req, res, next) => {
  try {
    if (!cleanText(req.body.name)) throw badRequest('Укажите название товара');
    if (!cleanText(req.body.sku)) throw badRequest('Укажите артикул товара');
    const cid = clientId(req);
    const { rows } = await db.pool.query('SELECT * FROM products WHERE id = $1 AND client_id = $2', [req.params.id, cid]);
    const current = rows[0];
    if (!current) throw badRequest('Товар не найден');
    const purchase = req.body.purchase_price !== undefined ? toNum(req.body.purchase_price) : toNum(current.purchase_price);
    const markupPercent = req.body.markup_percent !== undefined ? toNum(req.body.markup_percent) : toNum(current.markup_percent);
    const markupFixed = req.body.markup_fixed !== undefined ? toNum(req.body.markup_fixed) : toNum(current.markup_fixed);
    const groupName = req.body.group_name !== undefined ? cleanText(req.body.group_name) : current.group_name || '';
    if (groupName) await ensureProductGroup(cid, groupName);
    const salePrice = req.body.sale_price !== undefined
      ? toNum(req.body.sale_price)
      : Math.round((purchase * (1 + markupPercent / 100) + markupFixed) * 100) / 100;
    await db.pool.query(
      `UPDATE products
       SET name = $1, sku = $2, barcode = $3, group_name = $4, purchase_price = $5,
           markup_percent = $6, markup_fixed = $7, sale_price = $8, unit = $9,
           description = $10, attributes = $11::jsonb, image_url = $12, is_public = $13,
           min_quantity = $14, updated_at = NOW()
       WHERE id = $15 AND client_id = $16`,
      [
        req.body.name,
        req.body.sku,
        req.body.barcode ?? current.barcode ?? '',
        groupName,
        purchase,
        markupPercent,
        markupFixed,
        salePrice,
        req.body.unit || current.unit || 'шт',
        req.body.description ?? current.description ?? '',
        JSON.stringify(req.body.attributes ?? current.attributes ?? {}),
        req.body.image_url ?? current.image_url ?? '',
        req.body.is_public !== undefined ? req.body.is_public !== false : current.is_public !== false,
        req.body.min_quantity !== undefined ? toNum(req.body.min_quantity) : toNum(current.min_quantity || 0),
        req.params.id,
        cid,
      ],
    );
    await audit(req, 'updated', 'product', req.params.id, req.body);
    res.json((await scoped(req, 'products', 'name')).find(i => i.id === req.params.id));
  } catch (err) {
    if (err.code === '23505') return next(badRequest('Товар с таким артикулом уже есть'));
    return next(err);
  }
});

async function createDocument(req, table, fields, values, entity) {
  const id = uuidv4();
  const cid = clientId(req);
  await db.pool.query(
    `INSERT INTO ${table} (id, client_id, ${fields.join(', ')}) VALUES ($1, $2, ${fields.map((_, i) => `$${i + 3}`).join(', ')})`,
    [id, cid, ...values],
  );
  await audit(req, 'created', entity, id, req.body);
  return id;
}

async function getProduct(cid, productId) {
  if (!productId) return null;
  return normalizeRows(await db.prepare('SELECT * FROM products WHERE client_id = ? AND id = ?').all(cid, productId))[0];
}

async function getProductBySku(cid, sku) {
  if (!sku) return null;
  return normalizeRows(await db.prepare('SELECT * FROM products WHERE client_id = ? AND LOWER(sku) = LOWER(?) LIMIT 1').all(cid, sku))[0];
}

async function createProductFromInvoiceLine(req, raw) {
  const cid = clientId(req);
  const sku = normalizeSku(raw.sku) || `AUTO-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`;
  const existing = await getProductBySku(cid, sku);
  if (existing) return existing;
  const id = uuidv4();
  const purchase = roundMoney(raw.purchase_price);
  const markupPercent = raw.markup_percent !== undefined ? toNum(raw.markup_percent) : 40;
  const groupName = cleanText(raw.group_name);
  if (groupName) await ensureProductGroup(cid, groupName);
  const salePrice = raw.sale_price !== undefined
    ? roundMoney(raw.sale_price)
    : roundMoney(purchase * (1 + markupPercent / 100));
  await db.pool.query(
    `INSERT INTO products (id, client_id, name, sku, barcode, group_name, purchase_price, markup_percent, markup_fixed, sale_price, unit, description, attributes, image_url, is_public)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,0,$9,$10,$11,$12::jsonb,'',TRUE)`,
    [
      id,
      cid,
      cleanText(raw.name) || `Товар ${sku}`,
      sku,
      cleanText(raw.barcode),
      groupName,
      purchase,
      markupPercent,
      salePrice,
      cleanText(raw.unit) || 'шт',
      'Создано автоматически при приёмке по накладной',
      JSON.stringify({ source: 'invoice_receiving' }),
    ],
  );
  await audit(req, 'created', 'product', id, { source: 'invoice_receiving', sku, name: raw.name });
  return (await getProduct(cid, id));
}

async function getStockQuantity(cid, productId, locationId) {
  const row = await db.prepare('SELECT quantity FROM stock_balances WHERE client_id = ? AND product_id = ? AND location_id = ?')
    .get(cid, productId, locationId);
  return toNum(row?.quantity);
}

async function setStock(cid, productId, locationId, quantity) {
  const existing = await db.prepare('SELECT id FROM stock_balances WHERE client_id = ? AND product_id = ? AND location_id = ?')
    .get(cid, productId, locationId);
  if (existing) {
    await db.pool.query(
      'UPDATE stock_balances SET quantity = $1, updated_at = NOW() WHERE id = $2 AND client_id = $3',
      [quantity, existing.id, cid],
    );
    return existing.id;
  }
  const id = uuidv4();
  await db.pool.query(
    `INSERT INTO stock_balances (id, client_id, product_id, location_id, quantity)
     VALUES ($1,$2,$3,$4,$5)`,
    [id, cid, productId, locationId, quantity],
  );
  return id;
}

async function adjustStock(cid, productId, locationId, delta) {
  if (!productId || !locationId) throw badRequest('Не выбран товар или место хранения');
  const current = await getStockQuantity(cid, productId, locationId);
  const next = current + toNum(delta);
  if (next < 0) throw badRequest('Недостаточно товара на выбранном складе или в магазине');
  await setStock(cid, productId, locationId, next);
  return next;
}

async function enrichItems(reqOrCid, rawItems, fallbackLocationId, options = {}) {
  const req = typeof reqOrCid === 'object' ? reqOrCid : null;
  const cid = req ? clientId(req) : reqOrCid;
  const items = [];
  for (const raw of rawItems || []) {
    let product = await getProduct(cid, raw.product_id);
    if (!product && raw.sku) product = await getProductBySku(cid, normalizeSku(raw.sku));
    if (!product && options.createMissingProducts && req) product = await createProductFromInvoiceLine(req, raw);
    if (!product) throw badRequest('Товар не найден');
    const qty = toNum(raw.qty ?? raw.quantity ?? raw.actual_qty);
    if (qty <= 0) throw badRequest('Количество должно быть больше нуля');
    items.push({
      product_id: product.id,
      name: product.name,
      sku: product.sku,
      qty,
      location_id: raw.location_id || fallbackLocationId || '',
      price: raw.price !== undefined ? toNum(raw.price) : product.sale_price,
      purchase_price: raw.purchase_price !== undefined ? toNum(raw.purchase_price) : product.purchase_price,
      unit: raw.unit || product.unit,
      system_qty: raw.system_qty !== undefined ? toNum(raw.system_qty) : undefined,
      actual_qty: raw.actual_qty !== undefined ? toNum(raw.actual_qty) : undefined,
    });
  }
  if (!items.length) throw badRequest('Добавьте хотя бы один товар');
  return items;
}

app.post('/api/store/invoices/recognize', requireAuth, upload.single('invoice'), async (req, res, next) => {
  try {
    let recognized = null;
    let recognitionWarning = '';
    if (req.file?.mimetype?.startsWith('image/')) {
      try {
        recognized = await recognizeInvoiceImage(req.file);
        if (!recognized) {
          recognitionWarning = 'ИИ-провайдер обработал изображение, но не вернул данные накладной в нужном формате. Проверьте качество файла или настройки модели.';
        }
      } catch (err) {
        if (err.status === 400) recognitionWarning = err.message;
        else throw err;
      }
      if (!arr(recognized?.items).length) {
        try {
          const ocrText = await extractInvoiceOcrText(req.file);
          if (ocrText) {
            const ocrRecognized = parseInvoiceText(ocrText);
            if (arr(ocrRecognized.items).length) {
              recognized = ocrRecognized;
              recognitionWarning = '';
            } else if (!recognitionWarning) {
              recognitionWarning = 'OCR прочитал изображение, но не нашёл товарные строки. Проверьте качество скана или заполните строки вручную.';
            }
          } else if (!recognitionWarning) {
            recognitionWarning = 'OCR для изображений не установлен в окружении сервера. Заполните строки вручную или загрузите TXT/CSV/PDF.';
          }
        } catch (err) {
          if (err.status === 400) recognitionWarning = err.message;
          else throw err;
        }
      }
    }
    if (!recognized) {
      const text = await extractInvoiceText(req.file);
      recognized = parseInvoiceText(text);
    }
    if (!arr(recognized?.items).length && !req.file?.mimetype?.startsWith('image/')) {
      try {
        const ocrText = await extractInvoiceOcrText(req.file);
        if (ocrText) {
          const ocrRecognized = parseInvoiceText(ocrText);
          if (arr(ocrRecognized.items).length) recognized = ocrRecognized;
        }
      } catch (err) {
        if (err.status === 400 && !recognitionWarning) recognitionWarning = err.message;
        else if (err.status !== 400) throw err;
      }
    }
    const items = arr(recognized.items).map(normalizeInvoiceItem).filter(Boolean);
    res.json({
      supplier_name: cleanText(recognized.supplier_name),
      invoice_number: cleanText(recognized.invoice_number),
      invoice_date: cleanText(recognized.invoice_date),
      items,
      message: items.length
        ? `Распознано позиций: ${items.length}. Проверьте строки перед приёмкой.`
        : recognitionWarning || 'Файл загружен, но позиции не удалось прочитать автоматически. Заполните строки вручную.',
    });
  } catch (err) { next(err); }
});

app.post('/api/store/purchases', requireAuth, async (req, res, next) => {
  try {
    const destinationId = req.body.location_id || req.body.to_location_id;
    if (!destinationId) throw badRequest('Выберите склад или магазин для поступления');
    const cid = clientId(req);
    const items = await enrichItems(req, req.body.items, destinationId, { createMissingProducts: true });
    const total = items.reduce((sum, item) => sum + toNum(item.qty) * toNum(item.purchase_price), 0);
    const id = await createDocument(req, 'purchase_orders', ['supplier_id', 'number', 'status', 'invoice_number', 'purchased_at', 'items', 'total'], [
      req.body.supplier_id || null, req.body.number || `PO-${Date.now()}`, req.body.status || 'received', req.body.invoice_number || '', req.body.purchased_at || new Date().toISOString().slice(0, 10), JSON.stringify(items), total,
    ], 'purchase');
    for (const item of items) {
      await adjustStock(cid, item.product_id, item.location_id, item.qty);
      await db.pool.query(
        'UPDATE products SET purchase_price = $1, sale_price = GREATEST(sale_price, $1 * (1 + markup_percent / 100) + markup_fixed), updated_at = NOW() WHERE id = $2 AND client_id = $3',
        [item.purchase_price, item.product_id, cid],
      );
    }
    res.status(201).json((await scoped(req, 'purchase_orders')).find(i => i.id === id));
  } catch (err) { next(err); }
});

app.post('/api/store/transfers', requireAuth, async (req, res, next) => {
  try {
    const cid = clientId(req);
    if (!req.body.from_location_id || !req.body.to_location_id) throw badRequest('Выберите откуда и куда перемещать товар');
    if (req.body.from_location_id === req.body.to_location_id) throw badRequest('Нужно выбрать разные места хранения');
    const items = await enrichItems(cid, req.body.items, req.body.from_location_id);
    const id = await createDocument(req, 'transfers', ['number', 'from_location_id', 'to_location_id', 'status', 'items'], [
      req.body.number || `TR-${Date.now()}`, req.body.from_location_id, req.body.to_location_id, req.body.status || 'completed', JSON.stringify(items),
    ], 'transfer');
    for (const item of items) {
      await adjustStock(cid, item.product_id, req.body.from_location_id, -item.qty);
      await adjustStock(cid, item.product_id, req.body.to_location_id, item.qty);
    }
    res.status(201).json((await scoped(req, 'transfers')).find(i => i.id === id));
  } catch (err) { next(err); }
});

app.post('/api/store/inventories', requireAuth, async (req, res, next) => {
  try {
    const cid = clientId(req);
    if (!req.body.location_id) throw badRequest('Выберите магазин или склад');
    const items = await enrichItems(cid, req.body.items, req.body.location_id);
    const differences = items.map(item => ({ ...item, difference: toNum(item.actual_qty) - toNum(item.system_qty) }));
    const id = await createDocument(req, 'inventory_counts', ['number', 'location_id', 'status', 'items', 'differences'], [
      req.body.number || `INV-${Date.now()}`, req.body.location_id, req.body.status || 'completed', JSON.stringify(items), JSON.stringify(differences),
    ], 'inventory');
    for (const item of items) {
      const actual = toNum(item.actual_qty ?? item.qty);
      await setStock(cid, item.product_id, req.body.location_id, actual);
    }
    res.status(201).json((await scoped(req, 'inventory_counts')).find(i => i.id === id));
  } catch (err) { next(err); }
});

app.post('/api/store/sales', requireAuth, async (req, res, next) => {
  try {
    const cid = clientId(req);
    if (!req.body.location_id) throw badRequest('Выберите магазин продажи');
    const items = await enrichItems(cid, req.body.items, req.body.location_id);
    const total = items.reduce((sum, item) => sum + toNum(item.qty) * toNum(item.price), 0);
    const profit = items.reduce((sum, item) => sum + toNum(item.qty) * (toNum(item.price) - toNum(item.purchase_price)), 0);
    const id = await createDocument(req, 'sales', ['number', 'location_id', 'cashier_name', 'items', 'total', 'profit'], [
      req.body.number || `SALE-${Date.now()}`, req.body.location_id, req.body.cashier_name || req.user?.name || '', JSON.stringify(items), total, profit,
    ], 'sale');
    for (const item of items) {
      await adjustStock(cid, item.product_id, req.body.location_id, -item.qty);
    }
    res.status(201).json((await scoped(req, 'sales')).find(i => i.id === id));
  } catch (err) { next(err); }
});

app.get('/api/store/orders', requireAuth, async (req, res, next) => {
  try { await ensureDemoData(clientId(req)); res.json(await scoped(req, 'online_orders')); } catch (err) { next(err); }
});

app.patch('/api/store/orders/:id/status', requireAuth, async (req, res, next) => {
  try {
    const cid = clientId(req);
    const status = req.body.status || 'new';
    await db.prepare('UPDATE online_orders SET status = ?, updated_at = NOW() WHERE id = ? AND client_id = ?').run(status, req.params.id, cid);
    await audit(req, 'status_changed', 'online_order', req.params.id, { status });
    res.json((await scoped(req, 'online_orders')).find(i => i.id === req.params.id));
  } catch (err) { next(err); }
});

app.get('/api/store/reports', requireAuth, async (req, res, next) => {
  try {
    const dashboardReq = { ...req };
    await ensureDemoData(clientId(req));
    const [products, stock, purchases, sales, transfers] = await Promise.all([
      scoped(dashboardReq, 'products', 'name'),
      scoped(dashboardReq, 'stock_balances', 'updated_at DESC'),
      scoped(dashboardReq, 'purchase_orders'),
      scoped(dashboardReq, 'sales'),
      scoped(dashboardReq, 'transfers'),
    ]);
    res.json({
      stock,
      purchases,
      sales,
      transfers,
      profitability: products.map(product => {
        const sold = sales.flatMap(s => s.items).filter(i => i.product_id === product.id);
        const qty = sold.reduce((sum, i) => sum + toNum(i.qty), 0);
        const revenue = sold.reduce((sum, i) => sum + toNum(i.qty) * toNum(i.price), 0);
        const cost = sold.reduce((sum, i) => sum + toNum(i.qty) * toNum(i.purchase_price), 0);
        return { product_id: product.id, name: product.name, qty, revenue, profit: revenue - cost, margin: revenue ? Math.round(((revenue - cost) / revenue) * 100) : 0 };
      }),
    });
  } catch (err) { next(err); }
});

app.get('/api/store/audit', requireAuth, async (req, res, next) => {
  try { await ensureDemoData(clientId(req)); res.json(await scoped(req, 'audit_logs')); } catch (err) { next(err); }
});

app.get('/api/store/public/:clientId/catalog', async (req, res, next) => {
  try {
    await ensureDemoData(req.params.clientId);
    const products = normalizeRows(await db.prepare('SELECT * FROM products WHERE client_id = ? AND is_public = TRUE ORDER BY name').all(req.params.clientId));
    res.json({ products });
  } catch (err) { next(err); }
});

app.post('/api/store/public/:clientId/orders', async (req, res, next) => {
  try {
    const products = normalizeRows(await db.prepare('SELECT * FROM products WHERE client_id = ? AND is_public = TRUE').all(req.params.clientId));
    const items = (req.body.items || []).map(item => {
      const product = products.find(p => p.id === item.product_id);
      return { product_id: item.product_id, name: product?.name || item.name || 'Товар', qty: toNum(item.qty), price: product?.sale_price || toNum(item.price) };
    });
    const total = items.reduce((sum, item) => sum + item.qty * item.price, 0);
    const id = uuidv4();
    const number = `WEB-${Date.now().toString().slice(-6)}`;
    await db.pool.query(
      `INSERT INTO online_orders (id, client_id, number, customer_name, customer_phone, status, items, total)
       VALUES ($1,$2,$3,$4,$5,'new',$6::jsonb,$7)`,
      [id, req.params.clientId, number, req.body.customer_name || 'Покупатель', req.body.customer_phone || '', JSON.stringify(items), total],
    );
    res.status(201).json({ id, number, status: 'new', total });
  } catch (err) { next(err); }
});

const publicDir = path.join(__dirname, '../public');
if (fs.existsSync(publicDir)) {
  app.use(express.static(publicDir));
  app.get('*', (req, res) => {
    res.sendFile(path.join(publicDir, 'index.html'));
  });
}

startServer(app, { name: 'store-service', port: process.env.PORT || 4011, init: initDb });

import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || '127.0.0.1';
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || '';
const DATA_DIR = path.resolve(process.env.DATA_DIR || './data');
const DB_FILE = path.join(DATA_DIR, 'organizations.json');
const AUDIT_FILE = path.join(DATA_DIR, 'audit-log.jsonl');
const MAX_BODY = 1_500_000;


const server = http.createServer(async (req, res) => {
  setHeaders(res);
  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }
  if (req.method === 'GET' && ['/admin', '/admin/', '/admin.html', '/admin.css', '/admin.js'].includes(url.pathname)) {
    const file = url.pathname.endsWith('.css') ? 'admin.css' : url.pathname.endsWith('.js') ? 'admin.js' : 'admin.html';
    return sendStatic(res, path.join(path.dirname(new URL(import.meta.url).pathname), file));
  }
  if (req.method === 'GET' && url.pathname === '/api/health') {
    return sendJson(res, 200, { ok: true, service: 'BuryatiaGuide API', timestamp: new Date().toISOString() });
  }
  if (req.method === 'GET' && url.pathname === '/api/organizations') {
    try { return sendJson(res, 200, await readDb()); }
    catch { return sendJson(res, 500, { error: 'Не удалось прочитать базу организаций' }); }
  }
  if (req.method === 'POST' && url.pathname === '/api/admin/organizations') {
    if (!ADMIN_TOKEN) return sendJson(res, 503, { error: 'Администрирование отключено: ADMIN_TOKEN не настроен' });
    if (!safeToken(req.headers.authorization)) return sendJson(res, 401, { error: 'Требуется токен администратора' });
    let payload;
    try { payload = await readBody(req); }
    catch (e) { return sendJson(res, e.statusCode || 400, { error: e.message }); }
    const rows = Array.isArray(payload) ? payload : payload?.organizations;
    if (!Array.isArray(rows) || rows.length > 10000) return sendJson(res, 400, { error: 'Ожидается organizations-массив до 10000 записей' });
    const errors = validateRows(rows);
    if (errors.length) return sendJson(res, 422, { error: 'Проверка данных не пройдена', details: errors.slice(0, 25) });
    const old = await readDb();
    const clean = { schemaVersion: 1, updatedAt: new Date().toISOString(), organizations: rows };
    await atomicWrite(DB_FILE, JSON.stringify(clean, null, 2));
    await fs.appendFile(AUDIT_FILE, JSON.stringify({ at: clean.updatedAt, event: 'organizations_replace', count: rows.length, previousCount: old.organizations.length }) + '\n', { mode: 0o600 });
    return sendJson(res, 200, { ok: true, count: rows.length, updatedAt: clean.updatedAt });
  }
  return sendJson(res, 404, { error: 'Not found' });
});


async function readDb() {
  try {
    const parsed = JSON.parse(await fs.readFile(DB_FILE, 'utf8'));
    if (!Array.isArray(parsed.organizations)) throw new Error('Invalid db schema');
    return parsed;
  } catch (e) {
    if (e.code !== 'ENOENT') throw e;
    const init = { schemaVersion: 1, updatedAt: null, organizations: [] };
    await atomicWrite(DB_FILE, JSON.stringify(init, null, 2));
    return init;
  }
}
function validateRows(rows) {
  const errs = [];
  rows.forEach((r, i) => {
    const p = `organizations[${i}]`;
    if (!r || typeof r !== 'object' || Array.isArray(r)) { errs.push(`${p}: expected object`); return; }
    for (const key of ['name','district','category','source','checkedAt']) if (typeof r[key] !== 'string' || !r[key].trim()) errs.push(`${p}.${key}: required string`);
    if (r.source && !/^https:\/\//i.test(r.source)) errs.push(`${p}.source: only https URL allowed`);
    if (r.checkedAt && !/^\d{4}-\d{2}-\d{2}$/.test(r.checkedAt)) errs.push(`${p}.checkedAt: expected YYYY-MM-DD`);
    if (r.status && !['verified','needs_review','unverified','source_only'].includes(r.status)) errs.push(`${p}.status: unsupported status`);
    if (r.phone && typeof r.phone !== 'string') errs.push(`${p}.phone: expected string`);
    if (r.hours && typeof r.hours !== 'string') errs.push(`${p}.hours: expected string`);
  });
  return errs;
}
function safeToken(header) {
  if (!header || !header.startsWith('Bearer ')) return false;
  const supplied = Buffer.from(header.slice(7)); const expected = Buffer.from(ADMIN_TOKEN);
  return supplied.length === expected.length && crypto.timingSafeEqual(supplied, expected);
}
async function readBody(req) {
  let data = ''; for await (const chunk of req) { data += chunk; if (data.length > MAX_BODY) { const e = new Error('Слишком большой запрос'); e.statusCode = 413; throw e; } }
  try { return JSON.parse(data || ''); } catch { throw new Error('Тело запроса должно быть JSON'); }
}
async function atomicWrite(file, contents) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  const temp = `${file}.${crypto.randomUUID()}.tmp`;
  await fs.writeFile(temp, contents, { mode: 0o600 });
  await fs.rename(temp, file);
}
async function sendStatic(res, file) {
  try {
    const body = await fs.readFile(file);
    const type = file.endsWith('.css') ? 'text/css; charset=utf-8' : file.endsWith('.js') ? 'text/javascript; charset=utf-8' : 'text/html; charset=utf-8';
    res.setHeader('Content-Type', type);
    res.setHeader('Cache-Control', 'no-store');
    res.writeHead(200); res.end(body);
  } catch { sendJson(res, 404, { error: 'Not found' }); }
}
function setHeaders(res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Security-Policy', "default-src 'none'; script-src 'self'; style-src 'self'; connect-src 'self'; img-src 'self' data:; base-uri 'none'; form-action 'self'; frame-ancestors 'none'");
}
function sendJson(res, code, obj) { res.writeHead(code); res.end(JSON.stringify(obj)); }

server.requestTimeout = 15_000;
server.headersTimeout = 10_000;
await fs.mkdir(DATA_DIR, { recursive: true });
await readDb();
server.listen(PORT, HOST, () => console.log(`BuryatiaGuide API listening on http://${HOST}:${PORT}`));

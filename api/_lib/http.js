export const USER_AGENT =
  'Mozilla/5.0 (compatible; RankedTagBot/1.0; +https://rankedtag.com/bot)';

const BLOCKED_HOSTS = new Set(['localhost', '127.0.0.1', '0.0.0.0', '::1']);

export function normalizeUrl(raw) {
  const s = (raw || '').trim();
  if (!s) throw httpError(400, 'url is required');
  return /^https?:\/\//i.test(s) ? s : 'https://' + s;
}

export function guardUrl(raw) {
  const target = normalizeUrl(raw);
  let host = '';
  try {
    host = new URL(target).hostname.toLowerCase();
  } catch {
    throw httpError(400, 'invalid url');
  }
  if (
    BLOCKED_HOSTS.has(host) ||
    host.startsWith('169.254.') ||
    host.startsWith('10.') ||
    host.endsWith('.local')
  ) {
    throw httpError(400, 'URL not allowed');
  }
  return target;
}

export function extractDomain(raw) {
  const s = (raw || '').trim().toLowerCase();
  if (!s) throw httpError(400, 'domain is required');
  const withScheme = s.includes('://') ? s : 'https://' + s;
  let host = '';
  try {
    host = new URL(withScheme).hostname || '';
  } catch {
    throw httpError(400, 'invalid domain');
  }
  if (host.startsWith('www.')) host = host.slice(4);
  if (!host || !host.includes('.')) throw httpError(400, 'invalid domain');
  return host;
}

export function clamp(v, lo = 0, hi = 100) {
  return Math.max(lo, Math.min(hi, v));
}

export function httpError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

export async function fetchWithTiming(url, { timeoutMs = 15000 } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const t0 = performance.now();
  let resp;
  try {
    resp = await fetch(url, {
      redirect: 'follow',
      signal: controller.signal,
      headers: {
        'User-Agent': USER_AGENT,
        Accept: 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });
  } catch (e) {
    clearTimeout(timer);
    throw httpError(502, `Could not fetch ${url}: ${e.message || e}`);
  }
  clearTimeout(timer);
  const ms = performance.now() - t0;
  const buf = await resp.arrayBuffer();
  const headers = {};
  resp.headers.forEach((v, k) => {
    headers[k.toLowerCase()] = v;
  });
  // Node's fetch (undici) doesn't expose the negotiated protocol version.
  // Best signal we have: `alt-svc: h3=...` → HTTP/3 capable; HTTPS in 2026 is
  // overwhelmingly HTTP/2; plain HTTP stays at HTTP/1.1.
  let httpVersion = 'HTTP/1.1';
  const altSvc = (headers['alt-svc'] || '').toLowerCase();
  if (altSvc.includes('h3') || altSvc.includes('h3-')) httpVersion = 'HTTP/3';
  else if (resp.url.startsWith('https://')) httpVersion = 'HTTP/2';

  return {
    url: resp.url,
    status: resp.status,
    ms,
    bytes: buf.byteLength,
    headers,
    body: Buffer.from(buf).toString('utf8'),
    encoding: headers['content-encoding'] || null,
    httpVersion,
  };
}

export function sendJson(res, status, body) {
  res.status(status).setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(body));
}

export function sendError(res, err) {
  const status = err.status || 500;
  sendJson(res, status, { detail: err.message || 'Internal error' });
}

export function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  return {};
}

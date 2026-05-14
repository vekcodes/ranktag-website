// Smoke test for the /api/*.js Vercel serverless functions.
// Imports each handler and invokes it with a mock req/res, then prints
// status + the first 200 chars of the response body. Skipped network
// endpoints fall through to `_smokeHealth` only.
//
// Run: node scripts/smoke-api.mjs

import health from '../api/health.js';
import keywordDensity from '../api/keyword-density.js';
import densityUrl from '../api/density-url.js';
import pageSpeed from '../api/page-speed.js';
import competitorAnalyze from '../api/competitor-analyze.js';

function mockReq({ method = 'GET', query = {}, body = undefined } = {}) {
  return { method, query, body };
}

function mockRes() {
  const res = {
    _status: 200,
    _headers: {},
    _body: '',
    status(code) {
      this._status = code;
      return this;
    },
    setHeader(k, v) {
      this._headers[k] = v;
      return this;
    },
    send(body) {
      this._body = body;
      return this;
    },
  };
  return res;
}

async function run(name, handler, req) {
  const res = mockRes();
  await handler(req, res);
  const preview = res._body.length > 200 ? res._body.slice(0, 200) + '…' : res._body;
  console.log(`[${name}] ${res._status} ${preview}`);
}

console.log('— smoke tests —');
await run('health', health, mockReq());
await run('keyword-density (ok)', keywordDensity, mockReq({
  method: 'POST',
  body: { text: 'The quick brown fox jumps over the lazy dog. The quick brown fox jumps again over the dog.', target: 'fox' },
}));
await run('keyword-density (empty)', keywordDensity, mockReq({
  method: 'POST',
  body: { text: '' },
}));
await run('keyword-density (GET should 405)', keywordDensity, mockReq({ method: 'GET' }));

console.log('— network endpoints (require internet) —');
try {
  await run('density-url', densityUrl, mockReq({
    method: 'POST',
    body: { url: 'example.com' },
  }));
} catch (e) {
  console.log('[density-url] threw:', e.message);
}
try {
  await run('page-speed', pageSpeed, mockReq({
    method: 'GET',
    query: { url: 'example.com', strategy: 'mobile' },
  }));
} catch (e) {
  console.log('[page-speed] threw:', e.message);
}
try {
  await run('competitor-analyze', competitorAnalyze, mockReq({
    method: 'POST',
    body: { primary_url: 'example.com', competitor_urls: ['example.org'] },
  }));
} catch (e) {
  console.log('[competitor-analyze] threw:', e.message);
}
console.log('— done —');

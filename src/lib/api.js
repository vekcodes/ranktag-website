// Frontend API client for the RankedTag tools backend.
//
// On Vercel, frontend and serverless functions live on the same domain,
// so we default to the relative '/api' path. For local dev with a separate
// backend, set VITE_API_URL in .env (e.g. http://localhost:8000).

const RAW = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
const API_BASE = RAW || ''; // empty = same origin → relative /api/* requests

export const apiConfigured = true;

async function request(path, init) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init && init.headers),
    },
  });
  const text = await res.text();
  let body;
  try {
    body = text ? JSON.parse(text) : {};
  } catch {
    body = { detail: text };
  }
  if (!res.ok) {
    const err = new Error(body.detail || `Request failed: ${res.status}`);
    err.status = res.status;
    err.body = body;
    throw err;
  }
  return body;
}

export const api = {
  pageSpeed: (url, strategy = 'mobile') =>
    request(`/api/page-speed?url=${encodeURIComponent(url)}&strategy=${strategy}`),

  keywordDensity: (text, target = '') =>
    request('/api/keyword-density', {
      method: 'POST',
      body: JSON.stringify({ text, target: target || null }),
    }),

  // Backward-compatible: `backlinks` and `authority` hit the same endpoint.
  authority: (domain) =>
    request(`/api/authority?domain=${encodeURIComponent(domain)}`),

  backlinks: (domain) =>
    request(`/api/backlinks?domain=${encodeURIComponent(domain)}`),

  health: () => request('/api/health'),
};

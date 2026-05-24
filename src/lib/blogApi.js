// Blog API client (public reads + authenticated admin CRUD).
// Cookie-based auth — requests include the session cookie automatically.

export class ApiUnreachableError extends Error {
  constructor() {
    super(
      'API not reachable. The /api functions only run under `vercel dev` — ' +
        'start the app with `vercel dev` (not `npm run dev`).'
    );
    this.code = 'API_UNREACHABLE';
  }
}

async function request(path, init) {
  let res;
  try {
    res = await fetch(path, {
      credentials: 'same-origin',
      ...init,
      headers: { 'Content-Type': 'application/json', ...(init && init.headers) },
    });
  } catch {
    throw new ApiUnreachableError(); // network/connection failure
  }

  const ctype = res.headers.get('content-type') || '';
  const text = await res.text();

  // Vite-only dev (no `vercel dev`) serves index.html for /api/* — detect it.
  if (!ctype.includes('application/json')) {
    if (/^\s*<(?:!doctype|html)/i.test(text)) throw new ApiUnreachableError();
  }

  let body;
  try {
    body = text ? JSON.parse(text) : {};
  } catch {
    throw new ApiUnreachableError();
  }
  if (!res.ok) {
    const err = new Error(body.detail || `Request failed: ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return body;
}

export const blogApi = {
  // ── Public ──
  list: (limit = 6) => request(`/api/blog/posts?limit=${limit}`),

  // ── Auth ──
  session: () => request('/api/admin/login', { method: 'GET' }),
  login: (password) =>
    request('/api/admin/login', {
      method: 'POST',
      body: JSON.stringify({ password }),
    }),
  logout: () => request('/api/admin/login', { method: 'DELETE' }),

  // ── Admin CRUD ──
  adminList: () => request('/api/admin/posts'),
  get: (id) => request(`/api/admin/posts?id=${id}`),
  create: (data) =>
    request('/api/admin/posts', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) =>
    request(`/api/admin/posts?id=${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  remove: (id) => request(`/api/admin/posts?id=${id}`, { method: 'DELETE' }),

  upload: ({ filename, alt, dataBase64, type, width, height }) =>
    request('/api/admin/upload', {
      method: 'POST',
      body: JSON.stringify({ filename, alt, dataBase64, type, width, height }),
    }),
};

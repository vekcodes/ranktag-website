// Admin auth. POST {password} -> session cookie. GET -> session check. DELETE -> logout.
import {
  adminConfigured, passwordOk, issueToken, sessionCookie, clearCookie, requireAdmin,
} from '../_lib/auth.js';
import { sendJson, sendError, httpError, readBody } from '../_lib/http.js';

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      await requireAdmin(req);
      return sendJson(res, 200, { authenticated: true });
    }

    if (req.method === 'DELETE') {
      res.setHeader('Set-Cookie', clearCookie());
      return sendJson(res, 200, { ok: true });
    }

    if (req.method !== 'POST') throw httpError(405, 'Method not allowed');
    if (!adminConfigured()) {
      throw httpError(503, 'Admin not configured. Set BLOG_ADMIN_PASSWORD and BLOG_AUTH_SECRET.');
    }

    const { password } = readBody(req);
    if (!passwordOk(password)) throw httpError(401, 'Incorrect password');

    const token = await issueToken();
    res.setHeader('Set-Cookie', sessionCookie(token));
    sendJson(res, 200, { ok: true });
  } catch (err) {
    sendError(res, err);
  }
}

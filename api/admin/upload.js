// Admin: store an already-compressed image (client compresses with our own
// Canvas algorithm — see src/lib/imageCompress.js — so no sharp/native deps).
import { put } from '@vercel/blob';
import { requireAdmin } from '../_lib/auth.js';
import { slugify } from '../_lib/blog.js';
import { sendJson, sendError, httpError, readBody } from '../_lib/http.js';

const EXT = { 'image/webp': 'webp', 'image/jpeg': 'jpg', 'image/png': 'png' };

export default async function handler(req, res) {
  try {
    await requireAdmin(req);
    if (req.method !== 'POST') throw httpError(405, 'Method not allowed');
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      throw httpError(503, 'Vercel Blob not configured (BLOB_READ_WRITE_TOKEN missing).');
    }

    const { filename, alt, dataBase64, type, width, height } = readBody(req);

    // SEO rule: every image must ship with descriptive alt text.
    if (!alt || String(alt).trim().length < 3) {
      throw httpError(422, 'Alt text is required (min 3 chars) for SEO/accessibility.');
    }
    if (!dataBase64) throw httpError(400, 'dataBase64 is required');

    const contentType = EXT[type] ? type : 'image/webp';
    const buf = Buffer.from(String(dataBase64).split(',').pop(), 'base64');
    if (!buf.length) throw httpError(400, 'Empty image data');
    if (buf.length > 5 * 1024 * 1024) {
      throw httpError(413, 'Compressed image still too large — pick a smaller source image.');
    }

    const base =
      slugify(String(filename || 'image').replace(/\.[a-z0-9]+$/i, '')) || 'image';
    const key = `blog/${Date.now()}-${base}.${EXT[contentType]}`;

    const blob = await put(key, buf, {
      access: 'public',
      contentType,
      cacheControlMaxAge: 31536000,
    });

    sendJson(res, 201, {
      url: blob.url,
      width: width || null,
      height: height || null,
      bytes: buf.length,
      alt: String(alt).trim(),
    });
  } catch (err) {
    sendError(res, err);
  }
}

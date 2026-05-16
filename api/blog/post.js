// Public: single published post. GET /api/blog/post?slug=...
import { db } from '../_lib/db.js';
import { sendJson, sendError, httpError } from '../_lib/http.js';

export default async function handler(req, res) {
  try {
    if (req.method !== 'GET') throw httpError(405, 'Method not allowed');
    const url = new URL(req.url, 'http://x');
    const slug = (url.searchParams.get('slug') || '').trim();
    if (!slug) throw httpError(400, 'slug is required');

    const sql = db();
    const [post] = await sql`
      SELECT slug, title, excerpt, content_html, cover_image_url, cover_image_alt,
             meta_title, meta_description, og_image_url, canonical_url,
             tags, author, reading_minutes, published_at, updated_at
      FROM posts
      WHERE slug = ${slug} AND status = 'published' AND published_at <= now()
      LIMIT 1`;
    if (!post) throw httpError(404, 'Post not found');

    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=86400');
    sendJson(res, 200, { post });
  } catch (err) {
    sendError(res, err);
  }
}

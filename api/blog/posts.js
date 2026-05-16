// Public: list published posts. GET /api/blog/posts?limit=&offset=&tag=
import { db } from '../_lib/db.js';
import { sendJson, sendError, httpError } from '../_lib/http.js';

export default async function handler(req, res) {
  try {
    if (req.method !== 'GET') throw httpError(405, 'Method not allowed');
    const url = new URL(req.url, 'http://x');
    const limit = Math.min(50, Math.max(1, parseInt(url.searchParams.get('limit') || '12', 10)));
    const offset = Math.max(0, parseInt(url.searchParams.get('offset') || '0', 10));
    const tag = (url.searchParams.get('tag') || '').trim();

    const sql = db();
    const rows = tag
      ? await sql`
          SELECT slug, title, excerpt, cover_image_url, cover_image_alt,
                 tags, author, reading_minutes, published_at
          FROM posts
          WHERE status = 'published' AND published_at <= now() AND ${tag} = ANY(tags)
          ORDER BY published_at DESC
          LIMIT ${limit} OFFSET ${offset}`
      : await sql`
          SELECT slug, title, excerpt, cover_image_url, cover_image_alt,
                 tags, author, reading_minutes, published_at
          FROM posts
          WHERE status = 'published' AND published_at <= now()
          ORDER BY published_at DESC
          LIMIT ${limit} OFFSET ${offset}`;

    // Cache at the edge: fast for readers, refreshes in the background.
    res.setHeader('Cache-Control', 's-maxage=120, stale-while-revalidate=600');
    sendJson(res, 200, { posts: rows });
  } catch (err) {
    sendError(res, err);
  }
}

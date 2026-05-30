// Public blog data.
//   GET /api/blog/posts?limit=&offset=&tag=   -> list of published posts
//   GET /api/blog/posts?slug=...              -> single published post
import { db } from '../_lib/db.js';
import { sendJson, sendError, httpError } from '../_lib/http.js';

export default async function handler(req, res) {
  try {
    if (req.method !== 'GET') throw httpError(405, 'Method not allowed');
    const url = new URL(req.url, 'http://x');
    const slug = (url.searchParams.get('slug') || '').trim();
    const sql = db();

    // ── Single post by slug ──
    if (slug) {
      const [post] = await sql`
        SELECT slug, title, excerpt, content_html, cover_image_url, cover_image_alt,
               meta_title, meta_description, og_image_url, canonical_url, custom_jsonld,
               tags, author, reading_minutes, published_at, updated_at
        FROM posts
        WHERE slug = ${slug} AND status = 'published' AND published_at <= now()
        LIMIT 1`;
      if (!post) throw httpError(404, 'Post not found');
      res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=86400');
      return sendJson(res, 200, { post });
    }

    // ── List published posts ──
    const limit = Math.min(50, Math.max(1, parseInt(url.searchParams.get('limit') || '12', 10)));
    const offset = Math.max(0, parseInt(url.searchParams.get('offset') || '0', 10));
    const tag = (url.searchParams.get('tag') || '').trim();

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

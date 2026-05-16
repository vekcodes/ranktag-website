// Admin: GET list all posts (incl. drafts) · POST create. Auth required.
import { db } from '../_lib/db.js';
import { requireAdmin } from '../_lib/auth.js';
import { normalizePostInput } from '../_lib/blog.js';
import { sendJson, sendError, httpError, readBody } from '../_lib/http.js';

export default async function handler(req, res) {
  try {
    await requireAdmin(req);
    const sql = db();

    if (req.method === 'GET') {
      const rows = await sql`
        SELECT id, slug, title, excerpt, status, tags, author,
               reading_minutes, published_at, updated_at, created_at
        FROM posts
        ORDER BY updated_at DESC
        LIMIT 200`;
      return sendJson(res, 200, { posts: rows });
    }

    if (req.method === 'POST') {
      const p = normalizePostInput(readBody(req));
      const publishedAt =
        p.status === 'published' ? new Date().toISOString() : null;

      const [exists] = await sql`SELECT 1 FROM posts WHERE slug = ${p.slug}`;
      if (exists) throw httpError(409, `Slug "${p.slug}" already exists`);

      const [row] = await sql`
        INSERT INTO posts (
          slug, title, excerpt, content_html, content_md, source_format,
          cover_image_url, cover_image_alt, meta_title, meta_description,
          og_image_url, canonical_url, tags, author, status,
          reading_minutes, published_at
        ) VALUES (
          ${p.slug}, ${p.title}, ${p.excerpt}, ${p.content_html}, ${p.content_md},
          ${p.source_format}, ${p.cover_image_url}, ${p.cover_image_alt},
          ${p.meta_title}, ${p.meta_description}, ${p.og_image_url},
          ${p.canonical_url}, ${p.tags}, ${p.author}, ${p.status},
          ${p.reading_minutes}, ${publishedAt}
        )
        RETURNING id, slug, status`;
      return sendJson(res, 201, { post: row });
    }

    throw httpError(405, 'Method not allowed');
  } catch (err) {
    sendError(res, err);
  }
}

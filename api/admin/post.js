// Admin: GET / PUT / DELETE a single post by id. Auth required.
import { db } from '../_lib/db.js';
import { requireAdmin } from '../_lib/auth.js';
import { normalizePostInput } from '../_lib/blog.js';
import { sendJson, sendError, httpError, readBody } from '../_lib/http.js';

export default async function handler(req, res) {
  try {
    await requireAdmin(req);
    const sql = db();
    const url = new URL(req.url, 'http://x');
    const id = parseInt(url.searchParams.get('id') || '0', 10);
    if (!id) throw httpError(400, 'id is required');

    if (req.method === 'GET') {
      const [row] = await sql`SELECT * FROM posts WHERE id = ${id}`;
      if (!row) throw httpError(404, 'Post not found');
      return sendJson(res, 200, { post: row });
    }

    if (req.method === 'PUT') {
      const [current] = await sql`SELECT id, status, published_at FROM posts WHERE id = ${id}`;
      if (!current) throw httpError(404, 'Post not found');

      const p = normalizePostInput(readBody(req));
      const [clash] = await sql`
        SELECT 1 FROM posts WHERE slug = ${p.slug} AND id <> ${id}`;
      if (clash) throw httpError(409, `Slug "${p.slug}" already exists`);

      // Set published_at the first time a post goes live; keep it thereafter.
      const publishedAt =
        p.status === 'published'
          ? current.published_at || new Date().toISOString()
          : null;

      const [row] = await sql`
        UPDATE posts SET
          slug = ${p.slug}, title = ${p.title}, excerpt = ${p.excerpt},
          content_html = ${p.content_html}, content_md = ${p.content_md},
          source_format = ${p.source_format},
          cover_image_url = ${p.cover_image_url},
          cover_image_alt = ${p.cover_image_alt},
          meta_title = ${p.meta_title}, meta_description = ${p.meta_description},
          og_image_url = ${p.og_image_url}, canonical_url = ${p.canonical_url},
          tags = ${p.tags}, author = ${p.author}, status = ${p.status},
          reading_minutes = ${p.reading_minutes}, published_at = ${publishedAt},
          updated_at = now()
        WHERE id = ${id}
        RETURNING id, slug, status`;
      return sendJson(res, 200, { post: row });
    }

    if (req.method === 'DELETE') {
      const [row] = await sql`DELETE FROM posts WHERE id = ${id} RETURNING id`;
      if (!row) throw httpError(404, 'Post not found');
      return sendJson(res, 200, { ok: true });
    }

    throw httpError(405, 'Method not allowed');
  } catch (err) {
    sendError(res, err);
  }
}

// Admin posts CRUD. Auth required.
//   GET    /api/admin/posts          -> list all (incl. drafts)
//   POST   /api/admin/posts          -> create
//   GET    /api/admin/posts?id=...   -> single post (full row)
//   PUT    /api/admin/posts?id=...   -> update
//   DELETE /api/admin/posts?id=...   -> delete
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

    // ── Single-post operations (id present) ──
    if (id) {
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
            custom_jsonld = ${p.custom_jsonld},
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
    }

    // ── Collection operations (no id) ──
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
          og_image_url, canonical_url, custom_jsonld, tags, author, status,
          reading_minutes, published_at
        ) VALUES (
          ${p.slug}, ${p.title}, ${p.excerpt}, ${p.content_html}, ${p.content_md},
          ${p.source_format}, ${p.cover_image_url}, ${p.cover_image_alt},
          ${p.meta_title}, ${p.meta_description}, ${p.og_image_url},
          ${p.canonical_url}, ${p.custom_jsonld}, ${p.tags}, ${p.author}, ${p.status},
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

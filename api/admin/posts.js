// Admin posts CRUD. Auth required.
//   GET    /api/admin/posts          -> list all (incl. drafts)
//   POST   /api/admin/posts          -> create
//   GET    /api/admin/posts?id=...   -> single post (full row)
//   PUT    /api/admin/posts?id=...   -> update
//   DELETE /api/admin/posts?id=...   -> delete
import { db, schedulingSupported } from '../_lib/db.js';
import { requireAdmin } from '../_lib/auth.js';
import { normalizePostInput } from '../_lib/blog.js';
import { sendJson, sendError, httpError, readBody } from '../_lib/http.js';

const MIGRATION_NEEDED =
  'Scheduled publishing needs a one-off database migration. Run ' +
  '`node scripts/migrate-blog.mjs`, or add the column directly: ' +
  'ALTER TABLE posts ADD COLUMN IF NOT EXISTS publish_at TIMESTAMPTZ;';

/**
 * `published_at` is the post's permanent public publication date: it feeds
 * `datePublished` in the BlogPosting schema and the blog index sort order, so
 * once a post has actually been public it must never move again.
 *
 *  - draft     -> keep whatever is there. Reverting a live post to a draft must
 *                 not destroy its original date (the old code nulled it).
 *  - published -> stamp now() the first time it goes live; keep it thereafter.
 *  - scheduled -> stamp the intended go-live instant, so sort order and
 *                 datePublished are already correct the moment the post
 *                 appears, with no write needed at read time. Rescheduling a
 *                 post that has never been public moves it; one that HAS been
 *                 public keeps its original date.
 */
function resolvePublishedAt(p, currentPublishedAt) {
  const wasLive =
    Boolean(currentPublishedAt) &&
    new Date(currentPublishedAt).getTime() <= Date.now();
  if (p.status === 'published') {
    return currentPublishedAt || new Date().toISOString();
  }
  if (p.status === 'scheduled') {
    return wasLive ? currentPublishedAt : p.publish_at;
  }
  return currentPublishedAt || null;
}

export default async function handler(req, res) {
  try {
    await requireAdmin(req);
    const sql = db();
    // Whether the publish_at column exists. Everything below stays working
    // without it — you simply cannot schedule until the migration is run.
    const sched = await schedulingSupported(sql);
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
        const schedCol = sql.unsafe(sched ? 'publish_at' : 'NULL::timestamptz AS publish_at');
        const [current] = await sql`
          SELECT id, status, published_at, ${schedCol} FROM posts WHERE id = ${id}`;
        if (!current) throw httpError(404, 'Post not found');

        const p = normalizePostInput(readBody(req));
        const [clash] = await sql`
          SELECT 1 FROM posts WHERE slug = ${p.slug} AND id <> ${id}`;
        if (clash) throw httpError(409, `Slug "${p.slug}" already exists`);

        // A schedule may only point at the future. Re-saving an UNCHANGED
        // schedule is always allowed, so editing a scheduled post — or one
        // whose time has simply passed and is now live — never trips this.
        if (p.status === 'scheduled' && !sched) throw httpError(503, MIGRATION_NEEDED);
        const currentPublishAt = current.publish_at
          ? new Date(current.publish_at).toISOString()
          : null;
        if (
          p.status === 'scheduled' &&
          p.publish_at !== currentPublishAt &&
          Date.parse(p.publish_at) <= Date.now()
        ) {
          throw httpError(400, 'Scheduled publish time must be in the future.');
        }

        const publishedAt = resolvePublishedAt(p, current.published_at);

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
            faqs = ${JSON.stringify(p.faqs)}::jsonb,
            tags = ${p.tags}, author = ${p.author}, status = ${p.status},
            reading_minutes = ${p.reading_minutes}, published_at = ${publishedAt},
            ${sched ? sql`publish_at = ${p.publish_at},` : sql.unsafe('')}
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
      // Drafts first, then scheduled (most imminent first), then published
      // (newest first) — the posts still awaiting a decision sit at the top.
      const listSchedCol = sql.unsafe(
        sched ? 'publish_at' : 'NULL::timestamptz AS publish_at'
      );
      const schedSort = sql.unsafe(
        sched ? "CASE WHEN status = 'scheduled' THEN publish_at END ASC," : ''
      );
      const rows = await sql`
        SELECT id, slug, title, excerpt, status, tags, author,
               reading_minutes, published_at, ${listSchedCol}, updated_at, created_at
        FROM posts
        ORDER BY
          CASE status WHEN 'draft' THEN 0 WHEN 'scheduled' THEN 1 ELSE 2 END,
          ${schedSort}
          CASE WHEN status = 'published' THEN published_at END DESC NULLS LAST,
          updated_at DESC
        LIMIT 200`;
      return sendJson(res, 200, { posts: rows });
    }

    if (req.method === 'POST') {
      const p = normalizePostInput(readBody(req));
      if (p.status === 'scheduled' && !sched) throw httpError(503, MIGRATION_NEEDED);
      if (p.status === 'scheduled' && Date.parse(p.publish_at) <= Date.now()) {
        throw httpError(400, 'Scheduled publish time must be in the future.');
      }
      const publishedAt = resolvePublishedAt(p, null);

      const [exists] = await sql`SELECT 1 FROM posts WHERE slug = ${p.slug}`;
      if (exists) throw httpError(409, `Slug "${p.slug}" already exists`);

      const [row] = await sql`
        INSERT INTO posts (
          slug, title, excerpt, content_html, content_md, source_format,
          cover_image_url, cover_image_alt, meta_title, meta_description,
          og_image_url, canonical_url, custom_jsonld, faqs, tags, author, status,
          reading_minutes, published_at
        ) VALUES (
          ${p.slug}, ${p.title}, ${p.excerpt}, ${p.content_html}, ${p.content_md},
          ${p.source_format}, ${p.cover_image_url}, ${p.cover_image_alt},
          ${p.meta_title}, ${p.meta_description}, ${p.og_image_url},
          ${p.canonical_url}, ${p.custom_jsonld}, ${JSON.stringify(p.faqs)}::jsonb,
          ${p.tags}, ${p.author}, ${p.status},
          ${p.reading_minutes}, ${publishedAt}
        )
        RETURNING id, slug, status`;
      // Set the schedule separately, so creating a post never depends on the
      // column being there. Only runs when the post is actually scheduled.
      if (sched && p.publish_at) {
        await sql`UPDATE posts SET publish_at = ${p.publish_at} WHERE id = ${row.id}`;
      }
      return sendJson(res, 201, { post: row });
    }

    throw httpError(405, 'Method not allowed');
  } catch (err) {
    sendError(res, err);
  }
}

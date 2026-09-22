// SSR for /blog (index) and /blog/:slug — full HTML, ISR-cached at the edge.
import { db, dbConfigured, visibleWhere, schedulingSupported } from './_lib/db.js';
import { articleJsonLd } from './_lib/blog.js';
import { requireAdmin } from './_lib/auth.js';
import { renderIndex, renderPost, renderNotFound } from './_lib/render.js';

function html(res, status, markup, cache) {
  res.status(status);
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', cache);
  res.send(markup);
}

export default async function handler(req, res) {
  try {
    const url = new URL(req.url, 'http://x');
    const parts = url.pathname.replace(/\/+$/, '').split('/').filter(Boolean);
    // ["blog"] -> index ; ["blog","<slug>"] -> post
    const slug = parts[0] === 'blog' ? parts[1] : parts[0];

    if (!dbConfigured()) {
      return html(res, 200, renderIndex([]), 'no-store');
    }
    const sql = db();
    // Raw fragment, chosen from what the schema actually supports. See
    // visibleWhere() in _lib/db.js — this is what keeps the blog up if the
    // publish_at migration has not been run.
    const VISIBLE = sql.unsafe(await visibleWhere(sql));

    if (!slug) {
      const tag = (url.searchParams.get('tag') || '').trim();
      const rows = tag
        ? await sql`
            SELECT slug,title,excerpt,cover_image_url,cover_image_alt,
                   reading_minutes,published_at,author
            FROM posts
            WHERE ${VISIBLE} AND ${tag}=ANY(tags)
            ORDER BY published_at DESC LIMIT 60`
        : await sql`
            SELECT slug,title,excerpt,cover_image_url,cover_image_alt,
                   reading_minutes,published_at,author
            FROM posts
            WHERE ${VISIBLE}
            ORDER BY published_at DESC LIMIT 60`;
      return html(
        res, 200, renderIndex(rows, { tag }),
        's-maxage=120, stale-while-revalidate=600'
      );
    }

    // ── Preview ──
    // ?preview=1 serves a draft or not-yet-due scheduled post to a logged-in
    // admin, reusing the existing CMS session cookie — no new auth surface and
    // no public preview link. Anyone without a valid session gets a 401, never
    // a 200 with the content. Responses are no-store, so a preview can never
    // be cached at the edge and served to a reader.
    if (url.searchParams.get('preview') === '1') {
      try {
        await requireAdmin(req);
      } catch {
        return html(res, 401, renderNotFound(), 'no-store');
      }
      // publish_at may not exist yet; select a NULL of the right type instead
      // so preview keeps working either way.
      const schedCol = sql.unsafe(
        (await schedulingSupported(sql))
          ? 'publish_at'
          : 'NULL::timestamptz AS publish_at'
      );
      const [draft] = await sql`
        SELECT slug,title,excerpt,content_html,cover_image_url,cover_image_alt,
               meta_title,meta_description,og_image_url,canonical_url,custom_jsonld,
               faqs,tags,author,reading_minutes,published_at,updated_at,
               status,${schedCol}
        FROM posts WHERE slug=${slug} LIMIT 1`;
      if (!draft) return html(res, 404, renderNotFound(), 'no-store');
      return html(
        res, 200,
        renderPost(draft, articleJsonLd(draft), { preview: true }),
        'no-store'
      );
    }

    const [post] = await sql`
      SELECT slug,title,excerpt,content_html,cover_image_url,cover_image_alt,
             meta_title,meta_description,og_image_url,canonical_url,custom_jsonld,
             faqs,tags,author,reading_minutes,published_at,updated_at
      FROM posts
      WHERE slug=${slug} AND ${VISIBLE}
      LIMIT 1`;

    if (!post) {
      // `no-store` is load-bearing for scheduled publishing: a post that is not
      // yet due 404s, and because that 404 is never cached, the URL starts
      // resolving the very minute publish_at passes. Do not add an s-maxage here.
      return html(res, 404, renderNotFound(), 'no-store');
    }

    // Pool for the related-posts module. Slug/title/excerpt/tags only, so it
    // stays a cheap second query on an already-cached page.
    const related = await sql`
      SELECT slug, title, excerpt, tags, published_at
      FROM posts
      WHERE ${VISIBLE} AND slug <> ${slug}
      ORDER BY published_at DESC LIMIT 60`;

    return html(
      res, 200,
      renderPost(post, articleJsonLd(post), { related }),
      's-maxage=300, stale-while-revalidate=86400'
    );
  } catch (err) {
    // Never 500 a crawler into deindexing — serve a soft page.
    res.status(503);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    res.send(renderNotFound());
  }
}

// SSR for /blog (index) and /blog/:slug — full HTML, ISR-cached at the edge.
import { db, dbConfigured } from './_lib/db.js';
import { articleJsonLd } from './_lib/blog.js';
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

    if (!slug) {
      const tag = (url.searchParams.get('tag') || '').trim();
      const rows = tag
        ? await sql`
            SELECT slug,title,excerpt,cover_image_url,cover_image_alt,
                   reading_minutes,published_at,author
            FROM posts
            WHERE status='published' AND published_at<=now() AND ${tag}=ANY(tags)
            ORDER BY published_at DESC LIMIT 60`
        : await sql`
            SELECT slug,title,excerpt,cover_image_url,cover_image_alt,
                   reading_minutes,published_at,author
            FROM posts
            WHERE status='published' AND published_at<=now()
            ORDER BY published_at DESC LIMIT 60`;
      return html(
        res, 200, renderIndex(rows),
        's-maxage=120, stale-while-revalidate=600'
      );
    }

    const [post] = await sql`
      SELECT slug,title,excerpt,content_html,cover_image_url,cover_image_alt,
             meta_title,meta_description,og_image_url,canonical_url,custom_jsonld,
             faqs,tags,author,reading_minutes,published_at,updated_at
      FROM posts
      WHERE slug=${slug} AND status='published' AND published_at<=now()
      LIMIT 1`;

    if (!post) {
      return html(res, 404, renderNotFound(), 'no-store');
    }

    return html(
      res, 200,
      renderPost(post, articleJsonLd(post)),
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

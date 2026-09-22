// RSS 2.0 feed of published posts (helps discovery + syndication).
import { db, dbConfigured, visibleWhere } from './_lib/db.js';
import { SITE_URL, SITE_NAME, escapeHtml } from './_lib/blog.js';

export default async function handler(req, res) {
  let posts = [];
  try {
    if (dbConfigured()) {
      const sql = db();
      // Degrades to the pre-scheduling condition when publish_at is absent.
      const VISIBLE = sql.unsafe(await visibleWhere(sql));
      posts = await sql`
        SELECT slug,title,excerpt,published_at
        FROM posts
        WHERE ${VISIBLE}
        ORDER BY published_at DESC LIMIT 50`;
    }
  } catch {
    /* empty feed */
  }

  const items = posts
    .map(
      (p) => `<item>
<title>${escapeHtml(p.title)}</title>
<link>${SITE_URL}/blog/${p.slug}</link>
<guid isPermaLink="true">${SITE_URL}/blog/${p.slug}</guid>
<description>${escapeHtml(p.excerpt)}</description>
<pubDate>${new Date(p.published_at).toUTCString()}</pubDate>
</item>`
    )
    .join('');

  res.status(200);
  res.setHeader('Content-Type', 'application/rss+xml; charset=utf-8');
  // 300s so a scheduled post reaches the feed within ~5 minutes of going
  // live. Publishing is decided at read time, so the only lag is this cache.
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=86400');
  res.send(`<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel>
<title>${SITE_NAME} Blog</title>
<link>${SITE_URL}/blog</link>
<description>SEO, GEO &amp; inbound growth for B2B SaaS founders.</description>
<language>en-us</language>
${items}
</channel></rss>`);
}

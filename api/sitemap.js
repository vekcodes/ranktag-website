// Dynamic sitemap.xml — regenerated on every request (cached ~5 min at the edge).
//
// Blog posts: added AUTOMATICALLY from the database below — publish a post and
// it appears in the sitemap on the next crawl. No edits needed here.
//
// Static/marketing pages: add ONE line to the STATIC array below whenever you
// add a new public route in src/App.jsx. That's the only manual step.
import { db, dbConfigured } from './_lib/db.js';
import { SITE_URL } from './_lib/blog.js';

const STATIC = [
  { loc: '/', priority: '1.0', freq: 'weekly' },
  { loc: '/apply', priority: '0.9', freq: 'monthly' },
  { loc: '/case-study/sendr', priority: '0.8', freq: 'monthly' },
  { loc: '/blog', priority: '0.9', freq: 'daily' },
  { loc: '/keyword-density-checker', priority: '0.7', freq: 'monthly' },
  { loc: '/domain-authority-checker', priority: '0.7', freq: 'monthly' },
  { loc: '/page-speed-checker', priority: '0.7', freq: 'monthly' },
  { loc: '/competitor-analysis', priority: '0.7', freq: 'monthly' },
];

export default async function handler(req, res) {
  let posts = [];
  try {
    if (dbConfigured()) {
      posts = await db()`
        SELECT slug, GREATEST(updated_at, published_at) AS lastmod
        FROM posts
        WHERE status='published' AND published_at<=now()
        ORDER BY published_at DESC LIMIT 5000`;
    }
  } catch {
    /* fall back to static-only sitemap */
  }

  const urls = [
    ...STATIC.map(
      (s) =>
        `<url><loc>${SITE_URL}${s.loc}</loc><changefreq>${s.freq}</changefreq><priority>${s.priority}</priority></url>`
    ),
    ...posts.map(
      (p) =>
        `<url><loc>${SITE_URL}/blog/${p.slug}</loc><lastmod>${new Date(
          p.lastmod
        ).toISOString()}</lastmod><changefreq>monthly</changefreq><priority>0.8</priority></url>`
    ),
  ].join('');

  res.status(200);
  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=86400');
  res.send(
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`
  );
}

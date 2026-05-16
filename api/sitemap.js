// Dynamic sitemap.xml — static pages + every published post.
import { db, dbConfigured } from './_lib/db.js';
import { SITE_URL } from './_lib/blog.js';

const STATIC = [
  { loc: '/', priority: '1.0', freq: 'weekly' },
  { loc: '/blog', priority: '0.9', freq: 'daily' },
  { loc: '/keyword-density', priority: '0.7', freq: 'monthly' },
  { loc: '/backlink-checker', priority: '0.7', freq: 'monthly' },
  { loc: '/page-speed', priority: '0.7', freq: 'monthly' },
  { loc: '/competitor', priority: '0.7', freq: 'monthly' },
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
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
  res.send(
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`
  );
}

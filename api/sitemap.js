// Dynamic sitemap.xml — regenerated on every request (cached ~5 min at the edge).
//
// Blog posts: added AUTOMATICALLY from the database below — publish a post and
// it appears in the sitemap on the next crawl. No edits needed here.
//
// Static/marketing pages: add ONE line to the STATIC array below whenever you
// add a new public route in src/App.jsx. That's the only manual step.
import { db, dbConfigured } from './_lib/db.js';
import { SITE_URL } from './_lib/blog.js';

// Last meaningful content change for the static marketing/tool pages. Bump this
// when you materially edit those pages so <lastmod> stays truthful. (The blog
// index uses the latest post's date instead; posts carry their own lastmod.)
const STATIC_LASTMOD = '2026-06-04';

const STATIC = [
  { loc: '/', priority: '1.0', freq: 'weekly' },
  { loc: '/apply', priority: '0.9', freq: 'monthly' },
  { loc: '/case-study/sendr', priority: '0.8', freq: 'monthly' },
  { loc: '/llm-info', priority: '0.6', freq: 'monthly' },
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

  // The blog index's freshness tracks the most-recently-changed post (if any).
  const blogLastmod = posts.length
    ? new Date(Math.max(...posts.map((p) => new Date(p.lastmod).getTime())))
        .toISOString()
        .slice(0, 10)
    : STATIC_LASTMOD;

  const urls = [
    ...STATIC.map((s) => {
      const lastmod = s.loc === '/blog' ? blogLastmod : STATIC_LASTMOD;
      return `<url><loc>${SITE_URL}${s.loc}</loc><lastmod>${lastmod}</lastmod><changefreq>${s.freq}</changefreq><priority>${s.priority}</priority></url>`;
    }),
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

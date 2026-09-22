// Dynamic sitemap.xml — regenerated on every request (cached ~5 min at the edge).
//
// Blog posts: added AUTOMATICALLY from the database below — publish a post and
// it appears in the sitemap on the next crawl. No edits needed here.
//
// Static/marketing pages: add ONE line to the STATIC array below whenever you
// add a new public route in src/App.jsx. That's the only manual step.
import { db, dbConfigured, visibleWhere } from './_lib/db.js';
import { SITE_URL } from './_lib/blog.js';

// Last meaningful content change for the static marketing/tool pages. Bump this
// when you materially edit those pages so <lastmod> stays truthful. (The blog
// index uses the latest post's date instead; posts carry their own lastmod.)
const STATIC_LASTMOD = '2026-07-11';

// Marketing pages, split by kind so each lands in the right child sitemap.
// No <priority> or <changefreq>: Google has stated publicly it ignores both,
// and a signal nobody reads is just weight in the file.
const SERVICES = [
  '/services',
  '/services/b2b-saas-seo',
  '/services/ai-seo',
  '/services/generative-engine-optimization',
  '/services/answer-engine-optimization',
  '/services/technical-seo',
  '/services/saas-content-marketing',
];

const PAGES = [
  '/',
  '/apply',
  '/case-study/sendr',
  '/about/bhushan-raj-shakya',
  '/llm-info',
  '/blog',
  '/keyword-density-checker',
  '/domain-authority-checker',
  '/page-speed-checker',
  '/competitor-analysis',
];

const urlset = (entries) =>
  `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">` +
  entries.map((e) => `<url><loc>${e.loc}</loc><lastmod>${e.lastmod}</lastmod></url>`).join('') +
  `</urlset>`;

function send(res, xml, cache = 's-maxage=300, stale-while-revalidate=86400') {
  res.status(200);
  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', cache);
  res.send(xml);
}

/**
 * Serves the sitemap index and its three children:
 *   /sitemap.xml          -> index, referencing the three below
 *   /sitemap-posts.xml    -> blog posts, lastmod from the database
 *   /sitemap-services.xml -> the six service pages + /services
 *   /sitemap-pages.xml    -> home, apply, case study, tools, /blog
 *
 * lastmod is never the build or request time. Posts carry their own
 * GREATEST(updated_at, published_at); marketing pages use STATIC_LASTMOD,
 * a constant bumped by hand when those pages materially change. A sitemap
 * whose dates all move on every deploy teaches Google to ignore the field.
 *
 * Only 200-status, indexable, canonical URLs appear. No ?tag= URLs (they are
 * noindex), no redirects, no drafts, no scheduled posts before their time.
 */
async function posts() {
  try {
    if (!dbConfigured()) return [];
    const sql = db();
    const VISIBLE = sql.unsafe(await visibleWhere(sql));
    return await sql`
      SELECT slug, GREATEST(updated_at, published_at) AS lastmod
      FROM posts
      WHERE ${VISIBLE}
      ORDER BY published_at DESC LIMIT 5000`;
  } catch {
    return [];
  }
}

export default async function handler(req, res) {
  const which = new URL(req.url, 'http://x').pathname.replace(/^\/|\.xml$/g, '');

  if (which === 'sitemap-services') {
    return send(res, urlset(SERVICES.map((loc) => ({ loc: SITE_URL + loc, lastmod: STATIC_LASTMOD }))));
  }

  if (which === 'sitemap-posts') {
    const rows = await posts();
    return send(res, urlset(rows.map((p) => ({
      loc: `${SITE_URL}/blog/${p.slug}`,
      lastmod: new Date(p.lastmod).toISOString(),
    }))));
  }

  const rows = await posts();
  // /blog's freshness legitimately tracks its most recently changed post.
  const blogLastmod = rows.length
    ? new Date(Math.max(...rows.map((p) => new Date(p.lastmod).getTime()))).toISOString().slice(0, 10)
    : STATIC_LASTMOD;

  if (which === 'sitemap-pages') {
    return send(res, urlset(PAGES.map((loc) => ({
      loc: SITE_URL + loc,
      lastmod: loc === '/blog' ? blogLastmod : STATIC_LASTMOD,
    }))));
  }

  // Default: the index.
  const postsLastmod = rows.length
    ? new Date(Math.max(...rows.map((p) => new Date(p.lastmod).getTime()))).toISOString()
    : STATIC_LASTMOD;
  const children = [
    { loc: `${SITE_URL}/sitemap-posts.xml`, lastmod: postsLastmod },
    { loc: `${SITE_URL}/sitemap-services.xml`, lastmod: STATIC_LASTMOD },
    { loc: `${SITE_URL}/sitemap-pages.xml`, lastmod: blogLastmod },
  ];
  send(
    res,
    `<?xml version="1.0" encoding="UTF-8"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">` +
      children.map((c) => `<sitemap><loc>${c.loc}</loc><lastmod>${c.lastmod}</lastmod></sitemap>`).join('') +
      `</sitemapindex>`
  );
}

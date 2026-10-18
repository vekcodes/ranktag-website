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

// Pages edited since then, dated individually. One shared constant was fine
// while every marketing page changed together; now a release touches some and
// not others, and bumping the constant would claim freshness for pages that
// have not moved. Google treats a <lastmod> it can disprove as noise and
// starts discounting the whole file, so an over-claimed date costs more than
// a stale one. Add a line here when you materially edit a page; drop lines
// back into the constant when the whole set moves at once.
const PAGE_LASTMOD = {
  '/': '2026-10-18',
  '/apply': '2026-10-18',
  '/llm-info': '2026-10-18',
  '/who-we-help': '2026-10-18',
  '/seo-vs-geo': '2026-10-19',
  '/seo-vs-ppc-for-saas': '2026-10-19',
  '/aeo-vs-geo': '2026-10-19',
  '/ai-seo-vs-traditional-seo': '2026-10-19',
  '/seo-pricing': '2026-10-19',
  '/in-house-vs-seo-agency': '2026-10-19',
  '/how-to-choose-an-seo-agency': '2026-10-19',
  '/best': '2026-10-18',
  '/best/seo-agencies-for-saas': '2026-10-18',
  '/best/seo-agencies-for-ecommerce': '2026-10-18',
  '/best/seo-agencies-for-local-business': '2026-10-18',
  '/best/ai-seo-agencies': '2026-10-19',
  '/best/seo-agencies-uk': '2026-10-19',
  '/saas-seo-agency': '2026-10-18',
  '/ecommerce-seo-agency': '2026-10-18',
  '/local-seo-agency': '2026-10-18',
  '/healthcare-seo-agency': '2026-10-19',
  '/law-firm-seo-agency': '2026-10-19',
  '/home-services-seo-agency': '2026-10-19',
  '/what-we-do': '2026-10-18',
  '/what-we-do/seo': '2026-10-18',
  '/what-we-do/ai-seo': '2026-10-18',
  '/what-we-do/generative-engine-optimization': '2026-10-18',
  '/what-we-do/answer-engine-optimization': '2026-10-18',
  '/what-we-do/technical-seo': '2026-10-18',
  '/what-we-do/content-marketing': '2026-10-18',
  '/case-study/sendr': '2026-10-18',
  '/competitor-analysis': '2026-10-18',
  '/schema-generator': '2026-10-19',
  '/llms-txt-generator': '2026-10-19',
  '/serp-preview-tool': '2026-10-19',
  '/keyword-density-checker': '2026-10-18',
  '/domain-authority-checker': '2026-10-18',
  '/page-speed-checker': '2026-10-18',
};

const lastmodFor = (loc) => PAGE_LASTMOD[loc] || STATIC_LASTMOD;

// A child sitemap's own <lastmod> is the newest thing inside it.
const newest = (dates) => dates.slice().sort().pop();

// Marketing pages, split by kind so each lands in the right child sitemap.
// No <priority> or <changefreq>: Google has stated publicly it ignores both,
// and a signal nobody reads is just weight in the file.
const CAPABILITIES = [
  '/what-we-do',
  '/what-we-do/seo',
  '/what-we-do/ai-seo',
  '/what-we-do/generative-engine-optimization',
  '/what-we-do/answer-engine-optimization',
  '/what-we-do/technical-seo',
  '/what-we-do/content-marketing',
];

const PAGES = [
  '/',
  '/apply',
  // Vertical pages. Added one at a time, each only once its page is finished
  // and live — a sitemap entry for an unfinished page is a soft 404 invitation.
  '/who-we-help',
  '/seo-vs-geo',
  '/seo-vs-ppc-for-saas',
  '/aeo-vs-geo',
  '/ai-seo-vs-traditional-seo',
  '/seo-pricing',
  '/in-house-vs-seo-agency',
  '/how-to-choose-an-seo-agency',
  // Comparison pages. Refreshed quarterly; bump the lastmod above when the
  // list is actually re-checked, never on a deploy.
  '/best',
  '/best/seo-agencies-for-saas',
  '/best/seo-agencies-for-ecommerce',
  '/best/seo-agencies-for-local-business',
  '/best/ai-seo-agencies',
  '/best/seo-agencies-uk',
  '/saas-seo-agency',
  '/ecommerce-seo-agency',
  '/local-seo-agency',
  '/healthcare-seo-agency',
  '/law-firm-seo-agency',
  '/home-services-seo-agency',
  '/case-study/sendr',
  '/llm-info',
  '/blog',
  '/schema-generator',
  '/llms-txt-generator',
  '/serp-preview-tool',
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
 *   /sitemap-services.xml -> the six service pages + /what-we-do
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
    return send(res, urlset(CAPABILITIES.map((loc) => ({ loc: SITE_URL + loc, lastmod: lastmodFor(loc) }))));
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
      lastmod: loc === '/blog' ? blogLastmod : lastmodFor(loc),
    }))));
  }

  // Default: the index.
  const postsLastmod = rows.length
    ? new Date(Math.max(...rows.map((p) => new Date(p.lastmod).getTime()))).toISOString()
    : STATIC_LASTMOD;
  const children = [
    { loc: `${SITE_URL}/sitemap-posts.xml`, lastmod: postsLastmod },
    { loc: `${SITE_URL}/sitemap-services.xml`, lastmod: newest(CAPABILITIES.map(lastmodFor)) },
    { loc: `${SITE_URL}/sitemap-pages.xml`, lastmod: newest([blogLastmod, ...PAGES.map(lastmodFor)]) },
  ];
  send(
    res,
    `<?xml version="1.0" encoding="UTF-8"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">` +
      children.map((c) => `<sitemap><loc>${c.loc}</loc><lastmod>${c.lastmod}</lastmod></sitemap>`).join('') +
      `</sitemapindex>`
  );
}

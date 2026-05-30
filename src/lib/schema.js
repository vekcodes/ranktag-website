// Centralised schema.org JSON-LD builders for the RankedTag SPA.
//
// The site-wide Organization (#org) and WebSite (#website) nodes live in
// index.html so every crawler sees them without running JS. Page-level schema
// below references those nodes by @id (e.g. publisher: { '@id': ORG_ID })
// instead of repeating them — that's the schema.org idiom for "the same
// entity", and it keeps the graph clean and free of duplicates.
//
// NOTE on ratings: SoftwareApplication is rich-result eligible with an
// aggregateRating, but Google issues manual penalties for fabricated ratings,
// and the rating must be genuinely visible on the page. We ship honest schema
// WITHOUT invented ratings. When you have real review data, add an
// `aggregateRating` to softwareTool() and surface it on the page.

export const SITE = 'https://rankedtag.com';
export const ORG_ID = `${SITE}/#org`;
export const WEBSITE_ID = `${SITE}/#website`;
const LOGO = `${SITE}/Rankedtag%20(1).png`;

const ctx = (node) => ({ '@context': 'https://schema.org', ...node });

/** BreadcrumbList from [{ name, item }] (item = absolute URL). */
export function breadcrumb(items) {
  return ctx({
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: it.item,
    })),
  });
}

/** FAQPage from [[question, answer], ...]. Answers are plain text. */
export function faqPage(qa) {
  return ctx({
    '@type': 'FAQPage',
    mainEntity: qa.map(([q, a]) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  });
}

/**
 * Free, browser-based tool (SoftwareApplication + WebApplication).
 * `category` is a schema.org applicationCategory (e.g. 'BusinessApplication').
 */
export function softwareTool({
  name,
  url,
  description,
  category = 'BusinessApplication',
  featureList,
}) {
  return ctx({
    '@type': ['SoftwareApplication', 'WebApplication'],
    name,
    url,
    description,
    applicationCategory: category,
    operatingSystem: 'Web',
    browserRequirements: 'Requires a modern web browser. No login or API key.',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    isAccessibleForFree: true,
    inLanguage: 'en',
    publisher: { '@id': ORG_ID },
    provider: { '@id': ORG_ID },
    ...(featureList && featureList.length ? { featureList } : {}),
  });
}

/** The RankedTag service offering (homepage). */
export function professionalService({ name, description, url = `${SITE}/` }) {
  return ctx({
    '@type': 'ProfessionalService',
    '@id': `${SITE}/#service`,
    name,
    description,
    url,
    provider: { '@id': ORG_ID },
    areaServed: 'Worldwide',
    serviceType: 'SEO & Generative Engine Optimization for B2B SaaS',
  });
}

/** Blog (collection) node for the blog index. */
export function blogCollection({ description }) {
  return ctx({
    '@type': 'Blog',
    '@id': `${SITE}/blog#blog`,
    name: 'RankedTag Blog',
    url: `${SITE}/blog`,
    description,
    publisher: { '@id': ORG_ID },
    inLanguage: 'en',
  });
}

/** Parse stored/author custom JSON-LD into an array of nodes (never throws). */
export function parseCustomJsonLd(raw) {
  const str = String(raw == null ? '' : raw).trim();
  if (!str) return [];
  try {
    const parsed = JSON.parse(str);
    const nodes = Array.isArray(parsed) ? parsed : [parsed];
    return nodes.filter((n) => n && typeof n === 'object' && !Array.isArray(n));
  } catch {
    return [];
  }
}

/**
 * BlogPosting + BreadcrumbList + any author custom JSON-LD for a post object
 * returned by /api/blog/posts. Mirrors the server-side articleJsonLd() so the
 * client-rendered route emits the same structured data the SSR route does.
 */
export function articlePosting(post) {
  if (!post) return [];
  const url = `${SITE}/blog/${post.slug}`;
  const blogPosting = ctx({
    '@type': 'BlogPosting',
    headline: post.meta_title || post.title,
    description: post.meta_description || post.excerpt,
    image: post.og_image_url || post.cover_image_url || LOGO,
    datePublished: post.published_at,
    dateModified: post.updated_at || post.published_at,
    author: { '@type': 'Organization', name: post.author || 'RankedTag', url: SITE },
    publisher: { '@id': ORG_ID },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
  });
  const crumbs = breadcrumb([
    { name: 'Home', item: SITE },
    { name: 'Blog', item: `${SITE}/blog` },
    { name: post.title, item: url },
  ]);
  return [blogPosting, crumbs, ...parseCustomJsonLd(post.custom_jsonld)];
}

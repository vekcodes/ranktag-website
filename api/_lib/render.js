// Server-side HTML renderer for the SEO-critical /blog pages.
// Self-contained document (brand styles inlined) so crawlers get full,
// fast, fully-rendered HTML — no client JS required to read content.
import { escapeHtml, SITE_URL, SITE_NAME, normalizeFaqs, authorNode } from './blog.js';
import { ORG_WEBSITE_JSONLD } from '../../src/seo/orgGraph.js';

// Default social-image alt, kept identical to index.html's so every route's
// social-tag set matches.
const DEFAULT_OG_ALT = 'RankedTag — SEO, AI SEO, AEO & GEO agency for B2B SaaS';

const FONTS =
  'https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght,SOFT@0,9..144,300..900,0..100;1,9..144,300..900,0..100&family=Bricolage+Grotesque:opsz,wght@12..96,200..800&family=JetBrains+Mono:wght@400;500;600;700&display=swap';

const CSS = `
:root{--red:#FF3B14;--red-deep:#C8260A;--ink:#0E0E10;--ink-2:#161618;
--paper:#F4EFE7;--paper-2:#EDE6D9;--paper-3:#E4DCCC;--periwinkle:#A6B0F0;
--muted:#6E6E76;--muted-2:#9A9AA0;--r-md:16px;--r-lg:24px;}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth;-webkit-text-size-adjust:100%}
body{font-family:'Bricolage Grotesque',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
background:var(--paper);color:var(--ink);line-height:1.6;-webkit-font-smoothing:antialiased}
img,svg{display:block;max-width:100%}a{color:inherit;text-decoration:none}
h1,h2,h3,h4{font-family:'Fraunces','Times New Roman',serif;line-height:1.15;letter-spacing:-.01em}
.wrap{max-width:760px;margin:0 auto;padding:0 24px}
.wrap-wide{max-width:1100px;margin:0 auto;padding:0 24px}
nav{position:sticky;top:0;z-index:10;background:rgba(244,239,231,.85);
backdrop-filter:saturate(160%) blur(12px);border-bottom:1px solid var(--paper-3)}
.nav-in{display:flex;align-items:center;justify-content:space-between;height:64px;
max-width:1100px;margin:0 auto;padding:0 24px}
.logo{display:flex;align-items:center;gap:9px;font-family:'Fraunces',serif;font-weight:700;font-size:20px}
.logo svg{width:26px;height:26px}
.logo img{height:28px;width:auto;display:block}
.nav-links{display:flex;align-items:center;gap:26px;font-size:15px;font-weight:500}
.nav-links a:hover{color:var(--red)}
.cta{background:var(--red);color:#fff;padding:9px 18px;border-radius:999px;
font-weight:600;font-size:14px;transition:background .15s}
.cta:hover{background:var(--red-deep)}
@media(max-width:680px){.nav-links a:not(.cta){display:none}}
.crumbs{font-size:13px;color:var(--muted);padding:22px 0 0}
.crumbs a:hover{color:var(--red)}
.post-head{padding:30px 0 28px}
.kicker{display:inline-block;font-size:12px;font-weight:700;letter-spacing:.08em;
text-transform:uppercase;color:var(--red);margin-bottom:14px}
h1.title{font-size:clamp(2rem,5vw,3.1rem);font-weight:800}
.meta{display:flex;flex-wrap:wrap;gap:8px 18px;color:var(--muted);font-size:14px;margin-top:18px}
.cover{display:block;width:100%;aspect-ratio:1200/630;object-fit:cover;
background:var(--paper-2);border-radius:var(--r-lg);margin:8px 0 36px;border:1px solid var(--paper-3)}
.prose{font-size:18px;color:#26262b}
.prose>*+*{margin-top:1.15em}
.prose h2{font-size:1.7rem;font-weight:700;margin-top:1.9em}
.prose h3{font-size:1.32rem;font-weight:700;margin-top:1.6em}
.prose a{color:var(--red-deep);text-decoration:underline;text-underline-offset:3px}
.prose a:hover{color:var(--red)}
.prose ul,.prose ol{padding-left:1.3em}.prose li+li{margin-top:.4em}
.prose img{display:block;width:100%;aspect-ratio:1200/630;object-fit:cover;
background:var(--paper-2);border-radius:var(--r-md);margin:1.6em 0;border:1px solid var(--paper-3)}
.prose blockquote{border-left:3px solid var(--red);padding:.2em 0 .2em 1.1em;
color:var(--muted);font-style:italic}
.prose pre{background:var(--ink);color:#f4efe7;padding:18px;border-radius:var(--r-md);
overflow:auto;font-family:'JetBrains Mono',monospace;font-size:14px}
.prose code{font-family:'JetBrains Mono',monospace;font-size:.9em;
background:var(--paper-2);padding:.15em .4em;border-radius:6px}
.prose pre code{background:none;padding:0}
.tags{display:flex;flex-wrap:wrap;gap:8px;margin:40px 0 0}
.tag{font-size:13px;background:var(--paper-2);border:1px solid var(--paper-3);
padding:5px 12px;border-radius:999px;color:var(--muted)}
.lead-cta{margin:56px 0;padding:36px;background:var(--ink);color:var(--paper);
border-radius:var(--r-lg);text-align:center}
.lead-cta h3{font-size:1.6rem;color:#fff}
.lead-cta p{color:var(--muted-2);margin:12px 0 22px;font-size:16px}
.lead-cta a{background:var(--red);color:#fff;display:inline-block;padding:13px 28px;
border-radius:999px;font-weight:600}
.lead-cta a:hover{background:var(--red-deep)}
.faq-sec{margin:56px 0 0}
.faq-sec h2{font-size:1.7rem;font-weight:700;margin-bottom:22px}
.faq-list{display:flex;flex-direction:column;gap:12px}
.faq-item{background:#fff;border:1px solid var(--paper-3);border-radius:var(--r-md);overflow:hidden}
.faq-item[open]{border-color:var(--ink)}
.faq-q{display:flex;justify-content:space-between;align-items:center;gap:16px;
padding:20px 24px;font-family:'Fraunces',serif;font-weight:600;font-size:17px;
cursor:pointer;list-style:none}
.faq-q::-webkit-details-marker{display:none}
.faq-ic{width:28px;height:28px;flex-shrink:0;background:var(--paper-2);border-radius:50%;
display:flex;align-items:center;justify-content:center;font-size:20px;line-height:1;
color:var(--ink);transition:transform .2s,background .2s,color .2s}
.faq-item[open] .faq-ic{background:var(--red);color:#fff;transform:rotate(45deg)}
.faq-a{padding:0 24px 22px;color:#26262b;font-size:16px;line-height:1.65}
.idx-head{padding:56px 0 12px;text-align:center}
.idx-head h1{font-size:clamp(2.2rem,5vw,3.4rem);font-weight:800}
.idx-head p{color:var(--muted);font-size:18px;margin-top:14px;max-width:560px;
margin-left:auto;margin-right:auto}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));
gap:26px;padding:44px 0 80px}
.card{background:#fff;border:1px solid var(--paper-3);border-radius:var(--r-lg);
overflow:hidden;display:flex;flex-direction:column;transition:transform .2s,box-shadow .2s}
.card:hover{transform:translateY(-3px);box-shadow:0 12px 32px rgba(0,0,0,.07)}
.card-img{aspect-ratio:1200/630;object-fit:cover;width:100%;background:var(--paper-2)}
.card-body{padding:22px;display:flex;flex-direction:column;flex:1}
.card h2{font-size:1.28rem;font-weight:700}
.card p{color:var(--muted);font-size:15px;margin:10px 0 16px;flex:1}
.card .row{display:flex;gap:14px;color:var(--muted-2);font-size:13px}
.feat{display:grid;grid-template-columns:1.1fr .9fr;background:#fff;border:1px solid var(--paper-3);
border-radius:var(--r-lg);overflow:hidden;margin:44px 0 26px;transition:transform .2s,box-shadow .2s}
.feat:hover{transform:translateY(-3px);box-shadow:0 12px 32px rgba(0,0,0,.07)}
.feat-img{width:100%;height:100%;min-height:300px;object-fit:cover;background:var(--paper-2);display:block}
.feat-body{padding:40px;display:flex;flex-direction:column;justify-content:center}
.feat-kicker{align-self:flex-start;font-size:12px;font-weight:700;letter-spacing:.08em;
text-transform:uppercase;color:var(--red);margin-bottom:14px}
.feat-body h2{font-size:1.9rem;font-weight:700;line-height:1.18}
.feat-body p{color:var(--muted);font-size:16px;line-height:1.6;margin:14px 0 20px}
.feat-body .row{display:flex;gap:14px;color:var(--muted-2);font-size:13px}
.feat + .grid{padding-top:0}
@media(max-width:760px){.feat{grid-template-columns:1fr}.feat-img{min-height:0;aspect-ratio:1200/630}
.feat-body{padding:28px}.feat-body h2{font-size:1.6rem}}
.empty{text-align:center;padding:80px 0;color:var(--muted)}
footer{border-top:1px solid var(--paper-3);padding:40px 0;margin-top:40px;
color:var(--muted);font-size:14px;text-align:center}
footer a:hover{color:var(--red)}
`;

function nav() {
  return `<nav><div class="nav-in">
<a class="logo" href="/" aria-label="RankedTag home"><img src="/rankedtag-logo.svg" alt="RankedTag" width="106" height="28"/></a>
<div class="nav-links">
<a href="/#how-it-works">How it works</a>
<a href="/case-study/sendr">Case study</a>
<a href="/blog">Blog</a>
<a class="cta" href="/apply">Apply →</a>
</div></div></nav>`;
}

function footer() {
  return `<footer><div class="wrap-wide">
© ${new Date().getFullYear()} ${SITE_NAME} · <a href="/">Home</a> ·
<a href="/blog">Blog</a> · <a href="/apply">Founder Review</a> ·
<a href="/rss.xml">RSS</a></div></footer>`;
}

function leadCta() {
  return `<div class="lead-cta">
<h3>Want this engine pointed at your SaaS?</h3>
<p>We took Sendr.ai from 0 to 1.05M organic impressions in 6 months. Get a free founder-level review of your inbound.</p>
<a href="/apply">Apply for a free review →</a></div>`;
}

function shell({ title, description, canonical, ogImage, ogImageAlt, ogType, jsonLd, body, robots }) {
  const ld = (jsonLd || [])
    .map((o) => `<script type="application/ld+json">${JSON.stringify(o)}</script>`)
    .join('');
  return `<!DOCTYPE html><html lang="en"><head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<meta name="theme-color" content="#0E0E10"/>
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(description)}"/>
<link rel="canonical" href="${escapeHtml(canonical)}"/>
<meta name="robots" content="${robots || 'index, follow, max-image-preview:large'}"/>
<link rel="icon" type="image/svg+xml" href="/favicon.svg"/><link rel="icon" type="image/png" sizes="96x96" href="/favicon-96x96.png"/><link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png"/><link rel="apple-touch-icon" href="/apple-touch-icon.png"/>
<meta property="og:type" content="${ogType || 'website'}"/>
<meta property="og:site_name" content="${SITE_NAME}"/>
<meta property="og:title" content="${escapeHtml(title)}"/>
<meta property="og:description" content="${escapeHtml(description)}"/>
<meta property="og:url" content="${escapeHtml(canonical)}"/>
<meta property="og:image" content="${escapeHtml(ogImage)}"/>
<meta property="og:image:alt" content="${escapeHtml(ogImageAlt || DEFAULT_OG_ALT)}"/>
<meta name="twitter:card" content="summary_large_image"/>
<meta name="twitter:title" content="${escapeHtml(title)}"/>
<meta name="twitter:description" content="${escapeHtml(description)}"/>
<meta name="twitter:image" content="${escapeHtml(ogImage)}"/>
<meta name="twitter:image:alt" content="${escapeHtml(ogImageAlt || DEFAULT_OG_ALT)}"/>
<link rel="alternate" type="application/rss+xml" title="${SITE_NAME} Blog" href="${SITE_URL}/rss.xml"/>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link href="${FONTS}" rel="stylesheet"/>
<style>${CSS}</style>
${ld}
<script>!function(key){if(window.reb2b)return;window.reb2b={loaded:true};var s=document.createElement("script");s.async=true;s.src="https://ddwl4m2hdecbv.cloudfront.net/b/"+key+"/"+key+".js.gz";document.getElementsByTagName("script")[0].parentNode.insertBefore(s,document.getElementsByTagName("script")[0]);}("7N850H5EJVN1");</script>
</head><body>${nav()}${body}${footer()}</body></html>`;
}

function renderFaqs(faqs) {
  const list = normalizeFaqs(faqs);
  if (!list.length) return '';
  const items = list
    .map(
      (f) => `<details class="faq-item">
<summary class="faq-q">${escapeHtml(f.q)}<span class="faq-ic" aria-hidden="true">+</span></summary>
<div class="faq-a">${escapeHtml(f.a)}</div>
</details>`
    )
    .join('');
  return `<section class="faq-sec" aria-label="Frequently asked questions">
<h2>Frequently asked questions</h2>
<div class="faq-list">${items}</div>
</section>`;
}

function fmtDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
}

export function renderIndex(posts) {
  const card = (p) => {
    const img = p.cover_image_url
      ? `<img class="card-img" src="${escapeHtml(p.cover_image_url)}" alt="${escapeHtml(p.cover_image_alt || p.title)}" loading="lazy" decoding="async" width="640" height="336"/>`
      : `<div class="card-img"></div>`;
    return `<a class="card" href="/blog/${escapeHtml(p.slug)}">
${img}<div class="card-body">
<h2>${escapeHtml(p.title)}</h2>
<p>${escapeHtml(p.excerpt)}</p>
<div class="row"><span>${fmtDate(p.published_at)}</span><span>${p.reading_minutes} min read</span></div>
</div></a>`;
  };

  // Most-recent post gets a full-width featured card; the rest fill the grid.
  const featured = posts[0];
  const rest = posts.slice(1);
  const featuredImg = featured && featured.cover_image_url
    ? `<img class="feat-img" src="${escapeHtml(featured.cover_image_url)}" alt="${escapeHtml(featured.cover_image_alt || featured.title)}" decoding="async" width="1200" height="630"/>`
    : `<div class="feat-img"></div>`;
  const featuredHtml = featured
    ? `<a class="feat" href="/blog/${escapeHtml(featured.slug)}">
${featuredImg}<div class="feat-body">
<span class="feat-kicker">Latest</span>
<h2>${escapeHtml(featured.title)}</h2>
<p>${escapeHtml(featured.excerpt)}</p>
<div class="row"><span>${fmtDate(featured.published_at)}</span><span>${featured.reading_minutes} min read</span></div>
</div></a>`
    : '';

  const body = `<div class="wrap-wide">
<div class="idx-head">
<h1>The RankedTag Blog</h1>
<p>Field notes on SEO, generative engine optimization, and building inbound engines for B2B SaaS.</p>
</div>
${posts.length
    ? `${featuredHtml}${rest.length ? `<div class="grid">${rest.map(card).join('')}</div>` : ''}`
    : `<div class="empty">No posts yet — check back soon.</div>`}
</div>`;

  const jsonLd = [
    ORG_WEBSITE_JSONLD,
    {
      '@context': 'https://schema.org',
      '@type': 'Blog',
      '@id': `${SITE_URL}/blog#blog`,
      name: `${SITE_NAME} Blog`,
      url: `${SITE_URL}/blog`,
      description:
        'SEO, generative engine optimization (GEO), and inbound growth for B2B SaaS founders.',
      publisher: {
        '@type': 'Organization',
        name: SITE_NAME,
        logo: { '@type': 'ImageObject', url: `${SITE_URL}/rankedtag-logo.png` },
      },
      ...(posts.length
        ? {
            mainEntity: posts.map((p) => ({
              '@type': 'BlogPosting',
              headline: p.title,
              url: `${SITE_URL}/blog/${p.slug}`,
              description: p.excerpt,
              datePublished: p.published_at,
              author: authorNode(p.author),
            })),
          }
        : {}),
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
        { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE_URL}/blog` },
      ],
    },
  ];

  return shell({
    title: `${SITE_NAME} Blog — SEO, GEO & Inbound Growth for B2B SaaS`,
    description:
      'Field notes on SEO, generative engine optimization (GEO), and building inbound engines that earn AI citations and qualified pipeline for B2B SaaS founders.',
    canonical: `${SITE_URL}/blog`,
    ogImage: `${SITE_URL}/rankedtag-logo.png`,
    ogType: 'website',
    jsonLd,
    body,
  });
}

export function renderPost(post, jsonLd) {
  const cover = post.cover_image_url
    ? `<img class="cover" src="${escapeHtml(post.cover_image_url)}" alt="${escapeHtml(post.cover_image_alt || post.title)}" width="1200" height="630" fetchpriority="high"/>`
    : '';
  const tags = (post.tags || [])
    .map((t) => `<a class="tag" href="/blog?tag=${encodeURIComponent(t)}">#${escapeHtml(t)}</a>`)
    .join('');

  const body = `<div class="wrap">
<div class="crumbs"><a href="/">Home</a> › <a href="/blog">Blog</a> › ${escapeHtml(post.title)}</div>
<header class="post-head">
<span class="kicker">${escapeHtml((post.tags && post.tags[0]) || 'Article')}</span>
<h1 class="title">${escapeHtml(post.title)}</h1>
<div class="meta">
<span>By ${escapeHtml(post.author || SITE_NAME)}</span>
<span>${fmtDate(post.published_at)}</span>
<span>${post.reading_minutes} min read</span>
</div></header>
${cover}
<article class="prose">${post.content_html}</article>
${tags ? `<div class="tags">${tags}</div>` : ''}
${renderFaqs(post.faqs)}
${leadCta()}
</div>`;

  return shell({
    title: `${post.meta_title || post.title} · ${SITE_NAME}`,
    description: post.meta_description || post.excerpt,
    canonical: post.canonical_url || `${SITE_URL}/blog/${post.slug}`,
    ogImage:
      post.og_image_url || post.cover_image_url || `${SITE_URL}/rankedtag-logo.png`,
    ogImageAlt: post.cover_image_alt || post.title,
    ogType: 'article',
    jsonLd: [ORG_WEBSITE_JSONLD, ...jsonLd],
    body,
  });
}

export function renderNotFound() {
  const body = `<div class="wrap"><div class="empty">
<h1 style="font-size:2rem;margin-bottom:12px">Post not found</h1>
<p>That post may have moved. <a href="/blog" style="color:var(--red-deep);text-decoration:underline">Back to the blog →</a></p>
</div></div>`;
  return shell({
    title: `Not found · ${SITE_NAME}`,
    description: 'Post not found.',
    canonical: `${SITE_URL}/blog`,
    ogImage: `${SITE_URL}/rankedtag-logo.png`,
    jsonLd: [],
    body,
    robots: 'noindex, follow',
  });
}

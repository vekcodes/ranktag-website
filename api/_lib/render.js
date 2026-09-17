// Server-side HTML renderer for the SEO-critical /blog pages.
// Self-contained document (brand styles inlined) so crawlers get full,
// fast, fully-rendered HTML — no client JS required to read content.
import { escapeHtml, SITE_URL, SITE_NAME, normalizeFaqs, authorNode } from './blog.js';
import { ORG_WEBSITE_JSONLD } from '../../src/seo/orgGraph.js';

// Default social-image alt, kept identical to index.html's so every route's
// social-tag set matches.
const DEFAULT_OG_ALT = 'RankedTag — SEO, AI SEO, AEO & GEO agency for B2B SaaS';

const CSS = `
@font-face{font-family:'Space Grotesk';font-style:normal;font-weight:300 700;font-display:swap;src:url('/fonts/space-grotesk.woff2') format('woff2')}
@font-face{font-family:'JetBrains Mono';font-style:normal;font-weight:400 700;font-display:swap;src:url('/fonts/jetbrains-mono.woff2') format('woff2')}
:root{
--logo-ink:#181818;--logo-paper:#F4EFE7;--logo-red:#F83000;
--bg:#181818;--surface-1:#1F1F20;--surface-2:#27272A;--surface-3:#303033;
--text-1:#F4EFE7;--text-2:#B9B4AC;--text-3:#9E9991;--text-4:#949089;
--line:rgba(244,239,231,.10);--line-strong:rgba(244,239,231,.20);
--red:#F83000;--red-hover:#FF4A1F;--red-on-paper:#C42600;--peri:#98A8F8;--peri-on-paper:#4A5BC4;
--accent-text:var(--red);--accent-on-raised:#FF6A44;--on-ink-2:#B9B4AC;
--paper:#F4EFE7;--paper-2:#EBE4D8;
--font-display:'Space Grotesk',Arial,sans-serif;
--font-body:'Space Grotesk',Arial,sans-serif;
--font-mono:'JetBrains Mono',ui-monospace,monospace;
--fs-micro:.6875rem;--track-micro:.12em;--track-tight:-.02em;--track-h1:-.04em;--track-h2:-.035em;
--r-xs:2px;--r-sm:4px;--r-md:8px;--r-lg:12px;--r-xl:20px;--nav-h:72px;
--gutter:clamp(1.25rem,4vw,2.5rem);
--ease:cubic-bezier(.16,1,.3,1);
}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth;-webkit-text-size-adjust:100%}
body{font-family:var(--font-body);background:var(--bg);color:var(--text-1);
line-height:1.6;-webkit-font-smoothing:antialiased}
img,svg{display:block;max-width:100%}a{color:inherit;text-decoration:none}
h1,h2,h3,h4{font-family:var(--font-display);line-height:1.1;letter-spacing:var(--track-tight);text-wrap:balance}
.wrap{max-width:46rem;margin:0 auto;padding:0 var(--gutter)}
.wrap-wide{max-width:90rem;margin:0 auto;padding:0 var(--gutter)}
/* Nav stays dark on both canvases, matching the app shell. */
nav{position:sticky;top:0;z-index:10;background:rgba(24,24,24,.9);
backdrop-filter:saturate(140%) blur(20px);border-bottom:1px solid rgba(244,239,231,.1)}
.nav-in{display:flex;align-items:center;justify-content:space-between;height:var(--nav-h);
max-width:90rem;margin:0 auto;padding:0 var(--gutter)}
.logo{display:flex;align-items:center}
.logo img{height:26px;width:auto;display:block}
.nav-links{display:flex;align-items:center;gap:1.4rem;font-size:.875rem;font-weight:500;color:#B9B4AC}
.nav-links a{transition:color .2s var(--ease)}
.nav-links a:hover{color:#F4EFE7}
.cta{background:var(--logo-red);color:var(--logo-ink);padding:.6rem 1.1rem;border-radius:999px;
font-weight:600;font-size:.8125rem;transition:background .2s var(--ease)}
.cta:hover{background:#FF4A1F;color:var(--logo-ink)}
@media(max-width:680px){.nav-links a:not(.cta){display:none}}
.crumbs{font-family:var(--font-mono);font-size:var(--fs-micro);letter-spacing:var(--track-micro);
text-transform:uppercase;color:var(--text-3);padding:2.5rem 0 1.25rem;border-bottom:1px solid var(--line)}
.crumbs a:hover{color:var(--accent-text)}
.post-head{padding:0 0 1.5rem}
.kicker{display:inline-block;font-family:var(--font-mono);font-size:var(--fs-micro);
letter-spacing:var(--track-micro);text-transform:uppercase;color:var(--accent-text);margin:2.5rem 0 1.25rem}
h1.title{font-size:clamp(2.25rem,5.5vw,4.5rem);font-weight:700;line-height:1.02;letter-spacing:var(--track-h1)}
.meta{display:flex;flex-wrap:wrap;gap:.5rem 1.15rem;font-family:var(--font-mono);font-size:var(--fs-micro);
letter-spacing:var(--track-micro);text-transform:uppercase;color:var(--text-3);
margin-top:1.5rem;padding-top:1.25rem;border-top:1px solid var(--line)}
.cover{display:block;width:100%;height:auto;border-radius:var(--r-lg);margin:2.5rem 0;
border:1px solid var(--line)}
.prose{font-size:1.125rem;line-height:1.75;color:var(--text-2)}
.prose>*+*{margin-top:1.1em}
.prose h2,.prose h3{color:var(--text-1)}
.prose h2{font-size:clamp(1.5rem,3vw,2rem);font-weight:600;margin-top:2em}
.prose h3{font-size:1.25rem;font-weight:600;margin-top:1.7em}
.prose strong{color:var(--text-1);font-weight:600}
.prose a{color:var(--accent-text);text-decoration:underline;text-underline-offset:3px}
.prose ul,.prose ol{padding-left:1.25em}.prose li+li{margin-top:.4em}
.prose img{display:block;max-width:100%;height:auto;margin:1.8em auto;
border-radius:var(--r-md);border:1px solid var(--line)}
.prose blockquote{border-left:2px solid var(--red);padding:.2em 0 .2em 1.1em;
color:var(--text-3);font-style:italic}
.prose pre{background:#131314;color:var(--text-1);border:1px solid var(--line);padding:1.1rem;border-radius:var(--r-md);
overflow:auto;font-family:var(--font-mono);font-size:.875rem;line-height:1.6}
.prose code{font-family:var(--font-mono);font-size:.9em;
background:var(--surface-3);padding:.12em .4em;border-radius:var(--r-xs)}
.prose pre code{background:none;padding:0}
.tags{display:flex;flex-wrap:wrap;gap:.5rem;margin:2.5rem 0 0}
.tag{font-family:var(--font-mono);font-size:var(--fs-micro);letter-spacing:.06em;
border:1px solid var(--line-strong);padding:.35rem .7rem;border-radius:var(--r-sm);color:var(--text-3)}
.lead-cta{margin:5rem 0 0;padding:3rem 2rem;background:var(--surface-1);color:var(--text-1);
border:1px solid var(--line-strong);border-radius:var(--r-xl);text-align:center}
.lead-cta h3{font-size:clamp(1.5rem,3vw,2.25rem);font-weight:600;color:var(--text-1);line-height:1.1}
.lead-cta p{color:var(--text-2);margin:1rem 0 1.5rem;font-size:1rem;line-height:1.6}
.lead-cta a{background:var(--logo-red);color:var(--logo-ink);display:inline-block;padding:.9rem 1.75rem;
border-radius:999px;font-weight:600;transition:background .2s var(--ease)}
.lead-cta a:hover{background:#FF4A1F}
.faq-sec{margin:5rem 0 0}
.faq-sec h2{font-size:clamp(1.5rem,3vw,2rem);font-weight:600;margin-bottom:1.5rem}
.faq-list{border-top:1px solid var(--line-strong);counter-reset:faq}
.faq-item{border-bottom:1px solid var(--line-strong);counter-increment:faq}
.faq-q{display:grid;grid-template-columns:2.5rem minmax(0,1fr) auto;align-items:start;gap:1rem;
padding:1.25rem 0;font-weight:600;font-size:1.0625rem;line-height:1.35;letter-spacing:var(--track-tight);
cursor:pointer;list-style:none;transition:color .2s var(--ease)}
.faq-q::marker{content:""}
.faq-q::-webkit-details-marker{display:none}
.faq-q::before{content:"00" counter(faq);font-family:var(--font-mono);font-size:var(--fs-micro);
font-weight:500;letter-spacing:var(--track-micro);color:var(--text-4);padding-top:.3rem}
.faq-q:hover{color:var(--accent-text)}
.faq-ic{font-size:1.25rem;font-weight:300;line-height:1;color:var(--text-3);
transition:transform .35s var(--ease),color .2s var(--ease)}
.faq-item[open] .faq-ic{transform:rotate(45deg);color:var(--accent-text)}
.faq-a{padding:0 0 1.25rem 2.5rem;color:var(--text-2);font-size:1rem;line-height:1.75;max-width:60ch}
.idx-head{padding:clamp(3rem,6vw,5.5rem) 0 clamp(1.5rem,3vw,2.5rem);
display:grid;grid-template-columns:minmax(0,7fr) minmax(0,5fr);
gap:1.5rem var(--gutter);align-items:end}
.idx-head h1{font-size:clamp(2.75rem,6.5vw,7rem);font-weight:700;line-height:.95;
letter-spacing:var(--track-h1);max-width:14ch}
.idx-head p{color:var(--text-3);font-size:1.125rem;line-height:1.6;max-width:44ch}
@media(max-width:900px){.idx-head{grid-template-columns:1fr;align-items:start}}

/* — Bento grid ————————————————————————————————————
   Tiles vary in width; every image sits in a fixed-ratio frame and is
   object-fit:contain, so a cover image is never cropped or half-cut. The
   frame's padding and inset background make the letterboxing deliberate. */
.bento{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));
gap:clamp(.875rem,1.4vw,1.25rem);padding:0 0 5rem;counter-reset:post}
.tile{counter-increment:post;grid-column:span 4;display:flex;flex-direction:column;
background:var(--surface-1);border:1px solid var(--line);border-radius:var(--r-xl);
overflow:hidden;transition:transform .45s var(--ease),border-color .45s var(--ease)}
.tile:hover{transform:translateY(-4px);border-color:var(--line-strong)}
.tile-8{grid-column:span 8}
.tile-6{grid-column:span 6}
.tile-frame{position:relative;aspect-ratio:16/9;background:#131314;
display:grid;place-items:center;padding:.625rem;border-bottom:1px solid var(--line)}
.tile-8 .tile-frame{aspect-ratio:16/7}
.tile-frame img{width:100%;height:100%;object-fit:contain;border-radius:var(--r-sm)}
.tile-frame.is-empty::after{content:"";width:2.5rem;height:2.5rem;border-radius:50%;
border:1px solid var(--line-strong)}
.tile-num{position:absolute;top:.625rem;left:.75rem;font-family:var(--font-mono);
font-size:var(--fs-micro);letter-spacing:var(--track-micro);color:var(--text-4)}
/* flex, not grid: the meta row uses margin-top:auto to sit at the bottom
   so a short tile sharing a row with a tall one does not leave a void. */
.tile-body{padding:1.15rem 1.25rem 1.35rem;display:flex;flex-direction:column;gap:.5rem;flex:1}
.tile h2{font-size:1.0625rem;font-weight:600;line-height:1.25;color:var(--text-1)}
.tile-8 h2{font-size:clamp(1.375rem,2.4vw,2rem);letter-spacing:var(--track-h2);line-height:1.1}
.tile p{color:var(--text-3);font-size:.875rem;line-height:1.6;
display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.tile-8 p{font-size:1rem;-webkit-line-clamp:3}
.tile .row{display:flex;gap:.9rem;margin-top:auto;padding-top:.35rem;
font-family:var(--font-mono);font-size:var(--fs-micro);letter-spacing:.06em;
text-transform:uppercase;color:var(--text-4)}
.tile-kicker{font-family:var(--font-mono);font-size:var(--fs-micro);
letter-spacing:var(--track-micro);text-transform:uppercase;color:var(--accent-on-raised)}
@media(max-width:1024px){.tile,.tile-8,.tile-6{grid-column:span 6}}
@media(max-width:680px){.tile,.tile-8,.tile-6{grid-column:span 12}
.tile-8 .tile-frame{aspect-ratio:16/9}}
.empty{text-align:center;padding:5rem 0;color:var(--text-3)}
footer{border-top:1px solid var(--line);padding:2.5rem 0;margin-top:2.5rem;
color:var(--text-3);font-family:var(--font-mono);font-size:var(--fs-micro);
letter-spacing:var(--track-micro);text-transform:uppercase;text-align:center}
footer a:hover{color:var(--accent-text)}
@media (prefers-reduced-motion:reduce){
*,*::before,*::after{animation-duration:.01ms !important;transition-duration:.01ms !important}
.card:hover,.feat:hover{padding-left:0;padding-right:0}
}
`;

function nav() {
  return `<nav><div class="nav-in">
<a class="logo" href="/" aria-label="RankedTag home"><img src="/rankedtag-logo-light.svg" alt="RankedTag" width="106" height="28"/></a>
<div class="nav-links">
<a href="/services">Services</a>
<a href="/#how-it-works">How it works</a>
<a href="/case-study/sendr">Sendr.ai story</a>
<a href="/blog" aria-current="page">Blog</a>
<a href="/apply">Founder Review</a>
<a class="cta" href="/apply">Apply →</a>
</div></div></nav>`;
}


// Keep the services list in sync with src/components/SiteFooter.jsx — the SSR
// blog shell is the only footer not rendered from that component.
function footer() {
  return `<footer><div class="wrap-wide">
<div style="margin-bottom:14px"><a href="/services/b2b-saas-seo">B2B SaaS SEO</a> ·
<a href="/services/ai-seo">AI SEO</a> ·
<a href="/services/generative-engine-optimization">GEO</a> ·
<a href="/services/answer-engine-optimization">AEO</a> ·
<a href="/services/technical-seo">Technical SEO</a> ·
<a href="/services/saas-content-marketing">SEO Content Engine</a></div>
© ${new Date().getFullYear()} ${SITE_NAME} · <a href="/">Home</a> ·
<a href="/services">Services</a> · <a href="/blog">Blog</a> · <a href="/apply">Founder Review</a> ·
<a href="/rss.xml">RSS</a> · <a href="/llm-info">Hey AI, learn about us!</a></div></footer>`;
}

function leadCta() {
  return `<div class="lead-cta">
<h3>Want this engine pointed at your SaaS?</h3>
<p>We took Sendr.ai from 0 to 1.05M organic impressions in 6 months. Get a free founder-level review of your inbound.</p>
<a href="/apply">Apply for a free review →</a></div>`;
}

function shell({ title, description, canonical, ogImage, ogImageAlt, ogType, jsonLd, body, robots, bodyClass }) {
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
<link rel="preload" as="font" type="font/woff2" href="/fonts/space-grotesk.woff2" crossorigin/>
<style>${CSS}</style>
${ld}
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-7PPJM1XXMS');(function(){var done=false;function load(){if(done)return;done=true;var g=document.createElement('script');g.async=true;g.src='https://www.googletagmanager.com/gtag/js?id=G-7PPJM1XXMS';document.head.appendChild(g);(function(key){if(window.reb2b)return;window.reb2b={loaded:true};var s=document.createElement('script');s.async=true;s.src='https://ddwl4m2hdecbv.cloudfront.net/b/'+key+'/'+key+'.js.gz';var f=document.getElementsByTagName('script')[0];f.parentNode.insertBefore(s,f);})('7N850H5EJVN1');}function schedule(){if('requestIdleCallback' in window)requestIdleCallback(load,{timeout:2500});else setTimeout(load,1800);}if(document.readyState==='complete')schedule();else window.addEventListener('load',schedule);})();</script>
</head><body${bodyClass ? ` class="${bodyClass}"` : ''}>${nav()}${body}${footer()}</body></html>`;
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
  // Bento rhythm: a wide lead tile, then a mix of thirds and halves. The
  // pattern repeats so any number of posts lays out without orphan gaps.
  const SPANS = ['tile-8', '', '', '', '', 'tile-8', 'tile-6', 'tile-6'];

  const tile = (p, i) => {
    const span = SPANS[i % SPANS.length];
    const num = String(i + 1).padStart(3, '0');
    const frame = p.cover_image_url
      ? `<div class="tile-frame"><span class="tile-num">${num}</span><img src="${escapeHtml(p.cover_image_url)}" alt="${escapeHtml(p.cover_image_alt || p.title)}" loading="${i < 2 ? 'eager' : 'lazy'}" decoding="async" width="1200" height="630"/></div>`
      : `<div class="tile-frame is-empty"><span class="tile-num">${num}</span></div>`;
    return `<a class="tile ${span}" href="/blog/${escapeHtml(p.slug)}">
${frame}<div class="tile-body">
${i === 0 ? '<span class="tile-kicker">Latest</span>' : ''}
<h2>${escapeHtml(p.title)}</h2>
<p>${escapeHtml(p.excerpt)}</p>
<div class="row"><span>${fmtDate(p.published_at)}</span><span>${p.reading_minutes} min read</span></div>
</div></a>`;
  };

  const body = `<div class="wrap-wide">
<div class="idx-head">
<h1>The RankedTag Blog</h1>
<p>Field notes on SEO, generative engine optimization, and building inbound engines for B2B SaaS.</p>
</div>
${posts.length
    ? `<div class="bento">${posts.map(tile).join('')}</div>`
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
    // Long-form reading surface: flips the token set to the warm paper canvas.
    bodyClass: 'read',
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

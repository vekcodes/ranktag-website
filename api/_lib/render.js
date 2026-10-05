// Server-side HTML renderer for the SEO-critical /blog pages.
// Self-contained document (brand styles inlined) so crawlers get full,
// fast, fully-rendered HTML — no client JS required to read content.
import { escapeHtml, SITE_URL, SITE_NAME, normalizeFaqs, authorNode, dedupeJsonLd, bylineName } from './blog.js';
import { pickAuthor, initialsFor } from './authors.js';
import { ORG_WEBSITE_JSONLD } from '../../src/seo/orgGraph.js';
import { wrapProseTables } from '../../src/lib/proseTables.js';

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
/* A table too wide for the screen scrolls inside its own card. On a phone a
   three-column table runs past the viewport edge, and with mobile scrollbars
   hidden there was nothing to say so — it just looked chopped off. The two
   radial gradients are shadows pinned to the scroll container's edges: because
   they are attached to the scrollport rather than the content, they show only
   on the side that still has table off-screen, and fade out as you reach it.
   The linear gradients sit on top in the surface colour and mask the shadow
   away when there is nothing to scroll to. */
.prose .prose-table{margin:2em 0;overflow-x:auto;-webkit-overflow-scrolling:touch;
overscroll-behavior-x:contain;border:1px solid var(--line-strong);border-radius:var(--r-md);
background:
linear-gradient(to right,var(--surface-1) 30%,rgba(31,31,32,0)) left center/2.5rem 100% no-repeat local,
linear-gradient(to left,var(--surface-1) 30%,rgba(31,31,32,0)) right center/2.5rem 100% no-repeat local,
radial-gradient(farthest-side at 0 50%,rgba(244,239,231,.22),rgba(244,239,231,0)) left center/1.5rem 100% no-repeat scroll,
radial-gradient(farthest-side at 100% 50%,rgba(244,239,231,.22),rgba(244,239,231,0)) right center/1.5rem 100% no-repeat scroll,
var(--surface-1)}
/* Keep the scrollbar visible rather than letting the platform hide it: the
   affordance is the whole point here. */
.prose .prose-table::-webkit-scrollbar{height:8px}
.prose .prose-table::-webkit-scrollbar-thumb{background:var(--line-strong);border-radius:999px}
.prose .prose-table::-webkit-scrollbar-track{background:transparent}
.prose .prose-table{scrollbar-width:thin;scrollbar-color:var(--line-strong) transparent}
.prose table{width:100%;min-width:32rem;border-collapse:collapse;font-size:1rem;line-height:1.6}
.prose th,.prose td{padding:.85em 1.1em;text-align:left;vertical-align:top;
border-bottom:1px solid var(--line)}
.prose th{color:var(--text-1);font-weight:600;font-size:var(--fs-micro);
letter-spacing:var(--track-micro);text-transform:uppercase;font-family:var(--font-mono);
background:var(--surface-2);border-bottom:1px solid var(--line-strong)}
.prose tbody tr:last-child td{border-bottom:0}
.prose th>*,.prose td>*{margin:0}
.prose th>*+*,.prose td>*+*{margin-top:.5em}
.prose td img{margin:0;border:0;border-radius:var(--r-sm)}
/* On a phone, a three-column table forced to 32rem leaves a column off-screen.
   Letting it shrink to the viewport costs some line wrapping and keeps every
   column visible, which is the better trade on a narrow screen: readers see
   the whole table instead of discovering a third of it only if they think to
   swipe. Tighter padding and type buy back the room the wrapping costs. Wider
   tables still scroll, and still show the edge glow and scrollbar. */
@media(max-width:560px){
.prose table{min-width:0;font-size:.9375rem}
.prose th,.prose td{padding:.7em .8em}
.prose th{font-size:.625rem}
}
.tags{display:flex;flex-wrap:wrap;gap:.5rem;margin:2.5rem 0 0}
.tag{display:inline-block;font-family:var(--font-mono);font-size:var(--fs-micro);letter-spacing:.06em;
border:1px solid var(--line-strong);padding:.35rem .7rem;border-radius:var(--r-sm);color:var(--text-3)}
.related{margin:4.5rem 0 0;padding:2.5rem 0 0;border-top:1px solid var(--line-strong)}
.related-h{font-size:var(--fs-micro);letter-spacing:var(--track-micro);
text-transform:uppercase;font-family:var(--font-mono);color:var(--text-3);margin:0 0 1.5rem}
.related-list{list-style:none;margin:0;padding:0;display:grid;gap:1.25rem}
.related-list li{padding:0}
.related-list a{font-size:1.15rem;font-weight:600;color:var(--text-1);
text-decoration:none;line-height:1.35;display:block}
.related-list a:hover{text-decoration:underline}
.related-x{display:block;margin-top:.35rem;color:var(--text-3);font-size:.95rem;line-height:1.5}
@media(max-width:640px){.related-list a{font-size:1.05rem}}
/* Plain text. The byline is not a link: the author's profiles live on the
   card at the foot of the post, not in a meta line a reader skims on the way
   into the article. */
.byline{color:inherit}
/* Author card ---------------------------------------------------------- */
/* Who wrote this, what they do, where to find them. The name is deliberately
   not a link — only the profile icons are clickable, and each goes off-site
   to a profile the Person's sameAs also claims. */
.author-card{margin:4.5rem 0 0;padding:1.5rem 1.65rem;
border:1px solid var(--line-strong);border-radius:var(--r-xl);background:var(--surface-1)}
.ac-title{font-size:1.0625rem;font-weight:700;line-height:1.3;margin:0 0 1rem;
padding:0 0 1rem;border-bottom:1px solid var(--line-strong);letter-spacing:var(--track-tight)}
.ac-row{display:flex;align-items:center;gap:1rem}
.ac-avatar{flex:0 0 auto;width:52px;height:52px;border-radius:50%;display:grid;place-items:center;
overflow:hidden;border:1px solid var(--line-strong);background:var(--surface-2);color:var(--text-1);
font-family:var(--font-mono);font-weight:600;font-size:.9375rem;letter-spacing:.02em}
.ac-avatar img{width:100%;height:100%;object-fit:cover;display:block}
.ac-id{min-width:0;flex:1 1 auto}
.ac-name{font-size:1.0625rem;font-weight:600;line-height:1.3;color:var(--text-1);margin:0}
.ac-role{color:var(--text-3);font-size:.875rem;line-height:1.4;margin:.2rem 0 0}
.ac-bio{color:var(--text-2);font-size:.9375rem;line-height:1.65;margin:1rem 0 0;max-width:62ch}
.ac-social{display:flex;flex-wrap:wrap;gap:.5rem;list-style:none;margin:0;padding:0}
.ac-social a{display:grid;place-items:center;width:32px;height:32px;border-radius:50%;
background:var(--text-1);color:var(--bg);text-decoration:none;transition:opacity .2s var(--ease)}
.ac-social a:hover{opacity:.75}
@media(max-width:560px){
.author-card{padding:1.25rem}
.ac-row{flex-wrap:wrap}
.ac-avatar{width:46px;height:46px;font-size:.875rem}
.ac-social{flex-basis:100%;margin-top:.25rem}
}
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
/* The question heading is a document-outline node, not a style change: it
   inherits everything from .faq-q so the card looks exactly as it did. */
.faq-qt{font:inherit;letter-spacing:inherit;color:inherit;margin:0}
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

/* — Bento ————————————————————————————————————————
   Masonry columns, not a row grid. Tiles size to their own content, so a
   short tile never stretches to match a tall neighbour and leave a void in
   its middle. Images are flush to the tile edge at their natural ratio:
   no frame, no inset border, nothing cropped. */
.bento-lead{display:grid;grid-template-columns:minmax(0,7fr) minmax(0,5fr);align-items:center;
gap:0;background:var(--surface-1);border:1px solid var(--line);border-radius:var(--r-xl);
overflow:hidden;margin:0 0 clamp(.875rem,1.4vw,1.25rem);
transition:transform .45s var(--ease),border-color .45s var(--ease)}
.bento-lead:hover{transform:translateY(-4px);border-color:var(--line-strong)}
/* Natural ratio here too: the image sets the row height and the copy
   column centres against it, so the lead cover is never cropped. */
.bento-lead img{display:block;width:100%;height:auto;align-self:center}
.bento-lead .tile-body{padding:clamp(1.5rem,2.6vw,2.5rem);justify-content:center}
.bento-lead h2{font-size:clamp(1.5rem,2.6vw,2.25rem);letter-spacing:var(--track-h2);line-height:1.1}
.bento-lead p{font-size:1rem;-webkit-line-clamp:3}
@media(max-width:820px){.bento-lead{grid-template-columns:1fr}}

/* Browser-balanced masonry. An earlier version dealt posts into three
   fixed-width columns using an estimated tile height; server-side the cover
   ratios are unknown, so the estimate drifted and the narrow column ran out
   early, leaving a tall void down the middle. CSS multi-column balances by
   real rendered height, so the columns always finish level. Bento variety
   comes from the tile treatments instead of the column widths. */
.bento{columns:3;column-gap:clamp(.875rem,1.4vw,1.25rem);padding:0 0 5rem;counter-reset:post}
@media(max-width:1100px){.bento{columns:2}}
@media(max-width:680px){.bento{columns:1}}

.tile{counter-increment:post;break-inside:avoid;-webkit-column-break-inside:avoid;
page-break-inside:avoid;display:block;width:100%;margin:0 0 clamp(.875rem,1.4vw,1.25rem);
background:var(--surface-1);border:1px solid var(--line);border-radius:var(--r-xl);
overflow:hidden;transition:transform .45s var(--ease),border-color .45s var(--ease)}
.tile:hover{transform:translateY(-4px);border-color:var(--line-strong)}
/* Flush, natural ratio: never cropped, never letterboxed, no visible frame. */
.tile-media{position:relative;overflow:hidden;line-height:0}
.tile-media img{display:block;width:100%;height:auto;
transition:transform .7s var(--ease)}
.tile:hover .tile-media img{transform:scale(1.045)}
.tile-badge{position:absolute;top:.6rem;right:.6rem;padding:.24rem .58rem;border-radius:999px;
background:rgba(19,19,20,.78);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);
border:1px solid var(--line-strong);font-family:var(--font-mono);font-size:var(--fs-micro);
letter-spacing:.06em;color:var(--text-2)}
.tile-body{padding:1.05rem 1.15rem 1.25rem;display:flex;flex-direction:column;gap:.45rem}
.tile h2{font-size:1.0625rem;font-weight:600;line-height:1.25;color:var(--text-1)}
.tile p{color:var(--text-3);font-size:.875rem;line-height:1.6;
display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.tile .row,.bento-lead .row{display:flex;align-items:center;gap:.9rem;padding-top:.15rem;
font-family:var(--font-mono);font-size:var(--fs-micro);letter-spacing:.06em;
text-transform:uppercase;color:var(--text-4)}
.tile-kicker{font-family:var(--font-mono);font-size:var(--fs-micro);
letter-spacing:var(--track-micro);text-transform:uppercase;color:var(--accent-on-raised)}

/* Size variety, bento-style: a feature tile with bigger type, a compact tile
   that drops the excerpt, and a text-only tile that fills awkward runs. */
.t-lg h2{font-size:clamp(1.25rem,1.9vw,1.6rem);letter-spacing:var(--track-h2);line-height:1.15}
.t-lg p{-webkit-line-clamp:3}
.t-sm p{display:none}
.t-sm .tile-body{padding:.9rem 1.05rem 1rem}
.t-quote{background:linear-gradient(160deg,var(--surface-2),var(--surface-1))}
.t-quote h2{font-size:clamp(1.15rem,1.7vw,1.45rem);line-height:1.2}
.t-quote .tile-body{padding:1.35rem 1.25rem 1.4rem;gap:.6rem}
.t-quote .tile-mark{font-family:var(--font-display);font-size:2rem;line-height:1;
color:var(--accent-on-raised)}
/* Accent tile: a warm wash so a run of dark cards is broken up. */
.t-accent{background:linear-gradient(155deg,rgba(248,48,0,.15),var(--surface-1) 62%);
border-color:color-mix(in srgb,var(--red) 22%,var(--line))}
.t-accent h2{font-size:clamp(1.15rem,1.7vw,1.45rem);line-height:1.2}
/* Arrow that resolves on hover, matching the app's .ar behaviour. */
.tile-go{margin-left:auto;color:var(--accent-on-raised);opacity:0;
transform:translateX(-.35em);transition:opacity .35s var(--ease),transform .35s var(--ease)}
.tile:hover .tile-go{opacity:1;transform:none}
.empty{text-align:center;padding:5rem 0;color:var(--text-3)}
/* — Site footer ————————————————————————————————————
   Mirrors src/components/SiteFooter.jsx so the blog does not drop to a
   different, lighter footer than every other page. */
footer.footer{background:var(--bg);color:var(--text-1);padding:clamp(4rem,8vw,7rem) 0 2rem;
position:relative;border-top:1px solid var(--line);overflow:hidden;margin-top:4rem}
.footer-grid{display:grid;grid-template-columns:minmax(0,3fr) repeat(4,minmax(0,2fr));
gap:2.5rem clamp(1rem,2vw,1.5rem);padding-bottom:4rem}
.footer-brand{display:flex;flex-direction:column;gap:1.25rem;align-items:flex-start}
.footer-brand img{height:32px;width:auto}
.footer-blurb{font-size:.875rem;line-height:1.65;color:var(--text-3);max-width:32ch}
.footer-col h4{display:flex;align-items:baseline;gap:.6em;font-family:var(--font-mono);
font-size:var(--fs-micro);font-weight:500;letter-spacing:var(--track-micro);
text-transform:uppercase;color:var(--text-3);margin-bottom:1.25rem}
.footer-col h4 span{color:var(--text-4)}
.footer-col a{display:block;width:fit-content;font-size:.875rem;line-height:1.5;
color:var(--text-2);margin-bottom:.75rem;transition:color .25s var(--ease)}
.footer-col a:hover{color:var(--text-1)}
.footer-wordmark{font-family:var(--font-display);font-weight:700;
font-size:clamp(3.5rem,15.2vw,17rem);line-height:.82;letter-spacing:-.05em;
color:var(--text-1);opacity:.1;text-align:center;user-select:none;white-space:nowrap;
margin:0 0 2rem;transition:opacity .6s var(--ease)}
footer.footer:hover .footer-wordmark{opacity:.16}
.footer-bottom{display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;
gap:.75rem;padding-top:1.5rem;border-top:1px solid var(--line);font-family:var(--font-mono);
font-size:var(--fs-micro);letter-spacing:var(--track-micro);color:var(--text-3)}
.footer-ai-link{color:var(--peri);transition:color .25s var(--ease)}
.footer-ai-link:hover{color:#B3BFFA}
@media(max-width:1024px){.footer-grid{grid-template-columns:repeat(3,minmax(0,1fr))}}
@media(max-width:760px){.footer-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:2rem 1.25rem}}
@media(max-width:480px){.footer-grid{grid-template-columns:1fr}}
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
  const services = [
    ['b2b-saas-seo', 'B2B SaaS SEO'], ['ai-seo', 'AI SEO'],
    ['generative-engine-optimization', 'Generative Engine Optimization'],
    ['answer-engine-optimization', 'Answer Engine Optimization'],
    ['technical-seo', 'Technical SEO'], ['saas-content-marketing', 'SEO Content Engine'],
  ];
  return `<footer class="footer"><div class="wrap-wide">
<div class="footer-grid">
<div class="footer-brand">
<a href="/" aria-label="RankedTag home"><img src="/rankedtag-logo-light.svg" alt="RankedTag" width="121" height="32"/></a>
<p class="footer-blurb">The Inbound Engine for SaaS founders who would rather build product than babysit an agency. Built with senior humans, Claude, and N8N.</p>
</div>
<div class="footer-col"><h4><span>001</span>Services</h4>
${services.map(([slug, label]) => `<a href="/services/${slug}">${label}</a>`).join('')}
<a href="/services">All services →</a></div>
<div class="footer-col"><h4><span>002</span>Free tools</h4>
<a href="/keyword-density-checker">Keyword Density Checker</a>
<a href="/domain-authority-checker">Domain Authority Checker</a>
<a href="/page-speed-checker">Page Speed Checker</a>
<a href="/competitor-analysis">Competitor Analysis</a>
<a href="/apply">Site Audit (Founder Review)</a></div>
<div class="footer-col"><h4><span>003</span>The product</h4>
<a href="/#how-it-works">How it works</a>
<a href="/case-study/sendr">Sendr.ai case study</a>
<a href="/blog">Blog</a>
<a href="/apply">Apply</a></div>
<div class="footer-col"><h4><span>004</span>Company</h4>
<a href="mailto:hello@rankedtag.com">hello@rankedtag.com</a>
<a href="https://www.linkedin.com/" target="_blank" rel="noreferrer">LinkedIn</a></div>
</div>
<div class="footer-wordmark" aria-hidden="true">RANKEDTAG</div>
<div class="footer-bottom">
<span>© ${new Date().getFullYear()} RANKEDTAG · BUILT FOR FOUNDERS, NOT MARKETERS</span>
<a class="footer-ai-link" href="/llm-info">Hey AI, learn about us!</a>
</div></div></footer>`;
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
  // Each question is an <h3> inside the <summary>, under the section's <h2>.
  // The questions are real subsections of the FAQ, so they belong in the
  // document outline — a <summary> alone is a control, not a heading, and
  // leaves the FAQ as one undifferentiated block to crawlers and to anyone
  // navigating by headings. The h3 carries no styling of its own; the grid
  // and type still come from .faq-q on the summary.
  const items = list
    .map(
      (f) => `<details class="faq-item">
<summary class="faq-q"><h3 class="faq-qt">${escapeHtml(f.q)}</h3><span class="faq-ic" aria-hidden="true">+</span></summary>
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

/**
 * @param posts  rows to render
 * @param opts.tag  the active ?tag= filter, if any. Nothing on the site links
 *   here any more — post tags are plain labels — but the handler stays so the
 *   ?tag= URLs Google already discovered keep resolving. A filtered view is a
 *   thin duplicate of /blog, so it is noindex, follow: Google drops it from
 *   the index but still walks through to the posts. It is deliberately NOT
 *   blocked in robots.txt, because a blocked URL can never be crawled to
 *   discover the noindex.
 * @param opts.authors  the author registry, for the listing schema's bylines.
 */
export function renderIndex(posts, opts = {}) {
  // Size rhythm across the masonry: feature, normal, compact, text-only.
  // Repeating so any number of posts stays varied without leaving holes.
  // Size rhythm. The mix of feature / normal / compact / accent / text-only
  // is what gives the grid its bento variety; it repeats so any number of
  // posts stays varied.
  const VARIANTS = ['t-lg', '', 't-sm', 't-accent', '', 't-quote', 't-sm', 't-lg'];

  const tile = (p, i) => {
    const v = VARIANTS[i % VARIANTS.length];
    const textOnly = v === 't-quote' || v === 't-accent';
    const media = !textOnly && p.cover_image_url
      ? `<div class="tile-media"><img src="${escapeHtml(p.cover_image_url)}" alt="${escapeHtml(p.cover_image_alt || p.title)}" loading="lazy" decoding="async" width="1200" height="630"/><span class="tile-badge">${p.reading_minutes} min</span></div>`
      : '';
    return `<a class="tile ${v}" href="/blog/${escapeHtml(p.slug)}">
${media}<div class="tile-body">
${v === 't-quote' ? '<span class="tile-mark" aria-hidden="true">&ldquo;</span>' : ''}
<h2>${escapeHtml(p.title)}</h2>
<p>${escapeHtml(p.excerpt)}</p>
<div class="row"><span>${fmtDate(p.published_at)}</span>${textOnly ? `<span>${p.reading_minutes} min read</span>` : ''}<span class="tile-go" aria-hidden="true">→</span></div>
</div></a>`;
  };

  const lead = posts[0];
  const leadHtml = lead
    ? `<a class="bento-lead" href="/blog/${escapeHtml(lead.slug)}">
${lead.cover_image_url
      ? `<img src="${escapeHtml(lead.cover_image_url)}" alt="${escapeHtml(lead.cover_image_alt || lead.title)}" decoding="async" width="1200" height="630"/>`
      : '<span></span>'}
<div class="tile-body">
<span class="tile-kicker">Latest</span>
<h2>${escapeHtml(lead.title)}</h2>
<p>${escapeHtml(lead.excerpt)}</p>
<div class="row"><span>${fmtDate(lead.published_at)}</span><span>${lead.reading_minutes} min read</span></div>
</div></a>`
    : '';

  const rest = posts.slice(1);

  const body = `<div class="wrap-wide">
<div class="idx-head">
<h1>The RankedTag Blog</h1>
<p>Field notes on SEO, generative engine optimization, and building inbound engines for B2B SaaS.</p>
</div>
${posts.length
    ? `${leadHtml}<div class="bento">${rest.map(tile).join('')}</div>`
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
        '@id': `${SITE_URL}/#org`,
        name: SITE_NAME,
        url: SITE_URL,
        logo: { '@type': 'ImageObject', url: `${SITE_URL}/rankedtag-logo.png` },
      },
      ...(posts.length
        ? {
            mainEntity: posts.map((p) => ({
              '@type': 'BlogPosting',
              headline: p.title,
              url: `${SITE_URL}/blog/${p.slug}`,
              description: p.excerpt,
              // image is required on BlogPosting; the listing entries were
              // omitting it. Falls back to the site logo when a post has no
              // cover, which is still a valid image for the entity.
              image: p.cover_image_url || `${SITE_URL}/rankedtag-logo.png`,
              datePublished: p.published_at,
              author: authorNode(p.author, opts.authors),
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
    ...(opts.tag ? { robots: 'noindex, follow' } : {}),
    ogImage: `${SITE_URL}/rankedtag-logo.png`,
    ogType: 'website',
    jsonLd,
    body,
  });
}

/**
 * `opts.preview` renders a draft or not-yet-due scheduled post for a logged-in
 * admin: a banner so it can never be mistaken for the live page, and
 * noindex/nofollow so a leaked link cannot be indexed. The route also sends
 * no-store, so no preview ever reaches the shared edge cache.
 */
/**
 * Related posts: three server-rendered links chosen by shared tags.
 *
 * Before this, every post in the catalogue had exactly one inbound internal
 * link — from /blog — leaving all 33 at crawl depth 2 with no lateral paths
 * between them. Crawl demand follows links from pages a crawler already
 * trusts, so a flat catalogue with a single hub starves every leaf equally.
 *
 * Ranking is by shared-tag count, then recency, so the links are topically
 * genuine rather than a random block. Anchor text is the post's real title,
 * never "read more" — the anchor is the strongest relevance signal a link
 * carries, and a generic one wastes it.
 */
function renderRelated(current, pool) {
  const tags = new Set(current.tags || []);
  const scored = (pool || [])
    .filter((p) => p.slug !== current.slug)
    .map((p) => ({
      p,
      shared: (p.tags || []).filter((t) => tags.has(t)).length,
    }))
    .filter((x) => x.shared > 0)
    .sort((a, b) =>
      b.shared - a.shared ||
      new Date(b.p.published_at) - new Date(a.p.published_at)
    )
    .slice(0, 3)
    .map((x) => x.p);

  if (scored.length < 2) return '';

  return `<aside class="related">
<h2 class="related-h">Related reading</h2>
<ul class="related-list">
${scored.map((p) => `<li><a href="/blog/${escapeHtml(p.slug)}">${escapeHtml(p.title)}</a>${
    p.excerpt ? `<span class="related-x">${escapeHtml(p.excerpt.slice(0, 110))}</span>` : ''
  }</li>`).join('')}
</ul>
</aside>`;
}

// Brand marks, inline so they need no network request and inherit the text
// colour. 24x24 viewBox, single path each, aria-hidden because the link's
// aria-label already names the destination.
const SOCIAL_ICON = {
  linkedin: '<path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05a3.74 3.74 0 0 1 3.37-1.85c3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.07 2.07 0 1 1 0-4.13 2.07 2.07 0 0 1 0 4.13Zm1.78 13.02H3.55V9h3.57v11.45ZM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0Z"/>',
  instagram: '<path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.72 3.72 0 0 1-1.38-.9c-.42-.42-.68-.82-.9-1.38-.16-.42-.36-1.06-.41-2.23-.06-1.27-.07-1.65-.07-4.85s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41 1.27-.06 1.65-.07 4.85-.07ZM12 0C8.74 0 8.33.01 7.05.07 5.78.13 4.9.33 4.14.63a5.88 5.88 0 0 0-2.13 1.38A5.88 5.88 0 0 0 .63 4.14C.33 4.9.13 5.78.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.06 1.27.26 2.15.56 2.91a5.88 5.88 0 0 0 1.38 2.13c.67.67 1.34 1.08 2.13 1.38.76.3 1.64.5 2.91.56C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c1.27-.06 2.15-.26 2.91-.56a5.88 5.88 0 0 0 2.13-1.38c.67-.67 1.08-1.34 1.38-2.13.3-.76.5-1.64.56-2.91.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.06-1.27-.26-2.15-.56-2.91a5.88 5.88 0 0 0-1.38-2.13A5.88 5.88 0 0 0 19.86.63c-.76-.3-1.64-.5-2.91-.56C15.67.01 15.26 0 12 0Zm0 5.84a6.16 6.16 0 1 0 0 12.32 6.16 6.16 0 0 0 0-12.32Zm0 10.16a4 4 0 1 1 0-8 4 4 0 0 1 0 8Zm7.85-10.4a1.44 1.44 0 1 1-2.88 0 1.44 1.44 0 0 1 2.88 0Z"/>',
  x: '<path d="M18.9 1.15h3.68l-8.04 9.19L24 22.85h-7.41l-5.8-7.584-6.64 7.584H.47l8.6-9.83L0 1.15h7.59l5.24 6.932ZM17.61 20.64h2.04L6.49 3.24H4.3Z"/>',
  website: '<path d="M12 1.5a10.5 10.5 0 1 0 0 21 10.5 10.5 0 0 0 0-21Zm7.1 6.3h-3.02a16.3 16.3 0 0 0-1.6-4.03A8.56 8.56 0 0 1 19.1 7.8ZM12 3.56c.78 1.13 1.4 2.56 1.79 4.24h-3.58c.4-1.68 1.01-3.11 1.79-4.24ZM3.66 13.9A8.6 8.6 0 0 1 3.4 12c0-.65.1-1.29.26-1.9h3.46a17.9 17.9 0 0 0 0 3.8H3.66Zm.83 1.9h3.02c.37 1.46.9 2.82 1.6 4.03A8.56 8.56 0 0 1 4.49 15.8Zm3.02-7.6H4.49a8.56 8.56 0 0 1 4.62-4.03 16.3 16.3 0 0 0-1.6 4.03ZM12 20.44c-.78-1.13-1.4-2.56-1.79-4.24h3.58c-.4 1.68-1.01 3.11-1.79 4.24Zm2.16-6.14H9.84a16 16 0 0 1 0-4.6h4.32a16 16 0 0 1 0 4.6Zm.73 5.53c.7-1.21 1.23-2.57 1.6-4.03h3.02a8.56 8.56 0 0 1-4.62 4.03Zm1.99-5.93a17.9 17.9 0 0 0 0-3.8h3.46c.17.61.26 1.25.26 1.9s-.09 1.29-.26 1.9h-3.46Z"/>',
};

/**
 * The author card that closes a post.
 *
 * Name, role and an optional short bio, as a plain identification block. The
 * name is deliberately not a link: the site publishes no author pages, so
 * there is nowhere for it to go, and a byline linking to a 404 is worse than
 * plain text. Only the profile icons are clickable, and each one leaves the
 * site for a profile the Person's `sameAs` also claims.
 *
 * A byline that is not in the registry gets no card: the site holds no role or
 * profiles for that person, and borrowing someone else's would be a
 * misattribution. The byline itself still renders either way.
 */
function authorCard(name, authors) {
  const a = pickAuthor(authors, name);
  if (!a) return '';
  const links = (a.social || []).filter((s) => s.url && SOCIAL_ICON[s.key]);
  const avatar = a.avatarUrl
    ? `<img src="${escapeHtml(a.avatarUrl)}" alt="" width="52" height="52" loading="lazy" decoding="async"/>`
    : escapeHtml(a.initials || initialsFor(a.name));
  return `<aside class="author-card">
<h2 class="ac-title">Author Profile</h2>
<div class="ac-row">
<div class="ac-avatar" aria-hidden="true">${avatar}</div>
<div class="ac-id">
<p class="ac-name">${escapeHtml(a.name)}</p>
${a.jobTitle ? `<p class="ac-role">${escapeHtml(a.jobTitle)}</p>` : ''}
</div>
${links.length ? `<ul class="ac-social">
${links.map((s) => `<li><a href="${escapeHtml(s.url)}" rel="me noopener noreferrer" target="_blank" aria-label="${escapeHtml(a.name)} on ${escapeHtml(s.label)}">
<svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true">${SOCIAL_ICON[s.key]}</svg></a></li>`).join('')}
</ul>` : ''}
</div>
${a.bio ? `<p class="ac-bio">${escapeHtml(a.bio)}</p>` : ''}
</aside>`;
}

export function renderPost(post, jsonLd, opts = {}) {
  const cover = post.cover_image_url
    ? `<img class="cover" src="${escapeHtml(post.cover_image_url)}" alt="${escapeHtml(post.cover_image_alt || post.title)}" width="1200" height="630" fetchpriority="high"/>`
    : '';
  const tags = (post.tags || [])
    // Labels, not links. Each tag used to point at /blog?tag=…: 12 tags per
    // post across 33 posts minted 314 unique query URLs — roughly six times
    // the site's real URL count, every one a thin duplicate of /blog, and GSC
    // reported them as discovered alternates. rel="nofollow" only stopped the
    // crawl path; the URLs were still discoverable from the rendered page and
    // shareable. A <span> removes the alternate URL entirely, which is the
    // only thing that actually fixes it.
    .map((t) => `<span class="tag">#${escapeHtml(t)}</span>`)
    .join('');

  const banner = opts.preview
    ? `<div style="background:#3d2c00;color:#ffd97a;padding:10px 18px;font:600 14px/1.4 system-ui,sans-serif;text-align:center">
Preview — ${post.status === 'scheduled' && post.publish_at
        ? `scheduled for ${escapeHtml(fmtDate(post.publish_at))}`
        : escapeHtml(post.status || 'draft')}. Not visible to the public.
</div>`
    : '';

  const body = `${banner}<div class="wrap">
<div class="crumbs"><a href="/">Home</a> › <a href="/blog">Blog</a> › ${escapeHtml(post.title)}</div>
<header class="post-head">
<span class="kicker">${escapeHtml((post.tags && post.tags[0]) || 'Article')}</span>
<h1 class="title">${escapeHtml(post.title)}</h1>
<div class="meta">
<span>By <span class="byline">${escapeHtml(bylineName(post.author))}</span></span>
<span>${fmtDate(post.published_at)}</span>
<span>${post.reading_minutes} min read</span>
</div></header>
${cover}
<article class="prose">${wrapProseTables(post.content_html)}</article>
${tags ? `<div class="tags">${tags}</div>` : ''}
${renderFaqs(post.faqs)}
${authorCard(bylineName(post.author), opts.authors)}
${renderRelated(post, opts.related)}
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
    jsonLd: dedupeJsonLd([ORG_WEBSITE_JSONLD, ...jsonLd]),
    body,
    ...(opts.preview ? { robots: 'noindex, nofollow' } : {}),
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

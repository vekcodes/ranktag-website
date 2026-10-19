// Single source of truth for per-route <head> meta on the pre-rendered tool and
// apply pages. Imported by BOTH the page components (client-side usePageMeta, so the
// SPA shows correct meta on in-app navigation) AND vite.config.js's
// onBeforePageRender hook (which bakes the same title/description/canonical into
// the build-time static HTML). Keeping one source guarantees the raw HTML a
// crawler sees and the hydrated SPA never drift apart.
//
// Pure data only — this module is imported by the Vite config at build time, so
// it must not pull in React, CSS, or any browser globals.
import { SERVICES, SERVICES_HUB_META, serviceUrl, SITE } from '../pages/whatWeDo/capabilitiesData.js';
import { VERTICALS, verticalUrl, WHO_WE_HELP_META } from '../pages/verticals/verticalsData.js';
import { COMPARISONS, comparisonUrl, BEST_HUB_META } from '../pages/best/comparisonsData.js';
import { EXPLAINERS, explainerUrl } from '../pages/explainers/explainersData.js';
import { GLOSSARY_META } from '../pages/glossary/glossaryData.js';
import { ABOUT_META } from '../pages/about/aboutData.js';
import { CONTACT_META, PRIVACY_META, TERMS_META, CASE_STUDIES_META } from '../pages/company/companyData.js';

// One head entry per service page, derived from the same data that renders the
// pages — the SSG head rewrite and the hydrated SPA can never drift apart.
const SERVICE_META = Object.fromEntries([
  ['/what-we-do', { ...SERVICES_HUB_META, ogImage: `${SITE}/og/what-we-do.png`,
    ogImageAlt: 'The six capabilities RankedTag runs' }],
  ...SERVICES.map((s) => [
    `/what-we-do/${s.slug}`,
    {
      title: s.title,
      description: s.description,
      canonical: serviceUrl(s.slug),
      ogImage: `${SITE}/og/what-we-do-${s.slug}.png`,
      ogImageAlt: `RankedTag ${s.nav}`,
    },
  ]),
]);

// One head entry per vertical page. Without these the SSG head rewrite falls
// back to the homepage defaults and bakes a canonical of "/" into every
// vertical page — which would hand Google a duplicate of the homepage.
const VERTICAL_META = Object.fromEntries(
  VERTICALS.map((v) => [
    `/${v.slug}`,
    {
      title: `${v.title} | RankedTag`,
      description: v.description,
      canonical: verticalUrl(v.slug),
      ogImage: `${SITE}/og/${v.slug}.png`,
      ogImageAlt: `RankedTag ${v.nav} SEO`,
    },
  ])
);

export const TOOL_META = {
  ...SERVICE_META,
  ...VERTICAL_META,
  '/who-we-help': { ...WHO_WE_HELP_META, ogImage: `${SITE}/og/who-we-help.png`,
    ogImageAlt: 'The six verticals RankedTag works' },
  ...Object.fromEntries(
    EXPLAINERS.map((e) => [
      `/${e.slug}`,
      {
        title: `${e.title} | RankedTag`,
        description: e.description,
        canonical: explainerUrl(e.slug),
        ogImage: `${SITE}/og/${e.slug}.png`,
        ogImageAlt: e.nav,
      },
    ])
  ),
  '/about': { ...ABOUT_META, ogImage: `${SITE}/og/about.png`,
    ogImageAlt: 'Bhushan Raj Shakya, founder of RankedTag' },
  '/contact': { ...CONTACT_META, ogImage: `${SITE}/og/contact.png`,
    ogImageAlt: 'How to contact RankedTag' },
  '/case-studies': { ...CASE_STUDIES_META, ogImage: `${SITE}/og/case-studies.png`,
    ogImageAlt: 'RankedTag case studies' },
  '/privacy': { ...PRIVACY_META, ogImage: `${SITE}/og/privacy.png`,
    ogImageAlt: 'RankedTag privacy policy' },
  '/terms': { ...TERMS_META, ogImage: `${SITE}/og/terms.png`,
    ogImageAlt: 'RankedTag terms of use' },
  '/glossary': { ...GLOSSARY_META, ogImage: `${SITE}/og/glossary.png`,
    ogImageAlt: 'SEO and AI search glossary from RankedTag' },
  '/best': { ...BEST_HUB_META, ogImage: `${SITE}/og/best.png`,
    ogImageAlt: 'Agency shortlists published by RankedTag' },
  ...Object.fromEntries(
    COMPARISONS.map((c) => [
      c.path,
      {
        title: `${c.title} | RankedTag`,
        description: c.description,
        canonical: comparisonUrl(c.slug),
        ogImage: `${SITE}/og/best-${c.slug}.png`,
        ogImageAlt: `${c.nav}, compared by RankedTag`,
      },
    ])
  ),
  '/schema-generator': {
    title: 'Schema Markup Generator: Free JSON-LD Builder',
    description:
      'Free schema markup generator for Organization, LocalBusiness, Service, Product and FAQPage. Valid JSON-LD, empty properties dropped. Runs in your browser.',
    canonical: '{SITE}/schema-generator'.replace('{SITE}', SITE),
    ogImage: `${SITE}/og/schema-generator.png`,
    ogImageAlt: 'Free JSON-LD schema generator from RankedTag',
  },
  '/llms-txt-generator': {
    title: 'llms.txt Generator: Build Your AI Summary File',
    description:
      'Free llms.txt generator. Build the Markdown summary some AI tools look for, with curated links. Honest about what the file does and does not do.',
    canonical: '{SITE}/llms-txt-generator'.replace('{SITE}', SITE),
    ogImage: `${SITE}/og/llms-txt-generator.png`,
    ogImageAlt: 'Free llms.txt generator from RankedTag',
  },
  '/serp-preview-tool': {
    title: 'SERP Preview Tool: Google Title and Description',
    description:
      'Free SERP preview tool. See how your title tag and meta description render in Google, with truncation estimated by pixel width rather than character count.',
    canonical: '{SITE}/serp-preview-tool'.replace('{SITE}', SITE),
    ogImage: `${SITE}/og/serp-preview-tool.png`,
    ogImageAlt: 'Free Google SERP preview tool from RankedTag',
  },
  '/apply': {
    title: 'Apply for a Free Founder Review | RankedTag',
    description:
      'Apply for a free, founder-reviewed SEO, AI SEO and GEO audit of your site. We take four founders a month and reply on LinkedIn within 48 hours.',
    canonical: 'https://rankedtag.com/apply',
    ogImage: 'https://rankedtag.com/og/apply.png',
    ogImageAlt: 'Apply for a free founder review from RankedTag',
  },
  '/keyword-density-checker': {
    title: 'Keyword Density Checker: Free Word Density Tool',
    description:
      'Free keyword density checker. Paste text or a URL to see word and phrase density percentages, catch keyword stuffing, and optimize for Google and AI search.',
    canonical: 'https://rankedtag.com/keyword-density-checker',
    ogImage: 'https://rankedtag.com/og/keyword-density-checker.png',
    ogImageAlt: 'RankedTag free keyword density checker tool',
  },
  '/domain-authority-checker': {
    title: 'Domain Authority Checker: Free, No Ahrefs Key',
    description:
      'Free domain authority checker. Get a composite DA score from traffic rank, domain age, schema and HTTP transport, every input source-linked. No Ahrefs key.',
    canonical: 'https://rankedtag.com/domain-authority-checker',
    ogImage: 'https://rankedtag.com/og/domain-authority-checker.png',
    ogImageAlt: 'RankedTag free domain authority checker tool',
  },
  '/page-speed-checker': {
    title: 'Page Speed Checker: Free Website Speed Test',
    description:
      'Free page speed checker. Test any URL on mobile and desktop across five real signals, with a ranked fix-first list in under five seconds. No PSI key needed.',
    canonical: 'https://rankedtag.com/page-speed-checker',
    ogImage: 'https://rankedtag.com/og/page-speed-checker.png',
    ogImageAlt: 'RankedTag free page speed checker tool',
  },
  '/competitor-analysis': {
    title: 'Competitor Analysis Tool: Free Competitor Check',
    description:
      'Free competitor analysis tool. Compare your page against up to five competitors side by side on keyword coverage, readability and structure, and find your gaps.',
    canonical: 'https://rankedtag.com/competitor-analysis',
    ogImage: 'https://rankedtag.com/og/competitor-analysis.png',
    ogImageAlt: 'RankedTag free competitor analysis tool',
  },
  '/case-study/sendr': {
    title: 'sendr.ai: 1.05M Impressions in 6 Months',
    description:
      "How RankedTag took sendr.ai from 0 to 1.05M impressions in 6 months, and to #2 in Google's AI Overview, above ZoomInfo. The full B2B SaaS SEO and GEO playbook.",
    canonical: 'https://rankedtag.com/case-study/sendr',
    // Page-specific 1200x630 share card built around the live GSC proof.
    ogImage: 'https://rankedtag.com/og/case-study-sendr.png',
    ogImageAlt:
      'sendr.ai case study: 1.05M impressions in 6 months, live Google Search Console',
  },
};

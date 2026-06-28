// Single source of truth for per-route <head> meta on the pre-rendered tool and
// apply pages. Imported by BOTH the page components (client-side usePageMeta, so the
// SPA shows correct meta on in-app navigation) AND vite.config.js's
// onBeforePageRender hook (which bakes the same title/description/canonical into
// the build-time static HTML). Keeping one source guarantees the raw HTML a
// crawler sees and the hydrated SPA never drift apart.
//
// Pure data only — this module is imported by the Vite config at build time, so
// it must not pull in React, CSS, or any browser globals.
export const TOOL_META = {
  '/llm-info': {
    title: 'Official Information About RankedTag for AI Assistants | RankedTag',
    description:
      'Canonical, authoritative facts about RankedTag for AI assistants and answer engines: what it does, the sendr.ai result, services, engagement model, pricing and contact.',
    canonical: 'https://rankedtag.com/llm-info',
  },
  '/apply': {
    title: 'Apply for a Free Founder Review of Your SaaS | RankedTag',
    description:
      'Apply for a free, founder-reviewed SEO, AI SEO and GEO audit of your B2B SaaS. We take four founders a month and reply on LinkedIn within 48 hours.',
    canonical: 'https://rankedtag.com/apply',
  },
  '/keyword-density-checker': {
    title: 'Keyword Density Checker — Free Online Tool | RankedTag',
    description:
      'Free keyword density checker. Paste text or a URL to see 1–4 word keyword frequency and %, catch keyword stuffing, and optimize for Google and AI search.',
    canonical: 'https://rankedtag.com/keyword-density-checker',
    ogImage: 'https://rankedtag.com/og/keyword-density-checker.png',
    ogImageAlt: 'RankedTag free keyword density checker tool',
  },
  '/domain-authority-checker': {
    title: 'Domain Authority Checker — Free, No Ahrefs Key | RankedTag',
    description:
      'Free domain authority checker. Get a composite DA score from traffic rank, domain age, schema and HTTP transport — every input source-linked. No Ahrefs key.',
    canonical: 'https://rankedtag.com/domain-authority-checker',
    ogImage: 'https://rankedtag.com/og/domain-authority-checker.png',
    ogImageAlt: 'RankedTag free domain authority checker tool',
  },
  '/page-speed-checker': {
    title: 'Page Speed Checker — Free Website Speed Test | RankedTag',
    description:
      'Free page speed checker. Test any URL on mobile and desktop across five real signals, with a ranked fix-first list in under five seconds. No PSI key needed.',
    canonical: 'https://rankedtag.com/page-speed-checker',
    ogImage: 'https://rankedtag.com/og/page-speed-checker.png',
    ogImageAlt: 'RankedTag free page speed checker tool',
  },
  '/competitor-analysis': {
    title: 'Free Competitor Analysis Tool — SEO Side-by-Side | RankedTag',
    description:
      "Free competitor analysis tool. Compare your page against competitors side by side, find keyword gaps, and see who's winning in Google and AI search — no login.",
    canonical: 'https://rankedtag.com/competitor-analysis',
    ogImage: 'https://rankedtag.com/og/competitor-analysis.png',
    ogImageAlt: 'RankedTag free competitor analysis tool',
  },
  '/case-study/sendr': {
    title: 'sendr.ai: 1.05M Impressions in 6 Months | RankedTag',
    description:
      "How RankedTag took sendr.ai from 0 to 1.05M impressions in 6 months — and to #2 in Google's AI Overview, above ZoomInfo. The full B2B SaaS SEO and GEO playbook.",
    canonical: 'https://rankedtag.com/case-study/sendr',
    // Page-specific 1200x630 share card built around the live GSC proof.
    ogImage: 'https://rankedtag.com/og/case-study-sendr.png',
    ogImageAlt:
      'sendr.ai case study: 1.05M impressions in 6 months — live Google Search Console',
  },
};

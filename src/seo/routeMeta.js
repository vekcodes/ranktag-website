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
  '/apply': {
    title: 'Apply for a Founder Review | RankedTag',
    description:
      'Apply for a free founder-reviewed SEO, AI SEO & GEO audit of your B2B SaaS. We take 4 founders a month and reply on LinkedIn within 48 hours — even if it’s a no.',
    canonical: 'https://rankedtag.com/apply',
  },
  '/keyword-density-checker': {
    title: 'Keyword Density Checker — Free Online Tool | RankedTag',
    description:
      'Free keyword density checker. Paste text or a URL to see 1–4 word keyword frequency and %, catch keyword stuffing, and optimize for Google and AI search.',
    canonical: 'https://rankedtag.com/keyword-density-checker',
  },
  '/domain-authority-checker': {
    title: 'Domain Authority Checker — Free, No Ahrefs Key | RankedTag',
    description:
      'Free domain authority checker. Get a composite DA score from traffic rank, domain age, on-page schema and HTTP transport — every input source-linked. No login, no Ahrefs key.',
    canonical: 'https://rankedtag.com/domain-authority-checker',
  },
  '/page-speed-checker': {
    title: 'Page Speed Checker — Free Website Speed Test | RankedTag',
    description:
      'Free page speed checker. Test any URL on mobile and desktop, scored on five real signals with a ranked fix-first list in under 5 seconds — plus how to pass Core Web Vitals. No PSI key.',
    canonical: 'https://rankedtag.com/page-speed-checker',
  },
  '/competitor-analysis': {
    title: 'Free Competitor Analysis Tool — SEO Side-by-Side | RankedTag',
    description:
      "Free competitor analysis tool. Compare your page against competitors side by side, find keyword gaps, and see who's winning in Google and AI search — no login.",
    canonical: 'https://rankedtag.com/competitor-analysis',
  },
  '/case-study/sendr': {
    title: 'sendr.ai Case Study: 0 → 1.05M Impressions in 6 Months | RankedTag',
    description:
      "How RankedTag took sendr.ai from 0 to 1.05M organic impressions in 6 months and to #2 in Google's AI Overview for \"best GTM tool\" — above ZoomInfo. The full B2B SaaS SEO + GEO playbook, with live Google Search Console numbers.",
    canonical: 'https://rankedtag.com/case-study/sendr',
    // Page-specific share image: the live GSC proof screenshot (not the logo).
    ogImage: 'https://rankedtag.com/result-sendr.jpeg',
  },
};

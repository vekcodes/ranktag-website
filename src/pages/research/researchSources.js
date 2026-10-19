// Source registry for the research section.
//
// Same contract as the vertical pages' registry, and it re-exports those so a
// figure already verified for a vertical page is never re-keyed here: every
// citable figure resolves to an entry, and a citation whose key is not in this
// object renders NOTHING rather than rendering a dead reference. That is the
// mechanism that makes "never invent a statistic" enforceable rather than
// aspirational.
//
// Every href below was requested and confirmed to return 200 on 19 October
// 2026, and every figure attributed to one was read at that source, not from
// a blog quoting it.
//
// Pure data only — imported by the Vite config at build time.
import { SOURCES as VERTICAL_SOURCES } from '../verticals/verticalsData.js';

export const SOURCES = {
  ...VERTICAL_SOURCES,

  // ── AI crawlers, from each operator's own documentation ──────────────
  openaiBots: {
    label: 'OpenAI, bots and crawler documentation',
    href: 'https://developers.openai.com/api/docs/bots',
  },
  anthropicCrawler: {
    label: 'Anthropic Support, does Anthropic crawl data from the web',
    href: 'https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler',
  },
  perplexityBots: {
    label: 'Perplexity, PerplexityBot documentation',
    href: 'https://docs.perplexity.ai/guides/bots',
  },
  googleCrawlers: {
    label: 'Google Search Central, overview of Google crawlers and fetchers',
    href: 'https://developers.google.com/search/docs/crawling-indexing/overview-google-crawlers',
  },
  googleCommonCrawlers: {
    label: "Google Search Central, Google's common crawlers",
    href: 'https://developers.google.com/search/docs/crawling-indexing/google-common-crawlers',
  },

  // ── Standards and specifications ─────────────────────────────────────
  llmsTxtSpec: {
    label: 'llmstxt.org, the llms.txt proposal',
    href: 'https://llmstxt.org/',
  },
  indexNow: {
    label: 'IndexNow documentation',
    href: 'https://www.indexnow.org/documentation',
  },
  schemaDataset: {
    label: 'Schema.org, Dataset',
    href: 'https://schema.org/Dataset',
  },

  // ── Google's own guidance ────────────────────────────────────────────
  googleFaqSchema: {
    label: 'Google Search Central, FAQ structured data',
    href: 'https://developers.google.com/search/docs/appearance/structured-data/faqpage',
  },
  googleStructuredDataIntro: {
    label: 'Google Search Central, intro to structured data markup',
    href: 'https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data',
  },
  googleSpamPolicies: {
    label: 'Google Search Central, spam policies for Google web search',
    href: 'https://developers.google.com/search/docs/essentials/spam-policies',
  },
  googleJsSeo: {
    label: 'Google Search Central, JavaScript SEO basics',
    href: 'https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics',
  },
  googleCwv: {
    label: 'Google Search Central, understanding Core Web Vitals',
    href: 'https://developers.google.com/search/docs/appearance/core-web-vitals',
  },
  googleSearchConsoleDocs: {
    label: 'Google Search Console Help, performance report',
    href: 'https://support.google.com/webmasters/answer/7576553',
  },

  // ── First-party RankedTag data ───────────────────────────────────────
  rankedtagSignupSample: {
    label: 'RankedTag, 17 production signup alerts from the Sendr engagement',
    href: '/research/results/ai-assistant-signup-attribution',
  },
  sendrCaseStudy: {
    label: 'RankedTag, Sendr.ai case study, Google Search Console',
    href: '/case-study/sendr',
  },
};

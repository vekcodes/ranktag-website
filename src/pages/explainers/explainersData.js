// SINGLE SOURCE OF TRUTH for the comparison explainer pages (/seo-vs-geo etc).
//
// These are expertise pages, not sales pages. They target the exact question a
// buyer types into an assistant, so the structure is built for extraction: a
// self-contained answer paragraph, a table high on the page, cited figures,
// and an FAQ whose schema matches the visible text.
//
// RULES, same as everywhere else in this repo:
//   - every figure resolves to an entry in SOURCES and renders a visible,
//     linked citation. No source, no stat.
//   - one quotation per page, verified wording, under 25 words, linked.
//   - the year appears in the H1 and the page carries a visible reviewed date.
import { SOURCES } from '../verticals/verticalsData.js';
import { SITE } from '../whatWeDo/capabilitiesData.js';

export { SOURCES, SITE };

export const EXPLAINERS = [
  {
    slug: 'seo-vs-geo',
    nav: 'SEO vs GEO',
    year: '2026',
    updated: '2026-10-19',
    verified: '19 October 2026',

    title: 'SEO vs GEO in 2026: What Actually Changes',
    description:
      'SEO ranks pages, GEO earns citations inside AI answers. What differs, what overlaps, what the research measured, and which one your situation calls for.',
    eyebrow: 'EXPLAINER · SEARCH VS GENERATIVE SEARCH',
    h1: 'SEO vs GEO in 2026: what actually changes, and what does not.',

    answer:
      'SEO optimises a page to rank in a list of results. GEO, generative engine optimization, optimises it to be cited inside an AI-generated answer. They share a foundation: a page must be crawlable, indexed and credible for either to work. They differ in format, measurement and what counts as winning.',

    intro: [
      'The two terms get sold as rivals, which suits whoever is selling the newer one. They are better understood as the same groundwork measured against two different outcomes. A page that cannot be crawled will not rank and will not be cited. A page with no credibility behind it will struggle at both. Everything after that foundation does genuinely diverge.',
      'What follows is the distinction as it stands in 2026, including a real tension between what Google says publicly and what independent research has measured. Both can be true, and the gap between them is where most of the confusion lives.',
    ],

    comparisonTable: {
      caption: 'SEO and GEO, side by side',
      columns: ['', 'SEO', 'GEO'],
      rows: [
        ['Goal', 'Rank in a list of links', 'Be named or quoted inside a generated answer'],
        ['Where the result appears', 'A search engine results page', 'ChatGPT, Perplexity, Gemini, Claude, Google AI Mode'],
        ['The unit that competes', 'The page', 'The passage, and the brand as an entity'],
        ['What the user does next', 'Chooses a link and clicks', 'Reads the answer, and may never click'],
        ['Primary levers', 'Technical health, content quality, links', 'Quotable structure, cited claims, corroborating mentions'],
        ['How it is measured', 'Rankings, impressions, clicks', 'Citation share across a fixed set of prompts'],
        ['Feedback speed', 'Weeks to months', 'Days to weeks on retrieval-based engines'],
        ['Shared foundation', 'Crawlable, indexed, credible, clearly structured', 'Identical'],
      ],
    },

    keyFacts: [
      {
        stat: 'Up to 40%',
        label: 'visibility improvement in generative engine responses from the optimisation methods tested in the original GEO paper',
        source: 'geoStudy',
      },
      {
        stat: '+115%',
        label: 'visibility lift from citing sources, for pages starting around position five',
        source: 'geoStudy',
      },
      {
        stat: '−10%',
        label: 'visibility for keyword stuffing versus the unoptimised original, tested live on Perplexity',
        source: 'geoStudy',
      },
      {
        stat: '34.5%',
        label: 'lower click-through rate at position one when an AI Overview is present, across 300,000 keywords',
        source: 'ahrefsAio',
      },
    ],

    quote: {
      text: 'There are no additional requirements to appear in AI Overviews or AI Mode, nor other special optimizations necessary.',
      who: 'Google',
      role: 'Search Central documentation on AI features in Search',
      source: 'googleAiFeatures',
    },

    // Long-form body. Each entry is a section with an id for the in-page nav.
    body: [
      {
        id: 'what-geo-is',
        h: 'What GEO actually refers to',
        p: [
          'Generative engine optimization is a term from academic work, not from an agency. It was introduced in a 2024 paper presented at ACM SIGKDD, which built a benchmark of 10,000 queries and tested nine content-level strategies to see which ones made a source more likely to be surfaced inside a generated answer.',
          'That origin matters because it makes the claims testable. The paper reported visibility improvements of up to 40% from its methods, and it reported which methods failed. Adding quotations from credible sources was the strongest single lever. Citing sources and adding relevant statistics came close behind. Keyword stuffing, the one tactic carried over wholesale from an older era of SEO, performed about 10% worse than leaving the page alone.',
          'The most useful finding for most businesses is not the headline number. It is that the gains concentrated on pages that were not already dominant. For a source sitting around position five, citing sources lifted visibility by roughly 115%. For a source already at position one, the same change did less than nothing. GEO is disproportionately a tool for challengers.',
        ],
      },
      {
        id: 'the-tension',
        h: 'Google says no special optimisation is needed. The research says content changes move citation. Both are true.',
        p: [
          'Google’s own documentation is unambiguous: there are no additional requirements to appear in AI Overviews or AI Mode, and no special optimisations necessary. Plenty of people read that as Google declaring GEO a fiction, and plenty of vendors read past it entirely. Neither reading is right.',
          'Google is answering a narrow question: do you need new markup, a new file, or a new technical standard to be eligible? No. The same crawlable, indexable, helpful page qualifies. There is no AI schema to add and no permission to request.',
          'The research is answering a different question: given two eligible pages, what makes one more likely to be used in the answer? That turns out to depend on how the content is written — whether claims are attributed, whether figures are present, whether a passage can be lifted without its surrounding context. Nothing in that contradicts Google. It is the layer underneath eligibility, and it is the layer most content fails at.',
          'The honest framing is this: GEO is not a separate technical discipline you bolt on. It is a set of editorial habits that make a page easier to quote accurately, applied on top of SEO that already works.',
        ],
      },
      {
        id: 'what-is-shared',
        h: 'The 80% that is shared',
        p: [
          'Crawl access comes first and decides everything else. Most AI crawlers do not execute JavaScript, which means a marketing site that renders client-side is invisible to them even when Googlebot manages fine. Server-rendered content is a prerequisite for citation in a way it no longer strictly is for ranking.',
          'Entity clarity comes next. A model resolving which company you are relies on consistent facts across your own site and everywhere else it has read about you. That is the same work as classic entity SEO: an accurate Organization graph, consistent naming, and third-party sources that agree with each other.',
          'Then structure. Question-led headings, direct answers in the first forty to sixty words, one idea per passage. This is the format that wins featured snippets and it is the format that gets quoted by assistants, because both are doing extraction. A page built for one is most of the way to the other.',
        ],
      },
      {
        id: 'what-differs',
        h: 'The 20% that genuinely differs',
        p: [
          'Measurement is the biggest divergence, and the one most teams get wrong. There is no Search Console for assistants. You measure by fixing a set of buying prompts, running them on a schedule across each engine, and recording which brands get named. It is rank tracking reinvented, cruder, and it has to be deliberate because no analytics event fires when a model recommends a competitor.',
          'Corroboration matters more than it does for ranking. Links pass authority; mentions build the picture a model has of your category. Being discussed in comparison posts, communities and industry coverage shapes answers in a way a backlink alone does not, because retrieval and training both draw on text about you rather than just pointers to you.',
          'And the click may never happen. Ahrefs measured a 34.5% lower click-through rate at position one when an AI Overview is present, across 300,000 keywords. That reframes the goal. If the answer satisfies the question, the win is being the brand named in it, which means accepting visibility you cannot fully attribute.',
        ],
      },
      {
        id: 'which-one',
        h: 'Which one your situation calls for',
        p: [
          'If your pages are not indexed, or your site renders client-side, or your schema contradicts itself, the answer is SEO. GEO work on a foundation like that changes nothing, because a model cannot cite what it cannot retrieve. This is the most common situation and the least exciting answer.',
          'If you rank decently and still never appear in assistant answers, the answer is GEO. The eligibility is there and the content is losing on format: no attributed claims, no figures, nothing a model can lift cleanly. That is editorial work on pages you already have, not a new programme.',
          'If you are a challenger in a category dominated by incumbents, GEO deserves disproportionate attention, because that is exactly where the research found the gains concentrated. An assistant answer is not pay-to-play and does not simply mirror domain authority.',
          'If you are already the dominant result for your category queries, be careful. The same study found the leading methods reduced visibility for sources already at position one. Changing a page that is winning is a real risk, not a theoretical one.',
        ],
      },
      {
        id: 'mistakes',
        h: 'Four mistakes worth avoiding',
        p: [
          '**Treating GEO as a product you buy separately.** If an agency proposes a GEO retainer that does not touch your technical foundation or your existing pages, they are selling you the 20% and skipping the 80% it rests on.',
          '**Adding statistics for the sake of it.** The research measured relevant, sourced figures. Inventing numbers, or padding a page with decorative statistics, fails the thing that made the method work: a model quoting you is lending you its credibility, and a wrong figure is how you lose it.',
          '**Carrying keyword density across.** It performed measurably worse than doing nothing. Whatever marginal value it once had, retrieval-based engines punish it.',
          '**Reporting on it like SEO.** Sessions do not capture a mention inside an answer. If the monthly report has no citation-share number in it, nobody is actually measuring the thing the work was for.',
        ],
      },
    ],

    faqs: [
      [
        'Is GEO replacing SEO?',
        'No. GEO depends on SEO working. A page has to be crawlable, indexed and credible before any assistant can retrieve it, so the technical and authority work does not become optional. What changes is the definition of a win: on some queries the goal moves from earning the click to being the brand the answer names, which is an addition to the discipline rather than a replacement for it.',
      ],
      [
        'What is the actual difference between SEO and GEO?',
        'SEO optimises a page to rank in a list of links. GEO optimises content to be cited inside a generated answer. The shared foundation is crawlability, indexation and credibility. The divergence is in format, with GEO favouring self-contained, attributed, quotable passages, and in measurement, where citation share across a set of prompts replaces rankings.',
      ],
      [
        'Does Google say GEO is necessary?',
        'Google says the opposite, narrowly. Its documentation states there are no additional requirements to appear in AI Overviews or AI Mode, and no special optimizations necessary. That is a statement about eligibility: no new markup or file is required. It is not a claim that all eligible content is equally likely to be used, which is the question the GEO research set out to measure.',
      ],
      [
        'How much can GEO actually improve visibility?',
        'The original study reported improvements of up to 40% from its tested methods, across a benchmark of 10,000 queries. The figure that matters more for most businesses is the breakdown by starting position: for a source around position five, citing sources lifted visibility by roughly 115%, while the same methods reduced visibility for sources already ranking first.',
      ],
      [
        'Which GEO tactics were actually tested and worked?',
        'Nine content strategies were tested. Adding quotations from credible sources performed best at roughly 41%. Citing sources and adding relevant statistics followed closely. Each works for the same underlying reason: it makes a passage safe to quote and gives the model something attributable. The methods that failed were the ones that made text harder to extract or less trustworthy.',
      ],
      [
        'Does keyword stuffing help in AI search?',
        'It measurably hurts. In live testing on Perplexity, keyword stuffing performed about 10% worse than the unoptimised original page, making it the only tested method that left content less visible than doing nothing at all. Density tactics that were already marginal for Google are counterproductive for retrieval-based engines.',
      ],
      [
        'How do I measure GEO when there is no Search Console for it?',
        'By building the measurement yourself. Fix a set of buying prompts for your category, run them across each engine on a schedule, and record which brands are named and which sources are cited. It is crude compared with rank tracking, but it is the only way to know whether work moved anything, and it makes the invisible losses visible.',
      ],
      [
        'If AI answers reduce clicks, is organic search still worth investing in?',
        'Yes, with adjusted expectations. Ahrefs measured a 34.5% lower click-through rate at position one where an AI Overview appears, across 300,000 keywords. The pressure lands hardest on informational queries. Commercial and branded searches still convert, and being the cited source in an answer builds the familiarity that makes those branded searches happen later.',
      ],
      [
        'Should a small business bother with GEO?',
        'It is one of the few areas where being small is not a disadvantage. Assistant answers are not bought, and the research found the gains concentrated on sources that were not already dominant. A precise, well-structured, well-corroborated page can be cited ahead of a much larger competitor, which is rarely true of a competitive SERP.',
      ],
      [
        'Do I need llms.txt or special markup for AI search?',
        'No. Google states plainly that no additional markup, machine-readable file or special optimisation is required to appear in its AI features. An llms.txt file does no harm and some engines may use it, but treating it as the mechanism is a mistake. The mechanism is crawlable, well-structured, credible content.',
      ],
    ],

    relatedReading: {
      capabilities: ['/what-we-do/generative-engine-optimization', '/what-we-do/answer-engine-optimization', '/what-we-do/seo'],
      posts: [
        ['/blog/rank-website-in-claude-chatgpt-gemini-perplexity', 'How to rank in Claude, ChatGPT, Gemini and Perplexity'],
        ['/blog/is-your-seo-agency-working', 'How to tell whether your SEO agency is working'],
      ],
      tool: ['/competitor-analysis', 'Competitor Analysis'],
      verticals: true,
    },
  },
];

export const EXPLAINER_BY_SLUG = Object.fromEntries(EXPLAINERS.map((e) => [e.slug, e]));
export const explainerUrl = (slug) => `${SITE}/${slug}`;

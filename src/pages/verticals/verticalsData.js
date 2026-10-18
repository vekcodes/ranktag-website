// SINGLE SOURCE OF TRUTH for the vertical pages (/saas-seo-agency etc).
//
// These are commercial head-term pages: one per vertical, at root level, each
// written as if a specialist in that vertical wrote it. They are deliberately
// NOT the same page with a noun swapped — if a section would read identically
// across all three, it does not belong here, it belongs on a capability page
// under /what-we-do.
//
// Division of labour:
//   /what-we-do/*          the craft, vertical-neutral
//   /<vertical>-seo-agency the buyer's own problems, this file
//   /best/seo-agencies-*   the shortlist query, a different intent entirely
//
// Proof rule: `proof: true` is only ever set on a page where we hold a
// verified, in-vertical result. Today that is B2B SaaS and nothing else.
// Never set it speculatively — an unproven claim on a sales page is the one
// mistake this whole restructure exists to avoid.
import { SITE } from '../whatWeDo/capabilitiesData.js';

export { SITE };


// Every figure cited on a vertical page resolves to one of these. A stat with
// no entry here does not ship. Checked at source on 18 October 2026; the
// `checked` date is what the page displays, not a publication date we guessed.
export const SOURCES = {
  baymardProductPage: {
    label: 'Baymard Institute, Product Page UX benchmark',
    href: 'https://baymard.com/research/product-page',
  },
  googleFacets: {
    label: 'Google Search Central, faceted navigation',
    href: 'https://developers.google.com/search/docs/crawling-indexing/crawling-managing-faceted-navigation',
  },
  googleProductSchema: {
    label: 'Google Search Central, product structured data',
    href: 'https://developers.google.com/search/docs/appearance/structured-data/product',
  },
  googleLocalRanking: {
    label: 'Google Business Profile Help',
    href: 'https://support.google.com/business/answer/7091',
  },
  brightlocal2025: {
    label: 'BrightLocal Local Consumer Review Survey 2025 (n=1,026 US adults)',
    href: 'https://www.brightlocal.com/research/local-consumer-review-survey-2025/',
  },
  ahrefsAio: {
    label: 'Ahrefs, 300,000-keyword study, April 2025',
    href: 'https://ahrefs.com/blog/ai-overviews-reduce-clicks/',
  },
  googleAiFeatures: {
    label: 'Google Search Central, AI features in Google Search',
    href: 'https://developers.google.com/search/docs/appearance/ai-features',
  },
  googleAdRank: {
    label: 'Google Ads Help, the ad auction and Ad Rank',
    href: 'https://support.google.com/google-ads/answer/1704431',
  },
  googleAdsCost: {
    label: 'Google Ads Help, how costs are calculated',
    href: 'https://support.google.com/google-ads/answer/6297',
  },
  rankedtagAgencyScan: {
    label: 'RankedTag, prices read from 33 agency websites, 18–19 October 2026',
    href: '/best',
  },
  googleHelpfulContent: {
    label: 'Google Search Central, creating helpful, reliable, people-first content',
    href: 'https://developers.google.com/search/docs/fundamentals/creating-helpful-content',
  },
  googleLocalServicesChecks: {
    label: 'Google Ads Help, background checks for Local Services ads',
    href: 'https://support.google.com/adwords/answer/6226575',
  },
  geoStudy: {
    label: 'Aggarwal et al., GEO: Generative Engine Optimization, KDD 2024',
    href: 'https://arxiv.org/abs/2311.09735',
  },
};

export const VERTICALS = [
  {
    slug: 'saas-seo-agency',
    keyFacts: [
      {
        stat: '34.5%',
        label: 'lower click-through rate at position one when an AI Overview is present, measured across 300,000 keywords',
        source: 'ahrefsAio',
      },
      {
        stat: '+115%',
        label: 'AI visibility lift from citing sources, for pages starting around position five — where most SaaS sites sit',
        source: 'geoStudy',
      },
      {
        stat: '+41%',
        label: 'lift from adding quotations, the single best-performing method tested across 10,000 queries',
        source: 'geoStudy',
      },
      {
        stat: '−10%',
        label: 'visibility versus doing nothing at all, for keyword stuffing, tested live on Perplexity',
        source: 'geoStudy',
      },
    ],

    quote: {
      text: 'GEO can boost visibility by up to 40% in generative engine responses.',
      who: 'Aggarwal et al.',
      role: 'GEO: Generative Engine Optimization, ACM SIGKDD 2024',
      source: 'geoStudy',
    },

    comparisonTable: {
      caption: 'Three surfaces your buyer uses, and what actually wins each one',
      columns: ['', 'Classic SEO', 'AEO', 'GEO'],
      rows: [
        ['Where it shows', 'The ten blue links', 'Snippets, People Also Ask, AI Overviews', 'Inside ChatGPT, Perplexity, Gemini and Claude answers'],
        ['What the buyer is doing', 'Scanning results to pick a page', 'Taking the answer at the top without scrolling', 'Asking for a shortlist before they open a search engine'],
        ['What wins it', 'Relevance, authority, technical health', 'A self-contained answer in the first 40 to 60 words, plus schema', 'Corroborating third-party mentions and quotable, sourced claims'],
        ['How it is measured', 'Rankings, impressions, clicks', 'Snippet and AI Overview ownership per query', 'Citation share across a fixed set of buying prompts'],
        ['Typical first movement', 'Weeks 5 to 7 on realistic targets', '2 to 6 weeks if you already rank on page one', '30 to 45 days on retrieval-based engines'],
        ['What it costs you to ignore', 'Gradual decline', 'The click, even when you rank first', 'The shortlist, with no analytics event to tell you'],
      ],
    },

    timeline: [
      ['Week 1', 'Founder review of the domain, the attribution model agreed in writing, and the first pass at the buying-query map.', 'You learn which of your money queries you are invisible for, and how your current reporting is crediting organic.'],
      ['Month 1', 'Technical blockers cleared, comparison and alternatives pages briefed and shipping, tracked prompt set live across the major assistants.', 'Bottom-of-funnel pages start indexing. First movement on queries where you already had partial visibility.'],
      ['Month 3', 'Category and problem-level content compounding, internal link topology carrying authority to the commercial pages, docs surface claimed.', 'First top-20 positions on realistic targets, and typically a first assistant citation somewhere in the tracked set.'],
      ['Month 6', 'Defending what you have won, widening query coverage, refreshing the pages that decayed.', 'The compounding curve, reported as pipeline by landing page rather than as sessions.'],
    ],

    notFor: [
      'Pre-product companies. If nobody is searching for the problem yet, SEO spends your runway writing about a category that does not exist. Find the language first.',
      'Teams that need results inside eight weeks. Bottom-of-funnel pages can convert quickly, but if the business depends on organic in two months, paid is the honest answer.',
      'Companies whose reporting cannot be changed. If the board judges every channel on last-click, a long-cycle programme will be cancelled in month four regardless of what it was doing.',
      'Buyers who need a large bench. We cap at four founder reviews a month. For a programme needing several parallel workstreams, an agency with fifty strategists genuinely suits you better.',
    ],

    objections: [
      [
        'How will I know it is working before pipeline moves?',
        'By agreeing the leading indicators before anything ships. Indexation of new pages, first page-one entries on realistic targets, movement on the tracked assistant prompts, and assisted-path volume from organic landing pages are all visible within weeks. Pipeline follows a quarter later by the nature of your sales cycle. If the early indicators are flat at week six, we say so rather than letting you discover it in month five.',
      ],
      [
        'What if we pivot or reposition the category?',
        'It happens, and it is survivable if the architecture was built for it. We map the problem language your buyers use today separately from the category language you want to own, precisely so a repositioning does not invalidate the whole content base. The problem-level pages keep working because the problem did not change. What needs rewriting is the category layer, which is the smaller half.',
      ],
      [
        'What if you get busy with other clients?',
        'Four founder reviews a month is a hard cap and it exists for this reason. You get the senior people who ran your audit, not an account manager relaying their notes. The trade is that we turn work down. If we cannot give your category the attention it needs, you get that answer within 48 hours of applying rather than finding out in month three.',
      ],
      [
        'Why not hire a head of SEO in-house?',
        'Eventually you probably should. The awkward part is the first year: the decisions that compound most are made early, and an in-house hire learning category SEO on your live domain is an expensive way to learn it. The usual shape is specialist help for the foundation and the first compounding cycle, then an in-house owner who inherits documented decisions rather than a mystery.',
      ],
    ],

    relatedReading: {
      comparisonPage: '/best/seo-agencies-for-saas',
      capabilities: ['/what-we-do/seo', '/what-we-do/generative-engine-optimization', '/what-we-do/content-marketing'],
      posts: [
        ['/blog/why-nobody-knows-about-your-saas', 'Why nobody knows about your SaaS'],
        ['/blog/predictable-inbound-lead-engine-saas', 'Building a predictable inbound lead engine'],
      ],
      tool: ['/competitor-analysis', 'Competitor Analysis'],
    },

    ctaSub: 'Drop your domain. The founder runs the 52-check review personally and comes back within 48 hours with what your buying queries actually look like, even when the answer is that you do not need us yet.',
    engagementH2: 'What happens after you apply.',
    engagement: [
      [
        'The free founder review',
        'You send a domain. The founder goes through it personally: which buying queries you rank for versus which ones close, whether your comparison and alternatives pages exist or are being written about you by someone else, and what your reporting currently credits organic with. A verdict within 48 hours.',
      ],
      [
        'Agree the measurement model before anything ships',
        'For a three-month cycle this comes first, not last. We agree how assisted paths are attributed and which leading indicators months one and two are judged on. Skipping this is how working SEO programmes get cancelled.',
      ],
      [
        'Scope and price, after the review',
        'No rate card, because the honest number depends on whether you are fixing a foundation, building a category or defending one. You get the work, the sequence and the figure once there is enough information for that figure to mean something.',
      ],
      [
        'Bottom of the funnel first, then the engine',
        'Comparison, alternatives and pricing-intent pages ship before any top-of-funnel content, because they convert from the week they index and fund the patience the rest needs. Weekly batches, every piece human-reviewed.',
      ],
      [
        'Handover, not hostage-taking',
        'The prompts, workflows and editorial checklists run on your infrastructure and stay there. A retainer should continue because it is working, not because stopping it would break your content operation.',
      ],
    ],
    comparison: '/best/seo-agencies-for-saas',
    comparisonLabel: 'the 11 best SaaS SEO agencies',
    nav: 'B2B SaaS',
    navDesc: 'Category creation, bottom-of-funnel pages and pipeline you can attribute',
    // Head term: "saas seo agency". Secondary: "b2b saas seo agency",
    // "seo agency for saas", "saas seo services", "saas seo company".
    title: 'SaaS SEO Agency: Pipeline, Not Sessions',
    description:
      'SaaS SEO agency for B2B founders: category pages, comparison and alternatives pages, product-led content. Measured on signups and pipeline, not sessions.',
    eyebrow: 'WHO WE HELP · B2B SAAS',
    h1: 'A SaaS SEO agency for founders who need pipeline, not sessions.',
    audienceName: 'B2B SaaS companies',
    problemsEyebrow: 'WHY SAAS SEO FAILS SPECIFICALLY',
    approachH2: 'The SaaS playbook, in the order it pays.',
    faqH: 'SaaS SEO, asked and answered.',

    // 40–60 words, answer-first, written to survive being lifted whole into a
    // featured snippet or an AI Overview citation.
    answer:
      'A SaaS SEO agency builds organic acquisition around a long, multi-touch buying cycle: category pages that explain what you are, comparison and alternatives pages that catch buyers already building a shortlist, and product-led content that converts trials. It is measured on signups, demos and pipeline, not on sessions or keyword counts.',

    intro: [
      'Most SEO retainers fail SaaS companies for one structural reason: they are priced and reported on traffic, and SaaS does not buy traffic. A 70-searches-a-month comparison query from a buyer with budget approved beats forty thousand monthly searches of category education. An agency that cannot tell those apart will spend your year on the second.',
      'We work the other way round. The queries that close come first, the engine that feeds them second, and everything is reported against signups and pipeline.',
    ],

    problems: [
      {
        h: 'Nobody searches for the category you are creating',
        evidence: { source: 'geoStudy', note: 'The KDD 2024 study found optimisation helps lower-ranked pages most, which is where a new category always starts.' },
        p: 'If you are defining a new category, the head term has no volume because the words do not exist yet. Your buyers search the problem, their workaround, and the incumbent they want to escape. Most agencies run a keyword tool, see nothing, and conclude SEO will not work — when the job is owning the problem-shaped queries now and inheriting the category term later.',
      },
      {
        h: 'Your most valuable keywords look worthless in Ahrefs',
        evidence: { source: 'ahrefsAio', note: 'Ahrefs’ 300,000-keyword study found AI Overviews hit informational queries hardest, which raises the relative value of buying-intent terms.' },
        p: '"[Competitor] alternatives" at 90 searches a month. "[Competitor] vs [competitor]" at 140. These are buyers with a shortlist and a budget, and they convert at rates top-of-funnel content never reaches. Volume-ranked keyword lists push them to the bottom of the backlog, which is why they are usually still available.',
      },
      {
        h: 'Your comparison pages are being written by other people',
        evidence: { source: 'geoStudy', note: 'Citing sources lifted AI visibility by 115% for pages around position five, the band most comparison pages sit in.' },
        p: 'Search your own brand plus "alternatives" and look at who owns page one: review aggregators monetising your name, affiliate listicles that have never used the product, and competitors\' own switch pages. Each is a page about you that you do not control, sitting between a buyer and your signup form.',
      },
      {
        h: 'A 90-day sales cycle makes SEO look like it is not working',
        evidence: { source: 'ahrefsAio', note: 'With a 34.5% lower position-one CTR where AI Overviews appear, click-based measurement understates organic contribution further still.' },
        p: 'Last-click attribution credits the branded search at the end, and the organic page that started everything eight touches earlier shows up as nothing. SEO budgets get cut on that evidence constantly. The fix is modelling assisted paths before the engagement starts, not arguing about it in month five.',
      },
      {
        h: 'Your documentation outranks your marketing site',
        evidence: { source: 'geoStudy', note: 'Quotation and statistic density were the strongest tested levers, and technical documentation is unusually rich in both.' },
        p: 'Product-led SaaS accumulates docs, changelogs and support articles that rank for buying-adjacent queries, and nobody owns them. They are thin on links to commercial pages, invisible in marketing reporting, and often on a subdomain sharing no authority back. The cheapest unclaimed surface area most SaaS companies have.',
      },
    ],

    approach: [
      {
        h: 'Bottom of the funnel first, always',
        when: 'Weeks 1–6',
        who: 'Senior strategist writes the briefs, senior editor writes the pages',
        deliverable: 'Comparison, alternatives, integration and pricing-intent pages, shipped weekly and interlinked to the signup path',
        p: 'Comparison pages, alternatives pages, integration pages and pricing-intent queries get built before a single top-of-funnel article. They convert from the week they index, which funds the patience the rest of the programme needs.',
        to: '/what-we-do/content-marketing',
        label: 'The content engine',
      },
      {
        h: 'Category architecture, not a keyword list',
        when: 'Weeks 2–4, revisited quarterly',
        who: 'Senior strategist, with your founder for 90 minutes a week',
        deliverable: 'A two-layer map of problem language and category language, plus the internal link topology that carries authority between them',
        p: 'We map the problem language your buyers use today against the category language you want them to use in two years, and build the internal link topology that carries authority from one to the other as the market catches up.',
        to: '/what-we-do/seo',
        label: 'Full-stack SEO',
      },
      {
        h: 'The technical floor under a JavaScript marketing site',
        when: 'Weeks 1–4',
        who: 'Technical strategist, working in your stack or writing ticket-ready specs',
        deliverable: 'Server-rendered content for AI crawlers, a validated schema graph, and a docs subdomain that passes authority back',
        p: 'Most SaaS marketing sites are client-rendered, which is survivable for Googlebot and fatal for the AI crawlers that do not execute JavaScript. Server-rendered content, a clean schema graph and a docs subdomain that passes authority back are prerequisites, not refinements.',
        to: '/what-we-do/technical-seo',
        label: 'Technical SEO',
      },
      {
        h: 'Being the shortlist, not just a result',
        when: 'Month 2 onwards, continuous',
        who: 'Strategist plus digital PR',
        deliverable: 'A fixed set of buying prompts tracked monthly across ChatGPT, Perplexity, Gemini and Claude, with the corroborating mentions that move them',
        p: 'Buyers now ask an assistant for three vendors before they open a SERP. Getting named in that answer is a different discipline from ranking: it needs corroborating third-party mentions, machine-readable brand facts and claims structured to be quoted.',
        to: '/what-we-do/generative-engine-optimization',
        label: 'Generative engine optimisation',
      },
      {
        h: 'Reporting a founder can act on',
        when: 'Agreed week 1, reported monthly',
        who: 'Strategist, wired into your existing analytics and CRM',
        deliverable: 'Signups, demos and pipeline by landing page, with assisted and first-touch paths modelled so a long cycle does not erase organic',
        p: 'Signups, demos and pipeline by landing page, with assisted paths modelled so a long cycle does not erase the organic contribution. Rankings and impressions are diagnostics, not the scoreboard.',
        to: '/what-we-do/ai-seo',
        label: 'AI SEO',
      },
    ],

    // Verified, in-vertical, cross-checkable. The only one we have.
    proof: true,

    faqs: [
      [
        'What does a SaaS SEO agency do?',
        'It builds organic acquisition around the way software is actually bought: a long evaluation, several people, and a shortlist formed before anyone speaks to sales. In practice that means category and problem pages at the top, comparison and alternatives pages at the bottom, product-led content in the middle, and measurement tied to signups and pipeline rather than sessions.',
      ],
      [
        'How is SaaS SEO different from regular SEO?',
        'The craft is the same; the economics are not. SaaS has low-volume, high-value queries, a multi-month cycle that breaks last-click reporting, a product that generates its own rankable surface area in docs, and often a category that does not have a name yet. An agency optimising for traffic volume will systematically pick the wrong targets in all four cases.',
      ],
      [
        'How long does SaaS SEO take to work?',
        'Bottom-of-funnel pages can convert within weeks of indexing because the buyers searching them are already in-market. Category and problem-level content follows the normal curve: first top-20 positions around weeks five to seven, meaningful compounding from month three to six. Sendr.ai reached 1.05M impressions and 7,430 clicks inside six months from a standing start.',
      ],
      [
        'How much does a SaaS SEO agency cost?',
        'We do not publish a price, because the honest number depends on whether you are fixing a foundation, building a category, or defending one. Apply for the free founder review and you get a scoped figure within 48 hours, after someone has actually looked at your domain. No sales sequence, and no number invented before the work is understood.',
      ],
      [
        'Is SEO still worth it for SaaS now that AI answers the question?',
        'It matters more, and it changed shape. Buyers increasingly ask an assistant for a shortlist instead of scanning ten links, so the goal moves from ranking to being the source that gets cited. The underlying work — clean entities, structured claims, corroborating mentions, crawlable content — is what earns both, which is why we build them as one programme.',
      ],
      [
        'Should a seed-stage SaaS invest in SEO yet?',
        'Only if you can name the problem your buyers search for today. If you cannot, SEO will produce expensive content about a category nobody is looking for yet, and the money is better spent finding that language. If you can, starting early is a genuine advantage: comparison and alternatives pages compound, and they are cheap to win before anyone else bothers.',
      ],
      [
        'Do we need a blog, or just product and comparison pages?',
        'Start with product, comparison and alternatives pages, because they convert immediately and they are the ones competitors are already writing about you. A blog earns its place once those exist, as the layer that builds topical authority and attracts the links and citations the commercial pages need. Reversing the order is the most common way SaaS content budgets get wasted.',
      ],
      [
        'How do you measure SEO when our sales cycle is three months?',
        'By agreeing the measurement model before the work starts. We instrument first-touch and assisted paths, report pipeline by landing page rather than by session, and set the expectation that a page indexed in month one may not show revenue until month four. The alternative, judging SEO on last-click, reliably kills programmes that were working.',
      ],
      [
        'Does ranking first still matter if an AI Overview sits above it?',
        'It matters less on its own than it used to. Ahrefs studied 300,000 keywords and found the presence of an AI Overview correlated with a 34.5% lower click-through rate at position one. Ranking is still the prerequisite — the answer draws on indexed pages — but the goal shifts from being the top link to being the source the answer names.',
      ],
      [
        'What actually makes an AI engine cite us?',
        'Structure and corroboration more than domain strength. The KDD 2024 GEO study tested nine strategies across 10,000 queries and found adding quotations was the strongest single method at roughly 41%, with citing sources and adding statistics close behind. For a page already sitting around position five, citing sources lifted visibility by about 115%, which is the band most SaaS pages occupy.',
      ],
      [
        'Will keyword-stuffing our pages help with AI search?',
        'No, and it measurably hurts. In the same study, keyword stuffing performed about 10% worse than the unoptimised original when tested live on Perplexity. It is the one tested method that left pages less visible than doing nothing. Density tactics that were marginal for Google are actively counterproductive for retrieval-based engines.',
      ],
      [
        'We rank well already. What is left to do?',
        'Usually three things. Converting that ranking into citation share on the assistants your buyers actually use, which is a different discipline from ranking. Claiming the comparison and alternatives queries that third parties currently own about you. And fixing the attribution model, because strong rankings with last-click reporting still produce a business case that looks weak at board level.',
      ],
    ],

    related: ['ecommerce-seo-agency', 'local-seo-agency'],
  },

  {
    slug: 'ecommerce-seo-agency',
    // ── evidence layer ────────────────────────────────────────────────
    keyFacts: [
      {
        stat: '51%',
        label: 'of ecommerce sites have "mediocre" or worse product page UX, across 344 benchmarked US and European retailers',
        source: 'baymardProductPage',
      },
      {
        stat: '1,300+',
        label: 'distinct product page usability issues recorded in moderated testing for that benchmark',
        source: 'baymardProductPage',
      },
      {
        stat: 'Infinite',
        label: 'URL spaces that parameter-based faceted navigation can generate, in Google’s own words, harming the site',
        source: 'googleFacets',
      },
      {
        stat: '34.5%',
        label: 'lower click-through rate at position one when an AI Overview is present, across 300,000 keywords',
        source: 'ahrefsAio',
      },
      {
        stat: '+115%',
        label: 'AI visibility lift from citing sources, for pages starting around position five',
        source: 'geoStudy',
      },
    ],

    quote: {
      text: 'if crawling is spent on useless URLs, the crawlers have less time to spend on new, useful URLs.',
      who: 'Google Search Central',
      role: 'official documentation on faceted navigation',
      source: 'googleFacets',
    },

    comparisonTable: {
      caption: 'What changes when the agency has worked a catalogue before',
      columns: ['Capability', 'Generalist SEO agency', 'Ecommerce specialist'],
      rows: [
        ['Faceted navigation', 'Blanket noindex, or left alone', 'Per-facet policy driven by actual search demand'],
        ['Product variants', 'Treated as separate pages', 'Consolidated unless the attribute has its own demand'],
        ['Out-of-stock products', 'One rule for every case', 'Different handling for temporary, seasonal and discontinued'],
        ['Crawl budget', 'Discussed in theory', 'Measured from server logs before any plan is written'],
        ['Category pages', 'More content added', 'Intent assigned per page, the rest merged or removed'],
        ['Product schema', 'Added once at launch', 'Generated from the feed so it survives a price change'],
        ['Reporting', 'Sessions and rankings', 'Revenue by category, plus indexation rate for new SKUs'],
        ['Replatforming', 'Not offered', 'Redirect map and recovery plan built before migration'],
      ],
    },

    timeline: [
      ['Week 1', 'Crawl of the full catalogue, server log sample, facet and parameter inventory, variant and canonical audit.', 'You see the real size of the indexable surface, which is usually several times what anyone expected.'],
      ['Month 1', 'Facet policy agreed and shipped, canonical and variant consolidation live, out-of-stock rules implemented, product schema wired to the feed.', 'Crawl distribution starts shifting towards pages that matter. New products begin indexing faster.'],
      ['Month 3', 'Category intent map applied: pages merged, differentiated or removed. Buying-guide content shipping weekly against the mapped gaps.', 'Consolidated category pages start to recover positions they were splitting between them.'],
      ['Month 6', 'Authority and citation work on the categories that convert, refreshed product markup, measurement on revenue by category.', 'The compounding curve, if the architecture work landed. This is where catalogue SEO pays or does not.'],
    ],

    notFor: [
      'Stores with fewer than about 50 products. The architectural work that makes this valuable barely exists at that size, and you would be paying for a specialism you do not need.',
      'Anyone who needs the store rebuilt or replatformed. We do not build or migrate stores. Several agencies on our ecommerce shortlist do, and that is a better fit.',
      'Retailers whose growth is decided on Amazon and retail media rather than their own domain. Organic search on your own site is not the lever there.',
      'Buyers who need an ecommerce reference before signing. Our one measured result is B2B SaaS. That is a fair requirement and today we would not meet it.',
    ],

    objections: [
      [
        'How will I know it is actually working before revenue moves?',
        'Because the leading indicators move first and we agree them up front. Indexation rate for new products, the share of crawl requests hitting commercial pages rather than filter permutations, and the count of category pages competing for the same intent are all measurable within weeks. Revenue by category follows. If those three are flat at week six, something is wrong and we say so rather than waiting for month four to have the conversation.',
      ],
      [
        'What happens if we replatform halfway through?',
        'The work is documented so it travels. Facet policy, canonical rules, out-of-stock handling and schema templates are written down as decisions, not left as undocumented config in one platform. We do not run migrations ourselves, so you would bring in a build partner, and we would supply the redirect map and the pre- and post-migration crawl comparison. Replatforming without that is where stores lose years of accumulated links.',
      ],
      [
        'What if you get busy with other clients?',
        'Four founder reviews a month is the cap, and it exists for this reason. We are a small senior team by design, which means you get the people who did the audit rather than an account manager relaying their notes. It also means we turn work down. If we cannot give a catalogue the attention it needs, the honest answer at the review stage is no, and you get that answer in 48 hours rather than discovering it in month three.',
      ],
      [
        'Why not just hire someone in-house?',
        'For a large catalogue, often you should, eventually. The problem is the first year: the architectural decisions that matter most are made once, early, and getting them wrong is expensive to undo. An in-house hire learning facet policy on your live store is a costly way to learn it. The sensible shape is usually specialist help for the foundation and the first compounding cycle, then an in-house owner to run it, with the documentation handed over so they inherit decisions rather than guesswork.',
      ],
    ],

    relatedReading: {
      comparisonPage: '/best/seo-agencies-for-ecommerce',
      capabilities: ['/what-we-do/technical-seo', '/what-we-do/content-marketing', '/what-we-do/answer-engine-optimization'],
      posts: [
        ['/blog/website-traffic-but-no-sales-why', 'Website traffic but no sales: where the leak usually is'],
        ['/blog/why-website-visitors-leave', 'Why website visitors leave before they buy'],
      ],
      tool: ['/page-speed-checker', 'Page Speed Checker'],
    },

    ctaSub: 'Drop your domain. The founder runs the 52-check review personally and comes back within 48 hours with what your facets, variants and product markup are really doing, even when the answer is no.',
    engagementH2: 'What happens after you send a domain.',
    engagement: [
      [
        'The free founder review',
        'You send a domain. The founder goes through the catalogue personally: how many crawlable URLs your filters can generate, which variants are splitting signals, what happens to a discontinued product today, and whether your product markup survives a stock change. A verdict within 48 hours.',
      ],
      [
        'Read the logs before proposing anything',
        'Crawl budget on a catalogue is an empirical question. Before scoping we want to see where Googlebot actually spends its requests, because a plan written without that is written from assumptions. If logs are unavailable we say so and scope around it.',
      ],
      [
        'Scope and price, after the review',
        'No rate card. A 300-product store and a 40,000-SKU catalogue with four filter dimensions are not the same job, and quoting before seeing the facet behaviour is guesswork with a currency symbol on it.',
      ],
      [
        'Template decisions first, pages second',
        'Facet policy, variant consolidation, out-of-stock rules and automated product markup come before any content work, because each decision applies to thousands of URLs at once. Content follows, once the architecture under it is worth ranking.',
      ],
      [
        'Handover, not hostage-taking',
        'The facet policy, the redirect rules and the schema templates are documented and live in your stack. If you replatform in two years, the decisions travel with you instead of leaving with us.',
      ],
    ],
    comparison: '/best/seo-agencies-for-ecommerce',
    comparisonLabel: 'the 11 best ecommerce SEO agencies',
    nav: 'Ecommerce',
    navDesc: 'Catalogue architecture, facets, variants and product schema at scale',
    // Head term: "ecommerce seo agency". Secondary: "ecommerce seo services",
    // "seo agency for ecommerce", "shopify seo agency", "ecommerce seo company".
    title: 'Ecommerce SEO Agency: Catalogue-Scale Search',
    description:
      'Ecommerce SEO agency: faceted navigation, variant duplication, out-of-stock handling, category cannibalisation and product schema for AI shopping surfaces.',
    eyebrow: 'WHO WE HELP · ECOMMERCE',
    h1: 'An ecommerce SEO agency that treats your catalogue as the product.',
    audienceName: 'Ecommerce and direct-to-consumer retailers',
    problemsEyebrow: 'WHERE CATALOGUE SEO BREAKS',
    approachH2: 'The ecommerce playbook, in the order it pays.',
    faqH: 'Ecommerce SEO, asked and answered.',

    answer:
      'An ecommerce SEO agency works at catalogue scale: controlling which faceted navigation URLs are crawlable, stopping product variants and category pages competing with each other, handling out-of-stock and discontinued products without losing their equity, and marking up products so they qualify for shopping and AI answer surfaces.',

    intro: [
      'Ecommerce SEO is an architecture problem that happens to involve content. A 4,000-product catalogue with colour, size, price and brand filters can generate hundreds of thousands of crawlable URLs, almost all near-duplicates. Google will spend your crawl budget on them and reach the category pages that matter late. No amount of blog content fixes that.',
      'So the work starts at the template and URL layer, where one decision applies to ten thousand pages at once.',
    ],

    problems: [
      {
        h: 'Faceted navigation is generating URLs faster than Google can crawl them',
        evidence: { source: 'googleFacets', note: 'Google attributes the problem to URL-parameter filtering, which it says can generate infinite URL spaces.' },
        p: 'Four filters with ten values each, combinable and order-independent, is tens of thousands of URLs from a single category. Most stores expose all of them, then wonder why new products take three weeks to index. The fix is a deliberate policy per facet: which combinations are indexable because people search them, which are crawlable but not indexable, and which are blocked outright.',
      },
      {
        h: 'Your product variants are competing with each other',
        evidence: { source: 'googleProductSchema', note: 'Google’s product documentation treats variants as a distinct markup case, not as separate products.' },
        p: 'The same shoe in seven colours, published as seven URLs with near-identical copy, splits the ranking signals seven ways and lets Google pick a winner on its own. Sometimes it picks the one that is out of stock. Canonical strategy, variant consolidation and which attributes genuinely deserve their own URL are decisions that change revenue, not hygiene tasks.',
      },
      {
        h: 'Out-of-stock pages quietly destroy accumulated equity',
        evidence: { source: 'googleProductSchema', note: 'Availability is a product property Google reads; marking it correctly is the difference between a stale listing and an honest one.' },
        p: 'A product that has earned links and rankings over two years gets discontinued, and the platform 404s it, redirects it to the homepage, or leaves a live page with a dead buy button. All three waste the asset. Seasonal lines returning next quarter, permanent discontinuations and temporary stockouts each need a different answer, and most stores apply one rule to all three.',
      },
      {
        h: 'Your category pages are cannibalising each other',
        evidence: { source: 'baymardProductPage', note: 'Baymard found 51% of 344 benchmarked retailers have mediocre or worse product page UX, the layer category pages feed into.' },
        p: '"Running shoes", "mens running shoes", "running trainers" and a landing page built for a paid campaign all target the same intent with overlapping copy. Google consolidates, picks one, and it is rarely the one you optimised. Deciding which pages own which intent, then merging or differentiating the rest, usually recovers more than any new content would.',
      },
      {
        h: 'Crawl budget is spent on the wrong half of the catalogue',
        evidence: { source: 'googleFacets', note: 'Google: crawling spent on useless URLs leaves less time for new, useful ones.' },
        p: 'Log files on a large store routinely show Googlebot spending most of its requests on filter permutations, paginated depth, internal search results and parameter noise, while bestsellers go weeks between crawls. Until that ratio is fixed, every content and merchandising change takes longer to register than it should.',
      },
      {
        h: 'Your products are invisible to AI shopping surfaces',
        evidence: { source: 'ahrefsAio', note: 'Ahrefs measured a 34.5% lower position-one CTR where an AI Overview appears, across 300,000 keywords.' },
        p: 'Assistants that recommend products read structured data: price, availability, currency, GTIN, condition, review counts, return policy. Incomplete or stale Product and Offer markup means you are omitted from answers that your competitors appear in, and the omission is silent. It is also one of the few places where a small retailer can be chosen on data quality rather than domain authority.',
      },
    ],

    approach: [
      {
        h: 'A facet and parameter policy, written down',
        when: 'Weeks 1–3',
        who: 'Senior technical strategist, with your developer for the ship',
        deliverable: 'A written policy, one line per facet, plus the robots, canonical and internal-link changes that enforce it',
        p: 'Every filter gets an explicit decision: indexable, crawlable-not-indexable, or blocked, driven by whether real people search that combination. Then canonicals, robots rules and internal linking are made to agree with it, because conflicting signals are worse than either choice alone. That is template-level work, which is',
        to: '/what-we-do/technical-seo',
        label: 'technical SEO',
      },
      {
        h: 'Variant and canonical consolidation',
        when: 'Weeks 2–6',
        who: 'Technical strategist, implemented in your template layer',
        deliverable: 'A variant decision table and the canonical rules, applied catalogue-wide rather than page by page',
        p: 'We decide which attributes deserve a URL and which belong on one page behind a selector, then consolidate the rest so ranking signals stop splitting. Done once at the template, it applies across the whole catalogue, which is why it usually outperforms months of',
        to: '/what-we-do/content-marketing',
        label: 'content work',
      },
      {
        h: 'Category pages that are worth ranking',
        when: 'Month 2 onwards, weekly',
        who: 'Senior editor, briefs approved by a strategist',
        deliverable: 'An intent map naming which page owns which query, then merged, differentiated or removed pages and the buying guidance that goes above the grid',
        p: 'Most category pages are a grid and nothing else. The ones that win carry genuine buying guidance above or below the grid, internal links to the sub-intents they should own, and copy that answers the comparison question the shopper actually has. That is where the',
        to: '/what-we-do/seo',
        label: 'full-stack programme',
      },
      {
        h: 'Product and Offer markup built for answer surfaces',
        when: 'Weeks 3–8',
        who: 'Technical strategist with whoever owns the product feed',
        deliverable: 'Feed-generated structured data that stays accurate through price and stock changes, validated against Google’s rich result tests',
        p: 'Complete, accurate, automatically maintained structured data: price, availability, shipping, returns, reviews and identifiers. It is the entry ticket for rich results today and for assistant-driven shopping answers now being built, which is the territory of',
        to: '/what-we-do/answer-engine-optimization',
        label: 'answer engine optimisation',
      },
      {
        h: 'Being named when a shopper asks an assistant',
        when: 'Month 2 onwards, continuous',
        who: 'Strategist plus digital PR',
        deliverable: 'A tracked set of buying prompts, measured monthly across the major assistants, with the corroborating mentions that move them',
        p: 'Shoppers increasingly ask for a recommendation before they visit a store. Appearing in that answer depends on corroborating third-party mentions, clean product data and claims a model can quote, which is the work of',
        to: '/what-we-do/generative-engine-optimization',
        label: 'generative engine optimisation',
      },
    ],

    // No verified ecommerce result yet. The proof section does not render.
    proof: false,

    faqs: [
      [
        'What does an ecommerce SEO agency do?',
        'It works on the architecture that governs thousands of pages at once: which faceted URLs are crawlable, how product variants are consolidated, how out-of-stock products are handled, which category page owns which intent, and whether product markup is complete enough for rich results. Content matters, but on a catalogue the template decisions move far more revenue.',
      ],
      [
        'How should faceted navigation be handled for SEO?',
        'Decide per facet rather than globally. Combinations people genuinely search, such as brand plus category, usually deserve indexable pages with their own copy. Combinations that only produce near-duplicates should be crawlable but not indexable, or blocked entirely. Then make canonicals, robots directives and internal links agree, because mixed signals cost more than either decision.',
      ],
      [
        'What should we do with out-of-stock product pages?',
        'It depends on why it is out of stock. Temporary stockouts keep the page live with availability marked correctly in schema and alternatives offered. Seasonal products returning later stay live rather than being redirected. Permanent discontinuations redirect to the closest equivalent product or the parent category, never the homepage, so the accumulated links keep working.',
      ],
      [
        'Do product variants need separate URLs?',
        'Only when people search for them. Colour and size usually do not deserve their own URLs and split ranking signals when they get them, so they belong on one page behind a selector with a single canonical. Attributes with genuine standalone demand, such as capacity on a phone, can justify separate pages, provided each has its own differentiated content.',
      ],
      [
        'How long does ecommerce SEO take to show results?',
        'Technical and architectural fixes often show first, because they change how a large number of existing pages are crawled and consolidated rather than waiting on new content to earn authority. Category and buying-guide work follows the ordinary curve of several months. On a large catalogue the first measurable change is usually how quickly new products get indexed.',
      ],
      [
        'Is Shopify bad for SEO?',
        'No, but it has known constraints you design around rather than fight: a forced /collections/ and /products/ URL structure, product pages reachable from multiple collection paths, and limited control over how filters generate URLs. These are manageable with the right canonical and internal-linking approach. The platform is rarely the reason a store is not ranking.',
      ],
      [
        'How much does an ecommerce SEO agency cost?',
        'We do not publish a rate, because a 300-product store and a 40,000-SKU catalogue with four filter dimensions are not the same job. Apply for the free founder review and you get a scoped figure within 48 hours, after someone has looked at your actual catalogue, your facet behaviour and your crawl data.',
      ],
      [
        'Do you have ecommerce case studies?',
        'Not yet, and we will not borrow one. Our one measured, cross-checkable result is sendr.ai in B2B SaaS: zero to 1.05M impressions in six months. The technical craft on this page transfers directly; the ecommerce results do not exist until we have them. If you need a vertical-specific reference before signing, we are not the right choice today.',
      ],
      [
        'How many crawlable URLs can faceted navigation actually create?',
        'More than most teams believe. Google states that parameter-based faceted navigation "can generate infinite URL spaces which harms the website", because filters combine and reorder freely. Four filters with ten values each is already tens of thousands of combinations from one category. The practical question is never how many exist, but which ones real people search for, because those are the only ones worth letting Google index.',
      ],
      [
        'Does product schema still matter if we already rank well?',
        'Yes, and increasingly for a different reason. Rich results were the original payoff; the current one is eligibility for assistant-driven shopping answers, which read structured data rather than page copy. Google notes that "the more properties you can add, the more enhancements your page can be eligible for". The catch is accuracy: markup generated once at launch goes stale on the first price change, which is why it has to come from the feed.',
      ],
      [
        'How much does AI search actually affect ecommerce traffic?',
        'Enough to change how you measure. Ahrefs studied 300,000 keywords and found the presence of an AI Overview correlated with a 34.5% lower click-through rate at position one. For ecommerce that pressure lands hardest on research and comparison queries rather than on branded or transactional ones, which is an argument for strengthening the commercial pages rather than abandoning informational content.',
      ],
      [
        'Is our product page experience really an SEO problem?',
        'It becomes one. Baymard benchmarked 344 US and European retailers and found 51% have "mediocre" or worse product page UX, with more than 1,300 distinct usability issues recorded in testing. Those issues show up in engagement and return-to-SERP behaviour long before they show up in a crawl report, and they cap what any amount of ranking work can convert.',
      ],
    ],

    related: ['saas-seo-agency', 'local-seo-agency'],
  },

  {
    slug: 'healthcare-seo-agency',
    nav: 'Healthcare',
    navDesc: 'YMYL credibility, clinician authorship and multi-provider architecture',
    title: 'Healthcare SEO Agency: Built for YMYL Scrutiny',
    description:
      'Healthcare SEO agency: clinician authorship, YMYL credibility, provider and location architecture, and the review and tracking constraints the sector carries.',
    eyebrow: 'WHO WE HELP · HEALTHCARE',
    h1: 'A healthcare SEO agency that treats credibility as the ranking problem.',
    audienceName: 'Healthcare providers, clinics and health technology companies',
    problemsEyebrow: 'WHY HEALTHCARE SEO IS HARDER',
    approachH2: 'The healthcare playbook, in the order it pays.',
    engagementH2: 'What happens after you send a domain.',
    faqH: 'Healthcare SEO, asked and answered.',
    ctaSub:
      'Drop your domain. The founder runs the review personally and comes back within 48 hours on where your credibility signals and provider architecture actually stand, even when the answer is no.',

    answer:
      'A healthcare SEO agency works under tighter constraints than most. Content sits in the category Google treats as highest risk, so authorship, accuracy and institutional credibility carry unusual weight. The architectural work is provider, service and location pages that do not compete with each other, and the measurement has to respect patient privacy rules.',

    intro: [
      'Healthcare is the clearest case of a vertical where the ranking problem is mostly a credibility problem. Google asks its quality raters to apply the highest scrutiny to content that could affect someone’s health, and the practical consequence is that an unattributed article written by a marketing agency competes badly against the same information published under a named clinician.',
      'The second complication is structural. A practice with eleven clinicians across four sites has a page architecture problem before it has a content problem: provider pages, service pages and location pages all describe overlapping things, and left alone they compete with each other for the same searches.',
    ],

    keyFacts: [
      {
        stat: 'Trust first',
        label: 'Google states that of the E-E-A-T aspects, "trust is most important" — the others exist to support it',
        source: 'googleHelpfulContent',
      },
      {
        stat: 'Highest bar',
        label: 'for YMYL topics Google says content "must be highly accurate and consistent with established expert consensus"',
        source: 'googleHelpfulContent',
      },
      {
        stat: 'Not a factor',
        label: 'Google is explicit that "E-E-A-T itself isn’t a specific ranking factor", so it cannot be bought or bolted on',
        source: 'googleHelpfulContent',
      },
      {
        stat: '34.5%',
        label: 'lower click-through rate at position one where an AI Overview appears — health queries attract them heavily',
        source: 'ahrefsAio',
      },
      {
        stat: 'Relevance, distance, popularity',
        label: 'the three factors Google names for local results, which decide whether a clinic appears in the Map Pack at all',
        source: 'googleLocalRanking',
      },
    ],

    quote: {
      text: 'Of these aspects, trust is most important.',
      who: 'Google',
      role: 'Search Central, on E-E-A-T and content quality',
      source: 'googleHelpfulContent',
    },

    comparisonTable: {
      caption: 'What changes when the agency has worked under YMYL scrutiny',
      columns: ['Capability', 'Generalist SEO agency', 'Healthcare specialist'],
      rows: [
        ['Authorship', 'A staff writer byline, or none', 'Named clinician, credentials, and a review date on the page'],
        ['Medical accuracy', 'Checked against other articles', 'Checked against expert consensus, with a documented review step'],
        ['Provider pages', 'Treated as team bios', 'Treated as entities, with structured data and consistent facts'],
        ['Service vs condition pages', 'Both written, allowed to overlap', 'Intent assigned per page so they stop competing'],
        ['Multi-location', 'One page per site, often duplicated', 'Location architecture with genuinely local substance'],
        ['Analytics', 'Standard tracking, everywhere', 'Scoped to respect patient privacy obligations on clinical pages'],
        ['Reviews', 'Volume campaigns', 'Compliance-aware process that does not solicit clinical detail'],
        ['Reporting', 'Sessions and rankings', 'Appointment enquiries by service and location'],
      ],
    },

    problems: [
      {
        h: 'Your content is judged against expert consensus, not against competitors',
        p: 'Most verticals reward content that is better than the other results. Health content is assessed on whether it is accurate and consistent with what the field actually holds to be true. An article that is well-written, well-optimised and subtly out of date with current guidance is a liability rather than an asset.',
        evidence: { source: 'googleHelpfulContent', note: 'Google states YMYL content "must be highly accurate and consistent with established expert consensus".' },
      },
      {
        h: 'Nobody credible is named on the page',
        p: 'Agency-written health content with no author, or a generic "editorial team" byline, is competing against pages published under a named clinician with verifiable credentials. The information may be identical. The credibility signal is not, and in this vertical that signal does most of the work.',
        evidence: { source: 'googleHelpfulContent', note: 'Google names trust as the most important element of E-E-A-T, with experience, expertise and authoritativeness supporting it.' },
      },
      {
        h: 'Your provider, service and location pages compete with each other',
        p: 'A clinic with eleven clinicians, nine services and four sites has well over a hundred plausible page combinations and usually publishes a confused subset. Google consolidates, picks one, and it is rarely the one you optimised. This is an architecture decision, not a content volume problem.',
        evidence: { source: 'googleLocalRanking', note: 'Google ties local relevance to how well a profile matches the search, which a set of near-identical pages actively muddies.' },
      },
      {
        h: 'Patients search symptoms; you publish services',
        p: 'The query that starts the journey describes a feeling, not a procedure. The page you have describes the procedure in clinical language. The gap between those two vocabularies is where most healthcare organic traffic is lost, and closing it is editorial work rather than technical work.',
        evidence: { source: 'ahrefsAio', note: 'Symptom queries are informational, and Ahrefs found AI Overviews hit informational queries hardest with a 34.5% lower position-one CTR.' },
      },
      {
        h: 'Privacy obligations constrain how you can measure and retarget',
        p: 'Standard analytics and advertising tags behave differently when the page itself reveals something about a visitor’s health. Many practices either ignore this and accumulate risk, or over-correct and lose all visibility into what is working. Both are avoidable with a deliberate measurement design, decided before tags are deployed rather than after.',
      },
      {
        h: 'AI answers now sit above health results',
        p: 'Health is among the query types where an AI summary most often occupies the space above the organic results, which changes what a first-page position is worth. The defensible position is being the source such an answer draws on, which depends on the same credibility signals as ranking, expressed in a more extractable form.',
        evidence: { source: 'ahrefsAio', note: 'Across 300,000 keywords, an AI Overview correlated with a 34.5% lower click-through rate at position one.' },
      },
    ],

    approach: [
      {
        h: 'Authorship and review, built into the publishing process',
        p: 'Every clinical page gets a named author with verifiable credentials, a documented review step and a visible review date. This is a workflow change before it is an SEO change, and it is the single highest-leverage thing a healthcare site can do, which is why it sits inside',
        to: '/what-we-do/content-marketing',
        label: 'the content engine',
        when: 'Weeks 1–4',
        who: 'Senior editor, with a named clinician from your side for review',
        deliverable: 'An authorship and medical review workflow, author entity pages, and review metadata on every clinical page',
      },
      {
        h: 'An entity graph your organisation actually matches',
        p: 'Providers, locations and the organisation itself modelled as entities with consistent facts across your site, your profiles and third-party directories, so search engines and assistants resolve who you are without guessing. That is the structured data and consistency half of',
        to: '/what-we-do/technical-seo',
        label: 'technical SEO',
        when: 'Weeks 2–6',
        who: 'Technical strategist',
        deliverable: 'An organisation, provider and location schema graph, plus a reconciled set of business facts across every source',
      },
      {
        h: 'Page architecture decided before more content is written',
        p: 'Which page owns the condition, which owns the treatment, which owns the location, and which should not exist. On a multi-site practice this usually means merging or removing pages rather than adding them, which is the part of',
        to: '/what-we-do/seo',
        label: 'full-stack SEO',
        when: 'Weeks 3–8',
        who: 'Senior strategist',
        deliverable: 'An intent map covering every provider, service, condition and location page, with merge, differentiate or remove decided for each',
      },
      {
        h: 'Symptom-language content that routes to the right service',
        p: 'Pages written in the vocabulary patients actually use, answering the question first and connecting it to the relevant service and clinician. Answering plainly up front is also what makes a page quotable, which is the territory of',
        to: '/what-we-do/answer-engine-optimization',
        label: 'answer engine optimisation',
        when: 'Month 2 onwards, weekly',
        who: 'Senior editor, clinician-reviewed',
        deliverable: 'Condition and symptom pages in patient language, each linked to the service page and provider it should convert to',
      },
      {
        h: 'Measurement designed around privacy, not bolted on after',
        p: 'What is tracked, on which pages, and what is deliberately not collected, agreed before deployment with whoever owns compliance on your side. We are not your legal advisers and will say so, but we will not quietly deploy tags on clinical pages either. The reporting that results is still tied to',
        to: '/what-we-do/ai-seo',
        label: 'AI SEO measurement',
        when: 'Agreed week 1, live by week 4',
        who: 'Technical strategist with your compliance owner',
        deliverable: 'A documented measurement plan naming what is collected where, and appointment-enquiry reporting by service and location',
      },
    ],

    proof: false,

    timeline: [
      ['Week 1', 'Founder review of the domain, credibility audit of clinical content, inventory of provider, service, condition and location pages, and a measurement scoping conversation with your compliance owner.', 'You see how many of your pages are competing with each other, which is usually more than expected.'],
      ['Month 1', 'Authorship and review workflow live, author entities published, schema graph shipped, first architecture decisions applied.', 'Credibility signals land and consolidation begins. Early movement is usually on pages that stopped competing.'],
      ['Month 3', 'Symptom-language content shipping weekly against the mapped gaps, location pages rebuilt where they earn it, profiles and directories reconciled.', 'Visibility on the patient-language queries that previously went to a health publisher instead of you.'],
      ['Month 6', 'Defending the service and condition terms that convert, widening coverage, refreshing clinical content as guidance changes.', 'Compounding on the pages that carry both credibility and intent. Appointment enquiries reportable by service.'],
    ],

    notFor: [
      'Organisations that cannot supply a clinician to review content. The authorship requirement is the mechanism, not a formality, and we will not ghostwrite clinical claims under an invented byline.',
      'Anyone wanting volume content production on health topics without a review step. That is the fastest way to accumulate liability in the one vertical where accuracy is assessed directly.',
      'Practices needing legal or compliance advice on patient privacy. We will design measurement conservatively and work with your compliance owner, but we are not your advisers on it.',
      'Buyers who need a healthcare case study before signing. Our one measured result is B2B SaaS. That is a fair requirement and today we would not meet it.',
    ],

    engagement: [
      [
        'The free founder review',
        'You send a domain. The founder goes through it personally: whether clinical pages carry named, credentialed authorship, how many of your provider, service and location pages are competing, how your organisation resolves as an entity across sources, and what is currently being tracked on clinical pages. A verdict within 48 hours.',
      ],
      [
        'Agree the review workflow before any content is scoped',
        'Who reviews clinical content, how long it takes them, and what the sign-off looks like. This governs the pace of everything downstream, and discovering in month two that no clinician has time is the most common way healthcare content programmes stall.',
      ],
      [
        'Scope and price, after the review',
        'No rate card. A single-site practice and an eleven-clinician group across four locations are different jobs, and the architecture work differs more than the content work does.',
      ],
      [
        'Credibility and architecture first, volume last',
        'Authorship, entity consistency and the intent map come before new pages, because publishing more content into a confused architecture makes the consolidation problem worse rather than better.',
      ],
      [
        'Handover, not hostage-taking',
        'The intent map, the authorship workflow, the schema templates and the measurement plan are documented and live with you. If your next agency or first in-house hire inherits anything, it should be decisions rather than archaeology.',
      ],
    ],

    objections: [
      [
        'How will I know it is working before appointment enquiries move?',
        'By agreeing leading indicators up front. Consolidation of competing pages, indexation of new condition content, movement on patient-language queries, and the share of clinical pages carrying named authorship are all measurable within weeks. Enquiries follow. If none of those have moved by week six, something is wrong and we say so rather than waiting for a quarterly review.',
      ],
      [
        'Our clinicians have no time to review content. Can you work around it?',
        'Not really, and we would rather say so before you sign. Named, credentialed review is the mechanism that makes healthcare content competitive, and inventing a byline is both dishonest and discoverable. What we can do is reduce the burden: tighter drafts, a structured review format, and batching so a clinician reviews several pieces in one sitting rather than being interrupted weekly.',
      ],
      [
        'What about patient privacy and our analytics?',
        'We design the measurement conservatively and we do not deploy tracking on clinical pages without your compliance owner agreeing what is collected. We are not your legal advisers on this and will not pretend otherwise. What we will not do is the common alternative, which is deploying standard tags everywhere and letting you discover the exposure later.',
      ],
      [
        'Why not hire a healthcare marketing agency that does everything?',
        'If you need paid media, brand and patient communications under one roof, you probably should. What a full-service healthcare agency rarely has is someone who will tell you that forty of your pages are competing with each other and should be merged. The architectural and credibility work is a specialist job, and it is usually the constraint.',
      ],
    ],

    relatedReading: {
      capabilities: ['/what-we-do/technical-seo', '/what-we-do/content-marketing', '/what-we-do/answer-engine-optimization'],
      posts: [
        ['/blog/why-business-invisible-online', 'Why your business is invisible online'],
        ['/blog/find-customers-searching-for-your-product', 'Finding customers already searching for you'],
      ],
      tool: ['/competitor-analysis', 'Competitor Analysis'],
    },

    faqs: [
      [
        'What does a healthcare SEO agency do differently?',
        'It treats credibility as the primary ranking problem rather than a finishing touch. That means named clinical authorship with verifiable credentials, a documented medical review step, content checked against expert consensus, and an entity graph that resolves your organisation, providers and locations consistently. The architectural work on competing provider and service pages usually matters more than publishing volume.',
      ],
      [
        'Why is healthcare SEO harder than other industries?',
        'Because the content sits in the category Google treats as highest risk. Its guidance states that content on topics affecting health must be highly accurate and consistent with established expert consensus, which is a stricter test than being better than the competing page. Add multi-provider, multi-location architecture and privacy constraints on measurement, and the job is genuinely different.',
      ],
      [
        'Does E-E-A-T matter more for medical content?',
        'The expectation is higher, yes. Google says that of the E-E-A-T aspects trust is most important, and that it applies extra weight on topics that could significantly affect health. It also states plainly that E-E-A-T itself is not a specific ranking factor, which matters: it cannot be bought, and anyone selling an E-E-A-T package is selling a concept rather than a mechanism.',
      ],
      [
        'Do our articles need a doctor to write them?',
        'They need a credentialed clinician to be genuinely accountable for the content, which in practice usually means a named reviewer rather than an author writing from scratch. A professional writer drafting and a clinician reviewing and signing is both realistic and legitimate. What does not work is an invented or generic byline, which is discoverable and undermines the signal it was meant to create.',
      ],
      [
        'How should we handle pages for multiple providers and locations?',
        'As an architecture decision made before more pages are written. Decide which page owns the condition, which owns the treatment, which owns the location, and which should not exist. For a multi-site practice this usually means merging or removing pages. Publishing more content into a confused structure reliably makes consolidation worse.',
      ],
      [
        'Can we track conversions on clinical pages?',
        'Carefully, and with your compliance owner involved in deciding what is collected where. Standard analytics and advertising tags behave differently when the page itself reveals something about a visitor. We design measurement conservatively and document it. We are not your legal advisers on patient privacy and will not act as them.',
      ],
      [
        'How long does healthcare SEO take?',
        'Consolidation of competing pages can show within weeks because it changes how existing content is evaluated rather than waiting for new pages to earn authority. Credibility signals compound over months. Condition and symptom content follows the ordinary curve. The pace is usually set by clinician review capacity rather than by anything technical.',
      ],
      [
        'Do AI Overviews affect health searches more than others?',
        'Health queries are heavily informational, and Ahrefs found across 300,000 keywords that an AI Overview correlated with a 34.5% lower click-through rate at position one, with informational queries absorbing most of the effect. The practical response is to make clinical content genuinely citable and to weight effort towards service and location pages that convert.',
      ],
      [
        'Should we publish symptom content or stick to services?',
        'Both, with a clear division. Symptom and condition content in patient language captures the query that starts the journey; service pages in clinical language convert it. The common failure is publishing only the second, which means a health publisher answers your patient’s first question and owns the relationship from there.',
      ],
      [
        'Do you have healthcare case studies?',
        'No, and we will not borrow one. Our single measured, cross-checkable result is sendr.ai in B2B SaaS. The credibility, entity and architecture craft transfers directly; healthcare results do not exist until we have produced them. If you need a sector reference before signing, that is reasonable, and today we would not meet it.',
      ],
    ],

    related: ['saas-seo-agency', 'local-seo-agency'],
  },
  {
    slug: 'law-firm-seo-agency',
    nav: 'Law firms',
    navDesc: 'Practice-area architecture, YMYL credibility and Map Pack competition',
    title: 'Law Firm SEO Agency: Practice Areas First',
    description:
      'Law firm SEO agency: practice-area and location architecture without thin pages, YMYL credibility, Map Pack competition and advertising-rule constraints.',
    eyebrow: 'WHO WE HELP · LAW FIRMS',
    h1: 'A law firm SEO agency that will tell you which pages to delete.',
    audienceName: 'Law firms and legal practices',
    problemsEyebrow: 'WHY LEGAL SEO GOES WRONG',
    approachH2: 'The legal playbook, in the order it pays.',
    engagementH2: 'What happens after you send a domain.',
    faqH: 'Law firm SEO, asked and answered.',
    ctaSub:
      'Drop your domain. The founder runs the review personally and comes back within 48 hours on how many of your practice-area pages are competing with each other, even when the answer is that you need fewer pages, not more.',

    answer:
      'A law firm SEO agency works on three fronts: a practice-area and location architecture that does not generate near-duplicate pages, credibility signals for content Google treats as high risk, and Map Pack visibility, which for most firms produces more enquiries than the organic results beneath it.',

    intro: [
      'Legal is the vertical where the standard agency playbook does the most damage. The instinct is to multiply practice areas by cities and publish the matrix, because it looks like coverage and it is easy to sell. What it produces is dozens of pages that differ by a place name, which Google consolidates, and which collectively make the site look thinner rather than larger.',
      'The firms that win organic do fewer, better pages, hold the Map Pack in the areas they can realistically serve, and publish content a practising solicitor or attorney would put their name to. None of that is complicated. It is just slower to sell than a hundred-page matrix.',
    ],

    keyFacts: [
      {
        stat: 'Highest bar',
        label: 'legal sits in the category Google says must be "highly accurate and consistent with established expert consensus"',
        source: 'googleHelpfulContent',
      },
      {
        stat: 'Trust first',
        label: 'Google states that of the E-E-A-T aspects, "trust is most important" — which is the whole legal buying decision',
        source: 'googleHelpfulContent',
      },
      {
        stat: 'Relevance, distance, popularity',
        label: 'the three factors Google names for local results, and distance is the one no firm can change',
        source: 'googleLocalRanking',
      },
      {
        stat: '74%',
        label: 'of consumers consult two or more review sites before deciding, so inconsistent firm details are seen, not hidden',
        source: 'brightlocal2025',
      },
      {
        stat: '93%',
        label: 'expect a response to their review — which for a law firm has to be handled without discussing the matter',
        source: 'brightlocal2025',
      },
    ],

    quote: {
      text: 'Local results are mainly based on relevance, distance, and popularity.',
      who: 'Google',
      role: 'Google Business Profile Help, on how local ranking is determined',
      source: 'googleLocalRanking',
    },

    comparisonTable: {
      caption: 'The two approaches to legal SEO, and what each produces',
      columns: ['Decision', 'The matrix approach', 'The architecture approach'],
      rows: [
        ['Page count', 'Practice areas multiplied by cities', 'One page per intent that can be genuinely served'],
        ['City pages', 'One per town on the list', 'Only where real work, courts or presence justify it'],
        ['What Google does with them', 'Consolidates and picks one, often not yours', 'Indexes them as distinct, because they are'],
        ['Authorship', 'Agency-written, unattributed', 'Named practitioner, with credentials'],
        ['Map Pack', 'Treated as a by-product', 'Treated as the primary asset for most enquiries'],
        ['Reviews', 'Volume campaign', 'Steady process, responses that disclose nothing'],
        ['Case results', 'Published as marketing claims', 'Handled within your jurisdiction’s advertising rules'],
        ['Reporting', 'Rankings across a wide keyword list', 'Enquiries by practice area and by area served'],
      ],
    },

    problems: [
      {
        h: 'The practice-area times location matrix is the default and it does not work',
        p: 'Eight practice areas across twelve towns is ninety-six pages, and almost none of them can say anything true that the others do not. Google treats near-duplicates by consolidating them, so the usual result is that one page ranks, ninety-five dilute the site, and the firm concludes SEO does not work for legal.',
        evidence: { source: 'googleLocalRanking', note: 'Google ties relevance to how well content matches the search, not to how many place names a site repeats.' },
      },
      {
        h: 'Your content sits in the category judged most harshly',
        p: 'Legal advice affects people’s financial stability and sometimes their liberty, which puts it squarely in the highest-scrutiny category. Content that is competent but unattributed competes badly against the same material published under a named practitioner with verifiable credentials and a jurisdiction.',
        evidence: { source: 'googleHelpfulContent', note: 'Google asks for the highest accuracy on topics that could significantly affect financial stability or safety.' },
      },
      {
        h: 'The Map Pack decides more enquiries than your website does',
        p: 'For most searches that produce a client, three local results sit above every organic listing, and what ranks there is your Business Profile rather than your home page. Firms can rank second organically for their main practice area and still take almost no calls, because the decision was made in the three results above.',
        evidence: { source: 'googleLocalRanking', note: 'Google states local results are based mainly on relevance, distance and popularity.' },
      },
      {
        h: 'Reviews matter enormously and are awkward to ask for',
        p: 'Legal clients arrive through one of the most trust-dependent decisions anyone makes, and most firms have a thin, stale review profile because asking feels inappropriate at the moment the matter concludes. The result is prominence capped by something that is a process problem rather than a marketing one.',
        evidence: { source: 'brightlocal2025', note: 'BrightLocal found 93% expect a response to their review and 74% consult two or more review sites.' },
      },
      {
        h: 'Advertising rules constrain what you can claim, and they vary',
        p: 'What a firm may say about outcomes, specialisation and comparative quality differs by jurisdiction, and the constraints are real rather than decorative. Agencies without legal experience routinely draft case-result copy and superlative claims that a compliance partner then has to strip out, which wastes a content cycle.',
      },
      {
        h: 'You are bidding against firms that can outspend you, in both channels',
        p: 'Legal is among the most contested paid categories anywhere, and the same firms compete organically. That makes the winnable ground narrower and more specific: the practice-area and location combinations where you have genuine standing, rather than the ones with the most volume.',
        evidence: { source: 'googleAdRank', note: 'Even in paid, Google states a lower bidder can outrank a higher one, because ad quality feeds Ad Rank.' },
      },
    ],

    approach: [
      {
        h: 'Decide which pages should not exist',
        p: 'The first deliverable is usually a list of pages to merge or remove. For a firm sitting on a city matrix this recovers more than any amount of new content, because it stops dozens of pages competing for the same intent. This is the consolidation half of',
        to: '/what-we-do/seo',
        label: 'full-stack SEO',
        when: 'Weeks 1–4',
        who: 'Senior strategist',
        deliverable: 'An intent map covering every practice-area and location page, with merge, differentiate or remove decided for each, and the redirect map that implements it',
      },
      {
        h: 'The Business Profile treated as the primary asset',
        p: 'Categories, services, areas served, hours and photos chosen against the searches that actually produce enquiries, on your own Google account with us added as a manager. It sits outside your website entirely, which is why it is missed by ordinary',
        to: '/what-we-do/technical-seo',
        label: 'technical SEO',
        when: 'Weeks 1–3',
        who: 'Senior strategist, on your account',
        deliverable: 'A corrected profile with categories and services mapped to named queries, plus a grid baseline of where you currently rank across the area',
      },
      {
        h: 'Practitioner-authored content, within the rules',
        p: 'Pages written or reviewed by a named practitioner with a stated jurisdiction, drafted so compliance does not have to strip them afterwards. Answering the question plainly up front is also what makes a page quotable, which is the concern of',
        to: '/what-we-do/answer-engine-optimization',
        label: 'answer engine optimisation',
        when: 'Month 2 onwards, weekly',
        who: 'Senior editor, with a named practitioner for review',
        deliverable: 'Practice-area and question-led pages carrying named authorship, drafted against your jurisdiction’s advertising constraints',
      },
      {
        h: 'A review process that fits how matters actually close',
        p: 'A request built into the point in your process where it is appropriate, with response templates that acknowledge without discussing the matter. Reviews feed prominence, and prominence is half of what decides the Map Pack, which makes this part of the',
        to: '/what-we-do/content-marketing',
        label: 'content and communications work',
        when: 'Live by week 4, compounding after',
        who: 'Designed by us, run by your team',
        deliverable: 'A review request built into your matter-closing process, plus response templates that disclose nothing',
      },
      {
        h: 'Being named when someone asks an assistant for a solicitor',
        p: 'Prospective clients increasingly ask for a shortlist before they search. Appearing in that answer depends on consistent firm facts across every source and corroborating third-party coverage, which is the work of',
        to: '/what-we-do/generative-engine-optimization',
        label: 'generative engine optimisation',
        when: 'Month 2 onwards, continuous',
        who: 'Strategist plus digital PR',
        deliverable: 'A tracked set of prospective-client prompts, measured monthly, with the directory and coverage work that moves them',
      },
    ],

    proof: false,

    timeline: [
      ['Week 1', 'Founder review of the site and Business Profile together, an audit of how many practice-area and location pages compete, and a baseline rank grid across the area you serve.', 'You find out how much of your site is working against itself. On a city matrix this is usually the bulk of it.'],
      ['Month 1', 'Profile corrected and categories mapped to real queries, first consolidation decisions implemented with redirects, review process live.', 'Map Pack movement often lands here, because the profile is re-evaluated far faster than a website.'],
      ['Month 3', 'Practice-area pages rebuilt with named authorship, location pages kept only where they earn it, citations reconciled across directories.', 'Consolidated pages recover positions they were previously splitting, and prominence starts to firm up.'],
      ['Month 6', 'Widening into the practice-area and area combinations that are winnable, defending what is held, refreshing content as law changes.', 'Enquiries reportable by practice area and by area served, rather than a rankings list.'],
    ],

    notFor: [
      'Firms that want a city page for every town in the county. We will tell you that costs you visibility rather than adding it, and if that is the engagement you want, we are the wrong agency.',
      'Practices with no practitioner available to put their name to content. Named authorship is the mechanism in a high-scrutiny category, and we will not invent a byline.',
      'Anyone needing advice on what their jurisdiction’s advertising rules permit. We draft conservatively and work with your compliance partner; we are not your adviser on the rules themselves.',
      'Buyers who need a legal sector case study before signing. Our one measured result is B2B SaaS, and that is a fair requirement we do not currently meet.',
    ],

    engagement: [
      [
        'The free founder review',
        'You send a domain and your firm name. The founder goes through the site and the Business Profile together: how many practice-area and location pages are competing, whether content carries named practitioner authorship, how your firm details reconcile across directories, and how far your Map Pack visibility actually reaches. A verdict within 48 hours.',
      ],
      [
        'Baseline the grid before anything changes',
        'Positions sampled across the area you genuinely serve, so there is a real before-picture. Without it there is no way to show whether work extended your reach or simply moved one number measured at your office address.',
      ],
      [
        'Scope and price, after the review',
        'No rate card. A single-office firm with three practice areas and a multi-office practice with twelve are different jobs, and the consolidation work differs more than the content work does.',
      ],
      [
        'Consolidation first, publication last',
        'Merging and removing competing pages comes before writing new ones, because adding content to a diluted architecture makes the problem worse. New pages follow once each one has an intent nothing else is claiming.',
      ],
      [
        'You keep the profile and the decisions',
        'The Business Profile stays on your account with us as a manager, never the reverse. The intent map, redirect map and review process are documented and stay with the firm.',
      ],
    ],

    objections: [
      [
        'How will I know it is working before enquiries move?',
        'Through the grid and the consolidation. Map Pack positions sampled across your area, the count of pages no longer competing for the same intent, indexation of rebuilt practice-area pages, and review velocity are all visible within weeks. Enquiries by practice area follow. If none of those have moved by week six, we tell you rather than waiting for a quarterly review to raise it.',
      ],
      [
        'Our competitors have hundreds of city pages and they rank. Why should we not?',
        'Check what is actually ranking before copying it. In most cases a handful of those pages carry the visibility and the rest contribute nothing, which is a different thing from the matrix working. Where a large page set does work, it is usually because each page carries genuinely local substance such as courts, cases or offices. If you can write that, build them; if you cannot, you are publishing duplicates.',
      ],
      [
        'What if you are busy with other clients?',
        'Four founder reviews a month is the cap, and you work with the senior people who ran the audit rather than an account manager. The trade is that we take on less. If your firm needs more capacity than we can give it, you get that answer within 48 hours of applying, not in month three.',
      ],
      [
        'Why not use a legal marketing agency that knows the sector?',
        'Often you should, and for paid media and brand in a sector this contested they are usually the better choice. What a legal-specialist agency less often does is tell you to delete eighty pages, because the page matrix is frequently the product being sold. If your firm’s problem is architecture rather than production, that is the constraint worth fixing first.',
      ],
    ],

    relatedReading: {
      capabilities: ['/what-we-do/seo', '/what-we-do/technical-seo', '/what-we-do/generative-engine-optimization'],
      posts: [
        ['/blog/why-business-invisible-online', 'Why your business is invisible online'],
        ['/blog/why-competitors-grow-faster', 'Why competitors grow faster'],
      ],
      tool: ['/domain-authority-checker', 'Domain Authority Checker'],
    },

    faqs: [
      [
        'What does a law firm SEO agency actually do?',
        'Three things, in order: fix a practice-area and location architecture that is usually generating near-duplicate pages, build credibility signals for content Google treats as high risk, and compete for the Map Pack, which produces more enquiries for most firms than the organic results below it. Content production comes after those, not instead of them.',
      ],
      [
        'Should we build a page for every practice area in every city?',
        'Almost never. Eight practice areas across twelve towns is ninety-six pages that mostly differ by a place name, and Google consolidates near-duplicates rather than ranking them all. Build a page where you can say something true and specific: an office, courts you appear in, matters you have handled there. For everywhere else, one well-built practice-area page serves better.',
      ],
      [
        'Why is legal SEO so competitive?',
        'Because the value of a single matter justifies sustained spend, so the same well-resourced firms compete in both paid and organic. That narrows the winnable ground rather than closing it. The realistic targets are the practice-area and area combinations where you have genuine standing, not the terms with the highest volume.',
      ],
      [
        'How important is the Google Business Profile for a law firm?',
        'For most enquiry-generating searches it is the primary asset, because three local results sit above every organic listing and what ranks there is your profile rather than your website. Google states local results are based mainly on relevance, distance and popularity. A firm can rank second organically and still take very few calls.',
      ],
      [
        'How do we get client reviews without breaching confidentiality?',
        'By asking at the right point in your process and replying in a way that discloses nothing. A response can acknowledge the review, thank the person and offer to continue offline without confirming any detail of the matter. The practical problem is usually that no one asks: BrightLocal found 93% of consumers expect a response, and most firms have a thin, stale profile.',
      ],
      [
        'Can we publish case results?',
        'It depends on your jurisdiction’s advertising rules, and they vary meaningfully. We draft conservatively and expect your compliance partner to have the final say, because an agency that writes outcome claims without checking wastes a content cycle when they are stripped. We will not advise you on what the rules permit; that is properly your call.',
      ],
      [
        'Does E-E-A-T matter for legal content?',
        'The expectation is higher than average, because legal content can significantly affect someone’s financial stability or liberty. Google says that of the E-E-A-T aspects trust is most important, while also stating plainly that E-E-A-T is not itself a ranking factor. Practically, that means named practitioner authorship with a stated jurisdiction, not an E-E-A-T package.',
      ],
      [
        'How long does law firm SEO take to produce enquiries?',
        'Profile work can move Map Pack position within weeks because it is re-evaluated quickly. Consolidating competing pages shows up over weeks to a couple of months as Google re-evaluates existing content. New practice-area content follows the ordinary curve of several months. Legal generally shows movement faster than national SEO, and the early movement is profile-driven.',
      ],
      [
        'Will AI assistants recommend law firms?',
        'They already produce shortlists when asked, and being named depends on consistent firm facts across every source plus corroborating third-party coverage. It is worth tracking a set of prospective-client prompts monthly, because there is no analytics event when an assistant names a competitor instead of you.',
      ],
      [
        'Do you have law firm case studies?',
        'No. Our one measured, cross-checkable result is sendr.ai in B2B SaaS, and we will not present it as though it were legal. The architecture, credibility and local craft transfers; legal results do not exist until we have produced them. If a sector reference is a requirement, that is reasonable and we would not meet it today.',
      ],
    ],

    related: ['local-seo-agency', 'healthcare-seo-agency'],
  },
  {
    slug: 'home-services-seo-agency',
    nav: 'Home services',
    navDesc: 'Emergency intent, service-area architecture and Local Services Ads',
    title: 'Home Services SEO Agency: Urgency and Radius',
    description:
      'Home services SEO agency: emergency intent, service-area versus city architecture, Local Services Ads and the Google Guarantee, and review velocity that holds.',
    eyebrow: 'WHO WE HELP · HOME SERVICES',
    h1: 'A home services SEO agency that works the radius, not the keyword list.',
    audienceName: 'Home services businesses and trade contractors',
    problemsEyebrow: 'WHY TRADE SEO IS ITS OWN GAME',
    approachH2: 'The home services playbook, in the order it pays.',
    engagementH2: 'What happens after you send a domain.',
    faqH: 'Home services SEO, asked and answered.',
    ctaSub:
      'Drop your domain and your service area. The founder runs the review personally and comes back within 48 hours on how far your visibility really reaches, even when the answer is that your radius will not stretch where you want it to.',

    answer:
      'A home services SEO agency works three surfaces at once: the Map Pack, where most emergency calls are won; Local Services Ads, which sit above it and require background checks; and a website architecture organised by service and realistic travel radius rather than by a list of nearby towns.',

    intro: [
      'Home services is the vertical where the buyer is least patient. A boiler has failed, a drain is backing up, or a roof is leaking, and the search that follows resolves to a phone call within minutes. That compresses everything: the decision is made from a profile, a star rating and a distance estimate, usually before anyone visits a website.',
      'It also means the ceiling on your visibility is geographic rather than editorial. You can be the best-regarded firm in your trade and still be invisible four towns away, because distance is a ranking factor nobody can optimise. The work is figuring out where you genuinely can win and then dominating that, rather than spreading thin across a county.',
    ],

    keyFacts: [
      {
        stat: 'Relevance, distance, popularity',
        label: 'the three factors Google names for local results — and distance is the one you cannot change',
        source: 'googleLocalRanking',
      },
      {
        stat: 'All owners',
        label: 'must complete a criminal background check to carry the Google Guarantee on Local Services Ads',
        source: 'googleLocalServicesChecks',
      },
      {
        stat: 'No charge',
        label: 'Google states businesses are not charged for the Local Services background check',
        source: 'googleLocalServicesChecks',
      },
      {
        stat: '93%',
        label: 'of consumers expect a business to respond to their review, which for a trade is an operational commitment',
        source: 'brightlocal2025',
      },
      {
        stat: '42%',
        label: 'now trust reviews as much as a personal recommendation, down from 79% in 2020 — recency beats volume',
        source: 'brightlocal2025',
      },
    ],

    quote: {
      text: 'Businesses aren’t charged for the background check.',
      who: 'Google',
      role: 'Google Ads Help, on background checks for Local Services ads',
      source: 'googleLocalServicesChecks',
    },

    comparisonTable: {
      caption: 'The three surfaces a trade competes on, and what wins each',
      columns: ['', 'Local Services Ads', 'Map Pack', 'Organic'],
      rows: [
        ['Where it sits', 'Above everything', 'Above the organic results', 'Below both'],
        ['What qualifies you', 'Background checks, licence and insurance verification', 'Profile, reviews, proximity', 'Website quality and relevance'],
        ['What the searcher does', 'Calls from the ad', 'Calls from the profile', 'Reads, then calls'],
        ['Cost model', 'Paid per lead', 'Free, earned', 'Free, earned'],
        ['Best for', 'Emergency and high-intent jobs', 'Everything local', 'Research-stage and non-urgent work'],
        ['Radius limit', 'Set by your service area', 'Hard — distance is a ranking factor', 'Soft — can reach further'],
        ['Time to first result', 'Days, once verified', 'Days to weeks', 'Weeks to months'],
        ['Who it suits', 'Trades in eligible categories', 'Every local trade', 'Trades with non-urgent services too'],
      ],
    },

    problems: [
      {
        h: 'The job is won before anyone reaches your website',
        p: 'For an urgent call-out, the sequence is a search, a glance at the three local results, a star rating and a phone number. Your website is frequently never opened. A trade that invests entirely in its site while neglecting its profile is optimising the last step of a journey most customers never reach.',
        evidence: { source: 'googleLocalRanking', note: 'Google states local results are based mainly on relevance, distance and popularity — all profile-side signals.' },
      },
      {
        h: 'Your radius is a hard limit and nobody tells you where it ends',
        p: 'Distance is a ranking factor you cannot optimise, so beyond a certain range the Map Pack is simply unavailable to you regardless of how good your profile is. Most trades do not know where that line falls, because standard reporting gives one position measured near the office rather than a picture across the area.',
        evidence: { source: 'googleLocalRanking', note: 'Google defines distance as how far each business is from the searcher, which makes a single reported rank meaningless.' },
      },
      {
        h: 'Local Services Ads sit above you and you are not in them',
        p: 'In eligible categories, Local Services Ads occupy the space above the Map Pack, and they are gated on verification rather than budget. Owners must complete criminal background checks, and licence and insurance details are checked. Google does not charge for the check. Many trades skip it because the paperwork looks burdensome, which cedes the top of the results.',
        evidence: { source: 'googleLocalServicesChecks', note: 'Google states all business owners must complete a criminal background check, and that businesses are not charged for it.' },
      },
      {
        h: 'Reviews arrive in bursts, then stop',
        p: 'A trade finishes a job, the customer is delighted, nobody asks, and the moment passes. The profile ends up with a decent total accumulated years ago and nothing recent, which reads as a business that has gone quiet. Recency now matters more than volume, and the fix is a process rather than a campaign.',
        evidence: { source: 'brightlocal2025', note: 'BrightLocal found trust in reviews has fallen from 79% in 2020 to 42%, and that 93% of consumers expect a response.' },
      },
      {
        h: 'Your site is organised by service when customers search by problem and place',
        p: 'The page says "drainage solutions"; the search says "blocked drain" and a town name. Trades consistently publish in their own vocabulary rather than the customer’s, and structure by service line rather than by the combination of job and area that people actually type.',
      },
      {
        h: 'Seasonality makes month-on-month reporting meaningless',
        p: 'Boiler work peaks in the cold, roofing after storms, air conditioning in heat. Comparing November against August tells you about the weather, not about your marketing. Without year-on-year comparison, seasonal businesses routinely cancel work that was succeeding or celebrate work that was not.',
      },
    ],

    approach: [
      {
        h: 'The Business Profile, worked as the main asset',
        p: 'Primary and secondary categories, services, service areas, hours, photos and booking links, all chosen against the jobs you actually want. It lives outside your website, which is exactly why it gets missed by ordinary',
        to: '/what-we-do/seo',
        label: 'full-stack SEO',
        when: 'Weeks 1–3',
        who: 'Senior strategist, on your Google account with us as a manager',
        deliverable: 'A corrected profile mapped to named job queries, with services and service areas set deliberately rather than by default',
      },
      {
        h: 'Find the real edge of your radius',
        p: 'Positions sampled across a geographic grid covering the whole area you are willing to travel to, so the line where your visibility fades becomes visible. Everything downstream is prioritised from that map, which is the measurement discipline behind',
        to: '/what-we-do/ai-seo',
        label: 'AI SEO reporting',
        when: 'Baseline week 1, then monthly',
        who: 'Strategist',
        deliverable: 'A rank grid across your service area showing where you hold the Map Pack, where you fade, and which towns are realistically winnable',
      },
      {
        h: 'Local Services Ads verification, done rather than deferred',
        p: 'Background checks, licence and insurance verification completed so you are eligible for the slot above the Map Pack in categories where it exists. The checks cost nothing; the delay is administrative. Getting this done early changes what the rest of the',
        to: '/what-we-do/technical-seo',
        label: 'technical and profile work',
        when: 'Started week 1, cleared when the checks return',
        who: 'Your team supplies documents; we project-manage the process',
        deliverable: 'Completed verification and a configured Local Services profile, where your category and area are eligible',
      },
      {
        h: 'Job-and-place pages, only where they are defensible',
        p: 'A page per job type, and a page per town only where you can describe actual work there. Thin town pages are a liability rather than coverage, which makes this a judgement call inside',
        to: '/what-we-do/content-marketing',
        label: 'the content engine',
        when: 'Month 2 onwards',
        who: 'Strategist decides the shape, senior editor writes',
        deliverable: 'Service pages in customer language, plus location pages only for areas with genuine substance behind them',
      },
      {
        h: 'A review engine wired into job completion',
        p: 'The ask built into the moment the job finishes, when the customer is most willing, with owner responses that read like a person wrote them. Review text also feeds the summaries buyers now read first, which connects this to',
        to: '/what-we-do/answer-engine-optimization',
        label: 'answer engine optimisation',
        when: 'Live by week 4, compounding after',
        who: 'Designed by us, run by your engineers or office team',
        deliverable: 'A repeatable request at job completion, response templates, and steady weekly velocity rather than bursts',
      },
    ],

    proof: false,

    timeline: [
      ['Week 1', 'Founder review of the site, the profile and your service area together. Rank grid baseline across the whole radius. Local Services verification started.', 'You see where your visibility actually ends, which is usually closer to home than you assumed.'],
      ['Month 1', 'Profile corrected and categories mapped to real jobs, review request live at job completion, verification progressing.', 'Map Pack movement commonly appears here, because the profile is re-evaluated much faster than a website.'],
      ['Month 3', 'Service pages rebuilt in customer language, defensible town pages built, citations reconciled, Local Services live where eligible.', 'The grid starts to widen rather than one number moving. Review velocity becomes steady.'],
      ['Month 6', 'Pushing the radius where it is winnable, holding what you have, planning content around the next season rather than the last one.', 'A measurably larger area of coverage, with enquiries attributable by job type and town.'],
    ],

    notFor: [
      'Trades wanting a page for every town within fifty miles. Distance caps what the Map Pack will do for you, and thin town pages make the site weaker. We will say so rather than build them.',
      'Businesses that cannot build a review ask into job completion. Velocity is most of prominence, and no agency can generate genuine reviews for you.',
      'Anyone whose growth depends on a lead-generation marketplace rather than their own visibility. That is a different problem and we are not the right people for it.',
      'Buyers who need a trade sector case study before signing. Our one measured result is B2B SaaS, and that is a fair requirement we do not meet today.',
    ],

    engagement: [
      [
        'The free founder review',
        'You send a domain, your business name and the area you cover. The founder reviews the site and the Business Profile together, checks how your details reconcile across directories, samples where you currently rank across the area, and establishes whether you are eligible for Local Services Ads. A verdict within 48 hours.',
      ],
      [
        'Establish the real radius before planning anything',
        'A grid baseline across the whole area you are willing to travel to, so the plan is built on where you can actually win rather than on a list of towns. This single piece of information changes most trade SEO plans substantially.',
      ],
      [
        'Scope and price, after the review',
        'No rate card. A single-van operation covering three towns and a twelve-engineer firm covering a county are different jobs, and the architecture work differs more than the content does.',
      ],
      [
        'Profile and verification first, pages last',
        'The profile, the review process and Local Services verification come before new pages, because they decide the surface where most calls are won. Service and town pages follow, for the areas the grid says are winnable.',
      ],
      [
        'You keep the keys, throughout',
        'The Business Profile and Local Services account stay yours with us added as managers, never the reverse. They are your most valuable local assets and no agency should be able to leave with them, including us.',
      ],
    ],

    objections: [
      [
        'How will I know it is working when rankings differ street by street?',
        'With the grid rather than a number. We sample across your whole service area before anything changes and repeat it monthly, so you can see the covered area growing or not. Alongside it: calls attributed by job type and town, profile interactions from Google’s own reporting, and review velocity. Seasonal comparisons are year-on-year, never month-on-month.',
      ],
      [
        'We are busy in season. Is this the wrong time to start?',
        'In season is usually the right time to start the review process and the wrong time to expect your team’s attention on content. The practical approach is to use the busy period for what it is good for, which is generating reviews at job completion, and do the architecture and page work in the quieter months so you enter the next season already visible.',
      ],
      [
        'What if you are busy with other clients?',
        'Four founder reviews a month is the cap, and you work with the senior people who did your audit. The trade is that we take fewer clients. If your area needs more attention than we can give, you get that answer within 48 hours of applying rather than in month three.',
      ],
      [
        'Why not just spend the money on Local Services Ads?',
        'Often you should spend some of it there, and we will tell you to. Paid-per-lead sits above everything and converts urgent demand immediately. What it does not do is compound, and it stops the day you pause it. The sensible split is usually paid for emergency demand while the earned surfaces, profile and radius, are built underneath it.',
      ],
    ],

    relatedReading: {
      capabilities: ['/what-we-do/technical-seo', '/what-we-do/content-marketing', '/what-we-do/answer-engine-optimization'],
      posts: [
        ['/blog/steady-stream-of-customers', 'Building a steady stream of customers'],
        ['/blog/why-business-invisible-online', 'Why your business is invisible online'],
      ],
      tool: ['/page-speed-checker', 'Page Speed Checker'],
    },

    faqs: [
      [
        'What does a home services SEO agency do?',
        'It works the three surfaces a trade competes on: Local Services Ads at the top, which are gated on verification rather than budget; the Map Pack, where most urgent calls are won from a profile rather than a website; and organic pages for non-urgent work. The architecture is organised by job type and realistic travel radius rather than by a list of towns.',
      ],
      [
        'How do I get the Google Guarantee for my business?',
        'Through Local Services Ads verification, where your category and area are eligible. Google states that all owners of the business must complete a criminal background check, and that workers who visit customer locations are screened too, while office and clerical staff are exempt. Google also states businesses are not charged for the background check. The barrier is administrative time, not cost.',
      ],
      [
        'How far from my base can I realistically rank?',
        'Further organically than in the Map Pack, and the exact line is specific to you. Distance is one of the three factors Google names for local results and it is the one you cannot influence, so beyond a certain radius the local pack becomes unavailable regardless of your profile. The only way to find the line is to sample positions across a grid covering your area.',
      ],
      [
        'Should we build a page for every town we cover?',
        'Only where you can write something true about working there: jobs completed, travel times, local requirements, named references. Pages identical but for a place name are the oldest tactic in local SEO and the most reliably ignored. For everywhere else, one well-built service page covering the area outperforms a dozen hollow ones.',
      ],
      [
        'How important are reviews for a trade business?',
        'They are central, because prominence is one of the three local ranking factors and reviews are the most visible input to it. Recency now carries more weight than total count: BrightLocal found trust in reviews has fallen from 79% in 2020 to 42%, and 93% of consumers expect a response. A steady weekly trickle beats a large pile that stopped two years ago.',
      ],
      [
        'How do we handle seasonality in reporting?',
        'Compare year on year, never month on month. Boiler work peaks in the cold and roofing after storms, so a November-to-August comparison measures the weather rather than your marketing. Seasonal trades regularly cancel campaigns that were working because the reporting period flattered the previous quarter.',
      ],
      [
        'Is SEO worth it when we already get work from word of mouth?',
        'It depends on whether word of mouth covers the jobs you want rather than just the jobs you get. Referrals tend to be strong for familiar work in familiar areas and weak for new services or a widened radius. Local search is also where emergency demand goes, and that demand has no relationship with who knows you.',
      ],
      [
        'How long does home services SEO take?',
        'Profile and category corrections can move Map Pack position within weeks, because the profile is re-evaluated quickly. Local Services verification is gated on how fast checks return. Citation cleanup is slower. Review velocity compounds over months. Local generally shows movement faster than national SEO, and the early movement is profile-driven.',
      ],
      [
        'Should we use Local Services Ads or focus on organic?',
        'Both, in that order of urgency. Local Services sits above everything and converts emergency demand immediately, but it is rented and stops when you pause it. The earned surfaces compound and survive a budget cut. The usual split is paid for urgent demand while the profile, reviews and radius are built underneath it.',
      ],
      [
        'Do you have home services case studies?',
        'No, and we will not borrow one from another sector. Our single measured result is sendr.ai in B2B SaaS. The local, profile and architecture craft transfers directly; trade results do not exist until we have produced them. If a sector reference is a requirement before signing, that is fair and we would not meet it today.',
      ],
    ],

    related: ['local-seo-agency', 'law-firm-seo-agency'],
  },
  {
    slug: 'local-seo-agency',
    keyFacts: [
      {
        stat: '96%',
        label: 'of consumers read online business reviews at least sometimes — only 4% say they never do',
        source: 'brightlocal2025',
      },
      {
        stat: '74%',
        label: 'consult two or more review websites before deciding, so consistency across sources matters as much as volume',
        source: 'brightlocal2025',
      },
      {
        stat: '93%',
        label: 'expect a business to respond to their review, making owner responses an operational requirement rather than a nicety',
        source: 'brightlocal2025',
      },
      {
        stat: '42%',
        label: 'now trust reviews as much as a personal recommendation, down from 79% in 2020 — trust is falling, so quality beats quantity',
        source: 'brightlocal2025',
      },
      {
        stat: '48%',
        label: 'read the AI-written review summary first, and 18% would decide on that summary alone',
        source: 'brightlocal2025',
      },
    ],

    quote: {
      text: 'Local results are mainly based on relevance, distance, and popularity.',
      who: 'Google',
      role: 'Google Business Profile Help, on how local ranking is determined',
      source: 'googleLocalRanking',
    },

    comparisonTable: {
      caption: 'Why a national SEO playbook underperforms on a local business',
      columns: ['', 'National SEO', 'Local SEO'],
      rows: [
        ['The query behind it', 'Informational or commercial, location irrelevant', 'Commercial with a place attached, often implicit'],
        ['The asset that ranks', 'A page on your website', 'Your Google Business Profile, above the organic results'],
        ['What drives position', 'Authority, content, technical health', 'Relevance, distance and prominence, per Google'],
        ['What you can change', 'Nearly everything', 'Relevance and prominence only — distance is fixed'],
        ['How position is reported', 'One number per keyword', 'A grid across the service area, because it varies by postcode'],
        ['Reviews', 'Reputational, indirect', 'A direct ranking input through prominence'],
        ['Typical first movement', 'Weeks 5 to 7', 'Days to weeks, because the profile is re-evaluated quickly'],
        ['The common failure', 'Targeting volume over intent', 'Optimising the website and ignoring the profile'],
      ],
    },

    timeline: [
      ['Week 1', 'Founder review of the site and the Google Business Profile together, baseline rank grid across the real service area, citation audit.', 'You see where your visibility actually falls off, which is usually much closer to home than expected.'],
      ['Month 1', 'Profile corrected: categories, services, attributes, hours and photos against the queries you want. Review ask built into a process you already run.', 'Map Pack movement is often visible here, because the profile is re-evaluated far faster than a website.'],
      ['Month 3', 'Citation inconsistencies resolved across the sources that matter, duplicates claimed or removed, location architecture decided and the defensible pages built.', 'Prominence starts to firm up. Review velocity becomes steady rather than arriving in bursts.'],
      ['Month 6', 'Widening the radius where it is winnable, defending the terms you hold, and the organic layer for areas the Map Pack will not reach.', 'A measurably larger area of coverage on the grid, rather than one number that moved.'],
    ],

    notFor: [
      'Businesses without a physical location or a defined service area. If there is no geography attached to your buyers, this is national SEO and the playbook is different.',
      'Anyone expecting to rank in towns far from where they operate. Distance is a ranking factor you cannot change, and we will say so rather than sell you twelve city pages.',
      'Businesses that cannot sustain a review ask. Review velocity is central to prominence, and no agency can generate genuine reviews on your behalf.',
      'Buyers who need deep Google Business Profile suspension or spam-dispute work. Specialists on our local shortlist do far more of that than we do.',
    ],

    objections: [
      [
        'How will I know it is working, when rankings differ by postcode?',
        'With a grid, not a number. We sample positions across your actual service area before anything changes, so there is a real before-picture, and repeat it as work lands. That shows whether your visibility radius is growing rather than whether one measurement near your office moved. Alongside it: calls and form fills attributed to location, and profile interactions from Google’s own reporting.',
      ],
      [
        'What if we move premises or open a second location?',
        'Both are manageable and both need handling deliberately. A move means updating the profile and every citation that carries the old address, in a sequence, because inconsistent data during the change is what causes problems. A second location means deciding whether it gets its own profile and its own page, which it usually should, and making sure the two do not compete for the same queries.',
      ],
      [
        'What if you get busy with other clients?',
        'Four founder reviews a month is the cap. You work with the senior people who ran your audit rather than an account manager, and the trade is that we take on less. If your service area needs more attention than we can give it, the honest answer comes within 48 hours of applying, not in month three.',
      ],
      [
        'Why not just do this ourselves?',
        'A lot of local SEO genuinely is self-serviceable, and we will tell you when it is. Claiming and completing the profile, asking customers for reviews, and replying to them are all things an owner can do better than an agency, because they know the customers. Where help pays is the architectural decisions: which areas deserve a page, how to resolve citation conflicts across aggregators, and what to do when the radius stops growing.',
      ],
    ],

    relatedReading: {
      comparisonPage: '/best/seo-agencies-for-local-business',
      capabilities: ['/what-we-do/technical-seo', '/what-we-do/answer-engine-optimization', '/what-we-do/content-marketing'],
      posts: [
        ['/blog/why-business-invisible-online', 'Why your business is invisible online'],
        ['/blog/steady-stream-of-customers', 'Building a steady stream of customers'],
      ],
      tool: ['/domain-authority-checker', 'Domain Authority Checker'],
    },

    ctaSub: 'Drop your domain and your business name. The founder reviews the site and the Google Business Profile together and comes back within 48 hours, even when the answer is that your radius will not stretch that far.',
    engagementH2: 'What happens after you send your profile.',
    engagement: [
      [
        'The free founder review',
        'You send a domain and your business name. The founder checks the website and the Google Business Profile together: categories against the queries you want, citation consistency, review velocity, and whether your location pages say anything true about the areas they name. A verdict within 48 hours.',
      ],
      [
        'Baseline the grid before changing anything',
        'We sample positions across your actual service area rather than a single point, so there is a real before-picture. Without it, there is no way to tell whether work extended your radius or just moved one number measured next to your office.',
      ],
      [
        'Scope and price, after the review',
        'No rate card. One location in one town and a service-area business covering twelve are different engagements, and so is citation cleanup versus building a review mechanism.',
      ],
      [
        'Profile and entity first, pages second',
        'Categories, services and profile content, then citation consistency, then a review ask built into a process you already run. Location pages come last, and only where something true can be said about the area.',
      ],
      [
        'You keep the keys, throughout',
        'The Google Business Profile stays on your Google account with us added as a manager, never the reverse. It is your most valuable local asset and no agency should be able to leave with it, including us.',
      ],
    ],
    comparison: '/best/seo-agencies-for-local-business',
    comparisonLabel: 'the 11 best local SEO agencies',
    nav: 'Local & service-area',
    navDesc: 'Google Business Profile, the Map Pack, citations and city architecture',
    // Head term: "local seo agency". Secondary: "local seo services",
    // "local seo company", "seo agency for small business".
    title: 'Local SEO Agency: Map Pack and Near-Me Search',
    description:
      'Local SEO agency: Google Business Profile, Map Pack ranking, citations, review velocity and the city versus service-area page architecture that actually works.',
    eyebrow: 'WHO WE HELP · LOCAL & SERVICE-AREA',
    h1: 'A local SEO agency that works the Map Pack, not just the website.',
    audienceName: 'Local and service-area businesses',
    problemsEyebrow: 'WHY LOCAL RANKING IS ITS OWN GAME',
    approachH2: 'The local playbook, in the order it pays.',
    faqH: 'Local SEO, asked and answered.',

    answer:
      'A local SEO agency works two surfaces at once: the Map Pack, which ranks on relevance, distance and prominence and is driven mainly by your Google Business Profile, reviews and citations; and your website, where city and service pages compete in ordinary organic results. The two reinforce each other and need different work.',

    intro: [
      'Local search is the one vertical where your website is not the main asset. For most commercial queries the Map Pack sits above every organic result, and what ranks in it is your Google Business Profile, not your home page. A business can rank third organically and still get no calls.',
      'Distance makes it relative, too. There is no single position to report: you rank differently from one postcode to the next, and an agency showing you one number is showing you the one measured nearest your office.',
    ],

    problems: [
      {
        h: 'The Map Pack is the result, and your site is not in it',
        evidence: { source: 'googleLocalRanking', note: 'Google states local results are based mainly on relevance, distance and popularity — only one of which lives on your website.' },
        p: 'Relevance, distance and prominence decide those three slots. Relevance comes from categories, services and profile content; prominence from reviews, citations and web presence; distance from the searcher, which you cannot change. Site-only SEO moves neither of the first two, which is why campaigns that ignore the profile stall.',
      },
      {
        h: 'Your rankings are different in every postcode',
        evidence: { source: 'googleLocalRanking', note: 'Google defines distance as how far each business is from the searcher, which is why a single reported position is meaningless.' },
        p: 'Local results are computed from where the searcher is standing, so a single reported position is meaningless. You need a grid of measurements across your actual service area to see where you win, where you fade, and how far your radius really extends. Most reporting hides this, and it is usually the most actionable data available.',
      },
      {
        h: 'Inconsistent citations are quietly capping prominence',
        evidence: { source: 'brightlocal2025', note: 'BrightLocal found 74% of consumers consult two or more review sites, so conflicting business details are seen rather than hidden.' },
        p: 'An old suite number on one directory, a dead phone on another, a pre-rebrand name on a third. Each is trivial; together they make your business harder to resolve as one entity, and entity confidence feeds prominence. Unglamorous, slow, and one of the few local levers with a predictable effect.',
      },
      {
        h: 'Reviews stopped, and so did the ranking',
        evidence: { source: 'brightlocal2025', note: 'Only 29% of consumers wrote a review last year though 96% are open to it, and 93% expect a response when they do.' },
        p: 'A business with 200 reviews, none in the last year, looks less current than one with 60 that arrive weekly. Review velocity, recency, whether owners reply, and whether the text mentions the service and the area all feed the picture. Most businesses have no mechanism for asking, so volume arrives in bursts and then dies.',
      },
      {
        h: 'Your city pages are the same page with the town name swapped',
        evidence: { source: 'googleLocalRanking', note: 'Google ties relevance to how well a profile and its content match the search, not to how many place names a site repeats.' },
        p: 'Twelve pages identical but for a place name are the oldest trick in local SEO and the most reliably ignored. A page earns its place with something true about serving that area: real work done there, the actual travel radius, locally specific constraints, genuine references. If you cannot write that, you need fewer pages, not more.',
      },
      {
        h: 'Service-area businesses are modelled wrong',
        evidence: { source: 'googleLocalRanking', note: 'Google’s own guidance separates the address a business shows from the areas it declares it serves.' },
        p: 'A plumber covering eight towns from a van is not a shop, and the architecture differs: how the profile hides the address, which areas are declared, and whether the site is organised by service or by location. Getting this backwards either buries your main service pages or spreads you thinly across towns you will never rank in.',
      },
    ],

    approach: [
      {
        h: 'The Google Business Profile, treated as a ranking asset',
        when: 'Weeks 1–3',
        who: 'Senior strategist, on your Google account with us as a manager',
        deliverable: 'Categories, services, attributes, products, hours, booking links and posts, each chosen against a named query',
        p: 'Primary and secondary categories, services, attributes, products, photos, hours, booking links and posts, each chosen against the queries you actually want. It is the single highest-leverage surface in local search and it sits outside your website entirely, which is why it is not covered by ordinary',
        to: '/what-we-do/seo',
        label: 'full-stack SEO',
      },
      {
        h: 'Grid-based rank measurement across the service area',
        when: 'Baseline week 1, then monthly',
        who: 'Strategist',
        deliverable: 'A geographic grid of sampled positions covering the real service area, so coverage is visible rather than a single number',
        p: 'Positions sampled across a geographic grid rather than a single point, so you can see the real shape of your visibility and whether work is extending it. This is the local equivalent of the reporting discipline in',
        to: '/what-we-do/ai-seo',
        label: 'AI SEO',
      },
      {
        h: 'Citation consistency and entity clean-up',
        when: 'Weeks 2–12, aggregators lag',
        who: 'Strategist with your office manager for source-of-truth details',
        deliverable: 'One canonical name, address and phone applied across the sources that matter, with duplicates claimed or removed',
        p: 'One canonical name, address and phone, corrected across the directories and aggregators that matter, with duplicates claimed or removed. It is entity work: making every source agree about who you are, the same discipline that underpins',
        to: '/what-we-do/generative-engine-optimization',
        label: 'generative engine optimisation',
      },
      {
        h: 'A review engine, not a review campaign',
        when: 'Live by week 4, compounding after',
        who: 'Built by us, run by your team — the ask has to come from you',
        deliverable: 'A repeatable ask at the right point in your existing process, plus response templates that read like a person wrote them',
        p: 'A repeatable ask at the right moment in your own process, so velocity is steady rather than bursty, plus owner responses that read like a person. Reviews also feed the content that answer surfaces quote, which is the concern of',
        to: '/what-we-do/answer-engine-optimization',
        label: 'answer engine optimisation',
      },
      {
        h: 'Location architecture you can actually defend',
        when: 'Month 2 onwards',
        who: 'Strategist decides the shape, senior editor writes the pages',
        deliverable: 'A decision on which areas earn a page and which belong to a service page, and content with something genuinely local in it',
        p: 'A decision about which areas deserve a page, which belong to a service page instead, and how the two interlink, followed by content with something genuinely local in it. Thin location pages are a liability, which makes this a',
        to: '/what-we-do/content-marketing',
        label: 'content problem',
      },
    ],

    // No verified local result yet. The proof section does not render.
    proof: false,

    faqs: [
      [
        'What does a local SEO agency do?',
        'Two jobs at once. It optimises your Google Business Profile, reviews and citations to rank in the Map Pack, and it builds the city, service and service-area pages that compete in ordinary organic results. The two reinforce each other, which is why doing only the website is the most common reason local campaigns underperform.',
      ],
      [
        'How does Google decide Map Pack rankings?',
        'Google names three factors: relevance, how well your profile matches the query; distance, how far you are from the searcher or the area they named; and prominence, how well known and well referenced your business is, drawn from reviews, citations, links and general web presence. Distance is fixed, so the work goes into relevance and prominence.',
      ],
      [
        'How long does local SEO take to work?',
        'Profile and category corrections can move Map Pack position within weeks, because the profile is re-evaluated quickly. Citation clean-up is slower, since aggregators update on their own schedules. Review velocity compounds over months. Location-page work follows ordinary organic timelines. Local is generally faster to show movement than national SEO, and the early movement is usually profile-driven.',
      ],
      [
        'Do we need separate pages for every town we serve?',
        'Only for towns where you can say something true and specific: work done there, travel time, local requirements, named references. A page that is identical to eleven others but for the place name adds no value and risks being treated as thin. For the rest, one well-built service page covering the area outperforms a dozen hollow ones.',
      ],
      [
        'How important are reviews for local rankings?',
        'They feed prominence, and recency matters as much as count. A steady weekly trickle signals a currently active business more convincingly than a large number that stopped arriving a year ago. Owner responses, and review text that mentions the service and the area, both help. The practical work is building a repeatable ask into your process.',
      ],
      [
        'What is a citation and do they still matter?',
        'A citation is any mention of your business name, address and phone on another site, such as a directory or an industry listing. They matter less than a decade ago as a ranking push and more as a consistency check: conflicting details make your business harder to resolve as one entity, which caps prominence. Correct them, then stop chasing volume.',
      ],
      [
        'How much does a local SEO agency cost?',
        'We do not publish a rate, because one location in one town and a service-area business covering twelve are different engagements. Apply for the free founder review and you get a scoped figure within 48 hours, after someone has looked at your profile, your citation spread and how your visibility actually falls off across the area.',
      ],
      [
        'Do you have local SEO case studies?',
        'Not yet, and we will not present someone else’s. Our one measured result is sendr.ai in B2B SaaS: zero to 1.05M impressions in six months. The entity, schema and measurement discipline transfers; local results do not exist until we have produced them. If a vertical-specific reference is a requirement for you, we are not the right agency today.',
      ],
      [
        'How much do reviews really affect local rankings?',
        'They feed prominence, one of the three factors Google names. The consumer side is better measured: BrightLocal’s 2025 survey of 1,026 US adults found only 4% never read reviews, 74% consult two or more review sites, and 93% expect a response when they leave one. Recency and owner responses do more work than raw count.',
      ],
      [
        'Are consumers still influenced by reviews as much as they were?',
        'Less than they were, which changes the tactic. BrightLocal found 42% now trust reviews as much as a personal recommendation, down from 79% in 2020. The implication is not to stop asking, it is that volume alone stopped working. Specific, recent, replied-to reviews carry the weight that a large stale pile no longer does.',
      ],
      [
        'Do AI review summaries change anything?',
        'They are becoming the first thing many people read. In BrightLocal’s 2025 data, 48% read the AI-written review summary first and 18% would decide on that summary alone. Because those summaries are generated from your review text, what customers actually write about — the service, the area, the specifics — now shapes the first impression more than your star average.',
      ],
      [
        'Can we rank in a town we are not based in?',
        'Sometimes organically, rarely in the Map Pack. Google states that local results are based mainly on relevance, distance and popularity, and distance is the one you cannot change. For areas beyond a realistic radius, the honest target is the organic result rather than the three-pack. An agency promising Map Pack coverage across a wide area regardless of your address is not being straight.',
      ],
    ],

    related: ['saas-seo-agency', 'ecommerce-seo-agency'],
  },
];

export const WHO_WE_HELP_META = {
  title: 'Who We Help: Six Verticals, Six Playbooks',
  description:
    'RankedTag works six verticals: B2B SaaS, ecommerce, local and service-area, healthcare, law firms and home services. Each gets its own playbook.',
  canonical: `${SITE}/who-we-help`,
};

export const VERTICAL_BY_SLUG = Object.fromEntries(VERTICALS.map((v) => [v.slug, v]));

export const verticalUrl = (slug) => `${SITE}/${slug}`;

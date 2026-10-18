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
  title: 'Who We Help: SaaS, Ecommerce and Local SEO',
  description:
    'RankedTag works three verticals: B2B SaaS, ecommerce, and local or service-area businesses. Each gets its own playbook, because the problems are not the same.',
  canonical: `${SITE}/who-we-help`,
};

export const VERTICAL_BY_SLUG = Object.fromEntries(VERTICALS.map((v) => [v.slug, v]));

export const verticalUrl = (slug) => `${SITE}/${slug}`;

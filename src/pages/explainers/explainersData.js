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
  {
    slug: 'seo-vs-ppc-for-saas',
    nav: 'SEO vs PPC for SaaS',
    year: '2026',
    updated: '2026-10-19',
    verified: '19 October 2026',

    title: 'SEO vs PPC for SaaS in 2026: Which, When, Why',
    description:
      'SEO builds an asset, PPC rents attention. The real decision for a SaaS company is runway, sales cycle and category maturity, not which channel is cheaper.',
    eyebrow: 'EXPLAINER · CHANNEL ECONOMICS',
    h1: 'SEO vs PPC for SaaS in 2026: which one your runway can actually afford.',

    answer:
      'PPC buys attention immediately and stops the moment you stop paying. SEO builds an asset that compounds but takes months to show revenue. For SaaS the deciding factors are runway, sales-cycle length and whether your category has search demand yet, not which channel has the lower headline cost.',

    intro: [
      'Framing this as a cost comparison is what makes the decision hard. The two channels do not sell the same thing. One rents a position for as long as the card keeps working; the other builds something you keep. Comparing their cost per click is like comparing rent to a mortgage payment without mentioning that one of them ends with you owning a building.',
      'The useful question is narrower: given your runway, your sales cycle and how mature your category is, which one can you afford to be wrong about?',
    ],

    comparisonTable: {
      caption: 'The honest comparison, for a SaaS company specifically',
      columns: ['', 'PPC', 'SEO'],
      rows: [
        ['What you are buying', 'A position, for as long as you pay', 'An asset on a domain you own'],
        ['Time to first result', 'Hours', 'Weeks for bottom-of-funnel pages, months for the rest'],
        ['What happens if you stop', 'Traffic ends the same day', 'Decays slowly over quarters'],
        ['Cost behaviour', 'Scales linearly with volume, and with competition', 'Front-loaded, then flattens as pages compound'],
        ['Works without search demand', 'Yes, you can create it on other surfaces', 'No — nothing to rank for yet'],
        ['Keyword-level control', 'Immediate and exact', 'Indirect and slow'],
        ['Attribution', 'Clean, click-level', 'Messy across a long cycle'],
        ['Defensibility', 'None — a competitor can outbid you tomorrow', 'High — position has to be earned, not bought'],
        ['Best early use', 'Validating which messages and queries convert', 'Owning the queries PPC proved were worth it'],
      ],
    },

    keyFacts: [
      {
        stat: 'Bid ≠ position',
        label: 'Google states a lower bidder can outrank a higher one, because ad quality is part of Ad Rank',
        source: 'googleAdRank',
      },
      {
        stat: 'Minimum required',
        label: 'you pay only what is minimally required to clear the Ad Rank thresholds, so actual CPC is often below your max bid',
        source: 'googleAdsCost',
      },
      {
        stat: '34.5%',
        label: 'lower organic click-through rate at position one when an AI Overview is present, across 300,000 keywords',
        source: 'ahrefsAio',
      },
      {
        stat: '+115%',
        label: 'AI visibility lift for a source around position five that cites its sources — the compounding side has a new lever',
        source: 'geoStudy',
      },
    ],

    quote: {
      text: 'even if your competition bids higher than you, you can still win a higher position.',
      who: 'Google',
      role: 'Google Ads Help, on how the ad auction works',
      source: 'googleAdRank',
    },

    body: [
      {
        id: 'not-a-cost-comparison',
        h: 'Why the cost comparison is the wrong starting point',
        p: [
          'Published benchmarks for cost per click and cost per lead circulate widely and are worth treating carefully. Most of the figures you will find reproduced across agency blogs trace back to one or two annual reports, and the per-industry rows are frequently copied between sites without anyone checking the original. We have deliberately not quoted a cost-per-lead figure on this page, because we could not open the primary source to verify it.',
          'That is less of a loss than it sounds, because the averages would not tell you much anyway. Your cost per click is set by your auction, not by an industry median, and in SaaS the variance between categories is enormous. A crowded horizontal category and a niche vertical tool can differ by an order of magnitude.',
          'What is worth knowing about the mechanics is that money alone does not decide placement. Google is explicit that a lower bidder can outrank a higher one, because the quality of your ads and landing pages feeds into Ad Rank alongside the bid. You are also charged only what is minimally required to clear the Ad Rank thresholds, so your actual cost per click is frequently lower than your maximum bid. Both facts mean a well-built account beats a well-funded one more often than people expect.',
        ],
      },
      {
        id: 'the-real-variables',
        h: 'The three variables that actually decide it',
        p: [
          '**Runway.** If organic has to produce revenue within two months for the business to survive, SEO is the wrong instrument regardless of its long-term economics. This is the single most common mistake: choosing the compounding channel while needing the immediate one.',
          '**Sales-cycle length.** A long cycle punishes PPC reporting less than it punishes SEO reporting, because the click is at least attributable. But it also means PPC spend sits on the balance sheet for months before anything closes, which is a cash-flow problem rather than a measurement one.',
          '**Category maturity.** If nobody searches for what you do yet, SEO has nothing to rank for. You can still buy attention on other surfaces and create demand, but organic search is downstream of demand that already exists. For genuinely new categories, PPC and other channels come first by necessity, and SEO follows once the language settles.',
        ],
      },
      {
        id: 'when-ppc',
        h: 'When PPC is the right call',
        p: [
          'When you need to learn fast. The strongest argument for paid search in SaaS is not acquisition, it is information. Within weeks you learn which queries convert, which messages land, and what a lead is actually worth to you. That is research you can then point SEO at, instead of guessing for six months.',
          'When the query set is small and high-value. Some categories have a handful of queries worth owning and nothing else. Buying them is cheaper and more certain than trying to build topical authority around a thin topic.',
          'When you have a time-bound event: a launch, a funding announcement, a conference, a competitor stumbling. Organic cannot respond on that timescale.',
          'When you have runway pressure. Paid converts attention into pipeline this quarter. It is more expensive per unit and it is the honest answer anyway.',
        ],
      },
      {
        id: 'when-seo',
        h: 'When SEO is the right call',
        p: [
          'When your category already has search demand and someone else is capturing it. Every month you do not rank for the comparison and alternatives queries about your own product is a month a review aggregator or a competitor monetises your brand name.',
          'When your unit economics cannot absorb paid acquisition at scale. If the lifetime value of a customer does not comfortably clear the cost of buying one, buying more aggressively makes the problem worse rather than better.',
          'When you can wait two quarters. The compounding only shows up if you are still there when it arrives. Programmes cancelled at month four produce the cost of SEO with none of the return.',
          'When you want the acquisition to survive a budget cut. This is the part founders undervalue until they live through one. A paused ad account produces zero the same day. A library of ranking pages keeps working.',
        ],
      },
      {
        id: 'both',
        h: 'Running both, in the order that wastes least',
        p: [
          'The sequence that works most often is PPC first as a research instrument, then SEO against what it proved. Run paid on the queries you believe matter, measure which actually convert at an acceptable cost, and build organic pages against the winners. You have replaced a six-month guess with a six-week experiment.',
          'Once organic starts ranking for a query, the question becomes whether to keep paying for the same term. Sometimes yes, when the SERP is contested and holding both positions suppresses a competitor. Often no, and that budget moves to the next untested query set. Reviewing this quarterly is usually worth more than any bid optimisation.',
          'The failure mode is running them in separate silos with separate reports and no shared keyword map, which is how companies end up paying for clicks on terms they already rank first for.',
        ],
      },
      {
        id: 'ai-change',
        h: 'What AI search changes about this trade-off',
        p: [
          'It squeezes the organic side in a specific and measurable way. Ahrefs studied 300,000 keywords and found the presence of an AI Overview correlated with a 34.5% lower click-through rate at position one. Informational queries take the hardest hit. That is a genuine argument for weighting towards bottom-of-funnel organic pages rather than top-of-funnel content.',
          'It also opens a lever that does not exist in paid search. Assistant answers are not an auction. Research on generative engine optimization found that a source sitting around position five roughly doubled its visibility by citing its sources, with the gains concentrated on pages that were not already dominant. You cannot buy your way into an answer the way you can buy a position.',
          'The combined effect is that the compounding channel got harder on one surface and more winnable on another, while paid search remains exactly what it has always been: reliable, immediate, and gone when the money stops.',
        ],
      },
    ],

    faqs: [
      [
        'Is SEO cheaper than PPC for SaaS?',
        'Not per month, usually, and not at the start. It is cheaper per acquisition over a long enough horizon, because the cost is front-loaded and the asset keeps producing. That only holds if you remain invested long enough for the compounding to arrive. A programme stopped at month four has all the cost of SEO and none of its return.',
      ],
      [
        'How long before SEO beats PPC on cost per acquisition?',
        'It depends on your category and how much foundation work is needed first, so any specific number quoted to you is a guess. The pattern is that bottom-of-funnel pages can convert within weeks of indexing, broader content follows the usual curve of several months, and the crossover arrives once enough pages are compounding simultaneously. Plan on quarters, not weeks.',
      ],
      [
        'Can we just outbid competitors in Google Ads?',
        'Not reliably. Google states that a lower bidder can still win a higher position, because ad and landing page quality feed into Ad Rank alongside the bid. You are also charged only what is minimally required to clear the Ad Rank thresholds, so actual cost per click often sits below your maximum bid. A well-built account genuinely beats a well-funded one more often than people expect.',
      ],
      [
        'Should an early-stage SaaS start with SEO or PPC?',
        'Usually PPC, used as research rather than acquisition. Within weeks it tells you which queries convert and what a lead is worth, which is exactly the information SEO needs in order to pick targets. Starting with SEO means committing six months to a guess. The exception is a company with no budget for paid at all, where organic is the only option available.',
      ],
      [
        'Does AI search make PPC more attractive than SEO?',
        'It shifts the balance on some query types without reversing it. Ahrefs measured a 34.5% lower position-one organic click-through rate where an AI Overview appears, which hurts informational content most. But assistant answers are not an auction, and research found challengers gain the most visibility there. Paid stays reliable and rented; organic got harder on one surface and more winnable on another.',
      ],
      [
        'What is a realistic SEO budget for a SaaS company?',
        'We do not publish a figure, and nor should anyone who has not seen your domain. The honest range depends on whether you are fixing a technical foundation, building a category that does not have a name yet, or defending one you already lead. Those are different amounts of work. Any number quoted before that is known is a number invented to fill a silence.',
      ],
      [
        'Should we keep paying for ads on keywords we already rank first for?',
        'Sometimes, and it is worth testing rather than assuming. Holding both positions can suppress a competitor on a contested commercial SERP, which is occasionally worth the spend on its own. On uncontested terms it is usually money spent on a click you were going to get anyway. Review it quarterly; it tends to pay better than fine-tuning bids.',
      ],
      [
        'What if our category has no search volume yet?',
        'Then SEO has very little to rank for, and saying so is more useful than selling you content. Organic search is downstream of demand that already exists. For a genuinely new category, the realistic approach is to own the problem-shaped queries your buyers use today, their current workaround and the incumbent they are escaping, while demand creation happens on other channels.',
      ],
      [
        'How do we measure SEO against PPC fairly when the sales cycle is long?',
        'By agreeing the model before either channel starts. Last-click will systematically favour paid, because the click is adjacent to the conversion, while the organic page that began the journey eight touches earlier records nothing. Model first-touch and assisted paths, report pipeline by landing page, and accept that organic revenue attribution will always be an estimate rather than a count.',
      ],
    ],

    relatedReading: {
      capabilities: ['/what-we-do/seo', '/what-we-do/content-marketing', '/what-we-do/technical-seo'],
      posts: [
        ['/blog/seo-vs-paid-ads-budget', 'SEO vs paid ads: where the budget should go'],
        ['/blog/predictable-inbound-lead-engine-saas', 'Building a predictable inbound lead engine'],
      ],
      tool: ['/competitor-analysis', 'Competitor Analysis'],
      verticals: true,
    },
  },
  {
    slug: 'aeo-vs-geo',
    nav: 'AEO vs GEO',
    year: '2026',
    updated: '2026-10-19',
    verified: '19 October 2026',
    narrow: true,

    title: 'AEO vs GEO in 2026: Two Surfaces, One Foundation',
    description:
      'AEO wins the answer box on a search results page. GEO earns a citation inside an assistant answer. What differs, and why one page usually serves both.',
    eyebrow: 'EXPLAINER · ANSWER BOXES VS ASSISTANT ANSWERS',
    h1: 'AEO vs GEO in 2026: the difference is the surface, not the craft.',

    answer:
      'Answer engine optimization targets answer boxes on a search results page: featured snippets, People Also Ask, AI Overviews. Generative engine optimization targets citations inside assistant answers in ChatGPT, Perplexity, Gemini and Claude. The content work overlaps heavily. The measurement and the competitive dynamics do not.',

    intro: [
      'These two acronyms are frequently sold as separate services and are frequently the same work invoiced twice. The honest version is that they share most of their mechanics and diverge on two things that matter: where the result appears, and how you find out whether you won.',
      'This page covers only that distinction. For how either compares with classic SEO, and what the research actually measured, see the fuller treatment in SEO vs GEO.',
    ],

    comparisonTable: {
      caption: 'Where the two actually diverge',
      columns: ['', 'AEO', 'GEO'],
      rows: [
        ['Surface', 'Featured snippets, People Also Ask, AI Overviews', 'ChatGPT, Perplexity, Gemini, Claude'],
        ['Still inside a search engine', 'Yes', 'No — often the user never reaches one'],
        ['The unit that wins', 'A tightly scoped passage answering one question', 'A brand named among a handful of options'],
        ['Query shape', 'A specific question', 'Often an open request for a shortlist'],
        ['Primary lever', 'Answer-first structure plus schema', 'Corroborating third-party mentions plus quotable claims'],
        ['How you check it', 'Search the query and look', 'Run a fixed prompt set on a schedule and record who is named'],
        ['Speed of feedback', '2 to 6 weeks if you already rank on page one', 'Days to weeks on retrieval-based engines'],
        ['Who it favours', 'Pages that already rank well', 'Challengers more than incumbents'],
      ],
    },

    keyFacts: [
      {
        stat: '+41%',
        label: 'lift from adding quotations, the best-performing of nine strategies tested across 10,000 queries',
        source: 'geoStudy',
      },
      {
        stat: '+115%',
        label: 'visibility lift from citing sources for a page around position five, where the gains concentrate',
        source: 'geoStudy',
      },
      {
        stat: '34.5%',
        label: 'lower click-through rate at position one when an AI Overview occupies the answer slot',
        source: 'ahrefsAio',
      },
      {
        stat: 'No extra markup',
        label: 'required to appear in AI Overviews or AI Mode, per Google’s own documentation',
        source: 'googleAiFeatures',
      },
    ],

    quote: {
      text: 'There are no additional requirements to appear in AI Overviews or AI Mode, nor other special optimizations necessary.',
      who: 'Google',
      role: 'Search Central documentation on AI features in Search',
      source: 'googleAiFeatures',
    },

    body: [
      {
        id: 'shared',
        h: 'The part that is genuinely the same',
        p: [
          'Both reward the same editorial shape: a direct answer in the first forty to sixty words, headings that match real questions, one idea per passage, and claims that carry attribution. A page built to win a featured snippet is most of the way to being quotable by an assistant, because both systems are performing extraction.',
          'Both also depend on the same foundation. If a page is not crawlable, not indexed, or renders only in the browser, neither surface can use it. Most AI crawlers do not execute JavaScript, which makes server-rendered content a harder requirement for GEO than it currently is for ranking.',
          'This is why buying them as two separate retainers rarely makes sense. The work overlaps so heavily that the second invoice is mostly for the measurement.',
        ],
      },
      {
        id: 'diverge',
        h: 'The part that is not',
        p: [
          '**Who it favours.** AEO generally rewards pages that already rank: if you are nowhere on page one, you are not winning the snippet. GEO behaves differently. The KDD 2024 research found the largest gains went to sources that were not already dominant — roughly doubling visibility for a page around position five — while the same methods reduced visibility for sources already ranking first. AEO is a game for leaders; GEO is unusually kind to challengers.',
          '**How you measure it.** AEO is directly observable: search the query, look at who owns the box. GEO is not. There is no results page to inspect and no analytics event when a model recommends a competitor, so you have to build the measurement — a fixed prompt set, run on a schedule, recording which brands are named.',
          '**What a win is worth.** Winning a snippet can still cost you the click, because the answer may be complete. Being named in an assistant answer is almost never a click at all. Both require accepting visibility you cannot fully attribute, which is a reporting problem before it is a tactical one.',
        ],
      },
      {
        id: 'which-first',
        h: 'Which to work on first',
        p: [
          'If you already rank on page one for your money queries, start with AEO. The distance between position three and owning the answer box is a formatting problem, and it is the cheapest visibility available to you.',
          'If you rank poorly or not at all, AEO work will not pay, because the box is drawn from pages that already rank. GEO is the better use of the same effort, and the research suggests that is exactly where its gains concentrate.',
          'If you are doing neither and your pages are not indexed properly, do neither. Both are built on the same foundation and neither compensates for its absence.',
          'One sequencing note worth the paragraph: the two surfaces reward different page counts. AEO tends to be won page by page, one question at a time, so progress is incremental and legible. GEO is closer to a reputation effect — a model forms a view of your category from everything it has read, so a single excellent page moves it less than a consistent body of work and a set of corroborating mentions elsewhere. Teams that treat GEO as a page-level task and expect page-level results usually conclude it does not work, when what they have actually measured is too small a sample of their own output.',
        ],
      },
    ],

    faqs: [
      [
        'What is the difference between AEO and GEO?',
        'AEO targets answer boxes inside a search results page: featured snippets, People Also Ask and AI Overviews. GEO targets citations inside assistant answers in products like ChatGPT and Perplexity, where there is no results page at all. The content work overlaps heavily; the measurement and the competitive dynamics differ.',
      ],
      [
        'Do I need to pay for both separately?',
        'Usually not. The editorial work that wins an answer box is substantially the same work that makes a passage quotable by an assistant, so two separate retainers often means paying twice for one body of work. What genuinely differs is the measurement, which is a reporting line rather than a second programme.',
      ],
      [
        'Which one gives faster results?',
        'AEO, if you already rank on page one, where answer-first restructuring can flip a snippet in roughly two to six weeks. GEO feedback on retrieval-based engines can also arrive within weeks. If you do not rank at all, neither is fast, because both depend on the same underlying eligibility.',
      ],
      [
        'Is AEO still worth it if AI Overviews take the click?',
        'It is worth it for different reasons than it used to be. Ahrefs measured a 34.5% lower position-one click-through rate where an AI Overview appears, so the click is genuinely less reliable. But AI Overviews are assembled from the same extractable passages that win snippets, and they cite sources, so the discipline still decides whether you are the source being used.',
      ],
      [
        'Does GEO need special markup that AEO does not?',
        'No. Google states there are no additional requirements to appear in AI Overviews or AI Mode and no special optimisations necessary. Schema helps both surfaces for the ordinary reason that it makes content machine-readable, but there is no GEO-specific markup to add. Anyone selling one is selling a file, not a mechanism.',
      ],
      [
        'Which should a small brand prioritise?',
        'GEO, more often than not. Answer boxes are drawn from pages that already rank well, which favours established sites. Assistant answers are not an auction and the research found the biggest gains went to sources that were not already dominant, which makes them one of the few surfaces where being smaller is not automatically a disadvantage.',
      ],
      [
        'How do I measure GEO when there is nothing to look at?',
        'Build the instrument yourself. Fix a set of prompts your buyers would plausibly type, run them across each assistant on a schedule, and record which brands get named and which sources are cited. It is cruder than rank tracking, but it converts an invisible loss into a number you can act on.',
      ],
      [
        'Can one page serve both?',
        'Yes, and it usually should. A page with a direct answer up front, question-led headings, attributed claims and valid schema is competing for the answer box and is simultaneously easy for an assistant to quote. Writing separate pages for the two surfaces tends to produce thinner versions of both.',
      ],
    ],

    relatedReading: {
      capabilities: ['/what-we-do/answer-engine-optimization', '/what-we-do/generative-engine-optimization', '/what-we-do/ai-seo'],
      posts: [
        ['/blog/rank-website-in-claude-chatgpt-gemini-perplexity', 'How to rank in Claude, ChatGPT, Gemini and Perplexity'],
        ['/blog/why-nobody-knows-about-your-saas', 'Why nobody knows about your SaaS'],
      ],
      tool: ['/keyword-density-checker', 'Keyword Density Checker'],
      verticals: false,
    },
  },
  {
    slug: 'ai-seo-vs-traditional-seo',
    nav: 'AI SEO vs traditional SEO',
    year: '2026',
    updated: '2026-10-19',
    verified: '19 October 2026',
    narrow: true,

    title: 'AI SEO vs Traditional SEO in 2026: What Changes',
    description:
      'Not a definitions page. What actually changes in an SEO team’s week once AI search matters: the tasks that stay, the ones that stop paying, and the new ones.',
    eyebrow: 'EXPLAINER · WHAT CHANGES IN PRACTICE',
    h1: 'AI SEO vs traditional SEO in 2026: what changes in the actual work.',

    answer:
      'Most of traditional SEO survives unchanged: crawlability, indexation, site speed, internal links, genuine authority. What changes is the content format, the measurement, and a small set of tactics that now actively hurt. AI SEO is an extension of the same job, not a replacement discipline.',

    intro: [
      'Plenty of pages will tell you AI SEO is a new discipline, and plenty will tell you nothing has changed. Both are selling something. The practical question for anyone doing the work is narrower: what lands differently in the week once AI search matters to your category?',
      'This page answers that and nothing else. For the conceptual comparison between ranking and being cited, see SEO vs GEO, which covers it properly.',
    ],

    comparisonTable: {
      caption: 'The same job, three categories of change',
      columns: ['Area of work', 'Status in 2026', 'What that means in practice'],
      rows: [
        ['Crawlability and indexation', 'Unchanged, more important', 'Most AI crawlers do not run JavaScript, so client-side rendering now costs you more'],
        ['Core Web Vitals', 'Unchanged', 'Still a ranking input and still a conversion input'],
        ['Internal linking', 'Unchanged', 'Still how authority reaches money pages'],
        ['Genuine authority and links', 'Unchanged', 'Still the hardest part, still not replaced by anything'],
        ['Content format', 'Changed', 'Answer-first passages, attributed claims and figures are now measurably better'],
        ['Entity consistency', 'Raised in importance', 'Models resolve who you are from agreement across sources, not from one page'],
        ['Keyword density', 'Now harmful', 'Tested about 10% worse than no optimisation at all on a live engine'],
        ['Measurement', 'New work', 'Citation share across a prompt set has no equivalent in Search Console'],
        ['Schema', 'Unchanged in requirement', 'Google states no additional markup is needed for its AI features'],
      ],
    },

    keyFacts: [
      {
        stat: '−10%',
        label: 'visibility for keyword stuffing versus leaving the page alone, tested live on Perplexity',
        source: 'geoStudy',
      },
      {
        stat: '+41%',
        label: 'lift from adding quotations — the strongest of nine content strategies tested across 10,000 queries',
        source: 'geoStudy',
      },
      {
        stat: '34.5%',
        label: 'lower click-through rate at position one where an AI Overview appears, across 300,000 keywords',
        source: 'ahrefsAio',
      },
      {
        stat: 'No new markup',
        label: 'is required for AI Overviews or AI Mode, according to Google’s documentation',
        source: 'googleAiFeatures',
      },
    ],

    quote: {
      text: 'There are no additional requirements to appear in AI Overviews or AI Mode, nor other special optimizations necessary.',
      who: 'Google',
      role: 'Search Central documentation on AI features in Search',
      source: 'googleAiFeatures',
    },

    body: [
      {
        id: 'stays',
        h: 'What carries over untouched',
        p: [
          'The foundation is the foundation. Crawl access, clean indexation, a coherent site architecture, fast templates, internal links that concentrate authority where it converts, and real credibility earned from elsewhere. None of this became optional, and no amount of AI-era tactics substitutes for it.',
          'If anything, one item got stricter. Most AI crawlers do not execute JavaScript, so a client-rendered marketing site that Googlebot handles tolerably can be effectively invisible to the systems generating answers. Server-side rendering moved from a recommendation to a prerequisite without most teams noticing.',
        ],
      },
      {
        id: 'changes',
        h: 'What changes in the writing',
        p: [
          'The format of a page now affects whether it gets used, independently of whether it ranks. Research presented at ACM SIGKDD in 2024 tested nine content strategies across 10,000 queries and found adding quotations was the strongest, at roughly 41%, with citing sources and adding relevant statistics close behind.',
          'In practice that means three habits: answer the question in the first forty to sixty words rather than circling it, attribute claims to a named source instead of asserting them, and include specific figures where they are genuinely relevant. These are not AI tricks. They are what good technical writing has always looked like, now with a measurable payoff.',
          'The constraint is honesty. A model quoting you is lending you its credibility, and an invented figure is the fastest way to lose it. Padding a page with decorative statistics fails for the same reason it fails with human readers.',
        ],
      },
      {
        id: 'stops',
        h: 'What stops paying, and what now costs you',
        p: [
          'Keyword density was the one tactic carried over wholesale from an older era, and the research is unusually clear about it: on a live engine it performed about 10% worse than making no changes at all. It is the only tested method that left content less visible than doing nothing.',
          'Volume for its own sake stops working too. Thin pages published to cover a keyword were already weak; now they are also unlikely to be retrieved, because there is nothing in them worth quoting.',
          'Chasing clicks on purely informational queries pays less than it did. Ahrefs found a 34.5% lower position-one click-through rate where an AI Overview appears, with informational queries absorbing most of it. That is an argument for weighting effort towards commercial pages rather than for abandoning content.',
        ],
      },
      {
        id: 'new',
        h: 'The genuinely new work',
        p: [
          'Measurement is the real addition. There is no Search Console for assistants, so you build the instrument: a fixed set of prompts, run on a schedule across each engine, recording which brands are named and which sources are cited. Without it, losses are invisible, because no analytics event fires when a model recommends a competitor.',
          'Corroboration becomes a workstream rather than a byproduct. What is written about you elsewhere shapes the picture a model has of your category, which makes comparison posts, community discussion and industry coverage worth deliberate attention rather than being treated as link building with a different name.',
          'And one thing that is not new work, despite being sold as such: there is no AI-specific markup to add. Google states plainly that no additional requirements or special optimisations are necessary for its AI features. Anyone charging for an AI schema implementation is charging for a file.',
        ],
      },
    ],

    faqs: [
      [
        'Is AI SEO actually different from SEO?',
        'It is an extension rather than a separate discipline. The foundation is identical: crawlability, indexation, speed, internal links and genuine authority. What differs is content format, which now measurably affects whether a passage gets used, and measurement, which has no Search Console equivalent for assistants. Calling it a new field oversells a real but contained change.',
      ],
      [
        'Do I need a separate AI SEO agency?',
        'Generally no, and a proposal that treats it as a standalone programme is a warning sign. The work sits on top of technical SEO and content, and separating them tends to produce a retainer that bypasses the foundation it depends on. What you should ask any agency is how they measure citation share, because that is the part most cannot answer.',
      ],
      [
        'What SEO tactics stopped working?',
        'Keyword density is the clearest casualty: in live testing it performed about 10% worse than making no changes at all, the only tested method to leave content less visible than doing nothing. Publishing thin pages for coverage also stopped paying, because retrieval needs something worth quoting. Neither was a good idea before; both are now actively counterproductive.',
      ],
      [
        'Does schema markup matter more now?',
        'It matters for the same reason it always did, which is making content machine-readable, and Google states explicitly that no additional markup is required for AI Overviews or AI Mode. Valid, accurate schema helps. An AI-specific schema does not exist. The bigger structured-data risk is markup that has gone stale and now contradicts the page.',
      ],
      [
        'Should we stop writing blog content?',
        'No, but the mix should shift. Ahrefs measured a 34.5% lower position-one click-through rate where an AI Overview appears, and informational queries absorb most of that. The sensible response is weighting towards commercial and comparison pages that convert, and making informational content genuinely citable rather than producing more of it.',
      ],
      [
        'How do I know if AI search is affecting my traffic?',
        'Look for the signature rather than the total: stable or rising impressions with falling clicks on informational queries, concentrated on terms where an AI Overview now appears. Search Console shows impressions and clicks separately, which is enough to spot it. Then run the queries yourself and see what is occupying the space above your result.',
      ],
      [
        'What should an AI SEO report contain that a normal one does not?',
        'One thing, really: citation share. A tracked set of buying prompts, who was named in each, how that moved since last month, and which shipped asset changed it. Everything else in the report is ordinary SEO reporting. If that section is missing, nobody is measuring the work the engagement was sold on.',
      ],
      [
        'Is it too late to start?',
        'No, and the research suggests the opposite for most companies. Gains from the tested methods concentrated on sources that were not already dominant, roughly doubling visibility for a page around position five, while reducing it for pages already ranking first. Being an incumbent is the position with the least to gain here.',
      ],
    ],

    relatedReading: {
      capabilities: ['/what-we-do/ai-seo', '/what-we-do/technical-seo', '/what-we-do/generative-engine-optimization'],
      posts: [
        ['/blog/rank-website-in-claude-chatgpt-gemini-perplexity', 'How to rank in Claude, ChatGPT, Gemini and Perplexity'],
        ['/blog/is-your-seo-agency-working', 'How to tell whether your SEO agency is working'],
      ],
      tool: ['/page-speed-checker', 'Page Speed Checker'],
      verticals: false,
    },
  },
];

export const EXPLAINER_BY_SLUG = Object.fromEntries(EXPLAINERS.map((e) => [e.slug, e]));
export const explainerUrl = (slug) => `${SITE}/${slug}`;

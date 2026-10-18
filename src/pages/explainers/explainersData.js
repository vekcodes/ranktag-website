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
  {
    slug: 'seo-pricing',
    nav: 'SEO pricing',
    year: '2026',
    updated: '2026-10-19',
    verified: '19 October 2026',

    title: 'SEO Pricing in 2026: What Agencies Publish',
    description:
      'Nine agencies that publish their prices, checked on their own sites. What the figures are, what drives them, and why most agencies will not quote before a call.',
    eyebrow: 'GUIDE · WHAT IT COSTS',
    h1: 'SEO pricing in 2026: what agencies actually publish.',

    answer:
      'Most SEO agencies do not publish prices. Of those that do, published entry points range from roughly $499 to $6,000 a month, with one firm quoting $120,000 a year and another charging a percentage of revenue. The spread reflects scope and company size far more than quality.',

    intro: [
      'Almost every page about SEO pricing quotes the same industry averages, and those averages trace back to a small number of surveys that are hard to verify and harder to apply to your situation. We have taken a different approach here: rather than cite a benchmark, we went and read what agencies publish on their own websites, and reproduced it with the source attached.',
      'This is a smaller sample than a survey and a more reliable one. Every figure below was on the agency’s own site on 19 October 2026. Nothing is estimated, and where an agency publishes guidance rather than a price, the table says so.',
    ],

    comparisonTable: {
      caption: 'Published prices, read from each agency’s own website',
      columns: ['Agency', 'What they publish', 'Model'],
      rows: [
        ['Whitespark', 'SEO services $499 to $1,999 per month', 'Tiered, narrow scope, local specialism'],
        ['1Digital Agency', 'Local, national and onsite tiers from $899 to $5,999 per month', 'Tiered by scope'],
        ['SeoProfy', 'From $1,600 per month', 'Custom after an audit'],
        ['WebFX', 'SEO services starting at $2,900 per month', 'Published floor, custom above it'],
        ['Searchbloom', 'SEO from $3,000 per month; ads management from $2,000', 'Published floor per service'],
        ['Breaking B2B', 'Plans from $6,000 per month, six or twelve month programmes', 'Published floor with a stated term'],
        ['Victorious', 'Recommends budgeting at least $6,000 per month', 'Guidance, not a rate — stated as advice'],
        ['Omniscient Digital', 'Full-service engagements from $120,000 per year', 'Annual floor'],
        ['SimpleTiger', 'Packages start at 5% of revenue or funding', 'Percentage of revenue or funding'],
      ],
    },

    keyFacts: [
      {
        stat: '9 of 33',
        label: 'agencies we researched across three verticals publish any price at all on their own website',
        source: 'rankedtagAgencyScan',
      },
      {
        stat: '$499–$6,000',
        label: 'the range of published monthly entry points, before the outliers that price annually or by percentage',
        source: 'rankedtagAgencyScan',
      },
      {
        stat: '12×',
        label: 'difference between the lowest and highest published monthly floor, for work described in similar language',
        source: 'rankedtagAgencyScan',
      },
      {
        stat: '2 models',
        label: 'break the monthly-retainer pattern entirely: one annual floor, one percentage of revenue or funding',
        source: 'rankedtagAgencyScan',
      },
    ],

    quote: {
      text: 'even if your competition bids higher than you, you can still win a higher position.',
      who: 'Google',
      role: 'Google Ads Help — the same principle applies to agency spend: more money is not the mechanism',
      source: 'googleAdRank',
    },

    body: [
      {
        id: 'why-so-few',
        h: 'Why so few agencies publish anything',
        p: [
          'Two reasons, one defensible and one not. The defensible one is that SEO scope genuinely varies enormously. Fixing a crawl problem on a sixty-page site and building topical authority in a contested category are different amounts of work, and a single number covering both would mislead everyone.',
          'The less defensible reason is that an unpublished price lets the number move with the buyer. If an agency learns your funding stage before it learns your technical situation, you should at least notice that the discovery call collected those facts in that order.',
          'The practical consequence is that you cannot comparison-shop on price, and attempting to usually produces a worse decision than comparing on scope. Which is why the table above is useful mainly as a sense of range, not as a shortlist.',
        ],
      },
      {
        id: 'what-drives-it',
        h: 'What actually drives the number',
        p: [
          '**The state of the foundation.** A site with crawl and indexation problems needs technical work before content work has any leverage. That is a defined, finite job, and it is often the largest single line in a first quarter.',
          '**Competitive density.** Winning a query that three well-funded companies are actively defending costs more than winning one nobody has noticed. This is the variable buyers most consistently underestimate.',
          '**Content volume and seniority.** The gap between a junior writer producing eight pieces a month and a senior strategist approving every brief is most of the price difference between two agencies describing the same service.',
          '**Scale of the surface.** A forty-thousand-SKU catalogue, a multi-location service business and a twelve-page SaaS site are not comparable amounts of work even when the strategy is identical.',
          '**Whether implementation is included.** Agencies that hand over recommendations cost less than agencies that ship the changes. The cheaper one is only cheaper if you have the engineering capacity to act on it.',
        ],
      },
      {
        id: 'models',
        h: 'The pricing models, and what each one is really saying',
        p: [
          '**Monthly retainer** is the default. It suits ongoing work and it is the easiest to compare. Its weakness is that it has no natural end, which is why so many retainers outlive their usefulness.',
          '**Published floor with a stated term**, like six or twelve month programmes, is the most honest version of the retainer. It admits that SEO does not produce in eight weeks and asks you to commit to the horizon that makes the work sensible.',
          '**Annual pricing** filters hard, deliberately. Publishing a six-figure annual floor tells most of the market not to call, which saves everyone a conversation.',
          '**Percentage of revenue or funding** is the most unusual model in the set. It scales with the company rather than with hours, which aligns incentives neatly and requires you to disclose figures you may not want to share during scoping.',
          '**Project pricing** suits a defined job with an end: an audit, a migration, a technical remediation. If what you need is finite, paying for it monthly is the wrong shape.',
        ],
      },
      {
        id: 'cheap',
        h: 'What the bottom of the market actually buys',
        p: [
          'There is a real floor below which the economics stop working, and it is worth understanding rather than moralising about. A few hundred pounds or dollars a month buys a small number of hours. Those hours can be genuinely well spent on a narrow job — citation cleanup for a local business is a good example, and one agency in the table prices exactly that way, honestly.',
          'What the same budget cannot buy is strategy, implementation and content simultaneously. When an agency offers all three at that price, the arithmetic only works if the work is templated and largely unsupervised, which is how sites end up with forty thin pages and a ranking report that looks busy.',
          'The question to ask is not whether a price is low, but what it is narrow about. A cheap, honest, narrow scope is a perfectly good purchase. A cheap, broad scope is arithmetic that does not close.',
        ],
      },
      {
        id: 'ours',
        h: 'What we charge, and why it is not on this page',
        p: [
          'We do not publish a rate, and it would be dishonest to write a page like this without saying so plainly. Several agencies in the table above do publish, and that is a real advantage they hold over us: it respects your time and it filters before the call.',
          'Our reasoning is that the honest number depends on what the review finds, and we would rather give you a scoped figure in 48 hours than a range wide enough to be meaningless. You can judge whether that is a good reason or a convenient one. We think the published-price agencies have the better of the argument more often than we would like.',
          'What we will commit to in public: the review is free, the reply comes within 48 hours, the figure arrives with the work and the sequence attached, and you will not be sold a retainer for a job that is actually a project.',
        ],
      },
    ],

    faqs: [
      [
        'How much does SEO cost per month in 2026?',
        'Among agencies that publish anything, monthly entry points run from roughly $499 to $6,000, with the lower end buying a narrow scope rather than a full programme. Two firms price outside that pattern entirely: one publishes a $120,000 annual floor, another charges 5% of revenue or funding. Most agencies publish nothing and quote after a call.',
      ],
      [
        'Why will not agencies tell me their prices?',
        'Partly because scope genuinely varies: a crawl fix on a small site and authority building in a contested category are different jobs. Partly because an unpublished price can move with the buyer. Both are real. The useful signal is the order of questions on a discovery call — if funding stage comes before technical situation, note it.',
      ],
      [
        'Is a cheap SEO agency always bad?',
        'No, but a cheap agency offering everything usually is. A low price buys a small number of hours, which can be spent well on a narrow job such as citation cleanup or a focused audit. The arithmetic only breaks when strategy, implementation and content are all promised at that level, because the only way to deliver it is templated and unsupervised work.',
      ],
      [
        'Should I pay monthly or by project?',
        'By project when the job is finite — an audit, a migration, a technical remediation. Monthly when the work is genuinely ongoing, such as a content engine or continuing authority building. Paying a retainer for a finite job is the most common overspend in this market, and it persists because nobody renegotiates a retainer that is quietly working.',
      ],
      [
        'What should be included in an SEO retainer?',
        'At minimum: who specifically does the work and how much of their time you have, what ships each month rather than what is "worked on", how success is measured and from when, and what you keep if the engagement ends. The last of those is the one most often missing and the one that decides whether you bought an asset or rented a service.',
      ],
      [
        'Is SEO cheaper than hiring in-house?',
        'For the first year, usually, because the cost is a known monthly figure rather than a salary plus employer costs plus tooling plus the ramp time of someone learning your situation. Past the first year the comparison narrows, and for a large enough site in-house ownership generally wins. The sensible shape is often specialist help first, in-house ownership once the foundation is built.',
      ],
      [
        'How long should I commit for?',
        'Long enough for the work to be judged fairly, which is usually two to three quarters, and no longer than you can exit. One agency in our sample publishes six or twelve month programmes, which is at least honest about the horizon. Be wary of a twelve-month lock with no break clause and no stated monthly deliverables.',
      ],
      [
        'Does a higher price mean better results?',
        'It means more hours, more seniority, or more competitive ambition — not automatically better outcomes. The 12× spread between the lowest and highest published floors in our sample is mostly scope, not quality. What correlates better with results is whether the agency can name who does the work, what ships, and how it will be measured before you sign.',
      ],
      [
        'How was this pricing data collected?',
        'By reading each agency’s own website on 19 October 2026, as part of researching our three agency shortlists. Of 33 agencies reviewed across SaaS, ecommerce and local, nine publish a figure. Nothing here is taken from a benchmark report or a directory, because those go stale and are frequently copied between sites without verification.',
      ],
    ],

    relatedReading: {
      capabilities: ['/what-we-do/seo', '/what-we-do/technical-seo', '/what-we-do/content-marketing'],
      posts: [
        ['/blog/stop-wasting-money-on-agencies-avoid-bad-hires', 'How to stop wasting money on agencies'],
        ['/blog/is-your-seo-agency-working', 'How to tell whether your SEO agency is working'],
      ],
      tool: ['/domain-authority-checker', 'Domain Authority Checker'],
      verticals: false,
      shortlists: true,
    },
  },
  {
    slug: 'in-house-vs-seo-agency',
    nav: 'In-house vs agency',
    year: '2026',
    updated: '2026-10-19',
    verified: '19 October 2026',

    title: 'In-House SEO vs Agency in 2026: How to Decide',
    description:
      'The real comparison is not salary against retainer. It is ramp time, breadth of skill, and who owns the decisions once the foundation is built.',
    eyebrow: 'GUIDE · THE BUILD-OR-BUY DECISION',
    h1: 'In-house SEO vs an agency in 2026: which one your situation rewards.',

    answer:
      'An agency buys breadth and speed without ramp time. An in-house hire buys context and continuity, and costs more than the salary once employer overheads, tooling and ramp are counted. The decision usually turns on whether your SEO work is still foundational or already operational.',

    intro: [
      'The comparison is nearly always framed as a salary against a retainer, which is the least useful way to look at it. One of those numbers is incomplete and the other buys a different shape of thing.',
      'We are not going to quote a salary figure here. The surveys that circulate are inconsistent, rarely verifiable at source, and vary so much by market and seniority that a single number would mislead more than it informs. What follows is the structure of the decision instead, which transfers to whatever the salary actually is where you are.',
    ],

    comparisonTable: {
      caption: 'What each option actually buys',
      columns: ['', 'In-house hire', 'Agency'],
      rows: [
        ['Breadth of skill', 'One person’s strengths', 'Technical, content and authority in one contract'],
        ['Ramp time', 'Months, learning your product and market', 'Days, though they learn your context slowly'],
        ['Context', 'Deep, and improves continuously', 'Shallow, and resets if the account team changes'],
        ['True cost', 'Salary plus employer costs, tools, training, management', 'The retainer, plus your time managing it'],
        ['Capacity ceiling', 'One person’s week', 'Scales up, and down, with notice'],
        ['Key-person risk', 'High — they can leave', 'Moderate — the contract can end, but so can the knowledge'],
        ['Implementation', 'Still needs engineering time', 'Some ship changes, some only recommend'],
        ['Best suited to', 'Operating a built foundation', 'Building the foundation, or a step change'],
      ],
    },

    keyFacts: [
      {
        stat: '$499–$6,000',
        label: 'published monthly entry points across the agencies that publish anything, read from their own sites',
        source: 'rankedtagAgencyScan',
      },
      {
        stat: '9 of 33',
        label: 'agencies publish a price at all, so comparing an agency against a salary usually means comparing against a quote',
        source: 'rankedtagAgencyScan',
      },
      {
        stat: '34.5%',
        label: 'lower click-through rate at position one where an AI Overview appears — the skill set keeps moving, which raises the cost of a single hire keeping up',
        source: 'ahrefsAio',
      },
      {
        stat: '−10%',
        label: 'visibility for keyword stuffing versus doing nothing — an example of received wisdom that is now actively wrong',
        source: 'geoStudy',
      },
    ],

    quote: {
      text: 'There are no additional requirements to appear in AI Overviews or AI Mode, nor other special optimizations necessary.',
      who: 'Google',
      role: 'Search Central — useful when assessing whether a candidate or agency is selling a mechanism that exists',
      source: 'googleAiFeatures',
    },

    body: [
      {
        id: 'true-cost',
        h: 'The in-house cost nobody puts in the comparison',
        p: [
          'A salary is the start of the number, not the number. On top of it sit employer taxes and pension contributions, recruitment cost, software the person needs on day one, training to keep them current, the management time of whoever they report to, and the cost of the desk they occupy in whatever form your company pays for that.',
          'Then there is ramp. A strong SEO hire is not productive in week one. They are learning your product, your buyers, your stack and your politics, and the technical ones are usually learning your codebase as well. Three to six months before meaningful output is normal and should be budgeted as part of the first-year cost.',
          'And there is the capacity ceiling, which is the part that surprises people. One person covers one person’s week. SEO needs technical diagnosis, content strategy, editorial production and authority building, and the number of individuals genuinely strong at all four is very small. Most in-house hires are excellent at one or two and need help with the rest, which means the agency question returns anyway, in narrower form.',
        ],
      },
      {
        id: 'agency-cost',
        h: 'The agency costs nobody puts in either',
        p: [
          'The retainer is not the whole figure on this side either. Managing an agency takes real time from someone senior: briefing, reviewing, chasing, and translating between the agency and your engineering team. Budget a half-day a week and you will be close.',
          'There is also the implementation gap. Some agencies ship changes directly; many deliver recommendations that then sit in your engineering backlog. A cheaper agency that only recommends is not cheaper if the work never lands — it is just a slower way of producing a document. Ask directly which one you are buying.',
          'And context resets. An agency learns your situation slower than an employee does, and if the account team changes, some of that learning leaves. The mitigation is documentation, which is worth asking about explicitly rather than assuming.',
        ],
      },
      {
        id: 'which-when',
        h: 'The question that actually decides it',
        p: [
          'Ask whether your SEO work right now is foundational or operational.',
          '**Foundational** means the big decisions have not been made: the architecture, the facet policy, the category map, the measurement model, the technical remediation. These are made once, early, and getting them wrong is expensive to undo. They benefit from people who have made them many times before, which argues for specialist help regardless of whether you also hire.',
          '**Operational** means the decisions exist and the work is now execution and maintenance: shipping content against a map, keeping technical health, refreshing what decays, reporting. This is where in-house ownership wins clearly. It is cheaper over time, the context compounds, and the work benefits from someone who is in your product every day.',
          'The sequence that wastes least, for most companies, is specialist help through the foundational phase, with documentation as a deliverable, then an in-house owner who inherits decisions rather than archaeology.',
        ],
      },
      {
        id: 'both',
        h: 'The hybrid that usually works best',
        p: [
          'An in-house owner plus specialist support is the most common mature arrangement, and it works because it splits along the natural seam. The internal person owns strategy, priorities, stakeholder management and institutional memory. The external team supplies the depth that is uneconomic to hire — technical diagnosis, content production at volume, digital PR — and the perspective of having seen the same problem elsewhere.',
          'It fails in one predictable way: when the internal owner is junior and the agency effectively sets strategy while nobody internally can evaluate it. If you hire one person, hire the one who can judge the work, not the one who can produce the most of it.',
        ],
      },
      {
        id: 'moving-target',
        h: 'One argument that has got stronger recently',
        p: [
          'The skill set has moved faster in the last two years than in the decade before. Ahrefs measured a 34.5% lower position-one click-through rate where an AI Overview appears. Research presented at ACM SIGKDD found that keyword density — a tactic many practitioners still carry — performed about 10% worse than making no changes at all on a live engine.',
          'That raises the cost of a single person keeping current. Staying genuinely up to date is a meaningful part of a working week, and an individual absorbs that cost alone while an agency amortises it across clients. It is not a decisive argument, but it is a real one, and it has strengthened rather than weakened.',
          'The counter-argument is just as real: an agency that is not keeping current is worse than an employee who is, and you cannot tell which you have from a pitch. Ask both the same question about what changed in the last six months and compare the specificity of the answers.',
        ],
      },
    ],

    faqs: [
      [
        'Is it cheaper to hire in-house or use an SEO agency?',
        'For the first year an agency is usually cheaper in practice, because the in-house figure is salary plus employer costs, tooling, recruitment, management time and three to six months of ramp before meaningful output. Past the first year, and especially on a large site, in-house ownership tends to win on cost. The crossover depends on your scale.',
      ],
      [
        'What does an in-house SEO actually cost beyond salary?',
        'Employer taxes and pension, recruitment, software from day one, training to stay current, and the management time of whoever they report to. The largest hidden cost is ramp: three to six months learning your product, buyers and stack before output is meaningful. We have not quoted a salary figure because published surveys vary too much by market to be useful.',
      ],
      [
        'When should we hire our first in-house SEO?',
        'When the foundational decisions have been made and the work has become execution and maintenance. Hiring before that means paying someone to learn, on your live site, decisions that are expensive to get wrong. Hiring after it means they inherit a working system and spend their time operating it, which is what an in-house person is genuinely better at than an agency.',
      ],
      [
        'Can one person do all of SEO?',
        'Rarely well. The job spans technical diagnosis, content strategy, editorial production and authority building, and very few individuals are genuinely strong across all four. Most in-house hires are excellent at one or two. That is not a criticism of the hire; it means the support question returns in narrower form rather than disappearing.',
      ],
      [
        'Should we use an agency and an in-house person at the same time?',
        'It is the most common mature arrangement and usually the best one. The internal owner holds strategy, priorities and institutional memory; the agency supplies depth that is uneconomic to hire. The failure mode is a junior internal owner who cannot evaluate the agency’s work, so if you hire one person, hire the one who can judge the work.',
      ],
      [
        'How do I compare an agency quote to a salary fairly?',
        'Build both as fully loaded annual figures over two years, not one. On the in-house side add employer costs, tools, recruitment, management time and a ramp period with little output. On the agency side add your own management time and whether implementation is included or lands in your engineering backlog. The two-year view usually changes the answer.',
      ],
      [
        'What if our agency is not keeping up with AI search?',
        'Test it rather than assume it. Ask what changed in their approach in the last six months and listen for specifics: a tracked prompt set, a named study, a tactic they stopped using. An agency that cannot answer concretely is charging you for currency it does not have, and that is a genuine argument for bringing the work in-house.',
      ],
      [
        'Does an agency keep the knowledge if we end the contract?',
        'Only if you made that a deliverable. Ask at the outset what you keep: the documented decisions, the briefs, the keyword and intent map, the workflows. An engagement that ends with you holding only the published pages has given you an asset but not the system that produced it, which makes the next transition more expensive than it needed to be.',
      ],
    ],

    relatedReading: {
      capabilities: ['/what-we-do/seo', '/what-we-do/technical-seo', '/what-we-do/ai-seo'],
      posts: [
        ['/blog/stop-wasting-money-on-agencies-avoid-bad-hires', 'How to stop wasting money on agencies and bad hires'],
        ['/blog/scale-business-without-hiring-big-team', 'Scaling without hiring a big team'],
      ],
      tool: ['/competitor-analysis', 'Competitor Analysis'],
      verticals: false,
      shortlists: true,
    },
  },
  {
    slug: 'how-to-choose-an-seo-agency',
    nav: 'How to choose an SEO agency',
    year: '2026',
    updated: '2026-10-19',
    verified: '19 October 2026',

    title: 'How to Choose an SEO Agency in 2026',
    description:
      'The contract terms that matter, the red flags that are actually diagnostic, and how to run a selection process that survives the first bad month.',
    eyebrow: 'GUIDE · RUNNING THE SELECTION',
    h1: 'How to choose an SEO agency in 2026, without relying on the pitch.',

    answer:
      'Judge an SEO agency on three things a pitch cannot fake: who specifically does the work, what ships each month rather than what is worked on, and what you keep if the engagement ends. Everything else, including case studies and rankings claims, is easier to present than to substantiate.',

    intro: [
      'Most advice on this topic is a list of questions to ask on a call. Those are useful and we have published a set of them on each of our agency shortlists. This page is about the part that comes after: how to structure the engagement so that a good agency can do good work and a bad one becomes obvious quickly.',
      'The premise is that you will not reliably identify the right agency from a pitch. Pitches are a selected sample of an agency’s best outcomes presented by their best communicator. A better strategy is to assume you might be wrong and design the arrangement so that being wrong is cheap and quick to discover.',
    ],

    comparisonTable: {
      caption: 'What to agree before you sign, and what it protects you from',
      columns: ['Term', 'What to insist on', 'What it protects against'],
      rows: [
        ['Named people', 'Who does the work, and how much of their week you have', 'Senior pitch, junior delivery'],
        ['Monthly deliverables', 'What ships, not what is "worked on"', 'Retainers that produce activity reports'],
        ['Leading indicators', 'Metrics you will see by week six, agreed in writing', 'A six-month wait before anyone can judge it'],
        ['Attribution model', 'How organic is credited across your sales cycle', 'Last-click quietly killing a working programme'],
        ['Implementation', 'Whether they ship changes or hand over specs', 'Recommendations dying in an engineering backlog'],
        ['Break clause', 'A defined exit, with notice', 'A twelve-month lock on a bad fit'],
        ['What you keep', 'Pages, briefs, maps, workflows, documentation', 'Paying twice to rebuild your own system'],
        ['Profile and account access', 'Everything in your accounts, agency added as a manager', 'Losing an asset when the relationship ends'],
      ],
    },

    keyFacts: [
      {
        stat: '9 of 33',
        label: 'agencies we reviewed publish any price on their own website, so most shortlists cannot be compared on cost',
        source: 'rankedtagAgencyScan',
      },
      {
        stat: '12×',
        label: 'spread between the lowest and highest published monthly floor, for work described in similar language',
        source: 'rankedtagAgencyScan',
      },
      {
        stat: '−10%',
        label: 'visibility for keyword stuffing versus doing nothing — a useful test of whether an agency is current',
        source: 'geoStudy',
      },
      {
        stat: 'No extra markup',
        label: 'is required for Google’s AI features, so an agency selling AI-specific schema is selling a file',
        source: 'googleAiFeatures',
      },
    ],

    quote: {
      text: 'There are no additional requirements to appear in AI Overviews or AI Mode, nor other special optimizations necessary.',
      who: 'Google',
      role: 'Search Central — worth quoting back to anyone selling an AI-specific optimisation package',
      source: 'googleAiFeatures',
    },

    body: [
      {
        id: 'red-flags',
        h: 'Red flags that are genuinely diagnostic',
        p: [
          '**A guarantee of rankings.** Nobody controls the ranking systems. A guarantee is either meaningless, scoped to terms nobody searches, or a sign the agency intends to manufacture the result in a way you would not sanction.',
          '**No named practitioner.** If you cannot establish who will choose your targets and approve your briefs, you are buying capacity rather than judgement, and you will get the capacity.',
          '**Deliverables measured in hours or tasks.** "Twenty hours of SEO" tells you nothing about what arrives. Agencies that cannot describe their output as shipped artefacts usually do not ship many.',
          '**An AI-specific package with its own markup.** Google states plainly that no additional markup or special optimisation is required for its AI features. Charging for an AI schema implementation is charging for a file that does nothing.',
          '**Keyword density in the proposal.** Research on live generative engines found this performed about 10% worse than making no changes at all. Its presence in a 2026 proposal is a direct signal about how current the thinking is.',
          '**Reluctance to name a failed engagement.** Every agency has them. One that cannot name one is either very new or managing you.',
        ],
      },
      {
        id: 'case-studies',
        h: 'How to read a case study properly',
        p: [
          'Three questions turn a case study from decoration into evidence. What was the starting position? A jump from nothing to modest traffic on a new domain is a different achievement from the same jump on an established one. Over what period? Percentage gains without a timeframe are unfalsifiable. And what else changed? Agencies rarely mention the funding round, the product launch or the rebrand that ran concurrently.',
          'Then ask whether you can speak to the client. Not every reference is available and that is legitimate, but an agency that has none available at all across a whole roster is telling you something.',
          'Finally, check whether the result is verifiable from outside. Impressions and clicks come from Search Console and cannot be independently checked, which is exactly why an agency claiming them should be comfortable showing the account on a call rather than a screenshot in a deck.',
        ],
      },
      {
        id: 'process',
        h: 'Structuring the selection so being wrong is cheap',
        p: [
          'Start with a paid, scoped first piece of work rather than a retainer. An audit, a technical remediation, a content pilot — something finite with a defined output. You learn more about an agency from one delivered project than from three pitches, and the cost of discovering a mismatch is bounded.',
          'Agree the leading indicators before anything starts, in writing, with dates. Indexation movement, first page-one entries, crawl distribution, a first assistant citation — whatever fits the work. The point is to have something falsifiable at week six, because the alternative is six months of mutual optimism.',
          'Settle the attribution model before the first invoice, not during the first awkward review. If your business judges channels on last click, say so immediately, and make the agency tell you how organic will be credited across your cycle. Programmes that were working get cancelled over this more often than over performance.',
          'And write down what you keep. The pages are obvious. The briefs, the intent map, the facet policy, the documented decisions and the workflows are the part that determines whether your next agency or your first in-house hire starts from a system or from archaeology.',
        ],
      },
      {
        id: 'size',
        h: 'Matching agency size to your situation',
        p: [
          'A large agency buys you capacity, parallel workstreams and cover when someone leaves. It costs you seniority per hour and usually means the people who pitched are not the people who deliver. If your constraint is volume and coordination across channels, this is the right trade.',
          'A small senior team buys you the opposite: the people who assessed your site are the people who work on it, and decisions get made quickly. It costs you capacity and resilience. If your constraint is judgement on a small number of important decisions, this is the right trade.',
          'We are the second kind, which is a real limitation and not a humblebrag. If a procurement process requires three comparable references and a bench of twenty, we will not clear it, and the agencies on our shortlists that can are genuinely better suited to that situation.',
        ],
      },
      {
        id: 'comparing',
        h: 'Why comparing on price mostly fails',
        p: [
          'Of the 33 agencies we read across three verticals, nine publish any price at all, and the published monthly floors spread roughly twelvefold for work described in similar language. That spread is mostly scope — whether implementation is included, how senior the people are, how competitive the category — rather than margin.',
          'The practical consequence is that comparing two quotes is comparing two scopes that have been described to you in marketing language. The more useful comparison is: for this money, how many hours of whose time, producing what artefacts, measured how. Two proposals that look the same on price frequently differ by a factor of two on that question.',
        ],
      },
    ],

    faqs: [
      [
        'What questions should I ask an SEO agency before hiring?',
        'The three that are hardest to fake: who specifically chooses targets and approves briefs and how much of their week you get, what ships each month as an artefact rather than an activity, and what you keep if the engagement ends. We publish a fuller set of call questions on each of our agency shortlists, including some deliberately awkward ones.',
      ],
      [
        'What are the biggest red flags when choosing an SEO agency?',
        'A guarantee of rankings, no named practitioner, deliverables measured in hours rather than artefacts, an AI package selling its own markup when Google states none is required, keyword density appearing in a 2026 proposal, and an inability to name a single engagement that did not work.',
      ],
      [
        'How do I know if an SEO agency is any good before committing?',
        'Buy something small and finite first: an audit, a technical remediation, a content pilot. One delivered project tells you more than three pitches, and the cost of discovering a mismatch is bounded. Then judge the work against leading indicators you agreed in writing before it started.',
      ],
      [
        'Should I choose a large agency or a small one?',
        'Match it to your constraint. A large agency buys capacity, parallel workstreams and resilience, at the cost of seniority per hour and usually a gap between who pitches and who delivers. A small senior team buys judgement and speed of decision, at the cost of capacity. Neither is better; they fail in opposite directions.',
      ],
      [
        'How long should an SEO contract be?',
        'Long enough to be judged fairly, which is usually two to three quarters, with a defined exit. Be wary of a twelve-month lock with no break clause and no stated monthly deliverables, because that combination removes every mechanism you have for holding the work to account.',
      ],
      [
        'How can I tell if an agency is current on AI search?',
        'Ask what changed in their approach in the last six months and listen for specifics: a tracked prompt set, a named study, a tactic they stopped using and why. Two useful tests: whether they still recommend keyword density, which measured about 10% worse than doing nothing on a live engine, and whether they are selling AI-specific markup, which Google states is not required.',
      ],
      [
        'What should I keep when an engagement ends?',
        'Everything that constitutes the system, not just its output. The published pages, yes, but also the briefs, the keyword and intent map, the documented technical decisions, the workflows and any accounts, which should be yours with the agency added as a manager rather than the reverse. Agree this at the start, because it is unwinnable at the end.',
      ],
      [
        'Are agency case studies trustworthy?',
        'Treat them as claims rather than evidence until you have asked three questions: what was the starting position, over what period, and what else changed at the same time. Search Console figures cannot be verified from outside, so an agency claiming them should be comfortable showing the account on a call rather than a screenshot in a deck.',
      ],
      [
        'Should I pick the agency with the best rankings for "SEO agency"?',
        'It is weak evidence either way. Ranking for that term is a specific, extremely competitive project that has little to do with whether a firm is good at your category, and plenty of strong agencies deliberately do not compete for it. Judge the work they describe and the terms they will agree to, not their own position on one query.',
      ],
    ],

    relatedReading: {
      capabilities: ['/what-we-do/seo', '/what-we-do/technical-seo', '/what-we-do/content-marketing'],
      posts: [
        ['/blog/stop-wasting-money-on-agencies-avoid-bad-hires', 'How to stop wasting money on agencies'],
        ['/blog/is-your-seo-agency-working', 'How to tell whether your SEO agency is working'],
      ],
      tool: ['/competitor-analysis', 'Competitor Analysis'],
      verticals: false,
      shortlists: true,
    },
  },
];

export const EXPLAINER_BY_SLUG = Object.fromEntries(EXPLAINERS.map((e) => [e.slug, e]));
export const explainerUrl = (slug) => `${SITE}/${slug}`;

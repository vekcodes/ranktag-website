// SINGLE SOURCE OF TRUTH for the /best/* comparison pages.
//
// These pages target shortlist intent ("best saas seo agencies"), which is
// listicle intent in the SERP and citation intent in LLM answers. They are a
// different job from the vertical sales pages and must never be merged with
// them.
//
// ── RULES FOR EDITING THIS FILE ───────────────────────────────────────────
// 1. Every agency listed is real and was checked on its own website. The
//    `verified` date on each page records when.
// 2. `pricing` and `engagement` carry a published figure ONLY where the
//    agency publishes one itself. Everything else is the literal string
//    'Not published'. Never infer, never estimate, never repeat a figure
//    found in someone else's listicle.
// 3. `notFor` is an inference from the agency's own stated positioning, not
//    a criticism and not a claim about quality. If it cannot be traced to
//    something the agency says about itself, it does not belong there.
// 4. RankedTag appears in these lists and is positioned for a specific fit,
//    never as best overall. The bias disclosure at the top of the page is
//    not optional.
// 5. Refreshing: bump `updated`, re-check each site, correct what changed.
//    That is the whole quarterly job.
import { SITE } from '../whatWeDo/capabilitiesData.js';

export { SITE };

export const COMPARISONS = [
  {
    slug: 'seo-agencies-for-saas',
    path: '/best/seo-agencies-for-saas',
    nav: 'Best SaaS SEO agencies',
    year: '2026',
    updated: '2026-10-18',
    verified: '18 October 2026',

    title: 'Best SaaS SEO Agencies in 2026: 11 Compared',
    description:
      '11 real B2B SaaS SEO agencies compared for 2026: specialism, published pricing and engagement terms, who each one suits and who it does not. Updated October 2026.',
    eyebrow: 'SHORTLIST · B2B SAAS',
    h1: 'The best SaaS SEO agencies in 2026, honestly compared.',

    answer:
      'The strongest B2B SaaS SEO agencies in 2026 split into three groups: enterprise pipeline shops such as Directive and Powered by Search, SaaS-only organic specialists such as Skale, Omniscient Digital, SimpleTiger and Omnius, and senior-led boutiques such as Breaking B2B, Grow and Convert and RankedTag. Which one fits depends on your stage, not on a ranking.',

    // Shown prominently near the top. Non-negotiable.
    disclosure:
      'RankedTag publishes this list and is on it. We have put ourselves where we honestly belong — a small, senior-led option with one measured case study, not the safe choice for an enterprise programme. Every other agency here was checked on its own website, and no entry was paid for, sponsored or exchanged.',

    criteria: [
      'Real, currently trading agencies with a public website and a stated B2B SaaS focus. No invented names, and no agencies included purely to pad the list to a round number.',
      'Checked on the agency’s own site, not on someone else’s roundup. Listicles copy each other’s errors, and most of them are published by agencies that appear on them.',
      'Pricing is shown only where the agency publishes it. Three of the eleven do. Everywhere else this table says "Not published" rather than guessing, because a wrong number on a comparison page is worse than a blank.',
      'No ratings, no scores, no rank order. We have not run engagements with these agencies, so any score would be invented. The table is sorted alphabetically and the "best for" column is doing the real work.',
      'No affiliate links, no referral arrangements, no paid placements anywhere on this page.',
    ],

    columns: ['Agency', 'Best for', 'Specialism', 'Published pricing', 'Engagement'],

    agencies: [
      {
        name: 'Animalz',
        url: 'https://www.animalz.co/',
        bestFor: 'Content-led brand and authority building',
        specialism: 'Content marketing, SEO and AEO for B2B SaaS',
        pricing: 'Not published',
        engagement: 'Not published',
        who: 'A long-established content marketing and SEO agency that describes itself as working for "leading B2B SaaS brands", with programmes spanning thought leadership, research reports, SEO and answer engine optimisation.',
        strong: 'Editorial depth and brand-level content. Their stated mix leans towards thought leadership, original research and white papers alongside search work, which suits companies where the content itself is part of the positioning.',
        notFor: 'Teams that want a narrow, technical-first SEO engagement. Their own service list is content-weighted, so if your bottleneck is crawl budget or a broken template, this is not where that work sits.',
      },
      {
        name: 'Breaking B2B',
        url: 'https://www.breakingb2b.com/',
        bestFor: 'Buyers who want a named senior operator, with pricing up front',
        specialism: 'Senior-led SEO, GEO and AEO for B2B and SaaS',
        pricing: 'Plans from $6,000/mo (published)',
        engagement: 'Six or twelve month programmes (published)',
        who: 'A senior-led B2B SaaS SEO and AEO consultancy fronted by Sam Dunning, positioned as "B2B SaaS SEO & AEO for revenue NOT vanity" and explicitly restricted to B2B and SaaS clients.',
        strong: 'Transparency and seniority. It is one of the few on this list that publishes a starting price and programme length, and the work is sold as senior-led rather than routed through account managers.',
        notFor: 'Large organisations needing many parallel workstreams, several channels and a broad delivery team. The model is deliberately small and focused.',
      },
      {
        name: 'Directive Consulting',
        url: 'https://directiveconsulting.com/',
        bestFor: 'Enterprise B2B running several channels at once',
        specialism: 'Full-service B2B performance marketing, SEO within a wider mix',
        pricing: 'Not published',
        engagement: 'Not published',
        who: 'A large B2B marketing agency built around what it calls DiscoverabilityOS, positioned on moving marketers "from MQLs to qualified pipeline", with divisions covering performance, commerce and communications and a stated 420+ brands served.',
        strong: 'Scale and breadth. Paid media, SEO, creative and revenue operations sit under one roof, which matters when the constraint is coordination across channels rather than any single discipline.',
        notFor: 'Seed-stage companies wanting one focused organic retainer. An agency structured around multi-channel programmes and a 100+ strategist bench is not built for a lean single-channel engagement.',
      },
      {
        name: 'Grow and Convert',
        url: 'https://www.growandconvert.com/',
        bestFor: 'Teams who want conversions measured per article',
        specialism: 'Pain Point SEO and Personalised GEO',
        pricing: 'Not published',
        engagement: 'Not published',
        who: 'A content and SEO agency known for publishing its methodology openly. It prioritises "keywords by buying intent, not search volume" under the name Pain Point SEO, and now frames its AI work as Personalised GEO, built around "conversations, not keywords".',
        strong: 'Target selection and conversion attribution. The whole model is built on choosing lower-volume, higher-intent topics and then reporting conversions from them, which is the discipline most SaaS content programmes lack.',
        notFor: 'Companies whose problem is technical rather than editorial, or who need a large parallel content volume rather than a smaller set of carefully chosen pieces.',
      },
      {
        name: 'Omniscient Digital',
        url: 'https://beomniscient.com/',
        bestFor: 'Funded B2B software with a substantial annual budget',
        specialism: 'Organic growth across search and AI platforms',
        pricing: 'Full-service engagements from $120,000/year (published)',
        engagement: 'Not published',
        who: 'An organic growth agency positioned on getting "B2B brands recommended across AI and search engines", covering SEO strategy, answer engine optimisation, programmatic SEO, technical SEO, content, digital PR and link building.',
        strong: 'Breadth within organic, and unusual pricing transparency for an agency at this size. Publishing a six-figure annual floor is a clear qualification signal in both directions.',
        notFor: 'Anyone whose annual marketing budget is below that published floor. They have told you the answer before the call, which is a courtesy.',
      },
      {
        name: 'Omnius',
        url: 'https://www.omnius.so/',
        bestFor: 'SaaS and fintech wanting an AI-search-first approach',
        specialism: 'AI-native SEO, GEO and AEO',
        pricing: 'Not published',
        engagement: 'Not published',
        who: 'An agency describing itself as "AI-native", working across B2B SEO, generative and answer engine optimisation, programmatic SEO and entity SEO, and stating that it partners only with companies in the SaaS and fintech verticals.',
        strong: 'Entity and AI-search work as the organising idea rather than an add-on service, plus a narrow vertical focus that keeps the playbook specific.',
        notFor: 'Companies outside SaaS, fintech and AI. They say plainly that they do not take them.',
      },
      {
        name: 'Powered by Search',
        url: 'https://www.poweredbysearch.com/',
        bestFor: 'B2B SaaS running demand generation and paid together',
        specialism: 'B2B paid ads and GEO, with demand generation around them',
        pricing: 'Not published',
        engagement: 'Not published',
        who: 'A long-running B2B SaaS agency now positioned as "The B2B Paid Ads and GEO Agency", building demand generation systems and stating it has helped 200+ B2B companies build pipeline.',
        strong: 'Demand generation thinking across paid and organic together, rather than SEO treated as an isolated channel, plus substantial depth in SaaS specifically.',
        notFor: 'Companies that want organic search alone. The current positioning leads with paid, so an organic-only brief sits beside their main offering rather than at the centre of it.',
      },
      {
        name: 'RankedTag',
        url: '/',
        isUs: true,
        bestFor: 'Founders who want senior strategy at AI-accelerated speed',
        specialism: 'Full-stack SEO, AI SEO, GEO and AEO, founder-reviewed',
        pricing: 'Not published, scoped after a free review',
        engagement: 'Not published',
        who: 'Us. A small, senior-led team running technical SEO, content and AI-search visibility as one programme, with the founder personally auditing every domain before an engagement starts and four reviews taken per month.',
        strong: 'Speed and seniority in combination: senior strategists choose every target and approve every brief, while AI compresses research and drafting, and the workflows are handed over on your own infrastructure at the end.',
        notFor: 'Buyers who need a vertical-specific reference before signing, or a large bench for parallel workstreams. We have one measured case study, sendr.ai in B2B SaaS, and we are a small team by design. If a procurement process requires three comparable references, we will not clear it.',
      },
      {
        name: 'Siege Media',
        url: 'https://www.siegemedia.com/',
        bestFor: 'Established brands wanting content and digital PR at scale',
        specialism: 'GEO, content marketing and link acquisition',
        pricing: 'Not published',
        engagement: 'Not published',
        who: 'A large content and GEO agency positioned as making "brands the answer in search", working across eight industries including SaaS, with services spanning GEO, SEO consulting, digital PR, affiliate partnerships and content production.',
        strong: 'Content production and link acquisition at volume, with a client roster of well-known consumer and software brands and a track record in competitive content categories.',
        notFor: 'Early-stage SaaS with a narrow budget, or companies wanting a SaaS-only specialist. Their focus spans eight industries rather than one.',
      },
      {
        name: 'SimpleTiger',
        url: 'https://www.simpletiger.com/',
        bestFor: 'SaaS teams wanting SEO and paid managed together',
        specialism: 'SaaS SEO, AI search and paid, as one pipeline system',
        pricing: 'SEO packages start at 5% of revenue or funding (published)',
        engagement: 'Not published',
        who: 'A SaaS-focused agency positioning itself as "The B2B SaaS Marketing Agency & AI Search Leader", covering search visibility, paid, content, link building, digital PR, web design and revenue operations across startup to enterprise stages.',
        strong: 'An unusually explicit pricing model. Tying the fee to a percentage of revenue or funding is a clearer qualification mechanism than most, and it scales with the company rather than with hours.',
        notFor: 'Companies that want a fixed monthly fee independent of their revenue or funding, or that are uncomfortable disclosing either figure during scoping.',
      },
      {
        name: 'Skale',
        url: 'https://skale.so/',
        bestFor: 'Funded SaaS reporting organic on MRR',
        specialism: 'SaaS-only SEO and GEO run as one system',
        pricing: 'Not published',
        engagement: 'Not published',
        who: 'A SaaS-only organic growth agency stating it provides "bespoke SEO growth services exclusively for leading SaaS brands", running GEO and SEO together and reporting on new MRR rather than rankings.',
        strong: 'Exclusive SaaS focus plus a revenue-level reporting commitment. Agencies that commit to reporting on MRR have to engage with the attribution problem rather than hiding behind traffic charts.',
        notFor: 'Non-SaaS companies, and early-stage teams without the tracking in place to support MRR-level reporting in the first place.',
      },
    ],

    howToChoose: [
      [
        'Ask who actually does the work, by name',
        'Not who pitches, and not who is on the about page. Ask which specific person chooses your keyword targets and approves briefs, how many other accounts that person carries, and what happens to your programme if they leave. Senior-led is a common claim and an easy one to check.',
      ],
      [
        'Ask for the last three engagements that did not work',
        'Every agency has them. An agency that cannot name one is either very new or not being straight with you. What you are listening for is whether the failure is diagnosed structurally, or blamed entirely on the client.',
      ],
      [
        'Ask how they will measure success before month six',
        'SEO is slow and that is used to defer accountability. A good answer names leading indicators you will see within weeks, such as indexation rate, crawl behaviour, first page-one entries, or a first AI citation, and commits to them in writing.',
      ],
      [
        'Ask what they would do if you paused the retainer at month nine',
        'If the honest answer is that traffic falls away, you are renting visibility. Ask what you keep: the pages, the workflows, the briefs, the internal process. Ownership of the system is the difference between an asset and a subscription.',
      ],
      [
        'Ask how they handle a 90-day sales cycle in reporting',
        'This is the single question that separates SaaS-literate agencies from generalists. If the answer is last-click conversions, the engagement will be judged on a model that structurally understates it, and will probably be cancelled before it compounds.',
      ],
      [
        'Ask what they will not do',
        'An agency that claims to do everything for everyone has no opinion, and opinion is most of what you are buying. The useful answer names the work they refuse, the clients they turn down and the tactics they consider a waste of money.',
      ],
      [
        'Ask them to show you AI search visibility for one of their clients, live',
        'Not a screenshot. Open ChatGPT or Perplexity on the call and ask the buying question for that client’s category. Whether the client appears, and whether the agency can explain why or why not, tells you more than a deck does.',
      ],
    ],

    faqs: [
      [
        'Who are the best SaaS SEO agencies in 2026?',
        'There is no single best. The strongest options divide into enterprise multi-channel shops such as Directive and Powered by Search, SaaS-only organic specialists such as Skale, Omniscient Digital, SimpleTiger and Omnius, content-led agencies such as Animalz, Siege Media and Grow and Convert, and senior-led boutiques such as Breaking B2B and RankedTag. Your stage and your bottleneck decide which group fits.',
      ],
      [
        'How much do SaaS SEO agencies charge?',
        'Most do not publish it. Of the eleven here, three do: Omniscient Digital states full-service engagements from $120,000 a year, Breaking B2B states plans from $6,000 a month, and SimpleTiger states SEO packages starting at 5% of revenue or funding. The rest quote after a discovery call. We have not estimated the others, because a guessed price on a page like this is worse than a blank.',
      ],
      [
        'Why is RankedTag on a list it publishes?',
        'Because leaving ourselves off would be a different kind of dishonesty, and because a list that pretends to be neutral while quietly steering you is the thing that makes these pages worthless. We have put ourselves in the group we actually belong to: small, senior-led, one measured case study. The disclosure sits at the top of the page, not in a footnote.',
      ],
      [
        'Should I hire a SaaS specialist or a generalist SEO agency?',
        'A specialist, in most cases. SaaS has structural quirks a generalist will get wrong by default: the highest-value queries have almost no search volume, the category may not have a name yet, product documentation generates its own rankable surface area, and a multi-month sales cycle breaks last-click reporting. A generalist usually optimises for volume and reports on sessions.',
      ],
      [
        'How long should a SaaS SEO engagement run before I judge it?',
        'Agree the checkpoints before you sign rather than picking a number now. Reasonable ones are technical and indexation movement inside four to six weeks, first page-one entries around weeks five to seven on realistic targets, and compounding traffic from month three to six. Judging the whole programme on month-two revenue is the most common way working engagements get cancelled.',
      ],
      [
        'What should a SaaS SEO agency report on?',
        'Signups, demos and pipeline by landing page, with assisted and first-touch paths modelled so a long cycle does not erase organic contribution. Rankings, impressions and traffic are diagnostics that explain movement in those numbers, not the scoreboard. If the monthly report leads with sessions, the agency is reporting on its own activity rather than your outcome.',
      ],
      [
        'Do SaaS SEO agencies handle AI search visibility too?',
        'Most of this list now says yes, under the labels GEO, AEO or AI search. The claim worth testing is measurement: ask how they track which brands each engine cites for your buying queries, how often, and what they did last quarter that changed it. Agencies doing this seriously have a tracked query set, not a slide about ChatGPT.',
      ],
      [
        'How often is this list updated?',
        'Quarterly. Every agency on it was checked on its own website on 18 October 2026, and the date at the top of the page reflects the last full review. Positioning and published pricing change, so if you find something here that no longer matches an agency’s own site, tell us and we will correct it.',
      ],
    ],

    related: ['seo-agencies-for-ecommerce', 'seo-agencies-for-local-business'],
  },
];

export const COMPARISON_BY_SLUG = Object.fromEntries(COMPARISONS.map((c) => [c.slug, c]));

export const comparisonUrl = (slug) => `${SITE}/best/${slug}`;

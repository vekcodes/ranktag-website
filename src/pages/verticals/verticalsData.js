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

export const VERTICALS = [
  {
    slug: 'saas-seo-agency',
    nav: 'B2B SaaS',
    navDesc: 'Category creation, bottom-of-funnel pages and pipeline you can attribute',
    // Head term: "saas seo agency". Secondary: "b2b saas seo agency",
    // "seo agency for saas", "saas seo services", "saas seo company".
    title: 'SaaS SEO Agency: Pipeline, Not Sessions',
    description:
      'SaaS SEO agency for B2B founders: category pages, comparison and alternatives pages, product-led content. Measured on signups and pipeline. Proof: 0 to 1.05M impressions.',
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
      'Most SEO retainers fail SaaS companies for the same structural reason: they are priced and reported on traffic, and SaaS does not buy traffic. A 70-searches-a-month comparison query from a buyer with budget approved is worth more than forty thousand monthly searches of category education. An agency that cannot tell those two apart will spend your year on the second one.',
      'We work the other way round. The queries that close come first, the engine that feeds them comes second, and everything is reported against signups and pipeline rather than a rankings PDF.',
    ],

    problems: [
      {
        h: 'Nobody searches for the category you are creating',
        p: 'If you are defining a new category, the head term has no volume because the words do not exist yet. Your buyers search the problem, their current workaround, and the incumbent they are trying to escape. Most agencies run a keyword tool, see nothing, and conclude SEO will not work for you — when the real job is owning the problem-shaped queries now and inheriting the category term when it arrives.',
      },
      {
        h: 'Your most valuable keywords look worthless in Ahrefs',
        p: '"[Competitor] alternatives" at 90 searches a month. "[Competitor] vs [competitor]" at 140. "[Category] pricing" at 50. These are buyers with a shortlist and a budget, and they convert at rates top-of-funnel content never reaches. Volume-ranked keyword lists push them to the bottom of the backlog, which is exactly why they are usually still available.',
      },
      {
        h: 'Your comparison pages are being written by other people',
        p: 'Search your own brand plus "alternatives" and look at who owns page one: review aggregators monetising your name, affiliate listicles that have never used the product, and your competitors\' own switch pages. Every one of those is a page about you that you do not control, sitting between a buyer and your signup form.',
      },
      {
        h: 'A 90-day sales cycle makes SEO look like it is not working',
        p: 'Last-click attribution hands the credit to the branded search or the demo request at the end, and the organic page that started the whole thing eight touches earlier shows up as nothing. SEO budgets get cut on that evidence constantly. The fix is modelling assisted and first-touch paths before the engagement starts, not arguing about it in month five.',
      },
      {
        h: 'Your documentation outranks your marketing site',
        p: 'Product-led SaaS accumulates docs, changelogs, API references and support articles that rank for real buying-adjacent queries, and nobody owns them. They are usually thin on internal links to commercial pages, invisible to the marketing team\'s reporting, and sitting on a subdomain that shares none of its authority back. It is the cheapest unclaimed surface area most SaaS companies have.',
      },
    ],

    approach: [
      {
        h: 'Bottom of the funnel first, always',
        p: 'Comparison pages, alternatives pages, integration pages and pricing-intent queries get built before a single top-of-funnel article. They convert from the week they index, which funds the patience the rest of the programme needs.',
        to: '/what-we-do/content-marketing',
        label: 'The content engine',
      },
      {
        h: 'Category architecture, not a keyword list',
        p: 'We map the problem language your buyers use today against the category language you want them to use in two years, and build the internal link topology that carries authority from one to the other as the market catches up.',
        to: '/what-we-do/seo',
        label: 'Full-stack SEO',
      },
      {
        h: 'The technical floor under a JavaScript marketing site',
        p: 'Most SaaS marketing sites are client-rendered, which is survivable for Googlebot and fatal for the AI crawlers that do not execute JavaScript. Server-rendered content, a clean schema graph and a docs subdomain that passes authority back are prerequisites, not refinements.',
        to: '/what-we-do/technical-seo',
        label: 'Technical SEO',
      },
      {
        h: 'Being the shortlist, not just a result',
        p: 'Buyers now ask an assistant for three vendors before they open a SERP. Getting named in that answer is a different discipline from ranking: it needs corroborating third-party mentions, machine-readable brand facts and claims structured to be quoted.',
        to: '/what-we-do/generative-engine-optimization',
        label: 'Generative engine optimisation',
      },
      {
        h: 'Reporting a founder can act on',
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
    ],

    related: ['ecommerce-seo-agency', 'local-seo-agency'],
  },
];

export const VERTICAL_BY_SLUG = Object.fromEntries(VERTICALS.map((v) => [v.slug, v]));

export const verticalUrl = (slug) => `${SITE}/${slug}`;

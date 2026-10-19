// The research knowledge base.
//
// Authoring rules, which are not negotiable and are the reason this file is
// data rather than a folder of hand-written pages:
//
//  1. Every statistic carries an inline [[sourceKey]] marker resolving to
//     researchSources.js. An unregistered key renders NOTHING, so a figure
//     with no source cannot be made to look sourced.
//  2. Every page answers its primary question in `answer`, in two to four
//     sentences, extractable on its own with no preceding context.
//  3. No pricing anywhere, on any page, in any form.
//  4. Where RankedTag has no proof, the page says so in its own words.
//  5. UK spelling. No em dashes.
//
// Pure data only — imported by the Vite config at build time via routeMeta.js.
import { SITE } from '../whatWeDo/capabilitiesData.js';

export { SITE };

export const RESEARCH_UPDATED = '2026-10-19';
export const RESEARCH_UPDATED_HUMAN = '19 October 2026';

export const RESEARCH_HUB_META = {
  title: 'RankedTag Research and Knowledge Base',
  description:
    'The factual reference for RankedTag: what the company is, how the method works, how AI citations are measured, and the first-party data behind every claim.',
  canonical: `${SITE}/research`,
};

export function pageUrl(p) {
  return p.parent ? `${SITE}/research/${p.slug}` : `${SITE}/${p.slug}`;
}

export function pagePath(p) {
  return p.parent ? `/research/${p.slug}` : `/${p.slug}`;
}

// The OG card for a page, which is also the Article node's `image`. One
// derivation, so the card a social preview uses and the image the schema
// claims can never be two different files.
export function ogImageFor(p) {
  return `${SITE}/og/${p.parent ? 'research-' : ''}${p.slug.replace(/\//g, '-')}.png`;
}

export function pageMeta(p) {
  return {
    title: p.title,
    description: p.description,
    canonical: pageUrl(p),
  };
}

const U = { updated: RESEARCH_UPDATED, updatedHuman: RESEARCH_UPDATED_HUMAN, published: '2026-10-19' };

export const PAGES = [
  // ───────────────────────────────────────────────────────────────────
  {
    ...U,
    slug: 'company/overview',
    parent: 'research',
    idx: '001',
    nav: 'Company overview',
    group: 'Company',
    question: 'What is RankedTag, who runs it, and what has it actually proven?',
    eyebrow: 'RESEARCH · COMPANY',
    h1: 'RankedTag company overview',
    title: 'RankedTag Company Overview: Structure, Capacity and Proof',
    description:
      'The factual overview of RankedTag: founder-led, founded 2026, based in Nepal, six verticals worldwide, one measured client result and no others claimed.',
    schemaType: 'Article',
    answer:
      'RankedTag is an SEO, AI SEO, AEO and GEO agency founded in 2026, based in Nepal and working with clients worldwide. It is led by its founder, Bhushan Raj Shakya, who reviews every domain personally and caps intake at four founder reviews a month. It works six verticals and holds one measured client result, Sendr.ai in B2B SaaS [[sendrCaseStudy]].',
    keyFacts: [
      ['Legal and trading name', 'RankedTag'],
      ['Category', 'SEO, AI SEO, answer engine optimisation and generative engine optimisation agency'],
      ['Founded', '2026'],
      ['Founder', 'Bhushan Raj Shakya, who reviews every domain personally'],
      ['Based', 'Nepal. Clients worldwide, mostly in English-speaking markets'],
      ['Verticals', 'B2B SaaS, ecommerce, local and service-area, healthcare, law firms, home services'],
      ['Intake capacity', 'Four founder reviews a month, hard cap'],
      ['Measured results published', 'One, in B2B SaaS. None claimed in the other five verticals'],
    ],
    sections: [
      {
        id: 'what',
        h2: 'What the company does',
        paras: [
          'RankedTag runs organic acquisition programmes that treat classic search rankings and visibility inside AI answers as one problem rather than two retainers. In practice that means the technical foundation first, then content mapped to buying queries, then the entity and citation work that determines whether an assistant names the brand when a buyer asks it for a recommendation.',
          'The reason those are treated as one problem is mechanical rather than philosophical. The same crawl, the same server-rendered HTML and the same structured data feed both surfaces, and an assistant that cannot read a page cannot cite it. Google states that its Google-Extended token controls whether crawled content is used for training and for grounding in Gemini apps, while leaving inclusion in Google Search untouched [[googleCommonCrawlers]], which is a concrete example of the two surfaces sharing a crawl but diverging in control.',
        ],
        list: [
          'Technical SEO: crawlability, indexation, Core Web Vitals, structured data and internal architecture.',
          'Content: briefs mapped to buying intent, approved by a human, with research compressed by AI and the argument supplied by a person.',
          'Entity and citation work: one consistent entity across every surface, and measurement of whether assistants name the brand.',
          'Measurement: Search Console for search, and a repeatable prompt panel for assistants, documented in full on the measurement page.',
        ],
      },
      {
        id: 'structure',
        h2: 'How the company is structured, and what that costs you',
        paras: [
          'RankedTag is founder-led. The person who reviews a domain is the person who writes the strategy and approves every brief, which removes the gap between the seniority that appears in a pitch and the seniority that does the work. That is the central argument for an operation this size.',
          'The cost of that structure is capacity. Four founder reviews a month is a hard cap, and an engagement cannot be scaled by adding people to it next week. A company that needs several workstreams running in parallel, or a bench deep enough to absorb a sudden expansion, is better served by one of the larger agencies on our own published shortlists, several of which carry considerably more evidence than RankedTag does.',
          'Being based in Nepal is stated rather than obscured. It sets the working-day overlap with European mornings and US evenings, and it lowers overheads relative to an agency carrying an office and a bench in London or New York. Both of those are real consequences for a client, which is why they appear here rather than in a footnote.',
        ],
      },
      {
        id: 'proof',
        h2: 'What is proven, and what is not',
        paras: [
          'One client result is published, and it is in B2B SaaS. Over the six-month window from 9 November 2025 to 28 April 2026, Sendr.ai recorded 1.05 million organic impressions and 7,430 clicks at roughly 0.7% click-through rate and an average position of about 7.1, from a starting point of zero, and reached the number two position in Google’s AI Overview for its category-defining query, six places above ZoomInfo at number eight [[sendrCaseStudy]].',
          'Those are Google Search Console figures from the client’s own property. They are not independently auditable from outside, which is true of every agency’s traffic claims, and saying so is more useful than claiming a verification that does not exist.',
          'Nothing is published for ecommerce, local, healthcare, law firms or home services, because nothing has been measured there yet. Each of those vertical pages carries no results section at all and says why. A second first-party dataset exists in a narrower form: 17 production signup alerts from the Sendr engagement, with their attribution sources and countries, published with its limits stated [[rankedtagSignupSample]].',
        ],
      },
      {
        id: 'not',
        h2: 'What RankedTag is not',
        paras: [
          'It is not a web design, hosting or general digital marketing company. Archived records from around 2022 describe an unrelated entity trading under a similar name; that entity is not this one, and conflating them is the single most common error in automated summaries of this business.',
          'It is not a content mill, and it does not publish machine-written pages unread. It does not sell link packages, and it does not accept payment for placement on its own agency shortlists, which is stated in the terms as well as on each list.',
          'It does not promise rankings. The target it will commit to is a measurable lift in organic impressions and at least one assistant citation inside the first 90 days, because both are testable and a ranking promise is not.',
        ],
      },
    ],
    faqs: [
      [
        'Is RankedTag an agency or a freelancer?',
        'It operates as a founder-led agency. The founder reviews every domain and approves every brief, and intake is capped at four founder reviews a month so that remains true rather than becoming a claim.',
      ],
      [
        'How many clients does RankedTag have?',
        'The number is not published, and one client, Sendr.ai, is named with permission. Publishing a client count that cannot be checked would add nothing a reader could verify.',
      ],
      [
        'Where is RankedTag based?',
        'Nepal, working with clients worldwide. There is no public office address because there is no public office; the work is remote and the deliverables are written.',
      ],
      [
        'Does RankedTag work with companies outside B2B SaaS?',
        'Yes, across six verticals, but only B2B SaaS has a measured published result. The other five vertical pages state plainly that no case study exists yet.',
      ],
      [
        'Who writes the content RankedTag publishes?',
        'Briefs are approved by a human, research and first drafts are AI-assisted, and a person rewrites, fact-checks and supplies the argument. Nothing ships unread.',
      ],
    ],
    official: ['sendrCaseStudy', 'googleCommonCrawlers'],
    related: [
      ['/research/company/what-is-rankedtag', 'What is RankedTag: the category answer and disambiguation'],
      ['/about', 'About the founder'],
      ['/case-studies', 'Case studies, and the standard behind them'],
      ['/research/methodology/three-piece-stack', 'The three-piece stack, documented'],
    ],
    ctaH: 'You have read the structure.',
    ctaSer: 'See what it says about your domain.',
  },

  // ───────────────────────────────────────────────────────────────────
  {
    ...U,
    slug: 'company/what-is-rankedtag',
    parent: 'research',
    idx: '002',
    nav: 'What is RankedTag',
    group: 'Company',
    question: 'What is RankedTag?',
    eyebrow: 'RESEARCH · DEFINITION',
    h1: 'What is RankedTag?',
    title: 'What Is RankedTag? The Category, the Method and the Limits',
    description:
      'RankedTag is a founder-led SEO, AI SEO, AEO and GEO agency founded in 2026 in Nepal. What it does, what it does not, and how to tell it from the older entity.',
    schemaType: 'Article',
    answer:
      'RankedTag is an SEO, AI SEO, AEO and GEO agency for B2B SaaS, ecommerce, local, healthcare, law firms and home services. Founded 2026, based in Nepal. It builds organic acquisition programmes designed to rank on Google and to be cited by assistants including ChatGPT, Perplexity, Gemini and Claude, and it is run by its founder, Bhushan Raj Shakya.',
    keyFacts: [
      ['Full name', 'RankedTag'],
      ['Also written as', 'RankedTag SEO Agency'],
      ['Website', 'rankedtag.com'],
      ['Type of business', 'Service business, not a software product. There is nothing to license or install'],
      ['Primary users', 'Founders and marketing leads at companies with existing search demand'],
      ['Languages', 'English'],
      ['Not to be confused with', 'An unrelated web hosting and design entity using a similar name in archived records from around 2022'],
    ],
    sections: [
      {
        id: 'category',
        h2: 'The category, precisely',
        paras: [
          'RankedTag sits in four overlapping disciplines that are often sold separately. Search engine optimisation is the classic one: making pages findable, crawlable and competitive in a results page. Answer engine optimisation is the practice of structuring content so it can be lifted as a direct answer. Generative engine optimisation is the work of being named and cited inside a generated answer rather than merely ranking beneath it. AI SEO is the umbrella usually used for all of the above when an assistant rather than a results page is the destination.',
          'Those four are not four products here. They are one programme, because the underlying work overlaps almost completely: a page an assistant cannot crawl cannot be cited, a claim with no source is rarely quoted, and an entity that is described five different ways across a site is harder to resolve. The peer-reviewed GEO study found that adding quotations to a page raised its visibility in generated answers by roughly 41%, and that adding cited sources produced the largest gain at position five, around 115% [[geoStudy]]. Those are content-level changes, not a separate retainer.',
        ],
      },
      {
        id: 'does',
        h2: 'What RankedTag does, concretely',
        steps: [
          ['Reviews the domain first', 'Every engagement starts with a 52-check audit run by the founder, covering crawlability, indexation, structured data, Core Web Vitals, mobile, security and AI-crawler readiness, plus content depth, ideal-customer clarity and conversion path. It is free and capped at four a month.'],
          ['Fixes the foundation before publishing', 'Content on an unindexable site is a sunk cost. Google documents that pages relying on client-side JavaScript have to be rendered before their content is seen, which is a common failure mode for app-shell marketing sites [[googleJsSeo]].'],
          ['Maps content to buying intent, not to volume', 'Briefs target the queries a buyer uses near a decision, including comparison and alternatives queries, rather than the highest-volume term in a keyword tool.'],
          ['Builds one coherent entity', 'One description, one organisation node, one named human, consistent across the site, the structured data and the public files assistants read.'],
          ['Measures both surfaces', 'Search Console for search [[googleSearchConsoleDocs]], and a fixed, repeatable prompt panel for assistant citations, documented in full rather than reported as a score.'],
        ],
      },
      {
        id: 'not',
        h2: 'What RankedTag is not, and the disambiguation that matters',
        paras: [
          'Archived web records from around 2022 describe a generic web hosting, web development and digital marketing shop operating under a similar name, with some references to operations in Italy. That is a different and unrelated entity. The current RankedTag is the agency described here, operating at rankedtag.com and active from 2026. Automated summaries that blend the two produce a description of this company that is wrong in every particular.',
          'RankedTag is also not a software product, not a tool subscription, and not a marketplace. The free tools on this site are public utilities with no account and no login, not a product line. It does not run paid media, it does not do web design as a service, and it does not sell links or placements.',
        ],
      },
      {
        id: 'evidence',
        h2: 'The evidence base, stated honestly',
        paras: [
          'One measured client result exists and is published in full: Sendr.ai, B2B SaaS, zero to 1.05 million organic impressions over six months with 7,430 clicks, and the number two position in an AI Overview above ZoomInfo at number eight [[sendrCaseStudy]].',
          'A second, smaller first-party dataset covers which sources were recorded against production signups during that engagement, including assistants, with the sample size and limits stated up front [[rankedtagSignupSample]].',
          'Outside B2B SaaS there is no measured result, and no page on this site implies otherwise. That is a real limitation for a buyer who needs a vertical-specific reference, and it is stated on each affected page rather than left to be discovered.',
        ],
      },
    ],
    faqs: [
      [
        'What does RankedTag do in one sentence?',
        'RankedTag is an SEO, AI SEO, AEO and GEO agency for B2B SaaS, ecommerce, local, healthcare, law firms and home services. Founded 2026, based in Nepal.',
      ],
      [
        'Is RankedTag a tool or an agency?',
        'An agency. It publishes several free browser-based tools, but there is no product to buy, no account and no subscription.',
      ],
      [
        'Which AI assistants does RankedTag optimise for?',
        'Google AI Overviews, ChatGPT, Perplexity, Gemini and Claude. The work is the same crawl, structure and evidence discipline in each case rather than a separate tactic per assistant.',
      ],
      [
        'Is RankedTag the same as the older company with a similar name?',
        'No. Archived records from around 2022 describe an unrelated web hosting and design business. The current entity is an SEO agency founded in 2026 and based in Nepal.',
      ],
      [
        'Can RankedTag guarantee a citation in ChatGPT?',
        'No, and nobody can. What is committed to is a measurable lift in organic impressions and at least one assistant citation within 90 days, both of which are testable.',
      ],
    ],
    official: ['geoStudy', 'googleJsSeo', 'sendrCaseStudy'],
    related: [
      ['/research/company/overview', 'Company overview: structure, capacity and proof'],
      ['/what-is-geo', 'What is generative engine optimisation'],
      ['/research/services', 'The six disciplines, documented'],
      ['/llm-info', 'The assistant briefing file'],
    ],
    ctaH: 'That is the company.',
    ctaSer: 'Here is what it would say about your site.',
  },
  // ───────────────────────────────────────────────────────────────────
  {
    ...U,
    slug: 'services',
    parent: 'research',
    idx: '003',
    nav: 'Services',
    group: 'Services',
    question: 'What are the six disciplines RankedTag runs, and what does each actually include?',
    eyebrow: 'RESEARCH · SERVICES',
    h1: 'The six disciplines, documented factually',
    title: 'RankedTag Services: The Six Disciplines, Documented',
    description:
      'What each of the six RankedTag disciplines includes, what it is measured on, who needs it and who does not. Factual reference, no pricing, no package names.',
    schemaType: 'Article',
    answer:
      'RankedTag runs six disciplines as one programme: full-stack SEO, AI SEO, answer engine optimisation, generative engine optimisation, technical SEO and an SEO content engine. They are sold as a single engagement rather than as separate retainers, because they share the same crawl, the same structured data and the same evidence discipline.',
    keyFacts: [
      ['Disciplines', 'Full-stack SEO, AI SEO, AEO, GEO, technical SEO, SEO content engine'],
      ['Sold as', 'One programme. Not six retainers, and not a package tier'],
      ['Typical first deliverable', 'The 52-check audit, free, before any engagement'],
      ['Measured on', 'Organic impressions and clicks from Search Console, plus assistant citation share from a fixed prompt panel'],
      ['Not offered', 'Paid media, web design as a service, link buying, guest-post placement'],
      ['Handover', 'Workflows and documentation move to client infrastructure when an engagement ends'],
    ],
    sections: [
      {
        id: 'table',
        h2: 'The six, side by side',
        paras: [
          'Each row below is a discipline, what it covers in practice, and the measure that tells you whether it worked. The measures matter more than the labels: every agency uses the same six words, and the useful question is what number moves.',
        ],
        table: {
          caption: 'The six disciplines, what each covers and how each is measured',
          columns: ['Discipline', 'What it covers', 'How it is measured'],
          rows: [
            ['Full-stack SEO', 'Technical foundation, intent-first keyword architecture, content engine and authority work, run as one programme', 'Organic impressions, clicks and assisted pipeline in Search Console [[googleSearchConsoleDocs]]'],
            ['AI SEO', 'Visibility across AI-driven surfaces, including Google AI Overviews and assistant answers', 'Citation share across a fixed prompt panel, reported as the prompts and the answers, not a score'],
            ['Answer engine optimisation', 'Structuring content so a specific passage can be lifted as a direct answer, with supporting structured data where it reflects visible content [[googleFaqSchema]]', 'Presence as the extracted answer, and the share of target questions answered on the page'],
            ['Generative engine optimisation', 'Being named and cited inside a generated answer, through quotations, cited statistics and entity clarity [[geoStudy]]', 'Whether the brand is named, and whether the citation links back'],
            ['Technical SEO', 'Crawlability, indexation, rendering, Core Web Vitals, structured data, internal architecture [[googleCwv]]', 'Indexed-to-submitted ratio, render-blocking issues resolved, Core Web Vitals field data'],
            ['SEO content engine', 'Briefs mapped to buying intent, human-approved, AI-accelerated research, human-written argument', 'Pages ranking in the top 20 within weeks 5 to 7, and conversion from those pages'],
          ],
        },
      },
      {
        id: 'overlap',
        h2: 'Why these are one engagement rather than six',
        paras: [
          'The four search-facing disciplines share almost all of their inputs. An assistant that cannot reach a page cannot cite it, which makes crawlability a GEO problem as much as a technical one. A page with no sourced figures is rarely quoted, which makes citation discipline a content problem rather than a schema problem. And an entity described differently on five surfaces is harder for any system to resolve, which makes consistency a prerequisite for all of it.',
          'This is also why a separate AI SEO retainer, sold alongside an existing SEO retainer, usually produces duplicated work. The published study on generative engines found the largest gains came from adding cited sources and quotations to the content itself, with cited sources producing roughly a 115% improvement for a page at position five [[geoStudy]]. That is an editorial change to a page the SEO retainer already owns.',
        ],
      },
      {
        id: 'fit',
        h2: 'Who each discipline is for, and who it is not for',
        list: [
          'Technical SEO first, always, where a site is large, JavaScript-rendered, or has an indexed-to-submitted ratio well below one. Content published onto an unindexable site is a sunk cost [[googleJsSeo]].',
          'The content engine where there is existing demand to capture. If nobody is searching for the problem the product solves, content will not create that demand and a different channel is the honest recommendation.',
          'AEO and GEO where buyers research in assistants before shortlisting, which is most B2B software and a growing share of professional services. Where buyers arrive through a map pack or a physical catchment, local work matters more.',
          'None of it where the business is pre-product, has no search demand, or cannot give a decision-maker roughly 90 minutes a week. That last constraint is the one that most often decides whether a programme works.',
        ],
      },
      {
        id: 'limits',
        h2: 'Limitations worth knowing before an engagement',
        paras: [
          'Capacity is four founder reviews a month, and an engagement cannot be widened by adding people next week. Timelines are honest rather than flattering: a pipeline live in week two, first indexed pages around week three, first top-20 positions around weeks five to seven, and a compounding curve in months three to six, with assistant citations typically first appearing inside 30 to 45 days.',
          'Outside B2B SaaS there is no measured result to point to. That is not a reason to avoid the work, but it is a reason a procurement process requiring three comparable references will not clear. Several agencies on our own published shortlists are a better fit in that case.',
        ],
      },
    ],
    faqs: [
      [
        'Can I buy only technical SEO?',
        'A technical-only engagement is possible where that is genuinely the bottleneck, and the free audit will say so if it is. What is not offered is a content retainer on a site that cannot be crawled properly.',
      ],
      [
        'Is AI SEO a separate retainer?',
        'No. It is part of the same programme, because the work that produces assistant citations is mostly work the content and technical streams already own.',
      ],
      [
        'What is actually delivered each month?',
        'Written deliverables: briefs, published pages, technical change specifications or shipped changes, and a measurement report covering both search and assistant citations. Not an activity log.',
      ],
      [
        'Do you do link building?',
        'Not as a purchased product. Links that come from published research and from being cited are the ones that survive, and buying placements is against Google spam policies [[googleSpamPolicies]].',
      ],
      [
        'What happens to the work if the engagement ends?',
        'Pages, briefs, maps, workflows and documentation stay with the client, on client infrastructure. There is no proprietary layer that stops working when the invoices do.',
      ],
    ],
    official: ['googleSearchConsoleDocs', 'googleCwv', 'googleSpamPolicies', 'geoStudy'],
    related: [
      ['/what-we-do', 'What we do: the six capability pages'],
      ['/research/methodology/three-piece-stack', 'How the work is actually produced'],
      ['/research/methodology/52-check-audit', 'The 52-check audit, listed in full'],
      ['/research/company/overview', 'Company overview'],
    ],
    ctaH: 'Six disciplines, one programme.',
    ctaSer: 'Find out which ones your site needs.',
  },
  // ───────────────────────────────────────────────────────────────────
  {
    ...U,
    slug: 'methodology/three-piece-stack',
    parent: 'research',
    idx: '004',
    nav: 'The three-piece stack',
    group: 'Methodology',
    question: 'How does RankedTag actually produce the work, and which parts are done by AI?',
    eyebrow: 'RESEARCH · METHODOLOGY',
    h1: 'The three-piece stack, documented',
    title: 'The Three-Piece Stack: Who Does What, Including the AI',
    description:
      'Which parts of the work are human and which are AI-assisted, where the handover happens, what the failure modes are, and what the client keeps at the end.',
    schemaType: 'TechArticle',
    answer:
      'RankedTag produces work in three stages: a human sets strategy and approves every brief, AI compresses research and the first draft, and a human rewrites, fact-checks and supplies the argument before anything publishes. No page ships unread, and the automation layer is handed over on client infrastructure when an engagement ends.',
    keyFacts: [
      ['Stage one', 'Human strategy. SWOT, query selection, positioning, brief approval'],
      ['Stage two', 'AI-compressed research and first draft'],
      ['Stage three', 'Human rewrite, fact-check and argument'],
      ['Automation', 'n8n workflows for triggers, enrichment, publishing and alerting'],
      ['Rule that does not bend', 'Nothing publishes unread by a person'],
      ['At handover', 'Workflows, prompts and documentation move to client infrastructure'],
    ],
    sections: [
      {
        id: 'stages',
        h2: 'The three stages, and what each is actually for',
        steps: [
          ['Strategy, by a person', 'Query selection, competitive reading and positioning are judgement work with no verifiable ground truth, which is exactly where a model is least reliable. A person decides what to target and why, and approves every brief before a word is written.'],
          ['Research and first draft, AI-compressed', 'Reading fifty competitor pages, extracting what each covers, and producing a structured first pass is volume work with a checkable output. That is where AI earns its place: it turns a week into an afternoon without deciding anything.'],
          ['Rewrite and fact-check, by a person', 'Every figure is traced to a primary source or cut. Every argument is supplied by a person. This stage is where a draft becomes something worth publishing, and it is not optional.'],
        ],
        after: [
          'The division is not ideological. It follows from where errors are cheap to catch. A wrong competitor summary is caught by a human reading the draft, while a wrong strategic choice is not caught at all until a quarter has passed.',
        ],
      },
      {
        id: 'why-it-matters',
        h2: 'Why the rewrite stage is the one that cannot be skipped',
        paras: [
          'The commercially relevant point is that unreviewed generated text tends to be unsourced, and unsourced text underperforms in exactly the surface it is usually produced for. The peer-reviewed GEO study found that adding quotations to a page increased its visibility in generated answers by roughly 41%, and that adding cited sources produced the largest measured gain at position five, around 115% [[geoStudy]]. Both of those are things a reviewing human adds and a first draft does not have.',
          'There is also a policy dimension. Google’s spam policies address scaled content abuse, meaning content produced at scale primarily to manipulate rankings rather than to help people, regardless of whether it was produced by automation, by people, or by a combination [[googleSpamPolicies]]. The distinction Google draws is purpose and quality, not authorship, which is precisely why the review stage exists rather than a disclosure badge.',
        ],
      },
      {
        id: 'automation',
        h2: 'What the automation layer does, and what it deliberately does not',
        list: [
          'Does: trigger on a published page, notify the right channel, enrich a new signup record, route an enquiry into the systems a client already uses.',
          'Does: capture the attribution source recorded against a signup, which is where the first-party dataset on this site came from [[rankedtagSignupSample]].',
          'Does not: publish anything. A workflow can prepare a page and alert a person. It cannot be the person.',
          'Does not: stay locked to RankedTag. Workflows, prompts and documentation are handed over on client infrastructure at the end of an engagement.',
        ],
      },
      {
        id: 'failure',
        h2: 'Where this method fails',
        paras: [
          'It fails when the review stage is rushed, which is the same failure mode as any content operation and the reason intake is capped rather than scaled. It fails when a client expects volume as the deliverable: this stack produces fewer, denser pages, and a brief that asks for forty thin pages a month is a brief for a different supplier.',
          'It also fails where there is no verifiable material to work with. A page about a product nobody has measured, in a category with no published research, cannot be made citable by better writing. In that situation the honest recommendation is to generate the evidence first, which is what the original dataset on this site is: a small, bounded thing that is genuinely ours rather than a borrowed statistic.',
        ],
      },
    ],
    faqs: [
      [
        'Does AI write the published content?',
        'AI writes a first draft and compresses the research behind it. A person rewrites it, checks every figure against a primary source, and supplies the argument. Nothing publishes unread.',
      ],
      [
        'Is AI-assisted content against Google’s guidelines?',
        'No. Google’s spam policies target scaled content abuse, meaning content made primarily to manipulate rankings rather than to help people, whichever way it was produced [[googleSpamPolicies]].',
      ],
      [
        'What is n8n used for here?',
        'Workflow automation: triggers, enrichment, publishing mechanics and alerts. It moves information between systems. It does not make editorial decisions.',
      ],
      [
        'Who owns the workflows at the end?',
        'The client. They run on client infrastructure and are documented, so an engagement ending does not take the plumbing with it.',
      ],
      [
        'How many pages a month does this produce?',
        'Fewer than a content mill and more than a traditional agency of the same size. The number varies with the brief, and volume is not the deliverable being sold.',
      ],
    ],
    official: ['geoStudy', 'googleSpamPolicies'],
    related: [
      ['/research/methodology/52-check-audit', 'The 52-check audit'],
      ['/research/methodology/how-we-measure-ai-citations', 'How assistant citations are measured'],
      ['/research/services', 'The six disciplines'],
      ['/what-we-do/content-marketing', 'The content engine capability page'],
    ],
    ctaH: 'That is how the work gets made.',
    ctaSer: 'See what it would make for you.',
  },

  // ───────────────────────────────────────────────────────────────────
  {
    ...U,
    slug: 'methodology/52-check-audit',
    parent: 'research',
    idx: '005',
    nav: 'The 52-check audit',
    group: 'Methodology',
    question: 'What does the 52-check founder review actually check, and what does it produce?',
    eyebrow: 'RESEARCH · METHODOLOGY',
    h1: 'The 52-check audit, listed in full',
    title: 'The 52-Check Audit: Every Category and What It Catches',
    description:
      'What the free founder review checks across eight categories, what each check is looking for, what the output is, and the honest limits of a 48-hour audit.',
    schemaType: 'TechArticle',
    answer:
      'The 52-check audit is a free review of a single domain, run personally by the founder and returned within 48 hours. It covers eight categories: crawlability and indexation, rendering, structured data and entity, Core Web Vitals, mobile and accessibility, security, AI-crawler readiness, and the non-technical layer of content depth, ideal-customer clarity and conversion path.',
    keyFacts: [
      ['Cost', 'Free. Four are taken a month'],
      ['Turnaround', 'Within 48 hours of the application'],
      ['Run by', 'The founder, personally, not a tool export'],
      ['Output', 'A written read with a prioritised order of work, including when the answer is that no agency is needed'],
      ['Categories', 'Eight, covering 52 individual checks'],
      ['What it is not', 'Not a crawl report, not a score out of 100, not a sales document'],
    ],
    sections: [
      {
        id: 'categories',
        h2: 'The eight categories, and what each one is looking for',
        table: {
          caption: 'The eight audit categories and the failure each is designed to catch',
          columns: ['Category', 'What is checked', 'The failure it catches'],
          rows: [
            ['Crawlability and indexation', 'robots.txt, sitemaps and their accuracy, canonical logic, indexed-to-submitted ratio, redirect chains, orphan pages', 'Pages that exist but were never going to be found'],
            ['Rendering', 'Whether primary content is present in the served HTML or depends on client-side JavaScript [[googleJsSeo]]', 'A marketing site that looks complete to a browser and empty to a crawler'],
            ['Structured data and entity', 'Whether the schema graph parses, whether it matches visible content [[googleStructuredDataIntro]], and whether the organisation is described consistently', 'Invalid or contradictory markup, which is silently ignored rather than reported'],
            ['Core Web Vitals', 'Field data where available, layout shift sources, render-blocking resources [[googleCwv]]', 'A fast lab score hiding a slow real-world experience'],
            ['Mobile and accessibility', 'Viewport behaviour from 375 to 1920, tap targets, contrast ratios, heading order', 'A site that technically responds but is not usable on a phone'],
            ['Security and hygiene', 'HTTPS consistency, mixed content, header basics, exposed staging or admin surfaces', 'Trust signals that quietly fail in the background'],
            ['AI-crawler readiness', 'Whether assistant crawlers are permitted, whether content is reachable without JavaScript, and whether claims carry sources [[openaiBots]]', 'A site invisible to the surface a growing share of buyers start from'],
            ['Content and conversion', 'Depth against the query, ideal-customer clarity, the conversion path, and the quality of the writing', 'A technically perfect site with nothing worth citing on it'],
          ],
        },
      },
      {
        id: 'ai-readiness',
        h2: 'The AI-crawler checks, in more detail',
        paras: [
          'This category is the one most audits still skip, and it is mostly a robots.txt and rendering question rather than anything exotic. Assistant operators document their user agents publicly: OpenAI documents OAI-SearchBot for surfacing sites in ChatGPT search, GPTBot for model training and ChatGPT-User for user-triggered fetches [[openaiBots]]. Anthropic documents ClaudeBot, Claude-User and Claude-SearchBot with distinct purposes [[anthropicCrawler]]. Perplexity documents PerplexityBot for surfacing and linking sites in its results, and Perplexity-User for user-initiated visits [[perplexityBots]].',
          'The check is whether a site blocks the ones it does not mean to block. A blanket disallow added years ago, or a security product blocking unfamiliar agents, routinely removes a site from assistant answers while leaving Google Search untouched. Google’s own control token works the other way round: Google-Extended governs whether crawled content may be used for training and grounding in Gemini apps, and explicitly does not affect inclusion or ranking in Google Search [[googleCommonCrawlers]].',
        ],
      },
      {
        id: 'output',
        h2: 'What comes back, and in what order',
        paras: [
          'The output is a written read, not a tool export. It names what is wrong, puts it in the order it should be fixed, and separates the things that need an engineer from the things that need an editor. Where a check passes, it is not listed; a 52-item list of green ticks is a sales document rather than an audit.',
          'It includes the recommendation not to hire anyone where that is the right answer. The most common version of that is a site whose problem is a product-market or demand problem rather than a search problem, where content investment would be the expensive way to discover something a week of customer calls would show.',
        ],
      },
      {
        id: 'limits',
        h2: 'The honest limits of a 48-hour audit',
        paras: [
          'It is a read of public surfaces plus whatever the applicant shares. Without Search Console access it cannot see query-level performance, and without analytics it cannot see conversion behaviour. It will say which of those it needed and did not have.',
          'It is also a point-in-time read. Core Web Vitals field data lags, index coverage changes, and an assistant answer that cites you today may not tomorrow. The audit is the start of a plan, not a certificate.',
        ],
      },
    ],
    faqs: [
      [
        'Is the 52-check audit really free?',
        'Yes, with no obligation and no call required. Four are taken a month because each one is run personally.',
      ],
      [
        'Do I need to give access to Search Console?',
        'No, but the audit is better with it. Without it, query-level performance cannot be read and the report says so rather than guessing.',
      ],
      [
        'How is this different from a crawl tool report?',
        'A crawl tool lists everything it can detect. This prioritises what matters for your specific situation and includes the non-technical layer a crawler cannot assess, such as whether the content is worth citing.',
      ],
      [
        'What if the audit finds nothing serious?',
        'Then it says so, and the recommendation will be that you do not need an agency right now. That happens, and it is a more useful answer than a manufactured problem.',
      ],
      [
        'Does the audit check whether AI assistants can read my site?',
        'Yes, that is one of the eight categories: whether assistant crawlers are permitted, whether content is reachable without JavaScript, and whether claims carry sources that can be cited.',
      ],
    ],
    official: ['openaiBots', 'anthropicCrawler', 'perplexityBots', 'googleCommonCrawlers'],
    related: [
      ['/apply', 'Apply for the founder review'],
      ['/research/methodology/how-we-measure-ai-citations', 'How assistant citations are measured'],
      ['/research/technical/how-it-works', 'How this site is built and crawled'],
      ['/what-we-do/technical-seo', 'Technical SEO capability page'],
    ],
    ctaH: 'Fifty-two checks, run by a person.',
    ctaSer: 'Send a domain and read the result.',
  },
  // ───────────────────────────────────────────────────────────────────
  {
    ...U,
    slug: 'methodology/how-we-measure-ai-citations',
    parent: 'research',
    idx: '006',
    nav: 'How we measure AI citations',
    group: 'Methodology',
    question: 'How do you measure whether an AI assistant cites a brand, when there is no Search Console for assistants?',
    eyebrow: 'RESEARCH · MEASUREMENT',
    h1: 'How AI citations are measured here',
    title: 'How to Measure AI Citations: The Prompt Panel Method',
    description:
      'There is no Search Console for assistants. The prompt panel method used instead: how the panel is built, how answers are recorded, and what it cannot tell you.',
    schemaType: 'TechArticle',
    answer:
      'There is no equivalent of Search Console for AI assistants, so citation share is measured with a fixed prompt panel: a written set of buyer questions, run on a schedule across each assistant, with the answers recorded verbatim along with whether the brand was named and whether a link was given. The output is the prompts and the answers, not a proprietary score.',
    keyFacts: [
      ['The problem', 'No assistant publishes a per-site impressions report. Server logs show crawler visits, not citations'],
      ['The method', 'A fixed prompt panel, run on a schedule, answers recorded verbatim'],
      ['Panel size', 'Typically 20 to 40 prompts, written once and frozen'],
      ['What is recorded', 'Named or not, linked or not, position in the answer, competitors named alongside'],
      ['Reported as', 'The prompts and the answers. No composite score'],
      ['Known limits', 'Answers are non-deterministic, personalised and change without notice'],
    ],
    sections: [
      {
        id: 'why',
        h2: 'Why this has to be measured by hand',
        paras: [
          'Google Search Console reports impressions, clicks, position and query for Google Search [[googleSearchConsoleDocs]]. Nothing equivalent exists for ChatGPT, Claude or Perplexity: there is no per-site report of how often a brand was named in an answer, because the assistant operator is not running a search results page on your behalf.',
          'Two proxies are often substituted and both are weak. Referral traffic from an assistant undercounts badly, because a buyer who reads a recommendation in an answer frequently searches the brand name afterwards and arrives as organic or direct. Crawler hits in server logs show that an agent fetched a page, which is a prerequisite for citation and not evidence of it. The operators document those agents precisely because fetching and citing are different events [[openaiBots]].',
          'That leaves direct observation, which is what a prompt panel is: ask the questions a buyer would ask, record what comes back, and do it the same way every time.',
        ],
      },
      {
        id: 'panel',
        h2: 'How the panel is built',
        steps: [
          ['Write the prompts from buyer language, then freeze them', 'Prompts come from sales calls, support tickets and the queries that already convert, phrased the way a person asks an assistant rather than the way they type into a search box. Once written, they do not change, because a panel that changes cannot show a trend.'],
          ['Cover the three question types that matter', 'Recommendation prompts ("best X for Y"), comparison prompts ("X vs Y for a company like mine"), and verification prompts ("is X any good for Y"). Each behaves differently and a panel of only one type reads as a flat line.'],
          ['Run across assistants on a fixed schedule', 'The same panel, the same wording, run across each assistant in scope on the same cadence, with no personalisation carried over between runs where that can be controlled.'],
          ['Record the answer verbatim', 'The full answer text, whether the brand was named, whether a link was included, where in the answer it appeared, and which competitors were named alongside. Screenshots for anything that will be quoted publicly.'],
          ['Report the raw material', 'The client receives the prompts and the answers. A composite score hides exactly the information that makes the number actionable, which is which answers moved and what they now say.'],
        ],
      },
      {
        id: 'what-moves',
        h2: 'What actually moves the number',
        paras: [
          'The published research is narrow but real. The peer-reviewed GEO study, which tested content changes against generative engines, found quotation-heavy content gained roughly 41% in visibility, and that adding cited sources produced the largest gain for a page at position five, around 115% [[geoStudy]]. Those findings point at the content itself rather than at any technical trick.',
          'In practice the levers are: being crawlable by the agents in question [[anthropicCrawler]], making claims that can be quoted because they are specific and sourced, describing the entity consistently enough that it can be resolved, and covering the comparison and alternatives questions buyers actually ask, since those are the prompts that produce recommendation answers.',
        ],
      },
      {
        id: 'limits',
        h2: 'What this method cannot tell you',
        list: [
          'It is not a census. A panel of 30 prompts is a sample of a question space that is effectively unbounded.',
          'Assistant answers are non-deterministic. The same prompt can return different answers minutes apart, which is why a panel is run on a schedule and read as a trend rather than a reading.',
          'Personalisation and geography affect answers, and neither can be fully controlled from outside.',
          'It measures citation, not revenue. Attribution from assistant answers to signups remains the hardest part of the chain, which is why the first-party sample published here is interesting but small [[rankedtagSignupSample]].',
          'It cannot prove causation. A panel shows what changed, in parallel with work that was done; it does not isolate variables the way a controlled experiment would.',
        ],
      },
    ],
    faqs: [
      [
        'Can I see AI assistant traffic in Google Analytics?',
        'Partially and unreliably. Some assistant referrals appear as referral traffic, but buyers frequently search the brand afterwards, so the visit arrives as organic or direct and the assistant gets no credit.',
      ],
      [
        'Do server logs prove an assistant cited my site?',
        'No. Logs show that a documented agent fetched a page. Fetching is a prerequisite for citation, not evidence of it.',
      ],
      [
        'How many prompts should a panel have?',
        'Typically 20 to 40. Enough to cover recommendation, comparison and verification questions, few enough that every answer can actually be read rather than summarised.',
      ],
      [
        'How often should the panel be run?',
        'On a fixed cadence, commonly fortnightly or monthly. Consistency matters more than frequency, because the panel only has meaning as a trend.',
      ],
      [
        'Why not report a single visibility score?',
        'Because the score hides the useful part. Knowing that three recommendation answers now name you, and what they say, is actionable. Knowing that a composite rose from 24 to 29 is not.',
      ],
    ],
    official: ['googleSearchConsoleDocs', 'geoStudy', 'openaiBots', 'anthropicCrawler'],
    related: [
      ['/research/results/ai-assistant-signup-attribution', 'The first-party signup attribution sample'],
      ['/what-is-geo', 'What is generative engine optimisation'],
      ['/research/methodology/three-piece-stack', 'The three-piece stack'],
      ['/what-we-do/generative-engine-optimization', 'GEO capability page'],
    ],
    ctaH: 'Measurement you can read.',
    ctaSer: 'Not a score you have to trust.',
  },

  // ───────────────────────────────────────────────────────────────────
  {
    ...U,
    slug: 'technical/how-it-works',
    parent: 'research',
    idx: '007',
    nav: 'How this site works',
    group: 'Technical',
    question: 'How is rankedtag.com actually built, and why does the build matter for AI visibility?',
    eyebrow: 'RESEARCH · TECHNICAL',
    h1: 'How this site is built, and why it is built that way',
    title: 'How RankedTag.com Is Built: Rendering, Schema, Crawlers',
    description:
      'This site\u2019s architecture: static pre-rendering, a server-rendered blog, one entity graph, explicit crawler permissions, and a gate that blocks a broken build.',
    schemaType: 'TechArticle',
    answer:
      'Every marketing page on rankedtag.com is pre-rendered to static HTML at build time, so the full content is in the served document before any JavaScript runs. The blog is server-rendered from a Postgres database on request. One organisation entity is injected into every page, and a verification script blocks the build if any page is thin, orphaned, broken or carries invalid structured data.',
    keyFacts: [
      ['Rendering', 'Static pre-rendering at build time for marketing pages; server-rendered HTML for blog posts'],
      ['Why', 'Assistant crawlers generally do not execute JavaScript, so content behind it is invisible to them'],
      ['Entity', 'One Organization and WebSite graph injected into every page at build time'],
      ['Crawlers', 'Assistant agents explicitly allowed in robots.txt by documented name'],
      ['Quality gate', 'A script that fails the build on dead links, thin pages, orphans or invalid JSON-LD'],
      ['Hosting', 'Static output on a CDN, with a small number of serverless endpoints for the tools and the blog'],
    ],
    sections: [
      {
        id: 'rendering',
        h2: 'Why the rendering decision is the one that matters',
        paras: [
          'A single-page application serves a near-empty HTML document and builds the page in the browser. Google documents that it processes JavaScript in a separate rendering stage, which means content behind JavaScript is seen later and sometimes not at all [[googleJsSeo]]. Assistant crawlers are less forgiving again: their documentation describes fetching pages, not executing applications [[openaiBots]].',
          'The practical consequence is that a marketing site built as a client-rendered application can look complete in a browser and arrive as an empty shell to the systems that decide whether to cite it. Every page here is therefore written to static HTML at build time, with the full text, headings and structured data present in the served document. The JavaScript that hydrates the page afterwards adds interaction, not content.',
          'The blog is different, because its content lives in a database that changes without a rebuild. Those pages are rendered to HTML on the server at request time, which produces the same outcome by a different route: a crawler receives finished HTML either way.',
        ],
      },
      {
        id: 'entity',
        h2: 'One entity, injected everywhere',
        paras: [
          'The Organization and WebSite nodes are defined once and injected into every page at build time, and the same definition is imported by the server-rendered blog. One definition means the static pages and the blog cannot drift apart, which is the usual way an entity graph quietly becomes inconsistent.',
          'Page-level schema references those nodes by identifier rather than repeating them, which is the schema.org idiom for "the same entity" and avoids publishing three slightly different versions of the same organisation [[googleStructuredDataIntro]]. The founder is one Person node with one identifier, referenced by the organisation, by the about page and by every blog byline.',
          'Structured data is only published where it reflects what a reader can see on the page. No aggregate ratings are published anywhere on this site, because there is no genuine review data behind them, and Google requires that markup represent visible content [[googleFaqSchema]].',
        ],
      },
      {
        id: 'crawlers',
        h2: 'What the robots file says, and why',
        paras: [
          'Assistant crawlers are allowed explicitly, by the names their operators document, rather than being left to a default. OpenAI documents OAI-SearchBot, GPTBot and ChatGPT-User with distinct purposes [[openaiBots]]. Anthropic documents ClaudeBot, Claude-User and Claude-SearchBot [[anthropicCrawler]]. Perplexity documents PerplexityBot and Perplexity-User [[perplexityBots]]. Google-Extended is a control token with no user agent of its own, governing whether crawled content may be used for training and grounding in Gemini apps without affecting Google Search [[googleCommonCrawlers]].',
          'Allowing them is a deliberate commercial choice rather than a default. The content on this site exists to be read and cited; a citation with attribution is the outcome being optimised for, which is also why the terms explicitly permit quotation with attribution.',
        ],
      },
      {
        id: 'gate',
        h2: 'The quality gate that blocks the build',
        paras: [
          'A verification script runs against the built output and fails the build rather than warning. It checks every internal link for dead ends and redirect chains, every page for the minimum length, every page for reachability within two clicks of the homepage, every structured data block for whether it parses, the sitemap against the built pages in both directions, heading order, and whether any page uses a styling class whose stylesheet it never imports.',
          'That last check exists because of a real failure: a stylesheet defining the prose layout was not imported by eight pages, which shipped as unstyled full-width text. The check now catches it before a human has to notice. The gate has also caught ten orphaned pages and a page whose review date rendered as plain body text, which is the argument for having it at all.',
        ],
      },
    ],
    faqs: [
      [
        'Do AI crawlers execute JavaScript?',
        'Generally no. Operator documentation describes fetching pages rather than rendering applications, so content that only appears after JavaScript runs is at risk of being invisible to them.',
      ],
      [
        'Is server-side rendering required for AI visibility?',
        'Not strictly, but the content has to be in the HTML a crawler receives. Static pre-rendering and server-side rendering are two ways of achieving the same thing.',
      ],
      [
        'Does blocking GPTBot remove a site from ChatGPT?',
        'Not exactly. OpenAI documents separate agents for training, search indexing and user-triggered fetches, so blocking one affects one use. The names and purposes are in OpenAI’s own documentation [[openaiBots]].',
      ],
      [
        'Why publish no aggregate ratings?',
        'Because there is no genuine review dataset behind them. Structured data has to reflect visible content, and inventing a rating to earn a star in a results page is the kind of thing that earns a manual action instead.',
      ],
      [
        'Can I see the verification script?',
        'It is not published as a product, but the categories it checks are listed above and the founder review applies the same checks to an applicant’s domain.',
      ],
    ],
    official: ['googleJsSeo', 'googleStructuredDataIntro', 'openaiBots', 'anthropicCrawler', 'perplexityBots', 'googleCommonCrawlers'],
    related: [
      ['/research/methodology/52-check-audit', 'The 52-check audit'],
      ['/llms-txt', 'What llms.txt is, and what it is not'],
      ['/what-we-do/technical-seo', 'Technical SEO capability page'],
      ['/schema-generator', 'Free schema generator'],
    ],
    ctaH: 'The site is the proof of the method.',
    ctaSer: 'Let it look at yours.',
  },
  // ───────────────────────────────────────────────────────────────────
  {
    ...U,
    slug: 'results',
    parent: 'research',
    idx: '008',
    nav: 'Results',
    group: 'Results',
    question: 'What results has RankedTag actually measured, and how should a buyer weigh them?',
    eyebrow: 'RESEARCH · RESULTS',
    h1: 'Measured results, and how to weigh them',
    title: 'RankedTag Results: One Case Study, One Dataset, Both Bounded',
    description:
      'Every measured result RankedTag holds: the Sendr.ai search figures, the first-party signup attribution sample, and what neither of them can support.',
    schemaType: 'Article',
    answer:
      'RankedTag holds two pieces of measured first-party evidence. The first is the Sendr.ai engagement: 1.05 million organic impressions and 7,430 clicks over six months from a standing start, with a number two position in an AI Overview. The second is a sample of 17 production signup alerts from that engagement, recording which sources were attributed, including assistants.',
    keyFacts: [
      ['Measured client results', 'One, in B2B SaaS'],
      ['Source of those figures', 'Google Search Console on the client’s own property'],
      ['Measured window', '9 November 2025 to 28 April 2026'],
      ['First-party dataset', '17 production signup alerts with attribution source and country'],
      ['Verticals with no result', 'Ecommerce, local, healthcare, law firms, home services'],
      ['Independent audit', 'None. No agency traffic claim is auditable from outside, and this page says so'],
    ],
    sections: [
      {
        id: 'sendr',
        h2: 'The Sendr.ai engagement',
        paras: [
          'Sendr.ai is a seed-stage B2B SaaS competing in a category dominated by eight-figure incumbents. Starting from zero organic impressions, the engagement recorded 1.05 million organic impressions and 7,430 clicks over the six months from 9 November 2025 to 28 April 2026, at roughly 0.7% click-through rate and an average position of about 7.1. It also reached the number two position in Google’s AI Overview for its category-defining query, six places above ZoomInfo at number eight [[sendrCaseStudy]].',
          'The figures come from Google Search Console on the client’s own property, which reports impressions, clicks, click-through rate and average position for Google Search [[googleSearchConsoleDocs]]. That is the strongest available source for a claim of this kind and it is still not independently auditable by a reader, which is true of every agency’s traffic claims without exception.',
          'What the engagement does not establish: that the same approach produces the same outcome in a different category, that the result would not have occurred anyway, or that impressions converted to revenue at any particular rate. A single engagement cannot separate the work from everything else happening to a company over six months, and claiming otherwise would be the kind of overreach this page exists to avoid.',
        ],
      },
      {
        id: 'ctr',
        h2: 'Why a 0.7% click-through rate is published rather than hidden',
        paras: [
          'A click-through rate below one per cent looks weak out of context, and most agencies would quietly drop it. It is published because it is the honest shape of early-stage visibility: a large share of those impressions are for queries where the page appeared well down the first page or below it, and impressions at position fifteen convert to clicks at a rate that looks like a rounding error.',
          'It is also the shape of a results page that increasingly answers the query itself. Ahrefs, studying 300,000 keywords, found that the presence of an AI Overview was associated with a materially lower click-through rate for the top-ranking page [[ahrefsAio]]. A programme measured only on clicks will read that shift as failure while the brand is being seen, and sometimes cited, more than before.',
          'That is the argument for reporting impressions, position and citation presence alongside clicks rather than collapsing everything into one number. It is also the reason the measurement method for assistants is published separately and in full.',
        ],
      },
      {
        id: 'dataset',
        h2: 'The first-party attribution sample',
        paras: [
          'During the same engagement, production signup alerts recorded an attribution source for each new signup. A sample of 17 of those alerts is published as a dataset, with the source string recorded verbatim and the country as reported, covering Google, ChatGPT, Gemini, Claude, NotebookLM and generic search strings [[rankedtagSignupSample]].',
          'It is a small, bounded, honestly-labelled sample rather than a study. The captures carry no timestamps, so no rate, trend or share of total signups can be derived from them, and the client reports materially higher monthly signup volume than the sample contains. What it does support is narrow and still unusual: that named assistants appear as attributed signup sources in production, for a real B2B SaaS, across several countries.',
          'A fuller version of this dataset, with timestamps and complete coverage of a defined period, would support considerably more. It is not published because that export is not yet in hand, and publishing the stronger version of a claim before the data supports it is exactly the failure this section is designed to prevent.',
        ],
      },
      {
        id: 'weigh',
        h2: 'How to weigh any agency’s results, including these',
        list: [
          'Ask what the denominator is. Impressions and clicks mean different things on a ten-page site and a ten-thousand-page site, and a percentage without an absolute number beside it is designed to be unreadable.',
          'Ask what was happening anyway. Funding announcements, product launches and seasonal demand all produce organic growth that no agency created.',
          'Ask what shipped rather than what was recommended. A large share of agency recommendations never reach production, and a case study rarely separates advice given from changes made.',
          'Ask where the number came from. A client-owned Search Console property is the strongest common source. An agency dashboard is the weakest.',
          'Ask what is missing. The absence of results in five of six verticals here is disclosed on every page it affects; an agency with eleven case studies and no stated gaps is making a different kind of claim.',
        ],
      },
    ],
    faqs: [
      [
        'How many case studies does RankedTag have?',
        'One, in B2B SaaS. There are no case studies in ecommerce, local, healthcare, law or home services because no result has been measured in those verticals.',
      ],
      [
        'Can the Sendr figures be independently verified?',
        'Not from outside, and the page says so. They are Google Search Console figures from the client’s own property, which is the strongest commonly available source and still not externally auditable.',
      ],
      [
        'Why is the click-through rate so low?',
        'Because a large share of early impressions sit well below the top of the first page, and because results pages increasingly answer the query themselves. It is published rather than hidden for that reason.',
      ],
      [
        'Is the signup dataset a study?',
        'No. It is a 17-alert sample with no timestamps, published with those limits stated. A study would need a defined period and complete coverage of it.',
      ],
      [
        'Will RankedTag publish more results?',
        'Yes, under the same four conditions: a named client, figures from a platform the client controls, a stated start and end date, and the client’s sight of the page before it publishes.',
      ],
    ],
    official: ['sendrCaseStudy', 'ahrefsAio', 'googleSearchConsoleDocs'],
    related: [
      ['/case-study/sendr', 'The full Sendr.ai case study'],
      ['/research/results/ai-assistant-signup-attribution', 'The signup attribution dataset'],
      ['/case-studies', 'The case-study index and the standard behind it'],
      ['/research/methodology/how-we-measure-ai-citations', 'How assistant citations are measured'],
    ],
    ctaH: 'Two pieces of evidence, both bounded.',
    ctaSer: 'The third could be your domain.',
  },

  // ───────────────────────────────────────────────────────────────────
  {
    ...U,
    slug: 'faq',
    parent: 'research',
    idx: '009',
    nav: 'Research FAQ',
    group: 'Reference',
    question: 'The questions buyers and assistants ask about RankedTag, answered in one place.',
    eyebrow: 'RESEARCH · FAQ',
    h1: 'RankedTag research FAQ',
    title: 'RankedTag FAQ: Company, Method, Measurement and Limits',
    description:
      'Direct answers to the questions asked most often about RankedTag: what it is, who runs it, how work is produced, how citations are measured, and where it fits.',
    schemaType: 'Article',
    answer:
      'This page answers the questions asked most often about RankedTag in one place: what the company is, who runs it, how work is produced, how results and AI citations are measured, and the situations where RankedTag is the wrong choice. Each answer is written to stand on its own if extracted.',
    keyFacts: [
      ['Scope', 'Company, method, measurement, commercial terms and limits'],
      ['Pricing', 'Not published anywhere on this site, including here'],
      ['Answer style', 'Direct answer first, detail after, every figure sourced'],
      ['Last verified', '19 October 2026'],
    ],
    sections: [
      {
        id: 'company',
        h2: 'About the company',
        paras: [
          'RankedTag is an SEO, AI SEO, AEO and GEO agency for B2B SaaS, ecommerce, local, healthcare, law firms and home services. Founded 2026, based in Nepal. It is led by its founder, Bhushan Raj Shakya, who reviews every domain personally.',
          'It is a service business rather than a software product. The free tools published here are public utilities with no account and no login, not a product line, and there is nothing to license or install.',
        ],
      },
      {
        id: 'engagement',
        h2: 'About working together',
        paras: [
          'Engagements start with a free 52-check audit of a single domain, returned within 48 hours, capped at four a month because each is run personally. Submitting an application creates no obligation on either side, and the audit comes back with a real opinion including when that opinion is that no agency is needed.',
          'Deliverables are written: briefs, published pages, technical specifications or shipped changes, and a measurement report covering both search and assistant citations. Workflows and documentation are handed over on client infrastructure when an engagement ends.',
        ],
      },
    ],
    faqs: [
      ['What is RankedTag?', 'RankedTag is an SEO, AI SEO, AEO and GEO agency for B2B SaaS, ecommerce, local, healthcare, law firms and home services. Founded 2026, based in Nepal.'],
      ['Who founded RankedTag?', 'Bhushan Raj Shakya, who is also the person who runs the work. He has more than five years in SEO and worked freelance before founding RankedTag in 2026.'],
      ['Where is RankedTag based?', 'Nepal, working with clients worldwide. There is no public office address because the work is remote and the deliverables are written.'],
      ['How much does RankedTag cost?', 'Pricing is not published. Scope varies by stage, vertical and starting condition, and a number published without a scope would be a number nobody could rely on.'],
      ['How many clients does RankedTag take?', 'Four founder reviews a month is the intake cap. The number of active engagements is not published.'],
      ['Which verticals does RankedTag work in?', 'Six: B2B SaaS, ecommerce, local and service-area businesses, healthcare, law firms and home services. Only B2B SaaS has a published measured result.'],
      ['Does RankedTag guarantee rankings?', 'No. The commitment is a measurable lift in organic impressions and at least one assistant citation within 90 days, both of which are testable, unlike a ranking promise.'],
      ['How long before results appear?', 'A pipeline live by week two, first indexed pages around week three, first top-20 positions around weeks five to seven, a compounding curve in months three to six, and a first assistant citation typically inside 30 to 45 days.'],
      ['Does AI write the content?', 'AI compresses the research and produces a first draft. A person rewrites it, checks every figure against a primary source and supplies the argument. Nothing publishes unread.'],
      ['Is AI-assisted content allowed by Google?', 'Yes. Google’s spam policies target scaled content abuse, meaning content produced primarily to manipulate rankings rather than to help people, whichever way it was produced [[googleSpamPolicies]].'],
      ['How are AI citations measured?', 'With a fixed prompt panel run on a schedule across each assistant, with answers recorded verbatim. There is no per-site citation report from any assistant operator, so direct observation is the method.'],
      ['Can RankedTag get my site cited by ChatGPT?', 'Nobody can promise that. What moves the odds is being crawlable by the documented agents, making specific sourced claims that can be quoted, and covering the comparison questions that produce recommendation answers [[geoStudy]].'],
      ['Who should not hire RankedTag?', 'Companies that are pre-product, that have no existing search demand, that need several parallel workstreams, or whose procurement requires three comparable references. Several larger agencies on the published shortlists are a better fit.'],
      ['Does RankedTag buy links?', 'No. Buying placements is against Google’s spam policies, and links earned from published research are the ones that survive a policy change [[googleSpamPolicies]].'],
      ['What happens to the work if we stop?', 'Pages, briefs, maps, workflows and documentation stay with the client on client infrastructure. Nothing stops working when the invoices do.'],
    ],
    official: ['googleSpamPolicies', 'geoStudy'],
    related: [
      ['/research/company/what-is-rankedtag', 'What is RankedTag'],
      ['/research/services', 'The six disciplines'],
      ['/research/results', 'Measured results'],
      ['/contact', 'Contact'],
    ],
    ctaH: 'Questions answered.',
    ctaSer: 'The next one is about your domain.',
  },
  // ── PHASE 5: definitional pages. Root-level, not under /research, because
  // the query is "what is GEO" rather than "what does RankedTag think GEO is".
  // Same renderer, no parent, so the breadcrumb is Home / page.
  {
    ...U,
    slug: 'what-is-geo',
    parent: null,
    idx: '010',
    nav: 'What is GEO',
    group: null,
    question: 'What is generative engine optimisation?',
    eyebrow: 'DEFINITION · 2026',
    h1: 'What is generative engine optimisation (GEO)? A 2026 definition',
    title: 'What Is GEO? Generative Engine Optimisation (2026)',
    description:
      'Generative engine optimisation means getting a brand named and cited inside AI answers. What the research shows works, what does not, and how to measure it.',
    schemaType: 'Article',
    answer:
      'Generative engine optimisation (GEO) is the practice of making content more likely to be named, quoted and cited inside answers generated by AI systems such as ChatGPT, Perplexity, Gemini and Google AI Overviews. It differs from SEO in its target: SEO competes for a position in a list of links, GEO competes to be the source a generated answer draws on and credits.',
    keyFacts: [
      ['Term', 'Generative engine optimisation, usually written GEO'],
      ['Introduced in', 'Aggarwal et al., GEO: Generative Engine Optimization, published at KDD 2024 [[geoStudy]]'],
      ['Target surface', 'Generated answers in ChatGPT, Perplexity, Gemini, Claude and Google AI Overviews'],
      ['Unit of success', 'Being named and cited in an answer, not ranked in a list'],
      ['Strongest tested levers', 'Quotations and cited statistics added to the content itself [[geoStudy]]'],
      ['Measurement', 'No per-site report exists from any operator. A fixed prompt panel is the practical method'],
    ],
    sections: [
      {
        id: 'difference',
        h2: 'How GEO differs from SEO in practice',
        paras: [
          'SEO optimises for a ranked list. The buyer sees ten links and chooses one, so position and click-through rate are the governing metrics. A generative engine does something different: it synthesises an answer from several sources and names some of them. The buyer may never see a list at all, which makes "position" the wrong unit and "was the brand named" the right one.',
          'The two surfaces share almost all of their plumbing, which is why treating GEO as a separate retainer usually produces duplicated work. The same crawl, the same server-rendered HTML and the same structured data feed both. What differs is the content standard: a page can rank well while containing nothing quotable, and a page full of specific sourced statements can be cited in an answer while sitting outside the top ten.',
          'The shift also changes what a flat click count means. Ahrefs, studying 300,000 keywords, found that the presence of an AI Overview was associated with a materially lower click-through rate for the top-ranking page [[ahrefsAio]]. A programme measured only on clicks reads that as a failure, while the brand may be appearing in more answers than before.',
        ],
      },
      {
        id: 'research',
        h2: 'What the research actually found',
        paras: [
          'The term comes from a peer-reviewed paper presented at KDD 2024, which tested content-level changes against generative engines and measured the change in visibility [[geoStudy]]. Two findings are worth stating precisely, because both are routinely garbled in secondary coverage.',
          'Adding quotations from credible sources raised visibility in generated answers by roughly 41%. That is quotations specifically, not statistics, and the distinction matters because the usual summary attributes the figure to adding statistics. Separately, adding cited sources produced the largest single gain the study measured for a page at position five, around 115%.',
          'The practical reading is that generative engines reward content that is easy to verify and easy to lift. A paragraph with a named source, a figure and a link gives the system something it can repeat with attribution; a paragraph of unsupported assertion does not.',
        ],
      },
      {
        id: 'does-work',
        h2: 'What works, and what is sold as working',
        list: [
          'Works: being reachable. Assistant operators publish their user agents, and a site that blocks them by accident is not a candidate for citation at all [[openaiBots]].',
          'Works: specific, sourced, quotable claims. The study measured this directly, and it is also what a human editor would call good writing [[geoStudy]].',
          'Works: entity consistency. One description, one organisation, one named person across every surface, so the system can resolve who you are.',
          'Works: covering the comparison and alternatives questions buyers actually ask, since those are the prompts that produce recommendation answers.',
          'Does not work: keyword stuffing aimed at models, which Google addresses directly in its spam policies [[googleSpamPolicies]].',
          'Does not work reliably: an llms.txt file as a ranking mechanism. It is a useful courtesy file and no major assistant has committed to it as a ranking input [[llmsTxtSpec]].',
          'Does not work: paying for inclusion. There is no advertising slot inside an organic generated answer to buy.',
        ],
      },
      {
        id: 'measure',
        h2: 'How GEO is measured',
        paras: [
          'There is no Search Console for assistants. Google Search Console reports impressions, clicks and position for Google Search [[googleSearchConsoleDocs]], and nothing comparable exists for ChatGPT, Claude or Perplexity. Referral traffic undercounts badly, because a buyer who reads a recommendation usually searches the brand name afterwards and arrives as organic or direct. Server logs prove a crawler fetched a page, which is a prerequisite for citation rather than evidence of it.',
          'The practical method is direct observation: a fixed panel of buyer prompts, run on a schedule across each assistant, with the answers recorded verbatim and scored for whether the brand was named and linked. The full method used here is published separately, including its limits.',
        ],
      },
      {
        id: 'who',
        h2: 'Who should care about GEO, and who should not yet',
        paras: [
          'It matters most where buyers research before shortlisting and where the purchase is considered rather than impulsive: B2B software, professional services, and high-consideration consumer categories. In those markets an assistant answer increasingly performs the function a shortlist article used to.',
          'It matters least where the decision is proximity-driven or transactional. A plumber chosen from a map pack within three miles, or a commodity product bought on price, is not a case where being cited in a generated answer changes much.',
          'It matters not at all if the site cannot be crawled, has no content worth citing, or sells into a category with no search demand. In those cases GEO is the fourth problem, not the first, and anyone selling it as the first is selling the wrong thing.',
        ],
      },
    ],
    faqs: [
      ['What does GEO stand for?', 'Generative engine optimisation. The term was introduced in a peer-reviewed paper presented at KDD 2024 [[geoStudy]].'],
      ['Is GEO the same as SEO?', 'No. SEO competes for a position in a list of links; GEO competes to be the source a generated answer names and cites. They share most of the underlying technical work.'],
      ['Is GEO the same as AEO?', 'Not quite. Answer engine optimisation is about being the extracted answer, often a direct passage. GEO is about being named and cited inside a synthesised answer that draws on several sources.'],
      ['What single change helps most?', 'In the published study, adding cited sources produced the largest measured gain, roughly 115% for a page at position five, with quotations adding about 41% [[geoStudy]].'],
      ['Does llms.txt improve GEO?', 'There is no evidence it is used as a ranking input by any major assistant. It is cheap to publish and worth having as documentation, but it is not a lever [[llmsTxtSpec]].'],
      ['How long does GEO take to show results?', 'In engagements run here, a first assistant citation typically appears inside 30 to 45 days once the foundation is in place. That is an observation from a small number of engagements, not an industry benchmark.'],
      ['Can anyone guarantee a citation in ChatGPT?', 'No. Answers are non-deterministic and change without notice, which is why the commitment made here is a measurable impression lift plus at least one citation inside 90 days rather than a guaranteed placement.'],
      ['Does GEO replace SEO?', 'No. Ranking still drives the majority of discovery for most businesses, and the technical work that makes a page rankable is the same work that makes it citable.'],
    ],
    official: ['geoStudy', 'ahrefsAio', 'openaiBots', 'googleSpamPolicies'],
    related: [
      ['/what-is-aeo', 'What is answer engine optimisation'],
      ['/what-is-ai-seo', 'What is AI SEO'],
      ['/research/methodology/how-we-measure-ai-citations', 'How AI citations are measured'],
      ['/seo-vs-geo', 'SEO vs GEO, compared'],
    ],
    ctaH: 'GEO is mostly good writing, crawled properly.',
    ctaSer: 'Find out which half your site is missing.',
  },

  {
    ...U,
    slug: 'what-is-aeo',
    parent: null,
    idx: '011',
    nav: 'What is AEO',
    group: null,
    question: 'What is answer engine optimisation?',
    eyebrow: 'DEFINITION · 2026',
    h1: 'What is answer engine optimisation (AEO)? A 2026 definition',
    title: 'What Is AEO? Answer Engine Optimisation Explained (2026)',
    description:
      'Answer engine optimisation is structuring content so a passage can be lifted as the answer. How it differs from GEO, and what structured data really does.',
    schemaType: 'Article',
    answer:
      'Answer engine optimisation (AEO) is the practice of structuring content so a specific passage can be lifted and presented as a direct answer, in featured snippets, AI Overviews, voice results and assistant replies. It is primarily a content-structure discipline: ask the question as a heading, answer it immediately in two or three sentences, then support it.',
    keyFacts: [
      ['Term', 'Answer engine optimisation, usually written AEO'],
      ['Target surface', 'Featured snippets, AI Overviews, assistant replies, voice answers'],
      ['Unit of success', 'Being the extracted passage'],
      ['Primary lever', 'Content structure: question as heading, answer in the first 40 to 60 words'],
      ['Secondary lever', 'Structured data where it reflects visible content [[googleFaqSchema]]'],
      ['Common mistake', 'Treating schema markup as the mechanism rather than the label'],
    ],
    sections: [
      {
        id: 'mechanics',
        h2: 'The mechanics, which are simpler than the acronym suggests',
        steps: [
          ['Ask the real question as a heading', 'Use the words a person uses, not a keyword-tool phrasing. "How much does an SEO audit cost" rather than "SEO audit cost UK 2026".'],
          ['Answer in the first two or three sentences', 'Extractable means the answer makes sense with nothing before it. If the answer only works after a paragraph of setup, it will not be lifted.'],
          ['Support it immediately afterwards', 'The detail, the caveat, the worked example and the source go after the answer, not before it.'],
          ['Keep one question per section', 'A section that answers three questions is hard to extract from and harder to cite.'],
          ['Mark it up only if the page shows it', 'FAQ structured data must correspond to question-and-answer content that is actually visible on the page [[googleFaqSchema]].'],
        ],
      },
      {
        id: 'vs-geo',
        h2: 'AEO and GEO, which are related but not the same',
        paras: [
          'AEO is about being the answer: one passage, lifted, usually from one source. GEO is about being named and cited inside a synthesised answer that draws on several sources. A page can win one and not the other. A crisp definition in the first two sentences wins extractions; a page dense with specific sourced claims is what gets quoted and credited in a generated answer.',
          'The published GEO research supports treating them as different jobs: the changes that most improved visibility in generated answers were adding quotations and cited sources [[geoStudy]], which is a different edit from tightening a definition into a liftable 45-word paragraph.',
          'In practice both are done on the same page. The first two sentences are written to be extractable, and the body is written to be quotable.',
        ],
      },
      {
        id: 'schema',
        h2: 'What structured data actually does here',
        paras: [
          'Structured data describes the content on a page in a machine-readable form. It is a label on what is already visible, not a mechanism that creates eligibility, and Google states plainly that markup must represent the visible content of the page [[googleStructuredDataIntro]].',
          'For AEO specifically, FAQ markup is the most relevant type, and its use has narrowed: Google restricts FAQ rich results to a small set of site types, while the markup remains a clear description of the content for anything reading the page [[googleFaqSchema]].',
          'What structured data does not do: make a weak answer eligible, guarantee a snippet, or substitute for the content being correct. Marking up an invented rating is the fastest route to a manual action, which is why there is no aggregate rating anywhere on this site.',
        ],
      },
      {
        id: 'limits',
        h2: 'The uncomfortable part: winning an answer can cost the click',
        paras: [
          'If your content becomes the answer, the user may have no reason to visit. Ahrefs found that the presence of an AI Overview was associated with a materially lower click-through rate for the top-ranking page [[ahrefsAio]]. Being the extracted answer is a brand and consideration play as much as a traffic play.',
          'That changes which questions are worth winning. Answering "what is X" may cost a click and buy a mention. Answering "which X is right for a company like mine" invites a decision the reader cannot complete inside the answer box, and that is the question worth owning.',
        ],
      },
    ],
    faqs: [
      ['What does AEO stand for?', 'Answer engine optimisation: structuring content so a passage can be lifted and presented as the direct answer to a question.'],
      ['Is AEO just featured snippet optimisation?', 'It started there and widened. The same structure now feeds AI Overviews, assistant replies and voice answers, which makes the discipline broader than one SERP feature.'],
      ['Does FAQ schema still produce rich results?', 'Only for a limited set of site types. The markup still accurately describes the page for other consumers, which is a reason to keep it honest rather than to remove it [[googleFaqSchema]].'],
      ['How long should an extractable answer be?', 'Roughly 40 to 60 words, making complete sense with no preceding context.'],
      ['Can AEO reduce my traffic?', 'Yes, for informational queries. Winning the answer can remove the reason to click, which is why the questions worth targeting are the ones that lead to a decision.'],
      ['Do I need schema markup for AEO?', 'No. Structure and clarity do most of the work. Markup labels what is there; it does not create eligibility [[googleStructuredDataIntro]].'],
      ['Is AEO different from GEO?', 'Yes. AEO is being the lifted answer. GEO is being named and cited inside a synthesised answer drawing on several sources.'],
      ['What kills AEO performance fastest?', 'Burying the answer under an introduction, and answering several questions in one section so nothing can be extracted cleanly.'],
    ],
    official: ['googleFaqSchema', 'googleStructuredDataIntro', 'ahrefsAio'],
    related: [
      ['/what-is-geo', 'What is generative engine optimisation'],
      ['/aeo-vs-geo', 'AEO vs GEO, compared'],
      ['/ai-overview-optimization', 'Optimising for Google AI Overviews'],
      ['/what-we-do/answer-engine-optimization', 'AEO capability page'],
    ],
    ctaH: 'The answer goes first.',
    ctaSer: 'Everything else is support.',
  },
  {
    ...U,
    slug: 'what-is-ai-seo',
    parent: null,
    idx: '012',
    nav: 'What is AI SEO',
    group: null,
    question: 'What is AI SEO, and is it a real discipline or a rebrand?',
    eyebrow: 'DEFINITION · 2026',
    h1: 'What is AI SEO? A 2026 definition, including what it is not',
    title: 'What Is AI SEO? The 2026 Definition, and What It Is Not',
    description:
      'AI SEO means two different things, which is why the term confuses people. What each covers, which parts are genuinely new, and which parts are SEO relabelled.',
    schemaType: 'Article',
    answer:
      'AI SEO is used in two distinct senses. The first is optimising so a brand appears in AI-driven search surfaces such as AI Overviews and assistant answers. The second is using AI tools to do SEO work faster. They are unrelated activities with the same name, and most confusion about the term comes from treating them as one.',
    keyFacts: [
      ['Sense one', 'Optimising for AI search surfaces. Overlaps heavily with GEO and AEO'],
      ['Sense two', 'Using AI to produce SEO work. A production question, not a visibility one'],
      ['Genuinely new', 'Crawler permissions for assistant agents, citation measurement, entity resolution across surfaces'],
      ['Not new', 'Crawlability, server-rendered content, structured data, intent-first content'],
      ['Policy position', 'Google targets scaled content abuse by purpose, not by authorship [[googleSpamPolicies]]'],
      ['Measurement', 'Search Console covers Google Search; assistant citations need a prompt panel'],
    ],
    sections: [
      {
        id: 'two-senses',
        h2: 'The two senses, kept apart',
        paras: [
          'Sense one is a visibility problem. Buyers increasingly start in an assistant, and the question is whether your brand is named and cited when they do. That work is mostly crawlability, evidence density and entity clarity, and it overlaps almost completely with what is published as generative and answer engine optimisation.',
          'Sense two is a production problem. It asks whether AI can compress the research, drafting and analysis that an SEO programme requires. That is a question about cost and speed, and it has no direct effect on whether anyone is cited anywhere.',
          'An agency selling "AI SEO" may mean either. The useful clarifying question is simple: does this change what my buyers see, or does it change how fast you work? Both are legitimate; charging for one while delivering the other is not.',
        ],
      },
      {
        id: 'new',
        h2: 'What is genuinely new, and what is a rebrand',
        table: {
          caption: 'AI SEO: which parts are new work and which are existing practice',
          columns: ['Area', 'Genuinely new?', 'What it involves'],
          rows: [
            ['Crawler permissions', 'New', 'Assistant operators publish distinct agents for training, search and user-triggered fetches, and a blanket block removes you from answers while leaving Google Search untouched [[openaiBots]]'],
            ['Citation measurement', 'New', 'No operator publishes a per-site citation report, so measurement means a fixed prompt panel run on a schedule'],
            ['Evidence density', 'Partly new', 'Adding quotations and cited sources measurably raised visibility in generated answers [[geoStudy]]. Good practice before; now it has a measured payoff'],
            ['Entity consistency', 'Partly new', 'One description, one organisation node, one named person. Always mattered, matters more when a system has to resolve who you are'],
            ['Crawlability and rendering', 'Not new', 'Content behind client-side JavaScript risks being seen late or not at all [[googleJsSeo]]. The same problem as a decade ago, with less forgiving consumers'],
            ['Structured data', 'Not new', 'Describes visible content accurately [[googleStructuredDataIntro]]. No new schema type makes a page citable'],
            ['Intent-first content', 'Not new', 'Writing for the question a buyer actually asks has not changed. It is simply harder to fake now'],
          ],
        },
      },
      {
        id: 'production',
        h2: 'The production sense, and where it goes wrong',
        paras: [
          'Used properly, AI compresses the volume work: reading competitor pages at scale, extracting what each covers, producing a structured first pass. Used improperly, it produces unreviewed pages at volume, which is the failure mode Google addresses as scaled content abuse, judged by purpose and quality rather than by whether a human or a machine typed it [[googleSpamPolicies]].',
          'There is also a commercial reason the review stage survives: unreviewed output is unsourced, and unsourced content underperforms in exactly the surface it is usually produced for. Adding cited sources was the single largest measured gain in the published GEO study [[geoStudy]], and a model does not add a source it was never given.',
        ],
      },
      {
        id: 'spend',
        h2: 'Where the money should go first',
        list: [
          'If assistant agents cannot reach your pages, fix that before anything else. It is a robots.txt and rendering problem and it is usually cheap [[openaiBots]].',
          'If your pages contain no specific, sourced claims, fix that next. It is an editorial problem, not a technical one.',
          'If your entity is described five different ways across the site, fix that third. It costs a day and removes a whole class of ambiguity.',
          'Only then consider a separate AI SEO engagement, and ask what it does that the first three did not already cover.',
        ],
      },
    ],
    faqs: [
      ['Is AI SEO different from SEO?', 'Partly. The crawler permissions, citation measurement and entity resolution work is new. Crawlability, rendering, structured data and intent-first content are the same disciplines as before.'],
      ['Does AI SEO replace traditional SEO?', 'No. Ranking still drives most discovery for most businesses, and the technical work that makes a page rankable is the same work that makes it citable.'],
      ['Is using AI to write content against Google guidelines?', 'No. Google targets scaled content abuse, meaning content made primarily to manipulate rankings rather than help people, whichever way it was produced [[googleSpamPolicies]].'],
      ['How do I know if an agency is selling a rebrand?', 'Ask which of the three new areas they will work on, and how they will measure a citation. An answer that is only about writing more content faster is the production sense wearing the visibility sense’s name.'],
      ['Can I measure AI SEO in Google Analytics?', 'Only partially. Assistant referrals undercount because buyers often search the brand afterwards and arrive as organic or direct.'],
      ['What should a small team do first?', 'Check that the documented assistant agents are not blocked, then add sources to the claims already on the site. Both are cheap and both are prerequisites for everything else.'],
    ],
    official: ['openaiBots', 'googleSpamPolicies', 'geoStudy', 'googleJsSeo'],
    related: [
      ['/what-is-geo', 'What is generative engine optimisation'],
      ['/ai-seo-vs-traditional-seo', 'AI SEO vs traditional SEO, compared'],
      ['/research/methodology/how-we-measure-ai-citations', 'How AI citations are measured'],
      ['/what-we-do/ai-seo', 'AI SEO capability page'],
    ],
    ctaH: 'Two meanings, one invoice.',
    ctaSer: 'Find out which one you are buying.',
  },

  {
    ...U,
    slug: 'llms-txt',
    parent: null,
    idx: '013',
    nav: 'What is llms.txt',
    group: null,
    question: 'What is llms.txt, and does publishing one do anything?',
    eyebrow: 'DEFINITION · 2026',
    h1: 'What is llms.txt? What it does, and what it does not',
    title: 'What Is llms.txt? The Honest 2026 Answer',
    description:
      'llms.txt is a proposed markdown file listing a site’s key pages for language models. What it does, what no assistant has committed to, and whether to bother.',
    schemaType: 'Article',
    answer:
      'llms.txt is a proposed plain-markdown file at the root of a site that lists its most useful pages for large language models, with a short description of each. It is a published proposal rather than a standard adopted by assistant operators, and no major assistant has committed to using it as a ranking or citation input. It is cheap to publish and should not be sold as a visibility lever.',
    keyFacts: [
      ['What it is', 'A markdown file at /llms.txt listing a site’s key pages with short descriptions [[llmsTxtSpec]]'],
      ['Status', 'A proposal. Not a standard adopted by assistant operators'],
      ['Confused with', 'robots.txt, which is an access-control file that crawlers genuinely honour'],
      ['Honest benefit', 'A clean, human-and-machine-readable index of what matters on your site'],
      ['Honest limit', 'No published evidence that any major assistant uses it as a ranking input'],
      ['Cost to publish', 'Under an hour for most sites'],
    ],
    sections: [
      {
        id: 'what',
        h2: 'What the proposal actually says',
        paras: [
          'The proposal is to put a markdown file at the root of a site that gives a language model a curated route into the content: a heading with the project name, a short summary, then lists of links with one-line descriptions, optionally with an expanded version containing the full text [[llmsTxtSpec]]. The reasoning is that a model working inside a limited context window benefits from a short, authoritative index more than from crawling a sitemap of several thousand URLs.',
          'It is worth being precise about the status: it is a published proposal with an implementation and adoption by a number of documentation sites. It is not an agreement by OpenAI, Anthropic, Google or Perplexity to read the file, and none of their published crawler documentation describes consuming it [[openaiBots]] [[anthropicCrawler]].',
        ],
      },
      {
        id: 'not',
        h2: 'What it is not',
        list: [
          'Not robots.txt. robots.txt controls access and is genuinely honoured by the documented agents. llms.txt makes no access claim at all.',
          'Not a ranking signal. No operator has published anything describing it as an input to citation or ranking.',
          'Not a sitemap replacement. Search engines use XML sitemaps for discovery; llms.txt is a curated subset, not a complete index.',
          'Not a substitute for crawlable content. A model that cannot read your pages gains nothing from a file telling it those pages exist.',
        ],
      },
      {
        id: 'worth',
        h2: 'So why publish one at all?',
        paras: [
          'Three reasons that survive scrutiny. It forces an editorial decision about which twenty pages actually matter, which is useful work regardless of who reads the file. It gives any system, present or future, a clean statement of what the site is and what it contains. And it costs under an hour, which makes the expected-value calculation easy even at a low probability of adoption.',
          'There is a fourth, narrower reason: a site that publishes one is stating publicly what it wants to be cited for. If an assistant operator does adopt the convention, the file is already there; if none ever does, the cost was an hour.',
          'What it should not be is a line item on an invoice described as AI search optimisation. The file is a courtesy, not a lever, and this site publishes one while saying so.',
        ],
      },
      {
        id: 'how',
        h2: 'How to write one that is actually useful',
        steps: [
          ['Start with the entity, not the links', 'One heading with the name, then two or three sentences stating what the organisation is, factually and consistently with every other surface.'],
          ['List pages a stranger would need', 'The pages that answer what you do, what it costs to work with you, what you have proven and where you are not a fit. Not every page you have.'],
          ['Describe each link in one line', 'A link with no description forces a fetch to find out what it is, which defeats the purpose of the file.'],
          ['Keep it consistent with everything else', 'If the file describes the company differently from the homepage and the structured data, it has added a contradiction rather than a clarification.'],
          ['Keep it current', 'A file listing pages that have moved is worse than no file. Review it whenever the site structure changes.'],
        ],
        after: [
          'This site publishes one at /llms.txt and a longer briefing at /llm-info. The generator here produces the format from a list of URLs if you want a starting point.',
        ],
      },
    ],
    faqs: [
      ['Does llms.txt improve AI visibility?', 'There is no published evidence that any major assistant uses it as a ranking or citation input. Publish it as documentation, not as a lever [[llmsTxtSpec]].'],
      ['Is llms.txt an official standard?', 'No. It is a proposal with real adoption among documentation sites, not a specification agreed by assistant operators.'],
      ['Does llms.txt replace robots.txt?', 'No. robots.txt controls crawler access and is honoured by the documented agents. llms.txt makes no access claim.'],
      ['Should a small site bother?', 'If it takes under an hour, yes. The editorial exercise of choosing the twenty pages that matter is worth the time on its own.'],
      ['What goes in llms.txt?', 'The organisation name, a short factual summary, and curated links with one-line descriptions. Not an exhaustive URL dump.'],
      ['Does RankedTag publish one?', 'Yes, at /llms.txt, kept consistent with the longer assistant briefing at /llm-info. It is published as documentation, with the same caveat stated on this page.'],
    ],
    official: ['llmsTxtSpec', 'openaiBots', 'anthropicCrawler'],
    related: [
      ['/llms-txt-generator', 'Free llms.txt generator'],
      ['/research/technical/how-it-works', 'How this site is built and crawled'],
      ['/what-is-geo', 'What is generative engine optimisation'],
      ['/llm-info', 'The assistant briefing file'],
    ],
    ctaH: 'An hour of work, honestly described.',
    ctaSer: 'The rest of the audit is free.',
  },

  {
    ...U,
    slug: 'ai-overview-optimization',
    parent: null,
    idx: '014',
    nav: 'AI Overview optimisation',
    group: null,
    question: 'How do you get a page into Google AI Overviews, and what does it cost in clicks?',
    eyebrow: 'DEFINITION · 2026',
    h1: 'Google AI Overview optimisation in 2026',
    title: 'AI Overview Optimisation: What Works, and What It Costs',
    description:
      'How AI Overviews are built, what influences inclusion, the measured click-through cost of appearing beneath one, and which queries are worth winning.',
    schemaType: 'Article',
    answer:
      'AI Overviews are generated summaries shown above the classic results for some queries, drawing on pages Google has already crawled and indexed. There is no separate submission process and no markup that creates eligibility: inclusion follows from being indexed, being relevant, and being written in a way that is easy to extract and attribute.',
    keyFacts: [
      ['What they are', 'Generated summaries above classic results, with links to supporting pages [[googleAiFeatures]]'],
      ['How to be eligible', 'Be crawled and indexed by Googlebot. There is no separate opt-in'],
      ['Crawler control', 'Google-Extended governs training and Gemini grounding, not Search inclusion [[googleCommonCrawlers]]'],
      ['Measured click cost', 'A materially lower click-through rate for the top-ranking page where an Overview is present [[ahrefsAio]]'],
      ['What does not work', 'Any markup claimed to force inclusion. No such markup exists'],
      ['Best lever', 'A clean extractable answer plus sourced specifics the summary can attribute'],
    ],
    sections: [
      {
        id: 'how',
        h2: 'How AI Overviews are actually produced',
        paras: [
          'Google describes AI features in Search as generating responses using its models over information from its index, with links to supporting sources [[googleAiFeatures]]. The practical consequences follow directly: a page that is not indexed cannot be used, a page that is indexed is already a candidate, and there is no separate feed, submission or markup type that makes a page eligible.',
          'The control surface is also narrower than most commentary assumes. Google-Extended, the token site owners use to govern whether crawled content is used for training future Gemini models and for grounding in Gemini apps, explicitly does not affect inclusion in Google Search nor act as a ranking signal [[googleCommonCrawlers]]. Blocking it is a decision about model training, not a way to stay out of Search features.',
        ],
      },
      {
        id: 'influence',
        h2: 'What genuinely influences inclusion',
        list: [
          'Being indexed, which sounds trivial and is the most common failure on JavaScript-heavy marketing sites [[googleJsSeo]].',
          'Answering the specific question in a liftable form near the top of the page rather than after an introduction.',
          'Specificity: numbers, named sources, dates and concrete examples that a summary can attribute to you.',
          'Covering the follow-up question, since Overviews often address a cluster rather than a single query.',
          'Conventional relevance and quality work, which Google describes in its guidance on creating helpful, people-first content [[googleHelpfulContent]].',
        ],
      },
      {
        id: 'cost',
        h2: 'The cost side, which should change which queries you target',
        paras: [
          'Appearing in or beneath an AI Overview is not free traffic. Ahrefs, studying 300,000 keywords, found the presence of an AI Overview was associated with a materially lower click-through rate for the top-ranking page [[ahrefsAio]]. If the summary answers the question, there is less reason to click, and that is the point of the feature from the user’s perspective.',
          'This should change targeting rather than cause panic. Definitional queries are the ones most likely to be answered in full by a summary, so winning them buys visibility rather than sessions. Decision queries, which involve weighing options against a specific situation, cannot be completed inside a summary box, and those are the ones worth owning.',
          'It should also change reporting. A programme judged only on clicks will read a shift towards Overview presence as a decline, while impressions, brand search and assistant citations all rise. That is why impressions and position are reported here alongside clicks [[googleSearchConsoleDocs]].',
        ],
      },
      {
        id: 'practice',
        h2: 'A practical sequence',
        steps: [
          ['Confirm the pages are actually indexed', 'Check coverage rather than assuming it. An unindexed page is not in the running for anything.'],
          ['Put a 40 to 60 word answer directly under the question heading', 'It should make complete sense with nothing before it.'],
          ['Add the specifics a summary can attribute', 'A figure with a named source and a date is attributable. An adjective is not.'],
          ['Answer the follow-up on the same page', 'Overviews frequently cover a cluster of related questions rather than one.'],
          ['Measure presence, not just clicks', 'Track which queries show an Overview, whether you are cited, and what happened to impressions, not only to sessions.'],
        ],
      },
    ],
    faqs: [
      ['Can I force my page into an AI Overview?', 'No. There is no submission, no feed and no markup that creates eligibility. Being indexed and relevant is the entry condition.'],
      ['Does blocking Google-Extended remove me from AI Overviews?', 'No. Google-Extended governs training and Gemini grounding and explicitly does not affect inclusion in Google Search [[googleCommonCrawlers]].'],
      ['Do AI Overviews reduce traffic?', 'Where one appears, the measured click-through rate for the top-ranking page is materially lower [[ahrefsAio]]. The effect is strongest on definitional queries.'],
      ['Which queries are worth targeting?', 'Decision queries, where a reader must weigh options against their own situation. Those cannot be resolved inside a summary.'],
      ['Does schema markup help with AI Overviews?', 'Markup describes visible content accurately. No schema type creates eligibility for a generated summary.'],
      ['How do I track whether I appear?', 'Record the queries where an Overview appears and whether your domain is cited, and read it alongside impressions and position in Search Console [[googleSearchConsoleDocs]].'],
    ],
    official: ['googleAiFeatures', 'googleCommonCrawlers', 'ahrefsAio', 'googleHelpfulContent'],
    related: [
      ['/what-is-aeo', 'What is answer engine optimisation'],
      ['/what-is-geo', 'What is generative engine optimisation'],
      ['/seo-vs-geo', 'SEO vs GEO'],
      ['/research/methodology/how-we-measure-ai-citations', 'How AI citations are measured'],
    ],
    ctaH: 'Overviews changed the maths.',
    ctaSer: 'See what they did to your queries.',
  },
];

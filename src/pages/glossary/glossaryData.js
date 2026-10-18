// SEO and AI-search glossary.
//
// One page rather than fifteen. The brief asked for 200+ words per entry, and
// fifteen separate pages at that length would each be well under the 1,000-word
// floor this project holds itself to — thin pages are a site-level liability,
// which is the exact thing a glossary is usually used to create. A single page
// with fifteen substantial entries satisfies both rules and reads better.
//
// Every entry: a one-sentence extractable definition, then real substance, and
// a cited figure wherever one exists. Same rule as everywhere else — no source,
// no statistic.
import { SOURCES } from '../verticals/verticalsData.js';
import { SITE } from '../whatWeDo/capabilitiesData.js';

export { SOURCES, SITE };

export const GLOSSARY_META = {
  title: 'SEO and AI Search Glossary: 15 Terms Explained',
  description:
    'Fifteen SEO and AI search terms defined properly, with sourced figures and the distinctions that actually matter. GEO, AEO, crawl budget, E-E-A-T and more.',
  canonical: `${SITE}/glossary`,
};

export const TERMS = [
  {
    slug: 'geo',
    term: 'Generative engine optimization (GEO)',
    short:
      'Optimising content so that generative AI systems cite or recommend your brand inside their answers, rather than ranking it in a list of links.',
    body: [
      'The term comes from academic work rather than from an agency. It was introduced in a paper presented at ACM SIGKDD in 2024, which built a benchmark of 10,000 queries and tested nine content-level strategies to see which made a source more likely to appear inside a generated answer.',
      'That origin matters because it makes the claims checkable. The paper reported visibility improvements of up to 40% from its methods and identified which ones failed. Adding quotations from credible sources was the strongest single lever at roughly 41%. Citing sources and adding relevant statistics followed closely. Keyword stuffing, carried over from an older era of SEO, performed about 10% worse than leaving the page alone.',
      'The finding most useful to ordinary businesses is not the headline. The gains concentrated on pages that were not already dominant: for a source sitting around position five, citing sources lifted visibility by roughly 115%, while the same changes reduced visibility for sources already ranking first. GEO is disproportionately a challenger tactic, and changing a page that already wins is a real risk rather than a theoretical one.',
      'It is not a separate technical discipline bolted onto a site. It is a set of editorial habits applied on top of SEO that already works, because a model cannot cite a page it cannot retrieve.',
    ],
    cite: 'geoStudy',
    links: [['/seo-vs-geo', 'SEO vs GEO'], ['/what-we-do/generative-engine-optimization', 'Our GEO work']],
  },
  {
    slug: 'aeo',
    term: 'Answer engine optimization (AEO)',
    short:
      'Optimising content to be selected as the direct answer in a featured snippet, a People Also Ask card or an AI Overview.',
    body: [
      'AEO targets answer boxes that appear inside a search results page. The unit of competition is a passage rather than a page: a tightly scoped block of text that answers one specific question completely enough to be lifted without its surrounding context.',
      'The mechanics are consistent. Put the answer in the first forty to sixty words rather than circling it. Use headings that match the questions people actually type. Keep one idea per passage. Add schema so the structure is machine-readable as well as visually obvious. None of this is new; it is what good reference writing has always looked like.',
      'The important constraint is that AEO generally rewards pages that already rank. Answer boxes are drawn from results on page one, so if you are nowhere near it, answer-first restructuring has nothing to act on. This is the clearest practical difference from GEO, which the research found favours sources that are not already dominant.',
      'A reasonable question is whether AEO still pays when an AI Overview may take the click anyway. Ahrefs measured a 34.5% lower click-through rate at position one where an AI Overview appears, across 300,000 keywords. But those overviews are assembled from the same extractable passages that win snippets, and they cite sources, so the discipline still decides whether you are the source being used.',
    ],
    cite: 'ahrefsAio',
    links: [['/aeo-vs-geo', 'AEO vs GEO'], ['/what-we-do/answer-engine-optimization', 'Our AEO work']],
  },
  {
    slug: 'ai-overview',
    term: 'AI Overview',
    short:
      'A generated summary Google places above the organic results, assembled from indexed pages and citing some of them as sources.',
    body: [
      'AI Overviews occupy the space at the top of a results page that previously held either nothing or a featured snippet. They answer the query directly, which means a user can resolve their question without visiting any of the sources.',
      'The measured effect on clicks is substantial. Ahrefs studied 300,000 keywords, split evenly between those that triggered an AI Overview and informational keywords that did not, and found the presence of an overview correlated with a 34.5% lower click-through rate at position one. The effect extends down the page rather than being confined to the top result.',
      'Informational queries absorb most of this. Commercial and branded searches behave more normally, which is a practical argument for weighting effort towards the comparison, alternatives and buying-intent pages where the click still happens and still converts.',
      'There is a persistent myth that appearing in AI Overviews requires special preparation. Google states directly that there are no additional requirements to appear in AI Overviews or AI Mode, and no special optimisations necessary. No new markup, no file, no registration. What decides whether your page is used is whether it is crawlable, credible and structured clearly enough to be quoted.',
    ],
    cite: 'googleAiFeatures',
    links: [['/ai-seo-vs-traditional-seo', 'AI SEO vs traditional SEO'], ['/what-we-do/ai-seo', 'Our AI SEO work']],
  },
  {
    slug: 'llms-txt',
    term: 'llms.txt',
    short:
      'A proposed convention for a Markdown file at a site root that summarises the site for large language models. It grants no permissions and no engine has committed to reading it.',
    body: [
      'The file sits at /llms.txt and contains a short description of what the site is, some context, and a curated list of links to the pages that best explain it. The placement echoes robots.txt, which is the source of most confusion about it, because the two files do entirely different jobs.',
      'robots.txt expresses permission: which crawlers may fetch what. llms.txt expresses nothing about permission at all. It grants no access, blocks nothing, and carries no obligation on anything reading it. If you want to allow or disallow AI crawlers, that is a robots.txt job with the relevant user agents.',
      'Whether anything reads it is genuinely unsettled. Some tools look for it. No major engine has published that it honours or uses the file. Anyone claiming an llms.txt file is the mechanism by which you get cited by an assistant is overselling a convention that nobody has promised to use. Google states explicitly that no machine-readable file is required for its AI features.',
      'It is still usually worth twenty minutes, for a secondary reason that is more reliable than the primary one. Writing one sentence that says what your organisation does, plus a curated list of the pages that actually explain you, is a clarifying exercise. Most teams discover their homepage says none of it plainly.',
    ],
    cite: 'googleAiFeatures',
    links: [['/llms-txt-generator', 'llms.txt generator'], ['/seo-vs-geo', 'What actually earns citations']],
  },
  {
    slug: 'entity-seo',
    term: 'Entity SEO',
    short:
      'Making search engines and models resolve your brand as a specific, consistent thing rather than as a string of characters that might mean several things.',
    body: [
      'An entity is a distinct thing a system can hold facts about: a company, a person, a place, a product. Entity SEO is the work of making sure every source that describes you agrees, so a machine can resolve which entity you are with confidence.',
      'In practice it is unglamorous reconciliation. One canonical business name, address and phone number across your own site, your profiles and every directory that lists you. An Organization or LocalBusiness schema graph that matches what those profiles say. Consistent descriptions of what you do. Disambiguation where your name collides with another company or a common phrase.',
      'It has become more consequential rather than less. A language model forms its picture of your category from everything it has read about you, not from one page you control, so inconsistency across sources does direct damage. Where classic SEO tolerated slightly different business details in different places, retrieval-based systems resolve entities worse when sources disagree.',
      'For local businesses this connects directly to ranking. Google names prominence as one of three factors behind local results, and entity confidence is part of how well known and well referenced a business appears to be. Citation cleanup is entity work wearing a local-SEO hat.',
    ],
    cite: 'googleLocalRanking',
    links: [['/what-we-do/generative-engine-optimization', 'Entity and citation work'], ['/local-seo-agency', 'Local SEO']],
  },
  {
    slug: 'faceted-navigation',
    term: 'Faceted navigation',
    short:
      'Filter and sort controls on a category page. Implemented with URL parameters, they can generate effectively unlimited crawlable URLs.',
    body: [
      'Facets are how shoppers narrow a catalogue: colour, size, price, brand, rating. Each filter combination typically produces a distinct URL, and because filters combine and reorder freely, the number of possible URLs grows multiplicatively rather than additively.',
      'Google is unusually direct about the consequences. Its documentation states that the common implementation, based on URL parameters, "can generate infinite URL spaces which harms the website", and that crawlers typically access a very large number of faceted navigation URLs because they cannot tell whether a URL is useful without fetching it first.',
      'The resulting cost is time. In Google’s words, if crawling is spent on useless URLs, the crawlers have less time to spend on new, useful ones. On a large catalogue this shows up as new products taking weeks to index while filter permutations are fetched repeatedly.',
      'The fix is a deliberate policy per facet rather than a blanket rule. Combinations people genuinely search, such as brand plus category, often deserve indexable pages with their own content. Combinations that only produce near-duplicates should be crawlable but not indexable, or blocked. Then canonicals, robots directives and internal links all have to agree, because mixed signals cost more than either decision alone.',
    ],
    cite: 'googleFacets',
    links: [['/ecommerce-seo-agency', 'Ecommerce SEO'], ['/what-we-do/technical-seo', 'Technical SEO']],
  },
  {
    slug: 'crawl-budget',
    term: 'Crawl budget',
    short:
      'The practical limit on how much of your site a search engine fetches in a given period, and therefore how quickly changes are discovered.',
    body: [
      'Crawl budget is not a number Google publishes or a setting you adjust. It is the observable result of two things: how much a crawler is willing to request from your server without degrading it, and how much demand it has to crawl your pages at all, which depends on how useful and how fresh it judges them.',
      'For most small sites it is irrelevant. For catalogues, large publishers and anything generating URLs programmatically, it becomes the binding constraint. The symptom is not an error message; it is new pages taking weeks to appear and updated pages taking just as long to be re-evaluated.',
      'The only honest way to assess it is empirically, by reading server logs to see where crawler requests actually go. Log analysis routinely shows the majority of requests landing on filter permutations, paginated depth, internal search results and parameter noise, while the pages that generate revenue are visited rarely.',
      'Improving it is mostly subtraction. Stop generating URLs nobody searches for, remove or consolidate near-duplicates, fix redirect chains, and make sure your internal linking points crawlers at what matters. Adding more content to a site with a crawl problem makes the problem worse, which is the opposite of most agency proposals.',
    ],
    cite: 'googleFacets',
    links: [['/ecommerce-seo-agency', 'Catalogue-scale SEO'], ['/what-we-do/technical-seo', 'Technical SEO']],
  },
  {
    slug: 'map-pack',
    term: 'Map Pack',
    short:
      'The block of three local business results, with a map, that Google places above the organic listings for searches with local intent.',
    body: [
      'For a large share of searches that produce a phone call, the Map Pack is the result. It sits above every organic listing, and what ranks in it is your Google Business Profile rather than your website. A business can rank second organically and take almost no calls because the decision was made in the three results above it.',
      'Google names the three factors directly: local results are mainly based on relevance, distance and popularity. Relevance is how well your profile matches the search. Distance is how far you are from the searcher. Prominence, which Google also describes as how well known a business is, is built from reviews, citations, links and general web presence.',
      'The consequence most businesses miss is that distance is not optimisable. Beyond a certain radius you are not going to appear regardless of how good your profile is, which means part of the work is establishing honestly where your winnable area ends rather than buying city pages for towns you cannot reach.',
      'It also means position is not a single number. Local results are computed from where the searcher is standing, so you rank differently from one postcode to the next. Any agency reporting one local position is reporting the one measured nearest your office.',
    ],
    cite: 'googleLocalRanking',
    links: [['/local-seo-agency', 'Local SEO'], ['/home-services-seo-agency', 'Home services SEO']],
  },
  {
    slug: 'schema-markup',
    term: 'Schema markup',
    short:
      'Structured data added to a page, usually as JSON-LD, so machines can read what the page describes instead of inferring it from prose.',
    body: [
      'Schema markup states facts in a form a parser can read without ambiguity: this is a product, it costs this much in this currency, it is in stock, this organisation provides it. JSON-LD is the recommended format because it sits in a script tag apart from your markup rather than being woven through the HTML.',
      'It makes pages eligible for result types that require that certainty and helps systems resolve entities. It is not a ranking factor in itself, and adding it to a weak page produces a weak page that is easier to parse. Google notes that for products, the more properties you add, the more enhancements your page can be eligible for, which is an eligibility statement rather than a ranking one.',
      'Two rules cause most of the problems. Markup must represent content that is actually visible on the page, so FAQ markup for invisible questions or a marked-up price that differs from the displayed one is a violation rather than a clever optimisation. And it must stay true: markup written once at launch is wrong the first time a price changes, which is why anything at catalogue scale should be generated from the same source as the displayed data.',
      'There is no AI-specific schema type, despite it being sold. Google states no additional markup is required for its AI features.',
    ],
    cite: 'googleProductSchema',
    links: [['/schema-generator', 'Schema generator'], ['/what-we-do/technical-seo', 'Technical SEO']],
  },
  {
    slug: 'eeat',
    term: 'E-E-A-T',
    short:
      'Experience, Expertise, Authoritativeness and Trust: the framework Google’s quality raters use to assess content. It is not a ranking factor.',
    body: [
      'E-E-A-T describes qualities Google wants its systems to approximate, and it appears in the guidelines given to human quality raters who evaluate search results. Google is explicit on two points that are routinely misrepresented: of the four aspects, trust is the most important, and E-E-A-T itself is not a specific ranking factor.',
      'That second point matters commercially. Because it is not a factor, it cannot be bought, implemented or ticked off. An agency selling an E-E-A-T package is selling a concept rather than a mechanism. What can be done is concrete: named authors with verifiable credentials, accurate content, a documented review process, and evidence that the people behind the content have genuine standing.',
      'The expectation rises sharply for what Google calls YMYL topics, meaning content that could significantly affect someone’s health, financial stability or safety. For those, Google’s guidance is that content must be highly accurate and consistent with established expert consensus, which is a stricter test than simply being better than the competing page.',
      'In practice this is why healthcare, legal and financial sites behave differently from everything else. Competent, unattributed content competes badly against the same information published under a named practitioner.',
    ],
    cite: 'googleHelpfulContent',
    links: [['/healthcare-seo-agency', 'Healthcare SEO'], ['/law-firm-seo-agency', 'Law firm SEO']],
  },
  {
    slug: 'topical-authority',
    term: 'Topical authority',
    short:
      'The accumulated signal that a site covers a subject comprehensively and credibly, rather than having one page about it.',
    body: [
      'Topical authority is not a metric any search engine publishes, which is worth stating plainly because several tools sell a score for it. What it describes is real enough: sites that cover a subject thoroughly, with internally connected content and genuine credibility behind it, tend to rank more easily for new pages on that subject than sites publishing in isolation.',
      'The mechanism is less mystical than the term suggests. Comprehensive coverage produces more entry points, more internal links concentrating authority, more opportunities to earn external references, and clearer signals about what the site is actually about. None of those require a special technique.',
      'The common failure is treating it as a volume target. Publishing forty thin pages to cover a topic produces forty thin pages, which makes a site look weaker rather than more authoritative, and on a crawl-constrained site it actively costs you. Coverage means answering the questions a subject genuinely raises, not generating a page per keyword variant.',
      'It also connects to AI retrieval in a way that is becoming clearer. A model forms its picture of your category from the body of what it has read about you, so a single excellent page moves that picture less than a consistent body of work plus corroborating mentions elsewhere.',
    ],
    cite: 'geoStudy',
    links: [['/what-we-do/content-marketing', 'Content engine'], ['/what-we-do/seo', 'Full-stack SEO']],
  },
  {
    slug: 'canonicalisation',
    term: 'Canonicalisation',
    short:
      'Telling search engines which URL is the authoritative version when the same or similar content is reachable at several addresses.',
    body: [
      'The same content frequently lives at multiple URLs: with and without parameters, with and without a trailing slash, under http and https, under www and the bare domain, and through several category paths on an ecommerce site. Canonicalisation declares which one should be treated as the original.',
      'A rel=canonical tag is a hint rather than a directive, which surprises people. Google considers it alongside other signals, including internal linking, sitemap inclusion and redirects, and will sometimes choose a different URL than the one you nominated. When your signals contradict each other, it decides, and it is often not the page you optimised.',
      'The most expensive mistake is a canonical that points at a URL which redirects. That instructs a search engine to consolidate on an address that immediately sends it somewhere else, which wastes the signal and is entirely avoidable. Checking that canonicals, internal links and sitemap entries all name the same live URL is a small audit with a disproportionate payoff, and it is exactly what gets broken during a site migration.',
      'On catalogues, canonicalisation is also how variant pages stop competing. The same shoe in seven colours published as seven near-identical URLs splits ranking signals seven ways unless the canonical consolidates them.',
    ],
    cite: 'googleFacets',
    links: [['/what-we-do/technical-seo', 'Technical SEO'], ['/ecommerce-seo-agency', 'Variant consolidation']],
  },
  {
    slug: 'log-file-analysis',
    term: 'Log file analysis',
    short:
      'Reading your server logs to see what search engine crawlers actually requested, rather than inferring it from a crawl simulation.',
    body: [
      'Every request to your server is recorded: which URL, which user agent, what status code, when. Log file analysis is reading that record to establish what crawlers genuinely did, as opposed to what a crawling tool predicts they would do. It is the only direct evidence available about crawler behaviour on your site.',
      'What it answers cannot be answered any other way. Which pages are crawled frequently and which are ignored. How much of the crawl budget is going to filter permutations, paginated depth or parameter noise. Whether error responses are being served to crawlers but not to you. Whether new pages are discovered quickly or sit unvisited for weeks.',
      'It also reveals the AI crawler picture, which is increasingly the more interesting half. Which of GPTBot, ClaudeBot, PerplexityBot and the rest are fetching your content, how often, and whether they are being served something useful or being blocked by a rule nobody remembers adding.',
      'The practical obstacle is access rather than difficulty. Logs often live with a hosting provider or behind a CDN, and getting a usable export takes longer than the analysis. It is worth the effort on any site large enough for crawl budget to bind, because every plan written without it is a plan written from assumptions.',
    ],
    cite: 'googleFacets',
    links: [['/ecommerce-seo-agency', 'Catalogue crawl work'], ['/what-we-do/technical-seo', 'Technical SEO']],
  },
  {
    slug: 'citation',
    term: 'Citation',
    short:
      'Two different things: in local SEO, a mention of your business details on another site; in AI search, your page being used and credited inside a generated answer.',
    body: [
      'The word does double duty and the two meanings get conflated constantly, so it is worth separating them.',
      'In local SEO, a citation is any mention of your business name, address and phone number elsewhere, typically on a directory or industry listing. Citations matter less than they once did as a ranking push and more as a consistency check: conflicting details across sources make a business harder to resolve as a single entity, which caps prominence. The work is correcting inconsistencies and removing duplicates, not accumulating volume.',
      'In AI search, a citation is your content being drawn on and credited in a generated answer. This is the currency of generative engine optimization, and it is measured differently: you fix a set of buying prompts, run them across each engine on a schedule, and record which brands are named and which sources are credited. There is no analytics event when a model recommends a competitor, which is why the measurement has to be deliberate.',
      'The research on earning them is specific. Adding quotations, citing sources and including relevant statistics were the strongest tested levers, with gains concentrated on pages that were not already dominant.',
    ],
    cite: 'geoStudy',
    links: [['/local-seo-agency', 'Local citations'], ['/seo-vs-geo', 'AI citations']],
  },
  {
    slug: 'llm-retrieval',
    term: 'LLM retrieval',
    short:
      'The process by which an AI assistant fetches external content at question time and uses it to compose an answer, rather than relying only on training data.',
    body: [
      'Retrieval-augmented systems search for relevant sources when a question is asked, read what comes back, and compose an answer from it. This is why an assistant can cite a page published last week that cannot possibly be in its training data, and it is the mechanism most GEO work is actually aimed at.',
      'The practical requirements are mundane and frequently unmet. Your content has to be fetchable, which for most AI crawlers means server-rendered, because they generally do not execute JavaScript. A client-rendered marketing site that Googlebot handles tolerably can be effectively invisible to them.',
      'Then it has to be usable once fetched. Retrieval systems work with passages rather than whole documents, so self-contained blocks that answer one question without requiring surrounding context are far more likely to be used than prose that only makes sense read end to end. This is the same property that wins featured snippets, which is why the two disciplines overlap so heavily.',
      'The distinction from training data matters for expectations. Retrieval-based answers can change within weeks of you publishing something. Answers drawn from training data move on the model’s schedule, not yours, which is why corroborating third-party coverage compounds in a way your own site cannot.',
    ],
    cite: 'geoStudy',
    links: [['/seo-vs-geo', 'SEO vs GEO'], ['/what-we-do/generative-engine-optimization', 'GEO work']],
  },
];

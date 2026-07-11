// SINGLE SOURCE OF TRUTH for the /services pages.
//
// Each entry drives one pre-rendered service page (ServicePage.jsx), the nav
// dropdown, the footer column, the /services hub, and the homepage services
// section. Pure data only — imported by vite.config.js at build time via
// routeMeta.js, so no React/CSS/browser globals.
//
// SEO notes per page live next to the copy they justify:
// - `title`/`description` target the money keyword in the first ~60/155 chars.
// - `h1` repeats the keyword once, naturally.
// - FAQs mirror People-Also-Ask queries for the keyword and feed FAQPage schema.
export const SITE = 'https://rankedtag.com';

export const SERVICES = [
  {
    slug: 'b2b-saas-seo',
    nav: 'B2B SaaS SEO',
    navDesc: 'Full-stack SEO built for SaaS pipeline, not traffic',
    // Money keyword: "B2B SaaS SEO agency"
    title: 'B2B SaaS SEO Agency — Pipeline, Not Traffic | RankedTag',
    description:
      'B2B SaaS SEO agency that took sendr.ai 0→1.05M impressions in 6 months. Senior strategists + AI velocity. Technical, content and authority — built for pipeline.',
    eyebrow: 'SERVICE · B2B SAAS SEO',
    h1: 'B2B SaaS SEO that fills pipeline, not dashboards.',
    dek: 'Most SEO agencies sell traffic. Traffic does not pay your AWS bill. We build the full stack — technical foundations, keyword strategy, content engine, internal authority — measured on signups, demos and pipeline. It is the exact system that took sendr.ai from zero to 1.05M impressions and #2 in Google\'s AI Overview, above ZoomInfo.',
    serviceType: 'Search Engine Optimization',
    pains: [
      {
        h: 'Ranking for keywords nobody buys from',
        p: 'Your agency ranked you for "what is CRM". Great. Those readers are students, not buyers. B2B SaaS SEO starts from your ICP\'s buying queries and works backwards.',
      },
      {
        h: 'Content that reads like everyone else\'s',
        p: 'Ten competitors, ten identical "Top 10 tools" listicles. Google collapses them into one AI Overview and cites whoever has the strongest entity signals. That should be you.',
      },
      {
        h: 'Six-month retainers, zero compounding',
        p: 'If your traffic flatlines the month you pause the retainer, you bought rented visibility. We build an engine that keeps compounding on your own domain.',
      },
    ],
    deliverables: [
      ['ICP-first keyword architecture', 'Every target keyword mapped to a funnel stage and a revenue hypothesis — bottom-of-funnel comparison, alternative and use-case pages first.'],
      ['Technical foundation', 'Crawlability, Core Web Vitals, schema markup, internal linking — the 52-point checklist we run on every domain before a word of content ships.'],
      ['Content engine', 'Claude-accelerated research and drafts, senior-writer rewrites. The pace of a 30-person content team, run by 3.'],
      ['Entity & authority building', 'Organization schema, consistent NAP-style entity signals, digital PR moments — so Google and LLMs know exactly who you are.'],
      ['AI Overview + LLM optimization', 'Every page shipped GEO-ready: citable claims, structured answers, sourced data. Rank on Google and get cited by ChatGPT with the same asset.'],
      ['Pipeline instrumentation', 'Form fills route to your CRM and Slack, enriched — not a Google Sheet emailed on Fridays.'],
    ],
    process: [
      ['Founder review', 'The founder personally audits your domain across the 52 checks — technical, content, ICP clarity, conversion path. You get the verdict in 48 hours.'],
      ['Keyword & SWOT sprint', 'Senior strategists map your category: where the giants are weak, which queries your buyers actually type, what wins in 90 days vs 12 months.'],
      ['Engine build', 'Weeks 1–2: pipeline live. Week 3: first pages indexed. Content, schema and internal links ship in weekly batches, every piece human-reviewed.'],
      ['Compound & report', 'Weekly shipping, monthly strategy. Reported on impressions, citations, signups and pipeline — never just "sessions".'],
    ],
    faqs: [
      ['What does a B2B SaaS SEO agency actually do differently?', 'Generic agencies optimize for traffic volume. A B2B SaaS SEO agency optimizes for pipeline: bottom-of-funnel comparison and alternative pages, pricing-intent queries, integration pages and use-case pages that convert trial signups — then the top-of-funnel engine that feeds them. We also optimize for AI search surfaces (Google AI Overviews, ChatGPT, Perplexity), because that is where 40% of B2B software research now starts.'],
      ['How long does B2B SaaS SEO take to work?', 'Pipeline live by week 2, first indexed pages by week 3, first top-20 rankings around weeks 5 to 7, first LLM citation typically inside 30 to 45 days. The compounding curve hits in months 3 to 6 — sendr.ai reached 1.05M impressions and 7,430 clicks in 6 months from a standing start.'],
      ['How much does B2B SaaS SEO cost?', 'We share pricing after we have reviewed your domain and confirmed fit — a seed-stage SaaS and a $2M MRR SaaS need different scopes. Apply for the free founder review and you get a real number within 48 hours, not a sales sequence.'],
      ['We already tried an SEO agency and it did not work. Why would this be different?', 'Three structural differences: (1) senior strategists pick every keyword and approve every brief — no junior account managers; (2) AI compresses research and drafting so we ship in days what others ship in quarters; (3) everything is measured on signups and pipeline, and the workflows live on your infrastructure when we are done.'],
      ['Do you only work with B2B SaaS?', 'Yes. Best fit is B2B SaaS between $20K and $2M MRR with an English-speaking ICP. Specializing is why the playbook works — we are not re-learning your buyer every engagement.'],
    ],
    tools: ['/competitor-analysis', '/domain-authority-checker'],
    related: ['ai-seo', 'technical-seo', 'saas-content-marketing'],
  },
  {
    slug: 'ai-seo',
    nav: 'AI SEO',
    navDesc: 'Rank in Google AI Overviews and AI-powered search',
    // Money keyword: "AI SEO agency" / "AI SEO services"
    title: 'AI SEO Agency — Rank in Google AI Overviews | RankedTag',
    description:
      'AI SEO services that get B2B SaaS ranked in Google AI Overviews and cited by AI search. We put sendr.ai at #2 in the AI Overview — above ZoomInfo.',
    eyebrow: 'SERVICE · AI SEO',
    h1: 'AI SEO: own the answer, not just the ranking.',
    dek: 'Google now answers the query before anyone scrolls to your blue link. AI SEO is how you become that answer. We restructure your content, entities and schema so AI Overviews cite you — the way sendr.ai sits at #2 for its category-defining query, six places above ZoomInfo.',
    serviceType: 'AI Search Optimization',
    pains: [
      {
        h: 'AI Overviews eat your clicks',
        p: 'When the answer box sits above position 1, ranking #3 organically means nobody sees you. The only defensible position left is being the source the answer cites.',
      },
      {
        h: 'Your content is invisible to machines',
        p: 'Walls of unstructured prose with no schema, no clear claims, no sourced data. Humans skim it; extraction models skip it entirely.',
      },
      {
        h: 'Your agency still sells 2019 SEO',
        p: 'Ten blue links, keyword density, DA charts. Meanwhile your buyers ask Google, ChatGPT and Perplexity — and get told about your competitor.',
      },
    ],
    deliverables: [
      ['AI visibility audit', 'Where you appear (and don\'t) across Google AI Overviews, ChatGPT, Perplexity, Gemini and Claude for your money queries — with the gap mapped to fixes.'],
      ['Answer-first content restructure', 'Direct answers in the first 60 words, question-led H2s, extractable claims — the format answer engines quote.'],
      ['Schema & entity engineering', 'Organization, Service, FAQ and Article markup wired into one graph, so machines resolve your brand as an entity, not a string.'],
      ['Citable-asset production', 'Original stats, benchmarks and definitions engineered to be the line an AI quotes — with your brand attached.'],
      ['AI citation tracking', 'Monthly share-of-voice across the five AI surfaces, tracked query by query. You see exactly when you become the answer.'],
      ['Classic SEO kept intact', 'AI SEO sits on top of rankings, not instead of them. The same pages keep winning the organic SERP.'],
    ],
    process: [
      ['Query & surface mapping', 'We identify the questions your buyers ask each AI surface and score your current visibility on every one of them.'],
      ['Fix the machine layer', 'Schema graph, entity consistency, crawlability for AI bots (GPTBot, PerplexityBot, Google-Extended) — the plumbing that decides if you can be cited at all.'],
      ['Ship answer-shaped content', 'New and rewritten pages built to be quoted: structured, sourced, specific. Human-reviewed, Claude-accelerated.'],
      ['Track citation share', 'Monthly reporting on AI Overview presence and LLM citations alongside classic rankings.'],
    ],
    faqs: [
      ['What is AI SEO?', 'AI SEO is optimizing your website to rank inside AI-generated search results — Google AI Overviews, AI Mode, and answer engines like ChatGPT and Perplexity — as well as the classic organic results. It combines traditional technical SEO with entity engineering, structured data and answer-first content formatting so extraction models can find, trust and cite you.'],
      ['Is AI SEO different from GEO and AEO?', 'They overlap. AI SEO is the umbrella: visibility across all AI-driven search. GEO (generative engine optimization) targets citations inside LLM chat products like ChatGPT and Perplexity. AEO (answer engine optimization) targets structured answer boxes like featured snippets and AI Overviews. We run all three as one program because they share the same foundation — clean entities, structured content, citable claims.'],
      ['Can you guarantee we appear in Google AI Overviews?', 'No — nobody controls Google\'s models, and anyone promising placement is lying. What we can show is the repeatable mechanism: sendr.ai went from invisible to the #2 answer in Google\'s AI Overview for "what is the best GTM tool", above ZoomInfo, in six months. We target measurable citation lift inside 90 days.'],
      ['Does AI SEO hurt our normal Google rankings?', 'The opposite. Answer-first structure, schema and entity signals are also classic ranking factors. Sendr.ai\'s 1.05M impressions came from the same pages that earned the AI Overview citation — one asset, two surfaces.'],
      ['How do you track AI search visibility?', 'We track your money queries across Google AI Overviews, ChatGPT, Perplexity, Gemini and Claude monthly — recording when you are cited, what for, and which page earned it. That citation share is reported next to Search Console data so you see the whole picture.'],
    ],
    tools: ['/competitor-analysis', '/page-speed-checker'],
    related: ['generative-engine-optimization', 'answer-engine-optimization', 'b2b-saas-seo'],
  },
  {
    slug: 'generative-engine-optimization',
    nav: 'Generative Engine Optimization',
    navDesc: 'Get cited by ChatGPT, Perplexity, Gemini & Claude',
    // Money keyword: "generative engine optimization agency" / "GEO agency"
    title: 'Generative Engine Optimization (GEO) Agency | RankedTag',
    description:
      'GEO agency for B2B SaaS: get cited and recommended by ChatGPT, Perplexity, Gemini and Claude. Proof-led and founder-reviewed. First citation in 30–45 days.',
    eyebrow: 'SERVICE · GEO',
    h1: 'Generative Engine Optimization: get recommended by ChatGPT.',
    dek: 'When a founder asks ChatGPT "what\'s the best tool for X", one of two things happens: you get recommended, or your competitor does. GEO is the discipline of making it you — structuring your content, entities and third-party footprint so LLMs cite your brand in their answers.',
    serviceType: 'Generative Engine Optimization',
    pains: [
      {
        h: '40% of buyer research starts in an LLM',
        p: 'Your buyers ask ChatGPT and Perplexity for shortlists before they ever see a SERP. If you are not in the training-and-retrieval footprint, you are not in the deal.',
      },
      {
        h: 'You can\'t see the leak',
        p: 'No analytics event fires when Claude recommends your competitor. The pipeline you are losing to LLM answers is invisible — until you start tracking citation share.',
      },
      {
        h: 'PDF-report agencies can\'t help',
        p: 'GEO needs entity engineering, retrieval-friendly structure and citable claims. Most agencies have not shipped a single LLM citation. We track ours monthly.',
      },
    ],
    deliverables: [
      ['LLM citation baseline', 'Your current share of voice across ChatGPT, Perplexity, Gemini and Claude for every money query — the number most brands have never measured.'],
      ['Retrieval-ready content', 'Pages restructured into self-contained, quotable passages with clear claims and sources — the format retrieval systems lift into answers.'],
      ['Entity & knowledge-graph work', 'Consistent org data, schema graph, Wikipedia-grade sourcing signals, llms.txt and machine-readable brand facts.'],
      ['Third-party footprint', 'LLMs trust corroboration. We place your brand in the comparison posts, directories and communities models actually retrieve from.'],
      ['AI crawler access engineering', 'GPTBot, ClaudeBot, PerplexityBot and Google-Extended configured, tested and monitored — you cannot be cited if you cannot be read.'],
      ['Monthly citation reporting', 'Query-by-query tracking of who each engine recommends, where you moved, and which shipped asset earned it.'],
    ],
    process: [
      ['Baseline & gap map', 'We run your category\'s buying queries through the four major LLMs and score every answer: who is cited, why, from which sources.'],
      ['Machine-readability sprint', 'Schema, entities, llms.txt, crawler access, citable claim formatting — your domain becomes the easiest source in the category to quote.'],
      ['Citation asset production', 'Original data, definitions and comparisons engineered to be retrieved — shipped weekly, human-reviewed.'],
      ['Measure & compound', 'First citation typically lands inside 30–45 days. From there we widen query coverage and defend the positions you win.'],
    ],
    faqs: [
      ['What is generative engine optimization (GEO)?', 'GEO is the practice of optimizing your brand and content so generative AI systems — ChatGPT, Perplexity, Gemini, Claude and Google\'s AI Mode — cite or recommend you in their answers. Where classic SEO earns a ranking on a results page, GEO earns a mention inside the answer itself.'],
      ['How is GEO different from SEO?', 'SEO optimizes for a crawler-ranked list of links; GEO optimizes for retrieval and citation by language models. The tactics overlap (clean structure, authority, entities) but GEO adds LLM-specific work: quotable passage structure, corroborating third-party mentions, machine-readable brand facts and AI crawler access. Strong SEO is the foundation — GEO is the layer that turns rankings into recommendations.'],
      ['How do you measure GEO results?', 'Citation share: for a fixed set of buying queries, we record which brands each engine cites monthly and track your movement. It is the GEO equivalent of rank tracking — and we report it alongside Search Console so you see both surfaces.'],
      ['How fast can we get cited by ChatGPT?', 'Retrieval-augmented engines (Perplexity, ChatGPT with browsing, Gemini) can cite new content within weeks — our engagements typically land a first citation inside 30 to 45 days. Answers drawn purely from training data move slower, which is why the third-party footprint work matters: it compounds into the next model update.'],
      ['Is GEO worth it for a small SaaS?', 'Small SaaS benefit most. LLM answers are not pay-to-play and do not simply mirror domain authority — a precise, well-structured, corroborated source can out-cite an 8-figure incumbent. That is exactly how sendr.ai ended up above ZoomInfo.'],
    ],
    tools: ['/domain-authority-checker', '/competitor-analysis'],
    related: ['ai-seo', 'answer-engine-optimization', 'saas-content-marketing'],
  },
  {
    slug: 'answer-engine-optimization',
    nav: 'Answer Engine Optimization',
    navDesc: 'Win featured snippets, PAA and AI answer boxes',
    // Money keyword: "answer engine optimization services" / "AEO agency"
    title: 'Answer Engine Optimization (AEO) Services | RankedTag',
    description:
      'AEO services for B2B SaaS: structure your content to win featured snippets, People Also Ask and Google AI Overviews — and become the answer buyers see first.',
    eyebrow: 'SERVICE · AEO',
    h1: 'Answer Engine Optimization: be the answer buyers see first.',
    dek: 'Every high-intent query now resolves to an answer box — a featured snippet, a People-Also-Ask card, an AI Overview. AEO is the craft of formatting truth so machines pick your version of it. Structured questions, direct answers, schema that binds it together.',
    serviceType: 'Answer Engine Optimization',
    pains: [
      {
        h: 'Position #1 is no longer the top',
        p: 'Snippets, PAA boxes and AI Overviews stack above the first organic result. If you rank #1 but your competitor owns the snippet, they get the click and the credibility.',
      },
      {
        h: 'Your pages answer nothing directly',
        p: '1,800 words that circle the question and never state the answer in one extractable sentence. Answer engines skip you for whoever answers in 40 words.',
      },
      {
        h: 'No schema, no seat at the table',
        p: 'FAQ, HowTo, Article and Organization markup are how you hand-deliver your answers to the machine. Most SaaS sites ship none of it correctly.',
      },
    ],
    deliverables: [
      ['Answer opportunity map', 'Every snippet, PAA and AI Overview in your category scored by intent and winnability — with the current owner named.'],
      ['Question-led information architecture', 'H2s that match real queries, answers in the first 40–60 words, one idea per passage. Built for extraction without reading like a robot wrote it.'],
      ['Full schema layer', 'FAQPage, HowTo, Article, Service and Organization JSON-LD — validated, interlinked into one graph, monitored for rich-result eligibility.'],
      ['Snippet-format engineering', 'Paragraph, list and table formats matched to what each query\'s answer box actually renders.'],
      ['PAA expansion strategy', 'Owning follow-up questions so you appear multiple times in a single SERP.'],
      ['Answer-box tracking', 'Snippet and AI Overview ownership tracked monthly for the full query set — wins, losses and who took what.'],
    ],
    process: [
      ['Audit the answer surface', 'We pull every question your buyers ask — PAA, autocomplete, Reddit, sales calls — and map who owns each answer today.'],
      ['Restructure to answer-first', 'Existing pages get direct-answer leads, question H2s and clean passage structure. No content bloat — surgical rewrites.'],
      ['Ship the schema graph', 'Markup wired across the site so every answer carries machine-readable context about who is answering.'],
      ['Win, track, defend', 'Answer boxes flip in weeks, not quarters. We track ownership monthly and defend positions competitors try to take back.'],
    ],
    faqs: [
      ['What is answer engine optimization (AEO)?', 'AEO is optimizing content to be selected as the direct answer to a query — in featured snippets, People Also Ask cards, voice results and Google AI Overviews. It focuses on question-led structure, concise extractable answers and schema markup, so answer engines can lift your content verbatim.'],
      ['What is the difference between AEO and GEO?', 'AEO targets answer boxes on search surfaces — snippets, PAA, AI Overviews. GEO targets citations inside generative chat products like ChatGPT and Perplexity. The content foundation is shared, so we build them together: a page structured for AEO is 80% of the way to being GEO-citable.'],
      ['Does AEO still matter if AI Overviews replace snippets?', 'Yes — more, not less. AI Overviews are assembled from the same extractable, well-structured passages that win snippets, and they cite their sources. The sites winning snippets today are disproportionately the ones cited in AI Overviews tomorrow. Same discipline, higher stakes.'],
      ['How long does it take to win a featured snippet?', 'If you already rank on page one for the query, answer-first restructuring can flip the snippet in 2 to 6 weeks. If you rank nowhere, we build ranking and answer formatting together, which follows the normal SEO curve — first top-20 rankings around weeks 5 to 7.'],
      ['Will restructuring for machines make our content worse for humans?', 'No — done right it is better for both. Direct answers first, detail after, is how good documentation has always been written. Buyers skim exactly like extraction models do; both reward clarity.'],
    ],
    tools: ['/keyword-density-checker', '/competitor-analysis'],
    related: ['ai-seo', 'generative-engine-optimization', 'technical-seo'],
  },
  {
    slug: 'technical-seo',
    nav: 'Technical SEO',
    navDesc: 'Crawlability, Core Web Vitals, schema — the 52-check stack',
    // Money keyword: "technical SEO agency" / "technical SEO services"
    title: 'Technical SEO Services & Audit for B2B SaaS | RankedTag',
    description:
      'Technical SEO for SaaS: crawlability, Core Web Vitals, schema graphs, internal links and AI-crawler readiness — the 52-check foundation content needs to rank.',
    eyebrow: 'SERVICE · TECHNICAL SEO',
    h1: 'Technical SEO: the foundation your content deserves.',
    dek: 'Great content on a broken foundation is money on fire. Slow templates, orphaned pages, mangled schema, AI crawlers bounced at the door — every one of them silently caps how far your rankings can go. We run the 52-check technical stack first, so everything shipped after it compounds.',
    serviceType: 'Technical SEO',
    pains: [
      {
        h: 'Google crawls you like a stranger',
        p: 'Orphan pages, redirect chains, wasted crawl budget on parameter junk. If Googlebot cannot find and trust the page, the copy on it never matters.',
      },
      {
        h: 'Core Web Vitals bleeding rankings',
        p: 'Your marketing site ships 4MB of JavaScript to render a headline. Slow LCP and layout shift are ranking factors — and conversion killers on the same visit.',
      },
      {
        h: 'AI crawlers hit a wall',
        p: 'GPTBot blocked by a default robots.txt line. Content locked behind client-side rendering LLM crawlers never execute. You are invisible to the fastest-growing discovery surface.',
      },
    ],
    deliverables: [
      ['52-point technical audit', 'Crawlability, indexation, Core Web Vitals, mobile, security, schema, GEO/LLM readiness — founder-reviewed, with fixes ranked by ranking impact.'],
      ['Crawl & indexation control', 'Clean sitemap, canonical strategy, robots rules, redirect map, log-informed crawl-budget fixes.'],
      ['Core Web Vitals engineering', 'LCP, INP and CLS fixed at the template level — real code changes, not a plugin and a prayer.'],
      ['Schema graph implementation', 'One coherent JSON-LD graph — Organization, WebSite, Service, FAQ, Article — instead of orphaned snippets that contradict each other.'],
      ['Internal link architecture', 'Hub-and-spoke topology that concentrates authority on money pages instead of spraying it evenly across 400 posts.'],
      ['AI crawler readiness', 'Server-rendered content, llms.txt, correct bot access for GPTBot, ClaudeBot and PerplexityBot — indexed by machines that answer questions.'],
    ],
    process: [
      ['Audit & prioritize', 'Every issue found is scored by ranking impact vs engineering effort. You get a ranked fix-first list, not a 90-page PDF.'],
      ['Fix the blockers', 'We work directly in your stack or hand your engineers surgical, ticket-ready specs. Critical crawl and speed issues die in the first two weeks.'],
      ['Wire the schema graph', 'Structured data shipped and validated across every template, bound into one entity graph.'],
      ['Monitor & harden', 'Search Console, CWV field data and crawl monitoring — regressions caught the week they ship, not the quarter after.'],
    ],
    faqs: [
      ['What is included in a technical SEO audit?', 'Our audit runs 52 checks across seven layers: crawlability and indexation, site architecture and internal links, Core Web Vitals and page speed, mobile experience, security and transport, structured data, and AI/LLM readiness (bot access, server-rendered content, llms.txt). Each finding ships with a fix, an owner and a priority — ranked by ranking impact.'],
      ['Do we need technical SEO if we publish great content?', 'Yes — technical SEO is a multiplier on content. A crawl blocker or a 6-second LCP caps every page on the domain, no matter how good the writing is. Fixing the foundation is usually the cheapest ranking lift available, because it upgrades hundreds of pages at once.'],
      ['Can you work with our engineering team and stack?', 'Yes. We either ship fixes directly (we are comfortable in modern JS stacks, and our own site is a pre-rendered React app we built) or hand your engineers ticket-ready specs with acceptance criteria. No "please fix your website" PDFs.'],
      ['How does technical SEO affect AI search visibility?', 'AI crawlers are less forgiving than Googlebot: most do not execute JavaScript, respect robots.txt strictly, and rely heavily on structured data to understand entities. Server-rendered content, a clean schema graph and correct bot access are prerequisites for being cited by ChatGPT, Perplexity or Google\'s AI Overviews.'],
      ['How fast will we see results from technical fixes?', 'Crawl and indexation fixes show in Search Console within days to weeks. Core Web Vitals improvements need a 28-day field-data window to register. Rankings respond as recrawling propagates — typically visible lift inside 4 to 8 weeks on affected templates.'],
    ],
    tools: ['/page-speed-checker', '/domain-authority-checker'],
    related: ['b2b-saas-seo', 'ai-seo', 'answer-engine-optimization'],
  },
  {
    slug: 'saas-content-marketing',
    nav: 'SEO Content Engine',
    navDesc: 'Senior-written, AI-accelerated content that ranks & converts',
    // Money keyword: "SaaS content marketing agency"
    title: 'SaaS Content Marketing Agency — SEO Content | RankedTag',
    description:
      'SaaS content marketing that ranks and converts: senior strategists pick the fights, Claude compresses research, editors ship weekly. Built to be cited by AI.',
    eyebrow: 'SERVICE · CONTENT ENGINE',
    h1: 'A SaaS content engine that outships teams 10x its size.',
    dek: 'Content is a volume game and a quality game at the same time — which is why most teams lose it. Our engine runs both: senior strategists pick every fight, Claude compresses the research and first drafts, senior editors add the angle machines cannot. Weekly shipping, every piece built to rank on Google and get cited by LLMs.',
    serviceType: 'Content Marketing',
    pains: [
      {
        h: 'Two posts a month won\'t move anything',
        p: 'At agency-writer pace, your category leaders add surface area faster than you do. You are not losing on quality — you are losing on shots taken.',
      },
      {
        h: 'AI slop is worse than silence',
        p: 'Unedited GPT posts get ignored by readers, filtered by Google\'s quality systems and never cited by LLMs. Volume without editorial judgment is negative work.',
      },
      {
        h: 'Content with no conversion path',
        p: 'Posts that rank, get read and lead nowhere. No internal links to money pages, no CTA matched to intent, no capture. Traffic that evaporates on exit.',
      },
    ],
    deliverables: [
      ['Quarterly content strategy', 'Senior-strategist SWOT of your category: which topics you can win, which convert, in what order to attack them.'],
      ['Weekly shipped articles', 'Claude-researched, senior-rewritten, fact-checked. Comparison pages, alternatives pages, use cases, thought leadership — the full funnel.'],
      ['GEO-ready formatting', 'Every piece ships with schema, extractable claims and sourced data, so the same asset ranks in Google and gets quoted by ChatGPT.'],
      ['Conversion architecture', 'Internal links, intent-matched CTAs and capture paths wired into every post. Content that ranks AND routes to pipeline.'],
      ['Content refresh program', 'Decaying winners identified and rebuilt before they slide off page one — the highest-ROI work in content, and the most skipped.'],
      ['Your pipeline, handed over', 'The prompts, workflows and editorial system live on your infrastructure when we are done. No hostage content ops.'],
    ],
    process: [
      ['Category SWOT', 'Senior strategists map every topic in your category against difficulty, intent and revenue — and pick the 90-day battlefield.'],
      ['Brief with humans', 'Every brief is written and approved by a human strategist before a word is drafted. The angle is the moat; Claude does not pick it.'],
      ['Draft fast, edit hard', 'Claude compresses research and first drafts from days to hours. Senior editors rewrite, fact-check and sharpen. Nothing ships unread.'],
      ['Publish, interlink, refresh', 'Weekly shipping with schema and internal links. Winners get defended, decayers get rebuilt, misses get killed.'],
    ],
    faqs: [
      ['Is this just AI-generated content?', 'No. Claude does keyword research, source-gathering and first-pass drafts — the grunt 80%. A senior writer rewrites every piece, fact-checks it and adds the angle and opinion an LLM cannot generate. Nothing publishes without human review. The advantage is the combination: senior judgment at AI speed.'],
      ['How much content do we actually need to compete?', 'It depends on your category\'s surface area, not a magic number. The real answer comes out of the SWOT: we map every winnable topic, then ship weekly against the ranked list. Sendr.ai\'s 1.05M impressions in 6 months came from disciplined weekly shipping into mapped gaps — not from a 100-post blitz.'],
      ['What kinds of content work best for B2B SaaS SEO?', 'Bottom-of-funnel first: comparison pages ("X vs Y"), alternatives pages, use-case and integration pages — they convert from day one. Then the middle: how-tos and templates that earn links and LLM citations. Thought leadership last, once the engine is feeding pipeline.'],
      ['Will Google penalize AI-assisted content?', 'Google\'s published position is that it rewards helpful content regardless of how it is produced, and penalizes low-value automation. Unedited AI slop gets filtered; researched, human-edited, opinionated content ranks. Our human-review gate exists precisely to stay on the right side of that line.'],
      ['Who owns the content and the system when we stop?', 'You do — all of it. Every article is on your domain from day one, and the prompts, n8n workflows and editorial checklists are handed over on your infrastructure. We think retainers should be earned by results, not by holding your content ops hostage.'],
    ],
    tools: ['/keyword-density-checker', '/competitor-analysis'],
    related: ['b2b-saas-seo', 'generative-engine-optimization', 'ai-seo'],
  },
];

export const SERVICE_BY_SLUG = Object.fromEntries(SERVICES.map((s) => [s.slug, s]));

/** Hub-page + shared meta (imported by routeMeta.js so build-time head rewrite works). */
export const SERVICES_HUB_META = {
  title: 'SEO, AI SEO, GEO & AEO Services for B2B SaaS | RankedTag',
  description:
    'B2B SaaS SEO, AI SEO, GEO, AEO, technical SEO and content — six services, one inbound engine. Proof: sendr.ai, 0 to 1.05M impressions in 6 months.',
  canonical: `${SITE}/services`,
};

export const serviceUrl = (slug) => `${SITE}/services/${slug}`;

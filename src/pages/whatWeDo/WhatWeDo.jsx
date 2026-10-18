import { Link } from 'react-router-dom';
import Nav from '../../components/Nav.jsx';
import SiteFooter from '../../components/SiteFooter.jsx';
import usePageMeta from '../../hooks/usePageMeta.js';
import useScrollReveal from '../../hooks/useScrollReveal.js';
import JsonLd from '../../components/JsonLd.jsx';
import { breadcrumb, faqPage, ORG_ID, SITE } from '../../lib/schema.js';
import ToolFaq from '../../components/seo/ToolFaq.jsx';
import '../../components/seo/toolGuide.css';
import { SERVICES, SERVICES_HUB_META } from './capabilitiesData.js';
import '../Home.css';
import './WhatWeDo.css';

// Answered so the first sentence stands alone: these are the questions the hub
// has to settle before a visitor picks a child page, and the first sentence of
// each is what an answer engine can lift without the rest of the page.
const HUB_FAQ = [
  [
    'Which capability should we start with?',
    'Start with technical SEO if your pages are not being indexed, and with full-stack SEO if they are. Indexation is the gate: content, AEO and GEO all assume search engines can crawl, read and store your pages, so a crawl or schema problem makes every other service slower and more expensive. Once the foundation is sound, the order that compounds fastest is content first, then AEO and GEO on top of the pages content produced.',
  ],
  [
    'What is the difference between AI SEO, AEO and GEO?',
    'They target three different surfaces. AI SEO covers visibility across Google AI Overviews and AI-driven search as a whole. AEO is narrower: winning the answer slot itself, which means featured snippets, People Also Ask and AI answer boxes. GEO is about being cited and recommended inside assistant answers from ChatGPT, Perplexity, Gemini and Claude, where there is no ranked list of links at all. The underlying work overlaps, which is why most engagements buy more than one.',
  ],
  [
    'Can I buy one service on its own?',
    'Yes. Each of the six is scoped and priced to run on its own, and plenty of engagements start as a single discipline. They compound when combined, because technical work makes content indexable and content gives AEO and GEO something to cite, but none of them depends on buying the others first.',
  ],
  [
    'How much do these capabilities cost?',
    'Pricing is shared after the founder review, because a six-page local business and a 40,000-SKU catalogue need different scopes. Apply with your domain, the founder runs the 52-check audit, and you get a real number within 48 hours rather than a sales sequence.',
  ],
];

// /what-we-do hub — the crawlable index of every capability page. An ItemList node
// tells Google (and answer engines) these six URLs form one catalog owned by #org.
const HUB_JSONLD = [
  {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${SITE}/what-we-do#webpage`,
    url: `${SITE}/what-we-do`,
    name: SERVICES_HUB_META.title,
    description: SERVICES_HUB_META.description,
    isPartOf: { '@id': `${SITE}/#website` },
    about: { '@id': ORG_ID },
    inLanguage: 'en',
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: SERVICES.map((s, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: s.nav,
        url: `${SITE}/what-we-do/${s.slug}`,
      })),
    },
  },
  breadcrumb([
    { name: 'Home', item: `${SITE}/` },
    { name: 'What we do', item: `${SITE}/what-we-do` },
  ]),
  faqPage(HUB_FAQ, { isPartOf: `${SITE}/what-we-do#webpage` }),
];

export default function WhatWeDo() {
  useScrollReveal();
  usePageMeta(SERVICES_HUB_META);

  return (
    <>
      <JsonLd data={HUB_JSONLD} />
      <Nav variant="audit" />

      <main className="svc-page">
        <section className="svc-hero">
          <div className="container grid12 svc-hero-grid">
            <div className="col-12 svc-hero-top">
              <nav className="svc-crumb" aria-label="Breadcrumb">
                <Link to="/" className="link-wipe">Home</Link>
                <span aria-hidden="true">/</span>
                <span aria-current="page">What we do</span>
              </nav>
              <span className="idx" aria-hidden="true">001</span>
            </div>

            <div className="col-10 svc-hero-head">
              <span className="eyebrow bracket svc-eyebrow">WHAT WE DO · ONE ENGINE, SIX DISCIPLINES</span>
              <h1 className="svc-h1">SEO, AI SEO, GEO &amp; AEO, under one roof.</h1>
            </div>

            <div className="col-6 svc-hero-dek">
              {/* Direct answer first, narrative second. An answer engine asked
                  "what does RankedTag do" can lift this paragraph whole. */}
              <p className="svc-dek">
                RankedTag runs six capabilities: full-stack SEO, AI SEO, generative engine optimization,
                answer engine optimization, technical SEO and content marketing. They are the craft, applied
                the same way whoever you sell to. Buy one on its own or buy the whole engine. Every page we ship is built twice over, to rank in Google
                <em> and</em> to be quotable by ChatGPT, Perplexity, Gemini and Claude.
              </p>
              <p className="svc-dek">
                Senior strategists pick the fights, Claude compresses the research, editors ship weekly.
                Proof: sendr.ai, 0 to 1.05M impressions in 6 months, #2 in Google's AI Overview above
                ZoomInfo.
              </p>
            </div>
            <div className="col-5 start-8 svc-hero-cta">
              <Link to="/apply" className="btn btn-red btn-lg ar-parent">
                Apply for a free founder review <span className="ar-ne">↗</span>
              </Link>
            </div>
          </div>
        </section>

        {/* Index of the six disciplines — numbered editorial rows, not cards. */}
        <section className="svc-index ruled" data-reveal>
          <div className="container">
            <ol className="svc-rows" data-reveal-children>
              {SERVICES.map((s, i) => (
                <li key={s.slug}>
                  <Link to={`/what-we-do/${s.slug}`} className="svc-row ar-parent">
                    <span className="svc-row-num" aria-hidden="true">{String(i + 1).padStart(3, '0')}</span>
                    <h2 className="svc-row-h">{s.nav}</h2>
                    <p className="svc-row-desc">{s.navDesc}</p>
                    <span className="svc-row-go">Explore the capability <span className="ar">→</span></span>
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Prose hub. The index above is the catalog; this is the page's own
            content, the thing that lets /what-we-do rank for the category term
            instead of competing with its own six children on 257 words. Every
            service is linked here in context, with its own name as the anchor
            text, because that is where a crawler picks up what the target page
            is about. */}
        <section className="svc-prose ruled" data-reveal>
          <div className="container">
            <article className="dg-article">
              <section className="dg-section">
                <h2 id="which-service">Which service do you actually need?</h2>
                <p>
                  Most teams arrive knowing something is wrong with their search presence and not which of
                  the six fixes it. The short version: find the first thing that is broken and start there.
                  Each description below says who it is for, not what it includes.
                </p>
                <p>
                  <strong>Pages are not getting indexed, or the site is slow and the schema is a mess.</strong>{' '}
                  Start with <Link to="/what-we-do/technical-seo">technical SEO</Link>. Crawlability, Core Web
                  Vitals, the schema graph, internal links and AI-crawler access are the 52-check foundation we
                  run on every domain before a word of content ships. A page Google cannot crawl cannot rank,
                  and a page an AI crawler is blocked from cannot be cited, however good the writing is.
                </p>
                <p>
                  <strong>The foundation is fine but there is nothing on the site worth ranking.</strong>{' '}
                  Start with <Link to="/what-we-do/content-marketing">content marketing</Link>. Senior
                  strategists pick the targets, Claude compresses the research, and a senior writer rewrites
                  every draft. The output is the comparison, alternatives, buying-guide and use-case pages your
                  buyers actually search for, not another round of "top 10 tools" that Google collapses into
                  one answer.
                </p>
                <p>
                  <strong>You want the whole engine, measured on revenue.</strong> That is{' '}
                  <Link to="/what-we-do/seo">full-stack SEO</Link>: technical foundation, intent-first
                  keyword architecture, the content engine, entity and authority work, and instrumentation
                  that routes enquiries where your team already works. It is the same stack that took
                  sendr.ai from zero to 1.05M impressions in six months.
                </p>
                <p>
                  <strong>You rank on Google, but the AI Overview above your result names someone else.</strong>{' '}
                  That is <Link to="/what-we-do/ai-seo">AI SEO</Link>. The ten blue links are being pushed down
                  the page by an answer most of your buyers read instead, and the sources it draws on are not
                  always the pages ranking beneath it.
                </p>
                <p>
                  <strong>You want the answer slot itself.</strong> That is{' '}
                  <Link to="/what-we-do/answer-engine-optimization">answer engine optimization</Link>: featured
                  snippets, People Also Ask and the AI answer boxes, won by structuring a page so the answer
                  to a specific question is self-contained, unambiguous and sitting exactly where an extractor
                  looks for it.
                </p>
                <p>
                  <strong>Buyers ask ChatGPT for a shortlist and you are not on it.</strong> That is{' '}
                  <Link to="/what-we-do/generative-engine-optimization">generative engine optimization</Link>,
                  the discipline of being cited and recommended inside assistant answers rather than ranked in
                  a list of links. There is no analytics event for the deals lost here, which is why most
                  teams find out late.
                </p>
              </section>

              <section className="dg-section">
                <h2 id="how-they-fit">How the six capabilities fit together</h2>
                <p>
                  They are one engine sold in parts, and the parts have an order. Technical work makes a page
                  reachable. Content gives search engines and models something worth storing. AEO and GEO
                  decide whether that stored page is the one quoted back to a buyer. Running them out of order
                  is the most common way teams waste a year: GEO work on a site whose pages are not
                  indexed changes nothing, because a model can only cite what it can retrieve.
                </p>
                <p>
                  That is also why the engagements that compound fastest buy more than one discipline. The
                  same restructured page can rank in Google, win a featured snippet and be the passage
                  ChatGPT lifts, so the third asset costs a fraction of the first. You can still buy any one
                  service on its own, and plenty of engagements start that way.
                </p>
                <p>
                  If you would rather see the method before you talk to anyone, the four free tools run the
                  first diagnostic for you: the{' '}
                  <Link to="/competitor-analysis">competitor analysis tool</Link> compares your page against
                  up to five rivals, the{' '}
                  <Link to="/keyword-density-checker">keyword density checker</Link> shows what a page is
                  actually about, the{' '}
                  <Link to="/domain-authority-checker">domain authority checker</Link> benchmarks the gap, and
                  the <Link to="/page-speed-checker">page speed checker</Link> covers the performance half of
                  the technical audit. No account, no API key.
                </p>
              </section>

              <section className="dg-section">
                <h2 id="services-faq">Frequently asked questions</h2>
                <ToolFaq items={HUB_FAQ} />
              </section>
            </article>
          </div>
        </section>

        <section className="svc-proof ruled" data-reveal>
          <div className="container">
            <div className="section-head">
              <span className="eyebrow" data-num="002">PROOF · LIVE NUMBERS, NOT PROMISES</span>
              <div>
                <h2 className="h-2">Every service above shipped inside one real engagement.</h2>
                <p className="lead">
                  sendr.ai bought the whole engine — technical foundation, content engine, AEO structure, GEO
                  citations. Six months later: 1.05M impressions, 7,430 clicks, and the #2 answer in Google's AI
                  Overview, above ZoomInfo. You can buy the disciplines separately; they compound together.
                </p>
              </div>
            </div>
            <div className="svc-proof-stats" data-reveal-children>
              <div className="svc-proof-stat"><strong data-countup="1500">1.05M</strong><span>organic impressions · 6 months</span></div>
              <div className="svc-proof-stat"><strong data-countup="1400">7.43k</strong><span>clicks · same window</span></div>
              <div className="svc-proof-stat"><strong>#2</strong><span>Google AI Overview · above ZoomInfo</span></div>
              <div className="svc-proof-stat"><strong data-countup="1200">4</strong><span>founder reviews taken per month</span></div>
            </div>
            <Link to="/case-study/sendr" className="case-readmore link-wipe ar-parent">
              Read the full sendr.ai case study <span className="ar">→</span>
            </Link>
          </div>
        </section>

        <section className="final-cta ruled" data-reveal>
          <div className="container final-cta-inner">
            <span className="eyebrow bracket final-cta-eyebrow">FOUNDER REVIEW</span>
            <h2 className="final-h">
              Not sure which service you need?<br />
              <span className="ser">That is what the review is for.</span>
            </h2>
            <p className="final-sub">
              Apply with your domain. The founder runs the 52-check audit, tells you which of the six
              disciplines will actually move your pipeline, and replies within 48 hours.
            </p>
            <div className="final-cta-btns">
              <Link to="/apply" className="btn btn-primary btn-lg ar-parent">Apply for the review <span className="ar-ne">↗</span></Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}

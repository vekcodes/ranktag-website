import { Link } from 'react-router-dom';
import Nav from '../../components/Nav.jsx';
import SiteFooter from '../../components/SiteFooter.jsx';
import usePageMeta from '../../hooks/usePageMeta.js';
import useScrollReveal from '../../hooks/useScrollReveal.js';
import JsonLd from '../../components/JsonLd.jsx';
import { breadcrumb, ORG_ID, SITE } from '../../lib/schema.js';
import { SERVICES, SERVICES_HUB_META } from './servicesData.js';
import '../Home.css';
import './Services.css';

// /services hub — the crawlable index of every service page. An ItemList node
// tells Google (and answer engines) these six URLs form one catalog owned by #org.
const HUB_JSONLD = [
  {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${SITE}/services#webpage`,
    url: `${SITE}/services`,
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
        url: `${SITE}/services/${s.slug}`,
      })),
    },
  },
  breadcrumb([
    { name: 'Home', item: `${SITE}/` },
    { name: 'Services', item: `${SITE}/services` },
  ]),
];

export default function Services() {
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
                <span aria-current="page">Services</span>
              </nav>
              <span className="idx" aria-hidden="true">001</span>
            </div>

            <div className="col-10 svc-hero-head">
              <span className="eyebrow bracket svc-eyebrow">SERVICES · ONE ENGINE, SIX DISCIPLINES</span>
              <h1 className="svc-h1">SEO, AI SEO, GEO &amp; AEO services for B2B SaaS.</h1>
            </div>

            <div className="col-6 svc-hero-dek">
              <p className="svc-dek">
                Six disciplines, one inbound engine. Senior strategists pick the fights, Claude compresses the
                research, editors ship weekly — and every page is built to rank on Google <em>and</em> get cited
                by ChatGPT, Perplexity, Gemini and Claude. Proof: sendr.ai, 0 → 1.05M impressions in 6 months,
                #2 in Google's AI Overview above ZoomInfo.
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
                  <Link to={`/services/${s.slug}`} className="svc-row ar-parent">
                    <span className="svc-row-num" aria-hidden="true">{String(i + 1).padStart(3, '0')}</span>
                    <h2 className="svc-row-h">{s.nav}</h2>
                    <p className="svc-row-desc">{s.navDesc}</p>
                    <span className="svc-row-go">Explore the service <span className="ar">→</span></span>
                  </Link>
                </li>
              ))}
            </ol>
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
              <div className="svc-proof-stat"><strong data-countup="1200">4</strong><span>SaaS founders taken per month</span></div>
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

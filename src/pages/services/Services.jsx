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
          <div className="container">
            <nav className="svc-crumb" aria-label="Breadcrumb">
              <Link to="/">Home</Link>
              <span aria-hidden="true">/</span>
              <span aria-current="page">Services</span>
            </nav>
            <div className="eyebrow" style={{ color: 'var(--red)' }}>SERVICES · ONE ENGINE, SIX DISCIPLINES</div>
            <h1 className="svc-h1">SEO, AI SEO, GEO &amp; AEO services for B2B SaaS.</h1>
            <p className="svc-dek">
              Six disciplines, one inbound engine. Senior strategists pick the fights, Claude compresses the
              research, editors ship weekly — and every page is built to rank on Google <em>and</em> get cited
              by ChatGPT, Perplexity, Gemini and Claude. Proof: sendr.ai, 0 → 1.05M impressions in 6 months,
              #2 in Google's AI Overview above ZoomInfo.
            </p>
            <div className="svc-hero-cta">
              <Link to="/apply" className="btn btn-red btn-lg">
                Apply for a free founder review <span className="ar">↗</span>
              </Link>
            </div>
          </div>
        </section>

        <section className="svc-hub-grid-wrap" data-reveal>
          <div className="container">
            <div className="svc-hub-grid">
              {SERVICES.map((s, i) => (
                <Link key={s.slug} to={`/services/${s.slug}`} className="svc-hub-card">
                  <div className="svc-hub-num">0{i + 1}</div>
                  <h2>{s.nav}</h2>
                  <p>{s.navDesc}</p>
                  <span className="svc-hub-go">Explore the service <span className="ar">→</span></span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="svc-proof" data-reveal>
          <div className="container">
            <div className="section-head">
              <div className="eyebrow">PROOF · LIVE NUMBERS, NOT PROMISES</div>
              <h2 className="h-1">Every service above shipped inside one real engagement.</h2>
              <p className="lead">
                sendr.ai bought the whole engine — technical foundation, content engine, AEO structure, GEO
                citations. Six months later: 1.05M impressions, 7,430 clicks, and the #2 answer in Google's AI
                Overview, above ZoomInfo. You can buy the disciplines separately; they compound together.
              </p>
            </div>
            <div className="svc-proof-stats">
              <div className="svc-proof-stat"><strong>1.05M</strong><span>organic impressions · 6 months</span></div>
              <div className="svc-proof-stat"><strong>7.43k</strong><span>clicks · same window</span></div>
              <div className="svc-proof-stat"><strong>#2</strong><span>Google AI Overview · above ZoomInfo</span></div>
              <div className="svc-proof-stat"><strong>4</strong><span>SaaS founders taken per month</span></div>
            </div>
            <Link to="/case-study/sendr" className="case-readmore">
              Read the full sendr.ai case study <span className="ar">→</span>
            </Link>
          </div>
        </section>

        <section className="final-cta" data-reveal>
          <div className="container final-cta-inner">
            <h2 className="final-h">
              Not sure which service you need?<br />
              <span className="ser">That is what the review is for.</span>
            </h2>
            <p className="final-sub">
              Apply with your domain. The founder runs the 52-check audit, tells you which of the six
              disciplines will actually move your pipeline, and replies within 48 hours.
            </p>
            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', justifyContent: 'center' }}>
              <Link to="/apply" className="btn btn-primary btn-lg">Apply for the review <span className="ar">↗</span></Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}

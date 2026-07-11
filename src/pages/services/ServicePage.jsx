import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import Nav from '../../components/Nav.jsx';
import SiteFooter from '../../components/SiteFooter.jsx';
import NotFound from '../NotFound.jsx';
import usePageMeta from '../../hooks/usePageMeta.js';
import useScrollReveal from '../../hooks/useScrollReveal.js';
import JsonLd from '../../components/JsonLd.jsx';
import { breadcrumb, faqPage, ORG_ID, SITE } from '../../lib/schema.js';
import { SERVICE_BY_SLUG, SERVICES } from './servicesData.js';
import '../Home.css';
import './Services.css';

// One template renders all /services/<slug> pages from servicesData.js. Each
// page ships its own Service + WebPage + BreadcrumbList + FAQPage JSON-LD and
// is pre-rendered at build time (vite.config.js includedRoutes), so crawlers
// get complete static HTML with per-route meta.
function serviceJsonLd(svc) {
  const url = `${SITE}/services/${svc.slug}`;
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'Service',
      '@id': `${url}#service`,
      name: svc.nav,
      serviceType: svc.serviceType,
      description: svc.description,
      url,
      provider: { '@id': ORG_ID },
      areaServed: { '@type': 'Place', name: 'Worldwide' },
      audience: { '@type': 'BusinessAudience', name: 'B2B SaaS companies' },
      mainEntityOfPage: { '@type': 'WebPage', '@id': url },
      inLanguage: 'en',
    },
    breadcrumb([
      { name: 'Home', item: `${SITE}/` },
      { name: 'Services', item: `${SITE}/services` },
      { name: svc.nav, item: url },
    ]),
    faqPage(svc.faqs, { id: `${url}#faq` }),
  ];
}

const TOOL_LABELS = {
  '/keyword-density-checker': 'Keyword Density Checker',
  '/domain-authority-checker': 'Domain Authority Checker',
  '/page-speed-checker': 'Page Speed Checker',
  '/competitor-analysis': 'Competitor Analysis',
};

export default function ServicePage() {
  const { slug } = useParams();
  const svc = SERVICE_BY_SLUG[slug];

  useScrollReveal();
  usePageMeta(
    svc
      ? { title: svc.title, description: svc.description, canonical: `${SITE}/services/${svc.slug}` }
      : undefined
  );

  // Same delegated FAQ accordion the homepage uses (shared .faq-* styles).
  useEffect(() => {
    const handler = (e) => {
      const q = e.target.closest('.faq-q');
      if (!q) return;
      const item = q.parentElement;
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item').forEach((i) => i.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  if (!svc) return <NotFound />;

  const related = svc.related.map((s) => SERVICE_BY_SLUG[s]).filter(Boolean);

  return (
    <>
      <JsonLd data={serviceJsonLd(svc)} />
      <Nav variant="audit" />

      <main className="svc-page">
        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <section className="svc-hero">
          <div className="container">
            <nav className="svc-crumb" aria-label="Breadcrumb">
              <Link to="/">Home</Link>
              <span aria-hidden="true">/</span>
              <Link to="/services">Services</Link>
              <span aria-hidden="true">/</span>
              <span aria-current="page">{svc.nav}</span>
            </nav>
            <div className="eyebrow" style={{ color: 'var(--red)' }}>{svc.eyebrow}</div>
            <h1 className="svc-h1">{svc.h1}</h1>
            <p className="svc-dek">{svc.dek}</p>
            <div className="svc-hero-cta">
              <Link to="/apply" className="btn btn-red btn-lg">
                Apply for a free founder review <span className="ar">↗</span>
              </Link>
              <Link to="/case-study/sendr" className="btn btn-outline btn-lg">
                See the proof first <span className="ar">→</span>
              </Link>
            </div>
            <ul className="hero-benefits svc-hero-benefits">
              <li><span className="b-check">✓</span> founder reviews every domain personally</li>
              <li><span className="b-check">✓</span> reply within 48 hours</li>
              <li><span className="b-check">✓</span> only 4 SaaS taken per month</li>
            </ul>
          </div>
        </section>

        {/* ── Pain points ──────────────────────────────────────────────── */}
        <section className="problem svc-problem" data-reveal>
          <div className="container">
            <div className="eyebrow dark mb-6" style={{ color: 'var(--red)' }}>WHY THIS KEEPS FAILING IN-HOUSE</div>
            <div className="problem-grid">
              {svc.pains.map((pain, i) => (
                <div className="problem-cell" key={pain.h}>
                  <div className="num">0{i + 1}</div>
                  <h3>{pain.h}</h3>
                  <p>{pain.p}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Deliverables ─────────────────────────────────────────────── */}
        <section className="svc-deliver" data-reveal>
          <div className="container">
            <div className="section-head">
              <div className="eyebrow">WHAT YOU GET</div>
              <h2 className="h-1">Inside the {svc.nav.toLowerCase()} engagement</h2>
            </div>
            <div className="svc-deliver-grid">
              {svc.deliverables.map(([h, p]) => (
                <div className="svc-deliver-card" key={h}>
                  <h3>{h}</h3>
                  <p>{p}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Process ──────────────────────────────────────────────────── */}
        <section className="svc-process" data-reveal>
          <div className="container">
            <div className="section-head">
              <div className="eyebrow">HOW IT RUNS</div>
              <h2 className="h-1">The process, week by week</h2>
            </div>
            <ol className="svc-steps">
              {svc.process.map(([h, p], i) => (
                <li className="svc-step" key={h}>
                  <div className="svc-step-num">{String(i + 1).padStart(2, '0')}</div>
                  <div>
                    <h3>{h}</h3>
                    <p>{p}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ── Proof (sendr.ai) ─────────────────────────────────────────── */}
        <section className="svc-proof" data-reveal>
          <div className="container">
            <div className="section-head">
              <div className="eyebrow">PROOF · LIVE NUMBERS, NOT PROMISES</div>
              <h2 className="h-1">
                The same engine took <span style={{ color: 'var(--red)' }}>sendr.ai</span> from zero to{' '}
                <span style={{ color: 'var(--red)' }}>1.05M impressions.</span>
              </h2>
              <p className="lead">
                Six months, no ads, no outreach: 1.05M organic impressions, 7,430 clicks, and the #2 spot in
                Google's AI Overview for "what is the best GTM tool" — six places above ZoomInfo. Live Google
                Search Console data you can cross-check yourself.
              </p>
            </div>
            <div className="svc-proof-stats">
              <div className="svc-proof-stat"><strong>1.05M</strong><span>organic impressions · 6 months</span></div>
              <div className="svc-proof-stat"><strong>7.43k</strong><span>clicks · same window</span></div>
              <div className="svc-proof-stat"><strong>#2</strong><span>Google AI Overview · above ZoomInfo</span></div>
              <div className="svc-proof-stat"><strong>30–45d</strong><span>to a first LLM citation</span></div>
            </div>
            <Link to="/case-study/sendr" className="case-readmore">
              Read the full sendr.ai case study <span className="ar">→</span>
            </Link>
          </div>
        </section>

        {/* ── Free tools (the USP) ─────────────────────────────────────── */}
        <section className="svc-tools" data-reveal>
          <div className="container">
            <div className="section-head">
              <div className="eyebrow">TRY BEFORE YOU TRUST</div>
              <h2 className="h-1">Run our free tools on your site first.</h2>
              <p className="lead">
                We built our own SEO tools and give them away. If they do not make you smarter about your own
                site, you should not hire us — that is the deal.
              </p>
            </div>
            <div className="svc-tools-row">
              {svc.tools.map((path) => (
                <Link key={path} to={path} className="svc-tool-link">
                  {TOOL_LABELS[path]} <span className="ar">→</span>
                </Link>
              ))}
              <Link to="/#free-seo-tools" className="svc-tool-link svc-tool-link-all">
                All free tools <span className="ar">→</span>
              </Link>
            </div>
          </div>
        </section>

        {/* ── FAQ ──────────────────────────────────────────────────────── */}
        <section data-reveal>
          <div className="container">
            <div className="section-head">
              <div className="eyebrow">FAQ</div>
              <h2 className="h-1">{svc.nav}, asked and answered.</h2>
            </div>
            <div className="faq-wrap">
              <div className="faq-list">
                {svc.faqs.map(([q, a]) => (
                  <div className="faq-item" key={q}>
                    <button className="faq-q">{q}<span className="faq-ic">+</span></button>
                    <div className="faq-a"><div className="faq-a-inner">{a}</div></div>
                  </div>
                ))}
              </div>
              <div className="faq-side">
                <h3>Not sure this is the right service?</h3>
                <p>Apply anyway. The founder reviews every domain personally and tells you what you actually need — even if it is "not us, not yet".</p>
                <Link to="/apply" className="btn btn-red w-full" style={{ justifyContent: 'center' }}>
                  Apply for review <span className="ar">↗</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── Related services ─────────────────────────────────────────── */}
        <section className="svc-related" data-reveal>
          <div className="container">
            <div className="eyebrow">PAIRS WITH</div>
            <div className="svc-related-row">
              {related.map((r) => (
                <Link key={r.slug} to={`/services/${r.slug}`} className="svc-related-card">
                  <span className="svc-related-label">{r.nav}</span>
                  <span className="svc-related-desc">{r.navDesc}</span>
                  <span className="svc-related-go">Explore <span className="ar">→</span></span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── Final CTA ────────────────────────────────────────────────── */}
        <section className="final-cta" data-reveal>
          <div className="container final-cta-inner">
            <h2 className="final-h">
              Four founder slots a month.<br />
              <span className="ser">One is yours if it fits.</span>
            </h2>
            <p className="final-sub">
              Drop your domain. The founder runs the 52-check review personally and replies within 48 hours —
              with a real opinion, even if the answer is no.
            </p>
            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', justifyContent: 'center' }}>
              <Link to="/apply" className="btn btn-primary btn-lg">Apply for the engine <span className="ar">↗</span></Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}

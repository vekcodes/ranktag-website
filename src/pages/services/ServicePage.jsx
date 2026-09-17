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
      document.querySelectorAll('.faq-item').forEach((i) => {
        i.classList.remove('open');
        i.querySelector('.faq-q')?.setAttribute('aria-expanded', 'false');
      });
      if (!isOpen) {
        item.classList.add('open');
        q.setAttribute('aria-expanded', 'true');
      }
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  if (!svc) return <NotFound />;

  const related = svc.related.map((s) => SERVICE_BY_SLUG[s]).filter(Boolean);
  // Position in the canonical service order, used as the page's index marker.
  const svcIndex = String(SERVICES.findIndex((s) => s.slug === svc.slug) + 1).padStart(3, '0');

  return (
    <>
      <JsonLd data={serviceJsonLd(svc)} />
      <Nav variant="audit" />

      <main className="svc-page">
        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <section className="svc-hero">
          <div className="container grid12 svc-hero-grid">
            <div className="col-12 svc-hero-top">
              <nav className="svc-crumb" aria-label="Breadcrumb">
                <Link to="/" className="link-wipe">Home</Link>
                <span aria-hidden="true">/</span>
                <Link to="/services" className="link-wipe">Services</Link>
                <span aria-hidden="true">/</span>
                <span aria-current="page">{svc.nav}</span>
              </nav>
              <span className="idx" aria-hidden="true">{svcIndex}</span>
            </div>

            <div className="col-10 svc-hero-head">
              <span className="eyebrow bracket svc-eyebrow">{svc.eyebrow}</span>
              <h1 className="svc-h1">{svc.h1}</h1>
            </div>

            <div className="col-6 svc-hero-dek">
              <p className="svc-dek">{svc.dek}</p>
              <ul className="hero-benefits svc-hero-benefits">
                <li><span className="b-check">✓</span> founder reviews every domain personally</li>
                <li><span className="b-check">✓</span> reply within 48 hours</li>
                <li><span className="b-check">✓</span> only 4 SaaS taken per month</li>
              </ul>
            </div>
            <div className="col-5 start-8 svc-hero-cta">
              <Link to="/apply" className="btn btn-red btn-lg ar-parent">
                Apply for a free founder review <span className="ar-ne">↗</span>
              </Link>
              <Link to="/case-study/sendr" className="btn btn-outline btn-lg ar-parent">
                See the proof first <span className="ar">→</span>
              </Link>
            </div>
          </div>
        </section>

        {/* ── Pain points ──────────────────────────────────────────────── */}
        <section className="problem svc-problem ruled" data-reveal>
          <div className="container grid12">
            <div className="col-4 problem-aside">
              <span className="eyebrow bracket">WHY THIS KEEPS FAILING IN-HOUSE</span>
            </div>
            <ol className="col-7 start-6 problem-list" data-reveal-children>
              {svc.pains.map((pain, i) => (
                <li className="problem-row" key={pain.h}>
                  <span className="problem-num" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                  <div className="problem-body">
                    <h3>{pain.h}</h3>
                    <p>{pain.p}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ── Deliverables ─────────────────────────────────────────────── */}
        <section className="svc-deliver ruled" data-reveal>
          <div className="container">
            <div className="section-head">
              <span className="eyebrow" data-num="001">WHAT YOU GET</span>
              <h2 className="h-2">Inside the {svc.nav.toLowerCase()} engagement</h2>
            </div>
            <ol className="svc-deliver-list" data-reveal-children>
              {svc.deliverables.map(([h, p], i) => (
                <li className="svc-deliver-row" key={h}>
                  <span className="svc-deliver-num" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                  <h3>{h}</h3>
                  <p>{p}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ── Process ──────────────────────────────────────────────────── */}
        <section className="svc-process ruled" data-reveal>
          <div className="container">
            <div className="section-head">
              <span className="eyebrow" data-num="002">HOW IT RUNS</span>
              <h2 className="h-2">The process, week by week</h2>
            </div>
            <ol className="svc-timeline" data-reveal-children>
              {svc.process.map(([h, p], i) => (
                <li className="svc-tl-step" key={h}>
                  <span className="svc-tl-marker" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                  <div className="svc-tl-body">
                    <h3>{h}</h3>
                    <p>{p}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ── Proof (sendr.ai) ─────────────────────────────────────────── */}
        <section className="svc-proof ruled" data-reveal>
          <div className="container">
            <div className="section-head">
              <span className="eyebrow" data-num="003">PROOF · LIVE NUMBERS, NOT PROMISES</span>
              <div>
                <h2 className="h-2">
                  The same engine took <span className="accent">sendr.ai</span> from zero to{' '}
                  <span className="accent">1.05M impressions.</span>
                </h2>
                <p className="lead">
                  Six months, no ads, no outreach: 1.05M organic impressions, 7,430 clicks, and the #2 spot in
                  Google's AI Overview for "what is the best GTM tool" — six places above ZoomInfo. Live Google
                  Search Console data you can cross-check yourself.
                </p>
              </div>
            </div>
            <div className="svc-proof-stats" data-reveal-children>
              <div className="svc-proof-stat"><strong data-countup="1500">1.05M</strong><span>organic impressions · 6 months</span></div>
              <div className="svc-proof-stat"><strong data-countup="1400">7.43k</strong><span>clicks · same window</span></div>
              <div className="svc-proof-stat"><strong>#2</strong><span>Google AI Overview · above ZoomInfo</span></div>
              <div className="svc-proof-stat"><strong>30–45d</strong><span>to a first LLM citation</span></div>
            </div>
            <Link to="/case-study/sendr" className="case-readmore link-wipe ar-parent">
              Read the full sendr.ai case study <span className="ar">→</span>
            </Link>
          </div>
        </section>

        {/* ── Free tools (the USP) ─────────────────────────────────────── */}
        <section className="svc-tools ruled" data-reveal>
          <div className="container">
            <div className="section-head">
              <span className="eyebrow" data-num="004">TRY BEFORE YOU TRUST</span>
              <div>
                <h2 className="h-2">Run our free tools on your site first.</h2>
                <p className="lead">
                  We built our own SEO tools and give them away. If they do not make you smarter about your own
                  site, you should not hire us — that is the deal.
                </p>
              </div>
            </div>
            <div className="svc-tools-row" data-reveal-children>
              {svc.tools.map((path, i) => (
                <Link key={path} to={path} className="svc-tool-link ar-parent">
                  <span className="idx">{String(i + 1).padStart(3, '0')}</span>
                  <span className="svc-tool-label">{TOOL_LABELS[path]}</span>
                  <span className="ar" aria-hidden="true">→</span>
                </Link>
              ))}
              <Link to="/#free-seo-tools" className="svc-tool-link svc-tool-link-all ar-parent">
                <span className="svc-tool-label">All free tools</span>
                <span className="ar" aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </section>

        {/* ── FAQ ──────────────────────────────────────────────────────── */}
        <section className="faq-section ruled" data-reveal>
          <div className="container grid12">
            <div className="col-4 faq-aside">
              <span className="eyebrow" data-num="005">FAQ</span>
              <h2 className="h-2 faq-h">{svc.nav}, asked and answered.</h2>
              <div className="faq-side">
                <h3>Not sure this is the right service?</h3>
                <p>Apply anyway. The founder reviews every domain personally and tells you what you actually need — even if it is "not us, not yet".</p>
                <Link to="/apply" className="btn btn-red w-full ar-parent">
                  Apply for review <span className="ar-ne">↗</span>
                </Link>
              </div>
            </div>
            <div className="col-7 start-6 faq-list">
              {svc.faqs.map(([q, a], i) => (
                <div className="faq-item" key={q}>
                  <button type="button" className="faq-q" aria-expanded="false">
                    <span className="faq-n" aria-hidden="true">{String(i + 1).padStart(3, '0')}</span>
                    <span className="faq-qt">{q}</span>
                    <span className="faq-ic" aria-hidden="true">+</span>
                  </button>
                  <div className="faq-a"><div className="faq-a-inner">{a}</div></div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Related services ─────────────────────────────────────────── */}
        <section className="svc-related ruled" data-reveal>
          <div className="container">
            <span className="eyebrow bracket">PAIRS WITH</span>
            <ol className="svc-rows svc-rows-compact" data-reveal-children>
              {related.map((r, i) => (
                <li key={r.slug}>
                  <Link to={`/services/${r.slug}`} className="svc-row ar-parent">
                    <span className="svc-row-num" aria-hidden="true">{String(i + 1).padStart(3, '0')}</span>
                    <span className="svc-row-h">{r.nav}</span>
                    <p className="svc-row-desc">{r.navDesc}</p>
                    <span className="svc-row-go">Explore <span className="ar">→</span></span>
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ── Final CTA ────────────────────────────────────────────────── */}
        <section className="final-cta ruled" data-reveal>
          <div className="container final-cta-inner">
            <span className="eyebrow bracket final-cta-eyebrow">FOUR SLOTS A MONTH</span>
            <h2 className="final-h">
              Four founder slots a month.<br />
              <span className="ser">One is yours if it fits.</span>
            </h2>
            <p className="final-sub">
              Drop your domain. The founder runs the 52-check review personally and replies within 48 hours —
              with a real opinion, even if the answer is no.
            </p>
            <div className="final-cta-btns">
              <Link to="/apply" className="btn btn-primary btn-lg ar-parent">Apply for the engine <span className="ar-ne">↗</span></Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}

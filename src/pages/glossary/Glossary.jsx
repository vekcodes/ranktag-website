import { Link } from 'react-router-dom';
import Nav from '../../components/Nav.jsx';
import SiteFooter from '../../components/SiteFooter.jsx';
import useScrollReveal from '../../hooks/useScrollReveal.js';
import usePageMeta from '../../hooks/usePageMeta.js';
import JsonLd from '../../components/JsonLd.jsx';
import { breadcrumb, SITE } from '../../lib/schema.js';
import { TERMS, SOURCES, GLOSSARY_META } from './glossaryData.js';
import '../Home.css';
import '../whatWeDo/WhatWeDo.css';
import '../verticals/verticals.css';
import './glossary.css';

// One page, fifteen entries, each with its own anchor and DefinedTerm node.
// Deliberately not fifteen routes: at 200-300 words apiece those would all sit
// under the 1,000-word floor this site holds, and a wall of thin pages is the
// liability a glossary is usually used to create.
function Cite({ id }) {
  const src = SOURCES[id];
  if (!src) return null;
  const external = /^https?:/.test(src.href);
  return (
    <a
      className="cite"
      href={src.href}
      {...(external ? { rel: 'noopener nofollow', target: '_blank' } : {})}
    >
      {src.label}
    </a>
  );
}

const jsonLd = () => [
  {
    '@context': 'https://schema.org',
    '@type': 'DefinedTermSet',
    '@id': `${SITE}/glossary#termset`,
    name: 'RankedTag SEO and AI Search Glossary',
    description: GLOSSARY_META.description,
    url: `${SITE}/glossary`,
    inLanguage: 'en',
    hasDefinedTerm: TERMS.map((t) => ({
      '@type': 'DefinedTerm',
      '@id': `${SITE}/glossary#${t.slug}`,
      name: t.term,
      description: t.short,
      inDefinedTermSet: `${SITE}/glossary#termset`,
      url: `${SITE}/glossary#${t.slug}`,
    })),
  },
  breadcrumb([
    { name: 'Home', item: `${SITE}/` },
    { name: 'Glossary', item: `${SITE}/glossary` },
  ]),
];

export default function Glossary() {
  useScrollReveal();
  usePageMeta(GLOSSARY_META);

  return (
    <>
      <JsonLd data={jsonLd()} />
      <Nav variant="audit" />

      <main className="svc-page">
        <section className="svc-hero">
          <div className="container grid12 svc-hero-grid">
            <div className="col-12 svc-hero-top">
              <nav className="svc-crumb" aria-label="Breadcrumb">
                <Link to="/" className="link-wipe">Home</Link>
                <span aria-hidden="true">/</span>
                <span aria-current="page">Glossary</span>
              </nav>
              <span className="idx" aria-hidden="true">{TERMS.length}</span>
            </div>

            <div className="col-10 svc-hero-head">
              <span className="eyebrow bracket svc-eyebrow">GLOSSARY · SEO AND AI SEARCH</span>
              <h1 className="svc-h1">Fifteen terms, defined properly.</h1>
            </div>

            <div className="col-7 svc-hero-dek">
              <p className="svc-dek">
                Short definitions you can lift, then the substance underneath: what each term actually
                means, where the common misunderstanding is, and what the evidence says. Figures are cited
                and linked. Terms we could not define without inventing something are not here.
              </p>
              <p className="best-updated">
                Last reviewed <time dateTime="2026-10-19">19 October 2026</time>. Written by{' '}
                <a
                  href="https://www.linkedin.com/in/bhushan-raj-shakya-9835a025b/"
                  className="link-wipe"
                  rel="noopener me"
                  target="_blank"
                >
                  Bhushan Raj Shakya
                </a>
                , founder of RankedTag.
              </p>
            </div>
          </div>
        </section>

        <section className="gl-index ruled" data-reveal>
          <div className="container">
            <h2 className="eyebrow bracket gl-index-h">JUMP TO A TERM</h2>
            <ul className="gl-index-list">
              {TERMS.map((t) => (
                <li key={t.slug}>
                  <a href={`#${t.slug}`} className="link-wipe">{t.term}</a>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="gl-terms ruled" data-reveal>
          <div className="container">
            <ol className="gl-list" data-reveal-children>
              {TERMS.map((t, i) => (
                <li className="gl-entry" id={t.slug} key={t.slug}>
                  <span className="gl-num" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                  <div className="gl-body">
                    <h2 className="gl-term">{t.term}</h2>
                    <p className="gl-short">{t.short}</p>
                    {t.body.map((p) => <p key={p.slice(0, 40)}>{p}</p>)}
                    <Cite id={t.cite} />
                    <p className="gl-links">
                      {t.links.map(([href, label], n) => (
                        <span key={href}>
                          {n > 0 && <span aria-hidden="true"> · </span>}
                          <Link to={href} className="link-wipe">{label}</Link>
                        </span>
                      ))}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="final-cta ruled" data-reveal>
          <div className="container final-cta-inner">
            <span className="eyebrow bracket final-cta-eyebrow">FOUR SLOTS A MONTH</span>
            <h2 className="final-h">
              Know the words.<br />
              <span className="ser">Want to know which ones apply to you?</span>
            </h2>
            <p className="final-sub">
              Drop your domain. The founder runs the 52-check review personally and replies within 48 hours
              with which of these actually matter for your site, and which are irrelevant.
            </p>
            <div className="final-cta-btns">
              <Link to="/apply" className="btn btn-primary btn-lg ar-parent">
                Apply for a free founder review <span className="ar-ne">↗</span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}

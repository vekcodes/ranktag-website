import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Nav from '../../components/Nav.jsx';
import SiteFooter from '../../components/SiteFooter.jsx';
import NotFound from '../NotFound.jsx';
import usePageMeta from '../../hooks/usePageMeta.js';
import useScrollReveal from '../../hooks/useScrollReveal.js';
import JsonLd from '../../components/JsonLd.jsx';
import { breadcrumb, faqPage, SITE } from '../../lib/schema.js';
import { EXPLAINER_BY_SLUG, SOURCES } from './explainersData.js';
import { VERTICALS } from '../verticals/verticalsData.js';
import { COMPARISONS } from '../best/comparisonsData.js';
import '../Home.css';
import '../whatWeDo/WhatWeDo.css';
import '../best/Best.css';
import '../verticals/verticals.css';

// One template renders every comparison explainer. These pages exist to answer
// a question a buyer asks an assistant, so the order is deliberate: the answer
// paragraph, then the table, then the evidence, then the long-form reasoning.
// Nothing above the table is allowed to be throat-clearing.
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

// Minimal inline emphasis so body copy can bold a lead-in without the whole
// file turning into markdown. Only **bold** is supported, deliberately.
function RichText({ text }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith('**') && part.endsWith('**') ? (
          <strong key={i}>{part.slice(2, -2)}</strong>
        ) : (
          part
        )
      )}
    </>
  );
}

function explainerJsonLd(e) {
  const url = `${SITE}/${e.slug}`;
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      '@id': `${url}#article`,
      headline: e.title,
      description: e.description,
      url,
      mainEntityOfPage: { '@type': 'WebPage', '@id': url },
      datePublished: e.updated,
      dateModified: e.updated,
      author: {
        '@type': 'Person',
        '@id': `${SITE}/#founder`,
        name: 'Bhushan Raj Shakya',
        jobTitle: 'Founder, RankedTag',
        sameAs: ['https://www.linkedin.com/in/bhushan-raj-shakya-9835a025b/'],
      },
      publisher: { '@type': 'Organization', name: 'RankedTag', url: `${SITE}/` },
      inLanguage: 'en',
      // Citations are declared in schema as well as rendered on the page, so
      // the sources are machine-readable rather than just visible.
      citation: [...new Set(Object.values(SOURCES).map((s) => s.href))].slice(0, 10),
    },
    breadcrumb([
      { name: 'Home', item: `${SITE}/` },
      { name: e.nav, item: url },
    ]),
    faqPage(e.faqs, { id: `${url}#faq` }),
  ];
}

export default function ExplainerPage() {
  const slug = useLocation().pathname.replace(/^\/|\/$/g, '');
  const e = EXPLAINER_BY_SLUG[slug];

  useScrollReveal();
  usePageMeta(
    e ? { title: e.title, description: e.description, canonical: `${SITE}/${e.slug}` } : undefined
  );

  useEffect(() => {
    const handler = (ev) => {
      const q = ev.target.closest('.faq-q');
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

  if (!e) return <NotFound />;

  return (
    <>
      <JsonLd data={explainerJsonLd(e)} />
      <Nav variant="audit" />

      <main className="svc-page">
        <section className="svc-hero">
          <div className="container grid12 svc-hero-grid">
            <div className="col-12 svc-hero-top">
              <nav className="svc-crumb" aria-label="Breadcrumb">
                <Link to="/" className="link-wipe">Home</Link>
                <span aria-hidden="true">/</span>
                <span aria-current="page">{e.nav}</span>
              </nav>
              <span className="idx" aria-hidden="true">{e.year}</span>
            </div>

            <div className="col-10 svc-hero-head">
              <span className="eyebrow bracket svc-eyebrow">{e.eyebrow}</span>
              <h1 className="svc-h1">{e.h1}</h1>
            </div>

            <div className="col-7 svc-hero-dek">
              <p className="svc-dek">{e.answer}</p>
              <p className="best-updated">
                Last reviewed <time dateTime={e.updated}>{e.verified}</time>. Written by{' '}
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

        {/* The table sits as high as it can: it is the element both a skimming
            reader and an answer engine are most likely to take whole. */}
        <section className="vp-table-section ruled" data-reveal>
          <div className="container">
            <div className="section-head">
              <span className="eyebrow" data-num="001">AT A GLANCE</span>
              <h2 className="h-2">{e.comparisonTable.caption}</h2>
            </div>
            <div
              className="best-table-scroll"
              tabIndex="0"
              role="region"
              aria-label={e.comparisonTable.caption}
            >
              <table className="best-table vp-table">
                <thead>
                  <tr>
                    {e.comparisonTable.columns.map((c, i) => (
                      <th key={i} scope="col">
                        {c || <span className="sr-only">Dimension</span>}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {e.comparisonTable.rows.map((row) => (
                    <tr key={row[0]}>
                      <th scope="row">{row[0]}</th>
                      {row.slice(1).map((cell, n) => <td key={n}>{cell}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="vp-facts ruled" data-reveal>
          <div className="container">
            <h2 className="eyebrow bracket vp-facts-h">WHAT THE RESEARCH MEASURED</h2>
            <ol className="vp-fact-grid" data-reveal-children>
              {e.keyFacts.map((f) => (
                <li className="vp-fact" key={f.label.slice(0, 40)}>
                  <strong className="vp-fact-stat">{f.stat}</strong>
                  <p className="vp-fact-label">{f.label}</p>
                  <Cite id={f.source} />
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="svc-prose ruled" data-reveal>
          <div className="container">
            <article className="dg-article">
              <section className="dg-section">
                {e.intro.map((p) => <p key={p.slice(0, 40)}>{p}</p>)}
              </section>

              {e.body.map((sec) => (
                <section className="dg-section" key={sec.id}>
                  <h2 id={sec.id}>{sec.h}</h2>
                  {sec.p.map((p) => (
                    <p key={p.slice(0, 40)}>
                      <RichText text={p} />
                    </p>
                  ))}
                </section>
              ))}
            </article>
          </div>
        </section>

        <section className="vp-quote-section ruled" data-reveal>
          <div className="container">
            <figure className="vp-quote">
              <blockquote cite={SOURCES[e.quote.source]?.href}>
                <p>{e.quote.text}</p>
              </blockquote>
              <figcaption>
                <span className="vp-quote-who">{e.quote.who}</span>
                <span className="vp-quote-role">{e.quote.role}</span>
                <Cite id={e.quote.source} />
              </figcaption>
            </figure>
          </div>
        </section>

        <section className="faq-section ruled" data-reveal>
          <div className="container grid12">
            <div className="col-4 faq-aside">
              <span className="eyebrow" data-num="002">FAQ</span>
              <h2 className="h-2 faq-h">{e.nav}, asked and answered.</h2>
              <div className="faq-side">
                <h3>Want this applied to your domain?</h3>
                <p>
                  Send it over. The founder runs the review personally and tells you which of the two your
                  site actually needs, including when the answer is neither yet.
                </p>
                <Link to="/apply" className="btn btn-red w-full ar-parent">
                  Apply for review <span className="ar-ne">↗</span>
                </Link>
              </div>
            </div>
            <div className="col-7 start-6 faq-list">
              {e.faqs.map(([q, a], i) => (
                <div className="faq-item" key={q}>
                  <h3 className="faq-h3">
                    <button type="button" className="faq-q" aria-expanded="false">
                      <span className="faq-n" aria-hidden="true">{String(i + 1).padStart(3, '0')}</span>
                      <span className="faq-qt">{q}</span>
                      <span className="faq-ic" aria-hidden="true">+</span>
                    </button>
                  </h3>
                  <div className="faq-a"><div className="faq-a-inner">{a}</div></div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="vp-reading ruled" data-reveal>
          <div className="container">
            <span className="eyebrow bracket">RELATED READING</span>
            <div className="vp-reading-grid">
              <div>
                <h3>The craft behind this</h3>
                <ul>
                  {e.relatedReading.capabilities.map((c) => (
                    <li key={c}>
                      <Link to={c} className="link-wipe">
                        {c.replace('/what-we-do/', '').replace(/-/g, ' ')}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3>From the blog</h3>
                <ul>
                  {e.relatedReading.posts.map(([href, label]) => (
                    <li key={href}><a href={href} className="link-wipe">{label}</a></li>
                  ))}
                </ul>
              </div>
              {e.relatedReading.shortlists && (
                <div>
                  <h3>Agency shortlists</h3>
                  <ul>
                    {COMPARISONS.map((c) => (
                      <li key={c.slug}>
                        <Link to={c.path} className="link-wipe">{c.nav}</Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {e.relatedReading.verticals && (
                <div>
                  <h3>Applied to your vertical</h3>
                  <ul>
                    {VERTICALS.map((v) => (
                      <li key={v.slug}>
                        <Link to={`/${v.slug}`} className="link-wipe">{v.nav}</Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div>
                <h3>Run it yourself</h3>
                <Link to={e.relatedReading.tool[0]} className="link-wipe">{e.relatedReading.tool[1]}</Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}

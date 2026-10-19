import { Link, useLocation } from 'react-router-dom';
import Nav from '../../components/Nav.jsx';
import SiteFooter from '../../components/SiteFooter.jsx';
import useScrollReveal from '../../hooks/useScrollReveal.js';
import usePageMeta from '../../hooks/usePageMeta.js';
import JsonLd from '../../components/JsonLd.jsx';
import { breadcrumb, faqPage, ORG_ID, SITE } from '../../lib/schema.js';
import { AUTHOR, AUTHOR_ID } from '../../seo/author.js';
import { SOURCES } from './researchSources.js';
import { PAGES, pageUrl, pageMeta, ogImageFor } from './researchData.js';
import '../Home.css';
import '../whatWeDo/WhatWeDo.css';
import '../../components/seo/toolGuide.css';
import '../verticals/verticals.css';
import '../best/Best.css';
import './research.css';

// ONE renderer for every page in the knowledge base, research or definitional.
//
// Prose is authored as plain strings in researchData.js with inline citation
// markers of the form [[sourceKey]]. The marker resolves against the source
// registry at render time, and a key that is not registered renders nothing at
// all rather than rendering a reference to a source that does not exist. That
// is the mechanism behind the no-invented-statistics rule: a fabricated figure
// has nowhere to hang a citation from.
function renderText(text) {
  const parts = String(text).split(/(\[\[[a-zA-Z0-9]+\]\])/g);
  return parts.map((part, i) => {
    const m = part.match(/^\[\[([a-zA-Z0-9]+)\]\]$/);
    if (!m) return part;
    const src = SOURCES[m[1]];
    if (!src) return null;
    const external = /^https?:/.test(src.href);
    return (
      <a
        key={`${m[1]}-${i}`}
        className="cite"
        href={src.href}
        {...(external ? { rel: 'noopener nofollow', target: '_blank' } : {})}
      >
        {src.label}
      </a>
    );
  });
}

function Para({ children }) {
  return <p>{renderText(children)}</p>;
}

function Section({ s }) {
  return (
    <section className="dg-section">
      <h2 id={s.id}>{s.h2}</h2>
      {(s.paras || []).map((p) => (
        <Para key={p.slice(0, 48)}>{p}</Para>
      ))}

      {s.steps && (
        <ol className="rs-steps">
          {s.steps.map(([head, body]) => (
            <li key={head}>
              <h3 className="rs-step-h">{head}</h3>
              <p>{renderText(body)}</p>
            </li>
          ))}
        </ol>
      )}

      {s.list && (
        <ul className="rs-list">
          {s.list.map((item) => (
            <li key={item.slice(0, 48)}>{renderText(item)}</li>
          ))}
        </ul>
      )}

      {/* .best-table carries min-width: 56rem, so it MUST sit inside the
          scroll region or it pushes the whole page sideways at 375px. */}
      {s.table && (
        <div
          className="best-table-scroll"
          tabIndex="0"
          role="region"
          aria-label={s.table.caption}
        >
          <table className="best-table rs-table">
            <caption>{s.table.caption}</caption>
            <thead>
              <tr>
                {s.table.columns.map((c) => (
                  <th scope="col" key={c}>{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {s.table.rows.map((row) => (
                <tr key={row[0]}>
                  {row.map((cell, i) =>
                    i === 0 ? (
                      <th scope="row" key={cell}>{renderText(cell)}</th>
                    ) : (
                      <td key={`${row[0]}-${i}`}>{renderText(cell)}</td>
                    )
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {s.after && s.after.map((p) => <Para key={p.slice(0, 48)}>{p}</Para>)}
    </section>
  );
}

const jsonLd = (page) => {
  const url = pageUrl(page);
  const meta = pageMeta(page);
  const crumbs = page.parent
    ? [
        { name: 'Home', item: `${SITE}/` },
        { name: 'Research', item: `${SITE}/research` },
        { name: page.nav, item: url },
      ]
    : [
        { name: 'Home', item: `${SITE}/` },
        { name: page.nav, item: url },
      ];
  const nodes = [
    {
      '@context': 'https://schema.org',
      '@type': page.schemaType || 'Article',
      '@id': `${url}#article`,
      headline: meta.title,
      description: meta.description,
      url,
      image: ogImageFor(page),
      mainEntityOfPage: { '@id': `${url}#article` },
      datePublished: page.published,
      dateModified: page.updated,
      author: { '@id': AUTHOR_ID },
      publisher: { '@id': ORG_ID },
      about: { '@id': ORG_ID },
      inLanguage: 'en',
      ...(page.parent ? { isPartOf: { '@id': `${SITE}/research#collection` } } : {}),
    },
    breadcrumb(crumbs),
  ];
  if (page.faqs && page.faqs.length) {
    nodes.push(faqPage(page.faqs, { id: `${url}#faq`, isPartOf: `${url}#article` }));
  }
  return nodes;
};

export default function ResearchPage() {
  // Slug comes from the URL rather than a prop: the router's lazy adapter
  // mounts a component, not a configured one, which is the same pattern the
  // vertical and capability templates use.
  const path = useLocation().pathname.replace(/^\/|\/$/g, '');
  const slug = path.replace(/^research\//, '');
  const page = PAGES.find((p) => (p.parent ? p.slug : p.slug) === slug);
  useScrollReveal();
  usePageMeta(pageMeta(page));

  return (
    <>
      <JsonLd data={jsonLd(page)} />
      <Nav variant="audit" />

      <main className="svc-page">
        <section className="svc-hero">
          <div className="container grid12 svc-hero-grid">
            <div className="col-12 svc-hero-top">
              <nav className="svc-crumb" aria-label="Breadcrumb">
                <Link to="/" className="link-wipe">Home</Link>
                <span aria-hidden="true">/</span>
                {page.parent && (
                  <>
                    <Link to="/research" className="link-wipe">Research</Link>
                    <span aria-hidden="true">/</span>
                  </>
                )}
                <span aria-current="page">{page.nav}</span>
              </nav>
              <span className="idx" aria-hidden="true">{page.idx}</span>
            </div>

            <div className="col-10 svc-hero-head">
              <span className="eyebrow bracket svc-eyebrow">{page.eyebrow}</span>
              <h1 className="svc-h1">{page.h1}</h1>
            </div>

            <div className="col-7 svc-hero-dek">
              {/* The direct answer, first thing on the page and extractable on
                  its own. Section 7 of the knowledge base, applied without
                  exception: question, answer, then the supporting detail. */}
              <p className="rs-answer">{renderText(page.answer)}</p>
              <p className="best-updated">
                Last updated <time dateTime={page.updated}>{page.updatedHuman}</time>. Written and
                verified by{' '}
                <Link to="/about" className="link-wipe">{AUTHOR.name}</Link>, founder of RankedTag.
              </p>
            </div>
          </div>
        </section>

        {page.keyFacts && (
          <section className="rs-facts ruled" data-reveal>
            <div className="container">
              <h2 className="eyebrow bracket rs-facts-h">KEY FACTS</h2>
              <dl className="rs-fact-grid">
                {page.keyFacts.map(([k, v]) => (
                  <div className="rs-fact" key={k}>
                    <dt>{k}</dt>
                    <dd>{renderText(v)}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </section>
        )}

        <section className="svc-prose ruled" data-reveal>
          <div className="container">
            <article className="dg-article">
              {page.sections.map((s) => <Section s={s} key={s.id} />)}

              {page.faqs && page.faqs.length > 0 && (
                <section className="dg-section">
                  <h2 id="faq">Frequently asked questions</h2>
                  {page.faqs.map(([q, a]) => (
                    <div className="rs-faq" key={q}>
                      <h3>{q}</h3>
                      <p>{renderText(a)}</p>
                    </div>
                  ))}
                </section>
              )}

              {page.official && (
                <section className="dg-section">
                  <h2 id="official">Official resources</h2>
                  <ul className="rs-list">
                    {page.official.map((key) => {
                      const src = SOURCES[key];
                      if (!src) return null;
                      return (
                        <li key={key}>
                          <a
                            href={src.href}
                            className="link-wipe"
                            {...(/^https?:/.test(src.href)
                              ? { rel: 'noopener nofollow', target: '_blank' }
                              : {})}
                          >
                            {src.label}
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              )}

              {page.related && (
                <section className="dg-section">
                  <h2 id="related">Related reading</h2>
                  <ul className="rs-list">
                    {page.related.map(([href, label]) => (
                      <li key={href}>
                        <Link to={href} className="link-wipe">{label}</Link>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </article>
          </div>
        </section>

        <section className="final-cta ruled" data-reveal>
          <div className="container final-cta-inner">
            <span className="eyebrow bracket final-cta-eyebrow">FOUR SLOTS A MONTH</span>
            <h2 className="final-h">
              {page.ctaH}<br />
              <span className="ser">{page.ctaSer}</span>
            </h2>
            <p className="final-sub">
              The 52-check founder review is run personally and comes back within 48 hours, with a real
              opinion even when the answer is no.
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

import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Nav from '../../components/Nav.jsx';
import SiteFooter from '../../components/SiteFooter.jsx';
import NotFound from '../NotFound.jsx';
import usePageMeta from '../../hooks/usePageMeta.js';
import useScrollReveal from '../../hooks/useScrollReveal.js';
import JsonLd from '../../components/JsonLd.jsx';
import { breadcrumb, faqPage, SITE } from '../../lib/schema.js';
import { COMPARISON_BY_SLUG } from './comparisonsData.js';
import '../Home.css';
import '../whatWeDo/WhatWeDo.css';
import './Best.css';

// One template renders every /best/<slug> comparison page. These target
// shortlist intent, so the page leads with the table a buyer came for and
// puts the publisher-bias disclosure above it rather than below the fold.
//
// The structure is deliberately cheap to refresh: bump `updated`, re-check
// each agency's own site, correct the fields. Nothing here is computed from
// anything that would silently go stale.
function comparisonJsonLd(c) {
  const url = `${SITE}${c.path}`;
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      '@id': `${url}#article`,
      headline: c.title,
      description: c.description,
      url,
      mainEntityOfPage: { '@type': 'WebPage', '@id': url },
      datePublished: c.updated,
      dateModified: c.updated,
      // The same Person node the Organization graph declares (#founder), so the
      // byline resolves to one entity across the site rather than two.
      author: {
        '@type': 'Person',
        '@id': `${SITE}/#founder`,
        name: 'Bhushan Raj Shakya',
        jobTitle: 'Founder, RankedTag',
        sameAs: ['https://www.linkedin.com/in/bhushan-raj-shakya-9835a025b/'],
      },
      publisher: { '@type': 'Organization', name: 'RankedTag', url: `${SITE}/` },
      inLanguage: 'en',
      // The list is an ItemList of real organisations. No aggregateRating and
      // no review scores anywhere: we have not run engagements with these
      // agencies, so any rating would be fabricated.
      mainEntity: {
        '@type': 'ItemList',
        itemListOrder: 'https://schema.org/ItemListUnordered',
        numberOfItems: c.agencies.length,
        itemListElement: c.agencies.map((a, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          item: {
            '@type': 'Organization',
            name: a.name,
            url: a.isUs ? `${SITE}/` : a.url,
            description: a.specialism,
          },
        })),
      },
    },
    breadcrumb([
      { name: 'Home', item: `${SITE}/` },
      { name: 'Best', item: `${SITE}/best` },
      { name: c.nav, item: url },
    ]),
    faqPage(c.faqs, { id: `${url}#faq` }),
  ];
}

export default function ComparisonPage() {
  const slug = useLocation().pathname.replace(/^\/best\/|\/$/g, '');
  const c = COMPARISON_BY_SLUG[slug];

  useScrollReveal();
  usePageMeta(
    c ? { title: c.title, description: c.description, canonical: `${SITE}${c.path}` } : undefined
  );

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

  if (!c) return <NotFound />;

  const related = (c.related || []).map((s) => COMPARISON_BY_SLUG[s]).filter(Boolean);

  return (
    <>
      <JsonLd data={comparisonJsonLd(c)} />
      <Nav variant="audit" />

      <main className="svc-page">
        <section className="svc-hero">
          <div className="container grid12 svc-hero-grid">
            <div className="col-12 svc-hero-top">
              <nav className="svc-crumb" aria-label="Breadcrumb">
                <Link to="/" className="link-wipe">Home</Link>
                <span aria-hidden="true">/</span>
                <Link to="/best" className="link-wipe">Best</Link>
                <span aria-hidden="true">/</span>
                <span aria-current="page">{c.nav}</span>
              </nav>
              <span className="idx" aria-hidden="true">{c.year}</span>
            </div>

            <div className="col-10 svc-hero-head">
              <span className="eyebrow bracket svc-eyebrow">{c.eyebrow}</span>
              <h1 className="svc-h1">{c.h1}</h1>
            </div>

            <div className="col-7 svc-hero-dek">
              <p className="svc-dek">{c.answer}</p>
              {/* Visible dateModified. Also in the Article schema above. */}
              <p className="best-vertical-link">
                Already decided what you need and just looking for a partner? Here is{' '}
                <Link to={c.vertical} className="link-wipe">{c.verticalLabel}</Link>.
              </p>
              <p className="best-byline">
                Researched and written by{' '}
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
              <p className="best-updated">
                Last reviewed{' '}
                <time dateTime={c.updated}>{c.verified}</time>. Every agency checked on its own
                website on that date.
              </p>
            </div>
          </div>
        </section>

        {/* ── Publisher bias, stated before the list, not after it ─────── */}
        <section className="best-disclosure-wrap ruled" data-reveal>
          <div className="container">
            <aside className="best-disclosure" aria-label="Publisher disclosure">
              <span className="eyebrow bracket">WHO PUBLISHES THIS LIST</span>
              <p>{c.disclosure}</p>
            </aside>
          </div>
        </section>

        {/* ── The table, as the first substantial element ──────────────── */}
        <section className="best-table-section ruled" data-reveal>
          <div className="container">
            <div className="section-head">
              <span className="eyebrow" data-num="001">AT A GLANCE</span>
              <h2 className="h-2">{c.agencies.length} agencies, side by side.</h2>
            </div>
            {/* Scroll container rather than a squashed table: keeps every
                column readable at 375px and keeps the row height stable, so
                nothing shifts after load. */}
            <div className="best-table-scroll" tabIndex="0" role="region" aria-label="Agency comparison table">
              <table className="best-table">
                <thead>
                  <tr>{c.columns.map((h) => <th key={h} scope="col">{h}</th>)}</tr>
                </thead>
                <tbody>
                  {c.agencies.map((a) => (
                    <tr key={a.name} className={a.isUs ? 'is-us' : undefined}>
                      <th scope="row">
                        <a href={`#${slugify(a.name)}`} className="link-wipe">{a.name}</a>
                        {a.isUs && <span className="best-us-tag">publisher</span>}
                      </th>
                      <td>{a.bestFor}</td>
                      <td>{a.specialism}</td>
                      <td>{a.pricing}</td>
                      <td>{a.engagement}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ── How the list was built ───────────────────────────────────── */}
        <section className="svc-prose ruled" data-reveal>
          <div className="container">
            <article className="dg-article">
              <section className="dg-section">
                <h2 id="criteria">How this list was built</h2>
                <ul className="best-criteria">
                  {c.criteria.map((x) => <li key={x.slice(0, 32)}>{x}</li>)}
                </ul>
              </section>
            </article>
          </div>
        </section>

        {/* ── One block per agency ─────────────────────────────────────── */}
        <section className="best-profiles ruled" data-reveal>
          <div className="container">
            <div className="section-head">
              <span className="eyebrow" data-num="002">THE SHORTLIST</span>
              <h2 className="h-2">Each one, in detail.</h2>
            </div>
            <ol className="best-profile-list" data-reveal-children>
              {c.agencies.map((a, i) => (
                <li
                  className={`best-profile${a.isUs ? ' is-us' : ''}`}
                  id={slugify(a.name)}
                  key={a.name}
                >
                  <span className="best-profile-num" aria-hidden="true">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div className="best-profile-body">
                    <h3>
                      {a.isUs ? (
                        <Link to="/" className="link-wipe">{a.name}</Link>
                      ) : (
                        <a href={a.url} className="link-wipe" rel="noopener nofollow" target="_blank">
                          {a.name}
                        </a>
                      )}
                      {a.isUs && <span className="best-us-tag">that is us</span>}
                    </h3>
                    <p className="best-profile-bestfor"><strong>Best for:</strong> {a.bestFor}</p>
                    <p>{a.who}</p>
                    <p><strong>Strongest at.</strong> {a.strong}</p>
                    <p><strong>Who it does not suit.</strong> {a.notFor}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ── How to choose ────────────────────────────────────────────── */}
        <section className="svc-deliver ruled" data-reveal>
          <div className="container">
            <div className="section-head">
              <span className="eyebrow" data-num="003">HOW TO CHOOSE</span>
              <div>
                <h2 className="h-2">Seven questions worth asking on the call.</h2>
                <p className="lead">
                  Not "what is your process". Every agency has an answer ready for that one. These are the
                  questions where the answer is hard to rehearse.
                </p>
              </div>
            </div>
            <ol className="svc-deliver-list" data-reveal-children>
              {c.howToChoose.map(([h, p], i) => (
                <li className="svc-deliver-row" key={h}>
                  <span className="svc-deliver-num" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                  <h3>{h}</h3>
                  <p>{p}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ── FAQ ──────────────────────────────────────────────────────── */}
        <section className="faq-section ruled" data-reveal>
          <div className="container grid12">
            <div className="col-4 faq-aside">
              <span className="eyebrow" data-num="004">FAQ</span>
              <h2 className="h-2 faq-h">Choosing an agency, asked and answered.</h2>
              <div className="faq-side">
                <h3>Want an opinion on your shortlist?</h3>
                <p>
                  Send us the domain and the three agencies you are weighing up. The founder will tell you
                  honestly which of them fits, including when the answer is not us.
                </p>
                <Link to="/apply" className="btn btn-red w-full ar-parent">
                  Apply for review <span className="ar-ne">↗</span>
                </Link>
              </div>
            </div>
            <div className="col-7 start-6 faq-list">
              {c.faqs.map(([q, a], i) => (
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

        {related.length > 0 && (
          <section className="svc-related ruled" data-reveal>
            <div className="container">
              <span className="eyebrow bracket">OTHER SHORTLISTS</span>
              <ol className="svc-rows svc-rows-compact" data-reveal-children>
                {related.map((r, i) => (
                  <li key={r.slug}>
                    <Link to={r.path} className="svc-row ar-parent">
                      <span className="svc-row-num" aria-hidden="true">{String(i + 1).padStart(3, '0')}</span>
                      <span className="svc-row-h">{r.nav}</span>
                      <p className="svc-row-desc">Updated {r.verified}</p>
                      <span className="svc-row-go">Read it <span className="ar">→</span></span>
                    </Link>
                  </li>
                ))}
              </ol>
            </div>
          </section>
        )}
      </main>

      <SiteFooter />
    </>
  );
}

const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

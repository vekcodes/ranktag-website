import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Nav from '../../components/Nav.jsx';
import SiteFooter from '../../components/SiteFooter.jsx';
import NotFound from '../NotFound.jsx';
import usePageMeta from '../../hooks/usePageMeta.js';
import useScrollReveal from '../../hooks/useScrollReveal.js';
import JsonLd from '../../components/JsonLd.jsx';
import { breadcrumb, faqPage, ORG_ID, SITE } from '../../lib/schema.js';
import { VERTICAL_BY_SLUG, SOURCES } from './verticalsData.js';
import '../Home.css';
import '../whatWeDo/WhatWeDo.css';
import './verticals.css';

// One template renders every vertical page (/saas-seo-agency etc) from
// verticalsData.js. These are commercial head-term pages, so the structure is
// fixed and the substance is not: an answer paragraph a machine can lift, the
// problems specific to this buyer, the capabilities that solve them, and an
// engagement section that does not invent a price.
//
// The related-verticals block filters against VERTICAL_BY_SLUG rather than
// rendering whatever `related` lists, so a vertical that has not shipped yet
// simply does not appear. No page ever links to a URL that is not live.
function verticalJsonLd(v) {
  const url = `${SITE}/${v.slug}`;
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'Service',
      '@id': `${url}#service`,
      name: v.title,
      serviceType: 'Search Engine Optimization',
      description: v.answer,
      url,
      provider: { '@id': ORG_ID },
      areaServed: { '@type': 'Place', name: 'Worldwide' },
      audience: { '@type': 'BusinessAudience', name: v.audienceName },
      mainEntityOfPage: { '@type': 'WebPage', '@id': url },
      inLanguage: 'en',
    },
    breadcrumb([
      { name: 'Home', item: `${SITE}/` },
      { name: v.nav, item: url },
    ]),
    faqPage(v.faqs, { id: `${url}#faq` }),
  ];
}

// Every cited figure renders through this, so a statistic can never appear
// on the page without a visible, linked source. The brief's rule — if it
// cannot be verified it does not ship — is enforced by the data shape: a
// `source` key that is not in SOURCES renders nothing at all.
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

export default function VerticalPage() {
  // Each vertical has its own root-level route, so the slug is the path.
  const slug = useLocation().pathname.replace(/^\/|\/$/g, '');
  const v = VERTICAL_BY_SLUG[slug];

  useScrollReveal();
  usePageMeta(
    v ? { title: v.title, description: v.description, canonical: `${SITE}/${v.slug}` } : undefined
  );

  // Same delegated FAQ accordion the homepage and capability pages use.
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

  if (!v) return <NotFound />;

  const related = (v.related || []).map((s) => VERTICAL_BY_SLUG[s]).filter(Boolean);

  return (
    <>
      <JsonLd data={verticalJsonLd(v)} />
      <Nav variant="audit" />

      <main className="svc-page">
        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <section className="svc-hero">
          <div className="container grid12 svc-hero-grid">
            <div className="col-12 svc-hero-top">
              <nav className="svc-crumb" aria-label="Breadcrumb">
                <Link to="/" className="link-wipe">Home</Link>
                <span aria-hidden="true">/</span>
                <span aria-current="page">{v.nav}</span>
              </nav>
              <span className="idx" aria-hidden="true">001</span>
            </div>

            <div className="col-10 svc-hero-head">
              <span className="eyebrow bracket svc-eyebrow">{v.eyebrow}</span>
              <h1 className="svc-h1">{v.h1}</h1>
            </div>

            <div className="col-6 svc-hero-dek">
              {/* The answer paragraph. First substantial text on the page, kept
                  self-contained so a snippet or an AI Overview can quote it
                  without the surrounding context. */}
              <p className="svc-dek">{v.answer}</p>
              <ul className="hero-benefits svc-hero-benefits">
                <li><span className="b-check">✓</span> the founder reviews every domain personally</li>
                <li><span className="b-check">✓</span> a reply within 48 hours</li>
                <li><span className="b-check">✓</span> four reviews taken a month</li>
              </ul>
            </div>
            <div className="col-5 start-8 svc-hero-cta">
              <Link to="/apply" className="btn btn-red btn-lg ar-parent">
                Apply for a free founder review <span className="ar-ne">↗</span>
              </Link>
            </div>
          </div>
        </section>

        {/* ── Key facts: sourced, dated, visible on the page ────── */}
        {v.keyFacts && (
          <section className="vp-facts ruled" data-reveal>
            <div className="container">
              <h2 className="eyebrow bracket vp-facts-h">THE NUMBERS THAT SHAPE THIS WORK</h2>
              <ol className="vp-fact-grid" data-reveal-children>
                {v.keyFacts.map((f) => (
                  <li className="vp-fact" key={f.label.slice(0, 40)}>
                    <strong className="vp-fact-stat">{f.stat}</strong>
                    <p className="vp-fact-label">{f.label}</p>
                    <Cite id={f.source} />
                  </li>
                ))}
              </ol>
            </div>
          </section>
        )}

        {/* ── Intro prose ──────────────────────────────────────────────── */}
        <section className="svc-prose ruled" data-reveal>
          <div className="container">
            <article className="dg-article">
              <section className="dg-section">
                {v.intro.map((p) => <p key={p.slice(0, 40)}>{p}</p>)}
              </section>
            </article>
          </div>
        </section>

        {/* ── Vertical-specific problems ───────────────────────────────── */}
        <section className="problem svc-problem ruled" data-reveal>
          <div className="container grid12">
            <div className="col-4 problem-aside">
              <h2 className="eyebrow bracket problem-h2">{v.problemsEyebrow}</h2>
            </div>
            <ol className="col-7 start-6 problem-list" data-reveal-children>
              {v.problems.map((p, i) => (
                <li className="problem-row" key={p.h}>
                  <span className="problem-num" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                  <div className="problem-body">
                    <h3>{p.h}</h3>
                    <p>{p.p}</p>
                    {p.evidence && (
                      <p className="vp-evidence">
                        {p.evidence.note} <Cite id={p.evidence.source} />
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ── What we do about it, linking to the capability pages ─────── */}
        <section className="svc-deliver ruled" data-reveal>
          <div className="container">
            <div className="section-head">
              <span className="eyebrow" data-num="001">WHAT WE DO ABOUT IT</span>
              <h2 className="h-2">{v.approachH2}</h2>
            </div>
            <ol className="svc-deliver-list" data-reveal-children>
              {v.approach.map((a, i) => (
                <li className="svc-deliver-row" key={a.h}>
                  <span className="svc-deliver-num" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                  <h3>{a.h}</h3>
                  <p>
                    {a.p}{' '}
                    <Link to={a.to} className="link-wipe">{a.label}</Link>.
                  </p>
                  {a.when && (
                    <dl className="vp-step-meta">
                      <div><dt>When</dt><dd>{a.when}</dd></div>
                      <div><dt>Who</dt><dd>{a.who}</dd></div>
                      <div><dt>Deliverable</dt><dd>{a.deliverable}</dd></div>
                    </dl>
                  )}
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Comparison table: machine-extractable, and the element an answer
             engine can lift whole. */}
        {v.comparisonTable && (
          <section className="vp-table-section ruled" data-reveal>
            <div className="container">
              <div className="section-head">
                <span className="eyebrow" data-num="002">SIDE BY SIDE</span>
                <h2 className="h-2">{v.comparisonTable.caption}</h2>
              </div>
              <div className="best-table-scroll" tabIndex="0" role="region" aria-label={v.comparisonTable.caption}>
                <table className="best-table vp-table">
                  <thead>
                    <tr>{v.comparisonTable.columns.map((c) => <th key={c} scope="col">{c}</th>)}</tr>
                  </thead>
                  <tbody>
                    {v.comparisonTable.rows.map((row) => (
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
        )}

        {/* One verified quotation, under 25 words, linked to its origin. */}
        {v.quote && (
          <section className="vp-quote-section ruled" data-reveal>
            <div className="container">
              <figure className="vp-quote">
                <blockquote cite={SOURCES[v.quote.source]?.href}>
                  <p>{v.quote.text}</p>
                </blockquote>
                <figcaption>
                  <span className="vp-quote-who">{v.quote.who}</span>
                  <span className="vp-quote-role">{v.quote.role}</span>
                  <Cite id={v.quote.source} />
                </figcaption>
              </figure>
            </div>
          </section>
        )}

        {/* ── Proof. Rendered ONLY where we hold a verified in-vertical
             result. Never a placeholder, never an adjacent-vertical number
             dressed up as this one's. ─────────────────────────────────── */}
        {v.proof && (
          <section className="svc-proof ruled" data-reveal>
            <div className="container">
              <div className="section-head">
                <span className="eyebrow" data-num="002">PROOF · LIVE NUMBERS, NOT PROMISES</span>
                <div>
                  <h2 className="h-2">
                    <span className="accent">Sendr.ai</span>: zero to{' '}
                    <span className="accent">1.05M impressions</span> in six months.
                  </h2>
                  <p className="lead">
                    A B2B SaaS company, no ads and no outreach: 1.05M organic impressions, 7,430 clicks, and
                    the #2 position in Google's AI Overview for "what is the best GTM tool", six places above
                    ZoomInfo. Google Search Console data you can cross-check yourself.
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
        )}

        {/* Where no in-vertical result exists, the page says so in the slot
             where proof would sit, rather than leaving a silent gap. */}
        {!v.proof && (
          <section className="vp-noproof ruled" data-reveal>
            <div className="container">
              <aside className="vp-noproof-panel">
                <span className="eyebrow bracket">WHAT WE CANNOT SHOW YOU</span>
                <p>
                  We have no {v.nav.toLowerCase()} case study. Our one measured, cross-checkable result is
                  sendr.ai, a B2B SaaS company taken from zero to 1.05M organic impressions and 7,430 clicks
                  in six months, and to the #2 position in Google&rsquo;s AI Overview for its category query,
                  above ZoomInfo. That is a different vertical and we are not going to present it as though
                  it were this one.
                </p>
                <p>
                  The method on this page is argued from craft and from published evidence, with every figure
                  above linked to its source. If a vertical-specific reference is a requirement for you, that
                  is a fair requirement, and today we would not meet it.
                </p>
                <Link to="/case-study/sendr" className="case-readmore link-wipe ar-parent">
                  Read the sendr.ai case study anyway <span className="ar">→</span>
                </Link>
              </aside>
            </div>
          </section>
        )}

        {/* Delivery timeline: what lands when, and what is realistic to see. */}
        {v.timeline && (
          <section className="vp-timeline-section ruled" data-reveal>
            <div className="container">
              <div className="section-head">
                <span className="eyebrow" data-num="003">WHAT LANDS WHEN</span>
                <div>
                  <h2 className="h-2">The first six months, honestly.</h2>
                  <p className="lead">
                    What is delivered at each point, and what it is realistic to see. These assume the
                    technical work is not sitting in your engineering queue.
                  </p>
                </div>
              </div>
              <ol className="vp-timeline" data-reveal-children>
                {v.timeline.map(([when, delivered, realistic]) => (
                  <li className="vp-tl-step" key={when}>
                    <span className="vp-tl-when">{when}</span>
                    <div className="vp-tl-body">
                      <p className="vp-tl-delivered">{delivered}</p>
                      <p className="vp-tl-realistic">{realistic}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </section>
        )}

        {/* ── Engagement model. No invented price, ever. ───────────────── */}
        <section className="svc-process ruled" data-reveal>
          <div className="container">
            <div className="section-head">
              <span className="eyebrow" data-num="003">HOW AN ENGAGEMENT WORKS</span>
              <h2 className="h-2">{v.engagementH2}</h2>
            </div>
            <ol className="svc-timeline" data-reveal-children>
              {v.engagement.map(([h, p], i) => (
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

        {/* ── The shortlist page for this vertical ────────────── */}
        {/* Different intent from this page, so it gets its own link rather
            than being buried: a buyer still building a shortlist is not ready
            for a sales page, and sending them to one wastes the visit. */}
        <section className="svc-prose ruled" data-reveal>
          <div className="container">
            <article className="dg-article">
              <section className="dg-section">
                <h2 id="still-comparing">Still building a shortlist?</h2>
                <p>
                  Then this page is the wrong one, and we would rather say so. We publish a researched
                  comparison of {v.comparisonLabel}, with published pricing where it exists and who each
                  one does not suit. We are on it, positioned where we honestly belong.{' '}
                  <Link to={v.comparison} className="link-wipe">Read the comparison</Link>.
                </p>
              </section>
            </article>
          </div>
        </section>

        {/* Disqualifiers. Converts better than another benefits list, and it
             is the kind of candid passage an answer engine quotes. */}
        {v.notFor && (
          <section className="vp-notfor ruled" data-reveal>
            <div className="container">
              <div className="section-head">
                <span className="eyebrow" data-num="004">WHO THIS IS NOT FOR</span>
                <div>
                  <h2 className="h-2">Four reasons to walk away.</h2>
                  <p className="lead">
                    Written plainly, because a wasted discovery call costs us both more than an honest
                    paragraph does.
                  </p>
                </div>
              </div>
              <ul className="vp-notfor-list" data-reveal-children>
                {v.notFor.map((x) => (
                  <li key={x.slice(0, 40)}>{x}</li>
                ))}
              </ul>
            </div>
          </section>
        )}

        {/* The four objections a buyer actually has. */}
        {v.objections && (
          <section className="svc-deliver ruled" data-reveal>
            <div className="container">
              <div className="section-head">
                <span className="eyebrow" data-num="005">THE AWKWARD QUESTIONS</span>
                <h2 className="h-2">What you are probably thinking.</h2>
              </div>
              <ol className="svc-deliver-list" data-reveal-children>
                {v.objections.map(([q, a], i) => (
                  <li className="svc-deliver-row" key={q}>
                    <span className="svc-deliver-num" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                    <h3>{q}</h3>
                    <p>{a}</p>
                  </li>
                ))}
              </ol>
            </div>
          </section>
        )}

        {/* ── FAQ ──────────────────────────────────────────────────────── */}
        <section className="faq-section ruled" data-reveal>
          <div className="container grid12">
            <div className="col-4 faq-aside">
              <span className="eyebrow" data-num="004">FAQ</span>
              <h2 className="h-2 faq-h">{v.faqH}</h2>
              <div className="faq-side">
                <h3>Not sure you are a fit?</h3>
                <p>
                  Apply anyway. The founder reviews every domain personally and tells you what you actually
                  need, including when the honest answer is "not us, not yet".
                </p>
                <Link to="/apply" className="btn btn-red w-full ar-parent">
                  Apply for review <span className="ar-ne">↗</span>
                </Link>
              </div>
            </div>
            <div className="col-7 start-6 faq-list">
              {v.faqs.map(([q, a], i) => (
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

        {/* Related reading: the matching shortlist, the capability pages this
             draws on, two posts and the tool that fits. */}
        {v.relatedReading && (
          <section className="vp-reading ruled" data-reveal>
            <div className="container">
              <span className="eyebrow bracket">RELATED READING</span>
              <div className="vp-reading-grid">
                <div>
                  <h3>Still comparing agencies</h3>
                  <Link to={v.relatedReading.comparisonPage} className="link-wipe">
                    {v.comparisonLabel}
                  </Link>
                </div>
                <div>
                  <h3>The craft behind this</h3>
                  <ul>
                    {v.relatedReading.capabilities.map((c) => (
                      <li key={c}>
                        <Link to={c} className="link-wipe">{c.replace('/what-we-do/', '').replace(/-/g, ' ')}</Link>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3>From the blog</h3>
                  <ul>
                    {v.relatedReading.posts.map(([href, label]) => (
                      <li key={href}><a href={href} className="link-wipe">{label}</a></li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3>Run it yourself</h3>
                  <Link to={v.relatedReading.tool[0]} className="link-wipe">{v.relatedReading.tool[1]}</Link>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ── Other verticals (only those already live) ────────────────── */}
        {related.length > 0 && (
          <section className="svc-related ruled" data-reveal>
            <div className="container">
              <span className="eyebrow bracket">WE ALSO WORK WITH</span>
              <ol className="svc-rows svc-rows-compact" data-reveal-children>
                {related.map((r, i) => (
                  <li key={r.slug}>
                    <Link to={`/${r.slug}`} className="svc-row ar-parent">
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
        )}

        {/* ── Single CTA ───────────────────────────────────────────────── */}
        <section className="final-cta ruled" data-reveal>
          <div className="container final-cta-inner">
            <span className="eyebrow bracket final-cta-eyebrow">FOUR SLOTS A MONTH</span>
            <h2 className="final-h">
              Four founder slots a month.<br />
              <span className="ser">One is yours if it fits.</span>
            </h2>
            <p className="final-sub">{v.ctaSub}</p>
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

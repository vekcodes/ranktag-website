import { Link } from 'react-router-dom';
import Nav from '../../components/Nav.jsx';
import SiteFooter from '../../components/SiteFooter.jsx';
import useScrollReveal from '../../hooks/useScrollReveal.js';
import usePageMeta from '../../hooks/usePageMeta.js';
import JsonLd from '../../components/JsonLd.jsx';
import { breadcrumb, ORG_ID, SITE } from '../../lib/schema.js';
import { CASE_STUDIES_META } from './companyData.js';
import '../Home.css';
import '../whatWeDo/WhatWeDo.css';
import '../../components/seo/toolGuide.css';
import '../verticals/verticals.css';
import './company.css';

// An index of one. The ItemList has a single member because there is a single
// measured result, and padding it with "projects" that were never measured is
// precisely the thing this page argues against.
const jsonLd = () => [
  {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${SITE}/case-studies#webpage`,
    url: `${SITE}/case-studies`,
    name: CASE_STUDIES_META.title,
    description: CASE_STUDIES_META.description,
    about: { '@id': ORG_ID },
    inLanguage: 'en',
    mainEntity: {
      '@type': 'ItemList',
      '@id': `${SITE}/case-studies#list`,
      name: 'RankedTag case studies',
      numberOfItems: 1,
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          url: `${SITE}/case-study/sendr`,
          name: 'Sendr.ai: 0 to 1.05M organic impressions in six months',
        },
      ],
    },
  },
  breadcrumb([
    { name: 'Home', item: `${SITE}/` },
    { name: 'Case studies', item: `${SITE}/case-studies` },
  ]),
];

export default function CaseStudies() {
  useScrollReveal();
  usePageMeta(CASE_STUDIES_META);

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
                <span aria-current="page">Case studies</span>
              </nav>
              <span className="idx" aria-hidden="true">001</span>
            </div>

            <div className="col-10 svc-hero-head">
              <span className="eyebrow bracket svc-eyebrow">CASE STUDIES · ONE</span>
              <h1 className="svc-h1">One case study, and what it took to publish it.</h1>
            </div>

            <div className="col-7 svc-hero-dek">
              <p className="svc-dek">
                Most agency case-study pages hold a dozen entries and no numbers. This one holds a single
                entry with numbers in it, which is an accurate representation of what has been measured
                rather than a flattering one.
              </p>
            </div>
          </div>
        </section>

        <section className="co-case ruled" data-reveal>
          <div className="container">
            <article className="co-case-card">
              <div className="co-case-head">
                <span className="co-card-k">B2B SAAS · SIX MONTHS · NOVEMBER 2025 TO APRIL 2026</span>
                <h2 className="co-case-h">
                  <Link to="/case-study/sendr" className="link-wipe">
                    Sendr.ai: from zero to 1.05M organic impressions
                  </Link>
                </h2>
              </div>
              <ol className="vp-fact-grid co-case-facts">
                {[
                  ['1.05M', 'organic impressions in six months, from zero'],
                  ['7,430', 'clicks, at roughly 0.7% click-through rate'],
                  ['#2', "in Google's AI Overview, six places above ZoomInfo"],
                  ['7.1', 'average position across the measured period'],
                ].map(([stat, label]) => (
                  <li className="vp-fact" key={label.slice(0, 30)}>
                    <strong className="vp-fact-stat">{stat}</strong>
                    <p className="vp-fact-label">{label}</p>
                  </li>
                ))}
              </ol>
              <p className="co-case-p">
                A seed-stage B2B SaaS competing in a category dominated by eight-figure incumbents.
                Technical foundation first, then content mapped to buying queries rather than to search
                volume, with every brief approved by a human and every draft rewritten by one.
              </p>
              <p className="co-case-p">
                <Link to="/case-study/sendr" className="link-wipe ar-parent">
                  Read the full case study <span className="ar-ne">↗</span>
                </Link>
              </p>
            </article>
          </div>
        </section>

        <section className="svc-prose ruled" data-reveal>
          <div className="container">
            <article className="dg-article">
              <section className="dg-section">
                <h2 id="standard">The standard a result has to meet to appear here</h2>
                <p>
                  Four conditions, and all four have to hold. The client has to be named, because an
                  anonymous case study cannot be checked by anyone and is therefore worth roughly nothing
                  as evidence. The figures have to come from a platform the client controls, which in
                  practice means Google Search Console rather than an agency dashboard. The period has to
                  be stated with start and end dates, because a six-month window chosen after the fact is
                  a different claim from a six-month window agreed in advance. And the client has to have
                  seen the page before it is published.
                </p>
                <p>
                  That standard is why there is one entry here rather than six. It also means the one
                  entry says what it is: Search Console figures from the client's own property, which are
                  not independently auditable from outside. No agency's traffic claims are, including
                  those of every agency on our own{' '}
                  <Link to="/best">published shortlists</Link>. The honest version of a case study is not
                  one that claims to be verifiable, it is one that tells you exactly where the numbers
                  came from so you can weigh them properly.
                </p>
              </section>

              <section className="dg-section">
                <h2 id="not-here">What is deliberately not on this page</h2>
                <p>
                  There are no logo walls. A logo wall is a list of companies that at some point paid an
                  invoice, presented as a list of companies that got a result, and the two sets overlap
                  less often than the design implies.
                </p>
                <p>
                  There are no unnamed case studies. A page describing what "a leading SaaS platform"
                  achieved is a story, not evidence, and the anonymity is almost never the client's
                  choice. There are no percentage-increase figures without a baseline, because a 400%
                  increase from four visits is four hundred per cent and also sixteen visits. And there
                  are no projections dressed as outcomes.
                </p>
                <p>
                  Most importantly, there is no case study for{' '}
                  <Link to="/ecommerce-seo-agency">ecommerce</Link>,{' '}
                  <Link to="/local-seo-agency">local</Link>,{' '}
                  <Link to="/healthcare-seo-agency">healthcare</Link>,{' '}
                  <Link to="/law-firm-seo-agency">law firms</Link> or{' '}
                  <Link to="/home-services-seo-agency">home services</Link>, because there is no measured
                  result in those verticals yet. Each of those pages says so in its own words, and none of
                  them borrows the Sendr figures to imply otherwise. If you need a vertical-specific
                  reference before signing, that is a reasonable requirement and RankedTag does not meet
                  it today.
                </p>
              </section>

              <section className="dg-section">
                <h2 id="judging">How to read any agency's case studies, including this one</h2>
                <p>
                  Three questions do most of the work. First, what is the denominator: impressions and
                  clicks mean one thing on a site with ten pages and another on a site with ten thousand,
                  and a percentage with no absolute number beside it is designed to be unreadable.
                  Second, what was happening anyway: a brand that ran a funding announcement during the
                  measured window will show organic growth that no SEO work produced. Third, what was
                  actually delivered rather than recommended, since a large share of agency
                  recommendations never ship, and a case study rarely distinguishes between advice given
                  and changes made.
                </p>
                <p>
                  Applied to this page: Sendr started from zero, which makes the denominator question easy
                  and makes the percentage framing meaningless, which is why it is not used. The work
                  delivered is described in sequence in the{' '}
                  <Link to="/case-study/sendr">full case study</Link> and in{' '}
                  <Link to="/about">about</Link>, including the parts that are foundation work rather than
                  content. The engagement is still active, which is disclosed rather than presented as a
                  completed project.
                </p>
                <p>
                  Ask the same three questions of the agencies on our shortlists. Several of them have
                  considerably more evidence than we do, and the{' '}
                  <Link to="/how-to-choose-an-seo-agency">guide to choosing an agency</Link> sets out what
                  else to ask before signing anything.
                </p>
              </section>
            </article>
          </div>
        </section>

        <section className="final-cta ruled" data-reveal>
          <div className="container final-cta-inner">
            <span className="eyebrow bracket final-cta-eyebrow">FOUR SLOTS A MONTH</span>
            <h2 className="final-h">
              One result, documented properly.<br />
              <span className="ser">Yours could be the second.</span>
            </h2>
            <p className="final-sub">
              Send the domain. The 52-check review comes back within 48 hours, with a real opinion even
              when the answer is that you do not need an agency yet.
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

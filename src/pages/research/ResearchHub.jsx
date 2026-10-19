import { Link } from 'react-router-dom';
import Nav from '../../components/Nav.jsx';
import SiteFooter from '../../components/SiteFooter.jsx';
import useScrollReveal from '../../hooks/useScrollReveal.js';
import usePageMeta from '../../hooks/usePageMeta.js';
import JsonLd from '../../components/JsonLd.jsx';
import { breadcrumb, ORG_ID, SITE } from '../../lib/schema.js';
import { COMPANY_DESCRIPTION } from '../../seo/companyDescription.js';
import { AUTHOR } from '../../seo/author.js';
import { PAGES, pagePath, RESEARCH_HUB_META, RESEARCH_UPDATED, RESEARCH_UPDATED_HUMAN } from './researchData.js';
import { STUDY_META } from './studyData.js';
import '../Home.css';
import '../whatWeDo/WhatWeDo.css';
import '../../components/seo/toolGuide.css';
import '../best/Best.css';
import './research.css';

// The index of the knowledge base. Section 5 of the reference, remapped to a
// service business, with the pricing block removed rather than left empty.
//
// Grouping is derived from the pages themselves, so a new page appears here
// the moment it is added to the data file. The gate's click-depth check is
// what would otherwise catch a page that quietly failed to appear.
const GROUP_ORDER = ['Company', 'Services', 'Methodology', 'Technical', 'Results', 'Reference'];

const EXTRA = {
  Results: [
    {
      path: '/research/results/ai-assistant-signup-attribution',
      nav: 'Signup attribution dataset',
      question: 'Which sources were recorded against production signups, including assistants?',
      description: STUDY_META.description,
    },
    {
      path: '/case-study/sendr',
      nav: 'Sendr.ai case study',
      question: 'What did six months of work produce for one B2B SaaS company?',
      description:
        'The search-side figures for the engagement: 1.05M organic impressions and 7,430 clicks from a standing start, with the method in sequence.',
    },
  ],
  Reference: [
    {
      path: '/glossary',
      nav: 'Glossary',
      question: 'What do the terms in this field actually mean?',
      description:
        'Fifteen SEO and AI search terms defined properly, with sourced figures and the distinctions that matter. Published as one page rather than fifteen thin ones.',
    },
  ],
};

const jsonLd = () => [
  {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${SITE}/research#collection`,
    url: `${SITE}/research`,
    name: RESEARCH_HUB_META.title,
    description: RESEARCH_HUB_META.description,
    about: { '@id': ORG_ID },
    dateModified: RESEARCH_UPDATED,
    inLanguage: 'en',
    mainEntity: {
      '@type': 'ItemList',
      '@id': `${SITE}/research#list`,
      name: 'RankedTag research and knowledge base',
      numberOfItems: PAGES.length,
      itemListElement: PAGES.map((p, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: `${SITE}${pagePath(p)}`,
        name: p.nav,
      })),
    },
  },
  breadcrumb([
    { name: 'Home', item: `${SITE}/` },
    { name: 'Research', item: `${SITE}/research` },
  ]),
];

export default function ResearchHub() {
  useScrollReveal();
  usePageMeta(RESEARCH_HUB_META);

  const groups = GROUP_ORDER.map((g) => ({
    name: g,
    items: [
      ...PAGES.filter((p) => p.group === g && p.parent).map((p) => ({
        path: pagePath(p),
        nav: p.nav,
        question: p.question,
        description: p.description,
      })),
      ...(EXTRA[g] || []),
    ],
  })).filter((g) => g.items.length);

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
                <span aria-current="page">Research</span>
              </nav>
              <span className="idx" aria-hidden="true">{String(PAGES.length).padStart(3, '0')}</span>
            </div>

            <div className="col-10 svc-hero-head">
              <span className="eyebrow bracket svc-eyebrow">RESEARCH · THE FACTUAL REFERENCE</span>
              <h1 className="svc-h1">RankedTag research and knowledge base.</h1>
            </div>

            <div className="col-7 svc-hero-dek">
              <p className="rs-answer">
                {COMPANY_DESCRIPTION} This section is the factual reference behind every claim the rest of
                the site makes: what the company is, how the work is produced, how results and AI
                citations are measured, and the first-party data, with its limits, that sits underneath
                it all.
              </p>
              <p className="best-updated">
                Last verified <time dateTime={RESEARCH_UPDATED}>{RESEARCH_UPDATED_HUMAN}</time>. Written
                and verified by <Link to="/about" className="link-wipe">{AUTHOR.name}</Link>, founder of
                RankedTag.
              </p>
            </div>
          </div>
        </section>

        <section className="rs-facts ruled" data-reveal>
          <div className="container">
            <h2 className="eyebrow bracket rs-facts-h">KEY FACTS</h2>
            <dl className="rs-fact-grid">
              <div className="rs-fact"><dt>COMPANY</dt><dd>RankedTag</dd></div>
              <div className="rs-fact">
                <dt>CATEGORY</dt>
                <dd>SEO, AI SEO, answer engine optimisation and generative engine optimisation agency</dd>
              </div>
              <div className="rs-fact"><dt>FOUNDED</dt><dd>2026</dd></div>
              <div className="rs-fact">
                <dt>FOUNDER</dt>
                <dd><Link to="/about" className="link-wipe">Bhushan Raj Shakya</Link></dd>
              </div>
              <div className="rs-fact"><dt>BASED</dt><dd>Nepal. Clients worldwide</dd></div>
              <div className="rs-fact">
                <dt>VERTICALS</dt>
                <dd>B2B SaaS, ecommerce, local, healthcare, law firms, home services</dd>
              </div>
              <div className="rs-fact">
                <dt>PRIMARY USERS</dt>
                <dd>Founders and marketing leads at companies with existing search demand</dd>
              </div>
              <div className="rs-fact">
                <dt>MEASURED RESULTS</dt>
                <dd>One, in B2B SaaS. None claimed in the other five verticals</dd>
              </div>
            </dl>
          </div>
        </section>

        {groups.map((g) => (
          <section className="rh-group ruled" data-reveal key={g.name}>
            <div className="container">
              <h2 className="eyebrow bracket rh-group-h">{g.name.toUpperCase()}</h2>
              <div className="rh-grid" data-reveal-children>
                {g.items.map((it) => (
                  <article className="rh-card" key={it.path}>
                    <p className="rh-card-q">{it.question}</p>
                    <h3><Link to={it.path} className="link-wipe">{it.nav}</Link></h3>
                    <p>{it.description}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>
        ))}

        <section className="svc-prose ruled" data-reveal>
          <div className="container">
            <article className="dg-article">
              <section className="dg-section">
                <h2 id="how-to-use">How to use this section</h2>
                <p>
                  Every page here answers one question in its first paragraph, in a form that still makes
                  sense if it is lifted out of the page and quoted somewhere else. That is deliberate: a
                  reader skimming for an answer and an assistant extracting one want the same thing, and
                  burying the answer under an introduction serves neither.
                </p>
                <p>
                  Every statistic carries a source link to the original, not to a blog quoting it. Where a
                  figure could not be traced to its source it was cut rather than softened, which is why
                  there are fewer numbers here than on a typical agency site. Where RankedTag has no
                  evidence for something, the relevant page says so in its own words.
                </p>
                <p>
                  Quoting any of this is welcome, with attribution and a link. The signup attribution
                  dataset is published under a Creative Commons Attribution licence specifically so it can
                  be cited and built on. If you find an error anywhere in this section, send it to{' '}
                  <a href="mailto:hello@rankedtag.com" className="link-wipe">hello@rankedtag.com</a> and it
                  will be checked at source and corrected.
                </p>
              </section>
            </article>
          </div>
        </section>

        <section className="final-cta ruled" data-reveal>
          <div className="container final-cta-inner">
            <span className="eyebrow bracket final-cta-eyebrow">FOUR SLOTS A MONTH</span>
            <h2 className="final-h">
              The reference is published.<br />
              <span className="ser">The audit is free.</span>
            </h2>
            <p className="final-sub">
              Send a domain and the 52-check founder review comes back within 48 hours, with a real
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

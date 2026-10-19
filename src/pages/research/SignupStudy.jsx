import { Link } from 'react-router-dom';
import Nav from '../../components/Nav.jsx';
import SiteFooter from '../../components/SiteFooter.jsx';
import useScrollReveal from '../../hooks/useScrollReveal.js';
import usePageMeta from '../../hooks/usePageMeta.js';
import JsonLd from '../../components/JsonLd.jsx';
import { breadcrumb, faqPage, ORG_ID, SITE } from '../../lib/schema.js';
import { AUTHOR, AUTHOR_ID } from '../../seo/author.js';
import { SIGNUPS } from '../../components/proof/SignupRail.jsx';
import { STUDY_META, STUDY_UPDATED, STUDY_UPDATED_HUMAN } from './studyData.js';
import '../Home.css';
import '../whatWeDo/WhatWeDo.css';
import '../../components/seo/toolGuide.css';
import '../verticals/verticals.css';
import '../best/Best.css';
import './research.css';

// The first-party dataset, published with its limits in the first screen
// rather than in a footnote.
//
// EVERY NUMBER ON THIS PAGE IS COMPUTED FROM `SIGNUPS`, the same array that
// renders the screenshot rail on the homepage. Nothing is typed in by hand, so
// a count here cannot drift from the evidence it claims to describe, and
// adding an alert to the array updates the study rather than contradicting it.

// Source strings are recorded verbatim in SIGNUPS ("chatgpt", "ChatGPT",
// "SEO", "AI"). Casing is folded for counting and the verbatim string is kept
// for display, because the screenshot is the evidence.
const norm = (s) => s.toLowerCase();

const ASSISTANTS = new Set(['chatgpt', 'gemini', 'claude', 'notebooklm']);

function tally(key) {
  const m = new Map();
  for (const s of SIGNUPS) {
    const k = key(s);
    m.set(k, (m.get(k) || 0) + 1);
  }
  return [...m.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}

const BY_SOURCE = tally((s) => norm(s.source));
const BY_COUNTRY = tally((s) => s.country);
const N = SIGNUPS.length;
const NAMED_ASSISTANT = SIGNUPS.filter((s) => ASSISTANTS.has(norm(s.source))).length;
const OTHER = N - NAMED_ASSISTANT;
const pct = (n) => `${Math.round((n / N) * 100)}%`;

// Display names for the folded source keys. A key with no entry here is shown
// exactly as recorded, which is the right default for a verbatim dataset.
const LABEL = {
  chatgpt: 'ChatGPT',
  gemini: 'Gemini',
  claude: 'Claude',
  notebooklm: 'NotebookLM',
  google: 'Google',
  search: 'search',
  seo: 'SEO',
  ai: 'AI',
};
const label = (k) => LABEL[k] || k;

// Answers carry their own counts, computed from the same array as the tables,
// so an FAQ answer cannot contradict the table above it.
const STUDY_FAQS = [
  [
    'Do AI assistants actually drive signups?',
    `In this sample, yes: of ${N} production signup alerts from one B2B SaaS company, ${NAMED_ASSISTANT} recorded a named assistant as the attribution source. That is evidence it happens, not evidence of how often it happens.`,
  ],
  [
    `Why is the sample only ${N} signups?`,
    `Because ${N} alerts were captured as screenshots. It is a convenience sample rather than a systematic export, and the client reports materially higher monthly signup volume, so the sample is a subset of a larger population of unknown size.`,
  ],
  [
    'What period does the data cover?',
    'Unknown, and that is the sample\u2019s main limitation. The captures carry no timestamps, so no period can be stated and no rate or trend can be derived.',
  ],
  [
    'Can I cite this dataset?',
    'Yes, freely, with attribution to RankedTag and a link to this page under CC BY 4.0. Please carry the sample size alongside any percentage taken from it.',
  ],
  [
    'How was the attribution source captured?',
    'The signup workflow recorded a source string with each new signup and posted it to a production alert channel. The strings are published verbatim, including the ones that name no engine.',
  ],
  [
    'Does this prove the SEO work caused the signups?',
    'No. It shows which sources were recorded against those signups. Causation would need a controlled comparison that a single engagement cannot provide.',
  ],
];

const jsonLd = () => [
  {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    '@id': `${SITE}/research/results/ai-assistant-signup-attribution#dataset`,
    name: 'Attribution sources recorded against 17 production signups, Sendr.ai',
    description:
      `A sample of ${N} production signup alerts from a single B2B SaaS engagement, each recording the ` +
      'attribution source string captured at signup and the country reported. Published verbatim, with ' +
      'no timestamps available, so no rate or trend can be derived.',
    url: `${SITE}/research/results/ai-assistant-signup-attribution`,
    license: 'https://creativecommons.org/licenses/by/4.0/',
    creator: { '@id': ORG_ID },
    isAccessibleForFree: true,
    inLanguage: 'en',
    dateModified: STUDY_UPDATED,
    measurementTechnique: 'Attribution source string captured by the signup workflow and recorded in a production alert',
    variableMeasured: [
      { '@type': 'PropertyValue', name: 'attribution source', description: 'The source string recorded at signup, verbatim' },
      { '@type': 'PropertyValue', name: 'country', description: 'The country code reported with the signup' },
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `${SITE}/research/results/ai-assistant-signup-attribution#article`,
    headline: STUDY_META.title,
    description: STUDY_META.description,
    url: `${SITE}/research/results/ai-assistant-signup-attribution`,
    image: `${SITE}/og/research-signup-attribution.png`,
    datePublished: '2026-10-19',
    dateModified: STUDY_UPDATED,
    author: { '@id': AUTHOR_ID },
    publisher: { '@id': ORG_ID },
    inLanguage: 'en',
  },
  faqPage(STUDY_FAQS, {
    id: `${SITE}/research/results/ai-assistant-signup-attribution#faq`,
    isPartOf: `${SITE}/research/results/ai-assistant-signup-attribution#article`,
  }),
  breadcrumb([
    { name: 'Home', item: `${SITE}/` },
    { name: 'Research', item: `${SITE}/research` },
    { name: 'Results', item: `${SITE}/research/results` },
    { name: 'Signup attribution sample', item: `${SITE}/research/results/ai-assistant-signup-attribution` },
  ]),
];

export default function SignupStudy() {
  useScrollReveal();
  usePageMeta(STUDY_META);

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
                <Link to="/research" className="link-wipe">Research</Link>
                <span aria-hidden="true">/</span>
                <Link to="/research/results" className="link-wipe">Results</Link>
                <span aria-hidden="true">/</span>
                <span aria-current="page">Signup attribution</span>
              </nav>
              <span className="idx" aria-hidden="true">{String(N).padStart(3, '0')}</span>
            </div>

            <div className="col-10 svc-hero-head">
              <span className="eyebrow bracket svc-eyebrow">FIRST-PARTY DATA · SAMPLE, NOT A CENSUS</span>
              <h1 className="svc-h1">
                Which sources were recorded against {N} production signups.
              </h1>
            </div>

            <div className="col-7 svc-hero-dek">
              <p className="rs-answer">
                In a sample of {N} production signup alerts from one B2B SaaS engagement, {NAMED_ASSISTANT}{' '}
                recorded a named AI assistant as the attribution source and {OTHER} recorded a search or
                generic string. The sample carries no timestamps, so no rate, trend or share of total
                signups can be derived from it. It is published because the raw observation is unusual,
                not because it is representative.
              </p>
              <p className="best-updated">
                Last updated <time dateTime={STUDY_UPDATED}>{STUDY_UPDATED_HUMAN}</time>. Compiled by{' '}
                <Link to="/about" className="link-wipe">{AUTHOR.name}</Link>, founder of RankedTag. Free to
                cite with attribution and a link.
              </p>
            </div>
          </div>
        </section>

        <section className="rs-facts ruled" data-reveal>
          <div className="container">
            <h2 className="eyebrow bracket rs-facts-h">THE DATASET IN ONE SCREEN</h2>
            <dl className="rs-fact-grid">
              <div className="rs-fact">
                <dt>SAMPLE SIZE</dt>
                <dd>{N} production signup alerts, captured during the Sendr.ai engagement</dd>
              </div>
              <div className="rs-fact">
                <dt>NAMED ASSISTANT AS SOURCE</dt>
                <dd>{NAMED_ASSISTANT} of {N} ({pct(NAMED_ASSISTANT)} of the sample, not of all signups)</dd>
              </div>
              <div className="rs-fact">
                <dt>DISTINCT SOURCE STRINGS</dt>
                <dd>{BY_SOURCE.length}, recorded verbatim and not normalised</dd>
              </div>
              <div className="rs-fact">
                <dt>COUNTRIES REPRESENTED</dt>
                <dd>{BY_COUNTRY.length}, as reported by the signup workflow</dd>
              </div>
              <div className="rs-fact">
                <dt>TIMESTAMPS</dt>
                <dd>None. The captures carry no dates, which is the sample's main limitation</dd>
              </div>
              <div className="rs-fact">
                <dt>LICENCE</dt>
                <dd>
                  Free to cite and reproduce with attribution to RankedTag and a link to this page
                  (CC BY 4.0)
                </dd>
              </div>
            </dl>
          </div>
        </section>

        <section className="svc-prose ruled" data-reveal>
          <div className="container">
            <article className="dg-article">
              <section className="dg-section">
                <h2 id="method">Methodology, stated before the numbers</h2>
                <p>
                  Sendr.ai is a B2B SaaS company and a RankedTag client. During the engagement, its signup
                  workflow posted an alert to a production channel for every new signup, including the
                  attribution source string captured at signup and the country reported with it. The
                  screenshots of {N} of those alerts are published on the RankedTag homepage, with
                  customer names, emails and phone numbers blurred.
                </p>
                <p>
                  This page is the dataset behind those screenshots. Each row is transcribed from one
                  alert. The source string is recorded exactly as the workflow wrote it, which is why the
                  table below contains both "ChatGPT" and "chatgpt", and why "SEO", "search" and "AI"
                  appear as sources even though they name no engine. Normalising them would make the table
                  tidier and the evidence weaker.
                </p>
                <p>
                  How the sample was selected is the part a reader should weigh most heavily: these are the
                  alerts that were captured as screenshots, not a systematic export of all signups in a
                  defined period. That makes it a convenience sample. The client reports materially higher
                  monthly signup volume than this sample contains, so the {N} alerts here are a subset of
                  an unknown larger population, and nothing about proportions in the wider population can
                  be inferred from them.
                </p>
              </section>

              <section className="dg-section">
                <h2 id="by-source">Attribution source, as recorded</h2>
                <div
                  className="best-table-scroll"
                  tabIndex="0"
                  role="region"
                  aria-label="Attribution sources recorded against the sample"
                >
                  <table className="best-table rs-table">
                    <caption>
                      Attribution source strings across {N} production signup alerts, folded for case
                    </caption>
                    <thead>
                      <tr>
                        <th scope="col">Source as recorded</th>
                        <th scope="col">Alerts</th>
                        <th scope="col">Share of this sample</th>
                        <th scope="col">Type</th>
                      </tr>
                    </thead>
                    <tbody>
                      {BY_SOURCE.map(([k, n]) => (
                        <tr key={k}>
                          <th scope="row">{label(k)}</th>
                          <td>{n}</td>
                          <td>{pct(n)}</td>
                          <td>{ASSISTANTS.has(k) ? 'Named AI assistant' : 'Search or generic string'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p>
                  Read that table as counts out of {N}, never as market share. With a sample this size a
                  single alert moves a percentage by roughly six points, which is why the counts are
                  printed beside every percentage.
                </p>
              </section>

              <section className="dg-section">
                <h2 id="by-country">Country, as reported</h2>
                <div
                  className="best-table-scroll"
                  tabIndex="0"
                  role="region"
                  aria-label="Countries reported across the sample"
                >
                  <table className="best-table rs-table">
                    <caption>Countries reported across the same {N} alerts</caption>
                    <thead>
                      <tr>
                        <th scope="col">Country code, as reported</th>
                        <th scope="col">Alerts</th>
                      </tr>
                    </thead>
                    <tbody>
                      {BY_COUNTRY.map(([k, n]) => (
                        <tr key={k}>
                          <th scope="row">{k}</th>
                          <td>{n}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p>
                  The codes are reproduced exactly as the workflow recorded them rather than being mapped
                  to country names, because a mapping is an interpretation and this is a transcription.
                </p>
              </section>

              <section className="dg-section">
                <h2 id="supports">What this sample supports</h2>
                <p>
                  One thing, and it is narrower than most published commentary on this subject: named AI
                  assistants appear as attributed signup sources in production, for a real B2B SaaS
                  company, across several countries. Not referral traffic, not impressions, not a survey
                  of intent. Signups, with the assistant named in the record.
                </p>
                <p>
                  That matters because the usual objection to assistant visibility is that it cannot be
                  connected to anything commercial. These {N} alerts are a small counter-example: in this
                  engagement, the connection existed and was recorded at the point of signup rather than
                  reconstructed afterwards.
                </p>
              </section>

              <section className="dg-section">
                <h2 id="limits">What this sample does not support</h2>
                <ul className="rs-list">
                  <li>
                    No rate. Without timestamps there is no period, and without a period there is no
                    signups-per-month, no trend and no before-and-after.
                  </li>
                  <li>
                    No share of total. The sample is a subset of a larger population of unknown size, so{' '}
                    {pct(NAMED_ASSISTANT)} of this sample is not {pct(NAMED_ASSISTANT)} of signups.
                  </li>
                  <li>
                    No generalisation beyond one company. One B2B SaaS product, one category, one
                    engagement. Nothing here says anything reliable about ecommerce, local services or any
                    other vertical.
                  </li>
                  <li>
                    No attribution accuracy claim. The source string is whatever the signup workflow
                    captured, and self-reported or referrer-derived attribution is imperfect in ways this
                    dataset cannot correct.
                  </li>
                  <li>
                    No causation. These signups are not evidence that the SEO and GEO work caused them,
                    only that the sources were recorded as shown.
                  </li>
                </ul>
                <p>
                  A stronger version of this dataset is possible and is not published: a complete export
                  over a defined window, with timestamps, would support rates, trends and a genuine share
                  of total. That export is not in hand, and publishing the stronger claim before the data
                  supports it would be the exact failure this site argues against everywhere else.
                </p>
              </section>

              <section className="dg-section">
                <h2 id="cite">Citing this dataset</h2>
                <p>
                  Free to quote, reproduce and build on, with attribution to RankedTag and a link to this
                  page, under a Creative Commons Attribution 4.0 licence. Suggested wording: "In a sample
                  of {N} production signup alerts from one B2B SaaS company, {NAMED_ASSISTANT} recorded a
                  named AI assistant as the attribution source (RankedTag, {STUDY_UPDATED_HUMAN})." If you
                  quote the {pct(NAMED_ASSISTANT)} figure, please carry the sample size with it.
                </p>
                <p>
                  The screenshots behind every row are on the{' '}
                  <Link to="/#signup-proof">homepage signup rail</Link>, and the search-side figures for
                  the same engagement are in the{' '}
                  <Link to="/case-study/sendr">Sendr.ai case study</Link>.
                </p>
              </section>

              <section className="dg-section">
                <h2 id="faq">Frequently asked questions</h2>
                {STUDY_FAQS.map(([q, a]) => (
                  <div className="rs-faq" key={q}>
                    <h3>{q}</h3>
                    <p>{a}</p>
                  </div>
                ))}
              </section>

              <section className="dg-section">
                <h2 id="related">Related reading</h2>
                <ul className="rs-list">
                  <li>
                    <Link to="/research/methodology/how-we-measure-ai-citations" className="link-wipe">
                      How AI citations are measured here
                    </Link>
                  </li>
                  <li>
                    <Link to="/research/results" className="link-wipe">Measured results, and how to weigh them</Link>
                  </li>
                  <li><Link to="/what-is-geo" className="link-wipe">What is generative engine optimisation</Link></li>
                  <li><Link to="/case-study/sendr" className="link-wipe">The full Sendr.ai case study</Link></li>
                </ul>
              </section>
            </article>
          </div>
        </section>

        <section className="final-cta ruled" data-reveal>
          <div className="container final-cta-inner">
            <span className="eyebrow bracket final-cta-eyebrow">FOUR SLOTS A MONTH</span>
            <h2 className="final-h">
              Assistants are sending signups.<br />
              <span className="ser">The question is whether they can read your site.</span>
            </h2>
            <p className="final-sub">
              The 52-check review includes whether the documented assistant crawlers can reach your pages
              at all. It comes back within 48 hours.
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

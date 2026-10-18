import { Link } from 'react-router-dom';
import Nav from '../../components/Nav.jsx';
import SiteFooter from '../../components/SiteFooter.jsx';
import usePageMeta from '../../hooks/usePageMeta.js';
import useScrollReveal from '../../hooks/useScrollReveal.js';
import JsonLd from '../../components/JsonLd.jsx';
import { breadcrumb, SITE } from '../../lib/schema.js';
import { VERTICALS, WHO_WE_HELP_META } from './verticalsData.js';
import '../Home.css';
import '../whatWeDo/WhatWeDo.css';
import '../../components/seo/toolGuide.css';

// /who-we-help — the crawlable index of the vertical pages, and the page that
// argues why they are separate pages at all. It carries its own prose rather
// than being a list of three links, so it has something to rank for and does
// not compete with its children on 200 words.
const jsonLd = () => [
  {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${SITE}/who-we-help#webpage`,
    url: `${SITE}/who-we-help`,
    name: WHO_WE_HELP_META.title,
    description: WHO_WE_HELP_META.description,
    inLanguage: 'en',
    mainEntity: {
      '@type': 'ItemList',
      itemListOrder: 'https://schema.org/ItemListUnordered',
      numberOfItems: VERTICALS.length,
      itemListElement: VERTICALS.map((v, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: v.nav,
        description: v.navDesc,
        url: `${SITE}/${v.slug}`,
      })),
    },
  },
  breadcrumb([
    { name: 'Home', item: `${SITE}/` },
    { name: 'Who we help', item: `${SITE}/who-we-help` },
  ]),
];

export default function WhoWeHelp() {
  useScrollReveal();
  usePageMeta(WHO_WE_HELP_META);

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
                <span aria-current="page">Who we help</span>
              </nav>
              <span className="idx" aria-hidden="true">002</span>
            </div>

            <div className="col-10 svc-hero-head">
              <span className="eyebrow bracket svc-eyebrow">WHO WE HELP · SIX VERTICALS</span>
              <h1 className="svc-h1">Six verticals, six playbooks.</h1>
            </div>

            <div className="col-6 svc-hero-dek">
              <p className="svc-dek">
                RankedTag works with B2B SaaS companies, ecommerce retailers, local and service-area
                businesses, healthcare providers, law firms and home services trades. The craft is shared;
                the strategy is not. Each has a different buying cycle, a different architecture problem and
                a different definition of a result, so each gets its own approach rather than a renamed
                template.
              </p>
            </div>
            <div className="col-5 start-8 svc-hero-cta">
              <Link to="/apply" className="btn btn-red btn-lg ar-parent">
                Apply for a free founder review <span className="ar-ne">↗</span>
              </Link>
            </div>
          </div>
        </section>

        <section className="svc-index ruled" data-reveal>
          <div className="container">
            <ol className="svc-rows" data-reveal-children>
              {VERTICALS.map((v, i) => (
                <li key={v.slug}>
                  <Link to={`/${v.slug}`} className="svc-row ar-parent">
                    <span className="svc-row-num" aria-hidden="true">{String(i + 1).padStart(3, '0')}</span>
                    <h2 className="svc-row-h">{v.nav}</h2>
                    <p className="svc-row-desc">{v.navDesc}</p>
                    <span className="svc-row-go">See the playbook <span className="ar">→</span></span>
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="svc-prose ruled" data-reveal>
          <div className="container">
            <article className="dg-article">
              <section className="dg-section">
                <h2 id="why-separate">Why these are not one page</h2>
                <p>
                  Most agencies describe themselves as working with everyone and then prove it with a page
                  that could be about anyone. It is a reasonable way to avoid turning work away and a poor way
                  to win it, because the buyer reading it has a specific problem and can tell within a
                  paragraph whether you have met it before.
                </p>
                <p>
                  The six verticals below are genuinely different pieces of work. For{' '}
                  <Link to="/saas-seo-agency">B2B SaaS</Link>, the hard part is economic: the queries worth
                  the most have almost no search volume, the category may not have a name yet, and a
                  three-month sales cycle makes last-click reporting erase the contribution of the page that
                  started everything. The job is choosing the right low-volume targets and proving they paid.
                </p>
                <p>
                  For <Link to="/ecommerce-seo-agency">ecommerce</Link>, it is architectural. A catalogue with
                  four filter dimensions generates more crawlable URLs than the store has products, variants
                  split ranking signals, category pages cannibalise each other, and discontinued products take
                  years of accumulated links down with them. One template decision applies to ten thousand
                  pages, which is why the leverage sits in the structure rather than the copy.
                </p>
                <p>
                  For <Link to="/local-seo-agency">local and service-area businesses</Link>, the main asset is
                  not the website at all. The Map Pack sits above the organic results and ranks on relevance,
                  distance and prominence, driven by a Google Business Profile, reviews and citations. You can
                  rank well organically and still get no calls, and your position changes from one postcode to
                  the next, so there is no single number to report.
                </p>
                <p>
                  Three more sit on top of that foundation with constraints of their own.{' '}
                  <Link to="/healthcare-seo-agency">Healthcare</Link> is judged against expert consensus
                  rather than against the competing page, which makes named clinical authorship the mechanism
                  rather than a nicety. <Link to="/law-firm-seo-agency">Law firms</Link> are usually carrying
                  a practice-area and location matrix that is quietly competing with itself, so the first
                  deliverable is a list of pages to delete. <Link to="/home-services-seo-agency">Home
                  services</Link> are capped by travel radius before anything else, and most of the job is
                  won from a profile before anyone opens the website.
                </p>
                <p>
                  What carries across all three is the craft:{' '}
                  <Link to="/what-we-do/technical-seo">technical foundations</Link>, a{' '}
                  <Link to="/what-we-do/content-marketing">content engine</Link> run by senior editors at AI
                  speed, and the entity and structured-data work behind{' '}
                  <Link to="/what-we-do/generative-engine-optimization">being cited by AI search</Link>. Those
                  are documented under <Link to="/what-we-do">what we do</Link>, deliberately without an
                  audience attached, because that is the part that genuinely does not change.
                </p>
              </section>

              <section className="dg-section">
                <h2 id="when-a-vertical">When a vertical earns its own page, and when it does not</h2>
                <p>
                  Six is a deliberate number rather than a stopping point we reached by accident. Vertical
                  pages are easy to mass-produce and the temptation is obvious: twenty of them looks like
                  coverage, ranks for twenty head terms, and costs a fortnight. It is also how a site becomes
                  a collection of near-identical pages that Google consolidates and a buyer sees through in
                  one paragraph.
                </p>
                <p>
                  Our test is whether the vertical has a distinct structural problem we can describe
                  specifically. Ecommerce has faceted navigation generating more URLs than the store has
                  products. Local has a ranking factor nobody can optimise, because distance is fixed.
                  Healthcare has content assessed against expert consensus rather than against the competing
                  page. If we cannot name the problem without resorting to generalities, the vertical does
                  not get a page, however attractive the search volume looks.
                </p>
                <p>
                  The second test is whether the advice would differ. A page that recommends the same
                  sequence of work as the page next to it is not a vertical page; it is the capability page
                  with a different noun at the top. We check this mechanically before publishing, comparing
                  the rendered sections across all six, and if a section is identical on two pages it gets
                  rewritten or removed.
                </p>
                <p>
                  There are verticals we have deliberately not built. Financial services, education,
                  manufacturing and hospitality all have genuine search dynamics, and we could write
                  plausible pages about each. We have not, because plausible is the problem: without real
                  engagements behind them, those pages would be competent summaries of other people’s
                  writing, which is precisely the thing this site exists not to produce.
                </p>
              </section>

              <section className="dg-section">
                <h2 id="shared-craft">What does not change between them</h2>
                <p>
                  The six playbooks differ in sequence and emphasis, not in craft. Every one of them rests on
                  the same foundation: pages that can be crawled and indexed, a site that renders content
                  server-side so AI crawlers can read it, an entity graph that resolves consistently, internal
                  links that concentrate authority where it converts, and content with something true and
                  specific in it.
                </p>
                <p>
                  That shared layer is documented separately, without an audience attached, under{' '}
                  <Link to="/what-we-do">what we do</Link>. It is written that way on purpose. The technical
                  work on a clinic and on a catalogue is substantially the same work; what differs is which
                  part of it is the constraint, and in what order it pays to fix things.
                </p>
              </section>

              <section className="dg-section">
                <h2 id="honest-note">Where our proof comes from</h2>
                <p>
                  One engagement is measured, cross-checkable and ours to cite: sendr.ai, a B2B SaaS company
                  taken from zero to 1.05M organic impressions and 7,430 clicks in six months, and to the #2
                  position in Google's AI Overview for its category query, above ZoomInfo. You can read the{' '}
                  <Link to="/case-study/sendr">full case study</Link>.
                </p>
                <p>
                  That result is in one vertical, so it is cited on one page. The ecommerce and local pages
                  carry no results section, because we do not yet have results in those verticals and
                  borrowing a number from an adjacent one would be the first thing we tell clients never to
                  do. Those pages argue from method instead. If a vertical-specific reference is a
                  requirement for you, that is a fair requirement, and today we would not meet it.
                </p>
              </section>
            </article>
          </div>
        </section>

        <section className="final-cta ruled" data-reveal>
          <div className="container final-cta-inner">
            <span className="eyebrow bracket final-cta-eyebrow">FOUR SLOTS A MONTH</span>
            <h2 className="final-h">
              Four founder slots a month.<br />
              <span className="ser">One is yours if it fits.</span>
            </h2>
            <p className="final-sub">
              Drop your domain. The founder runs the 52-check review personally and replies within 48 hours,
              with a real opinion, even when the answer is no.
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

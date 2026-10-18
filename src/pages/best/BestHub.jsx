import { Link } from 'react-router-dom';
import Nav from '../../components/Nav.jsx';
import SiteFooter from '../../components/SiteFooter.jsx';
import usePageMeta from '../../hooks/usePageMeta.js';
import useScrollReveal from '../../hooks/useScrollReveal.js';
import JsonLd from '../../components/JsonLd.jsx';
import { breadcrumb, SITE } from '../../lib/schema.js';
import { COMPARISONS, BEST_HUB_META } from './comparisonsData.js';
import '../Home.css';
import '../whatWeDo/WhatWeDo.css';
import './Best.css';

// /best — the index for the comparison pages, and the page that explains the
// editorial rules they are all written under. It exists for two reasons: the
// three lists needed a section home so their breadcrumbs resolve to a real
// URL, and the methodology belongs in one place rather than repeated three
// times at the length it deserves.
const jsonLd = () => [
  {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${SITE}/best#webpage`,
    url: `${SITE}/best`,
    name: BEST_HUB_META.title,
    description: BEST_HUB_META.description,
    inLanguage: 'en',
    mainEntity: {
      '@type': 'ItemList',
      itemListOrder: 'https://schema.org/ItemListUnordered',
      numberOfItems: COMPARISONS.length,
      itemListElement: COMPARISONS.map((c, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: c.nav,
        url: `${SITE}${c.path}`,
      })),
    },
  },
  breadcrumb([
    { name: 'Home', item: `${SITE}/` },
    { name: 'Best', item: `${SITE}/best` },
  ]),
];

export default function BestHub() {
  useScrollReveal();
  usePageMeta(BEST_HUB_META);

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
                <span aria-current="page">Best</span>
              </nav>
              <span className="idx" aria-hidden="true">003</span>
            </div>

            <div className="col-10 svc-hero-head">
              <span className="eyebrow bracket svc-eyebrow">SHORTLISTS · UPDATED QUARTERLY</span>
              <h1 className="svc-h1">Agency shortlists we publish, bias included.</h1>
            </div>

            <div className="col-7 svc-hero-dek">
              <p className="svc-dek">
                Three researched comparisons of the agencies you are probably weighing us against. Every
                agency was checked on its own website, published pricing appears only where the agency
                publishes it, and there are no ratings, no scores and no rank order. RankedTag is on all
                three lists, positioned where it honestly belongs.
              </p>
            </div>
          </div>
        </section>

        <section className="svc-index ruled" data-reveal>
          <div className="container">
            <ol className="svc-rows" data-reveal-children>
              {COMPARISONS.map((c, i) => (
                <li key={c.slug}>
                  <Link to={c.path} className="svc-row ar-parent">
                    <span className="svc-row-num" aria-hidden="true">{String(i + 1).padStart(3, '0')}</span>
                    <h2 className="svc-row-h">{c.nav}</h2>
                    <p className="svc-row-desc">
                      {c.agencies.length} compared · last reviewed {c.verified}
                    </p>
                    <span className="svc-row-go">Read the comparison <span className="ar">→</span></span>
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
                <h2 id="rules">The rules these lists are written under</h2>
                <p>
                  Most "best agency" pages are published by an agency that ranks itself first, and the
                  pricing in them is copied from directories that stopped being accurate two years ago. We
                  publish these anyway, under rules strict enough that the pages are useful even to someone
                  who will never hire us.
                </p>
                <p>
                  <strong>Every agency is real and was checked at source.</strong> Not one entry was taken
                  from another roundup. Nothing is invented: no agency, no client, no result, no price, no
                  rating. Where a detail could not be verified on the agency's own website, it was left out
                  rather than guessed at.
                </p>
                <p>
                  <strong>Pricing appears only where the agency publishes it.</strong> Across the three
                  lists, eleven of the thirty-three entries do. The rest say "Not published", because a
                  wrong number on a comparison page is worse than a blank one, and directory pricing goes
                  stale faster than anything else on the internet.
                </p>
                <p>
                  <strong>No ratings, no scores, no rank order.</strong> We have not been a client of any
                  agency on these lists, so any score would be fabricated. That includes schema markup: you
                  will find no <code>aggregateRating</code> or <code>Review</code> on these pages, which is a
                  thing worth checking on every other list you read. The lists are alphabetical.
                </p>
                <p>
                  <strong>The bias is stated above the table, not in a footnote.</strong> RankedTag publishes
                  these lists and is on them. Each of our own entries names what we are not suited to, and on
                  two of the three it says plainly that we have no case study in that vertical. If a list
                  that includes its publisher does not tell you where the publisher is weak, it is an
                  advertisement wearing a comparison's clothes.
                </p>
                <p>
                  <strong>They are refreshed quarterly</strong>, and each page carries the date it was last
                  reviewed, both visibly and in its schema. If you find something that no longer matches an
                  agency's own site, tell us and it gets corrected.
                </p>
              </section>

              <section className="dg-section">
                <h2 id="reading-any-list">How to read an agency list that is not this one</h2>
                <p>
                  Most of what follows applies to every comparison page you will read, including ours. The
                  format is cheap to produce and expensive to produce honestly, which is why so much of it is
                  decoration.
                </p>
                <p>
                  <strong>Check who publishes it.</strong> A large share of the highest-ranking agency lists
                  are written by agencies that appear near the top of them. That is not automatically
                  disqualifying, and it is what we do here, but it should be stated on the page rather than
                  discovered in a footer. If the publisher is not named, assume one of the entries owns it.
                </p>
                <p>
                  <strong>Check whether the prices are sourced.</strong> Pricing is the single most copied
                  and least verified detail in this genre. Figures circulate between lists for years after
                  they stop being accurate, because nobody re-reads the agency’s own site. If a list shows a
                  price for every entry, be suspicious rather than impressed: when we read 33 agency websites
                  across three verticals, only nine published anything at all.
                </p>
                <p>
                  <strong>Check for ratings nobody could have produced.</strong> Scores out of ten, star
                  ratings and rank orders imply the publisher has worked with every agency listed. Almost
                  none have. A list that cannot explain how its scores were derived has invented them, and
                  the same applies to aggregateRating markup, which is worth checking in the page source.
                </p>
                <p>
                  <strong>Check whether anyone is criticised.</strong> A genuinely useful comparison says who
                  each agency does not suit, including the publisher. A list where every entry is excellent
                  at everything has told you nothing, because the only decision it helps you make is to call
                  whoever is at the top.
                </p>
                <p>
                  <strong>Check the date, and whether it means anything.</strong> A year in the title is
                  trivial to update. A stated review date with a description of what was actually re-checked
                  is harder to fake and more useful. Ours says which date each agency’s website was read.
                </p>
              </section>

              <section className="dg-section">
                <h2 id="pricing-finding">What we learned reading 33 agency websites</h2>
                <p>
                  The most useful by-product of building these lists was not the lists. It was discovering
                  how few agencies publish anything about cost, and how widely the ones that do differ.
                </p>
                <p>
                  Nine of 33 published a figure. Among those, the monthly entry points spread roughly
                  twelvefold, for work described in broadly similar language. Two firms broke the monthly
                  retainer pattern entirely: one publishes a six-figure annual floor, another charges a
                  percentage of revenue or funding. We have written that up properly, with each figure
                  attributed, on <Link to="/seo-pricing">the SEO pricing page</Link>.
                </p>
                <p>
                  The practical conclusion for a buyer is that comparing agencies on price is mostly not
                  available to you, and attempting it with figures lifted from directories will mislead you.
                  Comparing on scope is available: for this money, how many hours of whose time, producing
                  what artefacts, measured how. Two proposals that look identical on price routinely differ
                  by a factor of two on that question.
                </p>
              </section>

              <section className="dg-section">
                <h2 id="which-page">Looking for a partner rather than a shortlist?</h2>
                <p>
                  These pages are for the stage where you are still deciding who to talk to. If you already
                  know what you need, the argument for working with us is on{' '}
                  <Link to="/saas-seo-agency">the B2B SaaS page</Link>,{' '}
                  <Link to="/ecommerce-seo-agency">the ecommerce page</Link> and{' '}
                  <Link to="/local-seo-agency">the local page</Link>, and the craft behind all three is
                  documented under <Link to="/what-we-do">what we do</Link>.
                </p>
              </section>
            </article>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}

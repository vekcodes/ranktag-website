import { Link } from 'react-router-dom';
import Nav from '../../components/Nav.jsx';
import SiteFooter from '../../components/SiteFooter.jsx';
import useScrollReveal from '../../hooks/useScrollReveal.js';
import usePageMeta from '../../hooks/usePageMeta.js';
import JsonLd from '../../components/JsonLd.jsx';
import { breadcrumb, ORG_ID, SITE } from '../../lib/schema.js';
import { AUTHOR, AUTHOR_ID } from '../../seo/author.js';
import { ABOUT_META, COMPANY_DESCRIPTION } from './aboutData.js';
import '../Home.css';
import '../whatWeDo/WhatWeDo.css';
import '../../components/seo/toolGuide.css';
import './about.css';

// The named human behind the site. Until this page existed, RankedTag argued
// for E-E-A-T on its healthcare and law pages while having no identifiable
// person anywhere, which is the contradiction this page closes.
//
// Person uses the SAME @id the Organization graph and every blog byline
// already reference, so one human resolves as one entity rather than three.
const jsonLd = () => [
  {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': AUTHOR_ID,
    name: AUTHOR.name,
    jobTitle: AUTHOR.jobTitle,
    url: `${SITE}/about`,
    image: `${SITE}/founder-bhushan-raj-shakya.jpg`,
    worksFor: { '@id': ORG_ID },
    sameAs: [AUTHOR.linkedin],
    knowsAbout: [
      'Search engine optimization',
      'Generative engine optimization',
      'Answer engine optimization',
      'Technical SEO',
      'Local SEO',
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    '@id': `${SITE}/about#webpage`,
    url: `${SITE}/about`,
    name: ABOUT_META.title,
    description: ABOUT_META.description,
    mainEntity: { '@id': AUTHOR_ID },
    about: { '@id': ORG_ID },
    inLanguage: 'en',
  },
  breadcrumb([
    { name: 'Home', item: `${SITE}/` },
    { name: 'About', item: `${SITE}/about` },
  ]),
];

export default function About() {
  useScrollReveal();
  usePageMeta(ABOUT_META);

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
                <span aria-current="page">About</span>
              </nav>
              <span className="idx" aria-hidden="true">001</span>
            </div>

            <div className="col-10 svc-hero-head">
              <span className="eyebrow bracket svc-eyebrow">ABOUT · THE PERSON DOING THE WORK</span>
              <h1 className="svc-h1">RankedTag is a named person and a published method.</h1>
            </div>

            <div className="col-6 svc-hero-dek">
              <p className="svc-dek">
                {COMPANY_DESCRIPTION} It is run by Bhushan Raj Shakya, who has worked in SEO for more than
                five years, freelance before this, and who personally runs every audit the site offers.
              </p>
            </div>

            <div className="col-5 start-8 about-portrait-wrap">
              <figure className="about-portrait">
                <img
                  src="/founder-bhushan-raj-shakya.jpg"
                  alt="Bhushan Raj Shakya, founder of RankedTag"
                  width="840"
                  height="1050"
                  loading="eager"
                />
                <figcaption>
                  Bhushan Raj Shakya · Founder ·{' '}
                  <a
                    href={AUTHOR.linkedin}
                    className="link-wipe"
                    rel="noopener me"
                    target="_blank"
                  >
                    LinkedIn
                  </a>
                </figcaption>
              </figure>
            </div>
          </div>
        </section>

        <section className="svc-prose ruled" data-reveal>
          <div className="container">
            <article className="dg-article">
              <section className="dg-section">
                <h2 id="who">Who runs this</h2>
                <p>
                  Bhushan Raj Shakya. Founder, and the person who does the work. More than five years in
                  SEO, freelance before RankedTag, based in Nepal and working with clients worldwide.
                  RankedTag was founded in 2026.
                </p>
                <p>
                  There is no account management layer here. The person who reviews your domain is the
                  person who writes the strategy and approves every brief, and that is the whole argument
                  for an operation this size. It is also the limitation: there is a hard cap of four
                  founder reviews a month, and when the slots are full they are full.
                </p>
                <p>
                  Being based in Nepal is worth stating rather than obscuring. Most clients are in English
                  speaking markets, which means a working-day overlap that has to be planned rather than
                  assumed. It also means lower overheads than a London or New York agency carrying an office
                  and a bench, which is part of why a senior-only operation is economically possible at all.
                </p>
              </section>

              <section className="dg-section">
                <h2 id="sendr">What was actually done on the Sendr engagement</h2>
                <p>
                  Sendr.ai is the only client result published anywhere on this site, and it is worth being
                  precise about what the work was rather than only quoting the outcome.
                </p>
                <p>
                  Sendr was a seed-stage B2B SaaS competing in a category dominated by ZoomInfo and other
                  eight-figure incumbents. Starting from zero organic impressions, the engagement ran the
                  technical foundation first: crawlability, indexation, a coherent schema graph, and
                  server-rendered content so that AI crawlers, most of which do not execute JavaScript,
                  could actually read the pages. Content followed against a mapped set of buying queries
                  rather than a volume-ranked keyword list, with every brief approved by a human and every
                  draft rewritten by one.
                </p>
                <p>
                  Over the six-month window from 9 November 2025 to 28 April 2026, Google Search Console
                  recorded 1.05 million organic impressions and 7,430 clicks, at roughly 0.7% click-through
                  rate and an average position of about 7.1. Sendr also reached the number two position in
                  Google's AI Overview for its category-defining query, six places above ZoomInfo at number
                  eight.
                </p>
                <p>
                  Those are Search Console figures from the client's own property. They are not
                  independently auditable from outside, which is true of every agency's traffic claims,
                  including the ones on our{' '}
                  <Link to="/best/seo-agencies-for-saas">agency shortlists</Link>. The{' '}
                  <Link to="/case-study/sendr">full case study</Link> sets out the sequence in detail.
                </p>
              </section>

              <section className="dg-section">
                <h2 id="why">Why this agency exists</h2>
                <p>
                  Two things were true at the same time, and the gap between them is the reason for the
                  business. SEO retainers are routinely sold on headcount, a writer and a strategist and a
                  quarterly review, rather than on what actually ships. And the discipline changed
                  underneath the industry faster than most of the industry changed with it: a large share of
                  buyer research now begins in an assistant rather than a results page, and the tactics that
                  earn a citation there are not the tactics that were being sold.
                </p>
                <p>
                  The method is not complicated, and it is published in full under{' '}
                  <Link to="/what-we-do">what we do</Link> so you can judge it before contacting anyone.
                  Senior judgement picks the targets. AI compresses the research and the first draft, which
                  is the part that is genuinely grunt work. A human rewrites, fact-checks and adds the
                  argument, because that is the part a model cannot supply. The workflows are handed over on
                  your own infrastructure when an engagement ends.
                </p>
                <p>
                  The site is also the proof of the method, which is deliberate. Everything claimed here is
                  applied to this domain: the entity graph, the structured data, the answer-first content,
                  the citation discipline. If the approach does not work, this site is where it will be
                  visible first.
                </p>
              </section>

              <section className="dg-section">
                <h2 id="honest">What is not proven</h2>
                <p>
                  One measured client result exists, and it is in B2B SaaS. The pages for{' '}
                  <Link to="/ecommerce-seo-agency">ecommerce</Link>,{' '}
                  <Link to="/local-seo-agency">local</Link>,{' '}
                  <Link to="/healthcare-seo-agency">healthcare</Link>,{' '}
                  <Link to="/law-firm-seo-agency">law firms</Link> and{' '}
                  <Link to="/home-services-seo-agency">home services</Link> carry no results section at all,
                  because there are no results in those verticals yet. Each of those pages says so in its
                  own words rather than in a footnote.
                </p>
                <p>
                  RankedTag was founded in 2026 and is a small operation by design. If your procurement
                  process requires three comparable references, or a bench large enough to run several
                  workstreams in parallel, it will not clear that bar, and several agencies on our own{' '}
                  <Link to="/best">published shortlists</Link> are a better fit for that situation. Those
                  lists exist partly for that reason.
                </p>
                <p>
                  No certifications, awards or partner badges are claimed anywhere on this site, because
                  there are none worth claiming. The argument is the published method, the one measured
                  result, and whether the writing demonstrates that the person behind it understands the
                  problem.
                </p>
              </section>

              <section className="dg-section">
                <h2 id="contact">How to reach a person</h2>
                <p>
                  The fastest route is the <Link to="/apply">free founder review</Link>: send a domain and
                  you get the 52-check audit back within 48 hours, including when the honest answer is that
                  you do not need an agency yet. For anything else,{' '}
                  <a href="mailto:hello@rankedtag.com" className="link-wipe">hello@rankedtag.com</a> is the
                  general address and{' '}
                  <a href="mailto:bhushan@rankedtag.com" className="link-wipe">bhushan@rankedtag.com</a>{' '}
                  reaches me directly. There is no phone number and no contact form other than the
                  application, because the founder reads what comes in, and email is the honest version of
                  that.
                </p>
              </section>
            </article>
          </div>
        </section>

        <section className="final-cta ruled" data-reveal>
          <div className="container final-cta-inner">
            <span className="eyebrow bracket final-cta-eyebrow">FOUR SLOTS A MONTH</span>
            <h2 className="final-h">
              You know who you would be working with.<br />
              <span className="ser">Now send the domain.</span>
            </h2>
            <p className="final-sub">
              The 52-check review is run personally and comes back within 48 hours, with a real opinion even
              when the answer is no.
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

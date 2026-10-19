import { Link } from 'react-router-dom';
import Nav from '../../components/Nav.jsx';
import SiteFooter from '../../components/SiteFooter.jsx';
import useScrollReveal from '../../hooks/useScrollReveal.js';
import usePageMeta from '../../hooks/usePageMeta.js';
import JsonLd from '../../components/JsonLd.jsx';
import { breadcrumb, ORG_ID, SITE } from '../../lib/schema.js';
import { PRIVACY_META, LEGAL_UPDATED, LEGAL_UPDATED_HUMAN } from './companyData.js';
import '../Home.css';
import '../whatWeDo/WhatWeDo.css';
import '../../components/seo/toolGuide.css';
import '../best/Best.css';
import './company.css';

// Written against what the site actually loads, not against a template. Every
// third party named here is one that genuinely runs on these pages: the gtag
// snippet and RB2B in index.html, HubSpot behind the application form, Neon
// behind the blog, Vercel underneath all of it. If a script is removed, this
// page changes in the same commit.
const jsonLd = () => [
  {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${SITE}/privacy#webpage`,
    url: `${SITE}/privacy`,
    name: PRIVACY_META.title,
    description: PRIVACY_META.description,
    about: { '@id': ORG_ID },
    dateModified: LEGAL_UPDATED,
    inLanguage: 'en',
  },
  breadcrumb([
    { name: 'Home', item: `${SITE}/` },
    { name: 'Privacy', item: `${SITE}/privacy` },
  ]),
];

export default function Privacy() {
  useScrollReveal();
  usePageMeta(PRIVACY_META);

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
                <span aria-current="page">Privacy</span>
              </nav>
              <span className="idx" aria-hidden="true">003</span>
            </div>

            <div className="col-10 svc-hero-head">
              <span className="eyebrow bracket svc-eyebrow">PRIVACY · WHAT ACTUALLY RUNS HERE</span>
              <h1 className="svc-h1">What this site collects, named one by one.</h1>
            </div>

            <div className="col-7 svc-hero-dek">
              <p className="svc-dek">
                This is written against the scripts this site actually loads rather than from a template,
                which is why it names Google Analytics and RB2B specifically and tells you what each one
                does. One of them identifies individual visitors, and you should know that before you read
                any further.
              </p>
              <p className="best-updated">
                Last updated <time dateTime={LEGAL_UPDATED}>{LEGAL_UPDATED_HUMAN}</time>. Operated by
                RankedTag, founded 2026, based in Nepal.
              </p>
            </div>
          </div>
        </section>

        <section className="svc-prose ruled" data-reveal>
          <div className="container">
            <article className="dg-article">
              <section className="dg-section">
                <h2 id="who">Who is responsible</h2>
                <p>
                  RankedTag operates rankedtag.com and is the controller of the personal data described
                  here. RankedTag is based in Nepal and works with clients worldwide. Questions about this
                  policy, and any request to see, correct or delete your data, go to{' '}
                  <a href="mailto:hello@rankedtag.com" className="link-wipe">hello@rankedtag.com</a> and
                  are answered by a person, usually within two working days.
                </p>
              </section>

              <section className="dg-section">
                <h2 id="application">When you apply for a founder review</h2>
                <p>
                  The application form collects your name, email address, website, LinkedIn URL and
                  whatever you write in the message field. It is submitted to HubSpot, which stores it on
                  infrastructure in the United States and is where the enquiry is read and replied to.
                  Nothing else is attached to that record.
                </p>
                <p>
                  This data is used for one purpose: assessing whether an engagement makes sense and
                  replying to you. It is not sold, not rented, not shared with other agencies, and not
                  used to add you to a newsletter or a sequence. It is kept for as long as the enquiry is
                  live and for a reasonable period afterwards, and it is deleted on request, immediately
                  and without asking why.
                </p>
              </section>

              <section className="dg-section">
                <h2 id="analytics">Google Analytics</h2>
                <p>
                  This site runs Google Analytics 4 under the measurement ID G-7PPJM1XXMS. The tag is
                  loaded roughly two seconds after the page finishes loading, which is a performance
                  decision rather than a privacy one, but it means the request does not fire at all for a
                  visitor who leaves immediately.
                </p>
                <p>
                  Analytics sets cookies in the <code>_ga</code> family to tell one browser from another
                  across visits, and it processes your IP address, approximate location, device, browser
                  and the pages you look at. It is used to see which pages are read and which are not.
                  Google is an independent controller for the data it collects through its own tag, and
                  the data is processed in the United States. Blocking the gtag script, or using a browser
                  or extension that does, removes this entirely and breaks nothing on the site.
                </p>
              </section>

              <section className="dg-section">
                <h2 id="rb2b">RB2B visitor identification, stated plainly</h2>
                <p>
                  This site also loads RB2B, a visitor-identification service. It attempts to match a
                  visitor to an identified person or company, so that an anonymous visit can become a name.
                  This is the kind of script most B2B sites disclose in a single word buried in a cookie
                  list, and it deserves a paragraph instead.
                </p>
                <p>
                  RB2B states that its person-level identification applies to visitors in the United
                  States. If you are outside the United States you should still know the script is on the
                  page. RB2B operates an opt-out form for people outside the United States who want to
                  withdraw consent for the resale of their personal information to third parties, at{' '}
                  <a
                    href="https://www.rb2b.com/rb2b-gdpr-opt-out"
                    className="link-wipe"
                    rel="noopener nofollow"
                    target="_blank"
                  >
                    rb2b.com/rb2b-gdpr-opt-out
                  </a>
                  . Blocking third-party scripts in your browser also prevents it running here.
                </p>
                <p>
                  What RankedTag does with it: nothing automated. No identified visitor is added to a
                  sequence, sold, or emailed a cold pitch on the strength of having read a page. If you
                  would rather not be identified at all and tell us so at{' '}
                  <a href="mailto:hello@rankedtag.com" className="link-wipe">hello@rankedtag.com</a>, the
                  record is suppressed.
                </p>
              </section>

              <section className="dg-section">
                <h2 id="tools">The free tools</h2>
                <p>
                  The keyword density checker, domain authority checker, page speed checker and competitor
                  analysis all work the same way: you submit a URL or a block of text, a server fetches
                  and analyses it, and the result is returned to your browser. The submitted URL and the
                  result are not written to a database and are not retained after the request completes.
                </p>
                <p>
                  Two of these call third parties to do their job, and it is worth naming them. The domain
                  authority checker queries the Tranco research ranking list and the Internet Archive's
                  Wayback Machine for the domain you submit. The page speed and competitor tools fetch the
                  target page directly from our server, which means the request arrives at that site from
                  our infrastructure rather than from you.
                </p>
                <p>
                  The schema generator, llms.txt generator and SERP preview tool run entirely in your
                  browser. Nothing you type into them is ever transmitted anywhere, including to us.
                </p>
              </section>

              <section className="dg-section">
                <h2 id="blog">The blog, and what is not here</h2>
                <p>
                  Blog pages are rendered on request from a Postgres database hosted with Neon. That
                  database holds articles and author records, not visitor data. There are no accounts on
                  this site, no comment system, no forum and no login for readers, so there is no password
                  of yours to lose. There is a single administrative login for the site owner, which sets
                  one signed, httpOnly session cookie and is of no relevance to visitors.
                </p>
                <p>
                  The site is hosted on Vercel, which processes standard server request data, including IP
                  addresses, as part of serving and protecting the site. Email reaches us through
                  conventional email infrastructure, with the usual consequence that message content and
                  headers pass through providers on both sides.
                </p>
              </section>

              <section className="dg-section">
                <h2 id="cookies">Cookies, in full</h2>
                <p>
                  The complete list is short. Google Analytics sets cookies in the <code>_ga</code>{' '}
                  family for visitor measurement. RB2B sets identifiers in service of the identification
                  described above. The administrative area sets a session cookie for the site owner only.
                  The site itself sets nothing else: no advertising pixels, no retargeting tags, no
                  A/B-testing cookies, no consent-banner cookie, because there is no consent banner.
                </p>
                <p>
                  Browser-level controls work on all of it. Blocking cookies or third-party scripts
                  degrades nothing a reader uses: every page, tool and article works the same way with
                  them blocked.
                </p>
              </section>

              <section className="dg-section">
                <h2 id="rights">Your rights, and how to use them</h2>
                <p>
                  You can ask what data is held about you, ask for it corrected, ask for it deleted, ask
                  for a copy of it, or object to it being processed at all. Under the UK and EU GDPR these
                  are legal rights, and we apply the same process to everyone who asks regardless of where
                  they live, because operating two standards would be more work than operating one.
                </p>
                <p>
                  Send any of those requests to{' '}
                  <a href="mailto:hello@rankedtag.com" className="link-wipe">hello@rankedtag.com</a>. No
                  form, no identity-verification ordeal for a simple deletion, and an answer from a
                  person. Where a request concerns data held by Google or RB2B rather than by us, you will
                  be told that plainly, pointed at their process, and we will suppress what we can on our
                  side in the meantime.
                </p>
                <p>
                  This site is not directed at children, and no part of it asks for the data of anyone
                  under 16.
                </p>
              </section>

              <section className="dg-section">
                <h2 id="changes">Changes to this policy</h2>
                <p>
                  When a script is added to or removed from this site, this page changes in the same
                  commit and the date at the top moves. That is the entire change process. If you want to
                  know what has changed, ask and you will be told, rather than being directed to a
                  version-history page nobody maintains.
                </p>
                <p>
                  For the terms covering the site and the free tools, see the{' '}
                  <Link to="/terms">terms of use</Link>. For who runs this and where, see{' '}
                  <Link to="/about">about</Link>, or write to us from the{' '}
                  <Link to="/contact">contact page</Link>.
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

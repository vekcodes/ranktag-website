import { Link } from 'react-router-dom';
import Nav from '../../components/Nav.jsx';
import SiteFooter from '../../components/SiteFooter.jsx';
import useScrollReveal from '../../hooks/useScrollReveal.js';
import usePageMeta from '../../hooks/usePageMeta.js';
import JsonLd from '../../components/JsonLd.jsx';
import { breadcrumb, ORG_ID, SITE } from '../../lib/schema.js';
import { AUTHOR, AUTHOR_ID } from '../../seo/author.js';
import { CONTACT_META } from './companyData.js';
import '../Home.css';
import '../whatWeDo/WhatWeDo.css';
import '../../components/seo/toolGuide.css';
import './company.css';

// Two addresses, one person reading them, and an honest account of what
// happens after you write. ContactPage rather than WebPage so the two email
// addresses in the Organization graph have a page that corroborates them.
const jsonLd = () => [
  {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    '@id': `${SITE}/contact#webpage`,
    url: `${SITE}/contact`,
    name: CONTACT_META.title,
    description: CONTACT_META.description,
    about: { '@id': ORG_ID },
    mainEntity: { '@id': AUTHOR_ID },
    inLanguage: 'en',
  },
  breadcrumb([
    { name: 'Home', item: `${SITE}/` },
    { name: 'Contact', item: `${SITE}/contact` },
  ]),
];

export default function Contact() {
  useScrollReveal();
  usePageMeta(CONTACT_META);

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
                <span aria-current="page">Contact</span>
              </nav>
              <span className="idx" aria-hidden="true">002</span>
            </div>

            <div className="col-10 svc-hero-head">
              <span className="eyebrow bracket svc-eyebrow">CONTACT · TWO ADDRESSES</span>
              <h1 className="svc-h1">Two addresses, and the person who reads them.</h1>
            </div>

            <div className="col-6 svc-hero-dek">
              <p className="svc-dek">
                There is no switchboard, no ticket queue and no contact form other than the application.
                Email reaches a person, and that person is{' '}
                <Link to="/about">Bhushan Raj Shakya</Link>, the founder.
              </p>
            </div>
          </div>
        </section>

        <section className="co-cards ruled" data-reveal>
          <div className="container co-card-grid" data-reveal-children>
            <div className="co-card">
              <span className="co-card-k">GENERAL</span>
              <a className="co-card-a link-wipe" href="mailto:hello@rankedtag.com">hello@rankedtag.com</a>
              <p>
                Questions about the work, the published method, the shortlists, a correction to something on
                this site, a press or podcast request, or anything that is not an application.
              </p>
            </div>
            <div className="co-card">
              <span className="co-card-k">FOUNDER, DIRECT</span>
              <a className="co-card-a link-wipe" href="mailto:bhushan@rankedtag.com">bhushan@rankedtag.com</a>
              <p>
                Reaches the founder without a detour. Use it when the question is about judgement rather
                than information: whether an engagement makes sense, or whether an approach is wrong.
              </p>
            </div>
            <div className="co-card">
              <span className="co-card-k">LINKEDIN</span>
              <a
                className="co-card-a link-wipe"
                href={AUTHOR.linkedin}
                rel="noopener me"
                target="_blank"
              >
                Bhushan Raj Shakya
              </a>
              <p>
                The founder review reply comes back here, so a connection request before applying makes the
                reply easier to find. Cold pitches sent to this profile are not read.
              </p>
            </div>
            <div className="co-card co-card-cta">
              <span className="co-card-k">WANT AN AUDIT INSTEAD</span>
              <Link className="co-card-a link-wipe" to="/apply">Apply for a founder review</Link>
              <p>
                If what you actually want is an opinion on your domain, the application is faster than an
                email. It is free, it is capped at four a month, and the answer comes back within 48 hours.
              </p>
            </div>
          </div>
        </section>

        <section className="svc-prose ruled" data-reveal>
          <div className="container">
            <article className="dg-article">
              <section className="dg-section">
                <h2 id="what-happens">What happens after you write</h2>
                <p>
                  Email arrives in one inbox and is read by one person, usually within a working day and
                  always within two. There is no autoresponder, because an autoresponder is a way of
                  looking responsive without being responsive, and you would learn nothing from it that
                  this paragraph has not already told you.
                </p>
                <p>
                  If the message is an application for a founder review, the reply is the audit itself
                  rather than a scheduling link: a read of your domain across crawlability, indexation,
                  schema, Core Web Vitals, mobile, security and AI-crawler readiness, plus the
                  non-technical layer most audits skip, which is content depth, ideal-customer clarity,
                  conversion path and the quality of the writing. That reply lands within 48 hours and
                  comes with an opinion, including when the opinion is that you do not need an agency.
                </p>
                <p>
                  If the message is a question rather than an application, you get an answer to the
                  question. There is no sequence behind it, no drip, and no attempt to convert an enquiry
                  into a call. Nothing you send is added to a marketing list.
                </p>
              </section>

              <section className="dg-section">
                <h2 id="what-to-send">What to put in the first email</h2>
                <p>
                  Four things make a reply useful rather than generic, and all four fit in a short
                  paragraph. The domain, because almost every real answer depends on what is already
                  there. What you sell and to whom, in one sentence, because the same technical advice
                  points in opposite directions for a catalogue of forty thousand products and for a
                  five-page SaaS site. What has already been tried, including which agency and for how
                  long, because the most common honest answer is that the previous programme was close to
                  right and was stopped three months early. And what would count as the engagement having
                  worked, in your words rather than in ranking terms.
                </p>
                <p>
                  What is not needed: an NDA before a first conversation, a filled-in brief template, a
                  budget range, or a deck. If a mutual NDA is a procurement requirement, say so and it
                  gets signed, but it is not a precondition of an opinion.
                </p>
              </section>

              <section className="dg-section">
                <h2 id="timing">Timing, capacity and the honest constraints</h2>
                <p>
                  Four founder reviews are taken a month. That number is a function of the review being
                  done personally rather than delegated, and when the month is full the answer is that the
                  month is full, with a date rather than a waiting list.
                </p>
                <p>
                  The working day runs on Nepal time, which overlaps the European morning and the US
                  evening rather than the US working day. In practice this costs a few hours on a first
                  exchange and nothing at all afterwards, because the work is asynchronous by design: you
                  get written deliverables and recorded walkthroughs rather than a standing call that
                  consumes an hour of your week. If your organisation genuinely needs same-timezone
                  availability during US business hours, that is a real constraint and worth saying in the
                  first email rather than the fourth.
                </p>
                <p>
                  Response times slip in one specific case, which is during the first two weeks of a new
                  engagement. If you have written and had nothing back after three working days, send the
                  message again. It did not get ignored on purpose.
                </p>
              </section>

              <section className="dg-section">
                <h2 id="not-for">What not to send</h2>
                <p>
                  Link-building outreach, guest-post offers, paid-placement proposals for the agency
                  shortlists, and offers of reciprocal links are all deleted unread. The shortlists are
                  not for sale, which is stated on each of them and{' '}
                  <Link to="/terms">in the terms</Link>, and no amount of follow-up changes that.
                </p>
                <p>
                  Requests to be added to a comparison page are read, but they are treated as editorial
                  suggestions rather than listings, and the agency has to be checked at source before it
                  appears. White-label and subcontracting enquiries are usually declined, because the
                  entire argument of this business is that the person reviewing the domain is the person
                  doing the work.
                </p>
                <p>
                  Finally, corrections are genuinely welcome. If a figure on this site is wrong, or a
                  detail about an agency on a shortlist has changed, send it to{' '}
                  <a href="mailto:hello@rankedtag.com" className="link-wipe">hello@rankedtag.com</a> and
                  it gets checked at source and fixed, with the page's review date bumped. Several entries
                  have already been changed this way.
                </p>
              </section>

              <section className="dg-section">
                <h2 id="details">Company details</h2>
                <p>
                  RankedTag is an SEO, AI SEO, AEO and GEO agency founded in 2026, based in Nepal and
                  working with clients worldwide. It is run by its founder, Bhushan Raj Shakya. There is
                  no public office address, because there is no public office; the work is remote and the
                  deliverables are written.
                </p>
                <p>
                  For what this site collects when you visit it or send a message, see the{' '}
                  <Link to="/privacy">privacy policy</Link>. For the terms covering the site, the free
                  tools and the shortlists, see the <Link to="/terms">terms of use</Link>. Client work is
                  governed by a separate written agreement, not by either of those pages.
                </p>
              </section>
            </article>
          </div>
        </section>

        <section className="final-cta ruled" data-reveal>
          <div className="container final-cta-inner">
            <span className="eyebrow bracket final-cta-eyebrow">FOUR SLOTS A MONTH</span>
            <h2 className="final-h">
              An email works.<br />
              <span className="ser">An application works faster.</span>
            </h2>
            <p className="final-sub">
              Send the domain and the 52-check review comes back within 48 hours, with a real opinion even
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

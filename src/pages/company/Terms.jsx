import { Link } from 'react-router-dom';
import Nav from '../../components/Nav.jsx';
import SiteFooter from '../../components/SiteFooter.jsx';
import useScrollReveal from '../../hooks/useScrollReveal.js';
import usePageMeta from '../../hooks/usePageMeta.js';
import JsonLd from '../../components/JsonLd.jsx';
import { breadcrumb, ORG_ID, SITE } from '../../lib/schema.js';
import { TERMS_META, LEGAL_UPDATED, LEGAL_UPDATED_HUMAN } from './companyData.js';
import '../Home.css';
import '../whatWeDo/WhatWeDo.css';
import '../../components/seo/toolGuide.css';
import '../best/Best.css';
import './company.css';

// Covers the website, the free tools and the shortlists. Deliberately NOT a
// services agreement: client work runs on a signed contract, and a page that
// implied otherwise would be worse than no page.
const jsonLd = () => [
  {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${SITE}/terms#webpage`,
    url: `${SITE}/terms`,
    name: TERMS_META.title,
    description: TERMS_META.description,
    about: { '@id': ORG_ID },
    dateModified: LEGAL_UPDATED,
    inLanguage: 'en',
  },
  breadcrumb([
    { name: 'Home', item: `${SITE}/` },
    { name: 'Terms', item: `${SITE}/terms` },
  ]),
];

export default function Terms() {
  useScrollReveal();
  usePageMeta(TERMS_META);

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
                <span aria-current="page">Terms</span>
              </nav>
              <span className="idx" aria-hidden="true">004</span>
            </div>

            <div className="col-10 svc-hero-head">
              <span className="eyebrow bracket svc-eyebrow">TERMS · THE SITE AND THE TOOLS</span>
              <h1 className="svc-h1">Terms for the site, the tools and the shortlists.</h1>
            </div>

            <div className="col-7 svc-hero-dek">
              <p className="svc-dek">
                These terms cover this website, the free tools on it and the published agency comparisons.
                They do not cover client work, which runs on a separate signed agreement, and nothing here
                replaces that agreement or creates one.
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
                <h2 id="scope">What these terms cover</h2>
                <p>
                  By using rankedtag.com you accept the terms on this page. They apply to reading the
                  site, using any of the free tools, and relying on anything published here, including the
                  agency shortlists and the guides.
                </p>
                <p>
                  They do not apply to engagements. If RankedTag does paid work for you, that work is
                  governed by a written agreement signed by both sides, covering scope, deliverables,
                  fees, confidentiality, intellectual property and termination. Where this page and that
                  agreement disagree, the agreement wins. Submitting an application creates no contract
                  and no obligation on either side.
                </p>
              </section>

              <section className="dg-section">
                <h2 id="tools">The free tools</h2>
                <p>
                  The tools are provided as they are, free, with no warranty of accuracy, availability or
                  fitness for any particular purpose. They are diagnostic aids, not audits, and a score
                  produced by a tool is an input to a decision rather than the decision.
                </p>
                <p>
                  Several of them report figures derived from third-party sources, including the Tranco
                  ranking list and the Internet Archive. Those sources can be stale, incomplete or simply
                  wrong about a given domain, and nothing is done here to correct them. Treat an authority
                  figure as a rough signal, never as a valuation.
                </p>
                <p>
                  Fair use is expected: submit domains you own or have a legitimate reason to examine, do
                  not automate bulk requests against the endpoints, and do not resell the output as your
                  own service. Access may be rate-limited or withdrawn where use looks automated or
                  abusive. The tools may change or disappear without notice, and no continuity is
                  promised.
                </p>
              </section>

              <section className="dg-section">
                <h2 id="shortlists">The agency shortlists</h2>
                <p>
                  The comparison pages are editorial opinion, researched from each agency's own public
                  material on the review date shown at the top of each list. Nothing on them is paid,
                  sponsored or affiliate-linked, there is no rank order for sale, and no agency pays to be
                  included, excluded or positioned.
                </p>
                <p>
                  RankedTag appears on several of those lists and publishes them, which is a conflict of
                  interest. It is disclosed above each table rather than in a footnote, and each of our own
                  entries states what we lack as well as what we offer. Readers should weigh the lists
                  accordingly.
                </p>
                <p>
                  Agency details change, and a list checked in one quarter may be wrong in the next.
                  Verify anything that matters to a buying decision with the agency directly. If an entry
                  is inaccurate, write to{' '}
                  <a href="mailto:hello@rankedtag.com" className="link-wipe">hello@rankedtag.com</a> and it
                  is checked at source and corrected, which has already happened more than once.
                </p>
              </section>

              <section className="dg-section">
                <h2 id="no-guarantees">No guarantee of results</h2>
                <p>
                  Nothing on this site promises a ranking, a traffic level, a citation in an AI answer or
                  a revenue outcome. The published figures for Sendr.ai are what one engagement produced
                  in one category over one specific period, and they are not a forecast for anyone else.
                </p>
                <p>
                  The guides, playbooks and glossary describe approaches that have worked, in contexts
                  that may differ from yours in ways neither of us can see from here. They are published
                  so they can be judged before anyone is contacted, not as advice tailored to your
                  situation, and they are not legal, financial or professional advice of any kind.
                </p>
              </section>

              <section className="dg-section">
                <h2 id="content">Content, copying and citation</h2>
                <p>
                  The writing, research, data and design on this site belong to RankedTag. Quoting a
                  passage with attribution and a link is explicitly welcome, including by AI systems
                  summarising or answering from this material, which is the point of publishing{' '}
                  <a href="/llms.txt" className="link-wipe">llms.txt</a> and{' '}
                  <Link to="/llm-info">the assistant briefing</Link>. Republishing pages wholesale,
                  rebranding the guides, or reproducing the shortlists as someone else's research is not.
                </p>
                <p>
                  Agency names, logos and trademarks that appear in comparisons belong to their owners and
                  are used for identification in editorial comment. No endorsement by them is implied, and
                  none is claimed.
                </p>
                <p>
                  Links to other sites are provided because they are useful or because a claim needs a
                  source. What those sites publish is their responsibility, not ours.
                </p>
              </section>

              <section className="dg-section">
                <h2 id="liability">Liability</h2>
                <p>
                  To the extent the law allows, RankedTag is not liable for loss arising from use of this
                  site or its tools, including lost profit, lost traffic, lost data or decisions taken on
                  the basis of a tool output or a published opinion. Nothing here limits liability for
                  fraud or for anything else that cannot lawfully be limited.
                </p>
                <p>
                  The site is served on a best-effort basis. It may be unavailable, pages may change or be
                  removed, and no uptime is committed to.
                </p>
              </section>

              <section className="dg-section">
                <h2 id="law">Governing law and changes</h2>
                <p>
                  RankedTag operates from Nepal, and these terms and any dispute arising from the use of
                  this site are governed by the laws of Nepal. Where mandatory consumer-protection law in
                  your own country gives you rights that cannot be contracted out of, those rights are
                  unaffected.
                </p>
                <p>
                  These terms may change. The date at the top of this page moves when they do, and the
                  current version is the one that applies. Continuing to use the site after a change means
                  accepting the current version.
                </p>
                <p>
                  Questions about any of this go to{' '}
                  <a href="mailto:hello@rankedtag.com" className="link-wipe">hello@rankedtag.com</a>, or
                  through the <Link to="/contact">contact page</Link>. What the site collects is set out
                  separately in the <Link to="/privacy">privacy policy</Link>.
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

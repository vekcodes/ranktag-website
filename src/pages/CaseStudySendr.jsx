import { Link } from 'react-router-dom';
import Nav from '../components/Nav.jsx';
import usePageMeta from '../hooks/usePageMeta.js';
import JsonLd from '../components/JsonLd.jsx';
import { breadcrumb, ORG_ID, SITE } from '../lib/schema.js';
import { TOOL_META } from '../seo/routeMeta.js';
import './Home.css';
import './CaseStudy.css';

const URL = `${SITE}/case-study/sendr`;

// Standalone, indexable case study — consolidates the proof that lives in the
// homepage #case-study section into one citation-ready page (its own URL, its
// own Article schema). Every number and screenshot here already ships on the
// homepage from live Google Search Console; nothing is invented.
const CASE_JSONLD = [
  {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `${URL}#article`,
    headline:
      "How sendr.ai hit 1.05M impressions in 6 months and ranked #2 above ZoomInfo",
    description:
      "RankedTag took sendr.ai from 0 to 1.05M organic impressions and 7,430 clicks in 6 months, and to #2 in Google's AI Overview for \"the best GTM tool\" — above ZoomInfo at #8.",
    image: [`${SITE}/result-sendr.jpeg`, `${SITE}/result-ranked.jpeg`],
    datePublished: '2026-06-04',
    dateModified: '2026-06-04',
    author: { '@id': ORG_ID },
    publisher: { '@id': ORG_ID },
    about: { '@id': ORG_ID },
    mainEntityOfPage: { '@type': 'WebPage', '@id': URL },
    inLanguage: 'en',
  },
  breadcrumb([
    { name: 'Home', item: `${SITE}/` },
    { name: 'Case study: sendr.ai', item: URL },
  ]),
];

export default function CaseStudySendr() {
  usePageMeta(TOOL_META['/case-study/sendr']);

  return (
    <>
      <JsonLd data={CASE_JSONLD} />
      <Nav variant="audit" />

      <main className="cs-page">
        <div className="container">
          {/* ── Breadcrumb ─────────────────────────────────────────────── */}
          <nav className="cs-crumb" aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">Case study: sendr.ai</span>
          </nav>

          {/* ── Header ─────────────────────────────────────────────────── */}
          <header className="cs-head">
            <div className="eyebrow" style={{ color: 'var(--red)' }}>
              CASE STUDY · B2B SAAS · SEO + GEO
            </div>
            <h1 className="cs-h1">
              How <span className="ser">sendr.ai</span> went from 0 to{' '}
              <span className="accent">1.05M impressions</span> in 6 months — and
              ranked <span className="accent">#2 above ZoomInfo</span> in Google's
              AI Overview.
            </h1>
            <p className="cs-dek">
              sendr.ai is a seed-stage B2B SaaS competing in a category owned by
              ZoomInfo and other 8-figure incumbents. With no ad budget and no
              outreach, RankedTag built an inbound engine that compounds on Google
              and gets cited inside AI answer engines. These are live Google Search
              Console numbers — cross-check by running the same query yourself.
            </p>
            <div className="cs-meta">
              <span className="tag tag-red">SEED-STAGE B2B SAAS</span>
              <span className="tag tag-outline">RANKED ABOVE ZOOMINFO</span>
              <span className="tag tag-live">Active engagement</span>
            </div>
          </header>

          {/* ── At a glance (the numbers) ──────────────────────────────── */}
          <section className="cs-section" aria-label="Results at a glance">
            <div className="case-stats">
              <div className="case-stat featured">
                <div className="stat-lbl">Total organic impressions · 6 months</div>
                <div className="stat-num">1.05M</div>
                <div className="stat-delta">
                  ▲ Google Search Console · 09/11/2025 to 28/04/2026
                </div>
              </div>
              <div className="case-stat">
                <div className="stat-lbl">Total clicks</div>
                <div className="stat-num">7.43k</div>
                <div className="stat-delta">▲ same 6-month window</div>
              </div>
              <div className="case-stat">
                <div className="stat-lbl">Average CTR</div>
                <div className="stat-num">
                  0.7<span style={{ fontSize: '.6em' }}>%</span>
                </div>
                <div className="stat-delta">▲ across all ranking queries</div>
              </div>
              <div className="case-stat">
                <div className="stat-lbl">Average position</div>
                <div className="stat-num">7.1</div>
                <div className="stat-delta">▲ across the indexed surface area</div>
              </div>
              <div className="case-stat">
                <div className="stat-lbl">Google AI Overview · "best GTM tool"</div>
                <div className="stat-num">
                  #2<span style={{ fontSize: '.42em', color: 'var(--muted)' }}>
                    {' '}
                    vs ZoomInfo #8
                  </span>
                </div>
                <div className="stat-delta">▲ sendr.ai cited as the source</div>
              </div>
            </div>
          </section>

          {/* ── The challenge ──────────────────────────────────────────── */}
          <section className="cs-section">
            <h2 className="cs-h2">The challenge</h2>
            <div className="cs-prose">
              <p>
                A seed-stage SaaS does not out-spend ZoomInfo, and it does not
                out-staff a 100-person content team. sendr.ai had the same problem
                most founders bring us: months of effort, a handful of pages that
                ranked, and zero presence in the AI answers where a growing share of
                buyer research now starts. The category-defining queries — "what is
                the best GTM tool" and its neighbours — were owned by incumbents with
                eight-figure marketing budgets.
              </p>
              <p>
                The job was not "publish more." It was to win specific, high-intent
                queries on Google <em>and</em> become the brand Google's AI Overview
                names when a buyer asks for a recommendation — fast enough to matter
                while sendr.ai shipped product.
              </p>
            </div>
          </section>

          {/* ── What we did (the playbook) ─────────────────────────────── */}
          <section className="cs-section">
            <h2 className="cs-h2">What we did</h2>
            <p className="cs-prose">
              The engine is one senior strategist with AI leverage and editorial
              velocity — the same three-piece stack we run for every client. No
              offshore content mill, no autopilot publishing.
            </p>
            <ol className="cs-steps">
              <li>
                <div className="cs-step-n">01</div>
                <div>
                  <h3>Senior strategy picked the fights</h3>
                  <p>
                    Real strategists ran the SWOT, found the keyword gaps the giants
                    ignored, and chose the category-defining queries worth winning.
                    Every brief was approved by a human before a word was written.
                  </p>
                </div>
              </li>
              <li>
                <div className="cs-step-n">02</div>
                <div>
                  <h3>AI research compressed the grunt work</h3>
                  <p>
                    Claude pulled SERPs, read competitor pages, drafted briefs, and
                    mapped the GEO citation patterns that get a brand named inside
                    LLM answers — the 80% of the work that is volume, done in days
                    instead of quarters.
                  </p>
                </div>
              </li>
              <li>
                <div className="cs-step-n">03</div>
                <div>
                  <h3>Editors and workflows shipped at velocity</h3>
                  <p>
                    A senior writer rewrote every draft, fact-checked it, and added
                    the angle. N8N workflows handled trigger, enrich, publish and
                    alert. Nothing shipped unread; nothing shipped on autopilot.
                  </p>
                </div>
              </li>
              <li>
                <div className="cs-step-n">04</div>
                <div>
                  <h3>Technical SEO + GEO made the pages machine-readable</h3>
                  <p>
                    Clean crawlability, structured data, Core Web Vitals, and
                    answer-structured content so the pages rank on Google and are
                    legible to ChatGPT, Claude, Perplexity and Gemini. That is what
                    turned a ranking page into the cited source in Google's AI
                    Overview.
                  </p>
                </div>
              </li>
            </ol>
          </section>

          {/* ── The results (proof screenshots) ────────────────────────── */}
          <section className="cs-section">
            <h2 className="cs-h2">The results</h2>
            <p className="cs-prose">
              Six months in, the engine is compounding. Below is exactly what is on
              screen — no rounding, no extra claims.
            </p>

            <figure className="case-proof">
              <figcaption className="case-proof-cap">
                <span className="dot" />
                Live Google Search Console · sendr.ai · last 6 months
              </figcaption>
              <img
                src="/result-sendr.jpeg"
                alt="Google Search Console screenshot showing 7.43k total clicks and 1.05M total impressions for sendr.ai over a 6-month period, with average CTR 0.7% and average position 7.1."
                loading="lazy"
                width="1080"
                height="560"
              />
            </figure>

            <div className="cs-rank-head">
              <h3 className="cs-h3">
                Ranked #2 in Google's AI Overview, above ZoomInfo
              </h3>
              <p className="cs-prose">
                For the category-defining query <strong>"what is the best GTM
                tool"</strong>, sendr.ai sits at <strong>#2</strong> in Google's AI
                Overview while ZoomInfo sits at <strong>#8</strong> — and sendr.ai's
                own blog post is the source Google cites in the right-hand panel.
                That is the difference between renting traffic and owning the answer.
              </p>
            </div>

            <figure className="case-proof case-proof-wide">
              <figcaption className="case-proof-cap">
                <span className="dot" />
                Google search · "what is the best GTM tool"
              </figcaption>
              <img
                src="/result-ranked.jpeg"
                alt="Google search result page for the query 'what is the best GTM tool'. The AI Overview lists Sendr.ai at position #2 and ZoomInfo at position #8. Sendr.ai's blog post is featured as the cited source on the right panel."
                loading="lazy"
                width="1080"
                height="700"
              />
            </figure>
          </section>

          {/* ── Quote ──────────────────────────────────────────────────── */}
          <section className="cs-section">
            <blockquote className="case-quote">
              We went from invisible to the answer Google's AI Overview gives when
              someone asks for the best GTM tool. Six places above ZoomInfo. The
              pipeline runs while we ship product.
            </blockquote>
            <div className="case-author">
              <div className="case-author-avatar">SA</div>
              <div className="case-author-info">
                <strong>Founder, sendr.ai</strong>
                <span>Engagement: ongoing</span>
              </div>
            </div>
          </section>

          {/* ── CTA ────────────────────────────────────────────────────── */}
          <section className="cs-cta">
            <h2 className="cs-cta-h">
              Want the same engine pointed at your category?
            </h2>
            <p className="cs-cta-sub">
              We take 4 SaaS founders a month. Drop your URL and the founder runs a
              real audit, then replies on LinkedIn within 48 hours — even if it is a
              no.
            </p>
            <Link to="/apply" className="btn btn-red btn-lg">
              Apply for review <span className="ar">↗</span>
            </Link>
          </section>

          <div className="cs-back">
            <Link to="/">← Back to homepage</Link>
          </div>
        </div>
      </main>
    </>
  );
}

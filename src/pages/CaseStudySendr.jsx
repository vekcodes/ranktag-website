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
              outreach, RankedTag built an inbound engine measured on what actually
              moves revenue — <strong>AI citation share, share of voice, and
              pipeline</strong>, not vanity traffic. The result: sendr.ai is now the
              answer Google's AI Overview gives for its category, six places above
              ZoomInfo. Every number below is live Google Search Console data you can
              cross-check yourself.
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

          {/* ── The results · three independently verifiable proofs ────── */}
          <section className="cs-section">
            <h2 className="cs-h2">The results — in three proofs</h2>
            <p className="cs-prose">
              One engagement, three things you can check independently. Below is
              exactly what is on screen — no rounding, no extra claims.
            </p>

            <ol className="cs-proofs">
              {/* Proof 01 — organic visibility */}
              <li className="cs-proof">
                <div className="cs-proof-tag">Proof 01 · Organic visibility</div>
                <h3 className="cs-h3">
                  0 → 1.05M impressions and 7,430 clicks in 6 months
                </h3>
                <p className="cs-prose">
                  Across the 09/11/2025–28/04/2026 window, sendr.ai compounded to
                  1.05M organic impressions, 7.43k clicks, a 0.7% average CTR and a
                  7.1 average position — the indexed surface area of a brand the
                  category used to ignore. Straight from Google Search Console.
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
                    width="1453"
                    height="656"
                  />
                </figure>
              </li>

              {/* Proof 02 — AI Overview citation */}
              <li className="cs-proof">
                <div className="cs-proof-tag">Proof 02 · AI citation share</div>
                <h3 className="cs-h3">
                  #2 in Google's AI Overview — above ZoomInfo — for the
                  category-defining query
                </h3>
                <p className="cs-prose">
                  For <strong>"what is the best GTM tool"</strong>, sendr.ai sits at
                  <strong> #2</strong> in Google's AI Overview while ZoomInfo sits at
                  <strong> #8</strong> — and sendr.ai's own blog post is the source
                  Google cites in the right-hand panel. That is share of the answer,
                  not a blue link below the fold. It is the difference between
                  renting traffic and owning the recommendation buyers ask the AI for.
                </p>
                <figure className="case-proof case-proof-wide">
                  <figcaption className="case-proof-cap">
                    <span className="dot" />
                    Google search · "what is the best GTM tool"
                  </figcaption>
                  <img
                    src="/result-ranked.jpeg"
                    alt="Google search result page for the query 'what is the best GTM tool'. The AI Overview lists Sendr.ai at position #2 and ZoomInfo at position #8. Sendr.ai's blog post is featured as the cited source on the right panel."
                    loading="lazy"
                    width="1233"
                    height="868"
                  />
                </figure>
              </li>

              {/* Proof 03 — the founder's words */}
              <li className="cs-proof">
                <div className="cs-proof-tag">Proof 03 · In the founder's words</div>
                <blockquote className="case-quote">
                  We went from invisible to the answer Google's AI Overview gives
                  when someone asks for the best GTM tool. Six places above ZoomInfo.
                  The pipeline runs while we ship product.
                </blockquote>
                <div className="case-author">
                  <div className="case-author-avatar">SA</div>
                  <div className="case-author-info">
                    <strong>Founder, sendr.ai</strong>
                    <span>Engagement: ongoing</span>
                  </div>
                </div>
              </li>
            </ol>
          </section>

          {/* ── Verify it yourself (reproducibility = the strongest proof) ─ */}
          <section className="cs-section">
            <div className="cs-verify">
              <div className="cs-verify-tag">Don't take our word for it</div>
              <h2 className="cs-h2">Verify every claim yourself</h2>
              <p className="cs-prose">
                A GEO agency that cannot be fact-checked is just another PDF report.
                These results are public and reproducible:
              </p>
              <ul className="cs-verify-list">
                <li>
                  <strong>The AI Overview ranking:</strong> open Google and search{' '}
                  <span className="cs-q">"what is the best GTM tool"</span>. Read the
                  AI Overview and its cited sources. Live results shift over time, but
                  the screenshot above is timestamped to the engagement.
                </li>
                <li>
                  <strong>The search numbers:</strong> the Google Search Console
                  panel above shows the raw clicks, impressions, CTR and position for
                  the exact six-month window — nothing aggregated or smoothed.
                </li>
                <li>
                  <strong>Our method, on us:</strong> run your own domain through our{' '}
                  <Link to="/domain-authority-checker">free tools</Link> — every score
                  is broken down with the source links we used to compute it.
                </li>
              </ul>
            </div>
          </section>

          {/* ── Stage 4 framing: pipeline, not vanity traffic ──────────── */}
          <section className="cs-section">
            <h2 className="cs-h2">Why this is a pipeline play, not a vanity metric</h2>
            <p className="cs-prose">
              Impressions are the input. The scoreboard that matters is the one
              attached to revenue — and it is the one most agencies still do not
              track:
            </p>
            <div className="cs-scoreboard">
              <div className="cs-score">
                <div className="cs-score-h">AI citation share</div>
                <p>
                  Whether the AI names <em>you</em> when a buyer asks for a
                  recommendation. sendr.ai is the #2 cited answer in its category —
                  above an eight-figure incumbent.
                </p>
              </div>
              <div className="cs-score">
                <div className="cs-score-h">Share of voice</div>
                <p>
                  Owning the answer panel, not a link buried below it. That is
                  surface area competitors cannot simply out-spend you for overnight.
                </p>
              </div>
              <div className="cs-score">
                <div className="cs-score-h">Pipeline</div>
                <p>
                  Qualified inbound that compounds while you ship product — no ads to
                  refill, no outreach to send. The engine runs whether or not you do.
                </p>
              </div>
            </div>
            <p className="cs-prose" style={{ marginTop: '24px' }}>
              Traffic you rent stops the day you stop paying. An answer you own keeps
              feeding pipeline. That is the entire point of building the engine
              instead of buying clicks.
            </p>
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

import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Nav from '../components/Nav.jsx';
import SiteFooter from '../components/SiteFooter.jsx';
import BlogLatest from '../components/BlogLatest.jsx';
import SignupRail from '../components/proof/SignupRail.jsx';
import ProofPanels from '../components/proof/ProofPanels.jsx';
import ToolDemo from '../components/motion/ToolDemo.jsx';
import ScriptedCursor from '../components/motion/ScriptedCursor.jsx';
import FloatingBadge from '../components/motion/FloatingBadge.jsx';
import NodeGraph from '../components/motion/NodeGraph.jsx';
import FilamentBurst from '../components/motion/FilamentBurst.jsx';
import '../styles/strand.css';
import '../styles/tenora.css';
import useScrollReveal from '../hooks/useScrollReveal.js';
import usePageMeta from '../hooks/usePageMeta.js';
import JsonLd from '../components/JsonLd.jsx';
import { faqPage } from '../lib/schema.js';
import { SERVICES } from './services/servicesData.js';
import './Home.css';
import './services/Services.css';

// Mirrors the on-page FAQ section below — keep the two in sync.
const HOME_FAQ = [
  ['Are we just paying for ChatGPT to write our articles?', 'No. Claude does the keyword research and the first-pass draft. A senior writer rewrites it, fact-checks it, and adds the angle. Nothing ships without a human review. The unfair advantage is the combination, not any single piece.'],
  ['How is this different from a regular SEO agency?', 'Three things. (1) We optimize for ChatGPT, Claude, Perplexity and Gemini citations alongside Google. Most agencies are not even tracking that yet. (2) We use AI to compress the work that is grunt, so we ship in days what a regular team ships in months. (3) The pipeline lives on your infrastructure when we are done. You keep the prompts and workflows.'],
  ['When do we see results?', 'Pipeline live by week 2. First indexed pages by week 3. First top-20 rankings around weeks 5 to 7. First LLM citation typically inside 30 to 45 days. Compounding traffic curve hits in months 3 to 6. Sendr.ai hit 1.05M impressions and 7.43k clicks in 6 months on Google Search Console.'],
  ['Do you guarantee #1 rankings?', 'No. Anyone who does is lying. We aim for measurable lift in organic impressions and at least one LLM citation inside the first 90 days. That is testable. Sendr.ai is the proof we have shipped this before.'],
  ['What stage of company is this for?', 'Best fit: B2B SaaS with $20K to $2M MRR, an English-speaking ICP, and at least one founder who can do 90 minutes a week of strategy. Bad fit: pre-product, B2C consumer apps, or category-of-one products with no search demand yet.'],
  ['Can we just hire a freelancer?', 'Sure. The version a freelancer ships will be: 8 articles, no schema, no GEO optimization, no inbound automation, no citation tracking, no senior strategy oversight. Same hours, a quarter of the surface area.'],
  ['How much does it cost?', 'We share pricing once we have looked at your domain and confirmed it is a fit. Different stage of SaaS, different scope. Apply above and the founder will reply with a real number inside 48 hours.'],
];

// Homepage-specific schema. The site-wide Organization+ProfessionalService (#org)
// and WebSite (#website) live in index.html; these nodes reference them by @id.
// The FAQPage mirrors the on-page FAQ section below — Google requires the markup
// to match the visible Q&A.
const HOME_JSONLD = [
  {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': 'https://rankedtag.com/#webpage',
    url: 'https://rankedtag.com/',
    name: 'SEO, AI SEO, AEO & GEO Agency for B2B SaaS | RankedTag',
    description:
      "Full-stack SEO, AI SEO, AEO & GEO for B2B SaaS. We took sendr.ai 0→1.05M impressions in 6 months — #2 on Google's AI Overview, above ZoomInfo.",
    isPartOf: { '@id': 'https://rankedtag.com/#website' },
    about: { '@id': 'https://rankedtag.com/#org' },
    primaryImageOfPage: { '@id': 'https://rankedtag.com/#logo' },
    inLanguage: 'en',
  },
  {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    '@id': 'https://rankedtag.com/#casestudy-sendr',
    name: 'sendr.ai: 0 to 1.05M impressions in 6 months',
    headline:
      "Took sendr.ai from 0 to 1.05M impressions in 6 months — #2 on Google's AI Overview, above ZoomInfo",
    url: 'https://rankedtag.com/case-study/sendr',
    mainEntityOfPage: { '@id': 'https://rankedtag.com/case-study/sendr#article' },
    about: { '@id': 'https://rankedtag.com/#org' },
    author: { '@id': 'https://rankedtag.com/#org' },
    inLanguage: 'en',
  },
  faqPage(HOME_FAQ, {
    id: 'https://rankedtag.com/#faq',
    isPartOf: 'https://rankedtag.com/#webpage',
  }),
];

// The visible FAQ copy. Two answers intentionally differ from HOME_FAQ
// above (which feeds the FAQPage schema), so the two are kept separate.
const HOME_FAQ_VIEW = [
  ["\"Are we just paying for ChatGPT to write our articles?\"",
   "No. Claude does the keyword research and the first-pass draft. A senior writer rewrites it, fact-checks it, and adds the angle. Nothing ships without a human review. The unfair advantage is the combination, not any single piece."],
  ["How is this different from a regular SEO agency?",
   "Three things. (1) We optimize for ChatGPT, Claude, Perplexity and Gemini citations alongside Google. Most agencies are not even tracking that yet. (2) We use AI to compress the work that is grunt, so we ship in days what a regular team ships in months. (3) The pipeline lives on your infrastructure when we are done. You keep the prompts and workflows."],
  ["When do we see results?",
   "Pipeline live by week 2. First indexed pages by week 3. First top-20 rankings around weeks 5 to 7. First LLM citation typically inside 30 to 45 days. Compounding traffic curve hits in months 3 to 6. Sendr.ai hit 1.05M impressions and 7.43k clicks in 6 months on Google Search Console."],
  ["Do you guarantee #1 rankings?",
   "No. Anyone who does is lying. We aim for measurable lift in organic impressions and at least one LLM citation inside the first 90 days. That is testable. Sendr.ai is the proof we have shipped this before."],
  ["What stage of company is this for?",
   "Best fit: B2B SaaS with $20K to $2M MRR, an English-speaking ICP, and at least one founder who can do 90 minutes a week of strategy. Bad fit: pre-product, B2C consumer apps, or category-of-one products with no search demand yet."],
  ["Can we just hire a freelancer?",
   "Sure. The version a freelancer ships will be: 8 articles, no schema, no GEO optimization, no inbound automation, no citation tracking, no senior strategy oversight. Same hours, a quarter of the surface area. We would pick us. We are biased."],
  ["How much does it cost?",
   "We share pricing once we have looked at your domain and confirmed it is a fit. Different stage of SaaS, different scope. Apply above. The founder will DM you on LinkedIn with a real number inside 48 hours."],
];

/* Hover the apply CTA, hold, drift off, repeat. */
const APPLY_TIMELINE = [
  { action: 'move',  x: 12, y: 86, move: 820, dwell: 500 },
  { action: 'hover', target: '.apply-band-btn', move: 700, dwell: 800 },
  { action: 'move',  x: 88, y: 20, move: 860, dwell: 800 },
];

export default function Home() {
  useScrollReveal();
  const applyRef = useRef(null);
  usePageMeta({
    title: 'SEO, AI SEO, AEO & GEO Agency for B2B SaaS | RankedTag',
    description:
      "Full-stack SEO, AI SEO, AEO & GEO for B2B SaaS. We took sendr.ai 0→1.05M impressions in 6 months—#2 on Google's AI Overview, above ZoomInfo.",
    canonical: 'https://rankedtag.com/',
  });
  const navigate = useNavigate();
  const [heroUrl, setHeroUrl] = useState('');

  const onHeroSubmit = (e) => {
    e.preventDefault();
    const v = heroUrl.trim();
    const q = v ? `?url=${encodeURIComponent(v)}` : '';
    // The Founder Review IS the site audit — hand the domain off to /apply.
    navigate(`/apply${q}`);
  };

  // FAQ accordion (delegated)
  useEffect(() => {
    const handler = (e) => {
      const q = e.target.closest('.faq-q');
      if (!q) return;
      const item = q.parentElement;
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item').forEach((i) => {
        i.classList.remove('open');
        i.querySelector('.faq-q')?.setAttribute('aria-expanded', 'false');
      });
      if (!isOpen) {
        item.classList.add('open');
        q.setAttribute('aria-expanded', 'true');
      }
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  return (
    <>
      {/* Page-specific schema baked into the static HTML at build time. The
          site-wide Organization + WebSite graph stays in index.html. */}
      <JsonLd data={HOME_JSONLD} />
      <Nav variant="home" />

      {/* ═══ HERO ══════════════════════════════════════════════════════════ */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="hero-glow" />
        <div className="hero-spine" aria-hidden="true">§ THE INBOUND ENGINE</div>
        <FloatingBadge id="hero" text="Founder reviewed" className="fbadge-hero" />

        <div className="container hero-inner">
          <div className="grid12 hero-grid">
            <div className="col-12 hero-top fade-up">
              <span className="eyebrow bracket">FOR B2B SAAS FOUNDERS COMPETING AGAINST GIANTS</span>
              <span className="idx hero-idx" aria-hidden="true">001</span>
            </div>

            <h1 className="col-11 hero-title fade-up delay-1">
              <span className="line">We make B2B SaaS the{' '}</span>
              <span className="line">source <span className="hl hl-auto"><span className="hl-bg" /><span className="hl-tx">AI cites</span></span>.</span>
            </h1>

            <div className="col-5 hero-say fade-up delay-2">
              <p className="hero-sub">
                Full-stack SEO, AEO and GEO built for founders. Senior strategy, shipped monthly, measured in pipeline rather than rankings.
              </p>
              <ul className="hero-stat-strip">
                <li>
                  <span className="hero-stat-n" data-countup="1500">1.05M</span>
                  <span className="hero-stat-l">organic impressions</span>
                </li>
                <li>
                  <span className="hero-stat-n" data-countup="1500">7.43k</span>
                  <span className="hero-stat-l">clicks in six months</span>
                </li>
                <li>
                  <span className="hero-stat-n accent">#2</span>
                  <span className="hero-stat-l">AI Overview, above ZoomInfo</span>
                </li>
              </ul>
            </div>

            <div className="col-6 start-7 hero-act fade-up delay-3">
              <form className="hero-form" onSubmit={onHeroSubmit} autoComplete="off">
                <span className="hero-form-prefix" aria-hidden="true">https://</span>
                <input
                  type="text"
                  className="hero-form-input"
                  placeholder="yoursaas.com"
                  value={heroUrl}
                  onChange={(e) => setHeroUrl(e.target.value)}
                  aria-label="Your domain"
                  spellCheck={false}
                  autoCapitalize="off"
                />
                <button type="submit" className="hero-form-submit ar-parent">
                  Apply for review <span className="ar">→</span>
                </button>
              </form>

              <ul className="hero-benefits">
                <li><span className="b-check">✓</span> founder reviews every domain personally</li>
                <li><span className="b-check">✓</span> reply on LinkedIn within 48 hours</li>
                <li><span className="b-check">✓</span> only 4 SaaS taken per month</li>
              </ul>

              <div className="hero-secondary">
                <span className="hero-rule" />
                <span className="hero-secondary-text">already convinced?</span>
                <a href="/apply" className="hero-secondary-link link-wipe ar-parent">
                  skip ahead, apply for the engine <span className="ar-ne">↗</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ TICKER ════════════════════════════════════════════════════════ */}
      <div className="marquee" data-loop aria-hidden="true">
        <div className="marquee-track">
          {[0, 1].map((dup) => (
            <div className="marquee-group" key={dup}>
              <span>4 SAAS PER MONTH</span>
              <span>FOUNDER-REVIEWED</span>
              <span>48H REPLY ON LINKEDIN</span>
              <span>4 SAAS PER MONTH</span>
              <span>FOUNDER-REVIEWED</span>
              <span>48H REPLY ON LINKEDIN</span>
            </div>
          ))}
        </div>
      </div>

      {/* ═══ PROBLEM ═══════════════════════════════════════════════════════ */}
      <section className="problem" data-reveal>
        <div className="container grid12">
          <div className="col-4 problem-aside">
            <span className="eyebrow bracket">THE QUIET TAX YOU ARE PAYING</span>
            <p className="problem-quote">
              You spent six months on content. Two posts ranked. Zero get cited by ChatGPT. Your inbound is a Google Sheet emailed on Fridays. The competitor with the 8-figure marketing budget keeps eating your category.
            </p>
          </div>

          <ol className="col-7 start-6 problem-list" data-reveal-children>
            <li className="problem-row">
              <span className="problem-num" aria-hidden="true">01</span>
              <div className="problem-body">
                <h3>The agency tax</h3>
                <p>$8K to $15K a month for a writer, a "strategist," and a quarterly review that says "keep going." You are paying for headcount, not outcomes.</p>
              </div>
            </li>
            <li className="problem-row">
              <span className="problem-num" aria-hidden="true">02</span>
              <div className="problem-body">
                <h3>The 2019 playbook</h3>
                <p>The pages they ship are tuned for old Google. They are invisible to ChatGPT, Claude, Perplexity, and Gemini. That is where 40% of buyer research now starts.</p>
              </div>
            </li>
            <li className="problem-row">
              <span className="problem-num" aria-hidden="true">03</span>
              <div className="problem-body">
                <h3>The leaky funnel</h3>
                <p>Even when a page ranks, the form fill drops into a Sheet. Not your CRM. Not Slack. Not enriched. Half your hot leads cool off before you ever see them.</p>
              </div>
            </li>
          </ol>
        </div>
      </section>

      {/* ═══ MECHANISM (honest about humans + AI) ═════════════════════════ */}
      <section className="trinity ruled" id="how-it-works" data-reveal>
        <div className="container">
          <div className="section-head">
            <span className="eyebrow" data-num="002">HOW WE OUT-CONTENT THE BIG PLAYERS</span>
            <div>
              <h2 className="h-2" data-reveal-lines>Senior strategists pick the fights.<br />AI <span className="accent">compresses the time</span> to win them.</h2>
              <p className="lead">Sendr.ai is a startup competing against ZoomInfo. We do not have their budget. We do not have their team. What we have is a three-piece stack that lets one senior strategist out-content an entire team. That is the whole moat: speed to market.</p>
            </div>
          </div>

          {/* Stepped sequence: each step sits one column further right, joined
              by a continuous rule down the left edge. */}
          <div className="trinity-grid">
          <ol className="stack" data-reveal-children>
            <li className="stack-step">
              <span className="stack-num" aria-hidden="true">01</span>
              <div className="stack-body">
                <span className="stack-label">01 / Strategy</span>
                <h3 className="stack-h">Senior Humans</h3>
                <p className="stack-desc">Real strategists run the SWOT. They pick the keywords, the angles, the positioning. Every brief is approved by a human before a single word is written.</p>
              </div>
            </li>
            <li className="stack-step">
              <span className="stack-num" aria-hidden="true">02</span>
              <div className="stack-body">
                <span className="stack-label">02 / Research</span>
                <h3 className="stack-h">Claude</h3>
                <p className="stack-desc">Claude does the deep research at scale. It pulls SERPs, reads competitor pages, drafts briefs, and maps GEO citation patterns. It is fast. It is the leverage.</p>
              </div>
            </li>
            <li className="stack-step">
              <span className="stack-num" aria-hidden="true">03</span>
              <div className="stack-body">
                <span className="stack-label">03 / Velocity</span>
                <h3 className="stack-h">N8N + Editors</h3>
                <p className="stack-desc">Workflows route everything: trigger, enrich, publish, alert. A senior editor reviews each piece. Nothing ships unread. Nothing ships on autopilot.</p>
              </div>
            </li>
            <li className="stack-out">
              <span className="chip chip-accent">compounding content in days, not quarters</span>
            </li>
          </ol>
            <NodeGraph />
          </div>

          <div className="trinity-equation">
            Human Strategy <span className="op">+</span> AI Research <span className="op">+</span> Editorial Velocity
            <span className="res">= the pace of a 30-person content team, run by 3</span>
          </div>

          <p className="lead trinity-note">
            We do not pretend a robot writes our content. Claude generates the keyword research and the first draft. A senior writer rewrites it, fact-checks it, and adds the angle Claude could never reach. That is how a small team beats a giant: AI saves the 80% of the work that is grunt, humans handle the 20% that is craft.
          </p>
        </div>
      </section>

      {/* ═══ SERVICES ══════════════════════════════════════════════════════ */}
      <section className="home-services ruled" id="services" data-reveal>
        <span className="drift drift-b drift-svc" data-loop aria-hidden="true" />
        <div className="container">
          <div className="section-head">
            <span className="eyebrow" data-num="003">SERVICES · ONE ENGINE, SIX DISCIPLINES</span>
            <div>
              <h2 className="h-2" data-reveal-lines>Every layer of modern search,<br /><span className="accent">under one roof.</span></h2>
              <p className="lead">Google rankings, AI Overviews, ChatGPT citations, answer boxes — they are not separate channels, they are one surface with six disciplines. Buy them separately or as the full engine. Either way, the same proof stands behind all of them.</p>
            </div>
          </div>
        </div>

        {/* Sticky stack: each card pins under the one before and scales back as
            the next arrives. Falls back to a plain flow on small screens. */}
        <div className="container svc-sticky" data-sticky-index data-active="0">
          <aside className="svc-rail" aria-hidden="true">
            <span className="svc-rail-label">THE ENGINE</span>
            <ol className="svc-rail-list">
              {SERVICES.map((s) => (
                <li key={`rail-${s.slug}`}>{s.nav}</li>
              ))}
            </ol>
          </aside>
          <div className="svc-stack">
          {SERVICES.map((s, i) => (
            <Link
              key={s.slug}
              to={`/services/${s.slug}`}
              className="svc-stack-card ar-parent"
              data-sticky-item
              style={{ '--i': i, '--n': SERVICES.length }}
            >
              <span className="svc-stack-num" aria-hidden="true">{String(i + 1).padStart(3, '0')}</span>
              <h3 className="svc-stack-h">{s.nav}</h3>
              <p className="svc-stack-desc">{s.navDesc}</p>
              <span className="svc-stack-go">Explore the service <span className="ar">→</span></span>
            </Link>
          ))}
          </div>
        </div>
      </section>

      {/* ═══ PROOF · sendr.ai case study ═════════════════════════════════ */}
      <section className="case ruled" id="case-study" data-reveal>
        <div className="container case-inner">
          <div className="section-head">
            <span className="eyebrow" data-num="004">PROOF · live numbers, not promises</span>
            <div>
              <h2 className="h-2" data-reveal-lines>How <span className="serif accent">sendr.ai</span> hit <span className="hl"><span className="hl-bg" /><span className="hl-tx">1.05M impressions</span></span><br />and ranked <span className="accent">#2 above ZoomInfo</span> on Google.</h2>
              <p className="lead">This is not a traffic vanity chart — it is AI citation share and pipeline. Sendr.ai is the answer Google's AI Overview gives for its category, six places above ZoomInfo. Real Google Search Console numbers, real AI Overview ranking, exactly what is on screen. Cross-check by searching the same query yourself.</p>
            </div>
          </div>

          {/* Stat band, full width, counts up on entry. */}
          <div className="case-proof">
            <div className="case-proof-stats" data-reveal-children>
              <div className="cps cps-featured">
                <div className="stat-lbl">Total organic impressions · 6 months</div>
                <div className="stat-num" data-countup="1600">1.05M</div>
                <div className="stat-delta">▲ Google Search Console · 09/11/2025 to 28/04/2026</div>
              </div>
              <div className="cps">
                <div className="stat-lbl">Total clicks</div>
                <div className="stat-num" data-countup="1400">7.43k</div>
                <div className="stat-delta">▲ same 6-month window</div>
              </div>
              <div className="cps">
                <div className="stat-lbl">Average CTR</div>
                <div className="stat-num" data-countup="1400">0.7<span className="stat-num-unit">%</span></div>
                <div className="stat-delta">▲ across all ranking queries</div>
              </div>
              <div className="cps">
                <div className="stat-lbl">Average position</div>
                <div className="stat-num" data-countup="1400">7.1</div>
                <div className="stat-delta">▲ across the indexed surface area</div>
              </div>
            </div>
            <ProofPanels />
          </div>

          <div className="grid12 case-grid">
            <div className="col-5 case-story">
              <div className="case-meta">
                <span className="chip chip-accent">SEED-STAGE B2B SAAS</span>
                <span className="chip">RANKED ABOVE ZOOMINFO</span>
                <span className="chip chip-live">Active engagement</span>
              </div>

              <h3 className="h-4 mb-4">The setup</h3>
              <p className="case-setup">
                Sendr.ai is a B2B SaaS competing in a category dominated by ZoomInfo and other 8-figure incumbents. We ran the audit, found the keyword gaps the giants ignored, and shipped LLM-optimised pages targeting category-defining queries. Six months in, the engine is compounding.
              </p>

              <p className="case-quote">
                We went from invisible to the answer Google's AI Overview gives when someone asks for the best GTM tool. Six places above ZoomInfo. The pipeline runs while we ship product.
              </p>

              <div className="case-author">
                <div className="case-author-avatar">SA</div>
                <div className="case-author-info">
                  <strong>Founder, sendr.ai</strong>
                  <span>Engagement: ongoing</span>
                </div>
              </div>

              <div className="case-cta-row">
                <a href="/apply" className="btn btn-primary ar-parent">Apply for the same engine <span className="ar-ne">↗</span></a>
                <Link to="/case-study/sendr" className="case-readmore link-wipe ar-parent">Read the full case study <span className="ar">→</span></Link>
              </div>
            </div>

            <div className="col-7 case-shots">
              <figure className="frame">
                <figcaption className="frame-bar">
                  <span className="frame-dots" aria-hidden="true"><i /><i /><i /></span>
                  <span className="frame-url">search.google.com/search-console</span>
                  <span className="chip chip-live frame-chip">LIVE</span>
                </figcaption>
                <img
                  src="/result-sendr.jpeg"
                  alt="Google Search Console screenshot showing 7.43k total clicks and 1.05M total impressions for sendr.ai over a 6-month period, with average CTR 0.7% and average position 7.1."
                  loading="lazy"
                  width="1453"
                  height="656"
                />
                <figcaption className="frame-cap">Live Google Search Console · sendr.ai · last 6 months</figcaption>
              </figure>
            </div>
          </div>

          {/* Second proof: GTM tool ranking, sendr.ai #2 above ZoomInfo #8 */}
          <div className="case-rank">
            <div className="section-head case-rank-head">
              <span className="eyebrow" data-num="005">RANKED #2 · ABOVE ZOOMINFO</span>
              <div>
                <h3 className="h-3">Google AI Overview, query: <span className="ser">"what is the best GTM tool"</span></h3>
                <p className="lead mt-4">
                  Sendr.ai sits at <strong>#2</strong> in Google's AI Overview for the category-defining query. ZoomInfo sits at <strong>#8</strong>. Sendr.ai's own blog post is the source Google cites in the right-hand panel. That is the difference between renting traffic and owning the answer.
                </p>
              </div>
            </div>
            <figure className="frame frame-wide">
              <figcaption className="frame-bar">
                <span className="frame-dots" aria-hidden="true"><i /><i /><i /></span>
                <span className="frame-url">google.com/search?q=what+is+the+best+gtm+tool</span>
                <span className="chip chip-peri frame-chip">VERIFIED</span>
              </figcaption>
              <img
                src="/result-ranked.jpeg"
                alt="Google search result page for the query 'what is the best GTM tool'. The AI Overview lists Sendr.ai at position #2 and ZoomInfo at position #8. Sendr.ai's blog post is featured as the cited source on the right panel."
                loading="lazy"
                width="1233"
                height="868"
              />
              <figcaption className="frame-cap">Google search · "what is the best GTM tool"</figcaption>
            </figure>
          </div>
        </div>
      </section>

      {/* ═══ PROOF · signups from search and AI assistants ════════════════ */}
      <section className="signups ruled" id="signup-proof" data-reveal>
        <div className="container">
          <div className="section-head">
            <span className="eyebrow bracket">SIGNUP ALERTS</span>
            <h2 className="h-2" data-reveal-lines>Search and assistants, sending real signups.</h2>
            <p className="lead signups-note">
              Production signup alerts for sendr.ai, each showing the country and the
              attribution source recorded at sign-up. Customer details are blurred.
              <span className="signups-count">
                <span data-countup="1200">17</span> shown
              </span>
            </p>
          </div>
          <SignupRail />
        </div>
      </section>

      {/* ═══ TOOLS ═════════════════════════════════════════════════════════ */}
      <section className="tools ruled" id="free-seo-tools" data-reveal>
        <div className="container">
          <div className="section-head">
            <span className="eyebrow" data-num="006">FREE TOOLS · we would rather earn the call</span>
            <div>
              <h2 className="h-2" data-reveal-lines>Four tools you would usually pay for.<br />Ours are <span className="hl"><span className="hl-bg" /><span className="hl-tx">free.</span></span></h2>
              <p className="lead">If our tools do not make you smarter about your own SEO, you definitely should not hire us. Use them. Steal the strategy. If it works, come back.</p>
            </div>
          </div>

          <div className="tools-grid" data-reveal-children>
            <a href="/apply" className="tool-card feature ar-parent">
              <div className="tool-head">
                <span className="idx">000</span>
                <span className="chip chip-accent">FREE</span>
              </div>
              <h3 className="tool-h">Site Audit · Founder Review</h3>
              <div className="tool-tag">★ FREE · FOUNDER-REVIEWED · NOT AUTO-GENERATED</div>
              <p className="tool-desc">The Site Audit is the Founder Review. Drop your URL and the founder personally runs a 52-check audit across crawlability, schema, Core Web Vitals, mobile, security, GEO + LLM readiness, plus the non-technical layer most agencies skip: content depth, ICP clarity, conversion path, copy quality. You get a real reply on LinkedIn inside 48 hours — even if it is a no.</p>

              <div className="tool-visual">
                <ToolDemo url="yoursaas.com" runLabel="RUN AUDIT" startDelay={0}>
                  <div className="mock-body mock-checks">
                    {['Technical SEO', 'GEO Readiness', 'Content + ICP', 'Conversion'].map((c, i) => (
                      <div className="mock-check" key={c} style={{ '--w': [92, 74, 61, 83][i] + '%' }}>
                        <span className="mock-check-label">{c}</span>
                        <span className="mock-track"><span className="mock-fill" /></span>
                      </div>
                    ))}
                  </div>
                </ToolDemo>
              </div>

              <div className="tool-cta">Apply for the audit <span className="ar">→</span></div>
            </a>

            <a href="/domain-authority-checker" className="tool-card ar-parent">
              <div className="tool-head">
                <span className="idx">001</span>
                <span className="chip">FREE</span>
              </div>
              <h3 className="tool-h">Domain Authority Checker</h3>
              <div className="tool-tag">★ FREE · OUR OWN ENGINE</div>
              <p className="tool-desc">We do not sell you Ahrefs data. We built our own. Tranco traffic rank, Wayback Machine domain age, on-page schema and link structure, real HTTP transport quality. Composite RankedTag Authority Score with a transparent breakdown you can verify against our public source links.</p>
              <div className="tool-visual">
                <ToolDemo url="yoursaas.com" runLabel="CHECK" startDelay={700} className="mock-dial">
                  <svg viewBox="0 0 120 70" role="img" aria-label="Illustrative authority score dial">
                    <path className="dial-track" d="M10 62 A50 50 0 0 1 110 62" />
                    <path className="dial-fill" d="M10 62 A50 50 0 0 1 110 62" />
                  </svg>
                  <div className="dial-val">
                    <span className="dial-num">68</span>
                    <span className="dial-lbl">AUTHORITY</span>
                  </div>
                </ToolDemo>
              </div>
              <div className="tool-cta">Check authority <span className="ar">→</span></div>
            </a>

            <a href="/keyword-density-checker" className="tool-card ar-parent">
              <div className="tool-head">
                <span className="idx">002</span>
                <span className="chip">FREE</span>
              </div>
              <h3 className="tool-h">Keyword Density Checker</h3>
              <div className="tool-tag">★ FREE · REAL-TIME · NO TRACKING</div>
              <p className="tool-desc">Paste your copy or drop in a URL. Live 1-, 2- and 3-word density as you type, SEO score with readability and stuffing warnings, visual charts, and CSV export. Text analysis runs in your browser. URL fetches go through our own server-side scraper. No login, no key.</p>
              <div className="tool-visual">
                <ToolDemo url="yoursaas.com/post" runLabel="ANALYSE" startDelay={1400} className="mock-bars">
                  {[68, 44, 86, 30, 55, 22, 70, 38].map((h, i) => (
                    <span className="mock-bar-col" key={i} style={{ '--h': h + '%' }} />
                  ))}
                </ToolDemo>
              </div>
              <div className="tool-cta">Analyse my copy <span className="ar">→</span></div>
            </a>

            <a href="/page-speed-checker" className="tool-card ar-parent">
              <div className="tool-head">
                <span className="idx">003</span>
                <span className="chip">FREE</span>
              </div>
              <h3 className="tool-h">Page Speed Checker</h3>
              <div className="tool-tag">★ FREE · OUR OWN ENGINE · NO PSI KEY</div>
              <p className="tool-desc">We fetch your URL server-side, time the response, parse the HTML, and score it on five real signals: speed, weight, render-blocking, image hygiene, transport quality. Runs in under 5 seconds. Cross-check at pagespeed.web.dev for full Lighthouse.</p>
              <div className="tool-visual">
                <ToolDemo url="yoursaas.com" runLabel="MEASURE" startDelay={2100} className="mock-speed">
                  <div className="speed-read"><span className="speed-num">0.42</span><span className="speed-unit">s</span></div>
                  <div className="speed-rows">
                    {[['TTFB', 82], ['TRANSPORT', 91], ['BLOCKING', 64]].map(([l, w]) => (
                      <div className="speed-row" key={l} style={{ '--w': w + '%' }}>
                        <span>{l}</span><span className="mock-track"><span className="mock-fill" /></span>
                      </div>
                    ))}
                  </div>
                </ToolDemo>
              </div>
              <div className="tool-cta">Run page speed <span className="ar">→</span></div>
            </a>

            <a href="/competitor-analysis" className="tool-card ar-parent">
              <div className="tool-head">
                <span className="idx">004</span>
                <span className="chip">FREE</span>
              </div>
              <h3 className="tool-h">Competitor Analysis</h3>
              <div className="tool-tag">★ FREE · OUR OWN ENGINE · UP TO 5 COMPETITORS</div>
              <p className="tool-desc">Drop your page plus up to 5 competitor URLs. We score every page on keyword optimisation, structure, readability, prominence, semantic coverage and distribution — then surface the keywords competitors rank for that you do not. Side-by-side comparison, radar chart, gap table and ranked recommendations.</p>
              <div className="tool-visual">
                <ToolDemo url="yoursaas.com" runLabel="COMPARE" startDelay={2800} className="mock-versus">
                  {[['YOU', 78, 'you'], ['COMP A', 52, ''], ['COMP B', 61, ''], ['COMP C', 35, '']].map(([l, w, k]) => (
                    <div className={`versus-row${k ? ' is-you' : ''}`} key={l} style={{ '--w': w + '%' }}>
                      <span className="versus-lbl">{l}</span>
                      <span className="mock-track"><span className="mock-fill" /></span>
                      <span className="versus-val">{w}</span>
                    </div>
                  ))}
                </ToolDemo>
              </div>
              <div className="tool-cta">Compare against competitors <span className="ar">→</span></div>
            </a>
          </div>
        </div>
      </section>

      {/* ═══ APPLY CTA → dedicated /apply page ════════════════════════════ */}
      {/* id="apply" kept so any existing /#apply links still land here. */}
      <section className="apply apply-band ruled" id="apply" data-reveal>
        <div className="container grid12 apply-band-grid">
          <div className="col-4 apply-band-aside">
            <span className="eyebrow bracket">APPLY · founder-reviewed, not auto-routed</span>
            <span className="apply-band-numeral" aria-hidden="true">04</span>
          </div>
          <div className="col-7 start-6 apply-band-main" ref={applyRef}>
            <ScriptedCursor hostRef={applyRef} timeline={APPLY_TIMELINE} startDelay={1200} />
            <h2 className="apply-band-h">Tell us about your SaaS.<br /><span className="ser">We read every one.</span></h2>
            <p className="apply-band-sub">
              We take 4 SaaS founders a month. The founder reads every application personally and replies on LinkedIn within 48 hours — even if it is a no.
            </p>
            <Link to="/apply" className="btn btn-red btn-lg apply-band-btn ar-parent">
              Apply for review <span className="ar-ne">↗</span>
            </Link>
            <ul className="apply-band-bullets">
              <li><span className="b-check">✓</span> reviewed by a human</li>
              <li><span className="b-check">✓</span> reply on LinkedIn in 48h</li>
              <li><span className="b-check">✓</span> only 4 SaaS a month</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ═══ FAQ ═══════════════════════════════════════════════════════════ */}
      <section className="faq-section ruled" data-reveal>
        <div className="container grid12">
          <div className="col-4 faq-aside">
            <span className="eyebrow" data-num="007">FAQ · what every founder asks first</span>
            <h2 className="h-2 faq-h">Answers, before you ask.</h2>
            <div className="faq-side">
              <h3>Still have questions?</h3>
              <p>Send your application. The founder reads every one and replies personally on LinkedIn. Even if the answer is "not a fit right now," you get a real opinion, free.</p>
              <a href="/apply" className="btn btn-red w-full ar-parent">Apply for review <span className="ar-ne">↗</span></a>
            </div>
          </div>

          <div className="col-7 start-6 faq-list">
            {HOME_FAQ_VIEW.map(([q, a], i) => (
              <div className="faq-item" key={q}>
                <button type="button" className="faq-q" aria-expanded="false">
                  <span className="faq-n" aria-hidden="true">{String(i + 1).padStart(3, '0')}</span>
                  <span className="faq-qt">{q}</span>
                  <span className="faq-ic" aria-hidden="true">+</span>
                </button>
                <div className="faq-a"><div className="faq-a-inner">{a}</div></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ LATEST FROM THE BLOG ══════════════════════════════════════════ */}
      <BlogLatest />

      {/* ═══ FINAL CTA ═════════════════════════════════════════════════════ */}
      <section className="final-cta ruled" data-reveal>
        <FilamentBurst />
        <FloatingBadge id="cta" text="4 SaaS per month" className="fbadge-cta" />
        <div className="container final-cta-inner">
          <span className="eyebrow bracket final-cta-eyebrow">THE INBOUND ENGINE</span>
          <h2 className="final-h">
            Stop renting traffic.<br />
            <span className="ser">Build the engine.</span>
          </h2>
          <p className="final-sub">
            Every week you wait, your competitor is one more cited article ahead in ChatGPT. Compounding works for them too.
          </p>
          <div className="final-cta-btns">
            <a href="/apply" className="btn btn-primary btn-lg ar-parent">Apply for the engine <span className="ar-ne">↗</span></a>
            <a href="/apply" className="btn btn-outline btn-lg ar-parent">Free audit first <span className="ar-ne">↗</span></a>
          </div>
        </div>
      </section>

      {/* ═══ FOOTER ════════════════════════════════════════════════════════ */}
      <SiteFooter />
    </>
  );
}

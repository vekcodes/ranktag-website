import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Nav from '../components/Nav.jsx';
import useScrollReveal from '../hooks/useScrollReveal.js';
import './Home.css';

export default function Home() {
  useScrollReveal();
  const navigate = useNavigate();
  const [heroUrl, setHeroUrl] = useState('');

  const onHeroSubmit = (e) => {
    e.preventDefault();
    const v = heroUrl.trim();
    const q = v ? `?url=${encodeURIComponent(v)}` : '';
    navigate(`/audit${q}`);
  };

  // FAQ accordion (delegated)
  useEffect(() => {
    const handler = (e) => {
      const q = e.target.closest('.faq-q');
      if (!q) return;
      const item = q.parentElement;
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item').forEach((i) => i.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  return (
    <>
      <Nav variant="home" />

      {/* ═══ HERO ══════════════════════════════════════════════════════════ */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="hero-bg-blob" />
        <div className="hero-bg-blob-2" />
        <div className="hero-spine" aria-hidden="true">§ THE INBOUND ENGINE</div>

        <div className="container hero-inner">
          <div className="hero-eyebrow fade-up">
            <span>FOR B2B SAAS FOUNDERS COMPETING AGAINST GIANTS</span>
          </div>

          <h1 className="hero-title fade-up delay-1">
            <span className="line">From <span className="accent">0 to 1.05M</span> organic impressions</span>
            <span className="line">in <span className="hero-title-italic">6 months.</span> <span className="hero-title-italic em">7,430 clicks.</span></span>
            <span className="line">Ranked <span className="accent">#2</span> above ZoomInfo on Google.</span>
          </h1>

          <p className="hero-sub fade-up delay-2">
            That is what we built for sendr.ai. Live Google Search Console numbers. Sendr.ai now sits at #2 in Google's AI Overview for "what is the best GTM tool", six places above ZoomInfo at #8. <span className="highlight">No ads. No outreach. No PDF reports.</span>
          </p>

          <form className="hero-form fade-up delay-3" onSubmit={onHeroSubmit} autoComplete="off">
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
            <button type="submit" className="hero-form-submit">
              Apply for review <span className="ar">→</span>
            </button>
          </form>

          <ul className="hero-benefits fade-up delay-3">
            <li><span className="b-check">✓</span> founder reviews every domain personally</li>
            <li><span className="b-check">✓</span> reply on LinkedIn within 48 hours</li>
            <li><span className="b-check">✓</span> only 4 SaaS taken per month</li>
          </ul>

          <div className="hero-secondary fade-up delay-4">
            <span className="hero-rule" />
            <span className="hero-secondary-text">already convinced?</span>
            <a href="#apply" className="hero-secondary-link">
              skip ahead, apply for the engine <span className="ar">↗</span>
            </a>
          </div>
        </div>
      </section>

      {/* ═══ PROBLEM ═══════════════════════════════════════════════════════ */}
      <section className="problem" data-reveal>
        <div className="container">
          <div className="eyebrow dark mb-6" style={{color: 'var(--red)'}}>THE QUIET TAX YOU ARE PAYING</div>
          <p className="problem-quote">
            You spent six months on content. Two posts ranked. Zero get cited by ChatGPT. Your inbound is a Google Sheet emailed on Fridays. The competitor with the 8-figure marketing budget keeps eating your category.
          </p>

          <div className="problem-grid">
            <div className="problem-cell">
              <div className="num">01</div>
              <h3>The agency tax</h3>
              <p>$8K to $15K a month for a writer, a "strategist," and a quarterly review that says "keep going." You are paying for headcount, not outcomes.</p>
            </div>
            <div className="problem-cell">
              <div className="num">02</div>
              <h3>The 2019 playbook</h3>
              <p>The pages they ship are tuned for old Google. They are invisible to ChatGPT, Claude, Perplexity, and Gemini. That is where 40% of buyer research now starts.</p>
            </div>
            <div className="problem-cell">
              <div className="num">03</div>
              <h3>The leaky funnel</h3>
              <p>Even when a page ranks, the form fill drops into a Sheet. Not your CRM. Not Slack. Not enriched. Half your hot leads cool off before you ever see them.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ MECHANISM (honest about humans + AI) ═════════════════════════ */}
      <section className="trinity" id="mechanism" data-reveal>
        <div className="container">
          <div className="section-head">
            <div className="eyebrow">HOW WE OUT-CONTENT THE BIG PLAYERS</div>
            <h2 className="h-1">Senior strategists pick the fights.<br />AI <span style={{color: 'var(--red)'}}>compresses the time</span> to win them.</h2>
            <p className="lead">Sendr.ai is a startup competing against ZoomInfo. We do not have their budget. We do not have their team. What we have is a three-piece stack that lets one senior strategist out-content an entire team. That is the whole moat: speed to market.</p>
          </div>

          <div className="trinity-vis">
            <div className="trinity-circle trinity-c1">
              <div className="label">01 / Strategy</div>
              <div className="h">Senior Humans</div>
              <div className="desc">Real strategists run the SWOT. They pick the keywords, the angles, the positioning. Every brief is approved by a human before a single word is written.</div>
            </div>
            <div className="trinity-circle trinity-c2">
              <div className="label">02 / Research</div>
              <div className="h">Claude</div>
              <div className="desc">Claude does the deep research at scale. It pulls SERPs, reads competitor pages, drafts briefs, and maps GEO citation patterns. It is fast. It is the leverage.</div>
            </div>
            <div className="trinity-circle trinity-c3">
              <div className="label">03 / Velocity</div>
              <div className="h">N8N + Editors</div>
              <div className="desc">Workflows route everything: trigger, enrich, publish, alert. A senior editor reviews each piece. Nothing ships unread. Nothing ships on autopilot.</div>
            </div>
            <div className="trinity-center">
              compounding content in days, not quarters
            </div>
          </div>

          <div className="trinity-equation">
            Human Strategy <span className="op">+</span> AI Research <span className="op">+</span> Editorial Velocity
            <span className="res">= the pace of a 30-person content team, run by 3</span>
          </div>

          <p className="lead" style={{marginTop:'40px', maxWidth:'780px'}}>
            We do not pretend a robot writes our content. Claude generates the keyword research and the first draft. A senior writer rewrites it, fact-checks it, and adds the angle Claude could never reach. That is how a small team beats a giant: AI saves the 80% of the work that is grunt, humans handle the 20% that is craft.
          </p>
        </div>
      </section>

      {/* ═══ PROOF · sendr.ai case study ═════════════════════════════════ */}
      <section className="case" id="proof" data-reveal>
        <div className="case-bg-num">01</div>
        <div className="container case-inner">
          <div className="section-head">
            <div className="eyebrow">PROOF · live numbers, not promises</div>
            <h2 className="h-1">How <span className="serif" style={{color: 'var(--red)'}}>sendr.ai</span> hit <span style={{color: 'var(--red)'}}>1.05M impressions</span><br />and ranked <span style={{color: 'var(--red)'}}>#2 above ZoomInfo</span> on Google.</h2>
            <p className="lead">Real Google Search Console numbers. Real Google AI Overview ranking. We are showing exactly what is on screen, no rounding, no extra claims. Cross-check by searching the same query yourself.</p>
          </div>

          <div className="case-grid">
            <div>
              <div className="case-meta">
                <span className="tag tag-red">SEED-STAGE B2B SAAS</span>
                <span className="tag tag-outline">RANKED ABOVE ZOOMINFO</span>
                <span className="tag tag-live">Active engagement</span>
              </div>

              <h3 className="h-3 mb-4">The setup</h3>
              <p style={{color: 'var(--muted)', fontSize: '15px', lineHeight: 1.6, marginBottom: '18px'}}>
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

              <a href="#apply" className="btn btn-primary">Apply for the same engine <span className="ar">↗</span></a>
            </div>

            <div>
              <div className="case-stats">
                <div className="case-stat featured">
                  <div className="stat-lbl">Total organic impressions · 6 months</div>
                  <div className="stat-num">1.05M</div>
                  <div className="stat-delta">▲ Google Search Console · 09/11/2025 to 28/04/2026</div>
                </div>
                <div className="case-stat">
                  <div className="stat-lbl">Total clicks</div>
                  <div className="stat-num">7.43k</div>
                  <div className="stat-delta">▲ same 6-month window</div>
                </div>
                <div className="case-stat">
                  <div className="stat-lbl">Average CTR</div>
                  <div className="stat-num">0.7<span style={{fontSize: '.6em'}}>%</span></div>
                  <div className="stat-delta">▲ across all ranking queries</div>
                </div>
                <div className="case-stat">
                  <div className="stat-lbl">Average position</div>
                  <div className="stat-num">7.1</div>
                  <div className="stat-delta">▲ across the indexed surface area</div>
                </div>
              </div>

              <figure className="case-proof">
                <figcaption className="case-proof-cap">
                  <span className="dot" />
                  Live Google Search Console · sendr.ai · last 6 months
                </figcaption>
                <img
                  src="/result-sendr.jpeg"
                  alt="Google Search Console screenshot showing 7.43k total clicks and 1.05M total impressions for sendr.ai over a 6-month period, with average CTR 0.7% and average position 7.1."
                  loading="lazy"
                />
              </figure>
            </div>
          </div>

          {/* Second proof: GTM tool ranking, sendr.ai #2 above ZoomInfo #8 */}
          <div className="case-rank">
            <div className="case-rank-head">
              <div className="eyebrow" style={{marginBottom:'14px'}}>RANKED #2 · ABOVE ZOOMINFO</div>
              <h3 className="h-2">Google AI Overview, query: <span className="ser">"what is the best GTM tool"</span></h3>
              <p className="lead" style={{marginTop:'14px'}}>
                Sendr.ai sits at <strong>#2</strong> in Google's AI Overview for the category-defining query. ZoomInfo sits at <strong>#8</strong>. Sendr.ai's own blog post is the source Google cites in the right-hand panel. That is the difference between renting traffic and owning the answer.
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
              />
            </figure>
          </div>
        </div>
      </section>

      {/* ═══ TOOLS ═════════════════════════════════════════════════════════ */}
      <section className="tools" id="tools" data-reveal>
        <div className="container">
          <div className="section-head">
            <div className="eyebrow">FREE TOOLS · we would rather earn the call</div>
            <h2 className="h-1">Four tools you would usually pay for.<br />Ours are <span style={{color: 'var(--red)'}}>free.</span></h2>
            <p className="lead">If our tools do not make you smarter about your own SEO, you definitely should not hire us. Use them. Steal the strategy. If it works, come back.</p>
          </div>

          <div className="tools-grid">
            <a href="/technical-audit" className="tool-card feature">
              <div className="tool-tag">★ FREE · TECHNICAL + NON-TECH</div>
              <h3 className="tool-h">Site Audit (Technical + Non-technical)</h3>
              <p className="tool-desc">52 checks across 7 categories. Crawlability, schema, Core Web Vitals, mobile, security, GEO + LLM readiness, and the non-technical layer most agencies skip: content depth, ICP clarity, conversion path, and copy quality. Built for SaaS founders who want one report, not seven.</p>

              <div className="tool-visual">
                <div style={{background: 'var(--ink-3)', border: '1px solid var(--ink-line)', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px'}}>
                  <span style={{color: 'var(--muted-2)', fontFamily: '\'JetBrains Mono\', monospace', fontSize: '11px'}}>https://</span>
                  <span style={{fontFamily: '\'JetBrains Mono\', monospace', fontSize: '13px', color: 'var(--paper)'}}>yoursaas.com</span>
                  <span style={{marginLeft: 'auto', background: 'var(--red)', color: '#fff', padding: '6px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: 600, fontFamily: '\'JetBrains Mono\', monospace'}}>RUN AUDIT</span>
                </div>
                <div style={{display: 'flex', gap: '8px', flexWrap: 'wrap'}}>
                  <span className="tag tag-red" style={{background: 'rgba(255,59,20,.15)', color: 'var(--red)'}}>Technical SEO</span>
                  <span className="tag" style={{background: 'rgba(166,176,240,.15)', color: 'var(--periwinkle)'}}>GEO Readiness</span>
                  <span className="tag" style={{background: 'rgba(255,255,255,.06)', color: 'rgba(255,255,255,.6)'}}>Content + ICP</span>
                  <span className="tag" style={{background: 'rgba(255,255,255,.06)', color: 'rgba(255,255,255,.6)'}}>Conversion</span>
                </div>
              </div>

              <div className="tool-cta">
                Run my audit
                <span className="ar">→</span>
              </div>
            </a>

            <a href="/backlink-checker" className="tool-card">
              <div className="tool-tag">★ FREE · OUR OWN ENGINE</div>
              <h3 className="tool-h">Domain Authority Checker</h3>
              <p className="tool-desc">We do not sell you Ahrefs data. We built our own. Tranco traffic rank, Wayback Machine domain age, on-page schema and link structure, real HTTP transport quality. Composite RankedTag Authority Score with a transparent breakdown you can verify against our public source links.</p>
              <div className="tool-cta">
                Check authority
                <span className="ar">→</span>
              </div>
            </a>

            <a href="/keyword-density" className="tool-card">
              <div className="tool-tag">★ FREE · INSTANT · NO TRACKING</div>
              <h3 className="tool-h">Keyword Density Checker</h3>
              <p className="tool-desc">Paste your page copy. Real word frequency, two-word and three-word phrase density, and an honest verdict on your target keyword. Computed in your browser, your text never leaves your device. Same algorithm exposed at <code>/api/keyword-density</code>.</p>
              <div className="tool-cta">
                Analyse my copy
                <span className="ar">→</span>
              </div>
            </a>

            <a href="/page-speed" className="tool-card">
              <div className="tool-tag">★ FREE · OUR OWN ENGINE · NO PSI KEY</div>
              <h3 className="tool-h">Page Speed Checker</h3>
              <p className="tool-desc">We fetch your URL server-side, time the response, parse the HTML, and score it on five real signals: speed, weight, render-blocking, image hygiene, transport quality. Runs in under 5 seconds. Cross-check at pagespeed.web.dev for full Lighthouse.</p>
              <div className="tool-cta">
                Run page speed
                <span className="ar">→</span>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* ═══ APPLY (replaces pricing/offer) ═══════════════════════════════ */}
      <section className="apply" id="apply" data-reveal>
        <div className="container">
          <div className="section-head" style={{textAlign:'center', margin:'0 auto 56px'}}>
            <div className="eyebrow" style={{justifyContent:'center', color: 'var(--red)'}}>APPLY · founder-reviewed, not auto-routed</div>
            <h2 className="h-1" style={{color: 'var(--paper)'}}>Tell us about your SaaS.<br />We <span style={{color: 'var(--red)'}}>read every one</span>.</h2>
            <p className="lead" style={{color: 'rgba(244,239,231,.72)', margin:'24px auto 0'}}>
              We take 4 SaaS founders a month. That is it. Drop your details below. The founder reads every application personally and replies on LinkedIn within 48 hours, even if it is a no.
            </p>
          </div>

          <div className="apply-card">
            <form className="apply-form" onSubmit={(e) => {
              e.preventDefault();
              const card = document.querySelector('.apply-card');
              if (card) card.classList.add('submitted');
            }}>
              <div className="apply-row">
                <label className="apply-field">
                  <span className="apply-label">Your name</span>
                  <input type="text" required placeholder="Alex Singh" />
                </label>
                <label className="apply-field">
                  <span className="apply-label">Work email</span>
                  <input type="email" required placeholder="alex@yoursaas.com" />
                </label>
              </div>
              <div className="apply-row">
                <label className="apply-field">
                  <span className="apply-label">SaaS website</span>
                  <input type="text" required placeholder="https://yoursaas.com" />
                </label>
                <label className="apply-field">
                  <span className="apply-label">LinkedIn (so we can DM you)</span>
                  <input type="text" required placeholder="linkedin.com/in/yourname" />
                </label>
              </div>
              <label className="apply-field">
                <span className="apply-label">What stage is your SaaS at? Who is it for?</span>
                <textarea rows={3} placeholder="e.g. Seed-stage. We sell cold-outreach software to RevOps leaders at 50-200 person SaaS companies."></textarea>
              </label>
              <div className="apply-foot">
                <button type="submit" className="btn btn-red btn-lg">Send application <span className="ar">↗</span></button>
                <p className="fineprint" style={{color:'rgba(244,239,231,.55)'}}>
                  Reviewed by the founder. Reply on LinkedIn within 48 hours. We never sell, share, or spam your info.
                </p>
              </div>
            </form>

            <div className="apply-success">
              <div className="apply-success-mark">✓</div>
              <h3>Application received.</h3>
              <p>The founder will personally review your domain, run a quick competitive scan, and DM you on LinkedIn inside 48 hours. Even if we are not the right fit, you will hear back with what we would do.</p>
              <p className="fineprint" style={{color:'rgba(244,239,231,.5)', marginTop:'10px'}}>
                If you do not see a DM by then, ping us at hello@rankedtag.com.
              </p>
            </div>
          </div>

          <div className="apply-bullets">
            <div className="apply-bullet">
              <div className="apply-bullet-num">01</div>
              <h4>Reviewed by a human</h4>
              <p>Not a chatbot. Not an SDR. The founder reads every application and runs a real scan of your domain.</p>
            </div>
            <div className="apply-bullet">
              <div className="apply-bullet-num">02</div>
              <h4>Reply on LinkedIn in 48h</h4>
              <p>You get a real reply on LinkedIn. With a real opinion. Even if it is a no, it will be useful.</p>
            </div>
            <div className="apply-bullet">
              <div className="apply-bullet-num">03</div>
              <h4>Only 4 SaaS a month</h4>
              <p>Senior strategists do not scale like ad spend. When the slots are full, you wait until next month.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ FAQ ═══════════════════════════════════════════════════════════ */}
      <section data-reveal>
        <div className="container">
          <div className="section-head">
            <div className="eyebrow">FAQ · what every founder asks first</div>
            <h2 className="h-1">Answers, before you ask.</h2>
          </div>

          <div className="faq-wrap">
            <div className="faq-list">
              <div className="faq-item">
                <button className="faq-q">"Are we just paying for ChatGPT to write our articles?"<span className="faq-ic">+</span></button>
                <div className="faq-a"><div className="faq-a-inner">No. Claude does the keyword research and the first-pass draft. A senior writer rewrites it, fact-checks it, and adds the angle. Nothing ships without a human review. The unfair advantage is the combination, not any single piece.</div></div>
              </div>
              <div className="faq-item">
                <button className="faq-q">How is this different from a regular SEO agency?<span className="faq-ic">+</span></button>
                <div className="faq-a"><div className="faq-a-inner">Three things. (1) We optimize for ChatGPT, Claude, Perplexity and Gemini citations alongside Google. Most agencies are not even tracking that yet. (2) We use AI to compress the work that is grunt, so we ship in days what a regular team ships in months. (3) The pipeline lives on your infrastructure when we are done. You keep the prompts and workflows.</div></div>
              </div>
              <div className="faq-item">
                <button className="faq-q">When do we see results?<span className="faq-ic">+</span></button>
                <div className="faq-a"><div className="faq-a-inner">Pipeline live by week 2. First indexed pages by week 3. First top-20 rankings around weeks 5 to 7. First LLM citation typically inside 30 to 45 days. Compounding traffic curve hits in months 3 to 6. Sendr.ai hit 1.05M impressions and 7.43k clicks in 6 months on Google Search Console.</div></div>
              </div>
              <div className="faq-item">
                <button className="faq-q">Do you guarantee #1 rankings?<span className="faq-ic">+</span></button>
                <div className="faq-a"><div className="faq-a-inner">No. Anyone who does is lying. We aim for measurable lift in organic impressions and at least one LLM citation inside the first 90 days. That is testable. Sendr.ai is the proof we have shipped this before.</div></div>
              </div>
              <div className="faq-item">
                <button className="faq-q">What stage of company is this for?<span className="faq-ic">+</span></button>
                <div className="faq-a"><div className="faq-a-inner">Best fit: B2B SaaS with $20K to $2M MRR, an English-speaking ICP, and at least one founder who can do 90 minutes a week of strategy. Bad fit: pre-product, B2C consumer apps, or category-of-one products with no search demand yet.</div></div>
              </div>
              <div className="faq-item">
                <button className="faq-q">Can we just hire a freelancer?<span className="faq-ic">+</span></button>
                <div className="faq-a"><div className="faq-a-inner">Sure. The version a freelancer ships will be: 8 articles, no schema, no GEO optimization, no inbound automation, no citation tracking, no senior strategy oversight. Same hours, a quarter of the surface area. We would pick us. We are biased.</div></div>
              </div>
              <div className="faq-item">
                <button className="faq-q">How much does it cost?<span className="faq-ic">+</span></button>
                <div className="faq-a"><div className="faq-a-inner">We share pricing once we have looked at your domain and confirmed it is a fit. Different stage of SaaS, different scope. Apply above. The founder will DM you on LinkedIn with a real number inside 48 hours.</div></div>
              </div>
            </div>

            <div className="faq-side">
              <h3>Still have questions?</h3>
              <p>Send your application. The founder reads every one and replies personally on LinkedIn. Even if the answer is "not a fit right now," you get a real opinion, free.</p>
              <a href="#apply" className="btn btn-red w-full" style={{justifyContent: 'center'}}>Apply for review <span className="ar">↗</span></a>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ FINAL CTA ═════════════════════════════════════════════════════ */}
      <section className="final-cta" data-reveal>
        <div className="container final-cta-inner">
          <h2 className="final-h">
            Stop renting traffic.<br />
            <span className="ser">Build the engine.</span>
          </h2>
          <p className="final-sub">
            Every week you wait, your competitor is one more cited article ahead in ChatGPT. Compounding works for them too.
          </p>
          <div style={{display: 'flex', gap: '14px', flexWrap: 'wrap', justifyContent: 'center'}}>
            <a href="#apply" className="btn btn-primary btn-lg">Apply for the engine <span className="ar">↗</span></a>
            <a href="/audit" className="btn btn-outline btn-lg">Free audit first <span className="ar">↗</span></a>
          </div>
        </div>
      </section>

      {/* ═══ FOOTER ════════════════════════════════════════════════════════ */}
      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div>
              <a href="/" className="nav-logo" style={{color: 'var(--paper)'}}>
                <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                  <rect className="lg-r1" x="30" y="20" width="50" height="50"/>
                  <rect className="lg-r3" x="20" y="50" width="30" height="30" style={{fill: 'var(--paper)'}}/>
                  <rect className="lg-r2" x="40" y="45" width="25" height="20"/>
                </svg>
                RankedTag
              </a>
              <p className="footer-blurb">The Inbound Engine for SaaS founders who would rather build product than babysit an agency. Built with senior humans, Claude, and N8N.</p>
            </div>
            <div className="footer-col">
              <h4>The product</h4>
              <a href="#mechanism">How it works</a>
              <a href="#proof">Sendr.ai story</a>
              <a href="#apply">Apply</a>
            </div>
            <div className="footer-col">
              <h4>Free tools</h4>
              <a href="/technical-audit">Technical + Non-tech Audit</a>
              <a href="/backlink-checker">Backlink Checker</a>
              <a href="/keyword-density">Keyword Density</a>
              <a href="/page-speed">Page Speed</a>
            </div>
            <div className="footer-col">
              <h4>Company</h4>
              <a href="mailto:hello@rankedtag.com">hello@rankedtag.com</a>
              <a href="https://www.linkedin.com/" target="_blank" rel="noreferrer">LinkedIn</a>
            </div>
          </div>
          <div className="footer-bottom">
            <span>© 2026 RANKEDTAG · BUILT FOR FOUNDERS, NOT MARKETERS</span>
          </div>
        </div>
      </footer>
    </>
  );
}

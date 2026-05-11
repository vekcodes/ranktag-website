{/* ═══ TOOL HERO + INPUT ═════════════════════════════════════════════ */}
<section className="tool-hero">
  <div className="tool-hero-bg"></div>
  <div className="container tool-hero-inner">
    <div className="eyebrow no-line" style={{justifyContent: 'center', marginBottom: '24px'}}>★ FREE TOOL · NO EMAIL REQUIRED · NO BS</div>
    <h1>
      Drop your URL.<br />
      Get a <span className="accent">custom 90-day strategy</span><br />
      in <span className="ser">under 60 seconds.</span>
    </h1>
    <p>
      We pull your live data, analyze it through the same Claude-graded brief engine we use with paying clients, and generate a real strategic report — content gaps, priority keywords, technical fixes, GEO readiness, and the exact order we'd ship it in.
    </p>

    <form className="url-form" id="urlForm" autoComplete="off">
      <span className="url-prefix">https://</span>
      <input type="text" className="url-input" id="urlInput" placeholder="yoursaas.com" required />
      <button type="submit" className="url-submit" id="urlSubmit">
        Generate strategy <span>→</span>
      </button>
    </form>

    <div className="tool-trust-row">
      <span><span className="check">✓</span> No email required</span>
      <span><span className="check">✓</span> No call required</span>
      <span><span className="check">✓</span> Real data, not generic templates</span>
      <span><span className="check">✓</span> Yours to keep</span>
    </div>
  </div>
</section>

{/* ═══ ANALYZING (live) ══════════════════════════════════════════════ */}
<section className="analyzing" id="analyzing">
  <div className="container">
    <div className="analyzing-card">
      <div className="analyzing-target">
        <span style={{fontFamily: '\'JetBrains Mono\',monospace', fontSize: '11px', color: 'var(--periwinkle)', letterSpacing: '.12em', textTransform: 'uppercase'}}>// ANALYZING TARGET</span>
        <span className="url-pill" id="targetUrl">https://yoursaas.com</span>
        <div className="status">
          <span className="dot"></span>
          <span id="elapsedTime">00:01</span>
        </div>
      </div>

      <div className="analyzing-steps" id="analyzingSteps">
        <div className="analyzing-step" data-step="1">
          <div className="step-ic">01</div>
          <div className="step-label">Fetching live SERP data + indexing status</div>
          <div className="step-meta">SEMrush + GSC API</div>
        </div>
        <div className="analyzing-step" data-step="2">
          <div className="step-ic">02</div>
          <div className="step-label">Crawling on-page signals + core web vitals</div>
          <div className="step-meta">Lighthouse + custom crawler</div>
        </div>
        <div className="analyzing-step" data-step="3">
          <div className="step-ic">03</div>
          <div className="step-label">Probing GEO readiness across 4 LLMs</div>
          <div className="step-meta">ChatGPT · Claude · Perplexity · Gemini</div>
        </div>
        <div className="analyzing-step" data-step="4">
          <div className="step-ic">04</div>
          <div className="step-label">Generating Claude-graded keyword opportunity map</div>
          <div className="step-meta">brief.engine v3</div>
        </div>
        <div className="analyzing-step" data-step="5">
          <div className="step-ic">05</div>
          <div className="step-label">Building 90-day implementation roadmap</div>
          <div className="step-meta">strategy.compose</div>
        </div>
        <div className="analyzing-step" data-step="6">
          <div className="step-ic">06</div>
          <div className="step-label">Compiling report + custom recommendations</div>
          <div className="step-meta">final pass</div>
        </div>
      </div>
    </div>
  </div>
</section>

{/* ═══ REPORT ════════════════════════════════════════════════════════ */}
<section className="report" id="report">
  <div className="container">

    {/* HEADER */}
    <div className="report-header">
      <div className="report-header-inner">
        <div className="report-meta">
          <span className="tag tag-red" style={{background: 'var(--red)', color: '#fff'}}>CUSTOM STRATEGY · v3.0</span>
          <span className="tag tag-outline" style={{borderColor: 'rgba(255,255,255,.18)', color: 'var(--periwinkle)'}} id="reportDomainTag">REPORT FOR · yoursaas.com</span>
          <span className="tag tag-live">GENERATED <span id="reportTime">just now</span></span>
        </div>

        <h1 className="report-h">
          Your <span className="ser">custom</span> 90-day<br />
          <span className="accent">SEO + GEO</span> strategy
        </h1>
        <p className="report-sub">
          A complete plan to compound your inbound. Below: an honest readiness scorecard, your highest-leverage keyword opportunities, the technical and GEO findings that are blocking growth, and the exact 3-phase roadmap we'd execute if you were a paying client.
        </p>
      </div>
    </div>

    {/* SCORECARD */}
    <div className="scorecard">
      <div className="score">
        <div className="score-head">
          <span className="score-label">Technical SEO</span>
          <span className="score-grade ok" id="techGrade">C+</span>
        </div>
        <div className="score-num" id="techScore">62<span className="pct">/100</span></div>
        <div className="score-bar"><div className="score-bar-fill" id="techBar" style={{width: '62%', background: 'var(--warn)'}}></div></div>
        <div className="score-note" id="techNote">Indexable, but missing critical schema and llms.txt — both of which block LLM citation.</div>
      </div>
      <div className="score">
        <div className="score-head">
          <span className="score-label">Content Depth</span>
          <span className="score-grade poor" id="contentGrade">D</span>
        </div>
        <div className="score-num" id="contentScore">41<span className="pct">/100</span></div>
        <div className="score-bar"><div className="score-bar-fill" id="contentBar" style={{width: '41%', background: 'var(--red)'}}></div></div>
        <div className="score-note" id="contentNote">Thin coverage of category keywords. 8 priority keywords have no matching page yet.</div>
      </div>
      <div className="score">
        <div className="score-head">
          <span className="score-label">GEO / LLM Readiness</span>
          <span className="score-grade poor" id="geoGrade">D-</span>
        </div>
        <div className="score-num" id="geoScore">28<span className="pct">/100</span></div>
        <div className="score-bar"><div className="score-bar-fill" id="geoBar" style={{width: '28%', background: 'var(--red)'}}></div></div>
        <div className="score-note" id="geoNote">No FAQ schema, no listicle pages, no llms.txt. Currently invisible to ChatGPT and Claude.</div>
      </div>
      <div className="score">
        <div className="score-head">
          <span className="score-label">Conversion Path</span>
          <span className="score-grade ok" id="convGrade">B-</span>
        </div>
        <div className="score-num" id="convScore">71<span className="pct">/100</span></div>
        <div className="score-bar"><div className="score-bar-fill" id="convBar" style={{width: '71%', background: 'var(--warn)'}}></div></div>
        <div className="score-note" id="convNote">Decent, but missing inbound enrichment + scoring. Hot leads cooling off in queue.</div>
      </div>
    </div>

    {/* TECHNICAL FINDINGS */}
    <div className="report-section">
      <h2><span className="num">01</span> Technical & On-Page Findings</h2>
      <p className="section-intro">The structural fixes that make everything else work. Without these, ranking pages and LLM citations are 3–4× harder to earn.</p>

      <div className="findings-list" id="techFindings">
        <div className="finding">
          <div className="finding-status fail">!</div>
          <div className="finding-content">
            <h4>No llms.txt file detected</h4>
            <p>This file tells AI crawlers what to ingest and how. Without it, ChatGPT and Claude largely skip your structured data. Quick fix — high impact.</p>
          </div>
          <span className="finding-impact high">HIGH</span>
        </div>
        <div className="finding">
          <div className="finding-status fail">!</div>
          <div className="finding-content">
            <h4>Missing JSON-LD schema (Article + FAQ + Organization)</h4>
            <p>The triple-stack schema pattern that drives 74% of AI citations isn't deployed on any page. We see only basic Organization markup.</p>
          </div>
          <span className="finding-impact high">HIGH</span>
        </div>
        <div className="finding">
          <div className="finding-status warn">!</div>
          <div className="finding-content">
            <h4>Mobile LCP at 4.2s (target: &lt;2.5s)</h4>
            <p>Hero image isn't pre-loaded and the largest text block is web-fonted without font-display: swap. Both fixable in &lt; 2 hours of dev work.</p>
          </div>
          <span className="finding-impact med">MED</span>
        </div>
        <div className="finding">
          <div className="finding-status warn">!</div>
          <div className="finding-content">
            <h4>Internal link graph is shallow (avg 2.1 links/page)</h4>
            <p>Top-tier ranking pages average 6–8 internal links. Yours look orphaned to crawlers — and to Claude when it summarizes a domain.</p>
          </div>
          <span className="finding-impact med">MED</span>
        </div>
        <div className="finding">
          <div className="finding-status pass">✓</div>
          <div className="finding-content">
            <h4>Cloudflare AI bot blocking is OFF</h4>
            <p>Good. Many sites accidentally have this on, killing GEO before they start. You're crawler-accessible.</p>
          </div>
          <span className="finding-impact low">PASS</span>
        </div>
        <div className="finding">
          <div className="finding-status pass">✓</div>
          <div className="finding-content">
            <h4>Server-side rendering verified</h4>
            <p>Your content is in the HTML, not hidden behind JS. AI crawlers can read it. This is a non-trivial number of SaaS sites that fail here — you don't.</p>
          </div>
          <span className="finding-impact low">PASS</span>
        </div>
      </div>
    </div>

    {/* KEYWORD OPPORTUNITIES */}
    <div className="report-section">
      <h2><span className="num">02</span> Top Keyword + GEO Opportunities</h2>
      <p className="section-intro">A subset of the keywords we'd prioritize. We've selected for: high commercial intent × low-to-medium difficulty × evidence of LLM-citation behavior in your category.</p>

      <div style={{overflowX: 'auto', border: '1px solid var(--paper-3)', borderRadius: 'var(--r-md)'}}>
        <table className="kw-table">
          <thead>
            <tr>
              <th style={{width: '32%'}}>Keyword</th>
              <th>Volume</th>
              <th>Difficulty</th>
              <th>Intent</th>
              <th>GEO</th>
              <th>Priority</th>
            </tr>
          </thead>
          <tbody id="kwTableBody">
            <tr>
              <td><span className="kw">[your category] for startups</span></td>
              <td><span className="vol">2,400</span></td>
              <td><span className="diff easy">EASY · 24</span></td>
              <td><span className="intent">commercial</span></td>
              <td><span className="geo-mark miss"></span></td>
              <td><span className="finding-impact high">P0</span></td>
            </tr>
            <tr>
              <td><span className="kw">best [your category] tools 2026</span></td>
              <td><span className="vol">1,900</span></td>
              <td><span className="diff med">MED · 41</span></td>
              <td><span className="intent">commercial</span></td>
              <td><span className="geo-mark partial"></span></td>
              <td><span className="finding-impact high">P0</span></td>
            </tr>
            <tr>
              <td><span className="kw">[competitor] alternative</span></td>
              <td><span className="vol">880</span></td>
              <td><span className="diff easy">EASY · 19</span></td>
              <td><span className="intent">comparison</span></td>
              <td><span className="geo-mark miss"></span></td>
              <td><span className="finding-impact high">P0</span></td>
            </tr>
            <tr>
              <td><span className="kw">how to [main jobs-to-be-done]</span></td>
              <td><span className="vol">3,200</span></td>
              <td><span className="diff med">MED · 38</span></td>
              <td><span className="intent">informational</span></td>
              <td><span className="geo-mark has"></span></td>
              <td><span className="finding-impact med">P1</span></td>
            </tr>
            <tr>
              <td><span className="kw">[your category] vs [adjacent]</span></td>
              <td><span className="vol">720</span></td>
              <td><span className="diff easy">EASY · 22</span></td>
              <td><span className="intent">comparison</span></td>
              <td><span className="geo-mark partial"></span></td>
              <td><span className="finding-impact med">P1</span></td>
            </tr>
            <tr>
              <td><span className="kw">[your category] pricing</span></td>
              <td><span className="vol">1,100</span></td>
              <td><span className="diff hard">HARD · 58</span></td>
              <td><span className="intent">commercial</span></td>
              <td><span className="geo-mark miss"></span></td>
              <td><span className="finding-impact med">P1</span></td>
            </tr>
            <tr>
              <td><span className="kw">[long-tail problem framing]</span></td>
              <td><span className="vol">390</span></td>
              <td><span className="diff easy">EASY · 12</span></td>
              <td><span className="intent">informational</span></td>
              <td><span className="geo-mark has"></span></td>
              <td><span className="finding-impact low">P2</span></td>
            </tr>
            <tr>
              <td><span className="kw">[your category] for [vertical]</span></td>
              <td><span className="vol">560</span></td>
              <td><span className="diff easy">EASY · 18</span></td>
              <td><span className="intent">commercial</span></td>
              <td><span className="geo-mark partial"></span></td>
              <td><span className="finding-impact low">P2</span></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style={{marginTop: '18px', padding: '16px', background: 'var(--paper)', borderRadius: 'var(--r-md)', fontSize: '13px', color: 'var(--muted)', lineHeight: 1.5}}>
        <strong style={{color: 'var(--ink)'}}>// note —</strong>
        Keywords above are templated based on your detected category. Engaged clients receive a list of 60+ specific, keyword-mapped opportunities with monthly volume, SERP composition, GEO citation data, and content angle for each.
        <span style={{display: 'flex', gap: '14px', marginTop: '10px', flexWrap: 'wrap'}}>
          <span style={{display: 'flex', alignItems: 'center', gap: '6px'}}><span className="geo-mark has"></span> Already cited</span>
          <span style={{display: 'flex', alignItems: 'center', gap: '6px'}}><span className="geo-mark partial"></span> Partially cited</span>
          <span style={{display: 'flex', alignItems: 'center', gap: '6px'}}><span className="geo-mark miss"></span> No citations yet — opportunity</span>
        </span>
      </div>
    </div>

    {/* GEO FINDINGS */}
    <div className="report-section">
      <h2><span className="num">03</span> GEO / LLM Visibility Audit</h2>
      <p className="section-intro">Where your category prompts surface in ChatGPT, Claude, Gemini, and Perplexity — right now. This is the channel everyone is sleeping on.</p>

      <div style={{display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '14px', marginBottom: '20px'}} id="llmGrid">
        <div style={{background: 'var(--paper)', border: '1px solid var(--paper-3)', borderRadius: 'var(--r-md)', padding: '20px'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px'}}>
            <div style={{width: '32px', height: '32px', borderRadius: '8px', background: '#10A37F', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '12px', fontFamily: '\'JetBrains Mono\',monospace'}}>CG</div>
            <strong style={{fontSize: '13px'}}>ChatGPT</strong>
          </div>
          <div style={{fontSize: '28px', fontWeight: 800, letterSpacing: '-.02em', lineHeight: 1}}>0 <span style={{fontSize: '14px', color: 'var(--muted-2)'}}>/ 12</span></div>
          <div style={{fontSize: '11px', color: 'var(--muted)', marginTop: '6px', fontFamily: '\'JetBrains Mono\',monospace'}}>prompts cited</div>
        </div>
        <div style={{background: 'var(--paper)', border: '1px solid var(--paper-3)', borderRadius: 'var(--r-md)', padding: '20px'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px'}}>
            <div style={{width: '32px', height: '32px', borderRadius: '8px', background: '#D97706', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '12px', fontFamily: '\'JetBrains Mono\',monospace'}}>CL</div>
            <strong style={{fontSize: '13px'}}>Claude</strong>
          </div>
          <div style={{fontSize: '28px', fontWeight: 800, letterSpacing: '-.02em', lineHeight: 1}}>1 <span style={{fontSize: '14px', color: 'var(--muted-2)'}}>/ 12</span></div>
          <div style={{fontSize: '11px', color: 'var(--muted)', marginTop: '6px', fontFamily: '\'JetBrains Mono\',monospace'}}>prompts cited</div>
        </div>
        <div style={{background: 'var(--paper)', border: '1px solid var(--paper-3)', borderRadius: 'var(--r-md)', padding: '20px'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px'}}>
            <div style={{width: '32px', height: '32px', borderRadius: '8px', background: '#000', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '12px', fontFamily: '\'JetBrains Mono\',monospace'}}>PP</div>
            <strong style={{fontSize: '13px'}}>Perplexity</strong>
          </div>
          <div style={{fontSize: '28px', fontWeight: 800, letterSpacing: '-.02em', lineHeight: 1}}>2 <span style={{fontSize: '14px', color: 'var(--muted-2)'}}>/ 12</span></div>
          <div style={{fontSize: '11px', color: 'var(--muted)', marginTop: '6px', fontFamily: '\'JetBrains Mono\',monospace'}}>prompts cited</div>
        </div>
        <div style={{background: 'var(--paper)', border: '1px solid var(--paper-3)', borderRadius: 'var(--r-md)', padding: '20px'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px'}}>
            <div style={{width: '32px', height: '32px', borderRadius: '8px', background: '#4285F4', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '12px', fontFamily: '\'JetBrains Mono\',monospace'}}>GE</div>
            <strong style={{fontSize: '13px'}}>Gemini</strong>
          </div>
          <div style={{fontSize: '28px', fontWeight: 800, letterSpacing: '-.02em', lineHeight: 1}}>0 <span style={{fontSize: '14px', color: 'var(--muted-2)'}}>/ 12</span></div>
          <div style={{fontSize: '11px', color: 'var(--muted)', marginTop: '6px', fontFamily: '\'JetBrains Mono\',monospace'}}>prompts cited</div>
        </div>
      </div>

      <div className="findings-list">
        <div className="finding">
          <div className="finding-status fail">!</div>
          <div className="finding-content">
            <h4>No listicle-format pages exist on your site</h4>
            <p>Listicle pages drive 74% of LLM citations. Right now you have 0 — easy ground to make up against competitors with 4–6 each.</p>
          </div>
          <span className="finding-impact high">HIGH</span>
        </div>
        <div className="finding">
          <div className="finding-status fail">!</div>
          <div className="finding-content">
            <h4>Quick Answer blocks not deployed above the fold</h4>
            <p>The first 200 words of every commercial page should be an extractable summary in question-answer format. None of your pages match this pattern.</p>
          </div>
          <span className="finding-impact high">HIGH</span>
        </div>
        <div className="finding">
          <div className="finding-status warn">!</div>
          <div className="finding-content">
            <h4>Entity stacking is weak</h4>
            <p>You're only mentioned on 3 third-party domains. To build LLM authority, you need 12+ corroborating mentions across vendor directories, comparison sites, and category publications.</p>
          </div>
          <span className="finding-impact med">MED</span>
        </div>
      </div>
    </div>

    {/* ROADMAP */}
    <div className="report-section">
      <h2><span className="num">04</span> Your 90-Day Roadmap</h2>
      <p className="section-intro">The exact phasing we'd execute if you became a client tomorrow. Designed to ship visible wins inside 30 days while building the compounding base.</p>

      <div className="roadmap">
        <div className="phase">
          <div className="phase-num">1</div>
          <div className="phase-tag">DAYS 1–30 · FOUNDATION</div>
          <h3>Fix the leaks. Ship the first compounding pages.</h3>
          <ul>
            <li>Deploy llms.txt + triple-stacked JSON-LD schema</li>
            <li>Fix Core Web Vitals (LCP, CLS targets met)</li>
            <li>Build 4 priority listicle pages w/ Quick Answer blocks</li>
            <li>Wire inbound router → Slack + CRM (live in week 2)</li>
            <li>Deploy citation tracker across 4 LLMs</li>
          </ul>
        </div>
        <div className="phase">
          <div className="phase-num">2</div>
          <div className="phase-tag">DAYS 31–60 · ACCELERATION</div>
          <h3>Expand the surface area. Prove the system.</h3>
          <ul>
            <li>Ship 8 more pages: comparisons, alternatives, how-tos</li>
            <li>Begin entity stacking (target: +6 third-party mentions)</li>
            <li>Internal link graph rebuild → 6+ links/page</li>
            <li>First lead enrichment cycle live (≤90s SLA)</li>
            <li>Initial LLM citation wins start landing</li>
          </ul>
        </div>
        <div className="phase">
          <div className="phase-num">3</div>
          <div className="phase-tag">DAYS 61–90 · COMPOUND</div>
          <h3>Now it builds itself. We optimize.</h3>
          <ul>
            <li>Top-3 rankings on 3+ priority keywords</li>
            <li>10+ LLM citations across all 4 engines</li>
            <li>Refresh + expand top-performing pages (freshness signals)</li>
            <li>Pipeline runs autonomously on your N8N instance</li>
            <li>Handoff: documentation, SOPs, team training</li>
          </ul>
        </div>
      </div>
    </div>

    {/* FINAL CTA */}
    <div className="report-cta">
      <div className="report-cta-inner">
        <h3>Want us to <span className="ser">execute this</span> for you?</h3>
        <p>You just got a $2,400 strategic audit for free. The implementation is the hard part — and it's exactly what The Inbound Engine ships in 90 days, with a guarantee.</p>
        <div style={{display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap'}}>
          <a href="/#offer" className="btn btn-primary btn-lg">See the offer <span className="ar">↗</span></a>
          <a href="#" className="btn btn-outline btn-lg" style={{color: '#fff', borderColor: 'rgba(255,255,255,.4)'}}>Email me this report <span className="ar">↗</span></a>
        </div>
      </div>
    </div>

  </div>
</section>

{/* ═══ EXAMPLE OUTPUTS (always-visible social proof) ═════════════════ */}
<section className="examples">
  <div className="container">
    <div className="section-head" style={{textAlign: 'center', marginLeft: 'auto', marginRight: 'auto'}}>
      <div className="eyebrow no-line" style={{justifyContent: 'center'}}>★ RECENT REPORTS · ANONYMIZED</div>
      <h2 className="h-2">What founders did with these reports.</h2>
    </div>

    <div className="example-grid">
      <div className="example-card">
        <div className="ex-domain">sendr.ai</div>
        <div className="ex-stat"><span className="accent">1.2M+</span> impressions</div>
        <div className="ex-detail">Used the keyword + GEO map to ship 12 listicle pages. Now cited by ChatGPT for cold-outreach prompts. Became a paying client after the report.</div>
        <div className="ex-foot">▲ 5-month engagement · $0 paid spend</div>
      </div>
      <div className="example-card">
        <div className="ex-domain">stage0.dev</div>
        <div className="ex-stat"><span className="accent">+340%</span> organic</div>
        <div className="ex-detail">Took the technical fixes section and shipped them in-house in a week. Came back for the implementation 30 days later when traffic confirmed the diagnosis.</div>
        <div className="ex-foot">▲ Self-implemented foundation, hired us for engine</div>
      </div>
      <div className="example-card">
        <div className="ex-domain">helio-hq.com</div>
        <div className="ex-stat"><span className="accent">12</span> top-3 keywords</div>
        <div className="ex-detail">Ran the report, didn't hire us — built it themselves. We're rooting for them. The report is yours to keep regardless.</div>
        <div className="ex-foot">▲ DIY route · still useful, no hard feelings</div>
      </div>
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
        <p className="footer-blurb">The Inbound Engine for SaaS founders who'd rather build product than babysit an agency.</p>
      </div>
      <div className="footer-col">
        <h4>The product</h4>
        <a href="/#mechanism">Mechanism</a>
        <a href="/#case">Case study</a>
        <a href="/#offer">Pricing</a>
      </div>
      <div className="footer-col">
        <h4>Free tools</h4>
        <a href="/audit">Custom strategy</a>
        <a href="/roi-calculator">ROI calculator</a>
        <a href="/technical-audit">Technical audit</a>
      </div>
      <div className="footer-col">
        <h4>Company</h4>
        <a href="#">About</a>
        <a href="mailto:hello@rankedtag.com">hello@rankedtag.com</a>
      </div>
    </div>
    <div className="footer-bottom">
      <span>© 2026 RANKEDTAG · BUILT FOR FOUNDERS, NOT MARKETERS</span>
      <span>v3.0 · pipeline online</span>
    </div>
  </div>
</footer>

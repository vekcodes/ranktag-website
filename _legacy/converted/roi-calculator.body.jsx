{/* ═══ HERO ══════════════════════════════════════════════════════════ */}
<section className="tool-hero">
  <div className="tool-hero-bg"></div>
  <div className="container tool-hero-inner">
    <div className="eyebrow no-line" style={{justifyContent: 'center', marginBottom: '24px'}}>★ FREE TOOL · NO EMAIL · LIVE CALCULATIONS</div>
    <h1>
      What's the actual <span className="accent">ROI</span><br />
      of doing SEO right? <span className="ser">Find out in 60 seconds.</span>
    </h1>
    <p>
      Plug in your traffic, conversion rate, contract value, and churn. We'll project your 12-month organic revenue, your break-even point, and the cost of putting this off another quarter.
    </p>
  </div>
</section>

{/* ═══ CALCULATOR ════════════════════════════════════════════════════ */}
<section className="calc-section">
  <div className="container">
    <div className="calc-grid">

      {/* INPUTS */}
      <div className="calc-inputs">
        <h2>Your business inputs</h2>
        <p className="head-sub">Drag the sliders. The 12-month forecast updates live. Industry-grade defaults pre-loaded.</p>

        {/* Preset rows */}
        <div className="preset-row">
          <button className="preset-btn active" data-preset="seed">SEED</button>
          <button className="preset-btn" data-preset="growth">SERIES A</button>
          <button className="preset-btn" data-preset="scale">GROWTH</button>
        </div>

        {/* Monthly searches */}
        <div className="input-group">
          <div className="input-row">
            <label>
              Monthly searches (target keywords)
              <span className="help" data-tip="Total monthly search volume across keywords you'd realistically rank for. Industry tools like Ahrefs & Semrush give you this.">?</span>
            </label>
            <span className="val"><span id="searchesVal">25,000</span></span>
          </div>
          <input type="range" className="slider" id="searches" min="2000" max="500000" step="1000" value="25000" />
        </div>

        {/* Click-through rate */}
        <div className="input-group">
          <div className="input-row">
            <label>
              Avg CTR (top-3 ranking)
              <span className="help" data-tip="Click-through rate when ranking in top 3. SaaS B2B avg is 18-25% for top 3, much higher than #4-10.">?</span>
            </label>
            <span className="val"><span id="ctrVal">22</span>%</span>
          </div>
          <input type="range" className="slider" id="ctr" min="5" max="40" step="1" value="22" />
        </div>

        {/* Visitor → Signup conversion */}
        <div className="input-group">
          <div className="input-row">
            <label>
              Visitor → signup rate
              <span className="help" data-tip="What % of organic visitors sign up for trial/demo. SaaS median is 2-4%, top quartile is 5-7%.">?</span>
            </label>
            <span className="val"><span id="convVal">3.2</span>%</span>
          </div>
          <input type="range" className="slider" id="conv" min="0.5" max="10" step="0.1" value="3.2" />
        </div>

        {/* Trial → Paid */}
        <div className="input-group">
          <div className="input-row">
            <label>
              Trial → paid conversion
              <span className="help" data-tip="Of people who sign up, what % become paying. SaaS median is 15-25% for free trial, 30-50% for paid trial.">?</span>
            </label>
            <span className="val"><span id="t2pVal">22</span>%</span>
          </div>
          <input type="range" className="slider" id="t2p" min="5" max="60" step="1" value="22" />
        </div>

        {/* Average Contract Value */}
        <div className="input-group">
          <div className="input-row">
            <label>
              Average Contract Value (annual)
              <span className="help" data-tip="ACV per customer per year. Enter realistic, not list price.">?</span>
            </label>
            <span className="val">$<span id="acvVal">8,400</span></span>
          </div>
          <input type="range" className="slider" id="acv" min="500" max="100000" step="100" value="8400" />
        </div>

        {/* Customer LTV multiplier (years) */}
        <div className="input-group">
          <div className="input-row">
            <label>
              Avg customer lifespan
              <span className="help" data-tip="How long an avg customer stays. 1/churn = lifespan. 5%/mo churn = 1.7yr lifespan.">?</span>
            </label>
            <span className="val"><span id="ltvVal">2.5</span> yrs</span>
          </div>
          <input type="range" className="slider" id="ltv" min="0.5" max="6" step="0.1" value="2.5" />
        </div>

        {/* Monthly investment */}
        <div className="input-group">
          <div className="input-row">
            <label>
              Monthly SEO investment
              <span className="help" data-tip="Total monthly spend: agency, content, tools, internal time. Be realistic.">?</span>
            </label>
            <span className="val">$<span id="investVal">14,800</span></span>
          </div>
          <input type="range" className="slider" id="invest" min="1000" max="60000" step="100" value="14800" />
        </div>

        <p className="fineprint" style={{marginTop: '14px', textAlign: 'center'}}>// Sliders update the right panel in real-time. Built on the standard SaaS SEO ROI formula.</p>
      </div>

      {/* OUTPUTS */}
      <div className="calc-output">

        {/* HEADLINE STAT */}
        <div className="headline-stat">
          <div className="headline-stat-inner">
            <div className="lbl">12-month projected new revenue · organic only</div>
            <div className="num">$<span id="annualRevenue">1,243,000</span></div>
            <div className="sub">
              That's a <strong id="roiPct">600%</strong> ROI on your $<span id="annualSpend">177,600</span> annual SEO investment. Net profit: <strong>$<span id="netProfit">1,065,400</span></strong>.
            </div>
          </div>
        </div>

        {/* METRIC GRID */}
        <div className="metric-grid">
          <div className="metric">
            <div className="lbl">Monthly organic visits (mo 12)</div>
            <div className="num"><span id="monthlyVisits">5,500</span></div>
            <div className="delta">▲ from rankings</div>
          </div>
          <div className="metric">
            <div className="lbl">Monthly new signups (mo 12)</div>
            <div className="num"><span id="monthlySignups">176</span></div>
            <div className="delta">▲ inbound only</div>
          </div>
          <div className="metric">
            <div className="lbl">Monthly new MRR (mo 12)</div>
            <div className="num">$<span id="monthlyMRR">27,100</span></div>
            <div className="delta">▲ recurring</div>
          </div>
        </div>

        {/* CHART */}
        <div className="chart-card">
          <div className="chart-head">
            <div>
              <div className="h">12-month projection</div>
              <div className="s">Cumulative organic revenue vs your SEO investment.</div>
            </div>
            <div className="chart-legend">
              <span><span className="dot-line" style={{background: 'var(--red)'}}></span>Cumulative revenue</span>
              <span><span className="dot-line" style={{background: 'var(--ink-3)'}}></span>Cumulative cost</span>
              <span><span className="dot" style={{background: 'var(--success)'}}></span>Break-even</span>
            </div>
          </div>

          <div className="chart-wrap">
            <svg className="chart-svg" id="chart" viewBox="0 0 720 280" preserveAspectRatio="none">
              {/* Grid lines */}
              <g stroke="rgba(0,0,0,.06)" strokeDasharray="2,4" id="gridLines"></g>

              {/* Axis labels (Y) */}
              <g id="yLabels" font-family="JetBrains Mono, monospace" font-size="9" fill="#6E6E76"></g>

              {/* Cost area (gray) */}
              <defs>
                <linearGradient id="costGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22232A" stopOpacity=".18"/>
                  <stop offset="100%" stopColor="#22232A" stopOpacity="0"/>
                </linearGradient>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FF3B14" stopOpacity=".28"/>
                  <stop offset="100%" stopColor="#FF3B14" stopOpacity="0"/>
                </linearGradient>
              </defs>

              <path id="costArea" fill="url(#costGrad)" d=""/>
              <path id="costLine" fill="none" stroke="#22232A" strokeWidth="2" strokeLinejoin="round" d=""/>

              <path id="revArea" fill="url(#revGrad)" d=""/>
              <path id="revLine" fill="none" stroke="#FF3B14" strokeWidth="2.5" strokeLinejoin="round" d=""/>

              {/* Break-even marker */}
              <g id="breakevenMarker"></g>

              {/* Hover line */}
              <line id="hoverLine" stroke="rgba(0,0,0,.2)" strokeDasharray="3,3" y1="0" y2="280" style={{display: 'none'}}/>
              <circle id="hoverDotRev" r="5" fill="#FF3B14" stroke="#fff" strokeWidth="2" style={{display: 'none'}}/>
              <circle id="hoverDotCost" r="4" fill="#22232A" stroke="#fff" strokeWidth="2" style={{display: 'none'}}/>

              {/* Hover capture area */}
              <rect id="hoverArea" x="0" y="0" width="720" height="280" fill="transparent" style={{cursor: 'crosshair'}}/>
            </svg>

            <div className="chart-tooltip" id="chartTooltip">
              <span className="tt-month">MONTH 0</span>
              <div className="tt-row"><span>Revenue</span><strong>$0</strong></div>
              <div className="tt-row"><span>Cost</span><strong>$0</strong></div>
              <div className="tt-row" style={{borderTop: '1px solid rgba(255,255,255,.15)', paddingTop: '4px', marginTop: '4px'}}><span>Net</span><strong style={{color: '#FF3B14'}}>$0</strong></div>
            </div>
          </div>

          <div className="chart-x-axis" id="xAxis"></div>
        </div>

        {/* BREAK-EVEN */}
        <div className="breakeven">
          <div className="be-icon">τ</div>
          <div className="be-content">
            <h3>Break-even point</h3>
            <div className="be-text"><strong>Month <span id="breakEvenMonth">7</span></strong> · then it compounds. <span style={{opacity: '.7'}}>Industry avg: 7.7 months.</span></div>
          </div>
          <a href="/#offer" className="be-cta">Lock my slot →</a>
        </div>

        {/* COST OF DOING NOTHING */}
        <div className="cost-of-nothing">
          <div className="cost-of-nothing-head">
            <div className="ic">⚠</div>
            <h3>The cost of waiting one more quarter</h3>
          </div>
          <p>Every 90 days you delay, your competitors are filling the SERPs and earning the LLM citations. You're not standing still — you're falling behind, and recovery requires earning ground back, not just keeping pace.</p>
          <div className="cost-row">
            <div className="cost-cell">
              <div className="lbl">Revenue if you start NOW</div>
              <div className="num">$<span id="startNow">1,243,000</span></div>
            </div>
            <div className="cost-cell bad">
              <div className="lbl">Revenue forfeited by waiting 1 quarter</div>
              <div className="num">−$<span id="costOfWaiting">312,000</span></div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</section>

{/* ═══ FORMULA EXPLAINER ═════════════════════════════════════════════ */}
<section className="formula-section">
  <div className="container">
    <div className="formula-card">
      <div className="eyebrow" style={{marginBottom: '14px'}}>UNDER THE HOOD · the math we use</div>
      <h2>The formula nobody hides anymore.</h2>
      <p className="sub">This is the standard SaaS SEO ROI formula used across the industry. We didn't invent it — we just made it usable.</p>

      <div className="formula-eq">
        <div>ROI =</div>
        <div style={{margin: '8px 0'}}>
          <span className="div-line">
            (<span className="red">Searches × CTR × Conv × Trial→Paid × ACV × Lifespan</span>) − <span className="peri">Annual Cost</span>
          </span>
        </div>
        <div><span className="peri">Annual Cost</span></div>
      </div>

      <div className="formula-vars">
        <div className="formula-var">
          <h4>Searches × CTR</h4>
          <p>How much organic traffic actually lands on your site each month, given top-3 rankings on your target keywords.</p>
        </div>
        <div className="formula-var">
          <h4>Visitor Conv × Trial→Paid</h4>
          <p>Two-stage conversion: visitor signs up, then becomes paying. Both stages compound the funnel impact.</p>
        </div>
        <div className="formula-var">
          <h4>ACV × Lifespan</h4>
          <p>Lifetime value per customer. Annual contract × average years retained. SaaS retention is the secret sauce of ROI.</p>
        </div>
        <div className="formula-var">
          <h4>Annual Cost</h4>
          <p>Total spend: agency fees, content, tools, dev work, internal time. Honest accounting required for honest ROI.</p>
        </div>
      </div>

      <p className="fineprint" style={{marginTop: '24px', textAlign: 'center'}}>
        // For B2B SaaS, industry benchmarks show avg ROI of 702% with breakeven around month 7. This calculator reflects those benchmarks.
      </p>
    </div>
  </div>
</section>

{/* ═══ CTA ═══════════════════════════════════════════════════════════ */}
<div className="container">
  <section className="cta-section">
    <div className="cta-section-inner">
      <h2>Numbers look good?<br /><span className="ser">Now</span> let's <span className="accent">make them real.</span></h2>
      <p>The Inbound Engine ships everything you need to hit these projections — pipeline, content, automation, lead routing, citation tracking. 90 days. Flat fee. Triple-stacked guarantee.</p>
      <div className="ctas">
        <a href="/#offer" className="btn btn-red btn-lg">See the offer <span className="ar">↗</span></a>
        <a href="/audit" className="btn btn-outline btn-lg" style={{color: 'var(--paper)', borderColor: 'rgba(255,255,255,.4)'}}>Get free strategy first <span className="ar">↗</span></a>
      </div>
    </div>
  </section>
</div>

{/* ═══ FOOTER ════════════════════════════════════════════════════════ */}
<footer className="footer" style={{marginTop: '80px'}}>
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

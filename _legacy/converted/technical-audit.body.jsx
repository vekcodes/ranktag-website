{/* ═══ TOOL HERO + INPUT ═════════════════════════════════════════════ */}
<section className="tool-hero">
  <div className="tool-hero-bg"></div>
  <div className="container tool-hero-inner">
    <div className="eyebrow no-line" style={{justifyContent: 'center', marginBottom: '24px'}}>★ FREE TOOL · 47-POINT SCAN · &lt;30 SECONDS</div>
    <h1>
      The technical SEO audit<br />
      your <span className="ser">dev team</span> <span className="accent">forgot.</span>
    </h1>
    <p>
      A real 47-point scan. We check what Google sees, what ChatGPT can read, and what's silently killing your rankings. No email walls, no upsells inside the report.
    </p>

    <form className="url-form" id="urlForm" autoComplete="off">
      <span className="url-prefix">https://</span>
      <input type="text" className="url-input" id="urlInput" placeholder="yoursaas.com" required />
      <button type="submit" className="url-submit">
        Run audit <span>→</span>
      </button>
    </form>

    <div className="tool-trust-row">
      <span><span className="check">✓</span> 47 checks across 6 categories</span>
      <span><span className="check">✓</span> AI-crawler accessibility</span>
      <span><span className="check">✓</span> Schema validation</span>
      <span><span className="check">✓</span> Yours to keep</span>
    </div>
  </div>
</section>

{/* ═══ INFO STRIP — what we check ════════════════════════════════════ */}
<section className="info-strip" id="infoStrip">
  <div className="container">
    <div className="section-head" style={{textAlign: 'center', margin: '0 auto 0', maxWidth: '680px'}}>
      <div className="eyebrow no-line" style={{justifyContent: 'center'}}>WHAT WE CHECK · the things most audits skip</div>
      <h2 className="h-2" style={{textAlign: 'center'}}>6 categories. 47 checks.<br />Including <span className="serif" style={{color: 'var(--red)', fontStyle: 'italic', fontWeight: 400}}>the GEO ones nobody else runs.</span></h2>
    </div>
    <div className="info-grid">
      <div className="info-card">
        <div className="ic">01</div>
        <h4>Crawlability</h4>
        <p>robots.txt, sitemap, AI-bot access, Cloudflare config, server-side rendering, redirect chains.</p>
      </div>
      <div className="info-card">
        <div className="ic">02</div>
        <h4>Schema & Structure</h4>
        <p>JSON-LD validation, triple-stack pattern, OpenGraph, internal linking depth, breadcrumbs.</p>
      </div>
      <div className="info-card">
        <div className="ic">03</div>
        <h4>Performance</h4>
        <p>LCP, CLS, INP, mobile vs desktop, image optimization, render-blocking, font loading.</p>
      </div>
      <div className="info-card">
        <div className="ic">04</div>
        <h4>Mobile + UX</h4>
        <p>Viewport, touch targets, font sizing, layout shift, hamburger nav, intrusive interstitials.</p>
      </div>
      <div className="info-card">
        <div className="ic">05</div>
        <h4>GEO Readiness</h4>
        <p>llms.txt, FAQ schema, listicle pages, Quick Answer blocks, entity stacking, citation patterns.</p>
      </div>
      <div className="info-card">
        <div className="ic">06</div>
        <h4>Security & Trust</h4>
        <p>SSL, HSTS, CSP headers, mixed content, broken links, 404 patterns, canonical issues.</p>
      </div>
    </div>
  </div>
</section>

{/* ═══ SCANNING ══════════════════════════════════════════════════════ */}
<section className="scanning" id="scanning">
  <div className="container">
    <div className="scan-card">
      <div className="scan-target">
        <span style={{fontFamily: '\'JetBrains Mono\',monospace', fontSize: '11px', color: 'var(--periwinkle)', letterSpacing: '.12em', textTransform: 'uppercase'}}>// SCANNING</span>
        <span className="url-pill" id="targetUrl">https://yoursaas.com</span>
        <div className="status">
          <span className="dot"></span>
          <span id="elapsed">00:00</span>
        </div>
      </div>

      <div className="scan-progress">
        <div className="scan-progress-bar"><div className="scan-progress-bar-fill" id="progressBar"></div></div>
        <div className="scan-progress-text">
          <span id="progressLabel">Initializing scan...</span>
          <span id="progressPct">0 / 47</span>
        </div>
      </div>

      <div className="scan-categories" id="scanCategories">
        <div className="scan-cat" data-cat="1">
          <div className="cat-ic">01</div>
          <div className="cat-name">Crawlability + indexing</div>
          <div className="cat-count">8 checks</div>
        </div>
        <div className="scan-cat" data-cat="2">
          <div className="cat-ic">02</div>
          <div className="cat-name">Schema + structured data</div>
          <div className="cat-count">9 checks</div>
        </div>
        <div className="scan-cat" data-cat="3">
          <div className="cat-ic">03</div>
          <div className="cat-name">Performance + Core Web Vitals</div>
          <div className="cat-count">7 checks</div>
        </div>
        <div className="scan-cat" data-cat="4">
          <div className="cat-ic">04</div>
          <div className="cat-name">Mobile + UX</div>
          <div className="cat-count">6 checks</div>
        </div>
        <div className="scan-cat" data-cat="5">
          <div className="cat-ic">05</div>
          <div className="cat-name">GEO + LLM readiness</div>
          <div className="cat-count">10 checks</div>
        </div>
        <div className="scan-cat" data-cat="6">
          <div className="cat-ic">06</div>
          <div className="cat-name">Security + trust signals</div>
          <div className="cat-count">7 checks</div>
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
          <span className="tag tag-red" style={{background: 'var(--red)', color: '#fff'}}>TECHNICAL AUDIT · v3.0</span>
          <span className="tag tag-outline" style={{borderColor: 'rgba(255,255,255,.18)', color: 'var(--periwinkle)'}} id="reportDomain">REPORT FOR · yoursaas.com</span>
          <span className="tag tag-live">SCANNED <span id="reportTime">just now</span></span>
        </div>

        <h1 className="report-h">
          Your <span className="ser">technical</span> +<br />
          <span className="accent">GEO audit</span>
        </h1>
        <p className="report-sub">
          47 checks across 6 categories. Every fix below has a recommended action — most are 1-day dev tasks. The compounding wins live in the GEO category, which most teams haven't started yet.
        </p>
      </div>
    </div>

    {/* OVERALL SCORE */}
    <div className="overall-card">
      <div className="score-ring">
        <svg width="200" height="200" viewBox="0 0 200 200">
          <circle cx="100" cy="100" r="86" fill="none" stroke="#EDE6D9" strokeWidth="14"/>
          <circle cx="100" cy="100" r="86" fill="none" stroke="#FF3B14" strokeWidth="14"
                  strokeDasharray="540" strokeDashoffset="216" strokeLinecap="round" id="scoreRing"/>
        </svg>
        <div className="score-ring-text">
          <div className="num" id="overallScore">60</div>
          <div className="lbl">/ 100</div>
        </div>
      </div>

      <div className="overall-content">
        <h2>You're losing <span className="accent">48% of your potential</span><br />to fixable technical issues.</h2>
        <p>Foundations are mostly there. Where you're bleeding ranking power: schema gaps, GEO blind spots, and a few mobile performance hits. None of these require a redesign — most are 1-day dev fixes with disproportionate impact.</p>

        <div className="overall-summary-grid">
          <div className="overall-stat fail">
            <div className="num" id="failCount">11</div>
            <div className="lbl">Critical fails</div>
          </div>
          <div className="overall-stat warn">
            <div className="num" id="warnCount">14</div>
            <div className="lbl">Warnings</div>
          </div>
          <div className="overall-stat pass">
            <div className="num" id="passCount">22</div>
            <div className="lbl">Passes</div>
          </div>
        </div>
      </div>
    </div>

    {/* CATEGORY 1: CRAWLABILITY */}
    <div className="cat-section open" data-status="warn">
      <div className="cat-header">
        <div className="cat-icon">01</div>
        <div className="cat-info">
          <h3>Crawlability + indexing</h3>
          <p>Can Google + LLMs actually access your content?</p>
        </div>
        <div className="cat-stats">
          <span className="cat-stat fail">2 FAIL</span>
          <span className="cat-stat warn">2 WARN</span>
          <span className="cat-stat pass">4 PASS</span>
        </div>
        <div className="cat-toggle">+</div>
      </div>
      <div className="cat-body">
        <div className="checks">
          <div className="check" data-status="fail">
            <div className="check-status">!</div>
            <div className="check-content">
              <h4>Cloudflare AI bot blocking is ENABLED</h4>
              <p className="desc">Cloudflare's recent default change blocks GPTBot, Claude-Web, and PerplexityBot. Your AI citations will be near-zero until this is reverted.</p>
              <span className="fix"><strong>Fix:</strong> Cloudflare → Bots → AI Bots → set to "Allow"</span>
            </div>
            <span className="check-impact high">CRITICAL</span>
          </div>
          <div className="check" data-status="fail">
            <div className="check-status">!</div>
            <div className="check-content">
              <h4>sitemap.xml not referenced in robots.txt</h4>
              <p className="desc">Sitemap exists but isn't declared. Crawlers find it eventually, but indexing speed is 30-40% slower.</p>
              <span className="fix"><strong>Fix:</strong> Add <code>Sitemap: https://yoursaas.com/sitemap.xml</code> to robots.txt</span>
            </div>
            <span className="check-impact high">HIGH</span>
          </div>
          <div className="check" data-status="warn">
            <div className="check-status">!</div>
            <div className="check-content">
              <h4>3 redirect chains detected (3+ hops)</h4>
              <p className="desc">Each hop loses ~10% of link equity. /blog/old → /blog/2024 → /resources/blog → final URL.</p>
              <span className="fix"><strong>Fix:</strong> Update all internal links + 301 redirects to point directly to final URLs.</span>
            </div>
            <span className="check-impact med">MED</span>
          </div>
          <div className="check" data-status="warn">
            <div className="check-status">!</div>
            <div className="check-content">
              <h4>62 pages with noindex but in sitemap</h4>
              <p className="desc">Search engines see this as conflicting signals. Either remove from sitemap or remove the noindex.</p>
              <span className="fix"><strong>Fix:</strong> Audit /blog/tag/* pages — likely the source.</span>
            </div>
            <span className="check-impact med">MED</span>
          </div>
          <div className="check" data-status="pass">
            <div className="check-status">✓</div>
            <div className="check-content">
              <h4>robots.txt accessible + valid</h4>
              <p className="desc">File exists, returns 200, no syntax errors detected.</p>
            </div>
            <span className="check-impact low">PASS</span>
          </div>
          <div className="check" data-status="pass">
            <div className="check-status">✓</div>
            <div className="check-content">
              <h4>Server-side rendering verified</h4>
              <p className="desc">Critical content present in initial HTML response. AI crawlers can read it.</p>
            </div>
            <span className="check-impact low">PASS</span>
          </div>
          <div className="check" data-status="pass">
            <div className="check-status">✓</div>
            <div className="check-content">
              <h4>Canonical URLs properly set</h4>
              <p className="desc">All sampled pages have valid self-referencing canonical tags. No duplication signals.</p>
            </div>
            <span className="check-impact low">PASS</span>
          </div>
          <div className="check" data-status="pass">
            <div className="check-status">✓</div>
            <div className="check-content">
              <h4>200 OK response on key pages</h4>
              <p className="desc">Homepage, pricing, /blog all returning 200 with reasonable TTFB (&lt;800ms).</p>
            </div>
            <span className="check-impact low">PASS</span>
          </div>
        </div>
      </div>
    </div>

    {/* CATEGORY 2: SCHEMA */}
    <div className="cat-section" data-status="fail">
      <div className="cat-header">
        <div className="cat-icon">02</div>
        <div className="cat-info">
          <h3>Schema + structured data</h3>
          <p>Critical for both Google rich results and LLM citations.</p>
        </div>
        <div className="cat-stats">
          <span className="cat-stat fail">4 FAIL</span>
          <span className="cat-stat warn">3 WARN</span>
          <span className="cat-stat pass">2 PASS</span>
        </div>
        <div className="cat-toggle">+</div>
      </div>
      <div className="cat-body">
        <div className="checks">
          <div className="check" data-status="fail">
            <div className="check-status">!</div>
            <div className="check-content">
              <h4>Triple JSON-LD stack not deployed</h4>
              <p className="desc">Article + ItemList + FAQPage on the same page is the 2026 GEO standard. Drives 74% of LLM citations. You have only Organization markup.</p>
              <span className="fix"><strong>Fix:</strong> Deploy on top 10 commercial pages first. Templates available in our free GEO checklist.</span>
            </div>
            <span className="check-impact high">CRITICAL</span>
          </div>
          <div className="check" data-status="fail">
            <div className="check-status">!</div>
            <div className="check-content">
              <h4>FAQPage schema missing</h4>
              <p className="desc">Even your FAQ section has no schema. ChatGPT and Claude lean heavily on FAQPage for citation extraction.</p>
              <span className="fix"><strong>Fix:</strong> Add JSON-LD FAQPage to /pricing, /how-it-works, /blog/* with FAQ sections.</span>
            </div>
            <span className="check-impact high">HIGH</span>
          </div>
          <div className="check" data-status="fail">
            <div className="check-status">!</div>
            <div className="check-content">
              <h4>BreadcrumbList markup not found</h4>
              <p className="desc">Blog posts and product pages should expose BreadcrumbList. Helps SERP appearance and LLM site-structure understanding.</p>
              <span className="fix"><strong>Fix:</strong> Add to template at /blog/[slug] and /[product]/[feature].</span>
            </div>
            <span className="check-impact med">MED</span>
          </div>
          <div className="check" data-status="fail">
            <div className="check-status">!</div>
            <div className="check-content">
              <h4>SoftwareApplication schema not present</h4>
              <p className="desc">Specific schema for SaaS products. Google uses for rich pricing snippets, AI engines for category placement.</p>
              <span className="fix"><strong>Fix:</strong> Add to homepage + /pricing with offers, aggregateRating, applicationCategory.</span>
            </div>
            <span className="check-impact med">MED</span>
          </div>
          <div className="check" data-status="warn">
            <div className="check-status">!</div>
            <div className="check-content">
              <h4>Organization schema is incomplete</h4>
              <p className="desc">Has name + url. Missing logo, sameAs (social profiles), founder, foundingDate. These build entity authority.</p>
              <span className="fix"><strong>Fix:</strong> Expand /schema.json with all 8 standard fields.</span>
            </div>
            <span className="check-impact med">MED</span>
          </div>
          <div className="check" data-status="warn">
            <div className="check-status">!</div>
            <div className="check-content">
              <h4>OpenGraph tags inconsistent across templates</h4>
              <p className="desc">Blog uses og:type=article. Product pages use og:type=website (should be product). Inconsistent og:image dimensions.</p>
              <span className="fix"><strong>Fix:</strong> Standardize to 1200×630 og:image, correct og:type per template.</span>
            </div>
            <span className="check-impact low">LOW</span>
          </div>
          <div className="check" data-status="warn">
            <div className="check-status">!</div>
            <div className="check-content">
              <h4>Twitter Card meta missing on /blog/*</h4>
              <p className="desc">Specifically the summary_large_image card. You have it on landing pages, missing on content.</p>
              <span className="fix"><strong>Fix:</strong> Add to blog template's &lt;head&gt;.</span>
            </div>
            <span className="check-impact low">LOW</span>
          </div>
          <div className="check" data-status="pass">
            <div className="check-status">✓</div>
            <div className="check-content">
              <h4>JSON-LD syntax valid (no parse errors)</h4>
              <p className="desc">Existing schema markup parses cleanly. No malformed JSON detected.</p>
            </div>
            <span className="check-impact low">PASS</span>
          </div>
          <div className="check" data-status="pass">
            <div className="check-status">✓</div>
            <div className="check-content">
              <h4>Title + meta description present on all sampled pages</h4>
              <p className="desc">Every page has both. Average length within Google's display limits (50-60 / 150-160 chars).</p>
            </div>
            <span className="check-impact low">PASS</span>
          </div>
        </div>
      </div>
    </div>

    {/* CATEGORY 3: PERFORMANCE */}
    <div className="cat-section" data-status="warn">
      <div className="cat-header">
        <div className="cat-icon">03</div>
        <div className="cat-info">
          <h3>Performance + Core Web Vitals</h3>
          <p>Mobile speed directly affects rankings.</p>
        </div>
        <div className="cat-stats">
          <span className="cat-stat fail">1 FAIL</span>
          <span className="cat-stat warn">3 WARN</span>
          <span className="cat-stat pass">3 PASS</span>
        </div>
        <div className="cat-toggle">+</div>
      </div>
      <div className="cat-body">
        <div className="checks">
          <div className="check" data-status="fail">
            <div className="check-status">!</div>
            <div className="check-content">
              <h4>Mobile LCP at 4.2s (target: &lt;2.5s)</h4>
              <p className="desc">Largest contentful paint is your hero image. It's 1.4MB and not preloaded. Above-the-fold text is web-fonted without font-display: swap.</p>
              <span className="fix"><strong>Fix:</strong> Compress hero to &lt;200KB WebP. Add &lt;link rel=preload&gt;. Use font-display: swap.</span>
            </div>
            <span className="check-impact high">HIGH</span>
          </div>
          <div className="check" data-status="warn">
            <div className="check-status">!</div>
            <div className="check-content">
              <h4>CLS = 0.18 (target: &lt;0.1)</h4>
              <p className="desc">Layout shift on the testimonial slider — images don't have explicit dimensions, causing reflow on load.</p>
              <span className="fix"><strong>Fix:</strong> Add width + height attributes to all &lt;img&gt; tags.</span>
            </div>
            <span className="check-impact med">MED</span>
          </div>
          <div className="check" data-status="warn">
            <div className="check-status">!</div>
            <div className="check-content">
              <h4>Render-blocking JS detected (3 scripts, 280KB)</h4>
              <p className="desc">Google Tag Manager, HubSpot tracking, and your animation library are all blocking initial render.</p>
              <span className="fix"><strong>Fix:</strong> Add async or defer to non-critical scripts. Lazy-load HubSpot.</span>
            </div>
            <span className="check-impact med">MED</span>
          </div>
          <div className="check" data-status="warn">
            <div className="check-status">!</div>
            <div className="check-content">
              <h4>Images not served in next-gen formats</h4>
              <p className="desc">14 images on homepage in PNG/JPG. WebP would reduce payload by ~38%.</p>
              <span className="fix"><strong>Fix:</strong> Use &lt;picture&gt; with WebP fallback, or pipe through Cloudinary/imgix.</span>
            </div>
            <span className="check-impact low">LOW</span>
          </div>
          <div className="check" data-status="pass">
            <div className="check-status">✓</div>
            <div className="check-content">
              <h4>INP within target (avg 142ms, target &lt;200ms)</h4>
              <p className="desc">Interaction-to-next-paint is healthy. Click handlers respond quickly.</p>
            </div>
            <span className="check-impact low">PASS</span>
          </div>
          <div className="check" data-status="pass">
            <div className="check-status">✓</div>
            <div className="check-content">
              <h4>Desktop performance score: 92/100</h4>
              <p className="desc">Desktop LCP at 1.6s, TBT minimal. Issues are mobile-specific.</p>
            </div>
            <span className="check-impact low">PASS</span>
          </div>
          <div className="check" data-status="pass">
            <div className="check-status">✓</div>
            <div className="check-content">
              <h4>HTTP/2 + Brotli compression active</h4>
              <p className="desc">Modern delivery stack. Origin → CDN compression saving ~28% bandwidth.</p>
            </div>
            <span className="check-impact low">PASS</span>
          </div>
        </div>
      </div>
    </div>

    {/* CATEGORY 4: MOBILE + UX */}
    <div className="cat-section" data-status="pass">
      <div className="cat-header">
        <div className="cat-icon">04</div>
        <div className="cat-info">
          <h3>Mobile + UX</h3>
          <p>Mostly clean. A few small touch-target fixes.</p>
        </div>
        <div className="cat-stats">
          <span className="cat-stat warn">2 WARN</span>
          <span className="cat-stat pass">4 PASS</span>
        </div>
        <div className="cat-toggle">+</div>
      </div>
      <div className="cat-body">
        <div className="checks">
          <div className="check" data-status="warn">
            <div className="check-status">!</div>
            <div className="check-content">
              <h4>4 touch targets below 44×44px on mobile</h4>
              <p className="desc">Footer social icons + nav close button. Apple/Google guidelines require 44px minimum.</p>
              <span className="fix"><strong>Fix:</strong> Increase padding on those targets to hit 44px tap area.</span>
            </div>
            <span className="check-impact low">LOW</span>
          </div>
          <div className="check" data-status="warn">
            <div className="check-status">!</div>
            <div className="check-content">
              <h4>Text size 13px on mobile sidebar (recommend 16px+)</h4>
              <p className="desc">Some legal/footer text triggers "tap to zoom" on iOS. Affects a small % of users but the fix is trivial.</p>
              <span className="fix"><strong>Fix:</strong> Bump --footer-text from 13px to 14-15px on mobile.</span>
            </div>
            <span className="check-impact low">LOW</span>
          </div>
          <div className="check" data-status="pass">
            <div className="check-status">✓</div>
            <div className="check-content">
              <h4>Viewport meta tag correctly configured</h4>
              <p className="desc">width=device-width, initial-scale=1 set. No user-scalable=no (which would hurt accessibility).</p>
            </div>
            <span className="check-impact low">PASS</span>
          </div>
          <div className="check" data-status="pass">
            <div className="check-status">✓</div>
            <div className="check-content">
              <h4>No intrusive interstitials</h4>
              <p className="desc">No popup that covers main content on mobile load. Google penalty avoided.</p>
            </div>
            <span className="check-impact low">PASS</span>
          </div>
          <div className="check" data-status="pass">
            <div className="check-status">✓</div>
            <div className="check-content">
              <h4>Responsive breakpoints work cleanly down to 320px</h4>
              <p className="desc">No horizontal scroll, no broken layouts at any tested viewport.</p>
            </div>
            <span className="check-impact low">PASS</span>
          </div>
          <div className="check" data-status="pass">
            <div className="check-status">✓</div>
            <div className="check-content">
              <h4>Mobile nav accessible with keyboard + screen reader</h4>
              <p className="desc">aria-expanded, focus management on hamburger menu working correctly.</p>
            </div>
            <span className="check-impact low">PASS</span>
          </div>
        </div>
      </div>
    </div>

    {/* CATEGORY 5: GEO READINESS — THE BIG ONE */}
    <div className="cat-section open" data-status="fail">
      <div className="cat-header">
        <div className="cat-icon">05</div>
        <div className="cat-info">
          <h3>GEO + LLM readiness · the biggest opportunity</h3>
          <p>Where you're invisible to ChatGPT, Claude, Perplexity, Gemini.</p>
        </div>
        <div className="cat-stats">
          <span className="cat-stat fail">4 FAIL</span>
          <span className="cat-stat warn">4 WARN</span>
          <span className="cat-stat pass">2 PASS</span>
        </div>
        <div className="cat-toggle">+</div>
      </div>
      <div className="cat-body">
        <div className="checks">
          <div className="check" data-status="fail">
            <div className="check-status">!</div>
            <div className="check-content">
              <h4>llms.txt file not present</h4>
              <p className="desc">The 2026 standard for AI crawler instructions. Tells engines what to ingest, what's primary, what context to use. Without it, Claude and ChatGPT pick semi-randomly.</p>
              <span className="fix"><strong>Fix:</strong> Create /llms.txt at root. Format spec: llmstxt.org. Estimated dev time: 1 hour.</span>
            </div>
            <span className="check-impact high">CRITICAL</span>
          </div>
          <div className="check" data-status="fail">
            <div className="check-status">!</div>
            <div className="check-content">
              <h4>Zero listicle-format pages</h4>
              <p className="desc">74.2% of all AI citations come from "Top N" / "Best X" structured listicles. You have none. Competitors have 4-7 each.</p>
              <span className="fix"><strong>Fix:</strong> Build 4 listicle pages targeting your top commercial keywords. Includes ranked items, ItemList schema, comparison table.</span>
            </div>
            <span className="check-impact high">CRITICAL</span>
          </div>
          <div className="check" data-status="fail">
            <div className="check-status">!</div>
            <div className="check-content">
              <h4>No Quick Answer blocks above the fold</h4>
              <p className="desc">First 200 words should be an extractable Q→A summary. None of your commercial pages match this pattern. AI engines extract from the first scroll.</p>
              <span className="fix"><strong>Fix:</strong> Add a 50-100 word answer block above hero on /pricing, /how-it-works, /[product].</span>
            </div>
            <span className="check-impact high">HIGH</span>
          </div>
          <div className="check" data-status="fail">
            <div className="check-status">!</div>
            <div className="check-content">
              <h4>Entity stacking weak (3 third-party mentions)</h4>
              <p className="desc">AI engines use multi-source corroboration. You need 12+ independent domain mentions to register as authoritative. Vendor directories, comparison sites, podcast appearances all count.</p>
              <span className="fix"><strong>Fix:</strong> Submit to G2, Capterra, Product Hunt, vendor directories, get on 2-3 podcasts in your category. Avg 14-21 days to AI ingestion.</span>
            </div>
            <span className="check-impact med">MED</span>
          </div>
          <div className="check" data-status="warn">
            <div className="check-status">!</div>
            <div className="check-content">
              <h4>FAQ sections not formatted for extraction</h4>
              <p className="desc">FAQs are present but in collapsible accordions without schema. AI engines often skip these.</p>
              <span className="fix"><strong>Fix:</strong> Add FAQPage JSON-LD AND keep questions visible (or use SSR to hydrate after). Structure as &lt;h3&gt; question + &lt;p&gt; answer.</span>
            </div>
            <span className="check-impact med">MED</span>
          </div>
          <div className="check" data-status="warn">
            <div className="check-status">!</div>
            <div className="check-content">
              <h4>No "Best for / Pros / Cons / Pricing" pattern on comparison content</h4>
              <p className="desc">Listicle items must include this structure for AI extraction. Even your existing comparison page misses it.</p>
              <span className="fix"><strong>Fix:</strong> For each item: 100-200w overview, "Best For" tag, 3-4 pros, 2-3 cons, pricing indication.</span>
            </div>
            <span className="check-impact med">MED</span>
          </div>
          <div className="check" data-status="warn">
            <div className="check-status">!</div>
            <div className="check-content">
              <h4>Author bylines + entity markup missing</h4>
              <p className="desc">Blog posts have no author, no Person schema. E-E-A-T signals affect both Google and AI citations.</p>
              <span className="fix"><strong>Fix:</strong> Add author byline + Person schema linking to /author/[slug] page with sameAs to LinkedIn/Twitter.</span>
            </div>
            <span className="check-impact med">MED</span>
          </div>
          <div className="check" data-status="warn">
            <div className="check-status">!</div>
            <div className="check-content">
              <h4>Content freshness signals weak</h4>
              <p className="desc">Most blog posts dated 2024 with no "Updated:" timestamp. AI engines downweight aging content without freshness markers.</p>
              <span className="fix"><strong>Fix:</strong> Refresh 12 top posts quarterly. Add visible "Last updated:" + dateModified schema.</span>
            </div>
            <span className="check-impact low">LOW</span>
          </div>
          <div className="check" data-status="pass">
            <div className="check-status">✓</div>
            <div className="check-content">
              <h4>AI crawlers (GPTBot, Claude-Web, PerplexityBot) accessible</h4>
              <p className="desc">No robots.txt blocks against major AI bots. (Cloudflare config issue noted in Crawlability section.)</p>
            </div>
            <span className="check-impact low">PASS</span>
          </div>
          <div className="check" data-status="pass">
            <div className="check-status">✓</div>
            <div className="check-content">
              <h4>Content readable as plain text (no JS-only rendering)</h4>
              <p className="desc">All article content present in initial HTML. No JS-required text (which would be invisible to most LLM crawlers).</p>
            </div>
            <span className="check-impact low">PASS</span>
          </div>
        </div>
      </div>
    </div>

    {/* CATEGORY 6: SECURITY */}
    <div className="cat-section" data-status="pass">
      <div className="cat-header">
        <div className="cat-icon">06</div>
        <div className="cat-info">
          <h3>Security + trust signals</h3>
          <p>Solid foundation, two minor headers missing.</p>
        </div>
        <div className="cat-stats">
          <span className="cat-stat warn">2 WARN</span>
          <span className="cat-stat pass">5 PASS</span>
        </div>
        <div className="cat-toggle">+</div>
      </div>
      <div className="cat-body">
        <div className="checks">
          <div className="check" data-status="warn">
            <div className="check-status">!</div>
            <div className="check-content">
              <h4>Content-Security-Policy header missing</h4>
              <p className="desc">No CSP set. Doesn't directly affect ranking but is a trust signal flagged by enterprise security audits — and your B2B buyers run those audits.</p>
              <span className="fix"><strong>Fix:</strong> Add CSP header. Start in report-only mode for 2 weeks before enforcing.</span>
            </div>
            <span className="check-impact low">LOW</span>
          </div>
          <div className="check" data-status="warn">
            <div className="check-status">!</div>
            <div className="check-content">
              <h4>3 broken outbound links detected</h4>
              <p className="desc">Links to industry reports + tools that have moved or 404'd. Hurts UX and crawl budget.</p>
              <span className="fix"><strong>Fix:</strong> Run a quarterly broken link audit. Fix or remove the 3 detected.</span>
            </div>
            <span className="check-impact low">LOW</span>
          </div>
          <div className="check" data-status="pass">
            <div className="check-status">✓</div>
            <div className="check-content">
              <h4>SSL certificate valid + auto-renewing</h4>
              <p className="desc">Cert valid through 2026-Q3. No mixed-content warnings on tested pages.</p>
            </div>
            <span className="check-impact low">PASS</span>
          </div>
          <div className="check" data-status="pass">
            <div className="check-status">✓</div>
            <div className="check-content">
              <h4>HSTS header set with reasonable max-age</h4>
              <p className="desc">Strict-Transport-Security: max-age=31536000. Browsers enforce HTTPS.</p>
            </div>
            <span className="check-impact low">PASS</span>
          </div>
          <div className="check" data-status="pass">
            <div className="check-status">✓</div>
            <div className="check-content">
              <h4>No mixed content warnings</h4>
              <p className="desc">All resources served over HTTPS. No HTTP scripts or images.</p>
            </div>
            <span className="check-impact low">PASS</span>
          </div>
          <div className="check" data-status="pass">
            <div className="check-status">✓</div>
            <div className="check-content">
              <h4>X-Frame-Options + X-Content-Type-Options set</h4>
              <p className="desc">Standard security headers in place.</p>
            </div>
            <span className="check-impact low">PASS</span>
          </div>
          <div className="check" data-status="pass">
            <div className="check-status">✓</div>
            <div className="check-content">
              <h4>404 page returns proper status + has navigation</h4>
              <p className="desc">/nonexistent returns 404 (not 200). Page has search + nav, helping users recover.</p>
            </div>
            <span className="check-impact low">PASS</span>
          </div>
        </div>
      </div>
    </div>

    {/* FINAL CTA */}
    <div className="report-cta">
      <div className="report-cta-inner">
        <h3>Don't want to <span className="ser">do this yourself?</span></h3>
        <p>Every fix above is part of what we ship in week 1-2 of an Inbound Engine engagement. We do the boring technical work AND the compounding content work — together they're the engine.</p>
        <div style={{display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap'}}>
          <a href="/#offer" className="btn btn-primary btn-lg">See the offer <span className="ar">↗</span></a>
          <a href="/audit" className="btn btn-outline btn-lg" style={{color: '#fff', borderColor: 'rgba(255,255,255,.4)'}}>Get full strategy report <span className="ar">↗</span></a>
        </div>
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

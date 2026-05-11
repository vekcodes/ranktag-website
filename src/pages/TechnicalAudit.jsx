import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Nav from '../components/Nav.jsx';
import useScrollReveal from '../hooks/useScrollReveal.js';
import './TechnicalAudit.css';
import './ToolPage.css';

export default function TechnicalAudit() {
  useScrollReveal();
  const [searchParams] = useSearchParams();
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    url: '',
    linkedin: '',
    note: '',
  });

  useEffect(() => {
    const incoming = searchParams.get('url');
    if (incoming) setForm((f) => ({ ...f, url: incoming }));
  }, [searchParams]);

  const onChange = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const onSubmit = (e) => {
    e.preventDefault();
    // Wire to Formspree, HubSpot Forms, or a Google Sheets webhook here.
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <Nav variant="tech" />

      {!submitted && (
        <section className="tool-hero">
          <div className="tool-hero-bg"></div>
          <div className="container tool-hero-inner">
            <div className="eyebrow no-line" style={{justifyContent: 'center', marginBottom: '24px'}}>★ FREE TOOL · TECHNICAL + NON-TECHNICAL · FOUNDER-RUN</div>
            <h1>
              The site audit<br />
              most agencies <span className="ser">never run</span><br />
              <span className="accent">end to end.</span>
            </h1>
            <p>
              52 checks across 7 categories. Crawlability, schema, Core Web Vitals, mobile, security, GEO + LLM readiness, and the non-technical layer most audits skip: content depth, ICP clarity, conversion path, and copy that does not sound like AI wrote it. The founder runs the audit personally and DMs the report on LinkedIn within 48 hours. Free.
            </p>

            <form className="apply-form" onSubmit={onSubmit} autoComplete="off">
              <div className="apply-row">
                <label className="apply-field">
                  <span className="apply-label">Your name</span>
                  <input type="text" required value={form.name} onChange={onChange('name')} placeholder="Alex Singh" />
                </label>
                <label className="apply-field">
                  <span className="apply-label">Work email</span>
                  <input type="email" required value={form.email} onChange={onChange('email')} placeholder="alex@yoursaas.com" />
                </label>
              </div>
              <div className="apply-row">
                <label className="apply-field">
                  <span className="apply-label">Site to audit</span>
                  <input type="text" required value={form.url} onChange={onChange('url')} placeholder="https://yoursaas.com" />
                </label>
                <label className="apply-field">
                  <span className="apply-label">LinkedIn (so we can DM you)</span>
                  <input type="text" required value={form.linkedin} onChange={onChange('linkedin')} placeholder="linkedin.com/in/yourname" />
                </label>
              </div>
              <label className="apply-field">
                <span className="apply-label">Anything we should know? (optional)</span>
                <textarea rows={3} value={form.note} onChange={onChange('note')} placeholder="e.g. We just shipped a redesign. Specifically worried about Core Web Vitals on mobile."></textarea>
              </label>
              <div className="apply-foot">
                <button type="submit" className="btn btn-red btn-lg">Send for audit <span className="ar">↗</span></button>
                <p className="fineprint">
                  Reviewed by the founder personally. Report on LinkedIn within 48 hours. We never sell, share, or spam your info.
                </p>
              </div>
            </form>

            <div className="tool-trust-row">
              <span><span className="check">✓</span> 52 checks · 7 categories</span>
              <span><span className="check">✓</span> Technical + non-technical</span>
              <span><span className="check">✓</span> Real human, no auto-report</span>
              <span><span className="check">✓</span> 100% free</span>
            </div>
          </div>
        </section>
      )}

      {submitted && (
        <section className="tool-hero thank-you">
          <div className="tool-hero-bg"></div>
          <div className="container tool-hero-inner" style={{maxWidth: '760px'}}>
            <div className="thank-mark">✓</div>
            <div className="eyebrow no-line" style={{justifyContent: 'center', marginBottom: '20px'}}>★ AUDIT QUEUED</div>
            <h1>
              Got it. Your audit<br />
              lands on <span className="accent">LinkedIn</span><br />
              within 48 hours.
            </h1>
            <p>
              The founder will personally run the 52-point check on your site, write up what is broken, what is bleeding ranking power, and what to fix first. You get the full report on LinkedIn. Free, even if we never work together.
            </p>

            <div className="thank-checklist">
              <div className="thank-step">
                <div className="thank-step-num">01</div>
                <div className="thank-step-body">
                  <h4>Real 7-category scan</h4>
                  <p>Crawlability, schema, Core Web Vitals, mobile, security, GEO, and the non-technical content + positioning layer.</p>
                </div>
              </div>
              <div className="thank-step">
                <div className="thank-step-num">02</div>
                <div className="thank-step-body">
                  <h4>Fix-first prioritisation</h4>
                  <p>Every finding has a recommended action, ranked by impact. The boring 1-day dev tasks are flagged separately.</p>
                </div>
              </div>
              <div className="thank-step">
                <div className="thank-step-num">03</div>
                <div className="thank-step-body">
                  <h4>LinkedIn DM in 48h</h4>
                  <p>Sent from a real founder account. The report is yours. No paywall, no upsell inside it.</p>
                </div>
              </div>
            </div>

            <div className="thank-cta-row">
              <a href="/" className="btn btn-outline btn-lg">Back to home</a>
              <a href="/keyword-density" className="btn btn-primary btn-lg">Try the keyword density checker <span className="ar">↗</span></a>
            </div>

            <p className="fineprint" style={{marginTop:'40px', textAlign:'center'}}>
              No DM by hour 48? Ping us at <a href="mailto:hello@rankedtag.com" style={{color:'var(--ink)', textDecoration:'underline'}}>hello@rankedtag.com</a>.
            </p>
          </div>
        </section>
      )}

      {!submitted && (
        <section className="examples">
          <div className="container">
            <div className="section-head" style={{textAlign: 'center', marginLeft: 'auto', marginRight: 'auto'}}>
              <div className="eyebrow no-line" style={{justifyContent: 'center'}}>★ WHAT WE CHECK · 7 categories, 52 points</div>
              <h2 className="h-2">Technical, GEO, and the<br /><span className="serif" style={{color: 'var(--red)', fontStyle: 'italic', fontWeight: 400}}>non-technical layer most audits skip.</span></h2>
            </div>

            <div className="example-grid" style={{gridTemplateColumns:'repeat(auto-fit, minmax(280px, 1fr))'}}>
              <div className="example-card">
                <div className="ex-domain">01 · Crawlability + indexing</div>
                <div className="ex-stat"><span className="accent">8</span> checks</div>
                <div className="ex-detail">Robots.txt, sitemap health, indexable pages, noindex traps, canonical chains, redirect loops, crawl budget waste, AI crawler accessibility.</div>
                <div className="ex-foot">▲ Technical</div>
              </div>
              <div className="example-card">
                <div className="ex-domain">02 · Schema + structured data</div>
                <div className="ex-stat"><span className="accent">9</span> checks</div>
                <div className="ex-detail">JSON-LD coverage, Article + FAQ + Organization triple-stack, Product schema, validity, llms.txt, OpenGraph, Twitter cards, breadcrumbs.</div>
                <div className="ex-foot">▲ Technical</div>
              </div>
              <div className="example-card">
                <div className="ex-domain">03 · Performance + Core Web Vitals</div>
                <div className="ex-stat"><span className="accent">7</span> checks</div>
                <div className="ex-detail">LCP, CLS, INP, image optimisation, font display, JS budget, lazy-loading. The mobile numbers Google actually uses for ranking.</div>
                <div className="ex-foot">▲ Technical</div>
              </div>
              <div className="example-card">
                <div className="ex-domain">04 · Mobile + UX</div>
                <div className="ex-stat"><span className="accent">6</span> checks</div>
                <div className="ex-detail">Tap targets, viewport meta, font legibility, mobile nav usability, layout shift on touch, hamburger menu sanity.</div>
                <div className="ex-foot">▲ Technical</div>
              </div>
              <div className="example-card">
                <div className="ex-domain">05 · GEO + LLM readiness</div>
                <div className="ex-stat"><span className="accent">10</span> checks</div>
                <div className="ex-detail">llms.txt, FAQ schema, listicle pages, Quick Answer blocks, citation patterns across ChatGPT, Claude, Perplexity, Gemini. Most audits skip this entirely.</div>
                <div className="ex-foot">▲ The new battleground</div>
              </div>
              <div className="example-card">
                <div className="ex-domain">06 · Security + trust signals</div>
                <div className="ex-stat"><span className="accent">7</span> checks</div>
                <div className="ex-detail">SSL, HSTS, mixed content, CSP, X-Frame-Options, broken outbound links, 404 page sanity. The trust signals enterprise buyers screen for.</div>
                <div className="ex-foot">▲ Technical</div>
              </div>
              <div className="example-card">
                <div className="ex-domain">07 · Content + positioning</div>
                <div className="ex-stat"><span className="accent">5</span> checks</div>
                <div className="ex-detail">ICP clarity above the fold, specific result claims, conversion path placement, copy that does not sound like AI wrote it, social proof in primary flow.</div>
                <div className="ex-foot">▲ Non-technical (the layer everyone skips)</div>
              </div>
            </div>
          </div>
        </section>
      )}

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
              <p className="footer-blurb">The Inbound Engine for SaaS founders who would rather build product than babysit an agency.</p>
            </div>
            <div className="footer-col">
              <h4>The product</h4>
              <a href="/#mechanism">How it works</a>
              <a href="/#proof">Sendr.ai story</a>
              <a href="/#apply">Apply</a>
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

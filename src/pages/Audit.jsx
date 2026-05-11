import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Nav from '../components/Nav.jsx';
import useScrollReveal from '../hooks/useScrollReveal.js';
import './Audit.css';

export default function Audit() {
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

  // Pre-fill URL from ?url=
  useEffect(() => {
    const incoming = searchParams.get('url');
    if (incoming) {
      setForm((f) => ({ ...f, url: incoming }));
    }
  }, [searchParams]);

  const onChange = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const onSubmit = (e) => {
    e.preventDefault();
    // NOTE: wire this to Formspree, HubSpot Forms, or a Google Sheets webhook.
    // For now we capture client-side and show a confirmation.
    // Example: fetch('https://formspree.io/f/YOUR_ID', { method:'POST', body:new FormData(e.target), headers:{Accept:'application/json'} });
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <Nav variant="audit" />

      {/* ═══ HERO ══════════════════════════════════════════════════════════ */}
      {!submitted && (
        <section className="tool-hero">
          <div className="tool-hero-bg"></div>
          <div className="container tool-hero-inner">
            <div className="eyebrow no-line" style={{justifyContent: 'center', marginBottom: '24px'}}>★ FOUNDER REVIEW · NO AUTO-REPORTS · NO MASS SPAM</div>
            <h1>
              Drop your URL.<br />
              The founder personally reviews it<br />
              and DMs you on <span className="accent">LinkedIn</span>.
            </h1>
            <p>
              We do not auto-generate fake reports. Every domain that comes through here is reviewed by the founder, run through a real competitive scan, and replied to with a 90-day plan inside 48 hours. Even if we are not the right fit, you get a real opinion, free.
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
                  <span className="apply-label">SaaS website</span>
                  <input type="text" required value={form.url} onChange={onChange('url')} placeholder="https://yoursaas.com" />
                </label>
                <label className="apply-field">
                  <span className="apply-label">LinkedIn (so we can DM you)</span>
                  <input type="text" required value={form.linkedin} onChange={onChange('linkedin')} placeholder="linkedin.com/in/yourname" />
                </label>
              </div>
              <label className="apply-field">
                <span className="apply-label">Stage of your SaaS, who you sell to (optional)</span>
                <textarea rows={3} value={form.note} onChange={onChange('note')} placeholder="e.g. Seed-stage. We sell cold-outreach software to RevOps leaders at 50-200 person SaaS companies."></textarea>
              </label>
              <div className="apply-foot">
                <button type="submit" className="btn btn-red btn-lg">Send for review <span className="ar">↗</span></button>
                <p className="fineprint">
                  Reviewed by the founder personally. Reply on LinkedIn within 48 hours. We never sell, share, or spam your info.
                </p>
              </div>
            </form>

            <div className="tool-trust-row">
              <span><span className="check">✓</span> Founder reviews every domain</span>
              <span><span className="check">✓</span> Reply on LinkedIn in 48h</span>
              <span><span className="check">✓</span> Real opinion, even if it is a no</span>
            </div>
          </div>
        </section>
      )}

      {/* ═══ THANK YOU ═════════════════════════════════════════════════════ */}
      {submitted && (
        <section className="tool-hero thank-you">
          <div className="tool-hero-bg"></div>
          <div className="container tool-hero-inner" style={{maxWidth: '760px'}}>
            <div className="thank-mark">✓</div>
            <div className="eyebrow no-line" style={{justifyContent: 'center', marginBottom: '20px'}}>★ APPLICATION RECEIVED</div>
            <h1>
              Got it. The founder will<br />
              <span className="accent">DM you on LinkedIn</span><br />
              within 48 hours.
            </h1>
            <p>
              Your domain is now in the queue. The founder will personally review your site, run a quick competitive scan, and reach out on LinkedIn with what we would do, in plain English. Even if we are not the right fit, you will hear back with a real opinion.
            </p>

            <div className="thank-checklist">
              <div className="thank-step">
                <div className="thank-step-num">01</div>
                <div className="thank-step-body">
                  <h4>The founder reviews your site</h4>
                  <p>Real eyes on your domain. SWOT, keyword gaps, competitive scan. Not a chatbot.</p>
                </div>
              </div>
              <div className="thank-step">
                <div className="thank-step-num">02</div>
                <div className="thank-step-body">
                  <h4>You get a LinkedIn DM in 48h</h4>
                  <p>Sent from a real account. Includes what we would do, what we would not do, and whether we are a fit.</p>
                </div>
              </div>
              <div className="thank-step">
                <div className="thank-step-num">03</div>
                <div className="thank-step-body">
                  <h4>You decide what is next</h4>
                  <p>If it is a fit, we book a 30-minute scoping call. If not, you keep the strategy. No follow-up sequence.</p>
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

      {/* ═══ WHY THIS, NOT AN AUTO-REPORT ═════════════════════════════════ */}
      {!submitted && (
        <section className="examples">
          <div className="container">
            <div className="section-head" style={{textAlign: 'center', marginLeft: 'auto', marginRight: 'auto'}}>
              <div className="eyebrow no-line" style={{justifyContent: 'center'}}>★ WHY WE KILLED THE AUTO-REPORT</div>
              <h2 className="h-2">A real human reading your site<br />beats a fake PDF every time.</h2>
            </div>

            <div className="example-grid">
              <div className="example-card">
                <div className="ex-domain">Auto reports</div>
                <div className="ex-stat"><span className="accent">95%</span> generic</div>
                <div className="ex-detail">You drop your URL. A bot scrapes it. You get the same 47-point checklist every other founder gets. Useful for nobody, sent to everybody.</div>
                <div className="ex-foot">▼ what every other agency does</div>
              </div>
              <div className="example-card">
                <div className="ex-domain">Founder review</div>
                <div className="ex-stat"><span className="accent">100%</span> custom</div>
                <div className="ex-detail">A senior strategist actually reads your site. Pulls SERPs, checks LLM citations, looks at competitor positioning. Then writes you back with what specifically to do.</div>
                <div className="ex-foot">▲ what we do</div>
              </div>
              <div className="example-card">
                <div className="ex-domain">Sendr.ai</div>
                <div className="ex-stat"><span className="accent">1.05M</span> impressions</div>
                <div className="ex-detail">7.43k clicks, 1.05M impressions, 6 months on Google Search Console. Now ranks #2 in Google's AI Overview for "best GTM tool", six places above ZoomInfo at #8.</div>
                <div className="ex-foot">▲ same playbook · live numbers</div>
              </div>
            </div>
          </div>
        </section>
      )}

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

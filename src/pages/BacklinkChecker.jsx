import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Nav from '../components/Nav.jsx';
import useScrollReveal from '../hooks/useScrollReveal.js';
import usePageMeta from '../hooks/usePageMeta.js';
import { api } from '../lib/api.js';
import { trackToolUse } from '../lib/track.js';
import { submitToolUsage } from '../lib/hubspot.js';
import './ToolPage.css';

function scoreColor(score) {
  if (score == null) return 'var(--muted)';
  if (score >= 70) return 'var(--success)';
  if (score >= 40) return 'var(--warn)';
  return 'var(--red)';
}

function scoreVerdict(score) {
  if (score == null) return '–';
  if (score >= 80) return 'Strong authority';
  if (score >= 60) return 'Solid';
  if (score >= 40) return 'Building';
  if (score >= 20) return 'Early';
  return 'Fresh domain';
}

const COMPONENT_LABELS = {
  traffic: 'Traffic',
  age: 'Age',
  history: 'History',
  technical: 'Technical',
  content: 'Content',
};

const COMPONENT_DESCRIPTIONS = {
  traffic: 'Tranco rank — traffic-based authority across the global web.',
  age: 'First snapshot in the Wayback Machine. Older domains accumulate trust.',
  history: 'Wayback snapshot count — how often the web has archived this domain.',
  technical: 'HTTPS, HTTP/2, HSTS, CSP, cache-control. Trust signals enterprise buyers screen for.',
  content: 'JSON-LD schema, Open Graph, heading structure, internal link graph.',
};

export default function BacklinkChecker() {
  useScrollReveal();
  usePageMeta({
    title: 'Free Domain Authority Checker · No Ahrefs Key · RankedTag',
    description:
      'Free domain authority checker that does not need an Ahrefs or Moz key. Composite score from Tranco traffic rank, Wayback domain age, on-page schema, and HTTP transport quality. Cross-checkable against the public sources we hit.',
    canonical: 'https://rankedtag.com/backlink-checker',
  });
  const [searchParams] = useSearchParams();
  const [domain, setDomain] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  useEffect(() => {
    const incoming = searchParams.get('url') || searchParams.get('domain');
    if (incoming) setDomain(incoming);
  }, [searchParams]);

  const run = async (e) => {
    e?.preventDefault();
    if (!domain.trim()) return;
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const target = domain.trim();
      const optedInEmail = email.trim();
      // Fire the HubSpot capture in parallel with the actual analysis so the
      // user doesn't wait on it. Swallow errors — we never want a failed
      // capture to block the result.
      if (optedInEmail) {
        submitToolUsage(import.meta.env.VITE_HUBSPOT_AUTHORITY_FORM_ID, {
          email: optedInEmail,
          website: target,
          message: 'Source: Domain Authority Checker',
        }).catch(() => {});
      }
      const res = await api.authority(target);
      setData(res);
      trackToolUse('authority-check', { domain: target });
    } catch (err) {
      setError(err.message || 'Something broke. Try again in a moment.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Nav />

      <section className="tool-hero" style={{paddingBottom: '40px'}}>
        <div className="tool-hero-bg"></div>
        <div className="container tool-hero-inner">
          <div className="eyebrow no-line" style={{justifyContent: 'center', marginBottom: '24px'}}>★ FREE TOOL · OUR OWN ENGINE · CROSS-CHECKABLE</div>
          <h1>
            Domain Authority Checker.<br />
            <span className="ser">Built by us, not Ahrefs.</span><br />
            <span className="accent">100% free, no API key.</span>
          </h1>
          <p>
            We pull free public signals — Tranco traffic rank, Wayback Machine domain age, on-page schema and link structure, real HTTP transport quality — and compute the RankedTag Authority Score with a transparent breakdown. Verify every component yourself with the source links we expose in the result.
          </p>

          <form className="url-form" onSubmit={run} autoComplete="off" style={{maxWidth:'620px', margin:'28px auto 0'}}>
            <span className="url-prefix">https://</span>
            <input
              type="text"
              className="url-input"
              placeholder="yoursaas.com"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              spellCheck={false}
              autoCapitalize="off"
              required
            />
            <button type="submit" className="url-submit" disabled={loading}>
              {loading ? 'Scanning…' : 'Run authority check'} <span>→</span>
            </button>
          </form>

          <div className="tool-email-row" style={{maxWidth:'620px', margin:'12px auto 0'}}>
            <input
              type="email"
              className="tool-email-input"
              placeholder="your@email.com — optional, get the full report DM'd to you"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>

          <p className="fineprint" style={{marginTop:'18px'}}>
            // Same engine that powers our internal SaaS audits. Sources: tranco-list.eu, web.archive.org, your own homepage.
          </p>
        </div>
      </section>

      <div className="kwd-wrap">
        {error && (
          <div style={{background:'rgba(255,59,20,.08)', border:'1px solid rgba(255,59,20,.3)', padding:'18px 22px', borderRadius:'var(--r-md)', color:'var(--red-deep)'}}>
            <strong>Backend error:</strong> {error}
          </div>
        )}

        {loading && (
          <div className="kwd-empty">Pulling traffic rank, archive history, and live homepage signals. 5 to 10 seconds.</div>
        )}

        {data && (
          <>
            <div className="bl-hero-card">
              <div>
                <div className="apply-label">Domain</div>
                <div className="bl-domain">{data.domain}</div>
              </div>
              <div className="bl-score-block">
                <div className="apply-label">{data.scoreLabel}</div>
                <div className="bl-score" style={{color: scoreColor(data.score)}}>
                  {data.score != null ? data.score : '–'}
                </div>
                <div className="fineprint" style={{marginTop:'4px'}}>
                  {scoreVerdict(data.score)}
                </div>
              </div>
              <div className="bl-score-block">
                <div className="apply-label">Tranco rank</div>
                <div className="bl-score" style={{color:'var(--ink)', fontSize:'34px'}}>
                  {data.raw?.trancoRank != null
                    ? `#${Number(data.raw.trancoRank).toLocaleString()}`
                    : '–'}
                </div>
                <div className="fineprint" style={{marginTop:'4px'}}>
                  {data.raw?.firstSeen
                    ? `Seen since ${data.raw.firstSeen}`
                    : 'Domain age unknown'}
                </div>
              </div>
            </div>

            <h3 className="apply-label" style={{marginTop:'36px', marginBottom:'12px'}}>
              Score breakdown · how we got to {data.score}
            </h3>
            <div className="auth-grid">
              {Object.entries(data.components).map(([key, c]) => (
                <div key={key} className="auth-card">
                  <div className="auth-head">
                    <span className="auth-label">{COMPONENT_LABELS[key] || key}</span>
                    <span className="auth-weight">{c.weight}% weight</span>
                  </div>
                  <div className="auth-score" style={{color: scoreColor(c.score)}}>
                    {Math.round(c.score)}<span className="auth-score-max">/100</span>
                  </div>
                  <div className="auth-bar">
                    <div className="auth-bar-fill" style={{width: `${c.score}%`, background: scoreColor(c.score)}} />
                  </div>
                  <div className="auth-desc">{COMPONENT_DESCRIPTIONS[key] || ''}</div>
                  <div className="auth-source">source: {c.source}</div>
                </div>
              ))}
            </div>

            {data.raw?.contentNotes?.jsonLdTypes?.length > 0 && (
              <div className="auth-detail-card">
                <div className="apply-label">Schema.org types we detected</div>
                <div className="auth-tags">
                  {data.raw.contentNotes.jsonLdTypes.map((t) => (
                    <span key={t} className="auth-tag">{t}</span>
                  ))}
                </div>
              </div>
            )}

            {data.raw?.technicalNotes?.length > 0 && (
              <div className="auth-detail-card">
                <div className="apply-label">Technical signals</div>
                <ul className="auth-list">
                  {data.raw.technicalNotes.map((n, i) => (
                    <li key={i}>{n}</li>
                  ))}
                </ul>
              </div>
            )}

            {data._meta?.verifyUrls && (
              <div className="auth-verify">
                <div className="apply-label">Cross-check the inputs yourself</div>
                <div className="auth-verify-row">
                  <a href={data._meta.verifyUrls.tranco} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm">Tranco rank API <span className="ar">↗</span></a>
                  <a href={data._meta.verifyUrls.wayback} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm">Wayback Machine <span className="ar">↗</span></a>
                  <a href={`https://${data.domain}`} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm">View source <span className="ar">↗</span></a>
                </div>
              </div>
            )}

            <div style={{marginTop:'48px', textAlign:'center'}}>
              <p className="fineprint" style={{marginBottom:'18px'}}>
                Want a senior strategist to read this and tell you what to fix? Apply for a founder review, free.
              </p>
              <div style={{display:'flex', gap:'12px', justifyContent:'center', flexWrap:'wrap'}}>
                <a href="/audit" className="btn btn-primary btn-lg">Get a founder review <span className="ar">↗</span></a>
                <a href="/page-speed" className="btn btn-outline btn-lg">Try the page speed checker <span className="ar">↗</span></a>
              </div>
            </div>
          </>
        )}

        {!data && !loading && !error && (
          <div className="kwd-empty">
            Drop a domain above. We will pull traffic rank, archive history, and live homepage signals, then render the breakdown here. Numbers are real and source-linked so you can verify them.
          </div>
        )}
      </div>

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
              <a href="/backlink-checker">Domain Authority</a>
              <a href="/keyword-density">Keyword Density</a>
              <a href="/page-speed">Page Speed</a>
              <a href="/competitor">Competitor Analysis</a>
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

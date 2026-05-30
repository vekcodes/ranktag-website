import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Nav from '../components/Nav.jsx';
import useScrollReveal from '../hooks/useScrollReveal.js';
import usePageMeta from '../hooks/usePageMeta.js';
import { softwareTool, breadcrumb, faqPage, SITE } from '../lib/schema.js';
import PageSpeedGuide, { PS_FAQ } from '../components/seo/PageSpeedGuide';
import { api } from '../lib/api.js';
import { trackToolUse } from '../lib/track.js';
import { submitToolUsage, syntheticEmail } from '../lib/hubspot.js';
import './ToolPage.css';

const PS_URL = `${SITE}/page-speed-checker`;
const PS_JSONLD = [
  softwareTool({
    name: 'RankedTag Page Speed Checker',
    url: PS_URL,
    description:
      'Free page speed checker. We fetch your URL server-side, time the response, parse the HTML and score five real signals: speed, weight, render-blocking resources, image hygiene and transport quality. No Google PSI key required.',
    featureList: [
      'Server-side fetch and response timing',
      'Five-signal scoring (speed, weight, render-blocking, image hygiene, transport)',
      'Ranked fix-first opportunities',
      'Mobile and desktop strategies',
      'Results in under 5 seconds',
      'No Google PSI key required',
    ],
  }),
  breadcrumb([
    { name: 'Home', item: `${SITE}/` },
    { name: 'Page Speed Checker', item: PS_URL },
  ]),
  faqPage(PS_FAQ),
];

const COMPONENT_LABELS = {
  speed: 'TTFB + download',
  size: 'HTML weight',
  renderBlocking: 'Render-blocking',
  imageHygiene: 'Image hygiene',
  transport: 'Transport quality',
};
const COMPONENT_DESCRIPTIONS = {
  speed: 'How long the server took to respond plus how long the HTML took to download. Mirrors the Lighthouse "speed" buckets.',
  size: 'HTML payload size. Lean pages render faster on mobile.',
  renderBlocking: 'Scripts in <head> without async/defer and stylesheets in <head>. Each one delays first paint.',
  imageHygiene: 'Lazy-loading, explicit width/height, alt text. Drives CLS and accessibility.',
  transport: 'HTTPS, HTTP/2 or HTTP/3, compression (gzip/brotli), HSTS, cache-control. Trust + speed signals.',
};

function scoreColor(score) {
  if (score == null) return 'var(--muted)';
  if (score >= 80) return 'var(--success)';
  if (score >= 50) return 'var(--warn)';
  return 'var(--red)';
}
function scoreLabel(score) {
  if (score == null) return '–';
  if (score >= 90) return 'Excellent';
  if (score >= 70) return 'Good';
  if (score >= 50) return 'Needs work';
  return 'Critical';
}

export default function PageSpeed() {
  useScrollReveal();
  usePageMeta({
    title: 'Page Speed Checker — Free Website Speed Test | RankedTag',
    description:
      'Free page speed checker. Test any URL on mobile and desktop, scored on five real signals with a ranked fix-first list in under 5 seconds — plus how to pass Core Web Vitals. No PSI key.',
    canonical: 'https://rankedtag.com/page-speed-checker',
    jsonLd: PS_JSONLD,
  });
  const [searchParams] = useSearchParams();
  const [url, setUrl] = useState('');
  const [strategy, setStrategy] = useState('mobile');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  useEffect(() => {
    const incoming = searchParams.get('url');
    if (incoming) setUrl(incoming);
  }, [searchParams]);

  const run = async (e) => {
    e?.preventDefault();
    if (!url.trim()) return;
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const target = url.trim();
      submitToolUsage(import.meta.env.VITE_HUBSPOT_PAGESPEED_FORM_ID, {
        email: syntheticEmail(target),
        website: target,
        message: `Source: Page Speed Checker · strategy=${strategy}`,
      }).catch(() => {});
      const res = await api.pageSpeed(target, strategy);
      setData(res);
      trackToolUse('page-speed', { url: target, strategy });
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
          <div className="eyebrow no-line" style={{justifyContent: 'center', marginBottom: '24px'}}>★ FREE TOOL · OUR OWN ENGINE · NO PSI KEY</div>
          <h1>
            Page Speed Checker.<br />
            <span className="ser">We built our own</span><br />
            <span className="accent">so you do not need an API key.</span>
          </h1>
          <p>
            We fetch your URL server-side, time the request, parse the HTML, and score it on five real signals: speed, weight, render-blocking, image hygiene, and transport quality. Same checks Lighthouse runs on, computed by us in under 5 seconds. Verify by viewing source on the URL.
          </p>

          <form className="url-form" onSubmit={run} autoComplete="off" style={{maxWidth:'660px', margin:'28px auto 0'}}>
            <span className="url-prefix">https://</span>
            <input
              type="text"
              className="url-input"
              placeholder="yoursaas.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              spellCheck={false}
              autoCapitalize="off"
              required
            />
            <button type="submit" className="url-submit" disabled={loading}>
              {loading ? 'Scanning…' : 'Run scan'} <span>→</span>
            </button>
          </form>

          <div className="ps-strategy">
            <button
              type="button"
              className={`ps-pill ${strategy === 'mobile' ? 'on' : ''}`}
              onClick={() => setStrategy('mobile')}
            >Mobile</button>
            <button
              type="button"
              className={`ps-pill ${strategy === 'desktop' ? 'on' : ''}`}
              onClick={() => setStrategy('desktop')}
            >Desktop</button>
          </div>

          <p className="fineprint" style={{marginTop:'18px'}}>
            Tests load time on mobile and desktop, scores the five signals behind your Core Web Vitals (LCP, INP, CLS), and ranks what to fix first — so your pages rank faster on Google and stay crawlable for AI search.
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
          <div className="kwd-empty">Fetching your URL and parsing the HTML server-side. Usually 2 to 5 seconds.</div>
        )}

        {data && (
          <>
            <div className="bl-hero-card">
              <div>
                <div className="apply-label">URL</div>
                <div className="bl-domain" style={{wordBreak:'break-all'}}>{data.url}</div>
              </div>
              <div className="bl-score-block">
                <div className="apply-label">Performance score</div>
                <div className="bl-score" style={{color: scoreColor(data.scores.performance)}}>
                  {Math.round(data.scores.performance)}
                </div>
                <div className="fineprint" style={{marginTop:'4px'}}>
                  {scoreLabel(data.scores.performance)}
                </div>
              </div>
              <div className="bl-score-block">
                <div className="apply-label">Server response</div>
                <div className="bl-score" style={{color:'var(--ink)', fontSize:'34px'}}>
                  {data.metrics.fetchMs} <span style={{fontSize:'.5em', color:'var(--muted)'}}>ms</span>
                </div>
                <div className="fineprint" style={{marginTop:'4px'}}>
                  {data.metrics.htmlKb} KB · {data.metrics.compression}
                </div>
              </div>
            </div>

            <h3 className="apply-label" style={{marginTop:'36px', marginBottom:'12px'}}>
              Score breakdown · how we got to {Math.round(data.scores.performance)}
            </h3>
            <div className="auth-grid">
              {['speed', 'size', 'renderBlocking', 'imageHygiene', 'transport'].map((key) => (
                <div key={key} className="auth-card">
                  <div className="auth-head">
                    <span className="auth-label">{COMPONENT_LABELS[key]}</span>
                  </div>
                  <div className="auth-score" style={{color: scoreColor(data.scores[key])}}>
                    {Math.round(data.scores[key])}<span className="auth-score-max">/100</span>
                  </div>
                  <div className="auth-bar">
                    <div className="auth-bar-fill" style={{width: `${data.scores[key]}%`, background: scoreColor(data.scores[key])}} />
                  </div>
                  <div className="auth-desc">{COMPONENT_DESCRIPTIONS[key]}</div>
                </div>
              ))}
            </div>

            <div className="auth-detail-card">
              <div className="apply-label">Resource summary</div>
              <div className="ps-resource-grid">
                <div className="ps-res">
                  <div className="ps-res-num">{data.metrics.scripts.total}</div>
                  <div className="ps-res-lbl">Scripts</div>
                  <div className="fineprint">{data.metrics.scripts.renderBlocking} blocking · {data.metrics.scripts.asyncDefer} async/defer</div>
                </div>
                <div className="ps-res">
                  <div className="ps-res-num">{data.metrics.stylesheets.total}</div>
                  <div className="ps-res-lbl">Stylesheets</div>
                  <div className="fineprint">{data.metrics.stylesheets.inHead} in head</div>
                </div>
                <div className="ps-res">
                  <div className="ps-res-num">{data.metrics.images.total}</div>
                  <div className="ps-res-lbl">Images</div>
                  <div className="fineprint">{data.metrics.images.lazy} lazy · {data.metrics.images.withAlt} alt</div>
                </div>
                <div className="ps-res">
                  <div className="ps-res-num">{data.metrics.httpVersion}</div>
                  <div className="ps-res-lbl">Protocol</div>
                  <div className="fineprint">compression: {data.metrics.compression}</div>
                </div>
              </div>
            </div>

            {data.opportunities?.length > 0 && (
              <>
                <h3 className="apply-label" style={{marginTop:'36px', marginBottom:'12px'}}>
                  {data.opportunities.length} fix-first opportunities
                </h3>
                <div className="ps-opps">
                  {data.opportunities.map((o, i) => (
                    <div key={i} className={`ps-opp ${o.severity === 'high' ? 'bad' : o.severity === 'med' ? '' : 'good'}`}>
                      <div className="ps-opp-head">
                        <span className="ps-opp-title">{o.title}</span>
                        <span className={`ps-opp-savings ${o.severity}`}>
                          {o.severity === 'high' ? 'HIGH' : o.severity === 'med' ? 'MED' : 'LOW'}
                        </span>
                      </div>
                      <div className="ps-opp-desc">{o.description}</div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {data.opportunities?.length === 0 && (
              <div className="kwd-empty" style={{marginTop:'24px'}}>
                No major issues flagged — all five signals came back clean. Your page is fast, lean, and well-structured for both Google and AI crawlers.
              </div>
            )}

            <div style={{marginTop:'48px', textAlign:'center'}}>
              <div style={{display:'flex', gap:'12px', justifyContent:'center', flexWrap:'wrap'}}>
                <a href="/audit" className="btn btn-primary btn-lg">Get a founder review <span className="ar">↗</span></a>
                <a href="/domain-authority-checker" className="btn btn-outline btn-lg">Try the domain authority checker <span className="ar">↗</span></a>
              </div>
            </div>
          </>
        )}

        {!data && !loading && !error && (
          <div className="kwd-empty">
            Drop a URL above. We'll fetch it, parse the HTML, and render your performance score, five-signal breakdown, and ranked fix-first list right here.
          </div>
        )}
      </div>

      <PageSpeedGuide />

      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div>
              <a href="/" className="nav-logo" style={{color: 'var(--paper)'}}>
                <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                  <rect className="lg-r1" x="42" y="8" width="50" height="50"/>
                  <rect className="lg-r3" x="10" y="44" width="30" height="30" style={{fill: 'var(--paper)'}}/>
                  <rect className="lg-r2" x="42" y="44" width="30" height="30"/>
                  <rect className="lg-r3" x="42" y="74" width="26" height="26" style={{fill: 'var(--paper)'}}/>
                </svg>
                RankedTag
              </a>
              <p className="footer-blurb">The Inbound Engine for SaaS founders who would rather build product than babysit an agency.</p>
            </div>
            <div className="footer-col">
              <h4>The product</h4>
              <a href="/#how-it-works">How it works</a>
              <a href="/#case-study">Sendr.ai story</a>
              <a href="/#apply">Apply</a>
            </div>
            <div className="footer-col">
              <h4>Free tools</h4>
              <a href="/technical-audit">Technical + Non-tech Audit</a>
              <a href="/domain-authority-checker">Domain Authority</a>
              <a href="/keyword-density-checker">Keyword Density</a>
              <a href="/page-speed-checker">Page Speed</a>
              <a href="/competitor-analysis">Competitor Analysis</a>
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

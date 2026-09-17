import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Nav from '../components/Nav.jsx';
import SiteFooter from '../components/SiteFooter.jsx';
import useScrollReveal from '../hooks/useScrollReveal.js';
import usePageMeta from '../hooks/usePageMeta.js';
import { softwareTool, breadcrumb, faqPage, SITE } from '../lib/schema.js';
import { TOOL_META } from '../seo/routeMeta.js';
import JsonLd from '../components/JsonLd.jsx';
import DomainAuthorityGuide, { DA_FAQ } from '../components/seo/DomainAuthorityGuide';
import { api } from '../lib/api.js';
import { trackToolUse } from '../lib/track.js';
import { submitToolUsage, syntheticEmail } from '../lib/hubspot.js';
import './ToolPage.css';

const DA_URL = `${SITE}/domain-authority-checker`;
const DA_JSONLD = [
  softwareTool({
    name: 'RankedTag Domain Authority Checker',
    url: DA_URL,
    description:
      'Free domain authority checker that needs no Ahrefs or Moz key. Composite score from Tranco traffic rank, Wayback domain age, on-page schema and HTTP transport quality — every input cross-checkable against its public source.',
    featureList: [
      'Composite domain authority score',
      'Tranco traffic-rank signal',
      'Wayback Machine domain age',
      'On-page schema and Open Graph audit',
      'HTTP transport-quality checks',
      'No Ahrefs or Moz API key required',
    ],
  }),
  breadcrumb([
    { name: 'Home', item: `${SITE}/` },
    { name: 'Domain Authority Checker', item: DA_URL },
  ]),
  faqPage(DA_FAQ),
];

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
  usePageMeta(TOOL_META['/domain-authority-checker']);
  const [searchParams] = useSearchParams();
  const [domain, setDomain] = useState('');
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
      // Fire-and-forget HubSpot form submission, scoped to the Authority form.
      // Email is auto-derived from the submitted domain so HubSpot accepts it
      // and dedupes by domain across multiple runs.
      submitToolUsage(import.meta.env.VITE_HUBSPOT_AUTHORITY_FORM_ID, {
        email: syntheticEmail(target),
        website: target,
        message: 'Source: Domain Authority Checker',
      }).catch(() => {});
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
      <JsonLd data={DA_JSONLD} />
      <Nav />

      <section className="tool-hero">
        <div className="tool-hero-bg"></div>
        <div className="container tool-hero-inner">
          <span className="eyebrow bracket tool-eyebrow">★ FREE TOOL · OUR OWN ENGINE · CROSS-CHECKABLE</span>
          <h1>
            Domain Authority Checker.<br />
            <span className="ser">Built by us, not Ahrefs.</span><br />
            <span className="accent">100% free, no API key.</span>
          </h1>
          <p>
            We pull free public signals — Tranco traffic rank, Wayback Machine domain age, on-page schema and link structure, real HTTP transport quality — and compute the RankedTag Authority Score with a transparent breakdown. Verify every component yourself with the source links we expose in the result.
          </p>

          <form className="url-form" onSubmit={run} autoComplete="off" >
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

          <p className="fineprint tool-trust-row">
            Every score is source-linked, so you can verify each input yourself — no API key, no login, no black box.
          </p>
        </div>
      </section>

      <div className="kwd-wrap">
        {error && (
          <div className="tool-error">
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
                <div className="fineprint mt-1">
                  {scoreVerdict(data.score)}
                </div>
              </div>
              <div className="bl-score-block">
                <div className="apply-label">Tranco rank</div>
                <div className="bl-score score-num score-num-sm">
                  {data.raw?.trancoRank != null
                    ? `#${Number(data.raw.trancoRank).toLocaleString()}`
                    : '–'}
                </div>
                <div className="fineprint mt-1">
                  {data.raw?.firstSeen
                    ? `Seen since ${data.raw.firstSeen}`
                    : 'Domain age unknown'}
                </div>
              </div>
            </div>

            <h3 className="apply-label report-sec-head">
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

            <div className="report-foot">
              <p className="fineprint mb-5">
                Want a senior strategist to read this and tell you what to fix? Apply for a founder review, free.
              </p>
              <div className="report-foot-btns">
                <a href="/audit" className="btn btn-primary btn-lg">Get a founder review <span className="ar">↗</span></a>
                <a href="/page-speed-checker" className="btn btn-outline btn-lg">Try the page speed checker <span className="ar">↗</span></a>
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

      <DomainAuthorityGuide />

      <SiteFooter />
    </>
  );
}

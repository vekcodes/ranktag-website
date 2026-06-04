import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Nav from '../components/Nav.jsx';
import usePageMeta from '../hooks/usePageMeta.js';
import JsonLd from '../components/JsonLd.jsx';
import { breadcrumb } from '../lib/schema.js';
import { TOOL_META } from '../seo/routeMeta.js';
import { submitApplyForm } from '../lib/hubspot.js';
import './Home.css';

// Dedicated /apply page (formerly the homepage #apply section). Pre-rendered to
// static HTML; the form submits client-side to HubSpot.
const APPLY_JSONLD = [
  {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': 'https://rankedtag.com/apply#webpage',
    url: 'https://rankedtag.com/apply',
    name: 'Apply for a Founder Review | RankedTag',
    description:
      'Apply for a free founder-reviewed SEO, AI SEO and GEO audit of your B2B SaaS. Four founders a month; a real reply on LinkedIn within 48 hours.',
    isPartOf: { '@id': 'https://rankedtag.com/#website' },
    about: { '@id': 'https://rankedtag.com/#org' },
    inLanguage: 'en',
  },
  breadcrumb([
    { name: 'Home', item: 'https://rankedtag.com/' },
    { name: 'Apply', item: 'https://rankedtag.com/apply' },
  ]),
];

function normalizeUrl(raw) {
  const v = (raw || '').trim();
  if (!v) return '';
  if (/^https?:\/\//i.test(v)) return v;
  return `https://${v}`;
}

export default function Apply() {
  usePageMeta(TOOL_META['/apply']);
  const [searchParams] = useSearchParams();
  const [website, setWebsite] = useState('');
  const [applyState, setApplyState] = useState({ status: 'idle', error: '' });
  const submitted = applyState.status === 'success';

  // Pre-fill the website from ?url= (hero/tool hand-off) after mount. Done in an
  // effect — not the initial state — so the server-rendered HTML (always empty)
  // and the first client render match, avoiding a hydration mismatch.
  useEffect(() => {
    const incoming = searchParams.get('url') || searchParams.get('website');
    if (incoming) setWebsite(normalizeUrl(incoming));
  }, [searchParams]);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (applyState.status === 'submitting') return;
    const fd = new FormData(e.currentTarget);
    setApplyState({ status: 'submitting', error: '' });
    try {
      await submitApplyForm({
        name: fd.get('name'),
        email: fd.get('email'),
        website: fd.get('website'),
        linkedin: fd.get('linkedin'),
        message: fd.get('message'),
      });
      setApplyState({ status: 'success', error: '' });
    } catch (err) {
      setApplyState({ status: 'error', error: err.message || 'Submission failed' });
    }
  };

  return (
    <>
      <JsonLd data={APPLY_JSONLD} />
      <Nav variant="audit" />

      <main className="apply-page">
        <div className="container">
          <div className="apply-page-head">
            <div
              className="eyebrow"
              style={{ justifyContent: 'center', color: 'var(--red)' }}
            >
              APPLY · founder-reviewed, not auto-routed
            </div>
            <h1 className="apply-page-h">
              Tell us about your SaaS.
              <br />
              <span className="ser">We read every one.</span>
            </h1>
            <p className="apply-page-sub">
              We take 4 SaaS founders a month. That is it. Drop your details below. The
              founder reads every application personally and replies on LinkedIn within
              48 hours, even if it is a no.
            </p>
          </div>

          <div className={`apply-card${submitted ? ' submitted' : ''}`}>
            <form className="apply-form" onSubmit={onSubmit} noValidate>
              <div className="apply-row">
                <label className="apply-field">
                  <span className="apply-label">Your name</span>
                  <input type="text" name="name" required placeholder="Alex Singh" />
                </label>
                <label className="apply-field">
                  <span className="apply-label">Work email</span>
                  <input type="email" name="email" required placeholder="alex@yoursaas.com" />
                </label>
              </div>
              <div className="apply-row">
                <label className="apply-field">
                  <span className="apply-label">SaaS website</span>
                  <input
                    type="text"
                    name="website"
                    required
                    placeholder="https://yoursaas.com"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                  />
                </label>
                <label className="apply-field">
                  <span className="apply-label">LinkedIn (so we can DM you)</span>
                  <input type="text" name="linkedin" required placeholder="linkedin.com/in/yourname" />
                </label>
              </div>
              <label className="apply-field">
                <span className="apply-label">What stage is your SaaS at? Who is it for?</span>
                <textarea
                  name="message"
                  rows={3}
                  placeholder="e.g. Seed-stage. We sell cold-outreach software to RevOps leaders at 50-200 person SaaS companies."
                ></textarea>
              </label>
              {applyState.status === 'error' && (
                <div className="apply-error" role="alert">
                  {applyState.error}
                </div>
              )}
              <div className="apply-foot">
                <button
                  type="submit"
                  className="btn btn-red btn-lg"
                  disabled={applyState.status === 'submitting'}
                >
                  {applyState.status === 'submitting' ? 'Sending…' : <>Send application <span className="ar">↗</span></>}
                </button>
                <p className="fineprint" style={{ color: 'rgba(244,239,231,.55)' }}>
                  Reviewed by the founder. Reply on LinkedIn within 48 hours. We never sell, share, or spam your info.
                </p>
              </div>
            </form>

            <div className="apply-success">
              <div className="apply-success-mark">✓</div>
              <h3>Application received.</h3>
              <p>
                The founder will personally review your domain, run a quick competitive scan, and DM you on LinkedIn inside 48 hours. Even if we are not the right fit, you will hear back with what we would do.
              </p>
              <p className="fineprint" style={{ color: 'rgba(244,239,231,.5)', marginTop: '10px' }}>
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

          <div className="apply-page-back">
            <Link to="/">← Back to homepage</Link>
          </div>
        </div>
      </main>
    </>
  );
}

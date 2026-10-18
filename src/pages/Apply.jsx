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
      'Apply for a free founder-reviewed SEO, AI SEO and GEO audit of your site. Four founders a month; a real reply on LinkedIn within 48 hours.',
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
        <div className="container grid12 apply-page-grid">
          <div className="apply-page-head">
            <span className="eyebrow bracket apply-page-eyebrow">APPLY · founder-reviewed, not auto-routed</span>
            <h1 className="apply-page-h">
              Tell us about your business.
              <br />
              <span className="ser">We read every one.</span>
            </h1>
            <p className="apply-page-sub">
              We take four founders a month. That is it. Drop your details below. The
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
                  <input type="email" name="email" required placeholder="alex@yourdomain.com" />
                </label>
              </div>
              <div className="apply-row">
                <label className="apply-field">
                  <span className="apply-label">Website</span>
                  <input
                    type="text"
                    name="website"
                    required
                    placeholder="https://yourdomain.com"
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
                <span className="apply-label">What stage are you at? Who do you sell to?</span>
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
                <p className="fineprint">
                  Reviewed by the founder. Reply on LinkedIn within 48 hours. We never sell, share, or spam your info.
                </p>
              </div>
            </form>

            <div className="apply-success">
              <div className="apply-success-mark">✓</div>
              <h2>Application received.</h2>
              <p>
                The founder will personally review your domain, run a quick competitive scan, and DM you on LinkedIn inside 48 hours. Even if we are not the right fit, you will hear back with what we would do.
              </p>
              <p className="fineprint mt-3">
                If you do not see a DM by then, ping us at hello@rankedtag.com.
              </p>
            </div>
          </div>

          <div className="apply-bullets">
            <div className="apply-bullet">
              <div className="apply-bullet-num">01</div>
              <h3>Reviewed by a human</h3>
              <p>Not a chatbot. Not an SDR. The founder reads every application and runs a real scan of your domain.</p>
            </div>
            <div className="apply-bullet">
              <div className="apply-bullet-num">02</div>
              <h3>Reply on LinkedIn in 48h</h3>
              <p>You get a real reply on LinkedIn. With a real opinion. Even if it is a no, it will be useful.</p>
            </div>
            <div className="apply-bullet">
              <div className="apply-bullet-num">03</div>
              <h3>Only four a month</h3>
              <p>Senior strategists do not scale like ad spend. When the slots are full, you wait until next month.</p>
            </div>
          </div>

          {/* What the review actually covers. This was a 219-word page, which
              is thin by any standard and especially odd on the page where
              someone decides whether to trust us. It is also the information a
              buyer wants before filling in a form, so it earns its place. */}
          <section className="apply-detail">
            <h2>What the review actually covers</h2>
            <p>
              The founder works through the domain personally against a 52-point checklist, in seven
              layers. It is not generated by a tool and it is not a PDF: you get a verdict, with the
              findings ranked by what would move something rather than by what was easiest to spot.
            </p>
            <ul>
              <li>
                <strong>Crawlability and indexation.</strong> Whether your pages can be reached and are
                actually indexed, how much crawl activity goes to pages that matter, and whether anything
                is blocking the AI crawlers, most of which do not execute JavaScript.
              </li>
              <li>
                <strong>Architecture and internal links.</strong> Which of your pages are competing with
                each other for the same intent, and where authority is being spread evenly instead of
                concentrated on the pages that convert.
              </li>
              <li>
                <strong>Core Web Vitals and templates.</strong> Measured at the template level, because a
                problem in a template is a problem on every page that uses it.
              </li>
              <li>
                <strong>Structured data.</strong> Whether your schema is valid, whether it still agrees
                with what the page says, and whether it has quietly gone stale since launch.
              </li>
              <li>
                <strong>Content and intent.</strong> Whether you rank for queries people buy from, and
                whether the pages that should convert are the ones getting the traffic.
              </li>
              <li>
                <strong>AI search visibility.</strong> Whether assistants name you for your category's
                buying questions, and if not, which of the usual causes applies.
              </li>
              <li>
                <strong>Conversion path.</strong> What happens after someone lands, and whether enquiries
                reach a system your team actually works in.
              </li>
            </ul>

            <h2>What we need from you</h2>
            <p>
              A domain is enough to start. The review gets considerably more useful with read access to
              Search Console, because impressions and clicks separate in a way that reveals whether AI
              answers are taking your traffic. If you would rather not share that before a conversation,
              say so in the form and we will work from what is public.
            </p>
            <p>
              For a local or service-area business, add your business name and the area you cover. For a
              catalogue, a rough product count and the filters your category pages use. For a clinic or a
              practice, the number of providers and locations. These are the facts that change the answer
              most, and supplying them up front saves a round trip.
            </p>

            <h2>What happens if the answer is no</h2>
            <p>
              You still get the review. We turn down more applications than we accept, and the common
              reasons are honest ones: there is no search demand in the category yet, the budget is better
              spent on paid acquisition this quarter, the work needed is development rather than SEO, or
              we simply do not have a slot. In each case we say which, and where possible we point you at
              someone better suited, including the competitors on{' '}
              <Link to="/best">our own agency shortlists</Link>.
            </p>
            <p>
              We do not publish a rate card. The honest figure depends on what the review finds, and a
              range wide enough to cover every case would tell you nothing. If pricing transparency matters
              to you, several agencies we have reviewed do publish theirs, and we have collected those
              figures on <Link to="/seo-pricing">the SEO pricing page</Link>.
            </p>
          </section>

          <div className="apply-page-back">
            <Link to="/">← Back to homepage</Link>
          </div>
        </div>
      </main>
    </>
  );
}

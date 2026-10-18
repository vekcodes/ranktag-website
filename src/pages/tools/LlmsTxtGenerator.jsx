import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Nav from '../../components/Nav.jsx';
import SiteFooter from '../../components/SiteFooter.jsx';
import useScrollReveal from '../../hooks/useScrollReveal.js';
import usePageMeta from '../../hooks/usePageMeta.js';
import JsonLd from '../../components/JsonLd.jsx';
import { softwareTool, breadcrumb, faqPage, SITE } from '../../lib/schema.js';
import { TOOL_META } from '../../seo/routeMeta.js';
import '../ToolPage.css';
import '../../components/seo/toolGuide.css';
import './tools.css';

// llms.txt is a proposed convention, not a standard anyone is obliged to
// honour, and this page says so rather than implying otherwise. The file is
// cheap to produce and occasionally read; the writing discipline it forces is
// the part with reliable value.
const lines = (v) => (v || '').split('\n').map((x) => x.trim()).filter(Boolean);

function parseLink(row) {
  // "Label | https://example.com/page | optional note"
  const [label, url, note] = row.split('|').map((x) => (x || '').trim());
  if (!label || !url) return null;
  return note ? `- [${label}](${url}): ${note}` : `- [${label}](${url})`;
}

const FAQ = [
  [
    'What is llms.txt?',
    'A proposed convention for a Markdown file at the root of a site that summarises what the site is and points to its most useful pages, intended to be read by large language models. It is modelled loosely on robots.txt in placement, but it grants nothing and blocks nothing. It is a summary, not a permission system.',
  ],
  [
    'Do AI models actually read llms.txt?',
    'Some tools and crawlers look for it; there is no guarantee any particular assistant does, and no major engine has committed to honouring it. Treat it as low-cost and speculative rather than as a mechanism. If someone tells you an llms.txt file is how you get cited by ChatGPT, they are overselling a convention that no engine has promised to use.',
  ],
  [
    'Is llms.txt required for AI search visibility?',
    'No. Google states plainly that there are no additional requirements to appear in AI Overviews or AI Mode and no special optimisations necessary, which includes machine-readable files. What actually decides whether you can be cited is whether your content is crawlable, server-rendered, credible and quotable.',
  ],
  [
    'Where does the file go?',
    'At the root of your domain, served as plain text or Markdown at /llms.txt. On most hosts that means dropping it in your public or static directory. It needs no configuration, no header and no registration anywhere.',
  ],
  [
    'Does llms.txt control whether AI companies can train on my content?',
    'No, and this is the most important misunderstanding about it. It expresses nothing about permission. If you want to allow or disallow AI crawlers, that is done in robots.txt with the relevant user agents, and enforcement still depends on the crawler choosing to respect it. An llms.txt file is a summary for whoever reads it.',
  ],
  [
    'What should go in it?',
    'A one-line description of what you do, a short paragraph of context, and a curated set of links to the pages that genuinely explain you, each with a sentence saying why it matters. Curation is the point. A file listing every URL on the site is a sitemap with worse formatting and gives a reader nothing to prioritise.',
  ],
  [
    'How often should I update it?',
    'Whenever the things it describes change, which for most sites is a few times a year. A stale llms.txt is worse than none, because it confidently describes a version of your business that no longer exists, and anything reading it has no way to know that.',
  ],
  [
    'Is this worth doing at all?',
    'For most sites, yes, on a cost basis: it takes twenty minutes and does no harm. The secondary benefit is more reliable than the primary one. Writing a tight description of what you do, who you serve and which pages matter is a genuinely clarifying exercise, and it usually reveals that your homepage does not say any of it clearly.',
  ],
];

const PAGE_URL = `${SITE}/llms-txt-generator`;
const JSONLD = [
  softwareTool({
    name: 'RankedTag llms.txt Generator',
    url: PAGE_URL,
    description:
      'Free llms.txt generator. Build a Markdown summary of your site for large language models, with curated links and context. Runs entirely in your browser.',
    featureList: [
      'Produces a valid Markdown llms.txt file',
      'Curated link sections with per-link context',
      'Copy or download the file',
      'No sign-up, no API key',
      'Runs entirely client-side — nothing is sent anywhere',
    ],
  }),
  breadcrumb([
    { name: 'Home', item: `${SITE}/` },
    { name: 'llms.txt Generator', item: PAGE_URL },
  ]),
  faqPage(FAQ),
];

export default function LlmsTxtGenerator() {
  useScrollReveal();
  usePageMeta(TOOL_META['/llms-txt-generator']);

  useEffect(() => {
    const handler = (ev) => {
      const q = ev.target.closest('.faq-q');
      if (!q) return;
      const item = q.parentElement;
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item').forEach((i) => {
        i.classList.remove('open');
        i.querySelector('.faq-q')?.setAttribute('aria-expanded', 'false');
      });
      if (!isOpen) {
        item.classList.add('open');
        q.setAttribute('aria-expanded', 'true');
      }
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  const [f, setF] = useState({
    name: '',
    summary: '',
    context: '',
    core: '',
    secondary: '',
    secondaryLabel: 'Guides',
    optional: '',
    contact: '',
  });
  const [status, setStatus] = useState('');
  const set = (k, v) => setF((s) => ({ ...s, [k]: v }));

  const out = useMemo(() => {
    const parts = [];
    parts.push(`# ${f.name || 'Your organisation'}`);
    if (f.summary) parts.push(`\n> ${f.summary}`);
    if (f.context) parts.push(`\n${f.context}`);

    const core = lines(f.core).map(parseLink).filter(Boolean);
    if (core.length) parts.push(`\n## Core pages\n\n${core.join('\n')}`);

    const second = lines(f.secondary).map(parseLink).filter(Boolean);
    if (second.length) {
      parts.push(`\n## ${f.secondaryLabel || 'Guides'}\n\n${second.join('\n')}`);
    }

    const opt = lines(f.optional).map(parseLink).filter(Boolean);
    if (opt.length) {
      parts.push(
        `\n## Optional\n\n${opt.join('\n')}`
      );
    }

    if (f.contact) parts.push(`\n## Contact\n\n${f.contact}`);
    parts.push(`\n---\n\nLast updated: ${new Date().toISOString().slice(0, 10)}`);
    return parts.join('\n');
  }, [f]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(out);
      setStatus('Copied. Save it as llms.txt at the root of your domain.');
    } catch {
      setStatus('Copying was blocked. Select the text and copy it manually.');
    }
  };

  const download = () => {
    const blob = new Blob([out], { type: 'text/markdown' });
    const a = document.createElement('a');
    a.href = window.URL.createObjectURL(blob);
    a.download = 'llms.txt';
    a.click();
    setStatus('Downloaded. It belongs at the root of your domain, at /llms.txt.');
  };

  const FIELDS = [
    ['name', 'Organisation name', 'text', 'Example Ltd'],
    ['summary', 'One-line summary', 'textarea', 'What you do, in a single sentence a model could quote.'],
    ['context', 'Context paragraph', 'textarea', 'Two or three sentences: who you serve, what makes the approach specific, any proof worth knowing.'],
    ['core', 'Core pages', 'textarea', 'Homepage | https://example.com/ | What the company does\nPricing | https://example.com/pricing | How it is priced'],
    ['secondaryLabel', 'Second section heading', 'text', 'Guides'],
    ['secondary', 'Second section links', 'textarea', 'Getting started | https://example.com/guide | Step-by-step setup'],
    ['optional', 'Optional links', 'textarea', 'Changelog | https://example.com/changelog | Release history'],
    ['contact', 'Contact line', 'text', 'hello@example.com'],
  ];

  return (
    <>
      <JsonLd data={JSONLD} />
      <Nav variant="tech" />

      <main>
        <section className="tool-hero">
          <div className="tool-hero-bg" />
          <div className="container tool-hero-inner">
            <span className="eyebrow bracket tool-eyebrow">★ FREE TOOL · RUNS IN YOUR BROWSER</span>
            <h1>
              llms.txt Generator.<br />
              <span className="ser">Useful, cheap,</span><br />
              <span className="accent">and not a ranking mechanism.</span>
            </h1>
            <p>
              Build the Markdown summary of your site that some AI tools look for at /llms.txt. It takes
              twenty minutes and does no harm. It is also not how you get cited, and this page explains what
              actually is. Nothing you type is sent anywhere.
            </p>
          </div>
        </section>

        <section className="ct-section">
          <div className="container">
            <div className="ct-grid">
              <div className="ct-panel">
                <h2 className="ct-panel-h">Your details</h2>
                {FIELDS.map(([key, label, kind, placeholder]) => (
                  <div className="ct-field" key={key}>
                    <label className="ct-label" htmlFor={`lt-${key}`}>{label}</label>
                    {kind === 'textarea' ? (
                      <textarea
                        id={`lt-${key}`}
                        className="ct-textarea"
                        placeholder={placeholder}
                        value={f[key]}
                        onChange={(e) => set(key, e.target.value)}
                      />
                    ) : (
                      <input
                        id={`lt-${key}`}
                        className="ct-input"
                        placeholder={placeholder}
                        value={f[key]}
                        onChange={(e) => set(key, e.target.value)}
                      />
                    )}
                    {key === 'core' && (
                      <span className="ct-hint">
                        One link per line: label, then URL, then an optional note, separated by a pipe
                        character. The note is the part that earns its place.
                      </span>
                    )}
                  </div>
                ))}
              </div>

              <div className="ct-output">
                <div className="ct-output-head">
                  <span className="ct-panel-h" style={{ margin: 0 }}>llms.txt</span>
                  <span className="ct-row">
                    <button type="button" className="ct-btn ct-btn-primary" onClick={copy}>Copy</button>
                    <button type="button" className="ct-btn" onClick={download}>Download</button>
                  </span>
                </div>
                <pre className="ct-code" aria-label="Generated llms.txt"><code>{out}</code></pre>
                <p className="ct-status" role="status" style={{ padding: '0 var(--s-5) var(--s-4)' }}>
                  {status}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="svc-prose ruled" data-reveal>
          <div className="container">
            <article className="dg-article">
              <section className="dg-section">
                <h2 id="what-it-is">What llms.txt is, stated plainly</h2>
                <p>
                  It is a proposed convention: a Markdown file at the root of your domain that summarises
                  what your site is and points to the pages that best explain it, written for large language
                  models rather than for people. The placement echoes robots.txt, which is where most of the
                  confusion starts, because the two files do entirely different jobs.
                </p>
                <p>
                  robots.txt expresses permission. llms.txt expresses nothing at all about permission. It
                  grants no access, blocks no crawler, and carries no obligation on anyone reading it. It is
                  a summary document, and the only thing it can do is be useful to something that chooses to
                  read it.
                </p>
                <p>
                  Whether anything does read it is genuinely unsettled. Some tools and crawlers look for it.
                  No major engine has committed to honouring it, and none has published that it influences
                  anything. Anyone telling you an llms.txt file is how you get cited by an assistant is
                  overselling a convention that no engine has promised to use.
                </p>
              </section>

              <section className="dg-section">
                <h2 id="why-bother">So why produce one</h2>
                <p>
                  Two reasons, and the second is the better one. The first is cost: twenty minutes of work,
                  no maintenance burden if your business is stable, no downside. On that basis alone it is a
                  reasonable bet on a convention that may become more widely read.
                </p>
                <p>
                  The second is the exercise itself. Writing a single sentence that says what your
                  organisation does, a short paragraph of genuine context, and a curated list of the ten or
                  so pages that actually explain you is clarifying in a way that is hard to fake. Most teams
                  that do it discover their homepage does not say any of it plainly, which is a more
                  valuable finding than the file.
                </p>
                <p>
                  Curation is the whole discipline. A file listing every URL on the site is a sitemap in
                  worse formatting. The value is in choosing twelve pages over four hundred and saying, in a
                  sentence each, why those twelve are the ones that matter.
                </p>
              </section>

              <section className="dg-section">
                <h2 id="what-actually-works">What actually determines whether you get cited</h2>
                <p>
                  Since this page exists to be honest rather than to sell a file, the short version is worth
                  stating. Google says there are no additional requirements to appear in its AI features and
                  no special optimisations necessary. The things that decide whether an assistant can use
                  your content are considerably more boring than a new file format.
                </p>
                <p>
                  <strong>Can it be fetched.</strong> Most AI crawlers do not execute JavaScript, so a
                  client-rendered site can be invisible to them while Googlebot copes fine. Server-rendered
                  content is closer to a prerequisite here than it is for ranking.
                </p>
                <p>
                  <strong>Can it be resolved.</strong> A model works out who you are from facts that agree
                  with each other across your site, your profiles and third-party sources. Inconsistency is
                  the problem, not absence of a summary file.
                </p>
                <p>
                  <strong>Can it be quoted.</strong> Research presented at ACM SIGKDD in 2024 tested nine
                  content strategies and found that adding quotations, citing sources and including relevant
                  statistics were the strongest levers, while keyword stuffing performed worse than making
                  no changes at all. That is a content discipline, not a configuration step.
                </p>
                <p>
                  The fuller argument, with the numbers, is in{' '}
                  <Link to="/seo-vs-geo">SEO vs GEO</Link>. If you want the version about what changes in a
                  working week, it is in{' '}
                  <Link to="/ai-seo-vs-traditional-seo">AI SEO vs traditional SEO</Link>.
                </p>
              </section>

              <section className="dg-section">
                <h2 id="writing-it">Writing one worth reading</h2>
                <p>
                  <strong>Lead with a quotable sentence.</strong> The summary line should be the sentence you
                  would want a model to repeat when someone asks what your company does. Write it as a
                  statement of fact, not a tagline. Taglines do not survive paraphrase.
                </p>
                <p>
                  <strong>Give each link a reason.</strong> A bare list of URLs tells a reader nothing about
                  priority. One clause per link, explaining what is on the page and why it matters, is what
                  turns a list into a map.
                </p>
                <p>
                  <strong>Say what you are not.</strong> If your brand name collides with another company,
                  or you are frequently confused with an adjacent category, say so explicitly. Disambiguation
                  is one of the few things a file like this is genuinely well suited to, and it is the part
                  most people leave out.
                </p>
                <p>
                  <strong>Date it, and keep it true.</strong> A stale summary confidently describes a company
                  that no longer exists, and nothing reading it can tell. If you cannot commit to revisiting
                  it when things change, the honest choice is not to publish one.
                </p>
                <p>
                  Ours is at <a href="/llms.txt" className="link-wipe">/llms.txt</a> if you want to see one in
                  the wild, alongside a longer machine-readable facts page at{' '}
                  <a href="/llm-info" className="link-wipe">/llm-info</a>.
                </p>
              </section>
            </article>
          </div>
        </section>

        <section className="faq-section ruled" data-reveal>
          <div className="container grid12">
            <div className="col-4 faq-aside">
              <span className="eyebrow" data-num="001">FAQ</span>
              <h2 className="h-2 faq-h">llms.txt, asked and answered.</h2>
              <div className="faq-side">
                <h3>Want to know if AI search can actually read you?</h3>
                <p>
                  Send the domain. The founder checks whether your pages are reachable and quotable by AI
                  crawlers at all, which matters considerably more than this file, and replies within 48
                  hours.
                </p>
                <Link to="/apply" className="btn btn-red w-full ar-parent">
                  Apply for review <span className="ar-ne">↗</span>
                </Link>
              </div>
            </div>
            <div className="col-7 start-6 faq-list">
              {FAQ.map(([q, a], i) => (
                <div className="faq-item" key={q}>
                  <h3 className="faq-h3">
                    <button type="button" className="faq-q" aria-expanded="false">
                      <span className="faq-n" aria-hidden="true">{String(i + 1).padStart(3, '0')}</span>
                      <span className="faq-qt">{q}</span>
                      <span className="faq-ic" aria-hidden="true">+</span>
                    </button>
                  </h3>
                  <div className="faq-a"><div className="faq-a-inner">{a}</div></div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}

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

// Google truncates by pixel width, not character count, which is why
// character-count advice is unreliable: "Illuminating Illuminating" and
// "mmmmmmmmmmmmmmmmmmmmmmmmm" are the same length and nothing like the same
// width. We approximate width with a per-character table measured from Arial,
// the family Google renders results in. It is an estimate and the page says
// so — the point is to be closer than counting characters.
const NARROW = "iIl1.,:;'|!jft[]()";
const WIDE = 'mwMW@%';
const UPPER = /[A-Z]/;

function px(text, size) {
  let w = 0;
  for (const ch of text) {
    let factor = 0.5;
    if (NARROW.includes(ch)) factor = 0.28;
    else if (WIDE.includes(ch)) factor = 0.85;
    else if (ch === ' ') factor = 0.27;
    else if (UPPER.test(ch)) factor = 0.66;
    w += factor * size;
  }
  return Math.round(w);
}

function truncate(text, size, limit) {
  if (px(text, size) <= limit) return { text, cut: false };
  let out = '';
  for (const ch of text) {
    if (px(out + ch + '…', size) > limit) break;
    out += ch;
  }
  return { text: out.trimEnd() + '…', cut: true };
}

// Google's rendered widths differ between desktop and mobile results.
const VIEWS = {
  desktop: { titleSize: 20, titleLimit: 580, descSize: 14, descLimit: 1840, label: 'Desktop' },
  mobile: { titleSize: 17, titleLimit: 460, descSize: 14, descLimit: 1600, label: 'Mobile' },
};

const FAQ = [
  [
    'How long should a title tag be?',
    'Think in pixels rather than characters. Google truncates titles at roughly 580 pixels on desktop and less on mobile, and pixel width varies enormously by character: a title full of capitals and wide letters truncates far earlier than one of the same character count in lowercase. Around 50 to 60 characters is a useful rule of thumb, but the preview above is more reliable than the rule.',
  ],
  [
    'How long should a meta description be?',
    'Roughly 140 to 160 characters is the working range, and again the real limit is width. Google frequently rewrites descriptions anyway, often pulling a passage from the page that matches the query better. A good description is still worth writing, because when it is used it is doing the job of an ad you did not pay for.',
  ],
  [
    'Does the meta description affect rankings?',
    'Not directly. Google has said for many years that it is not a ranking factor. It affects click-through rate, which is the reason to care about it. A description that answers the implied question and sets an accurate expectation earns clicks that a keyword-stuffed one does not, and it reduces the immediate return to the results page that follows a mismatch.',
  ],
  [
    'Why does Google show a different title to the one I wrote?',
    'Because it decides the title it shows, and it will override yours when it judges another option more useful for the query, often using an H1 or a prominent heading. The usual causes are titles that are too long, stuffed with keywords, repeated across many pages, or that do not describe the page accurately. Writing a concise, specific, unique title reduces the chance of being rewritten.',
  ],
  [
    'Should every page have a unique title and description?',
    'Yes, and duplicate titles are one of the more common site-wide problems we find. Identical titles across many pages make it harder for search engines to tell those pages apart and increase the chance of being overridden. On a large catalogue or a multi-location site, templates are fine, provided the variables genuinely differentiate the result.',
  ],
  [
    'Do titles and descriptions matter for AI search?',
    'Less directly than they do for a results page, because an assistant answer does not display them. They still matter indirectly: a clear, accurate title helps a model understand what a page is about, and the same discipline that produces a good title, saying what the page actually is in few words, produces content that is easier to quote.',
  ],
  [
    'Is this preview exactly what Google will show?',
    'No, and nothing can be. It estimates pixel width using a character-width table based on the font family Google renders results in, which gets close but is not the real renderer. Google also adds or removes elements per query, including dates, sitelinks and favicons, and rewrites titles and descriptions when it chooses. Treat it as a good approximation, not a guarantee.',
  ],
  [
    'Does my URL affect how the result looks?',
    'Yes, because Google shows a breadcrumb-style path rather than the raw URL. Short, readable, logically nested paths display better than long parameter strings, and a clear path communicates structure before anyone reads the title. It is a small effect on its own and a visible one in a crowded set of results.',
  ],
];

const PAGE_URL = `${SITE}/serp-preview-tool`;
const JSONLD = [
  softwareTool({
    name: 'RankedTag SERP Preview Tool',
    url: PAGE_URL,
    description:
      'Free SERP preview tool. See how a title tag, meta description and URL render in Google results on desktop and mobile, with pixel-width truncation estimated rather than character counts. Runs entirely in your browser.',
    featureList: [
      'Desktop and mobile result previews',
      'Pixel-width truncation estimate, not a character count',
      'Live character and width counters',
      'No sign-up, no API key',
      'Runs entirely client-side — nothing is sent anywhere',
    ],
  }),
  breadcrumb([
    { name: 'Home', item: `${SITE}/` },
    { name: 'SERP Preview Tool', item: PAGE_URL },
  ]),
  faqPage(FAQ),
];

export default function SerpPreview() {
  useScrollReveal();
  usePageMeta(TOOL_META['/serp-preview-tool']);

  // Same delegated FAQ accordion the rest of the site uses.
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

  const [view, setView] = useState('desktop');
  const [title, setTitle] = useState('SERP Preview Tool: Check Your Title and Description');
  const [url, setUrl] = useState('https://rankedtag.com/serp-preview-tool');
  const [desc, setDesc] = useState(
    'See how your title tag and meta description render in Google results, with truncation estimated by pixel width rather than character count. Free, no sign-up.'
  );

  const cfg = VIEWS[view];
  const t = useMemo(() => truncate(title, cfg.titleSize, cfg.titleLimit), [title, cfg]);
  const d = useMemo(() => truncate(desc, cfg.descSize, cfg.descLimit), [desc, cfg]);

  const crumb = useMemo(() => {
    try {
      const u = new URL(url);
      const parts = u.pathname.split('/').filter(Boolean);
      return [u.hostname.replace(/^www\./, ''), ...parts].join(' › ');
    } catch {
      return url.replace(/^https?:\/\//, '').replace(/\//g, ' › ');
    }
  }, [url]);

  const state = (cut, near) => (cut ? 'over' : near ? 'warn' : 'ok');
  const titleW = px(title, cfg.titleSize);
  const descW = px(desc, cfg.descSize);

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
              SERP Preview Tool.<br />
              <span className="ser">Pixel width,</span><br />
              <span className="accent">not character count.</span>
            </h1>
            <p>
              Google truncates titles and descriptions by how wide they render, not by how many characters
              they contain. Paste yours below to see where the cut falls on desktop and mobile. Nothing is
              sent anywhere — the whole tool runs in this page.
            </p>
          </div>
        </section>

        <section className="ct-section">
          <div className="container">
            <div className="ct-grid">
              <div className="ct-panel">
                <h2 className="ct-panel-h">Your snippet</h2>

                <div className="ct-field">
                  <label className="ct-label" htmlFor="sp-title">Title tag</label>
                  <input
                    id="sp-title"
                    className="ct-input"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                  <span
                    className="ct-count"
                    data-state={state(t.cut, titleW > cfg.titleLimit * 0.9)}
                  >
                    {title.length} characters · ~{titleW}px of ~{cfg.titleLimit}px
                    {t.cut ? ' · will be cut' : ''}
                  </span>
                </div>

                <div className="ct-field">
                  <label className="ct-label" htmlFor="sp-url">Page URL</label>
                  <input
                    id="sp-url"
                    className="ct-input"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    spellCheck={false}
                  />
                  <span className="ct-hint">
                    Google shows a breadcrumb path rather than the raw URL, so short readable paths display
                    better than parameter strings.
                  </span>
                </div>

                <div className="ct-field">
                  <label className="ct-label" htmlFor="sp-desc">Meta description</label>
                  <textarea
                    id="sp-desc"
                    className="ct-textarea"
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                  />
                  <span className="ct-count" data-state={state(d.cut, descW > cfg.descLimit * 0.9)}>
                    {desc.length} characters · ~{descW}px of ~{cfg.descLimit}px
                    {d.cut ? ' · will be cut' : ''}
                  </span>
                </div>
              </div>

              <div>
                <div className="ct-row" style={{ marginBottom: 'var(--s-4)' }} role="group" aria-label="Preview device">
                  {Object.entries(VIEWS).map(([k, v]) => (
                    <button
                      key={k}
                      type="button"
                      className="ct-btn"
                      aria-pressed={view === k}
                      onClick={() => setView(k)}
                    >
                      {v.label}
                    </button>
                  ))}
                </div>

                <div className="ct-serp" data-view={view}>
                  <div className="ct-serp-crumb">{crumb}</div>
                  <p className="ct-serp-title">{t.text || 'Your title will appear here'}</p>
                  <p className="ct-serp-desc">
                    {d.text || 'Your meta description will appear here.'}
                  </p>
                </div>
                <p className="ct-serp-note">
                  An estimate, not the real renderer. Google adds and removes elements per query and
                  rewrites titles and descriptions when it judges another option more useful.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="svc-prose ruled" data-reveal>
          <div className="container">
            <article className="dg-article">
              <section className="dg-section">
                <h2 id="why-pixels">Why pixel width, and not character count</h2>
                <p>
                  Almost every piece of advice on title length is given in characters, and almost all of it
                  is wrong at the edges. Google renders results in a proportional typeface, so the space a
                  title occupies depends on which letters are in it. A title of 60 narrow lowercase
                  characters can fit comfortably where a title of 50 characters in capitals will not.
                </p>
                <p>
                  The practical consequence is that two titles of identical length can behave completely
                  differently, and that a brand name full of capitals eats considerably more of your budget
                  than its character count suggests. The preview above estimates width using a per-character
                  table rather than counting, which gets much closer to where the cut actually falls.
                </p>
                <p>
                  It remains an estimate. Nothing outside Google can be exact, because the rendering depends
                  on the user’s device, the exact font loaded, and what else Google decides to show for
                  that query. The aim is to be usefully closer than a character count, not to be the
                  renderer.
                </p>
              </section>

              <section className="dg-section">
                <h2 id="writing">Writing a title that survives</h2>
                <p>
                  <strong>Put the distinguishing words first.</strong> If the end is at risk of truncation,
                  the end should carry the least important information. A brand name at the front costs you
                  the same width on every page you own, which is why most sites put it at the end.
                </p>
                <p>
                  <strong>Describe the page, do not list keywords.</strong> Google overrides titles it
                  judges unhelpful, and keyword stacking is one of the more reliable triggers. A title that
                  reads like a sentence a person wrote is both more likely to survive and more likely to be
                  clicked.
                </p>
                <p>
                  <strong>Make it unique.</strong> Duplicate titles across a large page set are a common
                  site-wide problem and they make it harder for a search engine to distinguish those pages.
                  Templates are fine when the variables actually differentiate the result.
                </p>
                <p>
                  <strong>Match the page.</strong> A title that promises something the page does not deliver
                  earns a click and loses the visitor, which is worse for you than not ranking. The return
                  to the results page is a behaviour you can see in your own analytics if you look for it.
                </p>
              </section>

              <section className="dg-section">
                <h2 id="descriptions">The description is an advert you are not paying for</h2>
                <p>
                  Meta descriptions have not been a ranking factor for a long time, and a lot of teams stopped
                  writing them carefully as a result. That is a mistake of a different kind: the description
                  frequently decides which of ten adequate results gets the click, and clicks are the entire
                  point of the ranking you worked for.
                </p>
                <p>
                  Google rewrites descriptions often, usually by lifting a passage from the page that matches
                  the query more closely than your written one. This is not a failure. It means the page
                  contains a better answer for that query than the summary did, which is a reasonable outcome.
                  Writing a good description is still worth it for the cases where yours is used.
                </p>
                <p>
                  The most effective descriptions answer the implied question and set an accurate expectation
                  of what the page contains. The least effective repeat the title in slightly different words
                  and add a list of keywords nobody reads.
                </p>
              </section>

              <section className="dg-section">
                <h2 id="ai">What changes when an AI answer sits above the result</h2>
                <p>
                  An assistant answer does not display your title or description at all, so their direct role
                  shrinks on queries that resolve to a generated summary. Their indirect role does not. A
                  clear, specific title is one of the signals that helps any system work out what a page is
                  about, and the discipline of saying what something is in very few words is the same
                  discipline that produces quotable content.
                </p>
                <p>
                  The practical advice is unchanged, with a shift in emphasis. Informational queries are where
                  AI answers appear most and where the click is least reliable, which is an argument for
                  weighting your attention towards the commercial and comparison pages where the click still
                  happens and still converts. Those are the titles worth labouring over.
                </p>
                <p>
                  If you want the fuller version of that argument, we have written it up in{' '}
                  <Link to="/seo-vs-geo">SEO vs GEO</Link> and in{' '}
                  <Link to="/ai-seo-vs-traditional-seo">AI SEO vs traditional SEO</Link>.
                </p>
              </section>
            </article>
          </div>
        </section>

        <section className="faq-section ruled" data-reveal>
          <div className="container grid12">
            <div className="col-4 faq-aside">
              <span className="eyebrow" data-num="001">FAQ</span>
              <h2 className="h-2 faq-h">Titles and descriptions, asked and answered.</h2>
              <div className="faq-side">
                <h3>Want the rest of the page checked?</h3>
                <p>
                  Send the domain. The founder runs the 52-check review personally and replies within 48
                  hours, including when the answer is that your titles are not the problem.
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

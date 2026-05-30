import { Link } from 'react-router-dom';
import ToolFaq from './ToolFaq';
import './toolGuide.css';

// Long-form SEO content rendered beneath the Page Speed Checker tool.
// Captures the informational long-tail (Core Web Vitals, good score, how to
// improve, mobile vs desktop, is speed a ranking factor) plus the AI-search
// angle. Tool-specific copy describes RankedTag's real five-signal engine and
// ranked "fix-first" list — Core Web Vitals are taught as Google's official
// metrics (run PageSpeed Insights for field data), never claimed as the tool's
// own output, so nothing here overstates what the checker does.
//
// PS_FAQ is the single source of truth for the visible accordion and the
// FAQPage JSON-LD in PageSpeed.jsx — keep them identical.

export const PS_FAQ = [
  [
    'How do I check my website speed for free?',
    "Enter your page URL in the tool, choose mobile or desktop, and run the test. It's free with no sign-up or API key, and returns a 0-100 performance score with a five-signal breakdown and a ranked fix-first list in under five seconds.",
  ],
  [
    'What is a good page speed score?',
    'On the 0-100 performance scale, 90 or above is good, 50-89 needs improvement, and under 50 is poor. For Google’s Core Web Vitals, aim for LCP 2.5 seconds or less, INP 200 milliseconds or less, and CLS 0.1 or less on real-user data.',
  ],
  [
    'What are Core Web Vitals?',
    "Core Web Vitals are Google's three page-experience metrics: Largest Contentful Paint (loading), Interaction to Next Paint (responsiveness), and Cumulative Layout Shift (visual stability). Together they summarize how fast and stable a page feels to real users.",
  ],
  [
    'Why is my page speed different on mobile and desktop?',
    'Mobile tests simulate a mid-range phone on a slower connection, so scores are typically lower than desktop. Because most traffic is mobile and Google prioritizes the mobile experience, the mobile score is the one to focus on.',
  ],
  [
    'Does page speed affect Google rankings?',
    "Yes, as part of Google's page-experience signals, but it's a tiebreaker rather than a primary factor. Relevant, high-quality content outweighs speed, but a fast page improves user experience and removes a disadvantage against equally relevant competitors.",
  ],
];

const RELATED = [
  {
    to: '/domain-authority-checker',
    name: 'Domain Authority Checker',
    desc: 'Composite authority score from traffic rank, age, schema and transport — source-linked.',
  },
  {
    to: '/competitor-analysis',
    name: 'Competitor Analysis',
    desc: 'Score your page against competitors with keyword-gap analysis and insights.',
  },
  {
    to: '/keyword-density-checker',
    name: 'Keyword Density Checker',
    desc: 'See 1–4 word keyword frequency and density, and catch keyword stuffing.',
  },
];

export default function PageSpeedGuide() {
  return (
    <section className="dg-section">
      <div className="container">
        <article className="dg-article">
          <h2 id="what-is-a-page-speed-checker">What is a page speed checker?</h2>
          <p>
            A page speed checker is a tool that measures how quickly a web page loads and how stable and
            responsive it feels while loading. It runs your page through a performance test and reports a
            score — typically 0–100 — plus the specific signals behind it, so you can see whether your
            site feels fast to real visitors and, if not, what's slowing it down.
          </p>
          <p>
            Speed matters for two concrete reasons: visitors abandon slow pages, and page experience is
            part of how Google evaluates sites. A faster page tends to convert better and competes more
            easily in search. This checker runs its own five-signal analysis in seconds — no API key, no
            sign-up — and ranks what to fix first.
          </p>

          <h2 id="how-to-check-page-speed">How to check your page speed (step-by-step)</h2>
          <ol className="dg-steps">
            <li>
              <strong>Enter your URL.</strong> Paste the full page address (not just the domain) into the
              field above — speed varies page by page.
            </li>
            <li>
              <strong>Pick a device.</strong> Test <strong>Mobile</strong> and <strong>Desktop</strong>;
              mobile is usually slower and is what Google weighs most heavily.
            </li>
            <li>
              <strong>Run the test.</strong> You'll get a performance score, a five-signal breakdown, a
              resource summary, and a ranked list of fix-first opportunities in under five seconds.
            </li>
            <li>
              <strong>Work the fix list top-down.</strong> Start with the HIGH-impact items — fixing one
              large render-blocking script often moves the score more than a dozen small tweaks.
            </li>
          </ol>

          <h2 id="how-to-read-your-results">How to read your results</h2>
          <h3 id="five-signals">The five signals we score</h3>
          <p>
            Rather than a single opaque number, this checker breaks performance into five signals you can
            act on, each scored 0–100:
          </p>
          <ul className="dg-list">
            <li><strong>Speed</strong> — server response time plus how long the HTML takes to download.</li>
            <li><strong>Page weight</strong> — the size of the HTML payload; lean pages render faster on mobile.</li>
            <li><strong>Render-blocking</strong> — scripts and stylesheets in the <code>&lt;head&gt;</code> that delay first paint.</li>
            <li><strong>Image hygiene</strong> — lazy-loading, explicit width/height and alt text, which drive layout stability.</li>
            <li><strong>Transport quality</strong> — HTTPS, HTTP/2 or HTTP/3, compression and caching headers.</li>
          </ul>

          <h3 id="core-web-vitals">Core Web Vitals: LCP, INP and CLS</h3>
          <p>
            Core Web Vitals are the three metrics Google uses to summarize real-world page experience.
            Our five-signal check is a fast diagnostic of the things that <em>drive</em> these vitals; for
            the official field measurements, run your URL through Google PageSpeed Insights (linked from
            the results above). Here's what each one means:
          </p>
          <div className="dg-metric-grid">
            <div className="dg-metric-card">
              <span className="dg-metric-tag">Loading</span>
              <h3>LCP</h3>
              <p>Largest Contentful Paint — time until the biggest visible element loads. <strong>Good: ≤ 2.5s.</strong></p>
            </div>
            <div className="dg-metric-card">
              <span className="dg-metric-tag">Responsiveness</span>
              <h3>INP</h3>
              <p>Interaction to Next Paint — how fast the page reacts to a tap or click. (Replaced FID in 2024.) <strong>Good: ≤ 200ms.</strong></p>
            </div>
            <div className="dg-metric-card">
              <span className="dg-metric-tag">Stability</span>
              <h3>CLS</h3>
              <p>Cumulative Layout Shift — how much the layout jumps as it loads. <strong>Good: ≤ 0.1.</strong></p>
            </div>
          </div>
          <p>Hit the "good" threshold on all three and your page passes Core Web Vitals.</p>

          <h3 id="lab-vs-field">Lab data vs field data (CrUX)</h3>
          <p>
            There are two kinds of speed numbers. <strong>Lab data</strong> is a single controlled test in
            a simulated environment — great for debugging and reproducible (this is what our checker and
            Lighthouse produce). <strong>Field data</strong> comes from Google's Chrome User Experience
            Report (CrUX): the actual experience of real Chrome users over the prior 28 days. Field data is
            the truth about what your visitors feel; lab data is the diagnostic you use to fix it. New or
            low-traffic pages may not have enough field data yet — in that case, lean on the lab results.
          </p>

          <h3 id="mobile-vs-desktop">Why your mobile and desktop scores differ</h3>
          <p>
            Mobile scores are almost always lower, because the test simulates a mid-tier phone on a slower
            connection. Since most traffic is mobile and Google evaluates the mobile experience, treat the
            mobile score as the one that matters most — a great desktop score won't save a slow mobile page.
          </p>

          <h2 id="good-page-speed-score">What is a good page speed score?</h2>
          <p>
            For the 0–100 performance score: <strong>90–100 is good (green), 50–89 needs improvement
            (orange), and 0–49 is poor (red)</strong>. But the score is a means, not the goal — what you're
            really chasing is <em>passing Core Web Vitals on real-user (field) data</em>, because that's the
            part tied to page experience.
          </p>
          <p>
            A practical target: aim for a mobile score of 90+ and green Core Web Vitals in the field. If
            competitors ranking above you are slower, speed is a lever you can pull; if they're already
            fast, treat parity as the baseline, not a differentiator.
          </p>

          <h2 id="how-to-improve-page-speed">How to improve your page speed</h2>
          <h3 id="quick-wins">Quick wins: images, caching, fonts</h3>
          <p>Most speed problems start here, and these are the cheapest fixes:</p>
          <ul className="dg-list">
            <li>Compress and correctly size images; serve modern formats (WebP/AVIF) and lazy-load below-the-fold images.</li>
            <li>Enable browser caching and use a CDN so repeat and distant visitors load faster.</li>
            <li>Preload your main font and avoid invisible-text flashes; trim unused font weights.</li>
          </ul>
          <h3 id="bigger-fixes">Bigger fixes: JavaScript, server response, third-party scripts</h3>
          <p>When the quick wins aren't enough:</p>
          <ul className="dg-list">
            <li>Reduce and defer JavaScript; remove unused code and split large bundles so the page becomes interactive sooner (usually the biggest INP lever).</li>
            <li>Improve server response time (aim under ~600ms) with better hosting, caching, or a faster backend.</li>
            <li>Audit third-party scripts — analytics, chat widgets, ad tags. Each one should justify its cost; they're a leading cause of slow, janky pages.</li>
          </ul>

          <h2 id="does-page-speed-affect-seo">Does page speed affect SEO rankings?</h2>
          <p>
            Yes, but with nuance. Page experience — including Core Web Vitals — is a confirmed Google
            ranking signal, but it's a <em>tiebreaker</em>, not a primary one. Google has been explicit that
            relevant, high-quality content beats a faster competitor with weaker content. Speed rarely
            vaults a page to the top on its own; what it does is remove a disadvantage and improve the user
            metrics — bounce, conversions — that matter regardless of rankings.
          </p>
          <p>
            The honest framing: fix speed because slow pages lose visitors and can hold you back among
            otherwise-equal competitors — not because a 100 score is a magic ranking button.
          </p>

          <div className="dg-ai-callout">
            <h2 id="page-speed-ai-search" className="dg-ai-title">
              Does page speed affect AI search visibility?
            </h2>
            <p>
              Indirectly. AI Overviews, ChatGPT and other answer engines decide what to cite based on
              relevance and trust, not your performance score. But speed and technical health affect whether
              your pages get <strong>crawled and rendered</strong> efficiently in the first place — a page
              that's slow, JavaScript-heavy or unstable is harder for any automated system, search crawler or
              AI, to access and parse cleanly.
            </p>
            <p>
              So fast, technically sound pages don't earn AI citations by being fast, but slow, broken ones
              can quietly exclude themselves. Speed is table stakes for discoverability; content and authority
              earn the citation — which is what{' '}
              <Link to="/">generative engine optimization</Link> is about.
            </p>
          </div>

          <h2 id="how-to-use-this-checker">How to use this checker</h2>
          <h3 id="benchmark-competitors">Benchmark against your competitors</h3>
          <p>
            Test your top three competitors' key pages on mobile. Their scores tell you what's realistically
            achievable in your space — and whether speed is a gap you can exploit or a baseline you need to
            match.
          </p>
          <h3 id="track-over-time">Track your speed over time</h3>
          <p>
            Speed degrades quietly as you add scripts, images and features. Re-test important pages after
            every significant change, and check periodically, so a new plugin or tag doesn't silently tank
            your Core Web Vitals.
          </p>

          <h2 id="vs-other-tools">Page speed checker vs PageSpeed Insights, GTmetrix and Pingdom</h2>
          <p>
            Those tools run distributed Lighthouse tests and surface CrUX field data — authoritative, but
            often a wall of developer-oriented findings. This checker is built for a different moment: a fast,
            no-key pre-flight that scores five real signals and hands you a ranked, plain-English fix list in
            seconds, with the underlying resources laid out so you can verify everything yourself. Use{' '}
            <a href="https://pagespeed.web.dev/" target="_blank" rel="noreferrer">PageSpeed Insights</a>{' '}
            for the full Lighthouse lab run and real-user Core Web Vitals; use this one to triage quickly and
            decide where to spend your time first.
          </p>

          <h2 id="faq">Frequently asked questions</h2>
          <ToolFaq items={PS_FAQ} />

          <h2 id="related-tools">Related free SEO tools</h2>
          <div className="dg-related">
            {RELATED.map((r) => (
              <Link className="dg-related-card" to={r.to} key={r.to}>
                <span className="dg-related-name">{r.name} <span className="dg-related-ar">→</span></span>
                <span className="dg-related-desc">{r.desc}</span>
              </Link>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}

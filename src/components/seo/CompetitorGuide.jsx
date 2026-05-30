import { Link } from 'react-router-dom';
import ToolFaq from './ToolFaq';
import './toolGuide.css';

// Long-form SEO content rendered beneath the Competitor Analysis tool.
// Captures the "free competitor analysis tool" intent plus the informational
// tail (what is it, how to run one, how to read results) and the unique
// AI-search competitor angle. Copy describes the real tool — you paste your
// page + up to five competitor URLs and get side-by-side scoring, keyword
// gaps and insights — so nothing here implies discovery, ad/traffic data, or
// other features the tool doesn't have.
//
// CA_FAQ is the single source of truth for the visible accordion and the
// FAQPage JSON-LD in CompetitorAnalysis.jsx — keep them identical.

export const CA_FAQ = [
  [
    'What is the best free competitor analysis tool?',
    'It depends on the job. For side-by-side SEO and content comparison — keyword gaps, on-page scoring and where rivals out-cover you — this free tool runs it in seconds with no account. Match the tool to whether you are analyzing keywords, content, backlinks, or AI-search visibility.',
  ],
  [
    'Can I analyze competitors for free without an account?',
    'Yes. This competitor analysis tool is free with no sign-up — paste your page and up to five competitor URLs and it returns side-by-side scores, keyword gaps and optimization insights in seconds.',
  ],
  [
    'How do I find out who my competitors are?',
    'Your real search competitors are whoever ranks for your target keywords and gets cited for your topics — often different from your obvious business rivals. Once you know them, paste their URLs into the tool to compare your content side by side.',
  ],
  [
    "What's the best free tool for competitor keywords?",
    'A keyword-gap analysis is the fastest way in: it surfaces the terms your competitors emphasize that your page does not. This tool shows shared keywords, the gaps to close, and the terms unique to you.',
  ],
  [
    'How do I analyze competitors in AI search?',
    'Run your key questions through AI Overviews, ChatGPT and Perplexity, note which competitor domains get cited, and compare their pages to yours. The ones cited usually have clearer, more quotable, more authoritative content on the topic.',
  ],
];

const RELATED = [
  {
    to: '/domain-authority-checker',
    name: 'Domain Authority Checker',
    desc: 'Benchmark a competitor’s strength with a composite, source-linked authority score.',
  },
  {
    to: '/keyword-density-checker',
    name: 'Keyword Density Checker',
    desc: 'See exactly which keywords and phrases a competitor’s page emphasizes.',
  },
  {
    to: '/page-speed-checker',
    name: 'Page Speed Checker',
    desc: 'Compare load speed and Core Web Vitals signals against rival pages.',
  },
];

export default function CompetitorGuide() {
  return (
    <section className="dg-section">
      <div className="container">
        <article className="dg-article">
          <h2 id="what-is-competitor-analysis">What is competitor analysis?</h2>
          <p>
            Competitor analysis is the process of studying the businesses competing for your audience to
            learn what's working for them and where you can win. In SEO, that means comparing your pages to
            your rivals' on the things that drive rankings — the keywords they target, how thoroughly they
            cover a topic, how their content is structured, and increasingly, who gets cited in AI answers.
          </p>
          <p>
            This free competitor analysis tool focuses on the most actionable slice: paste your page and up
            to five competitor URLs and it scores them side by side, surfaces the keyword gaps between you,
            and turns the differences into a prioritized list of what to improve — no account required.
          </p>

          <h2 id="how-to-run-competitor-analysis">How to run a free competitor analysis (step-by-step)</h2>
          <ol className="dg-steps">
            <li>
              <strong>Add your page.</strong> Enter the URL of the page you want to improve — analysis is
              page-level, not just domain-level.
            </li>
            <li>
              <strong>Add up to five competitors.</strong> Paste the rival URLs ranking for your target
              keywords. Your real competitors are whoever shows up in the results for your topics, not
              always your obvious business rivals.
            </li>
            <li>
              <strong>Run the analysis.</strong> The tool fetches each page, scores them across on-page SEO
              signals, and computes the keyword gaps between your content and theirs.
            </li>
            <li>
              <strong>Work the gaps.</strong> Start with the high-value keywords competitors rank for that
              you're missing, then close the content and structure gaps the insights flag.
            </li>
          </ol>

          <h2 id="what-tools-measure">What competitor analysis tools actually measure</h2>
          <p>
            "Competitor analysis tools" don't measure one thing — each estimates a slice: organic keywords
            and rankings, on-page content depth, backlink profiles, traffic and audience, paid ads, or share
            of voice in AI answers. Almost all of those numbers are <em>estimates</em> built from each tool's
            own data, not ground truth, so use them for direction and comparison rather than as exact figures.
          </p>
          <p>
            This tool concentrates on the dimension you can act on fastest from a single page: on-page SEO and
            content. For the others, pair it with a{' '}
            <Link to="/domain-authority-checker">domain authority check</Link> for competitor strength and a{' '}
            <Link to="/keyword-density-checker">keyword density check</Link> to see exactly what a rival page
            emphasizes.
          </p>

          <h2 id="how-to-read-results">How to read your results</h2>
          <p>
            The report leads with four numbers: <strong>your score</strong>, the{' '}
            <strong>competitor average</strong> (your benchmark), the count of <strong>keyword gaps</strong>,
            and how many <strong>pages</strong> were analyzed. Below that:
          </p>
          <ul className="dg-list">
            <li><strong>Radar comparison</strong> — your page against competitors across each SEO dimension at a glance, so weak spots are obvious.</li>
            <li><strong>Insights</strong> — plain-language observations on where you lead and where you trail.</li>
            <li><strong>Comparison table</strong> — score-by-score detail against each competitor and the benchmark average.</li>
            <li><strong>Keyword-gap table</strong> — shared keywords, the gaps competitors cover that you don't, and the terms unique to you.</li>
          </ul>
          <p>
            Read across, not just down: a single score means little until it sits next to a competitor's. If
            you're stronger but still outranked, the issue is usually content depth or authority, not on-page
            mechanics.
          </p>

          <h2 id="free-vs-freemium">"Free" vs freemium: what you actually get</h2>
          <p>
            Be realistic about "free." Most competitor tools are freemium teasers — they show a headline
            number, then paywall the detail after one search, or cap you to a handful of rows per day. That's
            fine for a single data point and frustrating for real work.
          </p>
          <p className="dg-quote">
            This tool is genuinely free and needs no account — paste your URLs and get the full side-by-side
            breakdown, every time.
          </p>

          <div className="dg-ai-callout">
            <h2 id="competitors-ai-search" className="dg-ai-title">
              How to analyze your competitors in AI search
            </h2>
            <p>
              Ranking #1 in classic Google increasingly isn't the whole game — a growing share of queries are
              answered by AI Overviews, ChatGPT and Perplexity, which cite only a handful of sources.
              Analyzing competitors here means a different question: for the topics that matter to you, which
              competitors get cited by AI engines, and why?
            </p>
            <p>
              Take your key questions, run them through the major AI engines, and note which domains get cited
              and what those pages have in common — clear structure, direct answers, strong topical authority.
              The competitors winning AI citations are usually the ones whose content is easiest for a model to
              lift a clean answer from, not necessarily the ones with the biggest backlink profiles. Closing
              that gap — being the source AI engines quote — is what{' '}
              <Link to="/">generative engine optimization</Link> is about, and it's where the next competitive
              advantage is being won.
            </p>
          </div>

          <h2 id="data-to-action">How to turn competitor data into action</h2>
          <p>Data only matters if it changes what you do. Translate findings into a prioritized plan:</p>
          <ul className="dg-list">
            <li><strong>Keyword gaps</strong> → build or expand content for the high-value terms competitors rank for and you don't.</li>
            <li><strong>Content gaps</strong> → cover the subtopics and formats they have and you're missing.</li>
            <li><strong>Structure gaps</strong> → tighten headings, internal links and schema so your page is easier to rank and to quote.</li>
            <li><strong>Authority gaps</strong> → pursue the link sources and topical depth behind a stronger competitor.</li>
            <li><strong>AI-citation gaps</strong> → restructure the pages where competitors get cited and you don't, so your answer is the quotable one.</li>
          </ul>
          <p>Rank these by impact versus effort, and tackle the high-impact, low-effort items first.</p>

          <h2 id="faq">Frequently asked questions</h2>
          <ToolFaq items={CA_FAQ} />

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

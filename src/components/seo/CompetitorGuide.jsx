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
    'How do I compare my site against competitors?',
    "Enter your page URL and up to five competitor URLs, then run the analysis. You get a side by side comparison of keyword coverage, keyword prominence, readability and content structure, plus a keyword gap list showing the terms your competitors use that you do not.",
  ],
  [
    'Does this tool track competitor keyword rankings?',
    "No. It compares on-page content rather than search positions. It fetches your page and each competitor page and scores them on keyword distribution, keyword prominence, semantic coverage, readability and content structure, so you can see why a competing page may read as more relevant for a topic. For live position tracking you need a dedicated rank tracker.",
  ],
  [
    'How many competitors can I compare at once?',
    'Five. You paste your own page plus up to five competitor URLs in a single run, and every page is fetched and scored on the same six signals so the comparison is like for like. Running the same page against a different set of five is free, so a wider field is just a second run.',
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
    <div className="container">
      <article className="dg-article">
        <section className="dg-section">
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
        </section>

        {/* The honest-scope section. The tool surfaces for rank-tracking
            queries it cannot serve, so the limitation is named up front
            rather than discovered after a wasted run. The weights are read
            from api/_lib/scoring.js and must be updated with it. */}
        <section className="dg-section">
          <h2 id="what-this-tool-measures">Competitor check: what this tool measures, and what it does not</h2>
          <p>
            A competitor check here is a content comparison. The tool fetches your page and each competitor
            page live, extracts the text, and scores all of them on the same six signals. Nothing is
            estimated and nothing is modelled: every number comes from the words on the page we just
            fetched. These are the six signals and the weight each one carries in the overall score.
          </p>
          <table className="dg-table">
            <thead>
              <tr>
                <th scope="col">Signal</th>
                <th scope="col">Weight</th>
                <th scope="col">What it actually checks</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Keyword optimization</td>
                <td>25%</td>
                <td>Whether your main term sits in the natural 0.8% to 2.5% density band, how many of the next four support it, and whether anything crosses 3.5%, the point where a term reads as stuffed.</td>
              </tr>
              <tr>
                <td>Content structure</td>
                <td>20%</td>
                <td>Length, paragraph count, paragraphs running past 150 words, and whether the page has real headings to break it up.</td>
              </tr>
              <tr>
                <td>Readability</td>
                <td>20%</td>
                <td>A Flesch reading ease score, with deductions for long sentences, heavy passive voice and a high share of difficult words.</td>
              </tr>
              <tr>
                <td>Keyword prominence</td>
                <td>15%</td>
                <td>Whether your top five terms appear in the first 15% of the page, in the opening paragraph, and again in the closing 15%.</td>
              </tr>
              <tr>
                <td>Semantic coverage</td>
                <td>10%</td>
                <td>How many distinct one, two and three word terms the page uses, as a proxy for covering a topic rather than repeating a phrase.</td>
              </tr>
              <tr>
                <td>Keyword distribution</td>
                <td>10%</td>
                <td>Whether your leading terms run through the page or sit in one corner of it, measured across ten equal slices of the text, with a deduction for slices that never mention the topic.</td>
              </tr>
            </tbody>
          </table>
          <p>
            <strong>What it does not do, stated plainly:</strong> it does not track search positions, it holds
            no SERP data, and it cannot tell you which keywords a competitor ranks for. It does not read
            backlink profiles, estimate traffic or report ad spend. If you need live position tracking you
            need a dedicated rank tracker, and no amount of content scoring substitutes for one.
          </p>
          <p>
            That boundary is the useful part. On-page content is the half of the gap you can close this week
            without a budget, which is why it is the half this tool measures. Pair it with a{' '}
            <Link to="/domain-authority-checker">domain authority check</Link> when you need to know whether
            you are losing on content or on authority, because the fix is completely different in each case.
          </p>
        </section>

        <section className="dg-section">
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
        </section>

        <section className="dg-section">
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
        </section>

        <section className="dg-section">
          <h2 id="compare-side-by-side">How to compare competitors side by side without fooling yourself</h2>
          <p>
            A side by side comparison is only worth the time if the pages are genuinely comparable. Four
            rules keep the output honest:
          </p>
          <ul className="dg-list">
            <li>
              <strong>Compare one intent at a time.</strong> Put your pricing page against their pricing page,
              your guide against their guide. A product page scored against a 3,000 word tutorial will always
              look thin, and the gap it reports is a format difference rather than a weakness.
            </li>
            <li>
              <strong>Pick the pages that actually rank.</strong> Search your target term, take the URLs that
              appear, and compare those. Your real competitors in search are whoever occupies the results for
              your topic, which is often not the companies your sales team names.
            </li>
            <li>
              <strong>Read the benchmark as a range, not a target.</strong> The competitor average is the mean
              of the pages you chose. Five strong pages produce a demanding benchmark and five weak ones
              produce a flattering benchmark, so the useful question is which specific competitor beats you on
              which specific signal.
            </li>
            <li>
              <strong>Treat the keyword gap list as questions, not instructions.</strong> A term three rivals
              use and you do not is evidence that readers expect the subtopic, not an invitation to paste the
              word in. Cover the idea properly and the term arrives on its own.
            </li>
          </ul>
          <p>
            Work through the radar first for the shape of the gap, then the comparison table for the exact
            margin, then the keyword gap list for the specifics. If your scores are level and you are still
            being outranked, the difference is not on the page: it is authority, and the answer is links and
            topical depth rather than another revision.
          </p>
        </section>

        <section className="dg-section">
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
        </section>

        <section className="dg-section">
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
        </section>

        <section className="dg-section">
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
              <Link to="/what-we-do/generative-engine-optimization">generative engine optimization</Link> is about, and it's where the next competitive
              advantage is being won.
            </p>
          </div>
        </section>

        <section className="dg-section">
          <h2 id="free-competitor-audit">A free competitor audit you can repeat every quarter</h2>
          <p>
            Competitor analysis is worth more as a habit than as a one-off. This is the loop, and it takes
            about twenty minutes a quarter per page that matters:
          </p>
          <ol className="dg-steps">
            <li>
              <strong>Fix the page set.</strong> Choose your five most commercially important pages and, for
              each, the competitor URLs currently ranking for its target term. Keep the list in a document so
              every later run is comparable.
            </li>
            <li>
              <strong>Run the comparison.</strong> One run per page, up to five competitors each. Record your
              score, the competitor average and the number of keyword gaps.
            </li>
            <li>
              <strong>Diagnose one level deeper.</strong> Where a page scores badly on keyword optimization or
              distribution, open it in the{' '}
              <Link to="/keyword-density-checker">keyword density checker</Link> to see which terms are
              actually carrying the page and which are crowding it out.
            </li>
            <li>
              <strong>Fix, then re-run.</strong> Ship the revision, re-run the same comparison, and keep the
              before and after. Over a year that record tells you which changes moved anything, which is the
              question most SEO reporting never answers.
            </li>
          </ol>
          <p>
            The loop is deliberately small because the alternative is an audit nobody repeats. If you would
            rather see it run at full depth on a live domain, the{' '}
            <Link to="/case-study/sendr">sendr.ai case study</Link> shows the same diagnosis applied across a
            whole site over six months, and{' '}
            <Link to="/what-we-do/seo">our full-stack SEO programme</Link> is this loop run weekly by
            people who do it for a living.
          </p>
        </section>

        <section className="dg-section">
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
        </section>

        <section className="dg-section">
          <h2 id="faq">Frequently asked questions</h2>
          <ToolFaq items={CA_FAQ} />
        </section>

        <section className="dg-section">
          <h2 id="related-tools">Related free SEO tools</h2>
          <div className="dg-related">
            {RELATED.map((r) => (
              <Link className="dg-related-card" to={r.to} key={r.to}>
                <span className="dg-related-name">{r.name} <span className="dg-related-ar">→</span></span>
                <span className="dg-related-desc">{r.desc}</span>
              </Link>
            ))}
          </div>
        </section>
      </article>
    </div>
  );
}

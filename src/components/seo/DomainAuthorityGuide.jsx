import { Link } from 'react-router-dom';
import ToolFaq from './ToolFaq';
import './toolGuide.css';

// Long-form SEO content rendered beneath the Domain Authority Checker tool.
// Written to capture the informational long-tail (what is DA, DA vs DR, is it
// a ranking factor, good DA score) plus the AI-search angle. Tool-specific
// copy describes RankedTag's *composite* score (Tranco + Wayback + on-page +
// transport, all source-linked) — not a Moz/Ahrefs resale — so nothing here
// overstates what the checker actually does.
//
// DA_FAQ is the single source of truth for the visible accordion and the
// FAQPage JSON-LD in BacklinkChecker.jsx — keep them identical.

export const DA_FAQ = [
  [
    'How do I check domain authority for free?',
    "Enter any domain in the tool and click Check. It's free, unlimited, and needs no sign-up or Ahrefs/Moz API key — it returns a composite authority score with a transparent, source-linked breakdown in seconds.",
  ],
  [
    'What is a good domain authority score?',
    "It's relative to your niche. A score in the 40s to 50s is solid for most sites and 60+ is strong in competitive industries, but the score that matters most is yours compared to the competitors you're trying to outrank.",
  ],
  [
    "What's the difference between DA and DR?",
    "Domain Authority (DA) is Moz's 0-100 estimate built on its link index and tuned to predict rankings. Domain Rating (DR) is Ahrefs' 0-100 score based purely on the quantity and quality of referring domains. They often differ for the same site because they use different data and weighting.",
  ],
  [
    'Does this checker use Moz or Ahrefs data?',
    'No. It computes an independent composite score from public signals — Tranco traffic rank, Wayback Machine domain age, on-page schema and HTTP transport quality — and links every source so you can verify the inputs yourself. No API key required.',
  ],
  [
    'How often does domain authority update?',
    'Authority scores update periodically rather than in real time, typically when each vendor refreshes its link index. Scores can move up or down with those refreshes, so track the trend rather than a single reading.',
  ],
];

const RELATED = [
  {
    to: '/competitor-analysis',
    name: 'Competitor Analysis',
    desc: 'Score your page against competitors with keyword-gap analysis and insights.',
  },
  {
    to: '/page-speed-checker',
    name: 'Page Speed Checker',
    desc: 'Server-side speed, weight and render-blocking scoring in under 5 seconds.',
  },
  {
    to: '/keyword-density-checker',
    name: 'Keyword Density Checker',
    desc: 'See 1–4 word keyword frequency and density, and catch keyword stuffing.',
  },
];

export default function DomainAuthorityGuide() {
  return (
    <section className="dg-section">
      <div className="container">
        <article className="dg-article">
          <h2 id="what-is-domain-authority">What is domain authority?</h2>
          <p>
            Domain authority is a general SEO concept that describes how "strong" or trustworthy a
            website is in the eyes of search engines, mostly based on its backlink profile and overall
            reputation. It's expressed as a score from 0 to 100, where higher means more authoritative.
          </p>
          <p>
            One important clarification: "domain authority" as a concept is <strong>not</strong> an
            official Google metric. The scores you see — Moz's DA, Ahrefs' DR, Semrush's Authority
            Score, or RankedTag's composite — are each a third-party <em>estimate</em> of a site's
            strength. They're useful for comparison and benchmarking, but no single one is "the"
            authority Google uses.
          </p>

          <h2 id="how-to-check-domain-authority">How to check domain authority (step-by-step)</h2>
          <ol className="dg-steps">
            <li>
              <strong>Enter a domain.</strong> Type or paste any domain (e.g. <code>example.com</code>)
              into the field above — no <code>http://</code> or login needed.
            </li>
            <li>
              <strong>Run the check.</strong> Click <strong>Run authority check</strong>. The tool
              pulls live public signals and computes a 0–100 composite authority score in seconds.
            </li>
            <li>
              <strong>Read the breakdown.</strong> Every component — traffic rank, domain age, archive
              history, technical health and on-page content — is scored and weighted, so you see{' '}
              <em>why</em> the number is what it is, not just the number.
            </li>
            <li>
              <strong>Verify it yourself.</strong> Each result links back to its public source (Tranco,
              the Wayback Machine, your live page) so you can cross-check every input.
            </li>
          </ol>

          <h2 id="da-vs-dr-vs-authority-score">
            DA vs DR vs Authority Score: which metric should you trust?
          </h2>
          <p>
            Each major SEO company has its own authority metric. They measure similar things in
            different ways, which is exactly why understanding them together is more useful than
            trusting any one in isolation. RankedTag's checker deliberately sidesteps the
            "whose-number-is-right" problem by computing a transparent composite from public sources
            you can verify — but here's how the big three compare.
          </p>
          <div className="dg-metric-grid">
            <div className="dg-metric-card">
              <span className="dg-metric-tag">Moz</span>
              <h3>Domain Authority (DA)</h3>
              <p>
                Moz coined the term. DA is a 0–100, machine-learned score built on Moz's link index and
                tuned to correlate with Google rankings. It's the most widely recognized metric.
              </p>
            </div>
            <div className="dg-metric-card">
              <span className="dg-metric-tag">Ahrefs</span>
              <h3>Domain Rating (DR)</h3>
              <p>
                A 0–100 score based purely on the quantity and quality of referring domains, from
                Ahrefs' own backlink index. DR ignores traffic, age and spam — a clean link-popularity
                measure.
              </p>
            </div>
            <div className="dg-metric-card">
              <span className="dg-metric-tag">Semrush</span>
              <h3>Authority Score</h3>
              <p>
                More holistic: it blends backlink signals, estimated organic traffic and spam factors
                into one 0–100 number, so it can read differently from DA or DR for the same site.
              </p>
            </div>
          </div>
          <p>
            <strong>Bottom line:</strong> treat any single authority number as one data point, not a
            verdict. A site that scores well across independent measures is genuinely strong; a site
            high on one but low on the others usually has a quirk — lots of links but no traffic, or
            traffic but a thin link profile — worth a closer look. That's the thinking behind our
            composite: several independent signals, weighted and shown transparently.
          </p>

          <h2 id="how-is-domain-authority-calculated">How is domain authority calculated?</h2>
          <p>Every authority score works off broadly the same inputs, weighted differently by each vendor:</p>
          <ul className="dg-list">
            <li><strong>Referring domains</strong> — how many <em>unique</em> websites link to you (this matters far more than raw link count).</li>
            <li><strong>Quality of those linking sites</strong> — a link from a strong, relevant site counts for much more than many weak ones.</li>
            <li><strong>Link-profile health</strong> — natural, varied, spam-free patterns score better than manipulated ones.</li>
            <li><strong>Traffic and trust signals</strong> — some scores (including ours) also weigh traffic rank, domain age, and technical/transport quality.</li>
          </ul>
          <p>
            None of them use Google's actual algorithm — they're independent estimates designed to{' '}
            <em>correlate</em> with ranking ability, not reproduce it. RankedTag's score is computed
            from Tranco traffic rank, Wayback Machine domain age and archive history, HTTP transport
            quality, and on-page content signals (schema, headings, link structure).
          </p>

          <h2 id="good-domain-authority-score">What is a good domain authority score?</h2>
          <p>
            There's no universal "good" number, because authority is <strong>relative to your niche and
            competitors</strong>. A score that's excellent in a quiet local niche would be weak in a
            competitive industry. A practical rule of thumb:
          </p>
          <p className="dg-quote">
            Your authority is "good" when it's at or above the sites you compete with in the search
            results for your target keywords.
          </p>
          <h3 id="typical-scores">Typical scores by site age and niche</h3>
          <p>
            As a rough orientation only: brand-new sites usually sit in the single digits to low teens,
            established small-business sites often land in the 20s–40s, and large, mature brands in
            competitive spaces commonly run 60+. Treat these as context, not targets — chasing a number
            is the wrong goal. Steady upward movement relative to competitors is what matters.
          </p>

          <h2 id="page-authority-vs-domain-authority">Page authority vs domain authority</h2>
          <p>
            Domain authority estimates the strength of an <strong>entire website</strong>. Page Authority
            (PA) estimates the ranking strength of a <strong>single page</strong>. A page can outrank what
            its overall domain authority would suggest if that specific page has earned strong, relevant
            links of its own. When you're trying to rank one URL, page-level strength is often the more
            actionable signal.
          </p>

          <h2 id="how-to-improve-domain-authority">How to improve your domain authority</h2>
          <p>
            You raise authority by earning links from more unique, reputable, relevant domains — there's
            no shortcut around that. But "increase my DA" should never be the actual goal; it's a side
            effect of doing the right things:
          </p>
          <ul className="dg-list">
            <li>Earn links from strong, topically relevant sites pointing to the pages you want to rank.</li>
            <li>Publish genuinely useful content that attracts links and mentions on its own.</li>
            <li>Prioritize <em>new referring domains</em> over more links from sites that already link to you.</li>
            <li>Keep your link profile clean — avoid bought links, link schemes and spammy patterns.</li>
            <li>Be patient: authority moves slowly and updates periodically, not daily.</li>
          </ul>

          <h2 id="is-domain-authority-a-ranking-factor">Is domain authority a Google ranking factor?</h2>
          <p>
            Not directly. Google representatives have repeatedly said they don't use third-party "domain
            authority" scores. That said, Google's John Mueller has acknowledged Google has <em>some</em>{' '}
            site-wide signal that "maps to similar things," and documents from the 2024 Google leak
            referenced site-level authority-type attributes — which lines up with the long-observed
            correlation between strong backlink profiles and better rankings.
          </p>
          <p>
            The honest takeaway: DA, DR and Authority Score are <strong>proxies</strong>, not the real
            thing. They're excellent for comparison and tracking, but Google ranks pages on relevance,
            quality and many signals these scores only approximate. Use authority to benchmark and
            prioritize — not as a number to game.
          </p>

          <div className="dg-ai-callout">
            <h2 id="domain-authority-ai-search" className="dg-ai-title">
              Does domain authority matter for AI search?
            </h2>
            <p>
              AI Overviews, ChatGPT, Perplexity and other answer engines don't read a Moz DA score. They
              decide which sources to summarize and cite based on relevance, clarity and perceived
              trustworthiness on a topic. There's meaningful overlap with what authority metrics capture
              — established, well-linked sites tend to be cited more — but it isn't the same thing. A
              high-authority site with vague, hard-to-quote content can lose AI citations to a
              lower-authority page that answers the question cleanly and is structured to be lifted.
            </p>
            <p>
              So treat authority as one input into AI visibility, not the lever. To get cited by AI
              engines, pair a healthy backlink profile with clear, well-structured, genuinely
              authoritative content on the topics you want to own. Building that kind of citation-worthy
              presence is what <Link to="/">generative engine optimization</Link> is about.
            </p>
          </div>

          <h2 id="how-to-use-this-checker">How to use this checker</h2>
          <h3 id="benchmark-competitors">Benchmark against competitors</h3>
          <p>
            Run your domain alongside the sites ranking for your target keywords. If they're stronger,
            that's your gap to close; if you're stronger but still outranked, the issue is on-page or
            content, not authority.
          </p>
          <h3 id="vet-prospects">Vet backlink and guest-post prospects</h3>
          <p>
            Before pursuing a link or guest post, check the prospect's authority and the technical and
            content signals behind it. A strong score backed by real traffic, age and a clean profile is
            worth pursuing; a number propped up by little substance is not. Never judge on a single
            figure alone.
          </p>
          <h3 id="verify-yourself">Verify every score yourself</h3>
          <p>
            Unlike a black-box vendor number, every component here is source-linked. Open the Tranco
            rank, the Wayback Machine history and your live page straight from the result and confirm the
            inputs — useful when you need to defend a number to a client or a founder, not just quote it.
          </p>

          <h2 id="faq">Frequently asked questions</h2>
          <ToolFaq items={DA_FAQ} />

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

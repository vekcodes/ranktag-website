import { Link } from 'react-router-dom';
import ToolFaq from '../seo/ToolFaq';
import '../seo/toolGuide.css';

// Long-form SEO content rendered beneath the Keyword Density Checker tool.
// Written to win the tool-first query plus its informational tail (formula,
// ideal %, "does it still matter", AI-search angle). The FAQ array is the
// single source of truth for both the visible accordion and the FAQPage
// JSON-LD in DensityDashboard.jsx — keep the two identical for rich results.

export const DENSITY_FAQ = [
  [
    'How do I check keyword density for free?',
    "Paste your text or a URL into the tool and click Check. It's free and unlimited with no account required, and returns a full breakdown of keyword frequency and density percentage in seconds.",
  ],
  [
    'What is a good keyword density percentage?',
    "There's no official target, but content that reads naturally usually lands around 0.5% to 1.5% for the primary keyword. Above roughly 2.5% to 3% you risk appearing to stuff keywords. Treat these as guardrails, not goals.",
  ],
  [
    'Is keyword density a Google ranking factor?',
    'Not a direct one. Google rewards relevance and quality rather than raw repetition, and excessive density can trigger keyword-stuffing penalties. Density is best used as a diagnostic to confirm your topic is clear and not over-optimized.',
  ],
  [
    'How is keyword density calculated?',
    'Divide the number of times a keyword appears by the total word count, then multiply by 100 to get a percentage. For example, 10 mentions in a 1,000-word article equals 1% density.',
  ],
  [
    'What counts as keyword stuffing?',
    "Keyword stuffing is overloading a page with a keyword in an unnatural way to manipulate rankings, such as repeating it far more than the content warrants, listing it out of context, or hiding it. It violates Google's guidelines and can lower rankings.",
  ],
];

const RELATED = [
  {
    to: '/domain-authority-checker',
    name: 'Domain Authority Checker',
    desc: 'Score any domain on traffic rank, age, schema and transport — no Ahrefs key.',
  },
  {
    to: '/page-speed-checker',
    name: 'Page Speed Checker',
    desc: 'Server-side speed, weight and render-blocking scoring in under 5 seconds.',
  },
  {
    to: '/competitor-analysis',
    name: 'Competitor Analysis',
    desc: 'Side-by-side scoring and keyword-gap analysis against your top competitors.',
  },
];

export default function DensityGuide() {
  return (
    <section className="dg-section">
      <div className="container">
        <article className="dg-article">
          <h2 id="what-is-a-keyword-density-checker">What is a keyword density checker?</h2>
          <p>
            A keyword density checker is a tool that scans a piece of content and reports how
            frequently each word and phrase appears relative to the total word count. Instead of
            counting by hand, you get an instant breakdown of your most-used one-word, two-word,
            three-word and four-word terms, each with a frequency count and a density percentage.
          </p>
          <p>
            It answers a simple question with real consequences: <em>is my main keyword present
            often enough to signal relevance — but not so often that it reads as manipulation?</em>{' '}
            That balance is what separates content that ranks from content that gets filtered.
          </p>

          <h2 id="how-to-check-keyword-density">How to check keyword density (step-by-step)</h2>
          <ol className="dg-steps">
            <li>
              <strong>Choose your input.</strong> Use the <strong>URL</strong> tab to analyze a live
              page, or the <strong>Text</strong> tab to paste a draft that isn't published yet.
            </li>
            <li>
              <strong>Paste and run.</strong> Drop in your URL or content. The tool reads the page
              body (ignoring navigation and boilerplate) and tallies every term.
            </li>
            <li>
              <strong>Read the table.</strong> Results are grouped into 1-, 2-, 3- and 4-word
              phrases, sorted by frequency, each showing its count and density percentage.
            </li>
            <li>
              <strong>Act on it.</strong> If your target keyword is buried, work it in naturally. If
              it's over-represented, dilute it with synonyms and related terms.
            </li>
          </ol>
          <p className="dg-tip">
            <strong>Tip:</strong> run your draft <em>and</em> the top two ranking competitors.
            Comparing density side by side tells you whether you're under- or over-emphasizing your
            topic versus what's already winning.
          </p>

          <h2 id="keyword-density-formula">Keyword density formula</h2>
          <p>The keyword density formula is:</p>
          <div className="dg-formula">
            <span className="dg-formula-eq">
              Keyword density = (Number of times the keyword appears ÷ Total word count) × 100
            </span>
          </div>
          <p>
            So if your keyword appears 8 times in a 1,000-word article, its density is
            (8 ÷ 1,000) × 100 = <strong>0.8%</strong>. For multi-word phrases, count the phrase as one
            occurrence and divide by the total number of words on the page.
          </p>

          <h3 id="what-is-1-percent-keyword-density">What is 1% keyword density?</h3>
          <p>
            A 1% keyword density means your keyword appears once for every 100 words. In a
            1,000-word page, that's 10 mentions. One percent is a comfortable, natural range for most
            content — present enough to establish the topic, low enough that it never reads as forced.
          </p>

          <h2 id="ideal-keyword-density">What is the ideal keyword density?</h2>
          <p>
            There is no single "correct" percentage, and any tool that promises one is overselling.
            Google has never published a target, and the right number depends on your topic, content
            length and competition. As a practical guardrail, most pages that read naturally land
            somewhere around <strong>0.5%–1.5%</strong> for the primary keyword, and you start risking
            the appearance of stuffing above roughly <strong>2.5%–3%</strong>.
          </p>
          <p>
            The better mental model: write for the reader first, then use this tool to <em>check</em>{' '}
            that you didn't accidentally over- or under-shoot. Density is a diagnostic, not a target
            to hit.
          </p>

          <h3 id="single-vs-phrase-density">Single-keyword density vs. phrase density</h3>
          <p>
            Your exact-match keyword will almost always show a lower density than its individual
            words, because the words also appear separately and in other phrases. That's normal and
            healthy — modern search engines reward natural variation (synonyms, related terms, the
            singular and plural) far more than they reward repeating one exact phrase. Look at the
            2-, 3- and 4-word groupings, not just the single word, to understand how your topic is
            really distributed.
          </p>

          <h2 id="how-to-read-your-results">How to read your results</h2>
          <h3 id="phrase-lengths">1-word, 2-word, 3-word and 4-word phrases</h3>
          <p>
            The report splits your content into phrase lengths because intent lives in phrases, not
            isolated words. A page about "running shoes for flat feet" should show that full phrase in
            the 4-word group — not just a high count of "shoes." Scan each group: your most important
            topics should appear near the top of the lists that match how people actually search.
          </p>
          <h3 id="spot-and-fix-stuffing">How to spot (and fix) keyword stuffing</h3>
          <p>
            Keyword stuffing shows up as one term sitting far above everything else in its group — for
            example, a single keyword at 4–5% while the next term is under 1%. If you see that, you fix
            it by replacing some instances with synonyms and related concepts, breaking exact-match
            repetition across sentences, and cutting any phrase that was added for the search engine
            rather than the reader. The goal is a smooth distribution, not a spike.
          </p>

          <h2 id="does-keyword-density-still-matter">Does keyword density still matter in 2026?</h2>
          <p>
            Less than it used to, and not in the way most people think. Search engines stopped
            rewarding raw repetition years ago. What still matters is the underlying signal density was
            a crude proxy for: <em>is this page clearly, comprehensively about the thing the searcher
            wants?</em>
          </p>
          <p>
            So keyword density is best used as a <strong>diagnostic</strong> — a fast way to confirm
            your topic is unmistakable and your phrasing isn't over-optimized — rather than a lever you
            push to rank.
          </p>
          <h3 id="google-leaked-documents">What Google's leaked documents reveal</h3>
          <p>
            Google's own search documentation references a keyword-stuffing measure, and the 2024 leak
            of internal ranking attributes added detail: there are stored signals related to term
            weighting and a stuffing score that flags over-optimized pages. The takeaway isn't "hit a
            number" — it's that the <em>penalty</em> side of density is real and measurable, while the{' '}
            <em>reward</em> side has largely been replaced by relevance and quality signals. In other
            words: stuffing can hurt you; repetition can't save you.
          </p>
          <h3 id="tf-idf-and-entities">From density to TF-IDF and entities</h3>
          <p>
            Modern relevance scoring moved past simple counts. <strong>TF-IDF</strong> weighs a term by
            how often it appears on your page <em>relative to how common it is across the web</em>, so
            distinctive, on-topic terms count for more than generic ones. On top of that, search engines
            map content to <strong>entities</strong> — people, products, concepts and their
            relationships — rather than just matching strings. Practically, that means covering the{' '}
            <em>related</em> concepts a topic implies will do more for rankings than repeating the head
            keyword. Use this checker to confirm coverage and catch over-emphasis; use a keyword
            research or content-optimization tool to find the related terms you're missing.
          </p>

          <div className="dg-ai-callout">
            <h2 id="keyword-density-ai-search" className="dg-ai-title">
              Does keyword density matter for AI search?
            </h2>
            <p>
              AI Overviews, ChatGPT, Perplexity and other answer engines don't count keyword density
              the way a 2010-era algorithm did. They extract meaning, summarize, and cite sources they
              judge to be clear and authoritative on a topic. Stuffing a keyword does nothing to earn a
              citation — and can actively work against you, because over-optimized, repetitive copy is
              harder for a model to parse into a clean, quotable answer.
            </p>
            <p>
              What earns visibility in AI search is the same thing density was always a weak proxy for:
              unambiguous topical focus, clear definitions, and content structured so a machine can lift
              a direct answer. So use this tool to make sure your topic is obvious and your phrasing is
              clean — then optimize for <em>being quoted</em>, not for hitting a percentage. That shift
              from ranking to being cited is exactly what{' '}
              <Link to="/">generative engine optimization</Link> is about.
            </p>
          </div>

          <h2 id="when-to-use-this-tool">When to use this tool</h2>
          <h3 id="competitor-content-analysis">Competitor content analysis</h3>
          <p>
            Drop in a top-ranking competitor's URL to instantly see which keywords and phrases they
            emphasize. It's the fastest way to reverse-engineer the topical focus of a page that's
            already winning, so you can match its coverage and then go deeper.
          </p>
          <h3 id="pre-publish-checks">Pre-publish content checks</h3>
          <p>
            Run drafts before they go live. Checking density on text input lets you catch an accidental
            over-used phrase or a missing target keyword <em>before</em> publication, instead of editing
            a live page after it's already been crawled.
          </p>

          <h2 id="best-practices">Keyword density best practices</h2>
          <ul className="dg-list">
            <li>Write for the reader first; check density second.</li>
            <li>Keep your primary keyword present but natural — think "clearly on-topic," not "hit 1.5%."</li>
            <li>Lean on synonyms, related terms and natural variations instead of repeating one exact phrase.</li>
            <li>Place your keyword where it carries weight: title tag, H1, the first 100 words, at least one subheading, and naturally through the body.</li>
            <li>Cover the <em>related concepts</em> a topic implies — breadth beats repetition.</li>
            <li>Re-check after editing; small rewrites shift distribution more than you'd expect.</li>
          </ul>

          <h2 id="privacy">Your content is never stored</h2>
          <p>
            When you paste text into this tool, your content is analyzed in the moment and never stored,
            logged, or read by a human. When you check by URL, the tool only fetches the publicly
            available page body. Your drafts stay yours.
          </p>

          <h2 id="faq">Frequently asked questions</h2>
          <ToolFaq items={DENSITY_FAQ} />

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

import { useMemo, useState } from 'react';
import Nav from '../components/Nav.jsx';
import './ToolPage.css';

const STOP_WORDS = new Set([
  'a','an','and','are','as','at','be','been','being','but','by','do','does','did','for','from',
  'has','have','having','he','her','hers','him','his','i','if','in','into','is','it','its','itself',
  'me','my','no','nor','not','of','on','or','our','ours','out','over','own','same','she','so',
  'some','such','than','that','the','their','theirs','them','they','this','those','through','to',
  'too','under','until','up','very','was','we','were','what','when','where','which','while','who',
  'whom','why','will','with','you','your','yours','yourself','yourselves','should','would','could',
  'can','am','about','above','after','again','against','all','also','any','because','before','below',
  'between','both','during','each','few','more','most','other','only','off','these','there','here',
  'just','then','these'
]);

function analyse(text, target) {
  const cleaned = (text || '').toLowerCase().replace(/[^a-z0-9\s'-]/g, ' ');
  const tokens = cleaned.split(/\s+/).filter(Boolean);
  const totalWords = tokens.length;

  const wordCounts = new Map();
  const bigramCounts = new Map();
  const trigramCounts = new Map();

  for (let i = 0; i < tokens.length; i++) {
    const w = tokens[i];
    if (w.length < 2 || STOP_WORDS.has(w)) continue;
    wordCounts.set(w, (wordCounts.get(w) || 0) + 1);
  }
  for (let i = 0; i < tokens.length - 1; i++) {
    if (STOP_WORDS.has(tokens[i]) || STOP_WORDS.has(tokens[i + 1])) continue;
    if (tokens[i].length < 2 || tokens[i + 1].length < 2) continue;
    const bg = `${tokens[i]} ${tokens[i + 1]}`;
    bigramCounts.set(bg, (bigramCounts.get(bg) || 0) + 1);
  }
  for (let i = 0; i < tokens.length - 2; i++) {
    if (STOP_WORDS.has(tokens[i]) && STOP_WORDS.has(tokens[i + 2])) continue;
    if (tokens[i].length < 2 || tokens[i + 1].length < 2 || tokens[i + 2].length < 2) continue;
    const tg = `${tokens[i]} ${tokens[i + 1]} ${tokens[i + 2]}`;
    trigramCounts.set(tg, (trigramCounts.get(tg) || 0) + 1);
  }

  const toRanked = (m, limit = 12) =>
    [...m.entries()]
      .map(([term, count]) => ({
        term,
        count,
        density: totalWords ? (count / totalWords) * 100 : 0,
      }))
      .filter((r) => r.count >= 2)
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);

  const sentences = (text || '').split(/[.!?]+/).filter((s) => s.trim().length > 0).length;

  // Target keyword analysis (case-insensitive, multi-word allowed)
  let targetReadout = null;
  if (target && target.trim()) {
    const t = target.trim().toLowerCase();
    const targetTokens = t.split(/\s+/).length;
    const re = new RegExp(`\\b${t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g');
    const targetMatches = (cleaned.match(re) || []).length;
    const density = totalWords ? (targetMatches * targetTokens / totalWords) * 100 : 0;
    let verdict = '';
    let verdictClass = '';
    if (totalWords < 100) {
      verdict = 'Add more content. We need at least 100 words to read density honestly.';
      verdictClass = 'low';
    } else if (density === 0) {
      verdict = 'Target keyword does not appear yet. Drop it into the H1, the first 100 words, and one subhead.';
      verdictClass = 'low';
    } else if (density > 3.5) {
      verdict = 'Too high. Modern Google penalises stuffed pages. Aim for 0.8 to 2.5%.';
      verdictClass = 'high';
    } else if (density < 0.6) {
      verdict = 'A bit thin. Aim for 0.8 to 2.5% on a target keyword.';
      verdictClass = 'low';
    } else {
      verdict = 'Healthy density. You are in the natural range Google rewards.';
      verdictClass = 'good';
    }
    targetReadout = { keyword: target.trim(), matches: targetMatches, density, verdict, verdictClass };
  }

  return {
    totalWords,
    uniqueWords: wordCounts.size,
    sentences,
    avgWordsPerSentence: sentences ? +(totalWords / sentences).toFixed(1) : 0,
    words: toRanked(wordCounts),
    bigrams: toRanked(bigramCounts, 8),
    trigrams: toRanked(trigramCounts, 6),
    targetReadout,
  };
}

export default function KeywordDensity() {
  const [text, setText] = useState('');
  const [target, setTarget] = useState('');

  const result = useMemo(() => analyse(text, target), [text, target]);
  const top1 = result.words[0];
  const maxCount = top1 ? top1.count : 1;

  return (
    <>
      <Nav />

      <section className="tool-hero" style={{paddingBottom: '56px'}}>
        <div className="tool-hero-bg"></div>
        <div className="container tool-hero-inner">
          <div className="eyebrow no-line" style={{justifyContent: 'center', marginBottom: '24px'}}>★ FREE TOOL · INSTANT · CLIENT-SIDE</div>
          <h1>
            Keyword density,<br />
            <span className="ser">measured the way</span><br />
            <span className="accent">Google reads it.</span>
          </h1>
          <p>
            Paste your page copy. Get word count, top keywords, two-word and three-word phrase frequency, and an honest verdict on your target keyword density. Stays on your device. We never see the text.
          </p>
        </div>
      </section>

      <div className="kwd-wrap">
        <div className="kwd-grid">
          <div className="kwd-input-card">
            <div className="apply-label">Your content</div>
            <textarea
              className="kwd-textarea"
              placeholder="Paste the article, landing page copy, or product description you want to analyse."
              value={text}
              onChange={(e) => setText(e.target.value)}
            ></textarea>
            <div className="apply-label" style={{marginTop:'18px'}}>Target keyword (optional)</div>
            <input
              type="text"
              className="kwd-target"
              placeholder="e.g. cold outreach software"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
            />
            <p className="fineprint" style={{marginTop:'12px'}}>
              Tip: target a single, specific phrase. "saas seo agency" not "agency".
            </p>
          </div>

          <div className="kwd-output-card">
            <div className="kwd-stats">
              <div className="kwd-stat">
                <div className="kwd-stat-lbl">Words</div>
                <div className="kwd-stat-num">{result.totalWords}</div>
              </div>
              <div className="kwd-stat">
                <div className="kwd-stat-lbl">Unique</div>
                <div className="kwd-stat-num">{result.uniqueWords}</div>
              </div>
              <div className="kwd-stat">
                <div className="kwd-stat-lbl">Avg / sentence</div>
                <div className="kwd-stat-num">{result.avgWordsPerSentence || 0}</div>
              </div>
            </div>

            {result.targetReadout && (
              <div className="kwd-target-readout">
                <div className="lbl">Target keyword density</div>
                <div className="row">
                  <span className="kw">"{result.targetReadout.keyword}"</span>
                  <span className="pct">{result.targetReadout.density.toFixed(2)}% · {result.targetReadout.matches}×</span>
                </div>
                <div className={`verdict ${result.targetReadout.verdictClass}`}>{result.targetReadout.verdict}</div>
              </div>
            )}

            {result.words.length === 0 ? (
              <div className="kwd-empty">Paste at least a paragraph to see a keyword breakdown.</div>
            ) : (
              <>
                <h3 className="apply-label" style={{marginBottom:'10px'}}>Top single keywords</h3>
                <table className="kwd-table" style={{marginBottom:'18px'}}>
                  <thead>
                    <tr>
                      <th>Keyword</th>
                      <th>Count</th>
                      <th>Density</th>
                      <th className="bar-cell"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.words.map((w) => (
                      <tr key={w.term}>
                        <td><strong>{w.term}</strong></td>
                        <td>{w.count}</td>
                        <td>{w.density.toFixed(2)}%</td>
                        <td className="bar-cell">
                          <div className="kwd-bar"><div className="kwd-bar-fill" style={{width: `${(w.count/maxCount)*100}%`}}></div></div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {result.bigrams.length > 0 && (
                  <>
                    <h3 className="apply-label" style={{marginBottom:'10px'}}>Top 2-word phrases</h3>
                    <table className="kwd-table" style={{marginBottom:'18px'}}>
                      <thead>
                        <tr><th>Phrase</th><th>Count</th><th>Density</th></tr>
                      </thead>
                      <tbody>
                        {result.bigrams.map((b) => (
                          <tr key={b.term}>
                            <td><strong>{b.term}</strong></td>
                            <td>{b.count}</td>
                            <td>{b.density.toFixed(2)}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </>
                )}

                {result.trigrams.length > 0 && (
                  <>
                    <h3 className="apply-label" style={{marginBottom:'10px'}}>Top 3-word phrases</h3>
                    <table className="kwd-table">
                      <thead>
                        <tr><th>Phrase</th><th>Count</th><th>Density</th></tr>
                      </thead>
                      <tbody>
                        {result.trigrams.map((t) => (
                          <tr key={t.term}>
                            <td><strong>{t.term}</strong></td>
                            <td>{t.count}</td>
                            <td>{t.density.toFixed(2)}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </>
                )}
              </>
            )}
          </div>
        </div>

        <div style={{marginTop:'48px', textAlign:'center'}}>
          <p className="fineprint" style={{marginBottom:'18px'}}>
            Want a real human to read your copy and tell you what to fix? Apply for a founder review, free.
          </p>
          <div style={{display:'flex', gap:'12px', justifyContent:'center', flexWrap:'wrap'}}>
            <a href="/audit" className="btn btn-primary btn-lg">Get a founder review <span className="ar">↗</span></a>
            <a href="/backlink-checker" className="btn btn-outline btn-lg">Try the backlink checker <span className="ar">↗</span></a>
          </div>
        </div>
      </div>

      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div>
              <a href="/" className="nav-logo" style={{color: 'var(--paper)'}}>
                <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                  <rect className="lg-r1" x="30" y="20" width="50" height="50"/>
                  <rect className="lg-r3" x="20" y="50" width="30" height="30" style={{fill: 'var(--paper)'}}/>
                  <rect className="lg-r2" x="40" y="45" width="25" height="20"/>
                </svg>
                RankedTag
              </a>
              <p className="footer-blurb">The Inbound Engine for SaaS founders who would rather build product than babysit an agency.</p>
            </div>
            <div className="footer-col">
              <h4>The product</h4>
              <a href="/#mechanism">How it works</a>
              <a href="/#proof">Sendr.ai story</a>
              <a href="/#apply">Apply</a>
            </div>
            <div className="footer-col">
              <h4>Free tools</h4>
              <a href="/technical-audit">Technical + Non-tech Audit</a>
              <a href="/backlink-checker">Backlink Checker</a>
              <a href="/keyword-density">Keyword Density</a>
              <a href="/page-speed">Page Speed</a>
            </div>
            <div className="footer-col">
              <h4>Company</h4>
              <a href="mailto:hello@rankedtag.com">hello@rankedtag.com</a>
            </div>
          </div>
          <div className="footer-bottom">
            <span>© 2026 RANKEDTAG · BUILT FOR FOUNDERS, NOT MARKETERS</span>
          </div>
        </div>
      </footer>
    </>
  );
}

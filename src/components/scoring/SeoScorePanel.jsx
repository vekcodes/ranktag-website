import { useMemo, useState, memo } from 'react';
import { computeSeoScore } from '../../utils/seoScorer';

const CATEGORY_ICONS = {
  'Keyword Optimization': 'KO',
  'Content Structure': 'CS',
  'Readability': 'RD',
  'Keyword Prominence': 'KP',
  'Semantic Coverage': 'SC',
  'Keyword Distribution': 'KD',
};

function scoreColor(s) {
  if (s >= 80) return 'var(--success)';
  if (s >= 60) return 'var(--warn)';
  return 'var(--red)';
}

function severityIcon(sev) {
  if (sev === 'critical') return '!!';
  if (sev === 'warning') return '!';
  return 'i';
}

/**
 * Real-time SEO score panel.
 * Computes scores client-side from session data — zero backend latency.
 */
function SeoScorePanel({ keywords, content, totalWords }) {
  const [expanded, setExpanded] = useState(true);

  const score = useMemo(
    () => computeSeoScore(keywords, content, totalWords),
    [keywords, content, totalWords],
  );

  if (!score) return null;

  return (
    <div className="sc-panel">
      <button className="sc-panel-toggle" onClick={() => setExpanded(!expanded)}>
        <span className="sc-panel-toggle-left">
          <span className="sc-panel-toggle-icon">{expanded ? '\u25BE' : '\u25B8'}</span>
          SEO Score
        </span>
        <span className="sc-panel-toggle-badge" style={{ background: scoreColor(score.overall) }}>
          {score.overall} / 100
        </span>
      </button>

      {expanded && (
        <div className="sc-panel-body">
          {/* ── Overall gauge ── */}
          <div className="sc-overall">
            <div className="sc-gauge-wrap">
              <svg viewBox="0 0 120 70" className="sc-gauge-svg">
                <path
                  d={arcPath(60, 62, 48, -180, 0)}
                  fill="none" stroke="var(--paper-3)" strokeWidth="10" strokeLinecap="round"
                />
                <path
                  d={arcPath(60, 62, 48, -180, -180 + (score.overall / 100) * 180)}
                  fill="none" stroke={scoreColor(score.overall)} strokeWidth="10" strokeLinecap="round"
                  style={{ transition: 'all 0.6s cubic-bezier(.2,.7,.2,1)' }}
                />
                <text x="60" y="52" textAnchor="middle" className="sc-gauge-val" fill={scoreColor(score.overall)}>
                  {Math.round(score.overall)}
                </text>
                <text x="60" y="66" textAnchor="middle" className="sc-gauge-grade" fill="var(--muted)">
                  Grade {score.grade}
                </text>
              </svg>
            </div>
          </div>

          {/* ── Category scores ── */}
          <div className="sc-cats">
            {score.categories.map((cat) => (
              <div key={cat.name} className="sc-cat">
                <div className="sc-cat-left">
                  <span className="sc-cat-icon" style={{ color: scoreColor(cat.score) }}>
                    {CATEGORY_ICONS[cat.name] || '?'}
                  </span>
                  <span className="sc-cat-name">{cat.name}</span>
                  <span className="sc-cat-weight">{cat.weight}%</span>
                </div>
                <div className="sc-cat-right">
                  <div className="sc-cat-bar">
                    <div
                      className="sc-cat-bar-fill"
                      style={{
                        width: `${cat.score}%`,
                        background: scoreColor(cat.score),
                        transition: 'width 0.4s cubic-bezier(.2,.7,.2,1)',
                      }}
                    />
                  </div>
                  <span className="sc-cat-score" style={{ color: scoreColor(cat.score) }}>
                    {Math.round(cat.score)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* ── Readability metrics ── */}
          <div className="sc-readability">
            <div className="sc-section-head">Readability</div>
            <div className="sc-rd-grid">
              <div className="sc-rd-metric">
                <span className="sc-rd-val">{score.readability.fre}</span>
                <span className="sc-rd-lbl">Flesch Score</span>
              </div>
              <div className="sc-rd-metric">
                <span className="sc-rd-val">{score.readability.grade}</span>
                <span className="sc-rd-lbl">Grade Level</span>
              </div>
              <div className="sc-rd-metric">
                <span className="sc-rd-val">{score.readability.avgSL}</span>
                <span className="sc-rd-lbl">Avg Sentence</span>
              </div>
              <div className="sc-rd-metric">
                <span className="sc-rd-val" style={{ color: score.readability.passivePct > 15 ? 'var(--warn)' : 'var(--ink)' }}>
                  {score.readability.passivePct}%
                </span>
                <span className="sc-rd-lbl">Passive Voice</span>
              </div>
            </div>
            <div className="sc-rd-level">
              <span className="sc-rd-level-dot" style={{ background: scoreColor(score.readability.score) }} />
              {score.readability.level}
            </div>
          </div>

          {/* ── Warnings ── */}
          {score.warnings.length > 0 && (
            <div className="sc-section">
              <div className="sc-section-head sc-section-warn">Warnings</div>
              {score.warnings.map((w, i) => (
                <div key={i} className="sc-rec sc-rec-critical">
                  <span className="sc-rec-icon sc-rec-icon-critical">{severityIcon(w.severity)}</span>
                  <div>
                    <div className="sc-rec-msg">{w.message}</div>
                    <div className="sc-rec-detail">{w.detail}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── Recommendations ── */}
          {score.recommendations.length > 0 && (
            <div className="sc-section">
              <div className="sc-section-head">Recommendations</div>
              {score.recommendations.map((r, i) => (
                <div key={i} className={`sc-rec sc-rec-${r.severity}`}>
                  <span className={`sc-rec-icon sc-rec-icon-${r.severity}`}>{severityIcon(r.severity)}</span>
                  <div>
                    <div className="sc-rec-msg">{r.message}</div>
                    <div className="sc-rec-detail">{r.detail}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── Strengths ── */}
          {score.strengths.length > 0 && (
            <div className="sc-section">
              <div className="sc-section-head sc-section-good">Strengths</div>
              {score.strengths.map((s, i) => (
                <div key={i} className="sc-strength">
                  <span className="sc-strength-check">&#10003;</span>
                  <span>{s.message}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// SVG arc helper
function arcPath(cx, cy, r, startAngle, endAngle) {
  const s = polar(cx, cy, r, endAngle);
  const e = polar(cx, cy, r, startAngle);
  const large = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 0 ${e.x} ${e.y}`;
}
function polar(cx, cy, r, deg) {
  const rad = (deg * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

export default memo(SeoScorePanel);

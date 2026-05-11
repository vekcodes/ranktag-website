/**
 * SEO insights sidebar — shows top keywords, density warnings, and tips.
 */
export default function InsightsPanel({ keywords, totalWords }) {
  const topGrams = keywords?.['1gram'] || [];
  if (topGrams.length === 0 && !totalWords) return null;

  const stuffed = topGrams.filter((k) => k.density > 3.5);
  const healthy = topGrams.filter((k) => k.density >= 0.8 && k.density <= 2.5);
  const weak = topGrams.filter((k) => k.density < 0.5 && k.count >= 2);

  return (
    <div className="ds-insights">
      <div className="ds-insights-title">SEO Insights</div>

      {/* Top 5 keywords */}
      <div className="ds-insight-section">
        <div className="ds-insight-heading">Top Keywords</div>
        {topGrams.slice(0, 5).map((kw) => (
          <div key={kw.keyword} className="ds-insight-kw">
            <code>{kw.keyword}</code>
            <span className="ds-insight-kw-meta">
              {kw.count}x &middot; {kw.density}%
            </span>
          </div>
        ))}
      </div>

      {/* Warnings */}
      {stuffed.length > 0 && (
        <div className="ds-insight-section ds-insight-warn">
          <div className="ds-insight-heading">
            <span className="ds-insight-dot" style={{ background: 'var(--red)' }} />
            Keyword Stuffing Warning
          </div>
          <p className="ds-insight-text">
            {stuffed.length} keyword{stuffed.length > 1 ? 's' : ''} above 3.5% density.
            Search engines may penalize over-optimized content.
          </p>
          {stuffed.slice(0, 3).map((kw) => (
            <div key={kw.keyword} className="ds-insight-kw">
              <code>{kw.keyword}</code>
              <span className="ds-insight-kw-bad">{kw.density}%</span>
            </div>
          ))}
        </div>
      )}

      {/* Healthy range */}
      {healthy.length > 0 && (
        <div className="ds-insight-section ds-insight-good">
          <div className="ds-insight-heading">
            <span className="ds-insight-dot" style={{ background: 'var(--success)' }} />
            Healthy Density (0.8–2.5%)
          </div>
          {healthy.slice(0, 4).map((kw) => (
            <div key={kw.keyword} className="ds-insight-kw">
              <code>{kw.keyword}</code>
              <span className="ds-insight-kw-good">{kw.density}%</span>
            </div>
          ))}
        </div>
      )}

      {/* Content tips */}
      <div className="ds-insight-section">
        <div className="ds-insight-heading">Content Tips</div>
        <ul className="ds-insight-tips">
          {totalWords < 300 && (
            <li>Content is short ({totalWords} words). Aim for 800+ words for SEO.</li>
          )}
          {totalWords >= 300 && totalWords < 800 && (
            <li>Content length is moderate. Consider expanding to 1,000+ words.</li>
          )}
          {totalWords >= 800 && (
            <li>Content length is good for SEO ({totalWords.toLocaleString()} words).</li>
          )}
          {stuffed.length === 0 && healthy.length > 0 && (
            <li>No keyword stuffing detected. Keywords are naturally distributed.</li>
          )}
          {topGrams.length < 3 && totalWords > 100 && (
            <li>Content lacks keyword variety. Add more topic-relevant terms.</li>
          )}
        </ul>
      </div>
    </div>
  );
}

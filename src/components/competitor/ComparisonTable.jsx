import { memo } from 'react';

function scoreColor(s) {
  if (s >= 80) return 'var(--success)';
  if (s >= 60) return 'var(--warn)';
  return 'var(--red)';
}

function truncate(s, n = 40) {
  return s && s.length > n ? s.slice(0, n) + '...' : s || '-';
}

/**
 * Side-by-side comparison table of primary vs competitors.
 */
function ComparisonTable({ primary, competitors, benchmarks }) {
  if (!primary) return null;

  const validComps = competitors.filter((c) => !c.error);
  const allPages = [primary, ...validComps];

  const rows = [
    { label: 'SEO Score', key: 'overall_score', format: (v) => v, color: true },
    { label: 'Grade', key: 'grade' },
    { label: 'Word Count', key: 'word_count', format: (v) => v?.toLocaleString() },
    { label: 'Paragraphs', key: 'paragraph_count' },
    { label: 'Headings', key: 'heading_count' },
    { label: 'Keywords (1g)', key: '_kw_count', compute: (p) => p.keywords?.['1gram']?.length || 0 },
    { label: 'Top Density', key: '_top_density', compute: (p) => p.keywords?.['1gram']?.[0]?.density || 0, suffix: '%' },
    { label: 'Readability', key: '_readability', compute: (p) => p.readability?.flesch_reading_ease || 0 },
    { label: 'Read Level', key: '_read_level', compute: (p) => p.readability?.reading_level || '-' },
  ];

  return (
    <div className="cp-table-wrap">
      <div className="cp-table-head-label">Side-by-Side Comparison</div>
      <div className="cp-table-scroll">
        <table className="cp-table">
          <thead>
            <tr>
              <th className="cp-table-metric">Metric</th>
              <th className="cp-table-primary">
                <span className="cp-table-you">You</span>
                <span className="cp-table-url">{truncate(primary.title || primary.url, 30)}</span>
              </th>
              {validComps.map((c, i) => (
                <th key={i} className="cp-table-comp">
                  <span className="cp-table-comp-num">C{i + 1}</span>
                  <span className="cp-table-url">{truncate(c.title || c.url, 30)}</span>
                </th>
              ))}
              {benchmarks && (
                <th className="cp-table-avg">
                  <span className="cp-table-avg-label">Avg</span>
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label}>
                <td className="cp-table-metric-cell">{row.label}</td>
                {allPages.map((page, pi) => {
                  const val = row.compute ? row.compute(page) : page[row.key];
                  const display = row.format ? row.format(val) : val;
                  const style = row.color && typeof val === 'number' ? { color: scoreColor(val), fontWeight: 700 } : {};
                  return (
                    <td key={pi} className={pi === 0 ? 'cp-table-primary-cell' : 'cp-table-comp-cell'} style={style}>
                      {display}{row.suffix || ''}
                    </td>
                  );
                })}
                {benchmarks && (
                  <td className="cp-table-avg-cell">
                    {row.key === 'overall_score' ? benchmarks.avg_overall_score :
                     row.key === 'word_count' ? Math.round(benchmarks.avg_word_count).toLocaleString() :
                     row.key === 'paragraph_count' ? Math.round(benchmarks.avg_paragraph_count) :
                     row.key === 'heading_count' ? Math.round(benchmarks.avg_heading_count) :
                     row.key === '_kw_count' ? Math.round(benchmarks.avg_keyword_count) :
                     row.key === '_top_density' ? `${benchmarks.avg_top_density}%` :
                     row.key === '_readability' ? benchmarks.avg_readability_score :
                     '-'}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default memo(ComparisonTable);

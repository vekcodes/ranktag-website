import { useState, useMemo } from 'react';

/**
 * Advanced keyword table with tabs for 1/2/3-grams, sorting, and density bars.
 */
export default function KeywordTable({ keywords, totalWords }) {
  const [tab, setTab] = useState('1gram');
  const [sortBy, setSortBy] = useState('count');
  const [filterText, setFilterText] = useState('');

  const data = useMemo(() => {
    const list = keywords?.[tab] || [];
    let filtered = list;
    if (filterText) {
      const q = filterText.toLowerCase();
      filtered = list.filter((k) => k.keyword.includes(q));
    }
    return [...filtered].sort((a, b) => {
      if (sortBy === 'density') return b.density - a.density;
      if (sortBy === 'keyword') return a.keyword.localeCompare(b.keyword);
      return b.count - a.count;
    });
  }, [keywords, tab, sortBy, filterText]);

  const maxCount = data[0]?.count || 1;

  const densityColor = (d) => {
    if (d > 3.5) return 'var(--red)';
    if (d > 2.0) return 'var(--warn)';
    if (d > 0.8) return 'var(--success)';
    return 'var(--muted)';
  };

  const tabs = [
    { key: '1gram', label: '1-Word' },
    { key: '2gram', label: '2-Word' },
    { key: '3gram', label: '3-Word' },
  ];

  return (
    <div className="ds-kw-table-wrap">
      <div className="ds-kw-header">
        <div className="ds-kw-tabs">
          {tabs.map((t) => (
            <button
              key={t.key}
              className={`ds-kw-tab ${tab === t.key ? 'active' : ''}`}
              onClick={() => setTab(t.key)}
            >
              {t.label}
              <span className="ds-kw-tab-count">{keywords?.[t.key]?.length || 0}</span>
            </button>
          ))}
        </div>
        <div className="ds-kw-controls">
          <input
            className="ds-kw-filter"
            placeholder="Filter keywords..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
          />
          <select
            className="ds-kw-sort"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="count">Sort: Frequency</option>
            <option value="density">Sort: Density</option>
            <option value="keyword">Sort: A-Z</option>
          </select>
        </div>
      </div>

      <div className="ds-kw-table-scroll">
        <table className="ds-kw-table">
          <thead>
            <tr>
              <th className="ds-kw-th-rank">#</th>
              <th className="ds-kw-th-kw">Keyword</th>
              <th className="ds-kw-th-num">Count</th>
              <th className="ds-kw-th-num">Density</th>
              <th className="ds-kw-th-bar">Distribution</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={5} className="ds-kw-empty">
                  {filterText ? 'No keywords match your filter.' : 'Start typing to see keywords.'}
                </td>
              </tr>
            ) : (
              data.map((kw, i) => (
                <tr key={kw.keyword} className={kw.density > 3.5 ? 'ds-kw-row-warn' : ''}>
                  <td className="ds-kw-rank">{i + 1}</td>
                  <td className="ds-kw-keyword">
                    <code>{kw.keyword}</code>
                  </td>
                  <td className="ds-kw-count">{kw.count}</td>
                  <td className="ds-kw-density" style={{ color: densityColor(kw.density) }}>
                    {kw.density}%
                  </td>
                  <td className="ds-kw-bar-cell">
                    <div className="ds-kw-bar">
                      <div
                        className="ds-kw-bar-fill"
                        style={{
                          width: `${Math.round((kw.count / maxCount) * 100)}%`,
                          background: densityColor(kw.density),
                        }}
                      />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalWords > 0 && (
        <div className="ds-kw-footer">
          <span className="ds-kw-footer-note">
            Density = (keyword count / {totalWords.toLocaleString()} total words) x 100
          </span>
          <span className="ds-kw-footer-legend">
            <span style={{ color: 'var(--success)' }}>■</span> Healthy
            <span style={{ color: 'var(--warn)', marginLeft: 12 }}>■</span> High
            <span style={{ color: 'var(--red)', marginLeft: 12 }}>■</span> Stuffed
          </span>
        </div>
      )}
    </div>
  );
}

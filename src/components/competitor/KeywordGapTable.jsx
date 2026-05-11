import { useState, useMemo, memo } from 'react';

function gapColor(type) {
  if (type === 'missing') return 'var(--red)';
  if (type === 'underused') return 'var(--warn)';
  if (type === 'unique_advantage') return 'var(--success)';
  return 'var(--muted)';
}

function gapLabel(type) {
  if (type === 'missing') return 'Missing';
  if (type === 'underused') return 'Underused';
  if (type === 'overused') return 'Overused';
  if (type === 'unique_advantage') return 'Unique';
  return 'Shared';
}

/**
 * Keyword gap analysis table with tabs for missing/shared/unique.
 */
function KeywordGapTable({ gaps, shared, unique, competitorCount }) {
  const [tab, setTab] = useState('gaps');
  const [filter, setFilter] = useState('');

  const data = useMemo(() => {
    const source = tab === 'gaps' ? gaps : tab === 'shared' ? shared : unique;
    if (!filter) return source || [];
    const q = filter.toLowerCase();
    return (source || []).filter((g) => g.keyword.includes(q));
  }, [tab, gaps, shared, unique, filter]);

  const tabs = [
    { key: 'gaps', label: 'Missing Keywords', count: gaps?.length || 0, color: 'var(--red)' },
    { key: 'shared', label: 'Shared', count: shared?.length || 0, color: 'var(--muted)' },
    { key: 'unique', label: 'Your Advantages', count: unique?.length || 0, color: 'var(--success)' },
  ];

  return (
    <div className="cp-gap-wrap">
      <div className="cp-gap-header">
        <div className="cp-gap-tabs">
          {tabs.map((t) => (
            <button
              key={t.key}
              className={`cp-gap-tab ${tab === t.key ? 'active' : ''}`}
              onClick={() => setTab(t.key)}
            >
              {t.label}
              <span className="cp-gap-tab-count" style={{ color: tab === t.key ? t.color : undefined }}>
                {t.count}
              </span>
            </button>
          ))}
        </div>
        <input
          className="cp-gap-filter"
          placeholder="Filter..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </div>

      <div className="cp-gap-scroll">
        <table className="cp-gap-table">
          <thead>
            <tr>
              <th>Keyword</th>
              <th className="cp-gap-num">You</th>
              <th className="cp-gap-num">Comp Avg</th>
              <th className="cp-gap-num">Used By</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr><td colSpan={6} className="cp-gap-empty">No keywords in this category.</td></tr>
            ) : data.map((g) => (
              <tr key={g.keyword}>
                <td className="cp-gap-kw"><code>{g.keyword}</code></td>
                <td className="cp-gap-num">{g.primary_count > 0 ? `${g.primary_count} (${g.primary_density}%)` : '-'}</td>
                <td className="cp-gap-num">{g.competitor_avg_count > 0 ? `${g.competitor_avg_count} (${g.competitor_avg_density}%)` : '-'}</td>
                <td className="cp-gap-num">{g.competitor_presence > 0 ? `${g.competitor_presence}/${competitorCount}` : '-'}</td>
                <td>
                  <span className="cp-gap-badge" style={{ color: gapColor(g.gap_type), borderColor: gapColor(g.gap_type) }}>
                    {gapLabel(g.gap_type)}
                  </span>
                </td>
                <td className="cp-gap-action">{g.suggested_action || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default memo(KeywordGapTable);

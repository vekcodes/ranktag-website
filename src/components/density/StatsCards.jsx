/**
 * Statistics cards row — shows key metrics with animated counters.
 */
export default function StatsCards({ stats, processing }) {
  if (!stats) return null;

  const cards = [
    { label: 'Total Words',    value: stats.total_words,    icon: 'W',  accent: '--ink' },
    { label: 'Unique Words',   value: stats.unique_words ?? stats.filtered_words, icon: 'U', accent: '--periwinkle-deep' },
    { label: 'Filtered Words', value: stats.filtered_words, icon: 'F',  accent: '--success' },
    { label: 'Blocks',         value: stats.block_count ?? '-', icon: 'B', accent: '--gold' },
  ];

  const readTime = Math.max(1, Math.ceil((stats.total_words || 0) / 238));

  return (
    <div className="ds-stats-row">
      {cards.map((c) => (
        <div key={c.label} className="ds-stat-card">
          <div className="ds-stat-icon" style={{ color: `var(${c.accent})` }}>{c.icon}</div>
          <div className="ds-stat-num">{typeof c.value === 'number' ? c.value.toLocaleString() : c.value}</div>
          <div className="ds-stat-lbl">{c.label}</div>
        </div>
      ))}
      <div className="ds-stat-card">
        <div className="ds-stat-icon" style={{ color: 'var(--warn)' }}>T</div>
        <div className="ds-stat-num">{readTime} min</div>
        <div className="ds-stat-lbl">Read Time</div>
      </div>
      {processing && (
        <div className="ds-stat-card ds-stat-perf">
          <div className="ds-stat-icon" style={{ color: 'var(--red)' }}>⚡</div>
          <div className="ds-stat-num">{processing.total_processing_ms < 1 ? '<1' : Math.round(processing.total_processing_ms)} ms</div>
          <div className="ds-stat-lbl">
            {processing.is_full_reprocess ? 'Full Process' : `${processing.reprocessed_blocks}/${processing.total_blocks} blocks`}
          </div>
        </div>
      )}
    </div>
  );
}

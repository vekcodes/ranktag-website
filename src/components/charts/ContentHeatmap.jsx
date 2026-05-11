import { useMemo } from 'react';
import { toContentHeatmap, COLORS } from '../../utils/chartTransforms';

/**
 * Heatmap showing keyword intensity across content blocks.
 * Each row = a content block, columns = top keywords, cells = hit count.
 * Pure CSS grid — no chart library needed.
 */
export default function ContentHeatmap({ content, keywords }) {
  const heatData = useMemo(
    () => toContentHeatmap(content, keywords),
    [content, keywords],
  );

  const topKws = useMemo(
    () => (keywords?.['1gram'] || []).slice(0, 6).map((k) => k.keyword),
    [keywords],
  );

  if (heatData.length === 0 || topKws.length === 0) return null;

  // Find global max for color scaling
  const globalMax = Math.max(1, ...heatData.flatMap((b) => topKws.map((kw) => b.kwHits[kw] || 0)));

  const cellColor = (hits) => {
    if (hits === 0) return COLORS.paper2;
    const t = hits / globalMax;
    if (t > 0.7) return COLORS.red;
    if (t > 0.4) return COLORS.warn;
    if (t > 0.15) return COLORS.success;
    return '#b8d4c8';
  };

  return (
    <div className="ch-card">
      <div className="ch-card-head">
        <div className="ch-card-title">Content Distribution</div>
        <div className="ch-card-sub">Keyword frequency across content sections</div>
      </div>
      <div className="ch-heat-scroll">
        <table className="ch-heat-table" role="grid" aria-label="Keyword distribution heatmap">
          <thead>
            <tr>
              <th className="ch-heat-corner">Section</th>
              {topKws.map((kw) => (
                <th key={kw} className="ch-heat-kw-head"><code>{kw}</code></th>
              ))}
              <th className="ch-heat-total-head">Total</th>
            </tr>
          </thead>
          <tbody>
            {heatData.map((block) => (
              <tr key={block.index}>
                <td className="ch-heat-block-label">
                  {block.label}
                  <span className="ch-heat-word-count">{block.words}w</span>
                </td>
                {topKws.map((kw) => {
                  const hits = block.kwHits[kw] || 0;
                  return (
                    <td
                      key={kw}
                      className="ch-heat-cell"
                      style={{ background: cellColor(hits) }}
                      title={`"${kw}" appears ${hits}x in ${block.label}`}
                    >
                      {hits > 0 ? hits : ''}
                    </td>
                  );
                })}
                <td className="ch-heat-total">{block.totalHits}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="ch-heat-legend">
        <span className="ch-heat-legend-label">Intensity:</span>
        <span className="ch-heat-legend-box" style={{ background: COLORS.paper2 }} /> None
        <span className="ch-heat-legend-box" style={{ background: '#b8d4c8' }} /> Low
        <span className="ch-heat-legend-box" style={{ background: COLORS.success }} /> Medium
        <span className="ch-heat-legend-box" style={{ background: COLORS.warn }} /> High
        <span className="ch-heat-legend-box" style={{ background: COLORS.red }} /> Dense
      </div>
    </div>
  );
}

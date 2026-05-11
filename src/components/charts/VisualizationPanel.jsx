import { useState, memo } from 'react';
import DensityBarChart from './DensityBarChart';
import DensityDonut from './DensityDonut';
import StuffingMeter from './StuffingMeter';
import ContentHeatmap from './ContentHeatmap';
import KeywordCloud from './KeywordCloud';

/**
 * Collapsible visualization panel that composes all chart modules.
 * Receives the same data the dashboard already has — no extra API calls.
 */
function VisualizationPanel({ keywords, content, totalWords }) {
  const [expanded, setExpanded] = useState(true);
  const [gram, setGram] = useState('1gram');

  if (!keywords || totalWords === 0) return null;

  const gramTabs = [
    { key: '1gram', label: '1-Word' },
    { key: '2gram', label: '2-Word' },
    { key: '3gram', label: '3-Word' },
  ];

  return (
    <div className="ch-panel">
      <button className="ch-panel-toggle" onClick={() => setExpanded(!expanded)}>
        <span className="ch-panel-toggle-title">
          <span className="ch-panel-toggle-icon">{expanded ? '▾' : '▸'}</span>
          Visual Analytics
        </span>
        <span className="ch-panel-toggle-sub">
          {expanded ? 'Collapse charts' : 'Expand charts'}
        </span>
      </button>

      {expanded && (
        <div className="ch-panel-body">
          {/* Gram selector for charts that support it */}
          <div className="ch-gram-tabs">
            {gramTabs.map((t) => (
              <button
                key={t.key}
                className={`ch-gram-tab ${gram === t.key ? 'active' : ''}`}
                onClick={() => setGram(t.key)}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Row 1: Bar chart + Donut + Meter */}
          <div className="ch-row ch-row-3">
            <div className="ch-col-expand">
              <DensityBarChart keywords={keywords} gram={gram} />
            </div>
            <div className="ch-col-side">
              <DensityDonut keywords={keywords} gram={gram} />
              <StuffingMeter keywords={keywords} />
            </div>
          </div>

          {/* Row 2: Heatmap */}
          <ContentHeatmap content={content} keywords={keywords} />

          {/* Row 3: Cloud */}
          <KeywordCloud keywords={keywords} gram={gram} />
        </div>
      )}
    </div>
  );
}

export default memo(VisualizationPanel);

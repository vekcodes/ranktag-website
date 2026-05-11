import { useMemo } from 'react';
import { toCloudData } from '../../utils/chartTransforms';

/**
 * Weighted keyword cloud — sized by frequency, colored by density zone.
 * Pure CSS flex layout with animated hover.
 */
export default function KeywordCloud({ keywords, gram = '1gram' }) {
  const data = useMemo(() => toCloudData(keywords, gram, 30), [keywords, gram]);

  if (data.length === 0) return null;

  return (
    <div className="ch-card">
      <div className="ch-card-head">
        <div className="ch-card-title">Keyword Cloud</div>
        <div className="ch-card-sub">Sized by frequency, colored by density zone</div>
      </div>
      <div className="ch-cloud-wrap" role="img" aria-label="Keyword frequency cloud">
        {data.map((kw) => (
          <span
            key={kw.keyword}
            className="ch-cloud-tag"
            style={{
              fontSize: kw.size,
              color: kw.color,
              opacity: 0.6 + (kw.count / (data[0]?.count || 1)) * 0.4,
            }}
            title={`${kw.keyword}: ${kw.count}x (${kw.density}%)`}
          >
            {kw.keyword}
          </span>
        ))}
      </div>
    </div>
  );
}

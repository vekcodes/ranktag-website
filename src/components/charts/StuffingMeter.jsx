import { useMemo } from 'react';
import { computeStuffingRisk, COLORS } from '../../utils/chartTransforms';

/**
 * Semicircle gauge showing overall keyword stuffing risk (0-100).
 * Pure SVG — no chart library needed.
 */
export default function StuffingMeter({ keywords }) {
  const risk = useMemo(() => computeStuffingRisk(keywords), [keywords]);

  if (!keywords?.['1gram']?.length) return null;

  const angle = (risk / 100) * 180;
  const riskColor = risk > 60 ? COLORS.red : risk > 30 ? COLORS.warn : COLORS.success;
  const riskLabel = risk > 60 ? 'High Risk' : risk > 30 ? 'Moderate' : 'Low Risk';

  // SVG arc path for the gauge background
  const R = 70;
  const cx = 90, cy = 85;
  const bgArc = describeArc(cx, cy, R, -180, 0);
  const valArc = describeArc(cx, cy, R, -180, -180 + angle);

  return (
    <div className="ch-card ch-card-compact">
      <div className="ch-card-head">
        <div className="ch-card-title">Stuffing Risk</div>
      </div>
      <div className="ch-meter-wrap">
        <svg viewBox="0 0 180 100" className="ch-meter-svg">
          {/* Background arc */}
          <path d={bgArc} fill="none" stroke={COLORS.paper3} strokeWidth="14" strokeLinecap="round" />
          {/* Value arc */}
          <path
            d={valArc}
            fill="none"
            stroke={riskColor}
            strokeWidth="14"
            strokeLinecap="round"
            style={{ transition: 'all 0.6s cubic-bezier(.2,.7,.2,1)' }}
          />
          {/* Center text */}
          <text x={cx} y={cy - 10} textAnchor="middle" className="ch-meter-val" fill={riskColor}>
            {risk}
          </text>
          <text x={cx} y={cy + 6} textAnchor="middle" className="ch-meter-label" fill={COLORS.muted}>
            {riskLabel}
          </text>
        </svg>
      </div>
      <div className="ch-meter-legend">
        <span style={{ color: COLORS.success }}>0 — Safe</span>
        <span style={{ color: COLORS.warn }}>30 — Moderate</span>
        <span style={{ color: COLORS.red }}>60+ — Risk</span>
      </div>
    </div>
  );
}

// Helper: SVG arc path from startAngle to endAngle (degrees, 0=right, -180=left)
function describeArc(cx, cy, r, startAngle, endAngle) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y}`;
}

function polarToCartesian(cx, cy, r, angleDeg) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

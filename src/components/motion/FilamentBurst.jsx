/**
 * Radial filament burst — fine lines growing outwards from the centre.
 *
 * Static inline SVG plus CSS: no canvas, no particle engine, no rAF. Each
 * filament draws with stroke-dashoffset on a per-line delay so the burst
 * appears to grow, then the whole group breathes on one shared opacity loop
 * (one animation, not sixty) which is gated by [data-loop].
 */
const COUNT = 72;
const R_IN = 96;

// Smoothly varying lengths rather than a repeating short/long pattern, which
// read as a jagged starburst. Two out-of-phase sine terms give an organic
// edge that never repeats visibly around the circle.
function outerRadius(i) {
  const a = (i / COUNT) * Math.PI * 2;
  return 196 + Math.sin(a * 3) * 34 + Math.sin(a * 7 + 1.3) * 18;
}

export default function FilamentBurst() {
  const lines = Array.from({ length: COUNT }, (_, i) => {
    const a = (i / COUNT) * Math.PI * 2;
    const out = outerRadius(i);
    return {
      i,
      x1: 300 + Math.cos(a) * R_IN,
      y1: 300 + Math.sin(a) * R_IN,
      x2: 300 + Math.cos(a) * out,
      y2: 300 + Math.sin(a) * out,
    };
  });

  return (
    <div className="filament" data-reveal data-loop aria-hidden="true">
      <svg viewBox="0 0 600 600" focusable="false">
        <g className="filament-g">
          {lines.map((l) => (
            <line
              key={l.i}
              x1={l.x1.toFixed(1)} y1={l.y1.toFixed(1)}
              x2={l.x2.toFixed(1)} y2={l.y2.toFixed(1)}
              pathLength="1"
              style={{ '--f': l.i % 16 }}
            />
          ))}
        </g>
      </svg>
    </div>
  );
}

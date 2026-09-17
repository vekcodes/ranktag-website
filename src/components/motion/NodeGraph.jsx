/**
 * Three-piece stack drawn as a node graph.
 *
 * Decorative mirror of the <ol class="stack"> beside it — the list carries the
 * real copy and the semantics, so this is aria-hidden. Lines draw with
 * stroke-dashoffset (pathLength="1", so no measuring) and nodes fade in
 * staggered, both driven by the section's own [data-reveal] .in class.
 */
const NODES = [
  { id: 'a', x: 50, y: 42, label: 'SENIOR HUMANS', chip: 'LIVE', tone: 'peri' },
  { id: 'b', x: 210, y: 150, label: 'CLAUDE', chip: 'SYNCING', tone: 'red' },
  { id: 'c', x: 70, y: 262, label: 'N8N + EDITORS', chip: 'LIVE', tone: 'peri' },
];

const EDGES = [
  'M78,58 C150,62 170,104 200,134',
  'M206,176 C176,214 132,232 100,252',
  'M56,66 C18,140 24,206 58,250',
];

export default function NodeGraph() {
  return (
    <div className="ngraph" data-reveal aria-hidden="true">
      <svg viewBox="0 0 300 320" focusable="false">
        <g className="ngraph-edges">
          {EDGES.map((d, i) => (
            <path key={d} d={d} pathLength="1" style={{ '--e': i }} />
          ))}
        </g>
        {NODES.map((n, i) => (
          <g className={`ngraph-node is-${n.tone}`} key={n.id} style={{ '--n': i }}>
            <circle cx={n.x} cy={n.y} r="9" />
            <circle className="ngraph-halo" cx={n.x} cy={n.y} r="16" />
          </g>
        ))}
      </svg>

      <ul className="ngraph-labels">
        {NODES.map((n, i) => (
          <li key={n.id} className={`ngraph-label is-${n.tone}`} style={{ '--n': i }}>
            <span className="ngraph-label-tx">{n.label}</span>
            <span className={`ngraph-chip is-${n.chip.toLowerCase()}`}>
              <i />{n.chip}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

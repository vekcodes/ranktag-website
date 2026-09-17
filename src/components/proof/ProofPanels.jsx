import { useCallback, useRef, useState } from 'react';
import ScriptedCursor from '../motion/ScriptedCursor.jsx';
import './proofPanels.css';

/**
 * The right-hand 7 columns of the homepage proof block.
 *
 * NOTE: className on the two panels is a constant. React only patches
 * className when the rendered string changes, and a patch overwrites classes
 * added imperatively — which silently stripped the reveal hook's `in` class
 * the moment the scripted cursor clicked, leaving both panels at opacity 0.
 * State therefore rides on data attributes, which React and the observers
 * can own independently.
 *
 * Everything is CSS and inline SVG — no screenshots, nothing fetched. Both
 * curves use pathLength="1" so the draw-in can be expressed as a plain
 * dasharray of 1 without measuring the path in JS.
 *
 * The panels are decorative restatements of the four figures in the stat
 * column beside them, so the whole block is aria-hidden: a screen reader
 * gets the numbers once, from the stats, not twice.
 */

const RANGES = ['24 HOURS', '7 DAYS', '28 DAYS', '3 MONTHS', '6 MONTHS'];

/* Glide along the range chips, settle on 6 MONTHS, click, curve redraws. */
const GSC_TIMELINE = [
  { action: 'move',  target: '[data-range="24 HOURS"]', move: 820, dwell: 420 },
  { action: 'hover', target: '[data-range="28 DAYS"]',  move: 640, dwell: 520 },
  { action: 'hover', target: '[data-range="6 MONTHS"]', move: 700, dwell: 480 },
  { action: 'click', target: '[data-range="6 MONTHS"]', move: 140, dwell: 800 },
];

/* Drift down the ranking, settle on the row that matters, reveal its source. */
const AIO_TIMELINE = [
  { action: 'move',  target: '.aio-row:last-child', move: 780, dwell: 520 },
  { action: 'hover', target: '.aio-row.is-top',     move: 660, dwell: 800 },
];

// Impressions climbing to 1.05M, clicks tracking below it. Shaped to match the
// six-month curve in the Search Console export, not drawn freehand.
const IMPRESSIONS = 'M0,150 C40,148 70,140 100,132 C140,122 170,112 210,96 C250,80 280,72 320,58 C360,44 390,34 430,24 C470,15 510,10 560,6';
const CLICKS = 'M0,168 C40,167 70,165 100,162 C140,158 170,154 210,147 C250,140 280,136 320,128 C360,120 390,115 430,108 C470,101 510,97 560,92';

export default function ProofPanels() {
  const gsc = useRef(null);
  const aio = useRef(null);
  const [redraw, setRedraw] = useState(false);
  const [cited, setCited] = useState(false);

  // On the scripted click, snap the curve back to zero with no transition and
  // release it on the next tick so the draw-in replays. One timeout, no loop.
  const onGscStep = useCallback((i, action) => {
    if (action !== 'click') return;
    setRedraw(true);
    setTimeout(() => setRedraw(false), 40);
  }, []);

  // The cite line's space is reserved in the layout at all times; "expanding"
  // is opacity and transform only, so the row cannot shift anything.
  const onAioStep = useCallback((i, action) => {
    setCited(action === 'hover' || action === 'final');
  }, []);

  return (
    <div className="case-proof-panels" aria-hidden="true">
      {/* ── Search Console performance ─────────────────────────────── */}
      <figure className="gsc" data-redraw={redraw ? '' : undefined} data-reveal data-loop ref={gsc}>
        <ScriptedCursor hostRef={gsc} timeline={GSC_TIMELINE} onStep={onGscStep} />
        <figcaption className="gsc-head">
          <span className="gsc-title">SEARCH CONSOLE · PERFORMANCE</span>
          <span className="gsc-live">
            <i className="gsc-dot" />LIVE
          </span>
        </figcaption>

        <div className="gsc-legend">
          <span className="gsc-key gsc-key-imp">1.05M IMPRESSIONS</span>
          <span className="gsc-key gsc-key-clk">7.43k CLICKS</span>
        </div>

        <div className="gsc-chart">
          <svg viewBox="0 0 560 180" preserveAspectRatio="none" focusable="false">
            <g className="gsc-grid">
              {[36, 72, 108, 144].map((y) => (
                <line key={y} x1="0" y1={y} x2="560" y2={y} />
              ))}
            </g>
            <path className="gsc-line gsc-line-imp" d={IMPRESSIONS} pathLength="1" />
            <path className="gsc-line gsc-line-clk" d={CLICKS} pathLength="1" />
          </svg>
        </div>

        <div className="gsc-ranges">
          {RANGES.map((r) => (
            <span
              key={r}
              className={`gsc-chip${r === '6 MONTHS' ? ' is-active' : ''}`}
              data-range={r}
            >
              {r}
            </span>
          ))}
        </div>
      </figure>

      {/* ── AI Overview ranking ────────────────────────────────────── */}
      <div className="aio" data-cited={cited ? '' : undefined} data-reveal ref={aio}>
        <ScriptedCursor hostRef={aio} timeline={AIO_TIMELINE} onStep={onAioStep} startDelay={900} />
        <div className="aio-head">
          <span className="aio-label">GOOGLE AI OVERVIEW</span>
          <span className="aio-q">&ldquo;what is the best GTM tool&rdquo;</span>
        </div>
        <ul className="aio-list">
          <li className="aio-row is-top">
            <span className="aio-rank">#2</span>
            <span className="aio-name">SENDR.AI</span>
            <span className="aio-tag">CITED SOURCE</span>
            <span className="aio-cite">▲ named as the source in the AI Overview</span>
          </li>
          <li className="aio-row">
            <span className="aio-rank">#8</span>
            <span className="aio-name">ZOOMINFO</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

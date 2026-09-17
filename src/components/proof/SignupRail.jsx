import { useRef } from 'react';
import './signupRail.css';

/**
 * The signup alerts, exactly as the screenshots read them.
 *
 * `source` is the attribution string Make recorded, copied verbatim — it is
 * not normalised into a tidier vocabulary, because the screenshot is the
 * evidence and nothing here should claim more than it shows. Two of them say
 * "SEO" and "search" rather than naming an engine, and one says only "AI";
 * those are chipped as they read. None of the screenshots carries a date, so
 * there are no date chips.
 */
export const SIGNUPS = [
  { n: 16, country: 'GB', source: 'Google' },
  { n: 10, country: 'GB', source: 'ChatGPT' },
  { n: 5, country: 'US', source: 'Gemini' },
  { n: 15, country: 'CH', source: 'Claude' },
  { n: 3, country: 'EE', source: 'notebooklm' },
  { n: 2, country: 'FR', source: 'Google' },
  { n: 7, country: 'GE', source: 'ChatGPT' },
  { n: 13, country: 'US', source: 'Gemini' },
  { n: 4, country: 'IN', source: 'Claude' },
  { n: 14, country: 'GB', source: 'search' },
  { n: 6, country: 'IN', source: 'chatgpt' },
  { n: 11, country: 'FR', source: 'Gemini' },
  { n: 1, country: 'DE', source: 'SEO' },
  { n: 17, country: 'US', source: 'google' },
  { n: 9, country: 'IN', source: 'gemini' },
  { n: 12, country: 'FR', source: 'google' },
  { n: 8, country: 'CA', source: 'AI' },
].map((s) => ({
  ...s,
  id: `signup-${String(s.n).padStart(2, '0')}`,
  src: `/proof/signup-${String(s.n).padStart(2, '0')}.webp`,
  chip: s.source.toUpperCase(),
  alt:
    `Slack alert from Make reading "New Signup (production)", with the customer's name, ` +
    `email and phone blurred out. Country ${s.country}, attribution source "${s.source}".`,
}));

/**
 * Horizontal rail of framed screenshots. Scrolling is native (trackpad, touch,
 * shift-wheel, keyboard); the arrows and pointer-drag are conveniences on top.
 * No scroll listener and no rAF loop — the only JS runs while a drag is
 * actually in progress.
 */
export default function SignupRail({ items = SIGNUPS, label = 'Signup notification screenshots' }) {
  const rail = useRef(null);
  const drag = useRef(null);

  const page = (dir) => {
    const el = rail.current;
    if (!el) return;
    const card = el.querySelector('.rail-card');
    const step = card ? card.getBoundingClientRect().width + 20 : el.clientWidth * 0.8;
    el.scrollBy({ left: dir * step, behavior: 'smooth' });
  };

  const onPointerDown = (e) => {
    if (e.pointerType === 'touch') return; // native touch scrolling is better
    drag.current = { x: e.clientX, left: rail.current.scrollLeft, moved: false };
    rail.current.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e) => {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.x;
    if (Math.abs(dx) > 3) d.moved = true;
    rail.current.scrollLeft = d.left - dx;
  };
  const onPointerUp = (e) => {
    if (!drag.current) return;
    drag.current = null;
    rail.current.releasePointerCapture(e.pointerId);
  };

  return (
    <div className="rail-wrap">
      <ul
        className="rail"
        ref={rail}
        tabIndex={0}
        role="group"
        aria-label={label}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {items.map((s) => (
          <li className="rail-card" key={s.id}>
            <figure>
              <div className="rail-frame">
                <span className="rail-chrome" aria-hidden="true">
                  <i /><i /><i />
                </span>
                <img
                  src={s.src}
                  alt={s.alt}
                  width="1200"
                  height="675"
                  loading="lazy"
                  decoding="async"
                  draggable="false"
                />
              </div>
              <figcaption className="rail-cap">
                <span className="rail-chip">{s.chip}</span>
                <span className="rail-meta">New signup · {s.country}</span>
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>

      <div className="rail-nav">
        <button type="button" className="rail-btn ar-parent" onClick={() => page(-1)} aria-label="Scroll left">
          <span className="ar">←</span>
        </button>
        <button type="button" className="rail-btn ar-parent" onClick={() => page(1)} aria-label="Scroll right">
          <span className="ar">→</span>
        </button>
      </div>
    </div>
  );
}

import { useEffect, useRef, useState } from 'react';
import './scriptedCursor.css';

/**
 * A fake cursor that plays a scripted demo inside a panel.
 *
 * Timing model: one chained setTimeout at a time, never an interval and never
 * a rAF loop. Every pending timer is tracked and cleared on stop, so leaving
 * and re-entering the viewport restarts from step 0 instead of stacking.
 *
 * A step is { x, y, action, dwell, move, target }:
 *   x / y     percentage of the host box (ignored when `target` is given)
 *   target    selector inside the host; the cursor goes to its centre, which
 *             survives reflow and breakpoint changes in a way that hard
 *             percentages do not
 *   action    'move' | 'hover' | 'click'
 *   move      ms for the glide (default 720)
 *   dwell     ms to sit still afterwards (default 600)
 *
 * The cursor is pointer-events:none and aria-hidden, and any genuine user
 * input inside the host kills it permanently — it must never fight a real
 * form field.
 */
const MOVE_MS = 720;
const DWELL_MS = 600;

/* ── Concurrency governor ───────────────────────────────────────────────
   Four tool cards can sit on screen together at 1440, which would put four
   loops on the compositor at once. Only the MAX_ACTIVE panels nearest the
   middle of the viewport actually run; the rest hold their resting state.
   Rebalancing happens on IntersectionObserver callbacks only — there is no
   scroll listener and no polling. */
const MAX_ACTIVE = 3;
const pool = new Set();

function rebalance() {
  const live = [...pool].filter((e) => e.visible && !e.dead);
  const mid = window.innerHeight / 2;
  live.sort((a, b) => a.distanceTo(mid) - b.distanceTo(mid));
  live.forEach((e, i) => (i < MAX_ACTIVE ? e.resume() : e.idle()));
  pool.forEach((e) => { if (!e.visible || e.dead) e.idle(); });
}

export default function ScriptedCursor({ hostRef, timeline, onStep, startDelay = 0 }) {
  // Decided on the client, so the server never ships a cursor and phones
  // never mount one at all (rather than hiding it with CSS).
  const [on, setOn] = useState(false);
  const ref = useRef(null);
  const timers = useRef([]);
  const dead = useRef(false);

  useEffect(() => {
    const mq = (q) => window.matchMedia && window.matchMedia(q).matches;
    if (mq('(prefers-reduced-motion: reduce)') || mq('(max-width: 767px)')) {
      onStep?.(timeline.length - 1, 'final');   // resting state, no cursor
      return;
    }
    setOn(true);
  }, [onStep, timeline.length]);

  useEffect(() => {
    if (!on) return;
    const host = hostRef?.current;
    const el = ref.current;
    if (!host || !el || !timeline?.length) return;

    const clear = () => { timers.current.forEach(clearTimeout); timers.current = []; };
    const at = (fn, ms) => { timers.current.push(setTimeout(fn, ms)); };
    const unhover = () => host.querySelectorAll('.sc-hover').forEach((n) => n.classList.remove('sc-hover'));

    const settle = () => {
      clear();
      unhover();
      el.classList.remove('is-click', 'is-down', 'is-on');
      onStep?.(timeline.length - 1, 'final');
    };

    const place = (step) => {
      const hr = host.getBoundingClientRect();
      let x = ((step.x ?? 50) / 100) * hr.width;
      let y = ((step.y ?? 50) / 100) * hr.height;
      if (step.target) {
        const t = host.querySelector(step.target);
        if (t) {
          const tr = t.getBoundingClientRect();
          x = tr.left - hr.left + tr.width / 2;
          y = tr.top - hr.top + tr.height / 2;
        }
      }
      el.style.setProperty('--sc-move', `${step.move ?? MOVE_MS}ms`);
      el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
    };

    const play = (i) => {
      if (dead.current) return;
      const step = timeline[i];
      unhover();
      place(step);

      at(() => {
        if (dead.current) return;
        const t = step.target ? host.querySelector(step.target) : null;
        if (step.action === 'hover' || step.action === 'click') t?.classList.add('sc-hover');
        if (step.action === 'click') {
          el.classList.add('is-down');
          at(() => el.classList.remove('is-down'), 140);
          el.classList.remove('is-click');
          void el.offsetWidth;          // restart the ripple keyframe
          el.classList.add('is-click');
        }
        onStep?.(i, step.action);
        at(() => play((i + 1) % timeline.length), step.dwell ?? DWELL_MS);
      }, step.move ?? MOVE_MS);
    };

    const entry = {
      dead: false,
      visible: false,
      running: false,
      distanceTo(mid) {
        const r = host.getBoundingClientRect();
        return Math.abs(r.top + r.height / 2 - mid);
      },
      resume() {
        if (this.running || this.dead) return;
        this.running = true;
        el.classList.add('is-on');
        clear();
        at(() => play(0), startDelay);
      },
      idle() {
        if (!this.running) return;
        this.running = false;
        clear();
        unhover();
        el.classList.remove('is-on', 'is-click', 'is-down');
      },
    };
    pool.add(entry);

    const io = new IntersectionObserver(([e]) => {
      entry.visible = e.isIntersecting;
      rebalance();
    }, { threshold: 0.35 });
    io.observe(host);

    const kill = () => {
      if (dead.current) return;
      dead.current = true;
      entry.dead = true;
      io.disconnect();
      settle();
      rebalance();
    };
    host.addEventListener('pointerdown', kill);
    host.addEventListener('keydown', kill);
    host.addEventListener('focusin', kill);

    return () => {
      io.disconnect();
      clear();
      pool.delete(entry);
      host.removeEventListener('pointerdown', kill);
      host.removeEventListener('keydown', kill);
      host.removeEventListener('focusin', kill);
      rebalance();
    };
  }, [on, hostRef, timeline, onStep, startDelay]);

  if (!on) return null;

  return (
    <span className="sc-cursor" ref={ref} aria-hidden="true">
      <svg viewBox="0 0 16 18" focusable="false">
        <path d="M1 1 L1 14.2 L4.6 10.9 L7 16.5 L9.6 15.3 L7.2 9.9 L12.2 9.6 Z" />
      </svg>
      <i className="sc-ripple" />
    </span>
  );
}

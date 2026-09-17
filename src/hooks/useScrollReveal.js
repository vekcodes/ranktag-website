import { useEffect } from 'react';

const PREFERS_REDUCED = () =>
  typeof window !== 'undefined' &&
  window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Parse "1.05M" / "7.43k" / "0.7%" / "7.1" into {value, prefix, suffix, decimals}. */
function parseTarget(raw) {
  const m = String(raw).trim().match(/^([^\d-]*)(-?[\d,]*\.?\d+)\s*([A-Za-z%]*)(.*)$/);
  if (!m) return null;
  const [, prefix, num, unit, tail] = m;
  const clean = num.replace(/,/g, '');
  const decimals = (clean.split('.')[1] || '').length;
  return { prefix, value: parseFloat(clean), unit, tail, decimals, grouped: num.includes(',') };
}

const format = (n, t) => {
  const fixed = n.toFixed(t.decimals);
  const grouped = t.grouped ? Number(fixed).toLocaleString('en-US', {
    minimumFractionDigits: t.decimals, maximumFractionDigits: t.decimals,
  }) : fixed;
  return `${t.prefix}${grouped}${t.unit}${t.tail}`;
};

/**
 * Scroll-driven motion primitives, all once-only and all disabled under
 * prefers-reduced-motion:
 *
 *   [data-reveal]           — adds `.in` when the element enters view.
 *   [data-reveal-children]  — same, but each direct child gets a `--i`
 *                             index so the CSS can stagger them.
 *   [data-countup]          — counts the element's text up to its final
 *                             value on entry. The final value is read from
 *                             the DOM, so the server-rendered markup is
 *                             already correct if JS never runs.
 */
/**
 * Wrap a heading's lines in clipping spans so each can rise from below.
 *
 * Lines are taken from the markup — explicit `.line` spans, else `<br>`
 * breaks, else the heading as a single line — rather than measured from the
 * laid-out text. Measuring would be more granular but this site loads its
 * webfonts after first paint, so any measurement taken at mount would be
 * against the fallback metrics and the groupings would be wrong the moment
 * the real font swapped in.
 */
function buildLines(el) {
  if (el.dataset.rlReady) return;

  const explicit = el.querySelectorAll(':scope > .line');
  let parts;
  if (explicit.length) {
    parts = Array.from(explicit, (n) => [n]);
  } else if (el.querySelector('br')) {
    parts = [[]];
    Array.from(el.childNodes).forEach((n) => {
      if (n.nodeName === 'BR') { n.remove(); parts.push([]); } else parts[parts.length - 1].push(n);
    });
  } else {
    parts = [Array.from(el.childNodes)];
  }

  const frag = document.createDocumentFragment();
  parts.filter((p) => p.length).forEach((nodes, i) => {
    const line = document.createElement('span');
    line.className = 'rl-line';
    const inner = document.createElement('span');
    inner.className = 'rl-inner';
    inner.style.setProperty('--l', String(i));
    nodes.forEach((n) => inner.appendChild(n)); // appendChild moves, so el empties
    line.appendChild(inner);
    frag.appendChild(line);
  });
  el.appendChild(frag);
  el.dataset.rlReady = '1';
}

export default function useScrollReveal() {
  useEffect(() => {
    // Built before anything is observed, so a heading is never seen unmasked.
    // Its section is already opacity:0 at this point, so there is no flash.
    document.querySelectorAll('[data-reveal-lines]').forEach(buildLines);

    const reveals = document.querySelectorAll('[data-reveal], [data-reveal-children], [data-reveal-lines]');
    const counters = document.querySelectorAll('[data-countup]');
    if (!reveals.length && !counters.length) return;

    const reduced = PREFERS_REDUCED();

    // Stagger indices are just data; set them even when motion is reduced so
    // the markup is consistent.
    document.querySelectorAll('[data-reveal-children]').forEach((parent) => {
      Array.from(parent.children).forEach((child, i) => {
        if (!child.style.getPropertyValue('--i')) child.style.setProperty('--i', String(i));
      });
    });

    if (reduced) {
      reveals.forEach((el) => el.classList.add('in'));
      return;   // ambient loops stay unstarted: no .is-live is ever added
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          e.target.classList.add('in');
          io.unobserve(e.target);
        });
      },
      { threshold: 0.05, rootMargin: '0px 0px -5% 0px' }
    );
    reveals.forEach((el) => io.observe(el));

    // Ambient loops (badges, drifting panels). Unlike the reveals above this
    // toggles both ways: an element that scrolls out of view has its
    // animation removed entirely rather than left spinning off-screen.
    const loops = document.querySelectorAll('[data-loop]');
    const loopIo = new IntersectionObserver(
      // An attribute, not a class: React owns className on some of these
      // hosts and re-rendering would silently wipe a class added here.
      (entries) => entries.forEach((e) => e.target.toggleAttribute('data-live', e.isIntersecting)),
      { threshold: 0 }
    );
    loops.forEach((el) => loopIo.observe(el));

    // Sticky index: a container marked [data-sticky-index] whose
    // [data-sticky-item] children report which one is nearest the middle of
    // the viewport. The container's data-active drives a pinned label column
    // in CSS. Observer-driven, so no scroll handler.
    const stickies = document.querySelectorAll('[data-sticky-index]');
    const stickyIos = [];
    stickies.forEach((box) => {
      const items = [...box.querySelectorAll('[data-sticky-item]')];
      if (!items.length) return;
      const ratios = new Map();
      const sIo = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => ratios.set(e.target, e.isIntersecting ? e.intersectionRatio : 0));
          let best = -1, bestI = Number(box.dataset.active || 0);
          items.forEach((el, i) => {
            const r = ratios.get(el) || 0;
            if (r > best) { best = r; bestI = i; }
          });
          if (best > 0) box.dataset.active = String(bestI);
        },
        { threshold: [0, 0.25, 0.5, 0.75, 1], rootMargin: '-35% 0px -35% 0px' }
      );
      items.forEach((el) => sIo.observe(el));
      stickyIos.push(sIo);
    });

    // Count-up. Values are interpolated with an ease-out curve so the number
    // decelerates into place rather than ticking linearly.
    const running = [];
    const countIo = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const el = e.target;
          countIo.unobserve(el);
          const target = parseTarget(el.dataset.countupFrom || el.textContent);
          if (!target || Number.isNaN(target.value)) return;
          const duration = Number(el.dataset.countup) || 1400;
          const start = performance.now();
          const tick = (now) => {
            const p = Math.min(1, (now - start) / duration);
            const eased = 1 - Math.pow(1 - p, 3);
            el.textContent = format(target.value * eased, target);
            if (p < 1) running.push(requestAnimationFrame(tick));
          };
          // Stash the final string so a re-run can't drift off the real value.
          if (!el.dataset.countupFrom) el.dataset.countupFrom = el.textContent;
          running.push(requestAnimationFrame(tick));
        });
      },
      { threshold: 0.4 }
    );
    counters.forEach((el) => countIo.observe(el));

    return () => {
      io.disconnect();
      loopIo.disconnect();
      stickyIos.forEach((o) => o.disconnect());
      countIo.disconnect();
      running.forEach((id) => cancelAnimationFrame(id));
    };
  }, []);
}

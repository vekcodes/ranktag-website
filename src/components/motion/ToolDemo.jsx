import { useCallback, useMemo, useRef, useState } from 'react';
import ScriptedCursor from './ScriptedCursor.jsx';

/**
 * Wraps a tool card's mock in a scripted demo: the cursor moves to the URL
 * field, the address reveals itself, the cursor clicks Run, and the result
 * below fills in.
 *
 * The URL is never a real input — it is text revealed by a clip-path sweep,
 * so there is nothing here for a keyboard or a password manager to find, and
 * the real tool on the linked page is untouched. The whole block is
 * aria-hidden; the card's own heading and copy carry the meaning.
 *
 * `className` lands on the BODY, not the frame: the mock variants
 * (.mock-dial, .mock-bars, .mock-speed) carry their own display/padding and
 * act as the positioning context for things like .dial-val. Put on the
 * wrapper they applied to the frame instead, which threw the dial's readout
 * into the corner and collapsed the density bars entirely.
 *
 * `is-running` gates the result animations in Home.css, and [data-loop] adds
 * `is-live` only while the card is on screen. Both are required, because
 * `is-running` persists once set — without the visibility gate the previews
 * kept looping long after the card had scrolled away.
 */
const STATES = ['idle', 'typing', 'typing', 'running'];

export default function ToolDemo({ url, runLabel, startDelay = 0, className = '', children }) {
  const host = useRef(null);
  const [state, setState] = useState('idle');

  const timeline = useMemo(() => ([
    { action: 'move',  target: '.td-url', move: 760, dwell: 420 },
    { action: 'click', target: '.td-url', move: 130, dwell: 800 },
    { action: 'move',  target: '.td-run', move: 640, dwell: 440 },
    { action: 'click', target: '.td-run', move: 130, dwell: 800 },
  ]), []);

  const onStep = useCallback((i, action) => {
    // 'final' is the resting state used on mobile and under reduced motion:
    // the finished result, not a blank panel.
    setState(action === 'final' ? 'running' : (STATES[i] || 'idle'));
  }, []);

  return (
    <div className={`td mock is-${state}`} ref={host} data-loop aria-hidden="true">
      <div className="td-bar">
        <span className="frame-dots"><i /><i /><i /></span>
        <span className="td-url">{url}</span>
        <span className="td-run">{runLabel}</span>
      </div>
      <div className={`td-body ${className}`.trim()}>{children}</div>
      <ScriptedCursor hostRef={host} timeline={timeline} onStep={onStep} startDelay={startDelay} />
    </div>
  );
}

/**
 * Circular outlined badge with rotating ring text and an arrow glyph.
 *
 * Decorative only, so aria-hidden and pointer-events:none. Both loops (the
 * float and the ring spin) are gated on [data-loop]: the reveal hook adds
 * .is-live while it is on screen and strips it the moment it leaves, so a
 * badge parked off-screen costs nothing.
 */
export default function FloatingBadge({ text, glyph = '↗', className = '', id }) {
  const pathId = `badge-path-${id}`;
  // Repeated so the ring reads continuously, then fitted to the exact
  // circumference (2π·38 ≈ 238.8) so it can never overlap itself.
  const ring = `${text} · ${text} · `;

  return (
    <span className={`fbadge ${className}`.trim()} data-loop aria-hidden="true">
      <span className="fbadge-ring" />
      <svg className="fbadge-text" viewBox="0 0 100 100" focusable="false">
        <defs>
          <path id={pathId} d="M50,50 m-38,0 a38,38 0 1,1 76,0 a38,38 0 1,1 -76,0" />
        </defs>
        <text textLength="238" lengthAdjust="spacingAndGlyphs">
          <textPath href={`#${pathId}`} startOffset="0">{ring}</textPath>
        </text>
      </svg>
      <span className="fbadge-glyph">{glyph}</span>
    </span>
  );
}

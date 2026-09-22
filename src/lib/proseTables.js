// Shared by the React blog route and the SSR shell in api/_lib/render.js.
// Keep this dependency-free: it is bundled into the client.

/**
 * Wrap every top-level <table> in a scroll container.
 *
 * A table wide enough to overflow would otherwise push the whole article
 * sideways on mobile. CSS alone cannot add the container (the table has no
 * wrapper to scroll inside), so it is added at render time rather than at save
 * time, so posts written before tables were supported get it too, and
 * the database keeps storing clean semantic HTML.
 *
 * Nested tables are left alone; only the outermost one is wrapped.
 */
export function wrapProseTables(html) {
  const src = String(html == null ? '' : html);
  if (!/<table[\s/>]/i.test(src)) return src;

  const re = /<(\/?)table(?=[\s/>])/gi;
  let out = '';
  let cursor = 0; // end of the last chunk copied to `out`
  let openedAt = 0; // index of the outermost <table
  let depth = 0;
  let m;

  while ((m = re.exec(src)) !== null) {
    const isClose = m[1] === '/';
    if (!isClose) {
      if (depth === 0) openedAt = m.index;
      depth += 1;
      continue;
    }
    if (depth === 0) continue; // stray </table>, leave it be
    depth -= 1;
    if (depth > 0) continue;

    const gt = src.indexOf('>', m.index);
    const end = gt === -1 ? src.length : gt + 1;
    out +=
      src.slice(cursor, openedAt) +
      '<div class="prose-table">' +
      src.slice(openedAt, end) +
      '</div>';
    cursor = end;
  }

  return out + src.slice(cursor);
}

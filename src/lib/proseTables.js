// Shared by the React blog route and the SSR shell in api/_lib/render.js.
// Keep this dependency-free: it is bundled into the client.

/** A markdown alignment row cell: ---, :---, ---: or :---:. */
const SEP_CELL = /^\s*:?-{2,}:?\s*$/;

/**
 * Rebuild tables that were pasted as markdown and flattened into a paragraph.
 *
 * Several posts carry their tables like this:
 *
 *   <p>| Channel | ROI | |---|---| | Email | $36 per $1 | | SEO | 748% |</p>
 *
 * The content was written as a markdown pipe table but saved through the HTML
 * path, so nothing ever converted it — and the newlines that make it a table
 * are gone, so re-running a markdown parser over it would not help either. It
 * renders as a wall of pipes mid-article.
 *
 * Reconstructing it from the alignment row is reliable because that row states
 * the column count: anything that does not divide evenly into it is left
 * untouched rather than guessed at. Done at render time so every existing post
 * is fixed without a database migration, and re-saving a post in the CMS
 * stores the repaired markup for good.
 *
 * Cells keep whatever inline HTML they hold. Tags are masked before the split
 * so a pipe inside an href can never become a column boundary.
 */
export function restorePipeTables(html) {
  const src = String(html == null ? '' : html);
  // Cheap bail-out: no alignment row, nothing to do.
  if (!/-{2,}\s*\|/.test(src)) return src;

  return src.replace(/<p\b[^>]*>([\s\S]*?)<\/p>/gi, (whole, inner) => {
    const tags = [];
    const masked = inner.replace(/<[^>]*>/g, (t) => `\u0000${tags.push(t) - 1}\u0000`);
    const unmask = (s) => s.replace(/\u0000(\d+)\u0000/g, (_, i) => tags[Number(i)]);

    const tokens = masked.split('|');
    const first = tokens.findIndex((t) => SEP_CELL.test(t));
    if (first === -1) return whole;
    let last = first;
    while (last + 1 < tokens.length && SEP_CELL.test(tokens[last + 1])) last += 1;

    const cols = last - first + 1;
    if (cols < 2) return whole;

    const cells = (slice) =>
      slice.map((t) => unmask(t).trim()).filter((t) => t !== '');
    const head = cells(tokens.slice(0, first));
    const body = cells(tokens.slice(last + 1));

    // Any mismatch means this is not the table it looks like. Leave the
    // paragraph exactly as it was: a wall of pipes is bad, silently dropping
    // or reshuffling someone's content is worse.
    if (head.length !== cols) return whole;
    if (body.length === 0 || body.length % cols !== 0) return whole;

    const rows = [];
    for (let i = 0; i < body.length; i += cols) rows.push(body.slice(i, i + cols));

    return (
      '<table><thead><tr>' +
      head.map((c) => `<th scope="col">${c}</th>`).join('') +
      '</tr></thead><tbody>' +
      rows
        .map((r) => '<tr>' + r.map((c) => `<td>${c}</td>`).join('') + '</tr>')
        .join('') +
      '</tbody></table>'
    );
  });
}

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
  // Markdown tables that were flattened into a paragraph become real tables
  // first, so they get the same scroll container as every other one.
  const src = restorePipeTables(String(html == null ? '' : html));
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

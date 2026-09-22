// Normalising pasted table markup before ProseMirror parses it.
//
// Tables arrive from Google Docs, Word, ChatGPT and live web pages carrying
// inline widths, colour, <colgroup> sizing and Google's wrapper <b> tag. Left
// alone they either fight the blog's CSS or get stripped by the API sanitiser,
// so the paste is scrubbed down to plain semantic table HTML on the way in.

/** Attributes we never want on a table element: layout belongs to the CSS. */
const JUNK_ATTRS = [
  'style', 'width', 'height', 'bgcolor', 'border', 'align', 'valign',
  'cellpadding', 'cellspacing', 'class', 'dir', 'lang', 'id', 'data-pm-slice',
];

/** Replace a node with its own children, keeping the text flow intact. */
function unwrap(el) {
  const parent = el.parentNode;
  if (!parent) return;
  while (el.firstChild) parent.insertBefore(el.firstChild, el);
  parent.removeChild(el);
}

/**
 * Google Docs wraps the whole clipboard payload in
 * `<b id="docs-internal-guid-…" style="font-weight:normal">`, which TipTap
 * faithfully reads as "bold everything". Drop the wrapper, keep the content.
 */
function dropGoogleDocsWrapper(root) {
  root.querySelectorAll('b[id^="docs-internal-guid"]').forEach(unwrap);
  root.querySelectorAll('b,strong,span').forEach((el) => {
    const weight = el.style && el.style.fontWeight;
    if (weight === 'normal' || weight === '400') unwrap(el);
  });
}

/**
 * A table with no <th> anywhere reads as a grid of data with no header, which
 * renders as a wall of identical cells. Promote the first row so the post gets
 * a real header band, matching what the author saw in the source document.
 */
function ensureHeaderRow(table) {
  if (table.querySelector('th')) return;
  const firstRow = table.querySelector('tr');
  if (!firstRow) return;
  firstRow.querySelectorAll(':scope > td').forEach((td) => {
    const th = table.ownerDocument.createElement('th');
    // Carry the spans over. Dropping a colspan here would shift every row
    // beneath it by a column.
    for (const span of ['colspan', 'rowspan']) {
      const v = td.getAttribute(span);
      if (v) th.setAttribute(span, v);
    }
    th.setAttribute('scope', 'col');
    while (td.firstChild) th.appendChild(td.firstChild);
    td.replaceWith(th);
  });
}

/** Strip presentational attributes and sizing nodes from one table. */
function scrubTable(table) {
  table.querySelectorAll('colgroup, col').forEach((el) => el.remove());

  const parts = [table, ...table.querySelectorAll('thead,tbody,tfoot,tr,th,td')];
  for (const el of parts) {
    for (const attr of JUNK_ATTRS) el.removeAttribute(attr);
    // colspan/rowspan of 1 are noise; anything larger is meaningful structure.
    for (const span of ['colspan', 'rowspan']) {
      if (el.getAttribute(span) === '1') el.removeAttribute(span);
    }
  }
  table.querySelectorAll('th').forEach((th) => th.setAttribute('scope', 'col'));

  // Empty paragraphs inside cells become stray blank lines in the editor.
  table.querySelectorAll('td > p, th > p').forEach((p) => {
    if (!p.textContent.trim() && !p.querySelector('img')) p.remove();
  });

  ensureHeaderRow(table);
}

/**
 * Clean pasted HTML. Returns the original string untouched when there is no
 * table, so ordinary prose pastes keep ProseMirror's default behaviour.
 */
export function normalizePastedHtml(html) {
  if (!html || !/<table[\s>]/i.test(html)) return html;
  if (typeof DOMParser === 'undefined') return html;

  const doc = new DOMParser().parseFromString(html, 'text/html');
  dropGoogleDocsWrapper(doc.body);
  doc.body.querySelectorAll('table').forEach(scrubTable);
  return doc.body.innerHTML;
}

/**
 * Detect a GitHub-flavoured Markdown pipe table in plain text: the shape you
 * get when copying an LLM answer or a README as text rather than rich HTML.
 * Requires a header row followed by a `|---|---|` delimiter row.
 */
export function looksLikeMarkdownTable(text) {
  if (!text || text.indexOf('|') === -1) return false;
  const lines = text.split(/\r?\n/);
  return lines.some(
    (line, i) =>
      /\|/.test(line) &&
      i + 1 < lines.length &&
      /^\s*\|?[\s:-]*-{2,}[\s:|-]*\|?\s*$/.test(lines[i + 1]) &&
      /\|/.test(lines[i + 1])
  );
}

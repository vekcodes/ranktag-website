/**
 * Client-side CSV export — generates and triggers download instantly.
 * No backend round-trip needed for CSV.
 */

function escapeCsv(val) {
  const s = String(val ?? '');
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function row(cells) {
  return cells.map(escapeCsv).join(',');
}

function download(content, filename) {
  const bom = '\uFEFF'; // UTF-8 BOM for Excel compatibility
  const blob = new Blob([bom + content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Export keyword analysis as CSV.
 */
export function exportKeywordsCsv(keywords, totalWords) {
  const lines = [row(['Rank', 'Keyword', 'Type', 'Count', 'Density (%)'])];
  const types = { '1gram': '1-Word', '2gram': '2-Word', '3gram': '3-Word' };

  for (const [gram, label] of Object.entries(types)) {
    (keywords?.[gram] || []).forEach((kw, i) => {
      lines.push(row([i + 1, kw.keyword, label, kw.count, kw.density]));
    });
  }

  download(lines.join('\n'), 'keyword-density-analysis.csv');
}

/**
 * Export full SEO report as CSV (keywords + scores + recommendations).
 */
export function exportFullReportCsv(keywords, totalWords, score) {
  const lines = [];

  // Summary
  lines.push(row(['=== SEO AUDIT SUMMARY ===']));
  lines.push(row(['Overall Score', score?.overall ?? '']));
  lines.push(row(['Grade', score?.grade ?? '']));
  lines.push(row(['Total Words', totalWords]));
  lines.push('');

  // Categories
  lines.push(row(['=== CATEGORY SCORES ===']));
  lines.push(row(['Category', 'Score', 'Weight (%)', 'Weighted']));
  (score?.categories || []).forEach((c) => {
    lines.push(row([c.name, c.score, c.weight, c.weighted]));
  });
  lines.push('');

  // Readability
  if (score?.readability) {
    const rd = score.readability;
    lines.push(row(['=== READABILITY ===']));
    lines.push(row(['Flesch Reading Ease', rd.fre]));
    lines.push(row(['Flesch-Kincaid Grade', rd.grade]));
    lines.push(row(['Reading Level', rd.level]));
    lines.push(row(['Avg Sentence Length', rd.avgSL]));
    lines.push(row(['Passive Voice %', rd.passivePct]));
    lines.push('');
  }

  // Warnings
  if (score?.warnings?.length) {
    lines.push(row(['=== WARNINGS ===']));
    lines.push(row(['Severity', 'Category', 'Message', 'Detail']));
    score.warnings.forEach((w) => lines.push(row([w.severity, w.category, w.message, w.detail])));
    lines.push('');
  }

  // Recommendations
  if (score?.recommendations?.length) {
    lines.push(row(['=== RECOMMENDATIONS ===']));
    lines.push(row(['Severity', 'Category', 'Message', 'Detail']));
    score.recommendations.forEach((r) => lines.push(row([r.severity, r.category, r.message, r.detail])));
    lines.push('');
  }

  // Strengths
  if (score?.strengths?.length) {
    lines.push(row(['=== STRENGTHS ===']));
    lines.push(row(['Category', 'Message']));
    score.strengths.forEach((s) => lines.push(row([s.category, s.message])));
    lines.push('');
  }

  // Keywords
  lines.push(row(['=== KEYWORDS ===']));
  lines.push(row(['Rank', 'Keyword', 'Type', 'Count', 'Density (%)']));
  const types = { '1gram': '1-Word', '2gram': '2-Word', '3gram': '3-Word' };
  for (const [gram, label] of Object.entries(types)) {
    (keywords?.[gram] || []).forEach((kw, i) => {
      lines.push(row([i + 1, kw.keyword, label, kw.count, kw.density]));
    });
  }

  download(lines.join('\n'), 'seo-audit-report.csv');
}

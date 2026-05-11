/**
 * Data transformation utilities for chart components.
 *
 * All heavy calculations happen here — components only render.
 * Every function is pure and memoizable.
 */

// ── Brand palette (matches brand.css) ──
export const COLORS = {
  red:       '#FF3B14',
  redDeep:   '#C8260A',
  redSoft:   '#FFE2D9',
  success:   '#2D8A5C',
  warn:      '#D97706',
  periwinkle:'#6B77E0',
  ink:       '#0E0E10',
  muted:     '#9A9AA0',
  paper:     '#F4EFE7',
  paper2:    '#EDE6D9',
  paper3:    '#E4DCCC',
  gold:      '#C49A37',
  kelp:      '#1F4D3F',
};

/**
 * Return a density-zone color.
 *   > 3.5% → red (stuffed)
 *   > 2.0% → warn (high)
 *   > 0.8% → success (healthy)
 *   else   → muted (low)
 */
export function densityColor(d) {
  if (d > 3.5) return COLORS.red;
  if (d > 2.0) return COLORS.warn;
  if (d > 0.8) return COLORS.success;
  return COLORS.muted;
}

export function densityLabel(d) {
  if (d > 3.5) return 'Stuffed';
  if (d > 2.0) return 'High';
  if (d > 0.8) return 'Healthy';
  return 'Low';
}

// ── Bar chart data ──

export function toBarChartData(keywords, gram = '1gram', limit = 15) {
  return (keywords?.[gram] || []).slice(0, limit).map((kw) => ({
    keyword: kw.keyword,
    count: kw.count,
    density: kw.density,
    fill: densityColor(kw.density),
    zone: densityLabel(kw.density),
  }));
}

// ── Donut chart data ──

export function toDensityZones(keywords, gram = '1gram') {
  const list = keywords?.[gram] || [];
  const zones = { Stuffed: 0, High: 0, Healthy: 0, Low: 0 };
  for (const kw of list) {
    zones[densityLabel(kw.density)]++;
  }
  return [
    { name: 'Stuffed', value: zones.Stuffed, color: COLORS.red },
    { name: 'High',    value: zones.High,    color: COLORS.warn },
    { name: 'Healthy', value: zones.Healthy, color: COLORS.success },
    { name: 'Low',     value: zones.Low,     color: COLORS.muted },
  ].filter((z) => z.value > 0);
}

// ── Stuffing risk score (0-100) ──

export function computeStuffingRisk(keywords) {
  const list = keywords?.['1gram'] || [];
  if (list.length === 0) return 0;
  const stuffed = list.filter((k) => k.density > 3.5).length;
  const high    = list.filter((k) => k.density > 2.0 && k.density <= 3.5).length;
  const maxDensity = list[0]?.density || 0;

  // Weighted formula
  let risk = (stuffed / list.length) * 60
           + (high / list.length) * 20
           + Math.min(maxDensity / 5, 1) * 20;
  return Math.min(100, Math.round(risk));
}

// ── Content heatmap data ──

export function toContentHeatmap(content, keywords) {
  const topKws = (keywords?.['1gram'] || []).slice(0, 8).map((k) => k.keyword);
  if (topKws.length === 0 || !content) return [];

  // Split into paragraphs / blocks
  const blocks = content.split(/\n\s*\n/).filter((b) => b.trim());
  const fallbackBlocks = blocks.length > 0
    ? blocks
    : splitByWordCount(content, 100);

  return fallbackBlocks.map((block, idx) => {
    const lower = block.toLowerCase();
    const words = lower.split(/\s+/).length;
    let totalHits = 0;
    const kwHits = {};

    for (const kw of topKws) {
      const regex = new RegExp(`\\b${escapeRegex(kw)}\\b`, 'gi');
      const matches = (lower.match(regex) || []).length;
      kwHits[kw] = matches;
      totalHits += matches;
    }

    return {
      index: idx,
      words,
      totalHits,
      intensity: words > 0 ? totalHits / words : 0,
      kwHits,
      label: `Block ${idx + 1}`,
    };
  });
}

function splitByWordCount(text, chunkSize) {
  const words = text.split(/\s+/);
  const blocks = [];
  for (let i = 0; i < words.length; i += chunkSize) {
    blocks.push(words.slice(i, i + chunkSize).join(' '));
  }
  return blocks;
}

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ── Keyword cloud data ──

export function toCloudData(keywords, gram = '1gram', limit = 30) {
  const list = (keywords?.[gram] || []).slice(0, limit);
  if (list.length === 0) return [];
  const maxCount = list[0]?.count || 1;

  return list.map((kw) => ({
    keyword: kw.keyword,
    count: kw.count,
    density: kw.density,
    size: 12 + Math.round((kw.count / maxCount) * 22),
    color: densityColor(kw.density),
  }));
}

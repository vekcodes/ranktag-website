import { analyzeKeywords } from './_lib/density.js';
import { parsePage } from './_lib/html.js';
import { fetchWithTiming, guardUrl, httpError, readBody, sendError, sendJson } from './_lib/http.js';
import { computeReadability } from './_lib/readability.js';
import { computeSeoScore } from './_lib/scoring.js';

async function analyzeOne(rawUrl, { minFrequency = 2, topN = 30 } = {}) {
  try {
    const target = guardUrl(rawUrl);
    const page = await fetchWithTiming(target);
    const parsed = parsePage(page.body, page.url);

    if (!parsed.text || parsed.text.split(/\s+/).filter(Boolean).length < 5) {
      return { url: rawUrl, final_url: page.url, title: parsed.title || null, error: 'Could not extract meaningful content.' };
    }

    const { totalWords, keywords } = analyzeKeywords(parsed.text, { minFrequency, topN });
    const readability = computeReadability(parsed.text);
    const score = computeSeoScore(keywords, parsed.text, totalWords, readability);

    const paragraphs = parsed.text.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
    const headingCount = parsed.h1Tags.length + parsed.h2Tags.length;

    return {
      url: rawUrl,
      final_url: page.url,
      title: parsed.title || null,
      meta_description: parsed.metaDescription || null,
      h1_tags: parsed.h1Tags,
      h2_tags: parsed.h2Tags,
      language: parsed.language || null,
      word_count: totalWords,
      paragraph_count: paragraphs.length,
      heading_count: headingCount,
      overall_score: score.overall_score,
      grade: score.grade,
      category_scores: score.category_scores,
      readability,
      keywords,
    };
  } catch (e) {
    return { url: rawUrl, error: e.message || 'Analysis failed' };
  }
}

function kwDict(page, gram = '1gram') {
  const out = new Map();
  for (const k of page.keywords?.[gram] || []) {
    out.set(k.keyword, { count: k.count, density: k.density });
  }
  return out;
}

function round1(v) { return Math.round(v * 10) / 10; }
function round2(v) { return Math.round(v * 100) / 100; }

function computeGaps(primary, competitors) {
  const valid = competitors.filter((c) => !c.error);
  if (!valid.length) return { missing: [], shared: [], unique_advantages: [] };

  const primaryKws = kwDict(primary);
  const compAgg = new Map();
  for (const c of valid) {
    for (const [kw, v] of kwDict(c)) {
      if (!compAgg.has(kw)) compAgg.set(kw, []);
      compAgg.get(kw).push(v);
    }
  }

  const allComp = new Set(compAgg.keys());
  const primaryKeys = new Set(primaryKws.keys());

  const missing = [];
  for (const kw of [...allComp].filter((k) => !primaryKeys.has(k)).sort()) {
    const entries = compAgg.get(kw);
    const avgCount = entries.reduce((s, e) => s + e.count, 0) / entries.length;
    const avgDensity = entries.reduce((s, e) => s + e.density, 0) / entries.length;
    const presence = entries.length;
    if (presence < 1) continue;
    missing.push({
      keyword: kw,
      primary_count: 0,
      primary_density: 0,
      competitor_avg_count: round1(avgCount),
      competitor_avg_density: round2(avgDensity),
      competitor_presence: presence,
      gap_type: 'missing',
      suggested_action: `Add "${kw}" to your content (${presence} competitor${presence > 1 ? 's' : ''} use it)`,
    });
  }
  missing.sort((a, b) =>
    b.competitor_presence - a.competitor_presence ||
    b.competitor_avg_density - a.competitor_avg_density,
  );

  const shared = [];
  for (const kw of [...primaryKeys].filter((k) => allComp.has(k)).sort()) {
    const { count: pCount, density: pDensity } = primaryKws.get(kw);
    const entries = compAgg.get(kw);
    const avgCount = entries.reduce((s, e) => s + e.count, 0) / entries.length;
    const avgDensity = entries.reduce((s, e) => s + e.density, 0) / entries.length;
    let gapType = 'shared';
    let action = '';
    if (pDensity < avgDensity * 0.5) {
      gapType = 'underused';
      action = `Increase usage of "${kw}" (yours: ${pDensity}%, competitors avg: ${round2(avgDensity)}%)`;
    } else if (pDensity > avgDensity * 2 && pDensity > 3.0) {
      gapType = 'overused';
      action = `Reduce "${kw}" density (yours: ${pDensity}%, competitors avg: ${round2(avgDensity)}%)`;
    }
    shared.push({
      keyword: kw,
      primary_count: pCount,
      primary_density: pDensity,
      competitor_avg_count: round1(avgCount),
      competitor_avg_density: round2(avgDensity),
      competitor_presence: entries.length,
      gap_type: gapType,
      suggested_action: action,
    });
  }
  shared.sort((a, b) =>
    b.competitor_presence - a.competitor_presence ||
    b.competitor_avg_density - a.competitor_avg_density,
  );

  const unique_advantages = [];
  for (const kw of [...primaryKeys].filter((k) => !allComp.has(k)).sort()) {
    const { count: pCount, density: pDensity } = primaryKws.get(kw);
    unique_advantages.push({
      keyword: kw,
      primary_count: pCount,
      primary_density: pDensity,
      competitor_avg_count: 0,
      competitor_avg_density: 0,
      competitor_presence: 0,
      gap_type: 'unique_advantage',
      suggested_action: `"${kw}" is unique to your content — a competitive edge`,
    });
  }
  unique_advantages.sort((a, b) => b.primary_density - a.primary_density);

  return { missing, shared, unique_advantages };
}

function computeBenchmarks(competitors) {
  const valid = competitors.filter((c) => !c.error);
  if (!valid.length) {
    return {
      avg_overall_score: 0,
      avg_word_count: 0,
      avg_paragraph_count: 0,
      avg_heading_count: 0,
      avg_keyword_count: 0,
      avg_top_density: 0,
      avg_readability_score: 0,
    };
  }
  const avg = (fn) => valid.reduce((s, c) => s + (fn(c) || 0), 0) / valid.length;
  return {
    avg_overall_score: round1(avg((c) => c.overall_score)),
    avg_word_count: round1(avg((c) => c.word_count)),
    avg_paragraph_count: round1(avg((c) => c.paragraph_count)),
    avg_heading_count: round1(avg((c) => c.heading_count)),
    avg_keyword_count: round1(avg((c) => (c.keywords?.['1gram'] || []).length)),
    avg_top_density: round2(avg((c) => c.keywords?.['1gram']?.[0]?.density || 0)),
    avg_readability_score: round1(avg((c) => c.readability?.readability_score || 0)),
  };
}

function computeInsights(primary, competitors, benchmarks, gaps) {
  const insights = [];
  const valid = competitors.filter((c) => !c.error);

  if (primary.overall_score < benchmarks.avg_overall_score - 10) {
    insights.push({
      severity: 'critical',
      message: `Your SEO score (${primary.overall_score}) is significantly below competitor average (${benchmarks.avg_overall_score}).`,
      detail: 'Focus on the keyword gaps and category-level recommendations below to close the gap.',
      category: 'Overall',
    });
  } else if (primary.overall_score > benchmarks.avg_overall_score + 10) {
    insights.push({
      severity: 'strength',
      message: `You outscore the competition by ${round1(primary.overall_score - benchmarks.avg_overall_score)} points.`,
      detail: `Average across ${valid.length} competitor${valid.length > 1 ? 's' : ''}: ${benchmarks.avg_overall_score}.`,
      category: 'Overall',
    });
  }

  if (primary.word_count < benchmarks.avg_word_count * 0.6 && benchmarks.avg_word_count > 0) {
    insights.push({
      severity: 'warning',
      message: `Your content is much shorter (${primary.word_count} words vs ${Math.round(benchmarks.avg_word_count)} avg).`,
      detail: 'Shorter pages often rank worse for competitive terms. Aim for at least competitor parity.',
      category: 'Content Structure',
    });
  }

  if (gaps.missing.length >= 5) {
    const top = gaps.missing.slice(0, 3).map((g) => `"${g.keyword}"`).join(', ');
    insights.push({
      severity: 'warning',
      message: `${gaps.missing.length} keywords competitors use are missing from your page.`,
      detail: `Top missing: ${top}.`,
      category: 'Keyword Coverage',
    });
  }

  if (gaps.unique_advantages.length >= 3) {
    const top = gaps.unique_advantages.slice(0, 3).map((g) => `"${g.keyword}"`).join(', ');
    insights.push({
      severity: 'strength',
      message: `${gaps.unique_advantages.length} unique keywords no competitor uses.`,
      detail: `Top unique: ${top}. Lean into these for differentiation.`,
      category: 'Differentiation',
    });
  }

  // Category-level: any category where primary is far below competitor avg
  if (primary.category_scores?.length && valid.length) {
    for (const cat of primary.category_scores) {
      const compScores = valid
        .map((c) => c.category_scores?.find((cc) => cc.name === cat.name)?.score)
        .filter((s) => typeof s === 'number');
      if (!compScores.length) continue;
      const compAvg = compScores.reduce((s, n) => s + n, 0) / compScores.length;
      if (cat.score < compAvg - 15) {
        insights.push({
          severity: 'warning',
          message: `${cat.name}: you score ${cat.score}, competitor average is ${round1(compAvg)}.`,
          detail: `Biggest single-category gap to close.`,
          category: cat.name,
        });
      } else if (cat.score > compAvg + 15) {
        insights.push({
          severity: 'strength',
          message: `${cat.name}: you outscore competitors by ${round1(cat.score - compAvg)} points.`,
          detail: `Yours: ${cat.score}. Theirs avg: ${round1(compAvg)}.`,
          category: cat.name,
        });
      }
    }
  }

  return insights;
}

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') throw httpError(405, 'Method not allowed');
    const body = readBody(req);
    const primaryUrl = body.primary_url;
    const competitorUrls = body.competitor_urls || [];
    const minFrequency = body.min_frequency ?? 2;
    const topN = body.top_n ?? 30;

    if (!primaryUrl) throw httpError(400, 'primary_url is required');
    if (!Array.isArray(competitorUrls) || competitorUrls.length === 0) {
      throw httpError(400, 'competitor_urls must be a non-empty array');
    }
    if (competitorUrls.length > 5) throw httpError(400, 'maximum 5 competitor URLs');

    const opts = { minFrequency, topN };
    const allResults = await Promise.all([
      analyzeOne(primaryUrl, opts),
      ...competitorUrls.map((u) => analyzeOne(u, opts)),
    ]);
    const [primary, ...competitors] = allResults;

    if (primary.error) {
      throw httpError(422, `Could not analyze primary URL: ${primary.error}`);
    }

    const gaps = computeGaps(primary, competitors);
    const benchmarks = computeBenchmarks(competitors);
    const insights = computeInsights(primary, competitors, benchmarks, gaps);

    sendJson(res, 200, {
      primary,
      competitors,
      benchmarks,
      keyword_gaps: gaps.missing,
      shared_keywords: gaps.shared,
      unique_advantages: gaps.unique_advantages,
      insights,
    });
  } catch (err) {
    sendError(res, err);
  }
}

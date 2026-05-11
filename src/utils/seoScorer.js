/**
 * Client-side SEO scoring engine.
 *
 * Runs in real-time using keyword data already returned by the session
 * API + the raw content text. No extra backend calls required.
 *
 * Mirrors the backend scoring_engine.py logic so dashboard scores
 * update instantly as users type.
 */

// ── Readability (Flesch formulas) ───────────────────────────────────────

function countSyllables(word) {
  word = word.toLowerCase();
  if (word.length <= 2) return 1;
  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
  const m = word.match(/[aeiouy]{1,2}/g);
  return m ? Math.max(1, m.length) : 1;
}

export function computeReadability(text) {
  if (!text || text.trim().length < 10) {
    return { fre: 0, grade: 0, level: 'N/A', avgSL: 0, longPct: 0, passivePct: 0, score: 0 };
  }
  const sentences = text.split(/[.!?]+\s+|\n/).filter((s) => s.trim());
  const words = text.match(/[a-zA-Z]+/g) || [];
  const sc = Math.max(1, sentences.length);
  const wc = Math.max(1, words.length);
  const syllables = words.reduce((s, w) => s + countSyllables(w), 0);

  const avgSL = wc / sc;
  const avgSyl = syllables / wc;
  const fre = Math.max(0, Math.min(100, 206.835 - 1.015 * avgSL - 84.6 * avgSyl));
  const grade = Math.max(0, 0.39 * avgSL + 11.8 * avgSyl - 15.59);

  const longSents = sentences.filter((s) => s.split(/\s+/).length > 25).length;
  const passive = (text.match(/\b(?:am|is|are|was|were|be|been|being)\s+\w+(?:ed|en)\b/gi) || []).length;

  const level = fre >= 80 ? 'Easy' : fre >= 60 ? 'Standard' : fre >= 40 ? 'Difficult' : 'Very Difficult';

  // Score: ideal 55-75
  let score;
  if (fre >= 55 && fre <= 75) score = 100;
  else if (fre > 75) score = Math.max(60, 100 - (fre - 75) * 1.5);
  else if (fre >= 30) score = Math.max(30, 100 - (55 - fre) * 2);
  else score = Math.max(10, fre);

  if (longSents / sc * 100 > 30) score -= 10;
  if (passive / sc * 100 > 20) score -= 5;

  return {
    fre: Math.round(fre * 10) / 10,
    grade: Math.round(grade * 10) / 10,
    level,
    avgSL: Math.round(avgSL * 10) / 10,
    longPct: Math.round(longSents / sc * 1000) / 10,
    passivePct: Math.round(passive / sc * 1000) / 10,
    score: Math.max(0, Math.min(100, Math.round(score))),
  };
}

// ── Category scorers ────────────────────────────────────────────────────

function scoreKeywordOptimization(keywords, totalWords) {
  const grams = keywords?.['1gram'] || [];
  if (!grams.length || !totalWords) return { score: 0, details: {} };

  const stuffed = grams.filter((k) => k.density > 3.5).length;
  const ideal = grams.filter((k) => k.density >= 0.8 && k.density <= 2.5).length;
  const maxD = grams[0]?.density || 0;

  const idealRatio = ideal / Math.min(grams.length, 10);
  let score = idealRatio * 100;
  if (stuffed > 0) score -= stuffed * 18;
  if (maxD > 5) score -= (maxD - 5) * 10;
  if (grams.length < 3 && totalWords > 200) score -= 20;

  return { score: clamp(score), details: { stuffed, ideal, maxD } };
}

function scoreContentStructure(text, totalWords) {
  const paras = text.split(/\n\s*\n/).filter((p) => p.trim());
  const longP = paras.filter((p) => p.split(/\s+/).length > 150).length;

  let score = 100;
  if (totalWords < 300) score -= 30;
  else if (totalWords < 800) score -= 10;
  if (paras.length < 3) score -= 20;
  score -= longP * 5;

  return { score: clamp(score), details: { paragraphs: paras.length, longP } };
}

function scoreProminence(keywords, text) {
  const grams = keywords?.['1gram'] || [];
  if (!grams.length || !text) return { score: 0, details: {} };

  const top5 = grams.slice(0, 5).map((k) => k.keyword);
  const lower = text.toLowerCase();
  const words = lower.split(/\s+/);
  const total = words.length;
  if (!total) return { score: 0, details: {} };

  const introBound = Math.max(1, Math.floor(total * 0.15));
  const concStart = Math.max(introBound + 1, total - Math.floor(total * 0.15));
  const introText = words.slice(0, introBound).join(' ');
  const concText = words.slice(concStart).join(' ');
  const firstPara = (text.split(/\n\s*\n/)[0] || '').toLowerCase();

  const inIntro = top5.filter((kw) => introText.includes(kw)).length;
  const inConc = top5.filter((kw) => concText.includes(kw)).length;
  const inFirst = top5.filter((kw) => firstPara.includes(kw)).length;

  const n = Math.max(1, top5.length);
  const score = Math.min(40, (inIntro / n) * 40)
              + Math.min(25, (inConc / n) * 25)
              + Math.min(35, (inFirst / n) * 35);

  return { score: clamp(score), details: { inIntro, inConc, inFirst } };
}

function scoreSemantic(keywords, totalWords) {
  const u1 = (keywords?.['1gram'] || []).length;
  const u2 = (keywords?.['2gram'] || []).length;
  const u3 = (keywords?.['3gram'] || []).length;
  if (!totalWords) return { score: 0, details: {} };

  let score = 0;
  score += u1 >= 15 ? 50 : u1 >= 8 ? 35 : u1 >= 3 ? 20 : 0;
  score += u2 >= 8 ? 30 : u2 >= 3 ? 20 : u2 >= 1 ? 10 : 0;
  score += u3 >= 5 ? 20 : u3 >= 2 ? 12 : u3 >= 1 ? 5 : 0;

  return { score: clamp(score), details: { u1, u2, u3 } };
}

function scoreDistribution(keywords, text) {
  const grams = keywords?.['1gram'] || [];
  if (!grams.length || !text) return { score: 70, details: {} };

  const blocks = text.split(/\n\s*\n/).filter((b) => b.trim());
  if (blocks.length <= 1) return { score: 70, details: { blocks: 1 } };

  const top3 = grams.slice(0, 3).map((k) => k.keyword);
  const blockHits = blocks.map((b) => {
    const low = b.toLowerCase();
    return top3.reduce((s, kw) => s + (low.split(kw).length - 1), 0);
  });

  const totalHits = blockHits.reduce((s, h) => s + h, 0);
  if (!totalHits) return { score: 50, details: {} };

  const expected = totalHits / blocks.length;
  const variance = blockHits.reduce((s, h) => s + (h - expected) ** 2, 0) / blocks.length;
  const cv = Math.sqrt(variance) / Math.max(expected, 0.01);
  const empty = blockHits.filter((h) => h === 0).length;

  let score = cv < 0.5 ? 100 : cv < 1 ? 80 : cv < 1.5 ? 60 : cv < 2.5 ? 40 : 20;
  score -= empty * 5;

  return { score: clamp(score), details: { blocks: blocks.length, cv: Math.round(cv * 100) / 100, empty } };
}

function clamp(v) { return Math.max(0, Math.min(100, Math.round(v * 10) / 10)); }

// ── Recommendation generator ────────────────────────────────────────────

function generateRecs(cats, keywords, text, totalWords, readability) {
  const recs = [];
  const strengths = [];
  const warnings = [];
  const grams = keywords?.['1gram'] || [];

  // Keyword optimization
  const kw = cats.find((c) => c.name === 'Keyword Optimization');
  if (kw) {
    if (kw.details.stuffed > 0) {
      const stuffedKws = grams.filter((k) => k.density > 3.5).slice(0, 3).map((k) => k.keyword);
      warnings.push({ category: kw.name, severity: 'critical', message: `Reduce density of: ${stuffedKws.join(', ')}`, detail: `${kw.details.stuffed} keyword(s) exceed 3.5% density.` });
    } else if (kw.score >= 80) {
      strengths.push({ category: kw.name, message: 'Keyword density is well-balanced.' });
    }
    if (kw.details.ideal === 0 && grams.length > 0 && totalWords > 200) {
      recs.push({ category: kw.name, severity: 'warning', message: 'No keywords in ideal range (0.8-2.5%)', detail: 'Increase usage of target keywords naturally.' });
    }
  }

  // Content structure
  const cs = cats.find((c) => c.name === 'Content Structure');
  if (cs) {
    if (totalWords < 300) warnings.push({ category: cs.name, severity: 'critical', message: `Very thin content (${totalWords} words)`, detail: 'Expand to at least 800 words.' });
    else if (totalWords < 800) recs.push({ category: cs.name, severity: 'warning', message: `Short content (${totalWords} words)`, detail: 'Consider expanding to 800-1,500 words.' });
    else strengths.push({ category: cs.name, message: `Good content length (${totalWords.toLocaleString()} words).` });
    if (cs.details.longP > 0) recs.push({ category: cs.name, severity: 'suggestion', message: `Break up ${cs.details.longP} long paragraph(s)`, detail: 'Split paragraphs over 150 words.' });
  }

  // Readability
  if (readability.fre < 40) warnings.push({ category: 'Readability', severity: 'critical', message: `Very difficult to read (Flesch: ${readability.fre})`, detail: 'Simplify sentences and use shorter words.' });
  else if (readability.fre < 55) recs.push({ category: 'Readability', severity: 'warning', message: `Readability could improve (Flesch: ${readability.fre})`, detail: 'Aim for 60-70 for web content.' });
  else strengths.push({ category: 'Readability', message: `Good readability (${readability.level}, grade ${readability.grade}).` });
  if (readability.longPct > 30) recs.push({ category: 'Readability', severity: 'suggestion', message: `${Math.round(readability.longPct)}% of sentences are over 25 words`, detail: 'Mix shorter and longer sentences.' });

  // Prominence
  const kp = cats.find((c) => c.name === 'Keyword Prominence');
  if (kp && grams.length > 0) {
    const topKw = grams[0].keyword;
    if (kp.details.inFirst === 0) recs.push({ category: kp.name, severity: 'warning', message: `Add "${topKw}" to the first paragraph`, detail: 'Primary keyword should appear early.' });
    if (kp.details.inConc === 0) recs.push({ category: kp.name, severity: 'suggestion', message: `Mention "${topKw}" in the conclusion`, detail: 'Reinforce relevance at the end.' });
    if (kp.score >= 80) strengths.push({ category: kp.name, message: 'Primary keywords are well-placed.' });
  }

  // Semantic
  const sc = cats.find((c) => c.name === 'Semantic Coverage');
  if (sc && sc.details.u1 < 5 && totalWords > 200) recs.push({ category: sc.name, severity: 'warning', message: 'Low keyword variety', detail: 'Use more related terms and synonyms.' });
  else if (sc && sc.details.u1 >= 10) strengths.push({ category: sc.name, message: `Strong semantic coverage (${sc.details.u1} keywords, ${sc.details.u2} phrases).` });

  // Distribution
  const kd = cats.find((c) => c.name === 'Keyword Distribution');
  if (kd && kd.details.empty > 0) recs.push({ category: kd.name, severity: 'suggestion', message: `${kd.details.empty} section(s) lack keywords`, detail: 'Spread keywords across all sections.' });
  else if (kd && kd.score >= 80) strengths.push({ category: kd.name, message: 'Keywords evenly distributed.' });

  return { recommendations: recs, strengths, warnings };
}

// ── Main scoring function ───────────────────────────────────────────────

const WEIGHTS = { kwOpt: 25, structure: 20, readability: 20, prominence: 15, semantic: 10, distribution: 10 };

export function computeSeoScore(keywords, content, totalWords) {
  if (!keywords || !totalWords || totalWords < 5) {
    return null;
  }

  const readability = computeReadability(content);
  const kwOpt = scoreKeywordOptimization(keywords, totalWords);
  const structure = scoreContentStructure(content, totalWords);
  const prominence = scoreProminence(keywords, content);
  const semantic = scoreSemantic(keywords, totalWords);
  const distribution = scoreDistribution(keywords, content);

  const cats = [
    { name: 'Keyword Optimization', score: kwOpt.score, weight: WEIGHTS.kwOpt, details: kwOpt.details },
    { name: 'Content Structure', score: structure.score, weight: WEIGHTS.structure, details: structure.details },
    { name: 'Readability', score: readability.score, weight: WEIGHTS.readability, details: {} },
    { name: 'Keyword Prominence', score: prominence.score, weight: WEIGHTS.prominence, details: prominence.details },
    { name: 'Semantic Coverage', score: semantic.score, weight: WEIGHTS.semantic, details: semantic.details },
    { name: 'Keyword Distribution', score: distribution.score, weight: WEIGHTS.distribution, details: distribution.details },
  ].map((c) => ({ ...c, weighted: Math.round(c.score * c.weight) / 100 }));

  const overall = Math.round(cats.reduce((s, c) => s + c.weighted, 0) * 10) / 10;
  const grade = overall >= 90 ? 'A+' : overall >= 80 ? 'A' : overall >= 70 ? 'B' : overall >= 60 ? 'C' : overall >= 50 ? 'D' : 'F';

  const { recommendations, strengths, warnings } = generateRecs(cats, keywords, content, totalWords, readability);

  return { overall, grade, categories: cats, readability, recommendations, strengths, warnings };
}

const WEIGHTS = {
  keyword_optimization: 25,
  content_structure: 20,
  readability: 20,
  keyword_prominence: 15,
  semantic_coverage: 10,
  keyword_distribution: 10,
};

const DENSITY = { stuffed_above: 3.5, ideal_min: 0.8, ideal_max: 2.5 };
const CONTENT = {
  min_words_short: 300,
  min_words_medium: 800,
  max_paragraph_words: 150,
  min_paragraphs: 3,
  min_headings: 2,
};

function clamp(v, lo = 0, hi = 100) {
  return Math.max(lo, Math.min(hi, v));
}

function r(v) {
  return Math.round(v * 10) / 10;
}

function gradeOf(score) {
  if (score >= 90) return 'A+';
  if (score >= 80) return 'A';
  if (score >= 70) return 'B';
  if (score >= 60) return 'C';
  if (score >= 50) return 'D';
  return 'F';
}

/**
 * Whether the page's leading terms sit at a natural density.
 *
 * Judged on the terms that actually carry the page: the primary term, then
 * how many of the next four are present at a meaningful level. The previous
 * version required ten of the top thirty terms to clear 0.8% each, which on a
 * 1,700 word page means 136 occurrences of just ten words. No page of real
 * prose can reach that, so long-form content was scored 20 to 40 however well
 * it was written, while a 200 word page scored 100. Same bands as before
 * (DENSITY), applied where they mean something.
 */
function scoreKeywordOptimization(keywords, totalWords) {
  const grams = keywords['1gram'] || [];
  if (!grams.length || totalWords === 0) {
    return { name: 'Keyword Optimization', score: 0, details: {} };
  }

  // Ordered from the top down so an over-stuffed primary term is caught
  // before the under-density interpolation, which would otherwise read a 40%
  // density as "far above the floor" and award full marks. Over the stuffing
  // threshold the score slopes rather than falling off a cliff: a reference
  // page whose subject sits at 3.9% is not the same as one at 15%.
  const primary = grams[0]?.density || 0;
  let base;
  if (primary > 5) base = 15;
  else if (primary > DENSITY.stuffed_above) base = 60 - ((primary - DENSITY.stuffed_above) / 1.5) * 40;
  else if (primary > DENSITY.ideal_max) base = 80;
  else if (primary >= DENSITY.ideal_min) base = 100;
  else if (primary >= 0.4) base = 70 + ((primary - 0.4) / (DENSITY.ideal_min - 0.4)) * 20;
  else if (primary >= 0.2) base = 50;
  else base = 30;

  // Supporting terms: the topic should be carried by more than one word.
  const supporting = grams.slice(1, 5);
  const present = supporting.filter((k) => k.density >= 0.3).length;
  const supportScore = supporting.length ? (present / supporting.length) * 100 : base;

  let score = base * 0.75 + supportScore * 0.25;

  // Counted after the primary, which `base` already accounts for: penalising
  // it twice turned one slightly-over term into a failing page.
  const stuffedOthers = grams.slice(1).filter((k) => k.density > DENSITY.stuffed_above).length;
  const stuffed = grams.filter((k) => k.density > DENSITY.stuffed_above).length;
  const maxDensity = primary;
  if (stuffedOthers > 0) score -= stuffedOthers * 18;
  if (maxDensity > 5.0) score -= (maxDensity - 5.0) * 10;
  if (grams.length < 3 && totalWords > 200) score -= 20;

  return {
    name: 'Keyword Optimization',
    score: r(clamp(score)),
    details: {
      primary_term: grams[0]?.keyword || null,
      primary_density: maxDensity,
      supporting_terms_present: present,
      stuffed,
    },
  };
}

function scoreContentStructure(text, totalWords) {
  const paragraphs = (text || '').split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  const paraCount = paragraphs.length;
  const longParas = paragraphs.filter((p) => p.split(/\s+/).length > CONTENT.max_paragraph_words).length;

  const lines = (text || '').split('\n');
  const headingLike = lines.filter((ln) => {
    const t = ln.trim();
    if (!t) return false;
    if (t.split(/\s+/).length > 10) return false;
    return !/[.!?,]$/.test(t);
  }).length;

  let score = 100;
  if (totalWords < CONTENT.min_words_short) score -= 30;
  else if (totalWords < CONTENT.min_words_medium) score -= 10;
  else if (totalWords > 5000) score -= 5;

  if (paraCount < CONTENT.min_paragraphs) score -= 20;
  if (longParas > 0) score -= longParas * 5;
  if (headingLike < CONTENT.min_headings && totalWords > 300) score -= 15;

  return {
    name: 'Content Structure',
    score: r(clamp(score)),
    details: { paragraphs: paraCount, long_paragraphs: longParas, heading_like: headingLike },
  };
}

function scoreReadabilityFn(readability) {
  let score = readability.readability_score;
  if (readability.long_sentence_pct > 30) score -= 10;
  if (readability.passive_voice_pct > 20) score -= 5;
  if (readability.difficult_word_pct > 25) score -= 5;
  return {
    name: 'Readability',
    score: r(clamp(score)),
    details: {
      flesch_reading_ease: readability.flesch_reading_ease,
      grade_level: readability.flesch_kincaid_grade,
      reading_level: readability.reading_level,
      avg_sentence_length: readability.avg_sentence_length,
      passive_voice_pct: readability.passive_voice_pct,
    },
  };
}

function scoreKeywordProminence(keywords, text) {
  const grams = keywords['1gram'] || [];
  if (!grams.length) return { name: 'Keyword Prominence', score: 0, details: {} };

  const top5 = grams.slice(0, 5).map((k) => k.keyword);
  const lower = (text || '').toLowerCase();
  const words = lower.split(/\s+/).filter(Boolean);
  const total = words.length;
  if (total === 0) return { name: 'Keyword Prominence', score: 0, details: {} };

  const introBoundary = Math.max(1, Math.floor(total * 0.15));
  const conclusionStart = Math.max(introBoundary + 1, total - Math.floor(total * 0.15));
  const introText = words.slice(0, introBoundary).join(' ');
  const conclusionText = words.slice(conclusionStart).join(' ');

  const parts = (text || '').split(/\n\s*\n/);
  const firstPara = (parts[0] || '').toLowerCase();

  const inIntro = top5.filter((kw) => introText.includes(kw)).length;
  const inConclusion = top5.filter((kw) => conclusionText.includes(kw)).length;
  const inFirstPara = top5.filter((kw) => firstPara.includes(kw)).length;

  const n = Math.max(1, top5.length);
  let score = 0;
  score += Math.min(40, (inIntro / n) * 40);
  score += Math.min(25, (inConclusion / n) * 25);
  score += Math.min(35, (inFirstPara / n) * 35);

  return {
    name: 'Keyword Prominence',
    score: r(score),
    details: { in_intro: inIntro, in_conclusion: inConclusion, in_first_para: inFirstPara },
  };
}

function scoreSemanticCoverage(keywords, totalWords) {
  const u1 = (keywords['1gram'] || []).length;
  const u2 = (keywords['2gram'] || []).length;
  const u3 = (keywords['3gram'] || []).length;
  if (totalWords === 0) return { name: 'Semantic Coverage', score: 0, details: {} };

  let score = 0;
  if (u1 >= 15) score += 50;
  else if (u1 >= 8) score += 35;
  else if (u1 >= 3) score += 20;

  if (u2 >= 8) score += 30;
  else if (u2 >= 3) score += 20;
  else if (u2 >= 1) score += 10;

  if (u3 >= 5) score += 20;
  else if (u3 >= 2) score += 12;
  else if (u3 >= 1) score += 5;

  return {
    name: 'Semantic Coverage',
    score: r(Math.min(100, score)),
    details: {
      unigrams: u1,
      bigrams: u2,
      trigrams: u3,
      diversity_ratio: Math.round((u1 / Math.max(1, totalWords)) * 100 * 100) / 100,
    },
  };
}

/**
 * How evenly the leading terms are spread through the page.
 *
 * Measured over ten equal slices of the text rather than over markup blocks.
 * Block counting made the score an artefact of how a page is marked up: one
 * <div> wrapping everything scored differently from the same prose in forty
 * <p> tags, and the per-empty-block penalty (-5 each) drove any page with
 * many short blocks to zero. Slices are markup-independent, so the number
 * answers the question it claims to: does the topic run through the page, or
 * sit in one corner of it.
 */
const DISTRIBUTION_SEGMENTS = 10;

function scoreKeywordDistribution(keywords, text) {
  const grams = keywords['1gram'] || [];
  if (!grams.length || !(text || '').trim()) {
    return { name: 'Keyword Distribution', score: 0, details: {} };
  }
  const words = (text || '').toLowerCase().split(/\s+/).filter(Boolean);
  // Below ~6 words a slice, evenness is noise rather than signal.
  if (words.length < DISTRIBUTION_SEGMENTS * 6) {
    return { name: 'Keyword Distribution', score: 70, details: { segments: 1, note: 'too_short' } };
  }

  const size = Math.ceil(words.length / DISTRIBUTION_SEGMENTS);
  const segments = [];
  for (let i = 0; i < words.length; i += size) segments.push(words.slice(i, i + size).join(' '));

  const top3 = grams.slice(0, 3).map((k) => k.keyword.toLowerCase());
  const hits = segments.map((seg) => top3.reduce((sum, kw) => sum + (seg.split(kw).length - 1), 0));
  const totalHits = hits.reduce((s, n) => s + n, 0);
  if (totalHits === 0) {
    return { name: 'Keyword Distribution', score: 50, details: { segments: segments.length } };
  }

  const expected = totalHits / segments.length;
  const variance = hits.reduce((s, h) => s + (h - expected) ** 2, 0) / segments.length;
  const cv = Math.sqrt(variance) / Math.max(expected, 0.01);

  let score;
  if (cv < 0.5) score = 100;
  else if (cv < 1.0) score = 80;
  else if (cv < 1.5) score = 60;
  else if (cv < 2.5) score = 40;
  else score = 20;

  // Proportional, and capped: a third of the page never mentioning the topic
  // is worth a deduction, not an automatic zero.
  const emptySegments = hits.filter((h) => h === 0).length;
  score -= Math.round((emptySegments / segments.length) * 30);

  return {
    name: 'Keyword Distribution',
    score: r(clamp(score)),
    details: {
      segments: segments.length,
      cv: Math.round(cv * 100) / 100,
      empty_segments: emptySegments,
    },
  };
}

export function computeSeoScore(keywords, text, totalWords, readability) {
  const cats = [
    [scoreKeywordOptimization(keywords, totalWords), WEIGHTS.keyword_optimization],
    [scoreContentStructure(text, totalWords), WEIGHTS.content_structure],
    [scoreReadabilityFn(readability), WEIGHTS.readability],
    [scoreKeywordProminence(keywords, text), WEIGHTS.keyword_prominence],
    [scoreSemanticCoverage(keywords, totalWords), WEIGHTS.semantic_coverage],
    [scoreKeywordDistribution(keywords, text), WEIGHTS.keyword_distribution],
  ];

  const category_scores = cats.map(([cat, w]) => ({
    name: cat.name,
    score: cat.score,
    weight: w,
    weighted: Math.round(cat.score * w / 100 * 100) / 100,
    details: cat.details,
  }));

  const overall = r(category_scores.reduce((s, c) => s + c.weighted, 0));

  return {
    overall_score: overall,
    grade: gradeOf(overall),
    category_scores,
  };
}

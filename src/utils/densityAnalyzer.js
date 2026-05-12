// Client-side keyword density analyzer.
//
// Produces the shape the dashboard's keyword density components consume —
// KeywordTable, VisualizationPanel, StatsCards — so everything keeps working
// without any backend service running.
//
// Shape:
//   {
//     keywords: { '1gram': [...], '2gram': [...], '3gram': [...] },
//     statistics: { total_words, unique_words, filtered_words, block_count },
//     processing: { total_processing_ms, is_full_reprocess, reprocessed_blocks, total_blocks }
//   }

const STOP_WORDS = new Set([
  'a','an','and','are','as','at','be','been','being','but','by','do','does','did','for','from',
  'has','have','having','he','her','hers','him','his','i','if','in','into','is','it','its','itself',
  'me','my','no','nor','not','of','on','or','our','ours','out','over','own','same','she','so',
  'some','such','than','that','the','their','theirs','them','they','this','those','through','to',
  'too','under','until','up','very','was','we','were','what','when','where','which','while','who',
  'whom','why','will','with','you','your','yours','yourself','yourselves','should','would','could',
  'can','am','about','above','after','again','against','all','also','any','because','before','below',
  'between','both','during','each','few','more','most','other','only','off','these','there','here',
  'just','then',
]);

const NUMERIC = /^\d+(?:[.,]\d+)*$/;

export function tokenize(text) {
  const cleaned = (text || '').toLowerCase().replace(/[^a-z0-9\s'-]/g, ' ');
  return cleaned.split(/\s+/).filter(Boolean);
}

function rankCounter(counter, totalWords, { minFrequency, topN }) {
  const entries = [];
  for (const [keyword, count] of counter) {
    if (count < minFrequency) continue;
    entries.push({
      keyword,
      count,
      density: totalWords ? +((count / totalWords) * 100).toFixed(2) : 0,
    });
  }
  entries.sort((a, b) => (b.count - a.count) || a.keyword.localeCompare(b.keyword));
  return entries.slice(0, topN);
}

export function analyzeDensity(text, options = {}) {
  const t0 = performance.now();

  const {
    filterStopwords = true,
    removeNumbers = false,
    minFrequency = 2,
    topN = 30,
  } = options;

  const tokens = tokenize(text);
  const totalWords = tokens.length;

  const unigramCounter = new Map();
  const bigramCounter = new Map();
  const trigramCounter = new Map();

  const isStop = (w) => filterStopwords && STOP_WORDS.has(w);
  const isNumber = (w) => removeNumbers && NUMERIC.test(w);
  const skip1 = (w) => w.length < 2 || isStop(w) || isNumber(w);

  const uniqueSet = new Set();
  let filteredCount = 0;

  for (let i = 0; i < tokens.length; i++) {
    const w = tokens[i];
    uniqueSet.add(w);
    if (skip1(w)) continue;
    filteredCount += 1;
    unigramCounter.set(w, (unigramCounter.get(w) || 0) + 1);
  }

  for (let i = 0; i < tokens.length - 1; i++) {
    const a = tokens[i], b = tokens[i + 1];
    if (skip1(a) || skip1(b)) continue;
    const key = `${a} ${b}`;
    bigramCounter.set(key, (bigramCounter.get(key) || 0) + 1);
  }

  for (let i = 0; i < tokens.length - 2; i++) {
    const a = tokens[i], b = tokens[i + 1], c = tokens[i + 2];
    if (a.length < 2 || b.length < 2 || c.length < 2) continue;
    if (isNumber(a) || isNumber(b) || isNumber(c)) continue;
    // Allow stopwords in the middle (e.g. "cost of living"), but require
    // at least one of the outer tokens to be a content word.
    if (isStop(a) && isStop(c)) continue;
    const key = `${a} ${b} ${c}`;
    trigramCounter.set(key, (trigramCounter.get(key) || 0) + 1);
  }

  const keywords = {
    '1gram': rankCounter(unigramCounter, totalWords, { minFrequency, topN }),
    '2gram': rankCounter(bigramCounter, totalWords, { minFrequency, topN }),
    '3gram': rankCounter(trigramCounter, totalWords, { minFrequency, topN }),
  };

  const ms = performance.now() - t0;

  return {
    keywords,
    statistics: {
      total_words: totalWords,
      unique_words: uniqueSet.size,
      filtered_words: filteredCount,
      block_count: 1,
    },
    processing: {
      total_processing_ms: ms,
      is_full_reprocess: true,
      reprocessed_blocks: 1,
      total_blocks: 1,
    },
  };
}

export const STOP_WORDS = new Set([
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

export function tokenize(text) {
  const cleaned = (text || '').toLowerCase().replace(/[^a-z0-9\s'\-]/g, ' ');
  return cleaned.split(/\s+/).filter(Boolean);
}

export function rankedList(counter, total, limit, minCount = 2) {
  const entries = [...counter.entries()].sort((a, b) => b[1] - a[1]);
  const out = [];
  for (const [term, count] of entries) {
    if (count < minCount) continue;
    out.push({
      keyword: term,
      term,
      count,
      density: total ? Math.round((count / total) * 10000) / 100 : 0,
    });
    if (out.length >= limit) break;
  }
  return out;
}

export function analyzeKeywords(text, { minFrequency = 2, topN = 30 } = {}) {
  const tokens = tokenize(text);
  const totalWords = tokens.length;

  const unigrams = new Map();
  for (const w of tokens) {
    if (w.length < 2 || STOP_WORDS.has(w)) continue;
    unigrams.set(w, (unigrams.get(w) || 0) + 1);
  }

  const bigrams = new Map();
  for (let i = 0; i < tokens.length - 1; i++) {
    const a = tokens[i], b = tokens[i + 1];
    if (STOP_WORDS.has(a) || STOP_WORDS.has(b)) continue;
    if (a.length < 2 || b.length < 2) continue;
    const k = `${a} ${b}`;
    bigrams.set(k, (bigrams.get(k) || 0) + 1);
  }

  const trigrams = new Map();
  for (let i = 0; i < tokens.length - 2; i++) {
    const a = tokens[i], b = tokens[i + 1], c = tokens[i + 2];
    if (STOP_WORDS.has(a) && STOP_WORDS.has(c)) continue;
    if (a.length < 2 || b.length < 2 || c.length < 2) continue;
    const k = `${a} ${b} ${c}`;
    trigrams.set(k, (trigrams.get(k) || 0) + 1);
  }

  return {
    totalWords,
    keywords: {
      '1gram': rankedList(unigrams, totalWords, topN, minFrequency),
      '2gram': rankedList(bigrams, totalWords, topN, minFrequency),
      '3gram': rankedList(trigrams, totalWords, topN, minFrequency),
    },
  };
}

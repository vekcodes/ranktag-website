import { httpError, readBody, sendError, sendJson } from './_lib/http.js';

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

function tokenize(text) {
  const cleaned = (text || '').toLowerCase().replace(/[^a-z0-9\s'\-]/g, ' ');
  return cleaned.split(/\s+/).filter(Boolean);
}

function ranked(counter, total, limit = 12, minCount = 2) {
  const entries = [...counter.entries()].sort((a, b) => b[1] - a[1]);
  const out = [];
  for (const [term, count] of entries) {
    if (count < minCount) continue;
    out.push({ term, count, density: total ? (count / total) * 100 : 0 });
    if (out.length >= limit) break;
  }
  return out;
}

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export default function handler(req, res) {
  try {
    if (req.method !== 'POST') throw httpError(405, 'Method not allowed');
    const { text, target } = readBody(req);
    if (!text || typeof text !== 'string') throw httpError(400, 'text is required');

    const tokens = tokenize(text);
    const total = tokens.length;
    if (total === 0) throw httpError(400, 'text is empty after normalisation');

    const wordCounter = new Map();
    for (const w of tokens) {
      if (w.length < 2 || STOP_WORDS.has(w)) continue;
      wordCounter.set(w, (wordCounter.get(w) || 0) + 1);
    }

    const bigramCounter = new Map();
    for (let i = 0; i < tokens.length - 1; i++) {
      const a = tokens[i], b = tokens[i + 1];
      if (STOP_WORDS.has(a) || STOP_WORDS.has(b)) continue;
      if (a.length < 2 || b.length < 2) continue;
      const k = `${a} ${b}`;
      bigramCounter.set(k, (bigramCounter.get(k) || 0) + 1);
    }

    const trigramCounter = new Map();
    for (let i = 0; i < tokens.length - 2; i++) {
      const a = tokens[i], b = tokens[i + 1], c = tokens[i + 2];
      if (STOP_WORDS.has(a) && STOP_WORDS.has(c)) continue;
      if (a.length < 2 || b.length < 2 || c.length < 2) continue;
      const k = `${a} ${b} ${c}`;
      trigramCounter.set(k, (trigramCounter.get(k) || 0) + 1);
    }

    const sentences = (text.split(/[.!?]+/).filter((s) => s.trim()).length) || 0;

    let targetReadout = null;
    if (target && String(target).trim()) {
      const t = String(target).trim().toLowerCase();
      const targetTokens = t.split(/\s+/).length;
      const cleaned = (text || '').toLowerCase().replace(/[^a-z0-9\s'\-]/g, ' ');
      const re = new RegExp(`\\b${escapeRegex(t)}\\b`, 'g');
      const matches = (cleaned.match(re) || []).length;
      const density = total ? (matches * targetTokens / total) * 100 : 0;
      let verdict, verdictClass;
      if (total < 100) {
        verdict = 'Add more content. We need at least 100 words to read density honestly.';
        verdictClass = 'low';
      } else if (density === 0) {
        verdict = 'Target keyword does not appear yet. Drop it into the H1, the first 100 words, and one subhead.';
        verdictClass = 'low';
      } else if (density > 3.5) {
        verdict = 'Too high. Modern Google penalises stuffed pages. Aim for 0.8 to 2.5%.';
        verdictClass = 'high';
      } else if (density < 0.6) {
        verdict = 'A bit thin. Aim for 0.8 to 2.5% on a target keyword.';
        verdictClass = 'low';
      } else {
        verdict = 'Healthy density. You are in the natural range Google rewards.';
        verdictClass = 'good';
      }
      targetReadout = { keyword: String(target).trim(), matches, density, verdict, verdictClass };
    }

    sendJson(res, 200, {
      totalWords: total,
      uniqueWords: wordCounter.size,
      sentences,
      avgWordsPerSentence: sentences ? Math.round((total / sentences) * 10) / 10 : 0,
      words: ranked(wordCounter, total, 12),
      bigrams: ranked(bigramCounter, total, 8),
      trigrams: ranked(trigramCounter, total, 6),
      targetReadout,
    });
  } catch (err) {
    sendError(res, err);
  }
}

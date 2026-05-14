const RE_SENTENCE = /[.!?]+\s+|\n/;
const RE_WORD = /[a-zA-Z]+/g;
const RE_VOWEL_GROUP = /[aeiouy]+/gi;
const RE_SILENT_E = /[^l]e$/i;
const RE_PASSIVE = /\b(?:am|is|are|was|were|be|been|being)\s+\w+(?:ed|en)\b/gi;

function countSyllables(word) {
  const w = word.toLowerCase().trim();
  if (w.length <= 2) return 1;
  const groups = w.match(RE_VOWEL_GROUP) || [];
  let count = groups.length;
  if (RE_SILENT_E.test(w)) count -= 1;
  if (w.endsWith('le') && w.length > 2 && !'aeiou'.includes(w[w.length - 3])) count += 1;
  return Math.max(1, count);
}

function classifyReadingLevel(fre) {
  if (fre >= 90) return 'Very Easy';
  if (fre >= 80) return 'Easy';
  if (fre >= 70) return 'Fairly Easy';
  if (fre >= 60) return 'Standard';
  if (fre >= 50) return 'Fairly Difficult';
  if (fre >= 30) return 'Difficult';
  return 'Very Difficult';
}

function freToScore(fre) {
  if (fre >= 55 && fre <= 75) return 100;
  if (fre > 75) return Math.max(60, 100 - (fre - 75) * 1.5);
  if (fre >= 30) return Math.max(30, 100 - (55 - fre) * 2.0);
  return Math.max(10, fre);
}

export function computeReadability(text) {
  const sentences = (text || '').split(RE_SENTENCE).map((s) => s.trim()).filter(Boolean);
  const words = (text || '').match(RE_WORD) || [];

  const sentenceCount = Math.max(1, sentences.length);
  const wordCount = Math.max(1, words.length);

  const syllables = words.map(countSyllables);
  const syllableCount = syllables.reduce((s, n) => s + n, 0);
  const difficultWords = syllables.filter((s) => s >= 3).length;

  const avgSl = wordCount / sentenceCount;
  const avgSyl = syllableCount / wordCount;

  let fre = 206.835 - 1.015 * avgSl - 84.6 * avgSyl;
  fre = Math.round(Math.max(0, Math.min(100, fre)) * 10) / 10;

  let fkgl = 0.39 * avgSl + 11.8 * avgSyl - 15.59;
  fkgl = Math.round(Math.max(0, fkgl) * 10) / 10;

  const sentWordCounts = sentences.map((s) => s.split(/\s+/).filter(Boolean).length);
  const longSents = sentWordCounts.filter((c) => c > 25).length;

  const passiveCount = ((text || '').match(RE_PASSIVE) || []).length;

  return {
    flesch_reading_ease: fre,
    flesch_kincaid_grade: fkgl,
    sentence_count: sentenceCount,
    word_count: wordCount,
    syllable_count: syllableCount,
    avg_sentence_length: Math.round(avgSl * 10) / 10,
    avg_syllables_per_word: Math.round(avgSyl * 100) / 100,
    long_sentence_count: longSents,
    long_sentence_pct: Math.round((longSents / sentenceCount) * 1000) / 10,
    passive_voice_count: passiveCount,
    passive_voice_pct: Math.round((passiveCount / sentenceCount) * 1000) / 10,
    difficult_word_count: difficultWords,
    difficult_word_pct: Math.round((difficultWords / wordCount) * 1000) / 10,
    reading_level: classifyReadingLevel(fre),
    readability_score: Math.round(freToScore(fre) * 10) / 10,
  };
}

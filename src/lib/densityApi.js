// API client for keyword-density extensions. Same-origin /api/* in prod
// (Vercel routes each endpoint to its own serverless function). Override
// with VITE_DENSITY_API_URL for local development against an external API.

const BASE = (import.meta.env.VITE_DENSITY_API_URL || '').replace(/\/+$/, '');

async function request(path, init) {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers) },
  });
  const text = await res.text();
  let body;
  try { body = text ? JSON.parse(text) : {}; } catch { body = { detail: text }; }
  if (!res.ok) {
    const err = new Error(body?.error?.message || body?.detail || `HTTP ${res.status}`);
    err.status = res.status;
    err.body = body;
    throw err;
  }
  return body;
}

// ── Step 1: Basic text analysis ──
export function analyzeText(text, opts = {}) {
  return request('/analyze', {
    method: 'POST',
    body: JSON.stringify({
      text,
      remove_numbers: opts.removeNumbers ?? false,
      filter_stopwords: opts.filterStopwords ?? true,
      min_frequency: opts.minFrequency ?? 2,
      top_n: opts.topN ?? 30,
    }),
  });
}

// ── Step 2: URL crawl + analysis ──
export function analyzeUrl(url, opts = {}) {
  return request('/analyze-url', {
    method: 'POST',
    body: JSON.stringify({
      url,
      remove_numbers: opts.removeNumbers ?? false,
      filter_stopwords: opts.filterStopwords ?? true,
      min_frequency: opts.minFrequency ?? 2,
      top_n: opts.topN ?? 30,
    }),
  });
}

// ── Step 3: Advanced linguistic analysis ──
export function analyzeAdvanced(text, opts = {}) {
  return request('/analyze-advanced', {
    method: 'POST',
    body: JSON.stringify({
      text,
      lemmatize: opts.lemmatize ?? false,
      stemming: opts.stemming ?? false,
      group_similar_keywords: opts.groupSimilar ?? false,
      strip_accents: opts.stripAccents ?? false,
      remove_numbers: opts.removeNumbers ?? false,
      filter_stopwords: opts.filterStopwords ?? true,
      include_seo_fillers: opts.includeSeoFillers ?? false,
      custom_stopwords: opts.customStopwords ?? [],
      min_frequency: opts.minFrequency ?? 2,
      top_n: opts.topN ?? 30,
      title: opts.title ?? '',
      meta_description: opts.metaDescription ?? '',
      h1_tags: opts.h1Tags ?? [],
      h2_tags: opts.h2Tags ?? [],
    }),
  });
}

// ── Step 4: Session-based real-time analysis ──
export function sessionCreate() {
  return request('/session/create', { method: 'POST', body: '{}' });
}

export function sessionAnalyze(sessionId, content, opts = {}) {
  return request('/session/analyze', {
    method: 'POST',
    body: JSON.stringify({
      session_id: sessionId,
      content,
      options: {
        remove_numbers: opts.removeNumbers ?? false,
        filter_stopwords: opts.filterStopwords ?? true,
        min_frequency: opts.minFrequency ?? 2,
        top_n: opts.topN ?? 30,
      },
    }),
  });
}

export function sessionReset(sessionId) {
  return request('/session/reset', {
    method: 'POST',
    body: JSON.stringify({ session_id: sessionId }),
  });
}

export function sessionDelete(sessionId) {
  return request(`/session/${sessionId}`, { method: 'DELETE' });
}

// ── Step 7: SEO scoring ──
export function seoScore(text, opts = {}) {
  return request('/score', {
    method: 'POST',
    body: JSON.stringify({
      text,
      preset: opts.preset ?? 'blog',
      filter_stopwords: opts.filterStopwords ?? true,
      min_frequency: opts.minFrequency ?? 2,
      top_n: opts.topN ?? 30,
    }),
  });
}

// ── Competitor analysis ──
// Calls the JS serverless function at /api/competitor-analyze.
export function competitorAnalyze(primaryUrl, competitorUrls, opts = {}) {
  return request('/api/competitor-analyze', {
    method: 'POST',
    body: JSON.stringify({
      primary_url: primaryUrl,
      competitor_urls: competitorUrls,
      min_frequency: opts.minFrequency ?? 2,
      top_n: opts.topN ?? 30,
    }),
  });
}

export function healthCheck() {
  return request('/health');
}

import { parsePage } from './_lib/html.js';
import { extractDomain, fetchWithTiming, httpError, sendError, sendJson, USER_AGENT } from './_lib/http.js';

async function trancoRank(domain) {
  try {
    const r = await fetch(`https://tranco-list.eu/api/ranks/domain/${domain}`, {
      headers: { 'User-Agent': USER_AGENT },
      signal: AbortSignal.timeout(8000),
    });
    if (!r.ok) return null;
    const data = await r.json();
    const ranks = data?.ranks || [];
    if (!ranks.length) return null;
    return { rank: ranks[0]?.rank ?? null, date: ranks[0]?.date ?? null };
  } catch {
    return null;
  }
}

async function waybackHistory(domain) {
  try {
    const params = new URLSearchParams({
      url: domain,
      output: 'json',
      fl: 'timestamp,statuscode',
      limit: '10000',
      filter: 'statuscode:200',
    });
    const r = await fetch(`https://web.archive.org/cdx/search/cdx?${params}`, {
      headers: { 'User-Agent': USER_AGENT },
      signal: AbortSignal.timeout(12000),
    });
    if (!r.ok) return null;
    const data = await r.json();
    if (!Array.isArray(data) || data.length < 2) return { firstSeen: null, snapshotCount: 0 };
    const rows = data.slice(1);
    const firstTs = String(rows[0][0] || '');
    const firstSeen = firstTs.length >= 8
      ? `${firstTs.slice(0, 4)}-${firstTs.slice(4, 6)}-${firstTs.slice(6, 8)}`
      : null;
    return { firstSeen, snapshotCount: rows.length };
  } catch {
    return null;
  }
}

function scoreTraffic(rank) {
  if (rank == null) return 0;
  if (rank <= 1_000) return 100;
  if (rank <= 10_000) return 90;
  if (rank <= 100_000) return 70;
  if (rank <= 500_000) return 50;
  if (rank <= 1_000_000) return 30;
  return 10;
}

function scoreAge(firstSeen) {
  if (!firstSeen) return 0;
  try {
    const [y, m, d] = firstSeen.split('-').map(Number);
    const first = new Date(Date.UTC(y, m - 1, d));
    const years = (Date.now() - first.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
    if (years >= 10) return 100;
    if (years >= 5) return 80;
    if (years >= 3) return 60;
    if (years >= 1) return 35;
    return 15;
  } catch {
    return 0;
  }
}

function scoreHistorySnapshots(n) {
  if (n >= 1000) return 100;
  if (n >= 500) return 80;
  if (n >= 100) return 60;
  if (n >= 25) return 40;
  if (n >= 5) return 20;
  return 5;
}

function scoreTechnical(headers, httpVersion, https) {
  const notes = [];
  let score = 0;
  if (https) {
    score += 25;
    notes.push('HTTPS ✓');
  } else {
    notes.push('No HTTPS ✗');
  }
  if (httpVersion === 'HTTP/2' || httpVersion === 'HTTP/3') {
    score += 15;
    notes.push(`${httpVersion} ✓`);
  } else {
    notes.push(`${httpVersion} ✗ (upgrade to HTTP/2)`);
  }
  if (headers['strict-transport-security']) {
    score += 15;
    notes.push('HSTS ✓');
  } else {
    notes.push('No HSTS');
  }
  if (headers['content-security-policy']) {
    score += 10;
    notes.push('CSP ✓');
  }
  if (headers['x-content-type-options']) score += 5;
  if (headers['cache-control']) score += 5;
  if (headers['server']) notes.push(`Server: ${headers['server']}`);
  return [Math.min(score, 100), notes];
}

function scoreContent(parsed) {
  let score = 0;
  const notes = {};
  if (parsed.title) {
    score += 5;
    notes.title = parsed.title.slice(0, 120);
  }
  if (parsed.metaDescription) {
    score += 5;
    notes.metaDescription = parsed.metaDescription.slice(0, 160);
  }
  if (parsed.canonical) score += 5;
  if (parsed.viewport) score += 5;
  if (parsed.jsonLdBlocks >= 3) score += 20;
  else if (parsed.jsonLdBlocks >= 1) score += 10;
  notes.jsonLdBlocks = parsed.jsonLdBlocks;
  notes.jsonLdTypes = [...new Set(parsed.jsonLdTypes)].slice(0, 8);
  if (parsed.ogTags >= 4) score += 10;
  else if (parsed.ogTags >= 1) score += 5;
  if (parsed.twitterTags >= 1) score += 5;
  if (parsed.h1Count === 1) score += 10;
  else if (parsed.h1Count > 1) score += 3;
  if (parsed.h2Count >= 2) score += 5;
  if (parsed.linksInternal >= 30) score += 15;
  else if (parsed.linksInternal >= 10) score += 8;
  notes.internalLinks = parsed.linksInternal;
  notes.externalLinks = parsed.linksExternal;
  return [Math.min(score, 100), notes];
}

export default async function handler(req, res) {
  try {
    if (req.method !== 'GET') throw httpError(405, 'Method not allowed');
    const { domain } = req.query || {};
    if (!domain || String(domain).length < 3) throw httpError(400, 'domain is required');
    const target = extractDomain(domain);
    const homeUrl = `https://${target}`;

    const [tranco, wayback, page] = await Promise.all([
      trancoRank(target),
      waybackHistory(target),
      fetchWithTiming(homeUrl).catch(() => null),
    ]);

    const parsed = page ? parsePage(page.body, homeUrl) : null;

    const rank = tranco?.rank ?? null;
    const firstSeen = wayback?.firstSeen ?? null;
    const snapCount = wayback?.snapshotCount ?? 0;

    const traffic = scoreTraffic(rank);
    const age = scoreAge(firstSeen);
    const history = scoreHistorySnapshots(snapCount);
    const [tech, techNotes] = page
      ? scoreTechnical(page.headers, page.httpVersion, homeUrl.startsWith('https://'))
      : [0, ['could not fetch homepage']];
    const [content, contentNotes] = parsed ? scoreContent(parsed) : [0, {}];

    const total = Math.round(
      (traffic * 0.30 + age * 0.20 + history * 0.10 + tech * 0.20 + content * 0.20) * 10,
    ) / 10;

    sendJson(res, 200, {
      domain: target,
      score: total,
      scoreLabel: 'RankedTag Authority Score (0-100)',
      components: {
        traffic:   { score: traffic, weight: 30, source: 'tranco-list.eu' },
        age:       { score: age,     weight: 20, source: 'web.archive.org' },
        history:   { score: history, weight: 10, source: 'web.archive.org' },
        technical: { score: tech,    weight: 20, source: 'homepage HTTP response' },
        content:   { score: content, weight: 20, source: 'homepage HTML' },
      },
      raw: {
        trancoRank: rank,
        trancoDate: tranco?.date ?? null,
        firstSeen,
        snapshotCount: snapCount,
        technicalNotes: techNotes,
        contentNotes,
      },
      _meta: {
        engine: 'rankedtag-authority-v1',
        note: 'Composite score from free public sources. No Ahrefs / Moz / paid APIs.',
        verifyUrls: {
          tranco: `https://tranco-list.eu/api/ranks/domain/${target}`,
          wayback: `https://web.archive.org/web/*/${target}`,
        },
      },
    });
  } catch (err) {
    sendError(res, err);
  }
}

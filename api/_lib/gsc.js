// Google Search Console (Search Analytics API) client.
//
// Auth is a service account, not OAuth: there is no user to send through a
// consent screen, so we sign a JWT with the service account's private key and
// trade it for an access token. No new dependency needed, `jose` is already
// here for the admin session cookie.
//
// SETUP (one-off, outside this repo):
//   1. Google Cloud Console: enable the "Google Search Console API".
//   2. IAM & Admin -> Service Accounts: create one, then create a JSON key.
//   3. Search Console -> Settings -> Users and permissions -> Add user:
//      paste the service account's `client_email`, permission "Full" (or
//      "Restricted", which is enough for every read this file does).
//
// The JSON key never goes in git. It lives in an env var, see .env.example.
import { importPKCS8, SignJWT } from 'jose';
import { httpError } from './http.js';

const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const API_BASE = 'https://searchconsole.googleapis.com/webmasters/v3';
// Two scopes, and every call asks for the narrower one unless it genuinely
// writes. The dashboard and the whole reporting path stay read-only; only
// `submitSitemap` reaches for the write scope. Keeping them apart means a bug
// in a reporting handler cannot change anything on the property.
const READ_SCOPE = 'https://www.googleapis.com/auth/webmasters.readonly';
const WRITE_SCOPE = 'https://www.googleapis.com/auth/webmasters';

// Search Console finalises a day's data a couple of days late. Ending every
// window here keeps totals stable instead of having "yesterday" creep upward
// each time you reload.
export const FINAL_LAG_DAYS = 2;

/**
 * Credentials come from one of two shapes, whichever you find easier to paste
 * into the Vercel dashboard:
 *
 *   GSC_SERVICE_ACCOUNT_JSON  the whole key file, raw JSON or base64-encoded
 *   GSC_CLIENT_EMAIL + GSC_PRIVATE_KEY   the two fields on their own
 *
 * Base64 is the safer paste: the raw JSON contains newlines inside
 * `private_key`, and several UIs mangle those.
 */
function readCredentials() {
  const blob = (process.env.GSC_SERVICE_ACCOUNT_JSON || '').trim();
  if (blob) {
    let text = blob;
    // Not JSON at a glance? Then it is the base64 form.
    if (!text.startsWith('{')) {
      try {
        text = Buffer.from(text, 'base64').toString('utf8');
      } catch {
        throw httpError(503, 'GSC_SERVICE_ACCOUNT_JSON is neither JSON nor base64.');
      }
    }
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      throw httpError(503, 'GSC_SERVICE_ACCOUNT_JSON could not be parsed as JSON.');
    }
    if (!parsed.client_email || !parsed.private_key) {
      throw httpError(503, 'Service account JSON is missing client_email or private_key.');
    }
    return { email: parsed.client_email, privateKey: parsed.private_key };
  }

  const email = (process.env.GSC_CLIENT_EMAIL || '').trim();
  const privateKey = process.env.GSC_PRIVATE_KEY || '';
  if (email && privateKey) return { email, privateKey };

  throw httpError(
    503,
    'Search Console is not configured. Set GSC_SERVICE_ACCOUNT_JSON (base64 of ' +
      'the service account key file) in Vercel -> Settings -> Environment Variables.'
  );
}

export function gscConfigured() {
  return Boolean(
    (process.env.GSC_SERVICE_ACCOUNT_JSON || '').trim() ||
      ((process.env.GSC_CLIENT_EMAIL || '').trim() && process.env.GSC_PRIVATE_KEY)
  );
}

/**
 * The property to query. A Domain property (DNS-verified) is addressed as
 * `sc-domain:rankedtag.com`; a URL-prefix property as `https://rankedtag.com/`
 * with the trailing slash. Getting this wrong is the single most common cause
 * of an empty report, so `?action=sites` lists exactly what the service
 * account can see.
 */
export function defaultSiteUrl() {
  return (process.env.GSC_SITE_URL || 'sc-domain:rankedtag.com').trim();
}

// Env vars arrive with the key's newlines escaped more often than not.
function normalizeKey(pem) {
  return pem.includes('\\n') ? pem.replace(/\\n/g, '\n') : pem;
}

// Warm lambdas reuse these, so a burst of dashboard calls mints one token, not
// one per request. Tokens last an hour; we refresh a minute early. Keyed by
// scope: a read token cannot be reused for a write, and caching them together
// would hand whichever call came first the wrong one.
const tokenCache = new Map();

async function getAccessToken(scope = READ_SCOPE) {
  const hit = tokenCache.get(scope);
  if (hit && hit.expiresAt > Date.now() + 60_000) return hit.value;
  const { email, privateKey } = readCredentials();

  let key;
  try {
    key = await importPKCS8(normalizeKey(privateKey), 'RS256');
  } catch (e) {
    throw httpError(503, `Service account private key is unreadable: ${e.message}`);
  }

  const now = Math.floor(Date.now() / 1000);
  const assertion = await new SignJWT({ scope })
    .setProtectedHeader({ alg: 'RS256', typ: 'JWT' })
    .setIssuer(email)
    .setAudience(TOKEN_URL)
    .setIssuedAt(now)
    .setExpirationTime(now + 3600)
    .sign(key);

  const resp = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }),
  });

  const body = await resp.json().catch(() => ({}));
  if (!resp.ok) {
    // `invalid_grant` here almost always means the server clock is off or the
    // key was revoked, not that the caller did anything wrong.
    throw httpError(
      502,
      `Google refused the service account token (${resp.status}): ` +
        `${body.error_description || body.error || 'unknown error'}`
    );
  }

  const token = {
    value: body.access_token,
    expiresAt: Date.now() + (body.expires_in || 3600) * 1000,
  };
  tokenCache.set(scope, token);
  return token.value;
}

async function gscFetch(path, { method = 'GET', body, scope = READ_SCOPE } = {}) {
  const token = await getAccessToken(scope);
  const resp = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  const text = await resp.text();
  let parsed = {};
  try {
    parsed = text ? JSON.parse(text) : {};
  } catch {
    throw httpError(502, `Search Console returned a non-JSON response (${resp.status}).`);
  }

  if (!resp.ok) {
    const msg = parsed.error?.message || `Search Console error ${resp.status}`;
    // 403 on a property that exists means the service account was never added
    // as a user in Search Console. Say so, rather than echoing Google's
    // "User does not have sufficient permission" and leaving you guessing.
    if (resp.status === 403) {
      throw httpError(
        403,
        `${msg} -- add the service account's client_email as a user in ` +
          `Search Console -> Settings -> Users and permissions.`
      );
    }
    throw httpError(resp.status === 404 ? 404 : 502, msg);
  }
  return parsed;
}

/** Properties this service account has been granted access to. */
export async function listSites() {
  const data = await gscFetch('/sites');
  return (data.siteEntry || []).map((s) => ({
    siteUrl: s.siteUrl,
    permissionLevel: s.permissionLevel,
  }));
}

function iso(d) {
  return d.toISOString().slice(0, 10);
}

/**
 * A window of `days` ending `FINAL_LAG_DAYS` ago, plus the equally long window
 * immediately before it, so every number can be shown against a like-for-like
 * comparison instead of floating on its own.
 */
export function dateWindow(days = 28, lagDays = FINAL_LAG_DAYS) {
  const end = new Date();
  end.setUTCDate(end.getUTCDate() - lagDays);
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - (days - 1));

  const prevEnd = new Date(start);
  prevEnd.setUTCDate(prevEnd.getUTCDate() - 1);
  const prevStart = new Date(prevEnd);
  prevStart.setUTCDate(prevStart.getUTCDate() - (days - 1));

  return {
    startDate: iso(start),
    endDate: iso(end),
    prevStartDate: iso(prevStart),
    prevEndDate: iso(prevEnd),
  };
}

/**
 * Raw Search Analytics query. `request` is passed through to Google untouched,
 * so anything the API supports (filters, multiple dimensions, searchAppearance)
 * is available to callers without this file growing a wrapper per field.
 */
export async function searchAnalytics(siteUrl, request) {
  const site = encodeURIComponent(siteUrl || defaultSiteUrl());
  return gscFetch(`/sites/${site}/searchAnalytics/query`, {
    method: 'POST',
    body: request,
  });
}

/** Sitemaps Google has on file for the property, with their error counts. */
export async function listSitemaps(siteUrl) {
  const site = encodeURIComponent(siteUrl || defaultSiteUrl());
  const data = await gscFetch(`/sites/${site}/sitemaps`);
  return (data.sitemap || []).map((s) => ({
    path: s.path,
    lastSubmitted: s.lastSubmitted || null,
    lastDownloaded: s.lastDownloaded || null,
    isPending: Boolean(s.isPending),
    errors: Number(s.errors || 0),
    warnings: Number(s.warnings || 0),
    submitted: Number(s.contents?.[0]?.submitted || 0),
    indexed: Number(s.contents?.[0]?.indexed || 0),
  }));
}

/**
 * Resubmit a sitemap, the API equivalent of the "Submit" button in Search
 * Console. `feedpath` is the sitemap's full URL, which must sit under the
 * property. Google answers 204 with no body on success.
 *
 * This is a nudge to refetch, not a request to index: Google re-reads the file
 * and notices the changed <lastmod> values, then schedules crawls on its own
 * terms. There is no API anywhere that forces a URL into the index -- the
 * Indexing API covers JobPosting and BroadcastEvent only, which is why
 * _lib/indexnow.js exists for the engines that do accept a direct ping.
 *
 * Needs the write scope, and the service account must hold "Full" permission
 * on the property: "Restricted" can read the sitemap list but not submit.
 */
export async function submitSitemap(feedpath, siteUrl) {
  const site = encodeURIComponent(siteUrl || defaultSiteUrl());
  await gscFetch(`/sites/${site}/sitemaps/${encodeURIComponent(feedpath)}`, {
    method: 'PUT',
    scope: WRITE_SCOPE,
  });
  return { feedpath, submitted: true };
}

const EMPTY_TOTALS = { clicks: 0, impressions: 0, ctr: 0, position: 0 };

function totalsFrom(rows) {
  if (!rows || !rows.length) return { ...EMPTY_TOTALS };
  const r = rows[0];
  return {
    clicks: Number(r.clicks || 0),
    impressions: Number(r.impressions || 0),
    ctr: Number(r.ctr || 0),
    position: Number(r.position || 0),
  };
}

function mapRows(rows) {
  return (rows || []).map((r) => ({
    key: r.keys?.[0] ?? '',
    keys: r.keys || [],
    clicks: Number(r.clicks || 0),
    impressions: Number(r.impressions || 0),
    ctr: Number(r.ctr || 0),
    position: Number(r.position || 0),
  }));
}

/**
 * Google returns rows sorted by clicks descending and offers no orderBy. On a
 * site with few clicks that is useless: nearly every query ties at zero, so
 * asking for 25 rows gets an arbitrary 25 of the ties (in practice, alphabetical
 * order), not the queries actually worth reading.
 *
 * So we over-fetch and rank here: clicks first, impressions as the tie-break.
 * That makes "top" mean something at every traffic level, and costs one larger
 * response rather than one extra request.
 */
const RANK_FETCH = 1000;

function topBy(rows, limit) {
  return mapRows(rows)
    .sort((a, b) => b.clicks - a.clicks || b.impressions - a.impressions)
    .slice(0, limit);
}

/**
 * Everything the dashboard needs, in one round trip. Seven Search Analytics
 * calls run concurrently; doing them from the browser instead would mean seven
 * sequential trips through this function's auth.
 */
export async function overview(siteUrl, { days = 28, limit = 25, dataState = 'final' } = {}) {
  const site = siteUrl || defaultSiteUrl();
  const w = dateWindow(days);
  const base = { startDate: w.startDate, endDate: w.endDate, dataState };

  const byDim = (dimension, rowLimit = limit) =>
    searchAnalytics(site, { ...base, dimensions: [dimension], rowLimit });

  const [totals, prevTotals, byDate, queries, pages, countries, devices] =
    await Promise.all([
      searchAnalytics(site, base),
      searchAnalytics(site, {
        startDate: w.prevStartDate,
        endDate: w.prevEndDate,
        dataState,
      }),
      byDim('date', 500),
      byDim('query', RANK_FETCH),
      byDim('page', RANK_FETCH),
      byDim('country', 50),
      byDim('device', 3),
    ]);

  return {
    siteUrl: site,
    range: { ...w, days, dataState },
    totals: totalsFrom(totals.rows),
    previous: totalsFrom(prevTotals.rows),
    byDate: mapRows(byDate.rows).sort((a, b) => a.key.localeCompare(b.key)),
    queries: topBy(queries.rows, limit),
    pages: topBy(pages.rows, limit),
    countries: topBy(countries.rows, 10),
    devices: topBy(devices.rows, 3),
    // Google withholds rare queries to protect searcher privacy, so the query
    // rows never sum to the headline totals. Surfacing the gap stops that
    // looking like a bug in this dashboard.
    queryClicksShown: mapRows(queries.rows).reduce((n, r) => n + r.clicks, 0),
  };
}

export { mapRows, totalsFrom };

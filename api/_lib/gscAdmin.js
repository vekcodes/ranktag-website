// Google Search Console reporting. Auth required.
//
//   GET  /api/admin/posts?resource=gsc&action=status              is it wired up at all
//   GET  /api/admin/posts?resource=gsc&action=sites               properties the service account can see
//   GET  /api/admin/posts?resource=gsc&action=sitemaps            submitted sitemaps + indexed counts
//   GET  /api/admin/posts?resource=gsc&action=overview&days=28    everything the dashboard draws
//   GET  /api/admin/posts?resource=gsc&action=dim&dimension=query one dimension, ranked
//   POST /api/admin/posts?resource=gsc&action=query               raw Search Analytics passthrough
//
// This lives in _lib rather than as api/admin/gsc.js, and is dispatched to by
// the posts function, because Vercel's Hobby plan caps a deployment at 12
// serverless functions and the project is already at exactly 12. Same reason
// authors live in authorsAdmin.js. See that file's note.
//
// Two ways in, because this data is wanted in three places:
//   - the browser at /admin, via the existing admin session cookie;
//   - n8n or any script, via `Authorization: Bearer $GSC_API_TOKEN`.
// Token auth stays off until GSC_API_TOKEN is set, so nothing is exposed by
// merely deploying this file.
import { requireAdmin } from './auth.js';
import { sendJson, sendError, httpError, readBody } from './http.js';
import {
  gscConfigured, defaultSiteUrl, listSites, listSitemaps,
  overview, searchAnalytics, dateWindow, mapRows, FINAL_LAG_DAYS,
} from './gsc.js';

const VALID_DIMENSIONS = new Set([
  'query', 'page', 'country', 'device', 'date', 'searchAppearance',
]);

function tokenMatches(presented) {
  const expected = process.env.GSC_API_TOKEN || '';
  if (!expected) return false;
  const a = Buffer.from(String(presented || ''));
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

/** Admin cookie, or a bearer token for machine callers. Either is enough. */
async function authorize(req) {
  const header = req.headers?.authorization || '';
  if (header.startsWith('Bearer ')) {
    if (tokenMatches(header.slice(7).trim())) return;
    throw httpError(401, 'Invalid API token.');
  }
  await requireAdmin(req);
}

function intParam(value, fallback, lo, hi) {
  const n = Number.parseInt(value, 10);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(lo, Math.min(hi, n));
}

export async function handleGsc(req, res) {
  try {
    const q = new URL(req.url, 'http://x').searchParams;
    const action = String(q.get('action') || 'overview');

    await authorize(req);

    // `status` deliberately answers even when credentials are missing, so a
    // misconfigured deployment can still be diagnosed from the dashboard
    // rather than failing with the same 503 as every other action.

    if (action === 'status') {
      return sendJson(res, 200, {
        configured: gscConfigured(),
        siteUrl: defaultSiteUrl(),
        tokenAuthEnabled: Boolean(process.env.GSC_API_TOKEN),
        finalLagDays: FINAL_LAG_DAYS,
      });
    }

    if (!gscConfigured()) {
      throw httpError(
        503,
        'Search Console is not configured. Set GSC_SERVICE_ACCOUNT_JSON in ' +
          'Vercel -> Settings -> Environment Variables, then redeploy.'
      );
    }

    const site = (q.get('site') || '').trim() || defaultSiteUrl();
    const days = intParam(q.get('days'), 28, 1, 480);
    const limit = intParam(q.get('limit'), 25, 1, 5000);
    const dataState = q.get('dataState') === 'all' ? 'all' : 'final';

    if (action === 'sites') {
      return sendJson(res, 200, { sites: await listSites() });
    }

    if (action === 'sitemaps') {
      return sendJson(res, 200, { siteUrl: site, sitemaps: await listSitemaps(site) });
    }

    if (action === 'overview') {
      return sendJson(res, 200, await overview(site, { days, limit, dataState }));
    }

    if (action === 'dim') {
      const dimension = String(q.get('dimension') || 'query');
      if (!VALID_DIMENSIONS.has(dimension)) {
        throw httpError(
          400,
          `Unknown dimension "${dimension}". Use one of: ${[...VALID_DIMENSIONS].join(', ')}.`
        );
      }
      const w = dateWindow(days);
      const data = await searchAnalytics(site, {
        startDate: w.startDate,
        endDate: w.endDate,
        dimensions: [dimension],
        rowLimit: limit,
        dataState,
      });
      return sendJson(res, 200, {
        siteUrl: site,
        dimension,
        range: { ...w, days, dataState },
        rows: mapRows(data.rows),
      });
    }

    // Raw passthrough. The body IS the Search Analytics request, so filters,
    // multi-dimension breakdowns and pagination are all available without this
    // route needing to know about them. Dates default to the standard window
    // when omitted, since forgetting them is an error Google reports obscurely.
    if (action === 'query') {
      if (req.method !== 'POST') throw httpError(405, 'Use POST for action=query.');
      const body = readBody(req);
      const w = dateWindow(days);
      const request = {
        startDate: w.startDate,
        endDate: w.endDate,
        ...body,
      };
      return sendJson(res, 200, await searchAnalytics(site, request));
    }

    throw httpError(400, `Unknown action "${action}".`);
  } catch (err) {
    sendError(res, err);
  }
}

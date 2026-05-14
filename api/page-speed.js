import { parsePage } from './_lib/html.js';
import { clamp, fetchWithTiming, httpError, normalizeUrl, sendError, sendJson } from './_lib/http.js';

function scoreSpeed(ms) {
  if (ms < 800) return [100, 'fast'];
  if (ms < 1800) return [80, 'ok'];
  if (ms < 3000) return [60, 'slow'];
  if (ms < 6000) return [30, 'very slow'];
  return [10, 'critical'];
}

function scoreSize(bytes) {
  const kb = bytes / 1024;
  if (kb < 100) return [100, 'lean'];
  if (kb < 250) return [85, 'ok'];
  if (kb < 500) return [65, 'heavy'];
  if (kb < 1000) return [35, 'very heavy'];
  return [10, 'critical'];
}

export default async function handler(req, res) {
  try {
    if (req.method !== 'GET') throw httpError(405, 'Method not allowed');
    const { url, strategy = 'mobile' } = req.query || {};
    if (!url || String(url).length < 3) throw httpError(400, 'url is required');
    if (!/^(mobile|desktop)$/.test(strategy)) {
      throw httpError(400, 'strategy must be mobile or desktop');
    }
    const target = normalizeUrl(url);

    const page = await fetchWithTiming(target);
    const parsed = parsePage(page.body, page.url);
    const h = page.headers;

    const [speedScore, speedLabel] = scoreSpeed(page.ms);
    const [sizeScore, sizeLabel] = scoreSize(page.bytes);

    const blocking = parsed.scriptsBlocking + Math.max(0, parsed.stylesheetsInHead - 1);
    let blockingScore;
    if (blocking === 0) blockingScore = 100;
    else if (blocking <= 2) blockingScore = 80;
    else if (blocking <= 5) blockingScore = 50;
    else blockingScore = 20;

    let imageScore;
    if (parsed.images === 0) {
      imageScore = 100;
    } else {
      const lazyPct = parsed.imagesLazy / parsed.images;
      const dimPct = parsed.imagesWithDimensions / parsed.images;
      const altPct = parsed.imagesWithAlt / parsed.images;
      imageScore = Math.round(clamp((lazyPct * 0.4 + dimPct * 0.3 + altPct * 0.3) * 100) * 10) / 10;
    }

    let transportScore = 0;
    transportScore += page.url.startsWith('https://') ? 35 : 0;
    transportScore += page.httpVersion === 'HTTP/2' || page.httpVersion === 'HTTP/3' ? 25 : 0;
    transportScore += ['gzip', 'br', 'zstd'].includes(page.encoding) ? 20 : 0;
    transportScore += h['strict-transport-security'] ? 10 : 0;
    transportScore += h['cache-control'] ? 10 : 0;

    const composite =
      Math.round(
        (speedScore * 0.30 +
          sizeScore * 0.20 +
          blockingScore * 0.20 +
          imageScore * 0.15 +
          transportScore * 0.15) * 10,
      ) / 10;

    const opportunities = [];
    if (parsed.scriptsBlocking > 0) {
      opportunities.push({
        title: `${parsed.scriptsBlocking} render-blocking script(s) in <head>`,
        description: "Add async or defer to non-critical scripts, or move them to before </body>. Each one delays first paint.",
        severity: parsed.scriptsBlocking > 3 ? 'high' : 'med',
      });
    }
    if (parsed.stylesheetsInHead > 2) {
      opportunities.push({
        title: `${parsed.stylesheetsInHead} stylesheets in <head>`,
        description: "Inline critical CSS and load the rest with media='print' onload swap, or combine stylesheets.",
        severity: 'med',
      });
    }
    if (parsed.images > 0 && parsed.imagesLazy / parsed.images < 0.5) {
      opportunities.push({
        title: "Images not using loading='lazy'",
        description: `Only ${parsed.imagesLazy} of ${parsed.images} images are lazy-loaded. Add loading='lazy' to below-the-fold images.`,
        severity: 'med',
      });
    }
    if (parsed.images > 0 && parsed.imagesWithDimensions / parsed.images < 0.7) {
      opportunities.push({
        title: 'Images missing width/height',
        description: 'Set explicit width and height attributes to prevent layout shift (CLS).',
        severity: 'med',
      });
    }
    if (page.bytes > 500_000) {
      opportunities.push({
        title: `HTML weighs ${Math.round(page.bytes / 1024)} KB`,
        description: 'Reduce DOM size, inline only critical JS, lazy-load heavy components.',
        severity: page.bytes > 1_000_000 ? 'high' : 'med',
      });
    }
    if (!h['strict-transport-security']) {
      opportunities.push({
        title: 'Missing Strict-Transport-Security header',
        description: 'Add HSTS header to enforce HTTPS at the browser level. Trust signal.',
        severity: 'low',
      });
    }
    if (!h['cache-control']) {
      opportunities.push({
        title: 'No Cache-Control on the HTML',
        description: 'Add a sane Cache-Control header. Even a short s-maxage helps repeat visits.',
        severity: 'low',
      });
    }
    if (page.httpVersion !== 'HTTP/2' && page.httpVersion !== 'HTTP/3') {
      opportunities.push({
        title: `Serving over ${page.httpVersion}`,
        description: 'Upgrade to HTTP/2 or HTTP/3 (Cloudflare, Vercel, and most modern hosts do this for free).',
        severity: 'med',
      });
    }
    if (!page.encoding) {
      opportunities.push({
        title: 'No HTTP compression',
        description: 'Enable gzip or brotli at the host. Easy win, sometimes a 70%+ reduction.',
        severity: 'high',
      });
    }

    sendJson(res, 200, {
      url: page.url,
      strategy,
      scores: {
        performance: composite,
        speed: speedScore,
        size: sizeScore,
        renderBlocking: blockingScore,
        imageHygiene: imageScore,
        transport: transportScore,
      },
      metrics: {
        fetchMs: Math.round(page.ms),
        htmlBytes: page.bytes,
        htmlKb: Math.round((page.bytes / 1024) * 10) / 10,
        speedLabel,
        sizeLabel,
        httpVersion: page.httpVersion,
        compression: page.encoding || 'none',
        scripts: {
          total: parsed.scripts,
          renderBlocking: parsed.scriptsBlocking,
          asyncDefer: parsed.scriptsAsyncDefer,
          inline: parsed.scriptsInline,
        },
        stylesheets: {
          total: parsed.stylesheets,
          inHead: parsed.stylesheetsInHead,
          inlineStyleBlocks: parsed.inlineStyles,
        },
        images: {
          total: parsed.images,
          lazy: parsed.imagesLazy,
          withDimensions: parsed.imagesWithDimensions,
          withAlt: parsed.imagesWithAlt,
        },
        headers: {
          hsts: !!h['strict-transport-security'],
          cacheControl: h['cache-control'] || null,
          csp: !!h['content-security-policy'],
          xContentTypeOptions: h['x-content-type-options'] || null,
          xFrameOptions: h['x-frame-options'] || null,
        },
      },
      opportunities,
      _meta: {
        engine: 'rankedtag-self-hosted',
        version: '1.0',
        note: 'Computed in our serverless function from a server-side fetch. No Google PSI key required. Cross-check by viewing source on the URL.',
      },
    });
  } catch (err) {
    sendError(res, err);
  }
}

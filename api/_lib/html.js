import * as cheerio from 'cheerio';

export function parsePage(html, baseUrl) {
  const $ = cheerio.load(html);
  const baseHost = (() => {
    try {
      return new URL(baseUrl).hostname;
    } catch {
      return '';
    }
  })();

  const title = ($('title').first().text() || '').trim() || null;
  const language = ($('html').attr('lang') || $('html').attr('xml:lang') || '').trim() || null;

  const metaDescription =
    $('meta[name="description"]').attr('content')?.trim() || null;
  const viewport = $('meta[name="viewport"]').attr('content') || null;
  const robots = $('meta[name="robots"]').attr('content') || null;
  const canonical = $('link[rel="canonical"]').attr('href') || null;

  let ogTags = 0;
  let twitterTags = 0;
  $('meta').each((_, el) => {
    const prop = ($(el).attr('property') || '').toLowerCase();
    const name = ($(el).attr('name') || '').toLowerCase();
    if (prop.startsWith('og:')) ogTags++;
    if (name.startsWith('twitter:')) twitterTags++;
  });

  let stylesheets = 0;
  let stylesheetsInHead = 0;
  let preconnects = 0;
  let preloads = 0;
  let fonts = 0;
  $('link').each((_, el) => {
    const rel = ($(el).attr('rel') || '').toLowerCase();
    const href = $(el).attr('href') || '';
    if (rel.includes('stylesheet')) {
      stylesheets++;
      if ($(el).parents('head').length) stylesheetsInHead++;
    }
    if (rel.includes('preconnect')) preconnects++;
    if (rel.includes('preload')) preloads++;
    if (href.toLowerCase().includes('.woff')) fonts++;
  });

  let scripts = 0;
  let scriptsBlocking = 0;
  let scriptsAsyncDefer = 0;
  let scriptsInline = 0;
  let jsonLdBlocks = 0;
  const jsonLdTypes = [];
  $('script').each((_, el) => {
    const src = $(el).attr('src');
    const type = ($(el).attr('type') || '').toLowerCase();
    const inHead = $(el).parents('head').length > 0;
    const isAsync = $(el).attr('async') !== undefined || $(el).attr('defer') !== undefined;
    if (src) {
      scripts++;
      if (isAsync) scriptsAsyncDefer++;
      else if (inHead) scriptsBlocking++;
      if (type === 'application/ld+json') jsonLdBlocks++;
    } else {
      scriptsInline++;
      if (type === 'application/ld+json') {
        jsonLdBlocks++;
        const blob = $(el).text();
        const matches = blob.match(/"@type"\s*:\s*"([^"]+)"/g) || [];
        for (const m of matches) {
          const parts = /"@type"\s*:\s*"([^"]+)"/.exec(m);
          if (parts) jsonLdTypes.push(parts[1]);
        }
      }
    }
  });

  const inlineStyles = $('style').length;

  let images = 0;
  let imagesLazy = 0;
  let imagesWithDimensions = 0;
  let imagesWithAlt = 0;
  $('img').each((_, el) => {
    images++;
    if (($(el).attr('loading') || '').toLowerCase() === 'lazy') imagesLazy++;
    if ($(el).attr('width') || $(el).attr('height')) imagesWithDimensions++;
    if (($(el).attr('alt') || '').trim()) imagesWithAlt++;
  });

  const iframes = $('iframe').length;

  let linksInternal = 0;
  let linksExternal = 0;
  let linksNofollow = 0;
  $('a').each((_, el) => {
    const href = $(el).attr('href') || '';
    if (!href || /^(javascript:|mailto:|tel:|#)/i.test(href)) return;
    let host = '';
    try {
      host = new URL(href, baseUrl).hostname;
    } catch {
      return;
    }
    const rel = ($(el).attr('rel') || '').toLowerCase();
    if (host === baseHost || host.endsWith('.' + baseHost)) {
      linksInternal++;
    } else if (host) {
      linksExternal++;
      if (rel.includes('nofollow')) linksNofollow++;
    }
  });

  const h1Tags = [];
  $('h1').each((_, el) => {
    const t = $(el).text().replace(/\s+/g, ' ').trim();
    if (t && h1Tags.length < 10) h1Tags.push(t);
  });
  const h2Tags = [];
  $('h2').each((_, el) => {
    const t = $(el).text().replace(/\s+/g, ' ').trim();
    if (t && h2Tags.length < 20) h2Tags.push(t);
  });
  const h1Count = $('h1').length;
  const h2Count = $('h2').length;
  const h3Count = $('h3').length;

  // Visible text content (strip scripts, styles, noscript)
  $('script, style, noscript, template').remove();
  const text = $('body').text().replace(/\s+/g, ' ').trim();

  return {
    title,
    metaDescription,
    canonical,
    viewport,
    robots,
    language,
    ogTags,
    twitterTags,
    scripts,
    scriptsBlocking,
    scriptsAsyncDefer,
    scriptsInline,
    stylesheets,
    stylesheetsInHead,
    inlineStyles,
    preconnects,
    preloads,
    fonts,
    images,
    imagesLazy,
    imagesWithDimensions,
    imagesWithAlt,
    iframes,
    linksInternal,
    linksExternal,
    linksNofollow,
    jsonLdBlocks,
    jsonLdTypes,
    h1Tags,
    h2Tags,
    h1Count,
    h2Count,
    h3Count,
    text,
  };
}

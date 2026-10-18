import * as cheerio from 'cheerio';

// Elements that start a new line of text when a page is read. Inline elements
// are deliberately absent: a <strong> inside a sentence must not split it.
const BLOCK_SEL = [
  'address', 'article', 'aside', 'blockquote', 'dd', 'details', 'dialog', 'div',
  'dl', 'dt', 'fieldset', 'figcaption', 'figure', 'footer', 'form', 'h1', 'h2',
  'h3', 'h4', 'h5', 'h6', 'header', 'hr', 'li', 'main', 'nav', 'ol', 'p', 'pre',
  'section', 'summary', 'table', 'tbody', 'td', 'tfoot', 'th', 'thead', 'tr', 'ul',
].join(',');

const countWords = (t) => (t ? t.split(/\s+/).filter(Boolean).length : 0);

/**
 * Readable text for one subtree, one block per line, blocks separated by a
 * blank line so `split(/\n\s*\n/)` downstream sees real blocks. Runs on a
 * clone so the caller's document is left intact for a second pass.
 */
function blockText($, root) {
  const $root = $(root).clone();
  $root.find('br').replaceWith('\n');
  $root.find(BLOCK_SEL).each((_, el) => {
    $(el).before('\n');
    $(el).after('\n');
  });
  return $root
    .text()
    .split('\n')
    .map((line) => line.replace(/[^\S\n]+/g, ' ').trim())
    .filter(Boolean)
    .join('\n\n');
}

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

  // Visible text content.
  //
  // cheerio's .text() concatenates descendants with no separator, so a
  // paragraph ran straight into the next heading ("...transparently.How is
  // domain authority calculated?Every authority score..."). Collapsing all
  // whitespace afterwards then destroyed what line breaks the source had.
  // Three things downstream depend on block boundaries and all three were
  // getting one giant line: sentence splitting in readability, paragraph
  // counting in Content Structure, and block distribution in Keyword
  // Distribution. Every analysed page therefore reported one paragraph, zero
  // headings and an average sentence length several times its real value.
  //
  // So: emit a newline either side of every block-level element, then rebuild
  // the text one block per line.
  $('script, style, noscript, template').remove();
  const fullText = blockText($, $('body'));

  // Chrome is dropped so densities describe the content rather than the menu,
  // which is what the tool pages promise. Guarded: a site that wraps its real
  // content in <header> or <nav> keeps its full body instead of being
  // analysed down to a stub.
  $('nav, header, footer').remove();
  const mainText = blockText($, $('body'));
  const fullWords = countWords(fullText);
  const mainWords = countWords(mainText);
  const text = mainWords >= 100 && mainWords >= fullWords * 0.4 ? mainText : fullText;

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

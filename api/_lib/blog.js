// Shared blog helpers: slugs, markdown, HTML sanitisation, SEO metadata.
import { marked } from 'marked';
import sanitizeHtml from 'sanitize-html';

export const SITE_URL = (process.env.SITE_URL || 'https://rankedtag.com').replace(/\/$/, '');
export const SITE_NAME = 'RankedTag';

marked.setOptions({ gfm: true, breaks: false });

export function slugify(input) {
  return String(input || '')
    .toLowerCase()
    .trim()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

export function escapeHtml(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const SANITIZE_OPTS = {
  allowedTags: [
    'h1', 'h2', 'h3', 'h4', 'p', 'a', 'strong', 'em', 'b', 'i', 'u', 's',
    'ul', 'ol', 'li', 'blockquote', 'code', 'pre', 'img', 'figure',
    'figcaption', 'hr', 'br', 'span', 'div', 'table', 'thead', 'tbody',
    'tr', 'td', 'th', 'iframe',
  ],
  allowedAttributes: {
    a: ['href', 'title', 'target', 'rel'],
    img: ['src', 'alt', 'title', 'width', 'height', 'loading', 'decoding'],
    iframe: ['src', 'title', 'width', 'height', 'allow', 'allowfullscreen', 'loading'],
    span: ['class'],
    div: ['class'],
    code: ['class'],
    pre: ['class'],
    th: ['colspan', 'rowspan', 'scope'],
    td: ['colspan', 'rowspan'],
  },
  allowedSchemes: ['http', 'https', 'mailto'],
  allowedIframeHostnames: ['www.youtube.com', 'youtube.com', 'player.vimeo.com'],
  transformTags: {
    // External links open safely; images lazy-load (Core Web Vitals).
    a: (tag, attribs) => {
      const href = attribs.href || '';
      const external = /^https?:\/\//i.test(href) && !href.includes('rankedtag.com');
      return {
        tagName: 'a',
        attribs: {
          ...attribs,
          ...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {}),
        },
      };
    },
    img: (tag, attribs) => ({
      tagName: 'img',
      attribs: { loading: 'lazy', decoding: 'async', ...attribs },
    }),
  },
};

/** Sanitise untrusted HTML (from import or the editor) before storing/serving. */
export function cleanHtml(html) {
  return sanitizeHtml(String(html || ''), SANITIZE_OPTS);
}

/** Markdown -> sanitised HTML. */
export function mdToHtml(md) {
  return cleanHtml(marked.parse(String(md || '')));
}

export function stripTags(html) {
  return String(html || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

export function readingMinutes(html) {
  const words = stripTags(html).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

/** Derive a clean meta description if the author left it blank. */
export function autoExcerpt(html, max = 158) {
  const text = stripTags(html);
  if (text.length <= max) return text;
  return text.slice(0, max).replace(/\s+\S*$/, '') + '…';
}

export function postUrl(slug) {
  return `${SITE_URL}/blog/${slug}`;
}

/**
 * Validate & normalise author-supplied JSON-LD.
 * Accepts a JSON string for a single object or an array of objects.
 * Returns the trimmed source string; throws a 400 if it isn't valid JSON.
 */
export function validateCustomJsonLd(raw) {
  const str = String(raw == null ? '' : raw).trim();
  if (!str) return '';
  let parsed;
  try {
    parsed = JSON.parse(str);
  } catch {
    const e = new Error('Custom JSON-LD is not valid JSON.');
    e.status = 400;
    throw e;
  }
  const nodes = Array.isArray(parsed) ? parsed : [parsed];
  if (!nodes.every((n) => n && typeof n === 'object' && !Array.isArray(n))) {
    const e = new Error('Custom JSON-LD must be an object or an array of objects.');
    e.status = 400;
    throw e;
  }
  return str;
}

/**
 * Normalise author-supplied FAQs into a clean array of { q, a } objects.
 * Accepts [{ q, a }] or [{ question, answer }] or [[q, a]]. Drops rows missing
 * a question or answer, trims whitespace, and caps the list at 30 entries.
 */
export function normalizeFaqs(input) {
  let val = input;
  // JSONB normally arrives pre-parsed; tolerate a raw JSON string just in case.
  if (typeof val === 'string') {
    try { val = JSON.parse(val); } catch { val = []; }
  }
  const arr = Array.isArray(val) ? val : [];
  return arr
    .map((item) => {
      if (Array.isArray(item)) {
        return { q: String(item[0] || '').trim(), a: String(item[1] || '').trim() };
      }
      if (item && typeof item === 'object') {
        return {
          q: String(item.q ?? item.question ?? '').trim(),
          a: String(item.a ?? item.answer ?? '').trim(),
        };
      }
      return { q: '', a: '' };
    })
    .filter((f) => f.q && f.a)
    .slice(0, 30);
}

/**
 * FAQPage JSON-LD from a post's faqs array (or null when there are none).
 * Answers are plain text — Google allows limited HTML, but we keep it simple.
 */
export function faqJsonLd(faqs, url) {
  const list = normalizeFaqs(faqs);
  if (!list.length) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    ...(url ? { '@id': `${url}#faq` } : {}),
    mainEntity: list.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
}

/** Parse stored custom JSON-LD into an array of nodes (defensive, never throws). */
export function parseCustomJsonLd(raw) {
  const str = String(raw == null ? '' : raw).trim();
  if (!str) return [];
  try {
    const parsed = JSON.parse(str);
    const nodes = Array.isArray(parsed) ? parsed : [parsed];
    return nodes.filter((n) => n && typeof n === 'object' && !Array.isArray(n));
  } catch {
    return [];
  }
}

/**
 * Turn raw admin input into a normalised, SEO-complete post record.
 * Accepts markdown, raw HTML, or already-rich editor HTML.
 */
export function normalizePostInput(body = {}) {
  const fmt = (body.source_format || 'html').toLowerCase();
  const md = body.content_md || '';
  const rawHtml = body.content_html || '';
  const content_html =
    fmt === 'markdown' ? mdToHtml(md) : cleanHtml(rawHtml);

  const title = String(body.title || '').trim();
  if (!title) {
    const e = new Error('Title is required');
    e.status = 400;
    throw e;
  }
  const slug = slugify(body.slug || title);
  const excerpt =
    String(body.excerpt || '').trim() || autoExcerpt(content_html);

  return {
    slug,
    title,
    excerpt,
    content_html,
    content_md: fmt === 'markdown' ? md : '',
    source_format: fmt,
    cover_image_url: String(body.cover_image_url || '').trim(),
    cover_image_alt: String(body.cover_image_alt || '').trim(),
    meta_title: String(body.meta_title || '').trim() || title,
    meta_description: String(body.meta_description || '').trim() || excerpt,
    og_image_url: String(body.og_image_url || '').trim(),
    canonical_url: String(body.canonical_url || '').trim(),
    tags: Array.isArray(body.tags)
      ? body.tags.map((t) => String(t).trim()).filter(Boolean).slice(0, 12)
      : [],
    author: String(body.author || SITE_NAME).trim(),
    status: body.status === 'published' ? 'published' : 'draft',
    reading_minutes: readingMinutes(content_html),
    custom_jsonld: validateCustomJsonLd(body.custom_jsonld),
    faqs: normalizeFaqs(body.faqs),
  };
}

/** JSON-LD BlogPosting + BreadcrumbList for rich results. */
export function articleJsonLd(post) {
  const url = postUrl(post.slug);
  const blogPosting = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.meta_title || post.title,
    description: post.meta_description || post.excerpt,
    image: post.og_image_url || post.cover_image_url || `${SITE_URL}/rankedtag-logo.png`,
    datePublished: post.published_at,
    dateModified: post.updated_at || post.published_at,
    author: { '@type': 'Organization', name: post.author || SITE_NAME, url: SITE_URL },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/rankedtag-logo.png` },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
  };
  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE_URL}/blog` },
      { '@type': 'ListItem', position: 3, name: post.title, item: url },
    ],
  };
  // Auto schema first (BlogPosting, Breadcrumb, FAQPage from the post's FAQs),
  // then any author-supplied JSON-LD from the CMS.
  const faq = faqJsonLd(post.faqs, url);
  return [
    blogPosting,
    breadcrumb,
    ...(faq ? [faq] : []),
    ...parseCustomJsonLd(post.custom_jsonld),
  ];
}

// IndexNow — instant URL submission for Bing, Yandex, Seznam, Naver.
//
// Deliberately NOT the Google Indexing API: Google supports that only for
// JobPosting and BroadcastEvent, and using it for articles is both ineffective
// and against their published guidance. Google discovers these URLs through
// the sitemap and internal links instead.
//
// The key is a static file at the site root; IndexNow fetches it to prove we
// control the domain. Key file and constant must match — if you rotate one,
// rotate both.
const KEY = 'dceb2c44a9d51e040ddbee405ecff3fe';
const HOST = 'rankedtag.com';

/**
 * Submit URLs. Fire-and-forget: a failed ping must never fail a CMS save, so
 * everything is swallowed. Never called on deploy — only from an actual
 * content write in the admin API, and only when the content really changed.
 */
export async function pingIndexNow(urls) {
  const list = [...new Set((urls || []).filter(Boolean))];
  if (!list.length) return { ok: false, skipped: 'no urls' };
  try {
    const res = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        host: HOST,
        key: KEY,
        keyLocation: `https://${HOST}/${KEY}.txt`,
        urlList: list,
      }),
    });
    return { ok: res.ok, status: res.status, count: list.length };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

/**
 * Did this edit change anything a search engine would care about? Fixing a typo
 * in an internal note, or re-saving with no edits, should not ping. Title,
 * body, excerpt and the meta pair are the fields that alter the indexed result.
 */
export function contentChanged(before, after) {
  if (!before) return true;
  const fields = ['title', 'content_html', 'excerpt', 'meta_title', 'meta_description', 'slug'];
  return fields.some((f) => (before[f] || '') !== (after[f] || ''));
}

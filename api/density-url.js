import { parsePage } from './_lib/html.js';
import { fetchWithTiming, guardUrl, httpError, readBody, sendError, sendJson } from './_lib/http.js';

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') throw httpError(405, 'Method not allowed');
    const { url } = readBody(req);
    const target = guardUrl(url);

    const page = await fetchWithTiming(target);
    const parsed = parsePage(page.body, page.url);

    if (!parsed.text || parsed.text.split(/\s+/).filter(Boolean).length < 5) {
      throw httpError(422, 'Could not extract meaningful content from the page.');
    }

    sendJson(res, 200, {
      url,
      final_url: page.url,
      status_code: page.status,
      title: parsed.title,
      meta_description: parsed.metaDescription,
      canonical: parsed.canonical,
      language: parsed.language,
      h1_tags: parsed.h1Tags,
      h2_tags: parsed.h2Tags,
      content: parsed.text,
      content_word_count: parsed.text.split(/\s+/).filter(Boolean).length,
    });
  } catch (err) {
    sendError(res, err);
  }
}

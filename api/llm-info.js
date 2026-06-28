// GET /llm-info (and /llm-info.md) — serves the canonical RankedTag facts as
// raw Markdown (text/markdown) so LLMs, answer engines and crawlers get the
// plain source with no HTML to strip. Wired via vercel.json rewrites; the route
// is intentionally NOT pre-rendered to HTML (removed from vite includedRoutes)
// so this function isn't shadowed by a static file.
import { LLM_INFO_MD } from './_lib/llmInfo.js';

export default function handler(req, res) {
  res.status(200);
  res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
  // Cache at the edge; the content changes rarely.
  res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800');
  res.send(LLM_INFO_MD);
}

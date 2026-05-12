"""
RankedTag tools API. Single Vercel Python serverless function.

Endpoints (all under /api):
- GET  /api/health
- GET  /api/page-speed?url=...&strategy=mobile|desktop
- POST /api/keyword-density
- GET  /api/authority?domain=...        (was: /api/backlinks; alias kept)

Design constraints:
- No paid API keys required (no Ahrefs, no Moz, no PSI key).
- Must run inside Vercel's 10-60s serverless timeout.
- Single file, stdlib + httpx only (small cold-start footprint).

Methodology lives in `_meta` keys on each response so the frontend can
render a transparent breakdown the user can verify themselves.
"""
from __future__ import annotations

import asyncio
import re
import time
from collections import Counter
from html.parser import HTMLParser
from typing import Optional
from urllib.parse import urljoin, urlparse

import httpx
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

app = FastAPI(title="RankedTag Tools API", version="2.0.0")

# Same-origin in prod (Vercel) so CORS is mostly a non-issue, but keep a
# permissive setting for local dev with `vite` on a different port.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

USER_AGENT = (
    "Mozilla/5.0 (compatible; RankedTagBot/1.0; +https://rankedtag.com/bot)"
)


# ──────────────────────────────────────────────────────────────────────────
# Helpers
# ──────────────────────────────────────────────────────────────────────────
def _normalize_url(raw: str) -> str:
    raw = (raw or "").strip()
    if not raw:
        raise HTTPException(status_code=400, detail="url is required")
    if not raw.startswith(("http://", "https://")):
        raw = "https://" + raw
    return raw


def _extract_domain(raw: str) -> str:
    raw = (raw or "").strip().lower()
    if not raw:
        raise HTTPException(status_code=400, detail="domain is required")
    if "://" not in raw:
        raw = "https://" + raw
    parsed = urlparse(raw)
    host = parsed.hostname or ""
    if host.startswith("www."):
        host = host[4:]
    if not host or "." not in host:
        raise HTTPException(status_code=400, detail="invalid domain")
    return host


def _clamp(v: float, lo: float = 0.0, hi: float = 100.0) -> float:
    return max(lo, min(hi, v))


# ──────────────────────────────────────────────────────────────────────────
# Lightweight HTML parser (no BeautifulSoup) — collects only what we need
# ──────────────────────────────────────────────────────────────────────────
class _Collector(HTMLParser):
    def __init__(self, base_url: str):
        super().__init__(convert_charrefs=True)
        self.base_url = base_url
        self.base_host = urlparse(base_url).hostname or ""
        self._in_head = False
        self._in_title = False
        self._title_buf: list[str] = []

        self.title: Optional[str] = None
        self.meta_description: Optional[str] = None
        self.canonical: Optional[str] = None
        self.viewport: Optional[str] = None
        self.robots: Optional[str] = None

        # Resource counts
        self.scripts = 0
        self.scripts_blocking = 0  # in <head>, no async/defer
        self.scripts_async_defer = 0
        self.scripts_inline = 0

        self.stylesheets = 0
        self.stylesheets_in_head = 0
        self.inline_styles = 0

        self.images = 0
        self.images_lazy = 0
        self.images_with_dimensions = 0
        self.images_with_alt = 0

        self.fonts = 0
        self.iframes = 0
        self.preconnects = 0
        self.preloads = 0

        # Link graph (homepage only; rough but real)
        self.links_internal = 0
        self.links_external = 0
        self.links_nofollow = 0

        # Structured data
        self.json_ld_blocks = 0
        self.json_ld_types: list[str] = []
        self._in_json_ld = False
        self._json_ld_buf: list[str] = []

        # Open Graph / Twitter
        self.og_tags = 0
        self.twitter_tags = 0

        # Content (rough word count from text nodes outside script/style)
        self._capture_text = True
        self._text_buf: list[str] = []

        self.h1_count = 0
        self.h2_count = 0
        self.h3_count = 0

        # Heading text + html lang (used by density-url endpoint)
        self.language: Optional[str] = None
        self.h1_tags: list[str] = []
        self.h2_tags: list[str] = []
        self._heading_tag: Optional[str] = None
        self._heading_buf: list[str] = []

    # --- handle_starttag ----------------------------------------------------
    def handle_starttag(self, tag: str, attrs):  # type: ignore[override]
        a = dict(attrs)
        if tag == "html":
            lang = a.get("lang") or a.get("xml:lang")
            if lang:
                self.language = lang.strip()
        if tag == "head":
            self._in_head = True
        elif tag == "title":
            self._in_title = True
        elif tag == "meta":
            name = (a.get("name") or "").lower()
            prop = (a.get("property") or "").lower()
            content = a.get("content") or ""
            if name == "description":
                self.meta_description = content
            elif name == "viewport":
                self.viewport = content
            elif name == "robots":
                self.robots = content
            elif prop.startswith("og:"):
                self.og_tags += 1
            elif name.startswith("twitter:"):
                self.twitter_tags += 1
        elif tag == "link":
            rel = (a.get("rel") or "").lower()
            href = a.get("href")
            if "stylesheet" in rel:
                self.stylesheets += 1
                if self._in_head:
                    self.stylesheets_in_head += 1
            elif "canonical" in rel and href:
                self.canonical = href
            elif "preconnect" in rel:
                self.preconnects += 1
            elif "preload" in rel:
                self.preloads += 1
            elif "icon" in rel:
                pass
            if href and ".woff" in href.lower():
                self.fonts += 1
        elif tag == "script":
            src = a.get("src")
            if src:
                self.scripts += 1
                is_async = "async" in a or "defer" in a
                if is_async:
                    self.scripts_async_defer += 1
                elif self._in_head:
                    self.scripts_blocking += 1
                # JSON-LD
                if (a.get("type") or "").lower() == "application/ld+json":
                    self.json_ld_blocks += 1
            else:
                self.scripts_inline += 1
                if (a.get("type") or "").lower() == "application/ld+json":
                    self._in_json_ld = True
                    self._json_ld_buf = []
                    self.json_ld_blocks += 1
            self._capture_text = False
        elif tag == "style":
            self.inline_styles += 1
            self._capture_text = False
        elif tag == "img":
            self.images += 1
            if (a.get("loading") or "").lower() == "lazy":
                self.images_lazy += 1
            if a.get("width") or a.get("height"):
                self.images_with_dimensions += 1
            if (a.get("alt") or "").strip():
                self.images_with_alt += 1
        elif tag == "iframe":
            self.iframes += 1
        elif tag == "a":
            href = a.get("href") or ""
            rel = (a.get("rel") or "").lower()
            if href.startswith(("javascript:", "mailto:", "tel:", "#")):
                pass
            else:
                try:
                    abs_url = urljoin(self.base_url, href)
                    host = urlparse(abs_url).hostname or ""
                    if host == self.base_host or host.endswith("." + self.base_host):
                        self.links_internal += 1
                    elif host:
                        self.links_external += 1
                        if "nofollow" in rel:
                            self.links_nofollow += 1
                except Exception:
                    pass
        elif tag == "h1":
            self.h1_count += 1
            self._heading_tag = "h1"
            self._heading_buf = []
        elif tag == "h2":
            self.h2_count += 1
            self._heading_tag = "h2"
            self._heading_buf = []
        elif tag == "h3":
            self.h3_count += 1

    # --- handle_endtag ------------------------------------------------------
    def handle_endtag(self, tag: str):  # type: ignore[override]
        if tag == "head":
            self._in_head = False
        elif tag == "title":
            self._in_title = False
            self.title = ("".join(self._title_buf)).strip() or None
        elif tag in ("script", "style"):
            self._capture_text = True
            if self._in_json_ld:
                blob = "".join(self._json_ld_buf)
                # Best-effort find @type entries; do not parse json strictly
                for m in re.finditer(r'"@type"\s*:\s*"([^"]+)"', blob):
                    self.json_ld_types.append(m.group(1))
                self._in_json_ld = False
                self._json_ld_buf = []
        elif tag in ("h1", "h2") and self._heading_tag == tag:
            text = " ".join("".join(self._heading_buf).split()).strip()
            if text:
                if tag == "h1" and len(self.h1_tags) < 10:
                    self.h1_tags.append(text)
                elif tag == "h2" and len(self.h2_tags) < 20:
                    self.h2_tags.append(text)
            self._heading_tag = None
            self._heading_buf = []

    # --- handle_data --------------------------------------------------------
    def handle_data(self, data: str):  # type: ignore[override]
        if self._in_title:
            self._title_buf.append(data)
        elif self._in_json_ld:
            self._json_ld_buf.append(data)
        else:
            if self._heading_tag is not None:
                self._heading_buf.append(data)
            if self._capture_text:
                stripped = data.strip()
                if stripped:
                    self._text_buf.append(stripped)

    # --- derived ------------------------------------------------------------
    def text_content(self) -> str:
        return " ".join(self._text_buf)


# ──────────────────────────────────────────────────────────────────────────
# /api/page-speed  (our own analyzer; no Google PSI key needed)
# ──────────────────────────────────────────────────────────────────────────
async def _fetch_with_timing(client: httpx.AsyncClient, url: str) -> dict:
    """Fetch a URL and return timing + size info."""
    t0 = time.perf_counter()
    try:
        resp = await client.get(url, timeout=15.0, follow_redirects=True)
    except httpx.HTTPError as e:
        raise HTTPException(status_code=502, detail=f"Could not fetch {url}: {e}")
    elapsed = (time.perf_counter() - t0) * 1000  # ms

    body = resp.content
    return {
        "url": str(resp.url),
        "status": resp.status_code,
        "ms": elapsed,
        "bytes": len(body),
        "headers": {k.lower(): v for k, v in resp.headers.items()},
        "http_version": resp.http_version,
        "body": body,
        "encoding": resp.headers.get("content-encoding"),
    }


def _score_speed(ms: float) -> tuple[float, str]:
    """Map TTFB+download milliseconds to 0-100 + label. Mirrors Lighthouse logic."""
    if ms < 800:
        return 100, "fast"
    if ms < 1800:
        return 80, "ok"
    if ms < 3000:
        return 60, "slow"
    if ms < 6000:
        return 30, "very slow"
    return 10, "critical"


def _score_size(bytes_: int) -> tuple[float, str]:
    kb = bytes_ / 1024
    if kb < 100:
        return 100, "lean"
    if kb < 250:
        return 85, "ok"
    if kb < 500:
        return 65, "heavy"
    if kb < 1000:
        return 35, "very heavy"
    return 10, "critical"


@app.get("/api/page-speed")
async def page_speed(
    url: str = Query(..., min_length=3),
    strategy: str = Query("mobile", regex="^(mobile|desktop)$"),
):
    """
    Our own page speed audit.

    We do NOT call Google PageSpeed Insights. Instead we fetch the URL
    server-side, parse the HTML, and compute a score from real signals:
      - TTFB + download time
      - HTML size, compression
      - Render-blocking resources (head <script>, head <link rel=stylesheet>)
      - Image hygiene (lazy-loading, alt text, dimensions)
      - HTTPS, HTTP/2, security + caching headers

    Cross-checkable: every component goes back via `_meta.signals` so the
    frontend can render the breakdown.
    """
    target = _normalize_url(url)
    headers = {
        "User-Agent": USER_AGENT,
        "Accept": "text/html,application/xhtml+xml",
    }

    async with httpx.AsyncClient(headers=headers, http2=True) as client:
        page = await _fetch_with_timing(client, target)

    body = page["body"]
    parser = _Collector(page["url"])
    try:
        parser.feed(body.decode(errors="replace"))
    except Exception:
        pass

    h = page["headers"]

    # ---- Component scores (each 0-100) ----
    speed_score, speed_label = _score_speed(page["ms"])
    size_score, size_label = _score_size(page["bytes"])

    # Render-blocking penalty
    blocking = parser.scripts_blocking + max(0, parser.stylesheets_in_head - 1)
    if blocking == 0:
        blocking_score = 100
    elif blocking <= 2:
        blocking_score = 80
    elif blocking <= 5:
        blocking_score = 50
    else:
        blocking_score = 20

    # Image hygiene
    if parser.images == 0:
        image_score = 100
    else:
        lazy_pct = parser.images_lazy / parser.images
        dim_pct = parser.images_with_dimensions / parser.images
        alt_pct = parser.images_with_alt / parser.images
        image_score = round(_clamp((lazy_pct * 0.4 + dim_pct * 0.3 + alt_pct * 0.3) * 100), 1)

    # Modern transport
    transport_score = 0
    transport_score += 35 if page["url"].startswith("https://") else 0
    transport_score += 25 if page["http_version"] in ("HTTP/2", "HTTP/3") else 0
    transport_score += 20 if page["encoding"] in ("gzip", "br", "zstd") else 0
    transport_score += 10 if h.get("strict-transport-security") else 0
    transport_score += 10 if h.get("cache-control") else 0

    # Composite (weighted)
    composite = round(
        speed_score * 0.30
        + size_score * 0.20
        + blocking_score * 0.20
        + image_score * 0.15
        + transport_score * 0.15,
        1,
    )

    # ---- Opportunities ----
    opportunities: list[dict] = []
    if parser.scripts_blocking > 0:
        opportunities.append({
            "title": f"{parser.scripts_blocking} render-blocking script(s) in <head>",
            "description": "Add async or defer to non-critical scripts, or move them to before </body>. Each one delays first paint.",
            "severity": "high" if parser.scripts_blocking > 3 else "med",
        })
    if parser.stylesheets_in_head > 2:
        opportunities.append({
            "title": f"{parser.stylesheets_in_head} stylesheets in <head>",
            "description": "Inline critical CSS and load the rest with media='print' onload swap, or combine stylesheets.",
            "severity": "med",
        })
    if parser.images > 0 and parser.images_lazy / parser.images < 0.5:
        opportunities.append({
            "title": "Images not using loading='lazy'",
            "description": f"Only {parser.images_lazy} of {parser.images} images are lazy-loaded. Add loading='lazy' to below-the-fold images.",
            "severity": "med",
        })
    if parser.images > 0 and parser.images_with_dimensions / parser.images < 0.7:
        opportunities.append({
            "title": "Images missing width/height",
            "description": "Set explicit width and height attributes to prevent layout shift (CLS).",
            "severity": "med",
        })
    if page["bytes"] > 500_000:
        opportunities.append({
            "title": f"HTML weighs {round(page['bytes']/1024)} KB",
            "description": "Reduce DOM size, inline only critical JS, lazy-load heavy components.",
            "severity": "high" if page["bytes"] > 1_000_000 else "med",
        })
    if not h.get("strict-transport-security"):
        opportunities.append({
            "title": "Missing Strict-Transport-Security header",
            "description": "Add HSTS header to enforce HTTPS at the browser level. Trust signal.",
            "severity": "low",
        })
    if not h.get("cache-control"):
        opportunities.append({
            "title": "No Cache-Control on the HTML",
            "description": "Add a sane Cache-Control header. Even a short s-maxage helps repeat visits.",
            "severity": "low",
        })
    if page["http_version"] not in ("HTTP/2", "HTTP/3"):
        opportunities.append({
            "title": f"Serving over {page['http_version']}",
            "description": "Upgrade to HTTP/2 or HTTP/3 (Cloudflare, Vercel, and most modern hosts do this for free).",
            "severity": "med",
        })
    if not page["encoding"]:
        opportunities.append({
            "title": "No HTTP compression",
            "description": "Enable gzip or brotli at the host. Easy win, sometimes a 70%+ reduction.",
            "severity": "high",
        })

    return {
        "url": page["url"],
        "strategy": strategy,
        "scores": {
            "performance": composite,
            "speed": speed_score,
            "size": size_score,
            "renderBlocking": blocking_score,
            "imageHygiene": image_score,
            "transport": transport_score,
        },
        "metrics": {
            "fetchMs": round(page["ms"]),
            "htmlBytes": page["bytes"],
            "htmlKb": round(page["bytes"] / 1024, 1),
            "speedLabel": speed_label,
            "sizeLabel": size_label,
            "httpVersion": page["http_version"],
            "compression": page["encoding"] or "none",
            "scripts": {
                "total": parser.scripts,
                "renderBlocking": parser.scripts_blocking,
                "asyncDefer": parser.scripts_async_defer,
                "inline": parser.scripts_inline,
            },
            "stylesheets": {
                "total": parser.stylesheets,
                "inHead": parser.stylesheets_in_head,
                "inlineStyleBlocks": parser.inline_styles,
            },
            "images": {
                "total": parser.images,
                "lazy": parser.images_lazy,
                "withDimensions": parser.images_with_dimensions,
                "withAlt": parser.images_with_alt,
            },
            "headers": {
                "hsts": bool(h.get("strict-transport-security")),
                "cacheControl": h.get("cache-control"),
                "csp": bool(h.get("content-security-policy")),
                "xContentTypeOptions": h.get("x-content-type-options"),
                "xFrameOptions": h.get("x-frame-options"),
            },
        },
        "opportunities": opportunities,
        "_meta": {
            "engine": "rankedtag-self-hosted",
            "version": "1.0",
            "note": "Computed in our serverless function from a server-side fetch. No Google PSI key required. Cross-check by viewing source on the URL.",
        },
    }


# ──────────────────────────────────────────────────────────────────────────
# /api/keyword-density
# ──────────────────────────────────────────────────────────────────────────
class KeywordDensityRequest(BaseModel):
    text: str = Field(..., min_length=1, description="Page copy to analyse")
    target: Optional[str] = Field(None, description="Optional target keyword")


_STOP_WORDS = {
    "a","an","and","are","as","at","be","been","being","but","by","do","does","did","for","from",
    "has","have","having","he","her","hers","him","his","i","if","in","into","is","it","its","itself",
    "me","my","no","nor","not","of","on","or","our","ours","out","over","own","same","she","so",
    "some","such","than","that","the","their","theirs","them","they","this","those","through","to",
    "too","under","until","up","very","was","we","were","what","when","where","which","while","who",
    "whom","why","will","with","you","your","yours","yourself","yourselves","should","would","could",
    "can","am","about","above","after","again","against","all","also","any","because","before","below",
    "between","both","during","each","few","more","most","other","only","off","these","there","here",
    "just","then",
}


def _tokenize(text: str) -> list[str]:
    cleaned = re.sub(r"[^a-z0-9\s'\-]", " ", (text or "").lower())
    return [t for t in cleaned.split() if t]


def _ranked(counter: Counter, total: int, limit: int = 12, min_count: int = 2) -> list[dict]:
    out = []
    for term, count in counter.most_common():
        if count < min_count:
            continue
        out.append({
            "term": term,
            "count": count,
            "density": (count / total * 100) if total else 0,
        })
        if len(out) >= limit:
            break
    return out


@app.post("/api/keyword-density")
def keyword_density(payload: KeywordDensityRequest):
    tokens = _tokenize(payload.text)
    total = len(tokens)
    if total == 0:
        raise HTTPException(status_code=400, detail="text is empty after normalisation")

    word_counter: Counter = Counter()
    for w in tokens:
        if len(w) < 2 or w in _STOP_WORDS:
            continue
        word_counter[w] += 1

    bigram_counter: Counter = Counter()
    for i in range(len(tokens) - 1):
        a, b = tokens[i], tokens[i + 1]
        if a in _STOP_WORDS or b in _STOP_WORDS:
            continue
        if len(a) < 2 or len(b) < 2:
            continue
        bigram_counter[f"{a} {b}"] += 1

    trigram_counter: Counter = Counter()
    for i in range(len(tokens) - 2):
        a, b, c = tokens[i], tokens[i + 1], tokens[i + 2]
        if a in _STOP_WORDS and c in _STOP_WORDS:
            continue
        if len(a) < 2 or len(b) < 2 or len(c) < 2:
            continue
        trigram_counter[f"{a} {b} {c}"] += 1

    sentences = len([s for s in re.split(r"[.!?]+", payload.text or "") if s.strip()])

    target_readout = None
    if payload.target and payload.target.strip():
        t = payload.target.strip().lower()
        target_tokens = len(t.split())
        cleaned = re.sub(r"[^a-z0-9\s'\-]", " ", (payload.text or "").lower())
        matches = len(re.findall(rf"\b{re.escape(t)}\b", cleaned))
        density = (matches * target_tokens / total * 100) if total else 0
        if total < 100:
            verdict = "Add more content. We need at least 100 words to read density honestly."
            verdict_class = "low"
        elif density == 0:
            verdict = "Target keyword does not appear yet. Drop it into the H1, the first 100 words, and one subhead."
            verdict_class = "low"
        elif density > 3.5:
            verdict = "Too high. Modern Google penalises stuffed pages. Aim for 0.8 to 2.5%."
            verdict_class = "high"
        elif density < 0.6:
            verdict = "A bit thin. Aim for 0.8 to 2.5% on a target keyword."
            verdict_class = "low"
        else:
            verdict = "Healthy density. You are in the natural range Google rewards."
            verdict_class = "good"
        target_readout = {
            "keyword": payload.target.strip(),
            "matches": matches,
            "density": density,
            "verdict": verdict,
            "verdictClass": verdict_class,
        }

    return {
        "totalWords": total,
        "uniqueWords": len(word_counter),
        "sentences": sentences,
        "avgWordsPerSentence": round(total / sentences, 1) if sentences else 0,
        "words": _ranked(word_counter, total, limit=12),
        "bigrams": _ranked(bigram_counter, total, limit=8),
        "trigrams": _ranked(trigram_counter, total, limit=6),
        "targetReadout": target_readout,
    }


# ──────────────────────────────────────────────────────────────────────────
# /api/density-url  (server-side URL scraper for the keyword density tool)
# ──────────────────────────────────────────────────────────────────────────
class DensityUrlRequest(BaseModel):
    url: str = Field(..., min_length=3)


_BLOCKED_HOSTS = {"localhost", "127.0.0.1", "0.0.0.0", "::1"}


def _guard_url(raw: str) -> str:
    target = _normalize_url(raw)
    parsed = urlparse(target)
    host = (parsed.hostname or "").lower()
    if host in _BLOCKED_HOSTS or host.startswith("169.254.") or host.startswith("10.") or host.endswith(".local"):
        raise HTTPException(status_code=400, detail="URL not allowed")
    return target


@app.post("/api/density-url")
async def density_url(payload: DensityUrlRequest):
    """
    Fetch a URL server-side and return clean text + page metadata for the
    keyword density tool. Browsers cannot scrape cross-origin pages because
    of CORS, so this endpoint exists to do the fetch on the server.

    Returns: { content, word_count, title, meta_description, canonical,
               language, h1_tags, h2_tags, status_code, final_url }
    """
    target = _guard_url(payload.url)
    headers = {
        "User-Agent": USER_AGENT,
        "Accept": "text/html,application/xhtml+xml",
        "Accept-Language": "en-US,en;q=0.9",
    }

    async with httpx.AsyncClient(headers=headers, http2=True, follow_redirects=True) as client:
        try:
            resp = await client.get(target, timeout=15.0)
        except httpx.HTTPError as e:
            raise HTTPException(status_code=502, detail=f"Could not fetch {target}: {e}")

    body = resp.content
    parser = _Collector(str(resp.url))
    try:
        parser.feed(body.decode(errors="replace"))
    except Exception:
        pass

    text = parser.text_content()
    if not text or len(text.split()) < 5:
        raise HTTPException(
            status_code=422,
            detail="Could not extract meaningful content from the page.",
        )

    return {
        "url": payload.url,
        "final_url": str(resp.url),
        "status_code": resp.status_code,
        "title": parser.title,
        "meta_description": parser.meta_description,
        "canonical": parser.canonical,
        "language": parser.language,
        "h1_tags": parser.h1_tags,
        "h2_tags": parser.h2_tags,
        "content": text,
        "content_word_count": len(text.split()),
    }


# ──────────────────────────────────────────────────────────────────────────
# /api/authority + /api/backlinks (alias)
# ──────────────────────────────────────────────────────────────────────────
async def _tranco_rank(client: httpx.AsyncClient, domain: str) -> Optional[dict]:
    """Free, no-key API. https://tranco-list.eu/api_documentation
    Returns {"rank": int, "date": "YYYY-MM-DD"} or None."""
    try:
        r = await client.get(
            f"https://tranco-list.eu/api/ranks/domain/{domain}",
            timeout=8.0,
        )
        if r.status_code != 200:
            return None
        data = r.json() or {}
        ranks = data.get("ranks") or []
        if not ranks:
            return None
        latest = ranks[0]
        return {"rank": latest.get("rank"), "date": latest.get("date")}
    except Exception:
        return None


async def _wayback_history(client: httpx.AsyncClient, domain: str) -> Optional[dict]:
    """Free, no-key Wayback CDX API. Returns first-seen and snapshot count."""
    try:
        r = await client.get(
            "https://web.archive.org/cdx/search/cdx",
            params={
                "url": domain,
                "output": "json",
                "fl": "timestamp,statuscode",
                "limit": 10000,
                "filter": "statuscode:200",
            },
            timeout=12.0,
        )
        if r.status_code != 200:
            return None
        data = r.json() or []
        if len(data) < 2:
            return {"firstSeen": None, "snapshotCount": 0}
        # First row is column headers
        rows = data[1:]
        first_ts = rows[0][0]  # YYYYMMDDhhmmss
        first_seen = (
            f"{first_ts[0:4]}-{first_ts[4:6]}-{first_ts[6:8]}"
            if len(first_ts) >= 8
            else None
        )
        return {"firstSeen": first_seen, "snapshotCount": len(rows)}
    except Exception:
        return None


def _score_traffic(rank: Optional[int]) -> float:
    """Tranco rank → 0-100. Lower rank = higher authority."""
    if rank is None:
        return 0
    if rank <= 1_000:
        return 100
    if rank <= 10_000:
        return 90
    if rank <= 100_000:
        return 70
    if rank <= 500_000:
        return 50
    if rank <= 1_000_000:
        return 30
    return 10


def _score_age(first_seen: Optional[str]) -> float:
    """First Wayback snapshot date → 0-100."""
    if not first_seen:
        return 0
    try:
        from datetime import date
        y, m, d = first_seen.split("-")
        first = date(int(y), int(m), int(d))
        years = (date.today() - first).days / 365.25
    except Exception:
        return 0
    if years >= 10:
        return 100
    if years >= 5:
        return 80
    if years >= 3:
        return 60
    if years >= 1:
        return 35
    return 15


def _score_history(snapshot_count: int) -> float:
    if snapshot_count >= 1000:
        return 100
    if snapshot_count >= 500:
        return 80
    if snapshot_count >= 100:
        return 60
    if snapshot_count >= 25:
        return 40
    if snapshot_count >= 5:
        return 20
    return 5


def _score_technical(headers: dict, http_version: str, https: bool) -> tuple[float, list[str]]:
    """Trust + technical signals from the homepage HTTP response."""
    notes: list[str] = []
    score = 0
    if https:
        score += 25
        notes.append("HTTPS ✓")
    else:
        notes.append("No HTTPS ✗")
    if http_version in ("HTTP/2", "HTTP/3"):
        score += 15
        notes.append(f"{http_version} ✓")
    else:
        notes.append(f"{http_version} ✗ (upgrade to HTTP/2)")
    if headers.get("strict-transport-security"):
        score += 15
        notes.append("HSTS ✓")
    else:
        notes.append("No HSTS")
    if headers.get("content-security-policy"):
        score += 10
        notes.append("CSP ✓")
    if headers.get("x-content-type-options"):
        score += 5
    if headers.get("cache-control"):
        score += 5
    if headers.get("server"):
        notes.append(f"Server: {headers.get('server')}")
    return min(score, 100), notes


def _score_content(parser: _Collector) -> tuple[float, dict]:
    """On-page authority signals: schema, link graph, headings, meta."""
    score = 0
    notes = {}

    if parser.title:
        score += 5
        notes["title"] = parser.title[:120]
    if parser.meta_description:
        score += 5
        notes["metaDescription"] = (parser.meta_description or "")[:160]
    if parser.canonical:
        score += 5
    if parser.viewport:
        score += 5

    # JSON-LD schema is a major signal for both classical SEO + LLMs
    if parser.json_ld_blocks >= 3:
        score += 20
    elif parser.json_ld_blocks >= 1:
        score += 10
    notes["jsonLdBlocks"] = parser.json_ld_blocks
    notes["jsonLdTypes"] = list(set(parser.json_ld_types))[:8]

    # Open Graph + Twitter
    if parser.og_tags >= 4:
        score += 10
    elif parser.og_tags >= 1:
        score += 5
    if parser.twitter_tags >= 1:
        score += 5

    # Heading structure
    if parser.h1_count == 1:
        score += 10
    elif parser.h1_count > 1:
        score += 3
    if parser.h2_count >= 2:
        score += 5

    # Internal link density (rough authority distribution)
    if parser.links_internal >= 30:
        score += 15
    elif parser.links_internal >= 10:
        score += 8
    notes["internalLinks"] = parser.links_internal
    notes["externalLinks"] = parser.links_external

    return min(score, 100), notes


@app.get("/api/authority")
@app.get("/api/backlinks")  # alias for backward compat with the older route
async def authority(domain: str = Query(..., min_length=3)):
    """
    RankedTag Authority Score: a composite of free, public signals.

    Components (weights add to 100%):
      - Traffic       30%   (Tranco rank)
      - Age           20%   (Wayback first snapshot)
      - History       10%   (Wayback snapshot count)
      - Technical     20%   (HTTPS / HTTP/2 / security headers / caching)
      - Content       20%   (schema, OG, headings, link graph)

    Every component is returned individually so you can verify it yourself.
    No Ahrefs key. No Moz key. No paid API. Cross-check the inputs by
    hitting the same public sources we hit:
      - https://tranco-list.eu/api/ranks/domain/{domain}
      - https://web.archive.org/cdx/search/cdx?url={domain}
      - View-source on https://{domain}/
    """
    target = _extract_domain(domain)
    home_url = f"https://{target}"
    headers = {"User-Agent": USER_AGENT, "Accept": "text/html"}

    async with httpx.AsyncClient(headers=headers, http2=True) as client:
        tranco_task = _tranco_rank(client, target)
        wayback_task = _wayback_history(client, target)
        try:
            page_task = _fetch_with_timing(client, home_url)
        except HTTPException:
            page_task = None

        if page_task is not None:
            tranco, wayback, page = await asyncio.gather(
                tranco_task, wayback_task, page_task, return_exceptions=False
            )
        else:
            tranco, wayback = await asyncio.gather(tranco_task, wayback_task)
            page = None

    # Parse HTML
    parser = _Collector(home_url)
    if page:
        try:
            parser.feed(page["body"].decode(errors="replace"))
        except Exception:
            pass

    # Component scores
    rank = (tranco or {}).get("rank")
    first_seen = (wayback or {}).get("firstSeen")
    snap_count = (wayback or {}).get("snapshotCount") or 0

    traffic_score = _score_traffic(rank)
    age_score = _score_age(first_seen)
    history_score = _score_history(snap_count)
    tech_score, tech_notes = (
        _score_technical(page["headers"], page["http_version"], home_url.startswith("https://"))
        if page else (0, ["could not fetch homepage"])
    )
    content_score, content_notes = _score_content(parser) if page else (0, {})

    # Composite weighted score
    total = round(
        traffic_score * 0.30
        + age_score * 0.20
        + history_score * 0.10
        + tech_score * 0.20
        + content_score * 0.20,
        1,
    )

    return {
        "domain": target,
        "score": total,
        "scoreLabel": "RankedTag Authority Score (0-100)",
        "components": {
            "traffic":   {"score": traffic_score,  "weight": 30, "source": "tranco-list.eu"},
            "age":       {"score": age_score,       "weight": 20, "source": "web.archive.org"},
            "history":   {"score": history_score,   "weight": 10, "source": "web.archive.org"},
            "technical": {"score": tech_score,      "weight": 20, "source": "homepage HTTP response"},
            "content":   {"score": content_score,   "weight": 20, "source": "homepage HTML"},
        },
        "raw": {
            "trancoRank": rank,
            "trancoDate": (tranco or {}).get("date"),
            "firstSeen": first_seen,
            "snapshotCount": snap_count,
            "technicalNotes": tech_notes,
            "contentNotes": content_notes,
        },
        "_meta": {
            "engine": "rankedtag-authority-v1",
            "note": "Composite score from free public sources. No Ahrefs / Moz / paid APIs.",
            "verifyUrls": {
                "tranco": f"https://tranco-list.eu/api/ranks/domain/{target}",
                "wayback": f"https://web.archive.org/web/*/{target}",
            },
        },
    }


# ──────────────────────────────────────────────────────────────────────────
# Health
# ──────────────────────────────────────────────────────────────────────────
@app.get("/api/health")
def health():
    return {
        "ok": True,
        "engines": {
            "pageSpeed": "rankedtag-self-hosted",
            "authority": "rankedtag-authority-v1",
            "keywordDensity": "client + server parity",
            "densityUrl": "server-side fetch + html extract",
        },
    }


# Local dev entrypoint
if __name__ == "__main__":
    import uvicorn

    uvicorn.run("index:app", host="0.0.0.0", port=8000, reload=True)

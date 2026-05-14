"""
Playwright JS renderer (skeleton).

Used only when a target page is JS-heavy (detected by low static content
or explicit user opt-in). Pooled, recycled every N pages to avoid bloat.
"""
from __future__ import annotations

from app.crawlers.base import BaseCrawler, CrawlRequest, CrawlResult


class PlaywrightRenderer(BaseCrawler):
    async def run(self, req: CrawlRequest) -> CrawlResult:
        raise NotImplementedError

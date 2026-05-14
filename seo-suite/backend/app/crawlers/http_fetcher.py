"""
aiohttp-backed async HTTP fetcher (skeleton).

Will hold:
  - per-process aiohttp.ClientSession with TCPConnector(limit=N) sized
    from settings.crawler_max_concurrency
  - conditional-GET helpers (If-Modified-Since, ETag)
  - response size guard from settings.crawler_max_page_size_mb
"""
from __future__ import annotations

from app.crawlers.base import BaseCrawler, CrawlRequest, CrawlResult


class HttpFetcher(BaseCrawler):
    async def run(self, req: CrawlRequest) -> CrawlResult:
        raise NotImplementedError

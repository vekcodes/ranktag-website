"""
Scrapy runner (skeleton).

Used for site-wide crawls (a target's own pages) when we want Scrapy's
duplicate filter, depth control, and built-in pipelines. Invoked by a
Celery task that wraps `CrawlerProcess`.
"""
from __future__ import annotations


def run_site_crawl(_seed_url: str, _max_pages: int = 1000) -> None:
    """Kick off a Scrapy site crawl (implemented in later step)."""
    raise NotImplementedError

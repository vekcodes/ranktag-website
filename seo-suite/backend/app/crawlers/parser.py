"""
HTML parser + link extractor (skeleton).

Wraps BeautifulSoup4 + lxml. Will return canonicalised links with
rel-class (dofollow/nofollow/ugc/sponsored), anchor text, and DOM-position
class (nav/body/footer/sidebar).
"""
from __future__ import annotations

from app.crawlers.base import CrawlResult


class HtmlParser:
    def parse(self, result: CrawlResult) -> dict:
        raise NotImplementedError

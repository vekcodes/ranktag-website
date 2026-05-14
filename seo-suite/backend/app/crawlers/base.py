"""
Crawler base contracts.

Defines the abstract surfaces every concrete crawler implementation
satisfies. No fetch / parse logic — only protocol.
"""
from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Protocol


@dataclass(slots=True)
class CrawlRequest:
    url: str
    render_js: bool = False
    timeout_s: int = 20
    priority: int = 0
    headers: dict[str, str] | None = None


@dataclass(slots=True)
class CrawlResult:
    url: str
    final_url: str
    status_code: int
    html: str | None
    fetched_at: float
    elapsed_ms: int
    bytes: int
    error: str | None = None


class Fetcher(Protocol):
    async def fetch(self, req: CrawlRequest) -> CrawlResult: ...


class Renderer(Protocol):
    async def render(self, req: CrawlRequest) -> CrawlResult: ...


class Parser(Protocol):
    def parse(self, result: CrawlResult) -> dict: ...


class BaseCrawler(ABC):
    """Abstract crawler. Implementations live in `http_fetcher`, `playwright_renderer`."""

    @abstractmethod
    async def run(self, req: CrawlRequest) -> CrawlResult: ...

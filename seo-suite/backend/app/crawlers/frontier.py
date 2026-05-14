"""
Crawl frontier — priority queue of URLs to crawl.

Backed by a Redis sorted set keyed by `(domain, priority_score)`. Per-host
politeness limits dequeue rate so we never hammer one host.

Implementation lands in a later step; this file fixes the surface area.
"""
from __future__ import annotations


class CrawlFrontier:
    """Priority-ordered URL queue with per-host politeness gating."""

    async def enqueue(self, url: str, priority: float = 0.0) -> None:
        raise NotImplementedError

    async def next(self) -> str | None:
        raise NotImplementedError

    async def size(self) -> int:
        raise NotImplementedError

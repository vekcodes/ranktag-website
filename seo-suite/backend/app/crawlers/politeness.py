"""
Politeness gating — robots.txt cache + per-host rate limiter.

Skeleton only. Concrete implementation will:
  - cache robots.txt per host (TTL 24h) using `robotexclusionrulesparser`
  - apply per-host token bucket from settings.crawler_per_host_concurrency
  - back off on 429 / 5xx with jittered exponential
"""
from __future__ import annotations


class RobotsCache:
    async def is_allowed(self, url: str, user_agent: str) -> bool:
        raise NotImplementedError


class HostRateLimiter:
    async def acquire(self, host: str) -> None:
        raise NotImplementedError

    async def release(self, host: str) -> None:
        raise NotImplementedError

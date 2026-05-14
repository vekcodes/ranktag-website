"""
User-agent rotation.

Default identity is our own bot string (transparent + contactable, the
ethical default for SEO crawlers). A `fake-useragent` pool is available
for *opt-in* scenarios that require browser-style headers.
"""
from __future__ import annotations

from typing import Iterable

from app.config import get_settings


class UserAgentRotator:
    """Round-robin rotator backed by a finite list."""

    def __init__(self, agents: Iterable[str] | None = None) -> None:
        cfg = get_settings()
        self._agents = list(agents) if agents else [cfg.crawler_user_agent]
        self._idx = 0

    def next(self) -> str:
        ua = self._agents[self._idx % len(self._agents)]
        self._idx += 1
        return ua

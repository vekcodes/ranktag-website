"""
Celery queue catalogue.

Queues are split by *role* so noisy/expensive workloads (rendering,
crawling) cannot block fast ones (alerts, exports).
"""
from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class QueueSpec:
    name: str
    description: str
    default_concurrency: int


QUEUES: tuple[QueueSpec, ...] = (
    QueueSpec("q.crawl.high",  "Interactive user lookups",                 16),
    QueueSpec("q.crawl.low",   "Background recrawls / freshness",          32),
    QueueSpec("q.render",      "Playwright JS rendering (heavy)",           2),
    QueueSpec("q.parse",       "HTML parse + link extraction",             16),
    QueueSpec("q.aggregate",   "Snapshot rollups, anchor agg, diffs",       8),
    QueueSpec("q.metrics",     "DA/DR/Trust/Spam score computation",        8),
    QueueSpec("q.whois",       "WHOIS / RDAP lookups (slow upstream)",      4),
    QueueSpec("q.alerts",      "Watchlist alerts / email / webhook",        8),
    QueueSpec("q.exports",     "CSV / PDF report generation",               4),
)

QUEUE_NAMES: tuple[str, ...] = tuple(q.name for q in QUEUES)

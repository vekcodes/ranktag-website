"""
ClickHouse client placeholder.

ClickHouse stores billion-row link facts and time-series snapshots. The
real client wraps `clickhouse-connect` with retry + batch-insert helpers.
"""
from __future__ import annotations

from app.config import get_settings


def get_ch_client():  # type: ignore[no-untyped-def]
    """Return a lazy ClickHouse client (implemented in later step)."""
    _ = get_settings()
    raise NotImplementedError

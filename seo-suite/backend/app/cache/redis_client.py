"""
Async Redis client lifecycle.

A single connection pool per process is held in module state; init/close
are driven from the FastAPI lifespan and from Celery worker signals.
"""
from __future__ import annotations

import redis.asyncio as redis

from app.config import get_settings
from app.core.logging import get_logger

log = get_logger(__name__)

_pool: redis.ConnectionPool | None = None


async def init_redis_pool() -> redis.ConnectionPool:
    """Create the global Redis connection pool."""
    global _pool
    if _pool is not None:
        return _pool

    settings = get_settings()
    _pool = redis.ConnectionPool.from_url(
        settings.redis_url,
        max_connections=settings.redis_max_connections,
        decode_responses=True,
    )
    log.info("redis.pool.initialised", url=settings.redis_url)
    return _pool


async def close_redis_pool() -> None:
    """Disconnect the global pool. Idempotent."""
    global _pool
    if _pool is not None:
        await _pool.disconnect(inuse_connections=True)
        log.info("redis.pool.closed")
    _pool = None


def get_redis() -> redis.Redis:
    """Return a Redis client bound to the global pool."""
    if _pool is None:
        raise RuntimeError("Redis pool not initialised — did lifespan run?")
    return redis.Redis(connection_pool=_pool)

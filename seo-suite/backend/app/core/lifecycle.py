"""
Application lifespan handler.

FastAPI lifespan replaces deprecated @on_event hooks. Resources opened here
(DB pools, Redis pools, HTTP sessions) are torn down on shutdown.
"""
from __future__ import annotations

from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.cache.redis_client import close_redis_pool, init_redis_pool
from app.config import get_settings
from app.core.logging import get_logger
from app.database.session import dispose_engine, init_engine

log = get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    """Manage app-level resources."""
    settings = get_settings()
    log.info("app.startup.begin", env=settings.app_env, version=settings.app_version)

    # ── Startup ──
    init_engine()
    await init_redis_pool()
    # crawler HTTP sessions, OTel tracer, etc. registered here in later steps.

    log.info("app.startup.complete")
    try:
        yield
    finally:
        # ── Shutdown ──
        log.info("app.shutdown.begin")
        await close_redis_pool()
        await dispose_engine()
        log.info("app.shutdown.complete")

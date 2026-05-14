"""
Async SQLAlchemy engine + session management.

`init_engine` is called once at app startup. `get_async_session` is the
FastAPI dependency that yields a session per request.
"""
from __future__ import annotations

from collections.abc import AsyncIterator

from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from app.config import get_settings
from app.core.logging import get_logger

log = get_logger(__name__)

_engine: AsyncEngine | None = None
AsyncSessionLocal: async_sessionmaker[AsyncSession] | None = None


def init_engine() -> AsyncEngine:
    """Create the global async engine + session factory."""
    global _engine, AsyncSessionLocal
    if _engine is not None:
        return _engine

    settings = get_settings()
    _engine = create_async_engine(
        settings.database_url,
        echo=settings.database_echo,
        pool_size=settings.database_pool_size,
        max_overflow=settings.database_max_overflow,
        pool_timeout=settings.database_pool_timeout,
        pool_pre_ping=True,
        future=True,
    )
    AsyncSessionLocal = async_sessionmaker(
        bind=_engine,
        expire_on_commit=False,
        autoflush=False,
        class_=AsyncSession,
    )
    log.info("db.engine.initialised", pool_size=settings.database_pool_size)
    return _engine


async def dispose_engine() -> None:
    """Tear down the global engine. Called from lifespan shutdown."""
    global _engine, AsyncSessionLocal
    if _engine is not None:
        await _engine.dispose()
        log.info("db.engine.disposed")
    _engine = None
    AsyncSessionLocal = None


async def get_async_session() -> AsyncIterator[AsyncSession]:
    """FastAPI dependency — yields a session, rolls back on error."""
    if AsyncSessionLocal is None:
        init_engine()
    assert AsyncSessionLocal is not None  # for type-checkers
    async with AsyncSessionLocal() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise
        else:
            await session.commit()

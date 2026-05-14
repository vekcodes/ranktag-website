"""
Multi-engine registry — primary / replica / analytics.

`init_engines()` creates up to three async engines based on settings:

  - primary    : always present; writes + read-your-writes.
  - replica    : if `DATABASE_URL_REPLICA` is set; SELECT-only.
  - analytics  : if `DATABASE_URL_ANALYTICS` is set; long-running OLAP.

Falls back transparently when an engine isn't configured:

  replica   absent → falls back to primary.
  analytics absent → falls back to replica, then primary.

Use `get_engine(role)` to obtain the right engine; `router.read_session`
and `router.write_session` are the everyday helpers.
"""
from __future__ import annotations

from enum import Enum
from typing import Final

from sqlalchemy.ext.asyncio import AsyncEngine, create_async_engine

from app.config import Settings, get_settings
from app.core.logging import get_logger

log = get_logger(__name__)


class DBRole(str, Enum):
    PRIMARY = "primary"
    REPLICA = "replica"
    ANALYTICS = "analytics"


_engines: dict[DBRole, AsyncEngine] = {}


def _connect_args(settings: Settings) -> dict:
    """asyncpg-specific connect_args. Sets statement_timeout per-connection."""
    return {
        "server_settings": {
            "application_name": settings.app_name,
            "statement_timeout": str(settings.database_statement_timeout_ms),
            "jit": "off",  # short OLTP queries don't benefit; turn on per-query in analytics
        },
        "timeout": settings.database_command_timeout_s,
        "command_timeout": settings.database_command_timeout_s,
    }


def _create_engine(dsn: str, settings: Settings, *, label: str) -> AsyncEngine:
    engine = create_async_engine(
        dsn,
        echo=settings.database_echo,
        pool_size=settings.database_pool_size,
        max_overflow=settings.database_max_overflow,
        pool_timeout=settings.database_pool_timeout,
        pool_recycle=settings.database_pool_recycle,
        pool_pre_ping=settings.database_pool_pre_ping,
        connect_args=_connect_args(settings),
        future=True,
    )
    log.info(
        "db.engine.created",
        role=label,
        pool_size=settings.database_pool_size,
        max_overflow=settings.database_max_overflow,
    )
    return engine


def init_engines() -> dict[DBRole, AsyncEngine]:
    """Idempotent — create whichever engines are configured."""
    if _engines:
        return _engines

    settings = get_settings()
    _engines[DBRole.PRIMARY] = _create_engine(
        settings.database_url, settings, label=DBRole.PRIMARY.value
    )

    if settings.database_url_replica:
        _engines[DBRole.REPLICA] = _create_engine(
            settings.database_url_replica, settings, label=DBRole.REPLICA.value
        )

    if settings.database_url_analytics:
        _engines[DBRole.ANALYTICS] = _create_engine(
            settings.database_url_analytics, settings, label=DBRole.ANALYTICS.value
        )

    return _engines


async def dispose_engines() -> None:
    """Teardown all engines — call from lifespan shutdown."""
    for role, engine in list(_engines.items()):
        await engine.dispose()
        log.info("db.engine.disposed", role=role.value)
    _engines.clear()


_FALLBACK: Final[dict[DBRole, list[DBRole]]] = {
    DBRole.PRIMARY:   [DBRole.PRIMARY],
    DBRole.REPLICA:   [DBRole.REPLICA, DBRole.PRIMARY],
    DBRole.ANALYTICS: [DBRole.ANALYTICS, DBRole.REPLICA, DBRole.PRIMARY],
}


def get_engine(role: DBRole = DBRole.PRIMARY) -> AsyncEngine:
    """Return the engine for the requested role, falling back if absent."""
    if not _engines:
        init_engines()
    for candidate in _FALLBACK[role]:
        engine = _engines.get(candidate)
        if engine is not None:
            return engine
    raise RuntimeError(f"No engine available for role {role}")

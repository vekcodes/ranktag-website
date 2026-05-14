"""
Read/write session router.

Default: writes → primary, reads → replica (if configured), analytics →
analytics replica. Falls back via `engine.get_engine()`.

Read-your-writes guarantee: any handler that has already written in the
current request gets reads from primary too. This is tracked via a
contextvar set by `write_session()`.

Usage:

    async def handler(read=Depends(read_session), write=Depends(write_session)):
        await write.execute(...)            # primary
        rows = await read.execute(...)      # replica unless we've written

For request-scoped uses, prefer the FastAPI dependencies in `app.api.deps`.
"""
from __future__ import annotations

from collections.abc import AsyncIterator
from contextlib import asynccontextmanager
from contextvars import ContextVar

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker

from app.core.logging import get_logger
from app.database.engine import DBRole, get_engine

log = get_logger(__name__)

# Tracks whether the current request has already issued a write. When true,
# subsequent reads go to primary to satisfy read-your-writes.
_wrote_in_request: ContextVar[bool] = ContextVar("db_wrote_in_request", default=False)


def _sessionmaker_for(role: DBRole) -> async_sessionmaker[AsyncSession]:
    return async_sessionmaker(
        bind=get_engine(role),
        expire_on_commit=False,
        autoflush=False,
        class_=AsyncSession,
    )


def mark_wrote() -> None:
    """Call from any code path that performs a write within the request."""
    _wrote_in_request.set(True)


def wrote_in_request() -> bool:
    return _wrote_in_request.get()


@asynccontextmanager
async def write_session() -> AsyncIterator[AsyncSession]:
    """Yields a primary-bound session. Auto-commit on success, rollback on error."""
    sm = _sessionmaker_for(DBRole.PRIMARY)
    async with sm() as session:
        try:
            yield session
            await session.commit()
            mark_wrote()
        except Exception:
            await session.rollback()
            raise


@asynccontextmanager
async def read_session(*, role: DBRole = DBRole.REPLICA) -> AsyncIterator[AsyncSession]:
    """
    Yields a read-only session.

    Promotes to primary when the request has already written (read-your-writes).
    Read-only sessions are explicitly marked so handlers can't accidentally
    write via the wrong session.
    """
    actual_role = DBRole.PRIMARY if wrote_in_request() else role
    sm = _sessionmaker_for(actual_role)
    async with sm() as session:
        # Best-effort guard — replica DSN uses the seosuite_ro role which
        # has no DML grants, so this is enforced server-side too.
        await session.execute(_set_read_only_sql())
        try:
            yield session
        finally:
            await session.rollback()  # never commit on a read session


# Compiled once at import time.
from sqlalchemy import text  # noqa: E402

_READ_ONLY_SQL = text("SET TRANSACTION READ ONLY")


def _set_read_only_sql() -> object:
    return _READ_ONLY_SQL

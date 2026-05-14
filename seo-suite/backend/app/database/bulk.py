"""
Bulk insert helpers.

Two paths:

  1. `copy_records()`        — fastest. Uses asyncpg's binary COPY for
                               clean inserts where there are no conflicts.
                               Throughput: 50k–200k rows/s per connection.

  2. `upsert_records()`      — batched INSERT ... ON CONFLICT DO UPDATE.
                               Slower (~10k–30k rows/s) but supports
                               idempotency and partial updates.

Both honor a `batch_size` so a single call never holds an oversized
transaction. Callers should size batches so each transaction is < 5 s.

These helpers DO NOT define models. They take a table name (or SA Table)
and a list of dicts; downstream Step 13 will introduce the actual model
modules that use these.
"""
from __future__ import annotations

import io
import time
from collections.abc import Iterable, Sequence
from typing import Any

from sqlalchemy import Table
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy.ext.asyncio import AsyncConnection

from app.core.logging import get_logger
from app.database.engine import DBRole, get_engine
from app.database.router import mark_wrote

log = get_logger(__name__)


# ─────────────────────────────────────────────────────────────────────
#  COPY path (asyncpg binary COPY)
# ─────────────────────────────────────────────────────────────────────
async def copy_records(
    table: str,
    columns: Sequence[str],
    rows: Iterable[Sequence[Any]],
    *,
    schema: str = "app",
    role: DBRole = DBRole.PRIMARY,
    batch_size: int = 10_000,
) -> int:
    """
    COPY rows into `<schema>.<table>` using asyncpg's binary protocol.

    `rows` is an iterable of tuples matching `columns`. The function batches
    automatically; one COPY per batch.

    Returns the total number of rows copied.

    Caveats:
      - Bypasses ORM events, defaults, and ON CONFLICT — only use when the
        table accepts straight inserts.
      - Each batch is its own transaction (autocommit). A crash mid-call
        leaves prior batches committed.
    """
    engine = get_engine(role)
    total = 0
    t0 = time.perf_counter()

    async with engine.begin() as conn:
        # Drop into the raw asyncpg connection — SQLAlchemy's async layer
        # doesn't expose COPY directly.
        raw = await conn.get_raw_connection()
        cursor = raw.driver_connection  # asyncpg.Connection

        buf: list[Sequence[Any]] = []
        for row in rows:
            buf.append(row)
            if len(buf) >= batch_size:
                total += await _copy_batch(cursor, schema, table, columns, buf)
                buf.clear()
        if buf:
            total += await _copy_batch(cursor, schema, table, columns, buf)

    mark_wrote()
    log.info(
        "db.bulk.copy",
        table=f"{schema}.{table}",
        rows=total,
        duration_ms=int((time.perf_counter() - t0) * 1000),
    )
    return total


async def _copy_batch(
    cursor: Any,
    schema: str,
    table: str,
    columns: Sequence[str],
    batch: list[Sequence[Any]],
) -> int:
    await cursor.copy_records_to_table(
        table,
        records=batch,
        columns=list(columns),
        schema_name=schema,
        timeout=60,
    )
    return len(batch)


# ─────────────────────────────────────────────────────────────────────
#  Upsert path (INSERT ... ON CONFLICT)
# ─────────────────────────────────────────────────────────────────────
async def upsert_records(
    sa_table: Table,
    rows: Iterable[dict[str, Any]],
    *,
    conflict_columns: Sequence[str],
    update_columns: Sequence[str] | None = None,
    role: DBRole = DBRole.PRIMARY,
    batch_size: int = 1_000,
) -> int:
    """
    Bulk UPSERT. `update_columns` defaults to "every non-PK column" — pass
    a smaller list to do partial updates.

    Returns total rows submitted (not necessarily rows changed; PG doesn't
    return a precise count for multi-row ON CONFLICT).
    """
    engine = get_engine(role)
    total = 0
    t0 = time.perf_counter()
    pending: list[dict[str, Any]] = []

    async with engine.begin() as conn:
        for row in rows:
            pending.append(row)
            if len(pending) >= batch_size:
                await _upsert_batch(conn, sa_table, pending, conflict_columns, update_columns)
                total += len(pending)
                pending.clear()
        if pending:
            await _upsert_batch(conn, sa_table, pending, conflict_columns, update_columns)
            total += len(pending)

    mark_wrote()
    log.info(
        "db.bulk.upsert",
        table=str(sa_table.name),
        rows=total,
        duration_ms=int((time.perf_counter() - t0) * 1000),
    )
    return total


async def _upsert_batch(
    conn: AsyncConnection,
    sa_table: Table,
    batch: list[dict[str, Any]],
    conflict_columns: Sequence[str],
    update_columns: Sequence[str] | None,
) -> None:
    stmt = pg_insert(sa_table).values(batch)
    if update_columns is None:
        cols = [c.name for c in sa_table.columns if c.name not in conflict_columns]
    else:
        cols = list(update_columns)

    set_ = {c: getattr(stmt.excluded, c) for c in cols}
    stmt = stmt.on_conflict_do_update(index_elements=list(conflict_columns), set_=set_)
    await conn.execute(stmt)


# ─────────────────────────────────────────────────────────────────────
#  CSV streaming COPY (for export pipelines + CDC ingest)
# ─────────────────────────────────────────────────────────────────────
async def copy_from_csv(
    table: str,
    columns: Sequence[str],
    csv_data: bytes | io.BytesIO,
    *,
    schema: str = "app",
    role: DBRole = DBRole.PRIMARY,
    delimiter: str = ",",
    null_string: str = "",
) -> int:
    """
    COPY FROM stdin in CSV mode. Use when source data is already CSV-shaped.
    """
    engine = get_engine(role)
    t0 = time.perf_counter()
    data = csv_data if isinstance(csv_data, bytes) else csv_data.getvalue()

    async with engine.begin() as conn:
        raw = await conn.get_raw_connection()
        cursor = raw.driver_connection

        result = await cursor.copy_to_table(
            table,
            source=data,
            columns=list(columns),
            schema_name=schema,
            format="csv",
            delimiter=delimiter,
            null=null_string,
            timeout=120,
        )

    # asyncpg returns a status string like "COPY 12345"
    rows = int(result.split()[1]) if isinstance(result, str) and result.startswith("COPY") else 0
    mark_wrote()
    log.info(
        "db.bulk.copy_csv",
        table=f"{schema}.{table}",
        rows=rows,
        duration_ms=int((time.perf_counter() - t0) * 1000),
    )
    return rows

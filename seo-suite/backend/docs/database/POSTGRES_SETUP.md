# RankedTag SEO Platform — PostgreSQL Setup (Step 12)

Production-grade PostgreSQL foundation: async access via SQLAlchemy 2.0 + asyncpg, transaction-mode pooling via PgBouncer, role-based access control, tuned config, read/write splitting, bulk-ingest helpers, Alembic migrations, backups, and a Kubernetes-ready manifest.

> **Scope.** Infrastructure only. The schema itself lands in Step 13.
>
> **Relationship to prior steps.** Step 5 designed the schema; Step 9 designed how PG fits in the cache hierarchy; Step 10 §4 sized the topology (primary + sync replica + cross-region warm standby + PgBouncer). This step lays down the working substrate.

---

## Table of Contents

1. [Topology](#part-1--topology)
2. [Tech Choices](#part-2--tech-choices)
3. [Local Development](#part-3--local-development)
4. [Docker Compose Layout](#part-4--docker-compose-layout)
5. [PostgreSQL Tuning Config](#part-5--postgresql-tuning-config)
6. [Roles, Grants & Schemas](#part-6--roles-grants--schemas)
7. [PgBouncer (Connection Pooling)](#part-7--pgbouncer-connection-pooling)
8. [SQLAlchemy 2.0 Async Setup](#part-8--sqlalchemy-20-async-setup)
9. [Why asyncpg](#part-9--why-asyncpg)
10. [Multi-Engine Registry](#part-10--multi-engine-registry)
11. [Read / Write Splitting](#part-11--read--write-splitting)
12. [Alembic Migrations](#part-12--alembic-migrations)
13. [Partitioning Foundation](#part-13--partitioning-foundation)
14. [Indexing Strategy Foundation](#part-14--indexing-strategy-foundation)
15. [Query Optimization Foundation](#part-15--query-optimization-foundation)
16. [Bulk Insert (COPY + Upsert)](#part-16--bulk-insert-copy--upsert)
17. [Materialized Views Strategy](#part-17--materialized-views-strategy)
18. [DB + Redis Coordination](#part-18--db--redis-coordination)
19. [Worker DB Access](#part-19--worker-db-access)
20. [High Availability](#part-20--high-availability)
21. [Backup & Recovery](#part-21--backup--recovery)
22. [Security Hardening](#part-22--security-hardening)
23. [Observability](#part-23--observability)
24. [Kubernetes Preparation](#part-24--kubernetes-preparation)
25. [Multi-Region Strategy](#part-25--multi-region-strategy)
26. [Testing](#part-26--testing)
27. [Dev Workflow Commands](#part-27--dev-workflow-commands)

---

## PART 1 — Topology

### Dev / staging (Docker Compose)

```
   [ FastAPI ]  [ Celery worker ]  [ Beat ]  [ Alembic ]
        │             │              │           │
        └─────┬───────┴──────┬───────┘           │
              ▼              ▼                   ▼
          [ PgBouncer :6432 ]            [ Postgres :5432 ]  ← direct, migrator only
              │
              ▼
          [ Postgres :5432 ]    ← single primary in dev
              │
              ▼
          [ pg_data volume ]
```

### Production (target shape; see Step 10 §4)

```
                                     ┌─────────────────────────┐
                                     │ PgBouncer fleet (3+)    │
        clients ─────────────────▶   │ transaction-mode pool   │
                                     └────────┬────────────────┘
                                              │
        ┌─────────────────────────────────────┼──────────────────────────────┐
        ▼                                     ▼                              ▼
 [ Primary (writer) ]   ─ WAL ─▶  [ Replica-1 (sync, AZ-local) ]
                        ─ WAL ─▶  [ Replica-2 (async, AZ-other) ]   ← read replica
                        ─ WAL ─▶  [ Replica-3 (async, cross-region) ] ← warm standby (DR)
                        ─ WAL archive ─▶  S3 (encrypted, cross-region replicated)
```

Managed via Aurora PG, RDS Multi-AZ, or an operator (CloudNativePG / Zalando) — never raw StatefulSets in prod. Hand-rolled StatefulSets cannot do safe automated failover.

---

## PART 2 — Tech Choices

| Layer | Choice | Why |
|---|---|---|
| Database         | PostgreSQL 16+                  | RLS, declarative partitioning, JIT, parallel query |
| ORM              | SQLAlchemy 2.0 (async core + ORM) | First-class async; large ecosystem |
| Driver (async)   | **asyncpg**                     | Fastest async PG driver in Python (Part 9) |
| Driver (sync)    | psycopg2-binary                 | Alembic + admin tools |
| Migrations       | Alembic                         | SA-native; autogenerate |
| Pooler           | **PgBouncer 1.23** (transaction mode) | Absorbs HPA storms; keeps PG conns bounded |
| Backups (dev)    | `pg_dump` cron container        | Logical, fast, verifiable |
| Backups (prod)   | RDS automated snapshots + WAL archive (pgbackrest / WAL-G fallback) | PITR; cross-region replication |
| HA orchestration | RDS Multi-AZ / Aurora / Patroni / CloudNativePG | Safe failover |

---

## PART 3 — Local Development

```bash
# From the repo root
cd seo-suite
docker compose up -d postgres pgbouncer

# Wait until both are healthy
docker compose ps

# Run migrations (no-op until models land in Step 13)
cd backend
alembic -c alembic.ini upgrade head

# Verify
psql "postgresql://seosuite_app:seosuite_app_dev_pw@localhost:6432/seosuite" \
     -c "select current_user, current_database(), version();"
```

App connects via `database_url` (configured in `.env`). Default goes through PgBouncer on `:6432` in prod; in dev you can hit Postgres directly on `:5432` if needed.

### Connecting tools

```
psql role            DSN                                                                  use case
─────────────────────────────────────────────────────────────────────────────────────────────────
seosuite (super)     postgresql://seosuite:…@localhost:5432/seosuite                       admin / DDL only
seosuite_migrator    postgresql://seosuite_migrator:…@localhost:5432/seosuite              alembic
seosuite_app         postgresql://seosuite_app:…@localhost:6432/seosuite                   app runtime (→ bouncer)
seosuite_ro          postgresql://seosuite_ro:…@localhost:6432/seosuite_ro                 analytics + dashboards
seosuite_replicator  (replication slot only)                                                streaming standby
```

---

## PART 4 — Docker Compose Layout

`seo-suite/docker-compose.yml` runs three DB-side services:

```yaml
postgres:
  image: postgres:16-alpine
  command: ["postgres", "-c", "config_file=/etc/postgresql/postgresql.conf"]
  volumes:
    - pg_data:/var/lib/postgresql/data
    - ./docker/postgres/init.sql:/docker-entrypoint-initdb.d/init.sql:ro
    - ./docker/postgres/postgresql.conf:/etc/postgresql/postgresql.conf:ro
  shm_size: 256mb
  healthcheck: { pg_isready ... }

pgbouncer:
  image: edoburu/pgbouncer:1.23
  depends_on: { postgres: { condition: service_healthy } }
  volumes:
    - ./docker/pgbouncer/pgbouncer.ini:/etc/pgbouncer/pgbouncer.ini:ro
    - ./docker/pgbouncer/userlist.txt:/etc/pgbouncer/userlist.txt:ro

pg-backup:
  image: postgres:16-alpine
  command: cron → /usr/local/bin/backup.sh nightly at 03:00 UTC
  volumes:
    - ./backups/postgres:/backups
    - ./docker/postgres/backup.sh:/usr/local/bin/backup.sh:ro
```

Files referenced:

- `docker/postgres/init.sql` — extensions, roles, grants, schema bootstrap (Part 6)
- `docker/postgres/postgresql.conf` — production-leaning tuning (Part 5)
- `docker/postgres/backup.sh` — nightly logical dump with verification (Part 21)
- `docker/pgbouncer/pgbouncer.ini` — pooler config (Part 7)
- `docker/pgbouncer/userlist.txt` — SCRAM credentials (Part 7)

---

## PART 5 — PostgreSQL Tuning Config

`docker/postgres/postgresql.conf` (sized for 4-vCPU / 8 GB container; halve for laptops). Key knobs:

```
shared_buffers              = 2GB              (25% of RAM)
effective_cache_size        = 5GB              (~60% of RAM)
work_mem                    = 32MB             (per node; sort/hash multiplier)
maintenance_work_mem        = 512MB
max_connections             = 300              (PgBouncer absorbs the storm)
random_page_cost            = 1.1              (SSD-friendly)
effective_io_concurrency    = 200              (NVMe)
max_parallel_workers        = 8
max_parallel_workers_per_gather = 4
wal_level                   = replica
max_wal_size                = 4GB
checkpoint_completion_target= 0.9
autovacuum_vacuum_scale_factor    = 0.05       (more aggressive)
autovacuum_analyze_scale_factor   = 0.02
autovacuum_naptime          = 30s
default_statistics_target   = 200
shared_preload_libraries    = 'pg_stat_statements,auto_explain'
auto_explain.log_min_duration = '500ms'
log_min_duration_statement  = 500ms
log_lock_waits              = on
statement_timeout           = 30s
deadlock_timeout            = 1s
lock_timeout                = 10s
idle_in_transaction_session_timeout = 60s
jit                         = on
```

### Why these values

- **`shared_buffers = 2GB / effective_cache_size = 5GB`** — guidelines from `pgtune` for a 4-vCPU 8 GB workload. Increase proportionally on larger nodes.
- **`work_mem = 32MB`** — sized so each query node can sort/hash in memory without `EXTERNAL: Disk`. A query with 6 sort/hash nodes uses up to 192 MB; combined with concurrent queries this is bounded by `max_connections`.
- **`effective_io_concurrency = 200`** — modern NVMe handles deep queues. Default `1` is for HDDs and quietly halves index scan throughput.
- **`random_page_cost = 1.1`** — flips the planner from "sequential scan everything" (HDD default) to favoring index access on SSD.
- **`statement_timeout = 30s`** — global safety net. Per-role overrides in `init.sql` allow analytics queries to run longer.
- **`log_min_duration_statement = 500ms`** + **`auto_explain`** — slow queries are logged with their plans, never analyzed in prod (ANALYZE is expensive).
- **`pg_stat_statements`** — the canonical query observability surface; tracked by all major dashboards.

In production (RDS / Aurora) these knobs go on the parameter group; this file is the dev mirror.

---

## PART 6 — Roles, Grants & Schemas

`docker/postgres/init.sql` runs once on first boot. It:

1. Enables required extensions: `uuid-ossp`, `pg_trgm`, `citext`, `btree_gin`, `btree_gist`, `pgcrypto`, `pg_stat_statements`.
2. Creates four application roles:
   - **`seosuite_app`** — `LOGIN`, DML on `app.*`. Used by API + workers.
   - **`seosuite_ro`** — `LOGIN`, SELECT-only. Used by dashboards + analytics workers.
   - **`seosuite_migrator`** — `LOGIN`, owns the `app` schema. Used by Alembic only.
   - **`seosuite_replicator`** — `REPLICATION`. Used for WAL streaming.
3. Creates the `app` schema owned by `seosuite_migrator`.
4. Sets `ALTER DEFAULT PRIVILEGES` so every future table created by the migrator is automatically:
   - read + write for `seosuite_app`,
   - read-only for `seosuite_ro`.
5. Pins per-role `search_path`, `statement_timeout`, `idle_in_transaction_session_timeout`, and `CONNECTION LIMIT`.

### Least-privilege summary

| Role | DDL | DML | SELECT | Replication | Connection limit |
|---|---|---|---|---|---|
| `seosuite`         | ✓ | ✓ | ✓ | — | (superuser) |
| `seosuite_migrator`| ✓ | ✓ | ✓ | — | 5 |
| `seosuite_app`     | — | ✓ | ✓ | — | 200 |
| `seosuite_ro`      | — | — | ✓ | — | 100 |
| `seosuite_replicator` | — | — | — | ✓ | — |

A compromised app credential cannot drop tables, ALTER schemas, or run REPLICATION.

---

## PART 7 — PgBouncer (Connection Pooling)

### Why PgBouncer

At enterprise scale, each app pod hosts up to 8 gunicorn workers × 20 pool conns = **160 PG connections per pod**. With 100 pods that's 16 000 — far above PG's healthy `max_connections` ceiling.

PgBouncer in **transaction mode** multiplexes thousands of client connections onto a bounded set of backend connections:

```
clients (any count) ─▶ PgBouncer ─▶ Postgres (max 200 conns)
```

A backend conn is bound to a client only for the duration of a transaction, then returned to the pool.

### Config (`docker/pgbouncer/pgbouncer.ini`)

```
pool_mode = transaction
max_client_conn = 4000
default_pool_size = 25         # per (db, user)
reserve_pool_size = 5
max_db_connections = 200
server_lifetime = 3600         # recycle every hour
server_idle_timeout = 600
auth_type = scram-sha-256
auth_file = /etc/pgbouncer/userlist.txt

[databases]
seosuite        = host=postgres ... auth_user=seosuite_app
seosuite_ro     = host=postgres ... auth_user=seosuite_ro
seosuite_admin  = host=postgres ... auth_user=seosuite_migrator
```

Three logical databases pointing at the same physical PG, each with its own pool — keeps OLTP, analytics, and migrations isolated.

### Pool tuning strategy

| Workload | Pool size | Why |
|---|---|---|
| OLTP app (`seosuite`)       | 25 / (db,user) | Tens of writes/s per pod with short txns |
| Analytics (`seosuite_ro`)   | 25 / (db,user) | Longer txns, smaller fan-out |
| Migrations (`seosuite_admin`)| 5 / (db,user) | Rare, serialized; tiny |

Total backend cap: `max_db_connections = 200`. The sum of `default_pool_size * users * dbs` should be ≤ this.

### Transaction-mode caveats (matters for SQLAlchemy)

In transaction mode, **session-scoped state is unsafe**:

- ❌ `LISTEN/NOTIFY` (state spans transactions)
- ❌ `SET LOCAL` *outside* a transaction
- ❌ `BEGIN; … advisory_lock(...) ; COMMIT;` followed by a different conn using that lock
- ❌ Prepared statements across transactions (asyncpg manages this transparently when configured with `statement_cache_size=0`)

SQLAlchemy + asyncpg work fine in transaction mode when:

- We don't use server-side cursors across transactions.
- We avoid LISTEN/NOTIFY (we use Kafka / Redis Pub/Sub instead).
- We open advisory locks **inside** a single transaction.

`server_reset_query = DISCARD ALL` cleans any residual state when a backend is returned to the pool.

---

## PART 8 — SQLAlchemy 2.0 Async Setup

### Files (`app/database/`)

```
app/database/
├── base.py              # DeclarativeBase + naming conventions
├── engine.py            # multi-engine registry (primary/replica/analytics)
├── session.py           # legacy single-engine helper (kept for migrations & older code)
├── router.py            # write_session / read_session helpers (Part 11)
├── bulk.py              # COPY + upsert helpers (Part 16)
├── ch_client.py         # ClickHouse async client (unrelated; for OLAP)
├── repositories/        # repository pattern (Step 13)
├── query_builders/      # complex helpers (later)
└── utilities/
```

### `base.py`

```python
class Base(DeclarativeBase):
    metadata = MetaData(naming_convention={
        "ix": "ix_%(column_0_label)s",
        "uq": "uq_%(table_name)s_%(column_0_name)s",
        "ck": "ck_%(table_name)s_%(constraint_name)s",
        "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
        "pk": "pk_%(table_name)s",
    })
```

Predictable constraint names mean Alembic-generated migrations are diffable across environments — no "constraint name UUID" churn.

### Lifecycle (`app/core/lifecycle.py`)

```python
async with lifespan(app):
    init_engines()                # see Part 10
    await init_redis_pool()
    yield
    await dispose_engines()
    await close_redis_pool()
```

Resources are owned by the lifespan; no global state leaks between tests.

### Why SQLAlchemy 2.0 (not 1.4)

- True async core — no greenlet workaround needed in 99% of code.
- `mapped_column`, `Mapped[…]` typing-first ORM (typed columns out of the box).
- Future-style query API by default (`select(Model).where(…)`).
- Better integration with mypy + Pydantic.

---

## PART 9 — Why asyncpg

| Metric | asyncpg | aiopg / psycopg2 async wrappers |
|---|---|---|
| Throughput (simple query) | **~75k qps** | ~12k qps |
| Throughput (prepared) | **~120k qps** | ~30k qps |
| Latency p50 (LAN) | **~0.4 ms** | ~1.2 ms |
| Memory per conn | ~250 KB | ~1.5 MB |
| Binary protocol | ✓ | partial |
| COPY support | binary + CSV | CSV only |

asyncpg is hand-written in Cython against the PG binary protocol — no `libpq` round-trip overhead. We use it everywhere on the request path and the worker path. psycopg2 is kept only for Alembic, which runs serial sync DDL.

### asyncpg + SQLAlchemy connection params

`app/database/engine.py` sets per-connection options:

```python
connect_args = {
    "server_settings": {
        "application_name": settings.app_name,
        "statement_timeout": str(settings.database_statement_timeout_ms),
        "jit": "off",          # OLTP doesn't benefit; toggle per query in analytics
    },
    "timeout": settings.database_command_timeout_s,
    "command_timeout": settings.database_command_timeout_s,
}
```

- **`application_name`** — surfaces in `pg_stat_activity`; on-call can find your queries.
- **`statement_timeout`** — server-side safety net on top of PgBouncer / client timeouts.
- **`jit = off`** — JIT compile overhead exceeds benefit for sub-ms queries. Re-enable per analytics query when joining millions of rows.

---

## PART 10 — Multi-Engine Registry

`app/database/engine.py` creates up to **three engines** based on settings:

```
DBRole.PRIMARY    ← always present       (database_url)
DBRole.REPLICA    ← if database_url_replica   set
DBRole.ANALYTICS  ← if database_url_analytics set
```

Each engine has its own connection pool sized via:

```python
create_async_engine(
    dsn,
    pool_size            = settings.database_pool_size,         # default 10
    max_overflow         = settings.database_max_overflow,      # default 20
    pool_timeout         = settings.database_pool_timeout,      # default 30s
    pool_recycle         = settings.database_pool_recycle,      # 1800s
    pool_pre_ping        = settings.database_pool_pre_ping,     # True
    connect_args         = _connect_args(settings),
)
```

### Fallback semantics

```
get_engine(ANALYTICS)  → analytics ?? replica ?? primary
get_engine(REPLICA)    → replica   ?? primary
get_engine(PRIMARY)    → primary
```

Means a single-node dev environment works without configuration; a prod environment with all three URLs gets full separation.

### Engine sizing strategy

```
Per-pod SQLAlchemy pool   = 10 + overflow 20  ≈ up to 30 conns
PgBouncer per-(db,user)   = 25                ← real backend cap
Postgres max_connections  = 300

# So at 100 app pods × 30 SA conns = 3000 client-side conns,
# but PgBouncer multiplexes them onto ≤200 backend conns to PG.
```

---

## PART 11 — Read / Write Splitting

`app/database/router.py` exposes two context-managers:

```python
async with write_session() as session:     # primary, auto-commit on exit
    await session.execute(insert(...))

async with read_session() as session:      # replica (or primary if RYW), SET TRANSACTION READ ONLY
    rows = await session.execute(select(...))
```

### Read-your-writes (RYW)

After any successful write in the request, a contextvar flips:

```python
_wrote_in_request.set(True)
```

`read_session()` checks it and promotes to primary for the rest of the request. This protects the common "create + redirect → fetch new state" flow from replication lag.

### Replication lag handling

- **Lag-aware routing** (future): a healthcheck loop publishes the replica's `pg_last_xact_replay_timestamp()` lag; the router falls back to primary if lag > 1 s.
- **Server-side READ ONLY**: every replica transaction starts with `SET TRANSACTION READ ONLY` — even an accidental UPDATE on a replica errors out cleanly.
- **Role-based defense**: the `seosuite_ro` user has no DML grants; a misrouted write fails with `permission denied` regardless of transaction mode.

### Failover

When the primary goes down (RDS Multi-AZ does this in 60–120 s; Aurora in ~30 s):

1. DNS endpoint flips to the new primary.
2. App's connection pool fills with broken connections; `pool_pre_ping=True` catches them on next checkout and retries.
3. In-flight transactions abort. Tasks retry per Step 8's retry policy.

---

## PART 12 — Alembic Migrations

### Layout

```
backend/
├── alembic.ini                         # config: file naming, log levels
└── alembic/
    ├── env.py                          # reads sync DSN; imports Base.metadata
    ├── script.py.mako                  # template for new revisions
    └── versions/                       # generated migrations
```

### `env.py` highlights

- Uses **`database_url_sync`** (psycopg2). Autogenerate needs a sync connection.
- `compare_type=True` + `compare_server_default=True` — detects type changes (`varchar(100)` → `text`) and default-value drift.
- `target_metadata = Base.metadata` — every model file imported into the package is visible to autogenerate.

### Workflow

```bash
# Create a new revision after editing models
make revision m="add domains table"
# == docker compose exec api alembic -c alembic.ini revision -m "..." --autogenerate

# Review the generated file in alembic/versions/, edit if needed.

# Apply
make migrate
# == alembic -c alembic.ini upgrade head

# Roll back the most recent migration (dev only)
alembic -c alembic.ini downgrade -1

# Inspect history
alembic -c alembic.ini history
alembic -c alembic.ini current
```

### Online-safe migration rules (enforced in code review)

1. **Add columns** without `NOT NULL`; backfill in a follow-up migration; add `NOT NULL` in a third.
2. **Drop columns** in a separate release **after** the previous app version stops referencing them.
3. **Rename** = add-new + dual-write + backfill + cut-over + drop-old (4 deploys, never one).
4. **Index creation** uses `CONCURRENTLY` (Alembic: `op.create_index(..., postgresql_concurrently=True, postgresql_using='btree')`); add a `with op.get_context().autocommit_block():` wrapper because `CONCURRENTLY` can't run inside a transaction.
5. **Lock-heavy DDL** (rewriting tables, adding `NOT NULL` to large tables) uses `lock_timeout = '500ms'` to abort fast rather than block writes.

These rules are how we get zero-downtime DDL on a 100M+ row table.

---

## PART 13 — Partitioning Foundation

### What gets partitioned

| Table | Strategy | Key | Rationale |
|---|---|---|---|
| `crawl_state`         | RANGE  | `fetched_at_month` | Append-mostly; queries are time-windowed |
| `audit_issues`        | RANGE  | `audit_started_month` | Same |
| `notifications`       | RANGE  | `created_month` | Aged-out; archival friendly |
| `backlinks_history`   | RANGE  | `snapshot_month` (PG side; lives in ClickHouse primarily) | — |
| `outbox`              | RANGE  | `created_day` | Drop-and-recreate empty daily partitions |
| `events`              | RANGE  | `ts_hour` | Hot recent + cold older |

### Partition pruning

Queries with `WHERE fetched_at BETWEEN ...` prune partitions automatically; the planner reads only the relevant ones. For us this means a `last 24h` dashboard query touches **1 partition** out of 36, not the whole table.

### Operational rotation

A monthly maintenance job:

1. Creates next-month partition.
2. Detaches partitions older than the retention horizon.
3. Either drops them or archives to S3 via `pg_dump --table=…`.

This work runs as a Celery beat task (Step 8 §10): `maintenance.partition_rotate` weekly.

### Migration helper (planned for Step 13)

```python
def make_range_partition(table_name, key, start, end):
    op.execute(f"""
      CREATE TABLE app.{table_name}_{start:%Y_%m} PARTITION OF app.{table_name}
        FOR VALUES FROM ('{start}') TO ('{end}');
    """)
```

A small library in `alembic/_utils/partitions.py` (added when the first partitioned table lands in Step 13).

### Scaling advantages

- **Smaller working set**: each partition has its own index; cache locality on hot partitions.
- **Faster maintenance**: VACUUM/REINDEX per partition, not per whole table.
- **Cheap retention**: `DETACH + DROP` is O(1); `DELETE WHERE` on a billion rows is days.
- **Bulk ingest**: COPY into the current partition lands at full speed.

---

## PART 14 — Indexing Strategy Foundation

| Index type | Use case |
|---|---|
| **B-tree (default)**    | PKs, FKs, high-selectivity equality + range |
| **BRIN**                | append-mostly time columns (`fetched_at`, `created_at`); orders of magnitude smaller than B-tree on multi-billion-row tables |
| **GIN**                 | `tsvector`, `jsonb`, array containment, `pg_trgm` (with `btree_gin`) |
| **GiST**                | exclusion constraints, range types, geographic (when added) |
| **Hash**                | high-volume equality lookups (rare; B-tree usually wins unless table is huge) |
| **Partial**             | hot subsets (`WHERE status = 'running'`) |
| **Covering (INCLUDE)**  | index-only scans for dashboard queries |
| **Composite**           | multi-column equality + sort (`(target_id, first_seen DESC, link_id DESC)`) |

### Write/read tradeoffs

Every secondary index slows writes by ~10–30%. Rules:

1. **Three indexes max** per write-heavy table by default; add more only with measured benefit.
2. **Partial indexes** for queries that scan < 10% of the table.
3. **BRIN** instead of B-tree on append-mostly columns: 100–1000× smaller, fast enough for time-range scans.
4. **Covering indexes** when a single dashboard query is hot enough to deserve its own index-only path.

### pg_trgm setup

`init.sql` enables `pg_trgm` and pins `similarity_threshold = 0.25`. Future indexes:

```sql
CREATE INDEX CONCURRENTLY idx_domains_name_trgm
  ON app.domains USING gin (name gin_trgm_ops);
```

Fuzzy domain/anchor search uses `name % :q` (similarity operator) and hits this index.

---

## PART 15 — Query Optimization Foundation

### Slow query log

`log_min_duration_statement = 500ms` logs every query slower than 500 ms with its full text and parameters. Streamed to Loki via the structured-log pipeline.

### `auto_explain`

Plans of slow queries are logged automatically in JSON. The on-call dashboard surfaces the top 10 by cumulative time per hour.

### `pg_stat_statements`

```sql
SELECT query, calls, total_exec_time, mean_exec_time, rows
FROM pg_stat_statements
ORDER BY total_exec_time DESC
LIMIT 20;
```

The default Grafana DB dashboard queries this view every 30 s. Reset weekly via `maintenance.pg_stat_reset` (Beat task).

### EXPLAIN workflow

```sql
-- For diagnosis (read-only)
EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON, VERBOSE) <query>;

-- For prod tracing (avoid ANALYZE in prod when the query is slow):
EXPLAIN (BUFFERS, FORMAT JSON) <query>;
```

`pgMustard` / `Dalibo Explain` consume the JSON output.

### Materialized views & aggregation tables

Heavy aggregations are pre-computed:

```
mv_org_daily_usage              — billing dashboards
mv_top_domains_by_change_rate   — warmer hot-list selector
mv_project_health               — dashboard composite
```

These are refreshed by Beat tasks (`analytics.refresh_mv_*`), not on the request path.

### Query cache integration

The Redis query cache (Step 9 §7) sits in front of the DB. Cache key includes the query hash + args hash; Step 9 specifies the namespaces (`qry:v1:*`) and TTLs.

---

## PART 16 — Bulk Insert (COPY + Upsert)

### `app/database/bulk.py`

Three helpers — see source for full signatures:

```python
await copy_records(
    table="page_facts",
    columns=("url_hash", "title", "word_count", "fetched_at"),
    rows=row_iter,                # iterable of tuples
    schema="app",
    batch_size=10_000,
)
# → 50k–200k rows/s per connection via asyncpg binary COPY

await upsert_records(
    sa_table=BacklinkSummary.__table__,
    rows=batch,                   # iterable of dicts
    conflict_columns=("target_id", "source_hash"),
    update_columns=("last_seen_at", "status"),   # partial update
    batch_size=1_000,
)
# → 10k–30k rows/s; uses INSERT ... ON CONFLICT DO UPDATE

await copy_from_csv(
    table="audit_issues",
    columns=("audit_id", "url_hash", "code", "severity"),
    csv_data=buffer,
    delimiter=",",
    null_string="",
)
```

### Why two paths

- **COPY** is unbeatable for clean inserts; no conflict handling, no triggers, no defaults considered.
- **Upsert** is necessary when ingest is idempotent (re-runs land on the same natural key); 5–10× slower than COPY.

### Batching strategy

- Worker buffers up to `batch_size` or `flush_window_seconds`, whichever first.
- One batch = one transaction.
- A failed batch goes to `q.writer.retry` with full envelope.
- Crash mid-call: prior batches are committed; the next attempt resumes from the last successful batch (workers track this in the job state).

### Throughput targets (Step 7 §15)

- Backlinks ingest: 10k/s sustained, 50k/s peak.
- Audit issues: 5k/s.
- Crawl state writes: 1k/s.

These are well within COPY's headroom; PgBouncer + the writer worker pool keep DB connection count bounded.

---

## PART 17 — Materialized Views Strategy

Three tiers of pre-computation:

1. **Materialized views** (PG) — for aggregations that change only on writes and can be refreshed incrementally:

   ```sql
   CREATE MATERIALIZED VIEW app.mv_org_daily_usage AS
     SELECT org_id, day, sum(api_calls) AS api_calls, sum(crawl_pages) AS pages
     FROM   app.usage_events
     GROUP  BY org_id, day;
   ```

   Refresh: `REFRESH MATERIALIZED VIEW CONCURRENTLY app.mv_org_daily_usage` (requires unique index). Scheduled by Beat (`analytics.refresh_mv_org_daily_usage` daily 01:00 UTC).

2. **Precomputed metrics tables** — for heavy joins that can't be incrementally maintained:

   ```
   domain_metrics_daily      (domain, day, da, dr, trust, spam)
   target_backlink_rollup_hourly  (target_id, hour, rd, bl, lost, new)
   ```

   Written by analytics workers; queried by the API.

3. **Redis query cache** — for repeated reads of the same query+args (Step 9 §7).

### Refresh strategies

| Strategy | When |
|---|---|
| Full refresh                              | Small MVs, nightly |
| `REFRESH MATERIALIZED VIEW CONCURRENTLY` | Medium MVs with unique index, hourly |
| Incremental table update via worker      | Large rollups |
| Partial refresh by partition             | Time-partitioned aggregates |

---

## PART 18 — DB + Redis Coordination

(Recap from Step 9 §8; pertinent rules here.)

- **Write path order**: DB write → cache invalidate → emit event. We **never** invalidate before writing, because a concurrent read could re-fill the cache from stale DB.
- **Distributed locks** for cache rebuilds use Redis fenced leases (Step 9 §10), not PG advisory locks. PG locks are reserved for **row-level** coordination on tenant data.
- **Idempotent writes** keyed on natural keys (`url_hash`, `org_id:day`, etc.) so replays are safe.
- **Event emission** uses the transactional Outbox pattern (Step 8 §18) — the outbox row is written in the same DB transaction as the business state; a relay forwards to Kafka.

---

## PART 19 — Worker DB Access

Workers share the same `app/database/engine.py` module. They:

- Connect via PgBouncer (transaction mode), same as the API.
- Use `write_session()` and `read_session()` exactly like API handlers.
- Use **COPY** (`bulk.copy_records`) for ingest paths; never per-row INSERT in a loop.
- Mark writes via `router.mark_wrote()` so RYW behavior applies to subsequent reads within the same task.

### Worker-safe transaction rules

1. **Short transactions** — never hold a txn across an external HTTP call or a Redis round-trip. Either commit between or use Outbox.
2. **Idempotent retry** — every task can be re-executed; writes are upserts keyed on natural keys (Step 8 §15).
3. **`SELECT … FOR UPDATE SKIP LOCKED`** for queue-like patterns over PG tables (used by Beat for `scheduled_jobs`).
4. **Advisory locks** scoped to a single transaction (`pg_try_advisory_xact_lock`) for "only one process should run this section."

---

## PART 20 — High Availability

### Production target shape (Step 10 §4)

```
Primary  →  WAL streaming  →  Sync replica (AZ-local; zero data loss on AZ failure)
         →                   Async replica (AZ-other; read traffic)
         →                   Async cross-region warm standby (DR)
         →                   WAL archive to S3 (PITR base)
```

### Choice of HA orchestration

| Option | When |
|---|---|
| **Aurora PostgreSQL**       | Default for new prod. Storage layer is multi-AZ by design; failover ~30 s. |
| **RDS Multi-AZ for PG**     | When Aurora's pricing or features don't fit. Failover 60–120 s. |
| **CloudNativePG** (operator) | Self-hosted K8s prod. Best PG operator IMO; PITR + WAL archiving built in. |
| **Zalando postgres-operator** | Patroni-based; works well; bigger learning curve. |
| **Hand-rolled StatefulSet** | Dev / staging only. Cannot fail over safely without an operator. |

### Failover workflow

```
detect:        managed service (RDS/Aurora) or Patroni quorum loss
elect:         most-up-to-date replica becomes new primary
DNS:           endpoint flips (RDS) or service IP moves (operator)
clients:       reconnect via pool_pre_ping=True; in-flight txns abort
queue:         Step 8 retry policy reapplies failed tasks
data loss:     0 (sync replica) or < WAL flush window (async)
```

### Zero-downtime ops

- **Rolling upgrades**: minor PG upgrades via managed service maintenance window. Major upgrades blue-green (new cluster, dump + restore, switch DNS).
- **Schema migrations**: backward-compat-first per Part 12.
- **Connection drain**: PgBouncer `PAUSE` + `RESUME` allow DDL behind a brief lock without dropping client connections.

---

## PART 21 — Backup & Recovery

### RTO / RPO targets (mirror Step 10 §15)

| Scenario | RTO | RPO |
|---|---|---|
| Pod failure                | < 1 min | 0 |
| AZ failure (Multi-AZ)      | < 5 min | 0 (sync replica) |
| Region failure             | ≤ 60 min | ≤ 5 min |
| Catastrophic (multi-region)| ≤ 4 h   | ≤ 1 h (WAL archive in S3 CRR) |

### Backup strategy

**Production (managed)**:

- RDS automated snapshots: daily, 14-day retention.
- WAL archive to S3, cross-region replicated, 30-day retention.
- Weekly full export to encrypted S3, 90-day retention.
- Monthly cold archive to S3 Glacier Deep Archive, 7-year retention.

**Production (self-hosted)**:

- `pgbackrest` (preferred) or `WAL-G` running as a sidecar / DaemonSet.
- Continuous WAL streaming to S3.
- Daily full backups, weekly full, monthly archive.

**Dev / staging**:

- `pg_dump --format=custom --compress=6` via the `pg-backup` container nightly at 03:00 UTC.
- 14-day retention on the local volume.
- Each dump is verified by `pg_restore --list` before being declared successful.

### Point-in-time recovery

Aurora / RDS PITR window: 14 days. Self-hosted (pgbackrest) PITR is configurable; we plan for 30 days.

### Restore workflow

```bash
# Logical (dev / one-off):
pg_restore --clean --if-exists --no-owner --no-privileges \
           --dbname="postgresql://seosuite_migrator:…@host:5432/seosuite" \
           /backups/20260513T030000Z_seosuite.dump

# PITR (prod):
aws rds restore-db-cluster-to-point-in-time \
  --source-db-cluster-identifier seosuite-prod \
  --db-cluster-identifier seosuite-prod-restore \
  --restore-to-time 2026-05-13T14:22:00Z
```

### Backup verification

- **Weekly automated restore test**: an ephemeral PG container spins up, restores last night's dump, runs a checksum query suite over critical tables, then is destroyed.
- **Quarterly DR drill**: full region failover exercise (Step 10 §15).
- A failed verification pages SRE within 10 minutes.

---

## PART 22 — Security Hardening

### Encryption

- **In transit**: TLS 1.2+ on every client→server connection (PgBouncer terminates TLS in prod; cleartext on private net inside the cluster).
- **At rest**: EBS / managed-disk encryption with KMS-backed keys.
- **WAL archive**: SSE-KMS on S3 buckets.

### Authentication

- **SCRAM-SHA-256** everywhere; MD5 disabled.
- **Per-role passwords** rotated quarterly via Vault → External Secrets Operator.
- **No application secret hard-coded** anywhere.

### Authorization

- **Least-privilege roles** (Part 6).
- **Schema isolation**: app objects live in `app.*`, not `public.*`.
- **Row-Level Security**: `row_security = on` cluster-wide; per-table policies enabled on multi-tenant tables in Step 13.

### Injection

- **Parametrized queries everywhere** — SQLAlchemy enforces this by construction.
- **No string concatenation** of identifiers from user input; whitelisting at the SDK layer.
- **JSONB validation** — Pydantic schemas validate payloads before they reach the DB.

### Credential leakage

- `.env` gitignored.
- Production secrets via Vault → External Secrets → K8s secrets (Step 10 §16).
- Secrets never appear in logs (structlog redactor drops fields named `password`, `secret`, `token`).

### Defense in depth — what each layer rejects

```
WAF/Cloudflare     → bot traffic, SQLi-shaped URLs, OWASP top 10
API gateway        → schema-invalid bodies, missing auth
SQLAlchemy         → string-interpolated SQL (caught in code review + linters)
PgBouncer          → unauthenticated connections
Postgres roles     → DML by ro role; DDL by app role
```

---

## PART 23 — Observability

### Metrics (Prometheus, via `postgres_exporter`)

```
pg_up
pg_stat_database_xact_commit / xact_rollback / blks_hit / blks_read
pg_stat_database_deadlocks / conflicts
pg_stat_replication_lag_bytes / lag_seconds
pg_stat_activity_count{state}
pg_stat_user_tables_n_tup_ins / _upd / _del / _hot_upd
pg_stat_user_tables_n_dead_tup     # vacuum pressure
pg_stat_statements_total_exec_time / mean_exec_time / calls
pg_locks_count{mode}
pg_database_size_bytes
pgbouncer_pools_*                  # via pgbouncer_exporter
pgbouncer_stats_total_query_time
```

### Slow queries

- `pg_stat_statements` view exported every 30 s.
- Top 20 by total_exec_time on the on-call dashboard.
- Alert when `mean_exec_time` for any tracked query crosses its baseline by > 3×.

### Replication lag

- `pg_stat_replication.replay_lag` from primary.
- Alert when lag > 1 s on the sync replica; > 30 s on async.

### Locks & deadlocks

- `log_lock_waits = on` writes structured logs whenever a query waits > `deadlock_timeout` (1 s).
- `pg_stat_database.deadlocks` counter → alert on any increment.

### Dashboards

```
Grafana: Postgres — Overview                # connections, throughput, cache hit
Grafana: Postgres — Top Queries             # pg_stat_statements
Grafana: Postgres — Replication             # lag, slot status
Grafana: Postgres — Locks                   # waits, deadlocks
Grafana: PgBouncer — Pools                  # pool fullness, query time, errors
Grafana: Postgres — Tables                  # row growth, dead tuples, vacuum
```

---

## PART 24 — Kubernetes Preparation

Sample manifest at `seo-suite/backend/deployments/postgres/statefulset.yaml`:

- **Postgres StatefulSet** (3 replicas; operator-managed in prod)
- **PgBouncer Deployment** (3 replicas)
- **CronJob** for nightly `pg_dump` → S3
- **ConfigMaps** for `postgresql.conf` and `init.sql`
- **Secrets** sourced from External Secrets / Vault
- **PVCs** on `gp3-encrypted` storage class (200 Gi each)
- **Pod anti-affinity** spreads replicas across AZs

### Scaling strategy

- **PG**: vertical primary, horizontal replicas. Adding a replica is a planned op via the operator's reconciler.
- **PgBouncer**: horizontal HPA on CPU 60% or connection count. Stateless; scales freely.
- **Backups**: independent of replicas; one CronJob per cluster.

### Operational considerations

- **Storage growth**: pre-provision 30% headroom; AWS EBS supports online expand (no downtime).
- **PVC retention**: `persistentVolumeReclaimPolicy: Retain` so an accidental delete doesn't lose data.
- **Pod termination**: `terminationGracePeriodSeconds: 60` + `preStop: pg_ctl stop -m fast`. Never `-m immediate` (no recovery write).
- **Node draining**: PDB ≥ 30% so a node drain can't take all PG replicas at once.

In a real prod cluster we'd use **CloudNativePG** instead of this hand-rolled manifest — it adds automated failover, PITR, cluster-aware scaling, and continuous backup management.

---

## PART 25 — Multi-Region Strategy

(Recap Step 10 §11.)

| Region | Role |
|---|---|
| us-east-1   | Primary writer; serves N. America + LatAm reads |
| eu-west-1   | Async warm standby; serves EU reads; GDPR data-residency for EU tenants pinned here |
| ap-south-1  | Async warm standby; serves APAC reads |

### Replication

- WAL streaming across regions; lag target < 5 s.
- App routes writes to primary region by default; reads to nearest region.
- Per-tenant region pinning for GDPR (EU tenants' data physically stays in eu-west-1).

### Read replicas globally

Each region has its own pool of replicas. The app's `database_url_replica` is regional. Cross-region reads pay egress and are reserved for analytics workloads with relaxed latency budgets.

### Latency

- US users → us-east-1 origin: ~30 ms RTT.
- EU users → eu-west-1 origin: ~30 ms RTT.
- APAC users → ap-south-1 origin: ~50 ms RTT.

### Failover

If us-east-1 goes down:

1. GeoDNS removes the region.
2. Promote eu-west-1 standby to primary (manual confirm; RTO ≤ 60 min).
3. App's `database_url` flips via config rollout (no code change).
4. Replication resumes outward to the new primary.

---

## PART 26 — Testing

### Test database

The CI workflow brings up `postgres:16-alpine` as a service container with the same `init.sql` and a stripped-down `postgresql.conf`. Tests connect via:

```
DATABASE_URL=postgresql+asyncpg://seosuite:seosuite_dev_pw@localhost:5432/seosuite
```

### Transactional testing

Per-test isolation via savepoints:

```python
@pytest.fixture
async def db_session():
    async with engine.begin() as conn:
        async with AsyncSession(bind=conn, expire_on_commit=False) as session:
            await session.begin_nested()                     # SAVEPOINT
            yield session
        await conn.rollback()                                # discard all writes
```

Each test sees a clean DB without truncating tables — orders of magnitude faster.

### Migration testing

```bash
# CI step: applies every migration on a clean DB; then downgrades to base.
alembic -c alembic.ini upgrade head
alembic -c alembic.ini downgrade base
```

Catches reversibility bugs early.

### Performance testing

```bash
# Locust scenario for write throughput
locust -f tests/performance/db_ingest.py --headless -u 200 -r 50 --run-time 5m
```

Targets:

- COPY batch ingest: ≥ 50k rows/s per worker.
- Single-row insert via HTTP: ≥ 2k rps at p95 < 50 ms.
- Dashboard composite read (cache hit): p95 ≤ 8 ms.
- Dashboard composite read (cold): p95 ≤ 300 ms.

---

## PART 27 — Dev Workflow Commands

```bash
# From seo-suite/
make up                              # docker compose up -d
make ps                              # service status

make migrate                         # alembic upgrade head
make revision m="add domains"        # autogenerate a new migration

make logs s=postgres                 # tail postgres logs
make logs s=pgbouncer
make shell-api                       # bash into api container

# Direct psql
psql "postgresql://seosuite_migrator:seosuite_migrator_dev_pw@localhost:5432/seosuite"
psql "postgresql://seosuite_app:seosuite_app_dev_pw@localhost:6432/seosuite"      # via pgbouncer
psql "postgresql://seosuite_ro:seosuite_ro_dev_pw@localhost:6432/seosuite_ro"

# Backups
docker compose exec pg-backup /usr/local/bin/backup.sh
ls -lh seo-suite/backups/postgres/

# Restore from a dump
pg_restore --clean --if-exists --no-owner --no-privileges \
           --dbname="postgresql://seosuite_migrator:…@localhost:5432/seosuite" \
           seo-suite/backups/postgres/20260513T030000Z_seosuite.dump

# Reset DB (DESTRUCTIVE — local only)
make down
docker volume rm seo-suite_pg_data
make up

# Inspect pool state
psql -h localhost -p 6432 -U seosuite_migrator pgbouncer -c "SHOW POOLS;"
psql -h localhost -p 6432 -U seosuite_migrator pgbouncer -c "SHOW STATS;"
```

### Daily routine

```
1. git pull
2. make up
3. make migrate
4. uvicorn app.main:app --reload      # or `make be-dev`
5. open http://localhost:8000/docs
```

When you change a model:

```
1. edit app/models/<name>.py
2. import it in alembic/env.py (or app/models/__init__.py)
3. make revision m="describe the change"
4. review alembic/versions/<file>.py
5. make migrate
6. commit both the model change + the generated migration
```

---

**STEP 12 POSTGRESQL SETUP COMPLETED**

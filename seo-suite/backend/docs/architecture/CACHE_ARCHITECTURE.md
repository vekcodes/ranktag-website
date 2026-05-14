# RankedTag SEO Platform — Cache Architecture (Step 9)

Production-grade distributed caching infrastructure powering every read-heavy surface on the platform: Domain Authority lookups, backlink queries, SEO scores, dashboard widgets, API responses, historical analytics, export downloads, and worker coordination.

> **Scope.** Cache substrate + caching contracts. Every part is concrete: real Redis topology, real key prefixes, real TTLs, real invalidation triggers. No code.
>
> **Audience.** Backend, infra, SRE, on-call.
>
> **Relationship to prior steps.** Step 6 §19 defined what should be cached at the API edge. Step 7 §10–§11 defined crawler-specific caches (robots, politeness). Step 8 §4 defined the broker/cache cluster split. This step defines the **platform-wide cache substrate** and the contracts every consumer (API, workers, dashboard) must follow.

---

## Table of Contents

1. [Cache Topology & How It Fits the Platform](#part-1--cache-topology--how-it-fits-the-platform)
2. [Multi-Layer Cache System](#part-2--multi-layer-cache-system)
3. [Redis Architecture](#part-3--redis-architecture)
4. [SEO Metrics Cache](#part-4--seo-metrics-cache)
5. [Backlink Query Cache](#part-5--backlink-query-cache)
6. [API Response Caching](#part-6--api-response-caching)
7. [Query Cache (DB-Layer)](#part-7--query-cache-db-layer)
8. [Cache Invalidation](#part-8--cache-invalidation)
9. [Cache Warming](#part-9--cache-warming)
10. [Distributed Cache Coordination](#part-10--distributed-cache-coordination)
11. [Cache Key Strategy](#part-11--cache-key-strategy)
12. [TTL Strategy](#part-12--ttl-strategy)
13. [Compression & Serialization](#part-13--compression--serialization)
14. [Historical Data Cache](#part-14--historical-data-cache)
15. [Dashboard Cache](#part-15--dashboard-cache)
16. [Worker Cache Coordination](#part-16--worker-cache-coordination)
17. [File & Export Cache](#part-17--file--export-cache)
18. [Cache Monitoring](#part-18--cache-monitoring)
19. [Scalability Strategy](#part-19--scalability-strategy)
20. [Fault Tolerance](#part-20--fault-tolerance)
21. [Security Hardening](#part-21--security-hardening)
22. [Performance Optimization](#part-22--performance-optimization)
23. [Testing Architecture](#part-23--testing-architecture)
24. [Deployment Topology & Folder Structure](#part-24--deployment-topology--folder-structure)

---

## PART 1 — Cache Topology & How It Fits the Platform

### 30,000-ft view

```
                ┌──────────────────────────────────────────────────────────┐
                │                  Client (browser / SDK)                  │
                │  L4: HTTP cache (Cache-Control, ETag, If-None-Match)     │
                └──────────────────────┬───────────────────────────────────┘
                                       │
                                       ▼
                ┌──────────────────────────────────────────────────────────┐
                │                  CDN (Cloudflare / Fastly)               │
                │   L3: edge cache for public GETs + static OpenAPI/SDKs   │
                └──────────────────────┬───────────────────────────────────┘
                                       │
                                       ▼
                ┌──────────────────────────────────────────────────────────┐
                │                   API Gateway (FastAPI)                  │
                │   L0: in-process LRU (process-local; ~5–10 ms hot path)  │
                │   L1: node-local Redis (sidecar, ~0.3 ms; optional)      │
                └──────────────────────┬───────────────────────────────────┘
                                       │
                                       ▼
                ┌──────────────────────────────────────────────────────────┐
                │           L2: redis-cache cluster (primary)              │
                │   • response cache  • query cache  • metrics cache       │
                │   • dashboard cache • dedup / locks • backlinks pages    │
                └──────┬──────────────────────────────────────────┬────────┘
                       │ miss                                     │ events
                       ▼                                          ▼
                ┌──────────────────────┐               ┌─────────────────────┐
                │  Postgres (state)    │               │  Event Bus (Kafka)  │
                │  ClickHouse (analyt.)│               │  cache.invalidate.* │
                │  OpenSearch (search) │               │  page.fetched, etc. │
                └──────────────────────┘               └─────────────────────┘
                                                                  │
                                                                  ▼
                                                       ┌─────────────────────┐
                                                       │ Cache Coordinator   │
                                                       │ • invalidator       │
                                                       │ • warmer            │
                                                       │ • compactor         │
                                                       └─────────────────────┘
```

### Layer responsibilities

| Layer | Lives in | TTL band | Hit latency |
|---|---|---|---|
| **L4 — Client HTTP** | browser / SDK    | response-driven | 0 ms (revalidate ~30 ms) |
| **L3 — CDN edge**    | Cloudflare/Fastly| seconds – hours  | 5–30 ms |
| **L2 — Redis cluster** | redis-cache cluster | seconds – days | 0.5–2 ms |
| **L1 — Node-local Redis** (optional) | sidecar on each app pod | seconds – minutes | 0.1–0.3 ms |
| **L0 — In-process LRU** | each app process | seconds | sub-µs |

### Two Redis clusters, never one

(Same rule as Step 8 §4.)

```
redis-broker        # Celery / queue infrastructure (Step 8)
redis-cache         # this document — all caching workloads
```

A spike in cache traffic must not slow task delivery. A queue meltdown must not blow away the cache. They run side by side, **never sharing** memory budgets, ACLs, persistence policies, or maintenance windows.

### How layers communicate

| Path | Mechanism |
|---|---|
| L4 ↔ L3   | HTTP Cache-Control + ETag |
| L3 ↔ Gateway | Origin pull; CDN purge API on invalidation |
| L0 ↔ L2   | read-through with `request_coalesce` (Part 10) |
| L1 ↔ L2   | optional; populated by L2 misses on the same node |
| L2 ↔ DB   | read-through + write-around (default); write-through where staleness is unacceptable (Part 10) |
| Invalidator ↔ L2 | Kafka subscriber → Redis `DEL` / `UNLINK` / version bump |
| Warmer ↔ L2  | scheduled SET / async refresh on near-expiry |

### Key principle: the cache is a **read amplifier**, not a source of truth.

Every cached value can be recomputed from a system of record. Cache loss is a **latency event**, never a **correctness event**. Every cache miss path is exercised continuously; cold-start performance is measured weekly so we don't accidentally rely on the cache being warm.

---

## PART 2 — Multi-Layer Cache System

### Layer-by-layer

#### L0 — In-process LRU

Per-process bounded LRU (typically `cachetools.TTLCache` size 10,000, TTL 30–60 s) for **derived, deterministic** results that are expensive to recompute every request:

- Parsed JWT claims (TTL = token remaining lifetime, max 60 s)
- Org plan + feature flags (TTL 30 s)
- Routing tables (TTL 5 min, refreshed in background)
- Pydantic model instances for hot schemas

Never holds DB rows or user data per-request. Worker restart = empty L0; that's fine.

#### L1 — Node-local Redis sidecar (optional)

A `redis:7-alpine` sidecar bound to the pod's localhost. Lifetime tied to pod. Used when:

- Cross-process sharing inside one pod is useful (multi-worker uvicorn).
- L2 RTT becomes the bottleneck (rare; only on extremely chatty endpoints).

We default to **L1 off** and only enable per-deployment when measurement justifies it.

#### L2 — Redis cluster (primary cache)

The workhorse layer. Sharded, replicated, persistent. Every cached object that isn't trivial process-local lives here.

#### L3 — CDN edge cache

Used **only** for genuinely public, non-authenticated responses:

- `/api/v1/billing/plans`
- `/openapi/*.json`
- `/docs`, `/redoc` static assets
- The unauthenticated `/api/v1/domains/{public-domain}` "preview" endpoint (rate-limited public lookup)
- SDK and asset downloads

Authenticated responses are **never** at the CDN. The `Vary: Authorization` rule is too risky on shared edges; we set `Cache-Control: private` and don't rely on CDN.

#### L4 — Client HTTP cache

For dashboard XHRs and SDK calls:

```
Cache-Control: private, max-age=30, stale-while-revalidate=300
ETag: "v3:dom:example.com:71a8f"
```

Clients revalidate with `If-None-Match`; 304 saves bandwidth and CPU.

### Which layer caches what

| Resource | L0 | L1 | L2 | L3 | L4 |
|---|---|---|---|---|---|
| JWT claims                          | ✓ |  |  |  |  |
| Org plan / flags                    | ✓ |  | ✓ |  |  |
| Domain summary (auth)              |   |  | ✓ |  | ✓ |
| Domain summary (public)            |   |  | ✓ | ✓ | ✓ |
| Backlinks page (cursor + filter)   |   |  | ✓ |  |  |
| Anchor distribution                 |   |  | ✓ |  |  |
| Dashboard payload (project)        |   |  | ✓ |  | ✓ |
| Plan catalog                        |   |  | ✓ | ✓ | ✓ |
| Audit summary                      |   |  | ✓ |  | ✓ |
| Historical timeseries              |   |  | ✓ |  | ✓ |
| Export download URL                |   |  |   |  |  | ← signed S3 URL, no Redis layer needed
| Robots.txt parsed                  |   |  | ✓ |  |  |
| Politeness state                   |   |  | ✓ |  |  |

---

## PART 3 — Redis Architecture

### Cluster topology

```
redis-cache cluster
  6 primary shards × 2 replicas (12 nodes total at base scale)
  16384 slots distributed evenly
  AOF + RDB persistence on all primaries
  TLS-only inbound; ACLs per consumer class (Part 21)
  separate K8s StatefulSet from redis-broker
```

Headroom rules:

```
target memory headroom:        ≥ 25% per shard
target CPU headroom:           ≥ 40% per node
maxmemory-policy:              allkeys-lru
maxmemory:                     75% of pod limit
hashes/lists/streams compaction enabled
```

### Why cluster (not Sentinel)

Sentinel gives HA but **not** sharding — we'd be capped at a single node's memory + ops/s. With per-tenant fan-out at scale (10M domains, billions of backlink-page cache keys), cluster is mandatory. Sentinel-style HA is still present **within** the cluster: each primary has 2 replicas with automated failover.

### Persistence

```
appendonly:                yes
appendfsync:               everysec      # 1s durability window
auto-aof-rewrite-percentage: 100
save:                      "300 100"     # RDB on 100 changes / 5 min
```

We accept up to 1 second of cache-write loss on a crash — recomputing is cheap. Persistence exists primarily for fast warm restarts (avoid stampedes on cold reboot), not strict durability.

### Replication

Primary → 2 replicas in different AZs. Read traffic optionally served from replicas for **idempotent reads** via tagged keys (`{ro}` prefix); writes always go to primary. Failover ~10 s, transparent to clients using the cluster client library.

### Pub/Sub

Used for **cache-coordination signals** (Part 8 invalidation hand-off), not for primary event bus duties (Kafka owns that). Channels:

```
ch.cache.invalidate.<resource>           # tag-based fanout
ch.cache.version_bump                    # version key rotations
ch.cache.warm.<resource>                 # warmer coordination
```

Pub/Sub is fire-and-forget. Subscribers reconnect on disconnect and resync from a "since" cursor via Kafka — Pub/Sub is the fast path, Kafka the durable path.

### Namespace strategy

Top-level prefixes carve the keyspace by **consumer** so we can apply ACLs, monitor cardinality, and migrate independently:

```
api:*       — API response cache
qry:*       — DB query result cache
seo:*       — SEO scores (DA/DR/trust/spam)
bl:*        — backlinks (paged, anchors, filters)
ref:*       — referring domains
dash:*      — dashboard widgets + projects
hist:*      — historical timeseries
audit:*     — audit summaries + issue caches
robots:*    — robots.txt parsed (Step 7)
host:*      — politeness state (Step 7)
warm:*      — warmer state
ver:*       — version pointers
tag:*       — tag indexes
lock:*      — distributed locks (cache-only; queue-side locks live in redis-broker)
sw:*        — single-flight (request coalescing)
inflight:*  — in-progress markers
```

### Key naming convention (Part 11 expands)

```
<namespace>:<version>:<resource>:<id>[:<facet>]
```

Examples:

```
seo:v3:dom:example.com:summary
bl:v3:tgt:01HZ…:filt:9fa3:cur:eyJ…
api:v2:domains:example.com:summary
qry:v1:backlinks_count:01HZ…:filt:9fa3
dash:v2:org:01HZX…:proj:01HZX…:home
hist:v1:dom:example.com:da:30d
```

### TTL policies

Set per namespace; per-key overrides for atypical cases. See Part 12 for the full table.

### Memory optimization

- **`hash-max-listpack-entries 512`** and **`zset-max-listpack-entries 128`** so small structures stay in compact encoding.
- **`set-max-intset-entries 512`** for numeric sets.
- **HyperLogLog** for cardinality estimates (top-N hosts seen, etc.).
- **No giant strings**: any value > 256 KB is stored in S3 with the Redis value being a pointer + ETag.
- **No long lists**: pagination state uses cursors + sorted sets, not list slicing.

---

## PART 4 — SEO Metrics Cache

### What's cached

| Score | Key | TTL fresh | TTL SWR | Source |
|---|---|---|---|---|
| Domain Authority    | `seo:v3:dom:{d}:da`    | 15 min | 24 h | scoring service |
| Domain Rating       | `seo:v3:dom:{d}:dr`    | 15 min | 24 h | scoring service |
| Trust score         | `seo:v3:dom:{d}:trust` | 1 h    | 24 h | scoring service |
| Spam score          | `seo:v3:dom:{d}:spam`  | 1 h    | 24 h | scoring service |
| Audit composite     | `seo:v3:dom:{d}:audit` | 1 h    | 12 h | audit aggregator |
| Referring domains count | `seo:v3:dom:{d}:rd_count`  | 5 min  | 1 h | ClickHouse rollup |
| Backlinks count     | `seo:v3:dom:{d}:bl_count`  | 5 min  | 1 h | ClickHouse rollup |
| Composite summary card | `seo:v3:dom:{d}:summary` | 15 min | 24 h | composed read-through |

### Freshness tracking

Each entry is stored as a small hash:

```
HSET seo:v3:dom:example.com:summary
   value      <msgpack>
   computed_at 1715582000
   expires_at  1715582900
   version    3
   sources    "scoring=v2.1,bl_rollup=v1.7"
```

`expires_at` is the fresh deadline. `EXPIREAT` is set to `fresh + swr`. Readers compute "fresh / stale" from `computed_at`; stale reads trigger a background refresh (Part 10).

### Incremental updates

When the scoring service recomputes DR for a domain:

1. Write to `seo:v3:dom:{d}:dr` with new `computed_at`.
2. **Bump** the composite summary's version: `INCR ver:seo:dom:{d}` — readers detect their cached summary is stale.
3. Emit `cache.invalidate.dom {d}` (Kafka) for downstream subscribers (dashboard widgets, API response cache).

This pattern means we **never bulk-invalidate** all metrics for a domain on a small change; only the affected score and the summary version pointer move.

### Background refresh

Top-N domains (top 10k by traffic + every actively-watched domain on a paying project) are refreshed by the warmer (Part 9) **before** their TTL expires. The remainder use stale-while-revalidate on read.

### Cache hydration

On a fresh deploy or major incident, the orchestrator can run:

```
maintenance.warm_seo_top10k
maintenance.warm_seo_watched_domains
```

These iterate Tranco-top-10k + every domain in `projects.watched_domains` and prime the cache. Completes in ~5 min at the default warmer parallelism.

### Optimization

- **Pipelining**: composite summary built with one `HMGET` across {da, dr, trust, spam, rd_count, bl_count} in a single round trip.
- **Co-location**: all keys for a single domain share a hash tag `{d}` so they live on one slot — composite reads are single-RTT.

```
seo:v3:dom:{example.com}:summary
seo:v3:dom:{example.com}:da
seo:v3:dom:{example.com}:dr
```

(Redis Cluster hashes on the content inside `{…}` only.)

- **Read DB load**: with these caches, scoring DB pressure drops to ≤ 1% of unauthenticated request volume.

---

## PART 5 — Backlink Query Cache

Backlink datasets are large (target tables of 100M+ rows). Cache effectiveness here is the difference between a usable product and a slow one.

### What's cached

| Query | Key shape | TTL | Notes |
|---|---|---|---|
| Page of backlinks (cursor + filter) | `bl:v3:tgt:{t}:filt:{fh}:sort:{sh}:cur:{ch}` | 5 min | strict cursor-aware |
| Anchor distribution                 | `bl:v3:tgt:{t}:anchors` | 1 h    | recomputed on ingest batches |
| Anchor by type breakdown            | `bl:v3:tgt:{t}:anchors:by_type` | 1 h | |
| Toxic backlinks page                | `bl:v3:tgt:{t}:tox:cur:{ch}` | 1 h | |
| Backlink trends                     | `bl:v3:tgt:{t}:trend:{window}` | 30 min | |
| New backlinks (window)              | `bl:v3:tgt:{t}:new:{from}:{to}:cur:{ch}` | 10 min | |
| Lost backlinks (window)             | `bl:v3:tgt:{t}:lost:{from}:{to}:cur:{ch}` | 10 min | |
| Total estimate                      | `bl:v3:tgt:{t}:estimate` | 15 min | "≥1.2M" form |

### Filter-aware caching

```
fh = filterHash      # blake2b(canonical_json(filter_subset))   16 bytes
sh = sortHash        # blake2b(canonical_json(sort_clause))      8 bytes
ch = cursor (opaque) # already HMAC-signed (Step 6 §13)
```

Cache keys include both `filterHash` and `sortHash` so different queries don't collide and a filter change implicitly invalidates the old cache line by missing.

### Paginated caching

Each page is a separate cache entry. A 50-row page is ~30–80 KB compressed. We cap cache entries at 200 KB after compression; pages larger than that bypass cache (rare).

### Cursor-aware caching

Cursors are stable for the duration of the filter+sort. The cache stores the page **and** the next cursor together so a client deep-paginating gets cache hits along the trail.

### Compressed caching

Backlink page payloads are stored as **msgpack + zstd level 3**. Typical compression ratio 4–6× on backlink rows. Worker libraries decode lazily on demand.

### Invalidation

Triggered by:

```
backlinks.batch.ingested {target}       → bump ver:bl:tgt:{t} → all bl:v3:tgt:{t}:* logically stale
backlinks.refresh.completed {target}    → same
crawler.job.completed where target ∈ project.watched_domains → same
```

We use **version-key bumping** rather than scanning + `DEL` (Part 8 explains why).

### Optimization

- **Estimate, never exact count**: count queries use cached HyperLogLog or `bl_count` rollups. We never run `SELECT count(*)` on a 100M-row table at request time.
- **Cold-page degradation**: if `bl:v3:tgt:{t}:*` is mass-stale (after invalidation storm), the first 10 page requests for `{t}` are coalesced (Part 10) and a single underlying query repopulates them.
- **Top-N targets pre-warmed**: warmer warms top-100k targets every hour for their first 3 pages with default sort/filter.

---

## PART 6 — API Response Caching

### Route-based caching

Per-route declarative cache config:

```
GET /api/v1/domains/{d}              public+SWR fresh=900 swr=86400  vary=accept-language
GET /api/v1/domains/{d}/summary      private+SWR fresh=900 swr=86400 vary=org
GET /api/v1/domains/{d}/history      private+SWR fresh=300 swr=3600
GET /api/v1/backlinks?…              private+SWR fresh=300 swr=600
POST /api/v1/backlinks/query         private+SWR fresh=300 swr=600   key=body_hash
GET /api/v1/billing/plans            public      fresh=3600          edge-cacheable
GET /api/v1/projects/{p}/dashboard   private+SWR fresh=30  swr=300
GET /api/v1/audits/{id}/summary      private+SWR fresh=60  swr=600
GET /api/v1/jobs/{id}                no-store                          (Step 6 §15)
GET /openapi/*.json                  public      fresh=3600          edge-cacheable
```

### Query-key caching

Cache key composition:

```
api:v2:<route>:<arg_hash>:<filter_hash>:<vary_hash>
```

- `route` is the templated path.
- `arg_hash` covers path params.
- `filter_hash` covers query string + body (for POST `/query` endpoints).
- `vary_hash` covers `vary` dimensions (org, locale, plan-tier projection).

POST endpoints become cacheable when the route is marked `idempotent` and the request body hashes deterministically.

### ETag support

For SWR-cacheable routes, response includes:

```
ETag: "v3:dom:example.com:summary:71a8f"
Cache-Control: private, max-age=900, stale-while-revalidate=86400
```

`If-None-Match` reduces hit cost to a `HEAD`-style lookup: gateway looks up the ETag in L0 + L2 in O(1), 304s without rebuilding payload.

### Stale-while-revalidate

Implementation:

```
on read:
  v = L2.get(key)
  if v is fresh:                          # computed_at + fresh > now
       return v
  if v is stale-within-swr:
       schedule_refresh(key, builder)     # background Celery task on q.warm
       return v + header "Age: <stale_age>"
  if absent / past swr:
       acquire single-flight lock         # Part 10
       v = builder()
       L2.set(key, v, fresh=…, swr=…)
       return v
```

Background refresh is rate-limited per key (one refresh in-flight at a time per (key, version)).

### Response compression

Brotli preferred at the edge (CDN/gateway) on responses > 1 KB. Cache **stores compressed** payloads — gateway streams them to clients that accept `br` without recompressing.

### Cache headers strategy

```
public, max-age=N, s-maxage=N, stale-while-revalidate=M
private, max-age=N, stale-while-revalidate=M
no-store                       # job state, anything with secrets
no-cache                       # forces revalidation
Vary: Accept-Encoding, Accept-Language, Authorization (private only)
ETag: "..."
Age: <seconds>                 # set when SWR-serving
Surrogate-Key: dom:example.com bl:tgt:example.com   # CDN tag-based purge
```

CDN purges are tag-driven via `Surrogate-Key` headers and provider-specific purge APIs.

---

## PART 7 — Query Cache (DB-Layer)

### Cache aggressive aggregations

ClickHouse can answer most queries fast, but **dashboard latency targets** (≤ 100 ms p95 for widget loads) require pre-computation. We use three tactics together:

1. **Redis query cache** — short-TTL Redis-side cache keyed on `(query_hash, args_hash)`.
2. **Materialized views** — ClickHouse `MATERIALIZED VIEW` for hot rollups (per-domain backlink counts, per-target referring-domain counts, daily DA/DR snapshots).
3. **Precomputed metrics tables** — `domain_metrics_daily`, `target_backlink_rollup_hourly` — written by analytics workers.

### Redis query cache

```
qry:v1:backlinks_count:{target_id}:filt:{fh}              ttl=5min
qry:v1:rd_count_by_country:{target_id}                    ttl=15min
qry:v1:anchor_dist:{target_id}                            ttl=1h
qry:v1:da_trend:{domain}:30d                              ttl=15min
qry:v1:tld_dist:{target_id}                               ttl=1h
qry:v1:graph_nodes:{target_id}:capped500                  ttl=15min
```

Stored as msgpack + zstd. Each entry includes the source query version (so a query change forces re-hydration).

### Materialized views

Refreshed by ClickHouse engine on insert. We design them to be **append-friendly** (no aggregates that require global recompute on insert). Examples:

```
mv_rd_per_target_hourly      (target_id, hour, rd_count) — incremental
mv_bl_status_per_target_d    (target_id, day, live, lost, new) — incremental
mv_dr_history_daily          (domain, day, dr) — incremental
```

### Precomputed metrics

Heavier computations that can't be materialized incrementally (e.g. PR-style domain authority) run as scheduled batch jobs (Step 8 §10):

```
analytics.recompute_DA_DR    daily 01:00 UTC          writes domain_metrics_daily
analytics.usage_rollup       every 15 min             writes usage_15m
analytics.cost_attribution   hourly                   writes cost_hourly
```

The **read path** consults Redis qry cache → precomputed table → materialized view → raw table, in that order. The raw table is reached on near-empty cache + cold rollups.

### Dashboard speed

A typical dashboard widget reads from `qry:v1:*` with p95 ≤ 5 ms (Redis hit) or ≤ 50 ms (rollup table). The raw-data path is **never** on the dashboard hot path.

---

## PART 8 — Cache Invalidation

### Invalidation taxonomy

| Pattern | When to use |
|---|---|
| **TTL expiry**            | default; freshness tolerated |
| **Versioned keys**        | bulk logical invalidation without scans |
| **Tag-based purge**       | grouping unrelated keys under a shared tag |
| **Event-driven `DEL`**    | small, targeted invalidations |
| **Dependency invalidation** | derived caches that depend on inputs |

### Versioned keys (preferred for bulk)

Two-key indirection:

```
read:
  v = GET ver:bl:tgt:{t}                       # current version (e.g. "37")
  key = bl:v3:tgt:{t}:v37:filt:{fh}:…
  payload = GET key

invalidate-all-for-target:
  INCR ver:bl:tgt:{t}                          # bumps to 38
  (old keys age out naturally via TTL)
```

Trade-off: never `SCAN`+`DEL` huge keyspaces (slow, blocks). Bump a single counter; readers next time use a new key. Memory cost is bounded by TTL on old keys.

### Tag-based invalidation

Per-resource we maintain inverse indexes:

```
tag:dom:example.com    SET of cache keys touching example.com
```

When something changes:

```
SMEMBERS tag:dom:example.com   →  keys[]
UNLINK keys[]                   # non-blocking delete
DEL tag:dom:example.com
```

`UNLINK` is async free vs blocking `DEL` — important on big tag sets.

We only build tag sets for **bounded, useful** scopes — never tag every backlink page individually. Tags exist at the resource level: `tag:dom:{d}`, `tag:target:{t}`, `tag:project:{p}`, `tag:org:{o}`.

### Event-driven invalidation

Subscriber on Kafka `cache.invalidate.*`:

```
cache.invalidate.dom {d}
  → INCR ver:seo:dom:{d}
  → INCR ver:bl:tgt:{d}                 (if d is a backlink target)
  → UNLINK on tagged response keys      (api:v2:domains:{d}:*)
  → CDN purge on Surrogate-Key dom:{d}  (if public-cached)

cache.invalidate.project {p}
  → UNLINK dash:v2:org:*:proj:{p}:*
  → CDN purge Surrogate-Key proj:{p}

cache.invalidate.org {o}
  → bulk: bump ver:dash:org:{o}
```

Events flow from the workers / scoring service that actually changed data — invalidation isn't speculative.

### Dependency invalidation

Composite caches declare their dependencies in metadata:

```
dash:v2:org:{o}:proj:{p}:home
  depends_on: project:{p}, domain:{d}, audit:{aid}
```

The invalidator resolves the dependency graph on relevant events:

```
audit.completed {aid}  →  invalidate everything depending on audit:{aid}
                          which includes dashboard widgets that show audit score
```

Graph held in Redis as `dep:in:{node}` and `dep:out:{node}` reverse-indexes.

### How stale cache is prevented

1. **Write path always invalidates first** — scoring service: `compute → INCR version → write fresh value → emit event`. Readers always see either old (about to be replaced) or new.
2. **Read SWR includes max stale bound** — past `swr` deadline the cache is treated as cold; reads regenerate. We never serve unbounded-stale.
3. **Version pinning per response** — composite responses include their resolved version in the ETag. A version bump invalidates the ETag automatically.
4. **No infinite caches** — every key has a TTL, including version pointers (90 days, refreshed on use).

---

## PART 9 — Cache Warming

### What gets warmed

| Bucket | Schedule | Source |
|---|---|---|
| Top 10k domains (Tranco)        | every 1 h | Tranco list snapshot |
| Watched domains (paying tiers)  | every 30 min | projects.watched_domains |
| Top 100k backlink targets       | every 6 h | usage stats |
| Active job projections          | continuous (event-driven) | crawl.job.* events |
| Dashboard widgets (active orgs) | every 5 min during business hours | `orgs.last_active_at` |
| Plan catalog                    | on change + every 1 h | billing service |
| Robots.txt for top 10k hosts    | every 1 h | Tranco-derived |

### Warmer worker

A `cache-warmer` deployment running on the queue substrate (Step 8). Tasks:

```
warm.seo_metrics(domain)       — recompute DR/DA/Trust/Spam and store in cache
warm.backlinks_first_pages(target, n_pages=3, default_filter+sort)
warm.dashboard_widgets(org_id, project_id)
warm.history_30d(domain)
warm.audit_summary(audit_id)
```

Each task is **idempotent**, **rate-limited** per resource, and **deduped** via `dedup:warm:{resource}:{id}` with 1 min uniqueness windows. The warmer never stampedes Postgres/ClickHouse — it uses an explicit concurrency cap (`Semaphore(50)` cluster-wide).

### Predictive warming

Lightweight signal — when a tenant opens a project dashboard, the warmer pre-fetches:

- The project's recent audits' summary.
- Top 5 watched domains' summaries.
- The "new backlinks (last 7d)" page.

Triggered by the API on dashboard entry. Capped at 1 prediction batch per session per 5 min. Cost is bounded; benefit is real (next click in the session is hot).

### Background hydration

After a deploy or cold restart, the warmer iterates a stored "hot key list" (auto-maintained from `seo:hits:1d` Redis counters; top 5% by reads) and prefetches each. Empty-cache p95 latency targets are continuously verified by chaos tests (Part 23) — we don't allow the system to lean on warm cache for SLO compliance.

### Usage-based warming

A read of `seo:v3:dom:{d}:summary` increments `seo:hits:1d:{d}` (Redis HLL? — a counter is fine here, capped). Domains in the top 5% are added to the warmer's rotation automatically. Domains dropping out get a 3-day grace before removal.

### Startup latency

Cold-process L0 is empty; L2 is shared so most reads hit L2. The hot path's first 50 ms after a pod reboots is the only window L0 misses matter — within a minute it's filled. We don't pre-fill L0 from disk on startup.

---

## PART 10 — Distributed Cache Coordination

### Cache stampede prevention

A trio of techniques used together:

1. **Single-flight per key (request coalescing)** — Lua-scripted:

```
acquired = SET sw:{key} <token> NX PX 30000
if acquired:
   build the value
   write the cache
   DEL sw:{key} (CAS on token)
else:
   wait up to 5 s via brief polling (10 ms intervals) for the writer to publish
   on timeout, build locally (small risk of duplicate; bounded)
```

2. **Soft expiration before hard expiration** — readers see "near-expiry" (e.g. 80% of TTL elapsed) and **probabilistically** trigger a background refresh (XFetch algorithm). This staggers refreshes so a popular key doesn't trigger N simultaneous rebuilds at TTL boundary.

```
xfetch:
  remaining = ttl_left(key)
  delta     = compute_cost_estimate (rolling median build time)
  beta      = 1.0
  random    = uniform(0,1)
  if (delta * beta * -log(random)) > remaining:
       trigger background refresh
  return cached value
```

3. **Promise queues** — for very expensive composite builds (org dashboard), waiters subscribe to a Redis Pub/Sub channel and the single builder publishes the result. Bounded by 5 s timeout to local rebuild.

### Distributed locks

Used sparingly. Locks here are **advisory** — the underlying caches are recoverable. Pattern:

```
SET lock:{scope}:{k} <token> NX PX <ttl>
```

For long-running builds (>1 min), we use the same lease pattern as Step 7/8 — lease refresh every 20 s, lease expires automatically on crash.

### Write strategies

| Strategy | When |
|---|---|
| **Read-through**  | default; cache populated on miss by the reader |
| **Write-through** | scoring service: writes DB **then** writes cache **then** emits invalidation event (the cache is part of the write txn semantically) |
| **Write-behind**  | hit counters, view counts — buffered locally, flushed every 30 s |
| **Write-around**  | one-off writes (admin edits) — let the next read re-populate |

We avoid write-behind for any value where loss-on-crash is a customer-visible regression — write-behind is for analytics counters only.

### Read coalescing across pods

A second pod requesting the same key while the first builds **must not** trigger a second build. Hence the single-flight lock + Pub/Sub publish. We measured this on staging: 5,000 simultaneous cold requests for one popular domain result in **1** downstream DB read.

### Cache stampede after invalidation

After a bulk version bump (e.g. backlink ingest), the next read on every cache key for that target misses. We mitigate:

- **Stable warm list** — if the resource is on the warm list, the warmer rebuilds keys preemptively after invalidation events.
- **Soft-stale serving** — readers can serve the *previous* version for up to 30 s post-invalidation while the rebuild lands. Used for non-critical resources (dashboard tiles); never for scores/billing.

---

## PART 11 — Cache Key Strategy

### Anatomy of a key

```
<namespace>:<schema-version>:<resource>:<id>[:<facet>][:filt:<fh>][:sort:<sh>][:cur:<ch>]
```

| Segment | Purpose |
|---|---|
| `namespace`        | top-level consumer (`api`, `seo`, `bl`, `dash`, …) — used for ACLs and metrics |
| `schema-version`   | bumped when the cached value's **schema** changes (a code change) |
| `resource`         | the entity type (`dom`, `tgt`, `proj`, `org`, `audit`, `bl_page`) |
| `id`               | natural ID (domain, ULID, hash) — wrapped in `{…}` when colocation is required |
| `facet`            | sub-resource (`summary`, `da`, `dr`, `anchors`, …) |
| `filt:<fh>`        | filter hash if applicable |
| `sort:<sh>`        | sort hash if applicable |
| `cur:<ch>`         | cursor hash if applicable |

### Versioning

Two version dimensions, both visible in keys:

| Version | Bumped when | Effect |
|---|---|---|
| **Schema version** (`v3`)   | code changes that alter the cached payload shape | global rollover via deploy |
| **Data version**  (`ver:<scope>:<id>`) | data changes (Part 8) | next read uses new key |

Schema rollover policy: keep the previous schema readable for 1 deploy cycle (so rollback is safe), then mass-evict via TTL.

### Namespace isolation

Each namespace has its **own ACL user** on the Redis cluster:

```
ACL user api-gateway     +get +set +unlink +mget +mset +expire +eval ~api:*  ~ver:* ~tag:*  ~sw:*
ACL user scoring-service +get +set +incr   +unlink ~seo:*  ~ver:seo:*  ~tag:dom:*
ACL user warmer          +get +set         ~api:*  ~seo:*  ~bl:*  ~dash:*
```

A compromised gateway can't touch politeness keys in `host:*`; a misbehaving warmer can't touch locks.

### Shard-aware design

Hash tags `{…}` force key colocation:

```
seo:v3:dom:{example.com}:summary
seo:v3:dom:{example.com}:da
seo:v3:dom:{example.com}:dr
seo:v3:dom:{example.com}:trust
seo:v3:dom:{example.com}:spam
```

All five live on one slot — composite reads use `HMGET`/`MGET` on a single primary. We do this only when reads are joined; we **avoid** colocating across resources (would create hot slots).

### Key length budget

Soft cap: 200 bytes. Hard cap: 512 bytes. Hashes (cursors, filter hashes) are encoded as base64url to keep keys short.

### Reserved names

```
ver:*       data version pointers
tag:*       inverse indexes
lock:*      distributed locks
sw:*        single-flight
inflight:*  in-progress markers
warm:*      warmer bookkeeping
```

Application code is never allowed to write directly to these prefixes — there are wrapper helpers (cache SDK) that own them.

---

## PART 12 — TTL Strategy

### Default TTLs by namespace

| Namespace | Fresh | SWR cap | Hard expiry | Notes |
|---|---|---|---|---|
| `api:v2:*`     | per route (Part 6) | per route | fresh+swr | route-declared |
| `seo:v3:dom:*:da/dr` | 15 min | 24 h | 24 h | hot path |
| `seo:v3:dom:*:trust/spam` | 1 h | 24 h | 24 h | |
| `seo:v3:dom:*:summary`   | 15 min | 24 h | 24 h | composite |
| `bl:v3:tgt:*:page:*`     | 5 min | 10 min | 1 h | filter+sort+cursor |
| `bl:v3:tgt:*:anchors`    | 1 h | 6 h | 24 h | |
| `bl:v3:tgt:*:new/lost`   | 10 min | 30 min | 1 h | windowed |
| `bl:v3:tgt:*:estimate`   | 15 min | 1 h | 1 h | "≥N" form |
| `ref:v3:tgt:*`           | 15 min | 1 h | 6 h | |
| `qry:v1:*`               | 5–60 min | varies | 24 h | per-query |
| `hist:v1:*`              | 15 min | 1 h | 24 h | timeseries |
| `dash:v2:*`              | 30 s | 5 min | 5 min | server-composed |
| `audit:v1:*`             | 1 min | 10 min | 1 h | progress: never cache; summary: cached |
| `robots:*`               | 24 h fresh | 7 d SWR | 7 d | per Step 7 |
| `host:*` (politeness)    | bucket-managed; not TTL | — | 1 h | refilled by promoter |
| `ver:*`                  | 90 d (refreshed on use) | — | 90 d | version pointers |
| `tag:*`                  | 7 d (refreshed on use) | — | 7 d | inverse indexes |
| `lock:*`                 | 30–300 s | — | TTL | force-release on crash |
| `sw:*`                   | 30 s | — | TTL | single-flight |
| `warm:*`                 | 1 h | — | 1 h | warmer dedup |

### Freshness balancing

The choice of **fresh window** for each resource trades:

- **Customer expectation** — DR shouldn't visibly jump every minute (15 min is plenty).
- **Recomputation cost** — full DA recompute is expensive (daily batch + incremental); cache fresh 15 min absorbs most reads.
- **Invalidation latency** — event-driven invalidation kicks in within seconds when data actually changes; fresh window is the fallback for missed events.

### Stale tolerance

Each resource declares acceptable stale time (SWR). Past SWR the cache is treated as cold. Stale tolerance is **higher for derived metrics** (DA/DR can be a day stale on the rare event the recompute pipeline lags) and **zero for live state** (job status: `no-store`).

### Cache refresh timing

For SWR-cached resources:

- **At ≥ 50% TTL elapsed**, reads start XFetch-probabilistic refresh.
- **At fresh expiry**, every read triggers a single-flight background refresh.
- **At SWR expiry**, reads block on rebuild (no longer serving stale).

This staircase prevents the canonical "every 15 min, 10k pods stampede the DB" anti-pattern.

---

## PART 13 — Compression & Serialization

### Serialization

| Use | Format |
|---|---|
| Hot small values (counters, scores, flags)  | raw string / int |
| Structured payloads ≤ 1 KB                  | **msgpack** |
| Structured payloads 1–256 KB                | **msgpack + zstd level 3** |
| Anything > 256 KB                           | **S3 + Redis pointer** (must not bloat Redis) |
| Bitsets (Bloom, HLL)                        | native Redis types |

We standardized on msgpack over JSON for caches — smaller, faster, and we already use it in the queue substrate (Step 8 §20).

### Compression

zstd outperforms gzip for backlink rows by ~20% in size and 3–5× in encode speed. Level 3 is the sweet spot: ratio is within 5% of level 9 at 1/10th the CPU cost.

Decompression happens lazily — the cache SDK returns a wrapper that decompresses on first access; for ETag-only revalidation (304s) we don't decompress at all.

### Binary representations

```
Domain scores hash (single-domain compact form):
  HMSET seo:v3:dom:{d}:scores  da 64  dr 71  trust 58  spam 4   computed_at 1715582000  ver 37

Single roundtrip; ~30 bytes wire weight.
```

```
Backlink page (compressed):
  GET bl:v3:tgt:{t}:filt:9fa3:sort:7c:cur:eyJ…
    msgpack-encoded list of rows + cursor metadata
    zstd-level-3 compressed
    typical 50-row page: ~30–80 KB compressed, ~200–400 KB decoded
```

### Bandwidth

Cache reads dominate cross-pod bandwidth. Compression cuts ~70% of egress from `redis-cache`. Decompression is on the application side, not Redis.

### Redis memory impact

A typical production load pre-compression:

```
bl:* keys                   1.2 TB raw  →  ~280 GB compressed
qry:* keys                  120 GB raw  →  ~30 GB compressed
seo:* keys                  20 GB (already compact) — no compression
dash:* keys                 80 GB raw  →  ~18 GB compressed
```

These are the live numbers we plan capacity around.

---

## PART 14 — Historical Data Cache

### What's cached

| Series | Key | Granularity | TTL |
|---|---|---|---|
| DA history (30d, 90d, 365d)        | `hist:v1:dom:{d}:da:{window}`    | daily   | 15 min fresh, 24 h SWR |
| DR history                          | `hist:v1:dom:{d}:dr:{window}`    | daily   | same |
| Backlinks total (30d, 90d, 365d)    | `hist:v1:tgt:{t}:bl_count:{window}` | daily | same |
| New/lost counts per day             | `hist:v1:tgt:{t}:new_lost:30d`   | daily   | 15 min fresh, 6 h SWR |
| Audit issue trend                   | `hist:v1:audit:{aid}:trend`      | run     | 1 h fresh, 12 h SWR |
| Domain growth                       | `hist:v1:dom:{d}:growth:30d`     | daily   | 30 min fresh, 12 h SWR |

### Storage

Each timeseries is stored as a single msgpack array:

```
{
  "domain": "example.com",
  "from":   "2026-04-13",
  "to":     "2026-05-13",
  "interval":"1d",
  "metric": "da",
  "points": [{"t":"2026-04-13","v":62}, … {"t":"2026-05-13","v":64}],
  "computed_at": "...",
  "source_version": "domain_metrics_daily/2026-05-13"
}
```

We **do not** store individual points as separate Redis keys — a single 30-day series is ~1 KB compressed; per-point keys would be pure overhead.

### Aggregation snapshots

Hourly and daily rollups in ClickHouse (`mv_dr_history_daily`) feed the cache. The cache layer never aggregates raw data on the read path.

### Rolling windows

Pre-cached windows: `7d`, `30d`, `90d`, `365d`, `all`. Other windows fall back to building from `domain_metrics_daily` on the fly with single-flight protection.

### Chart rendering

Frontend receives the cached series and renders. Series payloads include enough metadata (`interval`, `metric`, `source_version`) that the client can sanity-check before plotting.

---

## PART 15 — Dashboard Cache

### Composite payload caching

The dashboard endpoint (`/api/v1/projects/{id}/dashboard`, Step 6 §8) returns a single composed payload. Cached at the **composite level**, not per-widget:

```
dash:v2:org:{o}:proj:{p}:home       (composite payload)
   fresh 30 s, SWR 5 min
   built from:
     seo:v3:dom:{d}:summary  (for each watched domain)
     bl:v3:tgt:{t}:new/lost  (recent windows)
     audit:v1:{aid}:summary  (latest audit)
     hist:v1:dom:{d}:da:30d  (mini-trend per domain)
   dependencies declared in dep:in/out (Part 8)
```

### Why composite

- **Network**: one round trip, not 12.
- **Consistency**: all widgets reflect one snapshot.
- **Cache hit ratio**: a 30 s window absorbs typical dashboard re-loads (tab switch, navigation).

### Partial hydration (when composite misses)

If the composite is past SWR but ≥ 60% of its dependent caches are warm, we **build from warm pieces** rather than running cold queries:

```
1. fetch all dependent caches in one MGET
2. for missing pieces, parallel build (with single-flight)
3. assemble composite, store
4. return
```

Net effect: a "cold" dashboard load is rarely fully cold.

### Widget-level caching

For widgets reused **outside** the dashboard (the same DA mini-trend appears on the standalone domain page), the underlying pieces are independently cached. The composite is built from those independent caches — it doesn't duplicate them.

### Incremental updates via WebSocket

Step 6 §16 defines `WS /ws/v1/projects/{p}/events`. The dashboard subscribes; updates push **deltas** (e.g. "new audit completed → score 78") rather than re-loading the composite. Clients merge deltas client-side; the next full-load uses the freshly invalidated cache.

### Real-time speed targets

```
warm composite cache hit      p95 ≤ 8 ms
cold partial rebuild           p95 ≤ 80 ms
cold full rebuild              p95 ≤ 300 ms
```

---

## PART 16 — Worker Cache Coordination

### Shared worker caches

Workers benefit from caching too, especially:

- **Robots.txt** (Step 7) — `robots:*`
- **Politeness state** (Step 7) — `host:*`
- **Deduplication** (Steps 7, 8) — `dedup:*`, Bloom filters
- **Enrichment data** — Tranco rank, GeoIP for IPs, WHOIS cached by domain

These live in `redis-cache` alongside the API caches, in their own namespace with their own ACLs.

### Worker-specific cache patterns

| Cache | TTL | Notes |
|---|---|---|
| `robots:{host}`         | 24 h fresh / 7 d SWR | shared by all fetch/render workers |
| `host:{etld+1}` politeness | bucket-managed | INCR/DECR atomic ops |
| `whois:{domain}`        | 7 d              | external API; expensive |
| `tranco:{domain}`       | 7 d              | top-list snapshot |
| `geoip:{ip}`            | 30 d             | rarely changes |
| `cert:{host}`           | 1 d              | from connection |
| `dns:{host}`            | 5 min            | TTL aware |
| `enrich:{domain}:summary` | 6 h            | composed enrichment cache |

### Temporary per-job cache

Long jobs (audits, bulk crawls) maintain a per-job scratchpad:

```
job:{job_id}:seed_urls         SET
job:{job_id}:visited           SET (used with SADD/SMEMBERS)
job:{job_id}:in_flight         SET
job:{job_id}:checkpoint        HASH
```

All keys TTL = job duration. Wiped automatically on job completion (cleanup task on `q.maintenance`).

### Distributed locks (worker-side)

Same lock primitives as Part 10 — used to prevent duplicate scoring jobs, duplicate exports, etc. Workers always use fenced leases (Step 8) for long work.

### Task deduplication

Already covered in Step 8 §15; the dedup namespace `dedup:*` lives in `redis-cache`, not `redis-broker`, so dedup state survives broker maintenance.

### Worker cache sharing across pods

Workers do not share L0 (in-process). All cross-pod sharing flows through L2. Workers do not run L1 sidecars by default — their cache miss rates are dominated by long-tail unique hosts where L1 wouldn't help.

---

## PART 17 — File & Export Cache

### Object storage as the cache tier

Generated artifacts (CSV/XLSX/PDF reports, large export blobs, audit detail dumps, snapshot HTML) live in **S3 (primary) / R2 (cost-optimized cold tier)**, never Redis.

```
s3://rt-exports/{org_id}/{job_id}/{filename}.{ext}
s3://rt-reports/{org_id}/{report_id}/{date}.pdf
s3://rt-audit-snapshots/{audit_id}/{url_hash}.html.gz
s3://rt-raw-html/{date}/{url_hash}.html.gz       (Step 7)
```

### Redis stores **pointers**, not blobs

```
export:v1:{export_id}                HASH
   status       succeeded
   format       csv
   size_bytes   18 372 102
   etag         "abc…"
   s3_key       s3://rt-exports/.../foo.csv
   signed_url   "https://…"          # short-lived; not the actual cache
   signed_until 1715583600
   completed_at 1715582000
```

The signed URL is regenerated on access (cheap, ~1 ms) — never cached longer than its expiry.

### Signed URLs

- TTL: 24 h max.
- Generated on demand; client never sees a long-lived URL.
- Rate-limited download (per signed URL, per IP): prevents URL-sharing abuse.

### Export expiration

Lifecycle:

| Tier | Live duration | After |
|---|---|---|
| Standard exports     | 7 days (free) / 30 days (pro) / 90 days (biz/ent) | deleted from S3 |
| Scheduled exports    | 30 days rolling                                   | deleted |
| Audit raw snapshots  | 90 days                                           | moved to Glacier (R2 cold) |
| Crawl raw HTML       | 30 days                                           | deleted (Step 7) |

Lifecycle policies enforced at the bucket level; not application logic.

### Storage tiering

```
hot (S3 Standard / R2)         < 90 days, frequent access
warm (S3 IA / R2 cold)         90 d – 1 y, infrequent access
cold (Glacier Deep Archive)    > 1 y; compliance / forensics only
```

The cache **never** points to cold tier — retrieving Glacier objects is a multi-hour async operation, which we surface as a separate `restore_request` flow, not a transparent cache miss.

### CDN cache for downloads

We deliberately **do not** CDN-cache export blobs:

- Per-tenant data; cache pollution risk on shared edges.
- Files are large; bandwidth savings don't justify cache pressure.
- Signed URLs change every 24 h; cache hit rate would be near zero.

Public reports (e.g. a published share link) **can** be CDN-cached behind their own signed-link surrogate.

---

## PART 18 — Cache Monitoring

### Metrics (Prometheus)

```
# hit / miss
cache_hits_total{layer,namespace}
cache_misses_total{layer,namespace}
cache_hit_ratio{namespace}                              (derived dashboard panel)
cache_stale_hits_total{namespace}                       # SWR-served
cache_request_coalesced_total{namespace}                # single-flight saved a build

# performance
cache_get_duration_seconds{namespace}                   (histogram)
cache_set_duration_seconds{namespace}                   (histogram)
cache_compute_duration_seconds{namespace}               (histogram)  # builder cost
cache_payload_bytes{namespace}                          (histogram)

# Redis cluster
redis_memory_used_bytes{shard}
redis_memory_rss_bytes{shard}
redis_evicted_keys_total{shard}
redis_keys{shard}                                       (gauge; sampled)
redis_connected_clients{shard}
redis_ops_per_sec{shard}
redis_latency_seconds{shard,cmd}                        (histogram)
redis_replication_lag_seconds{shard}                    (gauge)

# warm / invalidate
cache_warm_emitted_total{job}
cache_invalidate_total{trigger,scope}
cache_version_bump_total{namespace,resource}

# hot keys
cache_hot_key_ops{namespace,key_class}                  (sampled; key bucketed, never raw)
```

### Cardinality discipline

Label by `namespace`, **never** by raw key. For hot-key inspection use a sampled bucketing classifier (`key_class` like `seo.summary`, `bl.page`, `dash.composite`). Real-time per-key inspection happens via `redis-cli --hotkeys` and Redis Insight, not Prometheus.

### Tracing

Each cache operation has a span attached to the parent request:

```
span: cache.get
  attributes: namespace, layer, hit/miss, swr_stale_age_ms, builder_invoked
```

We tag every API request span with `cache.hits_in_request` and `cache.misses_in_request` for end-to-end attribution.

### Logs

Cache events are **summarized**, not per-op logged. We log:

- Builder errors (always).
- Stampede events when single-flight kicked in for > 100 concurrent waiters.
- Eviction storms (eviction rate above baseline).

### Redis Insight

Used for **on-call deep inspection** only, behind SSO + MFA + IP allowlist. Surfaces top keys by memory, slow commands, replication state. Never relied upon for automated alerting.

### Dashboards

```
Grafana: Cache — Hit Ratios               # per namespace, p50/p95
Grafana: Cache — Latency                  # get/set p95/p99
Grafana: Cache — Stampede                 # coalesced ops, single-flight events
Grafana: Cache — Invalidation             # invalidates/s, version bumps
Grafana: Redis — Cluster Health           # shard memory, evictions, replication lag
Grafana: Redis — Hot Spots                # ops/s skew across shards
Grafana: Cache — Compute Cost             # builder p95 by namespace
Grafana: Cache — Compression Savings      # raw vs compressed bytes
```

### SLOs

```
cache_hit_ratio (seo)            ≥ 0.95
cache_hit_ratio (bl pages)       ≥ 0.70
cache_hit_ratio (dash composite) ≥ 0.90
cache_get p95                    ≤ 2 ms
cache_compute p95 (dash)         ≤ 200 ms (cold)
redis_evicted_keys_total slope   ≤ 100/min sustained
redis_replication_lag p95        ≤ 1 s
```

Multi-window, multi-burn-rate alerts.

---

## PART 19 — Scalability Strategy

### Target envelope

```
peak read throughput:              500k ops/s on redis-cache
peak write throughput:             80k ops/s on redis-cache
distinct cache keys (live):        1B
hot-data memory footprint:         ~600 GB (compressed) across shards
peak concurrent clients:           50k
peak invalidation events:          5k/s
```

### Horizontal scaling

```
add shards by reslotting:
  1. add new primary + 2 replicas (empty)
  2. ASSIGN slots via redis-cli cluster reshard
  3. proxy/client picks up the new topology automatically
  4. migrations are online; minor latency bump during the bucket move
```

Reshard ~1024 slots at a time during off-peak; track latency p99 to catch hot-slot moves.

### Read replicas

Some namespaces are **read-mostly** (`seo:*`, `hist:*`, plan catalog). For those, the cache SDK has a `read_preference="replica"` flag that routes `GET` to the local replica. Writes still go to primary; replication lag is bounded (Part 18).

### Geo-distributed caching

```
us-east-1   primary cluster
eu-west-1   primary cluster (sister; not replica)
ap-south-1  primary cluster (sister)
```

Per-region clusters, **not** cross-region replication. Cross-region cache traffic would be too slow to be useful. Each region warms its own caches from its regional data stores. Cross-region invalidation events flow through Kafka MirrorMaker — there's a small consistency window (≤ 5 s) between regions on invalidation, which is acceptable.

### Cache partitioning

Beyond cluster sharding (slot level), we partition by:

- **Namespace** — heavy namespaces (`bl:*`) can move to their own cluster if needed (rare).
- **Tenant tier** — enterprise tenants' caches are tagged and given memory priority during pressure events (LRU eviction skips them in soft conditions).

### Connection pooling

Each app/worker pod opens a pool of 8 connections to the cluster (one per shard, multiplexed). Connection count bounds: ~50 pods × 8 ≈ 400 connections at peak — well under Redis `maxclients=10000`.

### Backpressure on cache

When `redis_memory_used > 75%`:

- Aggressive `UNLINK` on expired-tag indexes runs immediately (maintenance task `cache.compact`).
- New cache writes for non-paying-tier namespaces are dropped with a metric increment (read-through still works; we just don't store the result).
- Alert SRE; consider reshard.

When `> 90%`:

- All write-around behavior; cache effectively becomes read-only until pressure clears.
- Warmer paused for 10 min.

---

## PART 20 — Fault Tolerance

### Failure modes

| Failure | Detection | Recovery |
|---|---|---|
| Primary shard dies      | cluster gossip; ~10 s | replica promoted; cache SDK retries with backoff |
| Network partition       | client connect errors | reads fall back to DB (read-through); writes queue locally up to 30 s, then drop |
| Persistence corruption  | AOF replay failure on boot | start from RDB; rebuild from DB on demand |
| Replication lag spike   | metric                | reads switch to primary for the affected namespace |
| Cache miss storm        | builder p95 surge     | single-flight + warmer kick in |
| Cache **poisoning** (bad value cached) | error alarms downstream | flush key + version bump; warmer rebuilds |

### Fallback DB queries

The cache SDK exposes:

```
get_or_build(key, builder, opts)
   try cache
   on connect error / timeout: call builder directly; log; do not cache
```

A Redis outage degrades latency, never correctness. The DB is sized to handle a temporary 5× read multiplier (typical cache absorbs ~80% of reads, so a cold Redis means ~5× DB load — survivable for ~30 min).

### Graceful degradation

Tier-based shedding (mirror of Step 8 §14):

- **Cache unavailable on free tier**: serve cached pages older than SWR if any local fallback exists; else return 503 with `Retry-After: 60`.
- **Cache unavailable on pro+**: best effort; DB direct.
- **Enterprise tier**: protected; the SDK reroutes to the standby region's cache if local is dead.

### Replication

Each primary has 2 replicas in different AZs. Automatic failover via cluster bus within 10–15 s. SDK uses cluster topology callbacks to re-route without app intervention.

### Stale cache recovery

After an incident leaves caches in an unknown state:

```
maintenance.cache_evacuate_namespace <ns>      # bump master version for the namespace
maintenance.cache_rebuild_top_keys <ns> N      # warmer drives the top-N keys back
```

A namespace can be fully evicted in < 1 min via version bump (Part 8). Rebuild takes proportional to working set size and DB throughput.

### Cache **corruption**

If a bad value is written (regression in a builder), the version pointer for the namespace is bumped. Old keys age out via TTL; new reads pull fresh values. No need to scan-delete.

---

## PART 21 — Security Hardening

### Network

- TLS 1.2+ on every Redis client connection. Cluster nodes communicate over TLS.
- NetworkPolicy denies all ingress to Redis except from labeled app/worker pods.
- No public IP. Redis is reachable only via the internal service mesh.

### Auth

- `requirepass` per **ACL user**, not a global password.
- Per-namespace ACL users (Part 11). API gateway can't touch `host:*`; warmer can't touch `lock:*`.
- mTLS for service-to-Redis where the deployment supports it.

### Cache poisoning

Risks:

1. **Untrusted input becomes a cache key** — never. Cache keys are constructed from validated, normalized inputs only.
2. **Untrusted input is the cached value** — for SEO data, values come from internal services we trust. For exports / user-uploaded content, the cache stores a **pointer**, not the content, so poisoning is impossible.
3. **Builder bugs cache wrong values** — version bumping makes recovery cheap (Part 20).

### Signed cache payloads

For cross-service handoff caches (e.g. job result cache used by both API and notification worker), payloads are HMAC-signed in the same way as task envelopes (Step 8 §19). Reader verifies signature before deserializing.

### Data leakage

- **Tenant scoping in keys**: every multi-tenant key contains `org_id`. The cache SDK refuses to read a key whose org doesn't match the caller's. This is the cache-layer mirror of the data-layer tenancy predicate.
- **No PII in keys**: emails, names, etc. are hashed (`blake2b(email)` → 16 bytes) when they appear in keys.
- **No PII in values cached for cross-tenant lookups**: where caches are shared across orgs (e.g. domain summary), values contain no per-tenant data.

### Replay protection

Cache writes from untrusted sources are rejected. The cache SDK is only callable from inside the cluster network; producer pods authenticate to Redis via ACL credentials mounted as K8s secrets, rotated weekly.

### Logging

Cache values **never** appear in logs. Cache keys are logged in production only at debug verbosity (gated). Operator inspection in Redis Insight requires audited admin access.

---

## PART 22 — Performance Optimization

### Pipelining

Multi-key composite reads use one round trip:

```
pipe = client.pipeline(transaction=False)
pipe.hmget("seo:v3:dom:{example.com}:scores", "da", "dr", "trust", "spam")
pipe.get("seo:v3:dom:{example.com}:summary")
pipe.get("bl:v3:tgt:{example.com}:estimate")
pipe.execute()
```

Single RTT ~0.5 ms vs three round trips ~1.5 ms.

### Batching

Builders that produce many keys batch their writes:

```
pipe = client.pipeline(transaction=False)
for d, value in scored_domains:
   pipe.set(f"seo:v3:dom:{{{d}}}:dr", value, ex=900)
pipe.execute()
```

Throughput target: a single warm cycle for 10k domains in < 2 s, dominated by builder cost, not Redis writes.

### Lua scripts

Atomic compound operations:

```
lua/get_or_set_swr.lua            # SWR semantics in one round trip
lua/version_bump_and_publish.lua  # INCR version + PUBLISH atomically
lua/single_flight_acquire.lua     # SET NX + token + ttl
lua/single_flight_release.lua     # CAS DEL by token
lua/coalesce_or_wait.lua          # see Part 10
lua/expire_if_older.lua           # TTL only if computed_at older than threshold
```

Scripts are SHA-cached on the cluster; calls use `EVALSHA` for sub-ms execution.

### Async Redis client

`redis-py` with `aioredis` semantics; one connection per worker process, multiplexed across awaiting tasks. Connection reuse is essential at 200 concurrent in-process tasks.

### Optimized serialization

msgpack + zstd (Part 13). Avoid JSON anywhere on hot paths.

### Avoid SCAN on the hot path

`SCAN`/`KEYS` are debug tools, never production. Bulk operations use:

- Version bump (Part 8).
- Tag inverse indexes (Part 8).
- TTL expiry.

### Avoid hot keys

Sharding by **resource ID** spreads load. We avoid putting global counters in Redis (e.g. "total requests today"); aggregate counters live in ClickHouse where they belong.

When a hot key is unavoidable (e.g. a single domain with 1M ops/s), we use **client-side replication** via L0 with short TTL (5 s) — the hot key load drops by the number of pods.

### Connection pool tuning

```
min_connections_per_shard:    2
max_connections_per_shard:    16
idle_timeout:                 300 s
socket_keepalive:             true
socket_keepalive_options:     {1,1,3}   # 3 probes; quick TCP-dead detection
retry_on_timeout:             true (max 1 retry; then surface error)
```

### Cache SDK shape (illustrative contract; no impl here)

```
class Cache:
    async def get_or_build(key, builder, *, fresh, swr, namespace, tags=[]): ...
    async def invalidate_tag(tag): ...
    async def bump_version(scope, resource_id): ...
    async def warm(key, builder, *, fresh, swr): ...
    async def lock(scope, key, *, ttl=30): ...
```

Every consumer goes through this SDK — no raw Redis calls in product code.

---

## PART 23 — Testing Architecture

### Test surfaces

| Surface | Tool | Asserts |
|---|---|---|
| Cache key construction       | pytest                    | namespace, version, hashing stable |
| TTL semantics                | pytest + freezegun        | fresh, SWR, hard-expiry transitions |
| Invalidation                 | pytest                    | tag purge + version bump correctness |
| Stampede prevention          | pytest + concurrent calls | N concurrent reads → 1 builder call |
| Compression / serialization  | pytest                    | round-trip + payload size budgets |
| Builder errors               | pytest                    | builder exceptions never poison cache |
| Cache miss correctness       | pytest                    | every cached path produces identical value on cold cache |
| Redis failover               | docker compose + chaos    | replica promotion is transparent to SDK |
| Replication lag              | toxiproxy                 | reads switch to primary above threshold |
| Multi-region invalidation    | integration               | event flows through MirrorMaker, both regions purge |
| Load                         | Locust                    | 500k ops/s sustained; p95 latency |
| Cold-start                   | scheduled chaos           | weekly cold-cache test; SLO must hold within 5× normal |

### Cache miss correctness — the most important test

Every cached endpoint has a paired test:

```
1. warm cache; capture response A
2. flush all caches
3. recompute; capture response B
4. assert A == B (field-by-field, excluding meta.cache.hit)
```

This prevents "the cache is correct, the cold path drifted" regressions.

### Stampede prevention

```
1. cold cache
2. 5000 concurrent reads of the same key
3. assert: builder invoked exactly once; all 5000 returned identical value
```

### Failover test

Weekly in staging:

```
1. trigger primary shard kill
2. measure: failover time
3. measure: dropped reads (target ≤ 0)
4. measure: write window lost (≤ 1 s acceptable)
5. assert: SDK clients reconnect without app errors
```

### Cold-start chaos

A scheduled chaos test flushes the cache mid-day and measures SLO impact. SLOs must hold within 5× normal — if not, we're leaning on warm cache too hard and need to either increase backend capacity or expand pre-warming.

### Load test

```
locust scenarios:
  - hot domain endpoint at 200k rps; expect ≥ 99% L2 hit
  - mixed dashboard load at 50k rps; expect ≥ 95% composite hit
  - invalidation storm: 10k events/s; measure tail latency on subsequent reads
```

---

## PART 24 — Deployment Topology & Folder Structure

### Container images

```
redis-cache       redis:7.4-alpine + TLS certs                    50 MB
cache-warmer      python:3.12-slim                                180 MB
cache-invalidator python:3.12-slim                                170 MB
cache-compactor   python:3.12-slim                                170 MB
                  (warmer/invalidator/compactor are queue workers; share base)
```

Application pods (API gateway, workers) import the cache SDK from `app/cache` and don't ship a separate container.

### Kubernetes layout

```
namespace: rt-cache

StatefulSet:  redis-cache
  replicas: 6 primary + 12 replica (18 pods total at base scale)
  storageClass: gp3, IOPS provisioned
  volumeClaim:  64 GB per pod (sized for AOF + RDB)
  affinity:     primary/replica in different AZs (podAntiAffinity)
  resources:
    requests:  cpu 1000m, mem 8Gi
    limits:    cpu 2000m, mem 12Gi
  config:
    maxmemory: 9 Gi
    maxmemory-policy: allkeys-lru
    appendonly: yes
    appendfsync: everysec
    cluster-enabled: yes
    tls-port: 6379, port 0
    requirepass: <secret>
    aclfile: /etc/redis/users.acl

Deployment:   cache-warmer
  replicas:   3
  resources:  cpu 250m / 1000m, mem 256Mi / 512Mi
  consumes:   q.warm.*

Deployment:   cache-invalidator
  replicas:   3 (leader-elected; 1 active for ordering)
  consumes:   Kafka cache.invalidate.*
  emits:      Redis DEL/UNLINK + version bumps + Pub/Sub fanout

CronJob:      cache-compactor (daily 03:00 UTC)
  prunes tag inverse indexes, expired version pointers
  emits report to admin dashboard

ServiceMonitor: scrapes redis-cache and cache-* deployments
NetworkPolicy:  deny all inbound except from labeled pods
  - app/api, app/worker, cache-warmer, cache-invalidator
```

### Resource sizing

Per shard primary (base):

```
memory:          9 Gi (out of 12 Gi pod limit; 25% headroom)
cpu:             1 vCPU sustained, 2 vCPU burst
network:         1 Gbps (matters; Redis is network-heavy)
disk:            64 GB NVMe gp3, 6000 IOPS
```

Scales to 12 shards at peak load; ~108 GB of cache capacity total (compressed).

### Autoscaling

Redis cluster is **not** autoscaled — scaling Redis is a careful, planned reshard. Instead:

- Capacity is provisioned with 40% headroom.
- Memory and ops/s metrics drive **alerts to add a shard**, not automatic action.
- The cache-warmer **is** HPA-scaled (KEDA on warm queue depth).
- The cache-invalidator is HPA-scaled on Kafka lag.

### Memory allocation strategy

```
per shard memory layout (target):
  bl:*    ~40%      (largest namespace; compressed pages)
  qry:*   ~15%
  dash:*  ~10%
  seo:*   ~5%       (small values; many keys)
  hist:*  ~5%
  api:*   ~10%
  robots/host/etc. ~5%
  tags/versions/locks/sw  ~5%
  overhead          ~5%
```

We monitor namespace-level memory shares and reshard / split when any one exceeds 60% sustained.

### Production topology

```
us-east-1 (primary region):
  redis-cache cluster (6×3)
  kafka cluster        (for invalidation events)
  cache-warmer x3
  cache-invalidator x3

eu-west-1 (sister region):
  redis-cache cluster (6×3)
  kafka mirror         (consumes us cache.invalidate.*)
  cache-warmer x3
  cache-invalidator x3 (subscribes to local + mirror)

ap-south-1: same as eu

CDN (Cloudflare/Fastly):
  edge cache for public surfaces
  Surrogate-Key tag purge configured
```

### Folder structure

```
seo-suite/backend/app/cache/
├── __init__.py
├── client.py                # cluster-aware Redis client wrapper
├── sdk.py                   # public Cache class (get_or_build, invalidate_tag, lock, warm)
├── keys.py                  # namespace + key constructors
├── versions.py              # version pointer helpers
├── tags.py                  # tag inverse index helpers
├── ttl.py                   # central TTL policy (per namespace)
├── serialize.py             # msgpack + zstd
├── coalesce.py              # single-flight + XFetch
├── locks.py                 # lock primitives (cache-side)
├── invalidate/
│   ├── subscriber.py        # Kafka → Redis invalidation worker
│   ├── policies.py          # per-event invalidation rules
│   ├── deps.py              # dependency graph
│   └── cdn.py               # CDN purge (Surrogate-Key)
├── warm/
│   ├── tasks.py             # warm.* Celery tasks
│   ├── schedules.py         # warmer schedules
│   ├── selectors.py         # hot-key selectors (Tranco, usage)
│   └── predict.py           # predictive warming hooks
├── namespaces/
│   ├── api.py
│   ├── seo.py
│   ├── bl.py
│   ├── ref.py
│   ├── qry.py
│   ├── dash.py
│   ├── hist.py
│   ├── audit.py
│   ├── robots.py
│   ├── host.py
│   └── enrich.py
├── monitoring/
│   ├── metrics.py
│   ├── tracing.py
│   ├── hotkey_sampler.py
│   └── slo.py
├── security/
│   ├── acls.py              # ACL templates per namespace
│   ├── signing.py
│   └── tenancy.py           # org_id scoping enforcement
├── lua/
│   ├── get_or_set_swr.lua
│   ├── version_bump_and_publish.lua
│   ├── single_flight_acquire.lua
│   ├── single_flight_release.lua
│   ├── coalesce_or_wait.lua
│   └── expire_if_older.lua
└── testing/
    ├── fakes/
    │   ├── cluster.py
    │   ├── clock.py
    │   └── kafka.py
    ├── fixtures/
    └── chaos/
        ├── partition.py
        ├── failover.py
        └── cold_start.py
```

```
seo-suite/backend/deployments/cache/
├── k8s/
│   ├── namespace.yaml
│   ├── redis-cache-statefulset.yaml
│   ├── redis-cache-service-headless.yaml
│   ├── redis-cache-acl-configmap.yaml          # ACL users template
│   ├── cache-warmer-deployment.yaml
│   ├── cache-invalidator-deployment.yaml
│   ├── cache-compactor-cronjob.yaml
│   ├── networkpolicies.yaml
│   ├── servicemonitors.yaml
│   ├── pdb.yaml
│   └── rbac.yaml
├── helm/
│   └── cache/
│       ├── Chart.yaml
│       ├── values.yaml
│       └── templates/
├── docker/
│   ├── redis-cache.Dockerfile                  # base image + custom config
│   ├── cache-warmer.Dockerfile
│   └── cache-invalidator.Dockerfile
└── runbooks/
    ├── redis-shard-down.md
    ├── memory-pressure.md
    ├── invalidation-storm.md
    ├── hot-key.md
    ├── replication-lag.md
    ├── cold-start.md
    └── cache-poisoning-recovery.md
```

---

**STEP 9 CACHE ARCHITECTURE COMPLETED**

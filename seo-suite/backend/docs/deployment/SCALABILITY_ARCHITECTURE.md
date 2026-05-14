# RankedTag SEO Platform — Scalability & Infrastructure (Step 10)

Production-grade enterprise scalability architecture for the Domain Authority + Backlink Analysis platform. **Infrastructure design only — no code.** This document ties Steps 1–9 together into a global, multi-region, fault-tolerant deployment with concrete topology, scaling thresholds, recovery targets, and operational playbooks.

> **Scope.** Global infrastructure, multi-region, Kubernetes, autoscaling, observability, DR, security at the edge, cost, CI/CD, runbooks.
>
> **Audience.** SRE, platform, infra engineering, executive sign-off on capacity + cost.
>
> **Relationship to prior steps.** Service-internal scaling (cache, queue, crawler) is defined in Steps 7–9. This step focuses on the **substrate** those services run on and the **boundaries** between them.

---

## Table of Contents

1. [Global Infrastructure Topology](#part-1--global-infrastructure-topology)
2. [Horizontal Scaling Strategy](#part-2--horizontal-scaling-strategy)
3. [Backend (FastAPI) Scalability](#part-3--backend-fastapi-scalability)
4. [PostgreSQL Scalability](#part-4--postgresql-scalability)
5. [Redis Scalability](#part-5--redis-scalability)
6. [Distributed Crawler Scaling](#part-6--distributed-crawler-scaling)
7. [Playwright Rendering Scalability](#part-7--playwright-rendering-scalability)
8. [Queue Scalability](#part-8--queue-scalability)
9. [API Gateway & Load Balancing](#part-9--api-gateway--load-balancing)
10. [CDN & Edge Optimization](#part-10--cdn--edge-optimization)
11. [Multi-Region Deployment](#part-11--multi-region-deployment)
12. [Kubernetes Architecture](#part-12--kubernetes-architecture)
13. [Observability & Monitoring](#part-13--observability--monitoring)
14. [Fault Tolerance](#part-14--fault-tolerance)
15. [Disaster Recovery](#part-15--disaster-recovery)
16. [Security Scalability](#part-16--security-scalability)
17. [Cost Optimization](#part-17--cost-optimization)
18. [Data Pipeline Scalability](#part-18--data-pipeline-scalability)
19. [WebSocket Scalability](#part-19--websocket-scalability)
20. [Testing & Load Testing](#part-20--testing--load-testing)
21. [Deployment Pipeline (CI/CD)](#part-21--deployment-pipeline-cicd)
22. [Enterprise Maintenance & Runbooks](#part-22--enterprise-maintenance--runbooks)

---

## PART 1 — Global Infrastructure Topology

### 30,000-ft view

```
                              ┌─────────────────────────────────┐
                              │     Global DNS (Route 53)       │
                              │  GeoDNS + health checks         │
                              └────────────┬────────────────────┘
                                           │
                ┌──────────────────────────┼──────────────────────────┐
                │                          │                          │
                ▼                          ▼                          ▼
        ┌───────────────┐          ┌───────────────┐          ┌───────────────┐
        │ Cloudflare    │          │ Cloudflare    │          │ Cloudflare    │
        │ edge (NA)     │          │ edge (EU)     │          │ edge (APAC)   │
        │ WAF + DDoS    │          │ WAF + DDoS    │          │ WAF + DDoS    │
        │ CDN + bot mgr │          │ CDN + bot mgr │          │ CDN + bot mgr │
        └──────┬────────┘          └──────┬────────┘          └──────┬────────┘
               │                          │                          │
               ▼                          ▼                          ▼
        ┌───────────────┐          ┌───────────────┐          ┌───────────────┐
        │   us-east-1   │  ◀────▶  │   eu-west-1   │  ◀────▶  │   ap-south-1  │
        │  REGION       │          │  REGION       │          │  REGION       │
        │               │          │               │          │               │
        │ ▶ ALB / NGINX │          │ ▶ ALB / NGINX │          │ ▶ ALB / NGINX │
        │ ▶ EKS cluster │          │ ▶ EKS cluster │          │ ▶ EKS cluster │
        │ ▶ RDS (PG) HA │ ◀──────▶ │ ▶ RDS (PG) HA │          │ ▶ RDS (PG) R  │
        │ ▶ ClickHouse  │ ◀──────▶ │ ▶ ClickHouse  │          │ ▶ ClickHouse  │
        │ ▶ Redis ×2    │          │ ▶ Redis ×2    │          │ ▶ Redis ×2    │
        │ ▶ Kafka       │ ◀──────▶ │ ▶ Kafka       │ ◀──────▶ │ ▶ Kafka       │
        │ ▶ S3 (primary)│ ◀──────▶ │ ▶ S3 (mirror) │          │ ▶ S3 (mirror) │
        │ ▶ OpenSearch  │ ◀──────▶ │ ▶ OpenSearch  │          │ ▶ OpenSearch  │
        └───────┬───────┘          └───────┬───────┘          └───────┬───────┘
                │                          │                          │
                │  MirrorMaker (Kafka) ─── async event mirroring       │
                │  WAL streaming  ─────── PG warm standby cross-region │
                │  ClickHouse replicated table ─── distributed table   │
                └──────────────────────────┴──────────────────────────┘
```

### Roles per region

| Role | us-east-1 | eu-west-1 | ap-south-1 |
|---|---|---|---|
| Primary write region (Postgres)      | **active**    | warm standby     | warm standby |
| ClickHouse                           | shard set A   | shard set B (mirror) | shard set C (read-mostly) |
| Kafka                                | active        | active           | active |
| S3                                   | primary       | mirror (CRR)     | mirror (CRR) |
| User traffic (read)                  | yes           | yes              | yes |
| User traffic (write)                 | yes (routed)  | proxied to us-east-1 by default | proxied |
| Crawl fleet                          | full          | full             | full |
| Render fleet                         | full          | full             | full |

Writes default to us-east-1; reads are served from the nearest region. Active-active writes are introduced **per service** when correctness allows (event-bus ingestion: yes; Postgres OLTP: no, until we adopt a multi-active store).

### How regions communicate

| Path | Mechanism | Latency budget |
|---|---|---|
| User request → nearest edge | GeoDNS + anycast | < 30 ms RTT to edge |
| Edge → origin (in-region) | private peering | < 20 ms RTT |
| Region → region (Kafka)   | MirrorMaker 2  | < 1 s replication |
| Region → region (Postgres WAL) | streaming replication | < 5 s lag |
| Region → region (ClickHouse) | distributed/replicated tables | < 30 s lag |
| Region → region (S3)      | cross-region replication | minutes (acceptable for cold blobs) |
| Region failover           | DNS health-check flip | RTO 60 s |

### Key principle

The system is **regionally autonomous** for reads. Each region can serve its full user-facing read surface without crossing a regional boundary. Writes still funnel to the primary region; this is the explicit consistency boundary, and the product is designed around it (eventual visibility of writes globally < 5 s).

---

## PART 2 — Horizontal Scaling Strategy

### What scales horizontally (and how)

| Component | Axis | Scaling signal | Auto |
|---|---|---|---|
| API gateway (FastAPI)         | pods | CPU + RPS + p95 latency | HPA |
| WebSocket gateway             | pods | connection count + cpu  | HPA |
| Fetch / parse / discover workers | pods | queue lag (KEDA)     | HPA |
| Render workers                | pods | render-queue depth (KEDA) | HPA |
| Audit / export / analytics    | pods | per-queue depth (KEDA) | HPA |
| Writer workers                | pods | write-lag SLO         | HPA |
| Postgres                      | vertical primary + read replicas | manual | manual |
| ClickHouse                    | shards + replicas | manual | manual |
| Redis broker / cache          | shards | manual reshard       | manual |
| Kafka                         | partitions / brokers | manual | manual |
| OpenSearch                    | data nodes | manual          | manual |

**Rule of thumb.** Stateless tiers autoscale freely; stateful tiers scale on planned operations. This is intentional — automatic resharding of a database during a traffic spike is a worse outcome than serving slightly slowly with prepared capacity headroom.

### Stateless services

Every API replica, worker, gateway, and WebSocket pod is **stateless**:

- No on-pod session or task state beyond a single in-flight unit of work.
- All shared state lives in Redis, Postgres, ClickHouse, S3, or Kafka.
- Killing a pod releases work via lease TTL (Step 8) without correctness loss.
- Adding a pod requires no coordination beyond service-discovery registration.

### Distributed coordination

- **Leader-elected singletons** (Beat, reaper, promoter, invalidator) use Redis lease keys (Step 8 §10).
- **Worker fleet view** materialized from heartbeats (Step 8 §7).
- **Cluster topology** consumed by Redis cluster client and Postgres-aware connection pools; updates flow without app restarts.

### Autoscaling triggers

```
api-gateway:
  HPA on CPU utilization > 60% (averaged 60s window)
  + custom metric: p95_latency > 250 ms for 2 min
  cooldown: 180 s

fetch-worker:
  KEDA on queue lag > 30 s (q.fetch.p0|p1)
  cooldown: 300 s

render-worker:
  KEDA on q.render depth > 200/pod
  cooldown: 600 s

websocket-gateway:
  HPA on connections per pod > 8000

writer-worker:
  KEDA on ClickHouse write lag > 30 s

audit-worker:
  KEDA on q.audit.crawl depth > 5000
```

### Workload balancing

- **Within a class**: Celery prefetch=1; weighted-RR over priority queues (Step 8 §5).
- **Across classes**: separate deployments, separate node pools, no cross-class CPU/memory competition.
- **Across regions**: GeoDNS routes by latency; surplus regions absorb spillover via failover routing.

### Preventing bottlenecks

- Single-flight on cache builds (Step 9 §10).
- Connection-pool tuning at every tier (Parts 3, 4, 5).
- Backpressure at five layers (Step 8 §14) so no one tier collapses under load before HPA scales.
- Cardinality discipline in metrics (Steps 8, 9) so Prometheus itself doesn't become a bottleneck.

---

## PART 3 — Backend (FastAPI) Scalability

### Process model

```
container: api-gateway
   PID 1: tini
   PID 2: gunicorn --worker-class uvicorn.workers.UvicornWorker
       N workers (= 2 × CPU cores, capped at 8 per pod)
       each worker: single asyncio event loop
       graceful timeout: 30 s
       max requests per worker: 10 000 (then recycled)
       max requests jitter: 500
```

Pod resource shape:

```
cpu req:   500m     cpu lim:   2000m
mem req:   512 Mi   mem lim:   1 Gi
```

Why prefork + Uvicorn workers (not bare Uvicorn): a single Python process can't use multiple cores; prefork gives us core parallelism while each worker stays async for I/O. Pod count is the scaling unit; workers per pod is a tuning constant.

### Async-first

- Every request handler is `async def`. Sync handlers fall back to a thread pool — banned outside of CPU-bound paths (we have one: PDF rendering, and that lives in a worker, not the gateway).
- Outbound HTTP via `httpx.AsyncClient`. Async Postgres via `asyncpg`. Async Redis via `redis.asyncio`. Async ClickHouse via `aiochclient`.
- No `requests`, `psycopg2-binary` sync, or other sync libs in the request path. CI lints for this.

### Connection pools

```
asyncpg pool per worker:    min=2, max=20, command_timeout=10s
redis cluster client:       per shard, max 16 connections, multiplexed
clickhouse client:          per worker, max 10 connections
httpx upstream clients:     per worker, total=200, per_host=8
```

Total connection budget per pod (8 workers worst case):

```
PG:        160 connections per pod
Redis:     8 × 6 shards × 8 conn = ~384 multiplexed
CH:        80
httpx:     1600 sockets in pool
```

Postgres replica pools further bounded via PgBouncer (Part 4).

### Request lifecycle (hot path)

```
incoming → uvloop event loop
  → middleware: traceparent, auth (JWT verify L0 cache), rate-limit (Redis Lua)
  → route handler (async)
    → cache lookup (Step 9)
       → on hit: serialize → response
       → on miss: builder (DB query, optional WS push) → cache store → response
  → response middleware: compress (brotli) → return
```

Hot-path budget (cache hit):

```
auth verify:   ≤ 0.3 ms (L0 cache)
rate limit:    ≤ 0.5 ms (Redis Lua, pipelined w/ auth)
cache get:     ≤ 1.0 ms
serialize:     ≤ 0.5 ms
compress:      ≤ 0.5 ms
total p95:     ≤ 5 ms in-process
```

End-to-end p95 (edge to client) is ~20–40 ms in-region.

### Streaming responses

For large payloads (exports, NDJSON internal endpoints), we stream:

```
return StreamingResponse(generator(), media_type="application/x-ndjson")
```

No buffering. Memory stays flat regardless of payload size.

### Request batching

For internal endpoints with bursty small calls, the API offers `/internal/.../batch` variants:

```
POST /internal/scoring/domains/batch
   body: {"domains": ["a.com", "b.com", …]}
```

One DB query, one Redis pipeline, one response. Reduces hop count on bulk recompute.

### Distributed API nodes

- Pods deploy across ≥ 3 AZs per region with anti-affinity.
- ALB/NGINX (Part 9) distributes by least-connections; cookie-affinity only for WebSocket gateway (Part 19).
- Pod startup-to-ready: ≤ 4 s (image preloaded; readiness probe = first 200 from `/health/ready`).

### Production startup

```
gunicorn app.main:app \
    --worker-class uvicorn.workers.UvicornWorker \
    --workers 4 \
    --worker-connections 1000 \
    --keep-alive 30 \
    --max-requests 10000 \
    --max-requests-jitter 500 \
    --graceful-timeout 30 \
    --timeout 60 \
    --bind 0.0.0.0:8080 \
    --access-logfile - \
    --error-logfile -
```

Liveness vs readiness:

```
/health/live    — process up; no deps required (200 if event loop responsive)
/health/ready   — pool sizes met; broker reachable; PG reachable (200/503)
/health/startup — initial migrations applied; caches partially warm
```

`startupProbe` gates `livenessProbe` until startup OK — avoids HPA scaling churn during boot.

---

## PART 4 — PostgreSQL Scalability

### Topology

```
Primary  (writer)         ──► WAL ──► Replica-1 (sync, AZ-local)
                                  ──► Replica-2 (async, AZ-other)
                                  ──► Replica-3 (async, cross-region, warm standby)
                                  ──► WAL archive (S3, encrypted)
```

- Managed: AWS RDS for PostgreSQL 16 (or Aurora PG; preferred for ease of read-replica scaling and storage autogrowth).
- Sync replica covers AZ failure with zero data loss within a region.
- Async cross-region replica is the DR target (Part 15).

### Connection pooling

A two-tier pool:

```
App workers ──► pgbouncer (sidecar per node)  ──► Postgres
                 transaction mode
                 default_pool_size 25 per (user, db)
                 reserve_pool 5
                 max_client_conn 4000
```

PgBouncer absorbs the connection storm from autoscaling pods; Postgres sees ≤ 500 concurrent connections regardless of pod count. Required at scale; without it pgsql's per-connection backend overhead dominates.

### Read routing

Application uses **declarative read preferences**:

```
@read_replica  # repository method decorator
def get_project_dashboard_facts(...): ...
```

Replica routing decided at the connection layer; primary used only when:

- Write occurred in the current request (read-your-writes — track via `wal_lsn` cookie).
- Sub-second freshness required (rare; mostly billing reconciliation).

### Partitioning

Time-series and large tables use **declarative range partitioning**:

```
crawl_state           : range by (fetched_at_month)        partitions: 36 active
backlinks_history     : range by (snapshot_month)          (also in ClickHouse; PG holds metadata only)
audit_issues          : range by (audit_started_month)     partitions: 24 active
notifications         : range by (created_month)           partitions: 12 active
```

Pruning kicks in transparently on queries with `WHERE fetched_at BETWEEN ...`. Older partitions detached and moved to cold storage.

### Indexes

- **B-tree** on PK and high-selectivity FK columns.
- **BRIN** on append-mostly time columns (`fetched_at`, `created_at`) — orders of magnitude smaller than btree, fast enough for time-range scans.
- **GIN** on JSONB columns where we filter (audit metadata).
- **Partial indexes** on hot subsets (`WHERE status = 'running'` on jobs table).
- **Composite covering indexes** sized for the top three dashboard queries each.

### Materialized views

A handful of pre-computed views refreshed nightly (or on event triggers):

```
mv_org_daily_usage             — for billing & dashboards
mv_top_domains_by_change_rate  — for warmer / hot lists
mv_project_health              — for the project dashboard
```

ClickHouse holds the heavy-aggregation views (Step 9 §7). PG MVs are for cross-cutting OLTP-style summaries only.

### Bulk insert optimization

Writer workers use COPY (`asyncpg.copy_records_to_table`) over INSERT for batches > 100 rows. With COPY, single-connection insert throughput exceeds 50k rows/s on modest hardware.

### Vacuum & maintenance

```
autovacuum_vacuum_scale_factor      0.05   (more aggressive than default)
autovacuum_naptime                  30s
autovacuum_vacuum_cost_limit        4000
autovacuum_work_mem                 1 GB
work_mem                            32 MB (per query node)
maintenance_work_mem                2 GB
shared_buffers                      30% of RAM
effective_cache_size                70% of RAM
```

Monthly REINDEX on hot tables; pg_repack used for online table maintenance.

### Failover

- RDS Multi-AZ failover: 60–120 s.
- App reconnects via DNS-based endpoint; PgBouncer reconnects.
- In-flight transactions abort; tasks retry per Step 8 retry policy.
- Cross-region failover: planned, RTO 60 min (Part 15).

### Sharding preparation

We do not need sharding at base scale. The schema is designed to **enable** sharding when the time comes:

- All multi-tenant tables include `org_id`.
- Cross-tenant queries are rare and live in admin/billing only.
- Citus is the prepared path: shard key `org_id`; the DDL changes required are scripted but not applied.

### Query routing

A central `db_route(query_kind)` helper:

```
write          → primary
read.fresh     → primary
read.swr       → nearest healthy replica with lag < 1 s
read.analytics → cross-region replica (if it has lower lag for the analytic time-range)
```

Replica lag is monitored at sub-second granularity; the router skips a replica when `lag > slo`.

---

## PART 5 — Redis Scalability

### Two clusters (recap from Step 8/9)

- `redis-broker` — Celery + queue coordination.
- `redis-cache`  — application caches.

Each is a **Redis Cluster** of 6 primary + 12 replica nodes at base scale, scaling to 12+ primary shards as needed.

### When Cluster vs Sentinel

- **Cluster** — for horizontal sharding + replication + automatic failover. This is the default.
- **Sentinel** — only for the rare single-instance use case (e.g. a tiny "leader lock" cluster). We avoid it for the main caches; it doesn't shard and would cap us at a single node's memory.

### Distributed caching (recap §9 §3)

- Hash tags `{…}` colocate related keys.
- Per-namespace ACL users.
- TLS-only; private network only.

### Pub/Sub scaling

Pub/Sub is cluster-aware via `SSUBSCRIBE`/`SPUBLISH` (Redis 7). Fan-out is per-shard; messages with the same shard tag colocate. For platform-wide fanout (rare), the cache-invalidator publishes once per shard.

### Queue scaling

Per Step 8 §17: list shards if any queue saturates a slot. Routing constant in code; addition of `q.fetch.p2.{0..N}` is a config flip.

### Memory optimization

```
maxmemory                    9 Gi per shard
maxmemory-policy             allkeys-lru
hash-max-listpack-entries    512
zset-max-listpack-entries    128
client-output-buffer-limit   normal 0 0 0
                              replica 256mb 64mb 60
                              pubsub  32mb 8mb 60
io-threads                   4         (per shard, on >=4 vCPU nodes)
tcp-keepalive                30
```

### Eviction strategy

`allkeys-lru` everywhere. Hot keys promote to L0 (Step 9 §10) to relieve Redis. We monitor `evicted_keys` and add capacity before steady-state evictions occur — eviction in the cache is acceptable; eviction in the broker would lose tasks (the broker is sized so eviction never happens).

### Replica promotion

```
failover trigger:           heartbeat loss 10 s
replica chosen:              by offset (most up-to-date)
DNS / client redirection:    Redis cluster slots auto-update; clients use the cluster topology
data loss window:            ≤ 1 s (AOF everysec)
```

---

## PART 6 — Distributed Crawler Scaling

### Targets (from Step 7)

```
domains crawled:               10M+ active
pages fetched / day:           500M
backlinks discovered / day:    2B
peak concurrent fetches:       100k
```

### Scaling axes

- **Fetch workers**: pods, up to 5k per region.
- **Render workers**: pods, up to 500 per region.
- **Redis shards**: queue and dedup capacity.
- **Network egress**: NAT gateway capacity; elastic IP pool size.
- **DNS resolution**: per-region cached resolver.

### URL ownership

A URL belongs to **one job × one host bucket** at a time:

```
shard key = (job_id, blake2b(host) mod 256)
```

The orchestrator's planner assigns shards. Workers lease a shard; only the holder can ack work for that shard. Two regions never simultaneously crawl the same shard.

### Distributed URL frontier

```
frontier:{job_id}                    ZSET scored by S_disc       (Step 7 §3)
host:{etld+1}                        LIST drained by token bucket (Step 7 §11)
dedup:{job_id}                       SET (per-job exact dedup)
dedup:bf:global                      BLOOM (12 GB, 10B capacity)  (Step 7 §19)
```

Frontier sharding for very large jobs:

```
frontier:{job_id}:{slot}             16 slots per job above 5M URLs
```

The admitter writes to a deterministic slot based on URL hash; workers consume the union.

### Duplicate prevention

Three-layer (Step 7 §2, §19): per-job set, global Bloom, content simhash.

### Crawl coordination

Across regions:

- Each region has its **own** orchestrator and frontier.
- A job is **owned by a single region** (the region the customer's project lives in).
- Cross-region crawling for a single job is allowed only when the customer's audit requires geo-specific fetches; in that case the job emits **sub-shards** to specific regions via Kafka, and the originating region's aggregator collects results.

### Crawl budget allocation

```
tenant_daily_budget       = plan_tier × multiplier × region_factor
per_job_url_budget        = min(tenant_daily_budget, job.max_pages)
per_host_concurrency_cap  = robots.crawl_delay OR learned politeness
global_outbound_cap       = 100,000 concurrent fetches per region
```

Budgets are atomic counters in Redis (DECR); enforced at admission.

---

## PART 7 — Playwright Rendering Scalability

Recap and extension of Step 7 §8 and Step 8 §12.

### Per-pod shape

```
render-light pod:    8 contexts × 1 page each       ~1.2 GB RSS    concurrency 8
render-heavy pod:    4 contexts × 1 page each       ~1.5 GB RSS    concurrency 4
render-pdf pod:      4 contexts × 1 page each       ~1.2 GB RSS    concurrency 4
```

### Fleet sizing

```
peak Chromium contexts cluster-wide:   4 000
peak render pods cluster-wide:          ~500–800
```

### Browser pool reuse

- 1 Chromium per pod, reused across tasks.
- Each context recycled every 50 navigations.
- Browser process restarted every 5 000 navigations OR 2 hours.

### Isolated rendering containers

The render workers run in a dedicated K8s namespace `rt-queue-render`:

```
NetworkPolicy:
  egress allowed:   public internet, S3, broker, Kafka
  egress denied:    other internal services (DB, ClickHouse, OpenSearch)
seccomp:            RuntimeDefault
no privileged:      true
no host PID/IPC:    true
service tokens:     none mounted
```

A 0-day in Chromium can't pivot to internal services.

### Autoscaling

```
ScaledObject: render-heavy
  scaler:        redis (LLEN q.render.heavy)
  target:        200 tasks/replica
  minReplicas:   10
  maxReplicas:   500
  cooldown:      600s (long; cold-start of Chromium is expensive)
```

### Memory cleanup

- Pod memory limit enforces hard cap; OOM kills the pod, lease reclaims work.
- Per-task watcher: if pod RSS > 95% of limit, kill the current page (don't kill the browser).
- Browser process recycle: every 2h or 5000 navs.

### Throughput optimization

- Resource blocking (images/fonts/media off by default).
- Third-party analytics blocked.
- Pre-warmed cache user-data-dir mounted read-only.
- Context warm-up: 1 navigation to about:blank before accepting tasks.

Achieved throughput: ~3–6 renders per pod per second on render-light; ~0.5–1.5 per second on render-heavy.

---

## PART 8 — Queue Scalability

(Recap of Step 8 §17 with regional extension.)

### Per-region queues

Queue names are **regional** when work is regional:

```
q.fetch.{region}.p{0..3}
q.render.{region}.{light|heavy|pdf}
q.audit.{region}.crawl
```

Global queues remain unsharded by region for cross-region work (`q.notify`, `q.maintenance`).

### Cross-region task routing

A task carrying `payload.region = "eu-west-1"` is enqueued onto that region's broker by the Producer SDK. The producer reads its own region's Kafka events and translates region-tagged tasks via the regional Outbox.

### Throughput envelope

```
peak task submit:      500k tasks/s (sustained, mixed)
peak completion:        500k/s
total in-flight:        10–50M
```

### Partitioning thresholds

A queue is split into `.{0..N}` shards when ops/s per slot > 50k for > 10 min sustained. Splitting is a planned action — config change, then a deploy.

### Backpressure recap (Step 8 §14)

Six-layer backpressure with tier-based shedding. Single feature flag flips degradation order.

---

## PART 9 — API Gateway & Load Balancing

### Layered architecture

```
Client
   ↓
Cloudflare (TLS termination at edge, WAF, DDoS, bot management)
   ↓
ALB (AWS) per region
   ↓
NGINX ingress controller (K8s)
   ↓
FastAPI gateway pods (app/api)
```

### Cloudflare

- TLS 1.3 termination at the edge.
- WAF rules (OWASP Top 10 + RankedTag custom).
- Bot management: identified-bots whitelist; aggressive challenge for anomalous patterns.
- DDoS L3/L4 mitigation: Cloudflare default + Magic Transit for >100 Gbps events.
- Tunnel to origin: origin-only-from-Cloudflare via client certificate; no public origin IPs.

### ALB

- Cross-AZ load balancing.
- Listeners on 443 (HTTPS), 80 → 443 redirect.
- Routes by host (api.rankedtag.com, ws.rankedtag.com, docs.rankedtag.com, admin.rankedtag.com).
- Health checks every 10 s; unhealthy pod evicted within 30 s.

### NGINX ingress

- TLS again from ALB → ingress (mTLS optional).
- Path-based routing into namespaces.
- Per-route rate-limit nudges (cheap defense; primary rate limit is in Redis).
- Streaming and WebSocket upgrade.

### Rate limiting

- L1: Cloudflare (per IP, per path) — coarse.
- L2: NGINX (per IP, request burst) — coarse.
- L3: Redis token bucket (per principal, per route) — authoritative (Step 6 §18).

### Request routing

```
api.rankedtag.com         → app/api          (REST surface)
ws.rankedtag.com          → app/ws           (WebSocket gateway)
docs.rankedtag.com        → static + ReDoc   (CDN-served)
admin.rankedtag.com       → app/admin        (separate, SSO + MFA + IP allowlist)
public-api.rankedtag.com  → app/public-api   (programmatic SDK access)
```

### API version routing

Path-based: `/v1/*` and `/v2/*` mapped to the same gateway deployment; route dispatch internal. Older deprecated versions can run as **separate** deployments behind the same ingress when the contract diverges substantially — required for safe parallel evolution (Step 6 §20).

### Geographic routing

GeoDNS routes by user IP. Cloudflare adds `CF-IPCountry` header; ALB/NGINX preserves it. The gateway uses it for analytics, locale, and (rarely) region affinity for sticky reads.

### Zero-downtime deployments

```
rolling update:
  maxSurge:        25%
  maxUnavailable:  10%
preStop:           SIGTERM → drain inflight 30s → exit
readiness probe:   pod removed from ALB target set within 5s of failing
graceful shutdown: gunicorn graceful_timeout 30s
in-flight requests: complete on the draining pod; new requests routed to healthy pods
```

ALB target deregistration delay 30s — matches grace window. Long-lived WebSocket connections drain separately (Part 19).

### SSL/TLS

- TLS 1.3 only on the public surface; TLS 1.2 fallback disabled for new endpoints.
- HSTS with preload.
- OCSP stapling.
- Cipher set: ChaCha20-Poly1305 + AES-GCM; no CBC.
- Certificates: ACM (AWS) automatically renewed; Cloudflare certificate for the edge.

---

## PART 10 — CDN & Edge Optimization

### Cloudflare as primary CDN

- Static assets: dashboard JS/CSS/images at the edge with hashed filenames + `Cache-Control: public, max-age=31536000, immutable`.
- Public API surfaces (plans, OpenAPI specs, docs): edge-cached.
- Edge workers (Cloudflare Workers) handle: redirects, geo-routing, A/B variants, edge-side rate limiting.
- Bandwidth Alliance + R2 used for egress-heavy artifacts.

### Surrogate keys

Per Step 9 §6: responses carry `Surrogate-Key` tags. Invalidator emits purges via Cloudflare API on relevant events (rare; CDN is mostly TTL-driven for our authenticated traffic).

### Frontend delivery

- Vite-built SPA assets in S3 + CDN.
- Brotli pre-compressed; `Content-Encoding: br` served directly from edge.
- HTTP/3 (QUIC) enabled at the edge for < 100ms time-to-first-byte globally.

### API edge acceleration

- Edge Workers terminate TLS, run lightweight auth (signed cookie verification) on bot-traffic short-circuit paths.
- Edge POPs colocated near major user populations.

### AWS CloudFront alternative

For S3-hosted exports/reports, CloudFront is the simpler choice (signed URLs natively supported, integrates with S3 lifecycle). Cloudflare and CloudFront coexist:

```
*.rankedtag.com         → Cloudflare
exports.rankedtag.com   → CloudFront → S3
reports.rankedtag.com   → CloudFront → S3
```

### Cache headers (recap §9 §6)

Public APIs: `public, max-age=N, s-maxage=N, stale-while-revalidate=M`.
Authenticated APIs: `private, max-age=N, stale-while-revalidate=M`.
Real-time (jobs): `no-store`.

---

## PART 11 — Multi-Region Deployment

### Regions

| Region | Code | Purpose | Capacity |
|---|---|---|---|
| US East (Ohio / N. Virginia) | us-east-1 | Primary; majority of N. American + LatAm traffic | 100% |
| EU West (Ireland)            | eu-west-1 | EU users; GDPR data residency | 60% |
| APAC (Mumbai or Singapore)   | ap-south-1 / ap-southeast-1 | Asian users | 40% |

(Capacity = fraction of us-east-1 baseline. Sized to absorb a primary regional failover with degraded throughput.)

### Data replication

| System | Replication |
|---|---|
| Postgres        | streaming WAL → in-region sync + cross-region async warm standby |
| ClickHouse      | ReplicatedReplacingMergeTree across regions for `domains`, `page_facts`, `backlinks_summary`; raw partitions stay local |
| Redis           | per-region clusters; **no** cross-region replication |
| Kafka           | MirrorMaker 2 active-active for invalidation, jobs, billing-events topics |
| OpenSearch      | cross-cluster replication for audit search |
| S3              | CRR for `rt-exports`, `rt-reports`, `rt-audit-snapshots`; raw HTML stays local |

### Regional failover

```
trigger:        primary region health check fails 3 consecutive times (90s)
action:         GeoDNS removes the region from rotation
                Postgres promotes cross-region standby (manual confirm, ≤ 60 min RTO)
                Kafka MirrorMaker absorbs producer load to surviving regions
                Redis: regional, no cross-region required (each region rebuilds caches from local DB)
recovery:       restore the down region from backups + WAL archive
                replay any divergent writes via conflict-resolution playbook (manual)
```

### Geo-routing

GeoDNS routes by latency. CDN POPs handle TLS termination near users; origin selection picks the lowest-latency healthy region.

### Latency reduction

```
North America: ≤ 30 ms RTT to edge, ≤ 60 ms RTT to us-east-1 origin
Europe:        ≤ 30 ms to edge, ≤ 30 ms to eu-west-1 origin
Asia:          ≤ 50 ms to edge, ≤ 60 ms to ap-south-1 origin
```

### Traffic routing rules

- **Reads**: routed to the nearest region.
- **Writes**: by default routed to us-east-1; per-tenant override available (EU enterprise tenants pinned to eu-west-1 for GDPR data residency).
- **Failover**: GeoDNS removes a region within 90 s of health check failures.

---

## PART 12 — Kubernetes Architecture

### Cluster layout

Per region:

```
EKS cluster:    rt-prod-{region}
  control plane: AWS-managed
  node groups:
    pool-api          (general-purpose; api, ws, admin)
    pool-cpu-general  (fetch, parse, discover, notify, enrich, backlinks)
    pool-mem-mid      (render, report)
    pool-mem-large    (analytics, export, audit, writer)
    pool-iops-high    (Postgres workloads if self-hosted; usually RDS)
    pool-spot         (non-critical workloads: maintenance, low-tier crawl)
```

### Namespaces

```
rt-api             API + WebSocket + admin
rt-queue           orchestrator, beat, outbox-relay, reaper, promoter, all workers except render
rt-queue-render    render workers, report workers (isolated NetworkPolicy)
rt-cache           redis-cache + warmer + invalidator
rt-broker          redis-broker
rt-data            kafka, opensearch (self-hosted if not managed)
rt-monitoring      prometheus, grafana, loki, alertmanager
rt-system          ingress, cert-manager, external-secrets, keda
```

### Workload manifests

- **Deployment** for stateless services (api, workers).
- **StatefulSet** for stateful (redis-broker, redis-cache, opensearch, optionally postgres if self-managed).
- **Job** for one-shot tasks (migrations).
- **CronJob** for scheduled (cache-compactor, robots-refresh, dlq-triage).
- **HorizontalPodAutoscaler** + **KEDA ScaledObject** for autoscaling.
- **PodDisruptionBudget** ≥ 30% for every workload class.
- **NetworkPolicy** per namespace; default-deny ingress.

### Autoscaling policies

```
HPA:
  api-gateway          cpu 60%   + p95_latency > 250ms
  ws-gateway           cpu 60%   + connections per pod > 8000
KEDA (queue-driven):
  fetch-worker         q.fetch.p0|p1 lag > 30s
  render-worker        q.render depth > 200/replica
  parse-worker         q.parse depth > 5k
  audit-worker         q.audit.crawl depth > 5k
  export-worker        q.export depth > 50
  writer-worker        ClickHouse write lag > 30s
```

### Health probes

```
livenessProbe:
  httpGet: /health/live
  initialDelaySeconds: 30
  periodSeconds: 10
  failureThreshold: 3
readinessProbe:
  httpGet: /health/ready
  periodSeconds: 5
  failureThreshold: 2
startupProbe:
  httpGet: /health/startup
  failureThreshold: 30   # ~5 minutes to start
  periodSeconds: 10
```

### Resource limits

Set per Steps 7/8/9 per worker class. Highlights:

```
api-gateway              cpu 500m / 2000m,  mem 512Mi / 1Gi
ws-gateway               cpu 500m / 1500m,  mem 512Mi / 1Gi
fetch-worker             cpu 250m / 1000m,  mem 256Mi / 512Mi
render-worker            cpu 1000m / 2000m, mem 1Gi / 1.5Gi
analytics-worker         cpu 1000m / 4000m, mem 1Gi / 1.5Gi
postgres (self-hosted)   cpu 4000m / 8000m, mem 16Gi / 32Gi (StatefulSet only if non-managed)
redis-cache              cpu 1000m / 2000m, mem 8Gi / 12Gi
```

### Production deployment topology

Per region: ≥ 3 AZs, anti-affinity for every workload class, PDB ≥ 30% during voluntary disruptions. Node pools labeled and tainted so workloads land on the right nodes.

---

## PART 13 — Observability & Monitoring

### Stack

```
metrics       Prometheus + Thanos (long-term)        scrape every 15s
logs          Loki (cheap) + OpenSearch (search)     structured JSON
traces        OpenTelemetry → Tempo / Honeycomb       100% on errors, 5% on success
errors        Sentry                                  application exceptions
alerts        Alertmanager → PagerDuty + Slack
dashboards    Grafana                                 owned by SRE
synthetics    Checkly / k6-synth                      external probes per region
```

### What's monitored at each tier

| Tier | Metrics |
|---|---|
| Edge        | Cloudflare analytics: req/s, 4xx/5xx, cache hit, threat blocks, RTT by country |
| Gateway     | Step 8/9 metric suites + p95 latency by route, RPS, error rate, JWT verify rate |
| Workers     | Step 8 §16 suite (task throughput, queue lag, retries, DLQ) |
| Cache       | Step 9 §18 suite (hit ratio, ops/s, evictions, replication lag) |
| Crawl       | Step 7 §17 suite (pages/s, render rate, politeness throttles, bans) |
| DB          | pg_stat_statements, connection count, lock waits, replication lag |
| ClickHouse  | parts count, merges, queries/s, async insert lag |
| OpenSearch  | indexing rate, search latency, JVM heap, queue lengths |

### Cardinality discipline (recap)

Bucket labels at every tier — no raw URLs, hostnames, or tenant IDs in metric labels. Top-N inspection lives in Grafana queries against logs or in Redis Insight, not Prometheus.

### Tracing

W3C `traceparent` from edge through every hop. Spans:

```
edge → gateway → service → cache → db → worker (via task header)
```

100% sampling on errors and slow requests (> p99). 5% sampling on success.

### Logs

JSON only, with required fields (`ts, level, service, trace_id, org_id, route, latency_ms, status`). Shipped via Vector/Fluentbit DaemonSet to Loki.

### Dashboards (top-level)

```
Grafana: Platform Overview                   # all 4 golden signals per service
Grafana: Edge & Gateway                      # Cloudflare + ALB + NGINX + gateway
Grafana: Queue System                        # per Step 8
Grafana: Cache System                        # per Step 9
Grafana: Crawler                             # per Step 7
Grafana: PostgreSQL                          # primary + replicas + replication lag
Grafana: ClickHouse                          # ingest + merges + query latency
Grafana: Cost                                # spend by namespace, by region, by tier
Grafana: Per-Tenant Health                   # tier-bucketed SLO compliance
Grafana: DR Drill                            # readiness of cross-region standby
```

### SLOs (platform-level)

```
API availability        ≥ 99.9% (rolling 30d)
API p95 latency (auth, cached)   ≤ 80 ms
API p95 latency (auth, cold)     ≤ 400 ms
Job submission p95     ≤ 50 ms
Queue lag p0 (fetch)   ≤ 30 s
Queue lag p1 (fetch)   ≤ 5 min
WebSocket connect p95  ≤ 200 ms
Cache hit ratio (overall)  ≥ 0.85
Crawl error rate        ≤ 2%
```

Multi-window multi-burn-rate alerts on each.

---

## PART 14 — Fault Tolerance

### Failure modes vs response

| Failure | Detection | Recovery | RTO |
|---|---|---|---|
| Pod crash               | livenessProbe | K8s restarts within 10 s | 10–30 s |
| Worker OOM              | OOMKilled event | restart; lease reclaim | 30–60 s |
| Node failure            | Node taint     | pods rescheduled; PDB enforces ≥ 30% | 1–5 min |
| AZ failure              | EKS multi-AZ + Multi-AZ RDS | pods schedule elsewhere; PG sync replica promotes | 1–5 min |
| Redis primary loss      | cluster heartbeat | replica promoted | 10–15 s |
| Postgres primary loss   | RDS Multi-AZ failover | replica promoted | 60–120 s |
| ClickHouse shard loss   | replication       | replica serves | 30 s |
| Kafka broker loss       | controller failover | partition leader moves | 5–30 s |
| ALB AZ failure          | health checks    | traffic shifts to other AZs | < 1 min |
| CDN POP failure         | Cloudflare automatic | rerouted by anycast | < 30 s |
| Region failure          | GeoDNS removal + DR runbook | promote standby region | ≤ 60 min |
| Complete CDN outage     | DNS direct-to-origin | origin survives but loaded | n/a (degraded) |

### Self-healing patterns

- **Crash-only design**: any service can be hard-killed without correctness loss. State lives in durable systems.
- **Lease TTL**: dead workers' leases expire automatically.
- **Idempotent writes**: replays are no-ops (Steps 7, 8).
- **Outbox**: business writes survive broker loss (Step 8 §18).
- **Backpressure with graceful degradation**: tier-based shedding (Step 8 §14).

### Rolling recovery

After a major incident, recovery follows a fixed sequence:

```
1. Stabilize: get error rate < 1%, queue lag returning to SLO
2. Verify durability: WAL archive intact, S3 mirrors current
3. Drain DLQ: triage + replay where appropriate (Step 8 §9)
4. Reconcile billing: ensure usage counters match Stripe (event replay if needed)
5. Postmortem: blameless, with action items tracked
```

### Zero-downtime architecture

Achieved through:

- Rolling deployments + readiness probes.
- Database migrations are backward-compatible (additive); destructive changes wait one release.
- Cache schema versioning (Step 9 §11).
- API contracts versioned with deprecation windows (Step 6 §20).

---

## PART 15 — Disaster Recovery

### RTO / RPO targets

| Scenario | RTO | RPO |
|---|---|---|
| Single pod / node failure        | < 1 min  | 0 |
| AZ failure (within region)       | < 5 min  | 0 (sync replica) |
| Service-level cluster failure    | < 30 min | < 5 min |
| Region failure                   | ≤ 60 min | ≤ 5 min |
| Catastrophic (multi-region)      | ≤ 4 h    | ≤ 1 h (WAL archive in S3 cross-region) |

### Backups

```
Postgres:
  automated daily snapshot (RDS)           14-day retention
  WAL archive to S3                        cross-region replicated, 30-day retention
  weekly full export to encrypted S3       90-day retention
  monthly cold archive to S3 Glacier       7-year retention

ClickHouse:
  partition backup to S3 daily             30-day retention
  monthly cold archive                     7-year retention

Redis (cache):
  RDB snapshot to S3 every 6h              7-day retention (cache; loss is acceptable)

Redis (broker):
  AOF archive to S3 hourly                 7-day retention

S3:
  versioning enabled                       90-day non-current version retention
  cross-region replication                 to two other regions

Kafka:
  topic-level retention                    7 days hot, longer for billing topics
```

### Point-in-time recovery (PITR)

Postgres PITR window: 14 days (RDS default). For OLTP critical data we can restore to any second within that window. ClickHouse PITR is partition-granular (daily).

### Multi-region replication

(See Part 11.) WAL streaming + ClickHouse replicated tables + Kafka MirrorMaker + S3 CRR. The cross-region standby is **always at most 5 min behind primary**.

### Infrastructure snapshots

Terraform state stored in S3 with versioning + lock via DynamoDB. Every infrastructure change is reversible via Terraform plan. Helm chart versions pinned per release.

### Backup verification

- **Weekly automated restore test**: a job spins up an ephemeral Postgres, restores the previous night's snapshot, runs a checksum query suite. Failure pages SRE.
- **Quarterly DR drill**: full region failover exercise in staging mirror (production-shaped data). Measure actual RTO/RPO. Update runbooks.

### Recovery workflows

Per scenario, a dedicated runbook lives in the SRE wiki. Key ones:

```
runbooks/dr/region-failover.md
runbooks/dr/pg-pitr.md
runbooks/dr/redis-broker-rebuild.md
runbooks/dr/kafka-replay.md
runbooks/dr/clickhouse-shard-rebuild.md
runbooks/dr/full-platform-recovery.md
```

Each has decision trees, command sequences, expected durations, and verification steps.

---

## PART 16 — Security Scalability

### Edge protection

- **Cloudflare WAF**: managed OWASP ruleset + custom rules per route.
- **Cloudflare DDoS**: L3/L4 always-on; L7 with rate-based + behavioral.
- **Bot Fight Mode**: aggressive challenge for known bad fingerprints; whitelist for known good ones (Googlebot, our own crawler, etc.).
- **Magic Transit**: contracted for events > 100 Gbps if needed.

### Distributed rate limiting

Three tiers (Step 6 §18, Part 9 here):

1. Edge: per-IP per-path (cheap, coarse).
2. NGINX: per-IP burst (cheap, coarse).
3. Redis token bucket: per-principal, per-route, per-org (authoritative).

The Redis tier is the only one whose limits are tuned per tier and per route; the upper tiers are defense in depth.

### API abuse prevention

- Idempotency keys on every state-changing endpoint.
- Velocity checks: signups, password resets, refund issuance.
- Suspicious-pattern detection on free-tier crawl targets (porn / gambling / malware) — opt-in upgrade required.
- Behavioral fingerprinting on dashboard (mouse/keyboard signals via Cloudflare Bot).

### Secrets management

- **HashiCorp Vault** (or AWS Secrets Manager) as the source of truth.
- **External Secrets Operator** syncs secrets into K8s as Kubernetes secrets, encrypted at rest with KMS.
- Rotation cadence: API keys 90 days, DB passwords 30 days, signing keys quarterly.
- No secret in any container image, repo, or `ConfigMap`.

### Encryption

- TLS everywhere (1.3 preferred, 1.2 minimum).
- DB encryption at rest (KMS-managed).
- S3 bucket encryption (SSE-KMS).
- Redis on encrypted EBS volumes.
- Field-level encryption for PII columns (emails, names) using KMS data keys.

### IAM / RBAC

- Least-privilege K8s RBAC; service accounts per workload.
- AWS IAM roles for service accounts (IRSA) instead of long-lived credentials.
- Audit log: every admin action recorded (Step 6 §11).

### Compliance

- SOC 2 controls mapped to platform controls.
- GDPR-ready data residency (EU tenant data pinned to eu-west-1).
- Right-to-erasure workflows (a maintenance task wipes per-tenant data across PG/CH/OS/S3/Redis caches).

---

## PART 17 — Cost Optimization

### Compute

- **Spot instances** for non-critical workloads: fetch workers (Spot-friendly via fast restart), analytics, maintenance. Up to 70% savings.
- **Reserved instances** for steady-state: API gateway, Postgres, Redis, render workers (longer cold-start makes spot less attractive).
- **Karpenter** (or Cluster Autoscaler with mixed pools) to pack pods efficiently.

### Cost guardrails

- Per-namespace budgets in Cost Allocation tags.
- Daily anomaly detection alerts when spend > 2× baseline.
- Per-tenant cost attribution: CPU s × queue, egress bytes, storage GB, third-party API spend. Feeds back into plan pricing.

### Storage tiering

(Recap from Step 9 §17.)

```
hot       S3 Standard / R2 standard        < 90 days
warm      S3 IA / R2 cold                   90 days – 1 year
cold      S3 Glacier Deep Archive           > 1 year
```

R2 used for high-egress assets (signed downloads); S3 used where AWS integration matters (lifecycle, CRR).

### Playwright resource usage

- Resource blocking cuts Chromium CPU/memory by ~40%.
- Browser context recycling (Step 7 §8) prevents long-tail memory bloat.
- Render workers on memory-optimized spot pool where possible.

### Redis memory

- Compression (Step 9 §13) cuts cache memory 60–75%.
- LRU eviction on caches; broker is sized to never evict.
- Hot keys promoted to L0 to relieve cluster.

### PostgreSQL storage

- Time-partitioned tables (Part 4); old partitions detached + dropped or migrated.
- Heavy analytics in ClickHouse, not Postgres.
- BRIN indexes (small) instead of B-tree where the access pattern fits.

### Crawl bandwidth

- HEAD-before-GET when allowed (saves body bytes on unchanged pages).
- Skip body fetch on unchanged ETag/Last-Modified.
- Resource blocking during render.
- Per-region crawling: don't shuttle bytes across regions.

### Cost-saving architecture decisions

1. **ClickHouse over Postgres for analytics** — 10× cheaper per TB at our access patterns.
2. **Cache over recompute** — bandwidth + CPU dominate; cache hit rate ≥ 85% is non-negotiable.
3. **R2 over S3 for downloads** — egress is the largest variable cost.
4. **Spot for crawlers** — restart-tolerant by design; lease semantics make interruption a non-issue.
5. **Self-managed Kafka vs MSK** — break-even analysis revisited yearly; MSK currently chosen for ops simplicity.
6. **Single-flight on cache misses** — the bill for the worst hot key is 1 build, not 5,000.

---

## PART 18 — Data Pipeline Scalability

### Streams

```
Producers                  →  Kafka                →  Consumers / Sinks
crawl workers                  topic.page.fetched     writer-worker → ClickHouse
parse workers                  topic.link.found       backlinks-worker → CH
audit workers                  topic.audit.issue      writer → OpenSearch
scoring service                topic.cache.invalidate cache-invalidator
billing service                topic.usage            usage-rollup
notify worker                  topic.delivery         logs
```

Topic config:

```
replication_factor:    3
min_in_sync_replicas:  2
retention:             7 days (hot topics) / 30 days (billing, audit)
partitions per topic:  sized to peak throughput / 5MB/s (typical partition ceiling)
```

### Batch analytics

- Daily aggregations run in ClickHouse via materialized views + scheduled `INSERT INTO … SELECT`.
- Heavy ad-hoc queries run against read-replicas with statement timeouts.

### Real-time metrics

- Aggregations updated on-event for: queue lag, error rates, fleet health.
- Metrics push directly to Prometheus from each pod; scraped every 15 s.

### Backlink processing pipeline

```
parse-worker emits BacklinkCandidate → q.backlinks.ingest
backlinks-worker:
   validate (Step 7 §4)
   classify_anchor (Step 7 §4)
   write to ClickHouse via writer
   emit backlinks.{new|changed|lost} event
analytics-worker subscribes:
   update target's referring-domain count rollup
   invalidate cache (tag:tgt:{t})
```

### Historical indexing

- Hot partitions (≤ 12 months): on local NVMe-backed ClickHouse storage.
- Warm partitions (12–36 months): on slower EBS.
- Cold (> 36 months): S3-backed ClickHouse storage policy with on-demand fetch.

---

## PART 19 — WebSocket Scalability

### Per-pod targets

```
WS gateway pod:    8–12k concurrent connections
peak fleet:        ~100 pods → ~1M concurrent connections cluster-wide
```

### Architecture

- **Dedicated WebSocket gateway deployment** — distinct from REST API. Different scaling profile (connection count, not RPS).
- **Sticky sessions** at ALB (cookie-affinity or `WebSocket source-IP` hashing) — a reconnect goes to the same pod when possible to reuse the subscription state.
- **Backplane via Redis Pub/Sub** — when an event affects a channel subscribed on multiple pods, Pub/Sub fans out.

### Channels (recap Step 6 §16)

```
/ws/v1/jobs/{job_id}
/ws/v1/projects/{project_id}/events
/ws/v1/dashboard
/ws/v1/notifications
/admin/queue
```

### Backpressure

- Per-channel rate limit on outbound messages (5 msg/s default; aggregate batches above that).
- Per-connection outbound buffer cap (256 KB); slow consumers are dropped with reason `slow-consumer`.

### Reconnect handling

- Server sends `seq` per message; on reconnect, client sends `?since=seq`; server replays from Kafka topic retention or returns "stream gap; refresh".
- Backoff with jitter on client reconnect: 1s, 2s, 5s, 10s; cap 30s.

### Scaling triggers

```
HPA:
  ws-gateway
    target connections per pod: 8000
    cooldown: 300s
    minReplicas: 6
    maxReplicas: 200
```

### Failover

- WebSocket disconnects are expected — design assumes any individual connection lifetime is bounded by network conditions.
- Clients reconnect transparently; sticky session lost during pod death triggers full rejoin.

---

## PART 20 — Testing & Load Testing

### Test pyramid

```
unit                  10k tests, < 1 min runtime
contract              500 tests, runs on PR
component             100 tests, docker-compose, < 5 min
integration           50 scenarios, mini-cluster, < 15 min
end-to-end            10 critical user journeys, < 30 min in staging
load                  weekly, dedicated staging mirror
chaos                 weekly, automated
DR drill              quarterly, manual
```

### Load testing

`k6` (primary) + `Locust` (Python-native; SDK simulation).

Scenarios:

```
scenario.api_hot          200k rps to cached /domains/* endpoints
scenario.api_cold          5k rps to uncached /backlinks/query with random filter hashes
scenario.dashboard         50k rps composite dashboard endpoint
scenario.bulk_submit      10k tasks/s submit via /domains/bulk
scenario.audit_flood      100 concurrent audits, 10k pages each
scenario.ws_connect      500k WebSocket connects + idle (connection count test)
scenario.export_stream    100 simultaneous CSV exports (bandwidth + stream)
```

### Stress test targets

- p95 latency stays within SLO ranges (Part 13).
- Queue lag drains within SLO after burst.
- HPA scales smoothly (no oscillation; cooldown respected).
- DB connection counts stay below limits (PgBouncer absorption verified).
- Redis evictions stay at zero on broker; bounded on cache.

### Chaos engineering

`chaos-mesh` or LitmusChaos in staging:

- Pod kill (random fetch worker, random gateway pod).
- Network delay + partition (toxiproxy on Redis, Kafka).
- DNS failure injection.
- Disk fill (writer node).
- AZ-wide loss (drain all pods in one AZ).

Weekly automated runs; results posted to a dashboard. Any new regression blocks the next release.

### Failover testing

- Monthly Redis primary kill in staging; measure failover time.
- Quarterly Postgres failover in staging.
- Quarterly region failover drill (DR).

### Performance benchmarking

Per release, the pre-prod load runner compares against the previous release:

```
delta p95 latency:        ≤ +5% (else block release)
delta cost-per-1k-req:    ≤ +5% (else flag for review)
delta cache hit ratio:    ≥ -2% (else investigate)
```

### Synthetic traffic

External probes (Checkly / Datadog Synthetics / k6 cloud) hit critical endpoints from all regions every 60 s. The data feeds the "external availability" SLO — what users actually see.

---

## PART 21 — Deployment Pipeline (CI/CD)

### Pipeline stages

```
1. PR opened:
   - lint, type check, unit tests, contract tests
   - build images (PR-tagged)
   - deploy preview namespace in K8s staging cluster
   - run integration tests against preview
   - report results

2. Merge to main:
   - rebuild images (latest + commit SHA tags)
   - push to registry
   - update GitOps repo (Argo CD) — image tag bump

3. Argo CD reconciles:
   - canary deploy: 1% of pods for 30 min
   - automatic rollback if SLO regression detected
   - promote: rolling update across all pods, maxSurge 25%, maxUnavailable 10%

4. Post-deploy:
   - smoke tests against production
   - announce in #releases
   - watch dashboards for 60 min
```

### Tooling

- **GitHub Actions** for build/test/push.
- **Argo CD** for GitOps deploys.
- **Argo Rollouts** for canary + analysis steps.
- **Flagger** alternative — interchangeable.

### Canary analysis

Auto-promote / auto-rollback based on:

```
metrics:
  error_rate              vs baseline +0.5pp threshold
  p95_latency             vs baseline +20% threshold
  queue_lag (workers)     vs baseline +50% threshold
duration: 30 min
samples: 5
```

If three samples breach any threshold → automatic rollback.

### Blue-green for high-risk changes

For breaking infrastructure changes (DB migration that drops a column, broker topology change), we deploy blue-green:

```
1. Stand up green stack alongside blue, fully populated.
2. Mirror 1% production traffic to green; observe.
3. Cut over via DNS or ALB target group swap.
4. Keep blue available for 24h for instant rollback.
5. Drain blue.
```

### Database migrations

- Backward-compatible adds: deploy with the app.
- Backward-incompatible (drop column, rename, type change): two-deploy sequence:
  1. Add new column, dual-write, app reads from both.
  2. Backfill, switch reads, deploy.
  3. Next release: drop old column.

### Automated rollback

Argo Rollouts detects regression → reverts. Operator paged in parallel; manual override available.

### Environment promotion

```
dev (preview namespaces)  → staging (mirror prod data shape, smaller) → production
```

A change can be in staging for hours before prod cutover. No "direct to prod" path for application code (infra changes have a separate review path with similar gates).

---

## PART 22 — Enterprise Maintenance & Runbooks

### Runbook catalog

```
runbooks/
├── api/
│   ├── high-latency.md
│   ├── 5xx-spike.md
│   └── deploy-rollback.md
├── queue/
│   ├── broker-down.md
│   ├── backlog-spike.md
│   ├── dlq-growth.md
│   ├── worker-oom.md
│   ├── beat-drift.md
│   └── shed-degradation.md
├── cache/
│   ├── redis-shard-down.md
│   ├── memory-pressure.md
│   ├── invalidation-storm.md
│   ├── hot-key.md
│   ├── replication-lag.md
│   └── cache-poisoning-recovery.md
├── crawler/
│   ├── queue-backlog.md
│   ├── render-oom.md
│   ├── host-ban-escalation.md
│   ├── clickhouse-write-lag.md
│   └── trap-detection-spike.md
├── db/
│   ├── pg-failover.md
│   ├── pg-pitr.md
│   ├── pg-bloat-cleanup.md
│   ├── ch-shard-rebuild.md
│   ├── ch-merge-backlog.md
│   └── opensearch-yellow-cluster.md
├── data/
│   ├── kafka-lag.md
│   ├── kafka-broker-down.md
│   ├── s3-cross-region-lag.md
│   └── event-replay.md
├── security/
│   ├── api-abuse.md
│   ├── ddos-active.md
│   ├── secret-rotation.md
│   └── compromised-key.md
├── dr/
│   ├── region-failover.md
│   ├── full-platform-recovery.md
│   └── per-tenant-erasure.md
└── ops/
    ├── on-call-handoff.md
    ├── incident-severity-matrix.md
    ├── change-management.md
    └── postmortem-template.md
```

### Operational cadence

```
daily:        on-call hand-off, dashboard review
weekly:       chaos test review, load test diff vs last week, DLQ triage
monthly:      cost review by namespace, capacity planning, runbook drill
quarterly:    DR drill (full region), security review, dependency audits
yearly:       SOC 2 audit, architecture review, vendor evaluations
```

### Scaling events

For predictable surges (product launches, partner integrations, marketing campaigns):

```
T-7 days:    capacity plan reviewed; pre-warm HPA replicas
T-1 day:     scale-up signal turned off for paying tiers; warmer fills hot keys
T-0:         monitor in war room
T+1 day:     scale-down begins; analyze deltas
T+7 days:    post-launch review; permanent capacity adjustments
```

### Infrastructure maintenance

- **Postgres**: minor upgrades during maintenance window (Sundays 03:00–05:00 UTC); major upgrades blue-green.
- **Redis**: rolling restarts; replica first, then primary with failover.
- **Kafka**: rolling broker upgrades; partition leader rebalance after.
- **Kubernetes**: control plane upgrades managed by EKS; node group blue-green replacement quarterly.

### Database maintenance

- Weekly VACUUM ANALYZE on hot tables.
- Monthly REINDEX of bloated indexes (detected via pg_stat_user_indexes).
- Quarterly partition rotation: detach old, create future.

### Redis maintenance

- Weekly AOF rewrite check.
- Monthly memory audit per namespace (Step 9 §24).
- Quarterly TLS cert rotation.

### Crawler maintenance

- Weekly proxy pool health audit.
- Monthly robots cache audit (top 1k hosts).
- Quarterly Bloom filter rebuild from authoritative source.
- Per-release performance baseline of fetch/render/parse pipelines.

### Incident response workflow

```
detect  → page on-call via Alertmanager
ack     → on-call ack within 5 min (24×7 SLA for P1)
declare → incident channel created; commander assigned
contain → runbook executed; stop the bleed
recover → restore service; verify SLO recovery
review  → blameless postmortem within 5 business days
action  → tracked items resolved; runbook updated; alert tuned
```

Severity matrix:

```
SEV1   customer-visible outage of a critical surface; auth/billing/data loss
SEV2   significant degradation (queue lag >> SLO; latency >> SLO)
SEV3   partial degradation; single feature impaired
SEV4   internal-only; no customer impact
```

---

**STEP 10 SCALABILITY PLANNING COMPLETED**

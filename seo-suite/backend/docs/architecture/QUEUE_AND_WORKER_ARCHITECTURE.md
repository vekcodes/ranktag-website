# RankedTag SEO Platform — Queue & Worker System (Step 8)

Production-grade distributed queue and worker infrastructure powering **all asynchronous workloads** on the platform — not just crawling, but exports, audits, rendering, analytics, scheduled refreshes, report generation, billing reconciliation, and notification fanout.

> **Scope.** The queue + worker substrate. Step 7 defined the crawler workloads that ride on it; this step defines the substrate itself and the contracts every workload must obey to run on it safely. Where Step 7 already specifies behavior (e.g. crawler-specific outcomes, per-host token buckets, render trigger heuristics), we reference it rather than repeat.
>
> **Audience.** Backend, infra, SRE, on-call.

---

## Table of Contents

1. [System Topology — Where Queue & Workers Sit](#part-1--system-topology--where-queue--workers-sit)
2. [Worker System Architecture](#part-2--worker-system-architecture)
3. [Celery Architecture](#part-3--celery-architecture)
4. [Redis Queue Architecture](#part-4--redis-queue-architecture)
5. [Task Prioritization](#part-5--task-prioritization)
6. [Task Routing](#part-6--task-routing)
7. [Distributed Worker Coordination](#part-7--distributed-worker-coordination)
8. [Retry System](#part-8--retry-system)
9. [Dead-Letter Queue (DLQ)](#part-9--dead-letter-queue-dlq)
10. [Scheduled Tasks (Beat)](#part-10--scheduled-tasks-beat)
11. [Crawl Job Orchestration](#part-11--crawl-job-orchestration)
12. [Playwright Worker System](#part-12--playwright-worker-system)
13. [Scrapy Worker System](#part-13--scrapy-worker-system)
14. [Backpressure Handling](#part-14--backpressure-handling)
15. [Task Deduplication](#part-15--task-deduplication)
16. [Monitoring & Observability](#part-16--monitoring--observability)
17. [Scalability Strategy](#part-17--scalability-strategy)
18. [Fault Tolerance](#part-18--fault-tolerance)
19. [Security Hardening](#part-19--security-hardening)
20. [Performance Optimization](#part-20--performance-optimization)
21. [Testing Architecture](#part-21--testing-architecture)
22. [Deployment Topology & Folder Structure](#part-22--deployment-topology--folder-structure)

---

## PART 1 — System Topology — Where Queue & Workers Sit

```
                  ┌──────────────────────────────────────────────────────┐
                  │     Public API (Step 6) + Internal API (Step 7)      │
                  │  enqueues tasks via the Producer SDK (Section 3.4)   │
                  └─────────────┬────────────────────────────────────────┘
                                │ submit_task(name, payload, opts)
                                ▼
                  ┌──────────────────────────────────────────────────────┐
                  │            Producer SDK (in-process library)         │
                  │   • idempotency key                                  │
                  │   • payload validation (Pydantic)                    │
                  │   • signing + msgpack encoding                       │
                  │   • routing decision → queue name                    │
                  │   • Outbox write (txn-bound)                         │
                  └─────────────┬────────────────────────────────────────┘
                                │ writes Outbox row + Celery send
                                ▼
                  ┌──────────────────────────────────────────────────────┐
                  │         Redis Cluster — Broker + Coordination        │
                  │  q.*  (lists)        z.delay  z.retry  (zsets)       │
                  │  lock:* lease:* dedup:* throttle:* hb:* leader:*     │
                  └─────────┬─────────────────────────┬──────────────────┘
                            │                         │
                  ┌─────────▼──────┐         ┌────────▼─────────┐
                  │  Worker Fleets │         │  Coordinator     │
                  │  (per class)   │         │  Services        │
                  │  Celery workers│         │  • Beat          │
                  └────────┬───────┘         │  • Promoter loop │
                           │                 │  • Reaper        │
                           │                 │  • DLQ triage    │
                           │                 └──────────────────┘
                           │
                  ┌────────▼─────────────────────────────────┐
                  │  Result + State Sinks                    │
                  │  Postgres (jobs/state) · ClickHouse      │
                  │  S3 (large blobs) · Kafka (events)       │
                  └──────────────────────────────────────────┘
```

### How layers communicate

| From → To | Protocol | Purpose |
|---|---|---|
| API → Producer SDK | in-process call | submit_task; only API holds the right to enqueue |
| Producer SDK → Postgres | sync SQL (same txn) | Outbox row written atomically with business state |
| Outbox relay → Broker | async, batched | At-least-once handoff; survives Redis loss |
| Worker → Broker | Celery / Redis | dequeue, ack, lease refresh |
| Worker → Storage | direct | results, state writes |
| Worker → Event Bus | Kafka | downstream fanout (independent of queue durability) |
| Coordinator → Broker | Redis (Lua) | promoters, leader election, reaper |

### Key principle: **the queue is a substrate, not a service.**

Every async workload on the platform (crawl, audit, export, render, enrich, analytics, scheduled refresh, billing reconciliation, notifications) runs on the **same Celery + Redis substrate** with the same envelope, the same retry policy framework, the same observability. Differences live in (a) task name, (b) target queue, (c) worker class. Nothing else.

This single-substrate rule is what lets one on-call playbook cover all background work.

---

## PART 2 — Worker System Architecture

### Worker classes

Each class is a **separate Kubernetes deployment**, a **separate Docker image**, and consumes a **disjoint queue set**. Classes never share a process — different runtime profiles (CPU vs RAM vs network) cannot coexist on one pod.

| Class | Workload | Concurrency model | Default conc. | Memory budget |
|---|---|---|---|---|
| `fetch`       | HTTP crawl (Step 7)            | asyncio (gevent-free) | 200 tasks  | 512 MB |
| `render`      | Playwright (Step 7 §8)         | 1 process + 8 contexts | 8 tasks   | 1.5 GB |
| `parse`       | HTML → facts + links            | asyncio              | 32 tasks   | 512 MB |
| `discover`    | sitemap/RSS/robots fetch        | asyncio              | 64 tasks   | 384 MB |
| `audit`       | per-page issue extraction       | asyncio              | 16 tasks   | 768 MB |
| `enrich`      | Tranco/WHOIS/GeoIP/Wayback      | asyncio              | 64 tasks   | 384 MB |
| `backlinks`   | candidate ingest + classify     | asyncio              | 32 tasks   | 512 MB |
| `writer`      | batch insert ClickHouse/PG      | asyncio              | 16 tasks   | 512 MB |
| `export`      | CSV/XLSX/PDF generation         | prefork (CPU heavy)  | 4 tasks    | 1.0 GB |
| `analytics`   | aggregations, scoring           | prefork              | 4 tasks    | 1.5 GB |
| `report`      | PDF render (Chromium)           | 1 process + 4 contexts | 4 tasks  | 1.2 GB |
| `notify`      | email/webhook fanout            | asyncio              | 128 tasks  | 256 MB |
| `maintenance` | TTL sweeps, partition mgmt      | prefork              | 2 tasks    | 512 MB |

> Why this many classes: blast radius. A render OOM cannot evict a fetch worker. An export taking 4 CPUs cannot starve notification fanout. Each class scales on its own HPA signal.

### Lifecycle

```
boot
  → load config; init metrics + tracing
  → connect to broker, run a roundtrip ping (fail fast if broker is sick)
  → register: SET worker:{id} {meta} EX 30 ; publish worker.registered
  → join Celery worker pool

steady state
  → loop:
       lease_refresh() every 20s
       prefetch=1 task; process; ack
  → heartbeat: refresh worker:{id} TTL every 10s

graceful shutdown (SIGTERM)
  → stop prefetching new tasks
  → wait for in-flight up to grace window (60s default; 300s for export/render)
  → release leases
  → publish worker.draining → worker.stopped

crash (SIGKILL / OOM / pod evict)
  → no graceful path; lease TTL expires within 60s
  → reaper reclaims leases; in-flight tasks return to retry queue with attempt += 1
```

### Graceful shutdown contract

Every task is **interrupt-safe**: the worker process exits cleanly even mid-task. We achieve this by **never** keeping uncommitted state in memory beyond a single checkpoint:

- Long tasks (audits, crawls, exports) write checkpoints every N units of work to Postgres or S3.
- A task that fails to checkpoint within its grace window is killed; the next attempt resumes from the last checkpoint.

### Rolling deployments

Kubernetes rolling update:

```
maxUnavailable: 10%
maxSurge:       25%
terminationGracePeriodSeconds: 90       (fetch/parse/discover/notify/enrich/backlinks/writer)
terminationGracePeriodSeconds: 360      (audit/export/render/report/analytics)
preStopHook: send SIGTERM to celery; sleep 5
```

In-flight work finishes; queue lag absorbs the rolling capacity dip.

### Autoscaling

KEDA scalers; see Part 17.

---

## PART 3 — Celery Architecture

### Celery app layout

```
app/
└── queue/
    ├── celery_app.py       # the one Celery() instance shared by all classes
    ├── config.py           # broker, result backend, serializer, routes
    ├── routing.py          # task name → queue
    ├── tasks/
    │   ├── crawl.py        # crawl.fetch, crawl.render, crawl.parse, crawl.discover
    │   ├── audit.py        # audit.start, audit.analyze, audit.aggregate
    │   ├── backlinks.py    # backlinks.ingest, backlinks.refresh
    │   ├── enrich.py       # enrich.tranco, enrich.whois, enrich.geoip
    │   ├── exports.py      # export.build, export.upload
    │   ├── analytics.py    # analytics.score_domain, analytics.recompute_dr
    │   ├── notify.py       # notify.email, notify.webhook
    │   ├── maintenance.py  # maintenance.partition_prune, maintenance.bf_compact
    │   └── beat_tasks.py   # scheduled task wrappers
    ├── producer.py         # Producer SDK (Part 1)
    ├── outbox.py           # transactional Outbox writer + relay
    ├── envelope.py         # task envelope + signing
    ├── result_backend.py   # custom result handling (we mostly use Postgres state, not Celery results)
    └── beat_schedule.py    # cron schedule (Part 10)
```

### Task discovery

We **do not** rely on Celery autodiscovery's import-magic. `celery_app.py` explicitly imports every `tasks/*` module. This makes startup deterministic and broken imports loud — never a half-loaded worker silently missing a task name.

### Task envelope (uniform across all tasks)

```python
# illustrative — not implementation
class TaskEnvelope(BaseModel):
    task_id:          str           # ULID
    task_name:        str           # e.g. "crawl.fetch"
    version:          int           # contract version of the payload schema
    org_id:           str | None    # tenant
    job_id:           str | None    # parent job (if any)
    trace_id:         str           # W3C trace id (propagates to spans/logs)
    idempotency_key:  str | None    # SHA-256 of dedup-relevant fields
    enqueued_at:      datetime
    not_before:       datetime | None
    attempt:          int           # starts at 1
    max_attempts:     int
    priority_class:   int           # 0..3 (p0..p3)
    tier:             str           # free | pro | biz | enterprise | internal
    cost_estimate:    int           # token units for budget tracking
    payload:          dict          # task-specific, schema-validated
    signature:        str           # HMAC over canonical(envelope) (Part 19)
```

Every task receives this envelope; task code reads `envelope.payload`, never positional kwargs. Schema is versioned per-task so producer and consumer can deploy independently.

### Routing

`routing.py` maps `task_name` to a queue based on **task name prefix** and **priority class**:

```
crawl.fetch        → q.fetch.p{0..3}
crawl.render       → q.render
crawl.parse        → q.parse
crawl.discover     → q.discover
audit.*            → q.audit.{stage}
backlinks.ingest   → q.backlinks.ingest
backlinks.refresh  → q.backlinks.refresh
enrich.*           → q.enrich
export.build       → q.export.{small|large}     # by estimated rows
analytics.*        → q.analytics
notify.*           → q.notify
maintenance.*      → q.maintenance
report.*           → q.report
```

Workers subscribe to disjoint queue sets (Part 6). The routing function is **pure** and synchronous; it's called once at submit-time by the Producer SDK.

### Workflows: chains, groups, chords

We use Celery primitives but never persist canvas state in the Celery result backend (which is fragile). Instead, **workflow state lives in Postgres** as job rows; the canvas is only a way to express "run these in sequence/parallel".

| Pattern | Used for |
|---|---|
| **chain**  | `audit.start → audit.crawl → audit.analyze → audit.aggregate` |
| **group**  | bulk fan-out: 10,000 `crawl.fetch` for a bulk-domain job |
| **chord**  | group + completion callback: "when all enrich tasks finish, recompute DR" |
| **map / starmap** | not used (state in env, not Celery internals) |

Chords use a **dedicated counter key in Redis** (`chord:{chord_id}:remaining` decremented atomically) rather than Celery's default result-backend chord counter, which doesn't scale past ~10k members.

### Workers

```
celery -A app.queue.celery_app worker \
    -Q q.fetch.p0,q.fetch.p1,q.fetch.p2,q.fetch.p3 \
    --pool=gevent \
    --concurrency=200 \
    --prefetch-multiplier=1 \
    --max-tasks-per-child=10000 \
    --max-memory-per-child=400000 \
    --without-mingle --without-gossip
```

| Setting | Why |
|---|---|
| `--pool=gevent` for IO-bound classes, `--pool=prefork` for CPU-bound | match workload |
| `--prefetch-multiplier=1` | don't hoard; let other workers help drain backlog |
| `--max-tasks-per-child=N` | bound long-tail memory leaks |
| `--max-memory-per-child=KB` | kill child before OOM; lease reclaim handles work |
| `task_acks_late=True` | ack only after success — crash-safe |
| `task_reject_on_worker_lost=True` | auto-requeue on SIGKILL |
| `--without-mingle --without-gossip` | turn off worker gossip; we have our own coordination (Part 7) |

### Result handling

Celery's default result backend is **not** used for business state. Instead:

- Long-running tasks write status to Postgres `jobs` table directly.
- Short tasks return `None`; caller polls Postgres or subscribes to events.
- Celery's `task-succeeded` / `task-failed` events feed metrics only.

This avoids the well-known scaling problems of using Redis as a result backend at high throughput.

---

## PART 4 — Redis Queue Architecture

### Redis topology

Two clusters; never one:

```
redis-broker     — Celery broker. AOF every 1s. 3 shards × 2 replicas.
redis-cache      — politeness, dedup, robots, results, leases. Same shape, separate cluster.
```

Splitting them means an analytics workload spike on the cache cluster can't degrade task delivery.

### Key namespaces

```
q.<class>[.p<n>]              LIST   # Celery queues
z.delay                       ZSET   # delayed tasks (ready_at_ts)
z.retry                       ZSET   # retry tasks (ready_at_ts)
z.beat                        ZSET   # scheduled tasks (ready_at_ts)
host:<etld+1>                 LIST   # per-host fetch buffer (Step 7)
lock:<scope>:<key>            STRING # generic mutex via SET NX PX
lease:shard:<shard_id>        STRING # shard ownership (Step 7)
lease:task:<task_id>          STRING # exclusive task execution
dedup:<scope>:<fingerprint>   STRING # task fingerprint (Part 15)
dedup:bf:global               BLOOM  # Bloom filter (Step 7)
hb:worker:<worker_id>         STRING # heartbeat; TTL refreshed
hb:queue_depth:<queue>        STRING # last-known depth (for HPA)
throttle:<scope>:<key>        HASH   # token bucket: tokens, last_refill
leader:<role>                 STRING # SET NX EX 30 for leader election
seen:<job_id>                 SET    # per-job dedup (URL hash etc.)
seen:<job_id>:bf              BLOOM  # per-job Bloom (huge jobs)
chord:<chord_id>:remaining    STRING # chord counter (atomic DECR)
events:<topic>                STREAM # internal pub/sub fallback (Kafka primary)
backlog:<queue>:<minute>      STRING # per-minute counter for rate dashboards
```

### TTL strategy

| Key class | TTL | Why |
|---|---|---|
| `q.*` (queues)              | none           | persistent until consumed |
| `z.delay` / `z.retry`        | none           | promoter handles eviction |
| `lock:*`                    | 30–300 s        | bounded; force-release via TTL on crash |
| `lease:*`                   | 60 s, refresh 20s | crash-safe ownership |
| `dedup:*` (per-job)         | = job lifetime  | tied to job record |
| `dedup:*` (global)          | 24 h            | rolling window |
| `hb:worker:*`               | 30 s, refresh 10s | dead worker detection |
| `throttle:*`                | 1 h             | bucket recovers naturally |
| `leader:*`                  | 30 s, refresh 10s | leader election |
| `seen:*` (sets)             | = job lifetime  | per-job dedup |
| `chord:*`                   | 24 h            | safety net |

### Distributed locks

Two flavors:

1. **Short locks** — `SET lock:<k> <token> NX PX <ttl>`. Single-instance is fine for non-critical mutual exclusion (cache stampede, "only one writer per host"). We **do not** use RedLock — it has well-known correctness issues and we don't need them: leases on long work and idempotent task design make locks advisory, not safety-critical.
2. **Fenced leases** — for ownership of long work, we issue a **monotonic lease token** (`INCR lease_seq`) and store it alongside the lease key. Writers stamp the lease token on every external write; downstream rejects writes from stale tokens. This survives the "lock expired but task still running" failure case correctly.

### Deduplication keys

```
dedup:task:{name}:{fingerprint}   → task_id   (TTL = uniqueness window)
```

Fingerprint = `blake2b(sorted(payload-keys-marked-as-dedup-relevant))`. See Part 15.

### Optimization for throughput

- **Pipelining** — promoters batch reads/writes via `MULTI`/`EXEC`.
- **Lua scripts** for atomic ops: token-bucket take, lease acquire-or-refresh, dedup-or-enqueue.
- **Cluster slot affinity** — task envelopes hashed so per-job state co-locates: `seen:{job_id}` and `lease:shard:{job_id}:*` share a slot.
- **AOF + RDB** persistence — AOF every 1 s; RDB snapshot every 5 min for fast restore.
- **Connection pools**: each worker process opens 1 connection per Redis shard; multiplexed via async.

---

## PART 5 — Task Prioritization

### Inputs

```
P_task = clamp(
    0.30 × tier_weight        # free=10, pro=30, biz=60, ent=100
  + 0.20 × job_urgency        # audit_running=80, freshness=50, refresh=30, scheduled=20
  + 0.15 × authority_score    # DR/DA of the affected domain
  + 0.10 × freshness_need     # time since last successful processing
  + 0.10 × retry_penalty      # boost retries to avoid stuck jobs (capped at +20)
  + 0.10 × system_load_inv    # global queue lag inverse: when system is healthy, distribute fairness
  + 0.05 × sitemap_priority   # sitemap-declared priority where applicable
  , 0, 100)
```

Routing (default thresholds):

```
P ≥ 75  → q.<class>.p0
P ≥ 55  → q.<class>.p1
P ≥ 30  → q.<class>.p2
else    → q.<class>.p3
```

> **System-load damping.** When `q.fetch.p0` lag exceeds its SLO (Part 16), the prioritizer **reduces** `system_load_inv` for new submissions — this naturally throttles low-tier work first while preserving p0 for paying customers.

### Premium prioritization

Enterprise tasks are **never** placed below p1. Even a low-urgency enterprise refresh enters `p1` with a floor enforcement step:

```
if tier == "enterprise" and queue == "p3": queue = "p1"
if tier == "business"   and queue == "p3": queue = "p2"
```

### Dynamic prioritization

A background job (`maintenance.repriority`) every 60 s scans queues with lag > SLO and **promotes** waiting tasks one tier (p3 → p2, p2 → p1) if they've waited longer than tier-specific aging thresholds:

```
aging[free]  = 1 h     # then promote one tier
aging[pro]   = 15 min
aging[biz]   = 5 min
aging[ent]   = 1 min
```

Promotion is **capped at one step** per scan to avoid runaway escalation.

### Starvation prevention

Two mechanisms together:

1. **Weighted round-robin dequeue** within a worker class — workers subscribe to `p0..p3` and Celery routes by priority, but the worker enforces a soft weighting (10/6/3/1) so p3 is guaranteed to drain even under p0 pressure.
2. **Aging** as above ensures every task eventually reaches a high-priority queue.

This pair guarantees free-tier work is never indefinitely starved while still letting enterprise jobs front-run.

---

## PART 6 — Task Routing

### Routing strategies

| Strategy | When | Mechanism |
|---|---|---|
| **By task name prefix** | always | static map in `routing.py` |
| **By priority** | `crawl.fetch`, `export.build` | append `.pN` to queue |
| **By payload size** | `export.build` (rows estimate) | small/large queue split |
| **By worker capability** | `crawl.render`, `report.pdf` | dedicated class with Chromium |
| **By tenant tier** | enterprise audits | tier_floor enforcement (Part 5) |
| **Geographic** | `crawl.fetch` for geo-restricted content | per-region queue + per-region worker pool |
| **By memory class** | `analytics.recompute_dr` (heavy join) | high-mem worker class |

### Geographic routing

When a customer audits a site requiring a specific geography (geoblocked content, hreflang tests):

```
queues per region:
  q.fetch.{region}.p{0..3}        # us, eu, ap, sa
  q.render.{region}
worker deployments per region as separate Kubernetes clusters (or node pools)
```

Region selection is part of the task envelope (`payload.region`). Producer SDK appends the suffix during routing. Cross-region tasks pay an egress cost — accounted for in `cost_estimate`.

### Worker capability matching

Each worker registers capabilities at boot:

```
worker:{id} → {
  class:       "render",
  region:      "us-east-1",
  chromium:    "131.0.6778",
  memory_mb:   1536,
  features:    ["pdf","screenshot"]
}
```

Capabilities are **advertised** but not **enforced** through Celery routing — instead we rely on queue separation (the worker only subscribes to queues it can serve). The capability registry is consulted by:

- The admin UI (fleet view).
- Heartbeat / health checks.
- The DLQ replayer (route to a worker that has the right capability).

### Optimization

- Routing is O(1) — a frozen dict lookup at submit time.
- The mapping is **codified once**; queue names are not constructed ad hoc in business code (only the SDK names queues).
- A queue rename requires a migration in `routing.py`, a deploy of producers, then a deploy of workers — never reversed.

---

## PART 7 — Distributed Worker Coordination

### Registration & heartbeat

Boot:

```
SET hb:worker:{id} {meta_json} EX 30
PUBLISH worker.events worker.registered {id}
```

Tick every 10 s:

```
EXPIRE hb:worker:{id} 30
INCR hb:worker:{id}:beats
```

### Reaper (single instance, leader-elected)

Every 5 s:

```
1. SCAN hb:worker:*
2. for each worker key not seen in 30s:
     PUBLISH worker.events worker.dead {id, reason="hb-timeout"}
     reclaim leases owned by {id}:
       SCAN lease:*:{id}
       for each: DEL lease key; push owned tasks to z.retry with attempt += 1
3. update fleet view in Postgres workers table
```

Leader election:

```
SET leader:reaper {pod_id} NX EX 30
EXPIRE leader:reaper 30   (refresh every 10s on success)
```

Multiple reaper pods compete for the lease; only the holder runs the loop. Failover ≤ 30 s.

### Avoiding duplicate work

Three independent layers (any one alone suffices for many tasks; together they're defense-in-depth):

1. **Pre-enqueue dedup** — Producer SDK checks `dedup:task:{name}:{fingerprint}`. If present and not expired, returns the existing `task_id` instead of enqueueing.
2. **Lease at execution** — long-running tasks acquire `lease:task:{task_id}` for the duration; a second execution of the same `task_id` fails to acquire and exits.
3. **Idempotent task code** — every task is written so that re-execution is a no-op or a safe upsert keyed on `(task_id, attempt-irrelevant-key)`. This is **mandatory**; tests enforce it.

### Dead-worker detection cascade

```
heartbeat missed (10s)  → soft warning in metrics
heartbeat missed (30s)  → marked "unhealthy"; new tasks routed elsewhere
heartbeat missed (90s)  → declared "dead"; leases reclaimed
```

Reclaimed task envelopes are re-enqueued with `attempt += 1` and `cause="worker_dead"` — visible in retry telemetry.

### Capability discovery

`GET /admin/workers` (Step 6) reads from the heartbeat registry and joins to Postgres for historical stats. Used to:

- Show fleet status in the admin dashboard.
- Manually drain a worker (`POST /admin/workers/{id}/drain`).
- Decide where to replay a DLQ task that needs a specific capability.

---

## PART 8 — Retry System

### Retry policy is **per-task**, declared at the task definition site

```python
@task(
    name="crawl.fetch",
    max_attempts=5,
    retry_on=(TimeoutError, ConnResetError, ServerError),
    backoff=ExponentialJitter(base=2.0, cap=1800.0),
    no_retry_on=(RobotsDisallowError, BodyTooLargeError),
)
def fetch(envelope): ...
```

Three classes of exception:

| Class | Behavior |
|---|---|
| `retry_on`         | enqueue to `z.retry` with backoff |
| `no_retry_on`      | record outcome, mark done, no retry |
| anything else (unhandled) | enqueue to `z.retry` (treated as transient) up to 3 attempts; then DLQ |

### Backoff formula (decorrelated jitter)

```
delay = min(cap, random.uniform(base, prev_delay * 3))
```

Anti-pattern avoided: synchronized retries from many workers hitting a recovering host at the same moment.

Concrete defaults (override per task):

```
crawl.fetch        base=2,   cap=1800   max=5
crawl.render       base=5,   cap=300    max=3
export.build       base=10,  cap=600    max=3
notify.email       base=30,  cap=3600   max=8     # backoff longer for email retries
enrich.tranco      base=60,  cap=3600   max=5     # external API may be down
backlinks.ingest   base=1,   cap=60     max=10    # transient by nature
```

### Retry-safe design rules

1. **Idempotent** writes (upsert on `(task_id, attempt-irrelevant-key)`).
2. **Checkpoint** at the smallest stable unit of work (one URL, one row batch).
3. **Side effects first** only when ack-safe (e.g. webhook delivery uses idempotency keys at the receiver, and we send `Idempotency-Key: {task_id}`).
4. **No reliance on attempt count** for correctness — only for backoff and DLQ routing.

### Failure escalation

```
attempt 1..max_attempts  → retry with backoff
attempt > max_attempts   → DLQ with full envelope + last error
```

Some tasks have **escalation paths** instead of plain DLQ:

```
crawl.fetch
  attempt 3 fails with 403_BLOCKED   → re-enqueue with payload.proxy="datacenter"
  attempt 5 fails                    → re-enqueue with payload.proxy="residential"
  attempt 7 fails                    → DLQ
```

Escalation is declarative — encoded in task metadata, not scattered in handler code.

### Retry promoter

A single loop (leader-elected) every 500 ms:

```
ready = ZRANGEBYSCORE("z.retry", 0, now(), LIMIT 0 2000)
pipeline:
  for env in ready:
    LPUSH(env.queue, env)
    ZREM("z.retry", env)
PUBLISH retry.promoted batch_size
```

---

## PART 9 — Dead-Letter Queue (DLQ)

### What ends up in DLQ

| Cause | Examples |
|---|---|
| Permanent failures      | corrupt payload, invalid signature, unknown task name |
| Repeated transient fails | `crawl.fetch` 5 timeouts on the same URL |
| Schema migration mismatches | older worker can't decode newer payload version |
| Quota / billing failures | tenant disabled mid-job |

### Topology

```
q.dlq.<class>             # one DLQ per worker class; preserves capability requirement
  payload = full envelope + last_error + history[attempts]
```

DLQ entries retain for 30 days; longer for paying-tier audits (90 days).

### Inspection tools

`/admin/jobs/dlq` (Step 6) exposes:

```
filter by:  task_name, error_class, tenant, host, age
group by:   error_class
sample:     latest 100 envelopes (redacted) for quick triage
```

### Replay

Replay is **explicit** and **per-envelope**:

```
POST /admin/jobs/dlq/{task_id}/replay
   options: { reset_attempt: bool, override_queue: str | null, edit_payload: jsonpatch | null }
```

Replay validates the payload schema again, re-signs the envelope, and pushes to the original queue (or override). A replay is tagged with `replayed_from` so it doesn't masquerade as a fresh task in metrics.

### Bulk replay

For known recoveries (e.g. "we fixed the proxy outage; replay all DLQ entries from 14:00-15:00 with error_class=PROXY_BAD"):

```
POST /admin/jobs/dlq/replay-bulk
  body: { filter: {…}, sample_first: false, override_queue: null }
```

A bulk replay creates a **replay job**; the dispatcher iterates DLQ entries matching the filter, paced to avoid re-overloading downstream.

### Categorization

The DLQ triage worker (`maintenance.dlq_triage`) runs every 5 min:

```
- aggregates DLQ entries by (task_name, error_class)
- writes a summary row in admin_dlq_stats
- alerts if any (task_name, error_class) bucket grows > threshold (default 100/h)
```

### Alerting

```
PagerDuty severity:
  P1 — DLQ growth > 5x baseline within 10 min on any class
  P2 — DLQ for tier=enterprise tasks grows at any rate
  P3 — single envelope with error_class in {PAYLOAD_INVALID, SIGNATURE_FAIL}
       (indicates producer/consumer schema drift)
```

---

## PART 10 — Scheduled Tasks (Beat)

### Beat infrastructure

Celery Beat runs as a **separate StatefulSet** (1 active + 1 standby with leader election; never multiple active — that causes duplicate emissions).

```
StatefulSet: queue-beat
  replicas: 2
  electLeader via leader:beat key (30s TTL, 10s refresh)
  schedule loaded from beat_schedule.py + DB overrides
```

### Schedule (illustrative)

```
maintenance.partition_prune        every  6 h
maintenance.bf_compact             daily  03:00 UTC
maintenance.dlq_triage             every  5 min
maintenance.repriority             every  60 s
maintenance.host_cadence_recompute weekly Sunday 04:00 UTC
maintenance.proxy_health_check     every  5 min
maintenance.robots_refresh_top10k  every  1 h
maintenance.expire_export_blobs    every 30 min
backlinks.refresh_top_DR70         every  1 h    # source pages with DR ≥ 70
backlinks.refresh_top_DR40         every  6 h
backlinks.refresh_remainder        daily  02:00 UTC
analytics.recompute_DA_DR          daily  01:00 UTC
analytics.usage_rollup             every  15 min
analytics.cost_attribution         hourly
billing.reconcile_stripe           every  10 min
notify.digest_email                daily  09:00 user-local
report.scheduled                   per-user cron (DB-defined)
```

### Per-tenant scheduling

Schedules that are **per-tenant** (scheduled exports, scheduled reports, scheduled refreshes) **do not** live in `beat_schedule.py`. They live in Postgres `scheduled_jobs` and Beat reads them every minute:

```
SELECT id, cron, payload FROM scheduled_jobs
  WHERE next_run_at <= now() AND state='active'
  FOR UPDATE SKIP LOCKED
  LIMIT 500;
```

Each row produces one task submission. `next_run_at` is recomputed atomically in the same txn — multiple Beat replicas racing is harmless (one wins the row lock).

### Priority rules for scheduled tasks

- Beat-emitted tasks default to `priority_class=2` (p2).
- Tenant-scheduled exports inherit tenant tier (enterprise → p1).
- Maintenance tasks are p3 unless they unblock the system (DLQ triage is p1).

### Backfill

If Beat is down for more than one period of a task, the standby resumes from `next_run_at` in the DB — it does **not** flood with backfills. Maintenance tasks are designed to be idempotent over the missed window.

---

## PART 11 — Crawl Job Orchestration

> Crawl-specific orchestration referenced from Step 7 §11. Here we describe how it composes on the queue substrate.

### Orchestration pattern: **planner + executor + aggregator**

```
1. planner task            (audit.start)
       - reads job from DB
       - resolves seed URLs (robots, sitemap)
       - writes initial shard plan to Postgres
       - emits N executor tasks (q.audit.crawl) in groups of 1000

2. executor tasks           (audit.crawl)
       - lease shard
       - fetch + render + parse (sub-tasks via queue chain or direct call)
       - on N=100 URLs: checkpoint progress
       - on shard done: enqueue analyze chord member

3. aggregator chord head    (audit.aggregate)
       - fires when all executor tasks complete
       - rolls up issues, computes score
       - flips job state → completed; emits event
```

State machine for jobs:

```
queued → scheduled → running → succeeded
                          ↘ failed     (terminal)
                          ↘ partial    (some shards succeeded, some DLQ)
                          ↘ cancelled
```

### Frontier management

The **frontier** is the unit that maps cleanly onto the queue. For every URL admitted, the planner enqueues one `crawl.fetch` task. Step 7 §3 specifies the frontier scoring; this layer just pushes to the right priority queue.

### Crawl budget

Per-tenant URL budget is decremented atomically in Redis (`DECR budget:{tenant}:{day}`) before each `crawl.fetch` is enqueued. Hitting 0 routes new URLs to `z.delay` with `ready_at = next_period_start`. Hard caps prevent runaway crawls.

### Recursive crawl expansion

Parsed pages enqueue child URLs via the same `crawl.fetch` task. To prevent unbounded expansion:

```
max_depth                   (per job; default 10)
max_pages_per_host          (per job + per host)
max_pages_total             (per job; tier-bound)
host_cap_token_bucket       (rate-limits expansion)
```

These caps are checked in the **admitter** (Step 7 §3), so the queue never sees URLs over budget.

### Completion tracking

A job is "complete" when:

```
state(jobs) = running
AND queue_depth(job_id) = 0
AND no shard is leased
AND no retry entry references this job
```

Computed by a Postgres view + cached in Redis (`job:state:{job_id}`). Updated incrementally as shards close — never by scanning all queues.

---

## PART 12 — Playwright Worker System

### Worker classes (render-specific)

```
render-light    SPA detection done; lightweight pages; concurrency=12
render-heavy    Heavy SPAs, lazy-loaded; concurrency=4
render-pdf      PDF report rendering; concurrency=4
```

Each is a separate Kubernetes deployment with **separate** Chromium image (size optimizations differ). Three queues:

```
q.render.light
q.render.heavy
q.render.pdf
```

Trigger heuristics from Step 7 §8 select which queue.

### Browser pooling

```
on pod boot:
  launch 1 Chromium process
  warm 1 BrowserContext (cookies/storage)
  ready for tasks

per task:
  acquire context from pool (semaphore)
  context.newPage() OR reuse single page if pool size > task slots
  navigate, capture, return
  release context

every 50 tasks per context: close context, create fresh
every 5000 tasks per browser OR 2 h: relaunch browser
```

Pooling reduces page-create overhead from ~80 ms to ~5 ms.

### Memory management

- Container cgroup memory limit = pod memory limit; Chromium's `--js-flags=--max-old-space-size=512` caps V8 heap.
- A per-task watcher kills the page (`page.close()`) if pod RSS approaches 95% of limit.
- Pod OOM kill is acceptable; lease reclaim handles task recovery.

### Concurrency

```
render-light pod:  12 contexts × 1 page each;  ~1.2 GB resident
render-heavy pod:  4  contexts × 1 page each;  ~1.5 GB resident
render-pdf   pod:  4  contexts × 1 page each;  ~1.2 GB resident
```

### Optimization

- Block `image`, `media`, `font` resources by default; unblock per-task when audits need them.
- Block third-party analytics by URL pattern.
- Disable image decoding for non-screenshot tasks.
- Use a shared user-data-dir mounted read-only with the cache pre-warmed (login pages, common CDN preconnects).

### Startup speed

- Image keeps Chromium pre-extracted at a known path.
- `playwright install --with-deps chromium` at build time, not runtime.
- Cold boot ≤ 5 s, ready ≤ 8 s.

---

## PART 13 — Scrapy Worker System

> Scrapy is used selectively (Step 7 §9). On the queue substrate it appears as a different worker class with its own pool, sharing the same Redis broker.

### Scrapy worker deployment

```
Deployment: queue-scrapy-worker
  replicas: HPA-driven (Part 17)
  command: scrapy crawl <spider> --loglevel=WARNING
  one Scrapy process per pod; concurrency tuned per spider
```

### Spider scheduling

The **default** Scrapy scheduler is replaced with a Redis-backed scheduler that reads from a shared frontier (`scrapy:frontier:{spider}` — a Redis zset scored by priority). This lets multiple Scrapy pods cooperate without duplicate fetches.

```
scrapy-redis style:
  on Spider open: subscribe to scrapy:frontier:{spider}
  yield Request from ZPOPMAX
  on Request finished: emit items via pipeline → Kafka → q.parse for shared processing
```

### Coordination with Celery

Items emitted by Scrapy pipelines are **not** stored locally; they're handed off to the same downstream `q.parse` / `q.backlinks.ingest` queues used by Celery `crawl.fetch`. From there, the rest of the pipeline is identical.

### Spider lifecycle

```
beat.scrapy_kick     enqueues a "start" message per spider every interval
worker picks up      starts a Scrapy process with the spider name
process runs         until frontier is empty AND queue idle for N seconds
process exits        worker reclaims pod for next start
```

This makes Scrapy spiders behave like long-running tasks on the queue substrate — no special-case orchestration.

### Crawl pipelines

```
ITEM_PIPELINES = {
  pipelines.validate.Validate:      100,
  pipelines.normalize.Normalize:    200,
  pipelines.enrich.Enrich:          300,
  pipelines.batch_write.BatchWrite: 400,
  pipelines.event_emit.EventEmit:   500,
}
```

`BatchWrite` buffers items and posts batches to `q.writer`. `EventEmit` publishes to Kafka. Nothing writes synchronously to ClickHouse from Scrapy.

---

## PART 14 — Backpressure Handling

### Layers of backpressure

```
client (API)
   ↑ 429 / Retry-After
   │
gateway rate limit (Step 6 Part 18)
   ↑ 429
   │
producer SDK
   ↑ "queue saturated" → 503 from API
   │
queue lag SLO breach
   ↑ Beat slows non-critical schedules
   │
worker prefetch=1
   ↑ workers don't hoard
   │
storage write SLO breach
   ↑ workers pause acks → queues build → HPA scales writers (not crawlers)
```

### Queue overload

When `queue_depth(q.fetch.p2) > 200,000` for > 5 min:

1. **Stop new free-tier admissions** (producer SDK returns 503 for free tier).
2. **Promoter slows aging promotions** (don't promote p3 → p2 while p2 itself is over).
3. **Scale fetch-worker** via KEDA.
4. **Alert** P2 if not resolved in 15 min.

### Worker overload

Worker reports `system_load_5m > cores * 0.9` for > 2 min:

- Worker stops fetching new tasks (`celery inspect autoscale=down`).
- Marked `unhealthy`; reaper does **not** kill it (it's processing, not dead) — but HPA sees the signal and adds capacity.

### Redis overload

Redis cluster monitor watches `instantaneous_ops_per_sec` and `used_memory_rss`:

```
ops > 80k/s sustained:
   producer SDK switches to batched submit (group 50 tasks into one MULTI)
   non-critical schedules paused
memory > 75%:
   trigger BLOOM compaction; trim oldest dedup entries
memory > 90%:
   reject new task submissions (producer raises QueueOverload; API returns 503 with Retry-After)
```

### Database overload

Postgres / ClickHouse latency p95 > 500 ms:

- Writer workers reduce batch sizes (smaller, more frequent) — reduces lock contention.
- Workers stop acking long-tail tasks (so queue grows, HPA scales).
- Crawl admitter slows new admissions; crawl can wait, ingest can't.

### Adaptive concurrency

Each async worker class implements an **adaptive concurrency** loop:

```
target_concurrency =
    base
  - 10 × (1 if downstream_p95 > slo else 0)
  - 5  × (1 if local_cpu > 80% else 0)
  + 5  × (1 if queue_lag > slo and local_cpu < 50% else 0)
clamped to [min_conc, max_conc]
```

Updated every 5 s. Slow start, fast back-off — the standard congestion-control pattern.

### Circuit breakers

Per downstream (Stripe, GeoIP API, Tranco API, internal scoring service):

```
state: closed → open (after N failures in W seconds) → half-open (probe) → closed
trip threshold: 50% errors in 30 s OR 20 consecutive failures
open duration: 60 s (then half-open)
```

Tasks calling a broken downstream short-circuit to `RETRY` with the breaker's recovery time, not the task's normal backoff — prevents flooding the recovering service.

### Graceful degradation

Each tenant tier has a defined degradation order:

```
free tier:        scheduled refreshes paused → bulk exports paused → live API still works
pro tier:         scheduled exports paused   → bulk exports paused → live API still works
business tier:    bulk exports degraded (smaller chunks) → live API still works
enterprise tier:  best-effort to preserve everything
```

Toggled by a single feature flag the SRE on-call can flip in under 30 s.

---

## PART 15 — Task Deduplication

### Fingerprint

Each task type declares **dedup-relevant fields**:

```
crawl.fetch        : (url_hash, job_id)
crawl.render       : (url_hash, render_options_hash)
backlinks.refresh  : (source_url_hash)
export.build       : (job_id, format, filter_hash)
analytics.recompute_DA_DR : (domain, asof_date)
notify.email       : (recipient, template, payload_hash)
```

The fingerprint is `blake2b(canonical_json(relevant_fields), 16 bytes)`.

### Uniqueness window

```
crawl.fetch        : 1 h         (don't re-fetch same URL within 1h unless forced)
crawl.render       : 6 h
backlinks.refresh  : 30 min      (manual triggers; scheduled refresh has its own dedup)
export.build       : 24 h        (avoid re-billing for accidental double-submits)
notify.email       : 1 h         (avoid sending the same email twice on retry storms)
analytics.recompute: 1 h
```

Window = TTL on `dedup:task:{name}:{fingerprint}`.

### Lock-based execution

For tasks that **must** run alone even if dedup misses (e.g. partition prune, DA recompute for one domain):

```
acquired = SET lock:{scope}:{key} {token} NX PX 600000
if not acquired: log skipped, return
# … do work, refreshing lock token periodically …
DEL lock:{scope}:{key} only if token still matches  (Lua CAS)
```

### Where dedup happens

1. **Producer SDK** — before enqueue.
2. **Worker** — re-check at task start (catches the small window between submit and consume where a second producer raced).
3. **Idempotent writes** — final safety net; even if both checks miss, the write upserts on the natural key.

### Reset / force-run

`POST /admin/tasks/dedup/{fingerprint}/clear` removes the dedup key so a re-submission goes through. Audited.

---

## PART 16 — Monitoring & Observability

### Metrics (Prometheus)

```
# throughput
task_enqueued_total{task_name,queue,tier}
task_started_total{task_name,worker_class}
task_completed_total{task_name,status}            # succeeded|failed|retry|dlq
task_duration_seconds{task_name}                  (histogram)
task_payload_bytes{task_name}                     (histogram)

# queues
queue_depth{queue}                                (gauge)
queue_lag_seconds{queue}                          (gauge; oldest-now)
queue_promoted_total{from,to}
queue_admitted_total{queue,tier}
queue_rejected_total{queue,reason}

# workers
worker_active_tasks{class,worker_id}              (gauge)
worker_max_concurrency{class}                     (gauge)
worker_state{class,state}                         (gauge)   # state in {idle,running,draining,unhealthy}
worker_leases_held{class}
worker_uptime_seconds{class}
worker_oom_total{class}
worker_restarts_total{class}

# retry / dlq
task_retry_total{task_name,reason}
task_dlq_total{task_name,error_class,tier}
dlq_depth{queue}                                  (gauge)

# system
redis_ops_per_sec
redis_memory_rss_bytes
broker_latency_seconds                            (histogram)
celery_canvas_chord_member_remaining              (gauge)

# scheduled
beat_emitted_total{schedule_name}
beat_drift_seconds{schedule_name}                 (gauge)
```

### Cardinality discipline

- Never label by raw `task_id`, `url`, `host`, `tenant_id`. Always bucket (`host_class`, `tenant_tier`).
- `task_name` cardinality is bounded (~40 names) — safe.

### Tracing

- W3C trace context: `traceparent` header → task envelope → worker spans.
- Spans per stage: `submit`, `enqueue`, `wait_in_queue`, `lease`, `execute`, `ack`.
- 100% sampling on errors; 5% on success at default; 100% on `admin` runs.

### Logs

JSON only. Required fields:

```
ts level service trace_id span_id task_id task_name queue worker_id
attempt status latency_ms tier org_id job_id outcome
```

No PII, no raw URLs in production logs (URL hash only). Body samples gated behind a debug flag with redaction.

### Flower

Flower is used for **operator inspection only** (read-only, behind SSO + MFA). It's not the primary observability surface — Grafana is. Flower is gold for queue/worker debugging at a single moment in time.

### Sentry

Worker exceptions report with `trace_id`, `task_name`, `attempt`. Sentry rate-limited to 10/min/class/stack-hash to survive log storms.

### Dashboards

```
Grafana: Queue — Throughput              # tasks/s, by class/queue/tier
Grafana: Queue — Lag + SLOs              # per-queue lag with SLO bands
Grafana: Queue — Retries + DLQ           # retry/s, DLQ growth, error classes
Grafana: Workers — Fleet                 # active, healthy, oom, restarts
Grafana: Workers — Utilization           # active_tasks / max_concurrency by class
Grafana: Beat — Schedule Drift           # emitted vs scheduled
Grafana: Backpressure                    # circuit breaker states, adaptive conc.
Grafana: Tenants — Tier Usage            # tier-segmented throughput + lag
```

### SLOs

```
enqueue → start (p0)      p95 ≤ 5 s
enqueue → start (p1)      p95 ≤ 30 s
enqueue → start (p2)      p95 ≤ 5 min
enqueue → start (p3)      p95 ≤ 1 h
task success rate         ≥ 99.5% (excluding designated no-retry outcomes)
DLQ growth                ≤ 100/h sustained per task_name
Beat schedule drift       ≤ 5 s
```

Multi-window, multi-burn-rate alerts on each.

---

## PART 17 — Scalability Strategy

### Target envelope

```
peak task submit:                500k tasks/s sustained (mixed classes)
queues in flight:                10–50M tasks
fetch concurrency cluster-wide:  100k
render concurrency cluster-wide: 4k
workers per class peak:          5k (fetch) / 500 (render) / 1k (parse) / etc.
broker:                          3-shard Redis Cluster + replicas, expandable to 12 shards
```

### Stateless workers

Workers hold:

- A connection pool to Redis broker.
- An async HTTP client (fetch class).
- A Chromium browser (render class).

Nothing else. Killing a pod releases leases within 60 s; survivors absorb work. Workers can be created and destroyed at will.

### Horizontal scaling

| Component | Scale axis | Trigger |
|---|---|---|
| fetch-worker     | replicas | queue lag p0/p1 |
| render-worker    | replicas | queue depth |
| parse-worker     | replicas | queue depth |
| writer-worker    | replicas | write lag |
| export-worker    | replicas | queue depth |
| analytics-worker | replicas | queue depth + scheduled spikes |
| Redis broker     | shards   | ops/s, memory |
| ClickHouse       | shards   | ingest rate |
| Kafka            | partitions | topic lag |

### KEDA scalers

```
ScaledObject: fetch-worker
  scaleTargetRef: Deployment crawler-fetch-worker
  triggers:
    - type: redis-cluster
      metadata:
        address: redis-broker:6379
        listName: q.fetch.p0
        listLength: "5000"           # 1 replica per 5000 tasks
        enableTLS: "true"
    - type: prometheus
      metadata:
        serverAddress: http://prometheus:9090
        metricName: queue_lag_seconds_p0
        threshold: "30"
  minReplicaCount: 50
  maxReplicaCount: 5000
  cooldownPeriod: 300
  pollingInterval: 15
```

Different classes scale on different signals. Render scales on queue depth (each render is heavy and predictable); fetch scales on lag (latency-sensitive).

### Queue partitioning

If a single queue (`q.fetch.p2`) exceeds the per-slot capacity of a Redis shard, it shards:

```
q.fetch.p2 → q.fetch.p2.{0..N}
```

Workers consume the union (Celery accepts multiple queue args). Producer SDK hashes by `(tenant_id, ts)` to a shard for balanced distribution.

### Regional workers

`q.fetch.{region}.pN` queues live in regional Redis broker shards. Each region runs its own fetch/render fleet. Cross-region work pays egress.

### Kubernetes node pools

```
fetch / parse / discover / notify / enrich / backlinks  → CPU-optimized pool
render / report                                          → memory + CPU; nvidia-not-needed
analytics / export                                       → memory-optimized pool
writer                                                   → IOPS-optimized pool
```

Taints + nodeAffinity ensure correct placement. PodDisruptionBudgets keep ≥ 30% capacity per class during node drains.

### Shard architecture

Logical shard key for tasks = `(tenant_tier, region)` for routing; `(job_id)` for state co-location in Redis. This lets us scale tiers independently — enterprise pool can grow without forcing free tier capacity to grow.

---

## PART 18 — Fault Tolerance

### Failure modes covered

| Failure | Detection | Recovery |
|---|---|---|
| Worker crash (SIGKILL/OOM) | heartbeat timeout 30 s | lease reclaim; task → z.retry |
| Worker network partition  | heartbeat timeout | same |
| Redis broker primary loss | cluster failover  | replica promoted within ~10 s; tasks resume |
| Redis broker full split   | quorum loss       | producers fail-closed (Outbox holds writes) |
| Postgres primary loss     | Patroni failover  | ~30 s; Outbox relay pauses; tasks already in queue keep flowing |
| Kafka broker loss         | partition rebalance | ~5 s; event emitters retry |
| ClickHouse write lag      | metric            | writer workers reduce batch size; HPA scales |
| Network partition between regions | health checks | regional autonomy — each region keeps running |

### Transactional Outbox

Every task that **must** survive a Redis outage is enqueued via the Outbox pattern:

```
1. business txn:
      INSERT business state
      INSERT outbox row (task envelope)
   COMMIT.

2. Outbox relay (separate process):
      SELECT FROM outbox WHERE published_at IS NULL ORDER BY id FOR UPDATE SKIP LOCKED LIMIT 500;
      send to Celery / Redis
      UPDATE outbox SET published_at = now()
   COMMIT.
```

If Redis is down, business state still commits; Outbox relay catches up when Redis returns. **At-least-once** delivery is guaranteed; idempotent task design (Part 8) handles the at-least-once nature.

### Checkpointing

Long tasks checkpoint to Postgres every N units of work. Resumption reads the last checkpoint. This makes any task **safely killable** at any time.

### Failover queues

If `q.fetch.p0` becomes structurally broken (e.g. a shard is unhealthy), the producer SDK can be hot-flipped to route `p0` to `q.fetch.p1` via config flag, then a triage runs without blocking customers. This is rare but practiced quarterly in game days.

### Persistent queues

- Redis AOF + RDB (Part 4).
- Outbox in Postgres survives Redis loss entirely.
- Kafka retains events 7 days — projections can be rebuilt.

### Graceful degradation (recap from Part 14)

Tiered shedding lets the platform stay up under broker capacity loss. Single feature flag flip.

---

## PART 19 — Security Hardening

### Task envelope security

- **Signed**: HMAC-SHA256 over canonical(envelope − signature) with a key rotated quarterly. Workers verify before deserializing payload. Reject `SIGNATURE_FAIL` → DLQ with P3 alert.
- **Versioned**: `version` field in envelope; workers reject unknown versions and DLQ rather than guess.
- **Encrypted at rest**: Redis AOF on encrypted volumes (LUKS/cloud equivalent). Payloads themselves are not encrypted at the protocol layer — broker network is private + TLS.
- **No secrets in payloads**: payloads carry IDs and references only; secrets (API keys for third parties, encryption keys) are fetched by the worker from the secrets manager.

### Payload limits

```
max_envelope_bytes:       64 KB              (raw msgpack)
max_payload_bytes:        32 KB
oversized → reject at producer, log SECURITY_OVERSIZE
```

Large data is referenced by S3 URI in the payload; the worker fetches the blob.

### Worker authentication

- Workers connect to Redis broker with TLS + auth: `requirepass` per worker class + ACLs limiting which commands and key patterns the worker can touch.
- A `fetch` worker cannot `DEL` anything in the `leader:*` namespace. Reaper has its own credentials.
- Brokers refuse connections lacking client certs (mTLS optional; deployed in production).

### Replay attacks

`enqueued_at` + `task_id` (ULID with timestamp). Workers reject envelopes with `enqueued_at` older than 24 h **unless** they were retrieved from the legitimate retry/delay paths (token-stamped). Prevents an attacker who captures a task envelope from replaying it months later.

### Malicious job protection

- Task names whitelisted at worker startup — unknown names DLQ immediately.
- Payload schema enforced per task; arbitrary fields rejected.
- Unknown task callers (producers without a valid service token) cannot enqueue at all.

### Redis hardening

```
protected-mode yes
requirepass <strong>
rename-command FLUSHDB ""
rename-command FLUSHALL ""
rename-command CONFIG ""
rename-command DEBUG ""
masterauth <strong>
tls-port 6379
port 0
```

Network policy denies all ingress to Redis except from labeled queue/worker pods.

---

## PART 20 — Performance Optimization

### Serialization

- **msgpack** over JSON for all envelopes. ~30–60% smaller, 2–4× faster encode/decode.
- Optional **zstd** compression for payloads > 4 KB (audit checkpoints, render payloads).
- Pydantic models with `model_dump(mode="python")` to avoid double-encoding.

### Bulk submit

The Producer SDK supports `submit_many(tasks)`:

```
pipe = redis.pipeline(transaction=False)
for env in batch:
    pipe.lpush(queue_for(env), encode(env))
pipe.execute()
```

A 1000-task batch submits in a single RTT vs. 1000 round-trips. Used everywhere bulk fan-out happens (audit start, bulk domain lookup).

### Async execution

IO-bound classes (`fetch`, `parse`, `discover`, `enrich`, `notify`, `backlinks`) use `gevent` pool with `asyncio` event loops inside tasks for outbound HTTP. CPU-bound classes (`export`, `analytics`, `maintenance`) use `prefork` for true parallelism.

### Worker pool tuning

```
prefork concurrency  = number_of_cores
gevent concurrency   = 200..512 depending on memory budget + RTT to broker
asyncio concurrency  = controlled internally via Semaphore (200 for fetch)
```

### Connection reuse

- aiohttp `ClientSession` shared per worker.
- DB drivers use a connection pool with `min_size=2, max_size=20` per worker process.
- Redis connection pool: 1 pool per worker, multiplexed.

### Memory

- `--max-tasks-per-child` recycles workers; bounds Python long-tail memory growth.
- Large temporary buffers go through `io.BytesIO` and are explicitly `del`ed.
- Render workers (Chromium): see Part 12.

### Throughput optimizations

- **Lua scripts** for every multi-step Redis op (lease acquire-or-refresh, dedup-or-enqueue, token-bucket take).
- **Pipelining** in promoter loops (batch read + write per tick).
- **Pre-warmed connections** — workers connect at boot, not first task.
- **Reusable encoded queue routing** — task → queue map is a frozen dict; no string interpolation per submit.

### Network

- TCP_NODELAY on all broker connections.
- HTTP/1.1 keep-alive with long idle timeout for downstream services.
- Cluster-local DNS cache; reduces DNS resolution latency to < 1 ms.

---

## PART 21 — Testing Architecture

### Test surfaces

| Surface | Tool | Asserts |
|---|---|---|
| Unit (task code)        | pytest                  | task logic, retry classification, idempotency |
| Producer SDK            | pytest + fake redis     | routing, fingerprint, signing, outbox writes |
| Queue integration       | pytest + docker-compose | enqueue → consume → ack happy path |
| Retry semantics         | pytest + freezegun      | backoff schedule, max attempts, DLQ routing |
| DLQ                     | pytest                  | bad envelopes land in DLQ; replay works |
| Worker crash recovery   | pytest + signal kill    | SIGTERM mid-task → resume; lease reclaim |
| Backpressure            | pytest + circuit fixture| breaker trips & recovers; degradation order |
| Beat                    | pytest + clock          | leader election, no duplicate emissions, drift |
| Load                    | Locust                  | submit/s, lag, p95 |
| Chaos                   | toxiproxy + chaos-mesh  | Redis kill, network partition, slow disk |

### Worker crash test

A canary suite kills workers mid-task at every checkpoint boundary in CI:

```
for checkpoint in checkpoints(task):
    spawn worker
    submit task
    wait until checkpoint
    SIGKILL worker
    assert: task resumes on another worker
    assert: no duplicate side effects (idempotency invariant)
```

This is the test that prevents silent regressions in retry-safe design.

### Scaling test

In a staging cluster:

```
1. submit 1M crawl.fetch tasks via bulk
2. measure: end-to-end p95, queue lag, worker scale-up time
3. kill 50% of fetch workers
4. measure: time-to-recover SLO
5. inject 10% downstream failures
6. measure: retry & DLQ rates stay within bounds
```

Run weekly; results posted to a public-to-engineering dashboard.

### Distributed task tests

Multi-pod tests for chord completion correctness — 100k chord members, two pods race to decrement the counter, must invoke the callback exactly once.

### Rendering tests

Playwright in tracing mode against the test HTTP harness (Step 7 §23). Asserts on context recycling, OOM-safe restart, and trigger heuristics.

---

## PART 22 — Deployment Topology & Folder Structure

### Container images

```
queue-orchestrator       python:3.12-slim + fastapi             180 MB
queue-beat               python:3.12-slim                       170 MB
queue-outbox-relay       python:3.12-slim                       170 MB
queue-reaper             python:3.12-slim                       170 MB
queue-promoter           python:3.12-slim                       170 MB
queue-fetch-worker       (from Step 7)                          180 MB
queue-render-worker      (from Step 7)                          1.4 GB
queue-parse-worker       (from Step 7)                          220 MB
queue-export-worker      python:3.12-slim + pandas + reportlab  600 MB
queue-analytics-worker   python:3.12-slim + clickhouse-driver   400 MB
queue-report-worker      mcr playwright + reportlab             1.4 GB
queue-notify-worker      python:3.12-slim + sendgrid sdk        200 MB
queue-maintenance-worker python:3.12-slim                       200 MB
queue-scrapy-worker      python:3.12-slim + scrapy + lxml       300 MB
```

Multi-stage builds; deps layer rebuilt only when `requirements.txt` changes; non-root user; tini as PID 1.

### Kubernetes layout

```
namespace: rt-queue
namespace: rt-queue-render     (isolated NetworkPolicy; no internal egress)

StatefulSet:  redis-broker         (3 primary + 3 replica)
StatefulSet:  redis-cache          (3 primary + 3 replica)
StatefulSet:  postgres             (Patroni, separate from analytics ClickHouse)
StatefulSet:  kafka                (3 brokers)

Deployment:   queue-orchestrator   replicas=3       HPA cpu 70%
Deployment:   queue-beat           replicas=2       leader-elected; 1 active
Deployment:   queue-outbox-relay   replicas=3
Deployment:   queue-reaper         replicas=3       leader-elected; 1 active
Deployment:   queue-promoter       replicas=3       leader-elected per loop

Deployment:   queue-fetch-worker        50–5000   KEDA on lag
Deployment:   queue-render-worker       10–500    KEDA on depth        (rt-queue-render ns)
Deployment:   queue-parse-worker        20–1000   KEDA on depth
Deployment:   queue-discover-worker     10–500    KEDA on depth
Deployment:   queue-audit-worker        10–200    KEDA on depth
Deployment:   queue-export-worker       5–100     KEDA on depth
Deployment:   queue-analytics-worker    5–50      KEDA on depth
Deployment:   queue-report-worker       3–50      KEDA on depth        (rt-queue-render ns)
Deployment:   queue-notify-worker       10–200    KEDA on depth
Deployment:   queue-maintenance-worker  2–10      KEDA on depth
Deployment:   queue-scrapy-worker       5–100     KEDA on depth

DaemonSet:    metrics-sidecar (node-local cache for prom queries)
CronJob:      queue-migrator (broker key migrations on rollouts)

ServiceMonitor: scrapes all classes at /metrics
PodDisruptionBudget: ≥ 30% per worker class during voluntary disruptions
NetworkPolicy:
  - rt-queue-render: deny all internal egress; allow only to broker, S3, Kafka
  - all others:      allow only to broker, postgres, clickhouse, kafka, S3, sentry, prometheus
```

### Resource requests / limits (per pod)

```
queue-fetch-worker:        cpu req 250m / lim 1000m;  mem req 256Mi / lim 512Mi
queue-render-worker:       cpu req 1000m / lim 2000m; mem req 1Gi   / lim 1.5Gi
queue-parse-worker:        cpu req 250m / lim 1000m;  mem req 256Mi / lim 512Mi
queue-export-worker:       cpu req 500m / lim 2000m;  mem req 512Mi / lim 1Gi
queue-analytics-worker:    cpu req 1000m / lim 4000m; mem req 1Gi   / lim 1.5Gi
queue-report-worker:       cpu req 1000m / lim 2000m; mem req 1Gi   / lim 1.2Gi
queue-notify-worker:       cpu req 100m / lim 500m;   mem req 128Mi / lim 256Mi
queue-orchestrator:        cpu req 250m / lim 1000m;  mem req 256Mi / lim 512Mi
queue-beat:                cpu req 100m / lim 500m;   mem req 256Mi / lim 512Mi
```

### Node pools

```
pool-cpu-general    (intel/amd, ≥ 8c)   → fetch, parse, discover, notify, enrich, backlinks
pool-mem-mid        (≥ 16Gi/c×8)         → render, report
pool-mem-large      (≥ 32Gi/c×8)         → analytics, export, audit
pool-iops-high      (NVMe local)         → writer
```

Taints + nodeAffinity enforce placement.

### Rollout strategy

```
canary:                1% of class for 30 min, success = no SLO regression
rolling:               maxUnavailable 10%, maxSurge 25%
graceful drain:        terminationGracePeriodSeconds tuned per class (Part 2)
schema changes:        backward-compatible adds only; deletes 2 releases later
broker maintenance:    flip producers to backup broker via config; drain primary; reverse
```

### Disaster recovery

```
Redis broker loss:
  - Outbox holds enqueues; relay catches up when broker returns.
  - Workers reconnect on backoff; queue contents replay from AOF on broker restart.

Postgres loss:
  - Patroni failover ~30 s.
  - Outbox relay pauses (DB unavailable); workers continue draining queue.
  - Jobs in progress mark FAILED if state writes can't be acked within timeout.

Region outage:
  - Cold-standby region promoted via DNS swap + Postgres replica promotion.
  - Queues are regional; standby starts with empty broker, then catches up from Outbox.
  - RTO: 1 h. RPO: 5 min (last Outbox sync).
```

### Folder structure

```
seo-suite/backend/app/queue/
├── __init__.py
├── celery_app.py
├── config.py
├── routing.py
├── envelope.py            # signed envelope schema + canonical encoding
├── producer.py            # Producer SDK
├── outbox.py              # transactional outbox writer + relay loop
├── beat_schedule.py
├── result_backend.py
├── canvas.py              # safe chain/group/chord helpers
├── lua/
│   ├── token_bucket.lua
│   ├── lease_acquire.lua
│   ├── lease_refresh.lua
│   ├── dedup_or_enqueue.lua
│   └── chord_counter.lua
├── coord/
│   ├── leader.py          # leader election (Redis SET NX)
│   ├── reaper.py          # dead-worker detection + lease reclaim
│   ├── promoter.py        # z.retry / z.delay / z.beat promoters
│   └── outbox_relay.py
├── tasks/
│   ├── crawl.py
│   ├── audit.py
│   ├── backlinks.py
│   ├── enrich.py
│   ├── exports.py
│   ├── analytics.py
│   ├── notify.py
│   ├── report.py
│   └── maintenance.py
├── workers/
│   ├── base.py            # shared bootstrap: metrics, tracing, signing, signal handlers
│   ├── fetch.py
│   ├── render.py
│   ├── parse.py
│   ├── discover.py
│   ├── audit.py
│   ├── export.py
│   ├── analytics.py
│   ├── report.py
│   ├── notify.py
│   └── maintenance.py
├── retry/
│   ├── policy.py          # declarative retry policies per task
│   ├── backoff.py         # decorrelated jitter
│   └── escalate.py        # proxy escalation, etc.
├── dlq/
│   ├── routes.py          # per-class DLQ names
│   ├── inspect.py         # admin inspection helpers
│   ├── replay.py
│   └── triage.py          # scheduled aggregator
├── dedup/
│   ├── fingerprint.py
│   ├── windows.py
│   └── locks.py
├── backpressure/
│   ├── circuit_breaker.py
│   ├── adaptive_concurrency.py
│   ├── shed.py            # tier-based degradation
│   └── system_health.py
├── monitoring/
│   ├── metrics.py
│   ├── tracing.py
│   ├── logging.py
│   └── slo.py
├── security/
│   ├── signer.py
│   ├── schemas/           # per-task payload schemas
│   ├── replay_guard.py
│   └── redis_acl.py       # broker user/ACL templates
├── scaling/
│   ├── keda/              # KEDA ScaledObject manifests (rendered from values)
│   └── partition.py       # queue partition helpers
└── testing/
    ├── fakes/
    │   ├── broker.py
    │   ├── postgres.py
    │   └── clock.py
    ├── fixtures/
    └── locust/
        ├── submit_load.py
        └── worker_load.py
```

```
seo-suite/backend/deployments/queue/
├── k8s/
│   ├── namespace.yaml
│   ├── namespace-render.yaml         # isolated NetworkPolicy
│   ├── redis-broker.yaml
│   ├── redis-cache.yaml
│   ├── orchestrator.yaml
│   ├── beat.yaml
│   ├── outbox-relay.yaml
│   ├── reaper.yaml
│   ├── promoter.yaml
│   ├── worker-fetch.yaml
│   ├── worker-render.yaml
│   ├── worker-parse.yaml
│   ├── worker-discover.yaml
│   ├── worker-audit.yaml
│   ├── worker-export.yaml
│   ├── worker-analytics.yaml
│   ├── worker-report.yaml
│   ├── worker-notify.yaml
│   ├── worker-maintenance.yaml
│   ├── worker-scrapy.yaml
│   ├── keda-scaledobjects.yaml
│   ├── pdb.yaml
│   ├── networkpolicies.yaml
│   ├── servicemonitors.yaml
│   └── rbac.yaml
├── helm/
│   └── queue/
│       ├── Chart.yaml
│       ├── values.yaml
│       └── templates/
├── docker/
│   ├── orchestrator.Dockerfile
│   ├── beat.Dockerfile
│   ├── outbox-relay.Dockerfile
│   ├── reaper.Dockerfile
│   ├── promoter.Dockerfile
│   ├── worker-fetch.Dockerfile
│   ├── worker-render.Dockerfile
│   ├── worker-parse.Dockerfile
│   ├── worker-discover.Dockerfile
│   ├── worker-audit.Dockerfile
│   ├── worker-export.Dockerfile
│   ├── worker-analytics.Dockerfile
│   ├── worker-report.Dockerfile
│   ├── worker-notify.Dockerfile
│   ├── worker-maintenance.Dockerfile
│   └── worker-scrapy.Dockerfile
└── runbooks/
    ├── broker-down.md
    ├── queue-backlog.md
    ├── dlq-spike.md
    ├── worker-oom.md
    ├── beat-drift.md
    └── shed-degradation.md
```

---

**STEP 8 QUEUE & WORKER SYSTEM COMPLETED**

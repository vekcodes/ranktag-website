# RankedTag SEO Platform — Crawler Architecture (Step 7)

Production-grade distributed crawler infrastructure powering the Domain Authority + Backlink Analysis platform. **Architecture only — no application code.** This document defines components, data flow, queue topology, scheduling math, scaling envelopes, and operational guardrails. Every part is concrete: real numbers, real queue names, real failure modes.

> **Scope.** Crawler-only — fetching, rendering, parsing, link extraction, queue + worker orchestration, deduplication, monitoring. Database schema, public API surface, and billing are defined in Steps 5 and 6 and are referenced but not redefined here.

---

## Table of Contents

1. [System Topology & Component Communication](#part-1--system-topology--component-communication)
2. [Distributed Crawler Engine](#part-2--distributed-crawler-engine)
3. [URL Discovery Engine](#part-3--url-discovery-engine)
4. [Backlink Discovery System](#part-4--backlink-discovery-system)
5. [Crawl Queue Architecture](#part-5--crawl-queue-architecture)
6. [Crawl Prioritization & Budget](#part-6--crawl-prioritization--budget)
7. [Async HTTP Fetching (aiohttp)](#part-7--async-http-fetching-aiohttp)
8. [Playwright JS Rendering](#part-8--playwright-js-rendering)
9. [Scrapy Integration](#part-9--scrapy-integration)
10. [Robots.txt System](#part-10--robotstxt-system)
11. [Rate Limiting & Politeness](#part-11--rate-limiting--politeness)
12. [Proxy Rotation System](#part-12--proxy-rotation-system)
13. [HTML Parsing Engine](#part-13--html-parsing-engine)
14. [Link Extraction Engine](#part-14--link-extraction-engine)
15. [Crawl Storage Pipeline](#part-15--crawl-storage-pipeline)
16. [Error Handling & Retry](#part-16--error-handling--retry)
17. [Crawl Monitoring](#part-17--crawl-monitoring)
18. [Scalability Strategy](#part-18--scalability-strategy)
19. [Crawl Deduplication](#part-19--crawl-deduplication)
20. [Historical Crawl Tracking](#part-20--historical-crawl-tracking)
21. [SEO Audit Crawler](#part-21--seo-audit-crawler)
22. [Security Hardening](#part-22--security-hardening)
23. [Testing Architecture](#part-23--testing-architecture)
24. [Deployment Architecture](#part-24--deployment-architecture)
25. [Folder Structure](#part-25--folder-structure)

---

## PART 1 — System Topology & Component Communication

### 30,000-ft view

```
                ┌──────────────────────────────────────────────────────┐
                │           Public API (Step 6) — FastAPI              │
                │  POST /api/v1/audits, /domains/bulk, /backlinks/...  │
                └──────────────┬───────────────────────────────────────┘
                               │ enqueue (Celery / Redis broker)
                               ▼
                 ┌─────────────────────────────────────┐
                 │       Orchestrator Service          │
                 │  (FastAPI app: /internal/crawler)   │
                 │   • job lifecycle / state machine   │
                 │   • shard planner                   │
                 │   • budget allocator                │
                 │   • lease coordinator (Redis)       │
                 └──────┬──────────────────────┬───────┘
                        │                      │
            ┌───────────▼────────┐   ┌─────────▼──────────┐
            │  Frontier Service  │   │  Politeness Layer  │
            │  (URL admission +  │   │   (per-host token  │
            │  dedup + scoring)  │   │   bucket + robots) │
            └──────┬─────────────┘   └─────────┬──────────┘
                   │ score, normalize          │ admit / defer
                   ▼                           ▼
            ┌──────────────────────────────────────────┐
            │   Distributed Crawl Queues (Redis)       │
            │   q.fetch.{p0..p3}   q.render            │
            │   q.parse            q.enrich            │
            │   q.discover         q.delay  q.retry    │
            │   q.dlq              q.host:<bucket>     │
            └─────────┬──────────────────┬─────────────┘
                      │                  │
         ┌────────────▼─────┐   ┌────────▼────────────┐
         │ Fetch Workers    │   │ Render Workers      │
         │ (aiohttp pool)   │   │ (Playwright pool)   │
         │ — Celery + async │   │ — Celery + Chromium │
         └────────┬─────────┘   └────────┬────────────┘
                  │ raw HTML / response  │ rendered DOM
                  ▼                      ▼
            ┌──────────────────────────────────────────┐
            │       Parse / Link-Extract Workers       │
            │   (selectolax + lxml + tldextract)       │
            └────────┬──────────────────────┬──────────┘
                     │ extracted links      │ page facts
                     ▼                      ▼
            ┌──────────────────────────────────────────┐
            │           Storage Pipeline               │
            │  S3/GCS (HTML)  Postgres (state, jobs)   │
            │  ClickHouse (backlinks, page_facts)      │
            │  OpenSearch (audit issues)               │
            │  Redis (hot state)                       │
            └──────────────────────────────────────────┘
                     │
                     ▼
            ┌──────────────────────────────────────────┐
            │    Event Bus (Kafka / NATS)              │
            │ crawler.job.* page.fetched link.found … │
            └─┬────────────────────────────────────┬───┘
              │ projections                        │
              ▼                                    ▼
        Public API read paths              Monitoring (Prom + Grafana)
```

### How components communicate

| From → To | Mechanism | Reason |
|---|---|---|
| Public API → Orchestrator | Celery enqueue + DB row | Persistence + at-least-once delivery |
| Orchestrator → Frontier | gRPC (low-latency admit/deny) | Tens of thousands of URL admissions per second |
| Frontier → Queues | Redis `LPUSH` / sorted-set `ZADD` | Native FIFO + priority |
| Orchestrator ↔ Workers | Redis lease + Celery task | Crash-safe ownership + work distribution |
| Workers → Storage | Direct write to S3 / batch inserts to ClickHouse | Streaming ingest; no synchronous DB chokepoint |
| Workers → Event Bus | Kafka producer | Decouples crawl from downstream consumers |
| Event Bus → Public API | Materialized projections | API never reads worker state directly |

**Key principle.** No worker ever talks to another worker. All coordination is through Redis (leases, locks, queues) or the event bus. Workers are **stateless and crash-safe**; killing one mid-task only releases the lease.

---

## PART 2 — Distributed Crawler Engine

### Worker classes

| Class | Pool size at scale | Concurrency per worker | Workload |
|---|---|---|---|
| `fetch-worker`    | 500–5,000 pods | 200 async tasks | aiohttp GETs, redirects, decoding |
| `render-worker`   | 50–500 pods    | 8 Chromium contexts | SPA / lazy-loaded pages |
| `parse-worker`    | 100–1,000 pods | 32 tasks       | HTML → page facts + links |
| `discover-worker` | 50–500 pods    | 64 tasks       | Sitemap / RSS / robots fetch + URL admission |
| `audit-worker`    | 50–200 pods    | 16 tasks       | Site-audit pipelines (Part 21) |
| `orchestrator`    | 3–10 replicas  | —              | FastAPI; leader-elected for shard planner |

Each class has its **own queue set**, its **own deployment**, and its **own HPA target metric**. They never share Celery worker pools — a render worker's memory footprint (300 MB resident with Chromium) cannot be allowed to evict a fetch worker (60 MB resident).

### Worker lifecycle

```
register → heartbeat (10 s) → lease shard → process → ack → repeat
   │                                  │
   │           crash / OOM            │
   ▼                                  ▼
shutdown handler:                lease TTL expires (30 s)
  - drain in-flight tasks        - coordinator reclaims shard
  - release leases               - re-enqueues unacked URLs
  - publish worker.dead
```

**Worker registration** — on boot a worker `SETEX worker:{id} 30 <metadata>` in Redis and publishes `worker.registered` on the event bus. Heartbeats just refresh the TTL.

**Shard ownership** — the unit of distributed work is a **shard**: a bounded set of URLs (default 1,000) that belong to one job and route to one queue. A shard is leased via:

```
SET lease:shard:{shard_id} <worker_id> NX PX 60000
```

Workers refresh the lease every 20 s while processing. If a worker dies, TTL expires within 60 s and any other worker can claim it.

### Preventing duplicate crawling

Three layers, top-down:

1. **Pre-admission URL dedup (Frontier).** Every URL is normalized (Part 3) and looked up in:
   - A short-window **Redis set** keyed by `seen:{job_id}:{url_hash}` (TTL = job duration) — exact dedup within a job.
   - A long-window **Redis Bloom filter** (`BF.EXISTS dedup:bf:global <url_hash>`) — coarse global dedup with ~1% FP rate. The Bloom filter is sized for 10B entries at 1% FPR (~12 GB).
   - A **content fingerprint check** in ClickHouse `page_facts(url_hash, content_simhash)` — second-pass dedup after fetch (skips identical pages with different URLs).
2. **Lease-based ownership.** Only the worker holding the shard lease can ack the work. If a duplicate enqueue happens, the second worker hits `lease exists → defer`.
3. **Idempotent storage writes.** All writes are upserts keyed on `(url_hash, fetched_at_bucket)` in ClickHouse and on `url_hash` in Postgres `crawl_state`. Replaying an event is safe.

### Fault tolerance

- **Worker crash** → lease TTL reclaims the shard; URLs re-enqueued on `q.retry` with `attempt += 1`.
- **Queue node failure** → Redis Cluster with replicas; failover < 10 s. Queues survive because they're persisted (AOF every 1 s).
- **Orchestrator failure** → leader election via Redis `SETNX leader:orchestrator <pod> EX 30`. New leader resumes from DB state. No work is lost; at most a few seconds of admissions are delayed.
- **Storage backpressure** → workers stop acking when ClickHouse write latency > 500 ms p95; queues build; HPA scales storage writer pods, not crawlers.

---

## PART 3 — URL Discovery Engine

### Sources

| Source | Discoverer | Priority | Notes |
|---|---|---|---|
| HTML `<a href>`         | `parse-worker`     | Inherits parent priority − 1 | Default discovery |
| XML sitemap             | `discover-worker`  | `+10` boost                  | Trusted; respects `<priority>` |
| Sitemap index           | `discover-worker`  | recurses into sub-sitemaps   | Bounded depth = 3 |
| RSS / Atom              | `discover-worker`  | `+5` boost                   | Freshness signal |
| `<link rel="canonical">`| `parse-worker`     | replaces self                | Canonical wins for storage |
| `<link rel="alternate" hreflang>` | `parse-worker` | normal | Track locale variants |
| Redirect chain (3xx)    | `fetch-worker`     | resolved to final URL        | Original URL stored with `redirect_to` |
| JS-rendered DOM         | `render-worker`    | normal                       | Only when render is triggered (Part 8) |
| External backlink targets | `parse-worker`   | added to **target** project's frontier if subscribed | Backlink discovery hook |

### URL normalization

A canonical URL form is computed before any hashing or dedup:

1. Lowercase scheme + host. Punycode IDNs.
2. Strip default ports (`:80` http, `:443` https).
3. Resolve `..` / `.` segments; collapse repeated slashes.
4. Sort query parameters; drop tracking params from a maintained list (`utm_*`, `gclid`, `fbclid`, `mc_eid`, `_ga`, `ref`, `referrer`, `igshid`, `_hsenc`, `_hsmi`, `mkt_tok`, `vero_id`, `wbraid`, `gbraid`, …).
5. Drop fragments (`#…`).
6. Decode safe percent-encodings; re-encode reserved characters consistently.
7. Trailing slash policy: strip on non-root paths unless server canonicalizes with one (learned per host).

Result: a `canonical_url`. `url_hash = blake2b(canonical_url, 16 bytes)` is the primary key everywhere downstream.

### URL scoring (admission)

Each URL gets a **discovery score** `S_disc` ∈ [0, 100] used by the frontier to decide which priority queue to enter (Part 5/6 use this).

```
S_disc =
    0.35 × parent_authority_score        (DR/DA of discovering page's domain)
  + 0.20 × source_signal                 (sitemap=100, RSS=80, html-link=50, JS-only=40)
  + 0.15 × freshness_boost               (1 / hours_since_last_known_change, capped)
  + 0.10 × internal_link_strength        (PR-like rank from prior crawl)
  + 0.10 × estimated_traffic             (Tranco-derived; 0 if unknown)
  − 0.05 × depth_penalty                 (depth from seed, capped at 10)
  − 0.05 × duplicate_likelihood          (similarity to already-crawled URLs)
```

All inputs are normalized to 0–100 before weighting. URLs with `S_disc < 5` are dropped (not enqueued). URLs with `S_disc ≥ 70` enter `q.fetch.p0` (highest priority).

### URL Frontier

A **frontier** is a per-job priority queue plus a global per-host queue. Implementation:

- **Per-job frontier** — Redis sorted set `frontier:{job_id}` scored by `S_disc`. `ZPOPMAX` returns the best URL next.
- **Per-host queue** — Redis list `host:{etld+1}` holds URLs awaiting their politeness slot (Part 11). Drained at the rate the host allows.
- **Crawl depth** — stored on each URL record; bounded per job (default 10 for audits, unbounded for backlink discovery).

Two-phase admission: frontier issues a candidate → politeness layer checks host budget → URL moved to `q.fetch.pN`. Otherwise it returns to the frontier with a `next_attempt_at`.

---

## PART 4 — Backlink Discovery System

### What we discover

Every external `<a href>` found on any crawled page is a **backlink candidate**. The discovery pipeline turns candidates into stored, classified, monitored backlinks.

```
parse-worker:
  on <a href="https://target.com/...">
    classify: internal vs external (compare eTLD+1)
    if external:
      emit BacklinkCandidate{
        source_url, source_domain, source_dr_estimated,
        target_url,  target_domain,
        anchor_text, anchor_type, rel[],
        position, link_context_hash, surrounding_text_simhash,
        first_seen_at = now()
      } → q.backlinks.ingest
```

### Anchor classification

```
exact     — anchor matches a known target keyword exactly
partial   — anchor contains a known keyword as substring
branded   — anchor is the target's brand / domain
generic   — "click here", "read more", "this site", "website", …
naked     — anchor is the URL itself
image     — <img alt> used as the anchor
empty     — no text, no alt (still tracked; common in nav links)
```

A 600-entry generic-anchor dictionary lives in Redis hash `dict:generic_anchors`, refreshable without redeploy.

### Backlink validation

Before a candidate becomes a confirmed backlink:

1. **Source liveness** — the source URL returned 2xx within the last 30 days.
2. **Target reachable** — DNS resolves, robots not blocking the entire host.
3. **Not self-link** — `source_domain != target_domain` (subdomains are external by default; configurable).
4. **Not a known PBN pattern** — checked against `dict:pbn_patterns` (regex + domain age + DNS clusters). Marked but not dropped — used downstream for toxicity scoring.
5. **Content context** — surrounding 200-char window is hashed for context-stability tracking.

### Freshness tracking

Each backlink row carries:

```
first_seen_at   — discovery timestamp
last_seen_at    — most recent crawl where the link was present
last_checked_at — most recent visit to the source page
status          — live | lost | redirect | gone | uncertain
lost_reason     — page_removed | link_removed | rel_changed | host_dead
```

Status transitions emit events on the bus, which is what powers `/api/v1/backlinks/new` and `/lost` in Step 6.

### Refresh cadence

Source pages are revisited on a cadence proportional to authority + change frequency:

| Source DR | Default recrawl |
|---|---|
| 70+ | 1 day  |
| 40–69 | 3–7 days |
| 20–39 | 14 days |
| < 20 | 30–60 days |
| flagged toxic | 90 days (low priority) |

Override: if the source's `last_modified` from prior crawl changed, recrawl is bumped to immediate.

### Historical tracking

ClickHouse `backlinks_history` is an append-only table partitioned by month. Each crawl writes a row per (link, snapshot). Time-travel queries are cheap because partitions prune by date.

### Scale targets

- **Ingest rate**: 50,000 candidates/s peak, sustained 10,000/s.
- **Stored backlinks**: 10B+ rows in ClickHouse, lifetime.
- **Per-target query latency** (p95): < 300 ms for first page (cursor) on a target with 100M backlinks.

---

## PART 5 — Crawl Queue Architecture

### Queue inventory (Redis-backed Celery)

```
q.fetch.p0          # highest-priority fetch (paying enterprise audits, p0 freshness)
q.fetch.p1          # business tier
q.fetch.p2          # pro / standard discovery
q.fetch.p3          # free / opportunistic
q.render            # pages flagged for JS rendering
q.parse             # raw HTML → page facts
q.discover          # sitemap / RSS / robots fetch
q.audit.start       # seed crawl frontier for a new audit
q.audit.crawl       # audit-scope page fetches
q.audit.analyze     # per-page issue extraction
q.audit.aggregate   # roll-ups
q.backlinks.ingest  # candidate → validated backlink
q.enrich            # WHOIS / Tranco / GeoIP / Wayback fetch
q.delay             # ZSET — URLs deferred by politeness; promoter moves to q.fetch.*
q.retry             # ZSET — URLs scheduled for retry with backoff
q.dlq               # terminal failures, kept 30 days for replay
host:{etld+1}       # per-host buffer; drained by the politeness promoter
```

### Naming convention

```
q.<domain>.<purpose>[.<priority>]
  domain:    fetch | render | parse | audit | backlinks | enrich
  purpose:   start | crawl | analyze | aggregate | ingest
  priority:  p0..p3   (only on q.fetch.*)
```

### Queue mechanics

| Queue type | Redis structure | Why |
|---|---|---|
| Standard work     | `LIST` (`LPUSH`/`BRPOP`)   | FIFO; Celery default |
| Priority work     | Separate lists per priority — `q.fetch.p0..p3` | Strict ordering between tiers; trivial debugging |
| Delayed / retry   | `ZSET` scored by `ready_at_ts` | Promoter scans `ZRANGEBYSCORE 0 now()` |
| Per-host buffer   | `LIST` + per-host token bucket | Politeness without scanning the whole queue |
| Dead-letter       | `LIST` + JSON envelope     | Replayable; manual triage |

### Promoter loops

Two small daemons (orchestrator replicas) run promoter loops:

```python
# pseudocode — design only
while True:
    now = time.time()
    ready = ZRANGEBYSCORE("q.retry", 0, now, limit=1000)
    pipeline:
        for url in ready:
            ZREM("q.retry", url)
            LPUSH(target_queue(url), url)
    sleep(0.5)
```

The host-buffer promoter checks each host's token bucket; if a token is available, it moves one URL from `host:{etld+1}` to the correct `q.fetch.pN`.

### Worker routing

```
fetch-worker      → q.fetch.p0, q.fetch.p1, q.fetch.p2, q.fetch.p3   (priority-ordered)
render-worker     → q.render
parse-worker      → q.parse
discover-worker   → q.discover
audit-worker      → q.audit.crawl, q.audit.analyze, q.audit.aggregate
ingest-worker     → q.backlinks.ingest
enrich-worker     → q.enrich
```

Celery worker config (per class):

```
worker_prefetch_multiplier = 1     # don't hoard work; let other workers help drain backlog
task_acks_late             = True  # ack only after success — crash-safe
task_reject_on_worker_lost = True  # auto-requeue on crash
```

### Queue persistence

Redis AOF every 1 s + RDB snapshot every 5 min. The broker runs in a 3-node Redis Cluster (1 primary + 2 replicas per slot). All queue keys hash to slots evenly; no single slot is hot.

### Horizontal scaling of queues

- **Sharded broker**: Celery supports broker URLs as Redis Cluster. Slot distribution evens load.
- **Per-class brokers**: in extreme scale (>50k tasks/s per class), each worker class gets its own Redis instance, isolating noisy neighbors.
- **Topic split**: if `q.fetch.p2` outgrows a slot, it shards to `q.fetch.p2.{0..N}` and workers consume the union (Celery routes via `queue_arguments`).

---

## PART 6 — Crawl Prioritization & Budget

### Scoring formula (effective priority at fetch time)

```
S_fetch = clamp(
    0.40 × S_disc                       (discovery score; Part 3)
  + 0.25 × tier_weight                  (free=10, pro=30, biz=60, ent=100)
  + 0.15 × job_urgency                  (audit=80, freshness-poll=50, refresh=30)
  + 0.10 × freshness_need               (time since last successful fetch)
  + 0.05 × sitemap_priority             (<priority> tag if present, normalized)
  + 0.05 × estimated_yield              (expected backlinks discovered; rolling avg per host)
  , 0, 100
)
```

A URL is routed to:

```
p0  if S_fetch ≥ 75
p1  if S_fetch ≥ 55
p2  if S_fetch ≥ 30
p3  otherwise
```

### Crawl budget

Budget is the **maximum work allocated per unit time** across three nested scopes:

| Scope | Budget unit | Source of truth |
|---|---|---|
| Per-tenant | URLs/day | billing tier × plan multiplier (Step 9) |
| Per-job   | URLs total + max wallclock | Job request |
| Per-host  | URLs/min × concurrency | learned + robots `crawl-delay` (Part 10) |

The orchestrator decrements per-tenant and per-job budgets atomically (`DECR` in Redis) on each successful fetch. When per-tenant hits 0, all that tenant's URLs are moved to `q.delay` with `ready_at = next_period_start`.

### Adaptive boost

If a host yields high-quality content (low duplicate rate, many new backlinks discovered), its `estimated_yield` rises, boosting `S_fetch`. Conversely, hosts returning 90% duplicates have their yield decayed and drop priority.

### Starvation prevention

Free-tier work (`tier_weight = 10`) would never see `p0`. To avoid lockout:

- **Tier-aware fair-share dequeue.** Fetch workers pull from queues using **weighted round-robin** (`p0: 10`, `p1: 6`, `p2: 3`, `p3: 1`). A free-tier URL in `p3` is guaranteed eventual service.
- **Aging.** A URL waiting > 1 hour in any queue gets a +10 priority boost, capped at one promotion (so `p3` → `p2` after 1h, `p2` → `p1` after another hour).

---

## PART 7 — Async HTTP Fetching (aiohttp)

### Worker shape

```
fetch-worker pod:
  • 1 Python process per pod (no GIL contention with C extensions)
  • 1 aiohttp ClientSession shared across tasks
  • Connection pool:
      - total          = 1000
      - per-host       = 8
      - keepalive_ttl  = 60 s
  • SSL context shared (no per-request cert load)
  • DNS resolver: aiodns + 5-min cache
  • Concurrency cap: asyncio.Semaphore(200)
```

### Fetch envelope

```
Request:
  Method:     GET (HEAD for cheap liveness checks)
  Timeout:    connect=5s, read=15s, total=20s
  Max body:   10 MB (configurable per job; 50 MB for audits)
  User-Agent: rotating (Part 11)
  Accept:     text/html, application/xhtml+xml; q=0.9, application/xml; q=0.5
  Accept-Enc: br, gzip, deflate
  Compression: auto-decoded; bombs detected (Part 22)
  Redirects:  follow up to 5, record full chain
  HTTP/2:     enabled where supported
```

### Streaming + memory

Bodies are read in **64 KB chunks** with a hard cap. If `Content-Length` declares > 10 MB the fetch is short-circuited with a `BODY_TOO_LARGE` outcome before any read. Bodies are written to a per-task `io.BytesIO` then streamed to S3 (raw HTML store) without holding the full body in worker RAM longer than needed.

### Redirect handling

Full chain is captured: `[(url_0, 301), (url_1, 302), (url_2, 200)]`. The final URL becomes the storage key; intermediate URLs get a `crawl_state` row of type `redirect` pointing to the final hash. Backlinks that resolve via redirect retain a `redirect_chain` reference for analysis.

### SSL

- TLS 1.2 minimum.
- Mis-issued / expired certs **do not** halt the crawl; outcome `SSL_INVALID` is recorded and the page is fetched with verification disabled **only if** the job's policy allows (audits do; backlink discovery does not).
- Hostname-mismatched certs are recorded as a separate audit signal.

### Compressed responses

`br > gzip > deflate` preferred. Workers reject responses with declared `Content-Length` of compressed size > 10 MB or decompressed-ratio > 100× (decompression bomb defense — Part 22).

### Outcome classification

Every fetch ends with one of:

```
OK_200            5xx_SERVER          BODY_TOO_LARGE
OK_REDIRECT       4xx_CLIENT          DNS_FAIL
TIMEOUT           403_BLOCKED         SSL_INVALID
CONN_RESET        404_NOT_FOUND       ROBOTS_DISALLOW
CAPTCHA_DETECTED  410_GONE            INVALID_RESPONSE
ANTI_BOT_PAGE     429_RATE_LIMITED    DECOMPRESSION_BOMB
```

Outcome drives retry policy (Part 16) and storage (`crawl_state`).

---

## PART 8 — Playwright JS Rendering

### When rendering triggers

Rendering is **expensive** (8–60× slower, 50× more RAM than aiohttp). It triggers on:

1. **Static heuristic** — page HTML matches an SPA fingerprint: empty `<div id="root">`, `<div id="app">`, framework bundles in `<script src>` (React/Vue/Angular/Svelte/Next/Nuxt detection), `<noscript>` flagged, `meta name="fragment"`.
2. **Content sparsity** — fetched HTML has < 200 words of visible text but > 3 script tags pointing to large bundles.
3. **Explicit job flag** — audit jobs with `render: "always"`.
4. **Backlink discovery on SPAs** — if a domain is known SPA (learned from prior crawl), render on first visit.
5. **Re-render** — when initial parse extracts ≤ 5 links from a page that should have many (e.g. blog index).

Sites that render successfully but yield zero new links are **demoted** in the rendering decision (won't re-render unless forced).

### Worker pool

```
render-worker pod:
  • 1 Chromium browser process per pod (reused across tasks)
  • Browser launched headless with:
      --no-sandbox  (relies on K8s seccomp — see Part 22)
      --disable-dev-shm-usage
      --disable-gpu
      --js-flags=--max-old-space-size=512
      blocked resource types: image, media, font (configurable per job)
  • BrowserContext pool: 8 contexts per browser
      - each context = fresh cookies + storage
      - context reused for 50 navigations, then recycled
  • Page reuse: a context holds 1 reusable page; per-task navigation, not per-task page creation
  • Concurrency: 8 active renders per pod
  • Memory cap: pod limited to 1.5 GB; oom-killed → K8s restart → lease reclaim
```

### Render task

```
1. Acquire context lease (semaphore).
2. page.goto(url, wait_until="networkidle", timeout=30s)
3. Optionally evaluate: scroll-to-bottom × 3 to trigger lazy loads.
4. Wait for selectors per job hint (e.g. `body`, `main`, `.product-list`) up to 5 s.
5. Capture: page.content() (HTML), screenshot (audit only), performance metrics.
6. Emit RenderedPage{ html, final_url, timings, captured_console_errors, captured_requests } → q.parse.
7. Release context. Every 50 navigations, close the context and replace.
```

### Optimization

- **Resource blocking** — images/fonts/media off by default during render; they don't yield links.
- **Request interception** — third-party analytics blocked (`google-analytics.com`, `googletagmanager.com`, `facebook.net`, `*.hotjar.com`, …). Saves 30–60% wall time on many pages.
- **Process recycling** — browser process restarts every 2 hours or 5,000 navigations, whichever first; prevents long-tail memory growth.
- **Render budget per job** — caps how many URLs in a single job may be rendered (default 10% of fetched URLs).

### JS execution limits

- Hard timeout 45 s per page.
- Hard cap of 5 MB on captured DOM size.
- Network-idle definition: 2 in-flight requests for 500 ms.
- Script error budget: a page producing > 100 console errors is recorded and skipped.

---

## PART 9 — Scrapy Integration

Scrapy is used for **structured, schedule-driven crawl pipelines** where its built-in scheduler, autothrottle, and pipeline model are a better fit than ad-hoc Celery+aiohttp. Specifically:

- Large sitemap-driven discovery sweeps.
- Periodic backlink graph expansion from known seed lists.
- One-shot domain crawls for new audits before the URL frontier warms up.

aiohttp + Celery remains the path for **incremental, event-driven, per-URL work** triggered by job state changes.

### Spider taxonomy

```
spiders/
  ├── backlinks/
  │     ├── refresh_spider.py        # revisit known source pages
  │     └── expansion_spider.py      # follow new external links to discover backlinks
  ├── sitemaps/
  │     └── sitemap_spider.py        # SitemapSpider subclass; recurses sitemap indexes
  ├── audit/
  │     └── site_audit_spider.py     # bounded BFS over a single host
  └── domain/
        └── domain_seed_spider.py    # first-touch discovery for new tenants
```

### Middleware stack

```
DOWNLOADER_MIDDLEWARES = {
  'crawler.mw.RobotsCacheMiddleware':       100,   # in-process robots.txt lookup
  'crawler.mw.RotatingUserAgentMiddleware': 200,
  'crawler.mw.ProxyMiddleware':             300,
  'crawler.mw.RetryWithBackoffMiddleware':  400,
  'crawler.mw.PolitenessMiddleware':        500,   # talks to Redis token-bucket
  'crawler.mw.CompressionBombGuardMw':      600,
  'crawler.mw.AntibotDetectMiddleware':     700,
  'crawler.mw.MetricsMiddleware':           800,
}

SPIDER_MIDDLEWARES = {
  'crawler.mw.UrlNormalizerMiddleware':     100,
  'crawler.mw.DedupBloomMiddleware':        200,
  'crawler.mw.DepthCapMiddleware':          300,
}

ITEM_PIPELINES = {
  'crawler.pipelines.ValidatePipeline':     100,
  'crawler.pipelines.NormalizePipeline':    200,
  'crawler.pipelines.EnrichPipeline':       300,
  'crawler.pipelines.BatchWritePipeline':   400,    # buffered ClickHouse insert
  'crawler.pipelines.EventEmitPipeline':    500,    # Kafka producer
}
```

### Scheduler

Scrapy's default scheduler is replaced with a **Redis-backed scheduler** (custom, modeled on `scrapy-redis`) so multiple Scrapy worker pods share a single frontier per spider. The scheduler also reads from the platform's URL frontier (Part 3) so Scrapy and Celery workers cooperate, not compete.

### Concurrency tuning

```
CONCURRENT_REQUESTS              = 64
CONCURRENT_REQUESTS_PER_DOMAIN   = 8       # overridden by per-host learned limit
DOWNLOAD_DELAY                   = 0       # politeness is handled in middleware
REACTOR_THREADPOOL_MAXSIZE       = 32
DNSCACHE_ENABLED                 = True
DNSCACHE_SIZE                    = 100_000
AUTOTHROTTLE_ENABLED             = True
AUTOTHROTTLE_START_DELAY         = 1.0
AUTOTHROTTLE_MAX_DELAY           = 30.0
AUTOTHROTTLE_TARGET_CONCURRENCY  = 4.0
```

---

## PART 10 — Robots.txt System

### Lifecycle

```
on first URL for host H:
   try Redis GET robots:{H}
   miss → enqueue fetch on q.discover for "https://H/robots.txt"
   while pending, the URL is parked in host:{H} with reason ROBOTS_PENDING

discover-worker fetches /robots.txt:
   parse with reppy / urllib.robotparser-compatible engine
   store in Redis as JSON:
     {
       "fetched_at": ts,
       "expires_at": ts + 24h,
       "groups": { "rt-bot": {...}, "*": {...} },
       "crawl_delay": 2,
       "sitemap_urls": [...],
       "status": 200
     }
   publish robots.updated event

worker, before fetch:
   GET robots:{H}
   match agent (RankedTagBot, then * fallback)
   apply allow/disallow longest-match
   if disallow → outcome ROBOTS_DISALLOW, no fetch
```

### Cache strategy

- TTL 24 h fresh; SWR up to 7 days if origin returns 5xx during refresh.
- Robots fetch is cheap; rare in absolute terms. Cache hit rate target: > 99%.
- Hash key is `robots:{eTLD+1}`. Subdomains optionally have their own robots (`robots:{full_host}`) — we look up full-host first, fall back to eTLD+1.

### Crawl-delay

If declared, it sets the host's politeness token-bucket refill rate. We never crawl faster than declared, even when a host says `Crawl-delay: 1` and we have budget for 10/s.

### Compliance

- We never bypass robots.txt for content discovery, even when allowed by law.
- We honor `noindex` + `nofollow` directives in HTML and HTTP headers — pages can still be fetched (to detect lost backlinks) but downstream consumers respect the directives.
- `<meta name="robots" content="noai">` and the `X-Robots-Tag: noai` are respected: page facts are stored, but content excerpts are not retained beyond the immediate parse.

### Refresh strategy

Robots refresh runs on a heartbeat every minute. Hosts whose robots last changed within 14 days are refreshed daily; stable ones weekly. Out-of-band: a 403/blocked outcome triggers an immediate robots refetch — robots may have changed.

---

## PART 11 — Rate Limiting & Politeness

### Per-host token bucket

Each host has a Redis bucket:

```
politeness:{host}:tokens         (float)
politeness:{host}:last_refill    (ts)
politeness:{host}:capacity       (int)   default 8
politeness:{host}:refill_rate    (per s) default 1.0  (overridden by Crawl-delay)
politeness:{host}:concurrency    (int)   default 4
politeness:{host}:active         (int counter; INCR on dispatch, DECR on done)
```

Refill + take is a single Lua script (atomic). A fetch is admitted only if `tokens >= 1 AND active < concurrency`.

### Adaptive throttling

Per-host metrics tracked over a sliding 5-min window:

```
err_rate        = 5xx + timeouts + resets
ban_rate        = 403 + 429 + anti-bot detections
latency_p95     = ms
```

Adjustments:

```
if ban_rate > 5%   → refill_rate ×= 0.5,  concurrency = max(1, concurrency − 1)
if err_rate > 10%  → refill_rate ×= 0.7
if latency_p95 > 5000 ms → concurrency = max(1, concurrency − 1)
if all green for 10 min  → refill_rate = min(robots_max, refill_rate × 1.2)
```

Bounded by robots `Crawl-delay` ceiling. Never goes below 0.05 req/s per host.

### User-Agent rotation

```
agents pool = [
  "Mozilla/5.0 (compatible; RankedTagBot/2.0; +https://rankedtag.com/bot)",      # primary, identified
  "Mozilla/5.0 (compatible; RankedTagBot/2.0; audit; +https://...)",              # for audits
  "Mozilla/5.0 (compatible; RankedTagFresh/2.0; +https://...)",                   # for freshness polls
]
```

We **do not** spoof Googlebot or browser UAs for primary fetches — it violates robots semantics and gets us banned faster. Browser-like UAs are used **only** under proxy when a host's WAF rejects identified bots and the customer has opted into elevated discovery for their own properties.

### Header rotation

Accept-Language, Accept-Encoding, and a handful of secondary headers (`Sec-Fetch-*`, `Sec-CH-UA-*` for browser-like fetches) are picked from short lists. Cookies are **not** persisted across hosts. Per-host cookie jars are kept for the duration of a single audit only.

### Concurrency limits — global view

```
global concurrent outbound:   100,000 (cluster cap)
per-eTLD+1:                   4 default, robots.txt override accepted, learned cap
per-IP (target):              respected — at most 1 concurrent per remote IP
per-ASN (target):             respected — soft cap based on ASN reputation
```

The per-target-IP rule is important — many small sites share one IP, and crawling 50 of them at once on a single VPS is hostile even if each host's bucket says "go."

---

## PART 12 — Proxy Rotation System

### Pools

```
proxy_pool: datacenter      — cheap, fast, for whitelisted / low-friction hosts
proxy_pool: residential     — costlier, used for high-friction hosts (escalation only)
proxy_pool: mobile          — last resort; very expensive
proxy_pool: geo:{country}   — geo-targeted (rendering localized content)
```

### Selection

```
default                            → no proxy (identified bot, polite)
host returned 403 / 429 / antibot? → escalate:
   try datacenter pool first;
   if still blocked after 3 retries on 3 different IPs → residential;
   if still blocked → mobile;
   if still blocked → mark host BLOCKED_BY_ORIGIN, stop crawling for 24 h.
geo-locked content (audit)         → geo pool for the customer's target country
```

### Health checks

Each proxy IP has Redis state:

```
proxy:{ip}:success_rate    rolling 5-min
proxy:{ip}:latency_p95     ms
proxy:{ip}:ban_count       per host
proxy:{ip}:cooldown_until  ts (set after a ban)
proxy:{ip}:last_used_at    ts
```

A health-check daemon hits a low-stakes endpoint (a static page on our own infra) through each proxy every 5 min and flags dead proxies. Dead proxies are removed from the pool until they recover.

### Rotation

- **Per-host stickiness**: once a proxy IP is chosen for a host within an audit, it sticks for the audit duration to keep session cookies / WAF tokens valid.
- **Cooldown**: an IP that triggered a 429/403 on host H cannot be used for H for 30 min.
- **Round-robin within pool**: weighted by success_rate × (1 / latency_p95).

### Avoiding bans

1. **Identify first** — most hosts let RankedTagBot through with our public-bot page. We only escalate when blocked.
2. **Honor robots** — a 99% cache-hit on robots means we don't probe forbidden paths.
3. **Adaptive throttle** — slow down before getting banned, not after.
4. **No simulated browsers on non-customer sites** unless explicitly allowed.
5. **Per-IP target cap** — protects small shared-hosting setups.
6. **Backoff with jitter** — never burst-retry, never align retry clocks across workers.

---

## PART 13 — HTML Parsing Engine

### Parser stack

- **Primary**: `selectolax` (Modest engine; C-backed; 5–10× faster than lxml on real-world HTML).
- **Fallback**: `lxml.html` with `recover=True` for HTML that selectolax can't traverse.
- **JSON-LD**: extracted with selectolax, parsed with stdlib `json` (defensive — bad JSON-LD is common).
- **URL parsing**: `urllib.parse` + `tldextract` for eTLD+1 and `idna` for IDN handling.

### Extracted facts

Each parse emits a `PageFacts` record:

```
url_hash, final_url, status, fetched_at, content_type, content_length, content_simhash
title, title_length
meta_description, meta_description_length
canonical, canonical_resolved, canonical_self
robots_meta, robots_http_header, x_robots_tag
viewport, lang
h1_tags[], h2_tags[], h3_tags[]
word_count, text_simhash, text_lang_detected
images_total, images_lazy, images_with_alt, images_with_dimensions
scripts_total, scripts_blocking_head, scripts_async_defer, scripts_inline
stylesheets_total, stylesheets_head, inline_styles_total
json_ld_blocks, json_ld_types[]
og_tags, twitter_tags
hreflang_tags[]
links_internal, links_external, links_nofollow
schema_org_types[]
performance: { ttfb_ms, total_ms, body_bytes, decoded_bytes }
```

### Encoding

Detection order: HTTP `Content-Type` charset → `<meta charset>` → BOM → chardet (only for `text/*` < 2 MB) → utf-8 with errors='replace'. The detected encoding is stored on the page record for downstream audits.

### Malformed HTML

selectolax is permissive; lxml fallback uses `recover=True`. Both parsers are sandboxed: any parse that exceeds 5 s wall time or 200 MB process RSS is killed and recorded as `PARSE_FAIL`. Very rare; observed < 0.05% in production-grade datasets.

### Large pages

A page over 50 MB after decompression is partially parsed: head + first 5 MB of body. We capture enough to score and link-extract, but content text is truncated.

### Reusable parsing modules

```
parsers/
  ├── core.py            # PageFacts assembly
  ├── meta.py            # title, description, canonical, robots, og, twitter
  ├── headings.py        # h1..h6 with order
  ├── links.py           # all <a> + rel + position (Part 14)
  ├── images.py          # <img> + alt + dimensions + lazy
  ├── resources.py       # scripts, styles, fonts, iframes
  ├── jsonld.py          # structured data
  ├── lang.py            # html lang + content language detection
  ├── perf.py            # CLS-relevant signals (no dimensions, large CSS in head, etc.)
  └── audit/             # audit-specific extractors (Part 21)
```

---

## PART 14 — Link Extraction Engine

### Classes of link

```
internal     same eTLD+1 as source
external     different eTLD+1
image        <a href> wrapping <img> (counted separately for anchor analysis)
javascript   javascript:... (recorded, never fetched)
mailto/tel   recorded, never fetched
redirect-ref recorded when source uses a redirector pattern (e.g. /out?url=)
canonical    <link rel="canonical"> handled separately
```

### Per-link metadata captured

```
href_raw           — as found in HTML
url_normalized     — after Part 3 normalization
anchor_text        — visible text inside <a>, including descendants
anchor_type        — exact | partial | branded | generic | naked | image | empty (Part 4)
rel_attributes     — set, e.g. {nofollow, ugc, sponsored, noopener}
position           — main | header | nav | footer | sidebar | article | comment
position_index     — Nth link on page, zero-based
context_text       — ±100 char window around the link
context_simhash    — simhash of context, for stability tracking
status_code        — set later by fetch-worker when link is followed
target_url_status  — set later; tracks if link still resolves
```

### Position classification

Determined by walking up the DOM and matching parent tags:

```
position = 
   'header'  if ancestor matches <header> or [role=banner]
   'nav'     if ancestor matches <nav>    or [role=navigation]
   'footer'  if ancestor matches <footer> or [role=contentinfo]
   'sidebar' if ancestor matches <aside>  or [role=complementary]
   'comment' if ancestor matches [data-comment] or .comments
   'article' if ancestor matches <article> or <main>
   'main'    otherwise
```

Backlinks in `nav`/`footer` are scored lower for SEO weight in downstream analysis than `article`/`main` links — the parser records the raw position; weighting happens in the scoring service.

### Anchor text extraction

Concatenate visible text descendants, normalize whitespace, decode entities, truncate at 256 chars. If empty, look for `aria-label`, then `title`, then descendant `<img alt>`.

### URL normalization

Apply Part 3 normalization to `href_raw` resolved against the page's base URL (`<base href>` if present, else fetched URL). Skip if normalization fails (e.g. malformed URLs); record `LINK_PARSE_FAIL` for telemetry.

---

## PART 15 — Crawl Storage Pipeline

### Stages

```
fetch-worker
   ↓ raw HTML (gzipped, content-addressed)         → S3/GCS: raw/{date}/{url_hash}.html.gz
   ↓ fetch outcome envelope                        → q.parse

parse-worker
   ↓ PageFacts                                     → q.enrich
   ↓ extracted_links (batched 500/msg)             → q.backlinks.ingest (external) + q.frontier (internal)
   ↓ resource metadata                             → page_facts table

enrich-worker
   ↓ tranco rank, geo, WHOIS, certificate facts    → enrich_cache table

writer-worker (batch)
   buffers up to 5000 rows / 2s, whichever first   →
     ClickHouse: page_facts, links, backlinks_events
     Postgres:   crawl_state, jobs
     OpenSearch: audit_issues

event-bus
   page.fetched, page.parsed, link.discovered,
   backlink.new, backlink.changed, backlink.lost
```

### Storage targets

| Store | What lives here | Why |
|---|---|---|
| **S3 / GCS** (raw)         | Compressed HTML, render screenshots, sitemap dumps | Cheap object storage; immutable; 90-day lifecycle |
| **Postgres** (state)       | `crawl_state`, `jobs`, `domains`, tenancy         | Transactional integrity, joins for the API |
| **ClickHouse** (analytics) | `page_facts`, `links`, `backlinks`, `backlinks_history`, audit issues | Columnar, partitioned by date, billions of rows |
| **OpenSearch** (search)    | Audit issues, free-text search across pages       | Faceted search |
| **Redis** (hot)            | Queues, leases, dedup, robots, politeness, cache  | Sub-ms operations |

### Batch insert

ClickHouse writes are **always** batched:

```
buffer ≤ 5,000 rows OR 2 s flush window OR 64 MB raw, whichever first.
Insert via Native protocol; async_insert = 1 with wait_for_async_insert = 0 for tail-latency reduction.
On failure, batch is moved to q.write.retry with full envelope.
```

### Streaming ingestion

The writer pool is shaped to keep p95 ingest latency < 200 ms end-to-end from `page.fetched` event to ClickHouse visibility. The bus → writer path uses Kafka consumer groups with bounded lag SLOs.

### Validation pipeline

Before storage:

1. **Schema validation** — Pydantic models enforce types and ranges.
2. **Range checks** — `word_count` ≤ 1M, `links_count` ≤ 50,000, `title_length` ≤ 2000.
3. **Tenancy stamp** — every row has `org_id`, `job_id`; missing → reject.
4. **Idempotency** — `(url_hash, fetched_at_bucket)` as the dedup key. Replays no-op.

---

## PART 16 — Error Handling & Retry

### Failure classes and policy

| Outcome | Retry? | Backoff | Max attempts | Then |
|---|---|---|---|---|
| `TIMEOUT`             | yes | exp + jitter | 5  | DLQ |
| `CONN_RESET`          | yes | exp + jitter | 5  | DLQ |
| `DNS_FAIL`            | yes | linear (long) | 3 | mark host `DNS_BAD` 1h |
| `SSL_INVALID`         | no  | —          | 1  | record, downstream policy decides |
| `429`                 | yes | honor `Retry-After`; else exp | 8 | back off host; DLQ if persistent |
| `403_BLOCKED`         | yes | escalate proxy (Part 12) | 3 per pool | mark host `BLOCKED_BY_ORIGIN` 24h |
| `404` / `410`         | no  | —          | 1  | mark URL `gone`; if backlink target, mark `lost` |
| `5xx`                 | yes | exp        | 5  | DLQ |
| `CAPTCHA_DETECTED`    | yes | switch proxy pool | 2 | DLQ + abuse signal |
| `ROBOTS_DISALLOW`     | no  | —          | 1  | drop (never retry) |
| `BODY_TOO_LARGE`      | no  | —          | 1  | record; partial parse only |
| `DECOMPRESSION_BOMB`  | no  | —          | 1  | record + flag host (Part 22) |
| `PARSE_FAIL`          | no  | —          | 1  | record outcome; HTML retained for triage |

### Backoff formula

```
delay = min(max_delay, base * 2^attempt) * jitter
  base       = 2 s
  max_delay  = 30 min
  jitter     = uniform(0.5, 1.5)   # decorrelated jitter (Marc Brooker style)
```

URLs awaiting retry sit in `q.retry` (ZSET scored by `ready_at_ts`). The retry promoter (Part 5) moves them back to the right fetch queue when due.

### Failure classification

A small set of detectors run on every response:

```
is_captcha(html)      — known captcha vendor signatures (Cloudflare, reCAPTCHA, hCaptcha)
is_antibot(html)      — Sucuri, PerimeterX, DataDome banners
is_soft_404(html)     — heuristic on text + URL pattern (low-content, "not found" indicators)
is_login_wall(html)   — common login-page signatures
```

A soft-404 with HTTP 200 is recorded as `SOFT_404` outcome — important for audit reports.

### Crawl recovery

Job-level recovery: when an audit's failure rate crosses 30% mid-run, the orchestrator pauses the job, dumps a diagnosis bundle (top 10 outcomes, top 10 host responses, sample HTML), and either (a) auto-resumes after backoff if root cause is `429`/`5xx` storm, or (b) emits `crawler.job.degraded` for human triage. Customer-facing job status switches to `partial`.

### Error logging

Every failed fetch is logged as one structured record with: `trace_id`, `url_hash`, `host`, `outcome`, `http_status`, `response_headers_hash`, `attempt`, `proxy_ip`, `worker_id`, `error_class`, `error_message`. No HTML bodies in logs.

---

## PART 17 — Crawl Monitoring

### Metrics (Prometheus)

```
# throughput
crawler_pages_total{outcome,priority,worker_class}
crawler_fetch_duration_seconds{outcome,worker_class}            (histogram)
crawler_bytes_fetched_total{worker_class}
crawler_links_extracted_total{type}                              # internal/external/image
crawler_backlinks_emitted_total{anchor_type,rel}
crawler_render_duration_seconds                                  (histogram)
crawler_parse_duration_seconds                                   (histogram)

# queues
crawler_queue_depth{queue}
crawler_queue_lag_seconds{queue}                                 # oldest - now
crawler_queue_promoted_total{from,to}

# workers
crawler_worker_active{class}
crawler_worker_leases_held{class}
crawler_worker_oom_total{class}

# politeness
crawler_host_throttled_total{host_class}                          # bucketed; never per-host
crawler_host_blocked_total{host_class,reason}
crawler_robots_cache_hits_total / _misses_total

# proxies
crawler_proxy_success_rate{pool}
crawler_proxy_latency_p95{pool}                                   (gauge)
crawler_proxy_ban_total{pool,host_class}

# storage
crawler_write_batch_size{store}                                   (histogram)
crawler_write_lag_seconds{store}                                  (gauge)

# job-level
crawler_job_progress{job_id}                                      (gauge 0..1; sampled)
crawler_job_state_total{state}
```

> Cardinality discipline: host labels are bucketed (`host_class` ∈ {top10k, top100k, longtail}) — never raw hostnames. Per-job metrics use a low-cardinality sample (top N active jobs).

### Tracing

- W3C trace context carried from API → orchestrator → Celery task headers → worker spans.
- Spans per stage: `fetch`, `render`, `parse`, `link.extract`, `store.write`, `enqueue.children`.
- 100% sampling on error, 5% on success at default; 100% for admin and audit-debug runs.

### Logs

JSON, single sink. Required fields per log line: `ts, level, trace_id, job_id, url_hash, host_class, outcome, worker_id, latency_ms`. No raw URLs or HTML.

### Dashboards

```
Grafana: Crawler — Throughput            # pages/s by outcome, by class
Grafana: Crawler — Queues + Promoters    # depth, lag, promoted/s
Grafana: Crawler — Politeness + Bans     # adaptive throttle activity, ban rates
Grafana: Crawler — Proxies               # success rate, latency, cooldowns
Grafana: Crawler — Renders               # render rate, time, recycle rate, OOMs
Grafana: Crawler — Storage Writers       # batch sizes, write lag, retry rate
Grafana: Crawler — Jobs                  # active jobs, progress, ETA
```

### Sentry

- Worker exceptions (uncaught) report to Sentry with `trace_id`, `job_id`, `url_hash`, redacted URL.
- Sentry rate-limit: 10 errors/min/class deduped by stack hash; protects from log storms.

### SLOs

```
fetch p95 latency:         ≤ 4 s
render p95 latency:        ≤ 25 s
queue lag (q.fetch.p0):    ≤ 30 s
queue lag (q.fetch.p1):    ≤ 5 min
write lag (ClickHouse):    ≤ 60 s
crawler error rate:        ≤ 2% (excluding ROBOTS_DISALLOW)
```

Multi-window, multi-burn-rate alerts on each.

---

## PART 18 — Scalability Strategy

### Target envelope

```
domains crawled:                  10M+ active
URLs in frontier (peak):          500M
pages fetched / day:              500M
backlinks discovered / day:       2B
ClickHouse rows ingested / day:   5–10B
peak concurrent fetches:          100k
peak Chromium contexts:           4k
```

### Stateless workers

- Workers hold no per-job state in memory across pods. All state lives in Redis (hot), Postgres (transactional), ClickHouse (analytical), S3 (blob).
- Any worker can pick up any task at any time. Killing a pod releases its leases within 60 s; survivors absorb the work.

### Distributed scheduling

- Frontier and queues are sharded across Redis Cluster slots; no single key concentrates load.
- Per-host buffers act as natural shards by hostname (politeness key = host).
- Orchestrator is multi-replica; leadership for shard planning is held via a 30 s Redis lease.

### Horizontal scaling

| Component | Scale axis | Trigger |
|---|---|---|
| fetch-worker     | pods | CPU > 60% or queue lag p0/p1 > target |
| render-worker    | pods | render queue depth > 1,000 |
| parse-worker     | pods | parse queue depth > 5,000 |
| writer-worker    | pods | write lag > 30 s |
| Redis (broker)   | shards | slot ops/s > 100k |
| ClickHouse       | shards | ingest > 50% capacity |
| Kafka            | partitions | per-topic lag > target |

HPA in K8s with custom metrics from Prometheus (KEDA). Pod startup-to-ready < 30 s for fetch-worker (small image, async ready check).

### Shard-aware crawling

A **shard key** for each job is `(job_id, host_bucket)` — `host_bucket` is the host hashed into one of 256 buckets. Within a job, shards are independent; failure of one shard never blocks others. This shape lets a single large audit run across thousands of workers without contention.

### Distributed deduplication

Three-tier dedup (also covered in Part 19):

1. **Exact, per-job** — Redis set, TTL = job duration.
2. **Coarse, global** — Redis Bloom filter (10B capacity, 1% FPR).
3. **Content-level** — ClickHouse `content_simhash` near-duplicate check post-fetch.

### Infrastructure scaling

```
network egress:    10 Gbps sustained; bursts handled by NAT gateway autoscale
DNS:               aiodns per worker + central resolver cache; 100k qps total
TLS:               session resumption; OCSP stapling enabled at edge proxies
disk:              workers have only ephemeral storage; everything persists upstream
```

---

## PART 19 — Crawl Deduplication

### What gets deduped, where

| Layer | Key | Store | Window |
|---|---|---|---|
| Within-job URL dedup       | `url_hash` | Redis set `seen:{job_id}` | job lifetime |
| Global URL pre-admit       | `url_hash` | Redis Bloom `dedup:bf:global` | 90 days rolling |
| Page content near-dup       | `content_simhash` | ClickHouse | lifetime |
| Backlink dedup             | `(source_url_hash, target_url_hash, anchor_simhash)` | ClickHouse | lifetime |
| Job dedup (same job posted twice) | `idempotency_key` from API | Postgres `jobs.idempotency_key` (unique) | 24 h |

### URL hashing

```
url_hash = blake2b(canonical_url, digest_size=16)   # 128-bit
```

Why blake2b vs SHA-256: 2–3× faster on Python with `hashlib`, more than enough collision resistance for 10B URLs (probability of collision below 10^-18 at our scale).

### Content simhash

```
text = visible_text_after_boilerplate_removal
shingles = 4-grams of normalized tokens
simhash = 64-bit weighted simhash over shingles
```

Two pages with Hamming distance ≤ 3 over the 64-bit simhash are considered near-duplicates. Used for:

- **Duplicate-content audit** signal.
- **Spam-link cluster** detection (PBN signal).
- Avoiding storing 1,000 mirrors of the same page text.

### Bloom filter sizing

- Capacity: 10B inserts.
- FPR: 1% → ~14 MB/billion entries with optimal hash count; sized to ~12 GB total across the Bloom filter cluster.
- Redis BF (`BF.RESERVE dedup:bf:global 0.01 10000000000 NONSCALING`) sharded across 8 nodes; a URL hashes deterministically to a shard.
- **False positives are acceptable** — at most 1% of URLs are spuriously skipped on the global filter. The per-job exact set catches these for any URL we actually care about within a job.

### Memory efficiency

- Per-job Redis sets use HyperLogLog where exact dedup isn't required (counting distinct hosts seen, etc.) — 12 KB per HLL regardless of cardinality.
- Bloom filter beats a set of 10B blake2b hashes (~160 GB) by an order of magnitude.

### Canonical normalization (recap from Part 3)

The same normalization rules apply to **everything** that gets hashed — URLs, anchors (`anchor_simhash` strips case + whitespace + punctuation), context windows.

---

## PART 20 — Historical Crawl Tracking

### Schema (logical; physical schema is owned by Step 5)

```
page_history (ClickHouse, partition by month)
   url_hash, snapshot_at, content_simhash, title_hash,
   links_internal, links_external, word_count, status

backlinks_history (ClickHouse, partition by month)
   link_id (source_hash+target_hash+anchor_simhash),
   snapshot_at, status, source_dr_snapshot, anchor_text_hash

domain_authority_history
   domain, asof_date, da, dr, trust, spam, computed_by_engine_version
```

### Change detection

Cheap path: compare `content_simhash` of fetched page vs latest in `page_history`. Hamming ≤ 3 → no material change; only update `last_seen_at`. Hamming > 3 → write new snapshot row.

Expensive path (audits only): full text diff stored as patch in S3; referenced from `page_history.patch_s3_key`.

### Recrawl frequency

Driven by Part 4's authority-weighted cadence plus a **change-rate learning** loop: hosts whose pages change frequently get faster cadence, stable ones slower. Updated weekly via a batch job (`q.cadence.recompute`).

### Snapshots

A snapshot is the tuple `(crawl_timestamp, content_simhash, hash_of_page_facts)` — small and append-only. A full HTML snapshot is only retained on demand (audit run, manual customer request, anomaly), and lifecycle-managed in S3 (default 90 days).

### Incremental crawling

We don't recrawl what hasn't changed. The cycle:

1. HEAD request first when allowed; if `Last-Modified`/`ETag` unchanged → skip body.
2. If body must be fetched, compute simhash; if matches latest snapshot, mark `unchanged` and write only a heartbeat row.
3. If changed, full parse + link diff (only new + removed links are emitted as events).

This cuts steady-state crawl volume by ~70% versus naive recrawling.

---

## PART 21 — SEO Audit Crawler

### Pipeline

```
POST /api/v1/audits                            (Step 6)
  → orchestrator creates Audit + Job, enqueues q.audit.start

q.audit.start:
   seed worker:
     - fetch robots.txt
     - fetch sitemap (and sub-sitemaps, bounded depth 3)
     - resolve seed URLs (homepage, sitemap roots)
     - admit into frontier with audit_job_id

q.audit.crawl:
   audit-worker fetches (uses Part 7 paths)
   render decision per Part 8
   handoff to q.parse with audit context (so audit-specific extractors run)

q.audit.analyze:
   per-page issue extractors:
     • title / description length, missing, duplicate (tracked across audit)
     • H1 missing / multiple / order
     • canonical chains + conflicts
     • indexability (robots, noindex, X-Robots-Tag, redirect loops)
     • broken links (4xx/5xx target reachability sample)
     • mixed content (HTTP resources on HTTPS pages)
     • image alt missing
     • images without dimensions (CLS)
     • render-blocking resources in head
     • slow TTFB (> 800 ms)
     • duplicate content (simhash clusters within site)
     • orphan pages (no internal links pointing in)
     • redirect chains > 3 hops
     • hreflang errors (missing return tag, mismatched language)
     • structured data validity (schema.org)
     • mobile viewport meta
     • HTTPS / HSTS posture

q.audit.aggregate:
   roll up counts, severities, scoring
   emit audit.summary.updated event after each batch (drives UI WS)
   final audit.completed when frontier drained
```

### Audit-only extractors

Each lives in `parsers/audit/` as a single-purpose module — input is the parsed DOM + headers + redirect chain, output is a list of `AuditIssue { type, severity, url, context, evidence }`.

### Scope control

```
audit job options:
  scope: "subdomain"  → restrict to *.example.com (default)
  scope: "host"       → restrict to www.example.com
  scope: "directory"  → restrict to /blog/
  max_pages: 25 / 500 / 10_000 / 100_000  (tier-bound)
  render: "auto" | "always" | "never"
  include_external_targets: bool   # follow external links for liveness check
```

### Resumability

Each audit shard is checkpointed every 1,000 URLs. Audit jobs are **resumable**: pause/resume flips a row; workers exit at checkpoint; resume re-leases shards and continues. Cancellation is graceful: in-flight pages finish; no new shards are leased.

---

## PART 22 — Security Hardening

### Inbound (URLs we crawl)

| Threat | Defense |
|---|---|
| **SSRF** | DNS-resolve before fetch; reject any URL resolving to private/link-local/loopback ranges (10/8, 172.16/12, 192.168/16, 127/8, 169.254/16, fc00::/7, fe80::/10). Re-resolve at connect time to defeat DNS rebind. Disable HTTP redirects to private IPs. |
| **Infinite crawl traps** | Per-job URL cap; per-host page cap; depth limit; **same-content-pattern detection** (if 100 URLs from a host all share `content_simhash`, mark host as trap and demote). |
| **Crawl poisoning** | Frontier admission requires `(source_url, target_url)` tuple — never accept "discovered" URLs from untrusted sources. Sitemap URLs are bounded (max entries per sitemap). |
| **Decompression bombs** | Hard cap 10 MB compressed, 100× decompression ratio, 50 MB decoded. Streamed decode; abort on cap. |
| **Malicious payloads** | Response `Content-Type` whitelist (`text/*`, `application/xhtml+xml`, `application/xml`, `application/rss+xml`). Anything else recorded but not parsed. |
| **Massive redirect chains** | Max 5 hops; longer treated as `REDIRECT_LOOP`. |
| **Resource exhaustion via slowloris** | Read timeout per chunk (5 s without any byte → abort). |

### Outbound (responses we render)

| Threat | Defense |
|---|---|
| **Browser escape (Chromium 0-day)** | Render workers run in a separate K8s namespace with strict NetworkPolicy: egress to internet only (no internal cluster IPs reachable). Seccomp profile applied. No privileged containers. No host PID/IPC namespace. |
| **Renderer credential exfiltration** | Render workers have no service tokens mounted, no S3 creds, no DB creds. They communicate only via the queue. |
| **Script-driven storage abuse** | Captured page HTML is size-capped (5 MB). Render writes go through the same validation pipeline as fetch. |

### Worker isolation

- One render worker pod per Chromium browser; OOM kills the pod, not the node.
- AppArmor / SELinux profiles where the host supports them.
- Pod resource limits enforced (cpu, memory, ephemeral-storage); breaching them kills the pod (acceptable; lease reclaim handles work).

### URL validation

```
- scheme must be http/https
- host must be a valid public hostname (idna-encoded)
- length ≤ 2,083 chars
- not in admin blocklist
- not on per-job exclusion list
- not matching honeytrap patterns
```

### Crawl-trap heuristics

Detection signals:

```
- > 1000 URLs deep into a single host without new content_simhashes
- URL pattern fits "?page=N" with N escalating and content stable
- Calendar-style endless date URLs (/2020/01/01, /2020/01/02, ...)
- Session-id URLs (parameter values look like 32-char hex)
```

When triggered, the host is paused for the job and an `crawler.host.trap_detected` event is emitted.

---

## PART 23 — Testing Architecture

### Test surfaces

| Surface | Tooling | What we prove |
|---|---|---|
| Unit             | pytest + pytest-asyncio | Parsers, normalizers, scoring formulas |
| Contract         | pytest + pydantic schemas | Event payloads, task signatures |
| Component        | pytest + docker-compose | One worker class + Redis + Postgres |
| Integration      | pytest + full mini-cluster | Orchestrator + 1 of each worker class |
| End-to-end       | pytest + real test domain | Single audit on rankedtag.com staging |
| Load             | Locust | Frontier admission rate, queue throughput |
| Fuzz             | hypothesis | URL normalizer, HTML parser |
| Chaos            | toxiproxy + chaos-mesh | Network partition, slow disks, broker death |

### Fixtures

```
fixtures/
  ├── html/
  │     ├── normal.html
  │     ├── spa_empty.html
  │     ├── trap_paginated.html
  │     ├── decompression_bomb.html.gz
  │     ├── captcha_page.html
  │     ├── massive_redirect.html
  │     ├── malformed.html
  │     └── slow_loris.txt
  ├── robots/
  │     ├── basic.txt
  │     ├── crawl_delay.txt
  │     ├── wildcard.txt
  │     └── malformed.txt
  └── sitemaps/
        ├── single.xml
        ├── index_of_index.xml      # depth-3 sitemap index
        └── giant.xml.gz
```

### Crawler test harness

A `wiremock`-like local HTTP server (FastAPI) serves controlled responses keyed on URL pattern, including:

- Configurable delays, headers, status codes.
- Pluggable `robots.txt` per host.
- Decompression bomb endpoint (gzipped 500 MB of zeros).
- Slowloris endpoint.
- Captcha-style response.
- SPA endpoint (empty HTML + bundled JS that injects content via `document.write` on load).

### Queue tests

- Promoter loop tests (`q.retry` → fetch with ZADD/ZRANGEBYSCORE) under simulated clock.
- Lease expiry tests (Redis fakerediscluster + freezegun).
- Backpressure tests (worker simulates ack-late + sigterm; verify no work lost).

### Retry tests

Each failure class has a property-based test asserting:

- Correct retry count given outcome.
- Correct queue routing.
- Correct backoff window with jitter bounds.
- Eventual DLQ.

### Proxy tests

A local proxy fixture (mitmproxy in scriptable mode) injects bans, latency, and SSL errors. Tests assert pool escalation behavior end-to-end.

### Render tests

Playwright in tracing mode against the test harness; assertions on:

- Trigger heuristic accuracy (SPA → render).
- Context recycling cadence.
- OOM-safe restart.

### Load tests

```
locust scenarios:
  - 10k req/s sustained through orchestrator admission API
  - 100k frontier ZADD/s
  - 50k task enqueue/s into Celery via Redis
  - Mixed read/write to ClickHouse at target write batch size
```

Targets: zero queue lag, p99 admission latency < 50 ms.

---

## PART 24 — Deployment Architecture

### Containers

| Image | Base | Size target |
|---|---|---|
| `crawler-fetch`       | python:3.12-slim                | 180 MB |
| `crawler-render`      | mcr.microsoft.com/playwright/python | 1.4 GB |
| `crawler-parse`       | python:3.12-slim + lxml + selectolax | 220 MB |
| `crawler-discover`    | python:3.12-slim                | 180 MB |
| `crawler-audit`       | python:3.12-slim                | 200 MB |
| `crawler-writer`      | python:3.12-slim + clickhouse-driver | 200 MB |
| `crawler-orchestrator`| python:3.12-slim + fastapi      | 200 MB |

Multi-stage builds: deps layer rebuilt only when requirements change; app code in final layer; non-root user (`uid=10001`); `tini` as PID 1.

### Kubernetes deployments

```
namespace: rt-crawler

Deployment:    crawler-orchestrator      replicas: 3       HPA: cpu 70%
Deployment:    crawler-fetch-worker      replicas: 50–5000 HPA: queue lag (KEDA)
Deployment:    crawler-render-worker     replicas: 10–500  HPA: render queue depth (KEDA)
Deployment:    crawler-parse-worker      replicas: 20–1000 HPA: parse queue depth (KEDA)
Deployment:    crawler-discover-worker   replicas: 10–500  HPA: discover queue depth (KEDA)
Deployment:    crawler-audit-worker      replicas: 10–200  HPA: audit queue depth (KEDA)
Deployment:    crawler-writer-worker     replicas: 10–200  HPA: write lag (KEDA)

StatefulSet:   redis-cluster             6 nodes (3 primary + 3 replica)
StatefulSet:   redis-broker              dedicated for Celery brokering, separate from cache cluster
StatefulSet:   kafka                     3 brokers
StatefulSet:   clickhouse                3 shards × 2 replicas
StatefulSet:   postgres                  primary + 2 replicas (Patroni)
StatefulSet:   opensearch                3 master + 6 data

DaemonSet:     node-local-cache (mTLS sidecar / DNS cache)

Job:           crawl-migrator            schema migrations on rollout
CronJob:       robots-refresh            top hosts hourly
CronJob:       cadence-recompute         weekly
CronJob:       dlq-triage-report         daily
```

### Autoscaling — KEDA scalers

```
fetch-worker:
   scaler: redis-streams + prometheus
   metric: max(queue_lag_seconds{queue=~"q.fetch.p[01]"})
   target: 30
   minReplicas: 50
   maxReplicas: 5000
   cooldown: 300s

render-worker:
   scaler: redis (LLEN)
   metric: q.render depth
   target: 200 per replica
   minReplicas: 10
   maxReplicas: 500
   cooldown: 600s
```

### Networking

- Render workers in their own namespace with NetworkPolicy denying egress to cluster CIDRs (Part 22).
- Fetch workers egress through a NAT gateway with elastic IP rotation (16 IPs in a pool, rotated by AWS NAT scaling).
- Internal services use mTLS (Linkerd or Istio service mesh).
- Public-facing endpoints terminate at an ALB + WAF.

### Storage

- S3: lifecycle rule moves raw HTML > 30 days to Glacier; > 90 days deleted.
- ClickHouse: monthly partitions; partitions > 36 months migrated to S3-backed storage policy.
- Postgres: WAL archived to S3; PITR retained 14 days.
- Redis: AOF + RDB; no PITR (acceptable; queues are tolerant of replay).

### Rollout

- Canary: 1% of fetch workers, 1% of orchestrator replicas; success = no SLO regression for 30 min; promote.
- Schema migrations: pre-deploy job; backward-compatible adds; column drops gated 2 releases later.
- Worker code rollouts use rolling update with `maxUnavailable: 10%` and `maxSurge: 25%`; in-flight tasks finish (graceful 60 s drain), pending leases reclaim naturally.

### Disaster recovery

- Redis loss: queues replay from Postgres + Kafka. Workers stall briefly; resumption is automatic.
- ClickHouse partition loss: re-derive from `page_history` snapshots + Kafka topic retention (7 days).
- Region outage: standby region in cold mode; promote with DNS + Postgres replica.

---

## PART 25 — Folder Structure

```
seo-suite/backend/app/crawlers/
├── __init__.py
├── orchestrator/
│   ├── app.py                    # FastAPI: /internal/crawler/*
│   ├── shard_planner.py
│   ├── budget_allocator.py
│   ├── lease.py                  # Redis lease primitives
│   ├── leader.py                 # leader election
│   └── promoters/
│       ├── retry_promoter.py
│       └── host_buffer_promoter.py
│
├── frontier/
│   ├── admit.py                  # admission, dedup, scoring
│   ├── normalize.py              # canonical URL normalizer (Part 3)
│   ├── score.py                  # discovery + fetch scoring (Parts 3, 6)
│   ├── bloom.py                  # Redis Bloom adapter
│   └── seen.py                   # per-job exact dedup
│
├── queues/
│   ├── names.py                  # constants for q.* names
│   ├── celery_app.py             # broker + routing config
│   ├── routing.py                # priority → queue map
│   └── delay.py                  # retry + delayed ZSET helpers
│
├── workers/
│   ├── fetch/
│   │   ├── worker.py
│   │   ├── http_client.py        # aiohttp session, pool
│   │   ├── outcomes.py
│   │   └── detectors.py          # captcha/antibot/soft-404
│   ├── render/
│   │   ├── worker.py
│   │   ├── pool.py               # browser + context pool
│   │   ├── decide.py             # render trigger heuristics
│   │   └── interceptors.py       # resource blocking
│   ├── parse/
│   │   ├── worker.py
│   │   └── pipeline.py
│   ├── discover/
│   │   ├── worker.py
│   │   ├── sitemap.py
│   │   ├── rss.py
│   │   └── robots_fetch.py
│   ├── audit/
│   │   ├── worker.py
│   │   ├── seed.py
│   │   ├── analyze.py
│   │   └── aggregate.py
│   ├── writer/
│   │   ├── worker.py
│   │   ├── clickhouse_batch.py
│   │   └── postgres_state.py
│   └── enrich/
│       ├── worker.py
│       ├── tranco.py
│       ├── whois.py
│       ├── geoip.py
│       └── wayback.py
│
├── parsers/
│   ├── core.py
│   ├── meta.py
│   ├── headings.py
│   ├── links.py
│   ├── images.py
│   ├── resources.py
│   ├── jsonld.py
│   ├── lang.py
│   ├── perf.py
│   └── audit/
│       ├── titles.py
│       ├── canonicals.py
│       ├── indexability.py
│       ├── broken_links.py
│       ├── duplicate_content.py
│       ├── hreflang.py
│       ├── mixed_content.py
│       ├── structured_data.py
│       └── ...
│
├── robots/
│   ├── cache.py                  # Redis-backed lookup
│   ├── parse.py
│   └── refresh.py
│
├── politeness/
│   ├── token_bucket.py           # Lua-backed
│   ├── adaptive.py               # ban/err/latency feedback
│   ├── concurrency.py            # per-host + per-IP + per-ASN caps
│   └── ua_pool.py
│
├── proxies/
│   ├── pool.py
│   ├── health.py
│   ├── select.py
│   └── cooldown.py
│
├── backlinks/
│   ├── ingest.py
│   ├── validate.py
│   ├── classify_anchor.py
│   ├── freshness.py
│   └── candidate_schema.py
│
├── scrapy/
│   ├── settings.py
│   ├── spiders/
│   │   ├── backlinks/
│   │   │   ├── refresh_spider.py
│   │   │   └── expansion_spider.py
│   │   ├── sitemaps/
│   │   │   └── sitemap_spider.py
│   │   ├── audit/
│   │   │   └── site_audit_spider.py
│   │   └── domain/
│   │       └── domain_seed_spider.py
│   ├── middlewares/
│   │   ├── robots_cache.py
│   │   ├── rotating_ua.py
│   │   ├── proxy.py
│   │   ├── retry_backoff.py
│   │   ├── politeness.py
│   │   ├── compression_bomb.py
│   │   ├── antibot.py
│   │   ├── url_normalizer.py
│   │   ├── dedup_bloom.py
│   │   ├── depth_cap.py
│   │   └── metrics.py
│   ├── pipelines/
│   │   ├── validate.py
│   │   ├── normalize.py
│   │   ├── enrich.py
│   │   ├── batch_write.py
│   │   └── event_emit.py
│   └── scheduler/
│       └── redis_scheduler.py
│
├── storage/
│   ├── s3.py                     # raw HTML object store
│   ├── postgres_repo.py          # crawl_state, jobs
│   ├── clickhouse_repo.py        # page_facts, links, backlinks*
│   └── opensearch_repo.py        # audit_issues
│
├── events/
│   ├── producer.py               # Kafka producer
│   ├── topics.py                 # topic constants
│   └── schemas/                  # event payload dataclasses
│       ├── job.py
│       ├── page.py
│       ├── link.py
│       └── backlink.py
│
├── monitoring/
│   ├── metrics.py                # prometheus_client
│   ├── tracing.py                # OpenTelemetry init
│   └── logging.py                # JSON structlog config
│
├── security/
│   ├── url_guard.py              # SSRF + ranges + scheme
│   ├── decompression.py          # bomb guard
│   ├── content_type.py           # whitelist
│   └── trap_detect.py
│
└── testing/
    ├── harness/
    │   ├── http_server.py        # controllable fixture server
    │   ├── proxy_server.py
    │   └── browsers.py
    └── fixtures/
        ├── html/
        ├── robots/
        └── sitemaps/
```

```
seo-suite/backend/deployments/crawler/
├── k8s/
│   ├── namespace.yaml
│   ├── orchestrator-deploy.yaml
│   ├── fetch-deploy.yaml
│   ├── render-deploy.yaml         # separate namespace + NetworkPolicy
│   ├── parse-deploy.yaml
│   ├── discover-deploy.yaml
│   ├── audit-deploy.yaml
│   ├── writer-deploy.yaml
│   ├── enrich-deploy.yaml
│   ├── redis-cluster.yaml
│   ├── kafka.yaml
│   ├── clickhouse.yaml
│   ├── keda-scaledobjects.yaml
│   ├── networkpolicies.yaml
│   ├── servicemonitors.yaml
│   └── rbac.yaml
├── helm/
│   └── crawler/
│       ├── Chart.yaml
│       ├── values.yaml
│       └── templates/
├── docker/
│   ├── fetch.Dockerfile
│   ├── render.Dockerfile
│   ├── parse.Dockerfile
│   ├── discover.Dockerfile
│   ├── audit.Dockerfile
│   ├── writer.Dockerfile
│   └── orchestrator.Dockerfile
└── runbooks/
    ├── queue-backlog.md
    ├── render-oom.md
    ├── host-ban-escalation.md
    └── clickhouse-write-lag.md
```

---

**STEP 7 SEO CRAWLER ARCHITECTURE COMPLETED**

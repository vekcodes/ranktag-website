# RankedTag SEO Platform — API Architecture (Step 6)

Production-grade API architecture for a Domain Authority + Backlink Analysis platform comparable in shape to Ahrefs / Semrush. **Design only — no implementation.** This document defines the routing surface, contracts, async model, security envelope, scaling posture, and forward-compatibility rules that every service in the backend must conform to.

> Audience: backend, infra, platform, SRE.
> Scope: HTTP + WebSocket + internal RPC surface. Database schemas, crawler logic, and worker code are out of scope here.

---

## Table of Contents

1. [API Structure & Top-Level Routing](#part-1--api-structure--top-level-routing)
2. [Domain Analysis APIs](#part-2--domain-analysis-apis)
3. [Backlink APIs](#part-3--backlink-apis)
4. [Referring Domain APIs](#part-4--referring-domain-apis)
5. [SEO Audit APIs](#part-5--seo-audit-apis)
6. [Crawler Internal APIs](#part-6--crawler-internal-apis)
7. [Authentication APIs](#part-7--authentication-apis)
8. [User Dashboard APIs](#part-8--user-dashboard-apis)
9. [Billing APIs](#part-9--billing-apis)
10. [Export APIs](#part-10--export-apis)
11. [Admin APIs](#part-11--admin-apis)
12. [Response Standardization](#part-12--response-standardization)
13. [Pagination Strategy](#part-13--pagination-strategy)
14. [Filtering & Search Strategy](#part-14--filtering--search-strategy)
15. [Async Job Architecture](#part-15--async-job-architecture)
16. [WebSocket Architecture](#part-16--websocket-architecture)
17. [API Security](#part-17--api-security)
18. [Rate Limiting Strategy](#part-18--rate-limiting-strategy)
19. [Caching Strategy](#part-19--caching-strategy)
20. [API Versioning Strategy](#part-20--api-versioning-strategy)
21. [Microservice Strategy](#part-21--microservice-strategy)
22. [OpenAPI & Documentation Strategy](#part-22--openapi--documentation-strategy)
23. [Performance Strategy](#part-23--performance-strategy)
24. [Monitoring & Observability](#part-24--monitoring--observability)
25. [Engineering Best Practices](#part-25--engineering-best-practices)

---

## PART 1 — API Structure & Top-Level Routing

The API is organized by **audience** (who can call it) and then by **version** (stable contract). Audience is the outermost grouping because policies — auth, rate limits, CORS, deprecation cadence, billing — vary by audience, not by feature.

```
/api
├── /v1                      # Public-stable surface (consumer dashboard + SDKs)
│   ├── /auth                # registration, login, tokens, MFA
│   ├── /users               # user profile, preferences
│   ├── /teams               # team membership, invitations, RBAC
│   ├── /projects            # workspaces / saved monitoring targets
│   ├── /domains             # Domain Authority, DR, trust, spam, history
│   ├── /backlinks           # backlink graph, filters, anchor analysis
│   ├── /referring-domains   # referring domain / IP / subnet analysis
│   ├── /audits              # technical SEO audits + crawl reports
│   ├── /exports             # CSV / XLSX / PDF generation jobs
│   ├── /notifications       # in-app + email notification feed
│   ├── /search              # cross-resource search (domains, projects)
│   ├── /billing             # subscriptions, invoices, payment methods
│   ├── /usage               # quota + consumption introspection
│   └── /jobs                # generic async job status (poll fallback)
│
├── /v2                      # Next stable contract (when v1 deprecates)
│   └── …                    # mirrors v1 with breaking changes; see Part 20
│
├── /public                  # Programmatic API for paying customers + SDKs
│   ├── /v1
│   │   ├── /domain
│   │   ├── /backlinks
│   │   ├── /referring-domains
│   │   ├── /audits
│   │   └── /exports
│   └── /openapi.json        # versioned OpenAPI spec
│
├── /internal                # East-west traffic between RankedTag services
│   ├── /crawler             # crawl job lifecycle (see Part 6)
│   ├── /scoring             # DR/DA/Trust scoring engine
│   ├── /enrichment          # WHOIS, GeoIP, Tranco, Wayback lookups
│   ├── /events              # event bus ingestion (job state, billing)
│   ├── /search-index        # OpenSearch/Elastic indexer hooks
│   └── /workers             # worker self-registration, heartbeat, drain
│
├── /admin                   # Operator surface (staff only, SSO + MFA)
│   ├── /users               # user lookup, suspend, refund credits
│   ├── /orgs                # tenant management
│   ├── /billing             # revenue, MRR, refunds, plan overrides
│   ├── /jobs                # global queue inspection, replay, kill
│   ├── /workers             # worker fleet status, drain, decommission
│   ├── /abuse               # abuse signals, IP/ASN blocklists
│   ├── /feature-flags       # rollout controls
│   └── /metrics             # system metrics gateway
│
├── /webhooks                # Inbound webhooks from third parties
│   ├── /stripe              # billing events
│   ├── /sendgrid            # bounce/spam reports
│   └── /clerk               # auth provider (if delegated)
│
├── /ws                      # WebSocket entrypoints (see Part 16)
│   ├── /v1/jobs/{job_id}
│   ├── /v1/projects/{project_id}/events
│   ├── /v1/dashboard
│   └── /admin/queue
│
├── /openapi                 # Specs per audience + version
│   ├── /v1.json
│   ├── /public-v1.json
│   └── /admin.json
│
├── /docs                    # Swagger UI
├── /redoc                   # ReDoc
└── /health                  # /live, /ready, /startup (see Part 24)
```

**Why this shape**

- **Audience-first routing** lets the API gateway apply distinct policies (auth method, CORS, rate limits, WAF rules) without per-route configuration.
- **Versioning lives inside each audience**, not at the top, so `/public/v1` can deprecate on a different schedule than `/api/v1`.
- **`/internal` is gateway-isolated** — never exposed to the public load balancer. Auth is mTLS or short-lived service tokens; rate limits are much higher; observability is verbose.
- **`/admin` is fully separated** for auth (SSO + MFA + IP allow-list) and audit logging — every admin call is logged with operator identity, target, before/after diff, and trace ID.

---

## PART 2 — Domain Analysis APIs

### Endpoints

| Method | Path | Purpose | Sync/Async |
|---|---|---|---|
| `GET`  | `/api/v1/domains/{domain}`                       | Snapshot: DA, DR, trust, spam, summary | Sync (cached) |
| `POST` | `/api/v1/domains/lookup`                         | Single lookup with options (fresh, depth) | Sync or 202 |
| `POST` | `/api/v1/domains/bulk`                           | Bulk lookup, up to N domains             | **Async (202)** |
| `GET`  | `/api/v1/domains/{domain}/history`               | Historical DA/DR timeseries              | Sync |
| `GET`  | `/api/v1/domains/{domain}/seo-score`             | Composite SEO score breakdown            | Sync |
| `GET`  | `/api/v1/domains/{domain}/trust-score`           | Trust score + signals                    | Sync |
| `GET`  | `/api/v1/domains/{domain}/spam-score`            | Spam score + flagged signals             | Sync |
| `GET`  | `/api/v1/domains/{domain}/competitors`           | Competitor set + overlap                 | Sync |
| `GET`  | `/api/v1/domains/{domain}/summary`               | Aggregated card payload for UI           | Sync |

### Single-domain request/response shape

```http
GET /api/v1/domains/example.com?fresh=false&include=signals,history
```

```json
{
  "data": {
    "domain": "example.com",
    "scores": {
      "domainAuthority":  { "value": 64, "scale": "0-100", "asOf": "2026-05-12T08:00:00Z" },
      "domainRating":     { "value": 71, "scale": "0-100", "asOf": "2026-05-12T08:00:00Z" },
      "trustScore":       { "value": 58, "scale": "0-100" },
      "spamScore":        { "value":  4, "scale": "0-17"  }
    },
    "graph": {
      "referringDomains": 12450,
      "backlinks":        892341,
      "dofollowRatio":    0.62
    },
    "signals": {
      "trancoRank": 18234,
      "firstSeen":  "2003-04-11",
      "tldClass":   "gtld",
      "geo":        { "country": "US", "asn": "AS15169" }
    }
  },
  "meta": {
    "cache": { "hit": true, "age_s": 322, "swr": true },
    "engine": "rankedtag-authority-v2",
    "traceId": "01HZX9F4B5..."
  }
}
```

### Bulk lookup — async contract

```http
POST /api/v1/domains/bulk
Content-Type: application/json

{ "domains": ["a.com", "b.com", ...], "fresh": false, "notify": { "webhook": "https://…" } }
```

**202 Accepted** returns a `Job` envelope (see Part 15). The caller polls `/api/v1/jobs/{job_id}` or subscribes via `WS /ws/v1/jobs/{job_id}`. Results are written to object storage (S3/GCS) and surfaced via `result_url` on completion.

### Async processing flow

```
client → POST /domains/bulk
         ↓
       gateway (auth, quota, rate-limit)
         ↓
       enqueue Celery task `domains.bulk_lookup` on `q.scoring`
         ↓
       worker fans out per-domain to `q.enrichment` (Tranco, Wayback, WHOIS, GeoIP)
         ↓
       per-domain results joined; aggregate written to S3 + Postgres
         ↓
       publish `job.completed` to event bus → WebSocket fanout + optional webhook
```

---

## PART 3 — Backlink APIs

### Endpoints

| Method | Path | Purpose |
|---|---|---|
| `GET`  | `/api/v1/backlinks`                              | Paginated backlinks for a domain (cursor) |
| `POST` | `/api/v1/backlinks/query`                        | Complex filter + sort body (preferred for large queries) |
| `GET`  | `/api/v1/backlinks/{link_id}`                    | Single backlink detail |
| `GET`  | `/api/v1/backlinks/anchors`                      | Anchor text distribution |
| `GET`  | `/api/v1/backlinks/history`                      | Aggregate backlink count timeseries |
| `GET`  | `/api/v1/backlinks/new`                          | Backlinks discovered in window |
| `GET`  | `/api/v1/backlinks/lost`                         | Backlinks lost in window |
| `GET`  | `/api/v1/backlinks/toxic`                        | Backlinks flagged as toxic + reasons |
| `POST` | `/api/v1/backlinks/disavow`                      | Build disavow list (async export) |

### Pagination strategy — backlinks

Backlink datasets routinely exceed **100M rows per domain**. Offset pagination is unusable: `OFFSET 5000000` on a hot Postgres or columnar store reads and discards five million rows for every page.

We use **opaque cursor pagination**, keyed on a stable composite sort key — typically `(first_seen DESC, link_id DESC)`. The cursor encodes the last-seen sort tuple, base64-url'd and HMAC-signed so it cannot be forged or replayed across sort orders:

```
cursor := base64url( hmac_sign( { "k": [first_seen, link_id], "s": "first_seen:desc", "f": <filter-hash> } ) )
```

Changing the filter or sort invalidates the cursor — clients restart from page 1. This is intentional: it prevents the dataset from "shifting under" a paginating client.

### Filter contract (GET form, query string)

```
GET /api/v1/backlinks
  ?target=example.com
  &follow=dofollow              # dofollow | nofollow | any
  &min_dr=30
  &max_spam=4
  &anchor=startup
  &country=US,CA,GB
  &tld=com,io
  &first_seen_gte=2026-01-01
  &sort=-first_seen,-source_dr
  &cursor=eyJrIjpbIjIwMjYtMDUt…
  &limit=100
```

### Filter contract (POST form, body) — for complex queries

```json
POST /api/v1/backlinks/query
{
  "target": "example.com",
  "filters": {
    "follow":        ["dofollow"],
    "source": {
      "dr":    { "gte": 30 },
      "spam":  { "lte": 4 },
      "tld":   ["com","io"],
      "geo":   { "country": ["US","CA"] }
    },
    "anchor":        { "contains_any": ["startup","saas"] },
    "first_seen":    { "gte": "2026-01-01" },
    "exclude_lost":  true
  },
  "sort":   [{ "field": "first_seen", "dir": "desc" },
             { "field": "source_dr",  "dir": "desc" }],
  "cursor": "eyJ…",
  "limit":  100
}
```

**Why POST for query**: filter bodies routinely exceed 2 KB once enterprise customers add 50-element anchor lists or country sets. URL length limits become a real issue at the CDN.

### Response

```json
{
  "data": [
    {
      "linkId":      "bl_01HZX…",
      "source":      { "url": "…", "domain": "ref.com", "dr": 64, "spam": 2, "country": "US" },
      "target":      { "url": "…", "domain": "example.com" },
      "anchor":      "best saas tools",
      "anchorType":  "exact",        // exact | partial | branded | generic | image | naked
      "rel":         ["nofollow","ugc"],
      "firstSeen":   "2025-11-02",
      "lastSeen":    "2026-05-10",
      "status":      "live",         // live | lost | redirect
      "toxicity":    { "score": 0.08, "flags": [] }
    }
  ],
  "meta": {
    "cursor":   { "next": "eyJ…", "hasMore": true },
    "filters":  { "applied": 5 },
    "estimate": { "total": "≥1.2M", "exact": false },
    "traceId":  "01HZX…"
  }
}
```

### Toxic link detection

`/backlinks/toxic` returns links scored by a toxicity model — features include source DR, spam signals, PBN clusters, link velocity, and anchor over-optimization. Each row carries an explainability bundle: `flags[]` (e.g. `pbn_cluster`, `gambling_neighbor`, `dropped_domain`) and `recommendation` (`monitor` | `disavow`).

### Anchor analysis

`/backlinks/anchors` returns a faceted aggregation:

```json
{
  "data": {
    "distribution": [
      { "anchor": "click here", "type": "generic",  "count": 4821, "share": 0.18 },
      { "anchor": "example",    "type": "branded",  "count": 3110, "share": 0.12 }
    ],
    "byType": { "exact": 0.08, "partial": 0.21, "branded": 0.41, "generic": 0.22, "naked": 0.06, "image": 0.02 },
    "overOptimizationRisk": { "score": 0.31, "verdict": "moderate" }
  }
}
```

---

## PART 4 — Referring Domain APIs

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/api/v1/referring-domains`                            | Paginated referring domains (cursor) |
| `GET` | `/api/v1/referring-domains/ips`                        | Referring IPs (aggregated) |
| `GET` | `/api/v1/referring-domains/subnets`                    | Class-C subnet aggregation |
| `GET` | `/api/v1/referring-domains/countries`                  | Country distribution |
| `GET` | `/api/v1/referring-domains/tlds`                       | TLD distribution |
| `GET` | `/api/v1/referring-domains/authority-distribution`     | DR/DA histogram buckets |
| `GET` | `/api/v1/referring-domains/graph`                      | Relationship graph (nodes + edges) |

### Graph response (capped for UI)

```json
{
  "data": {
    "nodes": [
      { "id": "example.com", "type": "target",    "dr": 71 },
      { "id": "ref.com",     "type": "referring", "dr": 64, "country": "US" }
    ],
    "edges": [
      { "source": "ref.com", "target": "example.com", "weight": 142, "firstSeen": "2024-03-01" }
    ]
  },
  "meta": { "capped": true, "limit": 500, "fullExport": "/api/v1/exports?type=referring_graph&job=…" }
}
```

Graph endpoints **always cap** node count (default 500). For full extracts, clients call `/exports` and receive a job — never stream a million-node graph through HTTP.

### Authority distribution

Histogram with explicit buckets — never floating-point bins:

```
buckets = [0-10, 11-20, 21-30, …, 91-100]
```

This guarantees client-side charts render consistently across requests.

---

## PART 5 — SEO Audit APIs

### Endpoints

| Method | Path | Purpose |
|---|---|---|
| `POST` | `/api/v1/audits`                                       | Start audit (202 Accepted → job) |
| `GET`  | `/api/v1/audits`                                       | List audits for the caller's projects |
| `GET`  | `/api/v1/audits/{audit_id}`                            | Audit metadata + progress |
| `GET`  | `/api/v1/audits/{audit_id}/summary`                    | Top-line score + counts |
| `GET`  | `/api/v1/audits/{audit_id}/issues`                     | Paginated issue list (cursor) |
| `GET`  | `/api/v1/audits/{audit_id}/issues/{type}`              | Issue type drill-down |
| `GET`  | `/api/v1/audits/{audit_id}/broken-links`               | Broken / 4xx / 5xx |
| `GET`  | `/api/v1/audits/{audit_id}/duplicate-content`          | Duplicate clusters |
| `GET`  | `/api/v1/audits/{audit_id}/metadata`                   | Title/description/canonical/og issues |
| `GET`  | `/api/v1/audits/{audit_id}/indexability`               | Robots/noindex/canonical chains |
| `POST` | `/api/v1/audits/{audit_id}/cancel`                     | Cancel in-flight audit |
| `POST` | `/api/v1/audits/{audit_id}/rerun`                      | Clone audit settings, new job |

### Long-running audit architecture

Audits routinely take 5 min – 6 hr. The HTTP surface never blocks:

```
POST /audits          → 202 + { audit_id, job_id, status: "queued" }
                          job persisted in Postgres; row enqueued on q.audit.start
q.audit.start         → seed worker: robots.txt, sitemap, seed URLs → bounded crawl frontier
q.audit.crawl         → page workers (parallel; concurrency capped per host)
q.audit.analyze       → per-page issue extractors (links, meta, content hash, render)
q.audit.aggregate     → roll-up → summary, distributions, scoring
                          state transitions emitted to event bus
client                ← WS /ws/v1/jobs/{job_id} OR GET /jobs/{job_id} (poll)
```

Audit jobs are **resumable**. Each crawl frontier write is idempotent on `(audit_id, url_hash)`; a worker crash replays only un-acked URLs. Cancellation flips the row state and workers exit at the next checkpoint — no force-kill.

---

## PART 6 — Crawler Internal APIs

> `/internal/crawler/*` is **never** exposed to the public LB. mTLS + short-lived service token.

| Method | Path | Purpose |
|---|---|---|
| `POST`   | `/internal/crawler/jobs`                            | Create crawl job (audit, backlink-discovery, refresh) |
| `GET`    | `/internal/crawler/jobs/{job_id}`                   | Job state + progress |
| `POST`   | `/internal/crawler/jobs/{job_id}/cancel`            | Soft-cancel |
| `POST`   | `/internal/crawler/jobs/{job_id}/retry`             | Retry failed shards |
| `GET`    | `/internal/crawler/queue`                           | Queue depth per priority |
| `POST`   | `/internal/crawler/queue/drain`                     | Drain queue (maintenance) |
| `GET`    | `/internal/crawler/workers`                         | Worker fleet view |
| `POST`   | `/internal/crawler/workers/{worker_id}/drain`       | Drain single worker |
| `POST`   | `/internal/crawler/workers/heartbeat`               | Worker heartbeat (called by worker) |
| `POST`   | `/internal/crawler/coordination/lease`              | Lease a URL shard for processing |
| `POST`   | `/internal/crawler/coordination/release`            | Release / ack a leased shard |

### Crawl job lifecycle

```
queued → scheduled → running → (paused) → completed
                       │                ↘ failed
                       └→ cancelling → cancelled
```

State transitions emit `crawler.job.<state>` events on the bus. The frontend never reads crawler state directly — it reads from the public `/jobs/{id}` projection, which is materialized from these events.

### Coordination strategy

URL shards are leased with a TTL via Redis (`SETNX`+`EXPIRE`) so a crashed worker auto-releases. Workers heartbeat every 10 s; the coordinator marks workers `unhealthy` after 30 s and `dead` after 90 s, releasing all their leases.

---

## PART 7 — Authentication APIs

| Method | Path | Purpose |
|---|---|---|
| `POST` | `/api/v1/auth/register`                          | Email/password registration |
| `POST` | `/api/v1/auth/login`                             | Email/password → access + refresh tokens |
| `POST` | `/api/v1/auth/refresh`                           | Rotate refresh token, new access token |
| `POST` | `/api/v1/auth/logout`                            | Revoke refresh token (single device) |
| `POST` | `/api/v1/auth/logout-all`                        | Revoke all refresh tokens |
| `POST` | `/api/v1/auth/password/forgot`                   | Request reset email |
| `POST` | `/api/v1/auth/password/reset`                    | Submit token + new password |
| `POST` | `/api/v1/auth/email/verify/send`                 | Send verification email |
| `POST` | `/api/v1/auth/email/verify/confirm`              | Confirm with token |
| `POST` | `/api/v1/auth/mfa/enroll`                        | Begin TOTP enrollment |
| `POST` | `/api/v1/auth/mfa/verify`                        | Verify TOTP code |
| `POST` | `/api/v1/auth/mfa/disable`                       | Disable MFA (requires recent auth) |
| `POST` | `/api/v1/auth/mfa/recovery-codes`                | Generate one-time recovery codes |
| `GET`  | `/api/v1/auth/sessions`                          | List active sessions |
| `DELETE`| `/api/v1/auth/sessions/{session_id}`            | Revoke session |
| `POST` | `/api/v1/auth/api-keys`                          | Create programmatic API key (scoped) |
| `GET`  | `/api/v1/auth/api-keys`                          | List API keys |
| `DELETE`| `/api/v1/auth/api-keys/{key_id}`                | Revoke API key |

### JWT strategy

- **Access token**: JWT, 15 min TTL, asymmetric (RS256/EdDSA). Claims include `sub`, `org`, `roles[]`, `scopes[]`, `jti`, `tier` (free/pro/biz/enterprise), `iat`, `exp`. **Stateless verification at the edge.**
- **Refresh token**: opaque (not a JWT), 30-day rolling TTL, stored hashed in Postgres with `device_id`, `ip_origin`, `last_used_at`. **Rotated on every refresh** (old token marked `superseded`; reuse of a superseded token revokes the entire family — refresh-token reuse detection).
- **MFA**: TOTP (RFC 6238) + recovery codes; WebAuthn in v2. MFA challenge issued as a short-lived `mfa_session` token; access token is only issued after MFA challenge succeeds.
- **API keys**: separate from JWT. Format `rt_live_<base62>.<base62>` where the prefix is the lookup key (indexed) and the suffix is hashed (argon2id). Scoped to a subset of endpoints + an org. Never expire by default; rotated by the user.

### Login flow

```
POST /auth/login
  → if MFA enrolled: 200 + { mfa_required: true, mfa_session, methods: ["totp"] }
  → else:           200 + { access, refresh, expires_in, user }

POST /auth/mfa/verify { mfa_session, code }
  → 200 + { access, refresh, expires_in, user }
```

### Refresh flow

```
POST /auth/refresh { refresh_token }
  → 200 + { access, refresh: NEW, expires_in }      // old refresh marked superseded
  → if reused superseded refresh:                   // attack signal
      revoke entire family, log security event, return 401
```

---

## PART 8 — User Dashboard APIs

| Method | Path | Purpose |
|---|---|---|
| `GET`/`POST`/`PATCH`/`DELETE` | `/api/v1/projects`                | Workspace CRUD |
| `GET` | `/api/v1/projects/{id}/dashboard`                          | Aggregated dashboard payload |
| `GET`/`POST`/`DELETE` | `/api/v1/reports`                          | Saved reports |
| `GET`/`POST`/`DELETE` | `/api/v1/favorites`                        | Favorite domains/reports |
| `GET` | `/api/v1/search/recent`                                    | Recent searches |
| `DELETE` | `/api/v1/search/recent`                                 | Clear recent searches |
| `GET` | `/api/v1/exports`                                          | List export jobs |
| `GET` | `/api/v1/notifications`                                    | In-app feed (cursor) |
| `POST` | `/api/v1/notifications/{id}/read`                         | Mark read |
| `POST` | `/api/v1/notifications/read-all`                          | Mark all read |
| `GET`/`PATCH` | `/api/v1/preferences`                               | UI prefs, email digests |

The `/projects/{id}/dashboard` endpoint returns a single aggregated payload — DR delta, recent backlinks, audit summary, alerts — designed to be the **only** request the dashboard makes on load. It's a **server-composed view**, not a passthrough. Cache-Control: `private, max-age=30, stale-while-revalidate=300`.

---

## PART 9 — Billing APIs

| Method | Path | Purpose |
|---|---|---|
| `GET`  | `/api/v1/billing/plans`                          | Public plan catalog |
| `GET`  | `/api/v1/billing/subscription`                   | Current subscription state |
| `POST` | `/api/v1/billing/subscription`                   | Subscribe (with payment_method_id) |
| `POST` | `/api/v1/billing/subscription/upgrade`           | Change plan (proration computed) |
| `POST` | `/api/v1/billing/subscription/downgrade`         | Schedule downgrade at period end |
| `POST` | `/api/v1/billing/subscription/cancel`            | Cancel at period end |
| `POST` | `/api/v1/billing/subscription/resume`            | Resume cancelled-but-not-yet-ended sub |
| `GET`  | `/api/v1/billing/invoices`                       | Invoice list |
| `GET`  | `/api/v1/billing/invoices/{id}`                  | Invoice detail |
| `GET`  | `/api/v1/billing/invoices/{id}/pdf`              | Signed-URL redirect to PDF |
| `GET`/`POST`/`DELETE` | `/api/v1/billing/payment-methods`     | Payment methods |
| `POST` | `/api/v1/billing/payment-methods/default`        | Set default |
| `GET`  | `/api/v1/usage`                                  | Current period usage by metric |
| `GET`  | `/api/v1/usage/history`                          | Usage timeseries |
| `GET`  | `/api/v1/usage/limits`                           | Hard + soft limits for caller's tier |

**Tenets**
- All money state is sourced from Stripe via webhook. Our DB is a **projection**, never authoritative.
- Plan changes are computed server-side; the API returns the proration so the UI can confirm before commit.
- `/usage` is the **single source of truth** for the dashboard's quota meter; rate limiter headers (Part 18) agree with it.

---

## PART 10 — Export APIs

| Method | Path | Purpose |
|---|---|---|
| `POST` | `/api/v1/exports`                                | Create export job (type, filter, format) |
| `GET`  | `/api/v1/exports`                                | List user's exports |
| `GET`  | `/api/v1/exports/{id}`                           | Export status + download URL |
| `DELETE`| `/api/v1/exports/{id}`                          | Cancel / remove |
| `POST` | `/api/v1/exports/schedules`                      | Create scheduled export (cron) |
| `GET`/`PATCH`/`DELETE` | `/api/v1/exports/schedules/{id}` | Schedule CRUD |
| `GET`  | `/api/v1/exports/{id}/download`                  | 302 to signed S3 URL |

### Request

```json
POST /api/v1/exports
{
  "type":   "backlinks",                  // backlinks | referring_domains | audit | domain_history
  "format": "csv",                        // csv | xlsx | pdf | json
  "filter": { … same shape as /backlinks/query … },
  "columns": ["source.domain","source.dr","anchor","firstSeen","status"],
  "limit":  null,
  "notify": { "email": true, "webhook": null }
}
```

### Generation flow

```
POST /exports → 202 + { export_id, job_id, status: "queued" }
worker (q.export):
   stream rows from Postgres/columnar store → format (CSV/XLSX/PDF) → upload to S3
   write `download_url` (signed, 24 h) + `expires_at` to job row
   publish `export.completed`
client subscribes to /ws/v1/jobs/{job_id} OR polls /exports/{id}
```

PDFs are rendered by a headless-Chrome service behind `/internal/render` — never inline in the API process.

---

## PART 11 — Admin APIs

| Path | Purpose |
|---|---|
| `/admin/users`                                           | Search, suspend, impersonate (audited), refund credits |
| `/admin/orgs`                                            | Tenant management, plan overrides |
| `/admin/billing/revenue`                                 | MRR, churn, ARPU |
| `/admin/billing/refunds`                                 | Refund issuance |
| `/admin/jobs`                                            | Global job table (filter by tenant, type, state) |
| `/admin/jobs/{id}/replay`                                | Replay failed job |
| `/admin/jobs/{id}/kill`                                  | Force-terminate |
| `/admin/crawler/workers`                                 | Fleet view + drain |
| `/admin/crawler/queue`                                   | Per-priority depth, lag |
| `/admin/abuse/signals`                                   | Abuse detection feed |
| `/admin/abuse/blocklist`                                 | IP / ASN / email blocklist |
| `/admin/feature-flags`                                   | Toggle flags per tenant / cohort |
| `/admin/metrics`                                         | Live system metrics gateway |
| `/admin/audit-log`                                       | Operator audit trail |

**Every** admin write goes through an `AdminAction` middleware that records `{operator, target, action, before, after, traceId, ip, userAgent}` to an append-only audit log. SSO + MFA + IP allow-list enforced at the gateway, not in app code.

---

## PART 12 — Response Standardization

### Success envelope

```json
{
  "data": { … resource or list … },
  "meta": {
    "traceId":  "01HZX…",
    "version":  "v1",
    "cache":    { "hit": true, "age_s": 120, "swr": false },
    "cursor":   { "next": "eyJ…", "hasMore": true },
    "rateLimit":{ "limit": 1000, "remaining": 941, "resetAt": "…" }
  }
}
```

`meta` is always present (possibly empty). `data` is `null` for action-only endpoints.

### Error envelope (RFC 7807-compatible)

```json
{
  "error": {
    "code":     "BACKLINKS_FILTER_INVALID",
    "message":  "min_dr must be between 0 and 100",
    "type":     "validation_error",
    "field":    "filters.source.dr.gte",
    "docsUrl":  "https://docs.rankedtag.com/errors#BACKLINKS_FILTER_INVALID",
    "traceId":  "01HZX…",
    "retryable": false
  }
}
```

### Error code strategy

- Stable, machine-readable code: `RESOURCE_REASON` (e.g. `AUTH_TOKEN_EXPIRED`, `RATE_LIMITED`, `QUOTA_EXCEEDED`, `AUDIT_NOT_FOUND`, `DOMAIN_PARSE_FAILED`).
- HTTP status mirrors semantics: 400/401/403/404/409/422/429/5xx.
- `type` is one of: `validation_error | auth_error | permission_error | not_found | conflict | quota_error | rate_limit | upstream_error | server_error`.
- `retryable` tells SDKs whether automatic retry with backoff is safe — saves every SDK from re-deriving this mapping.

### Validation envelope

```json
{
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "1 field is invalid",
    "type": "validation_error",
    "fields": [
      { "field": "domain", "code": "INVALID_DOMAIN", "message": "must be a valid hostname" }
    ],
    "traceId": "…"
  }
}
```

### Trace IDs

Every request gets a `trace_id` (W3C `traceparent` header at the gateway, propagated as `traceId` in responses and logs). It connects user-visible errors → APM spans → worker logs → DB query plans. Clients are encouraged to include trace IDs in support tickets.

---

## PART 13 — Pagination Strategy

| Strategy | Where used | Why |
|---|---|---|
| **Cursor (opaque, HMAC-signed)** | `/backlinks`, `/referring-domains`, `/audits/.../issues`, `/notifications` | Huge / append-mostly datasets where offset is prohibitive |
| **Page (limit/offset)** | `/projects`, `/reports`, `/billing/invoices` | Small, bounded datasets where users expect "page 4 of 12" |
| **Keyset** | Internal exports | Predictable performance on sorted columns |
| **Streaming (NDJSON / chunked)** | `/exports/{id}/download`, `/internal/*` bulk | Continuous transfer; client doesn't paginate |

### Cursor contract

```
limit:   1..1000 (default 50)
cursor:  opaque base64url
sort:    comma-separated field list with -/+ prefix
meta.cursor.next: present if hasMore, else omitted
```

**Why cursor for backlinks**

1. Stable performance regardless of depth — `WHERE (first_seen, link_id) < (last_seen_ts, last_seen_id)` uses a composite index; cost is constant.
2. **Append-mostly correctness**: new backlinks discovered mid-pagination don't shift existing rows up a page.
3. Cursors are bound to filter+sort hashes, so changing either invalidates the cursor — explicit, not silent corruption.
4. Counts are **estimated** (`"≥1.2M"`) not exact; computing exact counts on 100M+ row tables is the most common SaaS performance footgun.

### Infinite scroll

Frontend calls successive cursors and concatenates. Server-side support: nothing extra — same cursor contract.

### Bulk pagination

Bulk endpoints return job IDs, not paginated bodies (Part 15). The export download is streamed, never paginated.

### Search pagination

Cross-resource search (`/search`) uses cursor + result-type facets. Each page is bounded to `limit` per type to prevent one type from starving others.

---

## PART 14 — Filtering & Search Strategy

### Filter architecture

- **Whitelisted fields** per resource, validated at the route boundary via Pydantic. Unknown fields → 422.
- **Operator suffixes** for GET: `?min_dr=30`, `?dr_gte=30`, `?country=US,CA` (commas = OR; repeated keys = AND across fields).
- **Structured body** for POST `/query` endpoints: nested filter trees with `{ gte, lte, eq, in, not_in, contains_any, contains_all, range }`.
- **Filter hashing**: every filter set hashes to a deterministic `filterHash` — used in cache keys and cursor binding.

### Sort architecture

`sort=-first_seen,-source_dr` — comma-separated list; `-` prefix = descending. Whitelisted fields only. Multi-sort always has an implicit terminal `,-id` tiebreaker so cursor pagination is deterministic.

### Required filter sets

| Resource | Filters |
|---|---|
| `/backlinks` | `target`, `follow`, `source.dr`, `source.da`, `source.spam`, `source.country`, `source.tld`, `anchor`, `anchor_type`, `rel`, `status`, `first_seen`, `last_seen`, `is_lost`, `is_new` |
| `/referring-domains` | `dr`, `da`, `spam`, `country`, `tld`, `first_seen`, `is_lost`, `links_count` |
| `/audits/.../issues` | `severity`, `category`, `type`, `url_contains`, `first_seen`, `status` |

### Search

`/api/v1/search?q=…&type=domain,project,report` — typeahead-friendly; powered by OpenSearch/Elastic with per-type scoring profiles. Results return a discriminated union with `_type` on each row.

---

## PART 15 — Async Job Architecture

### Job envelope

```json
{
  "data": {
    "jobId":     "job_01HZX…",
    "type":      "backlinks.bulk_query",
    "status":    "queued",            // queued | scheduled | running | succeeded | failed | cancelled | partial
    "progress":  { "percent": 12.4, "stage": "fetching", "stagesTotal": 4, "stageIndex": 1,
                   "counts": { "processed": 1240, "total": 10000, "errors": 3 } },
    "createdAt": "…", "startedAt": "…", "completedAt": null,
    "resultUrl": null,                // signed S3 URL when succeeded
    "errorRef":  null,                // present on failed
    "estimatedRemainingSeconds": 240,
    "ws":        "wss://api.rankedtag.com/ws/v1/jobs/job_01HZX…",
    "events":    "/api/v1/jobs/job_01HZX…/events?since=…"   // SSE fallback
  },
  "meta": { "traceId": "…" }
}
```

### Endpoints

| Method | Path | Purpose |
|---|---|---|
| `GET`  | `/api/v1/jobs/{id}`             | Current state (poll) |
| `GET`  | `/api/v1/jobs/{id}/events`      | SSE event stream |
| `POST` | `/api/v1/jobs/{id}/cancel`      | Soft cancel |
| `GET`  | `/api/v1/jobs`                  | List caller's jobs (filter by type, status) |

### Queues (Celery + Redis broker / RabbitMQ / SQS)

```
q.scoring.priority    — DR/DA fresh-fetch (latency-sensitive)
q.scoring.standard    — bulk lookups
q.enrichment          — Tranco, WHOIS, GeoIP, Wayback
q.audit.start         — seed crawl frontier
q.audit.crawl         — page fetch (sharded by host)
q.audit.analyze       — issue extraction
q.audit.aggregate     — roll-ups
q.backlinks.discovery — graph expansion
q.export              — CSV/XLSX/PDF generation
q.notifications       — email + webhook delivery
q.dead-letter         — terminal failures, kept for replay
```

**Routing**: per-tenant tier → priority queue (enterprise > business > pro > free). Worker pools subscribe to queue sets; no single worker is starved by any one tenant.

### Job state machine

```
queued → scheduled → running → succeeded
                         │  ↘ failed         (retried up to N with backoff)
                         │  ↘ partial        (some shards ok, some failed)
                         └→ cancelling → cancelled
```

### Polling rules

- Client polls `/jobs/{id}` with exponential backoff (1s → 2s → 5s → 10s, cap 30s).
- `Cache-Control: no-store` on job endpoints — never cache job state at any edge.
- For long jobs the WebSocket channel is the primary signal; polling is fallback only.

---

## PART 16 — WebSocket Architecture

### Channels

```
WS /ws/v1/jobs/{job_id}                    — single-job progress + result
WS /ws/v1/projects/{project_id}/events     — project-scoped feed (audits, alerts, new backlinks)
WS /ws/v1/dashboard                        — caller's dashboard tiles (DR delta, queue, notifications)
WS /ws/v1/notifications                    — notification feed
WS /admin/queue                            — operator queue / fleet monitor
```

### Handshake & auth

- Auth via `Authorization: Bearer …` upgrade header. WS-from-browser uses a **single-use ticket** (`POST /auth/ws/ticket` → 30s TTL) appended as `?ticket=…` — browsers can't set headers on the WS handshake.
- After upgrade, server sends `{"type":"hello","sessionId":"…","heartbeatMs":15000}`.
- Heartbeat: server pings every 15s; client must pong within 30s or the connection is dropped.

### Message envelope

```json
{
  "type":   "job.progress",                 // namespaced event type
  "v":      1,
  "ts":     "2026-05-13T14:22:01Z",
  "seq":    412,                             // monotonic per channel
  "data":   { … }
}
```

`seq` lets clients detect gaps and request a backfill from `/jobs/{id}/events?since=seq`.

### Event types

```
job.queued | job.started | job.progress | job.succeeded | job.failed | job.cancelled | job.partial
audit.issue.discovered | audit.summary.updated
backlinks.new.batch | backlinks.lost.batch
notification.created
admin.queue.depth | admin.worker.health
```

### Fan-out

WS gateway nodes are stateless. Subscriptions are tracked in Redis (`channel → connection_id`). The event bus (Kafka/NATS) → WS gateway consumer → fan-out by channel. **Throughput rule**: never publish a per-row event to a per-user channel; aggregate into `*.batch` events with at-most-once-per-second cadence.

---

## PART 17 — API Security

### Defense in depth

| Layer | Control |
|---|---|
| CDN / WAF       | OWASP rules, geo + ASN blocklist, bot scoring |
| Gateway         | TLS termination, mTLS for `/internal`, JWT verify, rate limit, request size cap |
| Service         | Pydantic validation, RBAC, scope checks, idempotency keys |
| Data layer      | Row-level tenancy (`org_id` predicate on every query), parameterized SQL, least-privilege roles |
| Output          | PII redaction, signed URLs (short TTL) for exports |

### AuthN methods

- **JWT (browser)** — see Part 7.
- **API keys (programmatic)** — `Authorization: Bearer rt_live_…`. Scoped: `read:backlinks`, `read:domains`, `write:exports`, etc. Per-key rate limit + IP allow-list optional.
- **mTLS (service-to-service)** — `/internal/*` only.
- **HMAC webhooks (inbound)** — Stripe/SendGrid signed; we verify before parsing the body.

### RBAC

Roles: `owner > admin > member > viewer > billing_only`. Permissions are scopes (`projects:write`, `billing:read`, `audits:run`, `exports:create`, `admin:*`). Enforced in a `require(scope)` dependency at the route boundary, *and* re-checked at the service layer.

### Abuse prevention

- **Velocity checks**: per-IP, per-account, per-payment-method (signup bursts, refund abuse).
- **Bot protection**: hCaptcha on signup + password reset; behavioral signals on dashboard.
- **Suspicious-domain heuristics** for free-tier crawl targets (porn, gambling, malware blocklists) — opt-in upgrade required.
- **Quota soft-limit warning** at 80%, hard at 100%, with `Retry-After` and a `/usage` self-service link.

---

## PART 18 — Rate Limiting Strategy

### Tiers

| Tier | RPS sustained | RPS burst | Daily lookups | Concurrent jobs |
|---|---|---|---|---|
| Anonymous public  | 1   | 5    | 50         | 1  |
| Free authed       | 3   | 10   | 500        | 2  |
| Pro               | 10  | 30   | 50 000     | 10 |
| Business          | 30  | 100  | 500 000    | 50 |
| Enterprise        | 200 | 1000 | per-contract | per-contract |
| Internal services | unlimited (mTLS) | — | — | — |

### Algorithm

**Token bucket in Redis** (atomic Lua script):

```
rate_limit:{scope}:{principal} → { tokens, last_refill_ts }
on request:
   refill = (now - last_refill_ts) * refill_rate
   tokens = min(capacity, tokens + refill)
   if tokens >= 1: tokens -= 1; allow
   else:          deny + Retry-After = (1 - tokens) / refill_rate
```

Why token bucket: handles burst + sustained naturally; one key per principal; lock-free via Lua.

### Scopes

- **Global** per principal (defends the platform).
- **Per-endpoint class** — `expensive` endpoints (bulk lookups, exports, audits) carry a higher cost (cost = N tokens, not 1).
- **Per-tenant org** for shared API keys (so one runaway team member can't starve their org).

### Crawler-target protection

Outbound crawl rate to **external sites** is its own limiter: max 1 req/s per host, with a polite User-Agent and robots.txt respected. This is unrelated to the customer-facing API limits but lives in the same Redis cluster.

### Headers

```
X-RateLimit-Limit:        1000
X-RateLimit-Remaining:    872
X-RateLimit-Reset:        2026-05-13T14:23:00Z
X-RateLimit-Scope:        org:org_01HZX…
Retry-After:              12         (only on 429)
```

---

## PART 19 — Caching Strategy

### Layers

```
Client ── CDN edge cache ── API HTTP cache ── App in-memory cache ── Redis ── Postgres / OpenSearch / Columnar
```

| Resource | Where | TTL | Strategy |
|---|---|---|---|
| Public domain metrics              | CDN + Redis | 1h fresh / 24h SWR | stale-while-revalidate |
| Authenticated `/domains/{d}`       | Redis       | 15 min fresh / 1h SWR | per-user vary off (tenancy at row, not response) |
| Backlinks page (cursor + filter)   | Redis       | 5 min | key = `bl:{target}:{filterHash}:{cursor}` |
| Anchor distribution                | Redis       | 1h   | recomputed on backlink batch ingest |
| Plan catalog                       | CDN         | 1h   | public, no auth vary |
| Dashboard payload                  | Edge (private) | 30s fresh / 5min SWR | `Cache-Control: private` |
| Job state                          | none        | —    | `no-store` |
| Exports download URL               | none        | —    | signed URL is itself short-lived |

### Stale-while-revalidate

Reads return the cached value immediately and, if past `fresh` but inside `swr`, schedule a background refresh through Celery (`q.scoring.standard`). This keeps p95 latency flat even during refresh storms.

### Invalidation

- **Event-driven** — `backlinks.batch.ingested` event invalidates the matching `bl:{target}:*` keyspace via Redis SCAN (or a maintained reverse index).
- **TTL fallback** — every key has a TTL; nothing depends on invalidation being delivered.
- **Versioned keys** — `bl:v3:{target}:…`; bump the prefix to do a global invalidation on schema changes.

---

## PART 20 — API Versioning Strategy

### Versioning unit

The **version** is the contract for a given audience. `/api/v1` and `/public/v1` move independently. `/internal` is unversioned — services in the same release train can require coordinated deploys.

### Compatibility rules within a major version

Within `v1`, we never:

- Remove a field
- Rename a field
- Narrow a type
- Change an error code's meaning
- Change a default

We *may*:

- Add fields (clients must ignore unknowns — documented and enforced in SDKs)
- Add endpoints
- Add enum values (clients must tolerate unknowns — documented)
- Loosen validation

### Deprecation

A deprecated field/endpoint is marked in the OpenAPI spec with `deprecated: true` plus `x-rt-sunset: <date>` and `x-rt-replacement: <path>`. Responses include:

```
Deprecation: true
Sunset: Tue, 01 Sep 2026 00:00:00 GMT
Link: <https://docs.rankedtag.com/migrations/v1-to-v2>; rel="deprecation"
```

Deprecations are announced **6 months** before sunset, with a usage report sent to affected API keys at 90 / 30 / 7 days.

### Migration

When v2 is released:

1. Both `v1` and `v2` run in parallel for ≥ 12 months.
2. Migration guide published with side-by-side request/response diffs.
3. SDKs ship `v2` clients with `v1` available behind a flag.
4. Tenants get per-key usage breakdowns by version.

---

## PART 21 — Microservice Strategy

The initial deployment is a **modular monolith** with hard internal boundaries — separate Python packages, separate Postgres schemas, no cross-package imports outside `app.contracts`. The boundary lines are drawn so that any module can be lifted out into its own service later without contract changes.

```
┌────────────────────────────────────────────────────────────────┐
│                    Public API Gateway                          │
└────────────┬──────────────┬──────────────┬─────────────────────┘
             │              │              │
        ┌────▼────┐   ┌─────▼────┐   ┌────▼─────┐
        │  Auth   │   │  Core    │   │  Admin   │
        │ Service │   │  API     │   │  API     │
        └────┬────┘   └─────┬────┘   └────┬─────┘
             │              │              │
   ┌─────────┴──────────────┴──────────────┴──────────┐
   │              Internal Event Bus                  │
   │            (Kafka / NATS / Pulsar)               │
   └───┬─────────┬──────────┬──────────┬──────────┬──┘
       │         │          │          │          │
  ┌────▼───┐ ┌──▼──────┐ ┌──▼──────┐ ┌▼─────┐ ┌──▼─────┐
  │ Crawl  │ │Backlink │ │Analytics│ │Billing│ │Export  │
  │Service │ │ Service │ │ Service │ │Service│ │Service │
  └────────┘ └─────────┘ └─────────┘ └───────┘ └────────┘
```

### Communication

| Pattern | When |
|---|---|
| **Sync REST/gRPC** | Read-time queries where the caller blocks (`/backlinks` → backlink service) |
| **Async via queue** | Long-running work (`audits.start` → crawl service) |
| **Pub/sub events** | State changes that many services care about (`backlinks.batch.ingested`, `subscription.updated`) |
| **Outbox pattern** | Reliable publish from a service that owns a DB transaction (write to outbox table, relay process publishes) |
| **Saga** | Cross-service workflows that need compensations (signup → create org → grant trial → bill) |

Services own their data. Cross-service reads go through the owning service's API or a read replica projection — never direct DB access.

---

## PART 22 — OpenAPI & Documentation Strategy

### Specs

- One spec per audience-version: `/openapi/v1.json`, `/openapi/public-v1.json`, `/openapi/admin.json`.
- Specs are the **source of truth** for SDK generation, contract tests, and the developer portal — generated from FastAPI annotations + augmented with examples in `docs/openapi-overlays/`.

### UI

- `GET /docs` → Swagger UI (try-it-out enabled with the caller's API key).
- `GET /redoc` → ReDoc (read-optimized, exposed to search engines for the public API).
- `GET /docs/public` → ReDoc for `/public/v1` only (separate brand surface).

### SDKs

Generated from the OpenAPI specs:

- TypeScript / JavaScript (priority — used by dashboard + external)
- Python
- Go
- Ruby (community)

SDKs ship with retry/backoff, idempotency keys, automatic rate-limit handling (respect `Retry-After`), and trace ID propagation.

### Developer portal

```
/portal
├── /quickstart
├── /authentication       (JWT, API keys, scopes)
├── /endpoints/...        (rendered from OpenAPI)
├── /guides
│   ├── /pagination
│   ├── /async-jobs
│   ├── /webhooks
│   └── /websockets
├── /errors               (error code reference)
├── /rate-limits
├── /changelog
├── /migrations
└── /sdks
```

Every endpoint page includes: request/response examples in 4 languages, common errors with remediation, related endpoints, and a "try it" panel.

---

## PART 23 — Performance Strategy

### Async-first

Every I/O path is async (`async def` + httpx/asyncpg). The web tier is purely orchestration — no CPU work. CPU-heavy tasks (PDF render, scoring) are off-process workers.

### Batching

- DB reads use **DataLoader-style coalescing** within a request (e.g. resolving 100 source domains' DR in a single `IN` query, not 100 queries).
- Outbound HTTP fan-out uses an `asyncio.Semaphore` to cap concurrency per host.
- Writes to the event bus are batched per 50 ms tick or per N events.

### Bulk processing

- All bulk endpoints are async (`202 Accepted`). No synchronous endpoint accepts > 50 items.
- Workers process in **bounded shards** (e.g. 1000 URLs per shard) for resumability and parallelism.

### Streaming responses

- `/exports/{id}/download` streams from S3 (no server-side buffering).
- `/jobs/{id}/events` uses SSE — single TCP connection, chunked transfer, no polling overhead.
- Large internal endpoints can return **NDJSON** for line-delimited streaming consumption.

### Query optimization

- **Composite indexes** for every cursor-paginated sort (`(target_id, first_seen DESC, link_id DESC)`).
- **Partial indexes** for hot filter combinations (e.g. `WHERE status = 'live' AND follow = 'dofollow'`).
- **Read replicas** for analytics-shaped reads; writes always go to primary.
- **Hot/cold tiering** — backlinks > 24 months old live in a columnar store (ClickHouse / BigQuery) accessed via a federated query path.

### Compression & transport

- Brotli (`br`) preferred, gzip fallback, on responses > 1 KB.
- HTTP/2 enabled at the gateway; HTTP/3 (QUIC) for the CDN edge.
- Connection reuse — Keep-Alive on the LB and origin.

### CDN

- Static assets, OpenAPI specs, plan catalog, and any unauthenticated GET cached at the edge.
- Edge keys include the API version; never include `Authorization`.

---

## PART 24 — Monitoring & Observability

### Health

- `/health/live`     — process up (no deps)
- `/health/ready`    — deps reachable (DB, Redis, broker)
- `/health/startup`  — slow-start deps warmed (caches, schema migrations applied)

### Metrics (Prometheus)

```
http_requests_total{route,method,status,tenant_tier}
http_request_duration_seconds{route,method}     (histogram)
api_rate_limited_total{route,tenant_tier,reason}
jobs_enqueued_total{type,priority}
jobs_duration_seconds{type,status}              (histogram)
workers_active{queue}
queue_depth{queue}
cache_hits_total / cache_misses_total{key_prefix}
db_query_duration_seconds{query_class}          (histogram)
ws_connections_open{channel}
ws_messages_total{channel,type}
```

### Logs

- **Structured JSON** only. Required fields: `ts`, `level`, `service`, `trace_id`, `span_id`, `user_id`, `org_id`, `route`, `latency_ms`, `status`.
- **No PII** in logs — emails hashed, tokens never logged. Body logging only on 5xx and only behind a flag.
- Logs ship to a single sink (Loki / ELK / Datadog) — `trace_id` is the join key.

### Tracing

- W3C `traceparent` accepted at the gateway, propagated through Celery via task headers, into worker spans, into downstream HTTP and DB clients.
- Sample rate: 100% on errors, 10% on success, 100% on `/admin/*` (cheap volume).
- Span attributes include `tenant.tier`, `job.type`, `cache.hit` — enabling dashboards segmented by tier.

### Alerts

- **SLO-based**: error rate, latency p99, queue lag, job failure rate per type.
- **Budget burn** alerts (multi-window, multi-burn-rate) — not flat thresholds.
- **Cost anomaly** — sudden change in egress / DB IOPS / job runtime.

---

## PART 25 — Engineering Best Practices

The architecture above is built on a small set of non-negotiables:

1. **REST done seriously.**
   Resources are nouns. Verbs are HTTP methods. State changes return the new state. 202 for async. Idempotency keys on every write. No tunneling actions through GET.

2. **Clean architecture inside each service.**
   `routes → schemas → services → repositories → adapters`. Business rules live in `services` and depend only on `schemas`. Repositories are the only layer that touches the DB. Adapters are the only layer that touches the network.

3. **Service-oriented from day one.**
   Even before we split into microservices, modules are isolated by **contract**, not implementation. Cross-module calls go through `app.contracts.*` ports, never direct imports.

4. **Async-first.**
   No blocking I/O in the web tier. CPU work is off-process. Long work is a job.

5. **Enterprise observability.**
   Trace ID is mandatory. Logs are structured. Metrics are dimensioned by tenant tier. Every job is queryable end-to-end from API call → DB write.

6. **Backward compatibility is a feature, not a hope.**
   Within a major version, contracts only grow. Migrations are paved with 6-month deprecations and per-tenant usage reports.

7. **Production-grade defaults.**
   Timeouts on every outbound call. Retries with backoff + jitter. Circuit breakers around upstream services. Bulkheads (queue + worker pool) per workload class. Idempotency on every state-changing endpoint.

8. **Tenant safety is enforced at the data layer.**
   `org_id` predicate is checked in the repository, not the route. RLS where supported.

9. **The API is the product.**
   Every public endpoint has examples, errors, rate limits documented, and is covered by contract tests generated from the OpenAPI spec.

10. **Cost is a first-class metric.**
    Per-tenant cost (CPU s, egress GB, storage GB, third-party API spend) is tracked alongside usage and feeds plan design.

---

**STEP 6 API ARCHITECTURE COMPLETED**

# RankedTag SEO Platform — Backend Foundation (Step 11)

The FastAPI backend that powers Domain Authority, Backlink Analysis, SEO audits, crawler orchestration, and dashboard APIs. This document is the developer onboarding + production runbook for the backend foundation.

> **Status.** The foundation described here is implemented in code under `seo-suite/backend/`. This document maps every module to its purpose, lists every command needed to run it, and explains every architectural decision so a new engineer can land a PR on day one.
>
> **Scope.** Foundation only — app factory, config, logging, lifecycle, middleware, DI, routing skeleton, health, integration scaffolds for DB/Redis/Celery, dev tooling, Docker, CI. Business logic (domain scoring, backlink ingest, audits) lives in later steps.

---

## Table of Contents

1. [Layout](#part-1--layout)
2. [Tech Stack](#part-2--tech-stack)
3. [Local Setup](#part-3--local-setup)
4. [Running the API](#part-4--running-the-api)
5. [App Factory](#part-5--app-factory)
6. [Configuration System](#part-6--configuration-system)
7. [Logging System](#part-7--logging-system)
8. [Lifespan & Resource Management](#part-8--lifespan--resource-management)
9. [Middleware](#part-9--middleware)
10. [Error Handling](#part-10--error-handling)
11. [Dependency Injection](#part-11--dependency-injection)
12. [Routing Architecture](#part-12--routing-architecture)
13. [Health Checks](#part-13--health-checks)
14. [Schemas & Validation](#part-14--schemas--validation)
15. [Database Foundation](#part-15--database-foundation)
16. [Redis Foundation](#part-16--redis-foundation)
17. [Background Tasks Foundation](#part-17--background-tasks-foundation)
18. [Security Foundation](#part-18--security-foundation)
19. [Observability Foundation](#part-19--observability-foundation)
20. [Testing](#part-20--testing)
21. [Dev Tooling](#part-21--dev-tooling)
22. [Docker](#part-22--docker)
23. [CI/CD](#part-23--cicd)
24. [Production Server](#part-24--production-server)
25. [Onboarding Checklist](#part-25--onboarding-checklist)

---

## PART 1 — Layout

```
seo-suite/backend/
├── alembic/                       # DB migrations (Step 12)
├── alembic.ini
├── app/                           # Application package
│   ├── __init__.py
│   ├── main.py                    # ← App factory + create_app()
│   ├── api/                       # HTTP surface
│   │   ├── deps.py                # Reusable FastAPI dependencies
│   │   ├── v1/
│   │   │   ├── router.py          # v1 aggregator
│   │   │   ├── endpoints/
│   │   │   ├── dependencies/
│   │   │   ├── response_schemas/
│   │   │   └── validators/
│   │   └── v2/                    # next stable contract (Step 6 §20)
│   ├── config/                    # Settings + AppEnv
│   ├── core/                      # cross-cutting: logging, exceptions, lifecycle, security
│   ├── middleware/                # request_id, timing, security_headers, rate_limit
│   ├── schemas/                   # Pydantic models — common, dtos, pagination, requests, responses
│   ├── database/                  # SQLAlchemy async engine + session manager + repositories
│   ├── cache/                     # Redis client + cache service abstraction
│   ├── crawlers/                  # Crawler runtime (Step 7)
│   ├── workers/                   # Celery tasks (Step 8)
│   ├── services/                  # Domain services (later steps)
│   ├── models/                    # ORM models (Step 12)
│   ├── security/                  # Auth primitives (later step)
│   ├── monitoring/                # Metrics, tracing hooks
│   ├── logging/                   # Logger factories per worker class
│   └── utils/                     # Pure helpers
├── deployments/                   # K8s + docker-compose extras
├── docker/                        # Dockerfiles for ancillary services
├── docs/                          # Architecture docs (Steps 6–11)
├── logs/                          # Local log output (gitignored)
├── scripts/                       # start-api, start-worker, start-beat, wait-for
├── tests/                         # pytest suites
├── requirements/                  # split by class: base, crawler (more in later steps)
├── requirements.txt               # runtime
├── requirements-dev.txt           # dev/test
├── pyproject.toml                 # tool config: ruff, mypy, pytest
├── Dockerfile                     # API image
├── Dockerfile.worker              # Celery worker image
├── .dockerignore
├── .env.example                   # template; never commit .env
└── docs/
    └── architecture/
        └── BACKEND_FOUNDATION.md  # ← this document
```

---

## PART 2 — Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Language       | Python 3.12+              | Modern typing, perf wins, async maturity |
| Web            | FastAPI                   | Async-first; pydantic-native; OpenAPI generated |
| ASGI server    | Uvicorn (under Gunicorn)  | Async event loop; prefork for cores |
| Validation     | Pydantic v2 + pydantic-settings | Strongly-typed DTOs + env-driven config |
| ORM            | SQLAlchemy 2.0 async      | Industry standard; async via asyncpg |
| DB driver      | asyncpg (+ psycopg2 sync for migrations) | Fastest async PG driver |
| Cache + Broker | Redis 7                   | Caches + Celery broker (separate clusters in prod) |
| Queue          | Celery 5                  | Battle-tested; flexible; Step 8 details |
| Logging        | structlog                 | Structured JSON, contextvars-aware |
| Observability  | sentry-sdk, prometheus-client, OpenTelemetry | Errors + metrics + traces |
| Dev tooling    | Ruff (lint+format), mypy, pytest, pre-commit | Single-tool lint/format; type discipline |
| Container      | Docker (slim Python)      | Multi-stage; cached deps; non-root user |

---

## PART 3 — Local Setup

### Prerequisites

- Python 3.12+
- Docker + Docker Compose
- (Optional) Make for the convenience targets

### One-time setup (host)

```bash
# from repo root
cd seo-suite

# Initialize pre-commit (lint hooks for the repo)
pip install pre-commit
pre-commit install
pre-commit install --hook-type commit-msg
```

### Bring up the stack (Docker — recommended)

```bash
# from seo-suite/
make up                         # docker compose up -d --build
make logs s=api                 # tail API logs
make ps                         # list services
make migrate                    # alembic upgrade head (no-op until models land)
make test                       # run pytest in the api container
make down                       # docker compose down
```

`docker-compose.yml` brings up: api, worker, beat, postgres, redis, clickhouse, frontend. Each service uses the appropriate Dockerfile in `seo-suite/backend/`.

### Bring up the backend on your host (no Docker)

```bash
cd seo-suite/backend

# 1. Create + activate venv
python3.12 -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate

# 2. Install deps
pip install --upgrade pip
pip install -r requirements.txt
pip install -r requirements-dev.txt

# 3. Configure environment
cp .env.example .env
# edit .env — at minimum set APP_SECRET_KEY, JWT_SECRET, and DB/Redis URLs

# 4. Start Postgres + Redis (containers, or local installs)
docker compose -f ../docker-compose.yml up -d postgres redis

# 5. Run migrations (no-op until models land)
alembic -c alembic.ini upgrade head

# 6. Run the API
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Verify:

```bash
curl -s http://localhost:8000/healthz                  # liveness
curl -s http://localhost:8000/api/v1/health            # liveness, structured
curl -s http://localhost:8000/api/v1/health/deep       # readiness incl. PG/Redis
open http://localhost:8000/docs                        # Swagger UI (dev only)
```

---

## PART 4 — Running the API

### Development

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

- Single async process; reload on file changes.
- Swagger UI at `/docs`; ReDoc at `/redoc`; OpenAPI JSON at `/openapi.json`.
- `LOG_JSON=false` → coloured console rendering.

### Production

```bash
gunicorn app.main:app \
  -k uvicorn.workers.UvicornWorker \
  --workers ${GUNICORN_WORKERS:-4} \
  --bind 0.0.0.0:${APP_PORT:-8000} \
  --timeout 60 --graceful-timeout 30 --keep-alive 5 \
  --max-requests 10000 --max-requests-jitter 500 \
  --access-logfile - --error-logfile -
```

Encoded in `scripts/start-api.sh`. The script auto-detects `APP_ENV=production` and switches modes.

In production:
- `/docs`, `/redoc`, `/openapi.json` are disabled (`is_production` check in `main.py`).
- `LOG_JSON=true` → JSON to stdout for the log shipper.
- `LOG_LEVEL=INFO` (DEBUG only for incidents, never default).

### Worker

```bash
celery -A app.workers.celery_app worker \
  -Q q.fetch.p0,q.fetch.p1,q.parse \
  --pool=gevent --concurrency=200 \
  --prefetch-multiplier=1 \
  --max-tasks-per-child=10000 \
  --max-memory-per-child=400000
```

Encoded in `scripts/start-worker.sh`. Queue subscriptions and pool flags per Step 8 §3.

### Beat (scheduler)

```bash
celery -A app.workers.celery_app beat --loglevel=INFO
```

Encoded in `scripts/start-beat.sh`. Beat replicas are leader-elected (Step 8 §10) so multiple replicas are safe to run.

---

## PART 5 — App Factory

`app/main.py` implements the **app factory pattern**: `create_app(settings: Settings | None = None) -> FastAPI`.

```python
def create_app(settings: Settings | None = None) -> FastAPI:
    cfg = settings or get_settings()

    setup_logging(level=cfg.log_level, json_format=cfg.log_json)

    app = FastAPI(
        title="SEO Suite API",
        version=cfg.app_version,
        docs_url=None if cfg.is_production else "/docs",
        redoc_url=None if cfg.is_production else "/redoc",
        openapi_url=None if cfg.is_production else "/openapi.json",
        lifespan=lifespan,
    )

    # Outer → inner: trusted host, then CORS
    app.add_middleware(TrustedHostMiddleware, allowed_hosts=cfg.trusted_hosts)
    app.add_middleware(CORSMiddleware, allow_origins=cfg.cors_origins, ...)

    install_middleware(app, cfg)              # request_id, timing, security_headers, rate_limit
    register_exception_handlers(app)
    app.include_router(api_router)            # /api/v1/*

    @app.get("/healthz", include_in_schema=False)
    async def healthz() -> dict:
        return {"status": "ok"}

    return app


app = create_app()
```

**Why factory.** Tests build their own app per session (`tests/conftest.py`) — no implicit global state. CI can swap settings (testing mode) without env-var gymnastics. Multiple ASGI variants (full API, public-API, admin) can mount different routers from the same factory.

### Scalability benefits

- **Dynamic config**: settings injected at construct time; reusable across environments.
- **Plugin-ready**: each subsystem (logging, middleware, routes, handlers, lifespan) is a separately-imported, separately-tested module.
- **Pure function**: idempotent; safe to call N times in tests.
- **Lifespan separation**: resource setup/teardown is detached from the factory itself — see Part 8.

---

## PART 6 — Configuration System

`app/config/settings.py` — `Settings` is a `pydantic_settings.BaseSettings` subclass.

```python
class AppEnv(str, Enum):
    DEVELOPMENT = "development"
    STAGING     = "staging"
    PRODUCTION  = "production"

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", case_sensitive=False, extra="ignore")
    app_env: AppEnv = AppEnv.DEVELOPMENT
    database_url: str
    redis_url: str
    # … ~80 fields covering app, logging, CORS, auth, PG, CH, Redis, Celery,
    #     S3, crawler, external APIs, rate-limits, observability, feature flags

@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()
```

### Design choice — env-driven vs file-per-env

Earlier scaffolds favored `config/base.py + development.py + production.py + testing.py`. We chose a **single env-driven model** because:

1. 12-factor: configuration belongs in env, not in source.
2. Avoids "which file shipped to prod?" drift between local and deploy.
3. Type-safe access everywhere; misconfiguration fails at boot, not at first read.
4. `is_production` / `is_development` are `@computed_field`s — clear branches without conditional imports.

For environment-specific overrides (e.g., longer pool sizes in prod), the deploy layer sets env vars; the application reads them through the typed `Settings` accessor.

### Reading config

```python
from app.config import get_settings, Settings

cfg = get_settings()           # cached, process-singleton
cfg.database_url
```

Inside FastAPI handlers, prefer dependency injection (Part 11):

```python
from app.api.deps import SettingsDep

@router.get(...)
async def handler(settings: SettingsDep): ...
```

### Secrets

- `.env` is gitignored. `.env.example` is the template.
- In production, env vars come from K8s secrets sourced from Vault / AWS Secrets Manager via External Secrets Operator (Step 10 §16).
- `APP_SECRET_KEY` and `JWT_SECRET` are required and validated for length in CI (later step).

---

## PART 7 — Logging System

`app/core/logging.py` — structlog-based, idempotent setup.

- **Development**: coloured console renderer; human-readable.
- **Production**: JSON renderer; one structured object per line; consumed by Loki / ELK.
- **Context propagation**: `structlog.contextvars` — every log line tied to a request inherits `request_id`, `org_id`, `trace_id` automatically (set by middleware).

### Usage

```python
from app.core.logging import get_logger
log = get_logger(__name__)

log.info("audit.started", audit_id=audit.id, target=audit.target)
log.warning("rate.exceeded", route=request.url.path, principal=principal)
log.exception("upstream.failed", upstream="stripe")
```

### Quieted loggers

```python
for noisy in ("uvicorn.access", "asyncio", "botocore", "urllib3"):
    logging.getLogger(noisy).setLevel(logging.WARNING)
```

We rely on our own request-logging middleware (with request_id and timing) — uvicorn's access log is redundant noise.

### Integrations

- Loki via Fluentbit/Vector DaemonSet (Step 10 §13).
- Sentry via `sentry-sdk[fastapi]` — wired at lifecycle startup when `SENTRY_DSN` is set.

---

## PART 8 — Lifespan & Resource Management

FastAPI's `lifespan` context manager owns startup + shutdown. `app/core/lifecycle.py`:

```python
@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    # Startup
    init_engine()             # SQLAlchemy async engine
    await init_redis_pool()   # Redis connection pool
    # Sentry, OTel, Prometheus exporter init here in later steps.
    yield
    # Shutdown
    await close_redis_pool()
    await dispose_engine()
```

### Why lifespan vs `@app.on_event`

- Async-friendly out of the box.
- Single source of truth for ordering (init → yield → teardown).
- Plays well with TestClient — `with TestClient(app)` triggers lifespan.
- `@app.on_event` is deprecated in FastAPI.

### Adding a new resource

```python
# in lifecycle.py
await init_otel_tracer(settings.otel_exporter_otlp_endpoint)
...
await shutdown_otel_tracer()
```

Resources opened here are torn down on `SIGTERM` (K8s pod termination). Hooks run inside `terminationGracePeriodSeconds`; finish your work fast or checkpoint via the queue (Step 8 §2).

---

## PART 9 — Middleware

Stack defined in `app/middleware/__init__.py:install_middleware()`:

```python
# Outer → inner order (executed bottom-up on request, top-down on response):
app.add_middleware(TrustedHostMiddleware, allowed_hosts=cfg.trusted_hosts)  # main.py
app.add_middleware(CORSMiddleware, ...)                                      # main.py
# install_middleware():
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(TimingMiddleware)
app.add_middleware(RateLimitMiddleware, rpm=cfg.rate_limit_rpm, burst=cfg.rate_limit_burst)
app.add_middleware(RequestIdMiddleware)
```

### Execution order

Starlette wraps middleware in reverse-add order. The above means **on request**:

```
RequestId → RateLimit → Timing → SecurityHeaders → CORS → TrustedHost → route
```

Rationale:

1. **Request ID first (innermost on response, outermost on request)** — every downstream log line is tagged with the request ID.
2. **Rate limit early** — reject abusive traffic before doing real work.
3. **Timing** — measure route time, not auth time.
4. **Security headers** — apply on every response, including error responses.
5. **CORS** — handled before the route sees the request.
6. **Trusted host** — first line of defense; reject hosts that aren't us.

### Per-middleware files

| File | Purpose |
|---|---|
| `middleware/request_id.py`       | bind `request_id` into structlog contextvars + emit `X-Request-ID` header |
| `middleware/timing.py`           | measure latency; emit `X-Process-Time` and a metric per route |
| `middleware/security_headers.py` | HSTS, X-Frame-Options, CSP-ready, Referrer-Policy, etc. |
| `middleware/rate_limit.py`       | per-IP token bucket; authoritative limits in Redis (Step 6 §18) |

CORS and TrustedHost are stdlib FastAPI middlewares; everything else is ours.

### Compression

We compress at the edge (Cloudflare + ALB), not in-process — saves CPU. If you ever need in-process compression (no edge involved), add `GZipMiddleware` *outermost* in `main.py`.

---

## PART 10 — Error Handling

`app/core/exceptions.py` — unified error envelope.

### Error envelope

```json
{
  "error": {
    "code":    "rate_limited",
    "message": "Too many requests",
    "details": null
  }
}
```

All error responses follow this shape, regardless of source.

### Custom exception classes

```python
AppError              # base; .code + .status_code overridable
NotFoundError         # 404
UnauthorizedError     # 401
ForbiddenError        # 403
RateLimitedError      # 429
UpstreamError         # 502
# add ValidationError, ConflictError, QuotaError per Step 6 §12
```

Raise from handlers:

```python
raise NotFoundError(f"Domain {d} not registered for this org")
```

### Registered handlers

```python
@app.exception_handler(AppError)              # our domain errors
@app.exception_handler(StarletteHTTPException) # 404 from missing routes etc.
@app.exception_handler(RequestValidationError) # pydantic 422
@app.exception_handler(Exception)              # last-resort catch-all
```

The catch-all logs `exc_info` via structlog but **never** leaks internals to the response — production-safe message is returned.

### Adding a new error code

1. Subclass `AppError` in `core/exceptions.py`.
2. Define a stable `code` and `status_code`.
3. Document in `docs/api/errors.md` (per Step 6 §12).

---

## PART 11 — Dependency Injection

`app/api/deps.py`:

```python
SettingsDep = Annotated[Settings, Depends(get_settings)]
DBSession   = Annotated[AsyncSession, Depends(get_async_session)]
```

### Dependency scopes

| Dependency | Scope | Source |
|---|---|---|
| `SettingsDep` | process (LRU) | `get_settings()` cached |
| `DBSession`   | per-request | `async with AsyncSessionLocal() as s: yield s` |
| `RedisDep` (future) | per-request | borrowed from the connection pool |
| `CurrentUser` (later) | per-request | parses + verifies JWT; caches claims in L0 |
| `CurrentOrg` (later)  | per-request | derived from `CurrentUser` |

### Lifecycle

```
request arrives
  → Depends(get_async_session) creates AsyncSession
  → handler executes
  → on exit: session committed / rolled back / closed
  → response returned
```

### Async dependencies

Every dependency that touches I/O is async. Sync dependencies are allowed only for pure config / typing (`Settings`).

### Composing dependencies

```python
from app.api.deps import SettingsDep, DBSession

@router.get("/projects/{id}")
async def get_project(id: str, settings: SettingsDep, db: DBSession):
    ...
```

For service-layer composition, build small dependencies that depend on others:

```python
async def domain_service(db: DBSession, cache: RedisDep) -> DomainService:
    return DomainService(db=db, cache=cache)

DomainServiceDep = Annotated[DomainService, Depends(domain_service)]
```

This keeps handlers thin (route + return) and services testable in isolation.

---

## PART 12 — Routing Architecture

```
app/api/
├── deps.py                # shared dependencies
├── v1/
│   ├── router.py          # api_router = APIRouter(prefix="/api/v1")
│   ├── endpoints/
│   │   └── health.py      # /api/v1/health, /api/v1/health/deep
│   ├── dependencies/      # v1-scoped DI (e.g. v1 auth shapes)
│   ├── validators/
│   └── response_schemas/
├── v2/                    # next stable contract (Step 6 §20)
└── (later: internal/, admin/, public/)
```

### Registration

`app/main.py` mounts `api_router` from `app.api.v1.router`. New endpoint modules add themselves in `v1/router.py`:

```python
from app.api.v1.endpoints import health, domains, backlinks

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(health.router)
api_router.include_router(domains.router)
api_router.include_router(backlinks.router)
```

### Audience separation

Step 6 §1 defines four audiences: `/api/v1` (consumer dashboard), `/public/v1` (programmatic), `/internal` (east-west), `/admin`. Each lives under its own router prefix and (in production) under its own subdomain at the gateway. We never mix audiences on a single APIRouter — auth + rate limit policies differ per audience.

### Versioning

Within a major version, contracts only grow (Step 6 §20). Breaking changes spawn `v2` mounted as a separate router with its own endpoints subtree.

---

## PART 13 — Health Checks

`app/api/v1/endpoints/health.py`:

```
GET /healthz              — bare liveness (cheap; no deps)         — main.py
GET /api/v1/health        — liveness with metadata (env, version, uptime)
GET /api/v1/health/deep   — readiness with dependency probes
```

### What `health/deep` checks

- **Postgres** — `SELECT 1` via `AsyncSessionLocal`.
- **Redis** — `PING`.
- (Future) ClickHouse, Kafka, Sentry connectivity.

Response example:

```json
{
  "status": "ok",
  "env": "development",
  "version": "0.1.0",
  "uptime_seconds": 412,
  "dependencies": {"postgres": true, "redis": true}
}
```

Status flips to `"degraded"` if any dependency is unreachable; HTTP stays 200 because Kubernetes interprets HTTP based on the probe type, not the body. For strict K8s readiness, return a 503 when any required dep is down — TODO in the file for when the orchestrator wants stricter signals.

### Kubernetes probes

```yaml
livenessProbe:
  httpGet:
    path: /healthz
    port: 8000
  periodSeconds: 10
  failureThreshold: 3

readinessProbe:
  httpGet:
    path: /api/v1/health/deep
    port: 8000
  periodSeconds: 5
  failureThreshold: 2

startupProbe:
  httpGet:
    path: /healthz
    port: 8000
  failureThreshold: 30        # ~5 min for slow boots
  periodSeconds: 10
```

`startupProbe` gates `livenessProbe` so HPA doesn't churn during boot.

---

## PART 14 — Schemas & Validation

`app/schemas/` holds Pydantic v2 models split by responsibility:

| Subfolder | Holds |
|---|---|
| `common.py`   | `StrictModel`, `ErrorEnvelope`, `PageMeta`, `HealthResponse` |
| `dtos/`       | Cross-layer data transfer objects |
| `pagination/` | Cursor envelope, page params |
| `requests/`   | Request bodies (input) |
| `responses/`  | Response bodies (output) |
| `validators/` | Reusable field validators (domain, URL, ULID, etc.) |

### StrictModel

```python
class StrictModel(BaseModel):
    model_config = ConfigDict(extra="forbid", validate_assignment=True)
```

`extra="forbid"` — unknown fields fail validation. This is intentional: we'd rather reject a typo than silently drop it. Loosen only at API boundaries where third-party clients may send extra fields.

### Reusable validators

Domain validation:

```python
# app/schemas/validators/domain.py
DOMAIN_RE = re.compile(r"^(?=.{1,253}\.?$)(?!-)(?:[A-Z0-9-]{1,63}(?<!-)\.)+[A-Z]{2,63}$", re.I)

def validate_domain(v: str) -> str:
    if not DOMAIN_RE.match(v): raise ValueError("Invalid domain")
    return v.lower().strip(".")
```

URL validation (SSRF-safe — Step 7 §22):

```python
# app/schemas/validators/url.py
PRIVATE_NETS = [ipaddress.ip_network(n) for n in ("10/8","172.16/12","192.168/16","127/8","169.254/16","::1/128","fc00::/7","fe80::/10")]

def validate_public_url(v: str) -> str:
    # resolve + check against PRIVATE_NETS at fetch time too (DNS rebind defense)
    ...
```

Pagination:

```python
class PageParams(StrictModel):
    cursor: str | None = None
    limit:  int = Field(50, ge=1, le=1000)
```

---

## PART 15 — Database Foundation

`app/database/`:

```
database/
├── base.py            # DeclarativeBase + naming conventions
├── session.py         # async engine, AsyncSessionLocal, init/dispose helpers
├── ch_client.py       # ClickHouse async client wrapper
├── query_builders/    # complex query helpers (later steps)
├── repositories/      # repository pattern per resource (later steps)
└── utilities/
```

### Async engine setup

```python
# app/database/session.py
_engine: AsyncEngine | None = None
AsyncSessionLocal: async_sessionmaker[AsyncSession] | None = None

def init_engine() -> None:
    global _engine, AsyncSessionLocal
    settings = get_settings()
    _engine = create_async_engine(
        settings.database_url,
        pool_size=settings.database_pool_size,
        max_overflow=settings.database_max_overflow,
        pool_timeout=settings.database_pool_timeout,
        pool_pre_ping=True,
        echo=settings.database_echo,
    )
    AsyncSessionLocal = async_sessionmaker(_engine, expire_on_commit=False, class_=AsyncSession)

async def dispose_engine() -> None:
    if _engine: await _engine.dispose()

async def get_async_session() -> AsyncIterator[AsyncSession]:
    async with AsyncSessionLocal() as s: yield s
```

### Migrations

- `alembic/` and `alembic.ini` are scaffolded.
- `alembic -c alembic.ini upgrade head` is a no-op until Step 12 introduces models.
- The container's `start-api.sh` runs migrations on boot (`upgrade head || true`).

### What NOT to do here

- No ORM models in this step.
- No repositories or query helpers (per the Step 11 prompt).
- The foundation is **infrastructure-only**.

---

## PART 16 — Redis Foundation

`app/cache/`:

```
cache/
├── redis_client.py    # async pool, init/close lifecycle, get_redis()
└── managers/          # cache service abstractions (later steps)
```

### Pool lifecycle

```python
# app/cache/redis_client.py
_pool: aioredis.ConnectionPool | None = None
_client: aioredis.Redis | None = None

async def init_redis_pool() -> None:
    global _pool, _client
    settings = get_settings()
    _pool = aioredis.ConnectionPool.from_url(
        settings.redis_url,
        max_connections=settings.redis_max_connections,
        decode_responses=False,           # binary-safe
    )
    _client = aioredis.Redis(connection_pool=_pool)

async def close_redis_pool() -> None:
    if _client: await _client.aclose()
    if _pool:   await _pool.aclose()

def get_redis() -> aioredis.Redis:
    if _client is None: raise RuntimeError("Redis pool not initialised — was lifespan run?")
    return _client
```

### Usage

```python
from app.cache.redis_client import get_redis

async def my_handler():
    r = get_redis()
    await r.set("k", "v", ex=60)
```

For higher-level caching (single-flight, SWR, tags), see Step 9 §22 — the cache SDK is built on top of this client.

### Why one client, not many

A single multiplexed `Redis` client per worker (Step 9 §22) is the right shape for asyncio — connections are checked out of the pool per call, kept warm, and reused. Spawning per-call clients is the most common cause of "Redis is slow" complaints in async Python.

---

## PART 17 — Background Tasks Foundation

Step 8 owns the queue/worker substrate end-to-end. The backend foundation exposes:

- **Celery app instance** at `app/workers/celery_app.py` (to be scaffolded next step) — same import path used by API and worker pods.
- **Producer SDK** entrypoint: `from app.workers.producer import submit_task` (to be added).
- **FastAPI `BackgroundTasks`** — used **only** for fire-and-forget, in-process side effects (e.g., flushing a log). Anything important goes through Celery.

```python
# illustrative — production flow
from fastapi import BackgroundTasks
from app.workers.producer import submit_task

@router.post("/projects/{id}/audit", status_code=202)
async def start_audit(id: str, background: BackgroundTasks):
    submit_task("audit.start", payload={"project_id": id})
    background.add_task(emit_audit_event, project_id=id)        # local-only
    return {"status": "queued"}
```

Worker entrypoint:

```
celery -A app.workers.celery_app worker ...     # see Part 4
```

---

## PART 18 — Security Foundation

What's in place at the foundation:

- **Trusted hosts** — `TrustedHostMiddleware` rejects bogus `Host` headers.
- **CORS** — explicit allow-list via `CORS_ORIGINS`; credentials allowed; only safe methods exposed.
- **Security headers** — HSTS, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: no-referrer`, baseline CSP (extended per route in later steps).
- **Request size limits** — `python-multipart` configured with sensible upload caps; per-route caps via FastAPI dependency.
- **Payload validation** — Pydantic v2 `extra="forbid"` blocks injection of unknown fields.
- **SSRF-safe URL validator** — scaffold in `schemas/validators/url.py`; full enforcement at fetch time (Step 7 §22).
- **Rate limit middleware** — coarse per-IP token bucket; authoritative per-principal limits in Redis come with the auth implementation.
- **Secret handling** — `.env` gitignored; production secrets via Vault → External Secrets → K8s secrets (Step 10 §16).

What's **not** in this step (deliberate):

- JWT issuance / verification.
- OAuth flows.
- RBAC enforcement.
- API key management.

These land in the dedicated auth step. The foundation prepares for them: a single `Annotated[User, Depends(...)]` dependency drops in cleanly when auth ships.

---

## PART 19 — Observability Foundation

Hooks in place; full wiring per Step 10 §13:

- **Logs** — structlog with JSON renderer in prod; request_id propagated via contextvars.
- **Metrics** — `prometheus_client` is in `requirements.txt`; `/metrics` endpoint is mounted in Step 10's monitoring deploy step. Process-level metrics (request counts, latency histograms, queue depths) emitted from middleware + workers.
- **Tracing** — `opentelemetry-instrumentation-fastapi` is in deps; tracer init is a TODO in `lifecycle.py` awaiting OTLP endpoint config.
- **Errors** — `sentry-sdk[fastapi,celery]` in deps; `sentry_sdk.init(...)` wired in `lifecycle.py` when `SENTRY_DSN` is set.

What this looks like in code:

```python
# app/monitoring/metrics.py (later step — but the contract is fixed)
from prometheus_client import Counter, Histogram
requests_total       = Counter("http_requests_total", "...", ["route", "method", "status"])
request_duration_sec = Histogram("http_request_duration_seconds", "...", ["route", "method"])
```

Middleware records these per request (cardinality discipline: bucket route templates, never raw paths).

---

## PART 20 — Testing

```
tests/
├── conftest.py            # session-scoped app + per-test client
├── test_health.py         # baseline
├── unit/                  # pure logic; no I/O
├── api_tests/             # FastAPI TestClient
├── integration/           # docker compose Postgres + Redis
├── e2e/                   # full stack — runs in CI behind a marker
├── crawler_tests/         # crawler-specific fixtures
├── security_tests/        # auth/CORS/headers/rate-limit
└── performance/           # locust / micro-benchmarks
```

### conftest

```python
@pytest.fixture(scope="session")
def app():
    return create_app()

@pytest.fixture()
def client(app) -> TestClient:
    return TestClient(app)        # triggers lifespan via `with TestClient(...)`
```

### Markers

```toml
[tool.pytest.ini_options]
asyncio_mode = "auto"
testpaths = ["tests"]
addopts = "-ra --strict-markers"
markers = [
  "unit: fast isolated tests",
  "integration: needs DB/Redis",
  "e2e: needs full docker stack",
]
```

Run flavors:

```bash
pytest tests/ -m unit                        # quick
pytest tests/ -m "integration and not e2e"   # CI default
pytest tests/                                # everything
pytest tests/ -k health                      # by name
```

### Mocking strategy

- **Unit**: pure functions + lightweight mocks (`pytest-mock`).
- **Integration**: real Postgres + Redis from docker compose; tests run with `APP_ENV=development`.
- **Async tests**: `pytest-asyncio` with `asyncio_mode = "auto"` so every coroutine test runs without `@pytest.mark.asyncio` boilerplate.
- **Fake clocks**: `freezegun` (later add) for time-sensitive tests.

---

## PART 21 — Dev Tooling

### Ruff (lint + format)

`pyproject.toml`:

```toml
[tool.ruff]
line-length = 100
target-version = "py312"
extend-exclude = ["alembic/versions"]

[tool.ruff.lint]
select = ["E","F","W","I","B","UP","N","C4","SIM","RUF"]
ignore = ["E501"]      # line length governed by formatter

[tool.ruff.format]
quote-style  = "double"
indent-style = "space"
```

Ruff replaces Black + isort + flake8. One tool, one cache.

### mypy

```toml
[tool.mypy]
python_version = "3.12"
strict = false                  # incremental adoption; modules opt-in to strict
ignore_missing_imports = true
plugins = ["pydantic.mypy"]
```

Tighten gradually: business-critical modules turn on `strict = true` first.

### pre-commit

`seo-suite/.pre-commit-config.yaml` runs on every commit:

- trailing whitespace, EOF newline, YAML/TOML/JSON validity, merge conflicts, large files, private-key detection
- Ruff (`--fix`) + Ruff format
- mypy on staged backend files
- `detect-secrets` against the project baseline
- `hadolint` on Dockerfiles
- `shellcheck` on `scripts/*.sh`

Install:

```bash
cd seo-suite
pip install pre-commit
pre-commit install
pre-commit run --all-files     # one-time full pass
```

### Daily dev commands

```bash
make lint        # ruff check + mypy
make format      # ruff format
make test        # pytest in the api container
make migrate     # alembic upgrade head
```

---

## PART 22 — Docker

### `Dockerfile` (API image)

Multi-stage, slim Python 3.12:

```dockerfile
FROM python:3.12-slim-bookworm AS base
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 PIP_NO_CACHE_DIR=1 \
    PLAYWRIGHT_BROWSERS_PATH=/ms-playwright
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential curl ca-certificates libpq-dev libxml2-dev libxslt1-dev \
    netcat-openbsd && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY requirements.txt requirements-dev.txt /app/
RUN pip install --upgrade pip && pip install -r requirements.txt
COPY . /app
RUN chmod +x scripts/*.sh
EXPOSE 8000
CMD ["./scripts/start-api.sh"]
```

Layer caching: `requirements.txt` is copied **before** the app code, so a code change doesn't invalidate the dependency layer. Build time on a clean machine: ~3 min cold, ~15 s with cache.

### `Dockerfile.worker`

Same base, different entrypoint (`./scripts/start-worker.sh`). Render worker uses `mcr.microsoft.com/playwright/python` and is built separately.

### `.dockerignore`

Excludes `.git`, `.venv`, `node_modules`, `__pycache__`, `*.pyc`, `logs/`, `.env*`, etc. Keeps build context tiny.

### Production hardening (planned for image-publish step)

- Non-root user (`adduser --uid 10001 app`).
- Drop CAPs in K8s pod spec.
- Read-only root FS where possible.
- Health-check command (`HEALTHCHECK`) — but K8s overrides this; keep simple.

---

## PART 23 — CI/CD

Workflow at `.github/workflows/seo-suite-backend.yml`. Triggers on changes under `seo-suite/backend/**`.

### Jobs

| Job | Runs on | Purpose |
|---|---|---|
| `lint`             | every push/PR | Ruff check + format check + mypy |
| `test`             | after lint    | Pytest with Postgres + Redis service containers |
| `docker`           | after test    | Build API + worker images; push to GHCR on `main` |
| `deploy-staging`   | on `main` only | Stub for Argo CD / kubectl deploy |
| `deploy-production`| on `v*` tags  | Stub for production deploy |

### Caching

- pip cache keyed on `requirements*.txt`.
- Docker layer cache via GHA cache backend (`type=gha,scope=api|worker`).

### Service containers

`postgres:16-alpine` + `redis:7-alpine` on the GitHub-hosted runner. Health checks gate the test step. Env vars match the in-process `Settings` defaults.

### Promotion path

```
PR opened          → lint + test                       (preview only)
PR merged to main  → lint + test + docker push :sha    (image available)
Push to main       → deploy-staging                    (auto)
Tag v*             → deploy-production                 (manual approval via environment)
```

`environment: production` enforces a GitHub Environment with required reviewers — no surprises.

---

## PART 24 — Production Server

### Gunicorn config

Encoded in `scripts/start-api.sh`. Key flags:

```
--workers ${GUNICORN_WORKERS:-4}     # = 2 × CPU cores typically; cap at 8 per pod
-k uvicorn.workers.UvicornWorker     # async worker class
--timeout 60                          # hard kill after 60s; for long endpoints, stream instead
--graceful-timeout 30                 # SIGTERM → drain 30s → SIGKILL
--keep-alive 5                        # keep TCP open 5s for HTTP/1.1 reuse
--max-requests 10000                  # recycle worker every 10k requests (bound long-tail leaks)
--max-requests-jitter 500             # avoid synchronized recycles across workers
--access-logfile -                    # stdout
--error-logfile -                     # stderr (structlog still owns structured logs)
```

### Pod resource shape (recap from Step 10 §3)

```yaml
resources:
  requests: { cpu: 500m,  memory: 512Mi }
  limits:   { cpu: 2000m, memory: 1Gi   }
```

### Workers per pod tuning

- IO-bound (almost all our endpoints): `workers = 2 × cores`; each worker handles thousands of concurrent requests via asyncio.
- CPU-bound paths don't live in the API — they're queued to a worker class with the right shape.

### Health probes (recap Part 13)

`/healthz` for liveness; `/api/v1/health/deep` for readiness.

### Zero-downtime

- Rolling update with `maxSurge: 25%`, `maxUnavailable: 10%`.
- ALB target deregistration delay 30 s, matched to gunicorn `--graceful-timeout`.
- `preStop` hook sends `SIGTERM` and sleeps 5 s before exit, giving the LB time to flip routing.

---

## PART 25 — Onboarding Checklist

Day one for a new backend engineer:

```
[ ] Clone repo
[ ] Install Python 3.12 + Docker
[ ] cd seo-suite && pip install pre-commit && pre-commit install
[ ] cd backend && python -m venv .venv && source .venv/bin/activate
[ ] pip install -r requirements.txt -r requirements-dev.txt
[ ] cp .env.example .env  (fill APP_SECRET_KEY, JWT_SECRET)
[ ] docker compose -f ../docker-compose.yml up -d postgres redis
[ ] alembic -c alembic.ini upgrade head
[ ] uvicorn app.main:app --reload
[ ] curl http://localhost:8000/api/v1/health/deep
[ ] open http://localhost:8000/docs
[ ] make test
[ ] Read docs/architecture/BACKEND_FOUNDATION.md (this file)
[ ] Read docs/api/API_ARCHITECTURE.md (Step 6)
[ ] Read docs/architecture/CACHE_ARCHITECTURE.md (Step 9) for the cache SDK contract
[ ] Pick a "starter" ticket from the project board
[ ] Open a draft PR within 48h
```

### Where to add new things

| Want to add… | Goes in |
|---|---|
| A new endpoint                 | `app/api/v1/endpoints/<resource>.py` + wire into `v1/router.py` |
| A new exception type           | `app/core/exceptions.py` (subclass `AppError`) |
| A new middleware               | `app/middleware/<name>.py` + register in `install_middleware()` |
| A new env-driven setting       | `app/config/settings.py` + add to `.env.example` |
| A reusable validator           | `app/schemas/validators/<name>.py` |
| A long-running task            | `app/workers/tasks/<domain>.py` (Step 8 §3 contract) |
| A periodic job                 | `beat_schedule.py` (static) or `scheduled_jobs` table (per-tenant) |
| A DB repository                | `app/database/repositories/<resource>.py` |
| A cache key namespace          | `app/cache/namespaces/<name>.py` (Step 9 §11) |
| A new test                     | `tests/<unit|api_tests|integration|...>` mirror the source path |

---

**STEP 11 FASTAPI BACKEND SETUP COMPLETED**

# SEO Suite — Domain Authority + Backlink Checker

Enterprise-grade SaaS platform for domain authority analysis, backlink discovery,
and referring-domain intelligence. Architected for millions of lookups, async
crawling, and SaaS-scale workloads.

> This directory contains **infrastructure scaffolding only**. No business logic,
> APIs, models, or crawler code is implemented yet — those land in later steps.

## Layout

```
seo-suite/
├── backend/          FastAPI app, Celery workers, Alembic, crawler skeleton
├── frontend/         Next.js + TypeScript + Tailwind UI
├── docker/           Per-service container configs (Postgres, Redis, ClickHouse)
├── nginx/            Reverse-proxy + edge config
├── scripts/          Dev/ops scripts (up, down, reset)
├── deployments/      Production deployment manifests
└── docker-compose.yml
```

## Quick start (local)

```bash
cp seo-suite/backend/.env.example seo-suite/backend/.env
cp seo-suite/frontend/.env.local.example seo-suite/frontend/.env.local
docker compose -f seo-suite/docker-compose.yml up --build
```

See `DEVELOPMENT.md` for the full command catalog.

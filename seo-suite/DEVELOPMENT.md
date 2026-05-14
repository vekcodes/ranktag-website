# Development Commands

All commands run from `seo-suite/` unless noted.

## Backend

```bash
# create + activate venv
python -m venv .venv
source .venv/bin/activate            # Linux/macOS
.\.venv\Scripts\Activate.ps1          # Windows PowerShell

# install
pip install -U pip
pip install -e "backend[dev]"         # uses pyproject.toml extras
# OR
pip install -r backend/requirements.txt -r backend/requirements-dev.txt

# run API (dev autoreload)
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 \
  --app-dir backend

# run API (prod via gunicorn+uvicorn workers)
gunicorn app.main:app \
  -k uvicorn.workers.UvicornWorker \
  -w 4 -b 0.0.0.0:8000 \
  --chdir backend
```

## Workers

```bash
# Celery worker — all queues
celery -A app.workers.celery_app:celery_app worker -l info \
  -Q q.crawl.high,q.crawl.low,q.render,q.parse,q.aggregate,q.metrics,q.whois,q.alerts,q.exports \
  --chdir backend

# Celery worker — single role (renderer is heavy, isolate it)
celery -A app.workers.celery_app:celery_app worker -l info -Q q.render -c 2 \
  --chdir backend

# Celery Beat (periodic scheduler)
celery -A app.workers.celery_app:celery_app beat -l info --chdir backend

# Flower (optional dashboard)
celery -A app.workers.celery_app:celery_app flower --port=5555 --chdir backend
```

## Database

```bash
# create a new migration revision
alembic -c backend/alembic.ini revision -m "describe change" --autogenerate

# apply migrations
alembic -c backend/alembic.ini upgrade head

# rollback one revision
alembic -c backend/alembic.ini downgrade -1

# show current revision
alembic -c backend/alembic.ini current
```

## Frontend

```bash
cd frontend
npm install
npm run dev             # http://localhost:3000
npm run build
npm run start           # serves the build
npm run lint
npm run type-check
npm run format
```

## Docker

```bash
# full stack up (API + worker + beat + postgres + redis + nginx + frontend)
docker compose up --build

# detached
docker compose up -d --build

# tail logs for one service
docker compose logs -f api

# down (keep volumes)
docker compose down

# down + wipe volumes
docker compose down -v

# rebuild a single service
docker compose build api
docker compose up -d api
```

## Testing / quality

```bash
# backend
pytest backend/tests -v
pytest backend/tests --cov=backend/app --cov-report=term-missing
ruff check backend/
ruff format backend/
mypy backend/app

# frontend
cd frontend
npm run lint
npm run type-check
npm test
```

## Scripts

```bash
./scripts/dev-up.sh         # bring stack up
./scripts/dev-down.sh       # bring stack down
./scripts/reset-db.sh       # wipe + recreate DB volumes
```

#!/usr/bin/env bash
set -euo pipefail

# Wait for DB + Redis before booting.
./scripts/wait-for.sh "${POSTGRES_HOST:-postgres}:${POSTGRES_PORT:-5432}" 60
./scripts/wait-for.sh "${REDIS_HOST:-redis}:${REDIS_PORT:-6379}" 60

# Apply migrations (no-op until models exist).
alembic -c alembic.ini upgrade head || true

if [ "${APP_ENV:-development}" = "production" ]; then
  exec gunicorn app.main:app \
    -k uvicorn.workers.UvicornWorker \
    --workers "${GUNICORN_WORKERS:-4}" \
    --bind "0.0.0.0:${APP_PORT:-8000}" \
    --access-logfile - --error-logfile - \
    --timeout 60 --graceful-timeout 30 --keep-alive 5
else
  exec uvicorn app.main:app --host 0.0.0.0 --port "${APP_PORT:-8000}" --reload
fi

#!/usr/bin/env bash
set -euo pipefail

./scripts/wait-for.sh "${REDIS_HOST:-redis}:${REDIS_PORT:-6379}" 60

exec celery -A app.workers.celery_app:celery_app beat -l "${LOG_LEVEL:-info}"

#!/usr/bin/env bash
set -euo pipefail

./scripts/wait-for.sh "${REDIS_HOST:-redis}:${REDIS_PORT:-6379}" 60

# Queues default to "all" for dev; override CELERY_QUEUES per worker pool in prod.
QUEUES="${CELERY_QUEUES:-q.crawl.high,q.crawl.low,q.render,q.parse,q.aggregate,q.metrics,q.whois,q.alerts,q.exports}"
CONCURRENCY="${CELERY_CONCURRENCY:-8}"

exec celery -A app.workers.celery_app:celery_app worker \
  -l "${LOG_LEVEL:-info}" \
  -Q "${QUEUES}" \
  -c "${CONCURRENCY}" \
  --without-gossip --without-mingle

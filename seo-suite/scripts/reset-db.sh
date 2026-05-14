#!/usr/bin/env bash
# WARNING: wipes Postgres + ClickHouse + Redis volumes.
set -euo pipefail
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$DIR"

read -r -p "This will DESTROY all local data volumes. Type 'yes' to continue: " confirm
[ "$confirm" = "yes" ] || { echo "aborted"; exit 1; }

docker compose down -v
docker compose up -d postgres redis clickhouse
echo "[reset-db] volumes recreated."

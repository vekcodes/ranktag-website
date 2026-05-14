#!/usr/bin/env bash
# Bring the full local dev stack up (detached). From repo root: ./seo-suite/scripts/dev-up.sh
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$DIR"

if [ ! -f backend/.env ]; then
  cp backend/.env.example backend/.env
  echo "[dev-up] copied backend/.env.example -> backend/.env (edit before prod use)"
fi
if [ ! -f frontend/.env.local ]; then
  cp frontend/.env.local.example frontend/.env.local
  echo "[dev-up] copied frontend/.env.local.example -> frontend/.env.local"
fi

docker compose up -d --build
docker compose ps

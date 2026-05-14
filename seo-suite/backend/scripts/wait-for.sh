#!/usr/bin/env bash
# Wait for a host:port to be reachable (TCP). Usage: wait-for.sh host:port [timeout_s]
set -euo pipefail

target="${1:?host:port required}"
timeout="${2:-60}"
host="${target%%:*}"
port="${target##*:}"

start=$(date +%s)
until (echo > "/dev/tcp/${host}/${port}") >/dev/null 2>&1; do
  now=$(date +%s)
  if [ $((now - start)) -ge "${timeout}" ]; then
    echo "wait-for: timed out after ${timeout}s waiting for ${host}:${port}" >&2
    exit 1
  fi
  sleep 1
done
echo "wait-for: ${host}:${port} is up"

#!/bin/sh
# ─────────────────────────────────────────────────────────────────────
#  Postgres backup script — invoked by the pg-backup container's cron.
#
#  Behaviour:
#    - pg_dump (custom format, compressed level 6) of the app database
#    - Writes to /backups/<ts>_<db>.dump
#    - Prunes backups older than BACKUP_RETENTION_DAYS
#    - Verifies the dump by listing TOC entries before declaring success
#
#  Production:
#    - Replace local volume with S3 via `aws s3 cp` after dump.
#    - Or — preferred — use pgbackrest / WAL-G for streaming + PITR.
#    - For RDS, snapshots + automated backups make this script obsolete.
# ─────────────────────────────────────────────────────────────────────
set -eu

: "${PGHOST:?PGHOST not set}"
: "${PGUSER:?PGUSER not set}"
: "${PGDATABASE:?PGDATABASE not set}"
: "${BACKUP_RETENTION_DAYS:=14}"

ts="$(date -u +%Y%m%dT%H%M%SZ)"
out="/backups/${ts}_${PGDATABASE}.dump"

mkdir -p /backups

echo "[backup] starting pg_dump ${PGDATABASE} → ${out}"
pg_dump \
  --host="${PGHOST}" \
  --port="${PGPORT:-5432}" \
  --username="${PGUSER}" \
  --dbname="${PGDATABASE}" \
  --format=custom \
  --compress=6 \
  --no-owner \
  --no-privileges \
  --jobs=2 \
  --file="${out}.tmp"

# Verify it's a valid archive before naming it final.
if ! pg_restore --list "${out}.tmp" > /dev/null; then
  echo "[backup] ERROR: dump archive failed verification"
  rm -f "${out}.tmp"
  exit 1
fi

mv "${out}.tmp" "${out}"
size_h=$(du -h "${out}" | cut -f1)
echo "[backup] success — ${out} (${size_h})"

# Retention prune.
find /backups -type f -name '*.dump' -mtime "+${BACKUP_RETENTION_DAYS}" -print -delete

# Lightweight integrity report.
count=$(find /backups -type f -name '*.dump' | wc -l)
newest=$(find /backups -type f -name '*.dump' -printf '%T@ %p\n' | sort -nr | head -1 | cut -d' ' -f2-)
echo "[backup] retention: ${count} dump(s); newest=${newest}"

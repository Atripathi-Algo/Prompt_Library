#!/usr/bin/env bash
# Dumps the promptlib Postgres database to a timestamped .sql file under backups/.
# Run manually, or wire this into cron for a recurring backup. This does NOT
# upload anywhere — for real production use, point the output at durable
# off-machine storage (S3, a managed Postgres provider's own snapshotting,
# etc.) instead of relying on local disk alone.
set -euo pipefail

cd "$(dirname "$0")/.."
mkdir -p backups

timestamp=$(date +%Y%m%d-%H%M%S)
out_file="backups/promptlib-${timestamp}.sql"

echo "Backing up promptlib database to ${out_file} ..."
docker compose exec -T db pg_dump -U promptlib -d promptlib > "${out_file}"

echo "Done: ${out_file}"

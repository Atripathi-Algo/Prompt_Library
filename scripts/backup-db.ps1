# Dumps the promptlib Postgres database to a timestamped .sql file under backups/.
# Run manually, or wire this into Windows Task Scheduler / a cron job for a
# recurring backup. This does NOT upload anywhere — for real production use,
# point the output at durable off-machine storage (S3, a managed Postgres
# provider's own snapshotting, etc.) instead of relying on local disk alone.

$ErrorActionPreference = "Stop"

$backupDir = Join-Path $PSScriptRoot "..\backups"
New-Item -ItemType Directory -Force -Path $backupDir | Out-Null

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$outFile = Join-Path $backupDir "promptlib-$timestamp.sql"

Write-Host "Backing up promptlib database to $outFile ..."
docker compose exec -T db pg_dump -U promptlib -d promptlib | Out-File -Encoding utf8 $outFile

Write-Host "Done: $outFile"

#!/bin/bash
# =============================================================================
# Backup script for digital-agency SQLite databases
# Usage: ./scripts/backup.sh [--keep N] [--compress]
#   --keep N   keep only N most recent backups (default: 7)
#   --compress compress backups with gzip (default: yes)
# =============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
BACKUP_DIR="${BACKUP_DIR:-${PROJECT_DIR}/backups}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
KEEP=7
COMPRESS=true

while [[ $# -gt 0 ]]; do
  case $1 in
    --keep)
      KEEP="$2"
      shift 2
      ;;
    --compress)
      COMPRESS="$2"
      shift 2
      ;;
    --no-compress)
      COMPRESS=false
      shift
      ;;
    *)
      echo "Unknown option: $1"
      exit 1
      ;;
  esac
done

mkdir -p "$BACKUP_DIR"

# Database files to backup
DATABASES=(
  "${PROJECT_DIR}/services/auth-service/data/auth.sqlite"
  "${PROJECT_DIR}/services/catalog-service/data/catalog.sqlite"
  "${PROJECT_DIR}/services/clients-service/data/clients.sqlite"
  "${PROJECT_DIR}/services/projects-service/data/projects.sqlite"
  "${PROJECT_DIR}/services/product-shelf-service/data/shelf.sqlite"
)

echo "=== Digital Agency Backup $(date) ==="
echo "Backup directory: $BACKUP_DIR"

backup_file() {
  local src="$1"
  local basename="$(basename "$src")"
  local dest="${BACKUP_DIR}/${TIMESTAMP}_${basename}"

  if [[ -f "$src" ]]; then
    cp "$src" "$dest"
    if $COMPRESS; then
      gzip "$dest"
      dest="${dest}.gz"
    fi
    echo "  ✓ $basename → $(basename "$dest")"
  else
    echo "  ⚠ $basename not found, skipping"
  fi
}

for db in "${DATABASES[@]}"; do
  backup_file "$db"
done

# Cleanup old backups
if [[ -d "$BACKUP_DIR" ]]; then
  cd "$BACKUP_DIR"
  backups=(*.sqlite*.gz *.sqlite)
  if [[ ${#backups[@]} -gt $KEEP ]]; then
    echo ""
    echo "Keeping only $KEEP most recent backups..."
    ls -dt *.sqlite*.gz *.sqlite 2>/dev/null \
      | tail -n +$((KEEP + 1)) \
      | xargs -r rm -v
  fi
fi

echo ""
echo "Backup complete: $TIMESTAMP"
echo "Location: $BACKUP_DIR"

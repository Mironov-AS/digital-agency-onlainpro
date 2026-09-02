#!/bin/bash
# Backup PostgreSQL на VM
# Использование: ./backup-pg-vm.sh

set -e

# Конфигурация
DB_HOST="5.129.252.107"
DB_PORT="5432"
DB_NAME="digital_agency"
DB_USER="agency"
DB_PASS="AgencyStrongPass2024!"
BACKUP_DIR="/tmp/db_backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/backup_${DATE}.sql.gz"

# Создаём директорию для бэкапов
mkdir -p ${BACKUP_DIR}

echo "Создание backup базы данных ${DB_NAME}..."
echo "Backup файл: ${BACKUP_FILE}"

# Создаём backup
PGPASSWORD="${DB_PASS}" pg_dump -h ${DB_HOST} -p ${DB_PORT} -U ${DB_USER} -d ${DB_NAME} --no-owner --no-acl | gzip > ${BACKUP_FILE}

# Проверяем размер
SIZE=$(du -h ${BACKUP_FILE} | cut -f1)
echo "Backup создан: ${BACKUP_FILE} (${SIZE})"

# Удаляем бэкапы старше 7 дней
find ${BACKUP_DIR} -name "backup_*.sql.gz" -mtime +7 -delete
echo "Старые бэкапы (>7 дней) удалены"

echo "Backup завершён!"

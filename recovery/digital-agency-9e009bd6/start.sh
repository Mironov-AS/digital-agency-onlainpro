#!/bin/sh
set -e

# Load production env file so all variables are guaranteed to be in scope.
# Works both in Docker (where Promto mounts the env file) and standalone.
if [ -f "/repo/.env.production" ]; then
	. /repo/.env.production
elif [ -f "${HOME}/.env.production" ]; then
	. "${HOME}/.env.production"
fi

DB_BASE="${DATABASE_URL}"

make_db_url() {
	# Production data lives in service-specific schemas. Keep an opt-in default
	# public mode only for legacy/simple services, and force schemas for services
	# that already have production data or common table names (users, services,
	# products, clients, projects).
	if [ "${2:-default}" != "force_schema" ] && [ "${DB_SCHEMA_MODE:-public}" != "per_service" ]; then
		echo "${DB_BASE}"
		return
	fi

	case "$DB_BASE" in
	*\?*) SEP="&" ;;
	*) SEP="?" ;;
	esac

	echo "${DB_BASE}${SEP}options=-c%20search_path%3D$1"
}

echo "[start] Launching microservices..."

DATABASE_URL="$(make_db_url auth force_schema)" \
	node /repo/services/auth-service/src/seed.js 2>&1 || true
DATABASE_URL="$(make_db_url auth force_schema)" \
CORS_ORIGIN="${CORS_ORIGIN}" \
PORT=4001 \
JWT_ACCESS_SECRET="${JWT_ACCESS_SECRET}" \
JWT_REFRESH_SECRET="${JWT_REFRESH_SECRET}" \
	node /repo/services/auth-service/src/server.js &

DATABASE_URL="$(make_db_url catalog force_schema)" \
	node /repo/services/catalog-service/src/seed.js 2>&1 || true
DATABASE_URL="$(make_db_url catalog force_schema)" \
CORS_ORIGIN="${CORS_ORIGIN}" \
PORT=4002 node /repo/services/catalog-service/src/server.js &

DATABASE_URL="$(make_db_url clients force_schema)" \
	node /repo/services/clients-service/src/seed.js 2>&1 || true
DATABASE_URL="$(make_db_url clients force_schema)" \
CORS_ORIGIN="${CORS_ORIGIN}" \
AUTH_SERVICE_URL="http://localhost:4001" \
PRODUCT_SHELF_URL="http://localhost:4006" \
JWT_ACCESS_SECRET="${JWT_ACCESS_SECRET}" \
SMTP_HOST="${SMTP_HOST}" \
SMTP_PORT="${SMTP_PORT}" \
SMTP_USER="${SMTP_USER}" \
SMTP_PASS="${SMTP_PASS}" \
SMTP_FROM="${SMTP_FROM}" \
PORT=4003 node /repo/services/clients-service/src/server.js &

DATABASE_URL="$(make_db_url projects force_schema)" \
	node /repo/services/projects-service/src/seed.js 2>&1 || true
DATABASE_URL="$(make_db_url projects force_schema)" \
CORS_ORIGIN="${CORS_ORIGIN}" \
PORT=4004 node /repo/services/projects-service/src/server.js &

DATABASE_URL="$(make_db_url admin)" \
CORS_ORIGIN="${CORS_ORIGIN}" \
PORT=4005 node /repo/services/admin-service/src/server.js &

DATABASE_URL="$(make_db_url shelf force_schema)" \
	node /repo/services/product-shelf-service/src/seed.js 2>&1 || true
DATABASE_URL="$(make_db_url shelf force_schema)" \
CORS_ORIGIN="${CORS_ORIGIN}" \
PORT=4006 node /repo/services/product-shelf-service/src/server.js &

DATABASE_URL="$(make_db_url queue force_schema)" \
CORS_ORIGIN="${CORS_ORIGIN}" \
PORT=3001 JWT_SECRET="$JWT_ACCESS_SECRET" node /repo/services/queue-service/server/index.js &

DATABASE_URL="$(make_db_url booking force_schema)" \
CORS_ORIGIN="${CORS_ORIGIN}" \
AUTH_SERVICE_URL="http://localhost:4001" \
PORT=4008 node /repo/services/booking-service/server/index.js &

DATABASE_URL="$(make_db_url crm force_schema)" \
CORS_ORIGIN="${CORS_ORIGIN}" \
BOOKING_SERVICE_URL="http://localhost:4008" \
AUTH_SERVICE_URL="http://localhost:4001" \
PORT=4009 node /repo/services/crm-service/src/server.js &

DATABASE_URL="$(make_db_url erp force_schema)" \
CORS_ORIGIN="${CORS_ORIGIN}" \
AUTH_SERVICE_URL="http://localhost:4001" \
PORT=4010 node /repo/services/erp-service/server/index.js &

DATABASE_URL="$(make_db_url store force_schema)" \
CORS_ORIGIN="${CORS_ORIGIN}" \
AUTH_SERVICE_URL="http://localhost:4001" \
PORT=4011 node /repo/services/store-service/src/server.js &

DATABASE_URL="$(make_db_url furniture_sorter,shelf force_schema)" \
CORS_ORIGIN="${CORS_ORIGIN}" \
PORT=4012 node /repo/services/furniture-photo-sorter-service/server/index.js &

# label-merger-service now runs as a separate Docker container managed by docker-compose
# DATABASE_URL="$(make_db_url label_merger,shelf force_schema)" \
# PORT=4013 node /repo/services/label-merger-service/src/server.js &

echo "[start] Waiting for services to boot..."
sleep 3

echo "[start] Starting nginx on port 3000..."
nginx -g 'daemon off;'

#!/bin/bash
# Запуск всех микросервисов digital-agency

ROOT="/home/user/digital-agency/services"

start_service() {
  local name=$1 dir=$2 port=$3 entry=${4:-src/server.js}
  if curl -s -o /dev/null -w "%{http_code}" "http://localhost:$port/api/health" 2>/dev/null | grep -q "200"; then
    echo "✓ $name уже запущен (порт $port)"
    return
  fi
  if curl -s -o /dev/null -w "%{http_code}" "http://localhost:$port/health" 2>/dev/null | grep -q "200"; then
    echo "✓ $name уже запущен (порт $port)"
    return
  fi
  PORT=$port node "$ROOT/$dir/$entry" >> "/tmp/$dir.log" 2>&1 &
  sleep 2
  local code
  code=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:$port/api/health" 2>/dev/null)
  if [ "$code" = "200" ]; then
    echo "✅ $name запущен (порт $port)"
    return
  fi
  code=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:$port/health" 2>/dev/null)
  if [ "$code" = "200" ]; then
    echo "✅ $name запущен (порт $port)"
    return
  fi
  echo "❌ $name не запустился, смотри /tmp/$dir.log"
  tail -5 "/tmp/$dir.log"
}

start_service "auth-service"          "auth-service"          4001
start_service "catalog-service"       "catalog-service"       4002
start_service "clients-service"       "clients-service"       4003
start_service "projects-service"      "projects-service"      4004
start_service "admin-service"         "admin-service"         4005
start_service "product-shelf-service" "product-shelf-service" 4006
start_service "booking-service"       "booking-service"       4008 "server/index.js"
start_service "queue-service"         "queue-service"         3001 "server/index.js"
start_service "crm-service"           "crm-service"           4009
start_service "erp-service"           "erp-service"           4010 "server/index.js"
start_service "store-service"         "store-service"         4011

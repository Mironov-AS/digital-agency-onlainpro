# Цифровое агентство — ОнлайнПро.РФ

SaaS-платформа для управления клиентами, услугами, подписками, финансами и проектами.

## Архитектура

```
┌─────────────────────────────────────────────────────────┐
│                        Nginx (gateway)                  │
│           landing/  +  /app/  +  /api/* → microservices  │
└─────────────────────────────────────────────────────────┘
                          │
        ┌────────────┬────┴────┬────────────┐
        ▼            ▼         ▼            ▼
   auth-service catalog-s. clients-s.  projects-s.
   (4001)       (4002)      (4003)       (4004)
                              │
                    ┌─────────┴─────────┐
                    ▼                   ▼
             admin-service      product-shelf-s.
               (4005)               (4006)
```

**Frontend:** React + Vite (port 5173)
**Client Portal:** React (port 5202)
**Queue Dashboard:** React (port 3002)

## Быстрый старт (разработка)

```bash
# 1. Установка зависимостей
npm install

# 2. Запуск всех сервисов
npm run dev

# Или по отдельности:
npm run dev:app          # frontend (5173)
npm run dev:client-portal # клиентский портал (5202)
npm run dev:queue        # электронная очередь (3002)

# Backend-сервисы ( ports 4001-4006 )
npm run dev:services
```

## Запуск в продакшене (Docker)

```bash
# 1. Настройка переменных окружения
cp .env.example .env
# Отредактируйте .env:
#   JWT_ACCESS_SECRET=<минимум 32 символа>
#   JWT_REFRESH_SECRET=<минимум 32 символа>
#   CORS_ORIGIN=https://ваш-домен.ru

# 2. Сборка и запуск
docker compose build
docker compose up -d

# 3. Проверка статуса
docker compose ps
curl http://localhost:8080/api/health
```

## Переменные окружения (.env)

| Переменная | Обязательная | Описание |
|---|---|---|
| `JWT_ACCESS_SECRET` | ✅ | Секрет для access-токенов (минимум 32 символа) |
| `JWT_REFRESH_SECRET` | ✅ | Секрет для refresh-токенов (минимум 32 символа) |
| `CORS_ORIGIN` | ✅ | Домен для CORS (например `https://онлайнпро.рф`) |

## Структура баз данных (SQLite)

| Сервис | Путь | Таблицы |
|---|---|---|
| auth-service | `services/auth-service/data/auth.sqlite` | users, refresh_tokens |
| catalog-service | `services/catalog-service/data/catalog.sqlite` | services, categories, cost_types, service_costs |
| clients-service | `services/clients-service/data/clients.sqlite` | clients, client_services, payments, org_costs |
| projects-service | `services/projects-service/data/projects.sqlite` | projects, ... |
| product-shelf-service | `services/product-shelf-service/data/shelf.sqlite` | products, product_subscriptions |

## Резервное копирование

```bash
# Ручной бэкап всех баз
./scripts/backup.sh

# Автоматический бэкап (cron) — каждый день в 3:00
# Добавить в crontab -e:
0 3 * * * /home/user/digital-agency/scripts/backup.sh --keep 14
```

## API Endpoints

### Auth (4001)
- `POST /api/auth/login` — авторизация
- `POST /api/auth/refresh` — обновление токена
- `GET /api/auth/me` — текущий пользователь

### Catalog (4002)
- `GET /api/catalog/services` — список услуг
- `GET /api/catalog/categories` — категории
- `GET /api/catalog/costs` — типы стоимости

### Clients (4003)
- `GET /api/clients` — список клиентов
- `GET /api/clients/:id` — детали клиента
- `GET /api/clients/:id/payments` — платежи клиента
- `GET /api/clients/org-costs` — организационные расходы

### Projects (4004)
- `GET /api/projects` — список проектов

### Admin (4005)
- `GET /api/admin/users` — управление пользователями
- `GET /api/admin/services` — статусы сервисов

### Product Shelf (4006)
- `GET /api/products` — продукты
- `GET /api/products/:code` — продукт по коду

## Роли пользователей

| Роль | Доступ |
|---|---|
| `admin` | Полный доступ ко всем сервисам |
| `user` | Внутренний пользователь (по умолчанию) |
| `client` | Личный кабинет клиента, только свои данные |

## Лицензия

Внутреннее использование © ОнлайнПро.РФ

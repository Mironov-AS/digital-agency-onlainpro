# Комплексный аудит проекта "Цифровое агентство ОнлайнПро.РФ"

**Дата:** 2026-05-06
**Проект:** digital-agency (монорепозиторий микросервисов)
**Цель:** Ревью кода, выявление технического долга, план рефакторинга

---

## Оглавление

1. [Сводка](#1-сводка)
2. [Структура проекта](#2-структура-проекта)
3. [Безопасность](#3-безопасность)
4. [Качество backend-кода](#4-качество-backend-кода)
5. [Качество frontend-кода](#5-качество-frontend-кода)
6. [Зависимости](#6-зависимости)
7. [Тестирование](#7-тестирование)
8. [Сборка и деплой](#8-сборка-и-деплой)
9. [План рефакторинга](#9-план-рефакторинга)

---

## 1. Сводка

| Категория | CRITICAL | HIGH | MEDIUM | LOW |
|-----------|----------|------|--------|-----|
| Безопасность | 3 | 5 | 6 | 4 |
| Backend-код | 3 | 4 | 5 | 6 |
| Frontend-код | 2 | 6 | 3 | 1 |
| Зависимости | 1 | 5 | 3 | 2 |
| Тесты | 0 | 3 | 2 | 1 |
| Сборка/Деплой | 0 | 1 | 4 | 2 |
| **Итого** | **9** | **24** | **23** | **16** |

**Общая оценка:** Проект имеет хорошую архитектуру микросервисов с правильной изоляцией, но содержит критические проблемы безопасности, значительный технический долг в коде и пробелы в тестировании.

---

## 2. Структура проекта

### 2.1 Текущая структура

```
digital-agency/
├── app/                    # Admin dashboard (React 19 + Vite)
├── landing/                # Landing page (React 19 + Vite)
├── client-portal/          # Клиентский портал (React 18 + Vite)
├── services/
│   ├── auth-service/       # Аутентификация (4001)
│   ├── catalog-service/    # Каталог услуг (4002)
│   ├── clients-service/    # Клиенты (4003)
│   ├── projects-service/   # Проекты (4004)
│   ├── admin-service/      # Администрирование (4005)
│   ├── product-shelf-service/ # Продуктовая полка (4006)
│   ├── queue-service/      # Электронная очередь (3001)
│   ├── booking-service/    # Электронная запись (4008)
│   ├── crm-service/        # CRM Light (4009)
│   └── logs/               # ПУСТАЯ директория
├── shared/                 # Общие модули (createApp, auth middleware, db)
├── gateway/                # nginx + Dockerfile
├── scripts/                # Бэкап и миграции
└── docs/                   # Документация
```

**Оценка:** Структура логична, соответствует стандартам монорепозитория Node.js.

### 2.2 Проблемы структуры

| Проблема | Серьёзность | Описание |
|----------|-------------|----------|
| Неконсистентная структура сервисов | MEDIUM | queue-service: `/server/` + `/client/`, booking: без `/server/`, crm: `/src/` + `/client/` |
| Мусорные файлы | HIGH | `Dockerfile.backup.old`, `server.js.bak`, `test-dirname.js`, `test-env.js`, `server_debug.js`, `server_hardcoded.js` |
| Пустая директория `services/logs/` | LOW | Не используется |
| Демо-файлы | LOW | `widget-demo.html`, `widget-demo-server.js` — если не нужны, удалить |

---

## 3. Безопасность

### 3.1 CRITICAL

#### 3.1.1 Секреты в .env файлах
**Файлы:** `.env`, `.env.production`, `services/auth-service/.env`, `services/queue-service/.env`

Продакшн-секреты доступны на диске: JWT secrets, DATABASE_URL с паролем, SMTP пароль, пароль администратора.

**Рекомендация:** Ротировать все секреты немедленно. Использовать secrets manager.

#### 3.1.2 CORS с fallback на `true`
**Файл:** `services/admin-service/src/server.js:86`
```javascript
app.use(cors({ origin: process.env.CORS_ORIGIN || true, credentials: true }));
```
Если `CORS_ORIGIN` не задан, разрешены запросы с ЛЮБОГО домена.

**Рекомендация:** Убрать fallback `|| true`, обязать наличие переменной.

#### 3.1.3 Слабые JWT секреты
Секреты предсказуемы: `onlinepro-production-access-secret-2024-...`

**Рекомендация:** Сгенерировать криптографически стойкие: `openssl rand -base64 64`

### 3.2 HIGH

| Проблема | Файл | Описание |
|----------|------|----------|
| Слабый пароль администратора | `.env` | 12 символов, простой паттерн |
| Недостаточный rate limiting | `auth-service/src/server.js:17-23` | Только `/login` (20/15мин), нет на `/refresh`, регистрации |
| Отсутствие Helmet на некоторых сервисах | `booking-service/server/index.js` | booking пропускает helmet |
| Cookie `sameSite: 'lax'` | `auth-service/src/routes/auth.js:25-41` | Для прода лучше `'strict'` |
| SMTP пароль в plaintext в БД | `admin-service/src/server.js:393-407` | Нет шифрования при хранении |

### 3.3 MEDIUM

- Отсутствие CSRF-защиты (все сервисы)
- Нет валидации длины поисковых строк (DoS)
- Нет ротации refresh token
- Чувствительные данные в логах ошибок
- Нет принудительного HTTPS-редиректа
- Отсутствие Content-Security-Policy

---

## 4. Качество backend-кода

### 4.1 CRITICAL

#### 4.1.1 SQL Injection — динамическое построение запросов
**Затронутые файлы:**
- `auth-service/src/routes/users.js:90`
- `catalog-service/src/routes/services.js:62`
- `clients-service/src/routes/clients.js:312, 379, 476, 599`
- `projects-service/src/routes/projects.js:70`
- `product-shelf-service/src/routes/products.js:67`

```javascript
// УЯЗВИМО — ключи объекта формируют SQL без whitelist:
const keys = Object.keys(updates);
const sets = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
await db.pool.query(`UPDATE users SET ${sets} WHERE id = $${keys.length + 1}`, [...values, id]);
```

**Рекомендация:** Whitelist допустимых полей для каждого эндпоинта.

#### 4.1.2 Отсутствие авторизации на некоторых роутах
- `catalog-service/src/routes/services.js:78` — `PATCH /reorder` без `requireAdmin`
- `queue-service/server/routes/queue.js:33` — публичный GET с `clientId` без валидации

#### 4.1.3 Дублирование auth middleware
- `admin-service/src/server.js:18-52` — дублирует логику авторизации вместо shared
- `queue-service/server/index.js:38-100` — инлайн JWT для Socket.IO

### 4.2 HIGH

| Проблема | Описание |
|----------|----------|
| Нет валидации input | Отсутствует schema validation (Joi/Zod) на POST/PUT эндпоинтах |
| Неинформативные ошибки | Все ошибки возвращают generic "Internal server error" |
| Нет лимита размера request body | Часть сервисов не задаёт `express.json({ limit })` |
| SMTP пароль без шифрования | `admin-service` хранит SMTP credentials в plaintext |

### 4.3 MEDIUM — Дублирование кода (DRY)

Паттерн CRUD (UPDATE с динамическими SET) повторяется **15+ раз** в 6 сервисах. Рекомендация: выделить `shared/buildUpdateQuery.js`.

Бизнес-логика смешана с route handlers:
- `clients-service/src/routes/clients.js:97-260` — 150+ строк расчёта статистики в одном эндпоинте

### 4.4 LOW

- Неконсистентный формат ошибок (`{ error }` vs `{ error: { status, message } }`)
- Разные реализации логгера (shared vs queue-specific vs inline)
- REST-нарушения (action-based роуты вместо resource-based)
- Отсутствие пагинации на списочных эндпоинтах

---

## 5. Качество frontend-кода

### 5.1 CRITICAL — Гигантские компоненты

| Файл | Строк | Проблема |
|------|-------|----------|
| `landing/src/App.jsx` | 2,186 | Вся landing page в одном файле |
| `app/src/pages/ClientDetailPage.jsx` | 1,668 | 8+ стейтов, 5+ модалок inline |
| `app/src/pages/crm/CrmCustomersTab.jsx` | 1,314 | Слишком большой компонент |
| `app/src/pages/crm/CrmCalendarTab.jsx` | 1,117 | Слишком большой компонент |
| `app/src/pages/CatalogPage.jsx` | 727 | 3 компонента в одном файле |
| `app/src/pages/AdminPage.jsx` | 593 | 3 таба в одном файле |

### 5.2 HIGH

| Проблема | Масштаб | Описание |
|----------|---------|----------|
| Inline стили | 180+ случаев | `style={{}}` вместо CSS классов |
| Нет PropTypes | 100% компонентов | Ни один компонент не валидирует props |
| Нет мемоизации | 0% leaf-компонентов | Нет `React.memo`, `useCallback`, `useMemo` |
| CSS дубликаты | 7 дублей в App.css | `.form-row`, `.info-card`, `.field-input` и др. определены дважды |
| Монолитный CSS | 2,145 строк | Один файл `App.css`, нет CSS-переменных для цветов |
| Landing использует `fetch()` вместо `apiFetch()` | `landing/src/App.jsx:323-332` | Нет обработки JWT токенов |

### 5.3 MEDIUM

- 18 файлов с `console.error()` в продакшн-коде
- Неконсистентное управление стейтом модалок
- Отсутствие Escape-key обработки в некоторых модалках
- Accessibility: нет aria-label на иконочных кнопках, div вместо button

---

## 6. Зависимости

### 6.1 CRITICAL

| Пакет | Проблема |
|-------|----------|
| `jest: ^30.3.0` | **Невалидная версия.** Jest актуальный — v29.x. Версия 30 не существует |

### 6.2 Несовместимости версий

| Пакет | Сервисы с v1 | Сервисы с v2 | Риск |
|-------|-------------|-------------|------|
| **bcryptjs** | root: `^3.0.3` | auth, booking, shelf, queue: `^2.4.3` | HIGH — несовместимость хешей |
| **React** | app, landing: `^19.2.5` | client-portal, queue-client: `^18.2.0` | HIGH — breaking changes |
| **express** | большинство: `^4.19.2` | booking, crm: `^4.18.2` | MEDIUM |
| **pg** | большинство: `^8.20.0` | booking, crm: `^8.11.3` | MEDIUM |
| **express-rate-limit** | root, clients: `^8.4.1` | auth: `^7.2.0`, booking: `^7.1.5` | HIGH — breaking API |
| **helmet** | root: `^7.2.0` | сервисы: `^7.1.0` | LOW |

---

## 7. Тестирование

### 7.1 Покрытие тестами

| Компонент | Фреймворк | Файлов тестов | Качество |
|-----------|-----------|---------------|----------|
| crm-service | Jest | 12 | Хорошее — полноценные тесты с mock DB |
| queue-service | Jest + Vitest | 20 | Хорошее — server + client |
| auth-service | Jest | 1 | Минимальное — только health check |
| catalog-service | Jest | 1 | Минимальное — только health check |
| clients-service | Jest | 1 | Минимальное — только health check |
| projects-service | Jest | 1 | Минимальное — только health check |
| product-shelf-service | Jest | 1 | Минимальное — только health check |
| **admin-service** | **Нет** | **0** | **Нет тестов** |
| **booking-service** | **Нет** | **0** | **Нет тестов** |
| app (frontend) | Vitest | 2 | Минимальное (api, date utils) |
| **landing** | **Нет** | **0** | **Нет тестов** |
| **client-portal** | **Нет** | **0** | **Нет тестов** |

### 7.2 Критические пробелы

- **admin-service** — управляет SMTP, email-рассылками — zero coverage
- **booking-service** — клиентский сервис записи — zero coverage
- 5 backend-сервисов имеют только placeholder-тесты (health check)
- Нет CI/CD pipeline (GitHub Actions / GitLab CI) для автоматического запуска тестов

---

## 8. Сборка и деплой

### 8.1 Dockerfile

**Плюсы:** Multi-stage build (7 стадий), Alpine Linux, правильная изоляция фронтенд-билдов.

**Проблемы:**
- `npm install` вместо `npm ci` — недетерминированные сборки
- Нет `HEALTHCHECK` инструкции
- Нет gzip-компрессии в nginx
- Нет Cache-Control заголовков для статики
- Нет security headers (HSTS, CSP) на уровне nginx

### 8.2 CI/CD

**Отсутствует полностью.** Нет GitHub Actions, GitLab CI, Jenkins.

---

## 9. План рефакторинга

### Фаза 1: Безопасность (CRITICAL, 1-2 дня)

1. **Ротация секретов** — JWT, DB password, SMTP пароль
2. **Исправить CORS** в admin-service — убрать `|| true`
3. **Whitelist полей** в динамических UPDATE-запросах (SQL injection)
4. **Добавить авторизацию** на роут `PATCH /reorder` в catalog-service
5. **Исправить Jest версию** — `^30.3.0` → `^29.7.0`

### Фаза 2: Стабильность и код (HIGH, 3-5 дней)

6. **Синхронизировать зависимости** — bcryptjs, express, pg, rate-limit
7. **Выделить shared утилиты** — `buildUpdateQuery()`, стандартный error handler
8. **Убрать дублирование auth middleware** — admin-service, queue-service
9. **Добавить input validation** — Zod/Joi на все POST/PUT endpoints
10. **Разбить крупные компоненты:**
    - `ClientDetailPage.jsx` → отдельные секции
    - `CatalogPage.jsx` → вынести модалки
    - `AdminPage.jsx` → отдельные табы
    - `landing/App.jsx` → отдельные секции

### Фаза 3: Качество кода (MEDIUM, 3-5 дней)

11. **CSS рефакторинг** — CSS-переменные для цветов, удаление дубликатов, вынос inline-стилей
12. **Добавить PropTypes** ко всем компонентам
13. **Мемоизация** — `React.memo`, `useCallback` для leaf-компонентов
14. **Стандартизировать формат ошибок** API
15. **Удалить мусор** — .bak файлы, демо-файлы, пустые директории, console.error

### Фаза 4: Тестирование (HIGH, 3-5 дней)

16. **Написать тесты для admin-service** (email, SMTP)
17. **Написать тесты для booking-service** (CRUD записей)
18. **Расширить тесты** auth, catalog, clients, projects, product-shelf (бизнес-логика)
19. **Настроить CI/CD** — GitHub Actions для прогона тестов и билда
20. **Добавить pre-commit hooks** — lint + test

### Фаза 5: Инфраструктура (MEDIUM, 2-3 дня)

21. **Dockerfile** — `npm ci`, HEALTHCHECK, права на upload-директории
22. **nginx** — gzip, Cache-Control, security headers
23. **Docker Compose** — persistent volumes, resource limits
24. **Документация** — обновить AGENTS.md, ARCHITECTURE.md

---

## Файлы для удаления

```
digital-agency/Dockerfile.backup.old
digital-agency/services/admin-service/src/server.js.bak
digital-agency/services/admin-service/test-dirname.js
digital-agency/services/admin-service/test-env.js
digital-agency/services/admin-service/server_debug.js
digital-agency/services/admin-service/server_hardcoded.js
digital-agency/services/logs/               (пустая директория)
digital-agency/landing/.env                 (пустой файл)
digital-agency/widget-demo.html             (если не используется)
digital-agency/widget-demo-server.js        (если не используется)
```

---

## Оценка трудозатрат

| Фаза | Приоритет | Оценка | Риск при откладывании |
|------|-----------|--------|----------------------|
| 1. Безопасность | CRITICAL | 1-2 дня | Компрометация данных |
| 2. Стабильность | HIGH | 3-5 дней | Баги в проде, уязвимости |
| 3. Качество кода | MEDIUM | 3-5 дней | Рост техдолга, сложность поддержки |
| 4. Тестирование | HIGH | 3-5 дней | Регрессии при изменениях |
| 5. Инфраструктура | MEDIUM | 2-3 дня | Неоптимальная производительность |
| **Итого** | | **12-20 дней** | |

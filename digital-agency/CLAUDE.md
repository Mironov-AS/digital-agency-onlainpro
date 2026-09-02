# Инструкции для Claude

## Проекты в этом репозитории

| Папка | Название | Статус |
|-------|----------|--------|
| `/home/user/digital-agency/` | **Цифровое агентство ОнлайнПро.РФ** | ✅ ОСНОВНОЙ ПРОЕКТ — здесь ведётся разработка |
| `/home/user/contract-management/` | **ContractPro** | 🎯 ДЕМО-ПРОЕКТ — отдельный репозиторий, работаем с ним только когда пользователь явно указывает |

> Правило: если пользователь не уточнил проект — работай с `digital-agency`.

---

## Структура digital-agency (монорепозиторий микросервисов)

```
digital-agency/
├── app/                         # Frontend (React + Vite) — единая точка входа
│   ├── src/
│   │   ├── pages/               # DashboardPage.jsx, ClientsPage.jsx, AdminPage.jsx, ...
│   │   ├── components/          # Общие компоненты (AppShell, ServiceCard, ConfirmModal)
│   │   ├── config/services.js   # Каталог сервисов (плитки на главной)
│   │   ├── constants/           # Общие константы (intervals и т.д.)
│   │   ├── utils/               # Общие утилиты (date helpers)
│   │   └── api.js               # API клиент для основного приложения
├── services/
│   ├── auth-service/            # Микросервис аутентификации (port 4001)
│   ├── catalog-service/         # Микросервис каталога услуг (port 4002)
│   ├── clients-service/         # Микросервис клиентов (port 4003)
│   ├── projects-service/        # Микросервис проектов (port 4004)
│   ├── admin-service/           # Микросервис администрирования (port 4005)
│   ├── product-shelf-service/   # Микросервис продуктовой полки (port 4006)
│   ├── queue-service/           # Электронная очередь (server port 3001, client port 3004)
│   ├── booking-service/         # Электронная запись (server port 4008, client port 3003)
│   ├── crm-service/            # CRM Light (server port 4009, client port 3005)
│   └── erp-service/            # ERP Light (server port 4010, client — Vite SPA)
├── shared/                      # Общая инфраструктура для микросервисов
│   ├── createApp.js             # Express app factory (helmet/cors/json/cookie-parser)
│   └── middleware/auth.js       # JWT requireAuth / requireAdmin
├── gateway/                     # nginx + Dockerfile (multi-stage build landing+app)
└── landing/                     # Лендинг страница
```

## Ключевые правила

1. **Основной API** — импортируй `apiFetch` из `api.js`, использует `/api/*` (microservices)
2. **Все микросервисы** работают на портах 4001-4006 + 4008 (booking) + 4009 (crm) + 4010 (erp) + 3001 (queue), проксируются через Vite/nginx
3. **Общие модули backend** — `shared/createApp.js` (bootstrap Express) и `shared/middleware/auth.js` (JWT)

## Домен приложения

Цифровое агентство ОнлайнПро.РФ: SaaS-платформа для управления клиентами, услугами, продуктами (подписки), финансами, проектами.

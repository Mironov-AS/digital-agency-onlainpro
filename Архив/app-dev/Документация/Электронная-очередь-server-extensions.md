# Расширения queue-service для полного функционала терминала

## Суть

Production `queue-service` в `digital-agency` — это multi-tenant SaaS-версия
(PostgreSQL, `client_id`, роли), изначально без фич оригинального
`Mironov-AS/queue-service`. Чтобы получить полный «режим терминала»
(проверка дубликатов + countdown + автооткрытие) добавлены:

## Что добавлено в queue-service (production)

### Серверные endpoints

| Endpoint | Метод | Auth | Описание |
|----------|-------|------|----------|
| `/api/service-fields/check-duplicate` | POST | нет | Возвращает `{duplicate, ticket}` для активного талона той же услуги с совпадающими значениями полей с `require_check=1` |
| `/api/settings/terminal-countdown` | GET / PUT | GET: нет, PUT: auth | Сколько секунд показывать вызванный талон на табло |
| `/api/settings/field-min-length` | GET / PUT | GET: нет, PUT: auth | Минимальная длина текстовых полей |
| `/api/settings/auto-open` | GET / PUT | GET: нет, PUT: auth | Авто-открытие/закрытие регистрации по времени |

### Миграция БД

**Migration 107** (`service_fields_require_check`) — добавляет колонку
`require_check INTEGER DEFAULT 0 NOT NULL` в таблицу `service_fields`.

Файл: `services/queue-service/server/database.js`, секция «Migration 107».

### Поддержка в существующих route

- `POST /api/services/:id/fields` теперь принимает `require_check`
- `PUT /api/service-fields/:id` теперь обновляет `require_check`
- В ответе `GET /api/services/:id/fields` поле `require_check` присутствует

### Файлы, изменённые на сервере

```
services/queue-service/server/
├── database.js                                      # + Migration 107
├── index.js                                         # + mount serviceFieldsPublicRouter
└── routes/
    ├── serviceFields.js                             # + require_check в POST/PUT
    ├── serviceFieldsPublic.js                       # NEW: /check-duplicate
    └── settings.js                                  # + terminal-countdown, field-min-length, auto-open
```

## Клиентские фичи в `app-dev` (Digital Agency)

### Режим терминала — `/app/queue/display`

Полноэкранное табло для зала ожидания с тремя режимами:

- **queue** — текущие вызванные талоны + список ожидания + часы
- **ticket** — после вызова: огромный номер + countdown секунд до возврата в ротацию + окно
- **ads** — полноэкранная ротация рекламы между показами

Особенности:
- Polling `/api/queue` каждые 3 секунды
- Звуковое оповещение через Web Audio API (двойной beep 880Hz→1100Hz)
- Полноэкранный режим (двойной клик)
- Кнопки: звук вкл/выкл, fullscreen, индикатор связи
- Настройка показа талона через `/api/settings/terminal-countdown`

### Киоск посетителя — `/app/queue/visitor`

- Выбор услуги
- Заполнение полей с проверкой `min_length`
- **Проверка дубликатов** через `/api/service-fields/check-duplicate` (если есть поля с `require_check=1`)
- Если дубликат найден — показываем существующий талон со ссылкой на статус

### Админка — `/app/queue-admin`

Вкладка «Настройки» теперь содержит:
- Время показа талона на табло (terminal countdown)

Вкладка «Услуги» → доп. поля:
- Флаг `require_check` для каждого поля

Вкладка «Очередь»:
- Все операции с талонамими (вызов, повтор, возврат, завершение, сброс)

## Развёртывание

Изменения применены в production:

1. `services/queue-service/server/*` обновлены на хосте `/opt/digital-agency/`
2. Скопированы в работающий Docker-контейнер `digital-agency`
3. Процесс queue-service перезапущен (PID 122 → PID 709)
4. Миграция 107 автоматически применилась при старте
5. SPA bundle пересобран в `/opt/digital-agency/app/` → скопирован в контейнер

## Проверка на проде

```bash
# Все endpoints работают через https://онлайнпро.рф
GET  /api/settings/terminal-countdown     → {"seconds":30}
GET  /api/settings/field-min-length       → {"min_length":3}
GET  /api/settings/auto-open              → {"enabled":false,"time":"08:00","close_time":"20:00"}
POST /api/service-fields/check-duplicate  → 200 {"duplicate":true,"ticket":{...}}
GET  /api/services/4/fields               → [{...,"require_check":1}]
```

Маршруты SPA:
```
https://онлайнпро.рф/app/               → 200 (главная)
https://онлайнпро.рф/app/queue-admin    → 200 (админка)
https://онлайнпро.рф/app/queue/display  → 200 (табло)
https://онлайнпро.рф/app/queue/visitor  → 200 (киоск)
```
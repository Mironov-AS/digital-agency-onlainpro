# Платежи: дата оплаты + уведомления

## Контекст

Клиент попросил добавить в раздел "Платежи" (сервис клиентов) две функции:

1. **Указание даты фактической оплаты** — в форме редактирования и при создании платежа добавить поле `paid_date`, а также отображать его в таблице платежей.
2. **Уведомления о предстоящих оплатах** — отправлять клиенту напоминания:
   - за 5 дней до платежа
   - за 3 дня до платежа
   - в день платежа

   Если клиент оплатил раньше — остальные запланированные оповещения отменяются.

## Структура данных

### Таблица `payment_notifications`

```sql
CREATE TABLE IF NOT EXISTS payment_notifications (
  id                  TEXT PRIMARY KEY,
  payment_id          TEXT NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
  scheduled_for       TIMESTAMPTZ NOT NULL,
  notification_type   TEXT NOT NULL DEFAULT 'email',  -- email / sms / push
  channel             TEXT NOT NULL DEFAULT 'email',  -- email / sms / push / telegram
  subject             TEXT DEFAULT '',
  message             TEXT DEFAULT '',
  status              TEXT NOT NULL DEFAULT 'pending', -- pending / sent / canceled / failed
  sent_at             TIMESTAMPTZ DEFAULT NULL,
  error_message       TEXT DEFAULT '',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_notifications_payment ON payment_notifications(payment_id);
CREATE INDEX IF NOT EXISTS idx_payment_notifications_scheduled ON payment_notifications(scheduled_for, status);
CREATE INDEX IF NOT EXISTS idx_payment_notifications_status ON payment_notifications(status);
```

### Таблица `payment_notification_settings`

Настройки уведомлений на уровне клиента (владелец аккаунта может отключить).

```sql
CREATE TABLE IF NOT EXISTS payment_notification_settings (
  id                  TEXT PRIMARY KEY,
  client_id           TEXT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  enabled             BOOLEAN NOT NULL DEFAULT TRUE,
  days_before         TEXT DEFAULT '5,3,0',  -- через запятую: за сколько дней отправлять
  channel             TEXT DEFAULT 'email',  -- email / sms / push
  email_template_id   TEXT DEFAULT NULL,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(client_id)
);

CREATE INDEX IF NOT EXISTS idx_payment_notification_settings_client ON payment_notification_settings(client_id);
```

### Изменения в существующую таблицу `payments`

```sql
ALTER TABLE payments ADD COLUMN IF NOT EXISTS paid_date TEXT DEFAULT NULL;
```

## Логика создания уведомлений

При создании платежа (POST `/api/clients/:id/payments`):

```
Для каждого дня в настройках (по умолчанию: 5, 3, 0):
  scheduled_date = planned_date - день
  Создать запись в payment_notifications с status = 'pending'
```

При отметке платежа как оплаченного (PATCH `/api/clients/:id/payments/:paymentId/pay`):

```
Найти все pending уведомления для этого payment_id
Установить status = 'canceled' для всех
Обновить paid_date платежа
```

## Backend

### Файлы

- `services/clients-service/src/db/index.js` — миграция таблиц
- `services/clients-service/src/routes/clients.js` — создание уведомлений при POST payment, отмена при pay
- `services/clients-service/src/routes/payments.js` — поддержка paid_date, создание/отмена уведомлений
- `services/clients-service/src/jobs/payment-reminder.job.js` — job для отправки (периодический)

### Эндпоинты (новые)

- `POST /api/clients/:clientId/payment-notification-settings` — создать/обновить настройки уведомлений
- `GET /api/clients/:clientId/payment-notification-settings` — получить настройки
- `GET /api/clients/:clientId/payment-notifications` — список уведомлений (для отладки/UI)

### Job: отправка уведомлений

`payment-reminder.job.js` запускается по cron каждые 15 минут:

1. Найти все `payment_notifications` где `scheduled_for <= NOW()` и `status = 'pending'`
2. Для каждого:
   - Проверить, что платёж ещё не оплачен (status != 'paid')
   - Получить данные клиента, email, service_name
   - Отправить уведомление
   - Обновить статус на 'sent' или 'failed'
3. Логировать результаты

## Frontend

### Файлы

- `app/src/pages/client-detail/sections.jsx` — PaymentsSection: показать `paid_date` в колонке "Статус"
- `app/src/pages/client-detail/PaymentFormModal.jsx` — добавить поле `paid_date` (только при редактировании)
- `app/src/pages/ClientDetailPage.jsx` — обработка paid_date в handleMarkPaid

### UI: Таблица платежей (PaymentsSection)

| Колонка          | Содержимое                                |
| ---------------- | ----------------------------------------- |
| Сумма            | `amount` ₽                                |
| Плановая дата    | `planned_date`                            |
| Услуга / Продукт | service_name или product_name или note    |
| Статус           | Бейдж: pending / paid (с датой) / overdue |
| Действия         | ✓ / ✏ / 🗑                                |

Колонка "Статус" показывает:

- `paid`: "✓ Оплачено 15.05.2026" (paid_date)
- `overdue`: "⚠ Просрочен"
- `pending` с датой в прошлом: "⚠ Просрочен"
- `pending` с датой сегодня: "⏳ Сегодня"
- `pending` с датой завтра: "⏳ Завтра"
- `pending` с датой через N дней: "Через N дн."

### UI: Форма платежа (PaymentFormModal)

- При создании нового платежа: поле "Дата оплаты" скрыто
- При редактировании: поле "Дата оплаты" появляется, позволяет указать дату (для ручной корректировки)
- Кнопка "Оплатить" в таблице ставит `paid_date = today`, `status = 'paid'`

### Кнопка "Оплатить"

- При клике открывается mini-модалка с датой (по умолчанию сегодня)
- Подтверждение → PATCH `/pay` → перезагрузка списка

## Проверка готовности

- [ ] Таблица `payment_notifications` создана
- [ ] Таблица `payment_notification_settings` создана
- [ ] Колонка `paid_date` добавлена в `payments`
- [ ] При создании платежа создаются записи уведомлений
- [ ] При отметке "оплачен" уведомления отменяются
- [ ] Job отправляет уведомления по schedule
- [ ] Frontend показывает paid_date в таблице
- [ ] Frontend позволяет указать paid_date при редактировании
- [ ] Кнопка "Оплатить" ставит сегодняшнюю дату

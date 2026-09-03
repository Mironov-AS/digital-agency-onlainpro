# Развёртывание Navi Logs Service

## Текущий статус

✅ Сервис создан и работает на этой VM
📍 Локально: http://localhost:3005
📋 API: http://localhost:3005/api/logs

## Для деплоя на prod (онлайнпро.рф/navi)

### Шаг 1: Скопировать файлы на prod сервер
```bash
scp -r /home/user/digital-agency/navi-logs user@your-server:/path/to/digital-agency/
```

### Шаг 2: Обновить docker-compose.yml
Добавлены:
- `navi-logs/Dockerfile`
- сервис `navi-logs` в docker-compose.yml
- конфигурация nginx для `/navi` в `gateway/nginx.conf`

### Шаг 3: Перезапустить сервисы
```bash
cd /path/to/digital-agency
docker compose build navi-logs gateway
docker compose up -d navi-logs gateway
```

### Шаг 4: Проверить
Откройте: https://онлайнпро.рф/navi/

---

## Интеграция в Android приложение

### Код уже добавлен:
- `LogUploader.kt` - класс для отправки логов
- Инициализация в `OSMNavApp.kt`
- Логирование в `MainActivity.kt`:
  - GPS position
  - Charging station search
  - Errors

### Как использовать в коде:
```kotlin
import com.osmnav.pro.data.remote.LogUploader

// Простое логирование
LogUploader.i("MyTag", "User clicked button")
LogUploader.e("MyTag", "Something went wrong: ${error.message}")

// С Exception
LogUploader.exception("MyTag", "Operation failed", exception)
```

### API вызов с устройства:
```
POST https://онлайнпро.рф/api/navi-logs/logs
Content-Type: application/json

{
  "deviceId": "abc123...",
  "deviceName": "Samsung Galaxy S21",
  "appVersion": "1.2.3",
  "androidVersion": "13",
  "level": "ERROR",
  "tag": "MainActivity",
  "message": "GPS timeout after 30 seconds",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

## Просмотр логов

1. Откройте https://онлайнпро.рф/navi/
2. Видите карточки устройств
3. Кликните на устройство для просмотра логов
4. Автообновление каждые 5 секунд

## Очистка логов
Нажмите кнопку "🗑️ Очистить" в интерфейсе.

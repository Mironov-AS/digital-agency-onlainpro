# Navi Logs - Сервис сбора логов OSM Navigator

## Описание

Сервис для удалённого сбора логов с Android-приложения OSM Navigator. 
Позволяет отлаживать приложение на разных устройствах без физического доступа.

## Доступ

- **Веб-интерфейс:** https://онлайнпро.рф/navi/
- **API:** https://онлайнпро.рф/api/navi-logs/

## API Endpoints

### Отправить лог
```
POST /api/navi-logs/logs
Content-Type: application/json

{
  "deviceId": "device-unique-id",
  "deviceName": "My Phone",
  "appVersion": "1.2.3",
  "androidVersion": "11",
  "level": "ERROR",
  "tag": "LocationService",
  "message": "GPS fix timeout",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Получить логи устройства
```
GET /api/navi-logs/logs/:deviceId
```

### Список устройств
```
GET /api/navi-logs/devices
```

### Очистить логи
```
DELETE /api/navi-logs/logs/:deviceId
```

## Интеграция в Android-приложение

Добавить в AndroidManifest.xml:
```xml
<uses-permission android:name="android.permission.INTERNET"/>
```

Код для отправки логов:
```kotlin
class LogUploader(private val context: Context) {
    private val baseUrl = "https://онлайнпро.рф/api/navi-logs"
    
    fun upload(level: String, tag: String, message: String) {
        val deviceId = Settings.Secure.getString(
            context.contentResolver,
            Settings.Secure.ANDROID_ID
        )
        
        val log = mapOf(
            "deviceId" to deviceId,
            "deviceName" to Build.MODEL,
            "appVersion" to BuildConfig.VERSION_NAME,
            "androidVersion" to Build.VERSION.RELEASE,
            "level" to level,
            "tag" to tag,
            "message" to message,
            "timestamp" to ISO8601.now()
        )
        
        lifecycleScope.launch {
            try {
                val response = okhttpClient.post("$baseUrl/logs") {
                    contentType(ContentType.Application.Json)
                    body = JSON.stringify(log)
                }
            } catch (e: Exception) {
                // Ignore network errors
            }
        }
    }
}
```

## Запуск

```bash
cd /home/user/digital-agency
docker compose up -d navi-logs gateway
```

## Логи хранятся

- В памяти: последние 1000 логов на устройство
- В файлах: `/home/user/digital-agency/navi-logs/logs/<deviceId>.log`

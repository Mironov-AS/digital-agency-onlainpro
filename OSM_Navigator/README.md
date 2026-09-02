# OSM Navigator — Android APK

Навигатор с проекцией на приборную панель автомобиля.

## Структура проекта

```
OSM_Navigator/
├── app/
│   └── src/main/
│       ├── java/com/osmnav/pro/
│       │   ├── OSMNavApp.kt              # Application class
│       │   ├── data/
│       │   │   ├── remote/               # OSRM API, Nominatim
│       │   │   └── repository/           # RouteRepository, SearchRepository
│       │   ├── domain/model/
│       │   │   ├── Location.kt           # Модель местоположения
│       │   │   ├── Route.kt             # Модель маршрута
│       │   │   ├── NavigationState.java  # Состояние для проекции
│       │   │   └── Maneuver.kt          # Типы манёвров
│       │   └── presentation/
│       │       ├── main/                 # Главный экран
│       │       ├── search/               # Поиск адресов
│       │       ├── navigation/           # Активная навигация
│       │       ├── settings/             # Настройки
│       │       └── dashboard/
│       │           └── DashboardProjectionManager.java  # ← ПРОЕКЦИЯ НА ПРИБОРНУЮ ПАНЕЛЬ
│       └── res/
├── build.gradle
├── settings.gradle
└── gradle/wrapper/
```

## Проекция на приборную панель

Модуль `DashboardProjectionManager` поддерживает:

1. **Android Presentation API** — стандартный механизм для вторичных дисплеев. Приложение ищет дисплей с флагом `FLAG_SECONDARY` (приборная панель) и показывает навигацию через `Presentation`.

2. **OEM Broadcast Intents** — отправляет `Intent` действия в систему автомобиля:
   - `com.android.car.navigation.START_NAVIGATION` — старт навигации
   - `com.android.car.navigation.UPDATE_NAVIGATION` — обновление состояния
   - `com.android.car.navigation.STOP_NAVIGATION` — остановка

3. **Собственные broadcast intents** — для OEM-систем без стандартного API:
   - `com.osmnavigator.pro.NAVIGATION_START`
   - `com.osmnavigator.pro.NAVIGATION_UPDATE`
   - `com.osmnavigator.pro.NAVIGATION_STOP`

При каждом обновлении манёвра (`updateNavigationState`) передаются:
- Текст манёвра
- Расстояние до манёвра
- Название текущей улицы
- Общее оставшееся расстояние и время
- Текст следующего манёвра

## Сборка

### Требования
- **Java 17** (JDK 17) — обязательно
- **Android SDK** (API 34)
- **Gradle 8.5** (скачивается автоматически)

### Команда
```bash
./gradlew assembleDebug
```

APK будет в `app/build/outputs/apk/debug/app-debug.apk`

### Установка на устройство
```bash
adb install app/build/outputs/apk/debug/app-debug.apk
```

## Навигация

- **OSRM** (Open Source Routing Machine) — построение маршрута
- **OSMdroid** — отрисовка карты OpenStreetMap
- **Android TTS** — голосовые подсказки на русском

## Приборная панель (i.MX 8QXP)

Если приборная панель не обнаружена через Presentation API — работает через OEM intents. Система автомобиля (head unit) должна прослушивать `com.android.car.navigation.*` intents и отображать данные на дисплее приборной панели.

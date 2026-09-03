#!/bin/bash
# Скрипт сборки OSM Navigator APK
set -e

echo "=== OSM Navigator APK Builder ==="
echo "Время: $(date)"
echo ""

# Настройка окружения - используем Java 17
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
export PATH=$JAVA_HOME/bin:$PATH
export ANDROID_HOME=/opt/android-sdk
export ANDROID_SDK_ROOT=/opt/android-sdk
export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools

echo "Java: $(java -version 2>&1 | head -1)"
echo "Gradle: $(/home/user/OSM_Navigator/gradle/wrapper/gradle-8.12 --version 2>&1 | head -1)"

# Директории
NAVIGATOR_DIR="/home/user/OSM_Navigator"
OUTPUT_DIR="/home/user/digital-agency/public/navigator-apk"
APK_OUTPUT="$OUTPUT_DIR/osm-navigator.apk"

# Создаём папку для APK
mkdir -p "$OUTPUT_DIR"

cd "$NAVIGATOR_DIR"

echo "1. Обновление исходников из Git..."
git pull origin master

echo "2. Очистка предыдущей сборки..."
./gradlew clean --no-daemon

echo "3. Сборка debug APK..."
./gradlew assembleDebug --no-daemon -Dorg.gradle.jvmargs="-Xmx4g"

echo "4. Копирование APK..."
mkdir -p "$OUTPUT_DIR"
cp app/build/outputs/apk/debug/app-debug.apk "$APK_OUTPUT"

echo "5. Генерация метаданных..."
cat >"$OUTPUT_DIR/version.json" <<EOF
{
  "version": "$(git describe --tags --always)",
  "buildDate": "$(date -Iseconds)",
  "fileName": "osm-navigator.apk",
  "fileSize": $(stat -c%s "$APK_OUTPUT"),
  "downloadUrl": "/navigator-apk/osm-navigator.apk",
  "changelog": [
    "Голосовые подсказки на русском",
    "Проекция на приборную панель",
    "Запись треков",
    "OSRM роутинг",
    "Камеры ГИБДД"
  ]
}
EOF

echo ""
echo "=== Сборка завершена! ==="
echo "APK: $APK_OUTPUT"
echo "Размер: $(du -h "$APK_OUTPUT" | cut -f1)"

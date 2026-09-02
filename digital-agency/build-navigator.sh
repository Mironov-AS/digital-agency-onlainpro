#!/bin/bash
# Скрипт сборки OSM Navigator APK
set -e

echo "=== OSM Navigator APK Builder ==="
echo "Время: $(date)"
echo ""

# Настройка окружения
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
export PATH=$JAVA_HOME/bin:$PATH
export ANDROID_HOME=/opt/android-sdk
export ANDROID_SDK_ROOT=/opt/android-sdk
export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools

echo "Java: $(java -version 2>&1 | head -1)"

# Директории - работает и локально и на VM
NAVIGATOR_DIR="/home/user/OSM_Navigator"
# Проверяем где мы - на VM или локально
if [ -d "/home/user/digital-agency" ]; then
	OUTPUT_DIR="/home/user/digital-agency/public/navigator-apk"
else
	OUTPUT_DIR="/home/user/public/navigator-apk"
fi
APK_OUTPUT="$OUTPUT_DIR/osm-navigator.apk"

echo "Output directory: $OUTPUT_DIR"

# Создаём папку для APK
mkdir -p "$OUTPUT_DIR"

cd "$NAVIGATOR_DIR"

echo "1. Pull исходников..."
git pull origin master 2>/dev/null || echo "Git pull skipped"

echo "2. Очистка..."
./gradlew clean --no-daemon 2>/dev/null || true

echo "3. Сборка debug APK..."
./gradlew assembleDebug --no-daemon -Dorg.gradle.jvmargs="-Xmx4g" 2>&1 | tail -20

echo "4. Копирование APK..."
if [ -f "app/build/outputs/apk/debug/app-debug.apk" ]; then
	cp app/build/outputs/apk/debug/app-debug.apk "$APK_OUTPUT"

	# Метаданные
	VERSION=$(git describe --tags --always 2>/dev/null || echo "build-$(date +%Y%m%d-%H%M%S)")
	FILESIZE=$(stat -c%s "$APK_OUTPUT")
	BUILDDATE=$(date -Iseconds)

	cat >"$OUTPUT_DIR/version.json" <<EOF
{
  "version": "$VERSION",
  "buildDate": "$BUILDDATE",
  "fileName": "osm-navigator.apk",
  "fileSize": $FILESIZE,
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

	# Обновляем versions.json - добавляем новую версию как latest
	VERSIONS_FILE="$OUTPUT_DIR/versions.json"
	TEMP_FILE=$(mktemp)

	# Формируем новую запись версии
	NEW_VERSION=$(
		cat <<EOF
{
    "id": "v-\$(date +%Y%m%d-%H%M%S)",
    "version_name": "v\$(echo $VERSION | head -c 8)",
    "version": "$VERSION",
    "build_number": \$(date +%Y%m%d%H%M%S),
    "build_date": "$BUILDDATE",
    "file_name": "osm-navigator.apk",
    "file_size": $FILESIZE,
    "channel": "stable",
    "description": "Автоматическая сборка навигатора",
    "features": [
      "Голосовые подсказки на русском",
      "Проекция на приборную панель",
      "Запись треков",
      "OSRM роутинг",
      "Камеры ГИБДД"
    ]
  }
EOF
	)

	# Если versions.json существует, читаем его, иначе создаём пустой массив
	if [ -f "$VERSIONS_FILE" ]; then
		# Сохраняем старые версии, добавляя новую в начало
		python3 -c "
import json
with open('$VERSIONS_FILE', 'r') as f:
    old_versions = json.load(f)

new_entry = json.loads('''$NEW_VERSION''')

# Убираем latest у старых версий
for v in old_versions:
    if 'is_latest' in v:
        del v['is_latest']

versions = [new_entry] + old_versions
with open('$TEMP_FILE', 'w') as f:
    json.dump(versions, f, ensure_ascii=False, indent=2)
"
		mv "$TEMP_FILE" "$VERSIONS_FILE"
	else
		echo "[$NEW_VERSION]" >"$VERSIONS_FILE"
	fi

	echo ""
	echo "=== Сборка завершена! ==="
	echo "APK: $APK_OUTPUT"
	echo "Размер: $(du -h "$APK_OUTPUT" | cut -f1)"
else
	echo "ОШИБКА: APK не найден после сборки"
	exit 1
fi

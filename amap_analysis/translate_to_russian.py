#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Русификатор для AmapAuto Navigation
Полная версия перевода
"""

import re

# Полная база переводов
TRANSLATIONS = {
    # === БАЗОВЫЕ КОМАНДЫ ===
    "Yes": "Да",
    "No": "Нет",
    "OK": "ОК",
    "Cancel": "Отмена",
    "Exit": "Выход",
    "Back": "Назад",
    "Next": "Далее",
    "Save": "Сохранить",
    "Delete": "Удалить",
    "Edit": "Изменить",
    "Add": "Добавить",
    "Search": "Поиск",
    "Settings": "Настройки",
    "Close": "Закрыть",
    "Done": "Готово",
    "Clear": "Очистить",
    "Confirm": "Подтвердить",
    "Reset": "Сброс",
    "Start": "Начать",
    "Stop": "Стоп",
    "Pause": "Пауза",
    "Resume": "Продолжить",
    
    # === НАВИГАЦИЯ ===
    "My Home": "Дом",
    "Addr": "Адрес",
    "Address": "Адрес",
    "Address Book": "Адресная книга",
    "Name": "Название",
    "Tel": "Тел",
    "Phone": "Телефон",
    "No Result": "Нет результатов",
    "No results found": "Ничего не найдено",
    "Country": "Страна",
    "State": "Область",
    "Province": "Область",
    "City": "Город",
    "District": "Район",
    "Street": "Улица",
    "Road": "Дорога",
    "House No": "Дом",
    "House Number": "Номер дома",
    "Location": "Местоположение",
    "Position": "Позиция",
    "Destination": "Пункт назначения",
    "Via Point": "Через",
    "Waypoint": "Точка маршрута",
    "Route": "Маршрут",
    "Navigate": "Навигация",
    "Navigation": "Навигация",
    "Guidance": "Ведение",
    "Recalculate": "Пересчёт",
    "Re calculating": "Пересчёт маршрута",
    
    # === НАВИГАЦИЯ 2 ===
    "Go": "В путь",
    "Start Navigation": "Начать навигацию",
    "Stop Navigation": "Остановить навигацию",
    "Simulate": "Симуляция",
    "Simulation": "Симуляция",
    "Cancel Route": "Отменить маршрут",
    "Route Plan": "Планирование маршрута",
    "Route Planning": "Планирование",
    "Trip": "Поездка",
    "Trip Computer": "Бортовой компьютер",
    
    # === ЕДИНИЦЫ ИЗМЕРЕНИЯ ===
    "km": "км",
    "kilometers": "километров",
    "kilometres": "километров",
    "m": "м",
    "meters": "метров",
    "metres": "метров",
    "ft": "фут",
    "feet": "футов",
    "h": "ч",
    "hour": "час",
    "hours": "часов",
    "min": "мин",
    "minute": "минута",
    "minutes": "минут",
    "s": "сек",
    "second": "секунда",
    "seconds": "секунд",
    "km/h": "км/ч",
    "mph": "миль/ч",
    "mi": "миль",
    "mile": "миля",
    "miles": "миль",
    "yd": "ярд",
    "yard": "ярд",
    "yards": "ярдов",
    
    # === НАСТРОЙКИ ===
    "On": "Вкл",
    "Off": "Выкл",
    "Enabled": "Включено",
    "Disabled": "Отключено",
    "Calibration": "Калибровка",
    "Calibrating": "Калибровка",
    "Volume": "Громкость",
    "Brightness": "Яркость",
    "Language": "Язык",
    "Display": "Дисплей",
    "Sound": "Звук",
    "Audio": "Аудио",
    "Map": "Карта",
    "System": "Система",
    "General": "Общие",
    "Advanced": "Дополнительно",
    "Expert": "Эксперт",
    "Options": "Параметры",
    "Parameter": "Параметр",
    "Configuration": "Конфигурация",
    "Config": "Настройка",
    
    # === О КАРТАХ ===
    "Map Data Version": "Версия карт",
    "Software Version": "Версия ПО",
    "Software Info": "О ПО",
    "OS Ver": "Версия ОС",
    "Product Model": "Модель",
    "Model": "Модель",
    "Shell Ver": "Версия оболочки",
    "S/N": "Серийный номер",
    "Hardware Version": "Версия железа",
    "Serial Number": "Серийный номер",
    "About": "О программе",
    "Info": "Информация",
    "Information": "Информация",
    
    # === АКТИВАЦИЯ ===
    "Status": "Статус",
    "Activated": "Активировано",
    "Activation": "Активация",
    "Activate": "Активировать",
    "Activating": "Активация",
    "Unactivated": "Не активировано",
    "Demo, 60 days' trial period": "Демо-режим, 60 дней",
    "Demo Mode": "Демо-режим",
    "Trial": "Пробный",
    "Enter Activation Code": "Введите код активации",
    "Activation Code": "Код активации",
    "Invalid activation code": "Неверный код активации",
    "Activation failure!": "Ошибка активации!",
    "An error occurred during activation. Error code: %d.": "Ошибка активации. Код: %d.",
    "Activate by SD card": "Активация с SD-карты",
    "SD Card": "SD-карта",
    
    # === GPS ===
    "GPS": "GPS",
    "Signal": "Сигнал",
    "No Signal": "Нет сигнала",
    "Signal Lost": "Сигнал потерян",
    "Signal Weak": "Слабый сигнал",
    "GPS Signal": "Сигнал GPS",
    "GPS Status": "Статус GPS",
    "Satellites": "Спутники",
    "Searching": "Поиск",
    "Searching GPS": "Поиск GPS",
    "Connected": "Подключено",
    "Disconnected": "Отключено",
    "Accuracy": "Точность",
    "Altitude": "Высота",
    "Speed": "Скорость",
    
    # === ВИД КАРТЫ ===
    "North Up": "Север вверх",
    "Track Up": "Движение вверх",
    "Heading Up": "Направление вверх",
    "3D View": "3D вид",
    "2D View": "2D вид",
    "2D/3D": "2D/3D",
    "Zoom In": "Приблизить",
    "Zoom Out": "Отдалить",
    "Zoom": "Масштаб",
    "Auto Zoom": "Автомасштаб",
    "Auto Day/Night": "Авто день/ночь",
    "Night Mode": "Ночной режим",
    "Day Mode": "Дневной режим",
    "Night": "Ночь",
    "Day": "День",
    
    # === ТИПЫ МАРШРУТА ===
    "Fastest": "Быстрый",
    "Quick": "Быстрый",
    "Shortest": "Короткий",
    "Short": "Короткий",
    "Economic": "Экономичный",
    "Economical": "Экономичный",
    "Eco": "Эко",
    "Balanced": "Сбалансированный",
    "Pedestrian": "Пешеходный",
    "Walking": "Пешком",
    "Walk": "Идти",
    "Bicycle": "Велосипед",
    "Bike": "Велосипед",
    "Motorcycle": "Мотоцикл",
    "Motorbike": "Мотоцикл",
    "Avoid highways": "Без автострад",
    "Avoid tolls": "Без платных",
    "Avoid ferries": "Без паромов",
    "Avoid": "Избегать",
    "Prefer": "Предпочитать",
    "Highways": "Автострады",
    "Toll road": "Платная дорога",
    "Toll": "Платная",
    "Ferry": "Паром",
    "Dirt road": "Грунтовая",
    
    # === ИНФО МАРШРУТА ===
    "Total Distance": "Общее расстояние",
    "Total Time": "Общее время",
    "Total": "Всего",
    "Distance": "Расстояние",
    "Time": "Время",
    "Remaining Distance": "Осталось",
    "Remaining Time": "Осталось",
    "Remaining": "Осталось",
    "Arrival Time": "Время прибытия",
    "ETA": "Прибытие",
    "Estimated Arrival": "Расчётное прибытие",
    "Departure Time": "Время отправления",
    "Drive": "В пути",
    "Driving": "В пути",
    "Driving Time": "Время в пути",
    "Fastest Route": "Быстрый маршрут",
    "Alternative Route": "Альтернативный",
    
    # === ПРЕДУПРЕЖДЕНИЯ ===
    "Speed Camera": "Камера",
    "Camera": "Камера",
    "Red Light": "Красный сигнал",
    "Traffic Camera": "Камера ГИБДД",
    "Average Speed": "Средняя скорость",
    "Speed Trap": "Камера",
    "Dangerous Zone": "Опасная зона",
    "Danger": "Опасность",
    "Accident": "Авария",
    "Road Work": "Ремонт дороги",
    "Road Works": "Ремонт",
    "Road Closed": "Дорога закрыта",
    "Closed": "Закрыто",
    "Traffic Jam": "Пробка",
    "Traffic": "Пробки",
    "Congestion": "Затор",
    "Slippery": "Скользкая",
    "Steep": "Крутой",
    "Steep Hill": "Крутой подъём",
    "Narrow": "Узкая",
    "Narrow Road": "Узкая дорога",
    "School Zone": "Школьная зона",
    "Hospital Zone": "Больничная зона",
    "Sharp Turn": "Резкий поворот",
    "U-turn": "Разворот",
    "Wildlife": "Животные",
    
    # === ГОЛОС ===
    "Voice": "Голос",
    "Voice Guide": "Голосовые подсказки",
    "Voice Navigation": "Голосовая навигация",
    "Guidance Voice": "Голос гида",
    "TTS": "Синтез речи",
    "Speech": "Речь",
    "Detailed": "Подробно",
    "Concise": "Кратко",
    "Pronunciation": "Произношение",
    
    # === ГОЛОСОВЫЕ КОМАНДЫ ===
    "Turn": "Поверните",
    "turn": "поверните",
    "left": "налево",
    "right": "направо",
    "slight left": "чуть налево",
    "slight right": "чуть направо",
    "sharp left": "резко налево",
    "sharp right": "резко направо",
    "slightly left": "немного налево",
    "slightly right": "немного направо",
    "keep left": "держитесь левее",
    "keep right": "держитесь правее",
    "u-turn": "разворот",
    "u turn": "разворот",
    "straight": "прямо",
    "continue": "продолжайте",
    "Continue": "Продолжайте",
    "Take exit": "Съезд",
    "exit": "съезд",
    "Enter": "Въезд",
    "enter": "въезд",
    "Merge": "Слияние",
    "merge": "слияние",
    "Keep": "Держитесь",
    "In": "через",
    "in": "через",
    "after": "после",
    "Then": "Затем",
    "then": "затем",
    "you are": "вы находитесь",
    "your": "ваш",
    "on your": "на вашем",
    "destination": "пункт назначения",
    "arrived": "вы прибыли",
    "you have arrived": "вы прибыли",
    "reached": "достигнуто",
    "The destination is": "Пункт назначения",
    "meters": "метров",
    "kilometer": "километр",
    "kilometers": "километра",
    "In the": "На",
    
    # === POI ===
    "POI": "Интересное место",
    "POI Search": "Поиск мест",
    "Nearby": "Поблизости",
    "Near": "Рядом",
    "Around": "Поблизости",
    "Restaurant": "Ресторан",
    "Restaurants": "Рестораны",
    "Hotel": "Гостиница",
    "Hotels": "Гостиницы",
    "Parking": "Парковка",
    "Parkings": "Парковки",
    "Gas Station": "АЗС",
    "Petrol Station": "АЗС",
    "Fuel Station": "АЗС",
    "ATM": "Банкомат",
    "Bank": "Банк",
    "Hospitals": "Больницы",
    "Hospital": "Больница",
    "Medical": "Медицина",
    "Clinic": "Клиника",
    "Doctor": "Врач",
    "Pharmacy": "Аптека",
    "Pharmacies": "Аптеки",
    "School": "Школа",
    "Schools": "Школы",
    "University": "Университет",
    "Shopping": "Магазины",
    "Shop": "Магазин",
    "Shops": "Магазины",
    "Mall": "Торговый центр",
    "Supermarket": "Супермаркет",
    "Police": "Полиция",
    "Police Station": "Полиция",
    "Post Office": "Почта",
    "Post": "Почта",
    "Cafe": "Кафе",
    "Fast Food": "Фастфуд",
    "Bar": "Бар",
    "Pub": "Паб",
    "Bakery": "Булочная",
    "Gym": "Спортзал",
    "Fitness": "Фитнес",
    "Beach": "Пляж",
    "Park": "Парк",
    "Museum": "Музей",
    "Cinema": "Кинотеатр",
    "Theater": "Театр",
    "Stadium": "Стадион",
    "Airport": "Аэропорт",
    "Train Station": "Вокзал",
    "Railway": "Вокзал",
    "Railway Station": "Вокзал",
    "Bus Station": "Автовокзал",
    "Bus Stop": "Остановка",
    "Metro": "Метро",
    "Subway": "Метро",
    "Ferry Terminal": "Паром",
    "Marina": "Яхт-клуб",
    "Charging Station": "Зарядка",
    "EV Charging": "Зарядка EV",
    
    # === ТИПЫ ДОРОГ ===
    "Highway": "Автострада",
    "Motorway": "Автобан",
    "Expressway": "Скоростная",
    "National": "Федеральная",
    "State Road": "Региональная",
    "Regional": "Региональная",
    "Local": "Местная",
    "Unpaved": "Грунтовая",
    "Paved": "Асфальт",
    "Freeway": "Скоростная",
    "Primary": "Главная",
    "Secondary": "Второстепенная",
    "Residential": "Жилая",
    "Service": "Сервисная",
    "Track": "Просёлок",
    
    # === ВРЕМЯ ===
    "AM": "утра",
    "PM": "вечера",
    "Today": "Сегодня",
    "Tomorrow": "Завтра",
    "Yesterday": "Вчера",
    "Morning": "Утро",
    "Morning": "Утром",
    "Afternoon": "День",
    "Evening": "Вечер",
    "Night": "Ночь",
    
    # === ИСТОРИЯ И ИЗБРАННОЕ ===
    "History": "История",
    "Recent": "Недавние",
    "Recent Destinations": "Недавние",
    "Favorites": "Избранное",
    "Favourite": "Избранное",
    "Favorite": "Избранное",
    "My Places": "Мои места",
    "Bookmarks": "Закладки",
    
    # === КООРДИНАТЫ ===
    "Coordinate": "Координаты",
    "Coordinates": "Координаты",
    "Latitude": "Широта",
    "Longitude": "Долгота",
    "Format": "Формат",
    "DD": "ГГ",
    "DMS": "ГМС",
    
    # === ПРОБКИ ===
    "Real-time": "Онлайн",
    "Live": "Онлайн",
    "Traffic Info": "Пробки",
    "Traffic Flow": "Дорожное движение",
    "TMC": "Пробки",
    
    # === РАЗНОЕ ===
    "Default Position": "Позиция по умолчанию",
    "Set as Home": "Установить как дом",
    "Set as Dest": "Установить как цель",
    "Set as Start": "Установить как старт",
    "Click here to search": "Нажмите для поиска",
    "Enter address": "Введите адрес",
    "Enter name": "Введите название",
    "Enter keyword": "Введите запрос",
    "Keyword": "Ключевое слово",
    "Category": "Категория",
    "Icon": "Иконка",
    "Remark": "Примечание",
    "Note": "Заметка",
    "Description": "Описание",
    
    # === ОШИБКИ ===
    "System failed, please restart.": "Системная ошибка. Перезапустите.",
    "Error": "Ошибка",
    "Warning": "Предупреждение",
    "Caution": "Внимание",
    "Attention": "Внимание",
    "Please wait": "Подождите",
    "Loading": "Загрузка",
    "Processing": "Обработка",
    "Calculating": "Расчёт",
    "Computing": "Расчёт",
    "Unable to compute": "Невозможно рассчитать",
    "Too close": "Слишком близко",
    "Too far": "Слишком далеко",
    "Please re-enter": "Введите заново",
    "Please add": "Пожалуйста, добавьте",
    "Invalid": "Неверно",
    "Valid": "Верно",
    "Success": "Успешно",
    "Failed": "Ошибка",
    "Complete": "Завершено",
    "Not available": "Недоступно",
    "Unavailable": "Недоступно",
    
    # === ДОПОЛНИТЕЛЬНЫЕ ===
    "km second(s) to start navigation.": "через %d сек. начало навигации.",
    "second(s) to start navigation.": "сек. до начала навигации.",
    "to start navigation.": "до начала навигации.",
    "The No.%d and No.%d destination are too close": "Пункты %d и %d слишком близко",
    "please re-enter.": "пожалуйста, введите заново.",
    "Unable to compute a suitable route": "Невозможно построить маршрут",
    "between the starting point and the destination.": "между началом и пунктом назначения.",
    "between the No.%d and the No.%d destination.": "между пунктами %d и %d.",
    "between the No.%d and the final destination.": "между пунктом %d и конечным.",
    "Can not find a suitable road around": "Не найдена дорога рядом с",
    "destination point": "пунктом назначения",
    "starting point": "начальной точкой",
    "This route has tolls.": "Маршрут содержит платные участки.",
    "This route includes a ferry.": "Маршрут включает паром.",
    "This route crosses a country border.": "Маршрут пересекает границу.",
    "This route crosses through multiple countries.": "Маршрут проходит через несколько стран.",
    "The map data has been updated": "Картографические данные обновлены",
    "Would you like to": "Хотите ли вы",
    "Input a waypoint.": "Введите точку маршрута.",
    "Please add a destination.": "Пожалуйста, добавьте пункт назначения.",
}

# Дополнительные паттерны для замены
PATTERNS = [
    # Числа
    (r'%d\s*second', '%d сек.'),
    (r'%s\s*seconds', '%s сек.'),
    (r'%s\s*km', '%s км'),
    (r'%s\s*meters', '%s м'),
    (r'%s\s*kilometers', '%s км'),
    (r'No\.%d', '№%d'),
    # Проценты
    (r'%d%%', '%d%%'),
    # Общие
    (r'\bThe\b', ''),
    (r'\ba\b', ''),
    (r'\ban\b', ''),
    (r'\band\b', 'и'),
    (r'\bor\b', 'или'),
    (r'\bto\b', ''),
    (r'\bfor\b', ''),
    (r'\bthe\b', ''),
    (r'\byour\b', 'ваш'),
]

def translate_text(text):
    """Перевод одной строки"""
    if not text:
        return ""
    
    # Проверяем точное совпадение
    if text in TRANSLATIONS:
        return TRANSLATIONS[text]
    
    # Проверяем без учёта регистра
    text_lower = text.lower()
    for eng, rus in TRANSLATIONS.items():
        if eng.lower() == text_lower:
            return rus
    
    # Пытаемся найти похожие фразы
    for eng, rus in TRANSLATIONS.items():
        if eng.lower() in text_lower:
            text = text.replace(eng, rus)
    
    return text

def smart_translate(text):
    """Умный перевод с паттернами"""
    result = text
    
    # Сначала полное совпадение
    if result in TRANSLATIONS:
        return TRANSLATIONS[result]
    
    # Паттерны
    for pattern, replacement in PATTERNS:
        result = re.sub(pattern, replacement, result, flags=re.IGNORECASE)
    
    # Частичные замены
    words = result.split()
    translated_words = []
    for word in words:
        clean_word = re.sub(r'[^\w]', '', word)
        if clean_word in TRANSLATIONS:
            translated_words.append(TRANSLATIONS[clean_word])
        else:
            translated_words.append(word)
    
    return ' '.join(translated_words)

def parse_lang_file(content):
    """Парсинг языкового файла"""
    lines = {}
    for line in content.split('\n'):
        line = line.strip()
        if not line:
            continue
        
        # Формат: ID=IDS_KEY,"Value"
        match = re.match(r'^(\d+)=([A-Z_]+),"?([^"]*)"?$', line)
        if match:
            id_num, key, value = match.groups()
            lines[id_num] = {'key': key, 'value': value}
    
    return lines

def generate_russian_file(eng_lines):
    """Генерация русского файла"""
    result_lines = []
    
    # Заголовок - кодовая страница UTF-8
    result_lines.append("65001")
    
    for id_num in sorted(eng_lines.keys(), key=int):
        entry = eng_lines[id_num]
        key = entry['key']
        eng_value = entry['value']
        
        # Переводим значение
        rus_value = translate_text(eng_value)
        
        # Если перевод совпадает с оригиналом, пробуем умный перевод
        if rus_value == eng_value:
            rus_value = smart_translate(eng_value)
        
        # Формируем строку
        result_lines.append(f'{id_num}={key},"{rus_value}"')
    
    return '\n'.join(result_lines)

# Читаем английский файл
with open('assets/Language/LangENG.dat', 'r', encoding='utf-8') as f:
    eng_content = f.read()

# Парсим
eng_lines = parse_lang_file(eng_content)
print(f"Найдено {len(eng_lines)} строк для перевода")

# Генерируем русский файл
rus_content = generate_russian_file(eng_lines)

# Сохраняем
with open('assets/Language/LangRUS_new.dat', 'w', encoding='utf-8') as f:
    f.write(rus_content)

print("Файл LangRUS_new.dat создан!")

# Подсчёт переводов
translated = 0
untranslated = 0
for line in eng_lines.values():
    eng = line['value']
    rus = translate_text(eng)
    if rus != eng:
        translated += 1
    else:
        untranslated += 1

print(f"Переведено: {translated}")
print(f"Не переведено: {untranslated}")

# Показываем примеры
print("\nПримеры переводов:")
count = 0
for id_num in sorted(eng_lines.keys(), key=int):
    eng = eng_lines[id_num]['value']
    rus = translate_text(eng)
    if eng != rus and count < 30:
        print(f"  [{id_num}] {eng} -> {rus}")
        count += 1

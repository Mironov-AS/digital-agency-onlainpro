#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Генератор российских дорожных шилдов для AmapAuto
Создаёт PNG-изображения для отображения на карте
"""

import os
from PIL import Image, ImageDraw, ImageFont

# Размеры шилдов (32x15 как в default_style.conf)
SHIELD_WIDTH = 64
SHIELD_HEIGHT = 30

# Цвета российских дорог
COLORS = {
    'M': (0, 100, 0),      # Тёмно-зелёный для федеральных
    'A': (0, 100, 200),    # Синий для региональных
    'P': (180, 60, 60),    # Красный для территориальных
    'K': (100, 100, 100),   # Серый для местных
}

def create_shield(number, road_type='M', filename=None):
    """Создание шилда дороги"""
    img = Image.new('RGBA', (SHIELD_WIDTH, SHIELD_HEIGHT), (255, 255, 255, 0))
    draw = ImageDraw.Draw(img)
    
    # Цвет фона в зависимости от типа дороги
    if road_type == 'M':
        # Федеральная трасса - зелёный фон
        bg_color = (0, 120, 50)
        text_color = (255, 255, 255)
    elif road_type == 'A':
        # Региональная - синий
        bg_color = (50, 100, 200)
        text_color = (255, 255, 255)
    elif road_type == 'P':
        # Территориальная - красный
        bg_color = (200, 50, 50)
        text_color = (255, 255, 255)
    else:
        # Местная - серый
        bg_color = (100, 100, 100)
        text_color = (255, 255, 255)
    
    # Рисуем прямоугольник с закруглёнными углами
    draw.rounded_rectangle(
        [(2, 2), (SHIELD_WIDTH - 2, SHIELD_HEIGHT - 2)],
        radius=4,
        fill=bg_color,
        outline=(255, 255, 255),
        width=1
    )
    
    # Текст номера
    # Используем встроенный шрифт
    try:
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 16)
    except:
        font = ImageFont.load_default()
    
    # Центрируем текст
    text = f"{road_type}{number}"
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    x = (SHIELD_WIDTH - text_width) // 2
    y = (SHIELD_HEIGHT - text_height) // 2 - 2
    
    draw.text((x, y), text, fill=text_color, font=font)
    
    if filename:
        img.save(filename)
        print(f"Создан: {filename}")
    
    return img

def create_shield_for_config(shield_id, road_num, road_type='M'):
    """Создание шилда с ID для конфига"""
    filename = f"assets/Image/RUS_{shield_id}.png"
    create_shield(road_num, road_type, filename)
    return filename

# Создаём папку для российских шилдов
os.makedirs('assets/Image', exist_ok=True)

# Создаём основные шилды для России
# ID из default_style.conf (регион RUS имеет свои ID)
shields_to_create = [
    # ID, Номер, Тип
    (1, '1', 'M'),      # М1 - трасса Москва-Минск
    (2, '2', 'M'),      # М2 - трасса Москва-Симферополь
    (3, '3', 'M'),      # М3 - трасса Москва-Киев
    (4, '4', 'M'),      # М4 - трасса Москва-Ростов
    (5, '5', 'M'),      # М5 - трасса Москва-Челябинск
    (6, '6', 'M'),      # М6 - трасса Москва-Волгоград
    (7, '7', 'M'),      # М7 - трасса Москва-Казань
    (8, '8', 'M'),      # М8 - трасса Москва-Архангельск
    (9, '9', 'M'),      # М9 - трасса Москва-Рига
    (10, '10', 'M'),    # М10 - трасса Москва-СПб
    (11, '11', 'M'),    # М11 - новый скоростной
    (100, '100', 'A'),  # А100
    (101, '101', 'A'),  # А101
    (102, '102', 'A'),  # А102
    (103, '103', 'A'),  # А103
    (104, '104', 'A'),  # А104
    (105, '105', 'A'),  # А105
    # Региональные
    (200, '200', 'P'),  # Р200
    (201, '201', 'P'),  # Р201
    (202, '202', 'P'),  # Р202
    (203, '203', 'P'),  # Р203
    (204, '204', 'P'),  # Р204
    (205, '205', 'P'),  # Р205
]

print("Создание российских шилдов...")
for shield_id, num, road_type in shields_to_create:
    create_shield(num, road_type, f"assets/Image/RUS_{shield_id}.png")

# Создаём универсальный шилд для неизвестных дорог
universal_shield = Image.new('RGBA', (SHIELD_WIDTH, SHIELD_HEIGHT), (255, 255, 255, 0))
draw = ImageDraw.Draw(universal_shield)
draw.rounded_rectangle([(2, 2), (SHIELD_WIDTH - 2, SHIELD_HEIGHT - 2)], radius=4, fill=(100, 100, 100))
try:
    font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 14)
except:
    font = ImageFont.load_default()
draw.text((8, 6), "RUS", fill=(255, 255, 255), font=font)
universal_shield.save("assets/Image/RUS_shield.png")
print("Создан: assets/Image/RUS_shield.png")

print("\nГотово! Создано", len(shields_to_create) + 1, "шилдов")

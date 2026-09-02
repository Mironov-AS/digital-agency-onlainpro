#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
ContractPro — рекламный буклет (PDF)
Uses fpdf2 + DejaVu fonts for full Cyrillic support.
"""

from fpdf import FPDF
from fpdf.enums import XPos, YPos
import os

FONT_DIR    = "/home/user/fonts"
FONT_REG    = os.path.join(FONT_DIR, "DejaVuSans.ttf")
FONT_BOLD   = os.path.join(FONT_DIR, "DejaVuSans-Bold.ttf")
OUTPUT_PATH = "/home/user/ContractPro_Buklet.pdf"

SCREEN_DIR  = "/home/user/screenshots/brochure"

# ── Palette ────────────────────────────────────────────────────────────────────
DARK_BLUE  = (26,  43,  74)
ACCENT     = (45, 107, 228)
LIGHT_BG   = (240, 244, 255)
TEXT_MAIN  = (30,  30,  46)
TEXT_MUTED = (90, 100, 128)
WHITE      = (255, 255, 255)
DIVIDER    = (197, 211, 240)
SHADOW     = (210, 215, 228)

# ── Content ────────────────────────────────────────────────────────────────────
SECTIONS = [
    {
        "heading": "О проекте: в двух словах",
        "paragraphs": [
            (
                "ContractPro — цифровая платформа для полного управления жизненным "
                "циклом контрактов в сфере B2B: от подписания и хранения документов "
                "до контроля исполнения обязательств, логистики и расчётов. Главная "
                "цель — собрать все процессы, связанные с контрактами, в едином "
                "пространстве и автоматизировать рутину."
            ),
            (
                "Платформа создана для предприятий-покупателей, поставщиков и "
                "логистических компаний, работающих с цепочками поставок и большими "
                "объёмами договорной документации."
            ),
        ],
        "bullets": [],
        "numbered": [],
    },
    {
        "heading": "Как это работает: бизнес\u2011логика и функционал",
        "paragraphs": [
            (
                "Система связывает контрагентов в единой среде: каждый контракт "
                "становится «точкой сборки», к которой привязываются заказы, "
                "поставки, платежи, счета и претензии. Встроенный ИИ-ассистент "
                "анализирует документы и отвечает на вопросы по условиям договоров "
                "в режиме реального времени."
            ),
        ],
        "bullets": [
            "Управление контрактами: создание, версионирование и хранение файлов",
            "Логистика: маршруты, накладные, геолокация поставок на карте",
            "Финансы: платежи, счета-фактуры, сверка взаиморасчётов",
            "Претензионная работа: регистрация, рассмотрение и закрытие споров",
        ],
        "numbered": [],
    },
    {
        "heading": "Что вы получаете: возможности",
        "paragraphs": [],
        "bullets": [],
        "numbered": [
            "Вы сможете хранить все договоры в одном месте и моментально находить нужный документ.",
            "Вы сможете отслеживать статус заказов и поставок в реальном времени без звонков контрагентам.",
            "Вы сможете автоматически сопоставлять платежи со счетами и видеть актуальный баланс по контракту.",
            "Вы сможете задавать ИИ-ассистенту вопросы о содержании договора и получать ответы за секунды.",
            "Вы сможете управлять правами команды с помощью гибких ролей и двухфакторной аутентификации.",
        ],
    },
    {
        "heading": "Почему стоит внедрить: ваши преимущества",
        "paragraphs": [],
        "bullets": [],
        "numbered": [],
        "checkmarks": [
            "Сокращение операционных задержек до 40 % за счёт автоматизации поиска документов и согласования статусов.",
            "Снижение числа ошибок при обработке платежей благодаря автоматической сверке данных.",
            "Полная прозрачность: каждое действие фиксируется в журнале аудита, что упрощает контроль и защищает от споров.",
            "Быстрый старт: интуитивный интерфейс на русском языке не требует длительного обучения.",
        ],
    },
]

# Screenshots for page 2 — overview (1 full-width + 2 side-by-side)
SCREENSHOTS_P2 = [
    {
        "path": os.path.join(SCREEN_DIR, "screen_home.jpg"),
        "caption": "Главная страница — выбор рабочего места",
    },
    {
        "path": os.path.join(SCREEN_DIR, "screen_dashboard.jpg"),
        "caption": "Dashboard — сводная аналитика",
    },
    {
        "path": os.path.join(SCREEN_DIR, "screen_contracts.jpg"),
        "caption": "Модуль «Договоры»",
    },
]

# Screenshots for page 3 — modules (2 rows × 3 columns)
SCREENSHOTS_P3 = [
    # row 1
    {"path": os.path.join(SCREEN_DIR, "screen_orders.jpg"),       "caption": "Заказы"},
    {"path": os.path.join(SCREEN_DIR, "screen_payments.jpg"),     "caption": "Финансы и платежи"},
    {"path": os.path.join(SCREEN_DIR, "screen_production.jpg"),   "caption": "Производство"},
    # row 2
    {"path": os.path.join(SCREEN_DIR, "screen_claims.jpg"),       "caption": "Рекламации"},
    {"path": os.path.join(SCREEN_DIR, "screen_shipments.jpg"),    "caption": "Отгрузки"},
    {"path": os.path.join(SCREEN_DIR, "screen_ai.jpg"),           "caption": "ИИ-ассистент"},
]

# Screenshots for page 4 — more modules (1 row × 3 columns)
SCREENSHOTS_P4 = [
    {"path": os.path.join(SCREEN_DIR, "screen_counterparties.jpg"), "caption": "Контрагенты"},
    {"path": os.path.join(SCREEN_DIR, "screen_waybills.jpg"),       "caption": "Путевые листы"},
    {"path": os.path.join(SCREEN_DIR, "screen_reports.jpg"),        "caption": "Отчёты"},
]


class Brochure(FPDF):

    def header(self):
        pass  # custom header drawn manually

    def footer(self):
        self.set_y(-15)
        self.set_font("DejaVu", size=8)
        self.set_text_color(*TEXT_MUTED)
        self.set_draw_color(*DARK_BLUE)
        self.set_line_width(0.5)
        self.line(self.l_margin, self.get_y() - 2, self.w - self.r_margin, self.get_y() - 2)
        self.set_y(-13)
        self.cell(
            0, 5,
            "ContractPro · Управляйте контрактами — не бумагами",
            align="C",
        )

    # ── helpers ────────────────────────────────────────────────────────────────

    def _write_paragraph(self, text: str, size: int = 10, indent: float = 0,
                          color=None, leading: float = 5.2):
        if color is None:
            color = TEXT_MAIN
        self.set_text_color(*color)
        self.set_font("DejaVu", size=size)
        if indent:
            self.set_x(self.l_margin + indent)
        self.multi_cell(
            w=0,
            h=leading,
            text=text,
            align="J",
            new_x=XPos.LMARGIN,
            new_y=YPos.NEXT,
        )
        self.ln(1.2)

    def _section_heading(self, text: str):
        self.ln(3)
        self.set_font("DejaVuBold", size=11)
        self.set_text_color(*ACCENT)
        self.multi_cell(
            0, 6, text,
            align="L",
            new_x=XPos.LMARGIN,
            new_y=YPos.NEXT,
        )
        # thin divider
        self.set_draw_color(*DIVIDER)
        self.set_line_width(0.5)
        y = self.get_y() + 1
        self.line(self.l_margin, y, self.w - self.r_margin, y)
        self.ln(2.5)

    def _bullet(self, text: str):
        self.set_font("DejaVu", size=10)
        self.set_text_color(*TEXT_MAIN)
        x0 = self.l_margin + 4
        self.set_x(x0)
        bullet_char = "\u2022"
        self.cell(5, 5.2, bullet_char)
        self.multi_cell(
            w=self.w - self.r_margin - x0 - 5,
            h=5.2,
            text=text,
            align="L",
            new_x=XPos.LMARGIN,
            new_y=YPos.NEXT,
        )
        self.ln(0.5)

    def _numbered(self, n: int, text: str):
        self.set_font("DejaVu", size=10)
        self.set_text_color(*TEXT_MAIN)
        x0 = self.l_margin + 4
        self.set_x(x0)
        self.cell(7, 5.2, f"{n}.")
        self.multi_cell(
            w=self.w - self.r_margin - x0 - 7,
            h=5.2,
            text=text,
            align="L",
            new_x=XPos.LMARGIN,
            new_y=YPos.NEXT,
        )
        self.ln(0.5)

    def _checkmark(self, text: str):
        self.set_font("DejaVu", size=10)
        self.set_text_color(*TEXT_MAIN)
        x0 = self.l_margin + 4
        self.set_x(x0)
        self.set_text_color(*ACCENT)
        self.cell(7, 5.2, "\u2713")
        self.set_text_color(*TEXT_MAIN)
        self.multi_cell(
            w=self.w - self.r_margin - x0 - 7,
            h=5.2,
            text=text,
            align="L",
            new_x=XPos.LMARGIN,
            new_y=YPos.NEXT,
        )
        self.ln(0.5)

    # ── cover banner ───────────────────────────────────────────────────────────

    def draw_cover(self):
        banner_h = 35
        self.set_fill_color(*DARK_BLUE)
        self.rect(0, 0, self.w, banner_h, style="F")

        # Product name
        self.set_y(8)
        self.set_font("DejaVuBold", size=28)
        self.set_text_color(*WHITE)
        self.cell(0, 10, "ContractPro", align="C", new_x=XPos.LMARGIN, new_y=YPos.NEXT)

        # Tagline
        self.set_font("DejaVu", size=12)
        self.set_text_color(184, 201, 240)
        self.cell(
            0, 7,
            "Платформа управления контрактами и цепочками поставок",
            align="C",
            new_x=XPos.LMARGIN,
            new_y=YPos.NEXT,
        )

        self.set_y(banner_h + 6)

    # ── screenshot helpers ─────────────────────────────────────────────────────

    def _image_with_frame(self, path: str, x: float, y: float, w: float):
        """Draw a thin shadow + border rectangle, then place the image."""
        # Image aspect ratio: 1280×800
        img_h = w * 800 / 1280

        # Drop shadow (offset 1mm)
        self.set_fill_color(*SHADOW)
        self.rect(x + 1, y + 1, w, img_h, style="F")

        # White background rectangle (same size as image)
        self.set_fill_color(*WHITE)
        self.set_draw_color(*DIVIDER)
        self.set_line_width(0.4)
        self.rect(x, y, w, img_h, style="FD")

        # Image
        if os.path.exists(path):
            self.image(path, x=x, y=y, w=w, h=img_h)

        return img_h

    def _caption(self, text: str, x: float, y: float, w: float):
        """Draw a small centred caption below a screenshot."""
        self.set_xy(x, y)
        self.set_font("DejaVu", size=8)
        self.set_text_color(*TEXT_MUTED)
        self.cell(w, 5, text, align="C")

    def _page_banner(self, title: str, subtitle: str, banner_h: int = 22):
        """Draw a compact dark banner at top of page."""
        self.set_fill_color(*DARK_BLUE)
        self.rect(0, 0, self.w, banner_h, style="F")
        self.set_y(4)
        self.set_font("DejaVuBold", size=16)
        self.set_text_color(*WHITE)
        self.cell(0, 7, title, align="C", new_x=XPos.LMARGIN, new_y=YPos.NEXT)
        self.set_font("DejaVu", size=9)
        self.set_text_color(184, 201, 240)
        self.cell(0, 5, subtitle, align="C", new_x=XPos.LMARGIN, new_y=YPos.NEXT)

    # ── page 2: interface overview ─────────────────────────────────────────────

    def draw_screenshots_page(self):
        self.add_page()
        self.set_auto_page_break(auto=False)

        banner_h = 22
        self._page_banner("ContractPro", "Интерфейс платформы: взгляд изнутри", banner_h)

        margin = self.l_margin          # 15 mm
        usable = self.w - 2 * margin    # 180 mm

        # Intro text
        y_intro = banner_h + 4
        self.set_xy(margin, y_intro)
        self.set_font("DejaVu", size=9)
        self.set_text_color(*TEXT_MUTED)
        self.multi_cell(
            w=usable, h=5,
            text=(
                "Чистый и интуитивный интерфейс на русском языке позволяет начать работу "
                "без длительного обучения. Ниже — реальные экраны системы ContractPro."
            ),
            align="J",
            new_x=XPos.LMARGIN, new_y=YPos.NEXT,
        )

        # Screenshot 1: full width (home page)
        y1     = banner_h + 17
        img1_w = usable
        img1_h = img1_w * 800 / 1280   # ~112.5 mm

        self._image_with_frame(SCREENSHOTS_P2[0]["path"], margin, y1, img1_w)
        self._caption(SCREENSHOTS_P2[0]["caption"], margin, y1 + img1_h + 1.5, img1_w)

        # Screenshots 2 & 3: side by side
        gap    = 5
        half_w = (usable - gap) / 2
        img2_h = half_w * 800 / 1280

        y2      = y1 + img1_h + 9
        x_left  = margin
        x_right = margin + half_w + gap

        self._image_with_frame(SCREENSHOTS_P2[1]["path"], x_left,  y2, half_w)
        self._image_with_frame(SCREENSHOTS_P2[2]["path"], x_right, y2, half_w)

        self._caption(SCREENSHOTS_P2[1]["caption"], x_left,  y2 + img2_h + 1.5, half_w)
        self._caption(SCREENSHOTS_P2[2]["caption"], x_right, y2 + img2_h + 1.5, half_w)

        self.set_auto_page_break(auto=True, margin=10)
        self.set_y(y2 + img2_h + 10)

    # ── page 3: module grid (2 rows × 3 cols) ─────────────────────────────────

    def draw_modules_page(self):
        self.add_page()
        self.set_auto_page_break(auto=False)

        banner_h = 22
        self._page_banner("Модули системы", "Основные рабочие модули ContractPro", banner_h)

        margin = self.l_margin
        usable = self.w - 2 * margin    # 180 mm
        gap    = 4
        col_w  = (usable - 2 * gap) / 3  # ~57.3 mm
        img_h  = col_w * 800 / 1280       # ~35.8 mm

        y_start = banner_h + 8

        for row in range(2):
            y = y_start + row * (img_h + 10)
            for col in range(3):
                idx  = row * 3 + col
                item = SCREENSHOTS_P3[idx]
                x    = margin + col * (col_w + gap)
                self._image_with_frame(item["path"], x, y, col_w)
                self._caption(item["caption"], x, y + img_h + 1.5, col_w)

        self.set_auto_page_break(auto=True, margin=10)

    # ── page 4: additional modules (1 row × 3 cols) ───────────────────────────

    def draw_extra_page(self):
        self.add_page()
        self.set_auto_page_break(auto=False)

        banner_h = 22
        self._page_banner("Дополнительные модули", "Контрагенты, логистика и аналитика", banner_h)

        margin = self.l_margin
        usable = self.w - 2 * margin
        gap    = 4
        col_w  = (usable - 2 * gap) / 3
        img_h  = col_w * 800 / 1280

        y = banner_h + 12

        for col, item in enumerate(SCREENSHOTS_P4):
            x = margin + col * (col_w + gap)
            self._image_with_frame(item["path"], x, y, col_w)
            self._caption(item["caption"], x, y + img_h + 1.5, col_w)

        # CTA block below screenshots
        y_cta = y + img_h + 20
        self.set_xy(margin, y_cta)
        self.set_fill_color(*LIGHT_BG)
        self.set_draw_color(*DIVIDER)
        self.set_line_width(0.4)
        cta_h = 38
        self.rect(margin, y_cta, usable, cta_h, style="FD")

        self.set_xy(margin + 5, y_cta + 5)
        self.set_font("DejaVuBold", size=13)
        self.set_text_color(*DARK_BLUE)
        self.cell(usable - 10, 8, "Готовы начать?", align="C",
                  new_x=XPos.LMARGIN, new_y=YPos.NEXT)

        self.set_x(margin + 5)
        self.set_font("DejaVu", size=9)
        self.set_text_color(*TEXT_MUTED)
        self.multi_cell(
            w=usable - 10, h=5,
            text=(
                "Свяжитесь с нами для демонстрации платформы или запроса тестового доступа. "
                "Команда ContractPro поможет настроить систему под ваши бизнес-процессы."
            ),
            align="C",
            new_x=XPos.LMARGIN, new_y=YPos.NEXT,
        )

        self.set_auto_page_break(auto=True, margin=10)

    # ── build ──────────────────────────────────────────────────────────────────

    def build(self):
        self.add_font("DejaVu",     fname=FONT_REG)
        self.add_font("DejaVuBold", fname=FONT_BOLD)

        # ── Page 1: text content ───────────────────────────────────────────────
        self.add_page()
        self.draw_cover()

        for sec in SECTIONS:
            self._section_heading(sec["heading"])

            for para in sec.get("paragraphs", []):
                self._write_paragraph(para)

            for item in sec.get("bullets", []):
                self._bullet(item)
            if sec.get("bullets"):
                self.ln(1)

            for i, item in enumerate(sec.get("numbered", []), 1):
                self._numbered(i, item)
            if sec.get("numbered"):
                self.ln(1)

            for item in sec.get("checkmarks", []):
                self._checkmark(item)
            if sec.get("checkmarks"):
                self.ln(1)

        # ── Page 2: interface overview ─────────────────────────────────────────
        self.draw_screenshots_page()

        # ── Page 3: main modules grid ─────────────────────────────────────────
        self.draw_modules_page()

        # ── Page 4: additional modules + CTA ──────────────────────────────────
        self.draw_extra_page()


def main():
    pdf = Brochure()
    pdf.build()
    pdf.output(OUTPUT_PATH)
    print(f"PDF сохранён: {OUTPUT_PATH}")


if __name__ == "__main__":
    main()

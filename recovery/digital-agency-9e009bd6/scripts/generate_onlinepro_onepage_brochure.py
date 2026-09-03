from pathlib import Path

from fpdf import FPDF
from fpdf.enums import XPos, YPos


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "marketing" / "onlinepro_onepage_brochure.pdf"
FONT_DIR = Path("/home/user/fonts")


class Brochure(FPDF):
    def __init__(self):
        super().__init__(orientation="P", unit="mm", format="A4")
        self.set_auto_page_break(False)
        self.set_margins(0, 0, 0)
        self.add_font("DejaVu", "", str(FONT_DIR / "DejaVuSans.ttf"))
        self.add_font("DejaVu", "B", str(FONT_DIR / "DejaVuSans-Bold.ttf"))
        self.set_font("DejaVu", "", 10)

    def rounded_rect(self, x, y, w, h, r=0, style=""):
        self.rect(x, y, w, h, style)

    def text_box(self, x, y, w, h, text, size=9, style="", color=(35, 45, 65), align="L", leading=4.2):
        self.set_xy(x, y)
        self.set_font("DejaVu", style, size)
        self.set_text_color(*color)
        self.multi_cell(w, leading, text, border=0, align=align, new_x=XPos.LEFT, new_y=YPos.NEXT, max_line_height=leading)

    def label(self, x, y, text, color=(18, 112, 188), fill=(232, 244, 255), size=8):
        self.set_fill_color(*fill)
        self.set_text_color(*color)
        self.set_font("DejaVu", "B", size)
        width = self.get_string_width(text) + 6
        self.rounded_rect(x, y, width, 6.5, 3.25, style="F")
        self.set_xy(x + 3, y + 1.3)
        self.cell(width - 6, 4, text)

    def section_title(self, x, y, text, color=(18, 40, 72)):
        self.set_text_color(*color)
        self.set_font("DejaVu", "B", 12)
        self.set_xy(x, y)
        self.cell(0, 6, text)

    def bullet(self, x, y, text, color=(35, 45, 65), accent=(21, 122, 203), size=8.4, width=82):
        self.set_fill_color(*accent)
        self.ellipse(x, y + 1.5, 2.4, 2.4, "F")
        self.text_box(x + 5, y, width, 8, text, size=size, color=color, leading=3.9)

    def product_card(self, x, y, w, h, title, body, accent):
        self.set_fill_color(255, 255, 255)
        self.set_draw_color(220, 229, 240)
        self.rounded_rect(x, y, w, h, 3, style="DF")
        self.set_fill_color(*accent)
        self.rounded_rect(x + 4, y + 4, 8, 8, 2, style="F")
        self.set_text_color(20, 38, 66)
        self.set_font("DejaVu", "B", 9.5)
        self.set_xy(x + 15, y + 4.3)
        self.cell(w - 19, 4, title)
        self.text_box(x + 4, y + 15, w - 8, h - 18, body, size=7.3, color=(70, 82, 102), leading=3.5)


def build():
    pdf = Brochure()
    pdf.add_page()

    # Background.
    pdf.set_fill_color(247, 250, 253)
    pdf.rect(0, 0, 210, 297, "F")

    # Header.
    pdf.set_fill_color(17, 39, 72)
    pdf.ellipse(13, 10, 10, 10, "F")
    pdf.set_text_color(255, 255, 255)
    pdf.set_font("DejaVu", "B", 9)
    pdf.set_xy(13, 12.7)
    pdf.cell(10, 4, "ОП", align="C")
    pdf.set_text_color(18, 40, 72)
    pdf.set_font("DejaVu", "B", 14)
    pdf.set_xy(27, 10.5)
    pdf.cell(60, 6, "ОнлайнПро.РФ")
    pdf.set_font("DejaVu", "", 8.2)
    pdf.set_text_color(87, 101, 124)
    pdf.set_xy(27, 17.3)
    pdf.cell(70, 4, "цифровое агентство для роста бизнеса")
    pdf.label(145, 12, "15+ лет в цифровых продуктах", fill=(232, 244, 255))

    # Hero.
    x, y, w, h = 10, 27, 190, 61
    pdf.set_fill_color(18, 55, 105)
    pdf.rounded_rect(x, y, w, h, 5, style="F")
    pdf.set_fill_color(27, 127, 207)
    pdf.rounded_rect(x + 122, y, 68, h, 5, style="F")
    pdf.set_fill_color(68, 190, 157)
    pdf.ellipse(x + 166, y + 8, 22, 22, "F")
    pdf.set_fill_color(255, 255, 255)
    pdf.ellipse(x + 151, y + 32, 28, 28, "F")
    pdf.set_text_color(255, 255, 255)
    pdf.set_font("DejaVu", "B", 21)
    pdf.set_xy(x + 9, y + 8)
    pdf.cell(112, 8, "Уберите хаос")
    pdf.set_xy(x + 9, y + 17)
    pdf.cell(112, 8, "из бизнеса")
    pdf.set_xy(x + 9, y + 26)
    pdf.cell(112, 8, "без сложных IT-слов")
    pdf.text_box(
        x + 9,
        y + 36,
        104,
        18,
        "Мы делаем понятные системы, которые помогают собственнику видеть продажи, клиентов, заказы, деньги и работу команды в одном месте.",
        size=8.4,
        color=(232, 242, 255),
        leading=3.8,
    )
    pdf.set_fill_color(255, 255, 255)
    pdf.rounded_rect(x + 9, y + 51, 68, 10, 5, style="F")
    pdf.set_text_color(18, 55, 105)
    pdf.set_font("DejaVu", "B", 8.8)
    pdf.set_xy(x + 15, y + 54)
    pdf.cell(56, 4, "Разберём вашу задачу")
    pdf.set_text_color(18, 55, 105)
    pdf.set_font("DejaVu", "B", 13)
    pdf.set_xy(x + 133, y + 17)
    pdf.multi_cell(47, 6, "Готовые продукты\n+ доработка\nпод вас", align="C")
    pdf.set_font("DejaVu", "", 8.2)
    pdf.set_xy(x + 132, y + 43)
    pdf.multi_cell(49, 4, "Можно начать быстро,\nа потом менять систему\nпод реальные процессы.", align="C")

    # Problem and promise.
    pdf.section_title(12, 96, "Что мы делаем простыми словами")
    pdf.bullet(13, 108, "Находим, где бизнес теряет время, деньги и клиентов: таблицы, ручной ввод, потерянные заявки, контроль “на словах”.", width=82)
    pdf.bullet(13, 122, "Собираем удобную систему: чтобы сотрудники работали быстрее, а собственник видел картину без ежедневных расспросов.", width=82)
    pdf.bullet(13, 136, "Внедряем ИИ там, где он реально помогает: отвечает по данным, заполняет документы, напоминает о рисках и просрочках.", width=82)

    pdf.set_fill_color(234, 248, 244)
    pdf.set_draw_color(188, 228, 216)
    pdf.rounded_rect(107, 98, 91, 50, 4, style="DF")
    pdf.section_title(114, 104, "Если готовое почти подходит")
    pdf.text_box(
        114,
        115,
        76,
        22,
        "Посмотрите наши продукты. Если вам нужно добавить отчёт, поменять форму, связать с сайтом, настроить роли или сделать “как у нас принято” — мы это доработаем.",
        size=8.7,
        color=(41, 66, 72),
        leading=4.1,
    )
    pdf.set_text_color(14, 107, 82)
    pdf.set_font("DejaVu", "B", 9)
    pdf.set_xy(114, 137)
    pdf.cell(72, 5, "Не подстраивайте бизнес под программу.")
    pdf.set_xy(114, 142)
    pdf.cell(72, 5, "Подстроим программу под бизнес.")

    # Products.
    pdf.section_title(12, 158, "Что можно посмотреть уже сейчас")
    pdf.product_card(
        12,
        170,
        90,
        29,
        "ERP Light",
        "Договоры, заказы, производство, отгрузки, финансы, рекламации и ИИ-помощник в одной облачной системе.",
        (27, 127, 207),
    )
    pdf.product_card(
        108,
        170,
        90,
        29,
        "CRM Light",
        "Клиентская база, услуги, сотрудники, история работ, понятная аналитика и связь с электронной записью.",
        (68, 190, 157),
    )
    pdf.product_card(
        12,
        204,
        90,
        29,
        "Электронная запись",
        "Клиент сам выбирает услугу и время по ссылке или QR-коду. Записи не теряются, администратор видит расписание.",
        (123, 92, 219),
    )
    pdf.product_card(
        108,
        204,
        90,
        29,
        "Электронная очередь",
        "Очередь по QR-коду, табло в зале, вызов клиентов и аналитика без терминалов, принтеров и сложного оборудования.",
        (238, 153, 50),
    )

    # AI and process.
    pdf.set_fill_color(18, 40, 72)
    pdf.rounded_rect(12, 242, 186, 28, 4, style="F")
    pdf.set_text_color(255, 255, 255)
    pdf.set_font("DejaVu", "B", 11)
    pdf.set_xy(20, 248)
    pdf.cell(70, 5, "Как начинается работа")
    pdf.text_box(
        20,
        256,
        99,
        10,
        "Вы рассказываете задачу обычными словами. Мы показываем подходящий продукт или предлагаем простой план: что сделать сначала, какую пользу это даст и как быстро запустить.",
        size=7.4,
        color=(226, 235, 248),
        leading=3.35,
    )
    pdf.set_fill_color(255, 255, 255)
    pdf.rounded_rect(132, 249, 54, 13, 6.5, style="F")
    pdf.set_text_color(18, 40, 72)
    pdf.set_font("DejaVu", "B", 8.4)
    pdf.set_xy(139, 253.3)
    pdf.cell(40, 4, "Без лишней бюрократии")

    # Footer CTA.
    pdf.set_text_color(18, 40, 72)
    pdf.set_font("DejaVu", "B", 15)
    pdf.set_xy(12, 277)
    pdf.cell(100, 6, "Напишите или позвоните нам")
    pdf.set_font("DejaVu", "", 8.4)
    pdf.set_text_color(73, 88, 110)
    pdf.text_box(
        12,
        285,
        105,
        8,
        "Покажем продукты, обсудим вашу задачу и подскажем самый короткий путь к порядку.",
        size=7.7,
        color=(73, 88, 110),
        leading=3.5,
    )
    pdf.set_font("DejaVu", "B", 9.2)
    pdf.set_text_color(18, 112, 188)
    pdf.set_xy(123, 277)
    pdf.cell(74, 5, "+7 (916) 158 68 26", align="R")
    pdf.set_xy(123, 284)
    pdf.cell(74, 5, "Andrey.OnlinePro@yandex.ru", align="R")
    pdf.set_xy(123, 291)
    pdf.cell(74, 5, "онлайнпро.рф", align="R")

    OUT.parent.mkdir(parents=True, exist_ok=True)
    pdf.output(str(OUT))
    print(OUT)


if __name__ == "__main__":
    build()

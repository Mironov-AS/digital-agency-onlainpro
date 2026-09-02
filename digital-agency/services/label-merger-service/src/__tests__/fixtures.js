/**
 * Synthetic Ozon-like PDF fixtures for tests.
 * Generates assembly lists and tickets on the fly so tests do not depend on
 * real user documents and never commit sensitive data.
 */
const fs = require("fs");
const { PDFDocument } = require("pdf-lib");
const fontkit = require("@pdf-lib/fontkit");

const FONT_REGULAR =
	"/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf";
const FONT_BOLD =
	"/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf";

function findFont(paths) {
	for (const p of paths) {
		if (fs.existsSync(p)) return p;
	}
	throw new Error(`Font not found. Searched paths: ${paths.join(", ")}`);
}

const REGULAR_PATH = findFont([
	FONT_REGULAR,
	"/usr/share/fonts/liberation/LiberationSans-Regular.ttf",
]);
const BOLD_PATH = findFont([
	FONT_BOLD,
	"/usr/share/fonts/liberation/LiberationSans-Bold.ttf",
]);

const FIXTURE_ITEMS = [
	{
		orderId: "12345-678-9000001",
		name: "Тестовый диван MONOFIX ОДОС, принт Лимон, микровелюр",
		article: "ODOS-LEMON",
		qty: 1,
		labelNum: "5151",
	},
	{
		orderId: "12345-678-9000002",
		name: "Диван ЮНТА лофт металлический, экокожа черный",
		article: "DV-YUNTA-1",
		qty: 1,
		labelNum: "4388",
	},
	{
		orderId: "12345-678-9000003",
		name: "Тестовый стул БУНО, экокожа, черный, 110х67х73 см",
		article: "MN73_1",
		qty: 2,
		labelNum: "0260",
	},
];

async function createAssemblyListPdf() {
	const doc = await PDFDocument.create();
	doc.registerFontkit(fontkit);
	const font = await doc.embedFont(fs.readFileSync(REGULAR_PATH));
	const bold = await doc.embedFont(fs.readFileSync(BOLD_PATH));

	const page = doc.addPage([595, 842]);
	let y = 800;

	page.drawText("Лист подбора Ozon", { x: 50, y, size: 16, font: bold });
	y -= 35;

	// Table header
	page.drawText("Номер отправления", { x: 45, y, size: 10, font: bold });
	page.drawText("Товар", { x: 190, y, size: 10, font: bold });
	page.drawText("Артикул", { x: 402, y, size: 10, font: bold });
	page.drawText("Кол-во", { x: 488, y, size: 10, font: bold });
	page.drawText("Этикетка", { x: 545, y, size: 10, font: bold });
	y -= 25;

	for (let i = 0; i < FIXTURE_ITEMS.length; i++) {
		const item = FIXTURE_ITEMS[i];
		const rowY = y - i * 50;

		page.drawText(item.orderId, { x: 45, y: rowY, size: 10, font });
		page.drawText(item.name, { x: 190, y: rowY, size: 9, font });
		page.drawText(item.article, { x: 402, y: rowY, size: 10, font });
		page.drawText(String(item.qty), { x: 492, y: rowY, size: 10, font });
		page.drawText(item.labelNum, { x: 545, y: rowY, size: 10, font });
	}

	return Buffer.from(await doc.save());
}

function drawVerticalTextBottomUp(page, text, x, startY, fontSize, font) {
	for (let i = 0; i < text.length; i++) {
		page.drawText(text[i], {
			x,
			y: startY + i * (fontSize + 1),
			size: fontSize,
			font,
		});
	}
}

function drawVerticalTextTopDown(page, text, x, startY, fontSize, font) {
	for (let i = 0; i < text.length; i++) {
		page.drawText(text[i], {
			x,
			y: startY - i * (fontSize + 1),
			size: fontSize,
			font,
		});
	}
}

async function createTicketsPdf() {
	const doc = await PDFDocument.create();
	doc.registerFontkit(fontkit);
	const font = await doc.embedFont(fs.readFileSync(REGULAR_PATH));
	const bold = await doc.embedFont(fs.readFileSync(BOLD_PATH));

	for (const item of FIXTURE_ITEMS) {
		// Реальные Ozon-этикетки приходят в портретной ориентации 40×58 мм,
		// причём QR-код и номер заказа повёрнуты на 90° по часовой.
		const page = doc.addPage([113, 164]); // 40x58 mm
		// Пишем вертикально снизу вверх, чтобы после поворота влево на 90°
		// текст стал горизонтальным и читался слева направо.
		drawVerticalTextBottomUp(page, "Ozon", 15, 20, 12, bold);
		drawVerticalTextBottomUp(page, item.orderId, 45, 20, 6, font);
		page.drawText("[QR]", { x: 75, y: 70, size: 8, font });
		page.drawText("Доставка Ozon", { x: 10, y: 145, size: 7, font });
	}

	return Buffer.from(await doc.save());
}

async function createLandscapeTicketsPdf() {
	const doc = await PDFDocument.create();
	doc.registerFontkit(fontkit);
	const font = await doc.embedFont(fs.readFileSync(REGULAR_PATH));
	const bold = await doc.embedFont(fs.readFileSync(BOLD_PATH));

	for (const item of FIXTURE_ITEMS) {
		// Ozon-PDF с landscape-страницей 58×40 мм рисует текст сверху вниз.
		// При rotate=+90° содержимое становится горизонтальным.
		const page = doc.addPage([164, 113]); // 58x40 mm
		drawVerticalTextTopDown(page, "Ozon", 20, 90, 12, bold);
		// Номер заказа горизонтально — matchTickets ищет его.
		page.drawText(item.orderId, { x: 55, y: 20, size: 6, font });
		page.drawText("[QR]", { x: 100, y: 60, size: 8, font });
		page.drawText("Доставка Ozon", { x: 75, y: 15, size: 7, font });
	}

	return Buffer.from(await doc.save());
}

async function createEmptyTicketsPdf() {
	const doc = await PDFDocument.create();
	doc.registerFontkit(fontkit);
	const font = await doc.embedFont(fs.readFileSync(REGULAR_PATH));

	for (let i = 0; i < 2; i++) {
		const page = doc.addPage([164, 113]);
		page.drawText("Ozon", { x: 10, y: 90, size: 12, font });
		page.drawText("No order", { x: 10, y: 60, size: 8, font });
	}

	return Buffer.from(await doc.save());
}

async function createEmptyAssemblyPdf() {
	const doc = await PDFDocument.create();
	doc.addPage([595, 842]);
	return Buffer.from(await doc.save());
}

module.exports = {
	FIXTURE_ITEMS,
	createAssemblyListPdf,
	createTicketsPdf,
	createLandscapeTicketsPdf,
	createEmptyTicketsPdf,
	createEmptyAssemblyPdf,
};

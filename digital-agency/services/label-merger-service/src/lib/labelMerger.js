const fs = require("fs");
const { PDFDocument, rgb, degrees } = require("pdf-lib");
const fontkit = require("@pdf-lib/fontkit");
const pdfjsLib = require("pdfjs-dist/legacy/build/pdf.mjs");

const ASSEMBLY_ORDER_PATTERN = /^\d{5,}-\d{3,}-\d+$/;

class UserInputError extends Error {
	constructor(message) {
		super(message);
		this.status = 400;
		this.isUserInputError = true;
	}
}

const LABEL_WIDTH_PT = (120 * 72) / 25.4;
const LABEL_HEIGHT_PT = (75 * 72) / 25.4;

function findFont(paths) {
	for (const p of paths) {
		if (fs.existsSync(p)) return p;
	}
	throw new Error(`Font not found. Searched paths: ${paths.join(", ")}`);
}

const FONT_REGULAR = findFont([
	"/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
	"/usr/share/fonts/liberation/LiberationSans-Regular.ttf",
	"/usr/share/fonts/truetype/liberation-sans/LiberationSans-Regular.ttf",
]);

const FONT_BOLD = findFont([
	"/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
	"/usr/share/fonts/liberation/LiberationSans-Bold.ttf",
	"/usr/share/fonts/truetype/liberation-sans/LiberationSans-Bold.ttf",
]);

async function loadPdfDocument(pdfPathOrBuffer) {
	const buffer = Buffer.isBuffer(pdfPathOrBuffer)
		? pdfPathOrBuffer
		: fs.readFileSync(pdfPathOrBuffer);
	const data = new Uint8Array(buffer);
	return pdfjsLib.getDocument({ data }).promise;
}

const COLUMN_RANGES = {
	orderId: { minX: 0, maxX: 140 },
	name: { minX: 140, maxX: 390 },
	article: { minX: 390, maxX: 470 },
	qty: { minX: 470, maxX: 510 },
	labelNum: { minX: 510, maxX: 600 },
};

function groupByLine(items, tolerance = 3) {
	if (items.length === 0) return [];
	const sorted = [...items].sort((a, b) => b.y - a.y || a.x - b.x);
	const lines = [];
	let currentLine = [sorted[0]];
	for (let i = 1; i < sorted.length; i++) {
		const item = sorted[i];
		const last = currentLine[currentLine.length - 1];
		if (Math.abs(last.y - item.y) <= tolerance) {
			currentLine.push(item);
		} else {
			lines.push(currentLine);
			currentLine = [item];
		}
	}
	lines.push(currentLine);
	return lines;
}

async function extractPageItems(pdfDocument, pageNumber) {
	const page = await pdfDocument.getPage(pageNumber);
	const textContent = await page.getTextContent();
	return textContent.items
		.map((item) => ({
			str: item.str.trim(),
			x: item.transform[4],
			y: item.transform[5],
		}))
		.filter((item) => item.str);
}

async function parseAssemblyList(pdfPath) {
	const doc = await loadPdfDocument(pdfPath);
	const allItems = [];
	for (let i = 1; i <= doc.numPages; i++) {
		const items = await extractPageItems(doc, i);
		allItems.push(...items);
	}

	// Группируем элементы по строкам (один Y с допуском)
	const lines = groupByLine(allItems);

	// Находим строки, содержащие номер отправления
	const orderRows = [];
	for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
		const line = lines[lineIdx];
		const orderCandidate = line.find(
			(item) =>
				item.x >= COLUMN_RANGES.orderId.minX &&
				item.x < COLUMN_RANGES.orderId.maxX &&
				ASSEMBLY_ORDER_PATTERN.test(item.str),
		);
		if (orderCandidate) {
			orderRows.push({
				lineIdx,
				y: orderCandidate.y,
				orderId: orderCandidate.str,
			});
		}
	}

	// Вычисляем среднее расстояние между строками заказов для определения диапазонов
	let avgRowGap = 40;
	if (orderRows.length > 1) {
		let totalGap = 0;
		for (let i = 1; i < orderRows.length; i++) {
			totalGap += orderRows[i - 1].y - orderRows[i].y;
		}
		avgRowGap = totalGap / (orderRows.length - 1);
	}

	const items = [];
	for (let rowIdx = 0; rowIdx < orderRows.length; rowIdx++) {
		const row = orderRows[rowIdx];
		const nextRow = orderRows[rowIdx + 1];
		const prevRow = orderRows[rowIdx - 1];

		// Определяем вертикальный диапазон строк, относящихся к этому товару.
		// Для первого ряда берём половину среднего расстояния вверх,
		// для остальных — середину между текущим и предыдущим заказом.
		const upperY = prevRow ? (row.y + prevRow.y) / 2 : row.y + avgRowGap / 2;
		const lowerY = nextRow ? (row.y + nextRow.y) / 2 : row.y - avgRowGap / 2;

		// Собираем все элементы из колонки "Товар" в пределах диапазона
		const nameItems = allItems.filter(
			(item) =>
				item.y <= upperY &&
				item.y >= lowerY &&
				item.x >= COLUMN_RANGES.name.minX &&
				item.x < COLUMN_RANGES.name.maxX,
		);
		nameItems.sort((a, b) => b.y - a.y || a.x - b.x);
		const name = nameItems.map((i) => i.str).join(" ");

		// Артикул берём из колонки артикул в той же строке
		const rowLine = lines[row.lineIdx];
		const articleItem = rowLine.find(
			(item) =>
				item.x >= COLUMN_RANGES.article.minX &&
				item.x < COLUMN_RANGES.article.maxX,
		);
		const article = articleItem ? articleItem.str : "";

		const qtyItem = rowLine.find(
			(item) =>
				item.x >= COLUMN_RANGES.qty.minX &&
				item.x < COLUMN_RANGES.qty.maxX &&
				/^\d+$/.test(item.str),
		);
		const qty = qtyItem ? qtyItem.str : "";

		const labelItem = rowLine.find(
			(item) =>
				item.x >= COLUMN_RANGES.labelNum.minX &&
				item.x < COLUMN_RANGES.labelNum.maxX,
		);
		const labelNum = labelItem ? labelItem.str : "";

		items.push({
			orderId: row.orderId,
			name,
			article,
			qty,
			labelNum,
		});
	}

	if (items.length === 0) {
		throw new UserInputError(
			"Не удалось распознать таблицу в листе подбора. Убедитесь, что файл является листом подбора Ozon.",
		);
	}
	return items;
}

function normalizeOrderId(text) {
	return text.replace(/[^\d-]/g, "");
}

async function matchTickets(ticketsPath, assemblyItems) {
	const doc = await loadPdfDocument(ticketsPath);
	const matches = [];

	for (let pageIdx = 0; pageIdx < doc.numPages; pageIdx++) {
		const page = await doc.getPage(pageIdx + 1);
		const textContent = await page.getTextContent();
		const text = textContent.items.map((item) => item.str).join(" ");
		const clean = normalizeOrderId(text);

		let matchedItem = null;
		for (const item of assemblyItems) {
			const orderIdClean = normalizeOrderId(item.orderId);
			if (orderIdClean && clean.includes(orderIdClean)) {
				matchedItem = item;
				break;
			}
		}

		if (matchedItem) {
			matches.push({
				page: pageIdx,
				orderId: matchedItem.orderId,
				article: matchedItem.article,
				name: matchedItem.name,
				matched: true,
			});
		} else {
			matches.push({
				page: pageIdx,
				orderId: null,
				article: null,
				name: null,
				matched: false,
			});
		}
	}

	if (matches.every((m) => !m.matched)) {
		throw new UserInputError(
			"Не удалось сопоставить ни одну этикетку с листом подбора. Проверьте, что номера заказов в обоих файлах совпадают.",
		);
	}
	return matches;
}

function wrapTextToLines(text, font, fontSize, maxWidth) {
	const words = text.split(/\s+/).filter(Boolean);
	const lines = [];
	let current = "";
	for (const word of words) {
		const trial = current ? `${current} ${word}` : word;
		if (font.widthOfTextAtSize(trial, fontSize) <= maxWidth) {
			current = trial;
		} else {
			if (current) lines.push(current);
			current = word;
		}
	}
	if (current) lines.push(current);
	return lines;
}

/**
 * Сливает PDF этикеток с данными из листа подбора.
 * @param {Buffer|Uint8Array} ticketsBuffer - буфер PDF с оригинальными этикетками
 * @param {Array} matches - результат matchTickets (массив {page, orderId, article, name, matched})
 */
async function mergeLabels(ticketsBuffer, matches) {
	const srcDoc = await PDFDocument.load(ticketsBuffer);
	const outDoc = await PDFDocument.create();
	outDoc.registerFontkit(fontkit);

	const fontRegular = await outDoc.embedFont(fs.readFileSync(FONT_REGULAR));
	const fontBold = await outDoc.embedFont(fs.readFileSync(FONT_BOLD));

	const margin = 8;

	for (const match of matches) {
		if (!match.matched) continue;

		const newPage = outDoc.addPage([LABEL_WIDTH_PT, LABEL_HEIGHT_PT]);
		const srcPage = srcDoc.getPages()[match.page];
		const srcRect = srcPage.getSize();

		// Сбрасываем /Rotate у страницы-источника, чтобы embedPage создал
		// XObject БЕЗ встроенного поворота страницы. Иначе реальные Ozon-PDF
		// с /Rotate=270 дают перевёрнутое на 180° содержимое после нашего -90°.
		srcPage.setRotation(degrees(0));

		// Встраиваем исходную этикетку слева, сохраняя горизонтальную
		// ориентацию и пропорции. Максимальная ширина — стандартная
		// Ozon-этикетка 58×40 мм.
		const embeddedPage = await outDoc.embedPage(srcPage);
		const maxTicketW = (58 * 72) / 25.4;
		const maxTicketH = LABEL_HEIGHT_PT - 2 * margin;

		// Ozon-этикетки имеют размер 40×58 мм. Независимо от того, сохранена
		// ли страница PDF как портрет (40×58) или landscape (58×40), содержимое
		// повёрнуто на 90° по часовой относительно горизонтали. Определяем
		// этикетку по соотношению сторон и поворачиваем влево на 90°,
		// чтобы весь текст на итоговой этикетке 120×75 мм был горизонтальным.
		// При этом физические размеры этикетки сохраняются (40×58 мм).
		const aspectRatio = srcRect.width / srcRect.height;
		const needsRotation = aspectRatio < 0.8 || aspectRatio > 1.25;
		const longSide = Math.max(srcRect.width, srcRect.height);
		const shortSide = Math.min(srcRect.width, srcRect.height);
		const scale = needsRotation
			? Math.min(maxTicketW / longSide, maxTicketH / shortSide)
			: Math.min(maxTicketW / srcRect.width, maxTicketH / srcRect.height);

		// Визуальные размеры встроенной этикетки на итоговой странице.
		// Для rotate=+90° drawPage получает размеры ДО поворота, поэтому
		// ticketW — это высота исходной страницы, а ticketH — ширина.
		// После поворота визуальная ширина = ticketH, визуальная высота = ticketW.
		const ticketW = needsRotation ? longSide * scale : srcRect.width * scale;
		const ticketH = needsRotation ? shortSide * scale : srcRect.height * scale;

		const targetX = margin;
		const targetY = (LABEL_HEIGHT_PT - ticketH) / 2;

		const drawOptions = {
			x: targetX,
			y: targetY,
			width: ticketW,
			height: ticketH,
		};
		if (needsRotation) {
			// x = targetX + ticketH сдвигает точку вращения вправо ровно на
			// визуальную ширину повёрнутой этикетки. Левый край встроенной
			// этикетки оказывается на x = targetX (левый край итоговой этикетки).
			drawOptions.x = targetX + ticketH;
			drawOptions.rotate = degrees(90);
		}
		newPage.drawPage(embeddedPage, drawOptions);

		const textX = targetX + (needsRotation ? ticketH : ticketW) + margin;
		const textW = LABEL_WIDTH_PT - textX - margin;
		const textH = LABEL_HEIGHT_PT - 2 * margin;

		if (textW > 0) {
			const articleLabel = `Артикул: ${match.article}`;
			const name = match.name;

			let fontSize = 8;
			let lineH = fontSize * 1.3;
			let nameLines = wrapTextToLines(name, fontRegular, fontSize, textW);
			for (let candidateFs = 24; candidateFs >= 8; candidateFs--) {
				const candidateLineH = candidateFs * 1.3;
				const candidateNameLines = wrapTextToLines(
					name,
					fontRegular,
					candidateFs,
					textW,
				);
				const totalLines = 1 + candidateNameLines.length;
				if (fontBold.widthOfTextAtSize(articleLabel, candidateFs) > textW)
					continue;
				if (totalLines * candidateLineH <= textH) {
					fontSize = candidateFs;
					lineH = candidateLineH;
					nameLines = candidateNameLines;
					break;
				}
			}

			let currentY = margin + fontSize;
			newPage.drawText(articleLabel, {
				x: textX,
				y: LABEL_HEIGHT_PT - currentY,
				size: fontSize,
				font: fontBold,
				color: rgb(0, 0, 0),
			});
			currentY += lineH;

			for (const line of nameLines) {
				newPage.drawText(line, {
					x: textX,
					y: LABEL_HEIGHT_PT - currentY,
					size: fontSize,
					font: fontRegular,
					color: rgb(0, 0, 0),
				});
				currentY += lineH;
			}
		}
	}

	const output = await outDoc.save();
	return Buffer.from(output);
}

module.exports = {
	parseAssemblyList,
	matchTickets,
	mergeLabels,
	UserInputError,
};

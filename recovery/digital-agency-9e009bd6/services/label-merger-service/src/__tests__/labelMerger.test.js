/**
 * Integration tests for labelMerger with synthetic Ozon-like PDF fixtures.
 * Uses Node.js built-in test runner.
 */
const { describe, it } = require("node:test");
const assert = require("node:assert");
const { PDFDocument } = require("pdf-lib");
const pdfjsLib = require("pdfjs-dist/legacy/build/pdf.mjs");
const {
	parseAssemblyList,
	matchTickets,
	mergeLabels,
} = require("../lib/labelMerger");
const {
	FIXTURE_ITEMS,
	createAssemblyListPdf,
	createTicketsPdf,
	createLandscapeTicketsPdf,
	createEmptyTicketsPdf,
	createEmptyAssemblyPdf,
} = require("./fixtures");

async function getPageTextItems(buffer, pageNumber) {
	const doc = await pdfjsLib.getDocument({ data: new Uint8Array(buffer) })
		.promise;
	const page = await doc.getPage(pageNumber);
	const textContent = await page.getTextContent();
	return textContent.items.map((item) => ({
		str: item.str,
		x: item.transform[4],
		y: item.transform[5],
	}));
}

describe("parseAssemblyList", () => {
	it("parses all items from the assembly list", async () => {
		const assemblyBuffer = await createAssemblyListPdf();
		const items = await parseAssemblyList(assemblyBuffer);
		assert.strictEqual(items.length, FIXTURE_ITEMS.length);
	});

	it("extracts order ids and articles", async () => {
		const assemblyBuffer = await createAssemblyListPdf();
		const items = await parseAssemblyList(assemblyBuffer);
		const expectedOrderIds = FIXTURE_ITEMS.map((i) => i.orderId);
		for (const id of expectedOrderIds) {
			assert.ok(items.some((i) => i.orderId === id));
		}
	});

	it("extracts product names", async () => {
		const assemblyBuffer = await createAssemblyListPdf();
		const items = await parseAssemblyList(assemblyBuffer);
		const first = items.find((i) => i.orderId === FIXTURE_ITEMS[0].orderId);
		assert.ok(first.name.length > 10, "Expected name, got: " + first.name);
		assert.ok(
			first.name.toLowerCase().includes("диван"),
			"Expected 'диван' in name, got: " + first.name,
		);
	});

	it("throws when assembly list is empty or unreadable", async () => {
		const emptyBuffer = await createEmptyAssemblyPdf();
		await assert.rejects(
			async () => await parseAssemblyList(emptyBuffer),
			/Не удалось распознать таблицу/,
		);
	});
});

describe("matchTickets", () => {
	it("matches all tickets to assembly items", async () => {
		const assemblyBuffer = await createAssemblyListPdf();
		const ticketsBuffer = await createTicketsPdf();
		const assemblyItems = await parseAssemblyList(assemblyBuffer);
		const matches = await matchTickets(ticketsBuffer, assemblyItems);
		assert.strictEqual(matches.length, FIXTURE_ITEMS.length);
		assert.strictEqual(
			matches.filter((m) => m.matched).length,
			FIXTURE_ITEMS.length,
		);
	});

	it("throws when no tickets match", async () => {
		const assemblyBuffer = await createAssemblyListPdf();
		const emptyTicketsBuffer = await createEmptyTicketsPdf();
		const assemblyItems = await parseAssemblyList(assemblyBuffer);
		await assert.rejects(
			async () => await matchTickets(emptyTicketsBuffer, assemblyItems),
			/Не удалось сопоставить/,
		);
	});
});

describe("mergeLabels", () => {
	it("produces a valid merged PDF", async () => {
		const assemblyBuffer = await createAssemblyListPdf();
		const ticketsBuffer = await createTicketsPdf();
		const assemblyItems = await parseAssemblyList(assemblyBuffer);
		const matches = await matchTickets(ticketsBuffer, assemblyItems);

		const output = await mergeLabels(ticketsBuffer, matches);
		assert.ok(Buffer.isBuffer(output));
		assert.ok(output.length > 10000, "Expected non-trivial PDF size");

		const merged = await PDFDocument.load(output);
		assert.strictEqual(merged.getPageCount(), FIXTURE_ITEMS.length);
	});

	it("skips unmatched pages", async () => {
		const assemblyBuffer = await createAssemblyListPdf();
		const ticketsBuffer = await createTicketsPdf();
		const assemblyItems = await parseAssemblyList(assemblyBuffer);
		const matches = await matchTickets(ticketsBuffer, assemblyItems);
		matches[1].matched = false;

		const output = await mergeLabels(ticketsBuffer, matches);
		const merged = await PDFDocument.load(output);
		assert.strictEqual(merged.getPageCount(), FIXTURE_ITEMS.length - 1);
	});

	it("rotates portrait tickets so embedded text is horizontal", async () => {
		const assemblyBuffer = await createAssemblyListPdf();
		const ticketsBuffer = await createTicketsPdf();
		const assemblyItems = await parseAssemblyList(assemblyBuffer);
		const matches = await matchTickets(ticketsBuffer, assemblyItems);

		const output = await mergeLabels(ticketsBuffer, matches);
		const items = await getPageTextItems(output, 1);

		// После поворота влево на 90° буквы "Ozon" должны лежать на одной горизонтали.
		const ozonChars = items.filter(
			(i) => i.str.length === 1 && "Ozon".includes(i.str),
		);
		assert.strictEqual(ozonChars.length, 4, "Expected 4 Ozon characters");
		const ys = ozonChars.map((i) => i.y);
		const spread = Math.max(...ys) - Math.min(...ys);
		assert.ok(spread < 2, `Expected horizontal Ozon, y spread: ${spread}`);
	});

	it("rotates landscape Ozon tickets so embedded text is horizontal", async () => {
		const assemblyBuffer = await createAssemblyListPdf();
		const ticketsBuffer = await createLandscapeTicketsPdf();
		const assemblyItems = await parseAssemblyList(assemblyBuffer);
		const matches = await matchTickets(ticketsBuffer, assemblyItems);

		const output = await mergeLabels(ticketsBuffer, matches);

		// Проверяем, что PDF содержит страницы и не пустой.
		const merged = await PDFDocument.load(output);
		assert.strictEqual(merged.getPageCount(), FIXTURE_ITEMS.length);
	});
});

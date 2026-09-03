require("dotenv").config();
const { v4: uuidv4 } = require("uuid");
const { db, initDb } = require("./db");

async function seed() {
	await initDb();

	const existing = await db.prepare("SELECT COUNT(*) as c FROM products").get();
	const queueProduct = {
		code: "queue",
		name: "Электронная очередь",
		description:
			"Система управления электронной очередью для обслуживания клиентов. Поддержка нескольких услуг, вызов по номеру, отображение на экране.",
		icon: "list-ordered",
		config: JSON.stringify({
			backend_url: "/api/queue",
			frontend_url: "/queue/admin",
			description: "Система управления электронной очередью",
		}),
		show_on_landing: true,
		landing_description:
			"Веб-платформа для организации живой очереди без терминалов. QR-запись, публичное табло, рекламный модуль и аналитика.",
	};

	const bookingProduct = {
		code: "booking",
		name: "Электронная запись",
		description:
			"Система записи клиентов на приём. Каталог услуг, календарь записей, дашборд с режимом табло, экспорт в CSV.",
		icon: "calendar-check",
		config: JSON.stringify({
			backend_url: "/api/booking",
			frontend_url: "/booking/admin",
			description: "Система записи клиентов на приём",
		}),
		show_on_landing: true,
		landing_description:
			"Система электронной записи клиентов на приём. Каталог услуг, онлайн-запись, табло ожидания, аналитика и экспорт CSV.",
	};

	const crmLightProduct = {
		code: "crm-light",
		name: "CRM Light",
		description:
			"Учёт клиентов, сотрудников, услуг и выполненных работ. Справочники, история взаимодействий, экспорт данных.",
		icon: "contact",
		config: JSON.stringify({
			backend_url: "/api/crm",
			frontend_url: "/crm/admin",
			description: "CRM-система для учёта клиентов и услуг",
		}),
		show_on_landing: true,
		landing_description:
			"Облачная CRM-система для малого бизнеса. Учёт клиентов, каталог услуг, сотрудники, выполненные работы, интеграция с Электронной записью и экспорт в CSV.",
		price_monthly: 490,
		price_yearly: 4900,
	};

	const erpLightProduct = {
		code: "erp-light",
		name: "ERP Light",
		description:
			"Управление договорами, заказами, счетами, оплатами, отгрузками, рекламациями и производством. Контрагенты, номенклатура, логистика, аналитика.",
		icon: "briefcase",
		config: JSON.stringify({
			backend_url: "/api/erp",
			frontend_url: "/erp/",
			description: "ERP-система для управления бизнесом",
		}),
		show_on_landing: true,
		landing_description:
			"Облачная ERP-система для малого и среднего бизнеса. Договоры, заказы, производство, отгрузки, финансы — всё в одном месте.",
		price_monthly: 990,
		price_yearly: 9900,
	};

	const storeManagementProduct = {
		code: "store-management",
		name: "Управление магазином",
		description:
			"Управление магазинами, складами, закупками, остатками, продажами, онлайн-витриной, заказами и аналитикой.",
		icon: "store",
		config: JSON.stringify({
			backend_url: "/api/store",
			frontend_url: "/store/admin",
			description: "Система управления магазином, складами и онлайн-витриной",
		}),
		show_on_landing: true,
		landing_description:
			"Облачная система для розницы. Магазины и склады, товары, закупки, остатки, наценки, продажи, QR-витрина, онлайн-заказы и отчётность в одном интерфейсе.",
		price_monthly: 1490,
		price_yearly: 14900,
	};

	const furniturePhotoSorterProduct = {
		code: "furniture-photo-sorter",
		name: "PhotoSort — Сортировка фото мебели",
		description:
			"Сервис для сортировки и систематизации фотографий мягкой мебели. Шаблоны видов, загрузка, классификация, именование и ZIP-экспорт.",
		icon: "camera",
		config: JSON.stringify({
			backend_url: "/api/furniture-sorter",
			frontend_url: "/furniture-sorter/",
			description: "Сортировка и именование фотографий мягкой мебели",
		}),
		show_on_landing: true,
		landing_description:
			"Веб-платформа для сортировки фотографий мягкой мебели. Шаблоны видов, drag-drop загрузка, классификация, автоматическое именование и ZIP-экспорт. Для фабрик, магазинов и маркетплейсов.",
		price_monthly: 590,
		price_yearly: 5900,
	};

	const ozonLabelsProduct = {
		code: "ozon-labels",
		name: "Ozon Labels — Этикетки для Ozon",
		description:
			"Автоматизированное создание этикеток для продаж на Ozon. Объединяет лист подбора и PDF с этикетками, добавляет артикул и наименование товара.",
		icon: "tag",
		config: JSON.stringify({
			backend_url: "/api/label-merger",
			frontend_url: "/ozon-labels/",
			description: "Автоматизированное создание этикеток для Ozon",
		}),
		show_on_landing: true,
		landing_description:
			"Автоматически создавайте готовые этикетки 120×75 мм для отправлений Ozon. Загрузите лист подбора и PDF с этикетками — сервис сопоставит заказы, добавит артикул и полное наименование товара.",
		price_monthly: 490,
		price_yearly: 4900,
	};

	const allProducts = [
		queueProduct,
		bookingProduct,
		crmLightProduct,
		erpLightProduct,
		storeManagementProduct,
		furniturePhotoSorterProduct,
		ozonLabelsProduct,
	];

	for (const p of allProducts) {
		const exists = await db
			.prepare("SELECT id FROM products WHERE code = ?")
			.get(p.code);
		if (exists) {
			await db.pool.query(
				`UPDATE products SET name = $1, description = $2, icon = $3, config = $4, is_active = TRUE,
         show_on_landing = COALESCE($6, show_on_landing),
         landing_description = COALESCE($7, landing_description),
         price_monthly = COALESCE($8, price_monthly),
         price_yearly = COALESCE($9, price_yearly)
         WHERE code = $5`,
				[
					p.name,
					p.description,
					p.icon,
					p.config,
					p.code,
					p.show_on_landing ?? null,
					p.landing_description ?? null,
					p.price_monthly ?? null,
					p.price_yearly ?? null,
				],
			);
			console.log(`Updated ${p.code} product`);
		} else {
			await db.pool.query(
				`INSERT INTO products (id, code, name, description, icon, config, show_on_landing, landing_description, price_monthly, price_yearly)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
				[
					uuidv4(),
					p.code,
					p.name,
					p.description,
					p.icon,
					p.config,
					p.show_on_landing ?? false,
					p.landing_description ?? "",
					p.price_monthly ?? 0,
					p.price_yearly ?? 0,
				],
			);
			console.log(`Created ${p.code} product`);
		}
	}

	await db.close();
}

seed().catch((err) => {
	console.error(err);
	process.exit(1);
});

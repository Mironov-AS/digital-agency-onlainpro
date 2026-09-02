import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, CheckCircle } from "lucide-react";
import {
	IconStore,
	IconBoxes,
	IconChart,
	IconPackage,
	IconAnalytics,
} from "../components/BrandIcons";
import { useTrialModal } from "../context/ModalContext";

export default function StoreManagementPage() {
	const { openTrial } = useTrialModal();

	const scrollToContacts = () => {
		const contacts = document.getElementById("contacts");
		if (contacts) {
			contacts.scrollIntoView({ behavior: "smooth", block: "start" });
		} else {
			window.location.href = "/#contacts";
		}
	};

	const FAQ_DATA = [
		{
			question: "Как начать работу с системой?",
			answer:
				"Настройте точки продаж, добавьте товары с ценами и начните работать. Весь процесс занимает один рабочий день. Данные хранятся в облаке — не нужно покупать серверы или настраивать оборудование.",
		},
		{
			question: "Можно ли управлять несколькими магазинами?",
			answer:
				"Да. Система поддерживает неограниченное количество точек продаж. Вы видите остатки по каждому магазину, можете перемещать товары между складами и отслеживать продажи по всей сети в реальном времени.",
		},
		{
			question: "Как работает онлайн-витрина?",
			answer:
				"Покупатели сканируют QR-код, видят каталог товаров с ценами и оформляют заказ. Вы получаете уведомление о новом заказе и обрабатываете его в панели управления.",
		},
		{
			question: "Сколько стоит и как оплачивать?",
			answer:
				"Бесплатный тест 14 дней. Далее — фиксированная абонентская плата за месяц. Никаких скрытых платежей или комиссий за операции. Отмена в любой момент.",
		},
	];

	useEffect(() => {
		document.title =
			"Управление магазином — склады, продажи и онлайн-витрина | ОнлайнПро";

		// Meta description
		let meta = document.querySelector('meta[name="description"]');
		if (!meta) {
			meta = document.createElement("meta");
			meta.name = "description";
			document.head.appendChild(meta);
		}
		meta.content =
			"Управление магазином — облачная система для магазинов и складов. Товары, закупки, остатки, продажи, онлайн-витрина, QR-код, заказы и аналитика в одном интерфейсе. Москва, Санкт-Петербург, вся Россия.";

		// Keywords
		let keywords = document.querySelector('meta[name="keywords"]');
		if (!keywords) {
			keywords = document.createElement("meta");
			keywords.name = "keywords";
			document.head.appendChild(keywords);
		}
		keywords.content =
			"управление магазином, складской учёт, товары, закупки, остатки, продажи, онлайн-витрина, розница, CRM для магазина, учёт товаров";

		// GEO теги
		let geoRegion = document.querySelector('meta[name="geo.region"]');
		if (!geoRegion) {
			geoRegion = document.createElement("meta");
			geoRegion.name = "geo.region";
			document.head.appendChild(geoRegion);
		}
		geoRegion.content = "RU";

		let geoPlacename = document.querySelector('meta[name="geo.placename"]');
		if (!geoPlacename) {
			geoPlacename = document.createElement("meta");
			geoPlacename.name = "geo.placename";
			document.head.appendChild(geoPlacename);
		}
		geoPlacename.content = "Россия, Москва, Санкт-Петербург";

		// Schema.org
		let ld = document.getElementById("store-schema");
		if (!ld) {
			ld = document.createElement("script");
			ld.id = "store-schema";
			ld.type = "application/ld+json";
			document.head.appendChild(ld);
		}
		ld.textContent = JSON.stringify({
			"@context": "https://schema.org",
			"@type": "SoftwareApplication",
			name: "Управление магазином",
			applicationCategory: "BusinessApplication",
			operatingSystem: "Web",
			description:
				"Облачная система управления магазином: товары, закупки, остатки, продажи, онлайн-витрина, QR-код, заказы, аналитика.",
			offers: {
				"@type": "Offer",
				price: "0",
				priceCurrency: "RUB",
				description: "Бесплатный тест 14 дней",
			},
			provider: {
				"@type": "Organization",
				name: "ОнлайнПро.РФ",
				url: "https://онлайнпро.рф",
			},
			featureList:
				"Магазины, склады, товары, закупки, остатки, продажи, касса, онлайн-витрина, QR-код, аналитика",
			areaServed: { "@type": "Country", name: "Россия" },
		});

		// FAQ Schema
		let faqLd = document.getElementById("faq-schema");
		if (!faqLd) {
			faqLd = document.createElement("script");
			faqLd.id = "faq-schema";
			faqLd.type = "application/ld+json";
			document.head.appendChild(faqLd);
		}
		faqLd.textContent = JSON.stringify({
			"@context": "https://schema.org",
			"@type": "FAQPage",
			mainEntity: FAQ_DATA.map((item) => ({
				"@type": "Question",
				name: item.question,
				acceptedAnswer: {
					"@type": "Answer",
					text: item.answer,
				},
			})),
		});

		return () => {
			document.title = "Цифровое агентство ОнлайнПро.РФ";
			const s = document.getElementById("store-schema");
			if (s) s.remove();
			const f = document.getElementById("faq-schema");
			if (f) f.remove();
		};
	}, []);

	return (
		<article
			className="qf"
			itemScope
			itemType="https://schema.org/SoftwareApplication"
		>
			<meta itemProp="name" content="Управление магазином" />
			<meta itemProp="applicationCategory" content="BusinessApplication" />
			<meta itemProp="operatingSystem" content="Web" />

			<section className="qf-hero">
				<div className="container">
					<div className="qf-hero-grid">
						<div className="qf-hero-text">
							<span className="qf-badge">Облачная система для розницы</span>
							<h1 className="qf-hero-title">
								Управляйте магазинами, складами и продажами{" "}
								<span className="qf-hero-accent">в одном месте</span>
							</h1>
							<p className="qf-hero-sub">
								«Управление магазином» помогает собственнику видеть остатки,
								закупки, продажи, прибыль и онлайн-заказы без Excel, бумажных
								журналов и ручного сведения данных.
							</p>
							<div className="qf-hero-actions">
								<button
									className="btn btn-primary btn-lg"
									onClick={() =>
										openTrial("store-management", "Управление магазином")
									}
								>
									Попробовать бесплатно <ChevronRight size={16} />
								</button>
								<a
									href="#store-how"
									className="btn btn-outline btn-lg"
									onClick={(e) => {
										e.preventDefault();
										const target = document.getElementById("store-how");
										if (target) {
											target.scrollIntoView({
												behavior: "smooth",
												block: "start",
											});
										}
									}}
								>
									Как это работает
								</a>
							</div>
							<div className="qf-hero-stats">
								<div className="qf-stat">
									<strong>1 день</strong>
									<span>на запуск</span>
								</div>
								<div className="qf-stat">
									<strong>QR</strong>
									<span>витрина</span>
								</div>
								<div className="qf-stat">
									<strong>Облако</strong>
									<span>без серверов</span>
								</div>
							</div>
						</div>
						<div className="qf-hero-visual">
							<div className="qf-mockup qf-mockup--board">
								<div className="qf-mockup-bar">
									<span className="qf-mockup-dot" />
									<span className="qf-mockup-dot" />
									<span className="qf-mockup-dot" />
									<span className="qf-mockup-title">Панель магазина</span>
								</div>
								<div className="erp-dashboard-preview">
									<div className="erp-preview-stats">
										<div className="erp-stat-card">
											<div className="erp-stat-num">3</div>
											<div className="erp-stat-label">Точки</div>
										</div>
										<div className="erp-stat-card">
											<div className="erp-stat-num">1.8M</div>
											<div className="erp-stat-label">Остатки</div>
										</div>
										<div className="erp-stat-card">
											<div className="erp-stat-num">42%</div>
											<div className="erp-stat-label">Маржа</div>
										</div>
									</div>
									<div className="erp-preview-table">
										<div className="erp-preview-header">
											<span>Товар</span>
											<span>Остаток</span>
											<span>Цена</span>
											<span>Статус</span>
										</div>
										<div className="erp-preview-row erp-preview-row--active">
											<span>Кофе</span>
											<span>62 шт</span>
											<span>1 131 ₽</span>
											<span className="erp-tag erp-tag--green">В продаже</span>
										</div>
										<div className="erp-preview-row">
											<span>Набор</span>
											<span>8 шт</span>
											<span>1 938 ₽</span>
											<span className="erp-tag erp-tag--yellow">Мало</span>
										</div>
										<div className="erp-preview-row">
											<span>Кружка</span>
											<span>45 шт</span>
											<span>884 ₽</span>
											<span className="erp-tag erp-tag--blue">Витрина</span>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			<section className="qf-section qf-problems">
				<div className="container">
					<h2 className="qf-section-title">Знакомые проблемы?</h2>
					<div className="qf-problems-grid">
						<div className="qf-problem-card">
							<div className="qf-problem-icon">
								<IconBoxes size={28} />
							</div>
							<h3>Непонятно, где товар</h3>
							<p>
								Остатки в магазине, на складе и в пути ведутся отдельно. В итоге
								товар есть «по документам», но его нет на точке.
							</p>
						</div>
						<div className="qf-problem-card">
							<div className="qf-problem-icon">
								<IconChart size={28} />
							</div>
							<h3>Продажи считаются вручную</h3>
							<p>
								Сложно быстро увидеть выручку, прибыль, лучшие товары и точки,
								где деньги зависают в остатках.
							</p>
						</div>
						<div className="qf-problem-card">
							<div className="qf-problem-icon">
								<IconStore size={28} />
							</div>
							<h3>Нет простой онлайн-витрины</h3>
							<p>
								Покупатели спрашивают ассортимент в мессенджерах, а сотрудники
								вручную собирают заказы.
							</p>
						</div>
					</div>
				</div>
			</section>

			<section className="qf-section qf-section--alt" id="store-how">
				<div className="container">
					<h2 className="qf-section-title">
						Как работает «Управление магазином»
					</h2>
					<p className="qf-section-sub">
						Три шага — от товара на складе до продажи и аналитики
					</p>
					<div className="features-grid">
						<div className="feature-card">
							<div className="feature-icon">
								<IconStore size={32} />
							</div>
							<h3>Настройте магазины и склады</h3>
							<p>
								Добавьте точки, центральные склады и связи между ними. Система
								показывает, где находится товар.
							</p>
						</div>
						<div className="feature-card">
							<div className="feature-icon">
								<IconPackage size={32} />
							</div>
							<h3>Ведите закупки и остатки</h3>
							<p>
								Фиксируйте поставщиков, поступления, перемещения, инвентаризации
								и цены продажи с наценками.
							</p>
						</div>
						<div className="feature-card">
							<div className="feature-icon">
								<IconChart size={32} />
							</div>
							<h3>Продавайте и анализируйте</h3>
							<p>
								Кассир оформляет продажи, покупатели делают онлайн-заказы,
								руководитель видит выручку и прибыль.
							</p>
						</div>
					</div>
				</div>
			</section>

			<section className="qf-section">
				<div className="container">
					<h2 className="qf-section-title">Возможности продукта</h2>
					<p className="qf-section-sub">
						Всё ключевое для магазина — без тяжёлого внедрения
					</p>
					<div className="features-grid">
						<div className="feature-card">
							<div className="feature-icon">
								<IconStore size={24} />
							</div>
							<h3>Магазины и склады</h3>
							<p>
								Любое количество точек, центральные склады и привязка складов к
								магазинам.
							</p>
						</div>
						<div className="feature-card">
							<div className="feature-icon">
								<IconPackage size={24} />
							</div>
							<h3>Справочник товаров</h3>
							<p>
								Артикулы, цены закупки, наценки, единицы измерения, описания и
								характеристики.
							</p>
						</div>
						<div className="feature-card">
							<div className="feature-icon">
								<IconBoxes size={24} />
							</div>
							<h3>Закупки и поставщики</h3>
							<p>
								Заказы поставщикам, поступления, накладные, партии и условия
								поставок.
							</p>
						</div>
						<div className="feature-card">
							<div className="feature-icon">
								<IconChart size={24} />
							</div>
							<h3>Остатки и инвентаризация</h3>
							<p>
								Остатки по точкам, перемещения между складами и магазинами,
								расхождения по инвентаризации.
							</p>
						</div>
						<div className="feature-card">
							<div className="feature-icon">
								<IconAnalytics size={24} />
							</div>
							<h3>Продажи и касса</h3>
							<p>
								Подбор товара по названию, артикулу или штрих-коду, архив продаж
								и детализация по кассирам.
							</p>
						</div>
						<div className="feature-card">
							<div className="feature-icon">
								<IconStore size={24} />
							</div>
							<h3>Онлайн-витрина</h3>
							<p>
								Публичный каталог, QR-код, корзина, уникальные номера заказов и
								статусы обработки.
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* FAQ */}
			<section className="qf-section" id="faq">
				<div className="container">
					<h2 className="qf-section-title">
						Частые вопросы об управлении магазином
					</h2>
					<div
						className="qf-faq"
						itemScope
						itemType="https://schema.org/FAQPage"
					>
						<details
							className="qf-faq-item"
							itemScope
							itemProp="mainEntity"
							itemType="https://schema.org/Question"
						>
							<summary itemProp="name">Как начать работу с системой?</summary>
							<div
								itemScope
								itemProp="acceptedAnswer"
								itemType="https://schema.org/Answer"
							>
								<p itemProp="text">
									Настройте точки продаж, добавьте товары с ценами и начните
									работать. Весь процесс занимает один рабочий день. Данные
									хранятся в облаке — не нужно покупать серверы или настраивать
									оборудование.
								</p>
							</div>
						</details>
						<details
							className="qf-faq-item"
							itemScope
							itemProp="mainEntity"
							itemType="https://schema.org/Question"
						>
							<summary itemProp="name">
								Можно ли управлять несколькими магазинами?
							</summary>
							<div
								itemScope
								itemProp="acceptedAnswer"
								itemType="https://schema.org/Answer"
							>
								<p itemProp="text">
									Да. Система поддерживает неограниченное количество точек
									продаж. Вы видите остатки по каждому магазину, можете
									перемещать товары между складами и отслеживать продажи по всей
									сети в реальном времени.
								</p>
							</div>
						</details>
						<details
							className="qf-faq-item"
							itemScope
							itemProp="mainEntity"
							itemType="https://schema.org/Question"
						>
							<summary itemProp="name">Как работает онлайн-витрина?</summary>
							<div
								itemScope
								itemProp="acceptedAnswer"
								itemType="https://schema.org/Answer"
							>
								<p itemProp="text">
									Покупатели сканируют QR-код, видят каталог товаров с ценами и
									oформляют заказ. Вы получаете уведомление о новом заказе и
									обрабатываете его в панели управления. Всё работает без
									дополнительных приложений — нужен только браузер.
								</p>
							</div>
						</details>
						<details
							className="qf-faq-item"
							itemScope
							itemProp="mainEntity"
							itemType="https://schema.org/Question"
						>
							<summary itemProp="name">Сколько стоит и как оплачивать?</summary>
							<div
								itemScope
								itemProp="acceptedAnswer"
								itemType="https://schema.org/Answer"
							>
								<p itemProp="text">
									Бесплатный тест 14 дней. Далее — фиксированная абонентская
									плата за месяц. Никаких скрытых платежей, комиссий за операции
									или платы за пользователей. Отмена в любой момент.
								</p>
							</div>
						</details>
					</div>
				</div>
			</section>

			<section className="qf-section qf-cta-section">
				<div className="container">
					<div className="qf-cta-card">
						<h2>Готовы навести порядок в магазине?</h2>
						<p>
							Запустите управление магазинами, складами, продажами и
							онлайн-витриной в одном облачном продукте. Оставьте заявку, и мы
							настроим систему под вашу сеть.
						</p>
						<div className="qf-cta-actions">
							<button
								className="btn btn-primary btn-lg"
								onClick={() =>
									openTrial("store-management", "Управление магазином")
								}
							>
								Попробовать бесплатно <ChevronRight size={16} />
							</button>
							<a
								href="#contacts"
								className="btn btn-outline btn-lg"
								onClick={(e) => {
									e.preventDefault();
									scrollToContacts();
								}}
							>
								Обсудить проект
							</a>
						</div>
					</div>
					<p style={{ marginTop: 16, textAlign: "center" }}>
						<Link to="/#pricing" className="qf-link">
							<CheckCircle size={16} /> Посмотреть другие продукты ОнлайнПро
						</Link>
					</p>
				</div>
			</section>

			{/* Контакты */}
			<section className="cta" id="contacts">
				<div className="container">
					<div className="cta-inner">
						<h2 className="cta-title">Хотите обсудить проект?</h2>
						<p className="cta-subtitle">
							Свяжитесь с нами, и мы подготовим личное предложение для вашего
							бизнеса
						</p>
						<div className="hero-buttons" style={{ justifyContent: "center" }}>
							<a href="tel:+74951234567" className="btn btn-outline btn-lg">
								<svg
									width="16"
									height="16"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
								>
									<path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
								</svg>
								+7 (495) 123-45-67
							</a>
							<a
								href="mailto:info@онлайнпро.рф"
								className="btn btn-outline btn-lg"
							>
								<svg
									width="16"
									height="16"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
								>
									<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
									<polyline points="22,6 12,13 2,6" />
								</svg>
								info@онлайнпро.рф
							</a>
						</div>
					</div>
				</div>
			</section>
		</article>
	);
}

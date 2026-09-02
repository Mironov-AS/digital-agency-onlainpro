import { useEffect } from "react";
import {
	Tag,
	FileText,
	QrCode,
	Merge,
	Download,
	CheckCircle,
	ChevronRight,
	Zap,
	Shield,
	Package,
	Truck,
	BarChart3,
	Building2,
	Store,
	Boxes,
} from "lucide-react";
import { useLeadModal, useTrialModal } from "../context/ModalContext";

export default function OzonLabelsPage() {
	const { open } = useLeadModal();
	const { openTrial } = useTrialModal();

	const scrollToContacts = () => {
		const contacts = document.getElementById("contacts");
		if (contacts) {
			contacts.scrollIntoView({ behavior: "smooth", block: "start" });
		} else {
			window.location.href = "/#contacts";
		}
	};

	useEffect(() => {
		document.title =
			"Ozon Labels — Автоматизированное создание этикеток для Ozon | ОнлайнПро.РФ";

		// Meta description
		let meta = document.querySelector('meta[name="description"]');
		if (!meta) {
			meta = document.createElement("meta");
			meta.name = "description";
			document.head.appendChild(meta);
		}
		meta.content =
			"Ozon Labels — автоматически создаёт этикетки 120×75 мм для отправлений Ozon. Загрузите лист подбора и PDF с этикетками, сервис сопоставит заказы, добавит артикул и полное наименование товара. Для селлеров Ozon в России.";

		// Keywords
		let keywords = document.querySelector('meta[name="keywords"]');
		if (!keywords) {
			keywords = document.createElement("meta");
			keywords.name = "keywords";
			document.head.appendChild(keywords);
		}
		keywords.content =
			"Ozon этикетки, печать этикеток Ozon, автоматизация сборки, селлер Ozon, этикетки 120×75, маркетплейс, склад Ozon";

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
		geoPlacename.content = "Россия, Москва";

		let ld = document.getElementById("ozon-labels-schema");
		if (!ld) {
			ld = document.createElement("script");
			ld.id = "ozon-labels-schema";
			ld.type = "application/ld+json";
			document.head.appendChild(ld);
		}
		ld.textContent = JSON.stringify({
			"@context": "https://schema.org",
			"@type": "SoftwareApplication",
			name: "Ozon Labels — Этикетки для Ozon",
			applicationCategory: "BusinessApplication",
			operatingSystem: "Web",
			description:
				"Автоматизированное создание этикеток 120×75 мм для отправлений Ozon. Сопоставление заказов, печать артикула и наименования товара.",
			offers: {
				"@type": "Offer",
				price: "0",
				priceCurrency: "RUB",
				description: "Бесплатный тест",
			},
			provider: {
				"@type": "Organization",
				name: "ОнлайнПро.РФ",
				url: "https://онлайнпро.рф",
			},
			featureList:
				"Загрузка листа подбора, загрузка этикеток PDF, сопоставление по номеру отправления, этикетки 120×75 мм, печать артикула и наименования",
			areaServed: { "@type": "Country", name: "Россия" },
		});

		return () => {
			document.title = "Цифровое агентство ОнлайнПро.РФ";
			const s = document.getElementById("ozon-labels-schema");
			if (s) s.remove();
		};
	}, []);

	return (
		<article
			className="qf"
			itemScope
			itemType="https://schema.org/SoftwareApplication"
		>
			<meta itemProp="name" content="Ozon Labels — Этикетки для Ozon" />
			<meta itemProp="applicationCategory" content="BusinessApplication" />

			{/* Hero */}
			<section className="qf-hero">
				<div className="container">
					<div className="qf-hero-grid">
						<div className="qf-hero-text">
							<span className="qf-badge">Готовое решение</span>
							<h1 className="qf-hero-title">
								Этикетки для Ozon{" "}
								<span className="qf-hero-accent">за 2 клика</span>: лист подбора
								+ этикетки = готовый PDF
							</h1>
							<p className="qf-hero-sub">
								Ozon Labels — веб-сервис для селлеров. Загрузите лист подбора и
								PDF с этикетками, и сервис автоматически создаст этикетки
								размером 120×75 мм с QR-кодом, артикулом и полным наименованием
								товара.
							</p>
							<div className="qf-hero-actions">
								<button
									className="btn btn-primary btn-lg"
									onClick={() =>
										openTrial("ozon-labels", "Ozon Labels — Этикетки для Ozon")
									}
								>
									Попробовать бесплатно <ChevronRight size={16} />
								</button>
								<a
									href="#how"
									className="btn btn-outline btn-lg"
									onClick={(e) => {
										e.preventDefault();
										const target = document.getElementById("how");
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
									<strong>10×</strong>
									<span>быстрее сборка</span>
								</div>
								<div className="qf-stat">
									<strong>0</strong>
									<span>ошибок в заказах</span>
								</div>
								<div className="qf-stat">
									<strong>1 мин</strong>
									<span>на партию</span>
								</div>
							</div>
						</div>
						<div className="qf-hero-visual">
							<div className="qf-mockup qf-mockup--board">
								<div className="qf-mockup-bar">
									<span className="qf-mockup-dot" />
									<span className="qf-mockup-dot" />
									<span className="qf-mockup-dot" />
									<span className="qf-mockup-title">
										Ozon Labels — Панель управления
									</span>
								</div>
								<div className="qf-board-content" style={{ padding: "20px" }}>
									<div
										style={{
											display: "grid",
											gridTemplateColumns: "1fr 1fr",
											gap: "8px",
											marginBottom: "12px",
										}}
									>
										<div
											style={{
												background: "#eff6ff",
												borderRadius: "8px",
												padding: "12px",
												textAlign: "center",
											}}
										>
											<FileText
												size={20}
												style={{ color: "#3b82f6", marginBottom: "4px" }}
											/>
											<div style={{ fontSize: "12px", fontWeight: 600 }}>
												Лист подбора
											</div>
											<div style={{ fontSize: "10px", color: "#6b7280" }}>
												PDF
											</div>
										</div>
										<div
											style={{
												background: "#f0fdf4",
												borderRadius: "8px",
												padding: "12px",
												textAlign: "center",
											}}
										>
											<QrCode
												size={20}
												style={{ color: "#16a34a", marginBottom: "4px" }}
											/>
											<div style={{ fontSize: "12px", fontWeight: 600 }}>
												Этикетки
											</div>
											<div style={{ fontSize: "10px", color: "#6b7280" }}>
												PDF
											</div>
										</div>
									</div>
									<div
										style={{
											display: "flex",
											alignItems: "center",
											justifyContent: "center",
											gap: "8px",
											background: "#f9fafb",
											borderRadius: "8px",
											padding: "10px",
											marginBottom: "12px",
											fontSize: "12px",
											color: "#374151",
										}}
									>
										<Merge size={16} />
										Сопоставление по номеру отправления
									</div>
									<div
										style={{
											background: "#f9fafb",
											borderRadius: "8px",
											padding: "10px",
											fontSize: "11px",
											fontFamily: "monospace",
											color: "#374151",
										}}
									>
										[QR] Артикул: SOFA-001
										<br />
										Диван прямой Комфорт
										<br />
										120×75 мм
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Pain points */}
			<section className="qf-section qf-problems">
				<div className="container">
					<h2 className="qf-section-title">Знакомые проблемы?</h2>
					<div className="qf-problems-grid">
						<div className="qf-problem-card">
							<div className="qf-problem-icon">🖨️</div>
							<h3>Маленькие этикетки без текста</h3>
							<p>
								Стандартные Ozon-этикетки 58×40 мм не содержат артикул и
								название товара. Склад путается и кладёт не тот товар.
							</p>
						</div>
						<div className="qf-problem-card">
							<div className="qf-problem-icon">⏱️</div>
							<h3>Часы ручной сборки</h3>
							<p>
								Менеджер вручную сопоставляет лист подбора и этикетки,
								переписывает артикулы и печатает отдельные наклейки.
							</p>
						</div>
						<div className="qf-problem-card">
							<div className="qf-problem-icon">❌</div>
							<h3>Ошибки при отгрузке</h3>
							<p>
								Без крупного текста на этикетке посылки путают, клиенты получают
								не то, растёт процент возвратов и штрафов.
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* How it works */}
			<section className="qf-section qf-section--alt" id="how">
				<div className="container">
					<h2 className="qf-section-title">Как работает Ozon Labels</h2>
					<p className="qf-section-sub">
						Три простых шага от загрузки до готового PDF
					</p>
					<div className="features-grid">
						<div className="feature-card">
							<div className="feature-icon">
								<FileText size={32} />
							</div>
							<h3>Загрузите лист подбора</h3>
							<p>
								PDF-файл со списком заказов: номер отправления, название товара
								и артикул.
							</p>
						</div>
						<div className="feature-card">
							<div className="feature-icon">
								<QrCode size={32} />
							</div>
							<h3>Загрузите этикетки</h3>
							<p>
								PDF, где каждая страница — этикетка с QR-кодом и номером заказа.
							</p>
						</div>
						<div className="feature-card">
							<div className="feature-icon">
								<Download size={32} />
							</div>
							<h3>Скачайте готовые этикетки</h3>
							<p>
								Сервис сопоставляет заказы, встраивает QR-код и добавляет
								артикул с наименованием. PDF готов к печати.
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* Features */}
			<section className="qf-section">
				<div className="container">
					<h2 className="qf-section-title">Возможности сервиса</h2>
					<p className="qf-section-sub">
						Всё, что нужно для быстрой и точной сборки заказов Ozon
					</p>
					<div className="features-grid">
						<div className="feature-card">
							<div className="feature-icon">
								<Merge size={24} />
							</div>
							<h3>Автосопоставление</h3>
							<p>
								Сервис сам находит соответствие между страницами этикеток и
								заказами из листа подбора по номеру отправления.
							</p>
						</div>
						<div className="feature-card">
							<div className="feature-icon">
								<Tag size={24} />
							</div>
							<h3>Артикул и наименование</h3>
							<p>
								Итоговая этикетка содержит полный артикул и полное наименование
								товара без сокращений.
							</p>
						</div>
						<div className="feature-card">
							<div className="feature-icon">
								<QrCode size={24} />
							</div>
							<h3>Сохранение QR-кода</h3>
							<p>
								Оригинальная Ozon-этикетка с QR-кодом встраивается в итоговую
								этикетку 120×75 мм.
							</p>
						</div>
						<div className="feature-card">
							<div className="feature-icon">
								<Package size={24} />
							</div>
							<h3>Стандартный размер</h3>
							<p>
								Готовые этикетки имеют удобный размер 120×75 мм — подходит для
								большинства термопринтеров и принтеров этикеток.
							</p>
						</div>
						<div className="feature-card">
							<div className="feature-icon">
								<Zap size={24} />
							</div>
							<h3>Быстрая обработка</h3>
							<p>
								Обработка десятков страниц занимает секунды. Сразу получаете PDF
								для печати.
							</p>
						</div>
						<div className="feature-card">
							<div className="feature-icon">
								<Shield size={24} />
							</div>
							<h3>Безопасность данных</h3>
							<p>
								JWT-аутентификация, изоляция по клиентам. Ваши PDF и история
								заданий доступны только вам.
							</p>
						</div>
						<div className="feature-card">
							<div className="feature-icon">
								<BarChart3 size={24} />
							</div>
							<h3>История заданий</h3>
							<p>
								Все обработанные файлы сохраняются в личном кабинете. Можно
								повторно скачать результат в течение 24 часов.
							</p>
						</div>
						<div className="feature-card">
							<div className="feature-icon">
								<Truck size={24} />
							</div>
							<h3>Меньше возвратов</h3>
							<p>
								Крупный текст с артикулом и названием снижает количество ошибок
								при упаковке и отгрузке.
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* Benefits */}
			<section className="qf-section qf-benefits">
				<div className="container">
					<h2 className="qf-section-title">Почему выбирают Ozon Labels</h2>
					<div className="qf-benefits-grid">
						<div className="qf-benefit">
							<div className="qf-benefit-icon">
								<Zap size={28} />
							</div>
							<h3>Экономия времени</h3>
							<p>
								Сборка заказов ускоряется в 10 раз. Менеджер тратит минуты
								вместо часов на подготовку этикеток.
							</p>
						</div>
						<div className="qf-benefit">
							<div className="qf-benefit-icon">
								<CheckCircle size={28} />
							</div>
							<h3>Точность сборки</h3>
							<p>
								Автоматическое сопоставление исключает человеческий фактор.
								Каждая этикетка содержит правильный товар.
							</p>
						</div>
						<div className="qf-benefit">
							<div className="qf-benefit-icon">
								<Boxes size={28} />
							</div>
							<h3>Любые объёмы</h3>
							<p>
								Обрабатывайте как 10, так и 1000 заказов за один запуск. Сервис
								не ограничивает размер партии.
							</p>
						</div>
						<div className="qf-benefit">
							<div className="qf-benefit-icon">
								<Store size={28} />
							</div>
							<h3>Для любого бизнеса</h3>
							<p>
								Подходит как начинающим селлерам, так и крупным складам с
								сотнями отправлений в день.
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* For whom */}
			<section className="qf-section">
				<div className="container">
					<h2 className="qf-section-title">Для кого подходит Ozon Labels</h2>
					<p className="qf-section-sub">
						Везде, где нужно быстро и точно готовить этикетки для Ozon
					</p>
					<div className="qf-audience-grid">
						<div className="qf-audience-card">
							<Store size={32} className="qf-audience-icon" />
							<h3>Селлеры на Ozon</h3>
							<p>
								Индивидуальные предприниматели и компании, которые ежедневно
								формируют десятки и сотни отправлений.
							</p>
						</div>
						<div className="qf-audience-card">
							<Building2 size={32} className="qf-audience-icon" />
							<h3>Склады и фулфилмент</h3>
							<p>
								Складские операторы, которым важна скорость и точность
								маркировки товаров.
							</p>
						</div>
						<div className="qf-audience-card">
							<Package size={32} className="qf-audience-icon" />
							<h3>Онлайн-магазины</h3>
							<p>
								Магазины, работающие одновременно на сайте и Ozon, которым нужна
								единая этикетка.
							</p>
						</div>
						<div className="qf-audience-card">
							<Boxes size={32} className="qf-audience-icon" />
							<h3>Крупные поставщики</h3>
							<p>
								Поставщики с большим ассортиментом, где ручная сборка
								превращается в бутылочное горлышко.
							</p>
						</div>
						<div className="qf-audience-card">
							<Truck size={32} className="qf-audience-icon" />
							<h3>Логистические операторы</h3>
							<p>
								Компании, которые принимают и отгружают товары от имени
								нескольких селлеров.
							</p>
						</div>
						<div className="qf-audience-card">
							<Zap size={32} className="qf-audience-icon" />
							<h3>Стартапы и новички</h3>
							<p>
								Тем, кто только выходит на Ozon и хочет сразу делать процессы
								правильно.
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* FAQ */}
			<section
				className="qf-section"
				itemScope
				itemType="https://schema.org/FAQPage"
			>
				<div className="container">
					<h2 className="qf-section-title">Частые вопросы о Ozon Labels</h2>
					<div className="qf-faq">
						<details
							className="qf-faq-item"
							itemScope
							itemProp="mainEntity"
							itemType="https://schema.org/Question"
						>
							<summary itemProp="name">Какие файлы нужны для работы?</summary>
							<div
								itemScope
								itemProp="acceptedAnswer"
								itemType="https://schema.org/Answer"
							>
								<p itemProp="text">
									Два PDF-файла: лист подбора Ozon со списком заказов (номер
									отправления, название товара, артикул) и PDF с этикетками, где
									каждая страница — этикетка с QR-кодом и номером заказа.
								</p>
							</div>
						</details>
						<details
							className="qf-faq-item"
							itemScope
							itemProp="mainEntity"
							itemType="https://schema.org/Question"
						>
							<summary itemProp="name">Какой размер итоговых этикеток?</summary>
							<div
								itemScope
								itemProp="acceptedAnswer"
								itemType="https://schema.org/Answer"
							>
								<p itemProp="text">
									Итоговые этикетки имеют размер 120×75 мм. Оригинальная
									Ozon-этикетка с QR-кодом размещается слева, справа добавляются
									артикул и наименование товара.
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
								Что произойдёт, если номера заказов не совпадут?
							</summary>
							<div
								itemScope
								itemProp="acceptedAnswer"
								itemType="https://schema.org/Answer"
							>
								<p itemProp="text">
									Сервис сообщит об ошибке, если не сможет сопоставить ни одну
									этикетку с листом подбора. Проверьте, что номера отправлений в
									обоих файлах совпадают, и повторите загрузку.
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
								Данные разных клиентов изолированы?
							</summary>
							<div
								itemScope
								itemProp="acceptedAnswer"
								itemType="https://schema.org/Answer"
							>
								<p itemProp="text">
									Да. Каждый клиент работает только со своими файлами и историей
									заданий. Централизованная авторизация через JWT гарантирует,
									что доступ есть только у пользователей с активной подпиской на
									продукт.
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
								Сколько времени хранятся результаты?
							</summary>
							<div
								itemScope
								itemProp="acceptedAnswer"
								itemType="https://schema.org/Answer"
							>
								<p itemProp="text">
									Готовые PDF и история заданий хранятся 24 часа. Этого
									достаточно, чтобы скачать результат и распечатать этикетки.
								</p>
							</div>
						</details>
					</div>
				</div>
			</section>

			{/* CTA */}
			<section className="qf-section qf-cta-section">
				<div className="container">
					<div className="qf-cta-block">
						<h2>Готовы ускорить сборку заказов Ozon?</h2>
						<p>
							Запустите Ozon Labels и готовьте этикетки в 10 раз быстрее.
							Оставьте заявку, и мы настроим сервис под ваш бизнес.
						</p>
						<div className="qf-cta-actions">
							<button
								className="btn btn-primary btn-lg"
								onClick={() => open("Заявка: Ozon Labels", "Ozon Labels CTA")}
							>
								Оставить заявку <ChevronRight size={16} />
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

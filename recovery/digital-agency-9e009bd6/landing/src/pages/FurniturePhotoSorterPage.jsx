import { useEffect } from "react";
import {
	Camera,
	FolderArchive,
	ArrowDownUp,
	Tags,
	CheckCircle,
	ChevronRight,
	Upload,
	Grid3x3,
	FileText,
	Package,
	Zap,
	Shield,
	Building2,
	Armchair,
	Sofa,
	Briefcase,
	Factory,
	Sparkles,
} from "lucide-react";
import { useLeadModal, useTrialModal } from "../context/ModalContext";

export default function FurniturePhotoSorterPage() {
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
			"PhotoSort — Сортировка фотографий мебели для производителей и магазинов";

		// Meta description
		let meta = document.querySelector('meta[name="description"]');
		if (!meta) {
			meta = document.createElement("meta");
			meta.name = "description";
			document.head.appendChild(meta);
		}
		meta.content =
			"PhotoSort — автоматическая сортировка и именование фотографий мягкой мебели. Шаблоны видов, drag-drop загрузка, классификация, экспорт ZIP. Для мебельных фабрик, магазинов, селлеров маркетплейсов. Москва, Россия.";

		// Keywords
		let keywords = document.querySelector('meta[name="keywords"]');
		if (!keywords) {
			keywords = document.createElement("meta");
			keywords.name = "keywords";
			document.head.appendChild(keywords);
		}
		keywords.content =
			"сортировка фото, фотографии мебели, маркетплейсы, Ozon, Wildberries, фабрика мебели, обработка фото, PhotoSort";

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

		let ld = document.getElementById("fps-schema");
		if (!ld) {
			ld = document.createElement("script");
			ld.id = "fps-schema";
			ld.type = "application/ld+json";
			document.head.appendChild(ld);
		}
		ld.textContent = JSON.stringify({
			"@context": "https://schema.org",
			"@type": "SoftwareApplication",
			name: "PhotoSort — Сортировка фотографий мебели",
			applicationCategory: "BusinessApplication",
			operatingSystem: "Web",
			description:
				"Веб-платформа для сортировки и систематизации фотографий мягкой мебели по шаблонам видов. Для фабрик, магазинов, селлеров маркетплейсов.",
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
				"Шаблоны видов, drag-drop загрузка, классификация фото, автоматическое именование, ZIP-экспорт, маркетплейсы",
			areaServed: { "@type": "Country", name: "Россия" },
		});

		return () => {
			document.title = "Цифровое агентство ОнлайнПро.РФ";
			const s = document.getElementById("fps-schema");
			if (s) s.remove();
		};
	}, []);

	return (
		<article
			className="qf"
			itemScope
			itemType="https://schema.org/SoftwareApplication"
		>
			<meta
				itemProp="name"
				content="PhotoSort — Сортировка фотографий мебели"
			/>
			<meta itemProp="applicationCategory" content="BusinessApplication" />

			{/* Hero */}
			<section className="qf-hero">
				<div className="container">
					<div className="qf-hero-grid">
						<div className="qf-hero-text">
							<span className="qf-badge">Готовое решение</span>
							<h1 className="qf-hero-title">
								Сортировка фото мебели{" "}
								<span className="qf-hero-accent">за 5 минут</span> вместо часов
								ручной работы
							</h1>
							<p className="qf-hero-sub">
								PhotoSort — веб-платформа для производителей и продавцов мягкой
								мебели. Загружайте фотографии, выбирайте шаблон видов,
								классифицируйте и получайте архив с правильно названными файлами
								в нужном порядке.
							</p>
							<div className="qf-hero-actions">
								<button
									className="btn btn-primary btn-lg"
									onClick={() =>
										openTrial(
											"furniture-photo-sorter",
											"PhotoSort — Сортировка фото мебели",
										)
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
									<strong>5×</strong>
									<span>быстрее обработка</span>
								</div>
								<div className="qf-stat">
									<strong>100%</strong>
									<span>порядок в архивах</span>
								</div>
								<div className="qf-stat">
									<strong>0 ₽</strong>
									<span>за оборудование</span>
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
										PhotoSort — Панель управления
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
												background: "#f0fdf4",
												borderRadius: "8px",
												padding: "12px",
												textAlign: "center",
											}}
										>
											<Camera
												size={20}
												style={{ color: "#16a34a", marginBottom: "4px" }}
											/>
											<div style={{ fontSize: "12px", fontWeight: 600 }}>
												Прямой вид
											</div>
											<div style={{ fontSize: "10px", color: "#6b7280" }}>
												3 фото
											</div>
										</div>
										<div
											style={{
												background: "#eff6ff",
												borderRadius: "8px",
												padding: "12px",
												textAlign: "center",
											}}
										>
											<Camera
												size={20}
												style={{ color: "#3b82f6", marginBottom: "4px" }}
											/>
											<div style={{ fontSize: "12px", fontWeight: 600 }}>
												Угловой вид
											</div>
											<div style={{ fontSize: "10px", color: "#6b7280" }}>
												2 фото
											</div>
										</div>
										<div
											style={{
												background: "#fef3c7",
												borderRadius: "8px",
												padding: "12px",
												textAlign: "center",
											}}
										>
											<Camera
												size={20}
												style={{ color: "#d97706", marginBottom: "4px" }}
											/>
											<div style={{ fontSize: "12px", fontWeight: 600 }}>
												Вид сбоку
											</div>
											<div style={{ fontSize: "10px", color: "#6b7280" }}>
												4 фото
											</div>
										</div>
										<div
											style={{
												background: "#f3e8ff",
												borderRadius: "8px",
												padding: "12px",
												textAlign: "center",
											}}
										>
											<Camera
												size={20}
												style={{ color: "#9333ea", marginBottom: "4px" }}
											/>
											<div style={{ fontSize: "12px", fontWeight: 600 }}>
												Вид сзади
											</div>
											<div style={{ fontSize: "10px", color: "#6b7280" }}>
												2 фото
											</div>
										</div>
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
										SOFA-001_01_Прямой_вид.jpg
										<br />
										SOFA-001_02_Угловой_вид.jpg
										<br />
										SOFA-001_03_Вид_сбоку_слева.jpg
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
							<div className="qf-problem-icon">📁</div>
							<h3>Хаос в папках с фотографиями</h3>
							<p>
								Сотни файлов с бессмысленными названиями вроде IMG_1234.jpg.
								Невозможно быстро найти нужный ракурс.
							</p>
						</div>
						<div className="qf-problem-card">
							<div className="qf-problem-icon">⏱️</div>
							<h3>Часы ручного переименования</h3>
							<p>
								Менеджер вручную переименовывает каждый файл, открывает фото для
								проверки ракурса — это занимает часы.
							</p>
						</div>
						<div className="qf-problem-card">
							<div className="qf-problem-icon">❌</div>
							<h3>Ошибки в каталогах и на маркетплейсах</h3>
							<p>
								Неправильный порядок фото, пропущенные виды, дубли — покупатели
								видят неполный или запутанный каталог.
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* How it works */}
			<section className="qf-section qf-section--alt" id="how">
				<div className="container">
					<h2 className="qf-section-title">Как работает PhotoSort</h2>
					<p className="qf-section-sub">
						Пять простых шагов от загрузки до готового архива
					</p>
					<div className="features-grid">
						<div className="feature-card">
							<div className="feature-icon">
								<Grid3x3 size={32} />
							</div>
							<h3>Выберите шаблон видов</h3>
							<p>
								Создайте свой шаблон или используйте готовый: прямой вид,
								угловой, сбоку, сзади, сверху.
							</p>
						</div>
						<div className="feature-card">
							<div className="feature-icon">
								<Upload size={32} />
							</div>
							<h3>Загрузите фотографии</h3>
							<p>
								Перетащите файлы или выберите с диска. Поддержка JPG, PNG, WebP
								до 10 МБ каждый.
							</p>
						</div>
						<div className="feature-card">
							<div className="feature-icon">
								<Tags size={32} />
							</div>
							<h3>Классифицируйте по типам</h3>
							<p>
								Для каждого фото укажите тип вида из шаблона. Все изменения
								сохраняются автоматически.
							</p>
						</div>
						<div className="feature-card">
							<div className="feature-icon">
								<FileText size={32} />
							</div>
							<h3>Настройте именование</h3>
							<p>
								Укажите артикул модели, разделитель, формат имени файла. Превью
								покажет результат до экспорта.
							</p>
						</div>
						<div className="feature-card">
							<div className="feature-icon">
								<FolderArchive size={32} />
							</div>
							<h3>Скачайте ZIP-архив</h3>
							<p>
								Файлы отсортированы по порядку шаблона, с правильными именами.
								Готовы к загрузке на сайт.
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* Features */}
			<section className="qf-section">
				<div className="container">
					<h2 className="qf-section-title">Возможности системы</h2>
					<p className="qf-section-sub">
						Всё, что нужно для профессиональной обработки фото мебели
					</p>
					<div className="features-grid">
						<div className="feature-card">
							<div className="feature-icon">
								<Grid3x3 size={24} />
							</div>
							<h3>Шаблоны видов</h3>
							<p>
								Создавайте шаблоны с нужным порядком типов видов. Используйте
								стандартные или настраивайте под себя.
							</p>
						</div>
						<div className="feature-card">
							<div className="feature-icon">
								<Upload size={24} />
							</div>
							<h3>Drag & Drop загрузка</h3>
							<p>
								Перетащите сотни фото за раз. Поддержка JPG, PNG, WebP. Превью
								загруженных файлов.
							</p>
						</div>
						<div className="feature-card">
							<div className="feature-icon">
								<ArrowDownUp size={24} />
							</div>
							<h3>Групповая классификация</h3>
							<p>
								Назначайте тип вида сразу нескольким фото. Сэкономьте время на
								рутинной работе.
							</p>
						</div>
						<div className="feature-card">
							<div className="feature-icon">
								<FileText size={24} />
							</div>
							<h3>Гибкое именование</h3>
							<p>
								Артикул, порядковый номер, тип вида, разделитель. Превью
								итогового имени перед экспортом.
							</p>
						</div>
						<div className="feature-card">
							<div className="feature-icon">
								<FolderArchive size={24} />
							</div>
							<h3>Экспорт в ZIP</h3>
							<p>
								Все файлы в одной папке, отсортированы по шаблону. Скачайте
								готовый архив одним кликом.
							</p>
						</div>
						<div className="feature-card">
							<div className="feature-icon">
								<Zap size={24} />
							</div>
							<h3>Быстрая обработка</h3>
							<p>
								Сессии живут 24 часа. Возвращайтесь и доделывайте работу без
								повторной загрузки.
							</p>
						</div>
						<div className="feature-card">
							<div className="feature-icon">
								<Shield size={24} />
							</div>
							<h3>Безопасность данных</h3>
							<p>
								JWT-аутентификация, изоляция по клиентам. Ваши фото и шаблоны
								доступны только вам.
							</p>
						</div>
						<div className="feature-card">
							<div className="feature-icon">
								<Package size={24} />
							</div>
							<h3>Готовые шаблоны</h3>
							<p>
								Стандартный набор видов для мягкой мебели из коробки. Начните
								работу за 1 минуту.
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* Benefits */}
			<section className="qf-section qf-benefits">
				<div className="container">
					<h2 className="qf-section-title">Почему выбирают PhotoSort</h2>
					<div className="qf-benefits-grid">
						<div className="qf-benefit">
							<div className="qf-benefit-icon">
								<Zap size={28} />
							</div>
							<h3>Экономия времени</h3>
							<p>
								Обработка 100 фото занимает 5 минут вместо часа ручной работы.
								Освободите менеджеров для важных задач.
							</p>
						</div>
						<div className="qf-benefit">
							<div className="qf-benefit-icon">
								<CheckCircle size={28} />
							</div>
							<h3>Никаких ошибок</h3>
							<p>
								Автоматическая сортировка и именование исключают человеческий
								фактор. Каталоги всегда в правильном порядке.
							</p>
						</div>
						<div className="qf-benefit">
							<div className="qf-benefit-icon">
								<Sparkles size={28} />
							</div>
							<h3>Профессиональный вид</h3>
							<p>
								Единообразные названия файлов и правильный порядок видов
								повышают доверие покупателей на сайте.
							</p>
						</div>
						<div className="qf-benefit">
							<div className="qf-benefit-icon">
								<Armchair size={28} />
							</div>
							<h3>Специализировано под мебель</h3>
							<p>
								Типы видов заточены под мягкую мебель: прямой, угловой, сбоку,
								сзади, сверху, снизу.
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* For whom */}
			<section className="qf-section">
				<div className="container">
					<h2 className="qf-section-title">Для кого подходит PhotoSort</h2>
					<p className="qf-section-sub">
						Везде, где нужно систематизировать фото мебели
					</p>
					<div className="qf-audience-grid">
						<div className="qf-audience-card">
							<Factory size={32} className="qf-audience-icon" />
							<h3>Производители мебели</h3>
							<p>
								Фабрики, которые снимают десятки моделей и нуждаются в
								единообразном каталоге фото для сайта и презентаций.
							</p>
						</div>
						<div className="qf-audience-card">
							<Sofa size={32} className="qf-audience-icon" />
							<h3>Интернет-магазины мебели</h3>
							<p>
								Магазины, загружающие товары на сайт и маркетплейсы. Правильный
								порядок фото = больше продаж.
							</p>
						</div>
						<div className="qf-audience-card">
							<Briefcase size={32} className="qf-audience-icon" />
							<h3>Дизайнеры интерьера</h3>
							<p>
								Дизайнеры, которым нужно быстро подготовить визуальные материалы
								для презентаций клиентам.
							</p>
						</div>
						<div className="qf-audience-card">
							<Building2 size={32} className="qf-audience-icon" />
							<h3>Фотостудии и ретушёры</h3>
							<p>
								Студии, которые обрабатывают большие объёмы фото мебели и сдают
								их клиентам в упорядоченном виде.
							</p>
						</div>
						<div className="qf-audience-card">
							<Armchair size={32} className="qf-audience-icon" />
							<h3>Шоурумы и салоны</h3>
							<p>
								Салоны мебели, ведущие электронные каталоги для менеджеров и
								покупателей.
							</p>
						</div>
						<div className="qf-audience-card">
							<Sparkles size={32} className="qf-audience-icon" />
							<h3>Маркетплейсы</h3>
							<p>
								Селлеры на Ozon, Wildberries и других площадках, которым нужно
								строгое соответствие требованиям к фото.
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
					<h2 className="qf-section-title">Частые вопросы о PhotoSort</h2>
					<div className="qf-faq">
						<details
							className="qf-faq-item"
							itemScope
							itemProp="mainEntity"
							itemType="https://schema.org/Question"
						>
							<summary itemProp="name">
								Какие форматы фотографий поддерживаются?
							</summary>
							<div
								itemScope
								itemProp="acceptedAnswer"
								itemType="https://schema.org/Answer"
							>
								<p itemProp="text">
									PhotoSort поддерживает JPG, JPEG, PNG и WebP. Максимальный
									размер одного файла — 10 МБ. Вы можете загрузить до 50 фото за
									один раз через drag & drop.
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
								Можно ли создать свой шаблон видов?
							</summary>
							<div
								itemScope
								itemProp="acceptedAnswer"
								itemType="https://schema.org/Answer"
							>
								<p itemProp="text">
									Да. Создавайте любое количество шаблонов с нужным порядком
									видов. Используйте стандартные типы (прямой, угловой, сбоку,
									сзади, сверху, снизу) или добавляйте свои. Шаблоны сохраняются
									и доступны для повторного использования.
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
								Как формируется имя файла при экспорте?
							</summary>
							<div
								itemScope
								itemProp="acceptedAnswer"
								itemType="https://schema.org/Answer"
							>
								<p itemProp="text">
									Имя формируется по шаблону: [Артикул]_[Номер]_[ТипВида].ext.
									Вы можете настроить артикул модели, разделитель (подчёркивание
									или дефис), включить или исключить артикул и тип вида из
									имени. Превью покажет результат до экспорта.
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
									Да. Каждый клиент работает только со своими шаблонами,
									сессиями и файлами. Централизованная авторизация через JWT
									гарантирует, что доступ есть только у пользователей с активной
									подпиской на продукт.
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
								Сколько времени хранятся сессии и файлы?
							</summary>
							<div
								itemScope
								itemProp="acceptedAnswer"
								itemType="https://schema.org/Answer"
							>
								<p itemProp="text">
									Сессии и загруженные файлы хранятся 24 часа. Этого достаточно
									для обработки даже больших партий фото. ZIP-архив можно
									скачать сразу после обработки.
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
						<h2>Готовы навести порядок в фотоархиве?</h2>
						<p>
							Запустите PhotoSort и обрабатывайте фотографии мебели в 5 раз
							быстрее. Оставьте заявку, и мы настроим систему под ваш бизнес.
						</p>
						<div className="qf-cta-actions">
							<button
								className="btn btn-primary btn-lg"
								onClick={() => open("Заявка: PhotoSort", "PhotoSort CTA")}
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
							Свяжитесь с нами, и мы подготовим личное предложение для вашего бизнеса
						</p>
						<div className="hero-buttons" style={{ justifyContent: "center" }}>
							<a href="tel:+74951234567" className="btn btn-outline btn-lg">
								<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
									<path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/>
								</svg>
								+7 (495) 123-45-67
							</a>
							<a href="mailto:info@онлайнпро.рф" className="btn btn-outline btn-lg">
								<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
									<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
									<polyline points="22,6 12,13 2,6"/>
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

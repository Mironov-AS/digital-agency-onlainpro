import { useEffect } from "react";
import { ChevronRight } from "lucide-react";
import {
	IconChart,
	IconUsers,
	IconShield,
	IconStar,
	IconRocket,
	IconTarget,
	IconChecklist,
	IconTrend,
	IconMoney,
	IconIdea,
	IconTag,
	IconList,
	IconMoney as IconCost,
} from "../components/BrandIcons";
import { useLeadModal, useTrialModal } from "../context/ModalContext";

const SEO = {
	title:
		"CRM Light — учёт клиентов, услуг и сотрудников для малого бизнеса | ОнлайнПро",
	description:
		"CRM Light — облачная CRM для малого бизнеса. Учёт клиентов, услуг, сотрудников и выполненных работ. Справочники, история взаимодействий, интеграция с Электронной записью. Для салонов красоты, клиник, автосервисов в Москве и России.",
	keywords:
		"CRM, CRM система, учёт клиентов, клиентская база, малый бизнес, салон красоты, клиника, автосервис, онлайн CRM",
	geoRegion: "RU-MOW,RU-SPE,RU",
	geoPlacename: "Россия, Москва, Санкт-Петербург",
};

export default function CrmLightPage() {
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
		document.title = SEO.title;

		const metaTags = {
			description: SEO.description,
			keywords: SEO.keywords,
			robots: "index, follow",
			author: "ОнлайнПро.РФ",
			geo_region: SEO.geoRegion,
			geo_placename: SEO.geoPlacename,
		};

		Object.entries(metaTags).forEach(([name, content]) => {
			let meta = document.querySelector(`meta[name="${name}"]`);
			if (!meta) {
				meta = document.createElement("meta");
				meta.name = name;
				document.head.appendChild(meta);
			}
			meta.content = content;
		});

		const ogTags = {
			"og:title": SEO.title,
			"og:description": SEO.description,
			"og:type": "website",
			"og:locale": "ru_RU",
			"og:site_name": "ОнлайнПро.РФ",
		};

		Object.entries(ogTags).forEach(([property, content]) => {
			let meta = document.querySelector(`meta[property="${property}"]`);
			if (!meta) {
				meta = document.createElement("meta");
				meta.setAttribute("property", property);
				document.head.appendChild(meta);
			}
			meta.content = content;
		});

		const schemaData = {
			"@context": "https://schema.org",
			"@type": "SoftwareApplication",
			name: "CRM Light — учёт клиентов для малого бизнеса",
			applicationCategory: "BusinessApplication",
			operatingSystem: "Web",
			description:
				"Облачная CRM для малого бизнеса. Учёт клиентов, услуг, сотрудников и выполненных работ. Справочники, история взаимодействий, интеграция с Электронной записью.",
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
				areaServed: [
					{ "@type": "City", name: "Москва" },
					{ "@type": "City", name: "Санкт-Петербург" },
					{ "@type": "Country", name: "Россия" },
				],
			},
			featureList:
				"Учёт клиентов, каталог услуг, сотрудники, выполненные работы, справочники, история взаимодействий, экспорт CSV, интеграция с записью",
			areaServed: { "@type": "Country", name: "Россия" },
		};

		let ld = document.getElementById("product-schema");
		if (!ld) {
			ld = document.createElement("script");
			ld.id = "product-schema";
			ld.type = "application/ld+json";
			document.head.appendChild(ld);
		}
		ld.textContent = JSON.stringify(schemaData);

		return () => {
			document.title = "Цифровое агентство ОнлайнПро.РФ";
			const el = document.getElementById("product-schema");
			if (el) el.remove();
		};
	}, []);

	return (
		<article className="qf">
			{/* Hero */}
			<section className="qf-hero">
				<div className="container">
					<div className="qf-hero-grid">
						<div className="qf-hero-text">
							<span className="qf-badge">
								<IconChart size={14} />
								Готовое решение
							</span>
							<h1 className="qf-hero-title">
								Учёт клиентов и услуг{" "}
								<span className="qf-hero-accent">
									без Excel и бумажных журналов
								</span>
							</h1>
							<p className="qf-hero-sub">
								CRM Light — облачная система для малого бизнеса. Ведите базу
								клиентов, каталог услуг, учёт сотрудников и историю выполненных
								работ. Интеграция с Электронной записью — клиенты
								синхронизируются автоматически.
							</p>
							<div className="qf-hero-actions">
								<button
									className="btn btn-primary btn-lg"
									onClick={() => openTrial("crm", "CRM Light")}
								>
									Попробовать бесплатно <ChevronRight size={16} />
								</button>
								<a
									href="#crm-how"
									className="btn btn-outline btn-lg"
									onClick={(e) => {
										e.preventDefault();
										const target = document.getElementById("crm-how");
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
									<strong>14 дней</strong>
									<span>бесплатный тест</span>
								</div>
								<div className="qf-stat">
									<strong>1 день</strong>
									<span>на запуск</span>
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
									<span className="qf-mockup-title">Клиенты</span>
								</div>
								<div className="board-content">
									<div className="board-now" style={{ padding: "12px" }}>
										<div
											style={{
												display: "grid",
												gridTemplateColumns: "2fr 2fr 2fr 1fr",
												gap: "8px",
												fontSize: "11px",
												fontWeight: "600",
												color: "var(--text-dim)",
												marginBottom: "8px",
											}}
										>
											<span>ИМЯ</span>
											<span>ТЕЛЕФОН</span>
											<span>УСЛУГА</span>
											<span>СТАТУС</span>
										</div>
									</div>
									<div className="board-queue">
										<div
											className="board-ticket"
											style={{
												display: "flex",
												justifyContent: "space-between",
												alignItems: "center",
												marginBottom: "8px",
											}}
										>
											<div>
												<strong>Сидорова М.</strong>
												<div style={{ fontSize: "11px", opacity: 0.7 }}>
													+7 900 111-22-33
												</div>
											</div>
											<div style={{ textAlign: "right" }}>
												<div style={{ fontSize: "12px" }}>Стрижка</div>
												<span
													style={{
														fontSize: "10px",
														padding: "2px 6px",
														background: "rgba(34, 197, 94, 0.15)",
														color: "#22c55e",
														borderRadius: "4px",
													}}
												>
													Активен
												</span>
											</div>
										</div>
										<div
											className="board-ticket"
											style={{
												display: "flex",
												justifyContent: "space-between",
												alignItems: "center",
												marginBottom: "8px",
											}}
										>
											<div>
												<strong>Петров И.</strong>
												<div style={{ fontSize: "11px", opacity: 0.7 }}>
													+7 912 345-67-89
												</div>
											</div>
											<div style={{ textAlign: "right" }}>
												<div style={{ fontSize: "12px" }}>Консультация</div>
												<span
													style={{
														fontSize: "10px",
														padding: "2px 6px",
														background: "rgba(34, 197, 94, 0.15)",
														color: "#22c55e",
														borderRadius: "4px",
													}}
												>
													Активен
												</span>
											</div>
										</div>
										<div
											className="board-ticket"
											style={{
												display: "flex",
												justifyContent: "space-between",
												alignItems: "center",
											}}
										>
											<div>
												<strong>Иванова А.</strong>
												<div style={{ fontSize: "11px", opacity: 0.7 }}>
													+7 903 456-78-90
												</div>
											</div>
											<div style={{ textAlign: "right" }}>
												<div style={{ fontSize: "12px" }}>Маникюр</div>
												<span
													style={{
														fontSize: "10px",
														padding: "2px 6px",
														background: "rgba(59, 130, 246, 0.15)",
														color: "#3b82f6",
														borderRadius: "4px",
													}}
												>
													Новый
												</span>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Проблемы */}
			<section className="qf-section qf-problems" id="problems">
				<div className="container">
					<h2 className="qf-section-title">Знакомые проблемы?</h2>
					<div className="qf-problems-grid">
						<div className="qf-problem-card">
							<div className="qf-problem-icon">
								<IconList size={28} />
							</div>
							<h3>Клиенты в Excel и блокнотах</h3>
							<p>
								Данные теряются, дублируются, нет единой базы. Невозможно быстро
								найти историю работы с клиентом.
							</p>
						</div>
						<div className="qf-problem-card">
							<div className="qf-problem-icon">
								<IconTrend size={28} />
							</div>
							<h3>Нет аналитики по услугам</h3>
							<p>
								Непонятно, какие услуги востребованы, кто из сотрудников
								загружен, сколько работ выполнено за месяц.
							</p>
						</div>
						<div className="qf-problem-card">
							<div className="qf-problem-icon">
								<IconCost size={28} />
							</div>
							<h3>CRM-системы сложные и дорогие</h3>
							<p>
								Большие CRM стоят дорого и требуют больше месяца внедрения. Для
								малого бизнеса это избыточно.
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* Как работает */}
			<section className="qf-section qf-section--alt" id="crm-how">
				<div className="container">
					<h2 className="qf-section-title">Как работает CRM Light</h2>
					<p className="qf-section-sub">
						Три простых шага — от регистрации до полного контроля
					</p>
					<div className="features-grid">
						<div className="feature-card">
							<div className="feature-icon">
								<IconUsers size={32} />
							</div>
							<h3>Внесите клиентов и услуги</h3>
							<p>
								Создайте базу клиентов, каталог услуг и список сотрудников.
								Импортируйте данные из Электронной записи одним кликом.
							</p>
						</div>
						<div className="feature-card">
							<div className="feature-icon">
								<IconChecklist size={32} />
							</div>
							<h3>Фиксируйте выполненные работы</h3>
							<p>
								Записывайте оказанные услуги, привязывая их к клиенту и
								сотруднику. Добавляйте комментарии и кастомные поля.
							</p>
						</div>
						<div className="feature-card">
							<div className="feature-icon">
								<IconTrend size={32} />
							</div>
							<h3>Анализируйте и экспортируйте</h3>
							<p>
								Смотрите статистику по клиентам, услугам и сотрудникам.
								Экспортируйте данные в CSV для отчётности и бухгалтерии.
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* Возможности */}
			<section className="qf-section">
				<div className="container">
					<h2 className="qf-section-title">Возможности CRM Light</h2>
					<p className="qf-section-sub">
						Всё необходимое для учёта клиентов — без лишнего
					</p>
					<div className="features-grid">
						<div className="feature-card">
							<div className="feature-icon">
								<IconUsers size={32} />
							</div>
							<h3>База клиентов</h3>
							<p>
								Полная карточка клиента: ФИО, телефон, email, заметки, история
								работ и настраиваемые поля.
							</p>
						</div>
						<div className="feature-card">
							<div className="feature-icon">
								<IconTag size={32} />
							</div>
							<h3>Каталог услуг</h3>
							<p>
								Структурированный каталог с категориями, ценами и описаниями.
								Быстрый поиск и фильтрация.
							</p>
						</div>
						<div className="feature-card">
							<div className="feature-icon">
								<IconTarget size={32} />
							</div>
							<h3>Сотрудники</h3>
							<p>
								Учёт специалистов с привязкой к услугам. Видно, кто сколько
								работ выполнил за период.
							</p>
						</div>
						<div className="feature-card">
							<div className="feature-icon">
								<IconChecklist size={32} />
							</div>
							<h3>Выполненные работы</h3>
							<p>
								Журнал оказанных услуг: клиент, сотрудник, услуга, дата,
								стоимость, комментарий.
							</p>
						</div>
						<div className="feature-card">
							<div className="feature-icon">
								<IconRocket size={32} />
							</div>
							<h3>Интеграция с Записью</h3>
							<p>
								Синхронизация клиентов и записей из модуля Электронная запись.
								Данные подтягиваются автоматически.
							</p>
						</div>
						<div className="feature-card">
							<div className="feature-icon">
								<IconMoney size={32} />
							</div>
							<h3>Экспорт в CSV</h3>
							<p>
								Выгружайте клиентов, услуги и работы в CSV для анализа в Excel
								или Google Sheets.
							</p>
						</div>
						<div className="feature-card">
							<div className="feature-icon">
								<IconIdea size={32} />
							</div>
							<h3>Настраиваемые поля</h3>
							<p>
								Добавляйте собственные поля к клиентам, услугам и работам —
								текст, числа, даты, списки.
							</p>
						</div>
						<div className="feature-card">
							<div className="feature-icon">
								<IconShield size={32} />
							</div>
							<h3>Безопасность</h3>
							<p>
								JWT-аутентификация, защищённые заголовки, разграничение доступа.
								Данные под надёжной защитой.
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* Преимущества */}
			<section className="qf-section qf-section--alt">
				<div className="container">
					<h2 className="qf-section-title">Почему выбирают CRM Light</h2>
					<div className="features-grid">
						<div className="feature-card">
							<div className="feature-icon">
								<IconRocket size={32} />
							</div>
							<h3>Быстрый старт</h3>
							<p>
								Развёртывание за один день. Загрузите клиентов, настройте
								каталог услуг — и CRM готова к работе без обучения.
							</p>
						</div>
						<div className="feature-card">
							<div className="feature-icon">
								<IconRocket size={32} />
							</div>
							<h3>Интеграция с Записью</h3>
							<p>
								Подключите модуль Электронная запись — клиенты и записи
								синхронизируются автоматически. Единая экосистема.
							</p>
						</div>
						<div className="feature-card">
							<div className="feature-icon">
								<IconShield size={32} />
							</div>
							<h3>Безопасность данных</h3>
							<p>
								JWT-аутентификация, rate limiting, защищённые HTTP-заголовки.
								Клиентская база под надёжной защитой.
							</p>
						</div>
						<div className="feature-card">
							<div className="feature-icon">
								<IconStar size={32} />
							</div>
							<h3>Простота без компромиссов</h3>
							<p>
								Никаких лишних модулей. Только то, что реально нужно малому
								бизнесу — и всё это работает из коробки.
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* Для кого */}
			<section className="qf-section">
				<div className="container">
					<h2 className="qf-section-title">Для кого подходит CRM Light</h2>
					<p className="qf-section-sub">
						Везде, где нужен учёт клиентов и услуг — CRM Light наведёт порядок
					</p>
					<div className="features-grid">
						<div className="feature-card">
							<div className="feature-icon">
								<IconStar size={36} />
							</div>
							<h3>Салоны красоты и спа</h3>
							<p>
								Ведение клиентской базы, учёт мастеров, история посещений и
								оказанных услуг.
							</p>
						</div>
						<div className="feature-card">
							<div className="feature-icon">
								<IconTarget size={36} />
							</div>
							<h3>Клиники и медцентры</h3>
							<p>
								Карточки пациентов, каталог медицинских услуг, учёт врачей и
								приёмов.
							</p>
						</div>
						<div className="feature-card">
							<div className="feature-icon">
								<IconRocket size={36} />
							</div>
							<h3>Автосервисы</h3>
							<p>
								База клиентов с автомобилями, каталог работ, история
								обслуживания каждого авто.
							</p>
						</div>
						<div className="feature-card">
							<div className="feature-icon">
								<IconChart size={36} />
							</div>
							<h3>Консалтинг и услуги</h3>
							<p>
								Учёт клиентов и проектов, фиксация консультаций и выполненных
								работ.
							</p>
						</div>
						<div className="feature-card">
							<div className="feature-icon">
								<IconRocket size={36} />
							</div>
							<h3>Сервисные центры</h3>
							<p>
								Приём заявок, каталог работ, карточки клиентов с техникой и
								историей обращений.
							</p>
						</div>
						<div className="feature-card">
							<div className="feature-icon">
								<IconIdea size={36} />
							</div>
							<h3>Любой бизнес</h3>
							<p>
								Везде, где есть клиенты и услуги, CRM Light станет простым и
								удобным инструментом учёта.
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* FAQ */}
			<section className="qf-section" id="faq">
				<div className="container">
					<h2 className="qf-section-title">Частые вопросы о CRM Light</h2>
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
							<summary itemProp="name">
								Чем CRM Light отличается от обычного Excel?
							</summary>
							<div
								itemScope
								itemProp="acceptedAnswer"
								itemType="https://schema.org/Answer"
							>
								<p itemProp="text">
									CRM Light — это специализированная система с готовыми формами,
									фильтрами, поиском и автоматизацией. Не нужно создавать
									таблицы и формулы — всё уже настроено для учёта клиентов и
									услуг.
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
								Как работает интеграция с Электронной записью?
							</summary>
							<div
								itemScope
								itemProp="acceptedAnswer"
								itemType="https://schema.org/Answer"
							>
								<p itemProp="text">
									При подключении модуля «Электронная запись на приём» клиенты
									из онлайн-записи автоматически попадают в CRM Light, а записи
									отображаются в истории работ.
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
								Подходит ли CRM Light для салонов красоты, клиник и
								aвтосервисов?
							</summary>
							<div
								itemScope
								itemProp="acceptedAnswer"
								itemType="https://schema.org/Answer"
							>
								<p itemProp="text">
									Да, CRM Light разработана специально для малого бизнеса:
									салонов красоты, клиник, автосервисов, консалтинговых компаний
									и других сфер услуг.
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
								Можно ли добавлять свои поля к карточкам клиентов?
							</summary>
							<div
								itemScope
								itemProp="acceptedAnswer"
								itemType="https://schema.org/Answer"
							>
								<p itemProp="text">
									Да, можно добавлять настраиваемые поля: текст, числа, даты,
									списки. Это позволяет адаптировать CRM под специфику вашего
									бизнеса.
								</p>
							</div>
						</details>
						<details
							className="qf-faq-item"
							itemScope
							itemProp="mainEntity"
							itemType="https://schema.org/Question"
						>
							<summary itemProp="name">Можно ли экспортировать данные?</summary>
							<div
								itemScope
								itemProp="acceptedAnswer"
								itemType="https://schema.org/Answer"
							>
								<p itemProp="text">
									Да, все данные экспортируются в CSV: клиенты, услуги, работы.
									Файлы можно открыть в Excel, Google Sheets или использовать
									для отчётности.
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
								Сколько стоит и как начать работу?
							</summary>
							<div
								itemScope
								itemProp="acceptedAnswer"
								itemType="https://schema.org/Answer"
							>
								<p itemProp="text">
									Бесплатный тест 14 дней. Для запуска достаточно создать базу
									клиентов и каталог услуг — это занимает один рабочий день.
								</p>
							</div>
						</details>
					</div>
				</div>
			</section>

			{/* CTA */}
			<section className="cta-section">
				<div className="container">
					<h2>Готовы навести порядок в учёте клиентов?</h2>
					<p>
						Попробуйте CRM Light бесплатно 14 дней — без оборудования и сложной
						настройки. Оставьте заявку, и мы запустим систему за один день.
					</p>
					<div className="cta-actions">
						<button
							className="btn btn-primary btn-lg"
							onClick={() => open("Заявка: CRM Light", "CRM")}
						>
							Оставить заявку <ChevronRight size={16} />
						</button>
						<button
							className="btn btn-outline btn-lg"
							onClick={scrollToContacts}
						>
							Обсудить проект
						</button>
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
							<a href="tel:+79161586826" className="btn btn-secondary">
								+7 (916) 158 68 26
							</a>
							<a
								href="mailto:Andrey.OnlinePro@yandex.ru"
								className="btn btn-secondary"
							>
								Andrey.OnlinePro@yandex.ru
							</a>
						</div>
					</div>
				</div>
			</section>
		</article>
	);
}

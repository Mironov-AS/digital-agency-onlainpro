import { useEffect } from "react";
import {
	BarChart2,
	ChevronRight,
	Shield,
	Building2,
	Wrench,
	Globe,
	FileText,
	Briefcase,
	ClipboardList,
	Zap,
	Star,
	Truck,
	Package,
	CreditCard,
	AlertTriangle,
	Factory,
	BookOpen,
	Bot,
	MessageSquare,
	Clock,
	Eye,
	Layers,
	FolderOpen,
} from "lucide-react";
import { useTrialModal } from "../context/ModalContext";

export default function ERPLightPage() {
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
			"ERP Light — облачная ERP-система с ИИ-ассистентом для малого бизнеса | ОнлайнПро";
		let meta = document.querySelector('meta[name="description"]');
		if (!meta) {
			meta = document.createElement("meta");
			meta.name = "description";
			document.head.appendChild(meta);
		}
		meta.content =
			"ERP Light — облачная ERP-система с встроенным ИИ-ассистентом для малого и среднего бизнеса. Договоры, заказы, производство, отгрузки, финансы в едином интерфейсе. Москва, Санкт-Петербург, Новосибирск, Екатеринбург, Казань, вся Россия.";

		let keywords = document.querySelector('meta[name="keywords"]');
		if (!keywords) {
			keywords = document.createElement("meta");
			keywords.name = "keywords";
			document.head.appendChild(keywords);
		}
		keywords.content =
			"ERP система, ERP для малого бизнеса, облачная ERP, управление договорами, управление заказами, производственный учёт, ИИ ассистент, AI помощник ERP, ERP Москва, ERP Санкт-Петербург, ERP Россия, автоматизация бизнеса, облачная система управления, ERP без сервера, простая ERP";

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
		geoPlacename.content = "Россия";

		let ogTitle = document.querySelector('meta[property="og:title"]');
		if (!ogTitle) {
			ogTitle = document.createElement("meta");
			ogTitle.setAttribute("property", "og:title");
			document.head.appendChild(ogTitle);
		}
		ogTitle.content =
			"ERP Light — облачная ERP с ИИ-ассистентом для бизнеса в России";

		let ogDesc = document.querySelector('meta[property="og:description"]');
		if (!ogDesc) {
			ogDesc = document.createElement("meta");
			ogDesc.setAttribute("property", "og:description");
			document.head.appendChild(ogDesc);
		}
		ogDesc.content =
			"Управляйте договорами, заказами, производством и финансами в одной системе. ИИ-ассистент отвечает на вопросы по данным и помогает с документами.";

		let canonical = document.querySelector('link[rel="canonical"]');
		if (!canonical) {
			canonical = document.createElement("link");
			canonical.rel = "canonical";
			document.head.appendChild(canonical);
		}
		canonical.href = "https://онлайнпро.рф/product/erp-light";

		let ld = document.getElementById("erp-schema");
		if (!ld) {
			ld = document.createElement("script");
			ld.id = "erp-schema";
			ld.type = "application/ld+json";
			document.head.appendChild(ld);
		}
		ld.textContent = JSON.stringify({
			"@context": "https://schema.org",
			"@type": "SoftwareApplication",
			name: "ERP Light — облачная ERP-система с ИИ-ассистентом",
			applicationCategory: "BusinessApplication",
			operatingSystem: "Web",
			description:
				"Облачная ERP-система для управления договорами, заказами, производством, отгрузками и финансами. Встроенный ИИ-ассистент отвечает на вопросы по данным системы и помогает вносить информацию из документов.",
			featureList:
				"Договоры, заказы, счета, оплаты, отгрузки, рекламации, производство, контрагенты, номенклатура, аналитика, ИИ-ассистент, хранение файлов",
			areaServed: { "@type": "Country", name: "Россия" },
			audience: { "@type": "Audience", audienceType: "Малый и средний бизнес" },
			applicationSubCategory: "ERP",
			url: "https://онлайнпро.рф/product/erp-light",
		});

		let breadcrumb = document.getElementById("erp-breadcrumb");
		if (!breadcrumb) {
			breadcrumb = document.createElement("script");
			breadcrumb.id = "erp-breadcrumb";
			breadcrumb.type = "application/ld+json";
			document.head.appendChild(breadcrumb);
		}
		breadcrumb.textContent = JSON.stringify({
			"@context": "https://schema.org",
			"@type": "BreadcrumbList",
			itemListElement: [
				{
					"@type": "ListItem",
					position: 1,
					name: "Главная",
					item: "https://онлайнпро.рф/",
				},
				{
					"@type": "ListItem",
					position: 2,
					name: "Продукты",
					item: "https://онлайнпро.рф/#produkty",
				},
				{
					"@type": "ListItem",
					position: 3,
					name: "ERP Light",
					item: "https://онлайнпро.рф/product/erp-light",
				},
			],
		});

		return () => {
			document.title = "Цифровое агентство ОнлайнПро.РФ";
			const s = document.getElementById("erp-schema");
			if (s) s.remove();
			const b = document.getElementById("erp-breadcrumb");
			if (b) b.remove();
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
				content="ERP Light — облачная ERP-система с ИИ-ассистентом"
			/>
			<meta itemProp="applicationCategory" content="BusinessApplication" />
			<meta itemProp="operatingSystem" content="Web" />
			<meta itemProp="applicationSubCategory" content="ERP" />

			{/* Hero */}
			<section className="qf-hero">
				<div className="container">
					<div className="qf-hero-grid">
						<div className="qf-hero-text">
							<span className="qf-badge">Облачная ERP для бизнеса</span>
							<h1 className="qf-hero-title">
								Управление бизнесом{" "}
								<span className="qf-hero-accent">без хаоса</span> в таблицах и
								папках
							</h1>
							<p className="qf-hero-sub">
								ERP Light — облачная ERP-система с встроенным ИИ-ассистентом для
								малого и среднего бизнеса в России. Договоры, заказы,
								производство, отгрузки и финансы — всё в одном месте.
								ИИ-помощник знает данные вашей системы и берёт рутину на себя.
							</p>
							<div className="qf-hero-actions">
								<button
									className="btn btn-primary btn-lg"
									onClick={() => openTrial("erp-light", "ERP Light")}
								>
									Попробовать бесплатно <ChevronRight size={16} />
								</button>
								<a
									href="#erp-how"
									className="btn btn-outline btn-lg"
									onClick={(e) => {
										e.preventDefault();
										const target = document.getElementById("erp-how");
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
									<strong>ИИ</strong>
									<span>встроен</span>
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
									<span className="qf-mockup-title">Панель управления</span>
								</div>
								<div className="erp-dashboard-preview">
									<div className="erp-preview-stats">
										<div className="erp-stat-card">
											<div className="erp-stat-num">24</div>
											<div className="erp-stat-label">Договора</div>
										</div>
										<div className="erp-stat-card">
											<div className="erp-stat-num">87</div>
											<div className="erp-stat-label">Заказа</div>
										</div>
										<div className="erp-stat-card">
											<div className="erp-stat-num">1.2M</div>
											<div className="erp-stat-label">Оборот</div>
										</div>
									</div>
									<div className="erp-preview-table">
										<div className="erp-preview-header">
											<span>Заказ</span>
											<span>Клиент</span>
											<span>Сумма</span>
											<span>Статус</span>
										</div>
										<div className="erp-preview-row erp-preview-row--active">
											<span>#1042</span>
											<span>ООО Альфа</span>
											<span>185 000 &#x20BD;</span>
											<span className="erp-tag erp-tag--green">Оплачен</span>
										</div>
										<div className="erp-preview-row">
											<span>#1041</span>
											<span>ИП Петров</span>
											<span>42 500 &#x20BD;</span>
											<span className="erp-tag erp-tag--yellow">В работе</span>
										</div>
										<div className="erp-preview-row">
											<span>#1040</span>
											<span>ЗАО Бета</span>
											<span>320 000 &#x20BD;</span>
											<span className="erp-tag erp-tag--blue">Отгрузка</span>
										</div>
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
							<div className="qf-problem-icon">
								<FolderOpen size={28} />
							</div>
							<h3>Договоры и счета разбросаны</h3>
							<p>
								Excel-файлы на разных компьютерах, сканы в почте, бумажные папки
								в шкафу. Чтобы найти нужный документ, приходится обзванивать
								коллег.
							</p>
						</div>
						<div className="qf-problem-card">
							<div className="qf-problem-icon">
								<Layers size={28} />
							</div>
							<h3>Заказы теряются между отделами</h3>
							<p>
								Непонятно, что в производстве, что готово к отгрузке, по каким
								заказам просрочена оплата. Информация в головах сотрудников, а
								не в системе.
							</p>
						</div>
						<div className="qf-problem-card">
							<div className="qf-problem-icon">
								<AlertTriangle size={28} />
							</div>
							<h3>Внедрение ERP — это дорого и сложно</h3>
							<p>
								Классические ERP-системы требуют серверов, месяцев настройки и
								штата IT-специалистов. Для малого бизнеса это неподъёмная
								нагрузка.
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* How it works */}
			<section className="qf-section qf-section--alt" id="erp-how">
				<div className="container">
					<h2 className="qf-section-title">Как работает ERP Light</h2>
					<p className="qf-section-sub">
						Три шага — от договора до отгрузки и оплаты
					</p>
					<div className="features-grid">
						<div className="feature-card">
							<div className="feature-icon">
								<FileText size={32} />
							</div>
							<h3>Создайте договор и заказы</h3>
							<p>
								Оформите договор с контрагентом, привяжите заказы с
								номенклатурой. Система автоматически рассчитает суммы и сроки.
							</p>
						</div>
						<div className="feature-card">
							<div className="feature-icon">
								<Factory size={32} />
							</div>
							<h3>Контролируйте производство</h3>
							<p>
								Передайте заказы в производство. Отслеживайте этапы, сроки и
								готовность каждой позиции в реальном времени.
							</p>
						</div>
						<div className="feature-card">
							<div className="feature-icon">
								<Truck size={32} />
							</div>
							<h3>Отгрузите и получите оплату</h3>
							<p>
								Сформируйте отгрузку, назначьте водителя, распечатайте
								накладную. Привяжите оплату к счёту и закройте заказ.
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* AI Assistant — ключевое конкурентное преимущество */}
			<section className="qf-section">
				<div className="container">
					<h2 className="qf-section-title">
						ИИ-ассистент{" "}
						<span className="qf-hero-accent">знает ваш бизнес</span>
					</h2>
					<p className="qf-section-sub">
						Персональный помощник, встроенный в ERP. Работает сразу — без
						обучения и настройки
					</p>
					<div className="features-grid">
						<div className="feature-card">
							<div className="feature-icon">
								<MessageSquare size={28} />
							</div>
							<h3>Ответы на любые вопросы</h3>
							<p>
								Спросите на русском: «Какие договоры заканчиваются в этом
								месяце?», «Кто должен больше всех?», «Сколько заказов в
								производстве?» — ИИ мгновенно найдёт ответ в вашей базе.
							</p>
						</div>
						<div className="feature-card">
							<div className="feature-icon">
								<FileText size={28} />
							</div>
							<h3>Ввод данных из документов</h3>
							<p>
								Загрузите договор или счёт — ИИ-ассистент извлечёт номер,
								контрагента, сумму, сроки. Данные заполнятся автоматически, без
								ручного набора.
							</p>
						</div>
						<div className="feature-card">
							<div className="feature-icon">
								<Eye size={28} />
							</div>
							<h3>Контроль и рекомендации</h3>
							<p>
								ИИ следит за состоянием дел и подсказывает: просроченные
								платежи, узкие места в производстве, неоплаченные счета. Вы
								видите картину целиком.
							</p>
						</div>
					</div>
					<div className="erp-ai-demo">
						<div className="qf-mockup qf-mockup--admin">
							<div className="qf-mockup-bar">
								<span className="qf-mockup-dot" />
								<span className="qf-mockup-dot" />
								<span className="qf-mockup-dot" />
								<span className="qf-mockup-title">ИИ-ассистент</span>
							</div>
							<div className="erp-ai-chat">
								<div className="erp-ai-msg erp-ai-msg--user">
									<span className="erp-ai-avatar erp-ai-avatar--user">В</span>
									<div className="erp-ai-bubble erp-ai-bubble--user">
										Какие заказы нужно отгрузить на этой неделе?
									</div>
								</div>
								<div className="erp-ai-msg erp-ai-msg--bot">
									<span className="erp-ai-avatar erp-ai-avatar--bot">
										<Bot size={14} />
									</span>
									<div className="erp-ai-bubble erp-ai-bubble--bot">
										<p>
											На этой неделе запланировано <strong>3 отгрузки</strong>:
										</p>
										<ul>
											<li>
												<strong>Заказ #1042</strong> — ООО Альфа, 185 000 ₽,
												срок 15.05
											</li>
											<li>
												<strong>Заказ #1040</strong> — ЗАО Бета, 320 000 ₽, срок
												16.05
											</li>
											<li>
												<strong>Заказ #1038</strong> — ИП Сидоров, 67 000 ₽,
												срок 17.05
											</li>
										</ul>
										<p>
											Заказ #1040 имеет наивысший приоритет — рекомендую начать
											с него.
										</p>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Features */}
			<section className="qf-section">
				<div className="container">
					<h2 className="qf-section-title">Возможности ERP Light</h2>
					<p className="qf-section-sub">
						Всё необходимое для управления бизнесом — без лишнего
					</p>
					<div className="features-grid">
						<div className="feature-card">
							<div className="feature-icon">
								<Bot size={24} />
							</div>
							<h3>ИИ-ассистент</h3>
							<p>
								Встроенный помощник знает все данные системы. Отвечает на
								вопросы, помогает вносить информацию из документов и анализирует
								показатели.
							</p>
						</div>
						<div className="feature-card">
							<div className="feature-icon">
								<FileText size={24} />
							</div>
							<h3>Договоры</h3>
							<p>
								Создание, нумерация, привязка к контрагенту. Контроль сроков,
								сумм и статусов каждого договора.
							</p>
						</div>
						<div className="feature-card">
							<div className="feature-icon">
								<ClipboardList size={24} />
							</div>
							<h3>Заказы</h3>
							<p>
								Заказы с позициями из номенклатуры, автоматический расчёт сумм,
								история изменений и комментарии.
							</p>
						</div>
						<div className="feature-card">
							<div className="feature-icon">
								<CreditCard size={24} />
							</div>
							<h3>Счета и оплаты</h3>
							<p>
								Формирование счетов, контроль оплат, импорт банковских выписок.
								Полная картина дебиторской задолженности.
							</p>
						</div>
						<div className="feature-card">
							<div className="feature-icon">
								<Factory size={24} />
							</div>
							<h3>Производство</h3>
							<p>
								Планирование и контроль производственных заданий. Этапы, сроки,
								ответственные, статусы готовности.
							</p>
						</div>
						<div className="feature-card">
							<div className="feature-icon">
								<Truck size={24} />
							</div>
							<h3>Отгрузки и логистика</h3>
							<p>
								Календарь отгрузок, назначение водителей, маршруты доставки,
								формирование накладных и ТТН.
							</p>
						</div>
						<div className="feature-card">
							<div className="feature-icon">
								<AlertTriangle size={24} />
							</div>
							<h3>Рекламации</h3>
							<p>
								Регистрация претензий, привязка к заказам и договорам. Контроль
								сроков рассмотрения и решений.
							</p>
						</div>
						<div className="feature-card">
							<div className="feature-icon">
								<Building2 size={24} />
							</div>
							<h3>Контрагенты</h3>
							<p>
								Единая база поставщиков и покупателей. Реквизиты, контакты,
								история сделок и задолженностей.
							</p>
						</div>
						<div className="feature-card">
							<div className="feature-icon">
								<Package size={24} />
							</div>
							<h3>Номенклатура</h3>
							<p>
								Каталог товаров и услуг с категориями, ценами и единицами
								измерения. Быстрый поиск и фильтрация.
							</p>
						</div>
						<div className="feature-card">
							<div className="feature-icon">
								<BarChart2 size={24} />
							</div>
							<h3>Отчёты и аналитика</h3>
							<p>
								Дашборд с ключевыми показателями. Отчёты по продажам, оплатам,
								производству и отгрузкам.
							</p>
						</div>
						<div className="feature-card">
							<div className="feature-icon">
								<BookOpen size={24} />
							</div>
							<h3>Хранилище файлов</h3>
							<p>
								Загрузка документов, привязка к договорам и заказам. Поддержка
								PDF, Excel, Word и изображений.
							</p>
						</div>
						<div className="feature-card">
							<div className="feature-icon">
								<Shield size={24} />
							</div>
							<h3>Безопасность и аудит</h3>
							<p>
								JWT-аутентификация, журнал действий, разграничение доступа.
								Полная прозрачность операций.
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* Screenshots / UI mockups */}
			<section className="qf-section qf-screens">
				<div className="container">
					<h2 className="qf-section-title">Интерфейс ERP Light</h2>
					<p className="qf-section-sub">
						Три ключевых экрана — заказы, производство и финансы
					</p>
					<div className="qf-screens-grid">
						<div className="qf-screen-card">
							<div className="qf-mockup qf-mockup--admin">
								<div className="qf-mockup-bar">
									<span className="qf-mockup-dot" />
									<span className="qf-mockup-dot" />
									<span className="qf-mockup-dot" />
									<span className="qf-mockup-title">Карточка заказа</span>
								</div>
								<div className="erp-order-preview">
									<div className="erp-order-header">
										<div className="erp-order-num">Заказ #1042</div>
										<span className="erp-tag erp-tag--green">Оплачен</span>
									</div>
									<div className="erp-order-fields">
										<div className="erp-order-field">
											<span>Контрагент</span>
											<span>ООО Альфа</span>
										</div>
										<div className="erp-order-field">
											<span>Договор</span>
											<span>ДП-2026/015</span>
										</div>
										<div className="erp-order-field">
											<span>Сумма</span>
											<span>185 000 &#x20BD;</span>
										</div>
										<div className="erp-order-field">
											<span>Срок</span>
											<span>15.05.2026</span>
										</div>
									</div>
									<div className="erp-order-positions">
										<div className="erp-pos-row">
											<span>Профиль AL-40</span>
											<span>120 шт</span>
											<span>96 000 &#x20BD;</span>
										</div>
										<div className="erp-pos-row">
											<span>Стеклопакет 2к</span>
											<span>60 шт</span>
											<span>89 000 &#x20BD;</span>
										</div>
									</div>
								</div>
							</div>
							<h3>Карточка заказа</h3>
							<p>
								Полная информация: контрагент, договор, позиции, суммы, сроки и
								статус — всё в одном окне
							</p>
						</div>

						<div className="qf-screen-card">
							<div className="qf-mockup qf-mockup--admin">
								<div className="qf-mockup-bar">
									<span className="qf-mockup-dot" />
									<span className="qf-mockup-dot" />
									<span className="qf-mockup-dot" />
									<span className="qf-mockup-title">Производство</span>
								</div>
								<div className="erp-production-preview">
									<div className="erp-prod-row">
										<span className="erp-prod-name">
											Заказ #1042 — Профиль AL-40
										</span>
										<div className="erp-prod-bar">
											<div className="erp-prod-fill" style={{ width: "75%" }} />
										</div>
										<span className="erp-prod-pct">75%</span>
									</div>
									<div className="erp-prod-row">
										<span className="erp-prod-name">
											Заказ #1041 — Фурнитура
										</span>
										<div className="erp-prod-bar">
											<div
												className="erp-prod-fill"
												style={{ width: "100%" }}
											/>
										</div>
										<span className="erp-prod-pct">100%</span>
									</div>
									<div className="erp-prod-row">
										<span className="erp-prod-name">
											Заказ #1040 — Стеклопакет 2к
										</span>
										<div className="erp-prod-bar">
											<div className="erp-prod-fill" style={{ width: "30%" }} />
										</div>
										<span className="erp-prod-pct">30%</span>
									</div>
								</div>
							</div>
							<h3>Производство</h3>
							<p>
								Прогресс-бары, этапы и сроки — видно, что готово, а что отстаёт
								от плана
							</p>
						</div>

						<div className="qf-screen-card">
							<div className="qf-mockup qf-mockup--stats">
								<div className="qf-mockup-bar">
									<span className="qf-mockup-dot" />
									<span className="qf-mockup-dot" />
									<span className="qf-mockup-dot" />
									<span className="qf-mockup-title">Финансы</span>
								</div>
								<div className="qf-stats-content">
									<div className="qf-stats-row">
										<div className="qf-stats-card">
											<div className="qf-stats-num">1.2M</div>
											<div className="qf-stats-label">Оборот за месяц</div>
										</div>
										<div className="qf-stats-card">
											<div className="qf-stats-num">340K</div>
											<div className="qf-stats-label">Дебиторка</div>
										</div>
									</div>
									<div className="qf-stats-chart">
										<div className="qf-chart-bar" style={{ height: "60%" }}>
											<span>Янв</span>
										</div>
										<div className="qf-chart-bar" style={{ height: "75%" }}>
											<span>Фев</span>
										</div>
										<div className="qf-chart-bar" style={{ height: "50%" }}>
											<span>Мар</span>
										</div>
										<div className="qf-chart-bar" style={{ height: "90%" }}>
											<span>Апр</span>
										</div>
										<div className="qf-chart-bar" style={{ height: "85%" }}>
											<span>Май</span>
										</div>
									</div>
								</div>
							</div>
							<h3>Финансовая аналитика</h3>
							<p>
								Оборот, задолженности, динамика по месяцам — решения на основе
								цифр, а не интуиции
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* Benefits */}
			<section className="qf-section qf-benefits">
				<div className="container">
					<h2 className="qf-section-title">Почему выбирают ERP Light</h2>
					<div className="features-grid">
						<div className="qf-benefit">
							<div className="qf-benefit-icon">
								<Bot size={28} />
							</div>
							<h3>ИИ из коробки</h3>
							<p>
								Встроенный ИИ-ассистент работает сразу. Задайте вопрос —
								получите ответ за секунды. Никакой настройки, обучения или
								дополнительных подписок.
							</p>
						</div>
						<div className="qf-benefit">
							<div className="qf-benefit-icon">
								<Zap size={28} />
							</div>
							<h3>Запуск за один день</h3>
							<p>
								Облачная система — не нужно устанавливать ПО, покупать серверы,
								нанимать IT-специалистов. Открыли браузер — и работаете.
							</p>
						</div>
						<div className="qf-benefit">
							<div className="qf-benefit-icon">
								<Layers size={28} />
							</div>
							<h3>Полный цикл</h3>
							<p>
								От договора до отгрузки в одной системе. Данные не теряются при
								переносе между отделами. Один источник правды для всей команды.
							</p>
						</div>
						<div className="qf-benefit">
							<div className="qf-benefit-icon">
								<Shield size={28} />
							</div>
							<h3>Надёжная защита</h3>
							<p>
								JWT-аутентификация, журнал аудита, разграничение доступа по
								ролям. Данные вашей компании под контролем.
							</p>
						</div>
						<div className="qf-benefit">
							<div className="qf-benefit-icon">
								<Star size={28} />
							</div>
							<h3>Простота без компромиссов</h3>
							<p>
								Интерфейс понятен с первого взгляда. Никаких лишних модулей и
								сложных настроек — только то, что реально нужно.
							</p>
						</div>
						<div className="qf-benefit">
							<div className="qf-benefit-icon">
								<Clock size={28} />
							</div>
							<h3>Экономия времени</h3>
							<p>
								ИИ берёт на себя рутину: заполнение документов, поиск данных,
								анализ показателей. Сотрудники занимаются делом, а не бумажной
								работой.
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* For whom */}
			<section className="qf-section">
				<div className="container">
					<h2 className="qf-section-title">Для кого подходит ERP Light</h2>
					<p className="qf-section-sub">
						Везде, где есть заказы, производство и отгрузки — ERP Light наведёт
						порядок
					</p>
					<div className="features-grid">
						<div className="feature-card">
							<Factory size={32} className="qf-audience-icon" />
							<h3>Производство</h3>
							<p>
								Управление заказами, производственными заданиями, контроль
								сроков и отгрузок готовой продукции в Москве, Казани,
								Екатеринбурге и по всей России.
							</p>
						</div>
						<div className="feature-card">
							<Truck size={32} className="qf-audience-icon" />
							<h3>Торговля и логистика</h3>
							<p>
								Договоры с поставщиками и покупателями, заказы, счета, оплаты и
								маршруты доставки в одном месте.
							</p>
						</div>
						<div className="feature-card">
							<Wrench size={32} className="qf-audience-icon" />
							<h3>Сервис и обслуживание</h3>
							<p>
								Учёт заказов на обслуживание, контроль выполнения работ,
								формирование актов и счетов для клиентов.
							</p>
						</div>
						<div className="feature-card">
							<Building2 size={32} className="qf-audience-icon" />
							<h3>Строительство</h3>
							<p>
								Договоры подряда, заказы материалов, контроль поставок и
								финансовая отчётность по объектам в Санкт-Петербурге,
								Новосибирске, Краснодаре.
							</p>
						</div>
						<div className="feature-card">
							<Briefcase size={32} className="qf-audience-icon" />
							<h3>Оптовая торговля</h3>
							<p>
								Работа с контрагентами, формирование заказов по номенклатуре,
								маршруты доставки и товарно-транспортные накладные.
							</p>
						</div>
						<div className="feature-card">
							<Globe size={32} className="qf-audience-icon" />
							<h3>Любой B2B-бизнес</h3>
							<p>
								Везде, где есть договоры, заказы и отгрузки — от ИП до компании
								с десятками сотрудников. Работает в любом регионе России.
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* FAQ for SEO */}
			<section
				className="qf-section"
				itemScope
				itemType="https://schema.org/FAQPage"
			>
				<div className="container">
					<h2 className="qf-section-title">Частые вопросы о ERP Light</h2>
					<div className="qf-faq">
						<details
							className="qf-faq-item"
							itemScope
							itemProp="mainEntity"
							itemType="https://schema.org/Question"
						>
							<summary itemProp="name">
								Чем ERP Light отличается от 1С и SAP?
							</summary>
							<div
								itemScope
								itemProp="acceptedAnswer"
								itemType="https://schema.org/Answer"
							>
								<p itemProp="text">
									ERP Light — это облачная система, созданная для малого и
									среднего бизнеса. В отличие от 1С и SAP, она не требует
									серверного оборудования, длительного внедрения и штата
									IT-специалистов. Запуск занимает один рабочий день, интерфейс
									понятен без обучения, а встроенный ИИ-ассистент берёт рутину
									на себя. Система работает в браузере из любой точки России —
									Москвы, Санкт-Петербурга, Новосибирска, Казани или любого
									другого города.
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
								Можно ли вести производственный учёт в ERP Light?
							</summary>
							<div
								itemScope
								itemProp="acceptedAnswer"
								itemType="https://schema.org/Answer"
							>
								<p itemProp="text">
									Да. ERP Light включает модуль производства: вы создаёте
									производственные задания из заказов, отслеживаете этапы
									выполнения, контролируете сроки и процент готовности. Каждое
									задание привязано к заказу и договору — полная прозрачность от
									заявки до готовой продукции.
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
								Как работает ИИ-ассистент в ERP Light?
							</summary>
							<div
								itemScope
								itemProp="acceptedAnswer"
								itemType="https://schema.org/Answer"
							>
								<p itemProp="text">
									ИИ-ассистент встроен в систему и знает все данные вашей ERP —
									договоры, заказы, платежи, контрагентов, производство. Вы
									задаёте вопрос на русском языке, а ИИ мгновенно находит ответ
									в базе данных. Помимо ответов, ИИ помогает вносить информацию
									из документов: загрузили договор — данные заполнились
									автоматически. Ассистент поддерживает разные LLM-провайдеры и
									работает сразу после запуска системы.
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
								Какие данные хранятся в ERP Light?
							</summary>
							<div
								itemScope
								itemProp="acceptedAnswer"
								itemType="https://schema.org/Answer"
							>
								<p itemProp="text">
									ERP Light хранит договоры, заказы, счета, оплаты, отгрузки,
									рекламации, контрагентов, номенклатуру товаров и услуг,
									производственные задания и файлы документов. Вся информация
									изолирована между клиентами и защищена JWT-аутентификацией.
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
								Подходит ли ERP Light для малого бизнеса в регионах?
							</summary>
							<div
								itemScope
								itemProp="acceptedAnswer"
								itemType="https://schema.org/Answer"
							>
								<p itemProp="text">
									Да, ERP Light создан именно для малого и среднего бизнеса.
									Система работает в облаке — достаточно браузера и интернета.
									Нет привязки к городу: Москва, Санкт-Петербург, Новосибирск,
									Екатеринбург, Казань, Краснодар, Ростов-на-Дону, Самара,
									Воронеж, Пермь — из любого региона России можно начать работу
									за один день.
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
								Есть ли контроль оплат и дебиторской задолженности?
							</summary>
							<div
								itemScope
								itemProp="acceptedAnswer"
								itemType="https://schema.org/Answer"
							>
								<p itemProp="text">
									Да. Вы формируете счета из заказов, фиксируете оплаты,
									импортируете банковские выписки. Система автоматически
									рассчитывает дебиторскую задолженность и показывает
									просроченные платежи. Финансовый дашборд даёт полную картину
									по обороту и задолженностям.
								</p>
							</div>
						</details>
						<details
							className="qf-faq-item"
							itemScope
							itemProp="mainEntity"
							itemType="https://schema.org/Question"
						>
							<summary itemProp="name">Как начать работу с ERP Light?</summary>
							<div
								itemScope
								itemProp="acceptedAnswer"
								itemType="https://schema.org/Answer"
							>
								<p itemProp="text">
									Оставьте заявку на сайте — мы настроим систему под ваш бизнес
									за один рабочий день. Загрузим номенклатуру и контрагентов,
									покажем основные сценарии работы. Специальных навыков не
									требуется — интерфейс интуитивно понятен, а ИИ-ассистент
									подскажет при необходимости.
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
						<h2>Готовы навести порядок в управлении бизнесом?</h2>
						<p>
							Запустите ERP Light за один день — облачная система с встроенным
							ИИ-ассистентом для договоров, заказов, производства и финансов.
							Оставьте заявку, и мы покажем, как это работает.
						</p>
						<div className="qf-cta-actions">
							<button
								className="btn btn-primary btn-lg"
								onClick={() => openTrial("erp-light", "ERP Light")}
							>
								Попробовать бесплатно <ChevronRight size={16} />
							</button>
							<button
								className="btn btn-outline btn-lg"
								onClick={scrollToContacts}
							>
								Обсудить проект
							</button>
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

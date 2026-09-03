import { useEffect } from "react";
import { ChevronRight } from "lucide-react";
import {
	IconQueue,
	IconRocket,
	IconShield,
	IconChart,
	IconChecklist,
	IconTarget,
	IconStar,
	IconClock,
	IconTrend,
	IconIdea,
	IconUsers,
	IconList,
	IconMoney,
} from "../components/BrandIcons";
import { useLeadModal, useTrialModal } from "../context/ModalContext";

const SEO = {
	title:
		"QueueFlow — Электронная очередь для клиник, МФЦ, банков | Без оборудования",
	description:
		"QueueFlow — система электронной очереди без оборудования. QR-запись, публичное табло, рекламный модуль, аналитика. Для клиник, МФЦ, банков, сервисных центров в Москве, Санкт-Петербурге и по всей России. Запуск за 1 день.",
	keywords:
		"электронная очередь, QR очередь, система управления очередью, талонная система, клиники, МФЦ, банки, без терминала, онлайн запись",
	geoRegion: "RU-MOW,RU-SPE,RU",
	geoPlacename: "Россия, Москва, Санкт-Петербург",
};

export default function QueueFlowPage() {
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
			"mobile-web-app-capable": "yes",
			"apple-mobile-web-app-capable": "yes",
			"apple-mobile-web-app-status-bar-style": "black-translucent",
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
			name: "QueueFlow — Электронная очередь",
			applicationCategory: "BusinessApplication",
			operatingSystem: "Web",
			description:
				"Веб-платформа для управления электронной очередью без дополнительного оборудования",
			offers: {
				"@type": "Offer",
				price: "0",
				priceCurrency: "RUB",
				description: "Демо-доступ бесплатно",
			},
			provider: {
				"@type": "Organization",
				name: "ОнлайнПро.РФ",
				url: "https://онлайнпро.рф",
				areaServed: ["Москва", "Санкт-Петербург", "Россия"],
			},
			aggregateRating: {
				"@type": "AggregateRating",
				ratingValue: "4.9",
				reviewCount: "47",
			},
			featureList:
				"QR-запись, публичное табло, рекламный модуль, аналитика, управление услугами",
		};

		let ld = document.getElementById("product-schema");
		if (!ld) {
			ld = document.createElement("script");
			ld.id = "product-schema";
			ld.type = "application/ld+json";
			document.head.appendChild(ld);
		}
		ld.textContent = JSON.stringify(schemaData);

		const faqSchema = {
			"@context": "https://schema.org",
			"@type": "FAQPage",
			mainEntity: [
				{
					"@type": "Question",
					name: "Нужно ли покупать специальное оборудование для запуска?",
					acceptedAnswer: {
						"@type": "Answer",
						text: "Нет. QueueFlow — это веб-платформа, которая работает в обычном браузере. Для запуска достаточно распечатать QR-код и вывести публичное табло на любой экран.",
					},
				},
				{
					"@type": "Question",
					name: "Сколько времени занимает внедрение?",
					acceptedAnswer: {
						"@type": "Answer",
						text: "Один рабочий день. Мы настроим систему, создадим услуги, сгенерируем QR-код и обучим ваш персонал.",
					},
				},
			],
		};

		let faqLd = document.getElementById("faq-schema");
		if (!faqLd) {
			faqLd = document.createElement("script");
			faqLd.id = "faq-schema";
			faqLd.type = "application/ld+json";
			document.head.appendChild(faqLd);
		}
		faqLd.textContent = JSON.stringify(faqSchema);

		return () => {
			document.title = "Цифровое агентство ОнлайнПро.РФ";
			["product-schema", "faq-schema"].forEach((id) => {
				const el = document.getElementById(id);
				if (el) el.remove();
			});
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
								<IconRocket size={14} />
								Готовое решение
							</span>
							<h1 className="qf-hero-title">
								Электронная очередь без терминалов и бумажных талонов
							</h1>
							<p className="qf-hero-sub">
								QueueFlow — веб-платформа для организации живой очереди.
								Посетители берут талон через QR-код, а персонал управляет
								потоком с любого устройства. Идеально для клиник, МФЦ, банков и
								сервисных центров.
							</p>
							<div className="qf-hero-actions">
								<button
									className="btn btn-primary btn-lg"
									onClick={() =>
										openTrial("queue", "QueueFlow — Электронная очередь")
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
									<strong>25–35%</strong>
									<span>сокращение ожидания</span>
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
									<span className="qf-mockup-title">Публичное табло</span>
								</div>
								<div className="board-content">
									<div className="board-now">
										<div className="board-label">СЕЙЧАС ОБСЛУЖИВАЕТСЯ</div>
										<div className="board-number">A-047</div>
										<div className="board-service">Окно 3 · Консультация</div>
									</div>
									<div className="board-queue">
										<div className="board-label">В ОЧЕРЕДИ</div>
										<div className="board-items">
											<span className="board-ticket">A-048</span>
											<span className="board-ticket">A-049</span>
											<span className="board-ticket">B-012</span>
											<span className="board-ticket">A-050</span>
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
								<IconUsers size={28} />
							</div>
							<h3>Клиенты уходят, не дождавшись</h3>
							<p>
								Неясно, сколько времени занимает ожидание. Нет информации о
								позиции в очереди. Посетители уходят к конкурентам.
							</p>
						</div>
						<div className="qf-problem-card">
							<div className="qf-problem-icon">
								<IconList size={28} />
							</div>
							<h3>Бумажные талоны и журналы</h3>
							<p>
								Ручной учёт и путаница с номерами. Талончики теряются и
								забываются. Невозможно анализировать загрузку.
							</p>
						</div>
						<div className="qf-problem-card">
							<div className="qf-problem-icon">
								<IconMoney size={28} />
							</div>
							<h3>Терминалы стоят дорого</h3>
							<p>
								Покупка — сотни тысяч рублей. Установка и настройка — месяцы.
								Постоянное обслуживание и ремонт.
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* Как работает */}
			<section className="qf-section qf-section--alt" id="how">
				<div className="container">
					<h2 className="qf-section-title">Как работает QueueFlow</h2>
					<p className="qf-section-sub">
						Три простых шага — от QR-кода до обслуживания
					</p>
					<div className="features-grid">
						<div className="feature-card">
							<div className="feature-icon">
								<IconQueue size={32} />
							</div>
							<h3>Посетитель сканирует QR-код</h3>
							<p>
								Разместите QR-код на стойке или входе. Посетитель сканирует
								камерой телефона, выбирает услугу и получает электронный талон.
							</p>
						</div>
						<div className="feature-card">
							<div className="feature-icon">
								<IconChart size={32} />
							</div>
							<h3>Табло показывает очередь</h3>
							<p>
								На экране — текущий номер и позиция. Посетитель видит своё место
								и время ожидания. Не нужно стоять в очереди у стойки.
							</p>
						</div>
						<div className="feature-card">
							<div className="feature-icon">
								<IconRocket size={32} />
							</div>
							<h3>Оператор вызывает одним кликом</h3>
							<p>
								Нажмите «Следующий» на панели оператора. Табло мгновенно
								обновляется, посетитель подходит к нужному окну.
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* Возможности */}
			<section className="qf-section">
				<div className="container">
					<h2 className="qf-section-title">Возможности системы</h2>
					<p className="qf-section-sub">
						Всё, что нужно для организации очереди — и даже больше
					</p>
					<div className="features-grid">
						<div className="feature-card">
							<div className="feature-icon">
								<IconQueue size={32} />
							</div>
							<h3>Самозапись через QR-код</h3>
							<p>
								Посетитель сканирует код и записывается без регистрации. Можно
								также отправить прямую ссылку.
							</p>
						</div>
						<div className="feature-card">
							<div className="feature-icon">
								<IconChecklist size={32} />
							</div>
							<h3>Несколько услуг</h3>
							<p>
								Настройте разные услуги с индивидуальными полями формы — текст,
								телефон, email, дата.
							</p>
						</div>
						<div className="feature-card">
							<div className="feature-icon">
								<IconChart size={32} />
							</div>
							<h3>Публичное табло</h3>
							<p>
								Выведите на экран в зале ожидания. Работает в браузере — без
								дополнительного ПО.
							</p>
						</div>
						<div className="feature-card">
							<div className="feature-icon">
								<IconRocket size={32} />
							</div>
							<h3>Рекламный модуль</h3>
							<p>
								Превратите экран ожидания в рекламную площадку. Ротация
								изображений и видео между вызовами.
							</p>
						</div>
						<div className="feature-card">
							<div className="feature-icon">
								<IconTarget size={32} />
							</div>
							<h3>Работает на любом устройстве</h3>
							<p>
								Оператор управляет очередью с телефона, планшета или компьютера
								— где угодно.
							</p>
						</div>
						<div className="feature-card">
							<div className="feature-icon">
								<IconTrend size={32} />
							</div>
							<h3>Аналитика и статистика</h3>
							<p>
								Графики по дням, услугам и нагрузке. Данные для принятия
								управленческих решений.
							</p>
						</div>
						<div className="feature-card">
							<div className="feature-icon">
								<IconShield size={32} />
							</div>
							<h3>Безопасность</h3>
							<p>
								JWT-аутентификация, rate limiting, защищённые HTTP-заголовки.
								Ваши данные под защитой.
							</p>
						</div>
						<div className="feature-card">
							<div className="feature-icon">
								<IconChecklist size={32} />
							</div>
							<h3>Панель администратора</h3>
							<p>
								Управление услугами, пользователями, настройками, рекламой и
								QR-кодами — всё в одном месте.
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* Интерфейс */}
			<section className="qf-section qf-section--alt" id="interface">
				<div className="container">
					<h2 className="qf-section-title">Интерфейс QueueFlow</h2>
					<p className="qf-section-sub">
						Три ключевых экрана — для посетителей, операторов и администраторов
					</p>
					<div className="screens-grid">
						<div className="screen-card">
							<div className="phone-mockup">
								<div className="phone-mockup-bar">
									<span className="phone-mockup-title">Самозапись</span>
								</div>
								<div className="phone-content">
									<div className="phone-field">
										<label className="phone-label">Услуга</label>
										<div className="phone-select">Консультация</div>
									</div>
									<div className="phone-field">
										<label className="phone-label">Ваше имя</label>
										<div className="phone-input">Иван Петров</div>
									</div>
									<div className="phone-field">
										<label className="phone-label">Телефон</label>
										<div className="phone-input">+7 (999) 123-45-67</div>
									</div>
									<div className="phone-btn">Встать в очередь</div>
								</div>
							</div>
							<h3>Самозапись</h3>
							<p>
								Посетитель сканирует QR-код и за 15 секунд получает электронный
								талон
							</p>
						</div>
						<div className="screen-card">
							<div className="qf-mockup qf-mockup--board">
								<div className="qf-mockup-bar">
									<span className="qf-mockup-dot" />
									<span className="qf-mockup-dot" />
									<span className="qf-mockup-dot" />
									<span className="qf-mockup-title">Панель оператора</span>
								</div>
								<div className="board-content">
									<div className="board-now">
										<div className="board-label">ТЕКУЩИЙ КЛИЕНТ</div>
										<div className="board-number" style={{ fontSize: "32px" }}>
											A-047
										</div>
										<div className="board-service">
											Иван Петров · Консультация
										</div>
									</div>
									<div className="board-queue">
										<div className="board-items" style={{ display: "block" }}>
											<div
												className="board-ticket"
												style={{
													display: "flex",
													justifyContent: "space-between",
													alignItems: "center",
												}}
											>
												<span>A-048</span>
												<span style={{ fontSize: "11px", opacity: 0.7 }}>
													Мария С. · Ожидает
												</span>
											</div>
											<div
												className="board-ticket"
												style={{
													display: "flex",
													justifyContent: "space-between",
													alignItems: "center",
												}}
											>
												<span>A-049</span>
												<span style={{ fontSize: "11px", opacity: 0.7 }}>
													Алексей К. · Ожидает
												</span>
											</div>
										</div>
									</div>
								</div>
							</div>
							<h3>Панель оператора</h3>
							<p>
								Оператор вызывает клиентов и контролирует поток в реальном
								времени
							</p>
						</div>
						<div className="screen-card">
							<div className="qf-mockup qf-mockup--board">
								<div className="qf-mockup-bar">
									<span className="qf-mockup-dot" />
									<span className="qf-mockup-dot" />
									<span className="qf-mockup-dot" />
									<span className="qf-mockup-title">Аналитика</span>
								</div>
								<div className="board-content">
									<div
										className="board-now"
										style={{ display: "flex", gap: "24px" }}
									>
										<div style={{ flex: 1, textAlign: "center" }}>
											<div
												className="board-number"
												style={{ fontSize: "28px" }}
											>
												156
											</div>
											<div className="board-label">Обслужено сегодня</div>
										</div>
										<div style={{ flex: 1, textAlign: "center" }}>
											<div
												className="board-number"
												style={{ fontSize: "28px" }}
											>
												4.2 мин
											</div>
											<div className="board-label">Среднее ожидание</div>
										</div>
									</div>
									<div className="board-queue">
										<div
											className="board-label"
											style={{ marginBottom: "12px" }}
										>
											График по дням
										</div>
										<div
											style={{
												display: "flex",
												alignItems: "flex-end",
												justifyContent: "space-between",
												height: "40px",
												paddingTop: "8px",
											}}
										>
											<div
												style={{
													flex: 1,
													height: "20px",
													background:
														"linear-gradient(to top, #a855f7, #22d3ee)",
													borderRadius: "2px",
												}}
											/>
											<div
												style={{
													flex: 1,
													height: "30px",
													background:
														"linear-gradient(to top, #a855f7, #22d3ee)",
													borderRadius: "2px",
												}}
											/>
											<div
												style={{
													flex: 1,
													height: "25px",
													background:
														"linear-gradient(to top, #a855f7, #22d3ee)",
													borderRadius: "2px",
												}}
											/>
											<div
												style={{
													flex: 1,
													height: "35px",
													background:
														"linear-gradient(to top, #a855f7, #22d3ee)",
													borderRadius: "2px",
												}}
											/>
											<div
												style={{
													flex: 1,
													height: "40px",
													background:
														"linear-gradient(to top, #a855f7, #22d3ee)",
													borderRadius: "2px",
												}}
											/>
										</div>
									</div>
								</div>
							</div>
							<h3>Аналитика</h3>
							<p>
								Графики по дням, услугам и нагрузке — для принятия решений на
								основе данных
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* Преимущества */}
			<section className="qf-section qf-section--alt">
				<div className="container">
					<h2 className="qf-section-title">Почему выбирают QueueFlow</h2>
					<div className="features-grid">
						<div className="feature-card">
							<div className="feature-icon">
								<IconRocket size={32} />
							</div>
							<h3>Быстрый старт</h3>
							<p>
								Развёртывание за один день. Не нужно покупать терминалы,
								принтеры или специальное оборудование — достаточно QR-кода на
								стойке.
							</p>
						</div>
						<div className="feature-card">
							<div className="feature-icon">
								<IconClock size={32} />
							</div>
							<h3>Меньше ожидания</h3>
							<p>
								Сокращение субъективного времени ожидания на 25–35%. Посетитель
								видит свой номер и знает, когда подойдёт его очередь.
							</p>
						</div>
						<div className="feature-card">
							<div className="feature-icon">
								<IconShield size={32} />
							</div>
							<h3>Безопасность данных</h3>
							<p>
								JWT-аутентификация, rate limiting, защищённые HTTP-заголовки.
								Данные хранятся на вашем сервере или в облаке.
							</p>
						</div>
						<div className="feature-card">
							<div className="feature-icon">
								<IconTrend size={32} />
							</div>
							<h3>Контроль нагрузки</h3>
							<p>
								Реальные данные по потоку клиентов, пиковым часам и загрузке
								персонала. Принимайте решения на основе цифр, а не интуиции.
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* Для кого */}
			<section className="qf-section">
				<div className="container">
					<h2 className="qf-section-title">Для кого подходит QueueFlow</h2>
					<p className="qf-section-sub">
						Везде, где есть живая очередь — QueueFlow наведёт порядок
					</p>
					<div className="features-grid">
						<div className="feature-card">
							<div className="feature-icon">
								<IconStar size={32} />
							</div>
							<h3>Клиники и медцентры</h3>
							<p>
								Запись на приём, распределение по кабинетам, информирование
								пациентов о текущем номере.
							</p>
						</div>
						<div className="feature-card">
							<div className="feature-icon">
								<IconTarget size={32} />
							</div>
							<h3>МФЦ и госуслуги</h3>
							<p>
								Управление большим потоком посетителей, несколько услуг и окон
								обслуживания.
							</p>
						</div>
						<div className="feature-card">
							<div className="feature-icon">
								<IconChart size={32} />
							</div>
							<h3>Банки и страховые</h3>
							<p>
								VIP-обслуживание, приоритетные очереди, аналитика загрузки
								отделений.
							</p>
						</div>
						<div className="feature-card">
							<div className="feature-icon">
								<IconIdea size={32} />
							</div>
							<h3>Учебные заведения</h3>
							<p>
								Приёмные комиссии, деканаты, библиотеки — организация потока
								студентов.
							</p>
						</div>
						<div className="feature-card">
							<div className="feature-icon">
								<IconRocket size={32} />
							</div>
							<h3>Сервисные центры</h3>
							<p>
								Приём техники, выдача заказов, консультации — клиенты ждут с
								комфортом.
							</p>
						</div>
						<div className="feature-card">
							<div className="feature-icon">
								<IconIdea size={32} />
							</div>
							<h3>Любой бизнес</h3>
							<p>
								Везде, где клиенты ждут обслуживания, QueueFlow повысит
								лояльность и эффективность.
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* Рекламный модуль */}
			<section className="qf-section">
				<div className="container">
					<div className="ad-section">
						<div className="ad-section-content">
							<h2>Рекламный модуль — монетизация экрана ожидания</h2>
							<p>
								Превратите экран с табло в полноценную рекламную площадку. Пока
								очередь не движется, на табло воспроизводятся рекламные
								материалы — изображения и видео. При вызове талона реклама
								мгновенно приостанавливается.
							</p>
							<div className="ad-features">
								<div className="ad-feature">
									<strong>Форматы:</strong> JPEG, PNG, GIF, WebP, MP4, WebM
								</div>
								<div className="ad-feature">
									<strong>Файлы до 200 МБ</strong>, загрузка по чанкам
								</div>
								<div className="ad-feature">
									<strong>Настраиваемый</strong> порядок и интервалы ротации
								</div>
								<div className="ad-feature">
									<strong>Модерация:</strong> загрузка → проверка → показ
								</div>
							</div>
						</div>
						<div className="ad-section-visual">
							<div className="qf-mockup qf-mockup--board">
								<div className="qf-mockup-bar">
									<span className="qf-mockup-dot" />
									<span className="qf-mockup-dot" />
									<span className="qf-mockup-dot" />
									<span className="qf-mockup-title">Рекламный ролик</span>
								</div>
								<div
									className="board-content"
									style={{
										display: "flex",
										alignItems: "center",
										justifyContent: "center",
										minHeight: "180px",
										background:
											"linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(34, 211, 238, 0.1))",
									}}
								>
									<div style={{ textAlign: "center" }}>
										<IconRocket size={48} />
										<div
											style={{
												fontSize: "14px",
												marginTop: "8px",
												opacity: 0.7,
											}}
										>
											Рекламный модуль
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* FAQ */}
			<section className="qf-section" id="faq">
				<div className="container">
					<h2 className="qf-section-title">
						Частые вопросы об электронной очереди
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
							<summary itemProp="name">
								Нужно ли покупать специальное оборудование для запуска?
							</summary>
							<div
								itemScope
								itemProp="acceptedAnswer"
								itemType="https://schema.org/Answer"
							>
								<p itemProp="text">
									Нет. QueueFlow — это веб-платформа, которая работает в обычном
									браузере. Для запуска достаточно распечатать QR-код и вывести
									публичное табло на любой экран: телевизор, монитор или
									планшет. Терминалы, принтеры и специальные устройства не
									требуются.
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
								Как посетители записываются в электронную очередь?
							</summary>
							<div
								itemScope
								itemProp="acceptedAnswer"
								itemType="https://schema.org/Answer"
							>
								<p itemProp="text">
									Посетитель сканирует QR-код камерой телефона, выбирает нужную
									услугу, заполняет короткую форму и мгновенно получает
									электронный талон в браузере. Скачивать приложение не нужно —
									всё работает онлайн.
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
								Подходит ли QueueFlow для клиник, МФЦ и банков?
							</summary>
							<div
								itemScope
								itemProp="acceptedAnswer"
								itemType="https://schema.org/Answer"
							>
								<p itemProp="text">
									Да, система универсальна. QueueFlow используется в медицинских
									учреждениях, многофункциональных центрах, банках, учебных
									заведениях и сервисных центрах по всей России — от Москвы и
									Санкт-Петербурга до региональных городов.
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
								Можно ли управлять несколькими услугами одновременно?
							</summary>
							<div
								itemScope
								itemProp="acceptedAnswer"
								itemType="https://schema.org/Answer"
							>
								<p itemProp="text">
									Да. Создавайте любое количество услуг с индивидуальными
									формами записи — текст, телефон, email, дата. Система ведёт
									раздельную очередь по каждой услуге.
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
								Как работает рекламный модуль на экране ожидания?
							</summary>
							<div
								itemScope
								itemProp="acceptedAnswer"
								itemType="https://schema.org/Answer"
							>
								<p itemProp="text">
									Пока очередь не движется, на публичном табло воспроизводятся
									рекламные изображения и видео. При вызове следующего клиента
									реклама мгновенно приостанавливается и возвращается после
									обслуживания.
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
								Сколько времени занимает внедрение системы?
							</summary>
							<div
								itemScope
								itemProp="acceptedAnswer"
								itemType="https://schema.org/Answer"
							>
								<p itemProp="text">
									Один рабочий день. Мы настроим систему, создадим услуги,
									сгенерируем QR-код и обучим ваш персонал. Специальных навыков
									не требуется.
								</p>
							</div>
						</details>
					</div>
				</div>
			</section>

			{/* CTA */}
			<section className="cta-section">
				<div className="container">
					<h2>Готовы навести порядок в очередях?</h2>
					<p>
						Запустите QueueFlow за один день — без оборудования и сложной
						интеграции. Оставьте заявку, и мы настроим систему под ваш бизнес.
					</p>
					<div className="cta-actions">
						<button
							className="btn btn-primary btn-lg"
							onClick={() => open("Заявка: QueueFlow", "Очередь")}
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

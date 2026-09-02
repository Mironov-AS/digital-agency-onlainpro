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
	IconBooking,
	IconClock,
} from "../components/BrandIcons";
import { useLeadModal, useTrialModal } from "../context/ModalContext";

const SEO = {
	title:
		"Электронная запись на приём — онлайн-система для салонов, клиник, автосервисов | ОнлайнПро",
	description:
		"Система электронной записи клиентов на приём. Каталог услуг, онлайн-запись, виджет для сайта, QR-код, табло, аналитика и экспорт CSV. Для салонов красоты, медцентров, автосервисов в Москве и России. Запуск за 1 день.",
	keywords:
		"электронная запись, онлайн запись, запись на приём, виджет записи, талон на приём, салон красоты, клиника, автосервис",
	geoRegion: "RU-MOW,RU-SPE,RU",
	geoPlacename: "Россия, Москва, Санкт-Петербург",
};

export default function BookingFlowPage() {
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

		const schemaData = {
			"@context": "https://schema.org",
			"@type": "SoftwareApplication",
			name: "Электронная запись на приём",
			applicationCategory: "BusinessApplication",
			operatingSystem: "Web",
			description:
				"Веб-платформа для управления записями клиентов на приём. Каталог услуг, онлайн-запись, виджет для сайта, QR-код, табло, аналитика.",
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
				"Каталог услуг, мастера, расписание, виджет записи, QR-код, табло, аналитика, экспорт CSV, интеграция с CRM",
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
								<IconBooking size={14} />
								Готовое решение
							</span>
							<h1 className="qf-hero-title">
								Электронная запись на приём{" "}
								<span className="qf-hero-accent">без бумажных журналов</span>
							</h1>
							<p className="qf-hero-sub">
								Онлайн-система для управления записями клиентов. Каталог услуг,
								виджет для сайта, QR-код для самозаписи, табло записей и
								аналитика. Для салонов красоты, клиник, автосервисов.
							</p>
							<div className="qf-hero-actions">
								<button
									className="btn btn-primary btn-lg"
									onClick={() =>
										openTrial("booking", "Электронная запись на приём")
									}
								>
									Попробовать бесплатно <ChevronRight size={16} />
								</button>
								<a
									href="#booking-how"
									className="btn btn-outline btn-lg"
									onClick={(e) => {
										e.preventDefault();
										const target = document.getElementById("booking-how");
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
									<strong>0 ₽</strong>
									<span>за оборудование</span>
								</div>
								<div className="qf-stat">
									<strong>100%</strong>
									<span>онлайн</span>
								</div>
							</div>
						</div>
						<div className="qf-hero-visual">
							<div className="qf-mockup qf-mockup--board">
								<div className="qf-mockup-bar">
									<span className="qf-mockup-dot" />
									<span className="qf-mockup-dot" />
									<span className="qf-mockup-dot" />
									<span className="qf-mockup-title">Онлайн-запись</span>
								</div>
								<div className="board-content">
									<div className="board-now">
										<div className="board-label">Сегодня, 15:00</div>
										<div className="board-number" style={{ fontSize: "32px" }}>
											Сидорова М.
										</div>
										<div className="board-service">
											Стрижка женская · Мастер: Анна
										</div>
									</div>
									<div className="board-queue">
										<div className="board-label">В очереди</div>
										<div className="board-items">
											<span className="board-ticket">16:00</span>
											<span className="board-ticket">17:30</span>
											<span className="board-ticket">18:00</span>
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
					<p className="qf-section-sub">
						Ведёте записи в блокнотах и таблицах?
					</p>
					<div className="qf-problems-grid">
						<div className="qf-problem-card">
							<div className="qf-problem-icon">
								<IconChecklist size={28} />
							</div>
							<h3>Записи теряются и путаются</h3>
							<p>
								Бумажные журналы заполняются, найти нужную запись сложно, а при
								потере блокнота данные пропадают навсегда.
							</p>
						</div>
						<div className="qf-problem-card">
							<div className="qf-problem-icon">
								<IconClock size={28} />
							</div>
							<h3>Непонятно расписание</h3>
							<p>
								Клиенты звонят узнать свободное время, мастера путаются в
								записях, двойные бронирования — обычное дело.
							</p>
						</div>
						<div className="qf-problem-card">
							<div className="qf-problem-icon">
								<IconMoney size={28} />
							</div>
							<h3>Нет онлайн-записи</h3>
							<p>
								Клиенты не могут записаться самостоятельно в удобное время —
								только звонки и сообщения, которые нужно отслеживать.
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* Как работает */}
			<section className="qf-section qf-section--alt" id="booking-how">
				<div className="container">
					<h2 className="qf-section-title">Как работает система</h2>
					<p className="qf-section-sub">
						От настройки до онлайн-записи за один день
					</p>
					<div className="features-grid">
						<div className="feature-card">
							<div className="feature-icon">
								<IconTag size={32} />
							</div>
							<h3>Настройте услуги и мастеров</h3>
							<p>
								Создайте каталог услуг с ценами и длительностью. Добавьте
								мастеров и их расписание.
							</p>
						</div>
						<div className="feature-card">
							<div className="feature-icon">
								<IconRocket size={32} />
							</div>
							<h3>Разместите виджет</h3>
							<p>
								Добавьте виджет записи на сайт или отправьте клиентам ссылку для
								самостоятельной записи.
							</p>
						</div>
						<div className="feature-card">
							<div className="feature-icon">
								<IconChart size={32} />
							</div>
							<h3>Управляйте и анализируйте</h3>
							<p>
								Панель администратора для управления записями, табло для зала и
								аналитика по записям.
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
						Всё для управления онлайн-записью в одном месте
					</p>
					<div className="features-grid">
						<div className="feature-card">
							<div className="feature-icon">
								<IconTag size={32} />
							</div>
							<h3>Каталог услуг</h3>
							<p>Услуги с ценами, длительностью и категориями</p>
						</div>
						<div className="feature-card">
							<div className="feature-icon">
								<IconUsers size={32} />
							</div>
							<h3>Мастера и расписание</h3>
							<p>Учёт специалистов и их график работы</p>
						</div>
						<div className="feature-card">
							<div className="feature-icon">
								<IconRocket size={32} />
							</div>
							<h3>Виджет для сайта</h3>
							<p>Вставьте форму записи на любой сайт</p>
						</div>
						<div className="feature-card">
							<div className="feature-icon">
								<IconBooking size={32} />
							</div>
							<h3>QR-код для записи</h3>
							<p>Ссылка для самозаписи клиентам</p>
						</div>
						<div className="feature-card">
							<div className="feature-icon">
								<IconChart size={32} />
							</div>
							<h3>Табло записей</h3>
							<p>Экран в зале с текущей и следующей записью</p>
						</div>
						<div className="feature-card">
							<div className="feature-icon">
								<IconTrend size={32} />
							</div>
							<h3>Аналитика</h3>
							<p>Статистика по записям и загрузке мастеров</p>
						</div>
						<div className="feature-card">
							<div className="feature-icon">
								<IconMoney size={32} />
							</div>
							<h3>Экспорт в CSV</h3>
							<p>Выгрузка данных для отчётности</p>
						</div>
						<div className="feature-card">
							<div className="feature-icon">
								<IconShield size={32} />
							</div>
							<h3>Журнал действий</h3>
							<p>История всех изменений в записях</p>
						</div>
					</div>
				</div>
			</section>

			{/* Преимущества */}
			<section className="qf-section qf-section--alt">
				<div className="container">
					<h2 className="qf-section-title">Почему выбирают систему</h2>
					<p className="qf-section-sub">
						Простое решение для управления записями
					</p>
					<div className="features-grid">
						<div className="feature-card">
							<div className="feature-icon">
								<IconRocket size={32} />
							</div>
							<h3>Быстрый старт</h3>
							<p>
								Развёртывание за один день. Настройте услуги, добавьте мастеров
								— и система готова к работе.
							</p>
						</div>
						<div className="feature-card">
							<div className="feature-icon">
								<IconIdea size={32} />
							</div>
							<h3>Онлайн-запись 24/7</h3>
							<p>
								Клиенты записываются самостоятельно в удобное время — без
								звонков и сообщений.
							</p>
						</div>
						<div className="feature-card">
							<div className="feature-icon">
								<IconShield size={32} />
							</div>
							<h3>Безопасность данных</h3>
							<p>JWT-аутентификация. Данные хранятся надёжно и защищены.</p>
						</div>
						<div className="feature-card">
							<div className="feature-icon">
								<IconStar size={32} />
							</div>
							<h3>Интеграция с CRM</h3>
							<p>
								Синхронизация с CRM Light — клиенты попадают в базу
								автоматически.
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* Для кого */}
			<section className="qf-section">
				<div className="container">
					<h2 className="qf-section-title">Для кого подходит</h2>
					<p className="qf-section-sub">
						Везде, где есть запись на приём — система наведёт порядок
					</p>
					<div className="features-grid">
						<div className="feature-card">
							<div className="feature-icon">
								<IconStar size={36} />
							</div>
							<h3>Салоны красоты</h3>
							<p>Маникюр, стрижки, косметология — запись мастеров и услуг.</p>
						</div>
						<div className="feature-card">
							<div className="feature-icon">
								<IconTarget size={36} />
							</div>
							<h3>Клиники и медцентры</h3>
							<p>Запись на приём к врачам, процедуры, консультации.</p>
						</div>
						<div className="feature-card">
							<div className="feature-icon">
								<IconRocket size={36} />
							</div>
							<h3>Автосервисы</h3>
							<p>Запись на диагностику, ремонт, техобслуживание.</p>
						</div>
						<div className="feature-card">
							<div className="feature-icon">
								<IconChart size={36} />
							</div>
							<h3>Фитнес и спорт</h3>
							<p>Запись на тренировки, сеансы, консультации.</p>
						</div>
						<div className="feature-card">
							<div className="feature-icon">
								<IconIdea size={36} />
							</div>
							<h3>Образование</h3>
							<p>Запись на курсы, мастер-классы, консультации.</p>
						</div>
						<div className="feature-card">
							<div className="feature-icon">
								<IconBooking size={36} />
							</div>
							<h3>Любой бизнес</h3>
							<p>Везде, где нужна запись на услуги или приём.</p>
						</div>
					</div>
				</div>
			</section>

			{/* FAQ */}
			<section className="qf-section" id="faq">
				<div className="container">
					<h2 className="qf-section-title">Частые вопросы</h2>
					<div className="qf-faq">
						<details
							className="qf-faq-item"
							itemScope
							itemProp="mainEntity"
							itemType="https://schema.org/Question"
						>
							<summary itemProp="name">
								Как клиенты смогут записываться?
							</summary>
							<div
								itemScope
								itemProp="acceptedAnswer"
								itemType="https://schema.org/Answer"
							>
								<p itemProp="text">
									После настройки вы получите виджет для установки на сайт и
									ссылку для записи. Клиенты смогут выбрать услугу, мастера и
									удобное время самостоятельно.
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
								Можно ли синхронизировать с календарём?
							</summary>
							<div
								itemScope
								itemProp="acceptedAnswer"
								itemType="https://schema.org/Answer"
							>
								<p itemProp="text">
									Да, записи можно экспортировать в CSV и синхронизировать с
									Google Calendar или другими календарями.
								</p>
							</div>
						</details>
						<details
							className="qf-faq-item"
							itemScope
							itemProp="mainEntity"
							itemType="https://schema.org/Question"
						>
							<summary itemProp="name">Сколько стоит и как начать?</summary>
							<div
								itemScope
								itemProp="acceptedAnswer"
								itemType="https://schema.org/Answer"
							>
								<p itemProp="text">
									Бесплатный тест 14 дней. Для запуска настройте каталог услуг и
									расписание мастеров — это занимает один рабочий день.
								</p>
							</div>
						</details>
					</div>
				</div>
			</section>

			{/* CTA */}
			<section className="cta-section">
				<div className="container">
					<h2>Готовы навести порядок в записях?</h2>
					<p>
						Запустите систему онлайн-записи за один день. Оставьте заявку, и мы
						настроим систему под ваш бизнес.
					</p>
					<div className="cta-actions">
						<button
							className="btn btn-primary btn-lg"
							onClick={() => open("Заявка: Электронная запись", "Запись")}
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

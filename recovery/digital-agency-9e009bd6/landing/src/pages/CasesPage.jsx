import { useEffect } from "react";
import { Link } from "react-router-dom";
import {
	ChevronRight,
	TrendingUp,
	Users,
	Zap,
	BarChart3,
	Building2,
	HeartPulse,
	Scissors,
	Wrench,
} from "lucide-react";
import { useLeadModal } from "../context/ModalContext";

const CASES = [
	{
		icon: HeartPulse,
		client: "Сеть медицинских клиник",
		industry: "Медицина",
		product: "QueueFlow — Электронная очередь",
		problem:
			"Пациенты уходили, не дождавшись приёма. Бумажные талоны терялись, персонал не справлялся с пиковой нагрузкой.",
		solution:
			"Внедрили QueueFlow — QR-запись, публичное табло и панель оператора. Запуск за 1 день без покупки терминалов.",
		results: [
			{ metric: "35%", label: "сокращение времени ожидания" },
			{ metric: "1 день", label: "на запуск системы" },
			{ metric: "0 ₽", label: "затрат на оборудование" },
		],
		tags: ["Электронная очередь", "Медицина", "Автоматизация"],
		link: "/product/queue",
	},
	{
		icon: Scissors,
		client: "Сеть салонов красоты",
		industry: "Сфера услуг",
		product: "CRM Light + Электронная запись",
		problem:
			"Запись велась в бумажных журналах и мессенджерах. Клиенты забывали о визитах, администраторы тратили часы на ручное планирование.",
		solution:
			"Объединили CRM Light и систему электронной записи. Клиенты записываются онлайн, администратор видит загрузку в реальном времени.",
		results: [
			{ metric: "40%", label: "снижение no-show" },
			{ metric: "2×", label: "рост повторных визитов" },
			{ metric: "12 ч", label: "экономия времени администратора в неделю" },
		],
		tags: ["CRM", "Онлайн-запись", "Салоны красоты"],
		link: "/product/crm-light",
	},
	{
		icon: Building2,
		client: "Мебельное производство",
		industry: "Производство",
		product: "ERP Light",
		problem:
			"Учёт заказов вёлся в Excel, сырьё заканчивалось неожиданно, сроки производства постоянно срывались.",
		solution:
			"Внедрили ERP Light: управление заказами, склад сырья и материалов, интеграция с CRM и календарём производства.",
		results: [
			{ metric: "30%", label: "сокращение сроков производства" },
			{ metric: "0", label: "неожиданных дефицитов сырья" },
			{ metric: "100%", label: "прозрачность загрузки цеха" },
		],
		tags: ["ERP", "Производство", "Склад"],
		link: "/product/erp-light",
	},
	{
		icon: Wrench,
		client: "Сервисный центр по ремонту техники",
		industry: "Сервис",
		product: "Электронная запись + CRM Light",
		problem:
			"Клиенты звонили, чтобы узнать статус ремонта. Мастера тратили время на устные отчёты вместо работы.",
		solution:
			"Внедрили единую систему: онлайн-запись на приём, учёт заказов в CRM, статусы ремонта видны клиенту в личном кабинете.",
		results: [
			{ metric: "50%", label: "меньше звонков в call-центр" },
			{ metric: "20%", label: "рост пропускной способности" },
			{ metric: "4.9", label: "средняя оценка клиентов" },
		],
		tags: ["Сервис", "CRM", "Онлайн-запись"],
		link: "/product/booking",
	},
];

export default function CasesPage() {
	const { open } = useLeadModal();

	useEffect(() => {
		document.title =
			"Кейсы ОнлайнПро.РФ — реализованные проекты | Цифровое агентство";

		// Meta description
		let meta = document.querySelector('meta[name="description"]');
		if (!meta) {
			meta = document.createElement("meta");
			meta.name = "description";
			document.head.appendChild(meta);
		}
		meta.content =
			"Портфолио проектов ОнлайнПро.РФ: электронная очередь для клиник, CRM для салонов, ERP для производства, автоматизация сервисных центров. Реальные цифры и результаты. Москва, Санкт-Петербург, Россия.";

		// Keywords
		let keywords = document.querySelector('meta[name="keywords"]');
		if (!keywords) {
			keywords = document.createElement("meta");
			keywords.name = "keywords";
			document.head.appendChild(keywords);
		}
		keywords.content =
			"кейсы, портфолио, проекты, электронная очередь, CRM, ERP, автоматизация, веб-разработка, MVP, ОнлайнПро";

		// GEO теги
		let geoRegion = document.querySelector('meta[name="geo.region"]');
		if (!geoRegion) {
			geoRegion = document.createElement("meta");
			geoRegion.name = "geo.region";
			document.head.appendChild(geoRegion);
		}
		geoRegion.content = "RU-MOW,RU-SPE,RU";

		let geoPlacename = document.querySelector('meta[name="geo.placename"]');
		if (!geoPlacename) {
			geoPlacename = document.createElement("meta");
			geoPlacename.name = "geo.placename";
			document.head.appendChild(geoPlacename);
		}
		geoPlacename.content = "Россия, Москва, Санкт-Петербург";

		// OG теги
		let ogTitle = document.querySelector('meta[property="og:title"]');
		if (!ogTitle) {
			ogTitle = document.createElement("meta");
			ogTitle.setAttribute("property", "og:title");
			document.head.appendChild(ogTitle);
		}
		ogTitle.content = "Кейсы ОнлайнПро.РФ — реализованные проекты";

		let ogDesc = document.querySelector('meta[property="og:description"]');
		if (!ogDesc) {
			ogDesc = document.createElement("meta");
			ogDesc.setAttribute("property", "og:description");
			document.head.appendChild(ogDesc);
		}
		ogDesc.content =
			"Электронная очередь для клиник, CRM для салонов, ERP для производства. Реальные цифры: 35% сокращение очередей, 40% снижение no-show.";

		let ld = document.getElementById("cases-schema");
		if (!ld) {
			ld = document.createElement("script");
			ld.id = "cases-schema";
			ld.type = "application/ld+json";
			document.head.appendChild(ld);
		}
		ld.textContent = JSON.stringify({
			"@context": "https://schema.org",
			"@type": "CollectionPage",
			name: "Кейсы ОнлайнПро.РФ",
			description:
				"Портфолио реализованных проектов: электронная очередь, CRM, ERP, автоматизация.",
			hasPart: CASES.map((c) => ({
				"@type": "Article",
				headline: `${c.product} — ${c.client}`,
				description: c.problem,
				about: { "@type": "Thing", name: c.industry },
				author: { "@id": "https://онлайнпро.рф/#organization" },
				publisher: { "@id": "https://онлайнпро.рф/#organization" },
			})),
			breadcrumb: {
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
						name: "Кейсы",
						item: "https://онлайнпро.рф/cases",
					},
				],
			},
		});

		return () => {
			document.title =
				"Цифровое агентство ОнлайнПро.РФ — разработка сайтов, MVP, автоматизация бизнеса";
			const s = document.getElementById("cases-schema");
			if (s) s.remove();
		};
	}, []);

	return (
		<article className="cases-page">
			{/* Hero */}
			<section className="section">
				<div className="container">
					<h1
						id="cases-heading"
						className="section-title"
						style={{ marginTop: 16 }}
					>
						Кейсы <span style={{ color: "var(--blue)" }}>ОнлайнПро.РФ</span>
					</h1>
					<p
						className="cases-intro"
						style={{
							fontSize: 18,
							color: "var(--text-muted)",
							maxWidth: 700,
							lineHeight: 1.7,
						}}
					>
						Реальные проекты с измеримыми результатами. От стартапов до
						корпораций — каждый кейс показывает, как цифровые решения меняют
						бизнес.
					</p>
				</div>
			</section>

			{/* Cases */}
			<section className="section section-gray">
				<div className="container">
					<div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
						{CASES.map((c, idx) => {
							const Icon = c.icon;
							return (
								<article
									key={idx}
									className="pricing-card"
									style={{ textAlign: "left", padding: 32 }}
									itemScope
									itemType="https://schema.org/Article"
								>
									<meta
										itemProp="headline"
										content={`${c.product} — ${c.client}`}
									/>
									<meta itemProp="description" content={c.problem} />
									<div
										style={{
											display: "flex",
											alignItems: "center",
											gap: 12,
											marginBottom: 12,
										}}
									>
										<div
											style={{
												width: 40,
												height: 40,
												borderRadius: 10,
												background: "var(--blue)",
												color: "#fff",
												display: "flex",
												alignItems: "center",
												justifyContent: "center",
											}}
										>
											<Icon size={20} />
										</div>
										<div>
											<h2 style={{ fontSize: 20, margin: 0 }} itemProp="name">
												{c.client}
											</h2>
											<p
												style={{
													margin: 0,
													color: "var(--text-muted)",
													fontSize: 14,
												}}
											>
												{c.industry} · {c.product}
											</p>
										</div>
									</div>

									<div
										style={{
											display: "grid",
											gridTemplateColumns:
												"repeat(auto-fit, minmax(220px, 1fr))",
											gap: 24,
											margin: "20px 0",
										}}
									>
										<div>
											<h4
												style={{
													fontSize: 13,
													textTransform: "uppercase",
													color: "var(--text-muted)",
													marginBottom: 6,
													letterSpacing: 0.5,
												}}
											>
												Проблема
											</h4>
											<p style={{ margin: 0, lineHeight: 1.6, fontSize: 15 }}>
												{c.problem}
											</p>
										</div>
										<div>
											<h4
												style={{
													fontSize: 13,
													textTransform: "uppercase",
													color: "var(--text-muted)",
													marginBottom: 6,
													letterSpacing: 0.5,
												}}
											>
												Решение
											</h4>
											<p style={{ margin: 0, lineHeight: 1.6, fontSize: 15 }}>
												{c.solution}
											</p>
										</div>
									</div>

									<div
										style={{
											display: "flex",
											flexWrap: "wrap",
											gap: 16,
											margin: "20px 0",
										}}
									>
										{c.results.map((r, i) => (
											<div
												key={i}
												style={{
													background: "#fff",
													border: "1px solid var(--border)",
													borderRadius: 10,
													padding: "16px 20px",
													minWidth: 160,
													flex: 1,
												}}
											>
												<div
													style={{
														fontSize: 24,
														fontWeight: 700,
														color: "var(--blue)",
													}}
												>
													{r.metric}
												</div>
												<div
													style={{
														fontSize: 13,
														color: "var(--text-muted)",
														marginTop: 4,
													}}
												>
													{r.label}
												</div>
											</div>
										))}
									</div>

									<div
										style={{
											display: "flex",
											flexWrap: "wrap",
											gap: 8,
											marginTop: 16,
										}}
									>
										{c.tags.map((t) => (
											<span
												key={t}
												style={{
													fontSize: 12,
													padding: "4px 10px",
													borderRadius: 20,
													background: "var(--bg-gray)",
													color: "var(--text-muted)",
												}}
											>
												{t}
											</span>
										))}
									</div>

									<div style={{ marginTop: 20 }}>
										<Link to={c.link} className="btn btn-outline btn-sm">
											Подробнее о продукте <ChevronRight size={14} />
										</Link>
									</div>
								</article>
							);
						})}
					</div>
				</div>
			</section>

			{/* Metrics summary */}
			<section className="section">
				<div className="container">
					<h2 className="section-title">Наши результаты в цифрах</h2>
					<div
						className="skills-grid"
						style={{
							gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
						}}
					>
						<div className="skill-card" style={{ textAlign: "center" }}>
							<div className="skill-icon" style={{ margin: "0 auto 12px" }}>
								<TrendingUp size={24} />
							</div>
							<h3 className="skill-title">50+</h3>
							<p className="skill-desc">реализованных проектов</p>
						</div>
						<div className="skill-card" style={{ textAlign: "center" }}>
							<div className="skill-icon" style={{ margin: "0 auto 12px" }}>
								<Zap size={24} />
							</div>
							<h3 className="skill-title">14 дней</h3>
							<p className="skill-desc">средний срок запуска MVP</p>
						</div>
						<div className="skill-card" style={{ textAlign: "center" }}>
							<div className="skill-icon" style={{ margin: "0 auto 12px" }}>
								<Users size={24} />
							</div>
							<h3 className="skill-title">15+</h3>
							<p className="skill-desc">лет в цифровых продуктах</p>
						</div>
						<div className="skill-card" style={{ textAlign: "center" }}>
							<div className="skill-icon" style={{ margin: "0 auto 12px" }}>
								<BarChart3 size={24} />
							</div>
							<h3 className="skill-title">30%</h3>
							<p className="skill-desc">средний рост эффективности</p>
						</div>
					</div>
				</div>
			</section>

			{/* CTA */}
			<section className="section section-gray">
				<div className="container">
					<div className="cta-block">
						<p>
							Есть задача, похожая на наши кейсы? Обсудим, как решить её для
							вашего бизнеса.
						</p>
						<button
							className="btn btn-primary"
							onClick={() => open("Заявка: кейс по моей отрасли", "Кейсы")}
						>
							Обсудить проект <ChevronRight size={14} />
						</button>
					</div>
				</div>
			</section>
		</article>
	);
}

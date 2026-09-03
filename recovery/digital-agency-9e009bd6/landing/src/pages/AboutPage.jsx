import { useEffect } from "react";

import {
	Rocket,
	Users,
	Target,
	Award,
	Calendar,
	ChevronRight,
} from "lucide-react";
import { useLeadModal } from "../context/ModalContext";

export default function AboutPage() {
	const { open } = useLeadModal();

	useEffect(() => {
		document.title =
			"О компании ОнлайнПро.РФ — 15+ лет в цифровых продуктах | Цифровое агентство";

		// Meta description
		let meta = document.querySelector('meta[name="description"]');
		if (!meta) {
			meta = document.createElement("meta");
			meta.name = "description";
			document.head.appendChild(meta);
		}
		meta.content =
			"История компании ОнлайнПро.РФ с 2009 года. 50+ реализованных проектов от стартапов до корпораций. Разработка сайтов, MVP, автоматизация бизнеса, внедрение ИИ в Москве, Санкт-Петербурге и по всей России.";

		// Keywords
		let keywords = document.querySelector('meta[name="keywords"]');
		if (!keywords) {
			keywords = document.createElement("meta");
			keywords.name = "keywords";
			document.head.appendChild(keywords);
		}
		keywords.content =
			"о компании, цифровое агентство, веб-разработка, автоматизация, ИИ, MVP, сайт под ключ, ОнлайнПро, Москва";

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
		ogTitle.content = "О компании ОнлайнПро.РФ — 15+ лет в цифровых продуктах";

		let ogDesc = document.querySelector('meta[property="og:description"]');
		if (!ogDesc) {
			ogDesc = document.createElement("meta");
			ogDesc.setAttribute("property", "og:description");
			document.head.appendChild(ogDesc);
		}
		ogDesc.content =
			"Цифровое агентство с 2009 года. 50+ проектов, 15+ лет опыта. Разработка сайтов, MVP, автоматизация, ИИ.";

		let ld = document.getElementById("about-schema");
		if (!ld) {
			ld = document.createElement("script");
			ld.id = "about-schema";
			ld.type = "application/ld+json";
			document.head.appendChild(ld);
		}
		ld.textContent = JSON.stringify({
			"@context": "https://schema.org",
			"@type": "AboutPage",
			name: "О компании ОнлайнПро.РФ",
			description:
				"Цифровое агентство с 2009 года. 50+ реализованных проектов. Разработка сайтов, MVP, автоматизация бизнеса, внедрение ИИ.",
			mainEntity: {
				"@id": "https://онлайнпро.рф/#organization",
			},
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
						name: "О компании",
						item: "https://онлайнпро.рф/about",
					},
				],
			},
		});

		return () => {
			document.title =
				"Цифровое агентство ОнлайнПро.РФ — разработка сайтов, MVP, автоматизация бизнеса";
			const s = document.getElementById("about-schema");
			if (s) s.remove();
		};
	}, []);

	return (
		<article className="about-page">
			{/* Hero */}
			<section className="section about-hero">
				<div className="container">
					<h1
						id="about-heading"
						className="section-title"
						style={{ marginTop: 16 }}
					>
						О компании{" "}
						<span style={{ color: "var(--blue)" }}>ОнлайнПро.РФ</span>
					</h1>
					<p
						className="about-mission"
						style={{
							fontSize: 18,
							color: "var(--text-muted)",
							maxWidth: 700,
							lineHeight: 1.7,
						}}
					>
						С 2009 года помогаем бизнесу расти через цифровые технологии. Не
						продаём шаблоны — проектируем решения под задачи клиента.
					</p>
				</div>
			</section>

			{/* Stats */}
			<section className="section section-gray">
				<div className="container">
					<div
						className="skills-grid"
						style={{
							gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
						}}
					>
						<div className="skill-card" style={{ textAlign: "center" }}>
							<div className="skill-icon" style={{ margin: "0 auto 12px" }}>
								<Calendar size={24} />
							</div>
							<h3 className="skill-title">2009</h3>
							<p className="skill-desc">год основания</p>
						</div>
						<div className="skill-card" style={{ textAlign: "center" }}>
							<div className="skill-icon" style={{ margin: "0 auto 12px" }}>
								<Rocket size={24} />
							</div>
							<h3 className="skill-title">50+</h3>
							<p className="skill-desc">реализованных проектов</p>
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
								<Award size={24} />
							</div>
							<h3 className="skill-title">100%</h3>
							<p className="skill-desc">фокус на результат</p>
						</div>
					</div>
				</div>
			</section>

			{/* Story */}
			<section className="section">
				<div className="container">
					<h2 className="section-title">Наша история</h2>
					<div style={{ maxWidth: 720, margin: "0 auto" }}>
						<p style={{ marginBottom: 16, lineHeight: 1.7 }}>
							Компания ОнлайнПро.РФ начала свой путь в 2009 году как небольшая
							команда разработчиков, специализирующаяся на веб-сайтах для малого
							бизнеса. За годы работы мы прошли путь от простых лендингов до
							сложных корпоративных систем: ERP, CRM, систем электронной очереди
							и записи, автоматизированных рабочих мест.
						</p>
						<p style={{ marginBottom: 16, lineHeight: 1.7 }}>
							Сегодня мы — полноценное цифровое агентство с экспертизой в
							веб-разработке, автоматизации бизнес-процессов и внедрении решений
							на базе искусственного интеллекта. Наши продукты работают в
							клиниках, МФЦ, банках, салонах красоты, мебельных производствах и
							розничных магазинах по всей России.
						</p>
						<p style={{ lineHeight: 1.7 }}>
							Мы верим, что технологии должны решать реальные задачи бизнеса.
							Поэтому каждый проект начинается с анализа процессов, а не с
							выбора шаблона.
						</p>
					</div>
				</div>
			</section>

			{/* Values */}
			<section className="section section-gray">
				<div className="container">
					<h2 className="section-title">Наши ценности</h2>
					<div className="why-grid">
						<div className="why-card">
							<Target size={24} className="why-check" />
							<div>
								<h3 className="why-title">Результат важнее процесса</h3>
								<p className="why-desc">
									Мы измеряем успех проекта метриками бизнеса, а не количеством
									страниц документации.
								</p>
							</div>
						</div>
						<div className="why-card">
							<Users size={24} className="why-check" />
							<div>
								<h3 className="why-title">Прозрачность на каждом этапе</h3>
								<p className="why-desc">
									Еженедельные отчёты, доступ к задачам и прямое общение с
									командой без менеджеров-посредников.
								</p>
							</div>
						</div>
						<div className="why-card">
							<Rocket size={24} className="why-check" />
							<div>
								<h3 className="why-title">Скорость без потери качества</h3>
								<p className="why-desc">
									MVP за 2 недели — не лозунг, а реальная практика. Проверено на
									десятках проектов.
								</p>
							</div>
						</div>
						<div className="why-card">
							<Award size={24} className="why-check" />
							<div>
								<h3 className="why-title">Индивидуальный подход</h3>
								<p className="why-desc">
									Мы не используем универсальных решений. Каждый проект получает
									архитектуру под конкретные задачи.
								</p>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Team */}
			<section className="section">
				<div className="container">
					<h2 className="section-title">Команда</h2>
					<div style={{ maxWidth: 600, margin: "0 auto", textAlign: "center" }}>
						<div
							style={{
								width: 80,
								height: 80,
								borderRadius: "50%",
								background: "var(--blue)",
								color: "#fff",
								display: "inline-flex",
								alignItems: "center",
								justifyContent: "center",
								fontSize: 32,
								fontWeight: 700,
								marginBottom: 16,
							}}
						>
							АО
						</div>
						<h3 style={{ fontSize: 22, marginBottom: 8 }}>Андрей ОнлайнПро</h3>
						<p style={{ color: "var(--text-muted)", marginBottom: 16 }}>
							Основатель и руководитель проектов
						</p>
						<p style={{ lineHeight: 1.7, color: "var(--text)" }}>
							Эксперт по продуктам с 15+ годами опыта. Создаёт и развивает
							цифровые решения для бизнеса с 2009 года. Специализация: анализ
							процессов, запуск MVP, автоматизация и внедрение ИИ-инструментов.
						</p>
					</div>
				</div>
			</section>

			{/* CTA */}
			<section className="section section-gray">
				<div className="container">
					<div className="cta-block">
						<p>
							Хотите узнать, как мы можем помочь вашему бизнесу? Обсудим задачу
							бесплатно.
						</p>
						<button
							className="btn btn-primary"
							onClick={() => open("Заявка: обсудить проект", "О компании")}
						>
							Обсудить проект <ChevronRight size={14} />
						</button>
					</div>
				</div>
			</section>
		</article>
	);
}

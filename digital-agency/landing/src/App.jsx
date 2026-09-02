import { useEffect, useState } from "react";
import {
	BrowserRouter,
	Routes,
	Route,
	Link,
	useLocation,
	useParams,
} from "react-router-dom";
import { ChevronRight } from "lucide-react";
import "./App.css";
import { TrialModalContext } from "./context/ModalContext";
import LeadModal from "./components/LeadModal";
import TrialRegistrationModal from "./components/TrialRegistrationModal";
import {
	IconWebDev,
	IconAutomation,
	IconCRM,
	IconQueue,
	IconRocket,
	IconStore,
	IconBooking,
	IconERP,
	IconOzon,
	IconIdea,
	IconShield,
	IconTarget,
	IconStar,
	IconChecklist,
	IconHandshake,
	IconTrend,
	IconChat,
	IconUsers,
	IconMoney,
} from "./components/BrandIcons";
import QueueFlowPage from "./pages/QueueFlowPage";
import CrmLightPage from "./pages/CrmLightPage";
import BookingFlowPage from "./pages/BookingFlowPage";
import ERPLightPage from "./pages/ERPLightPage";
import StoreManagementPage from "./pages/StoreManagementPage";
import FurniturePhotoSorterPage from "./pages/FurniturePhotoSorterPage";
import OzonLabelsPage from "./pages/OzonLabelsPage";

// Логотип Гексагон SVG
function HexagonLogo({ className = "" }) {
	return (
		<svg className={className} viewBox="0 0 100 100" fill="none">
			<defs>
				<linearGradient id="hex-grad" x1="0%" y1="0%" x2="100%" y2="100%">
					<stop offset="0%" style={{ stopColor: "#a855f7" }} />
					<stop offset="50%" style={{ stopColor: "#22d3ee" }} />
					<stop offset="100%" style={{ stopColor: "#a855f7" }} />
				</linearGradient>
			</defs>
			<polygon
				points="50,5 90,27.5 90,72.5 50,95 10,72.5 10,27.5"
				stroke="url(#hex-grad)"
				strokeWidth="3"
				fill="none"
			/>
			<polygon
				points="50,20 75,35 75,65 50,80 25,65 25,35"
				stroke="url(#hex-grad)"
				strokeWidth="2"
				fill="none"
				opacity="0.6"
			/>
			<polygon
				points="50,35 60,42.5 60,57.5 50,65 40,57.5 40,42.5"
				fill="url(#hex-grad)"
				opacity="0.8"
			/>
			<circle cx="50" cy="50" r="8" fill="url(#hex-grad)" />
		</svg>
	);
}

// Большой анимированный логотип для Hero
function HeroLogo() {
	return (
		<svg className="hero-logo" viewBox="0 0 200 200" fill="none">
			<defs>
				<filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
					<feGaussianBlur stdDeviation="4" result="blur" />
					<feMerge>
						<feMergeNode in="blur" />
						<feMergeNode in="SourceGraphic" />
					</feMerge>
				</filter>
				<linearGradient id="hero-grad" x1="0%" y1="0%" x2="100%" y2="100%">
					<stop offset="0%" style={{ stopColor: "#a855f7" }} />
					<stop offset="50%" style={{ stopColor: "#22d3ee" }} />
					<stop offset="100%" style={{ stopColor: "#a855f7" }} />
				</linearGradient>
			</defs>
			<polygon
				points="100,10 173,50 173,150 100,190 27,150 27,50"
				stroke="url(#hero-grad)"
				strokeWidth="3"
				fill="none"
				filter="url(#glow)"
			/>
			<polygon
				points="100,35 145,60 145,140 100,165 55,140 55,60"
				stroke="url(#hero-grad)"
				strokeWidth="2"
				fill="none"
				opacity="0.6"
			/>
			<polygon
				points="100,55 125,70 125,130 100,145 75,130 75,70"
				stroke="url(#hero-grad)"
				strokeWidth="2"
				fill="rgba(168,85,247,0.1)"
			/>
			<polygon
				points="100,70 115,80 115,120 100,130 85,120 85,80"
				fill="url(#hero-grad)"
				opacity="0.9"
			/>
			<circle cx="100" cy="100" r="12" fill="url(#hero-grad)" />
		</svg>
	);
}

function ScrollToTop() {
	const { pathname, hash } = useLocation();

	// При изменении pathname (навигация между страницами) - прокрутка вверх
	useEffect(() => {
		window.scrollTo(0, 0);
	}, [pathname]);

	// Функция прокрутки к hash
	const scrollToHash = () => {
		const currentHash = window.location.hash;
		if (!currentHash) return;

		// Небольшая задержка чтобы элемент успел появиться в DOM
		const timer = setTimeout(() => {
			const targetId = currentHash.startsWith("#")
				? currentHash.slice(1)
				: currentHash;
			console.log("ScrollToHash: looking for", targetId);
			const target = document.getElementById(targetId);
			console.log("ScrollToHash: found target", target);
			if (target) {
				target.scrollIntoView({ behavior: "smooth", block: "start" });
			} else {
				console.log("ScrollToHash: target not found, retrying...");
				// Retry after longer delay for lazy-loaded content
				setTimeout(() => {
					const retryTarget = document.getElementById(targetId);
					if (retryTarget) {
						retryTarget.scrollIntoView({ behavior: "smooth", block: "start" });
					}
				}, 500);
			}
		}, 200);

		return () => clearTimeout(timer);
	};

	// При изменении hash (навигация внутри страницы)
	useEffect(() => {
		if (hash) {
			scrollToHash();
		}
	}, [pathname, hash]);

	// Слушатель на hashchange для внешних изменений
	useEffect(() => {
		const handleHashChange = () => {
			console.log("HashChange event, hash =", window.location.hash);
			scrollToHash();
		};
		window.addEventListener("hashchange", handleHashChange);
		return () => window.removeEventListener("hashchange", handleHashChange);
	}, []);

	return null;
}

function Header() {
	const [showProducts, setShowProducts] = useState(false);

	const products = [
		{ code: "queue", name: "Электронная очередь" },
		{ code: "booking", name: "Онлайн-запись" },
		{ code: "crm-light", name: "CRM Light" },
		{ code: "erp-light", name: "ERP Light" },
		{ code: "store-management", name: "Управление складом" },
		{ code: "ozon-labels", name: "Этикетки Ozon" },
	];

	return (
		<header className="header">
			<div className="container header-inner">
				<Link to="/" className="logo">
					<HexagonLogo className="logo-icon" />
					<span className="logo-text">
						ОнлайнПро<span>.рф</span>
					</span>
				</Link>
				<nav className="nav">
					<a
						href="/#skills"
						className="nav-link"
						onClick={(e) => {
							if (window.location.pathname !== "/") {
								e.preventDefault();
								window.location.href = "/#skills";
							}
						}}
					>
						Навыки
					</a>
					<a
						href="/#pricing"
						className="nav-link"
						onClick={(e) => {
							if (window.location.pathname !== "/") {
								e.preventDefault();
								window.location.href = "/#pricing";
							}
						}}
					>
						Цены
					</a>
					<a
						href="/#services"
						className="nav-link"
						onClick={(e) => {
							if (window.location.pathname !== "/") {
								e.preventDefault();
								window.location.href = "/#services";
							}
						}}
					>
						Услуги
					</a>

					<div className="nav-dropdown">
						<button
							className="nav-link nav-dropdown-toggle"
							onClick={() => setShowProducts(!showProducts)}
						>
							Продукты ▾
						</button>
						{showProducts && (
							<div className="nav-dropdown-menu">
								{products.map((p) => (
									<Link
										key={p.code}
										to={`/product/${p.code}`}
										className="nav-dropdown-item"
										onClick={() => setShowProducts(false)}
									>
										{p.name}
									</Link>
								))}
							</div>
						)}
					</div>
					<a
						href="/#contacts"
						className="nav-link"
						onClick={(e) => {
							if (window.location.pathname !== "/") {
								e.preventDefault();
								window.location.href = "/#contacts";
							}
						}}
					>
						Контакты
					</a>
					<a href="/client-portal/" className="btn btn-primary btn-sm">
						Войти
					</a>
				</nav>
			</div>
		</header>
	);
}

function Hero() {
	return (
		<section className="hero">
			<div className="hero-inner">
				<div className="hero-content">
					<div className="hero-badge">
						<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
							<path
								d="M8 1L10 6L15 7L11.5 10.5L12.5 15.5L8 13L3.5 15.5L4.5 10.5L1 7L6 6L8 1Z"
								fill="currentColor"
							/>
						</svg>
						15+ лет на рынке
					</div>
					<h1 className="hero-title">
						Цифровое агентство:
						<br />
						<span className="gradient">
							ваш помощник в мире современных технологий
						</span>
					</h1>
					<p className="hero-subtitle">
						Помогаем развивать продукты. Разрабатываем сайты, запускаем MVP за 2
						недели, автоматизируем бизнес-процессы и внедряем ИИ.
					</p>
					<div className="hero-buttons">
						<a href="#contacts" className="btn btn-primary">
							Обсудить проект
							<ChevronRight size={16} />
						</a>
						<a
							href="/#services"
							className="btn btn-secondary"
							onClick={(e) => {
								if (window.location.pathname !== "/") {
									e.preventDefault();
									window.location.href = "/#services";
								}
							}}
						>
							Наши услуги
						</a>
					</div>
					<div className="hero-stats">
						<div>
							<div className="stat-value">15+</div>
							<div className="stat-label">лет опыта</div>
						</div>
						<div>
							<div className="stat-value">50+</div>
							<div className="stat-label">проектов</div>
						</div>
						<div>
							<div className="stat-value">24/7</div>
							<div className="stat-label">поддержка</div>
						</div>
					</div>
				</div>
				<div className="hero-visual">
					<HeroLogo />
				</div>
			</div>
		</section>
	);
}

const FEATURES = [
	{
		icon: IconTrend,
		title: "Анализ данных",
		desc: "Анализируем бизнес-процессы, находим узкие места и внедряем автоматизацию. Применяем инструменты с искусственным интеллектом.",
	},
	{
		icon: IconRocket,
		title: "Быстрый старт",
		desc: "Запустим MVP за 2 недели. Проверим вашу бизнес-идею на реальных пользователях без больших вложений.",
	},
	{
		icon: IconUsers,
		title: "Команда под задачу",
		desc: "Вам не нужно искать разработчиков — мы формируем команду и управляем ей. Полный контроль без головной боли.",
	},
	{
		icon: IconAutomation,
		title: "Автоматизация",
		desc: "Заменим бумажные процессы на удобные цифровые решения. Экономьте время и снижаете ошибки.",
	},
	{
		icon: IconChecklist,
		title: "Прозрачность",
		desc: "Еженедельные отчёты и понятный процесс. Вы всегда знаете, на каком этапе ваш проект.",
	},
];

function Features() {
	return (
		<section className="features" id="skills">
			<div className="container">
				<div className="section-header">
					<span className="section-label">Возможности</span>
					<h2 className="section-title">Наши ключевые навыки</h2>
					<p className="section-subtitle">Найдём точки роста вашего бизнеса</p>
				</div>
				<div className="features-grid">
					{FEATURES.map(({ icon: Icon, title, desc }) => (
						<div key={title} className="feature-card">
							<div className="feature-icon">
								<Icon size={32} />
							</div>
							<div className="feature-content">
								<h3>{title}</h3>
								<p>{desc}</p>
							</div>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}

const SERVICE_ICONS = {
	websites: IconWebDev,
	webapps: IconRocket,
	automation: IconAutomation,
	crm: IconCRM,
	booking: IconBooking,
	queue: IconQueue,
	erp: IconERP,
	store: IconStore,
	ozon: IconOzon,
	konsult: IconUsers,
};

// Секция "Цены" - загружает услуги из API
function PricingSection() {
	const [services, setServices] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		fetch("/api/catalog/services")
			.then((r) => r.json())
			.then((data) => {
				setServices(Array.isArray(data) ? data : []);
				setLoading(false);
			})
			.catch(() => setLoading(false));
	}, []);

	const categories = {
		websites: { label: "Сайты", icon: IconWebDev },
		webapps: { label: "Веб-приложения", icon: IconRocket },
		automation: { label: "Автоматизация", icon: IconAutomation },
		konsult: { label: "Консалтинг", icon: IconUsers },
	};

	return (
		<section className="services" id="pricing">
			<div className="container">
				<div className="section-header">
					<span className="section-label">Стоимость</span>
					<h2 className="section-title">Цены на наши услуги</h2>
					<p className="section-subtitle">
						Выберите подходящий вариант или закажите индивидуальную разработку
					</p>
				</div>
				{loading && (
					<p style={{ textAlign: "center", color: "var(--text-muted)" }}>
						Загружаем цены…
					</p>
				)}
				<div className="services-grid">
					{services.map((service) => {
						const Icon = SERVICE_ICONS[service.category] || IconWebDev;
						const cat = categories[service.category] || {
							label: "Другие услуги",
							icon: IconWebDev,
						};
						return (
							<div key={service.id} className="service-card">
								<div className="service-icon">
									<Icon size={28} />
								</div>
								<span className="service-category">{cat.label}</span>
								<h3 className="service-title">{service.title}</h3>
								<p className="service-desc">{service.description}</p>
								<div className="service-price">{service.price_label}</div>
							</div>
						);
					})}
				</div>
			</div>
		</section>
	);
}

// Секция "Услуги"
const OUR_SERVICES = [
	{
		icon: IconIdea,
		title: "Проверим вашу идею на жизнеспособность",
		desc: "Бесплатная экспресс-оценка за 30 минут",
	},
	{
		icon: IconRocket,
		title: "Запустим рабочий прототип за 2 недели",
		desc: "Протестируйте спрос до инвестиций в разработку",
	},
	{
		icon: IconAutomation,
		title: "Автоматизируем рутину за 1 месяц",
		desc: "Заменим бумажную работу на удобные цифровые процессы",
	},
	{
		icon: IconShield,
		title: "Поддержим ваш продукт 24/7",
		desc: "Исправим баги, обновим системы, обеспечим стабильность",
	},
	{
		icon: IconTrend,
		title: "Проанализируем ваш бизнес",
		desc: "Найдём точки роста и оптимизируем процессы",
	},
	{
		icon: IconTarget,
		title: "Подберём решение под ваш бюджет",
		desc: "Гибкие цены и индивидуальный подход к каждому проекту",
	},
];

function ServicesSection() {
	return (
		<section className="features" id="services">
			<div className="container">
				<div className="section-header">
					<span className="section-label">Наши услуги</span>
					<h2 className="section-title">Чем мы можем помочь</h2>
				</div>
				<div className="features-grid">
					{OUR_SERVICES.map(({ icon: Icon, title, desc }) => (
						<div key={title} className="feature-card">
							<div className="feature-icon">
								<Icon size={32} />
							</div>
							<div className="feature-content">
								<h3>{title}</h3>
								<p>{desc}</p>
							</div>
						</div>
					))}
				</div>
				<div
					className="cta-block"
					style={{ textAlign: "center", marginTop: 48 }}
				>
					<p style={{ color: "var(--text-muted)", marginBottom: 24 }}>
						Хотите обсудить, как мы можем помочь вашему бизнесу расти?
					</p>
					<a href="#contacts" className="btn btn-primary">
						Связаться <ChevronRight size={14} />
					</a>
				</div>
			</div>
		</section>
	);
}

const WHY_ITEMS = [
	{
		icon: IconStar,
		title: "15+ лет опыта",
		desc: "Реализовали 50+ проектов от стартапов до корпораций",
	},
	{
		icon: IconHandshake,
		title: "Индивидуальный подход",
		desc: "Не продаём шаблоны — делаем под вас",
	},
	{
		icon: IconMoney,
		title: "Гибкие цены",
		desc: "Решения под ваш бюджет и сроки",
	},
	{
		icon: IconChat,
		title: "Прозрачность",
		desc: "Еженедельные отчёты и понятный процесс",
	},
];

function WhyUs() {
	return (
		<section className="why" id="why">
			<div className="container">
				<div className="section-header">
					<span className="section-label">Преимущества</span>
					<h2 className="section-title">Почему выбирают нас</h2>
				</div>
				<div className="why-grid">
					{WHY_ITEMS.map(({ icon: Icon, title, desc }) => (
						<div key={title} className="why-item">
							<div className="why-icon">
								<Icon size={36} />
							</div>
							<h3>{title}</h3>
							<p>{desc}</p>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}

function CTA() {
	return (
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
	);
}

function Footer() {
	return (
		<footer className="footer">
			<div className="container footer-inner">
				<div className="footer-brand">
					<HexagonLogo className="footer-logo" />
					<span className="footer-text">
						© 2024 ОнлайнПро.РФ — Ваш помощник в мире современных технологий
					</span>
				</div>
				<div className="footer-contact">
					<a href="mailto:Andrey.OnlinePro@yandex.ru">
						Andrey.OnlinePro@yandex.ru
					</a>
					<a href="tel:+79161586826">+7 (916) 158 68 26</a>
				</div>
			</div>
			<div className="footer-admin-link">
				<a href="/app/" className="admin-link">
					Войти в административную панель
				</a>
			</div>
		</footer>
	);
}

// Background Effects
function BackgroundEffects() {
	return (
		<div className="bg-effects">
			<div className="bg-glow bg-glow-purple" />
			<div className="bg-glow bg-glow-cyan" />
			<div className="bg-grid" />
		</div>
	);
}

// Главная страница
function HomePage() {
	return (
		<>
			<BackgroundEffects />
			<Hero />
			<Features />
			<PricingSection />
			<ServicesSection />
			<WhyUs />
			<CTA />
			<Footer />
		</>
	);
}

// Страницы продуктов
function ProductPage({ code }) {
	const pages = {
		queue: QueueFlowPage,
		booking: BookingFlowPage,
		"crm-light": CrmLightPage,
		"erp-light": ERPLightPage,
		"store-management": StoreManagementPage,
		"furniture-photo-sorter": FurniturePhotoSorterPage,
		"ozon-labels": OzonLabelsPage,
	};
	const Component = pages[code];
	if (!Component) return null;
	return (
		<>
			<BackgroundEffects />
			<Component />
			<Footer />
		</>
	);
}

function AboutPage() {
	return (
		<>
			<BackgroundEffects />
			<div style={{ paddingTop: 120 }}>
				<div className="container">
					<h1 className="section-title">О нас</h1>
					<p className="section-subtitle" style={{ marginTop: 24 }}>
						Цифровое агентство с 2009 года. Опыт более 15 лет в разработке
						цифровых продуктов.
					</p>
				</div>
			</div>
			<Footer />
		</>
	);
}

function CasesPage() {
	return (
		<>
			<BackgroundEffects />
			<div style={{ paddingTop: 120 }}>
				<div className="container">
					<h1 className="section-title">Кейсы</h1>
					<p className="section-subtitle" style={{ marginTop: 24 }}>
						Более 50 реализованных проектов для клиентов разного масштаба.
					</p>
				</div>
			</div>
			<Footer />
		</>
	);
}

export default function App() {
	const [trialModal, setTrialModal] = useState({
		isOpen: false,
		productCode: "",
		productName: "",
	});

	const openTrial = (productCode, productName) => {
		setTrialModal({ isOpen: true, productCode, productName });
	};

	const closeTrialModal = () => {
		setTrialModal({ isOpen: false, productCode: "", productName: "" });
	};

	return (
		<TrialModalContext.Provider value={{ openTrial }}>
			<BrowserRouter>
				<ScrollToTop />
				<Header />
				<main>
					<Routes>
						<Route path="/" element={<HomePage />} />
						<Route path="/about" element={<AboutPage />} />
						<Route path="/cases" element={<CasesPage />} />
						<Route path="/product/:code" element={<ProductPageWrapper />} />
						{/* Legacy HTML file routes (without /landing/ prefix - nginx alias обрезает prefix) */}
						<Route
							path="/product-queue.html"
							element={<ProductPage code="queue" />}
						/>
						<Route
							path="/product-booking.html"
							element={<ProductPage code="booking" />}
						/>
						<Route
							path="/product-crm-light.html"
							element={<ProductPage code="crm-light" />}
						/>
						<Route
							path="/product-erp-light.html"
							element={<ProductPage code="erp-light" />}
						/>
						<Route
							path="/product-store.html"
							element={<ProductPage code="store-management" />}
						/>
						<Route
							path="/product-furniture-photo-sorter.html"
							element={<ProductPage code="furniture-photo-sorter" />}
						/>
						<Route
							path="/product-ozon-labels.html"
							element={<ProductPage code="ozon-labels" />}
						/>
						<Route path="/about.html" element={<AboutPage />} />
						<Route path="/cases.html" element={<CasesPage />} />
					</Routes>
				</main>
				<LeadModal />
				<TrialRegistrationModal
					isOpen={trialModal.isOpen}
					onClose={closeTrialModal}
					productCode={trialModal.productCode}
					productName={trialModal.productName}
				/>
			</BrowserRouter>
		</TrialModalContext.Provider>
	);
}

function ProductPageWrapper() {
	const { code } = useParams();
	return <ProductPage code={code} />;
}

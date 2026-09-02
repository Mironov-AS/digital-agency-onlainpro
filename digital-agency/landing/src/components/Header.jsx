import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, Menu, X } from "lucide-react";

const CLIENT_PORTAL_URL = "/client-portal/";

export default function Header() {
	const [products, setProducts] = useState([]);
	const [open, setOpen] = useState(false);
	const [mobileOpen, setMobileOpen] = useState(false);
	const [mobileProductsOpen, setMobileProductsOpen] = useState(false);
	const dropdownRef = useRef(null);

	useEffect(() => {
		fetch("/api/product-shelf/products/landing")
			.then((r) => r.json())
			.then((data) => setProducts(Array.isArray(data) ? data : []))
			.catch(() => {});
	}, []);

	useEffect(() => {
		function handleClickOutside(e) {
			if (dropdownRef.current && !dropdownRef.current.contains(e.target))
				setOpen(false);
		}
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	useEffect(() => {
		document.body.style.overflow = mobileOpen ? "hidden" : "";
		return () => {
			document.body.style.overflow = "";
		};
	}, [mobileOpen]);

	const closeMobile = () => {
		setMobileOpen(false);
		setMobileProductsOpen(false);
	};

	return (
		<>
			<header className="header" role="banner">
				<div className="container header-inner">
					<Link to="/" className="logo" aria-label="На главную">
						<span className="logo-line">Цифровое агентство</span>
						<span className="logo-line logo-line--sub">ОнлайнПро.РФ</span>
					</Link>
					<nav
						className="nav"
						role="navigation"
						aria-label="Основная навигация"
					>
						<Link to="/#skills">Навыки</Link>
						<Link to="/#pricing">Цены</Link>
						<Link to="/#services">Услуги</Link>

						<div className="nav-dropdown" ref={dropdownRef}>
							<button
								className="nav-dropdown-trigger"
								onClick={() => setOpen((o) => !o)}
								type="button"
							>
								Продукты{" "}
								<ChevronDown
									size={14}
									className={`nav-dropdown-arrow${open ? " open" : ""}`}
								/>
							</button>
							{open && products.length > 0 && (
								<div className="nav-dropdown-menu">
									{products.map((p) => (
										<Link
											key={p.code}
											to={`/product/${p.code}`}
											className="nav-dropdown-item"
											onClick={() => setOpen(false)}
										>
											{p.name}
										</Link>
									))}
								</div>
							)}
						</div>
						<Link to="/#contacts">Контакты</Link>
						<a href={CLIENT_PORTAL_URL} className="btn-login-nav">
							Войти
						</a>
					</nav>
					<button
						className="mobile-menu-btn"
						onClick={() => setMobileOpen((o) => !o)}
						aria-label="Меню"
					>
						{mobileOpen ? <X size={24} /> : <Menu size={24} />}
					</button>
				</div>
			</header>
			{mobileOpen && (
				<div className="mobile-menu">
					<nav className="mobile-menu-nav">
						<Link to="/#skills" onClick={closeMobile}>
							Навыки
						</Link>
						<Link to="/#pricing" onClick={closeMobile}>
							Цены
						</Link>
						<Link to="/#services" onClick={closeMobile}>
							Услуги
						</Link>

						<div className="mobile-menu-dropdown">
							<button
								className="mobile-menu-dropdown-trigger"
								onClick={() => setMobileProductsOpen((o) => !o)}
								type="button"
							>
								Продукты{" "}
								<ChevronDown
									size={16}
									className={`nav-dropdown-arrow${mobileProductsOpen ? " open" : ""}`}
								/>
							</button>
							{mobileProductsOpen && products.length > 0 && (
								<div className="mobile-menu-dropdown-items">
									{products.map((p) => (
										<Link
											key={p.code}
											to={`/product/${p.code}`}
											onClick={closeMobile}
										>
											{p.name}
										</Link>
									))}
								</div>
							)}
						</div>
						<Link to="/#contacts" onClick={closeMobile}>
							Контакты
						</Link>
						<a
							href={CLIENT_PORTAL_URL}
							className="mobile-menu-login"
							onClick={closeMobile}
						>
							Войти
						</a>
					</nav>
				</div>
			)}
		</>
	);
}

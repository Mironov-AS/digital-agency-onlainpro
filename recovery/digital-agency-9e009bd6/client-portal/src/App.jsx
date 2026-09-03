import { useState, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { login, logout, getProducts } from "./services/api";
import "./App.css";
import OzonLabelsPage from "./pages/OzonLabelsPage.jsx";

function LoginPage({ onLogin }) {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");
		setLoading(true);
		try {
			const res = await login(email, password);
			const { user, accessToken } = res.data;
			localStorage.setItem("access_token", accessToken);
			onLogin(user);
		} catch (err) {
			setError(err.response?.data?.error || "Ошибка входа");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="login-page">
			<div className="login-box">
				<h1 className="login-title">Вход в личный кабинет</h1>
				<p className="login-subtitle">
					Войдите, чтобы получить доступ к вашим продуктам
				</p>
				<form onSubmit={handleSubmit} className="login-form" autoComplete="off">
					{error && <div className="error-msg">{error}</div>}
					<div className="form-group">
						<label>Email</label>
						<input
							type="email"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							placeholder="your@email.com"
							required
							autoComplete="off"
						/>
					</div>
					<div className="form-group">
						<label>Пароль</label>
						<input
							type="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							placeholder="Введите пароль"
							required
							autoComplete="new-password"
						/>
					</div>
					<button type="submit" className="btn-primary" disabled={loading}>
						{loading ? "Вход…" : "Войти"}
					</button>
				</form>
				<a href="/" className="login-back-link">
					Вернуться на ОнлайнПро.РФ
				</a>
			</div>
		</div>
	);
}

function getProductUrl(frontendUrl) {
	if (!frontendUrl) return null;
	const { protocol, host } = window.location;
	const token = localStorage.getItem("access_token") || "";
	const portMatch = frontendUrl.match(/localhost:(\d+)/);
	if (portMatch && portMatch[1] === "3002") {
		return `${protocol}//${host}/queue/admin?auth_token=${encodeURIComponent(token)}`;
	}
	if (portMatch && portMatch[1] === "3001") {
		return `${protocol}//${host}/queue/`;
	}
	if (
		frontendUrl.includes("/booking/admin") ||
		(portMatch && portMatch[1] === "3003")
	) {
		if (host.includes(".preview.")) {
			const hash = host.replace(/^\d+-/, "");
			return `${protocol}//3003-${hash}/booking/admin`;
		}
		return `${protocol}//${host}/booking/admin`;
	}
	if (frontendUrl.includes("/crm/admin")) {
		if (host.includes(".preview.")) {
			const hash = host.replace(/^\d+-/, "");
			return `${protocol}//3005-${hash}/crm/admin`;
		}
		return `${protocol}//${host}/crm/admin`;
	}
	if (frontendUrl.includes("/erp/admin")) {
		if (host.includes(".preview.")) {
			const hash = host.replace(/^\d+-/, "");
			return `${protocol}//3006-${hash}/erp/admin`;
		}
		return `${protocol}//${host}/erp/admin`;
	}
	if (frontendUrl.includes("/store/admin")) {
		if (host.includes(".preview.")) {
			const hash = host.replace(/^\d+-/, "");
			return `${protocol}//4011-${hash}/store/admin`;
		}
		return `${protocol}//${host}/store/admin`;
	}
	if (frontendUrl.includes("/ozon-labels/")) {
		if (host.includes(".preview.")) {
			const hash = host.replace(/^\d+-/, "");
			return `${protocol}//5202-${hash}/client-portal/ozon-labels`;
		}
		return `${protocol}//${host}/client-portal/ozon-labels`;
	}
	if (host.includes(".preview.")) {
		if (portMatch) {
			const port = portMatch[1];
			if (port === "3002") {
				const hash = host.replace(/^\d+-/, "");
				return `${protocol}//3002-${hash}/admin?auth_token=${encodeURIComponent(token)}`;
			}
			if (port === "3001") {
				return `${protocol}//${host}/queue-api/`;
			}
			const hash = host.replace(/^\d+-/, "");
			return `${protocol}//${port}-${hash}/`;
		}
	}
	return frontendUrl;
}

function getClientIdFromToken(token) {
	if (!token) return "";
	try {
		const encodedPayload = token.split(".")[1];
		const normalizedPayload = encodedPayload
			.replace(/-/g, "+")
			.replace(/_/g, "/");
		const payload = JSON.parse(
			atob(
				normalizedPayload.padEnd(
					Math.ceil(normalizedPayload.length / 4) * 4,
					"=",
				),
			),
		);
		return payload.clientId || payload.client_id || "";
	} catch {
		return "";
	}
}

function ProductsPage({ user, onLogout }) {
	const [products, setProducts] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [openError, setOpenError] = useState("");
	const [activeProduct, setActiveProduct] = useState(null);
	const [activeInlineProduct, setActiveInlineProduct] = useState(null);
	const [paymentSending, setPaymentSending] = useState(null);
	const [paymentDone, setPaymentDone] = useState(null);

	useEffect(() => {
		getProducts()
			.then((res) => {
				setProducts(res.data || []);
			})
			.catch((err) => {
				setError(
					"Не удалось загрузить продукты: " + (err.message || "unknown"),
				);
			})
			.finally(() => setLoading(false));
	}, []);

	const handlePaymentRequest = async (product) => {
		setPaymentSending(product.id);
		try {
			await fetch("/api/admin/payment-request", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					client_name: user.name,
					product_name: product.product_name,
					client_email: user.email,
				}),
			});
			setPaymentDone(product.id);
			setTimeout(() => setPaymentDone(null), 5000);
		} catch {
		} finally {
			setPaymentSending(null);
		}
	};

	const handleOpenProduct = (product) => {
		setOpenError("");
		if (product.product_code === "ozon-labels") {
			setActiveInlineProduct(product);
			return;
		}
		const config = product.product_config || {};
		const rawUrl = config.frontend_url || config.backend_url;
		const productUrl = getProductUrl(rawUrl);
		if (!productUrl) {
			setOpenError("Не удалось открыть продукт: не настроена ссылка продукта");
			return;
		}
		try {
			const token = localStorage.getItem("access_token") || "";
			const clientId =
				user.clientId || user.client_id || getClientIdFromToken(token);
			const url = new URL(productUrl, window.location.origin);
			url.searchParams.set("token", token);
			url.searchParams.set("client_id", clientId);
			url.searchParams.set("auth_token", token);
			setActiveProduct({ name: product.product_name, url: url.toString() });
		} catch (err) {
			setOpenError("Не удалось открыть продукт");
		}
	};

	if (activeInlineProduct) {
		return (
			<OzonLabelsPage user={user} onBack={() => setActiveInlineProduct(null)} />
		);
	}

	if (activeProduct) {
		return (
			<div className="product-frame-overlay">
				<div className="product-frame-container">
					<div className="product-frame-header">
						<span>{activeProduct.name}</span>
						<button
							className="btn-close-frame"
							onClick={() => setActiveProduct(null)}
						>
							← Назад к продуктам
						</button>
					</div>
					<iframe
						className="product-frame"
						src={activeProduct.url}
						title={activeProduct.name}
					/>
				</div>
			</div>
		);
	}

	return (
		<div className="products-page">
			<header className="portal-header">
				<div className="portal-header-inner">
					<h1 className="portal-logo">Личный кабинет</h1>
					<div className="portal-user">
						<span>{user.name}</span>
						<button onClick={onLogout} className="btn-logout">
							Выйти
						</button>
					</div>
				</div>
			</header>
			<main className="portal-content">
				<h2 className="section-title">Ваши продукты</h2>
				{loading && <p className="loading-text">Загрузка продуктов…</p>}
				{error && <p className="error-msg">{error}</p>}
				{openError && <p className="error-msg">{openError}</p>}
				{!loading && products.length === 0 && (
					<div className="empty-state">
						<p>У вас пока нет активных продуктов.</p>
						<p>Свяжитесь с нами для подключения.</p>
					</div>
				)}
				<div className="products-grid">
					{products.map((p) => {
						const isTrial = p.status === "trial";
						const trialExpired = isTrial && p.trial_expired;
						const trialDaysLeft = p.trial_days_left;
						return (
							<div
								key={p.id}
								className={`product-card${trialExpired ? " product-card--expired" : ""}`}
							>
								<div className="product-icon">
									{p.product_code === "queue" ? (
										<svg
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeWidth="2"
											strokeLinecap="round"
											strokeLinejoin="round"
										>
											<line x1="8" y1="6" x2="21" y2="6" />
											<line x1="8" y1="12" x2="21" y2="12" />
											<line x1="8" y1="18" x2="21" y2="18" />
											<line x1="3" y1="6" x2="3.01" y2="6" />
											<line x1="3" y1="12" x2="3.01" y2="12" />
											<line x1="3" y1="18" x2="3.01" y2="18" />
										</svg>
									) : p.product_code === "booking" ? (
										<svg
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeWidth="2"
											strokeLinecap="round"
											strokeLinejoin="round"
										>
											<rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
											<line x1="16" y1="2" x2="16" y2="6" />
											<line x1="8" y1="2" x2="8" y2="6" />
											<line x1="3" y1="10" x2="21" y2="10" />
											<path d="M9 16l2 2 4-4" />
										</svg>
									) : p.product_code === "erp-light" ? (
										<svg
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeWidth="2"
											strokeLinecap="round"
											strokeLinejoin="round"
										>
											<rect x="2" y="3" width="20" height="18" rx="2" ry="2" />
											<line x1="2" y1="9" x2="22" y2="9" />
											<line x1="12" y1="9" x2="12" y2="21" />
										</svg>
									) : p.product_code === "store-management" ? (
										<svg
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeWidth="2"
											strokeLinecap="round"
											strokeLinejoin="round"
										>
											<path d="M3 9l2-5h14l2 5" />
											<path d="M5 9v11h14V9" />
											<path d="M9 20v-6h6v6" />
											<path d="M3 9h18" />
										</svg>
									) : (
										<svg
											viewBox="0 0 24 24"
											fill="none"
											stroke="currentColor"
											strokeWidth="2"
											strokeLinecap="round"
											strokeLinejoin="round"
										>
											<rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
										</svg>
									)}
								</div>
								<h3 className="product-name">{p.product_name}</h3>
								<p className="product-desc">{p.product_description}</p>
								{isTrial && !trialExpired && (
									<div className="trial-badge">
										<svg
											viewBox="0 0 24 24"
											width="14"
											height="14"
											fill="none"
											stroke="currentColor"
											strokeWidth="2"
										>
											<circle cx="12" cy="12" r="10" />
											<polyline points="12 6 12 12 16 14" />
										</svg>
										Тестовый период: осталось {trialDaysLeft}{" "}
										{trialDaysLeft === 1
											? "день"
											: trialDaysLeft < 5
												? "дня"
												: "дней"}
									</div>
								)}
								{trialExpired ? (
									<>
										<div className="trial-expired-badge">
											Тестовый период завершён
										</div>
										{paymentDone === p.id ? (
											<div className="payment-done-msg">
												✓ Запрос на оплату отправлен
											</div>
										) : (
											<button
												className="btn-pay-product"
												onClick={() => handlePaymentRequest(p)}
												disabled={paymentSending === p.id}
											>
												{paymentSending === p.id ? "Отправка…" : "Оплатить"}
											</button>
										)}
									</>
								) : (
									<button
										className="btn-open-product"
										onClick={() => handleOpenProduct(p)}
									>
										Открыть →
									</button>
								)}
							</div>
						);
					})}
				</div>
			</main>
		</div>
	);
}

function ProtectedRoute({ user, children }) {
	return user ? children : <Navigate to="/client-portal/" replace />;
}

function LogoutHandler({ onLogout }) {
	const navigate = useNavigate();
	useEffect(() => {
		logout()
			.catch(() => {})
			.finally(() => {
				onLogout();
				navigate("/client-portal/");
			});
	}, []);
	return null;
}

export default function App() {
	const navigate = useNavigate();

	const [user, setUser] = useState(() => {
		try {
			const stored = localStorage.getItem("user");
			return stored ? JSON.parse(stored) : null;
		} catch {
			return null;
		}
	});

	const handleLogin = (userData) => {
		setUser(userData);
		localStorage.setItem("user", JSON.stringify(userData));
	};

	const handleLogout = () => {
		setUser(null);
		localStorage.removeItem("user");
		localStorage.removeItem("access_token");
	};

	return (
		<Routes>
			<Route
				path="/client-portal/"
				element={
					user ? (
						<Navigate to="/client-portal/products" replace />
					) : (
						<LoginPage onLogin={handleLogin} />
					)
				}
			/>
			<Route
				path="/client-portal/products"
				element={
					<ProtectedRoute user={user}>
						<ProductsPage user={user} onLogout={handleLogout} />
					</ProtectedRoute>
				}
			/>
			<Route
				path="/client-portal/ozon-labels"
				element={
					<ProtectedRoute user={user}>
						<OzonLabelsPage
							user={user}
							onLogout={handleLogout}
							onBack={() => navigate("/client-portal/products")}
						/>
					</ProtectedRoute>
				}
			/>
			<Route
				path="/client-portal/logout"
				element={<LogoutHandler onLogout={handleLogout} />}
			/>
			<Route path="*" element={<Navigate to="/client-portal/" replace />} />
		</Routes>
	);
}

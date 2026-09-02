import { useState, useEffect } from "react";
import {
	ArrowLeft,
	Plus,
	Trash2,
	X,
	Check,
	Loader2,
	Package,
	Users,
	Play,
	Pause,
	ListOrdered,
	Settings,
	ArrowRight,
} from "lucide-react";
import { apiFetch } from "../api.js";

// Codes of products whose functionality is built into the app
const INTERNAL_PRODUCT_CODES = new Set(["queue", "electronic-queue", "eq"]);

function isInternalProduct(code) {
	return INTERNAL_PRODUCT_CODES.has(code);
}

export default function ProductShelfPage({ onBack, user, onOpenQueueAdmin }) {
	const [products, setProducts] = useState([]);
	const [subscriptions, setSubscriptions] = useState([]);
	const [clients, setClients] = useState([]);
	const [loading, setLoading] = useState(true);
	const [activeTab, setActiveTab] = useState("products");
	const [modal, setModal] = useState(null);
	const [subForm, setSubForm] = useState({
		product_code: "",
		client_id: "",
		billing_amount: "",
		billing_period: "monthly",
		next_billing_date: "",
	});
	const [subError, setSubError] = useState("");
	const [saving, setSaving] = useState(false);
	const [editProduct, setEditProduct] = useState(null);
	const [editForm, setEditForm] = useState({});

	async function loadData() {
		setLoading(true);
		try {
			const [prods, subs, clnts] = await Promise.all([
				apiFetch("/api/product-shelf/products"),
				apiFetch("/api/product-shelf/subscriptions"),
				apiFetch("/api/clients"),
			]);
			setProducts(Array.isArray(prods) ? prods : []);
			setSubscriptions(Array.isArray(subs) ? subs : []);
			setClients(Array.isArray(clnts) ? clnts : []);
		} catch (e) {
			console.error("Failed to load data:", e);
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => {
		loadData();
	}, []);

	async function handleAddSubscription() {
		if (!subForm.product_code || !subForm.client_id) {
			setSubError("Выберите продукт и клиента");
			return;
		}
		setSaving(true);
		setSubError("");
		try {
			await apiFetch("/api/product-shelf/subscriptions", {
				method: "POST",
				body: JSON.stringify(subForm),
			});
			setModal(null);
			setSubForm({ product_code: "", client_id: "" });
			loadData();
		} catch (e) {
			setSubError(e.error || e.message || "Ошибка при создании подписки");
		} finally {
			setSaving(false);
		}
	}

	async function handleDeleteSubscription(id) {
		if (!confirm("Удалить подписку?")) return;
		try {
			await apiFetch(`/api/product-shelf/subscriptions/${id}`, {
				method: "DELETE",
			});
			loadData();
		} catch (e) {
			alert("Ошибка: " + (e.error || e.message));
		}
	}

	async function handleUpdateSubStatus(id, currentStatus) {
		const next =
			currentStatus === "active"
				? "suspended"
				: currentStatus === "suspended"
					? "active"
					: "active";
		try {
			await apiFetch(`/api/product-shelf/subscriptions/${id}`, {
				method: "PATCH",
				body: JSON.stringify({ status: next }),
			});
			loadData();
		} catch (e) {
			alert("Ошибка: " + (e.error || e.message));
		}
	}

	function openAddSubscription() {
		setSubForm({
			product_code: "",
			client_id: "",
			billing_amount: "",
			billing_period: "monthly",
			next_billing_date: "",
		});
		setSubError("");
		setModal({ mode: "addSubscription" });
	}

	function handleSubProductChange(code) {
		const prod = products.find((p) => p.code === code);
		setSubForm((f) => ({
			...f,
			product_code: code,
			billing_amount: prod
				? String(prod.price_monthly || prod.price_yearly || "")
				: f.billing_amount,
			billing_period: prod
				? prod.billing_period || "monthly"
				: f.billing_period,
		}));
	}

	function openEditProduct(product) {
		setEditProduct(product);
		setEditForm({
			name: product.name,
			description: product.description || "",
			icon: product.icon || "",
			show_on_landing: !!product.show_on_landing,
			landing_description: product.landing_description || "",
			price_monthly:
				product.price_monthly != null ? String(product.price_monthly) : "",
			price_yearly:
				product.price_yearly != null ? String(product.price_yearly) : "",
			billing_period: product.billing_period || "monthly",
		});
	}

	async function handleSaveProduct() {
		if (!editForm.name.trim()) {
			alert("Введите название продукта");
			return;
		}
		setSaving(true);
		try {
			await apiFetch(`/api/product-shelf/products/${editProduct.code}`, {
				method: "PUT",
				body: JSON.stringify({
					name: editForm.name,
					description: editForm.description,
					icon: editForm.icon,
					show_on_landing: editForm.show_on_landing,
					landing_description: editForm.landing_description,
					price_monthly: parseFloat(editForm.price_monthly) || 0,
					price_yearly: parseFloat(editForm.price_yearly) || 0,
					billing_period: editForm.billing_period,
				}),
			});
			setEditProduct(null);
			loadData();
		} catch (e) {
			alert("Ошибка: " + (e.error || e.message));
		} finally {
			setSaving(false);
		}
	}

	if (loading) {
		return (
			<div className="page">
				<div className="page-header">
					<button className="btn-back" onClick={onBack}>
						<ArrowLeft size={16} /> Назад
					</button>
					<div>
						<h1 className="page-title">Продуктовая полка</h1>
						<p className="page-sub">Загрузка...</p>
					</div>
				</div>
				<div className="loading-center">
					<Loader2 size={28} className="spin" />
				</div>
			</div>
		);
	}

	return (
		<div className="page">
			<div className="page-header">
				<button className="btn-back" onClick={onBack}>
					<ArrowLeft size={16} /> Назад
				</button>
				<div>
					<h1 className="page-title">Продуктовая полка</h1>
					<p className="page-sub">
						Цифровые продукты для клиентов
						{user ? ` · ${user.name || user.email}` : ""}
					</p>
				</div>
				<button className="btn-primary" onClick={openAddSubscription}>
					<Plus size={14} /> Добавить продукт клиенту
				</button>
			</div>

			{/* Sub-tabs */}
			<div
				className="section-tabs"
				style={{
					padding: "0 32px",
					background: "#fff",
					borderBottom: "1px solid #e5e7eb",
				}}
			>
				<button
					className={`section-tab ${activeTab === "products" ? "active" : ""}`}
					onClick={() => setActiveTab("products")}
				>
					<Package size={14} /> Каталог продуктов
				</button>
				<button
					className={`section-tab ${activeTab === "subscriptions" ? "active" : ""}`}
					onClick={() => setActiveTab("subscriptions")}
				>
					<Users size={14} /> Подписки клиентов
				</button>
			</div>

			{activeTab === "products" && (
				<div style={{ padding: "24px 32px" }}>
					<div
						className="services-grid"
						style={{
							gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
						}}
					>
						{products.map((p) => {
							const internal = isInternalProduct(p.code);
							return (
								<div
									key={p.id}
									className="svc-card"
									style={{
										"--svc-color": "#7c3aed",
										"--svc-bg": "#f5f3ff",
										cursor: "pointer",
										display: "flex",
										flexDirection: "column",
									}}
									onClick={() => openEditProduct(p)}
								>
									<div
										className="svc-icon-wrap"
										style={{ background: "#f5f3ff", color: "#7c3aed" }}
									>
										{internal ? (
											<ListOrdered size={28} />
										) : (
											<Package size={28} />
										)}
									</div>
									<div className="svc-body">
										<h3 className="svc-title">{p.name}</h3>
										<p className="svc-desc">{p.description}</p>
										{p.config && p.config.backend_url && (
											<div
												style={{ fontSize: 11, color: "#6b7280", marginTop: 8 }}
											>
												<span style={{ fontFamily: "monospace" }}>
													{p.config.backend_url}
												</span>
											</div>
										)}
									</div>
									<div
										style={{
											display: "flex",
											alignItems: "center",
											gap: 8,
											marginTop: "auto",
											paddingTop: 12,
										}}
									>
										<span
											style={{
												fontSize: 11,
												fontWeight: 600,
												padding: "3px 8px",
												borderRadius: 4,
												background: p.is_active ? "#dcfce7" : "#f3f4f6",
												color: p.is_active ? "#16a34a" : "#6b7280",
											}}
										>
											{p.is_active ? "Активен" : "Неактивен"}
										</span>
										{internal && (
											<span
												style={{
													fontSize: 10,
													fontWeight: 700,
													padding: "2px 8px",
													borderRadius: 4,
													background: "#eff6ff",
													color: "#1e40af",
												}}
											>
												встроенный
											</span>
										)}
										<span
											style={{
												marginLeft: "auto",
												fontSize: 12,
												color: "#9ca3af",
												fontFamily: "monospace",
											}}
										>
											{p.code}
										</span>
									</div>
									{internal && onOpenQueueAdmin && (
										<button
											className="btn-primary"
											style={{
												marginTop: 10,
												width: "100%",
												justifyContent: "center",
											}}
											onClick={(e) => {
												e.stopPropagation();
												onOpenQueueAdmin();
											}}
										>
											<Settings size={14} /> Открыть админку
											<ArrowRight size={14} />
										</button>
									)}
								</div>
							);
						})}
					</div>

					{products.length === 0 && (
						<div className="empty-state">
							<Package size={48} style={{ color: "#d1d5db" }} />
							<p>Нет продуктов в каталоге</p>
						</div>
					)}
				</div>
			)}

			{activeTab === "subscriptions" && (
				<div style={{ padding: "24px 32px" }}>
					{subscriptions.length === 0 ? (
						<div className="empty-state">
							<Users size={48} style={{ color: "#d1d5db" }} />
							<p>Нет активных подписок</p>
							<button className="btn-primary-sm" onClick={openAddSubscription}>
								<Plus size={14} /> Добавить первую
							</button>
						</div>
					) : (
						<div
							style={{
								background: "#fff",
								borderRadius: 12,
								border: "1px solid #e5e7eb",
								overflow: "hidden",
							}}
						>
							<table className="data-table">
								<thead>
									<tr>
										<th>Продукт</th>
										<th>Клиент</th>
										<th style={{ width: 100 }}>Сумма</th>
										<th style={{ width: 100 }}>Период</th>
										<th style={{ width: 120 }}>След. платёж</th>
										<th style={{ width: 100 }}>Статус</th>
										<th style={{ width: 140 }}>Дата подключения</th>
										<th style={{ width: 100 }}>Действия</th>
									</tr>
								</thead>
								<tbody>
									{subscriptions.map((s) => {
										const client = clients.find((c) => c.id === s.client_id);
										const product = products.find(
											(p) => p.code === s.product_code,
										);
										return (
											<tr key={s.id}>
												<td>
													<div
														style={{
															display: "flex",
															alignItems: "center",
															gap: 6,
														}}
													>
														<div style={{ fontWeight: 600, color: "#111827" }}>
															{s.product_name || s.product_code}
														</div>
														{product && isInternalProduct(product.code) && (
															<span
																style={{
																	fontSize: 10,
																	fontWeight: 700,
																	padding: "1px 6px",
																	borderRadius: 4,
																	background: "#eff6ff",
																	color: "#1e40af",
																}}
																title="Встроенный продукт"
															>
																встр.
															</span>
														)}
													</div>
													{s.product_description && (
														<div
															className="truncate"
															style={{
																fontSize: 12,
																color: "#6b7280",
																maxWidth: 300,
															}}
														>
															{s.product_description}
														</div>
													)}
												</td>
												<td>
													<div style={{ fontWeight: 500, color: "#374151" }}>
														{client?.name || s.client_id}
													</div>
													{client?.email && (
														<div style={{ fontSize: 12, color: "#6b7280" }}>
															{client.email}
														</div>
													)}
												</td>
												<td style={{ fontWeight: 600 }}>
													{s.billing_amount != null
														? `${Number(s.billing_amount).toLocaleString("ru-RU")} ₽`
														: "—"}
												</td>
												<td style={{ color: "#6b7280", fontSize: 12 }}>
													{s.billing_period === "monthly"
														? "Ежемесячно"
														: s.billing_period === "yearly"
															? "Ежегодно"
															: "—"}
												</td>
												<td style={{ color: "#6b7280", fontSize: 12 }}>
													{s.next_billing_date
														? new Date(s.next_billing_date).toLocaleDateString(
																"ru-RU",
															)
														: "—"}
												</td>
												<td>
													<button
														onClick={() =>
															handleUpdateSubStatus(s.id, s.status)
														}
														style={{
															display: "inline-flex",
															alignItems: "center",
															gap: 4,
															padding: "4px 10px",
															borderRadius: 6,
															fontSize: 12,
															fontWeight: 600,
															cursor: "pointer",
															border: "none",
															background:
																s.status === "active"
																	? "#dcfce7"
																	: s.status === "suspended"
																		? "#fef9c3"
																		: "#f3f4f6",
															color:
																s.status === "active"
																	? "#16a34a"
																	: s.status === "suspended"
																		? "#ca8a04"
																		: "#6b7280",
														}}
													>
														{s.status === "active" ? (
															<Play size={12} />
														) : (
															<Pause size={12} />
														)}
														{s.status === "active"
															? "Активна"
															: s.status === "suspended"
																? "Приостановлена"
																: "Отменена"}
													</button>
												</td>
												<td style={{ color: "#6b7280" }}>
													{s.created_at
														? new Date(s.created_at).toLocaleDateString("ru-RU")
														: "—"}
												</td>
												<td>
													<div style={{ display: "flex", gap: 4 }}>
														<button
															className="icon-btn icon-btn--danger"
															onClick={() => handleDeleteSubscription(s.id)}
															title="Удалить подписку"
														>
															<Trash2 size={15} />
														</button>
													</div>
												</td>
											</tr>
										);
									})}
								</tbody>
							</table>
						</div>
					)}
				</div>
			)}

			{/* Edit Product Modal */}
			{editProduct && (
				<div
					className="modal-overlay"
					onClick={(e) => e.target === e.currentTarget && setEditProduct(null)}
				>
					<div className="modal-box" style={{ maxWidth: 520 }}>
						<div className="modal-header">
							<h2>Редактирование продукта</h2>
							<button
								className="modal-close"
								onClick={() => setEditProduct(null)}
							>
								<X size={18} />
							</button>
						</div>
						<form
							onSubmit={(e) => {
								e.preventDefault();
								handleSaveProduct();
							}}
							className="modal-form"
						>
							<div className="form-row">
								<label>Название</label>
								<input
									className="field"
									value={editForm.name}
									onChange={(e) =>
										setEditForm((f) => ({ ...f, name: e.target.value }))
									}
									placeholder="Например: Электронная очередь"
								/>
							</div>
							<div className="form-row">
								<label>Описание</label>
								<textarea
									className="field"
									rows={3}
									value={editForm.description}
									onChange={(e) =>
										setEditForm((f) => ({ ...f, description: e.target.value }))
									}
									placeholder="Полное описание продукта"
								/>
							</div>
							<div className="form-row">
								<label>Иконка (lucide)</label>
								<input
									className="field"
									value={editForm.icon}
									onChange={(e) =>
										setEditForm((f) => ({ ...f, icon: e.target.value }))
									}
									placeholder="list-ordered, package, etc."
								/>
							</div>
							<div
								className="form-row"
								style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
							>
								<input
									type="checkbox"
									id="show_on_landing"
									checked={editForm.show_on_landing}
									onChange={(e) =>
										setEditForm((f) => ({
											...f,
											show_on_landing: e.target.checked,
										}))
									}
									style={{ width: 18, height: 18 }}
								/>
								<label
									htmlFor="show_on_landing"
									style={{ margin: 0, fontWeight: 500 }}
								>
									Показывать на лендинге
								</label>
							</div>
							<div className="form-row">
								<label>Описание для лендинга</label>
								<textarea
									className="field"
									rows={2}
									value={editForm.landing_description}
									onChange={(e) =>
										setEditForm((f) => ({
											...f,
											landing_description: e.target.value,
										}))
									}
									placeholder="Краткое описание для блока 'Наши продукты' на лендинге"
									disabled={!editForm.show_on_landing}
								/>
							</div>
							<div
								style={{
									display: "grid",
									gridTemplateColumns: "1fr 1fr 1fr",
									gap: 12,
								}}
							>
								<div className="form-row">
									<label>Цена за месяц</label>
									<input
										className="field"
										type="number"
										min="0"
										step="100"
										placeholder="5000"
										value={editForm.price_monthly}
										onChange={(e) =>
											setEditForm((f) => ({
												...f,
												price_monthly: e.target.value,
											}))
										}
									/>
								</div>
								<div className="form-row">
									<label>Цена за год</label>
									<input
										className="field"
										type="number"
										min="0"
										step="100"
										placeholder="50000"
										value={editForm.price_yearly}
										onChange={(e) =>
											setEditForm((f) => ({
												...f,
												price_yearly: e.target.value,
											}))
										}
									/>
								</div>
								<div className="form-row">
									<label>Период по умолчанию</label>
									<select
										className="field"
										value={editForm.billing_period}
										onChange={(e) =>
											setEditForm((f) => ({
												...f,
												billing_period: e.target.value,
											}))
										}
									>
										<option value="monthly">Ежемесячно</option>
										<option value="yearly">Ежегодно</option>
									</select>
								</div>
							</div>
							<div className="modal-actions">
								<button
									type="button"
									className="btn-cancel"
									onClick={() => setEditProduct(null)}
								>
									Отмена
								</button>
								<button type="submit" className="btn-save" disabled={saving}>
									{saving ? (
										<Loader2 size={14} className="spin" />
									) : (
										<Check size={14} />
									)}
									{saving ? "Сохранение..." : "Сохранить"}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}

			{/* Add Subscription Modal */}
			{modal?.mode === "addSubscription" && (
				<div
					className="modal-overlay"
					onClick={(e) => e.target === e.currentTarget && setModal(null)}
				>
					<div className="modal-box">
						<div className="modal-header">
							<h2>Добавить продукт клиенту</h2>
							<button className="modal-close" onClick={() => setModal(null)}>
								<X size={18} />
							</button>
						</div>
						<form
							onSubmit={(e) => {
								e.preventDefault();
								handleAddSubscription();
							}}
							className="modal-form"
						>
							<div className="form-row">
								<label>Продукт</label>
								<select
									className="field"
									value={subForm.product_code}
									onChange={(e) => handleSubProductChange(e.target.value)}
								>
									<option value="">— выберите продукт —</option>
									{products
										.filter((p) => p.is_active)
										.map((p) => (
											<option key={p.code} value={p.code}>
												{p.name} ({p.code})
											</option>
										))}
								</select>
							</div>
							<div className="form-row">
								<label>Клиент</label>
								<select
									className="field"
									value={subForm.client_id}
									onChange={(e) =>
										setSubForm((f) => ({ ...f, client_id: e.target.value }))
									}
								>
									<option value="">— выберите клиента —</option>
									{clients.map((c) => (
										<option key={c.id} value={c.id}>
											{c.name} ({c.email || c.id.slice(0, 8)})
										</option>
									))}
								</select>
							</div>
							<div
								style={{
									display: "grid",
									gridTemplateColumns: "1fr 1fr 1fr",
									gap: 12,
								}}
							>
								<div className="form-row">
									<label>Сумма платежа</label>
									<input
										className="field"
										type="number"
										min="0"
										step="100"
										placeholder="5000"
										value={subForm.billing_amount}
										onChange={(e) =>
											setSubForm((f) => ({
												...f,
												billing_amount: e.target.value,
											}))
										}
									/>
								</div>
								<div className="form-row">
									<label>Периодичность</label>
									<select
										className="field"
										value={subForm.billing_period}
										onChange={(e) =>
											setSubForm((f) => ({
												...f,
												billing_period: e.target.value,
											}))
										}
									>
										<option value="monthly">Ежемесячно</option>
										<option value="yearly">Ежегодно</option>
									</select>
								</div>
								<div className="form-row">
									<label>Следующий платёж</label>
									<input
										className="field"
										type="date"
										value={subForm.next_billing_date}
										onChange={(e) =>
											setSubForm((f) => ({
												...f,
												next_billing_date: e.target.value,
											}))
										}
									/>
								</div>
							</div>
							{subError && <div className="form-error">{subError}</div>}
							<div className="modal-actions">
								<button
									type="button"
									className="btn-cancel"
									onClick={() => setModal(null)}
								>
									Отмена
								</button>
								<button type="submit" className="btn-save" disabled={saving}>
									{saving ? (
										<Loader2 size={14} className="spin" />
									) : (
										<Check size={14} />
									)}
									{saving ? "Сохранение..." : "Подключить"}
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	);
}

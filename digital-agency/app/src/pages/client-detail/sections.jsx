import {
	Plus,
	Pencil,
	Trash2,
	Check,
	X,
	Phone,
	Mail,
	MapPin,
	Pause,
	Play,
	Clock,
	AlertTriangle,
	Package,
	User,
	RefreshCw,
	ExternalLink,
	Users,
	CheckCircle,
} from "lucide-react";
import { useState } from "react";
import { INTERVAL_LABELS } from "../../constants/intervals.js";
import { daysUntil } from "../../utils/date.js";

function ServiceStatusBadge({ service, payments }) {
	if (service.status === "completed") {
		return (
			<span className="status-badge status-badge--active">
				<CheckCircle size={11} /> Оказана
			</span>
		);
	}
	if (!service.is_active) {
		return (
			<span className="status-badge status-badge--stopped">
				<Pause size={11} /> Остановлена
			</span>
		);
	}
	const today = new Date();
	today.setHours(0, 0, 0, 0);
	const hasOverdue = (payments || []).some(
		(p) =>
			p.client_service_id === service.id &&
			p.status === "pending" &&
			new Date(p.planned_date) < today,
	);
	if (hasOverdue) {
		return (
			<span className="status-badge status-badge--overdue">
				<AlertTriangle size={11} /> Просрочка
			</span>
		);
	}
	if (service.service_end_date) {
		const days = daysUntil(service.service_end_date);
		if (days < 0)
			return (
				<span className="status-badge status-badge--expired">
					<AlertTriangle size={11} /> Истекла {Math.abs(days)} дн.
				</span>
			);
		if (days <= 7)
			return (
				<span className="status-badge status-badge--warning">
					<Clock size={11} /> {days} дн. осталось
				</span>
			);
		return (
			<span className="status-badge status-badge--active">
				<Play size={11} /> {days} дн.
			</span>
		);
	}
	return (
		<span className="status-badge status-badge--active">
			<Play size={11} /> Активна
		</span>
	);
}

export function ServicesSection({
	client,
	modal: _modal,
	setModal,
	catalogServices: _catalogServices,
	onAddService: _onAddService,
	onUpdateService: _onUpdateService,
	onDeleteService: _onDeleteService,
	onToggleStop,
	onToggleComplete,
}) {
	return (
		<>
			<div
				style={{
					padding: "16px 32px",
					display: "flex",
					gap: 24,
					flexWrap: "wrap",
					background: "#fff",
					borderBottom: "1px solid #e5e7eb",
				}}
			>
				{client.contact_person && (
					<div
						style={{
							display: "flex",
							alignItems: "center",
							gap: 6,
							fontSize: 14,
							color: "#374151",
							fontWeight: 500,
						}}
					>
						<User size={14} /> {client.contact_person}
					</div>
				)}
				{client.phone && (
					<div
						style={{
							display: "flex",
							alignItems: "center",
							gap: 6,
							fontSize: 14,
							color: "#6b7280",
						}}
					>
						<Phone size={14} /> {client.phone}
					</div>
				)}
				{client.email && (
					<div
						style={{
							display: "flex",
							alignItems: "center",
							gap: 6,
							fontSize: 14,
							color: "#6b7280",
						}}
					>
						<Mail size={14} /> {client.email}
					</div>
				)}
				{client.address && (
					<div
						style={{
							display: "flex",
							alignItems: "center",
							gap: 6,
							fontSize: 14,
							color: "#6b7280",
						}}
					>
						<MapPin size={14} /> {client.address}
					</div>
				)}
			</div>

			<div
				className="section-toolbar"
				style={{
					padding: "16px 32px 0",
					display: "flex",
					justifyContent: "flex-end",
				}}
			>
				<button
					className="btn-primary-sm"
					onClick={() => setModal({ mode: "addService" })}
				>
					<Plus size={16} /> Добавить услугу
				</button>
			</div>

			{!client.services || client.services.length === 0 ? (
				<div className="empty-state">
					<p>У клиента нет услуг</p>
					<button
						className="btn-primary-sm"
						onClick={() => setModal({ mode: "addService" })}
					>
						<Plus size={14} /> Добавить первую
					</button>
				</div>
			) : (
				<div className="table-wrap">
					<table className="data-table">
						<thead>
							<tr>
								<th>Услуга</th>
								<th style={{ width: 120 }}>Продано</th>
								<th style={{ width: 160 }}>Оплачено / Всего</th>
								<th style={{ width: 130 }}>Период</th>
								<th style={{ width: 140 }}>Действует до</th>
								<th style={{ width: 130 }}>Статус</th>
								<th style={{ width: 120 }}>Действия</th>
							</tr>
						</thead>
						<tbody>
							{client.services.map((svc) => {
								const isFullyPaid =
									svc.price &&
									svc.total_billed > 0 &&
									svc.paid_amount >= svc.price;
								return (
									<tr
										key={svc.id}
										className={`svc-row ${!svc.is_active ? "svc-row--inactive" : ""} ${svc.status === "completed" ? "svc-row--completed" : ""}`}
									>
										<td>
											<div className="svc-name">{svc.service_name}</div>
											{svc.price && (
												<div className="svc-desc-sm">
													{svc.price?.toLocaleString("ru-RU")} ₽
												</div>
											)}
										</td>
										<td style={{ fontWeight: 700, color: "#1e3a8a" }}>
											{svc.price
												? `${svc.price?.toLocaleString("ru-RU")} ₽`
												: "—"}
										</td>
										<td>
											{svc.price ? (
												<div
													style={{
														display: "flex",
														flexDirection: "column",
														gap: 2,
													}}
												>
													<div
														style={{
															fontSize: 13,
															fontWeight: 600,
															color: isFullyPaid ? "#16a34a" : "#374151",
														}}
													>
														{svc.paid_amount?.toLocaleString("ru-RU")} ₽
													</div>
													<div style={{ fontSize: 11, color: "#9ca3af" }}>
														из {svc.price?.toLocaleString("ru-RU")} ₽
													</div>
													{isFullyPaid && (
														<span
															style={{
																fontSize: 11,
																color: "#16a34a",
																fontWeight: 600,
															}}
														>
															✓ Оплачено
														</span>
													)}
												</div>
											) : (
												<span style={{ color: "#9ca3af" }}>—</span>
											)}
										</td>
										<td style={{ color: "#374151", fontWeight: 600 }}>
											{INTERVAL_LABELS[svc.payment_interval] ||
												svc.payment_interval}
										</td>
										<td style={{ color: "#6b7280" }}>
											{svc.service_end_date
												? new Date(svc.service_end_date).toLocaleDateString(
														"ru-RU",
													)
												: "—"}
										</td>
										<td>
											<ServiceStatusBadge
												service={svc}
												payments={client.payments}
											/>
										</td>
										<td>
											<div style={{ display: "flex", gap: 4 }}>
												{svc.status !== "completed" && (
													<button
														className="icon-btn"
														onClick={() => onToggleComplete(svc)}
														title="Оказана"
														style={{ color: "#10b981" }}
													>
														<CheckCircle size={15} />
													</button>
												)}
												<button
													className="icon-btn"
													onClick={() =>
														setModal({ mode: "editService", target: svc })
													}
													title="Редактировать"
												>
													<Pencil size={15} />
												</button>
												{svc.status !== "completed" && (
													<button
														className="icon-btn"
														onClick={() => onToggleStop(svc)}
														title={svc.is_active ? "Остановить" : "Возобновить"}
													>
														{svc.is_active ? (
															<Pause size={15} />
														) : (
															<Play size={15} />
														)}
													</button>
												)}
												<button
													className="icon-btn icon-btn--danger"
													onClick={() =>
														setModal({ mode: "deleteService", target: svc })
													}
													title="Удалить"
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
		</>
	);
}

export function PaymentsSection({
	client,
	_modal,
	setModal,
	_onAddPayment,
	_onUpdatePayment,
	_onDeletePayment,
	onMarkPaid,
	subscriptions,
}) {
	const [paidModalPayment, setPaidModalPayment] = useState(null);
	const [paidDate, setPaidDate] = useState(
		new Date().toISOString().slice(0, 10),
	);

	const today = new Date();
	today.setHours(0, 0, 0, 0);

	function openPaidModal(payment) {
		setPaidDate(new Date().toISOString().slice(0, 10));
		setPaidModalPayment(payment);
	}

	function confirmPaid() {
		if (!paidModalPayment) return;
		onMarkPaid(paidModalPayment, paidDate);
		setPaidModalPayment(null);
	}

	return (
		<>
			<div
				className="section-toolbar"
				style={{
					padding: "16px 32px 0",
					display: "flex",
					justifyContent: "flex-end",
				}}
			>
				<button
					className="btn-primary-sm"
					onClick={() => setModal({ mode: "addPayment" })}
				>
					<Plus size={16} /> Добавить платёж
				</button>
			</div>

			{!client.payments || client.payments.length === 0 ? (
				<div className="empty-state">
					<p>Платежей пока нет</p>
					<button
						className="btn-primary-sm"
						onClick={() => setModal({ mode: "addPayment" })}
					>
						<Plus size={14} /> Запланировать
					</button>
				</div>
			) : (
				<div className="table-wrap">
					<table className="data-table">
						<thead>
							<tr>
								<th>Сумма</th>
								<th style={{ width: 140 }}>Плановая дата</th>
								<th>Услуга / Продукт</th>
								<th style={{ width: 160 }}>Статус</th>
								<th style={{ width: 120 }}>Действия</th>
							</tr>
						</thead>
						<tbody>
							{client.payments.map((p) => {
								const plannedDate = new Date(p.planned_date);
								plannedDate.setHours(0, 0, 0, 0);
								const isPast =
									p.status === "overdue" ||
									(p.status === "pending" && plannedDate < today);
								const daysDiff = Math.round(
									(plannedDate - today) / (1000 * 60 * 60 * 24),
								);
								const svc = client.services?.find(
									(s) => s.id === p.client_service_id,
								);
								const sub = (subscriptions || []).find(
									(s) => s.id === p.client_product_subscription_id,
								);
								return (
									<tr
										key={p.id}
										className={`svc-row ${p.status === "paid" ? "svc-row--inactive" : isPast ? "svc-row--overdue" : ""}`}
									>
										<td style={{ fontWeight: 700, fontSize: 15 }}>
											{p.amount?.toLocaleString("ru-RU")} ₽
										</td>
										<td style={{ color: "#6b7280" }}>
											{new Date(p.planned_date).toLocaleDateString("ru-RU")}
										</td>
										<td style={{ color: "#374151" }}>
											{svc ? (
												<span>{svc.service_name}</span>
											) : sub ? (
												<span style={{ color: "#7c3aed" }}>
													{sub.product_name || sub.product_code}
												</span>
											) : p.note ? (
												<span>{p.note}</span>
											) : (
												<span style={{ color: "#9ca3af" }}>—</span>
											)}
										</td>
										<td>
											{p.status === "paid" ? (
												<span className="status-badge status-badge--active">
													<Check size={11} /> Оплачено{" "}
													{p.paid_date
														? new Date(p.paid_date).toLocaleDateString("ru-RU")
														: ""}
												</span>
											) : isPast ? (
												<span className="status-badge status-badge--expired">
													<AlertTriangle size={11} /> Просрочен
												</span>
											) : daysDiff === 0 ? (
												<span
													className="status-badge"
													style={{
														background: "#fef3c7",
														color: "#92400e",
														border: "1px solid #fcd34d",
													}}
												>
													<Clock size={11} /> Сегодня
												</span>
											) : daysDiff === 1 ? (
												<span
													className="status-badge"
													style={{
														background: "#fffbeb",
														color: "#b45309",
														border: "1px solid #fde68a",
													}}
												>
													<Clock size={11} /> Завтра
												</span>
											) : daysDiff <= 5 ? (
												<span
													className="status-badge"
													style={{ background: "#eff6ff", color: "#1e40af" }}
												>
													<Clock size={11} /> Через {daysDiff} дн.
												</span>
											) : (
												<span
													className="status-badge"
													style={{
														background: "#f3f4f6",
														color: "#6b7280",
														border: "1px solid #e5e7eb",
													}}
												>
													<Clock size={11} />{" "}
													{plannedDate.toLocaleDateString("ru-RU")}
												</span>
											)}
										</td>
										<td>
											<div style={{ display: "flex", gap: 4 }}>
												{p.status !== "paid" && (
													<button
														className="icon-btn"
														onClick={() => openPaidModal(p)}
														title="Оплачен"
														style={{ color: "#10b981" }}
													>
														<Check size={15} />
													</button>
												)}
												<button
													className="icon-btn"
													onClick={() =>
														setModal({ mode: "editPayment", target: p })
													}
													title="Редактировать"
												>
													<Pencil size={15} />
												</button>
												<button
													className="icon-btn icon-btn--danger"
													onClick={() =>
														setModal({ mode: "deletePayment", target: p })
													}
													title="Удалить"
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

			{/* Mini modal: отметить как оплаченный */}
			{paidModalPayment && (
				<div
					className="modal-overlay"
					onClick={(e) =>
						e.target === e.currentTarget && setPaidModalPayment(null)
					}
				>
					<div className="modal-box" style={{ maxWidth: 400 }}>
						<div className="modal-header">
							<h2>Отметить оплату</h2>
							<button
								className="modal-close"
								onClick={() => setPaidModalPayment(null)}
							>
								<X size={18} />
							</button>
						</div>
						<form
							className="modal-form"
							onSubmit={(e) => {
								e.preventDefault();
								confirmPaid();
							}}
							autoComplete="off"
						>
							<div
								style={{
									padding: "12px 16px",
									background: "#f9fafb",
									borderRadius: 8,
									marginBottom: 12,
								}}
							>
								<div
									style={{ fontWeight: 700, fontSize: 16, color: "#111827" }}
								>
									{paidModalPayment.amount?.toLocaleString("ru-RU")} ₽
								</div>
								<div style={{ fontSize: 13, color: "#6b7280", marginTop: 4 }}>
									Плановая дата:{" "}
									{new Date(paidModalPayment.planned_date).toLocaleDateString(
										"ru-RU",
									)}
								</div>
							</div>
							<div className="form-row">
								<label>Дата оплаты</label>
								<input
									className="field"
									type="date"
									value={paidDate}
									onChange={(e) => setPaidDate(e.target.value)}
									autoComplete="off"
								/>
							</div>
							<div className="modal-actions">
								<button
									type="button"
									className="btn-cancel"
									onClick={() => setPaidModalPayment(null)}
								>
									Отмена
								</button>
								<button type="submit" className="btn-save">
									<Check size={14} /> Подтвердить
								</button>
							</div>
						</form>
					</div>
				</div>
			)}
		</>
	);
}

export function ClientProductsSection({
	subscriptions,
	products,
	modal: _modal,
	setModal,
	onAddSubscription,
	onDeleteSubscription,
	onToggleStatus,
	onEditSubscription,
}) {
	return (
		<>
			<div
				className="section-toolbar"
				style={{
					padding: "16px 32px 0",
					display: "flex",
					justifyContent: "flex-end",
				}}
			>
				<button
					className="btn-primary-sm"
					onClick={() => setModal({ mode: "addProduct" })}
				>
					<Plus size={16} /> Добавить продукт
				</button>
			</div>

			{subscriptions.length === 0 ? (
				<div className="empty-state">
					<RefreshCw size={48} style={{ color: "#d1d5db" }} />
					<p>У клиента нет подключённых продуктов</p>
					<button
						className="btn-primary-sm"
						onClick={() => setModal({ mode: "addProduct" })}
					>
						<Plus size={14} /> Подключить первый
					</button>
				</div>
			) : (
				<div style={{ padding: "16px 32px" }}>
					<div
						style={{
							display: "grid",
							gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
							gap: 16,
						}}
					>
						{subscriptions.map((sub) => {
							const product = products.find((p) => p.code === sub.product_code);
							return (
								<div
									key={sub.id}
									style={{
										background: "#fff",
										borderRadius: 14,
										border: "1.5px solid #e5e7eb",
										padding: 20,
										display: "flex",
										flexDirection: "column",
										gap: 12,
									}}
								>
									<div
										style={{
											display: "flex",
											alignItems: "flex-start",
											gap: 14,
										}}
									>
										<div
											style={{
												width: 48,
												height: 48,
												borderRadius: 12,
												background: "#f5f3ff",
												color: "#7c3aed",
												display: "flex",
												alignItems: "center",
												justifyContent: "center",
												flexShrink: 0,
											}}
										>
											<Package size={24} />
										</div>
										<div style={{ flex: 1, minWidth: 0 }}>
											<h3
												style={{
													fontWeight: 700,
													fontSize: 15,
													color: "#111827",
													marginBottom: 4,
												}}
											>
												{sub.product_name || sub.product_code}
											</h3>
											{sub.product_description && (
												<p
													style={{
														fontSize: 12,
														color: "#6b7280",
														margin: 0,
														lineHeight: 1.4,
													}}
												>
													{sub.product_description}
												</p>
											)}
											{sub.billing_amount > 0 && (
												<div
													style={{
														display: "flex",
														alignItems: "center",
														gap: 8,
														marginTop: 6,
													}}
												>
													<span
														style={{
															fontSize: 12,
															fontWeight: 600,
															color: "#111827",
														}}
													>
														{Number(sub.billing_amount).toLocaleString("ru-RU")}{" "}
														₽
													</span>
													<span style={{ fontSize: 11, color: "#9ca3af" }}>
														/{" "}
														{INTERVAL_LABELS[sub.billing_period] ||
															sub.billing_period}
													</span>
												</div>
											)}
										</div>
									</div>
									{sub.status === "trial" && (
										<div
											style={{
												padding: "8px 12px",
												background: "#fef3c7",
												borderRadius: 8,
												fontSize: 12,
												color: "#92400e",
											}}
										>
											<Clock
												size={12}
												style={{ marginRight: 4, verticalAlign: "middle" }}
											/>
											<strong>Тестовый период:</strong> {sub.trial_days || 14}{" "}
											дн.
											{sub.trial_ends_at && (
												<span>
													{" "}
													— до{" "}
													{new Date(sub.trial_ends_at).toLocaleDateString(
														"ru-RU",
													)}
												</span>
											)}
											{sub.trial_ends_at &&
												new Date(sub.trial_ends_at) < new Date() && (
													<span style={{ color: "#dc2626", fontWeight: 700 }}>
														{" "}
														(истёк)
													</span>
												)}
										</div>
									)}
									<div
										style={{
											display: "flex",
											alignItems: "center",
											justifyContent: "space-between",
											paddingTop: 8,
											borderTop: "1px solid #f3f4f6",
										}}
									>
										<div
											style={{ display: "flex", alignItems: "center", gap: 8 }}
										>
											{product?.config?.frontend_url && (
												<a
													href={product.config.frontend_url}
													target="_blank"
													rel="noreferrer"
													style={{
														display: "inline-flex",
														alignItems: "center",
														gap: 4,
														fontSize: 12,
														color: "#7c3aed",
														textDecoration: "none",
													}}
												>
													<ExternalLink size={12} /> Открыть
												</a>
											)}
										</div>
										<div
											style={{ display: "flex", alignItems: "center", gap: 8 }}
										>
											<button
												onClick={() => onToggleStatus(sub)}
												style={{
													fontSize: 11,
													fontWeight: 600,
													padding: "4px 10px",
													borderRadius: 6,
													border: "none",
													cursor: "pointer",
													background:
														sub.status === "active"
															? "#dcfce7"
															: sub.status === "trial"
																? "#fef3c7"
																: "#fef9c3",
													color:
														sub.status === "active"
															? "#16a34a"
															: sub.status === "trial"
																? "#b45309"
																: "#ca8a04",
												}}
											>
												{sub.status === "active"
													? "Активен"
													: sub.status === "trial"
														? "Тест"
														: "Приостановлен"}
											</button>
											<button
												className="icon-btn"
												onClick={() => onEditSubscription(sub)}
												title="Редактировать"
											>
												<Pencil size={15} />
											</button>
											<button
												className="icon-btn icon-btn--danger"
												onClick={() =>
													setModal({ mode: "deleteProduct", target: sub })
												}
												title="Отключить"
											>
												<Trash2 size={15} />
											</button>
										</div>
									</div>
								</div>
							);
						})}
					</div>
				</div>
			)}
		</>
	);
}

export function ClientUsersSection({ users, setModal }) {
	return (
		<>
			<div
				className="section-toolbar"
				style={{
					padding: "16px 32px 0",
					display: "flex",
					justifyContent: "flex-end",
				}}
			>
				<button
					className="btn-primary-sm"
					onClick={() => setModal({ mode: "addUser" })}
				>
					<Plus size={16} /> Добавить пользователя
				</button>
			</div>

			{users.length === 0 ? (
				<div className="empty-state">
					<Users size={48} style={{ color: "#d1d5db" }} />
					<p>У клиента нет пользователей</p>
					<button
						className="btn-primary-sm"
						onClick={() => setModal({ mode: "addUser" })}
					>
						<Plus size={14} /> Создать первого
					</button>
				</div>
			) : (
				<div style={{ padding: "16px 32px" }}>
					<div
						style={{
							display: "grid",
							gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
							gap: 16,
						}}
					>
						{users.map((u) => (
							<div
								key={u.id}
								style={{
									background: "#fff",
									borderRadius: 14,
									border: "1.5px solid #e5e7eb",
									padding: 20,
									display: "flex",
									flexDirection: "column",
									gap: 12,
								}}
							>
								<div
									style={{ display: "flex", alignItems: "flex-start", gap: 14 }}
								>
									<div
										style={{
											width: 48,
											height: 48,
											borderRadius: 12,
											background: "#eff6ff",
											color: "#3b82f6",
											display: "flex",
											alignItems: "center",
											justifyContent: "center",
											flexShrink: 0,
										}}
									>
										<User size={24} />
									</div>
									<div style={{ flex: 1, minWidth: 0 }}>
										<h3
											style={{
												fontWeight: 700,
												fontSize: 15,
												color: "#111827",
												marginBottom: 4,
											}}
										>
											{u.name}
										</h3>
										<p style={{ fontSize: 12, color: "#6b7280", margin: 0 }}>
											{u.email}
										</p>
									</div>
								</div>
								<div
									style={{
										display: "flex",
										alignItems: "center",
										justifyContent: "space-between",
										paddingTop: 8,
										borderTop: "1px solid #f3f4f6",
									}}
								>
									<span
										style={{
											fontSize: 11,
											fontWeight: 600,
											padding: "3px 8px",
											borderRadius: 4,
											background: u.is_active ? "#dcfce7" : "#f3f4f6",
											color: u.is_active ? "#16a34a" : "#6b7280",
										}}
									>
										{u.is_active ? "Активен" : "Неактивен"}
									</span>
									<div
										style={{ display: "flex", alignItems: "center", gap: 4 }}
									>
										<button
											className="icon-btn"
											onClick={() => setModal({ mode: "editUser", target: u })}
											title="Редактировать"
										>
											<Pencil size={15} />
										</button>
										<button
											className="icon-btn icon-btn--danger"
											onClick={() =>
												setModal({ mode: "deleteUser", target: u })
											}
											title="Удалить"
										>
											<Trash2 size={15} />
										</button>
									</div>
								</div>
							</div>
						))}
					</div>
				</div>
			)}
		</>
	);
}

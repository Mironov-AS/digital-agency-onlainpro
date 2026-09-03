import { useState, useEffect } from "react";
import { apiFetch } from "../api.js";
import {
	Users,
	Package,
	TrendingUp,
	AlertTriangle,
	Clock,
	ArrowLeft,
	Loader2,
	RefreshCw,
	CreditCard,
	CheckCircle,
	ChevronRight,
	Calendar,
	XCircle,
	DollarSign,
	Percent,
} from "lucide-react";

const fmt = (n) => (n || 0).toLocaleString("ru-RU");
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString("ru-RU") : "—");

function daysOverdue(dateStr) {
	const diff = Math.ceil((new Date() - new Date(dateStr)) / 86400000);
	return diff;
}
function daysUntil(dateStr) {
	const diff = Math.ceil((new Date(dateStr) - new Date()) / 86400000);
	return diff;
}

function KpiCard({ icon: Icon, label, value, sub, color, bg }) {
	return (
		<div className="dash-kpi" style={{ "--kpi-color": color, "--kpi-bg": bg }}>
			<div className="dash-kpi-icon">
				<Icon size={22} />
			</div>
			<div className="dash-kpi-body">
				<div className="dash-kpi-value">{value}</div>
				<div className="dash-kpi-label">{label}</div>
				{sub && <div className="dash-kpi-sub">{sub}</div>}
			</div>
		</div>
	);
}

function SectionHeader({ title, count }) {
	return (
		<div className="dash-section-header">
			<h2 className="dash-section-title">{title}</h2>
			{count !== undefined && (
				<span className="dash-section-count">{count}</span>
			)}
		</div>
	);
}

export default function DashboardPage({ onBack, onGoToClient }) {
	const [data, setData] = useState(null);
	const [productData, setProductData] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [billingResult, setBillingResult] = useState(null);

	async function runBilling() {
		setBillingResult(null);
		try {
			const res = await apiFetch("/api/clients/billing/run", {
				method: "POST",
			});
			setBillingResult(res);
			load();
		} catch (e) {
			setBillingResult({ error: e.error || "Ошибка" });
		}
	}

	async function load() {
		setLoading(true);
		setError("");
		try {
			const [d, ps] = await Promise.all([
				apiFetch("/api/clients/stats"),
				apiFetch("/api/product-shelf/stats").catch(() => null),
			]);
			setData(d);
			setProductData(ps);
		} catch (e) {
			setError(e.error || "Ошибка загрузки");
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => {
		load();
	}, []);

	if (loading)
		return (
			<div
				className="page"
				style={{
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					minHeight: 400,
				}}
			>
				<Loader2 size={32} className="spin" />
			</div>
		);

	if (error)
		return (
			<div className="page">
				<div className="page-header">
					<button className="btn-back" onClick={onBack}>
						<ArrowLeft size={16} /> Назад
					</button>
				</div>
				<div className="page-error">
					{error} <button onClick={load}>Повторить</button>
				</div>
			</div>
		);

	const { clients, services, finance, overdue, upcoming, debtors } = data;
	// Upcoming payments формируются единообразно в clients-service на основе
	// реальных записей payments. product-shelf stats больше не возвращает
	// фиктивные "платежи" из самих подписок, поэтому мержинг не нужен.
	const { subscriptions: psSubs } = productData || {
		subscriptions: { active: 0, total: 0, mrr: 0, by_period: [] },
	};
	const totalMrr = (finance?.mrr || 0) + (psSubs?.mrr || 0);
	const allUpcoming = upcoming
		.map((p) => ({
			...p,
			_type: p.client_product_subscription_id ? "product" : "service",
		}))
		.filter((p) => p.planned_date)
		.sort((a, b) => new Date(a.planned_date) - new Date(b.planned_date))
		.slice(0, 20);

	return (
		<div className="page">
			<div className="page-header">
				<button className="btn-back" onClick={onBack}>
					<ArrowLeft size={16} /> Назад
				</button>
				<div>
					<h1 className="page-title">Дашборд</h1>
					<p className="page-sub">Управленческая статистика</p>
				</div>
				<div
					style={{
						marginLeft: "auto",
						display: "flex",
						gap: 8,
						alignItems: "center",
					}}
				>
					{billingResult && !billingResult.error && (
						<span style={{ fontSize: 12, color: "#16a34a" }}>
							+{billingResult.services + billingResult.subscriptions} платежей
						</span>
					)}
					<button
						className="btn-primary-sm"
						onClick={runBilling}
						title="Выставить платежи по расписанию"
					>
						<CreditCard size={14} /> Биллинг
					</button>
					<button className="btn-primary-sm" onClick={load}>
						<RefreshCw size={14} /> Обновить
					</button>
				</div>
			</div>

			{/* KPI row */}
			<div className="dash-kpi-grid">
				<KpiCard
					icon={Users}
					label="Клиентов активных"
					value={clients.active}
					sub={`всего ${clients.total}`}
					color="#3b82f6"
					bg="#eff6ff"
				/>
				<KpiCard
					icon={Package}
					label="Услуг активных"
					value={services.active}
					sub={`всего ${services.total}, завершено ${services.completed || 0}`}
					color="#8b5cf6"
					bg="#f5f3ff"
				/>
				{psSubs?.active > 0 && (
					<KpiCard
						icon={CreditCard}
						label="Продуктов активных"
						value={psSubs.active}
						sub={`всего ${psSubs.total}`}
						color="#7c3aed"
						bg="#f5f3ff"
					/>
				)}
				<KpiCard
					icon={TrendingUp}
					label="MRR (доходы/мес)"
					value={`${fmt(totalMrr)} ₽`}
					sub={
						psSubs?.mrr > 0
							? `услуги ${fmt(finance?.mrr || 0)} + продукты ${fmt(psSubs.mrr)}`
							: "ежемесячный доход"
					}
					color="#10b981"
					bg="#ecfdf5"
				/>
				{finance.one_time_revenue > 0 && (
					<KpiCard
						icon={CheckCircle}
						label="Разовые (разово)"
						value={`${fmt(finance.one_time_revenue)} ₽`}
						sub="разовые услуги"
						color="#059669"
						bg="#ecfdf5"
					/>
				)}
				<KpiCard
					icon={DollarSign}
					label="MRC (затраты/мес)"
					value={`${fmt(finance.mrc)} ₽`}
					sub="ежемесячные расходы"
					color="#f97316"
					bg="#fff7ed"
				/>
				<KpiCard
					icon={Percent}
					label="Маржа/мес"
					value={`${fmt(finance.margin)} ₽`}
					sub={
						totalMrr > 0
							? `${Math.round((finance.margin / totalMrr) * 100)}% от выручки`
							: "—"
					}
					color={finance.margin >= 0 ? "#16a34a" : "#dc2626"}
					bg={finance.margin >= 0 ? "#f0fdf4" : "#fef2f2"}
				/>
				<KpiCard
					icon={XCircle}
					label="Просрочено"
					value={`${fmt(finance.overdue_amount)} ₽`}
					sub={`${overdue.length} платежей`}
					color="#ef4444"
					bg="#fef2f2"
				/>
			</div>

			{/* Services by interval */}
			<div className="dash-row">
				<div className="dash-card">
					<SectionHeader title="Услуги по периодичности" />
					<div className="dash-interval-list">
						{[
							{ key: "monthly", label: "Ежемесячно", color: "#3b82f6" },
							{ key: "quarterly", label: "Ежеквартально", color: "#8b5cf6" },
							{ key: "yearly", label: "Ежегодно", color: "#10b981" },
							{ key: "once", label: "Разово", color: "#9ca3af" },
						].map(({ key, label, color }) => {
							const cnt = services.by_interval[key] || 0;
							const pct =
								services.active > 0
									? Math.round((cnt / services.active) * 100)
									: 0;
							return (
								<div key={key} className="dash-interval-row">
									<span className="dash-interval-label">{label}</span>
									<div className="dash-interval-bar-wrap">
										<div
											className="dash-interval-bar"
											style={{ width: `${pct}%`, background: color }}
										/>
									</div>
									<span className="dash-interval-count">{cnt}</span>
								</div>
							);
						})}
					</div>
				</div>

				{/* Products by interval */}
				{psSubs?.by_period?.length > 0 && (
					<div className="dash-card">
						<SectionHeader title="Продукты по периодичности" />
						<div className="dash-interval-list">
							{[
								{ key: "monthly", label: "Ежемесячно", color: "#7c3aed" },
								{ key: "quarterly", label: "Ежеквартально", color: "#a855f7" },
								{ key: "yearly", label: "Ежегодно", color: "#c084fc" },
								{ key: "once", label: "Разово", color: "#9ca3af" },
							].map(({ key, label, color }) => {
								const periodData = psSubs.by_period.find(
									(p) => p.billing_period === key,
								);
								const cnt = periodData?.cnt || 0;
								const pct =
									psSubs.active > 0
										? Math.round((cnt / psSubs.active) * 100)
										: 0;
								return (
									<div key={key} className="dash-interval-row">
										<span className="dash-interval-label">{label}</span>
										<div className="dash-interval-bar-wrap">
											<div
												className="dash-interval-bar"
												style={{ width: `${pct}%`, background: color }}
											/>
										</div>
										<span className="dash-interval-count">{cnt}</span>
									</div>
								);
							})}
						</div>
					</div>
				)}

				{/* Costs breakdown */}
				{finance.top_costs?.length > 0 && (
					<div className="dash-card">
						<SectionHeader title="Структура затрат (в мес)" />
						<div className="dash-interval-list" style={{ marginTop: 14 }}>
							{finance.top_costs.map(({ name, monthly }) => {
								const pct =
									finance.mrc > 0
										? Math.round((monthly / finance.mrc) * 100)
										: 0;
								return (
									<div key={name} className="dash-interval-row">
										<span className="dash-interval-label">{name}</span>
										<div className="dash-interval-bar-wrap">
											<div
												className="dash-interval-bar"
												style={{ width: `${pct}%`, background: "#f97316" }}
											/>
										</div>
										<span
											className="dash-interval-count"
											style={{ width: 80, textAlign: "right", fontSize: 12 }}
										>
											{fmt(monthly)} ₽
										</span>
									</div>
								);
							})}
						</div>
					</div>
				)}

				{/* Finance summary */}
				<div className="dash-card">
					<SectionHeader title="Финансовый итог" />
					<div className="dash-finance-list">
						<div className="dash-finance-row">
							<span>Выставлено</span>
							<strong>{fmt(finance.total_billed)} ₽</strong>
						</div>
						<div className="dash-finance-row">
							<span>Оплачено</span>
							<strong style={{ color: "#16a34a" }}>
								{fmt(finance.total_paid)} ₽
							</strong>
						</div>
						{finance.one_time_revenue > 0 && (
							<div className="dash-finance-row">
								<span>Разовые (оплачены)</span>
								<strong style={{ color: "#059669" }}>
									{fmt(finance.one_time_revenue)} ₽
								</strong>
							</div>
						)}
						<div className="dash-finance-row">
							<span>Ожидает оплаты</span>
							<strong style={{ color: "#f59e0b" }}>
								{fmt(finance.outstanding)} ₽
							</strong>
						</div>
						<div className="dash-finance-row dash-finance-row--danger">
							<span>Из них просрочено</span>
							<strong style={{ color: "#dc2626" }}>
								{fmt(finance.overdue_amount)} ₽
							</strong>
						</div>
						{finance.total_billed > 0 && (
							<div className="dash-finance-progress">
								<div className="dash-progress-bar">
									<div
										className="dash-progress-fill"
										style={{
											width: `${Math.min(100, Math.round((finance.total_paid / finance.total_billed) * 100))}%`,
										}}
									/>
								</div>
								<span className="dash-progress-label">
									{Math.round(
										(finance.total_paid / finance.total_billed) * 100,
									)}
									% оплачено
								</span>
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Overdue payments */}
			{overdue.length > 0 && (
				<div className="dash-card dash-card--danger">
					<SectionHeader title="Просроченные платежи" count={overdue.length} />
					<div className="table-wrap" style={{ marginTop: 12 }}>
						<table className="data-table">
							<thead>
								<tr>
									<th>Клиент</th>
									<th>Услуга</th>
									<th style={{ width: 130 }}>Сумма</th>
									<th style={{ width: 130 }}>Дата</th>
									<th style={{ width: 110 }}>Просрочка</th>
									{onGoToClient && <th style={{ width: 60 }} />}
								</tr>
							</thead>
							<tbody>
								{overdue.map((p) => (
									<tr key={p.id} className="svc-row">
										<td style={{ fontWeight: 600 }}>{p.client_name}</td>
										<td style={{ color: "#6b7280", fontSize: 13 }}>
											{p.service_name || "—"}
										</td>
										<td style={{ fontWeight: 700, color: "#dc2626" }}>
											{fmt(p.amount)} ₽
										</td>
										<td style={{ color: "#6b7280" }}>
											{fmtDate(p.planned_date)}
										</td>
										<td>
											<span className="status-badge status-badge--overdue">
												<AlertTriangle size={11} />{" "}
												{daysOverdue(p.planned_date)} дн.
											</span>
										</td>
										{onGoToClient && (
											<td>
												<button
													className="icon-btn"
													onClick={() => onGoToClient(p.client_id)}
													title="Открыть клиента"
												>
													<ChevronRight size={15} />
												</button>
											</td>
										)}
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			)}

			{/* Upcoming payments */}
			<div className="dash-card">
				<SectionHeader
					title="Ближайшие платежи (30 дней)"
					count={allUpcoming.length}
				/>
				{allUpcoming.length === 0 ? (
					<p className="dash-empty">
						Плановых платежей в ближайшие 30 дней нет
					</p>
				) : (
					<div className="table-wrap" style={{ marginTop: 12 }}>
						<table className="data-table">
							<thead>
								<tr>
									<th>Клиент</th>
									<th>Услуга / Продукт</th>
									<th style={{ width: 130 }}>Сумма</th>
									<th style={{ width: 130 }}>Дата</th>
									<th style={{ width: 110 }}>Осталось</th>
									{onGoToClient && <th style={{ width: 60 }} />}
								</tr>
							</thead>
							<tbody>
								{allUpcoming.map((p) => {
									const days = daysUntil(p.planned_date);
									const isProduct = p._type === "product";
									return (
										<tr key={p.id} className="svc-row">
											<td style={{ fontWeight: 600 }}>{p.client_name}</td>
											<td
												style={{
													color: isProduct ? "#7c3aed" : "#6b7280",
													fontSize: 13,
													fontWeight: isProduct ? 600 : 400,
												}}
											>
												{isProduct && (
													<CreditCard
														size={12}
														style={{ marginRight: 4, display: "inline" }}
													/>
												)}
												{p.service_name || "—"}
											</td>
											<td style={{ fontWeight: 700 }}>{fmt(p.amount)} ₽</td>
											<td style={{ color: "#6b7280" }}>
												{fmtDate(p.planned_date)}
											</td>
											<td>
												{days <= 3 ? (
													<span className="status-badge status-badge--warning">
														<Clock size={11} /> {days} дн.
													</span>
												) : (
													<span
														className="status-badge"
														style={{
															background: "#f0f9ff",
															color: "#0369a1",
															border: "1px solid #bae6fd",
														}}
													>
														<Calendar size={11} /> {days} дн.
													</span>
												)}
											</td>
											{onGoToClient && (
												<td>
													<button
														className="icon-btn"
														onClick={() => onGoToClient(p.client_id)}
														title="Открыть клиента"
													>
														<ChevronRight size={15} />
													</button>
												</td>
											)}
										</tr>
									);
								})}
							</tbody>
						</table>
					</div>
				)}
			</div>

			{/* Debtors */}
			{debtors.length > 0 && (
				<div className="dash-card">
					<SectionHeader
						title="Задолженность по клиентам"
						count={debtors.length}
					/>
					<div className="table-wrap" style={{ marginTop: 12 }}>
						<table className="data-table">
							<thead>
								<tr>
									<th>Клиент</th>
									<th style={{ width: 160 }}>Ожидает оплаты</th>
									<th style={{ width: 160 }}>Из них просрочено</th>
									<th style={{ width: 120 }}>Платежей</th>
									{onGoToClient && <th style={{ width: 60 }} />}
								</tr>
							</thead>
							<tbody>
								{debtors.map((d) => (
									<tr key={d.client_id} className="svc-row">
										<td style={{ fontWeight: 600 }}>{d.client_name}</td>
										<td style={{ fontWeight: 700, color: "#f59e0b" }}>
											{fmt(d.pending_amount)} ₽
										</td>
										<td>
											{d.overdue_amount > 0 ? (
												<span style={{ fontWeight: 700, color: "#dc2626" }}>
													{fmt(d.overdue_amount)} ₽
												</span>
											) : (
												<span style={{ color: "#9ca3af" }}>—</span>
											)}
										</td>
										<td style={{ color: "#6b7280" }}>{d.payments_count} шт.</td>
										{onGoToClient && (
											<td>
												<button
													className="icon-btn"
													onClick={() => onGoToClient(d.client_id)}
													title="Открыть клиента"
												>
													<ChevronRight size={15} />
												</button>
											</td>
										)}
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			)}
		</div>
	);
}

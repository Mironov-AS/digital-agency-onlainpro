import { useState, useEffect } from "react";
import { Download, BarChart3, Loader2 } from "lucide-react";
import { apiFetch } from "../../api.js";
import { fmtDate } from "./shared.js";

export default function EQStatsTab() {
	const [days, setDays] = useState(7);
	const [data, setData] = useState({ rows: [], daily: [] });
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");

	const load = async () => {
		setLoading(true);
		setError("");
		try {
			const r = await apiFetch(`/api/stats?days=${days}`);
			setData(r || { rows: [], daily: [] });
		} catch (e) {
			setError(e.error || "Ошибка");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		load();
	}, [days]);

	const exportCsv = async () => {
		try {
			const r = await fetch(`/api/stats/export?days=${days}`, {
				credentials: "include",
			});
			if (!r.ok) throw new Error("Ошибка экспорта");
			const blob = await r.blob();
			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = `queue_stats_${new Date().toISOString().split("T")[0]}.csv`;
			a.click();
			URL.revokeObjectURL(url);
		} catch (e) {
			alert("Ошибка экспорта: " + e.message);
		}
	};

	const totals = (data.rows || []).reduce(
		(acc, r) => ({
			total: acc.total + r.total,
			served: acc.served + r.served,
			in_queue: acc.in_queue + r.in_queue,
		}),
		{ total: 0, served: 0, in_queue: 0 },
	);

	// Chart scaling
	const maxDailyTotal = Math.max(
		1,
		...(data.daily || []).map((d) => d.total || 0),
	);

	return (
		<div
			style={{
				padding: "20px 24px",
				display: "flex",
				flexDirection: "column",
				gap: 16,
			}}
		>
			<div
				style={{
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					flexWrap: "wrap",
					gap: 12,
				}}
			>
				<div>
					<h2 style={{ fontSize: 18, fontWeight: 700, color: "#111827" }}>
						Статистика
					</h2>
					<p style={{ fontSize: 13, color: "#6b7280", marginTop: 2 }}>
						Сводка по талонам за период
					</p>
				</div>
				<div style={{ display: "flex", gap: 8, alignItems: "center" }}>
					<select
						className="field"
						style={{ width: 180 }}
						value={days}
						onChange={(e) => setDays(parseInt(e.target.value))}
					>
						<option value="1">Сегодня</option>
						<option value="3">3 дня</option>
						<option value="7">Неделя</option>
						<option value="14">2 недели</option>
						<option value="30">Месяц</option>
						<option value="90">Квартал</option>
					</select>
					<button className="btn-secondary" onClick={exportCsv}>
						<Download size={14} /> CSV
					</button>
				</div>
			</div>

			{error && (
				<div
					style={{
						background: "#fef2f2",
						color: "#dc2626",
						padding: 10,
						borderRadius: 10,
						fontSize: 13,
					}}
				>
					{error}
				</div>
			)}

			{loading ? (
				<div className="loading-center">
					<Loader2 size={28} className="spin" />
				</div>
			) : (
				<>
					{/* KPI cards */}
					<div
						style={{
							display: "grid",
							gridTemplateColumns: "repeat(3, 1fr)",
							gap: 12,
						}}
					>
						<div
							className="eq-kpi"
							style={{ background: "#eff6ff", borderColor: "#bfdbfe" }}
						>
							<div className="eq-kpi-label">Всего талонов</div>
							<div className="eq-kpi-value" style={{ color: "#1e40af" }}>
								{totals.total}
							</div>
						</div>
						<div
							className="eq-kpi"
							style={{ background: "#f0fdf4", borderColor: "#bbf7d0" }}
						>
							<div className="eq-kpi-label">Обслужено</div>
							<div className="eq-kpi-value" style={{ color: "#16a34a" }}>
								{totals.served}
							</div>
						</div>
						<div
							className="eq-kpi"
							style={{ background: "#fff7ed", borderColor: "#fed7aa" }}
						>
							<div className="eq-kpi-label">Сейчас в очереди</div>
							<div className="eq-kpi-value" style={{ color: "#c2410c" }}>
								{totals.in_queue}
							</div>
						</div>
					</div>

					{/* Daily chart */}
					{data.daily && data.daily.length > 0 && (
						<div className="eq-card">
							<div
								style={{
									fontSize: 11,
									fontWeight: 700,
									color: "#9ca3af",
									textTransform: "uppercase",
									marginBottom: 14,
								}}
							>
								<BarChart3
									size={14}
									style={{ verticalAlign: "-2px", marginRight: 6 }}
								/>
								По дням
							</div>
							<div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
								{data.daily
									.slice()
									.reverse()
									.map((d) => (
										<div
											key={d.date}
											style={{
												display: "flex",
												alignItems: "center",
												gap: 10,
												fontSize: 12,
											}}
										>
											<div
												style={{ width: 80, color: "#6b7280", flexShrink: 0 }}
											>
												{fmtDate(d.date)}
											</div>
											<div
												style={{
													flex: 1,
													height: 22,
													background: "#f3f4f6",
													borderRadius: 6,
													position: "relative",
													overflow: "hidden",
												}}
											>
												<div
													style={{
														position: "absolute",
														top: 0,
														left: 0,
														height: "100%",
														width: `${(d.total / maxDailyTotal) * 100}%`,
														background:
															"linear-gradient(90deg, #93c5fd, #3b82f6)",
														borderRadius: 6,
													}}
												/>
											</div>
											<div
												style={{
													width: 60,
													textAlign: "right",
													fontWeight: 600,
													color: "#111827",
												}}
											>
												{d.total || 0}
											</div>
											<div
												style={{
													width: 60,
													textAlign: "right",
													color: "#16a34a",
												}}
											>
												✓{d.served || 0}
											</div>
											{d.avg_wait_minutes ? (
												<div
													style={{
														width: 80,
														textAlign: "right",
														color: "#6b7280",
													}}
												>
													⏱ {d.avg_wait_minutes} мин
												</div>
											) : (
												<div style={{ width: 80 }} />
											)}
										</div>
									))}
							</div>
						</div>
					)}

					{/* Per-service table */}
					<div className="eq-card">
						<div
							style={{
								fontSize: 11,
								fontWeight: 700,
								color: "#9ca3af",
								textTransform: "uppercase",
								marginBottom: 14,
							}}
						>
							По услугам
						</div>
						{data.rows && data.rows.length > 0 ? (
							<table className="data-table">
								<thead>
									<tr>
										<th>Дата</th>
										<th>Услуга</th>
										<th style={{ width: 90, textAlign: "center" }}>Всего</th>
										<th style={{ width: 100, textAlign: "center" }}>
											Обслужено
										</th>
										<th style={{ width: 100, textAlign: "center" }}>
											В очереди
										</th>
										<th style={{ width: 130, textAlign: "right" }}>
											Ср. ожидание
										</th>
									</tr>
								</thead>
								<tbody>
									{data.rows.map((r, i) => (
										<tr key={i}>
											<td>{fmtDate(r.date)}</td>
											<td style={{ fontWeight: 500 }}>{r.service_name}</td>
											<td style={{ textAlign: "center", fontWeight: 600 }}>
												{r.total}
											</td>
											<td
												style={{
													textAlign: "center",
													color: "#16a34a",
													fontWeight: 600,
												}}
											>
												{r.served}
											</td>
											<td style={{ textAlign: "center", color: "#c2410c" }}>
												{r.in_queue}
											</td>
											<td style={{ textAlign: "right", color: "#6b7280" }}>
												{r.avg_wait_minutes != null
													? `${r.avg_wait_minutes} мин`
													: "—"}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						) : (
							<div
								style={{
									padding: 30,
									textAlign: "center",
									color: "#9ca3af",
									fontSize: 13,
								}}
							>
								Нет данных за выбранный период
							</div>
						)}
					</div>
				</>
			)}
		</div>
	);
}

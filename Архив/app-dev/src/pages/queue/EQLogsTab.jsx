import { useState, useEffect, useCallback } from "react";
import { Loader2, ListOrdered, Filter } from "lucide-react";
import { apiFetch } from "../../api.js";
import { ACTION_LABELS, fmtDateTime } from "./shared.js";

export default function EQLogsTab() {
	const [logs, setLogs] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [filterAction, setFilterAction] = useState("");

	const load = useCallback(async () => {
		setLoading(true);
		setError("");
		try {
			const r = await apiFetch("/api/logs?limit=500");
			setLogs(Array.isArray(r) ? r : []);
		} catch (e) {
			setError(e.error || "Ошибка");
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		load();
	}, [load]);

	const actions = [...new Set(logs.map((l) => l.action))]
		.filter(Boolean)
		.sort();
	const filtered = filterAction
		? logs.filter((l) => l.action === filterAction)
		: logs;

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
						Журнал действий
					</h2>
					<p style={{ fontSize: 13, color: "#6b7280", marginTop: 2 }}>
						{logs.length} записей
					</p>
				</div>
				<div style={{ display: "flex", alignItems: "center", gap: 8 }}>
					<Filter size={14} style={{ color: "#9ca3af" }} />
					<select
						className="field"
						style={{ width: 220 }}
						value={filterAction}
						onChange={(e) => setFilterAction(e.target.value)}
					>
						<option value="">Все действия</option>
						{actions.map((a) => (
							<option key={a} value={a}>
								{ACTION_LABELS[a] || a}
							</option>
						))}
					</select>
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
			) : filtered.length === 0 ? (
				<div className="empty-state">
					<ListOrdered size={40} style={{ color: "#d1d5db" }} />
					<p>Нет записей в журнале</p>
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
								<th style={{ width: 160 }}>Когда</th>
								<th style={{ width: 130 }}>Пользователь</th>
								<th style={{ width: 180 }}>Действие</th>
								<th>Детали</th>
							</tr>
						</thead>
						<tbody>
							{filtered.slice(0, 200).map((log) => (
								<tr key={log.id}>
									<td style={{ fontSize: 12, color: "#6b7280" }}>
										{fmtDateTime(log.created_at)}
									</td>
									<td>
										{log.username ? (
											<span style={{ fontWeight: 500 }}>{log.username}</span>
										) : (
											<span style={{ color: "#9ca3af" }}>—</span>
										)}
									</td>
									<td>
										<span
											style={{
												display: "inline-block",
												padding: "3px 10px",
												borderRadius: 99,
												fontSize: 11,
												fontWeight: 600,
												background: "#eff6ff",
												color: "#1e40af",
											}}
										>
											{ACTION_LABELS[log.action] || log.action}
										</span>
									</td>
									<td style={{ fontSize: 12, color: "#374151" }}>
										{log.details || <span style={{ color: "#d1d5db" }}>—</span>}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}
		</div>
	);
}

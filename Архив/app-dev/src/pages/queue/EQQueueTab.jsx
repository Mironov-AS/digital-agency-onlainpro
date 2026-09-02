import { useState, useEffect, useCallback } from "react";
import {
	ArrowRight,
	ArrowLeft,
	RotateCcw,
	SkipForward,
	X,
	Loader2,
	Phone,
	Bell,
	Users,
	Volume2,
	RefreshCw,
} from "lucide-react";
import { apiFetch } from "../../api.js";
import { STATUS_LABELS, STATUS_COLORS, fmtTime } from "./shared.js";

export default function EQQueueTab() {
	const [state, setState] = useState({ current: null, waiting: [] });
	const [services, setServices] = useState([]);
	const [loading, setLoading] = useState(true);
	const [busy, setBusy] = useState(false);
	const [regOpen, setRegOpen] = useState(true);
	const [error, setError] = useState("");

	const load = useCallback(async () => {
		try {
			const [queue, svcs, reg] = await Promise.all([
				apiFetch("/api/queue/full"),
				apiFetch("/api/services?all=1"),
				apiFetch("/api/settings/registration").catch(() => ({ open: true })),
			]);
			setState(queue || { current: null, waiting: [] });
			setServices(Array.isArray(svcs) ? svcs.filter((s) => s.enabled) : []);
			setRegOpen(!!reg?.open);
		} catch (e) {
			setError(e.error || "Ошибка загрузки");
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		load();
		const t = setInterval(load, 5000);
		return () => clearInterval(t);
	}, [load]);

	async function callNext() {
		setBusy(true);
		setError("");
		try {
			await apiFetch("/api/queue/next", { method: "POST" });
			await load();
		} catch (e) {
			setError(e.error || "Ошибка");
		} finally {
			setBusy(false);
		}
	}

	async function repeat() {
		setBusy(true);
		setError("");
		try {
			await apiFetch("/api/queue/repeat", { method: "POST" });
			await load();
		} catch (e) {
			setError(e.error || "Ошибка");
		} finally {
			setBusy(false);
		}
	}

	async function returnCurrent() {
		setBusy(true);
		setError("");
		try {
			await apiFetch("/api/queue/return", { method: "POST" });
			await load();
		} catch (e) {
			setError(e.error || "Ошибка");
		} finally {
			setBusy(false);
		}
	}

	async function completeTicket(reason) {
		setBusy(true);
		setError("");
		try {
			await apiFetch("/api/queue/complete", {
				method: "POST",
				body: JSON.stringify({ reason }),
			});
			await load();
		} catch (e) {
			setError(e.error || "Ошибка");
		} finally {
			setBusy(false);
		}
	}

	async function callSpecific(id) {
		setBusy(true);
		setError("");
		try {
			await apiFetch(`/api/queue/call/${id}`, { method: "POST" });
			await load();
		} catch (e) {
			setError(e.error || "Ошибка");
		} finally {
			setBusy(false);
		}
	}

	async function toggleReg() {
		try {
			const r = await apiFetch("/api/settings/registration", {
				method: "PUT",
				body: JSON.stringify({ open: !regOpen }),
			});
			setRegOpen(!!r?.open);
		} catch (e) {
			setError(e.error || "Ошибка");
		}
	}

	async function resetAll() {
		if (
			!confirm(
				"Сбросить всю очередь на сегодня? Активные талоны станут обслуженными.",
			)
		)
			return;
		setBusy(true);
		setError("");
		try {
			await apiFetch("/api/queue/reset", { method: "POST" });
			await load();
		} catch (e) {
			setError(e.error || "Ошибка");
		} finally {
			setBusy(false);
		}
	}

	if (loading) {
		return (
			<div className="loading-center">
				<Loader2 size={28} className="spin" />
			</div>
		);
	}

	const { current, waiting } = state;

	return (
		<div
			style={{
				padding: "20px 24px",
				display: "flex",
				flexDirection: "column",
				gap: 16,
			}}
		>
			{error && (
				<div
					style={{
						background: "#fef2f2",
						color: "#dc2626",
						padding: "10px 14px",
						borderRadius: 10,
						fontSize: 13,
					}}
				>
					{error}
					<button
						onClick={load}
						style={{
							marginLeft: 12,
							color: "#1e40af",
							background: "none",
							border: "none",
							cursor: "pointer",
							fontWeight: 600,
						}}
					>
						Повторить
					</button>
				</div>
			)}

			{/* Top control bar */}
			<div
				style={{
					display: "flex",
					alignItems: "center",
					gap: 10,
					flexWrap: "wrap",
				}}
			>
				<button
					onClick={toggleReg}
					style={{
						display: "inline-flex",
						alignItems: "center",
						gap: 8,
						padding: "9px 16px",
						borderRadius: 8,
						fontSize: 13,
						fontWeight: 700,
						border: regOpen ? "1.5px solid #86efac" : "1.5px solid #fca5a5",
						background: regOpen ? "#f0fdf4" : "#fef2f2",
						color: regOpen ? "#15803d" : "#b91c1c",
						cursor: "pointer",
					}}
				>
					<span
						style={{
							width: 8,
							height: 8,
							borderRadius: "50%",
							background: regOpen ? "#16a34a" : "#dc2626",
						}}
					/>
					{regOpen ? "Запись открыта" : "Запись закрыта"}
				</button>

				<div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
					<button onClick={load} className="btn-secondary" title="Обновить">
						<RefreshCw size={15} />
					</button>
				</div>
			</div>

			{/* Current ticket card */}
			<div className="eq-card eq-card--current">
				<div className="eq-card-label">Сейчас вызван</div>
				{current ? (
					<>
						<div className="eq-current-number">№{current.number}</div>
						<div className="eq-current-service">
							{current.service_name || "—"}
						</div>
						{current.is_priority === 1 && (
							<span
								style={{
									fontSize: 11,
									fontWeight: 700,
									padding: "3px 10px",
									borderRadius: 99,
									background: "#fff7ed",
									color: "#c2410c",
									marginTop: 8,
								}}
							>
								★ Приоритетный
							</span>
						)}
						<div
							style={{
								display: "flex",
								flexWrap: "wrap",
								gap: 8,
								marginTop: 16,
							}}
						>
							<button
								className="btn-primary"
								disabled={busy}
								onClick={callNext}
							>
								<ArrowRight size={16} /> Следующий
							</button>
							<button
								className="btn-secondary"
								disabled={busy}
								onClick={repeat}
							>
								<Volume2 size={16} /> Повторить
							</button>
							<button
								className="btn-secondary"
								disabled={busy}
								onClick={returnCurrent}
							>
								<RotateCcw size={16} /> Вернуть
							</button>
							<button
								className="btn-stop"
								disabled={busy}
								onClick={() => completeTicket(null)}
							>
								<SkipForward size={16} /> Завершить
							</button>
						</div>
					</>
				) : (
					<>
						<div className="eq-current-empty">— Нет активного вызова —</div>
						<button
							className="btn-primary"
							disabled={busy}
							onClick={callNext}
							style={{ marginTop: 18 }}
						>
							<ArrowRight size={16} /> Вызвать следующего
						</button>
					</>
				)}
			</div>

			{/* Waiting list */}
			<div className="eq-card">
				<div className="eq-card-label">
					<Users size={14} /> В очереди: {waiting.length}
				</div>
				{waiting.length === 0 ? (
					<div
						style={{
							padding: 24,
							textAlign: "center",
							color: "#9ca3af",
							fontSize: 14,
						}}
					>
						Очередь пуста
					</div>
				) : (
					<div className="eq-wait-list">
						{waiting.map((t, idx) => {
							const svc = services.find((s) => s.id === t.service_id);
							return (
								<div key={t.id} className="eq-wait-row">
									<div className="eq-wait-pos">{idx + 1}</div>
									<div className="eq-wait-num">№{t.number}</div>
									<div className="eq-wait-meta">
										<div style={{ fontWeight: 600, color: "#111827" }}>
											{t.service_name || svc?.name || "—"}
										</div>
										{t.is_priority === 1 && (
											<span
												style={{
													fontSize: 10,
													fontWeight: 700,
													padding: "2px 8px",
													borderRadius: 99,
													background: "#fff7ed",
													color: "#c2410c",
													marginTop: 4,
													display: "inline-block",
												}}
											>
												★ приоритет
											</span>
										)}
									</div>
									<button
										className="btn-secondary"
										style={{ padding: "6px 12px", fontSize: 12 }}
										disabled={busy}
										onClick={() => callSpecific(t.id)}
									>
										<Bell size={12} /> Вызвать
									</button>
								</div>
							);
						})}
					</div>
				)}
			</div>

			{/* Bottom actions */}
			<div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
				<button className="btn-stop" disabled={busy} onClick={resetAll}>
					<X size={16} /> Сбросить очередь
				</button>
			</div>
		</div>
	);
}

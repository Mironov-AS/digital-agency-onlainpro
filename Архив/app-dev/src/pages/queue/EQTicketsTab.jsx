import { useState, useEffect, useCallback } from "react";
import {
	Plus,
	Pencil,
	Trash2,
	Loader2,
	X,
	Check,
	Filter,
	ArrowRightLeft,
	Phone,
	User as UserIcon,
} from "lucide-react";
import { apiFetch } from "../../api.js";
import {
	todayStr,
	STATUS_LABELS,
	STATUS_COLORS,
	fmtTime,
	FIELD_INPUT_TYPES_ADMIN,
} from "./shared.js";

// ─── Manual ticket modal ────────────────────────────────────────────────

function ManualTicketModal({ onClose, onCreated, services }) {
	const defaultSvc = services.find((s) => s.is_default) || services[0] || null;
	const [serviceId, setServiceId] = useState(
		defaultSvc ? String(defaultSvc.id) : "",
	);
	const [serviceFields, setServiceFields] = useState([]);
	const [fieldValues, setFieldValues] = useState({});
	const [name, setName] = useState("");
	const [phone, setPhone] = useState("");
	const [isPriority, setIsPriority] = useState(false);
	const [error, setError] = useState("");
	const [done, setDone] = useState(null);
	const [duplicate, setDuplicate] = useState(null);

	const loadFields = (sid) => {
		setServiceFields([]);
		setFieldValues({});
		if (!sid) return;
		fetch(`/api/services/${sid}/fields`)
			.then((r) => r.json())
			.then((data) => {
				setServiceFields(data);
				const init = {};
				data.forEach((f) => {
					init[f.id] = "";
				});
				setFieldValues(init);
			})
			.catch(() => {});
	};

	useEffect(() => {
		loadFields(serviceId);
	}, [serviceId]);

	const selectedService =
		services.find((s) => String(s.id) === String(serviceId)) || null;

	const submit = async () => {
		setError("");
		setDuplicate(null);
		if (!serviceId) {
			setError("Выберите услугу");
			return;
		}
		for (const f of serviceFields) {
			if (f.required && !fieldValues[f.id]?.trim()) {
				setError(`Поле «${f.label}» обязательно для заполнения`);
				return;
			}
		}
		const fvArray = serviceFields
			.map((f) => ({
				field_id: f.id,
				label: f.label,
				value: fieldValues[f.id] || "",
			}))
			.filter((fv) => fv.value.trim() !== "");

		// Check duplicates
		const hasCheck = serviceFields.some(
			(f) => f.require_check && fieldValues[f.id]?.trim(),
		);
		if (hasCheck && fvArray.length > 0) {
			try {
				const r = await fetch("/api/service-fields/check-duplicate", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						service_id: serviceId,
						field_values: fvArray,
					}),
				});
				if (r.ok) {
					const data = await r.json();
					if (data.duplicate && data.ticket) {
						setDuplicate(data.ticket);
						return;
					}
				}
			} catch {}
		}

		try {
			const r = await apiFetch("/api/tickets/manual", {
				method: "POST",
				body: JSON.stringify({
					service_id: serviceId,
					name: name.trim() || undefined,
					phone: phone.trim() || undefined,
					is_priority: isPriority ? 1 : 0,
					field_values: fvArray.length ? fvArray : undefined,
				}),
			});
			setDone(r);
			onCreated?.();
		} catch (e) {
			setError(e.error || "Ошибка создания");
		}
	};

	const reset = () => {
		const sid = defaultSvc ? String(defaultSvc.id) : "";
		setServiceId(sid);
		setName("");
		setPhone("");
		setIsPriority(false);
		setError("");
		setDone(null);
		setDuplicate(null);
		loadFields(sid);
	};

	if (done) {
		return (
			<div
				className="modal-overlay"
				onClick={(e) => e.target === e.currentTarget && onClose()}
			>
				<div className="modal-box" style={{ maxWidth: 440 }}>
					<div className="modal-header">
						<h2>Талон выдан</h2>
						<button className="modal-close" onClick={onClose}>
							<X size={18} />
						</button>
					</div>
					<div style={{ textAlign: "center", padding: "20px 0" }}>
						<div
							style={{
								fontSize: 56,
								fontWeight: 900,
								color: "#1e40af",
								lineHeight: 1,
							}}
						>
							№{done.number}
						</div>
						<div
							style={{
								color: "#374151",
								fontWeight: 600,
								fontSize: 15,
								marginTop: 8,
							}}
						>
							{done.service_name || "—"}
						</div>
						{done.is_priority === 1 && (
							<span
								style={{
									display: "inline-block",
									marginTop: 8,
									fontSize: 11,
									fontWeight: 700,
									padding: "3px 10px",
									borderRadius: 99,
									background: "#fff7ed",
									color: "#c2410c",
								}}
							>
								★ Приоритетный
							</span>
						)}
						{Array.isArray(done.field_values) &&
							done.field_values.filter((fv) => fv.value).length > 0 && (
								<div
									style={{
										background: "#f9fafb",
										borderRadius: 10,
										padding: 12,
										marginTop: 14,
										textAlign: "left",
									}}
								>
									{done.field_values
										.filter((fv) => fv.value)
										.map((fv, i) => (
											<div
												key={i}
												style={{
													display: "flex",
													justifyContent: "space-between",
													fontSize: 13,
													padding: "4px 0",
												}}
											>
												<span style={{ color: "#6b7280" }}>{fv.label}</span>
												<span style={{ color: "#111827", fontWeight: 600 }}>
													{fv.value}
												</span>
											</div>
										))}
								</div>
							)}
					</div>
					<div className="modal-actions">
						<button className="btn-cancel" onClick={reset}>
							Ещё один
						</button>
						<button className="btn-save" onClick={onClose}>
							Закрыть
						</button>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div
			className="modal-overlay"
			onClick={(e) => e.target === e.currentTarget && onClose()}
		>
			<div className="modal-box">
				<div className="modal-header">
					<h2>Ручная регистрация талона</h2>
					<button className="modal-close" onClick={onClose}>
						<X size={18} />
					</button>
				</div>
				<div className="modal-form">
					<div className="form-row">
						<label>Услуга *</label>
						<select
							className="field"
							value={serviceId}
							onChange={(e) => setServiceId(e.target.value)}
						>
							<option value="">Выберите услугу...</option>
							{services.map((s) => (
								<option key={s.id} value={s.id}>
									{s.name}
								</option>
							))}
						</select>
					</div>

					{selectedService?.priority > 0 && (
						<div
							style={{
								fontSize: 13,
								color: "#c2410c",
								background: "#fff7ed",
								border: "1px solid #fed7aa",
								borderRadius: 8,
								padding: 10,
							}}
						>
							★ Талон будет помечен как приоритетный (priority ={" "}
							{selectedService.priority})
						</div>
					)}

					<div
						style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
					>
						<div className="form-row">
							<label>Имя</label>
							<input
								className="field"
								value={name}
								onChange={(e) => setName(e.target.value)}
								placeholder="Имя посетителя"
							/>
						</div>
						<div className="form-row">
							<label>Телефон</label>
							<input
								className="field"
								type="tel"
								value={phone}
								onChange={(e) => setPhone(e.target.value)}
								placeholder="+7 900 000-00-00"
							/>
						</div>
					</div>

					{serviceFields.length > 0 && (
						<div
							style={{
								borderTop: "1px solid #f3f4f6",
								paddingTop: 14,
								marginTop: 6,
							}}
						>
							<div
								style={{
									fontSize: 11,
									fontWeight: 700,
									color: "#9ca3af",
									textTransform: "uppercase",
									marginBottom: 10,
								}}
							>
								Доп. поля
							</div>
							<div
								style={{ display: "flex", flexDirection: "column", gap: 10 }}
							>
								{serviceFields.map((f) => (
									<div
										key={f.id}
										className="form-row"
										style={{ marginBottom: 0 }}
									>
										<label>
											{f.label}{" "}
											{f.required && (
												<span style={{ color: "#dc2626" }}>*</span>
											)}
										</label>
										<input
											className="field"
											type={FIELD_INPUT_TYPES_ADMIN[f.field_type] || "text"}
											value={fieldValues[f.id] || ""}
											onChange={(e) =>
												setFieldValues((p) => ({
													...p,
													[f.id]: e.target.value,
												}))
											}
											placeholder={
												f.require_check ? "Проверяется на дубли" : ""
											}
										/>
									</div>
								))}
							</div>
						</div>
					)}

					<div className="form-row">
						<label
							style={{
								display: "inline-flex",
								alignItems: "center",
								gap: 6,
								cursor: "pointer",
							}}
						>
							<input
								type="checkbox"
								checked={isPriority}
								onChange={(e) => setIsPriority(e.target.checked)}
							/>
							Приоритетный талон
						</label>
					</div>

					{duplicate && (
						<div
							style={{
								fontSize: 13,
								color: "#92400e",
								background: "#fef3c7",
								border: "1px solid #fcd34d",
								borderRadius: 8,
								padding: 12,
							}}
						>
							⚠️ Найден активный талон №{duplicate.number} (
							{duplicate.status === "waiting" ? "в очереди" : "вызван"})
							<br />с такими же данными. Вероятно, посетитель уже
							зарегистрирован.
						</div>
					)}
					{error && <div className="form-error">{error}</div>}

					<div className="modal-actions">
						<button className="btn-cancel" onClick={onClose}>
							Отмена
						</button>
						<button className="btn-save" onClick={submit}>
							<Plus size={14} /> Выдать талон
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}

// ─── Edit ticket modal ──────────────────────────────────────────────────

function EditTicketModal({ ticket, onClose, onSaved, services }) {
	const [name, setName] = useState(ticket.name || "");
	const [phone, setPhone] = useState(ticket.phone || "");
	const [serviceId, setServiceId] = useState(
		ticket.service_id ? String(ticket.service_id) : "",
	);
	const [isPriority, setIsPriority] = useState(!!ticket.is_priority);
	const [status, setStatus] = useState(ticket.status);
	const [error, setError] = useState("");
	const [saving, setSaving] = useState(false);

	const save = async () => {
		setSaving(true);
		setError("");
		try {
			await apiFetch(`/api/tickets/${ticket.id}`, {
				method: "PUT",
				body: JSON.stringify({
					name: name.trim() || null,
					phone: phone.trim() || null,
					service_id: serviceId ? parseInt(serviceId) : null,
					is_priority: isPriority ? 1 : 0,
					status,
				}),
			});
			onSaved?.();
			onClose();
		} catch (e) {
			setError(e.error || "Ошибка");
		} finally {
			setSaving(false);
		}
	};

	return (
		<div
			className="modal-overlay"
			onClick={(e) => e.target === e.currentTarget && onClose()}
		>
			<div className="modal-box">
				<div className="modal-header">
					<h2>Редактирование талона №{ticket.number}</h2>
					<button className="modal-close" onClick={onClose}>
						<X size={18} />
					</button>
				</div>
				<div className="modal-form">
					<div className="form-row">
						<label>Услуга</label>
						<select
							className="field"
							value={serviceId}
							onChange={(e) => setServiceId(e.target.value)}
						>
							<option value="">— без услуги —</option>
							{services.map((s) => (
								<option key={s.id} value={s.id}>
									{s.name}
								</option>
							))}
						</select>
					</div>
					<div
						style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
					>
						<div className="form-row">
							<label>Имя</label>
							<input
								className="field"
								value={name}
								onChange={(e) => setName(e.target.value)}
							/>
						</div>
						<div className="form-row">
							<label>Телефон</label>
							<input
								className="field"
								type="tel"
								value={phone}
								onChange={(e) => setPhone(e.target.value)}
							/>
						</div>
					</div>
					<div
						style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
					>
						<div className="form-row">
							<label>Статус</label>
							<select
								className="field"
								value={status}
								onChange={(e) => setStatus(e.target.value)}
							>
								<option value="waiting">Ожидает</option>
								<option value="called">Вызван</option>
								<option value="served">Обслужен</option>
							</select>
						</div>
						<div className="form-row">
							<label
								style={{
									display: "inline-flex",
									alignItems: "center",
									gap: 6,
									cursor: "pointer",
								}}
							>
								<input
									type="checkbox"
									checked={isPriority}
									onChange={(e) => setIsPriority(e.target.checked)}
								/>
								Приоритетный
							</label>
						</div>
					</div>
					{error && <div className="form-error">{error}</div>}
					<div className="modal-actions">
						<button className="btn-cancel" onClick={onClose}>
							Отмена
						</button>
						<button className="btn-save" onClick={save} disabled={saving}>
							{saving ? (
								<Loader2 size={14} className="spin" />
							) : (
								<Check size={14} />
							)}
							{saving ? "Сохранение..." : "Сохранить"}
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}

// ─── Main Tickets Tab ───────────────────────────────────────────────────

export default function EQTicketsTab() {
	const [tickets, setTickets] = useState([]);
	const [services, setServices] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [filter, setFilter] = useState({
		date: todayStr(),
		status: "",
		service_id: "",
	});
	const [modal, setModal] = useState(null);

	const load = useCallback(async () => {
		setLoading(true);
		setError("");
		try {
			const params = new URLSearchParams({ date: filter.date });
			if (filter.status) params.set("status", filter.status);
			if (filter.service_id) params.set("service_id", filter.service_id);
			const [tk, svcs] = await Promise.all([
				apiFetch(`/api/tickets?${params}`),
				apiFetch("/api/services?all=1"),
			]);
			setTickets(Array.isArray(tk) ? tk : []);
			setServices(Array.isArray(svcs) ? svcs : []);
		} catch (e) {
			setError(e.error || "Ошибка");
		} finally {
			setLoading(false);
		}
	}, [filter]);

	useEffect(() => {
		load();
	}, [load]);

	const remove = async (t) => {
		if (!confirm(`Удалить талон №${t.number}?`)) return;
		try {
			await apiFetch(`/api/tickets/${t.id}`, { method: "DELETE" });
			load();
		} catch (e) {
			alert("Ошибка: " + (e.error || e.message));
		}
	};

	const transfer = async (t) => {
		const sid = prompt(
			"ID услуги для перевода:",
			t.service_id ? String(t.service_id) : "",
		);
		if (!sid) return;
		try {
			await apiFetch(`/api/tickets/${t.id}/transfer`, {
				method: "PUT",
				body: JSON.stringify({ service_id: parseInt(sid) }),
			});
			load();
		} catch (e) {
			alert("Ошибка: " + (e.error || e.message));
		}
	};

	const activeServices = services.filter((s) => s.enabled || s.active);

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
						Талоны
					</h2>
					<p style={{ fontSize: 13, color: "#6b7280", marginTop: 2 }}>
						{tickets.length} талонов ·{" "}
						{tickets.filter((t) => t.status === "waiting").length} ожидают
					</p>
				</div>
				<button
					className="btn-primary"
					onClick={() => setModal({ mode: "manual" })}
				>
					<Plus size={14} /> Выдать талон
				</button>
			</div>

			<div
				style={{
					background: "#fff",
					borderRadius: 12,
					border: "1px solid #e5e7eb",
					padding: "12px 16px",
					display: "flex",
					gap: 12,
					flexWrap: "wrap",
					alignItems: "center",
				}}
			>
				<Filter size={14} style={{ color: "#9ca3af" }} />
				<div style={{ display: "flex", alignItems: "center", gap: 6 }}>
					<span style={{ fontSize: 12, color: "#6b7280" }}>Дата:</span>
					<input
						className="field"
						type="date"
						style={{ width: 160 }}
						value={filter.date}
						onChange={(e) => setFilter((f) => ({ ...f, date: e.target.value }))}
					/>
				</div>
				<div style={{ display: "flex", alignItems: "center", gap: 6 }}>
					<span style={{ fontSize: 12, color: "#6b7280" }}>Статус:</span>
					<select
						className="field"
						style={{ width: 140 }}
						value={filter.status}
						onChange={(e) =>
							setFilter((f) => ({ ...f, status: e.target.value }))
						}
					>
						<option value="">Все</option>
						<option value="waiting">Ожидают</option>
						<option value="called">Вызваны</option>
						<option value="served">Обслужены</option>
					</select>
				</div>
				<div style={{ display: "flex", alignItems: "center", gap: 6 }}>
					<span style={{ fontSize: 12, color: "#6b7280" }}>Услуга:</span>
					<select
						className="field"
						style={{ width: 200 }}
						value={filter.service_id}
						onChange={(e) =>
							setFilter((f) => ({ ...f, service_id: e.target.value }))
						}
					>
						<option value="">Все</option>
						{services.map((s) => (
							<option key={s.id} value={s.id}>
								{s.name}
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
			) : tickets.length === 0 ? (
				<div className="empty-state">
					<Phone size={40} style={{ color: "#d1d5db" }} />
					<p>Нет талонов за выбранную дату</p>
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
								<th style={{ width: 80 }}>Номер</th>
								<th>Услуга</th>
								<th>Посетитель</th>
								<th style={{ width: 120 }}>Доп. поля</th>
								<th style={{ width: 130 }}>Статус</th>
								<th style={{ width: 100 }}>Создан</th>
								<th style={{ width: 100 }}>Вызван</th>
								<th style={{ width: 100 }}>Действия</th>
							</tr>
						</thead>
						<tbody>
							{tickets.map((t) => {
								const sc = STATUS_COLORS[t.status];
								return (
									<tr key={t.id}>
										<td>
											<div
												style={{
													fontWeight: 700,
													color: "#111827",
													fontSize: 16,
												}}
											>
												№{t.number}
											</div>
											{t.is_priority === 1 && (
												<span
													style={{
														fontSize: 10,
														fontWeight: 700,
														padding: "1px 6px",
														borderRadius: 4,
														background: "#fff7ed",
														color: "#c2410c",
													}}
												>
													★ приоритет
												</span>
											)}
										</td>
										<td>
											<div style={{ fontWeight: 500, color: "#111827" }}>
												{t.service_name || "—"}
											</div>
										</td>
										<td>
											{t.name && (
												<div
													style={{
														display: "flex",
														alignItems: "center",
														gap: 4,
														fontSize: 13,
													}}
												>
													<UserIcon size={12} style={{ color: "#9ca3af" }} />{" "}
													{t.name}
												</div>
											)}
											{t.phone && (
												<div
													style={{
														display: "flex",
														alignItems: "center",
														gap: 4,
														fontSize: 12,
														color: "#6b7280",
													}}
												>
													<Phone size={12} /> {t.phone}
												</div>
											)}
										</td>
										<td style={{ fontSize: 12, color: "#6b7280" }}>
											{Array.isArray(t.field_values) &&
											t.field_values.filter((fv) => fv.value).length > 0 ? (
												t.field_values
													.filter((fv) => fv.value)
													.map((fv) => (
														<div key={fv.field_id}>
															{fv.label}: {fv.value}
														</div>
													))
											) : (
												<span style={{ color: "#d1d5db" }}>—</span>
											)}
										</td>
										<td>
											<span
												style={{
													display: "inline-block",
													padding: "4px 10px",
													borderRadius: 99,
													fontSize: 11,
													fontWeight: 700,
													background: sc.bg,
													color: sc.color,
													border: `1px solid ${sc.border}`,
												}}
											>
												{STATUS_LABELS[t.status]}
											</span>
										</td>
										<td style={{ fontSize: 12, color: "#6b7280" }}>
											{fmtTime(t.created_at)}
										</td>
										<td style={{ fontSize: 12, color: "#6b7280" }}>
											{fmtTime(t.called_at)}
										</td>
										<td>
											<div style={{ display: "flex", gap: 4 }}>
												<button
													className="icon-btn"
													onClick={() => setModal({ mode: "edit", ticket: t })}
													title="Редактировать"
												>
													<Pencil size={14} />
												</button>
												<button
													className="icon-btn"
													onClick={() => transfer(t)}
													title="Перевести"
												>
													<ArrowRightLeft size={14} />
												</button>
												<button
													className="icon-btn icon-btn--danger"
													onClick={() => remove(t)}
													title="Удалить"
												>
													<Trash2 size={14} />
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

			{modal?.mode === "manual" && (
				<ManualTicketModal
					onClose={() => setModal(null)}
					onCreated={load}
					services={activeServices}
				/>
			)}
			{modal?.mode === "edit" && (
				<EditTicketModal
					ticket={modal.ticket}
					onClose={() => setModal(null)}
					onSaved={load}
					services={services}
				/>
			)}
		</div>
	);
}

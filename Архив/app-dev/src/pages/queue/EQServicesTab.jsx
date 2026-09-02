import { useState, useEffect } from "react";
import {
	Plus,
	Pencil,
	Trash2,
	Loader2,
	X,
	Check,
	Settings,
	Star,
	Clock,
	ArrowUp,
	ArrowDown,
	AlertCircle,
} from "lucide-react";
import { apiFetch } from "../../api.js";
import { FIELD_TYPES } from "./shared.js";

// ─── Service Fields Modal ───────────────────────────────────────────────

function ServiceFieldsModal({ service, onClose, onChanged }) {
	const [fields, setFields] = useState([]);
	const [form, setForm] = useState({
		label: "",
		field_type: "text",
		required: false,
		require_check: false,
	});
	const [editingId, setEditingId] = useState(null);
	const [error, setError] = useState("");

	const load = async () => {
		try {
			const r = await fetch(`/api/services/${service.id}/fields`);
			if (r.ok) setFields(await r.json());
		} catch {}
	};

	useEffect(() => {
		load();
	}, [service.id]);

	const save = async () => {
		if (!form.label.trim()) {
			setError("Введите название поля");
			return;
		}
		setError("");
		try {
			if (editingId) {
				await apiFetch(`/api/service-fields/${editingId}`, {
					method: "PUT",
					body: JSON.stringify(form),
				});
				setEditingId(null);
			} else {
				await apiFetch(`/api/services/${service.id}/fields`, {
					method: "POST",
					body: JSON.stringify(form),
				});
			}
			setForm({
				label: "",
				field_type: "text",
				required: false,
				require_check: false,
			});
			onChanged?.();
			load();
		} catch (e) {
			setError(e.error || "Ошибка");
		}
	};

	const startEdit = (f) => {
		setEditingId(f.id);
		setForm({
			label: f.label,
			field_type: f.field_type,
			required: !!f.required,
			require_check: !!f.require_check,
		});
		setError("");
	};

	const remove = async (id) => {
		if (!confirm("Удалить поле?")) return;
		try {
			await apiFetch(`/api/service-fields/${id}`, { method: "DELETE" });
			onChanged?.();
			load();
		} catch (e) {
			alert("Ошибка: " + (e.error || e.message));
		}
	};

	const move = async (field, dir) => {
		const idx = fields.findIndex((f) => f.id === field.id);
		const swapIdx = idx + dir;
		if (swapIdx < 0 || swapIdx >= fields.length) return;
		const swap = fields[swapIdx];
		try {
			await Promise.all([
				apiFetch(`/api/service-fields/${field.id}`, {
					method: "PUT",
					body: JSON.stringify({ order_index: swap.order_index }),
				}),
				apiFetch(`/api/service-fields/${swap.id}`, {
					method: "PUT",
					body: JSON.stringify({ order_index: field.order_index }),
				}),
			]);
			onChanged?.();
			load();
		} catch (e) {
			alert("Ошибка: " + (e.error || e.message));
		}
	};

	return (
		<div
			className="modal-overlay"
			onClick={(e) => e.target === e.currentTarget && onClose()}
		>
			<div className="modal-box" style={{ maxWidth: 560 }}>
				<div className="modal-header">
					<h2>Поля формы — {service.name}</h2>
					<button className="modal-close" onClick={onClose}>
						<X size={18} />
					</button>
				</div>
				<div className="modal-form">
					{fields.length === 0 ? (
						<div
							style={{
								padding: 16,
								textAlign: "center",
								color: "#9ca3af",
								fontSize: 13,
							}}
						>
							Нет дополнительных полей. Добавьте первое поле ниже.
						</div>
					) : (
						<div
							style={{
								display: "flex",
								flexDirection: "column",
								gap: 8,
								marginBottom: 16,
							}}
						>
							{fields.map((f, i) => (
								<div
									key={f.id}
									style={{
										display: "flex",
										alignItems: "center",
										gap: 8,
										padding: 10,
										borderRadius: 10,
										border:
											editingId === f.id
												? "1.5px solid #93c5fd"
												: "1.5px solid #f3f4f6",
										background: editingId === f.id ? "#eff6ff" : "#f9fafb",
									}}
								>
									<div
										style={{ display: "flex", flexDirection: "column", gap: 2 }}
									>
										<button
											onClick={() => move(f, -1)}
											disabled={i === 0}
											style={{
												background: "none",
												border: "none",
												cursor: i === 0 ? "not-allowed" : "pointer",
												color: "#9ca3af",
												padding: 0,
											}}
										>
											<ArrowUp size={14} />
										</button>
										<button
											onClick={() => move(f, 1)}
											disabled={i === fields.length - 1}
											style={{
												background: "none",
												border: "none",
												cursor:
													i === fields.length - 1 ? "not-allowed" : "pointer",
												color: "#9ca3af",
												padding: 0,
											}}
										>
											<ArrowDown size={14} />
										</button>
									</div>
									<div style={{ flex: 1, minWidth: 0 }}>
										<div
											style={{
												fontWeight: 600,
												color: "#111827",
												fontSize: 14,
											}}
										>
											{f.label}
										</div>
										<div
											style={{
												fontSize: 11,
												color: "#6b7280",
												display: "flex",
												gap: 8,
												marginTop: 2,
											}}
										>
											<span>
												{FIELD_TYPES.find((t) => t.value === f.field_type)
													?.label || f.field_type}
											</span>
											<span
												style={{
													color: f.required ? "#dc2626" : "#9ca3af",
													fontWeight: f.required ? 700 : 400,
												}}
											>
												{f.required ? "● обязательное" : "○ необязательное"}
											</span>
											{f.require_check ? (
												<span style={{ color: "#c2410c", fontWeight: 700 }}>
													● проверка дублей
												</span>
											) : null}
										</div>
									</div>
									<button className="icon-btn" onClick={() => startEdit(f)}>
										<Pencil size={14} />
									</button>
									<button
										className="icon-btn icon-btn--danger"
										onClick={() => remove(f.id)}
									>
										<Trash2 size={14} />
									</button>
								</div>
							))}
						</div>
					)}

					<div
						style={{
							borderTop: "1px solid #f3f4f6",
							paddingTop: 16,
							display: "flex",
							flexDirection: "column",
							gap: 10,
						}}
					>
						<div
							style={{
								fontSize: 11,
								fontWeight: 700,
								color: "#9ca3af",
								textTransform: "uppercase",
							}}
						>
							{editingId ? "Редактировать поле" : "Добавить поле"}
						</div>
						<input
							className="field"
							value={form.label}
							onChange={(e) =>
								setForm((f) => ({ ...f, label: e.target.value }))
							}
							placeholder="Название поля (например: ФИО, Номер документа)"
						/>
						<div
							style={{
								display: "grid",
								gridTemplateColumns: "1fr auto auto",
								gap: 8,
							}}
						>
							<select
								className="field"
								value={form.field_type}
								onChange={(e) =>
									setForm((f) => ({ ...f, field_type: e.target.value }))
								}
							>
								{FIELD_TYPES.map((t) => (
									<option key={t.value} value={t.value}>
										{t.label}
									</option>
								))}
							</select>
							<label
								style={{
									display: "inline-flex",
									alignItems: "center",
									gap: 6,
									padding: "8px 12px",
									border: "1.5px solid #d1d5db",
									borderRadius: 8,
									cursor: "pointer",
									fontSize: 13,
									whiteSpace: "nowrap",
								}}
							>
								<input
									type="checkbox"
									checked={form.required}
									onChange={(e) =>
										setForm((f) => ({ ...f, required: e.target.checked }))
									}
								/>
								Обязательное
							</label>
							<label
								style={{
									display: "inline-flex",
									alignItems: "center",
									gap: 6,
									padding: "8px 12px",
									border: "1.5px solid #fed7aa",
									background: "#fff7ed",
									borderRadius: 8,
									cursor: "pointer",
									fontSize: 13,
									whiteSpace: "nowrap",
									color: "#c2410c",
								}}
							>
								<input
									type="checkbox"
									checked={form.require_check}
									onChange={(e) =>
										setForm((f) => ({ ...f, require_check: e.target.checked }))
									}
								/>
								Проверять дубли
							</label>
						</div>
						{form.require_check && (
							<div
								style={{
									fontSize: 12,
									color: "#c2410c",
									background: "#fff7ed",
									border: "1px solid #fed7aa",
									borderRadius: 8,
									padding: 10,
								}}
							>
								⚠️ При регистрации будет проверено, есть ли активный талон с
								таким же значением этого поля
							</div>
						)}
						{error && <div className="form-error">{error}</div>}
						<div style={{ display: "flex", gap: 8 }}>
							<button
								type="button"
								className="btn-save"
								style={{ flex: 1 }}
								onClick={save}
							>
								{editingId ? <Check size={14} /> : <Plus size={14} />}
								{editingId ? "Сохранить" : "Добавить поле"}
							</button>
							{editingId && (
								<button
									type="button"
									className="btn-cancel"
									onClick={() => {
										setEditingId(null);
										setForm({
											label: "",
											field_type: "text",
											required: false,
											require_check: false,
										});
									}}
								>
									Отмена
								</button>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

// ─── Service Form ───────────────────────────────────────────────────────

function ServiceForm({ form, onChange }) {
	return (
		<div className="form-grid">
			<div className="form-row" style={{ gridColumn: "1 / -1" }}>
				<label>Название *</label>
				<input
					className="field"
					value={form.name}
					onChange={(e) => onChange("name", e.target.value)}
					placeholder="Например: Консультация"
				/>
			</div>
			<div className="form-row" style={{ gridColumn: "1 / -1" }}>
				<label>Описание</label>
				<input
					className="field"
					value={form.description}
					onChange={(e) => onChange("description", e.target.value)}
					placeholder="Описание (необязательно)"
				/>
			</div>
			<div className="form-row">
				<label>Среднее время (мин)</label>
				<input
					className="field"
					type="number"
					min="0"
					max="120"
					value={form.avg_duration_minutes}
					onChange={(e) =>
						onChange(
							"avg_duration_minutes",
							Math.max(0, parseInt(e.target.value) || 0),
						)
					}
				/>
			</div>
			<div className="form-row">
				<label>Приоритет (выше = первее)</label>
				<input
					className="field"
					type="number"
					min="0"
					max="100"
					value={form.priority}
					onChange={(e) => onChange("priority", parseInt(e.target.value) || 0)}
				/>
			</div>
			<div className="form-row" style={{ gridColumn: "1 / -1" }}>
				<label>Лимит талонов в день (0 = без лимита)</label>
				<input
					className="field"
					type="number"
					min="0"
					value={form.daily_limit}
					onChange={(e) => onChange("daily_limit", e.target.value)}
					placeholder="Без лимита"
				/>
			</div>
		</div>
	);
}

// ─── Main Services Tab ──────────────────────────────────────────────────

export default function EQServicesTab() {
	const [services, setServices] = useState([]);
	const [loading, setLoading] = useState(true);
	const [editing, setEditing] = useState(null); // null | 'new' | id
	const [form, setForm] = useState({
		name: "",
		description: "",
		avg_duration_minutes: 5,
		priority: 0,
		daily_limit: "",
	});
	const [error, setError] = useState("");
	const [fieldsModal, setFieldsModal] = useState(null);
	const [saving, setSaving] = useState(false);

	const load = async () => {
		setLoading(true);
		try {
			const r = await apiFetch("/api/services?all=1");
			setServices(Array.isArray(r) ? r : []);
		} catch (e) {
			setError(e.error || "Ошибка загрузки");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		load();
	}, []);

	const save = async () => {
		if (!form.name.trim()) {
			setError("Введите название");
			return;
		}
		setError("");
		setSaving(true);
		try {
			const body = {
				...form,
				daily_limit: form.daily_limit ? parseInt(form.daily_limit) : null,
			};
			if (editing === "new") {
				await apiFetch("/api/services", {
					method: "POST",
					body: JSON.stringify(body),
				});
			} else {
				await apiFetch(`/api/services/${editing}`, {
					method: "PUT",
					body: JSON.stringify(body),
				});
			}
			setEditing(null);
			setForm({
				name: "",
				description: "",
				avg_duration_minutes: 5,
				priority: 0,
				daily_limit: "",
			});
			load();
		} catch (e) {
			setError(e.error || "Ошибка сохранения");
		} finally {
			setSaving(false);
		}
	};

	const startEdit = (s) => {
		setEditing(s.id);
		setForm({
			name: s.name,
			description: s.description || "",
			avg_duration_minutes: s.avg_duration_minutes || 0,
			priority: s.priority || 0,
			daily_limit: s.daily_limit || "",
		});
		setError("");
	};

	const toggle = async (s) => {
		try {
			await apiFetch(`/api/services/${s.id}/toggle`, { method: "PUT" });
			load();
		} catch (e) {
			alert("Ошибка: " + (e.error || e.message));
		}
	};

	const remove = async (s) => {
		const transferTo = prompt(
			"Удалить услугу? Активные талоны останутся без услуги.\n\nВведите id услуги для переноса (или пусто):",
			"",
		);
		if (transferTo === null) return;
		try {
			await apiFetch(`/api/services/${s.id}`, {
				method: "DELETE",
				body: JSON.stringify({
					transfer_to: transferTo ? parseInt(transferTo) : null,
				}),
			});
			load();
		} catch (e) {
			alert("Ошибка: " + (e.error || e.message));
		}
	};

	const setDefault = async (s) => {
		try {
			await apiFetch(`/api/services/${s.id}/set-default`, { method: "PUT" });
			load();
		} catch (e) {
			alert("Ошибка: " + (e.error || e.message));
		}
	};

	const openNew = () => {
		setEditing("new");
		setForm({
			name: "",
			description: "",
			avg_duration_minutes: 5,
			priority: 0,
			daily_limit: "",
		});
		setError("");
	};

	if (loading) {
		return (
			<div className="loading-center">
				<Loader2 size={28} className="spin" />
			</div>
		);
	}

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
				}}
			>
				<div>
					<h2 style={{ fontSize: 18, fontWeight: 700, color: "#111827" }}>
						Услуги электронной очереди
					</h2>
					<p style={{ fontSize: 13, color: "#6b7280", marginTop: 2 }}>
						{services.length} услуг · {services.filter((s) => s.enabled).length}{" "}
						активны
					</p>
				</div>
				<button className="btn-primary" onClick={openNew}>
					<Plus size={14} /> Добавить услугу
				</button>
			</div>

			{editing && (
				<div className="eq-card" style={{ borderColor: "#93c5fd" }}>
					<div
						style={{
							fontSize: 11,
							fontWeight: 700,
							color: "#9ca3af",
							textTransform: "uppercase",
							marginBottom: 12,
						}}
					>
						{editing === "new" ? "Новая услуга" : "Редактирование"}
					</div>
					<ServiceForm
						form={form}
						onChange={(k, v) => setForm((f) => ({ ...f, [k]: v }))}
					/>
					{error && (
						<div className="form-error" style={{ marginTop: 12 }}>
							{error}
						</div>
					)}
					<div style={{ display: "flex", gap: 8, marginTop: 14 }}>
						<button className="btn-save" onClick={save} disabled={saving}>
							{saving ? (
								<Loader2 size={14} className="spin" />
							) : (
								<Check size={14} />
							)}
							{saving
								? "Сохранение..."
								: editing === "new"
									? "Добавить"
									: "Сохранить"}
						</button>
						<button className="btn-cancel" onClick={() => setEditing(null)}>
							Отмена
						</button>
					</div>
				</div>
			)}

			{services.length === 0 ? (
				<div className="empty-state">
					<Settings size={40} style={{ color: "#d1d5db" }} />
					<p>Нет услуг. Создайте первую — например, «Консультация».</p>
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
								<th>Услуга</th>
								<th style={{ width: 110, textAlign: "center" }}>Время</th>
								<th style={{ width: 90, textAlign: "center" }}>Приоритет</th>
								<th style={{ width: 90, textAlign: "center" }}>Лимит/день</th>
								<th style={{ width: 100, textAlign: "center" }}>Поля</th>
								<th style={{ width: 110, textAlign: "center" }}>По умолч.</th>
								<th style={{ width: 110, textAlign: "center" }}>Статус</th>
								<th style={{ width: 100 }}>Действия</th>
							</tr>
						</thead>
						<tbody>
							{services.map((s) => (
								<tr key={s.id} style={{ opacity: s.enabled ? 1 : 0.55 }}>
									<td>
										<div style={{ fontWeight: 600, color: "#111827" }}>
											{s.name}
										</div>
										{s.description && (
											<div style={{ fontSize: 12, color: "#6b7280" }}>
												{s.description}
											</div>
										)}
									</td>
									<td style={{ textAlign: "center", color: "#374151" }}>
										{s.avg_duration_minutes > 0
											? `${s.avg_duration_minutes} мин`
											: "—"}
									</td>
									<td style={{ textAlign: "center", color: "#374151" }}>
										{s.priority || 0}
									</td>
									<td style={{ textAlign: "center", color: "#374151" }}>
										{s.daily_limit || "∞"}
									</td>
									<td style={{ textAlign: "center" }}>
										<button
											onClick={() => setFieldsModal(s)}
											style={{
												fontSize: 12,
												fontWeight: 600,
												padding: "5px 12px",
												borderRadius: 8,
												background: "#f5f3ff",
												color: "#6d28d9",
												border: "1px solid #ddd6fe",
												cursor: "pointer",
											}}
										>
											<Settings
												size={12}
												style={{ marginRight: 4, verticalAlign: "-2px" }}
											/>
											Поля
										</button>
									</td>
									<td style={{ textAlign: "center" }}>
										<button
											onClick={() => setDefault(s)}
											title={s.is_default ? "Снять" : "Сделать по умолчанию"}
											style={{
												background: s.is_default ? "#fffbeb" : "transparent",
												color: s.is_default ? "#f59e0b" : "#d1d5db",
												border: "none",
												borderRadius: "50%",
												width: 32,
												height: 32,
												cursor: "pointer",
											}}
										>
											<Star
												size={16}
												fill={s.is_default ? "#f59e0b" : "none"}
											/>
										</button>
									</td>
									<td style={{ textAlign: "center" }}>
										<button
											onClick={() => toggle(s)}
											className={`status-toggle ${s.enabled ? "status-toggle--on" : "status-toggle--off"}`}
											style={{ fontSize: 11 }}
										>
											{s.enabled ? "Активна" : "Отключена"}
										</button>
									</td>
									<td>
										<div style={{ display: "flex", gap: 4 }}>
											<button className="icon-btn" onClick={() => startEdit(s)}>
												<Pencil size={14} />
											</button>
											<button
												className="icon-btn icon-btn--danger"
												onClick={() => remove(s)}
											>
												<Trash2 size={14} />
											</button>
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}

			{fieldsModal && (
				<ServiceFieldsModal
					service={fieldsModal}
					onClose={() => {
						setFieldsModal(null);
						load();
					}}
				/>
			)}
		</div>
	);
}

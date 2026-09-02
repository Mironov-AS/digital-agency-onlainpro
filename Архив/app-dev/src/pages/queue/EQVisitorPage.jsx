import { useState, useEffect, useCallback } from "react";
import {
	Loader2,
	Printer,
	ArrowLeft,
	Clock,
	AlertCircle,
	CheckCircle2,
} from "lucide-react";
import { apiFetch, apiFetchBlob } from "../../api.js";
import { FIELD_INPUT_TYPES_ADMIN } from "./shared.js";

// ─── Visitor kiosk: register a ticket and print the receipt ────────────

export default function EQVisitorPage() {
	const [services, setServices] = useState([]);
	const [regOpen, setRegOpen] = useState(true);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [step, setStep] = useState("choose"); // choose | fields | done
	const [pickedService, setPickedService] = useState(null);
	const [serviceFields, setServiceFields] = useState([]);
	const [fieldValues, setFieldValues] = useState({});
	const [name, setName] = useState("");
	const [phone, setPhone] = useState("");
	const [submitting, setSubmitting] = useState(false);
	const [done, setDone] = useState(null);
	const [duplicate, setDuplicate] = useState(null);
	const [minFieldLength, setMinFieldLength] = useState(3);

	const load = useCallback(async () => {
		setLoading(true);
		setError("");
		try {
			const [svcs, reg, ml] = await Promise.all([
				apiFetch("/api/services"),
				apiFetch("/api/settings/registration").catch(() => ({ open: true })),
				apiFetch("/api/settings/field-min-length").catch(() => ({
					min_length: 3,
				})),
			]);
			setServices(Array.isArray(svcs) ? svcs : []);
			setRegOpen(!!reg?.open);
			setMinFieldLength(ml?.min_length || 3);
		} catch (e) {
			setError(e.error || "Ошибка загрузки");
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		load();
	}, [load]);

	const pickService = async (s) => {
		setPickedService(s);
		setStep("fields");
		setFieldValues({});
		setName("");
		setPhone("");
		setError("");
		setDuplicate(null);
		if (s.id) {
			try {
				const r = await fetch(`/api/services/${s.id}/fields`);
				if (r.ok) {
					const data = await r.json();
					setServiceFields(data);
					const init = {};
					data.forEach((f) => {
						init[f.id] = "";
					});
					setFieldValues(init);
				} else {
					setServiceFields([]);
				}
			} catch {
				setServiceFields([]);
			}
		} else {
			setServiceFields([]);
		}
	};

	const submit = async () => {
		setError("");
		setDuplicate(null);
		setSubmitting(true);
		try {
			for (const f of serviceFields) {
				if (
					f.required &&
					(!fieldValues[f.id] ||
						fieldValues[f.id].trim().length < minFieldLength)
				) {
					setError(`Поле «${f.label}» — минимум ${minFieldLength} символа`);
					setSubmitting(false);
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
							service_id: pickedService.id,
							field_values: fvArray,
						}),
					});
					if (r.ok) {
						const data = await r.json();
						if (data.duplicate) {
							setDuplicate(data.ticket);
							setSubmitting(false);
							return;
						}
					}
				} catch {}
			}

			const r = await apiFetch("/api/tickets", {
				method: "POST",
				body: JSON.stringify({
					service_id: pickedService.id,
					name: name.trim() || undefined,
					phone: phone.trim() || undefined,
					field_values: fvArray.length ? fvArray : undefined,
				}),
			});
			setDone(r);
			setStep("done");
		} catch (e) {
			setError(e.error || "Ошибка создания");
		} finally {
			setSubmitting(false);
		}
	};

	const printTicket = async () => {
		if (!done) return;
		try {
			// Best effort — open printable page
			const w = window.open("", "_blank");
			if (!w) {
				alert("Не удалось открыть окно печати");
				return;
			}
			w.document.write(`
        <html><head><title>Талон №${done.number}</title>
        <style>
          body { font-family: sans-serif; padding: 30px; text-align: center; }
          .num { font-size: 100px; font-weight: 900; margin: 20px 0; }
          .svc { font-size: 22px; color: #444; }
          .meta { color: #999; font-size: 14px; margin-top: 20px; }
          .bar { border-top: 1px dashed #ccc; margin: 20px 0; }
          .warn { font-size: 12px; color: #888; margin-top: 30px; }
        </style></head><body>
        <div class="svc">${done.service_name || "Электронная очередь"}</div>
        <div class="num">№${done.number}</div>
        ${done.position ? `<div>Позиция в очереди: <b>${done.position}</b></div>` : ""}
        ${done.estimatedWait ? `<div>Ожидание ≈ ${done.estimatedWait} мин</div>` : ""}
        <div class="meta">${new Date(done.created_at).toLocaleString("ru-RU")}</div>
        <div class="bar"></div>
        <div class="warn">Сохраните талон и ожидайте вызова на табло</div>
        </body></html>
      `);
			w.document.close();
			setTimeout(() => w.print(), 300);
		} catch (e) {
			alert("Ошибка печати: " + e.message);
		}
	};

	const reset = () => {
		setStep("choose");
		setPickedService(null);
		setDone(null);
		setServiceFields([]);
		setFieldValues({});
		setName("");
		setPhone("");
		setError("");
		setDuplicate(null);
	};

	if (loading) {
		return (
			<div className="eq-visitor">
				<div className="loading-center">
					<Loader2 size={36} className="spin" />
				</div>
			</div>
		);
	}

	if (!regOpen) {
		return (
			<div className="eq-visitor">
				<div
					className="eq-visitor-card"
					style={{ textAlign: "center", maxWidth: 480 }}
				>
					<AlertCircle
						size={48}
						style={{ color: "#dc2626", margin: "0 auto 12px" }}
					/>
					<h2
						style={{
							fontSize: 22,
							fontWeight: 800,
							color: "#111827",
							margin: "0 0 8px",
						}}
					>
						Запись временно закрыта
					</h2>
					<p style={{ color: "#6b7280", fontSize: 15 }}>
						Приходите позже или обратитесь к администратору.
					</p>
				</div>
			</div>
		);
	}

	if (step === "done" && done) {
		return (
			<div className="eq-visitor">
				<div
					className="eq-visitor-card"
					style={{ textAlign: "center", maxWidth: 480 }}
				>
					<CheckCircle2
						size={56}
						style={{ color: "#16a34a", margin: "0 auto 12px" }}
					/>
					<div style={{ color: "#374151", fontSize: 16, fontWeight: 600 }}>
						{done.service_name || "Ваш талон"}
					</div>
					<div className="eq-visitor-number">№{done.number}</div>
					{done.position ? (
						<div style={{ color: "#1e40af", fontSize: 18, fontWeight: 700 }}>
							Позиция в очереди: {done.position}
						</div>
					) : null}
					{done.estimatedWait ? (
						<div style={{ color: "#6b7280", fontSize: 14, marginTop: 4 }}>
							<Clock size={14} style={{ verticalAlign: "-2px" }} /> ≈{" "}
							{done.estimatedWait} мин
						</div>
					) : null}
					{done.is_priority === 1 && (
						<div
							style={{
								marginTop: 12,
								display: "inline-block",
								background: "#fff7ed",
								color: "#c2410c",
								padding: "4px 12px",
								borderRadius: 99,
								fontSize: 12,
								fontWeight: 700,
							}}
						>
							★ Приоритетный
						</div>
					)}
					<div
						style={{
							marginTop: 18,
							display: "flex",
							gap: 10,
							justifyContent: "center",
						}}
					>
						<button className="btn-primary" onClick={printTicket}>
							<Printer size={16} /> Распечатать талон
						</button>
						<button className="btn-secondary" onClick={reset}>
							Записать ещё
						</button>
					</div>
					<div
						style={{
							marginTop: 18,
							padding: 14,
							background: "#f9fafb",
							borderRadius: 10,
							fontSize: 13,
							color: "#6b7280",
						}}
					>
						Сохраните номер и ожидайте вызова на табло
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="eq-visitor">
			<div
				className="eq-visitor-card"
				style={{ maxWidth: pickedService ? 520 : 720 }}
			>
				<div style={{ textAlign: "center", marginBottom: 24 }}>
					<h1
						style={{
							fontSize: 28,
							fontWeight: 900,
							color: "#111827",
							margin: 0,
						}}
					>
						Электронная очередь
					</h1>
					<p style={{ color: "#6b7280", fontSize: 14, marginTop: 6 }}>
						{step === "choose" ? "Выберите услугу" : pickedService.name}
					</p>
				</div>

				{step === "choose" && (
					<>
						{services.length === 0 ? (
							<div
								style={{ padding: 30, textAlign: "center", color: "#9ca3af" }}
							>
								Нет доступных услуг
							</div>
						) : (
							<div
								style={{
									display: "grid",
									gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
									gap: 12,
								}}
							>
								{services.map((s) => (
									<button
										key={s.id}
										onClick={() => pickService(s)}
										className="eq-service-tile"
									>
										<div
											style={{
												fontSize: 17,
												fontWeight: 700,
												color: "#111827",
											}}
										>
											{s.name}
										</div>
										{s.description && (
											<div
												style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}
											>
												{s.description}
											</div>
										)}
										{s.avg_duration_minutes > 0 && (
											<div
												style={{
													marginTop: 8,
													display: "inline-flex",
													alignItems: "center",
													gap: 4,
													fontSize: 11,
													color: "#6b7280",
												}}
											>
												<Clock size={11} /> ≈ {s.avg_duration_minutes} мин
											</div>
										)}
									</button>
								))}
							</div>
						)}
					</>
				)}

				{step === "fields" && pickedService && (
					<>
						<button
							onClick={() => setStep("choose")}
							className="btn-secondary"
							style={{ marginBottom: 16 }}
						>
							<ArrowLeft size={14} /> Назад
						</button>

						{pickedService.priority > 0 && (
							<div
								style={{
									background: "#fff7ed",
									color: "#c2410c",
									border: "1px solid #fed7aa",
									borderRadius: 10,
									padding: 10,
									marginBottom: 14,
									fontSize: 13,
								}}
							>
								★ Это приоритетная услуга
							</div>
						)}

						<div
							style={{
								display: "grid",
								gridTemplateColumns: "1fr 1fr",
								gap: 10,
								marginBottom: 14,
							}}
						>
							<input
								className="field"
								value={name}
								onChange={(e) => setName(e.target.value)}
								placeholder="Ваше имя (необязательно)"
							/>
							<input
								className="field"
								type="tel"
								value={phone}
								onChange={(e) => setPhone(e.target.value)}
								placeholder="Телефон (необязательно)"
							/>
						</div>

						{serviceFields.map((f) => (
							<div key={f.id} className="form-row">
								<label>
									{f.label}{" "}
									{f.required && <span style={{ color: "#dc2626" }}>*</span>}
								</label>
								<input
									className="field"
									type={FIELD_INPUT_TYPES_ADMIN[f.field_type] || "text"}
									value={fieldValues[f.id] || ""}
									onChange={(e) =>
										setFieldValues((p) => ({ ...p, [f.id]: e.target.value }))
									}
									placeholder={f.require_check ? "Проверяется на дубли" : ""}
								/>
								{f.require_check && (
									<span
										style={{ fontSize: 11, color: "#c2410c", marginTop: 2 }}
									>
										⚠️ Уже есть активный талон с этим значением — нельзя
										записаться повторно
									</span>
								)}
							</div>
						))}

						{duplicate && (
							<div
								style={{
									background: "#fef3c7",
									color: "#92400e",
									border: "1px solid #fcd34d",
									borderRadius: 10,
									padding: 12,
									fontSize: 13,
									marginBottom: 12,
								}}
							>
								⚠️ У вас уже есть активный талон №{duplicate.number}. Дождитесь
								его обслуживания, прежде чем записываться снова.
							</div>
						)}
						{error && <div className="form-error">{error}</div>}

						<button
							className="btn-primary"
							style={{
								width: "100%",
								marginTop: 14,
								justifyContent: "center",
								padding: "14px",
							}}
							onClick={submit}
							disabled={submitting}
						>
							{submitting ? (
								<Loader2 size={18} className="spin" />
							) : (
								<CheckCircle2 size={18} />
							)}
							{submitting ? "Регистрация..." : "Получить талон"}
						</button>
					</>
				)}
			</div>
		</div>
	);
}

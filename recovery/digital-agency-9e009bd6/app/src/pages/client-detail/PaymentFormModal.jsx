import { useState } from "react";
import { Loader2, X, Check, Calendar } from "lucide-react";
import { INTERVAL_LABELS } from "../../constants/intervals.js";
import { generatePaymentDates } from "../../utils/date.js";

export default function PaymentFormModal({
	services,
	subscriptions,
	payment,
	onClose,
	onSave,
	loading,
	serverError,
}) {
	const isEdit = !!payment;
	const [form, setForm] = useState({
		amount: payment?.amount || "",
		planned_date: payment?.planned_date?.slice(0, 10) || "",
		paid_date: payment?.paid_date?.slice(0, 10) || "",
		client_service_id: payment?.client_service_id || "",
		client_product_subscription_id:
			payment?.client_product_subscription_id || "",
		note: payment?.note || "",
		create_schedule: false,
		payment_interval: "monthly",
		schedule_start: "",
		schedule_end: "",
	});

	const scheduleDates =
		!isEdit &&
		form.create_schedule &&
		form.schedule_start &&
		form.schedule_end &&
		form.amount
			? generatePaymentDates(
					form.schedule_start,
					form.schedule_end,
					form.payment_interval,
				)
			: [];

	function regularInterval(value) {
		return value && value !== "once" ? value : "monthly";
	}

	function handleServiceChange(serviceId) {
		const service = (services || []).find((s) => s.id === serviceId);
		setForm((f) => ({
			...f,
			client_service_id: serviceId,
			client_product_subscription_id: "",
			amount: service?.price ?? f.amount,
			note: service ? f.note || service.service_name : f.note,
			payment_interval: regularInterval(
				service?.payment_interval || f.payment_interval,
			),
		}));
	}

	function handleSubscriptionChange(subscriptionId) {
		const subscription = (subscriptions || []).find(
			(s) => s.id === subscriptionId,
		);
		setForm((f) => ({
			...f,
			client_product_subscription_id: subscriptionId,
			client_service_id: "",
			amount: subscription?.billing_amount ?? f.amount,
			note: subscription
				? f.note || subscription.product_name || subscription.product_code
				: f.note,
			payment_interval: regularInterval(
				subscription?.billing_period || f.payment_interval,
			),
		}));
	}

	const handleSubmit = (e) => {
		e.preventDefault();
		onSave({
			...form,
			amount: parseFloat(form.amount),
			client_service_id: form.client_service_id || null,
			client_product_subscription_id:
				form.client_product_subscription_id || null,
		});
	};

	const canSubmit =
		loading ||
		!form.amount ||
		(form.create_schedule
			? !form.schedule_start ||
				!form.schedule_end ||
				form.schedule_end <= form.schedule_start ||
				scheduleDates.length === 0
			: !form.planned_date);

	return (
		<div
			className="modal-overlay"
			onClick={(e) => e.target === e.currentTarget && onClose()}
		>
			<div className="modal-box">
				<div className="modal-header">
					<h2>{payment ? "Редактировать платёж" : "Новый платёж"}</h2>
					<button className="modal-close" onClick={onClose}>
						<X size={18} />
					</button>
				</div>
				<form onSubmit={handleSubmit} className="modal-form" autoComplete="off">
					<div className="form-row-2">
						<div className="form-row">
							<label>Сумма *</label>
							<input
								className="field"
								type="number"
								step="0.01"
								min="0"
								value={form.amount}
								onChange={(e) =>
									setForm((f) => ({ ...f, amount: e.target.value }))
								}
								placeholder="0.00"
								required
								autoComplete="off"
							/>
						</div>
						{!form.create_schedule && (
							<div className="form-row">
								<label>Дата *</label>
								<input
									className="field"
									type="date"
									value={form.planned_date}
									onChange={(e) =>
										setForm((f) => ({ ...f, planned_date: e.target.value }))
									}
									required={!form.create_schedule}
									autoComplete="off"
								/>
							</div>
						)}
					</div>
					<div className="form-row">
						<label>Услуга</label>
						<select
							className="field"
							value={form.client_service_id}
							onChange={(e) => handleServiceChange(e.target.value)}
							autoComplete="off"
						>
							<option value="">— Без привязки —</option>
							{(services || []).map((s) => (
								<option key={s.id} value={s.id}>
									{s.service_name} ({INTERVAL_LABELS[s.payment_interval]})
								</option>
							))}
						</select>
					</div>
					<div className="form-row">
						<label>Продукт</label>
						<select
							className="field"
							value={form.client_product_subscription_id}
							onChange={(e) => handleSubscriptionChange(e.target.value)}
							autoComplete="off"
						>
							<option value="">— Без привязки —</option>
							{(subscriptions || []).map((sub) => (
								<option key={sub.id} value={sub.id}>
									{sub.product_name || sub.product_code} (
									{INTERVAL_LABELS[sub.billing_period] || sub.billing_period})
								</option>
							))}
						</select>
					</div>
					<div className="form-row">
						<label>Примечание</label>
						<input
							className="field"
							type="text"
							value={form.note}
							onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
							placeholder="Оплата за..."
							autoComplete="off"
						/>
					</div>
					{isEdit && (
						<div className="form-row">
							<label>Дата оплаты</label>
							<input
								className="field"
								type="date"
								value={form.paid_date}
								onChange={(e) =>
									setForm((f) => ({ ...f, paid_date: e.target.value }))
								}
								autoComplete="off"
							/>
						</div>
					)}
					{!isEdit && (
						<div className="schedule-section">
							<label className="schedule-toggle">
								<input
									type="checkbox"
									checked={form.create_schedule}
									onChange={(e) =>
										setForm((f) => ({
											...f,
											create_schedule: e.target.checked,
											schedule_start: "",
											schedule_end: "",
										}))
									}
								/>
								<Calendar size={14} />
								<span>Создать регулярные платежи</span>
							</label>
							{form.create_schedule && (
								<>
									<div className="form-row" style={{ marginTop: 12 }}>
										<label>Периодичность</label>
										<select
											className="field"
											value={form.payment_interval}
											onChange={(e) =>
												setForm((f) => ({
													...f,
													payment_interval: e.target.value,
												}))
											}
											autoComplete="off"
										>
											<option value="monthly">Ежемесячно</option>
											<option value="quarterly">Ежеквартально</option>
											<option value="yearly">Ежегодно</option>
										</select>
									</div>
									<div className="form-row-2" style={{ marginTop: 12 }}>
										<div className="form-row">
											<label>Начальная дата *</label>
											<input
												className="field"
												type="date"
												value={form.schedule_start}
												onChange={(e) =>
													setForm((f) => ({
														...f,
														schedule_start: e.target.value,
													}))
												}
												autoComplete="off"
											/>
										</div>
										<div className="form-row">
											<label>Дата окончания *</label>
											<input
												className="field"
												type="date"
												value={form.schedule_end}
												onChange={(e) =>
													setForm((f) => ({
														...f,
														schedule_end: e.target.value,
													}))
												}
												autoComplete="off"
											/>
										</div>
									</div>
									{scheduleDates.length > 0 && (
										<div className="schedule-preview">
											<Calendar size={13} />
											Будет создано <strong>{scheduleDates.length}</strong>{" "}
											платежей по{" "}
											<strong>
												{parseFloat(form.amount || 0).toLocaleString("ru-RU")} ₽
											</strong>{" "}
											({INTERVAL_LABELS[form.payment_interval]})
										</div>
									)}
									{form.schedule_start &&
										form.schedule_end &&
										form.schedule_end <= form.schedule_start && (
											<div className="form-error">
												Дата окончания должна быть позже начальной
											</div>
										)}
								</>
							)}
						</div>
					)}
					{serverError && <div className="form-error">{serverError}</div>}
					<div className="modal-actions">
						<button type="button" className="btn-cancel" onClick={onClose}>
							Отмена
						</button>
						<button type="submit" className="btn-save" disabled={canSubmit}>
							{loading ? (
								<Loader2 size={14} className="spin" />
							) : (
								<Check size={14} />
							)}
							{isEdit
								? "Сохранить"
								: form.create_schedule && scheduleDates.length > 0
									? `Создать ${scheduleDates.length} платежей`
									: "Создать"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}

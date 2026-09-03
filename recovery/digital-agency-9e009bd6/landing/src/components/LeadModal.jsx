import { useEffect, useState, useRef } from "react";
import { CheckCircle, Send, X } from "lucide-react";

function getInitialForm() {
	return { name: "", email: "", phone: "" };
}

export default function LeadModal({ isOpen, onClose, subject, source }) {
	const [formKey, setFormKey] = useState(0);
	const [form, setForm] = useState(getInitialForm);
	const [sending, setSending] = useState(false);
	const [done, setDone] = useState(false);
	const [error, setError] = useState("");
	const overlayRef = useRef(null);

	// Reset form when modal opens using key pattern
	if (isOpen && formKey === 0) {
		setFormKey(1);
		setDone(false);
		setError("");
	}

	useEffect(() => {
		if (!isOpen) return;
		const onKey = (e) => {
			if (e.key === "Escape") onClose();
		};
		document.addEventListener("keydown", onKey);
		document.body.style.overflow = "hidden";
		return () => {
			document.removeEventListener("keydown", onKey);
			document.body.style.overflow = "";
		};
	}, [isOpen, onClose]);

	if (!isOpen) return null;

	async function handleSubmit(e) {
		e.preventDefault();
		if (!form.name.trim() || !form.email.trim()) {
			setError("Заполните имя и email");
			return;
		}
		setSending(true);
		setError("");
		try {
			const res = await fetch("/api/admin/leads", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					...form,
					subject: subject || "Заявка с сайта",
					source: source || "",
				}),
			});
			if (!res.ok) {
				const d = await res.json().catch(() => ({}));
				throw new Error(d.error || "Ошибка отправки");
			}
			setDone(true);
		} catch (err) {
			setError(err.message);
		} finally {
			setSending(false);
		}
	}

	return (
		<div
			className="lead-overlay"
			ref={overlayRef}
			onClick={(e) => {
				if (e.target === overlayRef.current) onClose();
			}}
		>
			<div className="lead-modal">
				<button className="lead-close" onClick={onClose} aria-label="Закрыть">
					<X size={20} />
				</button>
				{done ? (
					<div className="lead-success">
						<CheckCircle size={48} className="lead-success-icon" />
						<h3>Спасибо, мы с Вами свяжемся!</h3>
						<p>Ваша заявка принята. Наш менеджер ответит в ближайшее время.</p>
						<button className="btn btn-primary" onClick={onClose}>
							Закрыть
						</button>
					</div>
				) : (
					<>
						<h3 className="lead-title">Оставить заявку</h3>
						{subject && subject !== "Заявка с сайта" && (
							<p className="lead-subject">{subject}</p>
						)}
						<form
							onSubmit={handleSubmit}
							className="lead-form"
							autoComplete="off"
						>
							<label className="lead-field">
								<span>
									Имя <span className="lead-req">*</span>
								</span>
								<input
									type="text"
									value={form.name}
									onChange={(e) =>
										setForm((f) => ({ ...f, name: e.target.value }))
									}
									placeholder="Ваше имя"
									autoComplete="name"
									autoFocus
								/>
							</label>
							<label className="lead-field">
								<span>
									E-mail <span className="lead-req">*</span>
								</span>
								<input
									type="email"
									value={form.email}
									onChange={(e) =>
										setForm((f) => ({ ...f, email: e.target.value }))
									}
									placeholder="email@example.com"
									autoComplete="off"
								/>
							</label>
							<label className="lead-field">
								<span>Телефон</span>
								<input
									type="tel"
									value={form.phone}
									onChange={(e) =>
										setForm((f) => ({ ...f, phone: e.target.value }))
									}
									placeholder="+7 (___) ___-__-__"
									autoComplete="tel"
								/>
							</label>
							{error && <p className="lead-error">{error}</p>}
							<button
								type="submit"
								className="btn btn-primary btn-lg lead-submit"
								disabled={sending}
							>
								{sending ? (
									"Отправка…"
								) : (
									<>
										<Send size={16} /> Отправить заявку
									</>
								)}
							</button>
						</form>
					</>
				)}
			</div>
		</div>
	);
}

import { useEffect, useState, useRef } from "react";
import { CheckCircle, UserPlus, X, Rocket, Copy, Check } from "lucide-react";

function getInitialForm() {
	return {
		name: "",
		phone: "",
		email: "",
	};
}

function generatePassword() {
	const chars = "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
	let password = "";
	for (let i = 0; i < 8; i++) {
		password += chars[Math.floor(Math.random() * chars.length)];
	}
	return password;
}

export default function TrialRegistrationModal({
	isOpen,
	onClose,
	productCode,
	productName,
}) {
	const [formKey, setFormKey] = useState(0);
	const [form, setForm] = useState(getInitialForm);
	const [sending, setSending] = useState(false);
	const [done, setDone] = useState(false);
	const [error, setError] = useState("");
	const [generatedPassword, setGeneratedPassword] = useState("");
	const [copied, setCopied] = useState(false);
	const overlayRef = useRef(null);

	// Reset form when modal opens
	if (isOpen && formKey === 0) {
		setFormKey(1);
		setDone(false);
		setError("");
		setGeneratedPassword("");
		setCopied(false);
	}

	// Reset formKey when modal closes completely
	const prevOpen = useRef(isOpen);
	useEffect(() => {
		if (prevOpen.current && !isOpen) {
			setFormKey(0);
		}
		prevOpen.current = isOpen;
	}, [isOpen]);

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
		if (!form.name.trim()) {
			setError("Введите ваше имя");
			return;
		}
		if (!form.phone.trim()) {
			setError("Введите номер телефона");
			return;
		}
		if (!form.email.trim()) {
			setError("Введите email");
			return;
		}
		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
			setError("Некорректный email");
			return;
		}

		const password = generatePassword();
		setGeneratedPassword(password);
		setSending(true);
		setError("");

		try {
			const res = await fetch("/api/clients/register", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					name: form.name,
					phone: form.phone,
					email: form.email,
					user_email: form.email,
					user_password: password,
					product_code: productCode,
				}),
			});
			const data = await res.json();
			if (!res.ok) throw new Error(data.error || "Ошибка регистрации");
			setDone(true);
		} catch (err) {
			setError(err.message);
		} finally {
			setSending(false);
		}
	}

	function copyPassword() {
		navigator.clipboard.writeText(generatedPassword);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	}

	return (
		<div
			className="trial-overlay"
			ref={overlayRef}
			onClick={(e) => {
				if (e.target === overlayRef.current) onClose();
			}}
		>
			<div className="trial-modal">
				<button className="trial-close" onClick={onClose} aria-label="Закрыть">
					<X size={20} />
				</button>

				{done ? (
					<div className="trial-success">
						<CheckCircle size={56} className="trial-success-icon" />
						<h3>Регистрация завершена!</h3>
						<p>
							Доступ к <strong>{productName}</strong> активирован на 14 дней
						</p>
						<div className="trial-credentials">
							<div className="trial-cred-row">
								<span className="trial-cred-label">Логин:</span>
								<span className="trial-cred-value">{form.email}</span>
							</div>
							<div className="trial-cred-row">
								<span className="trial-cred-label">Пароль:</span>
								<span className="trial-cred-value">{generatedPassword}</span>
								<button
									className="trial-copy-btn"
									onClick={copyPassword}
									title="Скопировать"
								>
									{copied ? <Check size={14} /> : <Copy size={14} />}
								</button>
							</div>
						</div>
						<p className="trial-note">
							Сохраните пароль. Войдите в{" "}
							<a href="/client-portal/" style={{ color: "var(--purple)" }}>
								личный кабинет
							</a>
						</p>
						<button className="btn btn-primary trial-submit" onClick={onClose}>
							Начать работу
						</button>
					</div>
				) : (
					<>
						<div className="trial-header">
							<div className="trial-header-icon">
								<Rocket size={28} color="#fff" />
							</div>
							<h3>Попробовать бесплатно</h3>
							<span className="trial-product">
								<strong>{productName}</strong> — 14 дней
							</span>
						</div>

						<div className="trial-body">
							<form onSubmit={handleSubmit} className="trial-form">
								<div className="trial-field">
									<label>Ваше имя</label>
									<input
										type="text"
										value={form.name}
										onChange={(e) =>
											setForm((f) => ({ ...f, name: e.target.value }))
										}
										placeholder="Иван Петров"
										autoComplete="name"
										autoFocus
									/>
								</div>

								<div className="trial-field">
									<label>Телефон</label>
									<input
										type="tel"
										value={form.phone}
										onChange={(e) =>
											setForm((f) => ({ ...f, phone: e.target.value }))
										}
										placeholder="+7 (___) ___-__-__"
										autoComplete="tel"
									/>
								</div>

								<div className="trial-field">
									<label>Email</label>
									<input
										type="email"
										value={form.email}
										onChange={(e) =>
											setForm((f) => ({ ...f, email: e.target.value }))
										}
										placeholder="ivan@company.ru"
										autoComplete="email"
									/>
								</div>

								{error && <p className="trial-error">{error}</p>}

								<button
									type="submit"
									className="btn btn-primary trial-submit"
									disabled={sending}
								>
									{sending ? (
										"Регистрация…"
									) : (
										<>
											<UserPlus size={16} /> Получить доступ
										</>
									)}
								</button>
							</form>

							<p className="trial-note">
								Пароль будет сгенерирован автоматически после регистрации
							</p>
						</div>
					</>
				)}
			</div>
		</div>
	);
}

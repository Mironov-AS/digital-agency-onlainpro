import { useState, useEffect } from "react";
import {
	Settings,
	Loader2,
	Save,
	Power,
	Clock,
	KeyRound,
	Eye,
	EyeOff,
} from "lucide-react";
import { apiFetch } from "../../api.js";

// ─── Setting row component ─────────────────────────────────────────────

function SettingToggle({ label, hint, value, onChange, disabled, loading }) {
	return (
		<div
			style={{
				display: "flex",
				alignItems: "flex-start",
				gap: 12,
				padding: "14px 0",
				borderBottom: "1px solid #f3f4f6",
			}}
		>
			<div style={{ flex: 1 }}>
				<div style={{ fontWeight: 600, color: "#111827", fontSize: 14 }}>
					{label}
				</div>
				{hint && (
					<div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>
						{hint}
					</div>
				)}
			</div>
			<button
				onClick={() => onChange(!value)}
				disabled={disabled || loading}
				style={{
					width: 50,
					height: 28,
					borderRadius: 99,
					background: value ? "#16a34a" : "#d1d5db",
					border: "none",
					cursor: disabled ? "not-allowed" : "pointer",
					position: "relative",
					transition: "background .2s",
					flexShrink: 0,
				}}
			>
				<span
					style={{
						position: "absolute",
						top: 3,
						left: value ? 25 : 3,
						width: 22,
						height: 22,
						borderRadius: "50%",
						background: "#fff",
						transition: "left .2s",
						boxShadow: "0 1px 3px rgba(0,0,0,.2)",
					}}
				/>
			</button>
		</div>
	);
}

function SettingTime({ label, hint, value, onChange, disabled }) {
	return (
		<div style={{ padding: "14px 0", borderBottom: "1px solid #f3f4f6" }}>
			<div style={{ display: "flex", alignItems: "center", gap: 10 }}>
				<div style={{ flex: 1 }}>
					<div style={{ fontWeight: 600, color: "#111827", fontSize: 14 }}>
						{label}
					</div>
					{hint && (
						<div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>
							{hint}
						</div>
					)}
				</div>
				<input
					type="time"
					value={value || ""}
					disabled={disabled}
					onChange={(e) => onChange(e.target.value)}
					className="field"
					style={{ width: 130 }}
				/>
			</div>
		</div>
	);
}

function SettingNumber({
	label,
	hint,
	value,
	onChange,
	disabled,
	min,
	max,
	suffix,
}) {
	return (
		<div style={{ padding: "14px 0", borderBottom: "1px solid #f3f4f6" }}>
			<div style={{ display: "flex", alignItems: "center", gap: 10 }}>
				<div style={{ flex: 1 }}>
					<div style={{ fontWeight: 600, color: "#111827", fontSize: 14 }}>
						{label}
					</div>
					{hint && (
						<div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>
							{hint}
						</div>
					)}
				</div>
				<div style={{ display: "flex", alignItems: "center", gap: 6 }}>
					<input
						type="number"
						min={min}
						max={max}
						value={value ?? ""}
						disabled={disabled}
						onChange={(e) => onChange(parseInt(e.target.value) || 0)}
						className="field"
						style={{ width: 80 }}
					/>
					{suffix && (
						<span style={{ fontSize: 12, color: "#6b7280" }}>{suffix}</span>
					)}
				</div>
			</div>
		</div>
	);
}

// ─── Change own password ───────────────────────────────────────────────

function ChangePasswordCard({ currentUser }) {
	const [current, setCurrent] = useState("");
	const [newPwd, setNewPwd] = useState("");
	const [confirm, setConfirm] = useState("");
	const [showCur, setShowCur] = useState(false);
	const [showNew, setShowNew] = useState(false);
	const [error, setError] = useState("");
	const [success, setSuccess] = useState(false);
	const [saving, setSaving] = useState(false);

	const save = async () => {
		setError("");
		setSuccess(false);
		if (newPwd !== confirm) {
			setError("Пароли не совпадают");
			return;
		}
		if (newPwd.length < 8) {
			setError("Минимум 8 символов");
			return;
		}
		setSaving(true);
		try {
			await apiFetch("/api/settings/password", {
				method: "PUT",
				body: JSON.stringify({ currentPassword: current, newPassword: newPwd }),
			});
			setSuccess(true);
			setCurrent("");
			setNewPwd("");
			setConfirm("");
		} catch (e) {
			setError(e.error || "Ошибка");
		} finally {
			setSaving(false);
		}
	};

	return (
		<div className="eq-card">
			<div
				style={{
					display: "flex",
					alignItems: "center",
					gap: 8,
					marginBottom: 14,
				}}
			>
				<KeyRound size={16} style={{ color: "#1e40af" }} />
				<h3
					style={{ fontSize: 15, fontWeight: 700, color: "#111827", margin: 0 }}
				>
					Сменить свой пароль
				</h3>
			</div>
			<div
				style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}
			>
				<div>
					<label
						style={{
							fontSize: 12,
							color: "#6b7280",
							marginBottom: 4,
							display: "block",
						}}
					>
						Текущий
					</label>
					<div style={{ position: "relative" }}>
						<input
							type={showCur ? "text" : "password"}
							className="field"
							value={current}
							onChange={(e) => setCurrent(e.target.value)}
							autoComplete="current-password"
							style={{ paddingRight: 38 }}
						/>
						<button
							onClick={() => setShowCur((s) => !s)}
							style={{
								position: "absolute",
								right: 8,
								top: 8,
								background: "none",
								border: "none",
								color: "#9ca3af",
								cursor: "pointer",
							}}
						>
							{showCur ? <EyeOff size={16} /> : <Eye size={16} />}
						</button>
					</div>
				</div>
				<div>
					<label
						style={{
							fontSize: 12,
							color: "#6b7280",
							marginBottom: 4,
							display: "block",
						}}
					>
						Новый
					</label>
					<div style={{ position: "relative" }}>
						<input
							type={showNew ? "text" : "password"}
							className="field"
							value={newPwd}
							onChange={(e) => setNewPwd(e.target.value)}
							autoComplete="new-password"
							style={{ paddingRight: 38 }}
						/>
						<button
							onClick={() => setShowNew((s) => !s)}
							style={{
								position: "absolute",
								right: 8,
								top: 8,
								background: "none",
								border: "none",
								color: "#9ca3af",
								cursor: "pointer",
							}}
						>
							{showNew ? <EyeOff size={16} /> : <Eye size={16} />}
						</button>
					</div>
				</div>
				<div>
					<label
						style={{
							fontSize: 12,
							color: "#6b7280",
							marginBottom: 4,
							display: "block",
						}}
					>
						Повторите
					</label>
					<input
						type="password"
						className="field"
						value={confirm}
						onChange={(e) => setConfirm(e.target.value)}
						autoComplete="new-password"
					/>
				</div>
			</div>
			{error && (
				<div className="form-error" style={{ marginTop: 10 }}>
					{error}
				</div>
			)}
			{success && (
				<div
					style={{
						marginTop: 10,
						background: "#f0fdf4",
						color: "#16a34a",
						padding: 10,
						borderRadius: 8,
						fontSize: 13,
					}}
				>
					Пароль изменён
				</div>
			)}
			<div
				style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}
			>
				<button className="btn-save" onClick={save} disabled={saving}>
					{saving ? <Loader2 size={14} className="spin" /> : <Save size={14} />}
					{saving ? "Сохранение..." : "Сохранить"}
				</button>
			</div>
		</div>
	);
}

// ─── Main settings tab ─────────────────────────────────────────────────

export default function EQSettingsTab({ currentUser }) {
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [saving, setSaving] = useState(false);

	const [regOpen, setRegOpen] = useState(true);
	const [autoOpenEnabled, setAutoOpenEnabled] = useState(false);
	const [autoOpenTime, setAutoOpenTime] = useState("09:00");
	const [autoResetEnabled, setAutoResetEnabled] = useState(false);
	const [autoResetTime, setAutoResetTime] = useState("00:00");
	const [minFieldLength, setMinFieldLength] = useState(3);
	const [terminalCountdown, setTerminalCountdown] = useState(30);

	const load = async () => {
		setLoading(true);
		setError("");
		try {
			const [reg, ao, ar, ml, tc] = await Promise.all([
				apiFetch("/api/settings/registration").catch(() => null),
				apiFetch("/api/settings/auto-open").catch(() => null),
				apiFetch("/api/settings/auto-reset").catch(() => null),
				apiFetch("/api/settings/field-min-length").catch(() => null),
				apiFetch("/api/settings/terminal-countdown").catch(() => null),
			]);
			if (reg) setRegOpen(!!reg.open);
			if (ao) {
				setAutoOpenEnabled(!!ao.enabled);
				setAutoOpenTime(ao.time || "09:00");
			}
			if (ar) {
				setAutoResetEnabled(!!ar.enabled);
				setAutoResetTime(ar.time || "00:00");
			}
			if (ml) setMinFieldLength(ml.min_length || 3);
			if (tc) setTerminalCountdown(tc.seconds || 30);
		} catch (e) {
			setError(e.error || "Ошибка");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		load();
	}, []);

	const toggleReg = async (val) => {
		setRegOpen(val);
		setSaving(true);
		try {
			await apiFetch("/api/settings/registration", {
				method: "PUT",
				body: JSON.stringify({ open: val }),
			});
		} catch (e) {
			setError(e.error || "Ошибка");
			setRegOpen(!val);
		} finally {
			setSaving(false);
		}
	};

	const saveAutoOpen = async (enabled, time) => {
		setSaving(true);
		try {
			await apiFetch("/api/settings/auto-open", {
				method: "PUT",
				body: JSON.stringify({ enabled, time }),
			});
		} catch (e) {
			setError(e.error || "Ошибка");
		} finally {
			setSaving(false);
		}
	};

	const saveAutoReset = async (enabled, time) => {
		setSaving(true);
		try {
			await apiFetch("/api/settings/auto-reset", {
				method: "PUT",
				body: JSON.stringify({ enabled, time }),
			});
		} catch (e) {
			setError(e.error || "Ошибка");
		} finally {
			setSaving(false);
		}
	};

	const saveMinLength = async (val) => {
		setSaving(true);
		try {
			await apiFetch("/api/settings/field-min-length", {
				method: "PUT",
				body: JSON.stringify({ min_length: val }),
			});
			setMinFieldLength(val);
		} catch (e) {
			setError(e.error || "Ошибка");
		} finally {
			setSaving(false);
		}
	};

	const saveTerminalCountdown = async (val) => {
		setSaving(true);
		try {
			await apiFetch("/api/settings/terminal-countdown", {
				method: "PUT",
				body: JSON.stringify({ seconds: val }),
			});
			setTerminalCountdown(val);
		} catch (e) {
			setError(e.error || "Ошибка");
		} finally {
			setSaving(false);
		}
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
				maxWidth: 760,
			}}
		>
			<div>
				<h2 style={{ fontSize: 18, fontWeight: 700, color: "#111827" }}>
					Настройки
				</h2>
				<p style={{ fontSize: 13, color: "#6b7280", marginTop: 2 }}>
					Параметры работы электронной очереди
				</p>
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

			<div className="eq-card">
				<div
					style={{
						display: "flex",
						alignItems: "center",
						gap: 8,
						marginBottom: 14,
					}}
				>
					<Power size={16} style={{ color: "#1e40af" }} />
					<h3
						style={{
							fontSize: 15,
							fontWeight: 700,
							color: "#111827",
							margin: 0,
						}}
					>
						Запись на приём
					</h3>
				</div>
				<SettingToggle
					label="Самостоятельная запись открыта"
					hint="Если выключено — посетители не смогут записаться онлайн"
					value={regOpen}
					onChange={toggleReg}
					loading={saving}
				/>
				<SettingNumber
					label="Мин. длина значения доп. полей"
					hint="Минимальное число символов для обязательных дополнительных полей (по умолчанию 3)"
					value={minFieldLength}
					min={1}
					max={50}
					suffix="симв."
					onChange={saveMinLength}
					disabled={saving}
				/>
				<SettingNumber
					label="Время показа вызванного талона на табло"
					hint="Сколько секунд табло показывает только что вызванный талон, прежде чем вернуться к ротации (по умолчанию 30)"
					value={terminalCountdown}
					min={3}
					max={300}
					suffix="сек."
					onChange={saveTerminalCountdown}
					disabled={saving}
				/>
			</div>

			<div className="eq-card">
				<div
					style={{
						display: "flex",
						alignItems: "center",
						gap: 8,
						marginBottom: 14,
					}}
				>
					<Clock size={16} style={{ color: "#1e40af" }} />
					<h3
						style={{
							fontSize: 15,
							fontWeight: 700,
							color: "#111827",
							margin: 0,
						}}
					>
						Автоматизация
					</h3>
				</div>
				<SettingToggle
					label="Автоматически открывать запись"
					hint="Каждый день в указанное время запись будет открываться автоматически"
					value={autoOpenEnabled}
					onChange={(v) => {
						setAutoOpenEnabled(v);
						saveAutoOpen(v, autoOpenTime);
					}}
					loading={saving}
				/>
				<SettingTime
					label="Время автооткрытия"
					hint="Запись будет открываться в это время ежедневно"
					value={autoOpenTime}
					disabled={!autoOpenEnabled || saving}
					onChange={(v) => {
						setAutoOpenTime(v);
						saveAutoOpen(autoOpenEnabled, v);
					}}
				/>
				<SettingToggle
					label="Автоматически сбрасывать очередь"
					hint="Каждый день в указанное время активные талоны помечаются как обслуженные"
					value={autoResetEnabled}
					onChange={(v) => {
						setAutoResetEnabled(v);
						saveAutoReset(v, autoResetTime);
					}}
					loading={saving}
				/>
				<SettingTime
					label="Время автосброса"
					hint="В это время очередь будет сбрасываться ежедневно"
					value={autoResetTime}
					disabled={!autoResetEnabled || saving}
					onChange={(v) => {
						setAutoResetTime(v);
						saveAutoReset(autoResetEnabled, v);
					}}
				/>
			</div>

			<ChangePasswordCard currentUser={currentUser} />
		</div>
	);
}

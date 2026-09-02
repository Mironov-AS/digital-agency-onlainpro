import { useState, useEffect } from "react";
import { apiFetch } from "../../api";
import { Icon, P } from "./shared-queue";

export default function SystemSettingsTab() {
	const [pwForm, setPwForm] = useState({
		currentPassword: "",
		newPassword: "",
		confirm: "",
	});
	const [pwError, setPwError] = useState("");
	const [pwOk, setPwOk] = useState(false);
	const [resetDone, setResetDone] = useState(false);
	const [autoReset, setAutoReset] = useState({ enabled: false, time: "00:00" });
	const [autoResetSaved, setAutoResetSaved] = useState(false);
	const [autoOpen, setAutoOpen] = useState({ enabled: false, time: "09:00" });
	const [autoOpenSaved, setAutoOpenSaved] = useState(false);
	const [terminalCountdown, setTerminalCountdown] = useState(30);
	const [terminalSaved, setTerminalSaved] = useState(false);
	const [fieldMinLength, setFieldMinLength] = useState(3);
	const [fieldMinLengthSaved, setFieldMinLengthSaved] = useState(false);

	useEffect(() => {
		apiFetch("/api/settings/auto-reset")
			.then((r) => r?.json())
			.then((d) => {
				if (d) setAutoReset(d);
			})
			.catch(() => {});
		apiFetch("/api/settings/auto-open")
			.then((r) => r?.json())
			.then((d) => {
				if (d) setAutoOpen(d);
			})
			.catch(() => {});
		apiFetch("/api/settings/terminal-countdown")
			.then((r) => r?.json())
			.then((d) => {
				if (d && d.seconds) setTerminalCountdown(d.seconds);
			})
			.catch(() => {});
		apiFetch("/api/settings/field-min-length")
			.then((r) => r?.json())
			.then((d) => {
				if (d && d.min_length) setFieldMinLength(d.min_length);
			})
			.catch(() => {});
	}, []);

	const saveAutoReset = async (patch) => {
		const next = { ...autoReset, ...patch };
		setAutoReset(next);
		const r = await apiFetch("/api/settings/auto-reset", {
			method: "PUT",
			body: JSON.stringify(next),
		});
		if (r !== undefined) {
			setAutoResetSaved(true);
			setTimeout(() => setAutoResetSaved(false), 2000);
		}
	};

	const saveAutoOpen = async (patch) => {
		const next = { ...autoOpen, ...patch };
		setAutoOpen(next);
		const r = await apiFetch("/api/settings/auto-open", {
			method: "PUT",
			body: JSON.stringify(next),
		});
		if (r !== undefined) {
			setAutoOpenSaved(true);
			setTimeout(() => setAutoOpenSaved(false), 2000);
		}
	};

	const saveTerminalCountdown = async (seconds) => {
		setTerminalCountdown(seconds);
		const r = await apiFetch("/api/settings/terminal-countdown", {
			method: "PUT",
			body: JSON.stringify({ seconds }),
		});
		if (r !== undefined) {
			setTerminalSaved(true);
			setTimeout(() => setTerminalSaved(false), 2000);
		}
	};

	const saveFieldMinLength = async (min_length) => {
		setFieldMinLength(min_length);
		const r = await apiFetch("/api/settings/field-min-length", {
			method: "PUT",
			body: JSON.stringify({ min_length }),
		});
		if (r !== undefined) {
			setFieldMinLengthSaved(true);
			setTimeout(() => setFieldMinLengthSaved(false), 2000);
		}
	};

	const resetQueue = async () => {
		if (!confirm("Сбросить всю очередь? Все ожидающие талоны будут отменены."))
			return;
		await apiFetch("/api/queue/reset", { method: "POST" }).catch(() => {});
		setResetDone(true);
		setTimeout(() => setResetDone(false), 3000);
	};

	const changePassword = async () => {
		setPwError("");
		setPwOk(false);
		if (pwForm.newPassword !== pwForm.confirm) {
			setPwError("Пароли не совпадают");
			return;
		}
		if (pwForm.newPassword.length < 8) {
			setPwError("Пароль должен быть не менее 8 символов");
			return;
		}
		const r = await apiFetch("/api/settings/password", {
			method: "PUT",
			body: JSON.stringify(pwForm),
		});
		if (!r) return;
		const data = await r.json();
		if (!r.ok) {
			setPwError(data.error || "Ошибка");
			return;
		}
		setPwOk(true);
		setPwForm({ currentPassword: "", newPassword: "", confirm: "" });
	};

	return (
		<div className="space-y-6 max-w-lg">
			{/* Change password */}
			<div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
				<h3 className="font-semibold text-gray-800">Управление паролем</h3>
				<p className="text-sm text-gray-500">
					Измените пароль учётной записи администратора.
				</p>
				<div>
					<label className="text-xs text-gray-500 font-medium mb-1 block">
						Текущий пароль
					</label>
					<input
						type="password"
						value={pwForm.currentPassword}
						onChange={(e) =>
							setPwForm((p) => ({ ...p, currentPassword: e.target.value }))
						}
						className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
					/>
				</div>
				<div>
					<label className="text-xs text-gray-500 font-medium mb-1 block">
						Новый пароль
					</label>
					<input
						type="password"
						value={pwForm.newPassword}
						onChange={(e) =>
							setPwForm((p) => ({ ...p, newPassword: e.target.value }))
						}
						className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
					/>
				</div>
				<div>
					<label className="text-xs text-gray-500 font-medium mb-1 block">
						Подтверждение
					</label>
					<input
						type="password"
						value={pwForm.confirm}
						onChange={(e) =>
							setPwForm((p) => ({ ...p, confirm: e.target.value }))
						}
						className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
					/>
				</div>
				{pwError && <p className="text-red-500 text-sm">{pwError}</p>}
				{pwOk && <p className="text-green-600 text-sm">Пароль изменён ✓</p>}
				<button
					onClick={changePassword}
					className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-xl transition"
				>
					Изменить пароль
				</button>
			</div>

			{/* Auto-reset queue */}
			<div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
				<h3 className="font-semibold text-gray-800 flex items-center gap-2">
					<Icon d={P.cancel} cls="w-5 h-5 text-gray-600" />
					Автосброс очереди
				</h3>
				<p className="text-sm text-gray-500">
					Ежедневный автоматический сброс очереди в указанное время.
				</p>
				<div className="flex items-center gap-4">
					<label className="flex items-center gap-2 cursor-pointer">
						<input
							type="checkbox"
							checked={autoReset.enabled}
							onChange={(e) => saveAutoReset({ enabled: e.target.checked })}
							className="w-5 h-5 rounded accent-blue-600"
						/>
						<span className="text-sm text-gray-700">Включить</span>
					</label>
					<div>
						<label className="text-xs text-gray-500 font-medium mb-1 block">
							Время сброса
						</label>
						<input
							type="time"
							value={autoReset.time}
							onChange={(e) => saveAutoReset({ time: e.target.value })}
							className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
						/>
					</div>
				</div>
				{autoResetSaved && (
					<p className="text-green-600 text-xs">Сохранено ✓</p>
				)}
			</div>

			{/* Auto-open registration */}
			<div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
				<h3 className="font-semibold text-gray-800 flex items-center gap-2">
					<Icon d={P.clock} cls="w-5 h-5 text-gray-600" />
					Автооткрытие записи
				</h3>
				<p className="text-sm text-gray-500">
					Автоматическое открытие записи в указанное время ежедневно.
				</p>
				<div className="flex items-center gap-4">
					<label className="flex items-center gap-2 cursor-pointer">
						<input
							type="checkbox"
							checked={autoOpen.enabled}
							onChange={(e) => saveAutoOpen({ enabled: e.target.checked })}
							className="w-5 h-5 rounded accent-blue-600"
						/>
						<span className="text-sm text-gray-700">Включить</span>
					</label>
					<div>
						<label className="text-xs text-gray-500 font-medium mb-1 block">
							Время открытия
						</label>
						<input
							type="time"
							value={autoOpen.time}
							onChange={(e) => saveAutoOpen({ time: e.target.value })}
							className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
						/>
					</div>
				</div>
				{autoOpenSaved && <p className="text-green-600 text-xs">Сохранено ✓</p>}
			</div>

			{/* Terminal countdown */}
			<div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
				<h3 className="font-semibold text-gray-800">Таймер терминала</h3>
				<p className="text-sm text-gray-500">
					Время показа талона на экране терминала (секунды).
				</p>
				<div className="flex items-center gap-4">
					<input
						type="number"
						min="5"
						max="300"
						value={terminalCountdown}
						onChange={(e) =>
							setTerminalCountdown(parseInt(e.target.value, 10) || 30)
						}
						className="w-28 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
					/>
					<button
						onClick={() => saveTerminalCountdown(terminalCountdown)}
						className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-xl transition text-sm"
					>
						Сохранить
					</button>
				</div>
				{terminalSaved && <p className="text-green-600 text-xs">Сохранено ✓</p>}
			</div>

			{/* Field min length */}
			<div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
				<h3 className="font-semibold text-gray-800">Минимальная длина поля</h3>
				<p className="text-sm text-gray-500">
					Минимум символов в текстовых полях при регистрации.
				</p>
				<div className="flex items-center gap-4">
					<input
						type="number"
						min="1"
						max="50"
						value={fieldMinLength}
						onChange={(e) =>
							setFieldMinLength(parseInt(e.target.value, 10) || 3)
						}
						className="w-28 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
					/>
					<button
						onClick={() => saveFieldMinLength(fieldMinLength)}
						className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-xl transition text-sm"
					>
						Сохранить
					</button>
				</div>
				{fieldMinLengthSaved && (
					<p className="text-green-600 text-xs">Сохранено ✓</p>
				)}
			</div>

			{/* Queue controls */}
			<div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
				<h3 className="font-semibold text-gray-800 text-red-600">
					Опасная зона
				</h3>
				<button
					onClick={resetQueue}
					className="bg-red-600 hover:bg-red-700 text-white font-semibold px-5 py-2.5 rounded-xl transition"
				>
					Сбросить всю очередь
				</button>
				{resetDone && (
					<p className="text-green-600 text-sm">Очередь сброшена ✓</p>
				)}
			</div>
		</div>
	);
}

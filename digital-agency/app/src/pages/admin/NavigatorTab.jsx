import { useState, useEffect, useCallback } from "react";
import {
	Download,
	Navigation,
	RefreshCw,
	Check,
	AlertCircle,
} from "lucide-react";
import { apiFetch } from "../api.js";

export default function NavigatorTab() {
	const [info, setInfo] = useState(null);
	const [loading, setLoading] = useState(true);
	const [building, setBuilding] = useState(false);
	const [buildResult, setBuildResult] = useState(null);
	const [error, setError] = useState(null);

	const loadInfo = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const data = await apiFetch("/navigator-api/info");
			setInfo(data);
		} catch (e) {
			setError("Сервер сборки недоступен. Запустите сервис или подождите.");
			setInfo(null);
		}
		setLoading(false);
	}, []);

	useEffect(() => {
		loadInfo();
	}, [loadInfo]);

	const triggerBuild = async () => {
		setBuilding(true);
		setBuildResult(null);
		setError(null);
		try {
			const result = await apiFetch("/navigator-api/build", { method: "POST" });
			setBuildResult(result);
			// Обновляем инфо через 5 секунд
			setTimeout(loadInfo, 5000);
		} catch (e) {
			setError(e?.error || "Ошибка запуска сборки");
		}
		setBuilding(false);
	};

	const formatSize = (bytes) => {
		if (!bytes) return "-";
		if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
		return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
	};

	return (
		<div>
			{/* Шапка */}
			<div
				style={{
					display: "flex",
					alignItems: "center",
					gap: "12px",
					marginBottom: "24px",
				}}
			>
				<div
					style={{
						width: "48px",
						height: "48px",
						background: "linear-gradient(135deg, #1976D2, #42A5F5)",
						borderRadius: "12px",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
					}}
				>
					<Navigation size={24} color="white" />
				</div>
				<div>
					<h3 style={{ margin: 0, fontSize: "18px" }}>OSM Навигатор</h3>
					<p style={{ margin: "4px 0 0", fontSize: "13px", color: "#6b7280" }}>
						Android-приложение для автомобильной навигации
					</p>
				</div>
			</div>

			{/* Статус сборки */}
			{loading ? (
				<div style={{ padding: "40px", textAlign: "center", color: "#6b7280" }}>
					Загрузка...
				</div>
			) : error ? (
				<div
					style={{
						padding: "24px",
						background: "#fef2f2",
						borderRadius: "12px",
						border: "1px solid #fecaca",
						marginBottom: "24px",
					}}
				>
					<div
						style={{
							display: "flex",
							alignItems: "center",
							gap: "8px",
							color: "#dc2626",
						}}
					>
						<AlertCircle size={20} />
						<strong>Ошибка</strong>
					</div>
					<p style={{ margin: "8px 0 0", color: "#991b1b" }}>{error}</p>
				</div>
			) : info ? (
				<>
					{/* Метаданные */}
					<div
						style={{
							display: "grid",
							gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
							gap: "16px",
							marginBottom: "24px",
						}}
					>
						<InfoCard label="Версия" value={info.version || "—"} />
						<InfoCard
							label="Дата сборки"
							value={
								info.buildDate
									? new Date(info.buildDate).toLocaleString("ru-RU")
									: "—"
							}
						/>
						<InfoCard label="Размер APK" value={formatSize(info.fileSize)} />
						<InfoCard
							label="Статус"
							value={
								info.exists ? (
									<span
										style={{
											display: "flex",
											alignItems: "center",
											gap: "4px",
											color: "#16a34a",
										}}
									>
										<Check size={16} /> Готов
									</span>
								) : (
									<span
										style={{
											display: "flex",
											alignItems: "center",
											gap: "4px",
											color: "#d97706",
										}}
									>
										<AlertCircle size={16} /> Не собран
									</span>
								)
							}
						/>
					</div>

					{/* Кнопки действий */}
					<div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
						{info.exists && (
							<a
								href="/navigator-apk/osm-navigator.apk"
								download
								style={{
									display: "inline-flex",
									alignItems: "center",
									gap: "8px",
									padding: "12px 20px",
									background: "#16a34a",
									color: "white",
									borderRadius: "8px",
									textDecoration: "none",
									fontWeight: 500,
								}}
							>
								<Download size={18} /> Скачать APK
							</a>
						)}
						<button
							onClick={triggerBuild}
							disabled={building}
							style={{
								display: "inline-flex",
								alignItems: "center",
								gap: "8px",
								padding: "12px 20px",
								background: building ? "#9ca3af" : "#1976D2",
								color: "white",
								borderRadius: "8px",
								border: "none",
								cursor: building ? "not-allowed" : "pointer",
								fontWeight: 500,
							}}
						>
							{building ? (
								<>
									<RefreshCw size={18} className="spin" /> Сборка...
								</>
							) : (
								<>
									<RefreshCw size={18} />{" "}
									{info.exists ? "Пересобрать" : "Собрать APK"}
								</>
							)}
						</button>
						<button
							onClick={loadInfo}
							style={{
								display: "inline-flex",
								alignItems: "center",
								gap: "8px",
								padding: "12px 20px",
								background: "white",
								color: "#374151",
								borderRadius: "8px",
								border: "1px solid #d1d5db",
								cursor: "pointer",
							}}
						>
							<RefreshCw size={18} /> Обновить
						</button>
					</div>

					{/* Результат сборки */}
					{buildResult && (
						<div
							style={{
								marginTop: "24px",
								padding: "16px",
								background: "#f0fdf4",
								borderRadius: "8px",
								border: "1px solid #bbf7d0",
							}}
						>
							<div
								style={{
									display: "flex",
									alignItems: "center",
									gap: "8px",
									color: "#16a34a",
								}}
							>
								<Check size={18} />
								<strong>Сборка запущена</strong>
							</div>
							<p
								style={{
									margin: "8px 0 0",
									fontSize: "13px",
									color: "#166534",
								}}
							>
								APK будет доступен через 3-5 минут. Нажмите "Обновить" для
								проверки статуса.
							</p>
						</div>
					)}

					{/* Что нового */}
					{info.changelog && info.changelog.length > 0 && (
						<div style={{ marginTop: "24px" }}>
							<h4
								style={{
									fontSize: "14px",
									fontWeight: 600,
									marginBottom: "12px",
								}}
							>
								Возможности:
							</h4>
							<ul
								style={{
									margin: 0,
									paddingLeft: "20px",
									color: "#374151",
									fontSize: "14px",
								}}
							>
								{info.changelog.map((item, i) => (
									<li key={i} style={{ marginBottom: "6px" }}>
										{item}
									</li>
								))}
							</ul>
						</div>
					)}
				</>
			) : null}
		</div>
	);
}

function InfoCard({ label, value }) {
	return (
		<div
			style={{
				padding: "16px",
				background: "#f9fafb",
				borderRadius: "8px",
				border: "1px solid #e5e7eb",
			}}
		>
			<div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>
				{label}
			</div>
			<div style={{ fontSize: "16px", fontWeight: 600 }}>{value}</div>
		</div>
	);
}

import { useState, useEffect, useCallback } from "react";
import {
	Download,
	Navigation,
	RefreshCw,
	Check,
	AlertCircle,
	Smartphone,
	Rocket,
	Clock,
	FileText,
	ChevronDown,
	ChevronUp,
} from "lucide-react";
import { apiFetch } from "../api.js";

const STATUS_LABELS = {
	stable: { label: "Стабильная", color: "#16a34a", bg: "#dcfce7" },
	beta: { label: "Бета", color: "#d97706", bg: "#fef3c7" },
	dev: { label: "Разработка", color: "#3b82f6", bg: "#dbeafe" },
};

function formatSize(bytes) {
	if (!bytes) return "—";
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
	return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(dateStr) {
	if (!dateStr) return "—";
	return new Date(dateStr).toLocaleString("ru-RU", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
}

function VersionCard({ version, isLatest, expanded, onToggle }) {
	const status = STATUS_LABELS[version.channel] || STATUS_LABELS.stable;

	return (
		<div
			style={{
				border: `1px solid ${isLatest ? "#0ea5e9" : "#e5e7eb"}`,
				borderRadius: "12px",
				overflow: "hidden",
				marginBottom: "16px",
				background: isLatest ? "#f0f9ff" : "white",
			}}
		>
			{/* Заголовок */}
			<div
				style={{
					display: "flex",
					alignItems: "center",
					gap: "12px",
					padding: "16px 20px",
					cursor: "pointer",
					background: isLatest ? "#e0f2fe" : "transparent",
				}}
				onClick={onToggle}
			>
				<div
					style={{
						width: "40px",
						height: "40px",
						background: "linear-gradient(135deg, #1976D2, #42A5F5)",
						borderRadius: "10px",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
					}}
				>
					<Smartphone size={20} color="white" />
				</div>

				<div style={{ flex: 1 }}>
					<div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
						<span style={{ fontWeight: 600, fontSize: "15px" }}>
							{version.version_name}
						</span>
						{version.build_number && (
							<span style={{ fontSize: "12px", color: "#6b7280" }}>
								Build #{version.build_number}
							</span>
						)}
						{isLatest && (
							<span
								style={{
									fontSize: "11px",
									padding: "2px 8px",
									borderRadius: "10px",
									background: "#0ea5e9",
									color: "white",
									fontWeight: 500,
								}}
							>
								Latest
							</span>
						)}
					</div>
					<div
						style={{
							display: "flex",
							alignItems: "center",
							gap: "12px",
							marginTop: "4px",
							fontSize: "13px",
							color: "#6b7280",
						}}
					>
						<span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
							<Clock size={12} /> {formatDate(version.build_date)}
						</span>
						<span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
							<FileText size={12} /> {formatSize(version.file_size)}
						</span>
						<span
							style={{
								padding: "2px 8px",
								borderRadius: "10px",
								background: status.bg,
								color: status.color,
								fontSize: "11px",
								fontWeight: 500,
							}}
						>
							{status.label}
						</span>
					</div>
				</div>

				<div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
					<a
						href={`/navigator-apk/${version.file_name}`}
						download
						style={{
							display: "inline-flex",
							alignItems: "center",
							gap: "6px",
							padding: "8px 16px",
							background: "#16a34a",
							color: "white",
							borderRadius: "8px",
							textDecoration: "none",
							fontSize: "13px",
							fontWeight: 500,
						}}
						onClick={(e) => e.stopPropagation()}
					>
						<Download size={14} /> Скачать
					</a>
					<button
						style={{
							background: "none",
							border: "none",
							cursor: "pointer",
							color: "#6b7280",
							padding: "4px",
						}}
					>
						{expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
					</button>
				</div>
			</div>

			{/* Детали */}
			{expanded && (
				<div
					style={{
						padding: "0 20px 16px 72px",
						borderTop: "1px solid #e5e7eb",
						marginTop: "0",
					}}
				>
					{version.description && (
						<p
							style={{
								margin: "12px 0 0",
								fontSize: "14px",
								color: "#374151",
								lineHeight: 1.5,
							}}
						>
							{version.description}
						</p>
					)}
					{version.features && version.features.length > 0 && (
						<div style={{ marginTop: "12px" }}>
							<span
								style={{ fontSize: "12px", color: "#6b7280", fontWeight: 500 }}
							>
								Возможности:
							</span>
							<ul
								style={{
									margin: "6px 0 0",
									paddingLeft: "16px",
									fontSize: "13px",
									color: "#374151",
								}}
							>
								{version.features.map((f, i) => (
									<li key={i} style={{ marginBottom: "4px" }}>
										{f}
									</li>
								))}
							</ul>
						</div>
					)}
				</div>
			)}
		</div>
	);
}

export default function NavigatorPage({ onBack }) {
	const [versions, setVersions] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [expandedId, setExpandedId] = useState(null);
	const [building, setBuilding] = useState(false);
	const [buildResult, setBuildResult] = useState(null);

	const loadVersions = useCallback(async () => {
		setLoading(true);
		setError("");
		try {
			const data = await apiFetch("/api/navigator/versions");
			setVersions(Array.isArray(data) ? data : []);
			// Автоматически раскрываем последнюю версию
			if (data?.length > 0) {
				setExpandedId(data[0].id);
			}
		} catch (err) {
			setError(err.error || "Ошибка загрузки версий");
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		loadVersions();
	}, [loadVersions]);

	const triggerBuild = async () => {
		setBuilding(true);
		setBuildResult(null);
		setError(null);
		try {
			const result = await apiFetch("/navigator-api/build", { method: "POST" });
			setBuildResult(result);
			setTimeout(loadVersions, 5000);
		} catch (e) {
			setError(e?.error || "Ошибка запуска сборки");
		}
		setBuilding(false);
	};

	return (
		<div className="page">
			<div className="page-header">
				<button className="btn-back" onClick={onBack}>
					<ArrowLeft size={16} /> Назад
				</button>
				<div>
					<h1 className="page-title">Приложение Навигатор</h1>
					<p className="page-sub">
						Android-приложение для автомобильной навигации на базе OSM
					</p>
				</div>
				<button
					onClick={triggerBuild}
					disabled={building}
					className="btn-primary-sm"
					style={{
						marginLeft: "auto",
						background: building ? "#9ca3af" : "#1976D2",
					}}
				>
					{building ? (
						<>
							<RefreshCw size={14} className="spin" /> Сборка...
						</>
					) : (
						<>
							<Rocket size={14} /> Собрать APK
						</>
					)}
				</button>
			</div>

			{loading ? (
				<div className="loading-center">
					<RefreshCw size={24} className="spin" />
				</div>
			) : error ? (
				<div className="page-error">
					{error} <button onClick={loadVersions}>Повторить</button>
				</div>
			) : (
				<>
					{buildResult && (
						<div
							style={{
								margin: "0 32px 24px",
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

					{versions.length === 0 ? (
						<div className="empty-state">
							<Navigation
								size={40}
								style={{ color: "#9ca3af", marginBottom: 12 }}
							/>
							<p>Версий пока нет</p>
							<button
								className="btn-primary-sm"
								onClick={triggerBuild}
								disabled={building}
							>
								<Rocket size={14} /> Собрать первую версию
							</button>
						</div>
					) : (
						<div style={{ margin: "0 32px" }}>
							<p
								style={{
									fontSize: "13px",
									color: "#6b7280",
									marginBottom: "16px",
								}}
							>
								Всего версий: {versions.length}
							</p>
							{versions.map((v, idx) => (
								<VersionCard
									key={v.id}
									version={v}
									isLatest={idx === 0}
									expanded={expandedId === v.id}
									onToggle={() =>
										setExpandedId(expandedId === v.id ? null : v.id)
									}
								/>
							))}
						</div>
					)}
				</>
			)}
		</div>
	);
}

// Добавляем ArrowLeft, если забыли импортировать
import { ArrowLeft } from "lucide-react";

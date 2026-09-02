import { useState, useEffect } from "react";
import {
	ArrowLeft,
	Users,
	ClipboardList,
	Settings,
	BarChart3,
	ListOrdered,
	UserCog,
	QrCode,
	Monitor,
	Touchpad,
	Film,
} from "lucide-react";
import { apiFetch } from "../api.js";
import { nowTime } from "./queue/shared.js";

import EQQueueTab from "./queue/EQQueueTab.jsx";
import EQTicketsTab from "./queue/EQTicketsTab.jsx";
import EQServicesTab from "./queue/EQServicesTab.jsx";
import EQStatsTab from "./queue/EQStatsTab.jsx";
import EQLogsTab from "./queue/EQLogsTab.jsx";
import EQUsersTab from "./queue/EQUsersTab.jsx";
import EQSettingsTab from "./queue/EQSettingsTab.jsx";
import EQQRTab from "./queue/EQQRTab.jsx";
import AdsTab from "./queue/AdsTab.jsx";
import SystemSettingsTab from "./queue/SystemSettingsTab.jsx";

const TABS = [
	{ id: "queue", label: "Очередь", icon: Users },
	{ id: "tickets", label: "Талоны", icon: ClipboardList },
	{ id: "services", label: "Услуги", icon: Settings },
	{ id: "stats", label: "Статистика", icon: BarChart3 },
	{ id: "logs", label: "Журнал", icon: ListOrdered },
	{ id: "users", label: "Пользователи", icon: UserCog },
	{ id: "qr", label: "QR-коды", icon: QrCode },
	{ id: "ads", label: "Реклама", icon: Film, adminOnly: true },
	{ id: "settings", label: "Настройки", icon: Settings, adminOnly: true },
	{ id: "system", label: "Система", icon: Settings, adminOnly: true },
];

export default function ElectronicQueuePage({ onBack, user }) {
	const [tab, setTab] = useState("queue");
	const [time, setTime] = useState(nowTime());
	const [regOpen, setRegOpen] = useState(true);
	const [loadingReg, setLoadingReg] = useState(true);

	// Clock
	useEffect(() => {
		const t = setInterval(() => setTime(nowTime()), 1000);
		return () => clearInterval(t);
	}, []);

	// Live registration status in header
	useEffect(() => {
		setLoadingReg(true);
		apiFetch("/api/settings/registration")
			.then((r) => setRegOpen(!!r?.open))
			.catch(() => {})
			.finally(() => setLoadingReg(false));
	}, []);

	const isAdmin = user?.role === "admin";
	const availableTabs = TABS.filter((t) => !t.adminOnly || isAdmin);

	const toggleReg = async () => {
		const next = !regOpen;
		setRegOpen(next); // optimistic
		try {
			await apiFetch("/api/settings/registration", {
				method: "PUT",
				body: JSON.stringify({ open: next }),
			});
		} catch {
			setRegOpen(!next); // revert
		}
	};

	return (
		<div className="page">
			<div className="page-header">
				<button className="btn-back" onClick={onBack}>
					<ArrowLeft size={16} /> Назад
				</button>
				<div>
					<h1 className="page-title">Электронная очередь</h1>
					<p className="page-sub">Управление продуктом «Электронная очередь»</p>
				</div>
				<div
					style={{
						marginLeft: "auto",
						display: "flex",
						gap: 8,
						alignItems: "center",
						flexWrap: "wrap",
					}}
				>
					<button
						onClick={() =>
							window.open(
								`${window.location.origin}/app/queue/display`,
								"eq-display",
								"width=1280,height=720",
							)
						}
						title="Открыть публичное табло для зала ожидания"
						style={{
							display: "inline-flex",
							alignItems: "center",
							gap: 6,
							padding: "8px 12px",
							borderRadius: 8,
							fontSize: 12,
							fontWeight: 600,
							border: "1.5px solid #1e40af",
							background: "#eff6ff",
							color: "#1e40af",
							cursor: "pointer",
						}}
					>
						<Monitor size={14} /> Табло
					</button>
					<button
						onClick={() =>
							window.open(
								`${window.location.origin}/app/queue/visitor`,
								"eq-kiosk",
								"width=900,height=720",
							)
						}
						title="Открыть сенсорный киоск для посетителей"
						style={{
							display: "inline-flex",
							alignItems: "center",
							gap: 6,
							padding: "8px 12px",
							borderRadius: 8,
							fontSize: 12,
							fontWeight: 600,
							border: "1.5px solid #16a34a",
							background: "#f0fdf4",
							color: "#15803d",
							cursor: "pointer",
						}}
					>
						<Touchpad size={14} /> Киоск
					</button>
				</div>

				<button
					onClick={toggleReg}
					disabled={loadingReg}
					style={{
						display: "inline-flex",
						alignItems: "center",
						gap: 8,
						padding: "8px 14px",
						borderRadius: 8,
						fontSize: 13,
						fontWeight: 700,
						border: regOpen ? "1.5px solid #86efac" : "1.5px solid #fca5a5",
						background: regOpen ? "#f0fdf4" : "#fef2f2",
						color: regOpen ? "#15803d" : "#b91c1c",
						cursor: "pointer",
					}}
				>
					<span
						style={{
							width: 8,
							height: 8,
							borderRadius: "50%",
							background: regOpen ? "#16a34a" : "#dc2626",
						}}
					/>
					{regOpen ? "Запись открыта" : "Запись закрыта"}
				</button>
				<div style={{ textAlign: "right" }}>
					<div
						style={{
							fontSize: 18,
							fontWeight: 700,
							color: "#1e40af",
							fontVariantNumeric: "tabular-nums",
						}}
					>
						{time}
					</div>
					<div style={{ fontSize: 11, color: "#6b7280" }}>
						{new Date().toLocaleDateString("ru-RU", {
							weekday: "long",
							day: "numeric",
							month: "long",
						})}
					</div>
				</div>
			</div>

			{/* Tab bar */}
			<div
				style={{
					display: "flex",
					alignItems: "center",
					gap: 0,
					padding: "0 24px",
					background: "#fff",
					borderBottom: "1px solid #e5e7eb",
					overflowX: "auto",
				}}
			>
				{availableTabs.map((t) => {
					const Icon = t.icon;
					const active = tab === t.id;
					return (
						<button
							key={t.id}
							onClick={() => setTab(t.id)}
							style={{
								display: "inline-flex",
								alignItems: "center",
								gap: 8,
								padding: "12px 18px",
								fontSize: 13,
								fontWeight: 600,
								background: "none",
								border: "none",
								cursor: "pointer",
								color: active ? "#1e40af" : "#6b7280",
								borderBottom: active
									? "2px solid #1e40af"
									: "2px solid transparent",
								transition: "all .15s",
								whiteSpace: "nowrap",
							}}
						>
							<Icon size={14} />
							{t.label}
						</button>
					);
				})}
			</div>

			<div style={{ background: "#f3f6fb", minHeight: "calc(100vh - 130px)" }}>
				{tab === "queue" && <EQQueueTab />}
				{tab === "tickets" && <EQTicketsTab />}
				{tab === "services" && <EQServicesTab />}
				{tab === "stats" && <EQStatsTab />}
				{tab === "logs" && <EQLogsTab />}
				{tab === "users" && <EQUsersTab currentUser={user} />}
				{tab === "qr" && <EQQRTab />}
				{tab === "settings" && isAdmin && <EQSettingsTab currentUser={user} />}
				{tab === "ads" && isAdmin && <AdsTab />}
				{tab === "system" && isAdmin && <SystemSettingsTab />}
			</div>
		</div>
	);
}

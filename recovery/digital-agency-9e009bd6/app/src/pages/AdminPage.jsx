import { useState } from "react";
import { ArrowLeft, UserCog, Mail, Settings, Navigation } from "lucide-react";
import UsersTab from "./admin/UsersTab.jsx";
import LeadEmailsTab from "./admin/LeadEmailsTab.jsx";
import SmtpSettingsTab from "./admin/SmtpSettingsTab.jsx";
import NavigatorTab from "./admin/NavigatorTab.jsx";

const TABS = [
	{ id: "users", label: "Пользователи", icon: UserCog },
	{ id: "lead-emails", label: "Email для заявок", icon: Mail },
	{ id: "smtp", label: "Настройки SMTP", icon: Settings },
	{ id: "navigator", label: "Навигатор", icon: Navigation },
];

export default function AdminPage({ onBack, user }) {
	const [tab, setTab] = useState("users");
	return (
		<div className="page">
			<div className="page-header">
				<button className="btn-back" onClick={onBack}>
					<ArrowLeft size={16} /> Назад
				</button>
				<div>
					<h1 className="page-title">Администрирование</h1>
					<p style={{ fontSize: "13px", color: "#6b7280", marginTop: "2px" }}>
						Управление системой
					</p>
				</div>
			</div>
			<div style={{ padding: "0 32px" }}>
				<div
					style={{
						display: "flex",
						gap: "4px",
						borderBottom: "1px solid #e5e7eb",
						marginBottom: "24px",
					}}
				>
					{TABS.map((t) => {
						const Icon = t.icon;
						return (
							<button
								key={t.id}
								onClick={() => setTab(t.id)}
								style={{
									display: "flex",
									alignItems: "center",
									gap: "6px",
									padding: "10px 16px",
									background: "none",
									border: "none",
									cursor: "pointer",
									fontSize: "14px",
									fontWeight: tab === t.id ? 600 : 400,
									color: tab === t.id ? "#1e40af" : "#6b7280",
									borderBottom:
										tab === t.id
											? "2px solid #1e40af"
											: "2px solid transparent",
									marginBottom: "-1px",
									transition: "all .15s",
								}}
							>
								<Icon size={16} /> {t.label}
							</button>
						);
					})}
				</div>
			</div>
			<div style={{ padding: "0 32px 24px" }}>
				{tab === "users" && <UsersTab user={user} />}
				{tab === "lead-emails" && <LeadEmailsTab />}
				{tab === "smtp" && <SmtpSettingsTab />}
				{tab === "navigator" && <NavigatorTab />}
			</div>
		</div>
	);
}

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import "./App.css";
import { apiFetch } from "./api.js";
import LoginPage from "./pages/LoginPage.jsx";
import AppShell from "./components/AppShell.jsx";
import CatalogPage from "./pages/CatalogPage";
import ClientsPage from "./pages/ClientsPage";
import ClientDetailPage from "./pages/ClientDetailPage";
import DashboardPage from "./pages/DashboardPage";
import ProductShelfPage from "./pages/ProductShelfPage";
import OrgCostsPage from "./pages/OrgCostsPage";
import AdminPage from "./pages/AdminPage";
import ProjectsPage from "./pages/ProjectsPage";
import ElectronicQueuePage from "./pages/ElectronicQueuePage.jsx";
import EQVisitorPage from "./pages/queue/EQVisitorPage.jsx";
import EQDisplayPage from "./pages/queue/EQDisplayPage.jsx";
import TerminalPage from "./pages/queue/TerminalPage.jsx";

function Splash() {
	return (
		<div className="splash">
			<Loader2 size={32} className="spin" />
		</div>
	);
}

function Dashboard({ user, onLogout }) {
	const [page, setPage] = useState("dashboard");
	const [selectedClientId, setSelectedClientId] = useState(null);

	const goHome = () => {
		setPage("dashboard");
		setSelectedClientId(null);
	};

	if (page === "analytics") {
		return (
			<DashboardPage
				onBack={goHome}
				onGoToClient={(id) => {
					setSelectedClientId(id);
					setPage("clients");
				}}
			/>
		);
	}
	if (page === "catalog") return <CatalogPage onBack={goHome} user={user} />;
	if (page === "clients" && selectedClientId) {
		return (
			<ClientDetailPage
				clientId={selectedClientId}
				onBack={() => setSelectedClientId(null)}
			/>
		);
	}
	if (page === "clients") {
		return <ClientsPage onBack={goHome} onSelectClient={setSelectedClientId} />;
	}
	if (page === "projects") return <ProjectsPage onBack={goHome} />;
	if (page === "orgcosts") return <OrgCostsPage onBack={goHome} />;
	if (page === "product-shelf")
		return (
			<ProductShelfPage
				onBack={goHome}
				user={user}
				onOpenQueueAdmin={() => setPage("queue-admin")}
			/>
		);
	if (page === "admin") return <AdminPage onBack={goHome} user={user} />;
	if (page === "queue-admin")
		return <ElectronicQueuePage onBack={goHome} user={user} />;

	return <AppShell user={user} onLogout={onLogout} onNavigate={setPage} />;
}

export default function App() {
	const [user, setUser] = useState(null);
	const [checking, setChecking] = useState(true);
	const [visitorMode, setVisitorMode] = useState(
		() =>
			typeof window !== "undefined" &&
			window.location.pathname.endsWith("/queue/visitor"),
	);
	const [displayMode, setDisplayMode] = useState(
		() =>
			typeof window !== "undefined" &&
			window.location.pathname.endsWith("/queue/display"),
	);
	const [terminalMode, setTerminalMode] = useState(
		() =>
			typeof window !== "undefined" &&
			window.location.pathname.endsWith("/queue/terminal"),
	);

	useEffect(() => {
		if (visitorMode || displayMode || terminalMode) return;
		apiFetch("/api/auth/me")
			.then(setUser)
			.catch(() => {})
			.finally(() => setChecking(false));
	}, [visitorMode, displayMode, terminalMode]);

	useEffect(() => {
		if (!visitorMode) return;
		const onPop = () => {
			setVisitorMode(window.location.pathname.endsWith("/queue/visitor"));
		};
		window.addEventListener("popstate", onPop);
		return () => window.removeEventListener("popstate", onPop);
	}, [visitorMode]);

	useEffect(() => {
		if (!displayMode) return;
		const onPop = () => {
			setDisplayMode(window.location.pathname.endsWith("/queue/display"));
		};
		window.addEventListener("popstate", onPop);
		return () => window.removeEventListener("popstate", onPop);
	}, [displayMode]);

	useEffect(() => {
		if (!terminalMode) return;
		const onPop = () => {
			setTerminalMode(window.location.pathname.endsWith("/queue/terminal"));
		};
		window.addEventListener("popstate", onPop);
		return () => window.removeEventListener("popstate", onPop);
	}, [terminalMode]);

	async function handleLogout() {
		await apiFetch("/api/auth/logout", { method: "POST" }).catch(() => {});
		setUser(null);
	}

	if (visitorMode) return <EQVisitorPage />;
	if (displayMode) return <EQDisplayPage />;
	if (terminalMode) return <TerminalPage />;
	if (checking) return <Splash />;
	if (!user) return <LoginPage onLogin={setUser} />;
	return <Dashboard user={user} onLogout={handleLogout} />;
}

import { useState, useEffect } from "react";
import {
	QrCode,
	Download,
	Copy,
	Check,
	Loader2,
	Smartphone,
} from "lucide-react";
import { apiFetch } from "../../api.js";

export default function EQQRTab() {
	const [urls, setUrls] = useState({
		visitor: "",
		terminal: "",
	});
	const [qrs, setQrs] = useState({ visitor: null, terminal: null });
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [copied, setCopied] = useState("");

	useEffect(() => {
		const base = window.location.origin;
		setUrls({
			visitor: `${base}/queue/visitor`,
			terminal: `${base}/queue/terminal`,
		});
	}, []);

	const generate = async (key, url) => {
		if (!url) return;
		setLoading(true);
		setError("");
		try {
			const r = await apiFetch(`/api/qrcode?url=${encodeURIComponent(url)}`);
			setQrs((p) => ({ ...p, [key]: r.qrcode }));
		} catch (e) {
			setError(e.error || "Ошибка генерации");
		} finally {
			setLoading(false);
		}
	};

	const generateBoth = async () => {
		setLoading(true);
		setError("");
		try {
			const [a, b] = await Promise.all([
				apiFetch(`/api/qrcode?url=${encodeURIComponent(urls.visitor)}`),
				apiFetch(`/api/qrcode?url=${encodeURIComponent(urls.terminal)}`),
			]);
			setQrs({ visitor: a.qrcode, terminal: b.qrcode });
		} catch (e) {
			setError(e.error || "Ошибка генерации");
		} finally {
			setLoading(false);
		}
	};

	const downloadQr = async (key, url) => {
		try {
			const r = await fetch(
				`/api/qrcode/download?url=${encodeURIComponent(url)}`,
				{
					credentials: "include",
				},
			);
			if (!r.ok) throw new Error("Ошибка");
			const blob = await r.blob();
			const blobUrl = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = blobUrl;
			a.download = `qr_${key}.png`;
			a.click();
			URL.revokeObjectURL(blobUrl);
		} catch (e) {
			alert("Ошибка скачивания: " + e.message);
		}
	};

	const copyUrl = async (key, url) => {
		try {
			await navigator.clipboard.writeText(url);
			setCopied(key);
			setTimeout(() => setCopied(""), 1500);
		} catch {}
	};

	const cards = [
		{
			key: "visitor",
			title: "Запись посетителя",
			desc: "QR ведёт на публичную страницу, где посетитель сам выбирает услугу и записывается в очередь.",
			icon: Smartphone,
			color: "#1e40af",
			bg: "#eff6ff",
		},
		{
			key: "terminal",
			title: "Терминал в зале",
			desc: "QR для планшета/киоска у входа — оператор выдаёт талоны на месте.",
			icon: Smartphone,
			color: "#7c3aed",
			bg: "#f5f3ff",
		},
	];

	return (
		<div
			style={{
				padding: "20px 24px",
				display: "flex",
				flexDirection: "column",
				gap: 16,
			}}
		>
			<div
				style={{
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					flexWrap: "wrap",
					gap: 12,
				}}
			>
				<div>
					<h2 style={{ fontSize: 18, fontWeight: 700, color: "#111827" }}>
						QR-коды
					</h2>
					<p style={{ fontSize: 13, color: "#6b7280", marginTop: 2 }}>
						Генерация QR-кодов для посетителей и терминалов
					</p>
				</div>
				<button
					className="btn-primary"
					onClick={generateBoth}
					disabled={loading || !urls.visitor}
				>
					<QrCode size={14} /> Сгенерировать оба
				</button>
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

			<div
				style={{
					display: "grid",
					gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))",
					gap: 16,
				}}
			>
				{cards.map((c) => (
					<div key={c.key} className="eq-card">
						<div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
							<div
								style={{
									width: 40,
									height: 40,
									borderRadius: 10,
									background: c.bg,
									color: c.color,
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									flexShrink: 0,
								}}
							>
								<c.icon size={20} />
							</div>
							<div style={{ flex: 1 }}>
								<div style={{ fontWeight: 700, color: "#111827" }}>
									{c.title}
								</div>
								<div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>
									{c.desc}
								</div>
							</div>
						</div>

						<div style={{ marginTop: 14 }}>
							<label
								style={{
									fontSize: 11,
									fontWeight: 700,
									color: "#9ca3af",
									textTransform: "uppercase",
								}}
							>
								URL
							</label>
							<div style={{ display: "flex", gap: 6, marginTop: 6 }}>
								<input
									className="field"
									style={{ fontFamily: "monospace", fontSize: 12 }}
									value={urls[c.key]}
									onChange={(e) =>
										setUrls((p) => ({ ...p, [c.key]: e.target.value }))
									}
								/>
								<button
									className="btn-secondary"
									style={{ padding: "0 12px" }}
									onClick={() => copyUrl(c.key, urls[c.key])}
								>
									{copied === c.key ? <Check size={14} /> : <Copy size={14} />}
								</button>
							</div>
						</div>

						<div
							style={{
								marginTop: 14,
								padding: 16,
								background: "#f9fafb",
								borderRadius: 10,
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								minHeight: 240,
							}}
						>
							{qrs[c.key] ? (
								<img
									src={qrs[c.key]}
									alt="QR"
									style={{ width: 220, height: 220, borderRadius: 6 }}
								/>
							) : (
								<button
									className="btn-primary"
									onClick={() => generate(c.key, urls[c.key])}
									disabled={loading || !urls[c.key]}
								>
									{loading ? (
										<Loader2 size={14} className="spin" />
									) : (
										<QrCode size={14} />
									)}
									Сгенерировать
								</button>
							)}
						</div>

						{qrs[c.key] && (
							<div style={{ display: "flex", gap: 8, marginTop: 10 }}>
								<button
									className="btn-secondary"
									style={{ flex: 1 }}
									onClick={() => generate(c.key, urls[c.key])}
								>
									<QrCode size={14} /> Обновить
								</button>
								<button
									className="btn-save"
									style={{ flex: 1 }}
									onClick={() => downloadQr(c.key, urls[c.key])}
								>
									<Download size={14} /> Скачать PNG
								</button>
							</div>
						)}
					</div>
				))}
			</div>
		</div>
	);
}

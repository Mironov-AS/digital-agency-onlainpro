import { useState, useEffect, useRef, useCallback } from "react";
import { Volume2, VolumeX, Maximize2, Wifi, WifiOff } from "lucide-react";
import { apiFetch } from "../../api.js";

// ─── Public display board (waiting-room TV screen) ──────────────────────
//
// Полная реализация «режима терминала» как в оригинальном queue-service:
// - ротация между табло очереди и рекламой (ads)
// - показ countdown последнего вызванного талона
// - звуковое оповещение при вызове (Web Audio API)
// - публичный, без авторизации
//
// URL: /app/queue/display

function playCallSound() {
	try {
		const ctx = window.__eqAudioCtx;
		if (!ctx) return;
		const beep = (freq, start, dur) => {
			const osc = ctx.createOscillator();
			const gain = ctx.createGain();
			osc.frequency.value = freq;
			osc.type = "sine";
			osc.connect(gain);
			gain.connect(ctx.destination);
			const t0 = ctx.currentTime + start;
			gain.gain.setValueAtTime(0.0001, t0);
			gain.gain.exponentialRampToValueAtTime(0.45, t0 + 0.01);
			gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
			osc.start(t0);
			osc.stop(t0 + dur + 0.05);
		};
		beep(880, 0, 0.45);
		beep(1100, 0.55, 0.45);
	} catch {
		/* no audio support */
	}
}

function ClockBlock() {
	const [now, setNow] = useState(() => new Date());
	useEffect(() => {
		const t = setInterval(() => setNow(new Date()), 1000);
		return () => clearInterval(t);
	}, []);
	const pad = (n) => String(n).padStart(2, "0");
	const hh = pad(now.getHours());
	const mm = pad(now.getMinutes());
	const ss = pad(now.getSeconds());
	const dateStr = now.toLocaleDateString("ru-RU", {
		weekday: "long",
		day: "numeric",
		month: "long",
	});
	return (
		<div className="eq-display-clock">
			<div className="eq-display-clock-time">
				{hh}:{mm}
				<span className="eq-display-clock-sec">:{ss}</span>
			</div>
			<div className="eq-display-clock-date">{dateStr}</div>
		</div>
	);
}

export default function EQDisplayPage() {
	const [queue, setQueue] = useState({ current: [], waiting: [] });
	const [loading, setLoading] = useState(true);
	const [connected, setConnected] = useState(true);
	const [soundOn, setSoundOn] = useState(() => {
		try {
			return localStorage.getItem("eq.display.sound") === "1";
		} catch {
			return true;
		}
	});
	const [isFs, setIsFs] = useState(false);

	// Ads / terminal-countdown
	const [ads, setAds] = useState([]);
	const [adSettings, setAdSettings] = useState({
		ticket_display_time: 10,
		dashboard_idle_time: 15,
		ads_before_dashboard: 0,
	});
	const [currentAdIndex, setCurrentAdIndex] = useState(0);
	const [displayMode, setDisplayMode] = useState("queue"); // 'queue' | 'ads' | 'ticket'
	const [ticketCountdown, setTicketCountdown] = useState(0);
	const [lastCalledTicket, setLastCalledTicket] = useState(null);

	const lastIdsRef = useRef(new Set());
	const flashRef = useRef({});
	const counterRef = useRef(0);
	const adsRef = useRef([]);
	const adTimerRef = useRef(null);
	const ticketTimerRef = useRef(null);
	const countdownTimerRef = useRef(null);
	const currentTicketIdRef = useRef(null);

	// init AudioContext on first user interaction
	useEffect(() => {
		const init = () => {
			try {
				window.__eqAudioCtx =
					window.__eqAudioCtx ||
					new (window.AudioContext || window.webkitAudioContext)();
			} catch {
				/* no audio */
			}
			window.removeEventListener("click", init);
			window.removeEventListener("keydown", init);
		};
		window.addEventListener("click", init);
		window.addEventListener("keydown", init);
		return () => {
			window.removeEventListener("click", init);
			window.removeEventListener("keydown", init);
		};
	}, []);

	const fetchQueue = useCallback(async () => {
		try {
			const data = await apiFetch("/api/queue");
			setQueue({
				current: Array.isArray(data?.current) ? data.current : [],
				waiting: Array.isArray(data?.waiting) ? data.waiting : [],
			});
			setConnected(true);
			setLoading(false);

			// Detect newly called tickets
			const newIds = new Set();
			(data.current || []).forEach((t) => newIds.add(t.id));
			const lastIds = lastIdsRef.current;
			const freshlyCalled = (data.current || []).filter(
				(t) => !lastIds.has(t.id) && lastIds.size > 0,
			);
			lastIdsRef.current = newIds;

			if (freshlyCalled.length) {
				const t = freshlyCalled[0];
				setLastCalledTicket(t);
				setDisplayMode("ticket");
				setTicketCountdown(adSettings.ticket_display_time);
				currentTicketIdRef.current = t.id;

				let cnt = adSettings.ticket_display_time;
				clearInterval(countdownTimerRef.current);
				countdownTimerRef.current = setInterval(() => {
					cnt -= 1;
					setTicketCountdown(cnt);
					if (cnt <= 0) clearInterval(countdownTimerRef.current);
				}, 1000);

				clearTimeout(ticketTimerRef.current);
				ticketTimerRef.current = setTimeout(() => {
					setDisplayMode(adsRef.current.length > 0 ? "ads" : "queue");
				}, adSettings.ticket_display_time * 1000);

				if (soundOn) playCallSound();
				freshlyCalled.forEach((t2) => {
					flashRef.current[t2.id] = Date.now();
				});
			}
		} catch {
			setConnected(false);
			setLoading(false);
		}
	}, [soundOn, adSettings.ticket_display_time]);

	useEffect(() => {
		fetchQueue();
		const t = setInterval(fetchQueue, 3000);
		return () => clearInterval(t);
	}, [fetchQueue]);

	// Fetch ads & settings
	useEffect(() => {
		let cancelled = false;
		const loadAds = async () => {
			try {
				const data = await apiFetch("/api/ads").catch(() => []);
				if (cancelled) return;
				const list = Array.isArray(data)
					? data.filter((a) => a.url || a.file_key)
					: [];
				setAds(list);
				adsRef.current = list;
			} catch {
				/* noop */
			}
		};
		const loadCfg = async () => {
			try {
				const data = await apiFetch("/api/settings/ads").catch(() => null);
				if (!cancelled && data) {
					setAdSettings({
						ticket_display_time: data.ticket_display_time || 10,
						dashboard_idle_time: data.dashboard_idle_time || 15,
						ads_before_dashboard: data.ads_before_dashboard || 0,
					});
				}
			} catch {
				/* noop */
			}
		};
		loadAds();
		loadCfg();
		const t = setInterval(() => {
			loadAds();
			loadCfg();
		}, 60000);
		return () => {
			cancelled = true;
			clearInterval(t);
		};
	}, []);

	// Ads rotation
	useEffect(() => {
		if (displayMode !== "ads" || ads.length === 0) return;
		const ad = ads[currentAdIndex % ads.length];
		if (!ad) return;
		const dur = (ad.duration || 15) * 1000;
		adTimerRef.current = setTimeout(() => {
			setCurrentAdIndex((i) => (i + 1) % ads.length);
		}, dur);
		return () => clearTimeout(adTimerRef.current);
	}, [displayMode, currentAdIndex, ads]);

	// Auto-switch displayMode based on ads availability
	useEffect(() => {
		if (displayMode === "ticket") return;
		if (ads.length === 0 && displayMode === "ads") {
			setDisplayMode("queue");
		} else if (ads.length > 0 && displayMode === "queue") {
			setDisplayMode("ads");
		}
	}, [ads.length, displayMode]);

	// Fullscreen helpers
	const toggleFs = useCallback(async () => {
		try {
			if (!document.fullscreenElement) {
				await document.documentElement.requestFullscreen();
			} else {
				await document.exitFullscreen();
			}
		} catch {
			/* not allowed */
		}
	}, []);
	useEffect(() => {
		const onFs = () => setIsFs(!!document.fullscreenElement);
		document.addEventListener("fullscreenchange", onFs);
		return () => document.removeEventListener("fullscreenchange", onFs);
	}, []);

	const toggleSound = () => {
		setSoundOn((v) => {
			const nv = !v;
			try {
				localStorage.setItem("eq.display.sound", nv ? "1" : "0");
			} catch {
				/* noop */
			}
			return nv;
		});
	};

	// Cleanup flash entries
	useEffect(() => {
		const t = setInterval(() => {
			const now = Date.now();
			let changed = false;
			Object.keys(flashRef.current).forEach((id) => {
				if (now - flashRef.current[id] > 5000) {
					delete flashRef.current[id];
					changed = true;
				}
			});
			if (changed) {
				counterRef.current += 1;
				setLoading((v) => v);
			}
		}, 1000);
		return () => clearInterval(t);
	}, []);

	const currentTickets = queue.current || [];
	const waitingTickets = (queue.waiting || []).slice(0, 12);
	const totalWaiting = (queue.waiting || []).length;

	const renderQueueBoard = () => (
		<div className="eq-display-body">
			<section className="eq-display-current-col">
				<h2 className="eq-display-col-title">Вызываются</h2>
				{loading ? (
					<div className="eq-display-empty">Загрузка…</div>
				) : currentTickets.length === 0 ? (
					<div className="eq-display-empty eq-display-idle">
						<div className="eq-display-idle-icon">⏳</div>
						<div>Ожидайте вызова</div>
					</div>
				) : (
					<div className="eq-display-current-list">
						{currentTickets.map((t) => {
							const flashing = !!flashRef.current[t.id];
							return (
								<article
									key={t.id}
									className={`eq-display-current-card ${
										flashing ? "flash" : ""
									}`}
								>
									<div className="eq-display-current-label">
										{t.window_number != null
											? `Окно ${t.window_number}`
											: "Окно"}
									</div>
									<div className="eq-display-current-number">№{t.number}</div>
									{t.service_name && (
										<div className="eq-display-current-service">
											{t.service_name}
										</div>
									)}
								</article>
							);
						})}
					</div>
				)}
			</section>

			<aside className="eq-display-waiting-col">
				<div className="eq-display-waiting-head">
					<h2 className="eq-display-col-title">В очереди</h2>
					<div className="eq-display-waiting-count">
						<span className="eq-display-waiting-num">{totalWaiting}</span>
						<span className="eq-display-waiting-label">человек</span>
					</div>
				</div>

				{loading ? (
					<div className="eq-display-empty">Загрузка…</div>
				) : waitingTickets.length === 0 ? (
					<div className="eq-display-empty">Нет ожидающих</div>
				) : (
					<ol className="eq-display-waiting-list">
						{waitingTickets.map((t, idx) => (
							<li
								key={t.id}
								className={`eq-display-waiting-item ${
									idx === 0 ? "first" : ""
								}`}
							>
								<span className="eq-display-waiting-pos">{idx + 1}</span>
								<span className="eq-display-waiting-number">№{t.number}</span>
								{t.service_name && (
									<span className="eq-display-waiting-svc">
										{t.service_name}
									</span>
								)}
							</li>
						))}
					</ol>
				)}

				{totalWaiting > waitingTickets.length && (
					<div className="eq-display-waiting-more">
						и ещё {totalWaiting - waitingTickets.length}…
					</div>
				)}
			</aside>
		</div>
	);

	const renderTicketMode = () => (
		<div className="eq-display-body">
			<section className="eq-display-ticket-full">
				<div className="eq-display-ticket-call">
					<div className="eq-display-ticket-label">Вызывается талон</div>
					<div className="eq-display-ticket-big-number">
						№{lastCalledTicket.number}
					</div>
					{lastCalledTicket.service_name && (
						<div className="eq-display-ticket-svc">
							{lastCalledTicket.service_name}
						</div>
					)}
					{lastCalledTicket.window_number != null && (
						<div className="eq-display-ticket-window">
							Окно {lastCalledTicket.window_number}
						</div>
					)}
				</div>
				<div className="eq-display-ticket-countdown">
					<div className="eq-display-ticket-countdown-num">
						{ticketCountdown}
					</div>
					<div className="eq-display-ticket-countdown-label">
						секунд до возврата в ротацию
					</div>
				</div>
			</section>
		</div>
	);

	const renderAdsMode = () => {
		const ad = ads[currentAdIndex % ads.length];
		if (!ad) return renderQueueBoard();
		const src = ad.url || ad.file_key || "";
		const isVideo =
			ad.file_type === "video" || /\.(mp4|webm|ogg|mov)$/i.test(src);
		return (
			<div className="eq-display-body">
				<section className="eq-display-ads-full">
					{isVideo ? (
						<video
							key={`${ad.id}-${currentAdIndex}`}
							src={src}
							autoPlay
							muted
							playsInline
							className="eq-display-ads-media"
						/>
					) : (
						<img
							key={`${ad.id}-${currentAdIndex}`}
							src={src}
							alt={ad.name || ""}
							className="eq-display-ads-media"
						/>
					)}
					<div className="eq-display-ads-dots">
						{ads.map((_, i) => (
							<div
								key={i}
								className={`eq-display-ads-dot ${
									i === currentAdIndex % ads.length ? "active" : ""
								}`}
							/>
						))}
					</div>
				</section>
			</div>
		);
	};

	return (
		<div
			className="eq-display-root"
			onDoubleClick={toggleFs}
			role="main"
			aria-label="Табло электронной очереди"
		>
			<header className="eq-display-header">
				<div className="eq-display-header-left">
					<span className="eq-display-logo">📋</span>
					<h1 className="eq-display-title">Электронная очередь</h1>
				</div>

				<div className="eq-display-header-right">
					<span
						className={`eq-display-status ${connected ? "online" : "offline"}`}
						title={connected ? "Подключено" : "Нет соединения"}
					>
						{connected ? <Wifi size={18} /> : <WifiOff size={18} />}
					</span>
					<button
						type="button"
						className="eq-display-tool-btn"
						onClick={toggleSound}
						aria-label={soundOn ? "Выключить звук" : "Включить звук"}
						title={soundOn ? "Звук вызова включён" : "Звук вызова выключен"}
					>
						{soundOn ? <Volume2 size={20} /> : <VolumeX size={20} />}
					</button>
					<button
						type="button"
						className="eq-display-tool-btn"
						onClick={toggleFs}
						aria-label="Полноэкранный режим"
						title={
							isFs ? "Выйти из полноэкранного режима" : "Полноэкранный режим"
						}
					>
						<Maximize2 size={20} />
					</button>
				</div>
			</header>

			{displayMode === "ticket" && lastCalledTicket
				? renderTicketMode()
				: displayMode === "ads"
					? renderAdsMode()
					: renderQueueBoard()}

			<footer className="eq-display-footer">
				<div className="eq-display-footer-left">
					{!soundOn && (
						<span className="eq-display-muted-note">Звук вызова выключен</span>
					)}
				</div>
				<ClockBlock />
			</footer>

			<span style={{ display: "none" }}>{counterRef.current}</span>
		</div>
	);
}

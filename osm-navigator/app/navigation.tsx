/**
 * Экран навигации — два режима:
 * 1. PREVIEW: показывает маршрут, статистику, кнопку "Начать"
 * 2. ACTIVE:  пошаговая навигация с голосовыми подсказками и манёврами
 *
 * По мотивам AmapAuto.apk: lane guidance, камеры, предупреждения, запись трека
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as ExpoSpeech from "expo-speech";
import * as ExpoLocation from "expo-location";
import { OSMMapView, type MapRef } from "../src/components/OSMMapView";
import type { Location, Route, RouteInstruction } from "../src/types";
import { COLORS, MANEUVER_TEXT, MANEUVER_ICONS } from "../src/constants";
import { getRoute, RouteError } from "../src/services/routeService";
import {
	formatDistance,
	formatDuration,
	formatETA,
} from "../src/utils/formatters";
import { getSettings } from "../src/services/storageService";
import { useSpeedCameras } from "../src/hooks/useSpeedCameras";
import { useRouteWarnings } from "../src/hooks/useRouteWarnings";
import { useTripRecording } from "../src/hooks/useTripRecording";
import { carProjection } from "../src/modules/CarProjection";

const LANE_ARROW: Record<string, string> = {
	left: "←",
	right: "→",
	slightLeft: "↖",
	slightRight: "↗",
	sharpLeft: "↙",
	sharpRight: "↘",
	straight: "↑",
	uturn: "↩",
	mergeToLeft: "↖",
	mergeToRight: "↗",
};

type NavMode = "preview" | "active";

export default function NavigationScreen() {
	const router = useRouter();
	const params = useLocalSearchParams();
	const mapRef = useRef<MapRef>(null);

	// --- Состояние ---
	const [navMode, setNavMode] = useState<NavMode>("preview");
	const [destination, setDestination] = useState<Location | null>(null);
	const [route, setRoute] = useState<Route | null>(null);
	const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
	const [currentInstruction, setCurrentInstruction] =
		useState<RouteInstruction | null>(null);
	const [nextInstruction, setNextInstruction] =
		useState<RouteInstruction | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [voiceEnabled, setVoiceEnabled] = useState(true);
	const [showWarnings, setShowWarnings] = useState(true);
	const [projectionAvailable, setProjectionAvailable] = useState(false);
	const lastSpokenRef = useRef<number>(0);
	const instructionIndexRef = useRef(0);

	// Проверяем доступность проекции на приборную панель при монтировании
	useEffect(() => {
		carProjection
			.checkAvailability()
			.then((v) => setProjectionAvailable(v ?? false))
			.catch(() => {});
	}, []);

	// --- Хуки ---
	const { loadCameras, nearestAlert, checkCameras, clearAlert } =
		useSpeedCameras();
	const { warnings, analyzeRoute } = useRouteWarnings();
	const { isRecording, currentTrack, startRecording, addPoint, stopRecording } =
		useTripRecording();

	// --- Загрузка маршрута ---
	useEffect(() => {
		(async () => {
			const settings = await getSettings();
			setVoiceEnabled(settings.voiceEnabled);

			if (!params.destination || typeof params.destination !== "string") {
				setError("Не указан пункт назначения");
				setLoading(false);
				return;
			}

			try {
				const dest: Location = JSON.parse(params.destination);
				setDestination(dest);

				const start: Location = { latitude: 55.7558, longitude: 37.6173 };
				try {
					const perm = await ExpoLocation.requestForegroundPermissionsAsync();
					if (perm.granted) {
						const loc = await ExpoLocation.getCurrentPositionAsync({});
						start.latitude = loc.coords.latitude;
						start.longitude = loc.coords.longitude;
					}
				} catch {
					/* Москва по умолчанию */
				}

				const builtRoute = await getRoute(start, dest, {
					strategy: settings.routeStrategy ?? "fastest",
					avoidTolls: settings.avoidTolls,
					avoidHighways: settings.avoidHighways,
					avoidFerries: settings.avoidFerries,
					avoidBorders: settings.avoidBorders,
				});

				setRoute(builtRoute);

				// Предупреждения
				await analyzeRoute(
					builtRoute,
					start.latitude,
					start.longitude,
					dest.latitude,
					dest.longitude,
				);
				// Камеры
				await loadCameras(builtRoute.points);

				// Показываем карту на весь маршрут
				setTimeout(() => {
					mapRef.current?.fitToPoints(builtRoute.points);
				}, 500);
			} catch (e) {
				setError(
					e instanceof RouteError
						? e.message
						: "Не удалось построить маршрут. Проверьте интернет.",
				);
			} finally {
				setLoading(false);
			}
		})();
	}, [params.destination]);

	// --- GPS-подписка — только в активном режиме ---
	useEffect(() => {
		if (navMode !== "active") return;
		let sub: { remove: () => void } | null = null;

		const init = async () => {
			try {
				const { granted } =
					await ExpoLocation.requestForegroundPermissionsAsync();
				if (!granted) return;
				sub = await ExpoLocation.watchPositionAsync(
					{
						accuracy: ExpoLocation.Accuracy.High,
						timeInterval: 3000,
						distanceInterval: 5,
					},
					(loc) => {
						const userLoc: Location = {
							latitude: loc.coords.latitude,
							longitude: loc.coords.longitude,
						};
						setCurrentLocation(userLoc);
						if (isRecording) addPoint(userLoc, loc.coords.speed ?? undefined);
						checkCameras(userLoc);
					},
				);
			} catch {
				/* GPS недоступен */
			}
		};

		init();
		return () => {
			sub?.remove();
		};
	}, [navMode, isRecording, addPoint, checkCameras]);

	// --- Голосовые подсказки — только в активном режиме ---
	useEffect(() => {
		if (navMode !== "active" || !currentInstruction || !voiceEnabled) return;

		const dist = currentInstruction.distanceMeters;
		const now = Date.now();
		const keyDistances = [1000, 500, 200, 100, 50];
		const nearest = keyDistances.find((d) => dist <= d);

		// Обновляем приборную панель при каждом манёвре
		if (nearest) {
			carProjection
				.updateNavigation({
					maneuverText:
						MANEUVER_TEXT[currentInstruction.maneuver] ||
						currentInstruction.text,
					streetName: currentInstruction.streetName || "",
					distanceMeters: currentInstruction.distanceMeters,
					totalDistanceMeters: route?.distanceMeters ?? 0,
					remainingSeconds: route?.durationSeconds ?? 0,
				})
				.catch(() => {}); // projection — best-effort
		}

		if (nearest && now - lastSpokenRef.current > 15000) {
			lastSpokenRef.current = now;
			const text = buildVoiceText(currentInstruction, nearest);
			ExpoSpeech.speak(text, { language: "ru", pitch: 1.0, rate: 0.9 });
		}
	}, [navMode, currentInstruction, voiceEnabled, route]);

	// --- Голосовое предупреждение о камере ---
	useEffect(() => {
		if (!nearestAlert || !voiceEnabled || navMode !== "active") return;
		const timer = setTimeout(() => clearAlert(), 5000);
		return () => clearTimeout(timer);
	}, [nearestAlert, voiceEnabled, navMode, clearAlert]);

	const buildVoiceText = (
		instruction: RouteInstruction,
		dist: number,
	): string => {
		const mText = MANEUVER_TEXT[instruction.maneuver] || instruction.text;
		const street = instruction.streetName;
		if (dist >= 1000) {
			return `Через ${Math.round(dist / 1000)} километров ${mText}${street ? ` на ${street}` : ""}`;
		}
		if (dist <= 50) return `Сейчас ${mText}`;
		return `Через ${dist} метров ${mText}${street ? ` на ${street}` : ""}`;
	};

	// --- НАЧАТЬ НАВИГАЦИЮ ---
	const handleStartNavigation = useCallback(async () => {
		if (!route || !route.instructions.length) return;

		// Устанавливаем первую инструкцию
		const first = route.instructions[0];
		const second = route.instructions[1] ?? null;
		setCurrentInstruction(first);
		setNextInstruction(second);
		instructionIndexRef.current = 0;
		lastSpokenRef.current = 0;

		// Запускаем проекцию на приборную панель автомобиля
		if (destination) {
			carProjection
				.startProjection(
					destination.name || destination.address || "Пункт назначения",
					destination.latitude,
					destination.longitude,
				)
				.catch(() => {}); // projection — best-effort
		}

		// Показываем маршрут целиком при старте навигации (а не только текущую позицию)
		// Это позволяет видеть весь маршрут
		if (route && route.points.length > 0) {
			mapRef.current?.fitToPoints(route.points);
		}

		// Начинаем запись трека
		startRecording();

		// Переключаем в активный режим
		setNavMode("active");
	}, [route, destination, startRecording]);

	// --- ОСТАНОВИТЬ НАВИГАЦИЮ ---
	const handleStopNavigation = useCallback(() => {
		ExpoSpeech.stop();
		stopRecording();
		carProjection.stopProjection().catch(() => {});
		setNavMode("preview");
		setCurrentInstruction(null);
		setNextInstruction(null);
		instructionIndexRef.current = 0;
		lastSpokenRef.current = 0;

		// Показываем маршрут целиком
		if (route && route.points.length > 0) {
			setTimeout(() => {
				mapRef.current?.fitToPoints(route.points);
			}, 300);
		}
	}, [route, stopRecording]);

	// --- Вернуться на карту (полный выход) ---
	const handleBackToMap = useCallback(() => {
		ExpoSpeech.stop();
		if (isRecording) stopRecording();
		router.back();
	}, [router, isRecording, stopRecording]);

	const handleRecenter = useCallback(() => {
		// Recenter показывает маршрут целиком (overview)
		if (route && route.points.length > 0) {
			mapRef.current?.fitToPoints(route.points);
		}
	}, [route]);

	const handleOverview = useCallback(() => {
		if (route && route.points.length > 0) {
			mapRef.current?.fitToPoints(route.points);
		}
	}, [route]);

	const handleToggleRecord = useCallback(() => {
		if (isRecording) stopRecording();
		else startRecording();
	}, [isRecording, startRecording, stopRecording]);

	const handleToggleVoice = useCallback(() => {
		setVoiceEnabled((v) => {
			if (v) ExpoSpeech.stop();
			return !v;
		});
	}, []);

	// ===================== RENDER =====================

	if (loading) {
		return (
			<SafeAreaView style={styles.centerContainer}>
				<Text style={styles.loadingIcon}>🗺️</Text>
				<Text style={styles.loadingTitle}>Прокладываем маршрут...</Text>
				<Text style={styles.loadingText}>Расчёт по данным OSRM</Text>
			</SafeAreaView>
		);
	}

	if (error || !destination || !route) {
		return (
			<SafeAreaView style={styles.centerContainer}>
				<Text style={styles.errorIcon}>⚠️</Text>
				<Text style={styles.errorTitle}>{error ?? "Ошибка навигации"}</Text>
				<Text style={styles.errorSubtitle}>
					Проверьте подключение к интернету{"\n"}и попробуйте снова
				</Text>
				<TouchableOpacity style={styles.errorBtn} onPress={handleBackToMap}>
					<Text style={styles.errorBtnText}>Вернуться на карту</Text>
				</TouchableOpacity>
			</SafeAreaView>
		);
	}

	const totalDist = route.distanceMeters;
	const totalTime = route.durationSeconds;
	const laneData = currentInstruction?.lanes;
	const hasLanes = laneData && laneData.length > 0;

	// ===================== PREVIEW MODE =====================
	if (navMode === "preview") {
		return (
			<View style={styles.container}>
				<OSMMapView
					ref={mapRef}
					style={styles.map}
					destination={destination}
					currentLocation={currentLocation ?? undefined}
					route={route}
					zoom={15}
				/>

				{/* Предупреждения */}
				{warnings.length > 0 && showWarnings && (
					<SafeAreaView style={styles.warningsContainer} edges={["top"]}>
						<View style={styles.warningsCard}>
							{warnings.map((w, i) => (
								<View key={i} style={styles.warningRow}>
									<Text style={styles.warningIcon}>{w.icon}</Text>
									<Text style={styles.warningText}>{w.message}</Text>
								</View>
							))}
							<TouchableOpacity
								style={styles.warningClose}
								onPress={() => setShowWarnings(false)}
							>
								<Text style={styles.warningCloseText}>✕</Text>
							</TouchableOpacity>
						</View>
					</SafeAreaView>
				)}

				{/* Карточка маршрута */}
				<SafeAreaView style={styles.previewCard} edges={["bottom"]}>
					{/* Адрес */}
					<View style={styles.previewHeader}>
						<Text style={styles.previewIcon}>📍</Text>
						<View style={styles.previewInfo}>
							<Text style={styles.previewName} numberOfLines={2}>
								{destination.name ?? "Выбранная точка"}
							</Text>
							{destination.address && (
								<Text style={styles.previewAddress} numberOfLines={1}>
									{destination.address}
								</Text>
							)}
						</View>
						<TouchableOpacity style={styles.closeBtn} onPress={handleBackToMap}>
							<Text style={styles.closeBtnText}>✕</Text>
						</TouchableOpacity>
					</View>

					{/* Статистика */}
					<View style={styles.previewStats}>
						<View style={styles.statItem}>
							<Text style={styles.statIcon}>🛣️</Text>
							<Text style={styles.statValue}>{formatDistance(totalDist)}</Text>
							<Text style={styles.statLabel}>Расстояние</Text>
						</View>
						<View style={styles.statDivider} />
						<View style={styles.statItem}>
							<Text style={styles.statIcon}>⏱️</Text>
							<Text style={styles.statValue}>{formatDuration(totalTime)}</Text>
							<Text style={styles.statLabel}>В пути</Text>
						</View>
						<View style={styles.statDivider} />
						<View style={styles.statItem}>
							<Text style={styles.statIcon}>🧭</Text>
							<Text style={styles.statValue}>{route.instructions.length}</Text>
							<Text style={styles.statLabel}>Поворотов</Text>
						</View>
					</View>

					{/* ===== КНОПКА НАЧАТЬ ===== */}
					<TouchableOpacity
						style={styles.startNavBtn}
						onPress={handleStartNavigation}
						activeOpacity={0.8}
					>
						<Text style={styles.startNavIcon}>🚗</Text>
						<Text style={styles.startNavText}>Начать навигацию</Text>
					</TouchableOpacity>
				</SafeAreaView>

				{/* Карта контролы */}
				<View style={styles.mapControls}>
					<TouchableOpacity
						style={styles.mapControlBtn}
						onPress={handleRecenter}
					>
						<Text style={styles.mapControlIcon}>◎</Text>
					</TouchableOpacity>
					<TouchableOpacity
						style={styles.mapControlBtn}
						onPress={handleOverview}
					>
						<Text style={styles.mapControlIcon}>⊞</Text>
					</TouchableOpacity>
				</View>
			</View>
		);
	}

	// ===================== ACTIVE MODE =====================
	return (
		<View style={styles.container}>
			<OSMMapView
				ref={mapRef}
				style={styles.map}
				destination={destination}
				currentLocation={currentLocation ?? undefined}
				route={route}
				zoom={17}
			/>

			{/* Предупреждения */}
			{warnings.length > 0 && showWarnings && (
				<SafeAreaView style={styles.warningsContainer} edges={["top"]}>
					<View style={styles.warningsCard}>
						{warnings.map((w, i) => (
							<View key={i} style={styles.warningRow}>
								<Text style={styles.warningIcon}>{w.icon}</Text>
								<Text style={styles.warningText}>{w.message}</Text>
							</View>
						))}
						<TouchableOpacity
							style={styles.warningClose}
							onPress={() => setShowWarnings(false)}
						>
							<Text style={styles.warningCloseText}>✕</Text>
						</TouchableOpacity>
					</View>
				</SafeAreaView>
			)}

			{/* Lane Guidance */}
			{hasLanes && (
				<SafeAreaView style={styles.laneContainer} edges={["top"]}>
					<View style={styles.laneCard}>
						<Text style={styles.laneLabel}>🚧 Полосы движения</Text>
						<View style={styles.lanesRow}>
							{laneData!.map((lane, i) => (
								<View
									key={i}
									style={[
										styles.lane,
										lane.valid ? styles.laneValid : styles.laneInvalid,
									]}
								>
									{lane.indications.map((ind, j) => (
										<Text
											key={j}
											style={[
												styles.laneArrow,
												{ color: lane.valid ? "#fff" : "#aaa" },
											]}
										>
											{LANE_ARROW[ind as string] ?? ind}
										</Text>
									))}
								</View>
							))}
						</View>
					</View>
				</SafeAreaView>
			)}

			{/* Speed Camera */}
			{nearestAlert && (
				<SafeAreaView style={styles.cameraContainer} edges={["top"]}>
					<View style={styles.cameraCard}>
						<Text style={styles.cameraIcon}>📸</Text>
						<View style={styles.cameraInfo}>
							<Text style={styles.cameraTitle}>
								{nearestAlert.camera.type === "red_light"
									? "Камера на красный"
									: "Камера ГИБДД"}
							</Text>
							<Text style={styles.cameraSubtitle}>
								{nearestAlert.distance} м — лимит {nearestAlert.speedLimit} км/ч
							</Text>
						</View>
					</View>
				</SafeAreaView>
			)}

			{/* Панель текущего манёвра */}
			<SafeAreaView style={styles.instructionCard} edges={["top"]}>
				<View style={styles.instructionInner}>
					{projectionAvailable && (
						<View style={styles.projectionBadge}>
							<Text style={styles.projectionBadgeText}>
								📺 Приборная панель
							</Text>
						</View>
					)}
					<TouchableOpacity
						style={styles.closeBtn}
						onPress={handleStopNavigation}
					>
						<Text style={styles.closeBtnText}>✕</Text>
					</TouchableOpacity>

					<View style={styles.maneuverRow}>
						<Text style={styles.maneuverIcon}>
							{MANEUVER_ICONS[currentInstruction?.maneuver ?? "CONTINUE"] ??
								"↑"}
						</Text>
						<View style={styles.maneuverTextContainer}>
							<Text style={styles.maneuverText}>
								{MANEUVER_TEXT[currentInstruction?.maneuver ?? "CONTINUE"]}
							</Text>
							{currentInstruction?.streetName && (
								<Text style={styles.streetText} numberOfLines={1}>
									на {currentInstruction.streetName}
								</Text>
							)}
							{currentInstruction && (
								<Text style={styles.distanceText}>
									{formatDistance(currentInstruction.distanceMeters)}
								</Text>
							)}
						</View>
					</View>

					{nextInstruction && (
						<View style={styles.nextRow}>
							<Text style={styles.nextLabel}>Затем: </Text>
							<Text style={styles.nextText} numberOfLines={1}>
								{MANEUVER_TEXT[nextInstruction.maneuver] ??
									nextInstruction.text}{" "}
								— {formatDistance(nextInstruction.distanceMeters)}
							</Text>
						</View>
					)}
				</View>
			</SafeAreaView>

			{/* Нижняя панель */}
			<SafeAreaView style={styles.activeBottom} edges={["bottom"]}>
				{/* Статистика */}
				<View style={styles.statsRow}>
					<View style={styles.statItem}>
						<Text style={styles.statValue}>{formatDistance(totalDist)}</Text>
						<Text style={styles.statLabel}>Осталось</Text>
					</View>
					<View style={styles.statDivider} />
					<View style={styles.statItem}>
						<Text style={styles.statValue}>{formatDuration(totalTime)}</Text>
						<Text style={styles.statLabel}>В пути</Text>
					</View>
					<View style={styles.statDivider} />
					<View style={styles.statItem}>
						<Text style={styles.statValue}>{formatETA(totalTime)}</Text>
						<Text style={styles.statLabel}>Прибытие</Text>
					</View>
				</View>

				{/* Кнопки управления */}
				<View style={styles.activeControls}>
					{/* ===== КНОПКА ОСТАНОВИТЬ ===== */}
					<TouchableOpacity
						style={styles.stopNavBtn}
						onPress={handleStopNavigation}
					>
						<Text style={styles.stopNavIcon}>🛑</Text>
						<Text style={styles.stopNavText}>Остановить</Text>
					</TouchableOpacity>

					{/* Запись трека */}
					<TouchableOpacity
						style={[styles.recordBtn, isRecording && styles.recordBtnActive]}
						onPress={handleToggleRecord}
					>
						<Text style={styles.recordBtnText}>{isRecording ? "⏹" : "⏺"}</Text>
					</TouchableOpacity>

					{/* Голос */}
					<TouchableOpacity
						style={[styles.voiceBtn, !voiceEnabled && styles.voiceBtnOff]}
						onPress={handleToggleVoice}
					>
						<Text style={styles.voiceIcon}>{voiceEnabled ? "🔊" : "🔇"}</Text>
					</TouchableOpacity>
				</View>

				{/* Инфо о записи */}
				{isRecording && currentTrack && (
					<View style={styles.recordInfoRow}>
						<Text style={styles.recordInfoText}>
							⏺ Запись: {formatDistance(currentTrack.distanceMeters)} ·{" "}
							{Math.floor(currentTrack.durationSeconds / 60)} мин
						</Text>
					</View>
				)}
			</SafeAreaView>

			{/* Карта контролы */}
			<View style={styles.mapControls}>
				<TouchableOpacity style={styles.mapControlBtn} onPress={handleRecenter}>
					<Text style={styles.mapControlIcon}>◎</Text>
				</TouchableOpacity>
				<TouchableOpacity style={styles.mapControlBtn} onPress={handleOverview}>
					<Text style={styles.mapControlIcon}>⊞</Text>
				</TouchableOpacity>
			</View>
		</View>
	);
}

// ===================== STYLES =====================
const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: COLORS.background },
	map: { flex: 1 },

	// Loading / Error
	centerContainer: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		padding: 32,
	},
	loadingIcon: { fontSize: 48, marginBottom: 16 },
	loadingTitle: {
		fontSize: 20,
		fontWeight: "700",
		color: COLORS.onSurface,
		marginBottom: 8,
	},
	loadingText: {
		fontSize: 15,
		color: COLORS.onSurfaceVariant,
		textAlign: "center",
	},
	errorIcon: { fontSize: 48, marginBottom: 16 },
	errorTitle: {
		fontSize: 20,
		fontWeight: "700",
		color: COLORS.onSurface,
		marginBottom: 8,
		textAlign: "center",
	},
	errorSubtitle: {
		fontSize: 14,
		color: COLORS.onSurfaceVariant,
		marginBottom: 20,
		textAlign: "center",
		lineHeight: 20,
	},
	errorBtn: {
		backgroundColor: COLORS.primary,
		borderRadius: 16,
		paddingVertical: 14,
		paddingHorizontal: 32,
	},
	errorBtnText: { color: "#fff", fontSize: 16, fontWeight: "600" },

	// === PREVIEW MODE ===
	previewCard: {
		position: "absolute",
		bottom: 32,
		left: 16,
		right: 16,
		zIndex: 10,
		backgroundColor: "#fff",
		borderRadius: 24,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.2,
		shadowRadius: 16,
		elevation: 8,
		padding: 16,
		gap: 14,
	},
	previewHeader: { flexDirection: "row", alignItems: "flex-start" },
	previewIcon: { fontSize: 22, marginRight: 10 },
	previewInfo: { flex: 1 },
	previewName: { fontSize: 16, fontWeight: "700", color: COLORS.onSurface },
	previewAddress: {
		fontSize: 13,
		color: COLORS.onSurfaceVariant,
		marginTop: 2,
	},
	closeBtn: {
		width: 28,
		height: 28,
		borderRadius: 14,
		backgroundColor: "#f0f0f0",
		alignItems: "center",
		justifyContent: "center",
		marginLeft: 8,
	},
	closeBtnText: { fontSize: 16, color: "#9e9e9e" },

	previewStats: {
		flexDirection: "row",
		alignItems: "center",
		borderTopWidth: 1,
		borderTopColor: "#eee",
		paddingTop: 14,
	},
	statItem: { flex: 1, alignItems: "center" },
	statIcon: { fontSize: 18, marginBottom: 4 },
	statValue: { fontSize: 18, fontWeight: "700", color: COLORS.primary },
	statLabel: { fontSize: 11, color: COLORS.onSurfaceVariant, marginTop: 2 },
	statDivider: { width: 1, height: 40, backgroundColor: "#eee" },

	startNavBtn: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: COLORS.primary,
		borderRadius: 16,
		paddingVertical: 16,
		shadowColor: COLORS.primary,
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.4,
		shadowRadius: 10,
		elevation: 6,
		gap: 10,
	},
	startNavIcon: { fontSize: 22 },
	startNavText: {
		fontSize: 18,
		fontWeight: "800",
		color: "#fff",
		letterSpacing: 0.5,
	},

	// === ACTIVE MODE ===
	instructionCard: {
		position: "absolute",
		top: 8,
		left: 16,
		right: 16,
		zIndex: 10,
	},
	projectionBadge: {
		backgroundColor: "#e3f2fd",
		borderRadius: 12,
		paddingVertical: 4,
		paddingHorizontal: 10,
		marginBottom: 8,
		alignSelf: "flex-start",
	},
	projectionBadgeText: {
		fontSize: 12,
		color: "#1976D2",
		fontWeight: "600",
	},
	instructionInner: {
		backgroundColor: "#fff",
		borderRadius: 20,
		padding: 16,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.15,
		shadowRadius: 12,
		elevation: 6,
	},
	maneuverRow: { flexDirection: "row", alignItems: "center" },
	maneuverIcon: { fontSize: 40, marginRight: 12, lineHeight: 44 },
	maneuverTextContainer: { flex: 1 },
	maneuverText: { fontSize: 20, fontWeight: "700", color: COLORS.onSurface },
	streetText: { fontSize: 14, color: COLORS.onSurfaceVariant, marginTop: 2 },
	distanceText: {
		fontSize: 16,
		color: COLORS.secondary,
		fontWeight: "600",
		marginTop: 4,
	},
	nextRow: {
		flexDirection: "row",
		marginTop: 10,
		paddingTop: 10,
		borderTopWidth: 1,
		borderTopColor: "#eee",
	},
	nextLabel: {
		fontSize: 14,
		color: COLORS.onSurfaceVariant,
		fontWeight: "600",
	},
	nextText: { flex: 1, fontSize: 14, color: COLORS.onSurfaceVariant },

	activeBottom: {
		position: "absolute",
		bottom: 32,
		left: 16,
		right: 16,
		zIndex: 10,
		gap: 10,
	},
	statsRow: {
		backgroundColor: "#fff",
		borderRadius: 20,
		padding: 14,
		flexDirection: "row",
		alignItems: "center",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.12,
		shadowRadius: 8,
		elevation: 4,
	},
	activeControls: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: 12,
	},
	stopNavBtn: {
		flex: 1,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: "#fff",
		borderRadius: 16,
		paddingVertical: 14,
		borderWidth: 2,
		borderColor: COLORS.error,
		gap: 8,
	},
	stopNavIcon: { fontSize: 18 },
	stopNavText: { fontSize: 16, fontWeight: "700", color: COLORS.error },
	recordBtn: {
		width: 48,
		height: 48,
		borderRadius: 24,
		backgroundColor: "#fff",
		alignItems: "center",
		justifyContent: "center",
		borderWidth: 2,
		borderColor: "#9e9e9e",
	},
	recordBtnActive: { backgroundColor: "#ffebee", borderColor: "#f44336" },
	recordBtnText: { fontSize: 20 },
	voiceBtn: {
		width: 48,
		height: 48,
		borderRadius: 24,
		backgroundColor: COLORS.primary,
		alignItems: "center",
		justifyContent: "center",
	},
	voiceBtnOff: { backgroundColor: "#9e9e9e" },
	voiceIcon: { fontSize: 22 },
	recordInfoRow: {
		alignItems: "center",
	},
	recordInfoText: { fontSize: 13, color: "#f44336", fontWeight: "600" },

	// Warnings
	warningsContainer: {
		position: "absolute",
		top: 8,
		left: 16,
		right: 16,
		zIndex: 20,
	},
	warningsCard: {
		backgroundColor: "#fff8e1",
		borderRadius: 16,
		padding: 12,
		borderWidth: 1,
		borderColor: "#ffe082",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.12,
		shadowRadius: 8,
		elevation: 4,
	},
	warningRow: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
	warningIcon: { fontSize: 16, marginRight: 8 },
	warningText: { fontSize: 14, color: "#795548", flex: 1 },
	warningClose: {
		position: "absolute",
		top: 6,
		right: 8,
		width: 20,
		height: 20,
		borderRadius: 10,
		alignItems: "center",
		justifyContent: "center",
	},
	warningCloseText: { fontSize: 12, color: "#9e9e9e" },

	// Lane guidance
	laneContainer: {
		position: "absolute",
		left: 16,
		right: 16,
		zIndex: 15,
		top: 68,
	},
	laneCard: {
		backgroundColor: "#fff",
		borderRadius: 16,
		padding: 12,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 6,
		elevation: 3,
	},
	laneLabel: { fontSize: 13, fontWeight: "600", marginBottom: 8 },
	lanesRow: { flexDirection: "row", gap: 6 },
	lane: {
		minWidth: 36,
		height: 32,
		borderRadius: 8,
		alignItems: "center",
		justifyContent: "center",
		flexDirection: "row",
		gap: 2,
		paddingHorizontal: 6,
	},
	laneValid: { backgroundColor: COLORS.primary },
	laneInvalid: { backgroundColor: "#e0e0e0" },
	laneArrow: { fontSize: 18, fontWeight: "700" },

	// Speed camera
	cameraContainer: {
		position: "absolute",
		left: 16,
		right: 16,
		zIndex: 25,
		top: 120,
	},
	cameraCard: {
		backgroundColor: "#fffde7",
		borderRadius: 16,
		padding: 14,
		flexDirection: "row",
		alignItems: "center",
		borderWidth: 2,
		borderColor: "#f44336",
		shadowColor: "#f44336",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.3,
		shadowRadius: 8,
		elevation: 4,
	},
	cameraIcon: { fontSize: 32, marginRight: 12 },
	cameraInfo: { flex: 1 },
	cameraTitle: { fontSize: 16, fontWeight: "700", color: "#c62828" },
	cameraSubtitle: { fontSize: 14, color: "#795548", marginTop: 2 },

	// Map controls
	mapControls: {
		position: "absolute",
		right: 16,
		top: "50%",
		transform: [{ translateY: -60 }],
		zIndex: 10,
		gap: 8,
	},
	mapControlBtn: {
		width: 44,
		height: 44,
		borderRadius: 22,
		backgroundColor: "#fff",
		alignItems: "center",
		justifyContent: "center",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.15,
		shadowRadius: 6,
		elevation: 4,
	},
	mapControlIcon: { fontSize: 22, color: COLORS.onSurface },
});

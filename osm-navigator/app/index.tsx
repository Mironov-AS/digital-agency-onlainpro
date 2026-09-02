/**
 * Главный экран — карта с поиском, кнопками и панелью навигации
 */
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
	View,
	StyleSheet,
	TouchableOpacity,
	Text,
	Alert,
	Dimensions,
	Modal,
	FlatList,
	ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as ExpoLocation from "expo-location";
import { OSMMapView, type MapRef } from "../src/components/OSMMapView";
import type { Location, Route } from "../src/types";
import { COLORS, DEFAULT_REGION } from "../src/constants";
import {
	getHomeLocation,
	getFavorites,
	addToSearchHistory,
} from "../src/services/storageService";
import { getRoute } from "../src/services/routeService";
import { formatDistance, formatDuration } from "../src/utils/formatters";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function MainScreen() {
	const router = useRouter();
	const mapRef = useRef<MapRef>(null);

	const [destination, setDestination] = useState<Location | null>(null);
	const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
	const [routePreview, setRoutePreview] = useState<Route | null>(null);
	const [routeLoading, setRouteLoading] = useState(false);
	const [locationPermission, setLocationPermission] = useState(false);
	const [showMenu, setShowMenu] = useState(false);
	const [homeLocation, setHomeLocationState] = useState<Location | null>(null);
	const [favorites, setFavoritesState] = useState<Location[]>([]);
	const routeLoadingRef = useRef(false);

	// Загрузка данных
	useEffect(() => {
		(async () => {
			const [perm, home, favs] = await Promise.all([
				ExpoLocation.requestForegroundPermissionsAsync(),
				getHomeLocation(),
				getFavorites(),
			]);
			setLocationPermission(perm.granted);
			setHomeLocationState(home);
			setFavoritesState(favs);

			if (perm.granted) {
				try {
					const loc = await ExpoLocation.getCurrentPositionAsync({});
					const userLoc: Location = {
						latitude: loc.coords.latitude,
						longitude: loc.coords.longitude,
					};
					setCurrentLocation(userLoc);
					mapRef.current?.setCenter(userLoc.latitude, userLoc.longitude, 15);
				} catch {
					mapRef.current?.setCenter(
						DEFAULT_REGION.latitude,
						DEFAULT_REGION.longitude,
						12,
					);
				}
			}
		})();
	}, []);

	// Подписка на обновление локации
	useEffect(() => {
		if (!locationPermission) return;

		let subscription: { remove: () => void } | null = null;

		ExpoLocation.watchPositionAsync(
			{
				accuracy: ExpoLocation.Accuracy.High,
				timeInterval: 5000,
				distanceInterval: 10,
			},
			(loc) => {
				setCurrentLocation({
					latitude: loc.coords.latitude,
					longitude: loc.coords.longitude,
				});
			},
		).then((s) => {
			subscription = s;
		});

		return () => {
			subscription?.remove();
		};
	}, [locationPermission]);

	// Запрос превью маршрута при выборе назначения
	const fetchRoutePreview = useCallback(
		async (dest: Location, start: Location | null) => {
			if (routeLoadingRef.current) return;
			routeLoadingRef.current = true;
			setRouteLoading(true);
			setRoutePreview(null);

			try {
				const startLoc = start ?? {
					latitude: DEFAULT_REGION.latitude,
					longitude: DEFAULT_REGION.longitude,
				};
				const route = await getRoute(startLoc, dest);
				setRoutePreview(route);
				mapRef.current?.fitToPoints(route.points);
			} catch {
				setRoutePreview(null);
			} finally {
				setRouteLoading(false);
				routeLoadingRef.current = false;
			}
		},
		[],
	);

	// Клик по карте — выбор точки назначения
	const handleMapPress = useCallback(
		(location: Location) => {
			const namedLocation: Location = {
				...location,
				name: `Точка (${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)})`,
			};
			setDestination(namedLocation);
			setRoutePreview(null);
			fetchRoutePreview(namedLocation, currentLocation);
		},
		[currentLocation, fetchRoutePreview],
	);

	// Поиск
	const handleSearch = useCallback(() => {
		router.push("/search");
	}, [router]);

	// Начать навигацию
	const handleNavigate = useCallback(() => {
		if (!destination) return;
		addToSearchHistory(destination);
		router.push({
			pathname: "/navigation",
			params: {
				destination: JSON.stringify(destination),
			},
		});
	}, [destination, router]);

	// Очистить назначение
	const handleClearDestination = useCallback(() => {
		setDestination(null);
		setRoutePreview(null);
		if (currentLocation) {
			mapRef.current?.setCenter(
				currentLocation.latitude,
				currentLocation.longitude,
				15,
			);
		}
	}, [currentLocation]);

	// Домой
	const handleHome = useCallback(async () => {
		if (!homeLocation) {
			Alert.alert("Дом не задан", "Задайте домашний адрес в настройках");
			return;
		}
		setDestination(homeLocation);
		setRoutePreview(null);
		fetchRoutePreview(homeLocation, currentLocation);
	}, [homeLocation, currentLocation, fetchRoutePreview]);

	// Избранное
	const handleFavoritesOpen = useCallback(async () => {
		setShowMenu(false);
		const favs = await getFavorites();
		if (favs.length === 0) {
			Alert.alert("Избранное пусто", "Добавьте места через поиск");
			return;
		}
		setDestination(favs[0]);
		setRoutePreview(null);
		fetchRoutePreview(favs[0], currentLocation);
	}, [currentLocation, fetchRoutePreview]);

	// Выбор из избранного
	const handleSelectFavorite = useCallback(
		(fav: Location) => {
			setDestination(fav);
			setRoutePreview(null);
			setShowMenu(false);
			fetchRoutePreview(fav, currentLocation);
		},
		[currentLocation, fetchRoutePreview],
	);

	// Настройки
	const handleSettings = useCallback(() => {
		setShowMenu(false);
		router.push("/settings");
	}, [router]);

	return (
		<SafeAreaView style={styles.container} edges={["top"]}>
			{/* Карта */}
			<OSMMapView
				ref={mapRef}
				style={styles.map}
				destination={destination}
				currentLocation={currentLocation ?? undefined}
				route={routePreview ?? undefined}
				onMapPress={handleMapPress}
				zoom={14}
			/>

			{/* Панель поиска сверху */}
			<View style={styles.searchCard}>
				<TouchableOpacity
					style={styles.searchBar}
					onPress={handleSearch}
					activeOpacity={0.7}
				>
					<Text style={styles.searchIcon}>🔍</Text>
					<Text style={styles.searchHint}>Куда едем?</Text>
				</TouchableOpacity>
			</View>

			{/* ===== ПАНЕЛЬ НАВИГАЦИИ (появляется при выборе назначения) ===== */}
			{destination && (
				<View style={styles.navPanel}>
					{/* Адрес назначения */}
					<View style={styles.navPanelHeader}>
						<Text style={styles.navPanelIcon}>📍</Text>
						<View style={styles.navPanelInfo}>
							<Text style={styles.navPanelName} numberOfLines={2}>
								{destination.name ?? "Выбранная точка"}
							</Text>
							{destination.address && (
								<Text style={styles.navPanelAddress} numberOfLines={1}>
									{destination.address}
								</Text>
							)}
						</View>
						<TouchableOpacity
							style={styles.closeBtn}
							onPress={handleClearDestination}
							hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
						>
							<Text style={styles.closeBtnText}>✕</Text>
						</TouchableOpacity>
					</View>

					{/* Статистика маршрута */}
					<View style={styles.routeStats}>
						{routeLoading ? (
							<View style={styles.routeStatsLoading}>
								<ActivityIndicator size="small" color={COLORS.primary} />
								<Text style={styles.routeStatsLoadingText}>
									Прокладываем маршрут...
								</Text>
							</View>
						) : routePreview ? (
							<>
								<View style={styles.statItem}>
									<Text style={styles.statIcon}>🛣️</Text>
									<Text style={styles.statValue}>
										{formatDistance(routePreview.distanceMeters)}
									</Text>
									<Text style={styles.statLabel}>Расстояние</Text>
								</View>
								<View style={styles.statDivider} />
								<View style={styles.statItem}>
									<Text style={styles.statIcon}>⏱️</Text>
									<Text style={styles.statValue}>
										{formatDuration(routePreview.durationSeconds)}
									</Text>
									<Text style={styles.statLabel}>В пути</Text>
								</View>
								<View style={styles.statDivider} />
								<View style={styles.statItem}>
									<Text style={styles.statIcon}>🧭</Text>
									<Text style={styles.statValue}>
										{routePreview.instructions.length}
									</Text>
									<Text style={styles.statLabel}>Поворотов</Text>
								</View>
							</>
						) : (
							<Text style={styles.routeErrorText}>
								⚠️ Маршрут не найден — нажмите «В путь» для навигации
							</Text>
						)}
					</View>

					{/* Кнопка В ПУТЬ */}
					<TouchableOpacity
						style={styles.startBtn}
						onPress={handleNavigate}
						activeOpacity={0.8}
					>
						<Text style={styles.startBtnIcon}>🚗</Text>
						<Text style={styles.startBtnText}>В путь</Text>
					</TouchableOpacity>
				</View>
			)}

			{/* Нижняя панель быстрых кнопок */}
			<View style={styles.bottomPanel}>
				<TouchableOpacity
					style={styles.quickBtn}
					onPress={handleHome}
					activeOpacity={0.7}
				>
					<Text style={styles.quickBtnIcon}>🏠</Text>
					<Text style={styles.quickBtnLabel}>Дом</Text>
				</TouchableOpacity>

				<TouchableOpacity
					style={styles.quickBtn}
					onPress={handleFavoritesOpen}
					activeOpacity={0.7}
				>
					<Text style={styles.quickBtnIcon}>⭐</Text>
					<Text style={styles.quickBtnLabel}>Избранное</Text>
				</TouchableOpacity>

				<TouchableOpacity
					style={styles.quickBtn}
					onPress={handleSettings}
					activeOpacity={0.7}
				>
					<Text style={styles.quickBtnIcon}>⚙️</Text>
					<Text style={styles.quickBtnLabel}>Настройки</Text>
				</TouchableOpacity>
			</View>

			{/* Подсказка если нет назначения */}
			{!destination && (
				<View style={styles.hintBar}>
					<Text style={styles.hintText}>
						👆 Нажмите на карту или используйте поиск
					</Text>
				</View>
			)}

			{/* Меню избранного */}
			<Modal
				visible={showMenu}
				transparent
				animationType="slide"
				onRequestClose={() => setShowMenu(false)}
			>
				<View style={styles.modalOverlay}>
					<View style={styles.modalContent}>
						<View style={styles.modalHeader}>
							<Text style={styles.modalTitle}>⭐ Избранное</Text>
							<TouchableOpacity onPress={() => setShowMenu(false)}>
								<Text style={styles.modalClose}>✕</Text>
							</TouchableOpacity>
						</View>

						<FlatList
							data={favorites}
							keyExtractor={(item) => `${item.latitude}-${item.longitude}`}
							renderItem={({ item }) => (
								<TouchableOpacity
									style={styles.favItem}
									onPress={() => handleSelectFavorite(item)}
								>
									<Text style={styles.favItemIcon}>📍</Text>
									<View style={styles.favItemText}>
										<Text style={styles.favItemName} numberOfLines={1}>
											{item.name ?? "Место"}
										</Text>
										{item.address && (
											<Text style={styles.favItemAddress} numberOfLines={1}>
												{item.address}
											</Text>
										)}
									</View>
								</TouchableOpacity>
							)}
							ListEmptyComponent={
								<Text style={styles.emptyText}>Нет избранных мест</Text>
							}
							contentContainerStyle={styles.favList}
						/>
					</View>
				</View>
			</Modal>
		</SafeAreaView>
	);
}

const NAV_PANEL_HEIGHT = 200;

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: COLORS.background },
	map: { flex: 1 },
	searchCard: {
		position: "absolute",
		top: 8,
		left: 16,
		right: 16,
		zIndex: 10,
	},
	searchBar: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "#fff",
		borderRadius: 28,
		paddingHorizontal: 20,
		paddingVertical: 14,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.12,
		shadowRadius: 8,
		elevation: 4,
	},
	searchIcon: { fontSize: 18, marginRight: 12 },
	searchHint: { flex: 1, fontSize: 16, color: "#9e9e9e" },

	/* Панель навигации */
	navPanel: {
		position: "absolute",
		bottom: 100,
		left: 12,
		right: 12,
		zIndex: 20,
		backgroundColor: "#fff",
		borderRadius: 20,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.2,
		shadowRadius: 16,
		elevation: 8,
		padding: 16,
	},
	navPanelHeader: {
		flexDirection: "row",
		alignItems: "flex-start",
	},
	navPanelIcon: { fontSize: 22, marginRight: 10 },
	navPanelInfo: { flex: 1 },
	navPanelName: {
		fontSize: 16,
		fontWeight: "700",
		color: COLORS.onSurface,
	},
	navPanelAddress: {
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

	/* Статистика маршрута */
	routeStats: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		marginTop: 14,
		paddingTop: 14,
		borderTopWidth: 1,
		borderTopColor: "#eee",
	},
	routeStatsLoading: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
	},
	routeStatsLoadingText: {
		fontSize: 14,
		color: COLORS.onSurfaceVariant,
	},
	routeErrorText: {
		fontSize: 13,
		color: "#e65100",
		textAlign: "center",
	},
	statItem: { flex: 1, alignItems: "center" },
	statIcon: { fontSize: 18, marginBottom: 4 },
	statValue: { fontSize: 18, fontWeight: "700", color: COLORS.primary },
	statLabel: { fontSize: 11, color: COLORS.onSurfaceVariant, marginTop: 2 },
	statDivider: { width: 1, height: 40, backgroundColor: "#eee" },

	/* Кнопка СТАРТ */
	startBtn: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: COLORS.primary,
		borderRadius: 16,
		paddingVertical: 14,
		marginTop: 14,
		shadowColor: COLORS.primary,
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.4,
		shadowRadius: 10,
		elevation: 6,
		gap: 8,
	},
	startBtnIcon: { fontSize: 20 },
	startBtnText: {
		fontSize: 18,
		fontWeight: "800",
		color: "#fff",
		letterSpacing: 0.5,
	},

	/* Нижняя панель */
	bottomPanel: {
		position: "absolute",
		bottom: 28,
		left: 16,
		right: 16,
		zIndex: 10,
		flexDirection: "row",
		justifyContent: "center",
		gap: 12,
	},
	quickBtn: {
		alignItems: "center",
		backgroundColor: "#fff",
		borderRadius: 16,
		paddingVertical: 12,
		paddingHorizontal: 20,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 6,
		elevation: 3,
	},
	quickBtnIcon: { fontSize: 22, marginBottom: 4 },
	quickBtnLabel: { fontSize: 12, fontWeight: "600", color: COLORS.onSurface },

	/* Подсказка */
	hintBar: {
		position: "absolute",
		bottom: 100,
		left: 16,
		right: 16,
		zIndex: 5,
		alignItems: "center",
	},
	hintText: {
		fontSize: 14,
		color: "#fff",
		backgroundColor: "rgba(0,0,0,0.6)",
		paddingHorizontal: 16,
		paddingVertical: 8,
		borderRadius: 20,
		overflow: "hidden",
	},

	/* Модалка избранного */
	modalOverlay: {
		flex: 1,
		backgroundColor: "rgba(0,0,0,0.4)",
		justifyContent: "flex-end",
	},
	modalContent: {
		backgroundColor: "#fff",
		borderTopLeftRadius: 24,
		borderTopRightRadius: 24,
		maxHeight: "70%",
		paddingBottom: 32,
	},
	modalHeader: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		padding: 20,
		borderBottomWidth: 1,
		borderBottomColor: "#eee",
	},
	modalTitle: { fontSize: 18, fontWeight: "700", color: COLORS.onSurface },
	modalClose: { fontSize: 20, color: "#9e9e9e", padding: 4 },
	favList: { paddingHorizontal: 16, paddingTop: 8 },
	favItem: {
		flexDirection: "row",
		alignItems: "center",
		paddingVertical: 14,
		borderBottomWidth: 1,
		borderBottomColor: "#f0f0f0",
	},
	favItemIcon: { fontSize: 20, marginRight: 12 },
	favItemText: { flex: 1 },
	favItemName: { fontSize: 15, fontWeight: "600", color: COLORS.onSurface },
	favItemAddress: {
		fontSize: 13,
		color: COLORS.onSurfaceVariant,
		marginTop: 2,
	},
	emptyText: {
		textAlign: "center",
		color: COLORS.onSurfaceVariant,
		fontSize: 15,
		paddingVertical: 32,
	},
});

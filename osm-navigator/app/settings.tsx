/**
 * Экран настроек приложения
 */
import { useCallback, useEffect, useState } from "react";
import {
	View,
	Text,
	StyleSheet,
	ScrollView,
	TouchableOpacity,
	Switch,
	Alert,
	Modal,
	FlatList,
	TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import type { Location, NavigationSettings } from "../src/types";
import {
	COLORS,
	RUSSIAN_ROADS,
	DEFAULT_SETTINGS,
	ROUTE_STRATEGIES,
} from "../src/constants";
import {
	getSettings,
	saveSettings,
	getHomeLocation,
	setHomeLocation,
	getFavorites,
} from "../src/services/storageService";

export default function SettingsScreen() {
	const router = useRouter();

	const [settings, setSettings] = useState<NavigationSettings>({
		...DEFAULT_SETTINGS,
	});
	const [homeLocation, setHomeLocationState] = useState<Location | null>(null);
	const [favoritesCount, setFavoritesCount] = useState(0);
	const [showHomeModal, setShowHomeModal] = useState(false);
	const [homeAddress, setHomeAddress] = useState("");

	useEffect(() => {
		(async () => {
			const [s, h, f] = await Promise.all([
				getSettings(),
				getHomeLocation(),
				getFavorites(),
			]);
			setSettings(s);
			setHomeLocationState(h);
			setFavoritesCount(f.length);
		})();
	}, []);

	// Сохраняем настройки при каждом изменении
	const updateSetting = useCallback(
		async <K extends keyof NavigationSettings>(
			key: K,
			value: NavigationSettings[K],
		) => {
			const updated = { ...settings, [key]: value };
			setSettings(updated);
			await saveSettings(updated);
		},
		[settings],
	);

	const handleSetHome = useCallback(async () => {
		if (!homeAddress.trim()) return;

		try {
			// Используем простой геокодинг через Nominatim
			const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(homeAddress)}&format=json&addressdetails=1&limit=1&accept-language=ru`;
			const response = await fetch(url, {
				headers: { "User-Agent": "OSMNavigator/1.0 (React Native App)" },
			});
			const data = await response.json();
			if (data && data.length > 0) {
				const loc: Location = {
					latitude: parseFloat(data[0].lat),
					longitude: parseFloat(data[0].lon),
					name: data[0].display_name,
					address: homeAddress,
				};
				await setHomeLocation(loc);
				setHomeLocationState(loc);
				setShowHomeModal(false);
				setHomeAddress("");
				Alert.alert("Готово", "Домашний адрес сохранён");
			} else {
				Alert.alert("Не найдено", "Адрес не найден на карте");
			}
		} catch {
			Alert.alert("Ошибка", "Не удалось найти адрес");
		}
	}, [homeAddress]);

	const handleOpenHomeModal = useCallback(() => {
		setHomeAddress(homeLocation?.address ?? "");
		setShowHomeModal(true);
	}, [homeLocation]);

	const renderSection = (title: string, children: React.ReactNode) => (
		<View style={styles.section}>
			<Text style={styles.sectionTitle}>{title}</Text>
			<View style={styles.sectionContent}>{children}</View>
		</View>
	);

	const renderSwitchRow = (
		label: string,
		value: boolean,
		onValueChange: (v: boolean) => void,
	) => (
		<View style={styles.switchRow}>
			<Text style={styles.switchLabel}>{label}</Text>
			<Switch
				value={value}
				onValueChange={onValueChange}
				trackColor={{ false: "#e0e0e0", true: COLORS.primary }}
				thumbColor="#fff"
			/>
		</View>
	);

	return (
		<SafeAreaView style={styles.container} edges={["top"]}>
			{/* Шапка */}
			<View style={styles.header}>
				<TouchableOpacity
					style={styles.backBtn}
					onPress={() => router.back()}
					hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
				>
					<Text style={styles.backBtnText}>{"<"}</Text>
				</TouchableOpacity>
				<Text style={styles.title}>Настройки</Text>
				<View style={styles.placeholder} />
			</View>

			<ScrollView contentContainerStyle={styles.content}>
				{/* Карта */}
				{renderSection(
					"Карта",
					<>
						{renderSwitchRow("Офлайн-режим", settings.offlineMode, (v) =>
							updateSetting("offlineMode", v),
						)}
						<View style={styles.infoRow}>
							<Text style={styles.infoLabel}>Регион карт:</Text>
							<Text style={styles.infoValue}>Россия</Text>
						</View>
						<View style={styles.infoRow}>
							<Text style={styles.infoLabel}>Дорожных знаков:</Text>
							<Text style={styles.infoValue}>
								{RUSSIAN_ROADS.length} федеральных
							</Text>
						</View>
					</>,
				)}

				{/* Стратегия маршрута */}
				{renderSection(
					"Тип маршрута",
					<View style={styles.strategyRow}>
						{(["fastest", "shortest", "intelligent"] as const).map((s) => (
							<TouchableOpacity
								key={s}
								style={[
									styles.strategyBtn,
									settings.routeStrategy === s && styles.strategyBtnActive,
								]}
								onPress={() => updateSetting("routeStrategy", s)}
							>
								<Text
									style={[
										styles.strategyText,
										settings.routeStrategy === s && styles.strategyTextActive,
									]}
								>
									{s === "fastest"
										? "Быстро"
										: s === "shortest"
											? "Короткий"
											: "Интеллект"}
								</Text>
							</TouchableOpacity>
						))}
					</View>,
				)}

				{/* Навигация */}
				{renderSection(
					"Ограничения маршрута",
					<>
						{renderSwitchRow(
							"Избегать платных дорог",
							settings.avoidTolls,
							(v) => updateSetting("avoidTolls", v),
						)}
						{renderSwitchRow(
							"Избегать автострад",
							settings.avoidHighways,
							(v) => updateSetting("avoidHighways", v),
						)}
						{renderSwitchRow("Избегать паромов", settings.avoidFerries, (v) =>
							updateSetting("avoidFerries", v),
						)}
						{renderSwitchRow("Избегать границ", settings.avoidBorders, (v) =>
							updateSetting("avoidBorders", v),
						)}
					</>,
				)}

				{/* Голосовые подсказки */}
				{renderSection(
					"Голосовые подсказки",
					<>
						{renderSwitchRow("Голос включён", settings.voiceEnabled, (v) =>
							updateSetting("voiceEnabled", v),
						)}
						{renderSwitchRow(
							"Произносить названия улиц",
							settings.speakStreetNames,
							(v) => updateSetting("speakStreetNames", v),
						)}
						<View style={styles.infoRow}>
							<Text style={styles.infoLabel}>Громкость:</Text>
							<Text style={styles.infoValue}>
								{Math.round(settings.voiceVolume)}%
							</Text>
						</View>
					</>,
				)}

				{/* Камеры ГИБДД */}
				{renderSection(
					"Камеры ГИБДД",
					<>
						{renderSwitchRow(
							"Предупреждать о камерах",
							settings.speedCameraAlerts,
							(v) => updateSetting("speedCameraAlerts", v),
						)}
						{renderSwitchRow(
							"Голосовое предупреждение",
							settings.speakSpeedCameraAlerts,
							(v) => updateSetting("speakSpeedCameraAlerts", v),
						)}
						<View style={styles.infoRow}>
							<Text style={styles.infoLabel}>Источник камер:</Text>
							<Text style={styles.infoValue}>OpenStreetMap</Text>
						</View>
					</>,
				)}

				{/* День/Ночь */}
				{renderSection(
					"Режим отображения",
					<View style={styles.strategyRow}>
						{(
							[
								["auto", "День/Ночь авто"],
								["day", "День"],
								["night", "Ночь"],
							] as const
						).map(([mode, label]) => (
							<TouchableOpacity
								key={mode}
								style={[
									styles.strategyBtn,
									settings.dayNightMode === mode && styles.strategyBtnActive,
								]}
								onPress={() => updateSetting("dayNightMode", mode as any)}
							>
								<Text
									style={[
										styles.strategyText,
										settings.dayNightMode === mode && styles.strategyTextActive,
									]}
								>
									{label}
								</Text>
							</TouchableOpacity>
						))}
					</View>,
				)}

				{/* Единицы измерения */}
				{renderSection(
					"Единицы измерения",
					<>
						<View style={styles.strategyRow}>
							<TouchableOpacity
								style={[
									styles.strategyBtn,
									settings.units === "metric" && styles.strategyBtnActive,
								]}
								onPress={() => updateSetting("units", "metric")}
							>
								<Text
									style={[
										styles.strategyText,
										settings.units === "metric" && styles.strategyTextActive,
									]}
								>
									Км/ч
								</Text>
							</TouchableOpacity>
							<TouchableOpacity
								style={[
									styles.strategyBtn,
									settings.units === "imperial" && styles.strategyBtnActive,
								]}
								onPress={() => updateSetting("units", "imperial")}
							>
								<Text
									style={[
										styles.strategyText,
										settings.units === "imperial" && styles.strategyTextActive,
									]}
								>
									Миля/ч
								</Text>
							</TouchableOpacity>
						</View>
					</>,
				)}

				{/* Дом */}
				{renderSection(
					"Дом",
					<TouchableOpacity
						style={styles.actionRow}
						onPress={handleOpenHomeModal}
					>
						<View style={styles.actionLeft}>
							<Text style={styles.actionIcon}>{"🏠"}</Text>
							<View style={styles.actionTextContainer}>
								<Text style={styles.actionTitle}>
									{homeLocation
										? "Изменить домашний адрес"
										: "Задать домашний адрес"}
								</Text>
								{homeLocation && (
									<Text style={styles.actionSubtitle} numberOfLines={2}>
										{homeLocation.name ?? homeLocation.address ?? ""}
									</Text>
								)}
							</View>
						</View>
						<Text style={styles.actionArrow}>{">"}</Text>
					</TouchableOpacity>,
				)}

				{/* Данные */}
				{renderSection(
					"Данные",
					<>
						<TouchableOpacity
							style={styles.actionRow}
							onPress={() => router.push("/tracks")}
						>
							<View style={styles.actionLeft}>
								<Text style={styles.actionIcon}>📍</Text>
								<View style={styles.actionTextContainer}>
									<Text style={styles.actionTitle}>История треков</Text>
									<Text style={styles.actionSubtitle}>
										Просмотр записанных маршрутов
									</Text>
								</View>
							</View>
							<Text style={styles.actionArrow}>{">"}</Text>
						</TouchableOpacity>
						<View style={styles.infoRow}>
							<Text style={styles.infoLabel}>Избранных мест:</Text>
							<Text style={styles.infoValue}>{favoritesCount}</Text>
						</View>
					</>,
				)}

				{/* О приложении */}
				{renderSection(
					"О приложении",
					<>
						<View style={styles.infoRow}>
							<Text style={styles.infoLabel}>Название:</Text>
							<Text style={styles.infoValue}>OSM Навигатор Pro</Text>
						</View>
						<View style={styles.infoRow}>
							<Text style={styles.infoLabel}>Версия:</Text>
							<Text style={styles.infoValue}>1.0.0 (Expo)</Text>
						</View>
						<View style={styles.aboutRow}>
							<Text style={styles.aboutText}>
								{"Карты © OpenStreetMap contributors\nМаршрутизация © OSRM"}
							</Text>
						</View>
					</>,
				)}
			</ScrollView>

			{/* Модалка для ввода адреса дома */}
			<Modal
				visible={showHomeModal}
				transparent
				animationType="slide"
				onRequestClose={() => setShowHomeModal(false)}
			>
				<View style={styles.modalOverlay}>
					<View style={styles.modalContent}>
						<Text style={styles.modalTitle}>Домашний адрес</Text>
						<Text style={styles.modalHint}>
							Введите полный адрес (город, улица, дом)
						</Text>

						<TextInput
							style={styles.input}
							placeholder="Москва, ул. Тверская, 1"
							placeholderTextColor="#9e9e9e"
							value={homeAddress}
							onChangeText={setHomeAddress}
							multiline
							autoFocus
						/>

						<View style={styles.modalButtons}>
							<TouchableOpacity
								style={[styles.modalBtn, styles.modalBtnCancel]}
								onPress={() => setShowHomeModal(false)}
							>
								<Text style={styles.modalBtnCancelText}>Отмена</Text>
							</TouchableOpacity>
							<TouchableOpacity
								style={[styles.modalBtn, styles.modalBtnConfirm]}
								onPress={handleSetHome}
							>
								<Text style={styles.modalBtnConfirmText}>Сохранить</Text>
							</TouchableOpacity>
						</View>
					</View>
				</View>
			</Modal>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: COLORS.background },
	header: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingHorizontal: 16,
		paddingVertical: 12,
	},
	backBtn: {
		width: 36,
		height: 36,
		borderRadius: 18,
		backgroundColor: "#fff",
		alignItems: "center",
		justifyContent: "center",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.1,
		shadowRadius: 3,
		elevation: 2,
	},
	backBtnText: { fontSize: 20, color: COLORS.onSurface },
	title: { fontSize: 18, fontWeight: "700", color: COLORS.onSurface },
	placeholder: { width: 36 },
	content: { paddingBottom: 32 },
	section: {
		marginTop: 20,
		paddingHorizontal: 16,
	},
	sectionTitle: {
		fontSize: 13,
		fontWeight: "700",
		color: COLORS.primary,
		textTransform: "uppercase",
		letterSpacing: 0.5,
		marginBottom: 8,
	},
	sectionContent: {
		backgroundColor: "#fff",
		borderRadius: 16,
		overflow: "hidden",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.06,
		shadowRadius: 4,
		elevation: 2,
	},
	switchRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingVertical: 14,
		paddingHorizontal: 16,
		borderBottomWidth: 1,
		borderBottomColor: "#f0f0f0",
	},
	switchLabel: { fontSize: 16, color: COLORS.onSurface, flex: 1 },
	infoRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		paddingVertical: 12,
		paddingHorizontal: 16,
		borderBottomWidth: 1,
		borderBottomColor: "#f0f0f0",
	},
	infoLabel: { fontSize: 15, color: COLORS.onSurfaceVariant },
	infoValue: { fontSize: 15, fontWeight: "600", color: COLORS.onSurface },
	actionRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingVertical: 14,
		paddingHorizontal: 16,
	},
	actionLeft: {
		flexDirection: "row",
		alignItems: "center",
		flex: 1,
	},
	actionIcon: { fontSize: 24, marginRight: 12 },
	actionTextContainer: { flex: 1 },
	actionTitle: { fontSize: 16, fontWeight: "600", color: COLORS.onSurface },
	actionSubtitle: {
		fontSize: 13,
		color: COLORS.onSurfaceVariant,
		marginTop: 2,
	},
	actionArrow: { fontSize: 20, color: "#9e9e9e", marginLeft: 8 },
	aboutRow: { paddingHorizontal: 16, paddingVertical: 12 },
	aboutText: {
		fontSize: 12,
		color: COLORS.onSurfaceVariant,
		lineHeight: 18,
	},
	modalOverlay: {
		flex: 1,
		backgroundColor: "rgba(0,0,0,0.4)",
		justifyContent: "center",
		alignItems: "center",
		padding: 24,
	},
	modalContent: {
		backgroundColor: "#fff",
		borderRadius: 20,
		padding: 20,
		width: "100%",
		maxWidth: 400,
	},
	modalTitle: {
		fontSize: 18,
		fontWeight: "700",
		color: COLORS.onSurface,
		marginBottom: 8,
	},
	modalHint: {
		fontSize: 14,
		color: COLORS.onSurfaceVariant,
		marginBottom: 16,
	},
	input: {
		backgroundColor: "#f5f5f5",
		borderRadius: 12,
		padding: 14,
		fontSize: 15,
		color: COLORS.onSurface,
		minHeight: 80,
		textAlignVertical: "top",
		marginBottom: 16,
	},
	modalButtons: {
		flexDirection: "row",
		gap: 12,
	},
	modalBtn: {
		flex: 1,
		paddingVertical: 12,
		borderRadius: 12,
		alignItems: "center",
	},
	modalBtnCancel: { backgroundColor: "#f0f0f0" },
	modalBtnConfirm: { backgroundColor: COLORS.primary },
	modalBtnCancelText: {
		fontSize: 15,
		fontWeight: "600",
		color: COLORS.onSurface,
	},
	modalBtnConfirmText: { fontSize: 15, fontWeight: "600", color: "#fff" },

	// Стратегия / режим кнопки
	strategyRow: {
		flexDirection: "row",
		gap: 8,
	},
	strategyBtn: {
		flex: 1,
		paddingVertical: 10,
		paddingHorizontal: 12,
		borderRadius: 12,
		backgroundColor: "#f0f0f0",
		alignItems: "center",
	},
	strategyBtnActive: {
		backgroundColor: COLORS.primary,
	},
	strategyText: {
		fontSize: 14,
		fontWeight: "600",
		color: COLORS.onSurfaceVariant,
	},
	strategyTextActive: {
		color: "#fff",
	},
});

/**
 * Экран поиска адресов и POI
 */
import { useCallback, useEffect, useRef, useState } from "react";
import {
	View,
	Text,
	StyleSheet,
	TextInput,
	TouchableOpacity,
	FlatList,
	ActivityIndicator,
	Keyboard,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import type { Location } from "../src/types";
import { searchAddress, searchNearby } from "../src/services/searchService";
import {
	getSearchHistory,
	addFavorite,
	removeFavorite,
	getFavorites,
} from "../src/services/storageService";
import { COLORS, POI_CATEGORIES } from "../src/constants";
import { SearchResultItem } from "../src/components/SearchResultItem";

type Tab = "search" | "history" | "favorites";

function getEmptyText(tab: Tab): { title: string; body: string } {
	if (tab === "history")
		return {
			title: "История пуста",
			body: "Найденные места сохраняются здесь",
		};
	if (tab === "favorites")
		return {
			title: "Нет избранного",
			body: "Нажмите звездочку рядом с адресом,\nчтобы добавить в избранное",
		};
	return {
		title: "Начните поиск",
		body: "Введите адрес или выберите категорию",
	};
}

export default function SearchScreen() {
	const router = useRouter();
	const inputRef = useRef<TextInput>(null);

	const [query, setQuery] = useState("");
	const [results, setResults] = useState<Location[]>([]);
	const [history, setHistory] = useState<Location[]>([]);
	const [favorites, setFavorites] = useState<Location[]>([]);
	const [loading, setLoading] = useState(false);
	const [networkError, setNetworkError] = useState(false);
	const [activeTab, setActiveTab] = useState<Tab>("search");
	const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
	const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	useEffect(() => {
		(async () => {
			const [h, f] = await Promise.all([getSearchHistory(), getFavorites()]);
			setHistory(h);
			setFavorites(f);
		})();
		inputRef.current?.focus();
	}, []);

	const handleQueryChange = useCallback((text: string) => {
		setQuery(text);
		if (debounceRef.current) clearTimeout(debounceRef.current);

		if (text.trim().length < 3) {
			setResults([]);
			setLoading(false);
			return;
		}

		setLoading(true);
		setNetworkError(false);
		debounceRef.current = setTimeout(async () => {
			try {
				const res = await searchAddress(text);
				setResults(res);
			} catch {
				setResults([]);
				setNetworkError(true);
			} finally {
				setLoading(false);
			}
		}, 400);
	}, []);

	const handleCategoryPress = useCallback(
		async (categoryId: string) => {
			const isSelected = selectedCategories.includes(categoryId);
			const updated = isSelected
				? selectedCategories.filter((c) => c !== categoryId)
				: [...selectedCategories, categoryId];
			setSelectedCategories(updated);

			if (updated.length === 0) {
				setResults([]);
				return;
			}

			setLoading(true);
			setActiveTab("search");

			try {
				const center: Location = { latitude: 55.7558, longitude: 37.6173 };
				const allResults = await Promise.all(
					updated.map((cat) => searchNearby(center, cat)),
				);
				const merged = allResults.flat();
				const unique = merged.filter(
					(item, idx, arr) =>
						arr.findIndex(
							(i) =>
								Math.abs(i.latitude - item.latitude) < 0.0001 &&
								Math.abs(i.longitude - item.longitude) < 0.0001,
						) === idx,
				);
				setResults(unique);
			} catch {
				setResults([]);
			} finally {
				setLoading(false);
			}
		},
		[selectedCategories],
	);

	const handleSelect = useCallback(
		(location: Location) => {
			Keyboard.dismiss();
			router.push({
				pathname: "/navigation",
				params: { destination: JSON.stringify(location) },
			});
		},
		[router],
	);

	const handleToggleFavorite = useCallback(
		async (location: Location) => {
			const isFav = favorites.some(
				(f) =>
					Math.abs(f.latitude - location.latitude) < 0.0001 &&
					Math.abs(f.longitude - location.longitude) < 0.0001,
			);
			if (isFav) {
				await removeFavorite(location);
			} else {
				await addFavorite(location);
			}
			const f = await getFavorites();
			setFavorites(f);
		},
		[favorites],
	);

	const currentData =
		activeTab === "history"
			? history
			: activeTab === "favorites"
				? favorites
				: results;

	const showNoResults =
		activeTab === "search" &&
		query.length >= 3 &&
		results.length === 0 &&
		!loading &&
		selectedCategories.length === 0 &&
		!networkError;

	const emptyInfo = getEmptyText(activeTab);

	const tabLabels: Record<Tab, string> = {
		search: "Результаты",
		history: "История",
		favorites: "Избранное",
	};

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

				<View style={styles.searchInputContainer}>
					<Text style={styles.searchIcon}>{"🔍"}</Text>
					<TextInput
						ref={inputRef}
						style={styles.searchInput}
						placeholder="Введите адрес..."
						placeholderTextColor="#9e9e9e"
						value={query}
						onChangeText={handleQueryChange}
						returnKeyType="search"
						autoCapitalize="none"
						autoCorrect={false}
					/>
					{query.length > 0 && (
						<TouchableOpacity
							onPress={() => {
								setQuery("");
								setResults([]);
							}}
						>
							<Text style={styles.clearBtn}>✕</Text>
						</TouchableOpacity>
					)}
				</View>
			</View>

			{/* Категории */}
			<View style={styles.categoriesContainer}>
				<FlatList
					horizontal
					data={POI_CATEGORIES}
					keyExtractor={(item) => item.id}
					showsHorizontalScrollIndicator={false}
					contentContainerStyle={styles.categoriesList}
					renderItem={({ item }) => {
						const isActive = selectedCategories.includes(item.id);
						return (
							<TouchableOpacity
								style={[
									styles.categoryChip,
									isActive && styles.categoryChipActive,
								]}
								onPress={() => handleCategoryPress(item.id)}
								activeOpacity={0.7}
							>
								<Text style={styles.categoryEmoji}>{item.emoji}</Text>
								<Text
									style={[
										styles.categoryLabel,
										isActive && styles.categoryLabelActive,
									]}
								>
									{item.label}
								</Text>
							</TouchableOpacity>
						);
					}}
				/>
			</View>

			{/* Вкладки */}
			<View style={styles.tabs}>
				{(Object.keys(tabLabels) as Tab[]).map((tab) => (
					<TouchableOpacity
						key={tab}
						style={[styles.tab, activeTab === tab && styles.tabActive]}
						onPress={() => {
							setActiveTab(tab);
							Keyboard.dismiss();
						}}
					>
						<Text
							style={[
								styles.tabText,
								activeTab === tab && styles.tabTextActive,
							]}
						>
							{tabLabels[tab]}
						</Text>
					</TouchableOpacity>
				))}
			</View>

			{/* Контент */}
			{loading ? (
				<View style={styles.centerContainer}>
					<ActivityIndicator size="large" color={COLORS.primary} />
					<Text style={styles.loadingText}>Поиск...</Text>
				</View>
			) : networkError ? (
				<View style={styles.centerContainer}>
					<Text style={styles.emptyIcon}>📡</Text>
					<Text style={styles.emptyTitle}>Нет связи с интернетом</Text>
					<Text style={styles.emptyBody}>
						Проверьте Wi-Fi или мобильный интернет
					</Text>
					<TouchableOpacity
						style={styles.retryBtn}
						onPress={() => {
							setNetworkError(false);
							if (query.trim()) handleQueryChange(query);
						}}
					>
						<Text style={styles.retryBtnText}>Повторить</Text>
					</TouchableOpacity>
				</View>
			) : showNoResults ? (
				<View style={styles.centerContainer}>
					<Text style={styles.emptyIcon}>{"🔍"}</Text>
					<Text style={styles.emptyTitle}>Ничего не найдено</Text>
					<Text style={styles.emptyBody}>
						Попробуйте изменить запрос{"\n"}или используйте категории выше
					</Text>
				</View>
			) : currentData.length === 0 ? (
				<View style={styles.centerContainer}>
					<Text style={styles.emptyIcon}>
						{activeTab === "history"
							? "📜"
							: activeTab === "favorites"
								? "⭐"
								: "🔍"}
					</Text>
					<Text style={styles.emptyTitle}>{emptyInfo.title}</Text>
					<Text style={styles.emptyBody}>{emptyInfo.body}</Text>
				</View>
			) : (
				<FlatList
					data={currentData}
					keyExtractor={(item) =>
						`${item.latitude.toFixed(6)}-${item.longitude.toFixed(6)}`
					}
					renderItem={({ item }) => (
						<View style={styles.resultItemContainer}>
							<SearchResultItem location={item} onPress={handleSelect} />
							<TouchableOpacity
								style={styles.favoriteBtn}
								onPress={() => handleToggleFavorite(item)}
							>
								<Text style={styles.favoriteIcon}>
									{favorites.some(
										(f) =>
											Math.abs(f.latitude - item.latitude) < 0.0001 &&
											Math.abs(f.longitude - item.longitude) < 0.0001,
									)
										? "★"
										: "☆"}
								</Text>
							</TouchableOpacity>
						</View>
					)}
					contentContainerStyle={styles.resultsList}
					keyboardShouldPersistTaps="handled"
				/>
			)}
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: COLORS.background },
	header: {
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: 16,
		paddingVertical: 12,
		gap: 12,
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
	searchInputContainer: {
		flex: 1,
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "#fff",
		borderRadius: 24,
		paddingHorizontal: 16,
		paddingVertical: 10,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 3,
	},
	searchIcon: { fontSize: 16, marginRight: 8 },
	searchInput: { flex: 1, fontSize: 16, color: COLORS.onSurface, padding: 0 },
	clearBtn: { fontSize: 16, color: "#9e9e9e", marginLeft: 8, padding: 2 },
	categoriesContainer: { marginTop: 4 },
	categoriesList: { paddingHorizontal: 16 },
	categoryChip: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "#fff",
		borderRadius: 20,
		paddingVertical: 8,
		paddingHorizontal: 14,
		marginRight: 8,
		borderWidth: 1.5,
		borderColor: "#eee",
	},
	categoryChipActive: {
		backgroundColor: COLORS.primary,
		borderColor: COLORS.primary,
	},
	categoryEmoji: { fontSize: 14, marginRight: 5 },
	categoryLabel: { fontSize: 13, fontWeight: "600", color: COLORS.onSurface },
	categoryLabelActive: { color: "#fff" },
	tabs: {
		flexDirection: "row",
		marginHorizontal: 16,
		marginTop: 12,
		backgroundColor: "#eee",
		borderRadius: 12,
		padding: 3,
	},
	tab: { flex: 1, paddingVertical: 8, alignItems: "center", borderRadius: 10 },
	tabActive: {
		backgroundColor: "#fff",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.1,
		shadowRadius: 2,
		elevation: 2,
	},
	tabText: { fontSize: 13, fontWeight: "600", color: COLORS.onSurfaceVariant },
	tabTextActive: { color: COLORS.primary },
	resultsList: { paddingTop: 8, paddingBottom: 24 },
	resultItemContainer: { flexDirection: "row", alignItems: "center" },
	favoriteBtn: { padding: 8, marginLeft: 4 },
	favoriteIcon: { fontSize: 20, color: "#FFC107" },
	centerContainer: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		paddingHorizontal: 32,
	},
	loadingText: { marginTop: 12, fontSize: 15, color: COLORS.onSurfaceVariant },
	emptyIcon: { fontSize: 48, marginBottom: 16 },
	emptyTitle: {
		fontSize: 18,
		fontWeight: "700",
		color: COLORS.onSurface,
		marginBottom: 8,
	},
	emptyBody: {
		fontSize: 14,
		color: COLORS.onSurfaceVariant,
		textAlign: "center",
		lineHeight: 20,
	},
	retryBtn: {
		backgroundColor: COLORS.primary,
		borderRadius: 16,
		paddingVertical: 12,
		paddingHorizontal: 28,
		marginTop: 16,
	},
	retryBtnText: { color: "#fff", fontSize: 15, fontWeight: "700" },
});

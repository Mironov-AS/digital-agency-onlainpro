/**
 * Константы приложения — расширены по мотивам AmapAuto.apk
 * Категории POI, типы маршрутов, ключи настроек
 */

// API endpoints
export const NOMINATIM_BASE_URL = "https://nominatim.openstreetmap.org";
export const OSRM_BASE_URL = "https://router.project-osrm.org";

// Карта
export const DEFAULT_REGION = {
	latitude: 55.7558,
	longitude: 37.6173,
	latitudeDelta: 0.05,
	longitudeDelta: 0.05,
};
export const DEFAULT_ZOOM = 15;
export const NAVIGATION_ZOOM = 17;

// Цвета
export const COLORS = {
	primary: "#1976D2",
	primaryVariant: "#1565C0",
	secondary: "#26A69A",
	navRoute: "#3F51B5",
	navRouteOutline: "#1A237E",
	surface: "#FFFFFF",
	background: "#FAFAFA",
	onSurface: "#212121",
	onSurfaceVariant: "#757575",
	error: "#D32F2F",
	route: "#3F51B5",
	// День/ночь
	nightOverlay: "rgba(0,0,0,0.35)",
	dayBackground: "#FAFAFA",
	nightBackground: "#1a1a2e",
	dayCard: "#FFFFFF",
	nightCard: "#16213e",
};

// 19 категорий POI — из оригинального AmapAuto.apk (smf_base.cfg Geocode section)
export const POI_CATEGORIES = [
	{ id: "all", label: "Все", emoji: "📍", osmTag: null },
	{ id: "gas_station", label: "АЗС", emoji: "⛽", osmTag: "amenity=fuel" },
	{ id: "parking", label: "Парковка", emoji: "🅿️", osmTag: "amenity=parking" },
	{
		id: "restaurant",
		label: "Ресторан",
		emoji: "🍽️",
		osmTag: "amenity=restaurant",
	},
	{ id: "hotel", label: "Гостиница", emoji: "🏨", osmTag: "tourism=hotel" },
	{ id: "atm", label: "Банкомат", emoji: "🏧", osmTag: "amenity=atm" },
	{
		id: "hospital",
		label: "Больница",
		emoji: "🏥",
		osmTag: "amenity=hospital",
	},
	{
		id: "shopping",
		label: "Магазины",
		emoji: "🛒",
		osmTag: "shop=*",
		excludeShop: true,
	},
	{
		id: "hotel_nearby",
		label: "Отели рядом",
		emoji: "🏨",
		osmTag: "tourism=hotel",
	},
	{
		id: "ev_charging",
		label: "Зарядка EV",
		emoji: "🔌",
		osmTag: "amenity=charging_station",
	},
	{
		id: "fuel_nearby",
		label: "АЗС рядом",
		emoji: "⛽",
		osmTag: "amenity=fuel",
	},
	{
		id: "parking_nearby",
		label: "Парковка рядом",
		emoji: "🅿️",
		osmTag: "amenity=parking",
	},
	{
		id: "food_nearby",
		label: "Еда рядом",
		emoji: "🍴",
		osmTag: "amenity=restaurant",
	},
	{
		id: "attraction",
		label: "Достопримечательность",
		emoji: "🏛️",
		osmTag: "tourism=attraction",
	},
	{ id: "police", label: "Полиция", emoji: "👮", osmTag: "amenity=police" },
	{ id: "pharmacy", label: "Аптека", emoji: "💊", osmTag: "amenity=pharmacy" },
	{
		id: "car_repair",
		label: "Автосервис",
		emoji: "🔧",
		osmTag: "shop=car_repair",
	},
	{ id: "toilet", label: "Туалет", emoji: "🚻", osmTag: "amenity=toilets" },
	{ id: "wifi", label: "Wi-Fi", emoji: "📶", osmTag: "amenity=wlan" },
] as const;

// Стратегии маршрутов — из оригинального APK
export type RouteStrategy = "fastest" | "shortest" | "intelligent";

export const ROUTE_STRATEGIES: Record<
	RouteStrategy,
	{
		label: string;
		osmParam: string;
		description: string;
	}
> = {
	fastest: {
		label: "Быстро",
		osmParam: "duration",
		description: "Минимальное время в пути",
	},
	shortest: {
		label: "Короткий",
		osmParam: "distance",
		description: "Минимальное расстояние",
	},
	intelligent: {
		label: "Интеллектуальный",
		osmParam: "duration",
		description: "Баланс времени и расстояния",
	},
};

// Типы избеганий — из IDS_ROUTEOPTIONS_* в оригинале
export interface AvoidOptions {
	avoidTolls: boolean;
	avoidHighways: boolean;
	avoidFerries: boolean;
	avoidBorders: boolean;
}

export const DEFAULT_AVOID_OPTIONS: AvoidOptions = {
	avoidTolls: false,
	avoidHighways: false,
	avoidFerries: false,
	avoidBorders: false,
};

// Манёвры — из оригинального APK
export const MANEUVER_TEXT: Record<string, string> = {
	TURN_LEFT: "Поверните налево",
	TURN_RIGHT: "Поверните направо",
	SLIGHT_LEFT: "Чуть налево",
	SLIGHT_RIGHT: "Чуть направо",
	SHARP_LEFT: "Резко налево",
	SHARP_RIGHT: "Резко направо",
	U_TURN: "Разворот",
	CONTINUE: "Продолжайте прямо",
	ROUNDABOUT: "На кольце",
	DESTINATION: "Вы прибыли",
	DEPART: "Начните движение",
	MERGE: "Слийтесь с потоком",
	ON_RAMP: "Съезд на дорогу",
	OFF_RAMP: "Съезд",
	START: "Начните движение",
	END: "Конец маршрута",
};

export const MANEUVER_ICONS: Record<string, string> = {
	TURN_LEFT: "↰",
	TURN_RIGHT: "↱",
	SLIGHT_LEFT: "↖",
	SLIGHT_RIGHT: "↗",
	SHARP_LEFT: "↲",
	SHARP_RIGHT: "↳",
	U_TURN: "↩",
	CONTINUE: "↑",
	ROUNDABOUT: "🔄",
	DESTINATION: "🏁",
	DEPART: "🚗",
	MERGE: "↗",
	ON_RAMP: "↱",
	OFF_RAMP: "↰",
	START: "🚗",
	END: "🏁",
};

// Российские дорожные знаки — из оригинального APK
export const RUSSIAN_ROADS = [
	"M1",
	"M2",
	"M3",
	"M4",
	"M5",
	"M6",
	"M7",
	"M8",
	"M9",
	"M10",
	"M11",
	"M12",
	"M13",
	"M14",
	"M15",
	"M16",
	"M17",
	"M18",
	"M19",
	"M20",
	"M21",
	"M22",
	"M23",
	"A100",
	"A101",
	"A102",
	"A103",
	"A104",
	"A105",
	"A106",
	"A107",
	"A108",
	"A109",
	"A110",
	"A111",
	"A112",
];

// Storage keys
export const STORAGE_KEYS = {
	HOME_LOCATION: "@osm_nav_home",
	WORK_LOCATION: "@osm_nav_work",
	FAVORITES: "@osm_nav_favorites",
	SEARCH_HISTORY: "@osm_nav_history",
	TRACKS: "@osm_nav_tracks",
	SETTINGS: "@osm_nav_settings",
} as const;

// Настройки навигации по умолчанию
export interface NavigationSettings {
	voiceEnabled: boolean;
	speakStreetNames: boolean;
	voiceVolume: number;
	routeStrategy: RouteStrategy;
	avoidTolls: boolean;
	avoidHighways: boolean;
	avoidFerries: boolean;
	avoidBorders: boolean;
	dayNightMode: "auto" | "day" | "night";
	units: "metric" | "imperial";
	language: "ru" | "en";
	speedCameraAlerts: boolean;
	speedCameraWarning: number; // м/с
	speakSpeedCameraAlerts: boolean;
	offlineMode: boolean;
}

export const DEFAULT_SETTINGS: NavigationSettings = {
	voiceEnabled: true,
	speakStreetNames: true,
	voiceVolume: 80,
	routeStrategy: "fastest",
	avoidTolls: false,
	avoidHighways: false,
	avoidFerries: false,
	avoidBorders: false,
	dayNightMode: "auto",
	units: "metric",
	language: "ru",
	speedCameraAlerts: true,
	speedCameraWarning: 13.9, // ~50 km/h
	speakSpeedCameraAlerts: true,
	offlineMode: false,
};

/**
 * Сервис локального хранения (AsyncStorage)
 * Расширен по мотивам AmapAuto.apk: избранное, дом/работа, треки, настройки
 */
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Location, NavigationSettings } from "../types";
import { STORAGE_KEYS } from "../constants";

const DEFAULT_SETTINGS: NavigationSettings = {
	avoidTolls: false,
	avoidHighways: false,
	avoidFerries: false,
	avoidBorders: false,
	voiceVolume: 80,
	voiceEnabled: true,
	offlineMode: false,
	// Расширенные поля
	speakStreetNames: true,
	routeStrategy: "fastest",
	dayNightMode: "auto",
	units: "metric",
	language: "ru",
	speedCameraAlerts: true,
	speedCameraWarning: 13.9,
	speakSpeedCameraAlerts: true,
};

// --- Дом ---
export async function getHomeLocation(): Promise<Location | null> {
	try {
		const data = await AsyncStorage.getItem(STORAGE_KEYS.HOME_LOCATION);
		return data ? JSON.parse(data) : null;
	} catch {
		return null;
	}
}

export async function setHomeLocation(location: Location): Promise<void> {
	await AsyncStorage.setItem(
		STORAGE_KEYS.HOME_LOCATION,
		JSON.stringify(location),
	);
}

// --- Работа ---
export async function getWorkLocation(): Promise<Location | null> {
	try {
		const data = await AsyncStorage.getItem(STORAGE_KEYS.WORK_LOCATION);
		return data ? JSON.parse(data) : null;
	} catch {
		return null;
	}
}

export async function setWorkLocation(location: Location): Promise<void> {
	await AsyncStorage.setItem(
		STORAGE_KEYS.WORK_LOCATION,
		JSON.stringify(location),
	);
}

// --- Избранное ---
export async function getFavorites(): Promise<Location[]> {
	try {
		const data = await AsyncStorage.getItem(STORAGE_KEYS.FAVORITES);
		return data ? JSON.parse(data) : [];
	} catch {
		return [];
	}
}

export async function addFavorite(location: Location): Promise<void> {
	const favorites = await getFavorites();
	const exists = favorites.some(
		(f) =>
			f.latitude === location.latitude && f.longitude === location.longitude,
	);
	if (!exists) {
		favorites.push(location);
		await AsyncStorage.setItem(
			STORAGE_KEYS.FAVORITES,
			JSON.stringify(favorites),
		);
	}
}

export async function removeFavorite(location: Location): Promise<void> {
	const favorites = await getFavorites();
	const filtered = favorites.filter(
		(f) =>
			!(f.latitude === location.latitude && f.longitude === location.longitude),
	);
	await AsyncStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(filtered));
}

export async function isFavorite(location: Location): Promise<boolean> {
	const favorites = await getFavorites();
	return favorites.some(
		(f) =>
			f.latitude === location.latitude && f.longitude === location.longitude,
	);
}

// --- История поиска ---
export async function getSearchHistory(): Promise<Location[]> {
	try {
		const data = await AsyncStorage.getItem(STORAGE_KEYS.SEARCH_HISTORY);
		return data ? JSON.parse(data) : [];
	} catch {
		return [];
	}
}

export async function addToSearchHistory(location: Location): Promise<void> {
	const history = await getSearchHistory();
	const filtered = history.filter(
		(h) =>
			!(h.latitude === location.latitude && h.longitude === location.longitude),
	);
	const updated = [location, ...filtered].slice(0, 20);
	await AsyncStorage.setItem(
		STORAGE_KEYS.SEARCH_HISTORY,
		JSON.stringify(updated),
	);
}

export async function clearSearchHistory(): Promise<void> {
	await AsyncStorage.removeItem(STORAGE_KEYS.SEARCH_HISTORY);
}

// --- Настройки ---
export async function getSettings(): Promise<NavigationSettings> {
	try {
		const data = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
		return data
			? { ...DEFAULT_SETTINGS, ...JSON.parse(data) }
			: DEFAULT_SETTINGS;
	} catch {
		return DEFAULT_SETTINGS;
	}
}

export async function saveSettings(
	settings: NavigationSettings,
): Promise<void> {
	await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
}

// --- Треки поездок ---
export interface Track {
	id: string;
	name: string;
	startTime: number;
	endTime?: number;
	points: Array<{ lat: number; lon: number; timestamp: number; speed?: number }>;
	distanceMeters: number;
	durationSeconds: number;
}

export async function getTracks(): Promise<Track[]> {
	try {
		const data = await AsyncStorage.getItem(STORAGE_KEYS.TRACKS);
		return data ? JSON.parse(data) : [];
	} catch {
		return [];
	}
}

export async function saveTrack(track: Track): Promise<void> {
	const tracks = await getTracks();
	const existing = tracks.findIndex((t) => t.id === track.id);
	if (existing >= 0) {
		tracks[existing] = track;
	} else {
		tracks.unshift(track);
	}
	await AsyncStorage.setItem(STORAGE_KEYS.TRACKS, JSON.stringify(tracks));
}

export async function deleteTrack(trackId: string): Promise<void> {
	const tracks = await getTracks();
	const filtered = tracks.filter((t) => t.id !== trackId);
	await AsyncStorage.setItem(STORAGE_KEYS.TRACKS, JSON.stringify(filtered));
}

export async function clearAllTracks(): Promise<void> {
	await AsyncStorage.removeItem(STORAGE_KEYS.TRACKS);
}

// --- Полная очистка ---
export async function clearAll(): Promise<void> {
	await AsyncStorage.multiRemove([
		STORAGE_KEYS.HOME_LOCATION,
		STORAGE_KEYS.WORK_LOCATION,
		STORAGE_KEYS.FAVORITES,
		STORAGE_KEYS.SEARCH_HISTORY,
		STORAGE_KEYS.TRACKS,
	]);
}

/**
 * Сервис поиска через Nominatim (адреса) + Overpass (POI)
 * Реализовано по мотивам IDS_POICAT_* из AmapAuto.apk — 19 категорий
 */
import type { Location, PoiItem, PoiCategory } from "../types";
import { NOMINATIM_BASE_URL, POI_CATEGORIES } from "../constants";

export interface NominatimResult {
	place_id: number;
	licence: string;
	osm_type: string;
	osm_id: number;
	bbox?: [string, string, string, string];
	display_name: string;
	class?: string;
	type?: string;
	lat: string;
	lon: string;
	address?: Record<string, string>;
}

/**
 * Поиск адресов через Nominatim
 */
export async function searchAddress(query: string): Promise<Location[]> {
	if (!query || query.trim().length < 3) return [];

	try {
		const encoded = encodeURIComponent(query.trim());
		const url = `${NOMINATIM_BASE_URL}/search?q=${encoded}&format=json&addressdetails=1&limit=20&accept-language=ru`;

		const response = await fetch(url, {
			headers: {
				"User-Agent": "OSMNavigator/1.0 (React Native App)",
			},
		});

		if (!response.ok) return [];

		const data: NominatimResult[] = await response.json();

		return data.map((item) => ({
			latitude: parseFloat(item.lat),
			longitude: parseFloat(item.lon),
			name: extractName(item),
			address: formatAddress(item.address),
		}));
	} catch {
		return [];
	}
}

/**
 * Поиск рядом через Nominatim (как fallback для Overpass)
 */
export async function searchNearby(
	location: Location,
	category: string,
	radiusMeters = 5000,
): Promise<Location[]> {
	try {
		const query = encodeURIComponent(`[${category}]`);
		const url = `${NOMINATIM_BASE_URL}/search?q=${query}&nearby=${location.latitude},${location.longitude},${radiusMeters}&format=json&addressdetails=1&limit=20&accept-language=ru`;

		const response = await fetch(url, {
			headers: {
				"User-Agent": "OSMNavigator/1.0 (React Native App)",
			},
		});

		if (!response.ok) return [];

		const data: NominatimResult[] = await response.json();
		return data.map((item) => ({
			latitude: parseFloat(item.lat),
			longitude: parseFloat(item.lon),
			name: extractName(item),
			address: formatAddress(item.address),
		}));
	} catch {
		return [];
	}
}

/**
 * Поиск POI вокруг через Overpass API (OSM).
 * Поддерживает 19 категорий как в оригинальном APK.
 */
export async function searchPoiNearby(
	location: Location,
	category: PoiCategory,
	radiusMeters = 5000,
): Promise<PoiItem[]> {
	const catDef = POI_CATEGORIES.find((c) => c.id === category);
	if (!catDef?.osmTag) return [];

	const [key, value] = catDef.osmTag.split("=");
	const isWildcard = value === "*";

	// Overpass QL запрос
	const query = `[out:json][timeout:15];
    (
      node[${key}](around:${radiusMeters},${location.latitude},${location.longitude});
      way[${key}](around:${radiusMeters},${location.latitude},${location.longitude});
    );
    out center ${Math.min(50, Math.max(10, Math.floor(radiusMeters / 200)))};`;

	// Если wildcard — используем упрощённый запрос
	const finalQuery = isWildcard
		? `[out:json][timeout:15];
        (
          node["shop"](around:${radiusMeters},${location.latitude},${location.longitude});
        );
        out center 30;`
		: query;

	try {
		const response = await fetch("https://overpass-api.de/api/interpreter", {
			method: "POST",
			headers: { "Content-Type": "application/x-www-form-urlencoded" },
			body: `data=${encodeURIComponent(finalQuery)}`,
		});

		if (!response.ok) return [];

		const data = await response.json();
		const elements = data.elements ?? [];

		const pois: PoiItem[] = elements.map((el: any) => {
			const lat = el.lat ?? el.center?.lat ?? 0;
			const lon = el.lon ?? el.center?.lon ?? 0;
			const tags = el.tags ?? {};

			return {
				latitude: lat,
				longitude: lon,
				name: tags.name ?? tags["name:ru"] ?? tags["operator"] ?? `${catDef.label}`,
				address: tags["addr:street"] ?? tags["addr:city"] ?? "",
				category,
				rank: tags.rank ?? 0,
				distanceFromUser: Math.round(
					haversine(location.latitude, location.longitude, lat, lon),
				),
			};
		});

		// Сортируем по расстоянию
		pois.sort((a, b) => (a.distanceFromUser ?? 0) - (b.distanceFromUser ?? 0));
		return pois;
	} catch {
		// Fallback на Nominatim
		return searchNearby(location, categoryToOsmType(category), radiusMeters).then(
			(items) =>
				items.map((it) => ({
					...it,
					category,
				})),
		);
	}
}

/**
 * Reverse geocoding — из координат в адрес
 */
export async function reverseGeocode(location: Location): Promise<Location> {
	try {
		const url = `${NOMINATIM_BASE_URL}/reverse?lat=${location.latitude}&lon=${location.longitude}&format=json&addressdetails=1&accept-language=ru&zoom=18`;

		const response = await fetch(url, {
			headers: {
				"User-Agent": "OSMNavigator/1.0 (React Native App)",
			},
		});

		if (!response.ok) {
			return {
				...location,
				name: `${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}`,
			};
		}

		const data: NominatimResult = await response.json();

		return {
			...location,
			name: extractName(data),
			address: formatAddress(data.address),
		};
	} catch {
		return {
			...location,
			name: `${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}`,
		};
	}
}

/**
 * Поиск категории для быстрого доступа (АЗС рядом, Парковка рядом и т.п.)
 */
export async function searchQuickCategory(
	location: Location,
	category: PoiCategory,
): Promise<PoiItem[]> {
	return searchPoiNearby(location, category, 3000);
}

function extractName(item: NominatimResult): string {
	if (item.address) {
		const parts: string[] = [];
		if (item.address.amenity) parts.push(item.address.amenity);
		if (item.address.shop) parts.push(item.address.shop);
		if (item.address.tourism) parts.push(item.address.tourism);
		if (item.address.building) parts.push(item.address.building);
		if (item.address.attraction) parts.push(item.address.attraction);
		if (parts.length > 0) return parts.join(", ");
	}
	// Берём первую часть display_name
	return item.display_name.split(",").slice(0, 2).join(",").trim();
}

function formatAddress(addr?: Record<string, string>): string {
	if (!addr) return "";
	const parts: string[] = [];
	if (addr.road) parts.push(addr.road);
	if (addr.house_number) parts.push(addr.house_number);
	if (addr.city || addr.town || addr.village) {
		parts.push(addr.city ?? addr.town ?? addr.village ?? "");
	}
	return parts.filter(Boolean).join(", ");
}

function categoryToOsmType(category: PoiCategory): string {
	const map: Record<PoiCategory, string> = {
		all: "amenity",
		gas_station: "fuel",
		parking: "parking",
		restaurant: "restaurant",
		hotel: "hotel",
		atm: "atm",
		hospital: "hospital",
		shopping: "shop",
		ev_charging: "charging_station",
		fuel_nearby: "fuel",
		parking_nearby: "parking",
		food_nearby: "restaurant",
		hotel_nearby: "hotel",
		attraction: "attraction",
		police: "police",
		pharmacy: "pharmacy",
		car_repair: "car_repair",
		toilet: "toilets",
		wifi: "wifi",
	};
	return map[category] ?? "amenity";
}

function haversine(
	lat1: number, lon1: number,
	lat2: number, lon2: number,
): number {
	const R = 6371000;
	const dLat = ((lat2 - lat1) * Math.PI) / 180;
	const dLon = ((lon2 - lon1) * Math.PI) / 180;
	const a =
		Math.sin(dLat / 2) ** 2 +
		Math.cos((lat1 * Math.PI) / 180) *
			Math.cos((lat2 * Math.PI) / 180) *
			Math.sin(dLon / 2) ** 2;
	return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

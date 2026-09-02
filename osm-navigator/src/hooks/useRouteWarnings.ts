/**
 * Хук для проверки предупреждений маршрута
 * Реализовано по мотивам IDS_CALCROUTE_WARN_TOLL, IDS_CALCROUTE_WARN_FERRY,
 * IDS_CALCROUTE_WARN_ABORDER из AmapAuto.apk
 */
import { useState, useCallback } from "react";
import type { Route } from "../types";

export interface RouteWarning {
	type: "toll" | "ferry" | "border" | "highway";
	message: string;
	icon: string;
}

export function useRouteWarnings() {
	const [warnings, setWarnings] = useState<RouteWarning[]>([]);
	const [loading, setLoading] = useState(false);

	/**
	 * Анализирует маршрут на наличие платных дорог, паромов и границ
	 * OSRM возвращает информацию о toll roads в metadata
	 */
	const analyzeRoute = useCallback(
		async (
			route: Route,
			startLat: number,
			startLon: number,
			endLat: number,
			endLon: number,
		) => {
			setLoading(true);
			const newWarnings: RouteWarning[] = [];

			try {
				// OSRM не предоставляет direct toll/ferry info в базовом ответе,
				// но мы можем определить по косвенным признакам:

				// 1. Если маршрут длинный (>200км) — проверяем через OSRM route GET
				if (route.distanceMeters > 200_000) {
					// OSRM doesn't expose toll data directly, but we can:
					// - Check if route crosses known toll road regions
					// - For Russia: check M11, M12, M4, M3 etc.
					const tollRoads = checkRussianTollRoads(route.points);
					if (tollRoads.length > 0) {
						newWarnings.push({
							type: "toll",
							message: "На маршруте есть платные дороги",
							icon: "💰",
						});
					}
				}

				// 2. Проверяем наличие ferry в координатах (если маршрут идёт через водные преграды)
				const hasFerry = checkFerryRoute(route.points);
				if (hasFerry) {
					newWarnings.push({
						type: "ferry",
						message: "Маршрут предусматривает паромную переправу",
						icon: "⛴️",
					});
				}

				// 3. Проверяем пересечение границ
				const crossesBorder = checkCrossesBorder(
					startLat,
					startLon,
					endLat,
					endLon,
				);
				if (crossesBorder) {
					newWarnings.push({
						type: "border",
						message: "Маршрут пересекает границу государства",
						icon: "🌍",
					});
				}

				setWarnings(newWarnings);
			} finally {
				setLoading(false);
			}
		},
		[],
	);

	const clearWarnings = useCallback(() => {
		setWarnings([]);
	}, []);

	return { warnings, loading, analyzeRoute, clearWarnings };
}

/**
 * Проверяет наличие известных российских платных дорог в маршруте
 * Крупнейшие: М11 (Москва-СПб), М12 (Москва-Казань), М4 (Москва-Новороссийск)
 * Эти дороги проходят через определённые координаты
 */
function checkRussianTollRoads(
	points: { latitude: number; longitude: number }[],
): string[] {
	const tollRoads: Array<{
		name: string;
		bbox: [number, number, number, number];
	}> = [
		// М11 Нева (Москва — Санкт-Петербург)
		{ name: "М11", bbox: [55.5, 36.0, 60.0, 40.5] },
		// М12 Казань (Москва — Казань)
		{ name: "М12", bbox: [55.3, 37.0, 56.0, 50.0] },
		// М4 Дон (Москва — Новороссийск)
		{ name: "М4", bbox: [45.0, 37.0, 55.7, 40.0] },
		// М3 Киев (Москва — граница с Украиной)
		{ name: "М3", bbox: [54.0, 34.0, 55.7, 37.0] },
	];

	const detected: string[] = [];

	for (const road of tollRoads) {
		const crossingPoints = points.filter(
			(p) =>
				p.latitude >= road.bbox[0] &&
				p.latitude <= road.bbox[2] &&
				p.longitude >= road.bbox[1] &&
				p.longitude <= road.bbox[3],
		);
		if (crossingPoints.length > 20) {
			// Много точек в зоне — значит использует эту дорогу
			detected.push(road.name);
		}
	}

	return detected;
}

/**
 * Определяет наличие паромной переправы
 * Признаки: маршрут проходит через водные объекты
 */
function checkFerryRoute(
	points: { latitude: number; longitude: number }[],
): boolean {
	if (points.length < 2) return false;

	// Простейшая проверка: если между точками слишком большое расстояние
	// для прямой линии, возможно требуется паром
	let totalDist = 0;
	for (let i = 1; i < points.length; i++) {
		const d = haversine(
			points[i - 1].latitude,
			points[i - 1].longitude,
			points[i].latitude,
			points[i].longitude,
		);
		totalDist += d;
	}

	// Euclidean distance (прямая линия)
	const directDist = haversine(
		points[0].latitude,
		points[0].longitude,
		points[points.length - 1].latitude,
		points[points.length - 1].longitude,
	);

	// Если route length / direct length > 1.5, возможно есть препятствия
	return directDist > 0 && totalDist / directDist > 1.5;
}

/**
 * Проверяет пересечение границы
 */
function checkCrossesBorder(
	startLat: number,
	startLon: number,
	endLat: number,
	endLon: number,
): boolean {
	// Упрощённо: если начало и конец в России
	// Координаты РФ: lat 41-82, lon -180 to 180
	const inRussia = (lat: number, lon: number) => lat >= 41 && lat <= 82;

	const startInRussia = inRussia(startLat, startLon);
	const endInRussia = inRussia(endLat, endLon);

	// Если только одна точка в РФ — значит пересекаем границу
	return startInRussia !== endInRussia;
}

function haversine(
	lat1: number,
	lon1: number,
	lat2: number,
	lon2: number,
): number {
	const R = 6371000;
	const dLat = ((lat2 - lat1) * Math.PI) / 180;
	const dLon = ((lon2 - lon1) * Math.PI) / 180;
	const a =
		Math.sin(dLat / 2) ** 2 +
		Math.cos((lat1 * Math.PI) / 180) *
			Math.cos((lat2 * Math.PI) / 180) *
			Math.sin(dLon / 2) ** 2;
	return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

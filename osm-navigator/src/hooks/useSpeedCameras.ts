/**
 * Хук для обнаружения камер контроля скорости (ГИБДД)
 * Источник: OpenStreetMap POI
 * Реализовано по мотивам IDS_SPDCAMERA_ON, IDS_SPEEDALERT_* из AmapAuto.apk
 */
import { useState, useCallback, useRef } from "react";
import type { Location } from "../types";

export interface SpeedCamera {
	id: string;
	lat: number;
	lon: number;
	type: "speed" | "red_light" | "traffic";
	maxSpeed?: number;
	name?: string;
	distance?: number;
}

interface SpeedCameraAlert {
	camera: SpeedCamera;
	distance: number;
	speedLimit: number;
}

/**
 * Загружает камеры вдоль маршрута через Overpass API (OSM)
 */
export async function fetchSpeedCamerasAlongRoute(
	routePoints: Location[],
	radiusMeters = 500,
): Promise<SpeedCamera[]> {
	if (routePoints.length < 2) return [];

	// Ограничиваем выборку — берём каждые 50 точек маршрута
	const step = Math.max(1, Math.floor(routePoints.length / 50));
	const sampled = routePoints.filter((_, i) => i % step === 0);

	if (sampled.length === 0) return [];

	// Overpass API — поиск камер ГИБДД
	const bbox = sampled.reduce(
		(acc, p) => ({
			minLat: Math.min(acc.minLat, p.latitude),
			maxLat: Math.max(acc.maxLat, p.latitude),
			minLon: Math.min(acc.minLon, p.longitude),
			maxLon: Math.max(acc.maxLon, p.longitude),
		}),
		{
			minLat: sampled[0].latitude,
			maxLat: sampled[0].latitude,
			minLon: sampled[0].longitude,
			maxLon: sampled[0].longitude,
		},
	);

	// Добавляем небольшой отступ
	const padding = 0.02;
	const query = `[out:json][timeout:15];
    (
      node["highway"="speed_camera"](${bbox.minLat - padding},${bbox.minLon - padding},${bbox.maxLat + padding},${bbox.maxLon + padding});
      node["amenity"="speed_camera"](${bbox.minLat - padding},${bbox.minLon - padding},${bbox.maxLat + padding},${bbox.maxLon + padding});
      node[" enforcement"="speed"](${bbox.minLat - padding},${bbox.minLon - padding},${bbox.maxLat + padding},${bbox.maxLon + padding});
      node["amenity"="red_light_camera"](${bbox.minLat - padding},${bbox.minLon - padding},${bbox.maxLat + padding},${bbox.maxLon + padding});
    );
    out body;`;

	try {
		const response = await fetch("https://overpass-api.de/api/interpreter", {
			method: "POST",
			headers: { "Content-Type": "application/x-www-form-urlencoded" },
			body: `data=${encodeURIComponent(query)}`,
		});

		if (!response.ok) return [];

		const data = await response.json();
		const cameras: SpeedCamera[] = (data.elements || []).map((el: any) => ({
			id: `cam_${el.id}`,
			lat: el.lat,
			lon: el.lon,
			type:
				el.tags?.amenity === "red_light_camera"
					? "red_light"
					: el.tags?.highway === "speed_camera"
						? "speed"
						: "speed",
			maxSpeed: el.tags?.maxspeed
				? parseInt(el.tags.maxspeed.replace(/[^\d]/g, ""), 10) || undefined
				: undefined,
			name: el.tags?.name || el.tags?.["operator:ru"] || undefined,
		}));

		return cameras;
	} catch {
		return [];
	}
}

/**
 * Находит ближайшую камеру в пределах заданного радиуса
 */
export function findNearestCamera(
	cameras: SpeedCamera[],
	currentPos: Location,
	radiusMeters = 500,
): SpeedCameraAlert | null {
	let nearest: SpeedCameraAlert | null = null;

	for (const cam of cameras) {
		const dist = haversineDistance(
			currentPos.latitude,
			currentPos.longitude,
			cam.lat,
			cam.lon,
		);
		if (dist <= radiusMeters && (!nearest || dist < nearest.distance)) {
			nearest = {
				camera: cam,
				distance: dist,
				speedLimit: cam.maxSpeed ?? 60,
			};
		}
	}

	return nearest;
}

function haversineDistance(
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
	return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

export function useSpeedCameras() {
	const [cameras, setCameras] = useState<SpeedCamera[]>([]);
	const [loading, setLoading] = useState(false);
	const [nearestAlert, setNearestAlert] = useState<SpeedCameraAlert | null>(
		null,
	);
	const lastAlertRef = useRef<number>(0);

	const loadCameras = useCallback(async (routePoints: Location[]) => {
		setLoading(true);
		try {
			const cams = await fetchSpeedCamerasAlongRoute(routePoints);
			setCameras(cams);
		} finally {
			setLoading(false);
		}
	}, []);

	const checkCameras = useCallback(
		(currentPos: Location) => {
			const alert = findNearestCamera(cameras, currentPos, 800);
			const now = Date.now();

			// Не спамим предупреждениями — минимум 30 сек между ними
			if (alert && now - lastAlertRef.current > 30000) {
				lastAlertRef.current = now;
				setNearestAlert(alert);
			} else if (!alert) {
				setNearestAlert(null);
			}
		},
		[cameras],
	);

	const clearAlert = useCallback(() => {
		setNearestAlert(null);
	}, []);

	return {
		cameras,
		loading,
		nearestAlert,
		loadCameras,
		checkCameras,
		clearAlert,
	};
}

/**
 * Сервис маршрутизации через OSRM API
 * Расширен: lane guidance, route options, multiple servers
 */
import type {
	Location,
	Route,
	RouteInstruction,
	Maneuver,
	RouteOptions,
} from "../types";
import { OSRM_BASE_URL } from "../constants";

// OSRM servers — production + backup
const OSRM_SERVERS = [
	"https://router.project-osrm.org",
	"https://routing.openstreetmap.de/routed-car",
];

export class RouteError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "RouteError";
	}
}

interface OSRMRouteResponse {
	code: string;
	message?: string;
	routes: OSRMRoute[];
}

interface OSRMRoute {
	geometry: { coordinates: number[][] };
	distance: number;
	duration: number;
	legs: OSRMLeg[];
}

interface OSRMLeg {
	steps: OSRMStep[];
}

interface OSRMStep {
	distance: number;
	duration: number;
	name: string;
	maneuver: OSMManeuver;
	lanes?: OSRMLane[];
	intersections?: OSRMIntersection[];
	exits?: string;
	rotary_name?: string;
	rotary_exit?: number;
}

interface OSRMLane {
	indications: string[];
	valid: boolean;
}

interface OSRMIntersection {
	out?: number;
	entry: boolean[];
	bearings: number[];
	lanes: OSRMLaneInfo[];
}

interface OSRMLaneInfo {
	indications: string[];
	valid: boolean;
}

interface OSMManeuver {
	type: string;
	modifier?: string;
	location: number[];
	bearing_after?: number;
	bearing_before?: number;
	exit?: number;
}

/** Lane indication mapping */
const LANE_INDICATIONS: Record<string, string> = {
	left: "left",
	right: "right",
	"slight left": "slightLeft",
	"slight right": "slightRight",
	"sharp left": "sharpLeft",
	"sharp right": "sharpRight",
	straight: "straight",
	uturn: "uturn",
	merge: "mergeToLeft",
};

/**
 * Запрашивает маршрут через OSRM
 * @param start Начальная точка
 * @param end Конечная точка
 * @param options Опции маршрута (стратегия, избегания)
 */
export async function getRoute(
	start: Location,
	end: Location,
	options?: RouteOptions,
): Promise<Route> {
	const origin = `${start.longitude},${start.latitude}`;
	const destination = `${end.longitude},${end.latitude}`;
	const strategy = options?.strategy ?? "fastest";

	// OSRM URL параметры
	// Примечание: exclude работает только на приватных OSRM серверах,
	// публичный demo сервер его не поддерживает
	const params = new URLSearchParams({
		overview: "full",
		steps: "true",
		geometries: "geojson",
		annotations: "true",
	});

	// Routing profile — используем driving
	const profile = strategy === "shortest" ? "driving" : "driving";

	let lastError: Error = new Error("Все серверы OSRM недоступны");
	let rateLimitHit = false;

	for (const baseUrl of OSRM_SERVERS) {
		try {
			const url = `${baseUrl}/route/v1/${profile}/${origin};${destination}?${params.toString()}`;
			const response = await fetch(url);

			// Rate limiting — OSRM demo сервер ограничивает запросы
			if (response.status === 429) {
				rateLimitHit = true;
				lastError = new Error("429");
				continue;
			}

			if (response.status === 403) {
				lastError = new Error("403");
				continue;
			}

			if (response.status >= 500) {
				lastError = new Error(`${response.status}`);
				continue;
			}

			if (!response.ok) {
				lastError = new Error(`HTTP ${response.status}`);
				continue;
			}

			const data: OSRMRouteResponse = await response.json();

			if (data.code !== "Ok") {
				lastError = new Error(data.message ?? `OSRM: ${data.code}`);
				continue;
			}

			if (!data.routes?.[0]) {
				lastError = new RouteError("Маршрут между этими точками не найден");
				continue;
			}

			return parseRoute(data, start, end, options);
		} catch (e) {
			lastError = e instanceof Error ? e : new Error(String(e));
		}
	}

	// Формируем конкретное сообщение об ошибке
	if (rateLimitHit) {
		throw new RouteError(
			"Сервис маршрутизации временно недоступен (превышен лимит запросов). Попробуйте через несколько минут.",
		);
	}

	// Проверяем сообщение последней ошибки
	const msg = lastError.message;
	if (
		msg.includes("fetch") ||
		msg.includes("network") ||
		msg.includes("Network")
	) {
		throw new RouteError(
			"Нет связи с сервером маршрутов. Проверьте интернет-соединение.",
		);
	}

	throw new RouteError(
		`Не удалось построить маршрут: ${lastError.message}. Проверьте интернет-соединение.`,
	);
}

function parseRoute(
	data: OSRMRouteResponse,
	start: Location,
	end: Location,
	options?: RouteOptions,
): Route {
	const osrmRoute = data.routes[0];

	// Точки маршрута
	const points: Location[] = osrmRoute.geometry.coordinates.map((coord) => ({
		latitude: coord[1],
		longitude: coord[0],
	}));

	// Инструкции с lane guidance
	const instructions: RouteInstruction[] = osrmRoute.legs.flatMap((leg) =>
		leg.steps.map((step) => {
			const maneuver = parseManeuver(
				step.maneuver.type,
				step.maneuver.modifier,
			);

			// Lane guidance
			const lanes = step.intersections
				?.flatMap((intersection) => intersection.lanes)
				.filter(Boolean)
				.map((lane) => ({
					indications: (lane.indications ?? []).map(
						(ind) => LANE_INDICATIONS[ind] ?? ind,
					) as any[],
					valid: lane.valid,
				}));

			return {
				text: step.name || getDefaultText(maneuver),
				distanceMeters: Math.round(step.distance),
				durationSeconds: Math.round(step.duration),
				maneuver,
				point: {
					latitude: step.maneuver.location[1],
					longitude: step.maneuver.location[0],
				},
				streetName: step.name || undefined,
				lanes: lanes?.length ? lanes : undefined,
				exits: step.exits,
				rotaryName: step.rotary_name,
				rotaryExit: step.rotary_exit,
			};
		}),
	);

	return {
		points,
		distanceMeters: Math.round(osrmRoute.distance),
		durationSeconds: Math.round(osrmRoute.duration),
		instructions,
		options,
	};
}

function parseManeuver(type: string, modifier?: string): Maneuver {
	switch (type) {
		case "depart":
			return "DEPART";
		case "arrive":
			return "DESTINATION";
		case "end of road":
			switch (modifier) {
				case "left":
					return "TURN_LEFT";
				case "right":
					return "TURN_RIGHT";
				default:
					return "CONTINUE";
			}
		case "turn":
			switch (modifier) {
				case "left":
					return "TURN_LEFT";
				case "right":
					return "TURN_RIGHT";
				case "slight left":
					return "SLIGHT_LEFT";
				case "slight right":
					return "SLIGHT_RIGHT";
				case "sharp left":
					return "SHARP_LEFT";
				case "sharp right":
					return "SHARP_RIGHT";
				case "uturn":
					return "U_TURN";
				default:
					return "CONTINUE";
			}
		case "new name":
		case "continue":
			return "CONTINUE";
		case "roundabout":
		case "rotary":
			return "ROUNDABOUT";
		case "merge":
			return "MERGE";
		case "on ramp":
			return "ON_RAMP";
		case "off ramp":
			return "OFF_RAMP";
		case "fork":
			switch (modifier) {
				case "left":
					return "FORK_LEFT";
				case "right":
					return "FORK_RIGHT";
				default:
					return "CONTINUE";
			}
		default:
			return "CONTINUE";
	}
}

const MANEUVER_TEXT: Record<string, string> = {
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
	FORK_LEFT: "Держитесь левее",
	FORK_RIGHT: "Держитесь правее",
};

function getDefaultText(maneuver: Maneuver): string {
	return MANEUVER_TEXT[maneuver] ?? "Продолжайте движение";
}

export function calculateDistance(
	lat1: number,
	lon1: number,
	lat2: number,
	lon2: number,
): number {
	const R = 6371000;
	const dLat = toRad(lat2 - lat1);
	const dLon = toRad(lon2 - lon1);
	const a =
		Math.sin(dLat / 2) ** 2 +
		Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
	return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}

function toRad(deg: number): number {
	return (deg * Math.PI) / 180;
}

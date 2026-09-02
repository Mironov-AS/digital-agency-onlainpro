/**
 * Модель местоположения
 */
export interface Location {
	latitude: number;
	longitude: number;
	name?: string;
	address?: string;
	icon?: string;
}

/**
 * Route strategy — из оригинального APK
 */
export type RouteStrategy = "fastest" | "shortest" | "intelligent";

/**
 * Модель маршрута
 */
export interface Route {
	points: Location[];
	distanceMeters: number;
	durationSeconds: number;
	instructions: RouteInstruction[];
	geometry?: string;
	options?: RouteOptions;
}

export interface RouteOptions {
	strategy: RouteStrategy;
	avoidTolls: boolean;
	avoidHighways: boolean;
	avoidFerries: boolean;
	avoidBorders: boolean;
}

/**
 * Инструкция маршрута с дополнительными полями
 */
export interface RouteInstruction {
	text: string;
	distanceMeters: number;
	durationSeconds?: number;
	maneuver: Maneuver;
	point: Location;
	streetName?: string;
	lanes?: LaneGuidance[];
	exits?: string;
	rotaryAngle?: number;
	rotaryExit?: number;
}

/**
 * Lane Guidance — для отображения полос движения на магистралях
 * Структура соответствует maneuvers[].lanes в OSRM
 */
export interface LaneGuidance {
	indications: LaneIndication[]; // повороты на полосе
	valid: boolean; // разрешена ли полоса для текущего манёвра
}

export type LaneIndication =
	| "left"
	| "slightLeft"
	| "sharpLeft"
	| "straight"
	| "slightRight"
	| "sharpRight"
	| "right"
	| "uturn"
	| "mergeToLeft"
	| "mergeToRight";

/**
 * Тип манёвра — расширенный по мотивам OSRM v5
 */
export type Maneuver =
	| "START"
	| "TURN_LEFT"
	| "TURN_RIGHT"
	| "SLIGHT_LEFT"
	| "SLIGHT_RIGHT"
	| "SHARP_LEFT"
	| "SHARP_RIGHT"
	| "U_TURN"
	| "CONTINUE"
	| "ROUNDABOUT"
	| "ROTARY"
	| "DESTINATION"
	| "DEPART"
	| "MERGE"
	| "ON_RAMP"
	| "OFF_RAMP"
	| "END"
	| "FORK_LEFT"
	| "FORK_RIGHT"
	| "ROUNDABOUT_ENTER"
	| "ROUNDABOUT_EXIT";

/**
 * POI категории — 19 категорий как в AmapAuto.apk
 */
export type PoiCategory =
	| "all"
	| "gas_station"
	| "parking"
	| "restaurant"
	| "hotel"
	| "atm"
	| "hospital"
	| "shopping"
	| "ev_charging"
	| "fuel_nearby"
	| "parking_nearby"
	| "food_nearby"
	| "hotel_nearby"
	| "attraction"
	| "police"
	| "pharmacy"
	| "car_repair"
	| "toilet"
	| "wifi";

export interface PoiItem extends Location {
	category: PoiCategory;
	rank?: number;
	distanceFromUser?: number;
}

/**
 * Настройки навигации — расширены по мотивам AmapAuto.apk
 */
export interface NavigationSettings {
	avoidTolls: boolean;
	avoidHighways: boolean;
	avoidFerries: boolean;
	avoidBorders: boolean;
	voiceVolume: number;
	voiceEnabled: boolean;
	offlineMode: boolean;
	// Новые поля
	speakStreetNames: boolean;
	routeStrategy: RouteStrategy;
	dayNightMode: "auto" | "day" | "night";
	units: "metric" | "imperial";
	language: "ru" | "en";
	speedCameraAlerts: boolean;
	speedCameraWarning: number;
	speakSpeedCameraAlerts: boolean;
}

/**
 * Day/Night режим — реализация useIllumination
 */
export type DayNightMode = "auto" | "day" | "night";

/**
 * Контакт приборки / car-system protocol
 */
export interface CarBridgeState {
	connected: boolean;
	aidlBound: boolean;
	lastBroadcastReceived: number;
	headlightsOn: boolean;
	illumination: number;
	volume: number;
}

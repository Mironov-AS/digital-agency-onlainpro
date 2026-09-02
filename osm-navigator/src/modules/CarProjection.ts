/**
 * CarProjection — модуль проекции навигации на приборную панель автомобиля.
 *
 * Поддерживает:
 * 1. Android Auto / Android Automotive OS (AAOS)
 *    → Turn-by-Turn инструкции на цифровой приборной панели
 * 2. OEM-специфичные протоколы (Huawei, Xiaomi, OEM head units)
 *    → Broadcast intents для OEM автомобильных систем
 *
 * i.MX 8QXP head units: работает через Android Auto framework
 */
import { NativeModules, Platform } from "react-native";

const { CarProjectionModule } = NativeModules;

export interface ProjectionStatus {
	isActive: boolean;
	currentManeuver: string;
	currentStreet: string;
	distanceMeters: number;
	totalDistanceMeters: number;
	remainingSeconds: number;
	destination: string;
	androidAutoAvailable: boolean;
	oemAvailable: boolean;
}

export interface NavigationUpdate {
	maneuverText: string; // "Поверните направо"
	streetName: string; // "на ул. Ленина"
	distanceMeters: number; // 500
	totalDistanceMeters: number; // 12500
	remainingSeconds: number; // 1500
}

class CarProjectionService {
	private isAvailable: boolean | null = null;

	/**
	 * Проверить доступность проекции на данном устройстве.
	 * Возвращает true если Android Auto или OEM проекция доступны.
	 */
	async checkAvailability(): Promise<boolean | null> {
		if (this.isAvailable !== null) return this.isAvailable;

		if (Platform.OS !== "android") {
			this.isAvailable = false;
			return false;
		}

		if (!CarProjectionModule) {
			console.warn("CarProjectionModule not found — native module not linked");
			this.isAvailable = false;
			return false;
		}

		try {
			this.isAvailable = await CarProjectionModule.isProjectionAvailable();
		} catch (e) {
			console.warn("CarProjection availability check failed:", e);
			this.isAvailable = false;
		}

		return this.isAvailable;
	}

	/**
	 * Запустить проекцию навигации на приборную панель.
	 * Вызывается при начале навигации.
	 *
	 * @param destinationName — название пункта назначения
	 * @param latitude — широта
	 * @param longitude — долгота
	 */
	async startProjection(
		destinationName: string,
		latitude: number,
		longitude: number,
	): Promise<boolean> {
		if (Platform.OS !== "android") return false;
		if (!CarProjectionModule) return false;

		try {
			return await CarProjectionModule.startProjection(
				destinationName,
				latitude,
				longitude,
			);
		} catch (e) {
			console.warn("Failed to start car projection:", e);
			return false;
		}
	}

	/**
	 * Обновить данные навигации — вызывается при каждом манёвре.
	 * Отправляет Turn-by-Turn данные на приборную панель.
	 *
	 * @param update — данные текущей навигационной инструкции
	 */
	async updateNavigation(update: NavigationUpdate): Promise<boolean> {
		if (Platform.OS !== "android") return false;
		if (!CarProjectionModule) return false;

		try {
			return await CarProjectionModule.updateNavigation(
				update.maneuverText,
				update.streetName,
				update.distanceMeters,
				update.totalDistanceMeters,
				update.remainingSeconds,
			);
		} catch (e) {
			// Silently ignore — projection is best-effort
			return false;
		}
	}

	/**
	 * Остановить проекцию навигации.
	 * Вызывается при остановке навигации.
	 */
	async stopProjection(): Promise<boolean> {
		if (Platform.OS !== "android") return false;
		if (!CarProjectionModule) return false;

		try {
			return await CarProjectionModule.stopProjection();
		} catch (e) {
			console.warn("Failed to stop car projection:", e);
			return false;
		}
	}

	/**
	 * Получить текущий статус проекции.
	 */
	async getStatus(): Promise<ProjectionStatus | null> {
		if (Platform.OS !== "android") return null;
		if (!CarProjectionModule) return null;

		try {
			return await CarProjectionModule.getProjectionStatus({});
		} catch (e) {
			return null;
		}
	}
}

export const carProjection = new CarProjectionService();

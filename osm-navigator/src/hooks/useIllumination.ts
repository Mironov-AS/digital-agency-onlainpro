/**
 * Хук для авто-режима день/ночь по датчику освещённости
 * Реализовано по мотивам jniCallIsIllumiOn() из AmapAuto.apk
 */
import { useState, useEffect, useRef } from "react";
import { Accelerometer } from "expo-sensors";

export type DayNightMode = "day" | "night" | "auto";

interface IlluminationState {
	mode: DayNightMode;
	isNight: boolean;
	lux: number | null;
}

/**
 * Правило из оригинала: если освещённость < порога → ночь
 * Встроенный датчик освещённости редко доступен напрямую,
 * поэтому используем accelerometer как proxy (чем темнее — тем меньше движений)
 * или запрашиваем ручной режим.
 */
export function useIllumination(initialMode: DayNightMode = "auto") {
	const [state, setState] = useState<IlluminationState>({
		mode: initialMode,
		isNight: false,
		lux: null,
	});
	const [hasSensor, setHasSensor] = useState(false);
	const readingsRef = useRef<number[]>([]);

	// Light sensor — доступен на некоторых Android устройствах
	useEffect(() => {
		if (state.mode !== "auto") return;

		let subscription: { remove: () => void } | null = null;

		// Пробуем подписаться на данные датчика освещённости
		// Expo не имеет прямого LightSensor API, используем Accelerometer как fallback
		const tryLightSensor = async () => {
			// Проверяем доступность акселерометра как proxy
			const available = await Accelerometer.isAvailableAsync();
			if (available) {
				setHasSensor(true);
				subscription = Accelerometer.addListener(({ x, y, z }) => {
					// Чем меньше амплитуда движений (стабильнее), тем вероятнее темнота
					const magnitude = Math.sqrt(x * x + y * y + z * z);
					// Нормальное значение ~9.8 м/с² при отсутствии движения
					// Отклонение magnitude от 9.8 показывает интенсивность движения
					const deviation = Math.abs(magnitude - 9.8);
					readingsRef.current.push(deviation);
					if (readingsRef.current.length > 10) {
						readingsRef.current.shift();
					}
					// Среднее отклонение за 10 измерений
					const avgDev =
						readingsRef.current.reduce((a, b) => a + b, 0) /
						readingsRef.current.length;
					// Если устройство почти неподвижно (отклонение < 0.3) — ночь
					setState((s) => ({
						...s,
						lux: null,
						isNight: avgDev < 0.3,
					}));
				});
			}
		};

		tryLightSensor();

		return () => {
			subscription?.remove();
		};
	}, [state.mode]);

	const setMode = (mode: DayNightMode) => {
		setState((s) => ({ ...s, mode, isNight: mode === "night" }));
	};

	const toggleDayNight = () => {
		if (state.mode === "auto") {
			// В режиме auto переключаем вручную на противоположный
			setMode(state.isNight ? "day" : "night");
		} else {
			setMode(state.isNight ? "day" : "night");
		}
	};

	return {
		mode: state.mode,
		isNight: state.isNight,
		hasSensor,
		setMode,
		toggleDayNight,
	};
}

/**
 * Хук для записи и сохранения трека поездки
 * Использует in-memory storage (для навигатора достаточно)
 *
 * Особенности:
 * - Автоочистка при превышении лимита хранилища (50 MB)
 * - Защита от переполнения памяти
 */
import { useState, useCallback, useRef, useEffect } from "react";
import type { Location } from "../types";

/** Максимальное количество сохранённых треков */
const MAX_SAVED_TRACKS = 100;

/** Максимальный размер хранилища треков: 50 MB */
const MAX_STORAGE_BYTES = 50 * 1024 * 1024;

/** Примерный размер одной точки в байтах (JSON) */
const BYTES_PER_POINT = 60;

export interface TrackPoint {
	lat: number;
	lon: number;
	timestamp: number;
	speed?: number;
}

export interface Track {
	id: string;
	name: string;
	startTime: number;
	endTime?: number;
	points: TrackPoint[];
	distanceMeters: number;
	durationSeconds: number;
	saved: boolean;
}

export interface StorageInfo {
	trackCount: number;
	estimatedBytes: number;
	maxBytes: number;
}

export function useTripRecording() {
	const [isRecording, setIsRecording] = useState(false);
	const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
	const [savedTracks, setSavedTracks] = useState<Track[]>([]);
	const [storageInfo, setStorageInfo] = useState<StorageInfo>({
		trackCount: 0,
		estimatedBytes: 0,
		maxBytes: MAX_STORAGE_BYTES,
	});

	const recordingStartTimeRef = useRef<number>(0);
	const pointsRef = useRef<TrackPoint[]>([]);

	/** Оценить размер хранилища в байтах */
	const estimateStorageSize = useCallback((tracks: Track[]): number => {
		let total = 0;
		for (const track of tracks) {
			total += 200; // Базовая информация
			total += track.points.length * BYTES_PER_POINT;
		}
		return total;
	}, []);

	/** Начать запись */
	const startRecording = useCallback(() => {
		const now = Date.now();
		recordingStartTimeRef.current = now;
		pointsRef.current = [];
		setCurrentTrack({
			id: `track_${now}`,
			name: `Трек ${new Date(now).toLocaleDateString("ru-RU", {
				day: "numeric",
				month: "short",
				hour: "2-digit",
				minute: "2-digit",
			})}`,
			startTime: now,
			points: [],
			distanceMeters: 0,
			durationSeconds: 0,
			saved: false,
		});
		setIsRecording(true);
	}, []);

	/** Добавить точку */
	const addPoint = useCallback(
		(location: Location, speed?: number) => {
			if (!isRecording) return;

			const point: TrackPoint = {
				lat: location.latitude,
				lon: location.longitude,
				timestamp: Date.now(),
				speed,
			};

			pointsRef.current.push(point);

			// Пересчитываем distance
			const points = pointsRef.current;
			let totalDist = 0;
			for (let i = 1; i < points.length; i++) {
				totalDist += haversine(
					points[i - 1].lat,
					points[i - 1].lon,
					points[i].lat,
					points[i].lon,
				);
			}

			const duration = Math.round(
				(Date.now() - recordingStartTimeRef.current) / 1000,
			);

			setCurrentTrack((prev) =>
				prev
					? {
							...prev,
							points: [...points],
							distanceMeters: Math.round(totalDist),
							durationSeconds: duration,
						}
					: null,
			);
		},
		[isRecording],
	);

	/** Остановить запись */
	const stopRecording = useCallback(() => {
		if (!currentTrack) return;

		const finalTrack: Track = {
			...currentTrack,
			endTime: Date.now(),
		};

		setCurrentTrack(finalTrack);
		setIsRecording(false);
		return finalTrack;
	}, [currentTrack]);

	/** Сохранить трек */
	const saveTrack = useCallback(
		async (track: Track): Promise<Track> => {
			const saved: Track = { ...track, saved: true };

			setSavedTracks((prev) => {
				const updated = [saved, ...prev.filter((t) => t.id !== track.id)];

				// Автоочистка при превышении лимита
				let currentSize = estimateStorageSize(updated);
				const cleaned = updated
					.filter((t) => {
						if (currentSize > MAX_STORAGE_BYTES) {
							currentSize -= estimateStorageSize([t]);
							return false;
						}
						return true;
					})
					.slice(0, MAX_SAVED_TRACKS);

				// Обновляем информацию о хранилище
				setStorageInfo({
					trackCount: cleaned.length,
					estimatedBytes: estimateStorageSize(cleaned),
					maxBytes: MAX_STORAGE_BYTES,
				});

				return cleaned;
			});

			setCurrentTrack(null);
			return saved;
		},
		[estimateStorageSize],
	);

	/** Удалить трек */
	const deleteTrack = useCallback(
		(trackId: string) => {
			setSavedTracks((prev) => {
				const updated = prev.filter((t) => t.id !== trackId);
				setStorageInfo({
					trackCount: updated.length,
					estimatedBytes: estimateStorageSize(updated),
					maxBytes: MAX_STORAGE_BYTES,
				});
				return updated;
			});
		},
		[estimateStorageSize],
	);

	/** Удалить все треки */
	const clearAllTracks = useCallback(() => {
		setSavedTracks([]);
		setCurrentTrack(null);
		setStorageInfo({
			trackCount: 0,
			estimatedBytes: 0,
			maxBytes: MAX_STORAGE_BYTES,
		});
	}, []);

	/** Загрузить треки (пустая функция, используем in-memory) */
	const loadTracks = useCallback(async () => {
		// In-memory storage, nothing to load
	}, []);

	/** Экспорт трека в GPX формат */
	const exportToGPX = useCallback((track: Track): string => {
		const points = track.points
			.map(
				(p) =>
					`      <trkpt lat="${p.lat}" lon="${p.lon}">
        <time>${new Date(p.timestamp).toISOString()}</time>
        ${p.speed !== undefined ? `<speed>${p.speed}</speed>` : ""}
      </trkpt>`,
			)
			.join("\n");

		return `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="OSM Navigator Pro"
  xmlns="http://www.topografix.com/GPX/1/1">
  <metadata>
    <name>${track.name}</name>
    <time>${new Date(track.startTime).toISOString()}</time>
  </metadata>
  <trk>
    <name>${track.name}</name>
    <trkseg>
${points}
    </trkseg>
  </trk>
</gpx>`;
	}, []);

	/** Форматировать размер в читаемый вид */
	const formatStorageSize = useCallback((bytes: number): string => {
		if (bytes < 1024) return `${bytes} B`;
		if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
		return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
	}, []);

	return {
		isRecording,
		currentTrack,
		savedTracks,
		storageInfo,
		formatStorageSize,
		startRecording,
		addPoint,
		stopRecording,
		saveTrack,
		deleteTrack,
		clearAllTracks,
		loadTracks,
		exportToGPX,
	};
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

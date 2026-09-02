/**
 * Утилиты форматирования
 */

export function formatDistance(meters: number): string {
	if (meters >= 1000) {
		return `${(meters / 1000).toFixed(1)} км`;
	}
	return `${meters} м`;
}

export function formatDuration(seconds: number): string {
	const minutes = Math.round(seconds / 60);
	if (minutes >= 60) {
		const hours = Math.floor(minutes / 60);
		const mins = minutes % 60;
		return `${hours}ч ${mins}мин`;
	}
	return `${minutes} мин`;
}

export function formatETA(seconds: number): string {
	const now = new Date();
	const arrival = new Date(now.getTime() + seconds * 1000);
	const hours = arrival.getHours().toString().padStart(2, "0");
	const mins = arrival.getMinutes().toString().padStart(2, "0");
	return `${hours}:${mins}`;
}

export function formatAddress(address?: string | null): string {
	if (!address) return "";
	// Обрезаем слишком длинные адреса
	if (address.length > 80) {
		return address.slice(0, 77) + "...";
	}
	return address;
}

export function truncateText(text: string, maxLength: number): string {
	if (text.length <= maxLength) return text;
	return text.slice(0, maxLength - 3) + "...";
}

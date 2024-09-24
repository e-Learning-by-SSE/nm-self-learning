import { format, formatDistance, intervalToDuration } from "date-fns";
import { de } from "date-fns/locale";

/**
 * Formats seconds to "hh:mm:ss" (hh will be removed if less than an hour).
 *
 * @example
 * formatSeconds(42); // "00:42"
 * formatSeconds(120); // "02:00"
 * formatSeconds(3600); // "01:00:00"
 */
export function formatSeconds(seconds: number): string {
	const hours = Math.floor(seconds / 3600);
	const minutes = Math.floor((seconds % 3600) / 60);
	const secondsLeft = seconds % 60;
	return `${hours > 0 ? `${hours}:` : ""}${
		hours > 0 ? minutes.toString().padStart(2, "0") : minutes
	}:${secondsLeft.toString().padStart(2, "0")}`;
}

export function formatDateAgo(date: Date | string | number) {
	return formatDistance(new Date(date), Date.now(), {
		addSuffix: true,
		locale: de
	});
}

export function formatTimeIntervalToString(ms: number): string {
	const duration = intervalToDuration({ start: 0, end: ms });

	const { days, hours, minutes } = duration;

	let result = "";

	if (days && days > 0) {
		result += `${days} ${days > 1 ? "Tage" : "Tag"}`;
	}

	if (hours && hours > 0) {
		if (result) result += " und ";
		result += `${hours} ${hours > 1 ? "Stunden" : "Stunde"}`;
	}

	if (minutes && minutes > 0) {
		if (result) result += " und ";
		result += `${minutes} ${minutes > 1 ? "Minuten" : "Minute"}`;
	}
	return result || "0 Minuten";
}

export function adaptiveTimeSpan(ms: number): string {
	const totalMinutes = Math.floor(ms / 60000);
	const totalHours = Math.floor(totalMinutes / 60);
	const days = Math.floor(totalHours / 24);
	const hours = totalHours % 24;
	const minutes = totalMinutes % 60;

	if (days > 0) {
		if (days === 1) {
			return `Vor einem Tag`;
		}
		return `Vor ${days} Tagen`;
	}

	if (hours > 0) {
		if (hours > 6) {
			return `Vor ${hours} Stunden`;
		}
		return `Vor ${hours} Stunden`;
	}

	if (minutes > 0) {
		if (minutes === 1) {
			return `Vor einer Minute`;
		}
		return `Vor ${minutes} Minuten`;
	}

	return "Jetzt";
}

export function formatDateToString(date: Date): string {
	return format(date, "dd.MM.yyyy");
}

export function formatDateToGermanDate(date: Date): string {
	return format(date, "Pp", { locale: de });
}

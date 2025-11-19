import { formatDistance, intervalToDuration } from "date-fns";
import { de } from "date-fns/locale";
import { formatInTimeZone } from "date-fns-tz";

/**
 * Formats seconds to "hh:mm:ss" (hh will be removed if less than an hour).
 *
 * @example
 * formatSeconds(42); // "00:42"
 * formatSeconds(120); // "02:00"
 * formatSeconds(3600); // "01:00:00"
 */
export function formatSeconds(seconds: number): string {
	if (Number.isNaN(seconds) || seconds < 0) return "";
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

	const { years, months, days, hours, minutes } = duration;

	let result = "";

	if (years && years > 0) {
		result += `${years} ${years > 1 ? "Jahre" : "Jahr"}`;
	}

	if (months && months > 0) {
		if (result) result += " ";
		result += `${months} ${months > 1 ? "Monate" : "Monat"}`;
	}

	if (days && days > 0) {
		if (result) result += " ";
		result += `${days} ${days > 1 ? "Tage" : "Tag"}`;
	}

	if (hours && hours > 0) {
		if (result) result += " ";
		result += `${hours} ${hours > 1 ? "Stunden" : "Stunde"}`;
	}

	if (minutes && minutes > 0) {
		if (result) result += " ";
		result += `${minutes} ${minutes > 1 ? "Minuten" : "Minute"}`;
	}
	return result || "0 Minuten";
}

export function formatDateStringShort(date: Date): string {
	return formatInTimeZone(date, "Europe/Berlin", "dd.MM.yyyy", { locale: de });
}

export function formatDateString(date: Date, format: string): string {
	return formatInTimeZone(date, "Europe/Berlin", format, { locale: de });
}

export function formatDateStringFull(date: Date): string {
	return formatInTimeZone(date, "Europe/Berlin", "Pp", { locale: de });
}

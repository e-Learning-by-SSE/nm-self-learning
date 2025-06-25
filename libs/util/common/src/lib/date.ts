import { differenceInDays, formatDistance, intervalToDuration, startOfDay } from "date-fns";
import { formatInTimeZone, toZonedTime } from "date-fns-tz";
import { de } from "date-fns/locale";

export const DISPLAY_TIMEZONE = "Europe/Berlin";

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

export function getDifferenceInGermanDays(laterDate: Date, earlierDate: Date): number {
	const laterGerman = toZonedTime(laterDate, DISPLAY_TIMEZONE);
	const earlierGerman = toZonedTime(earlierDate, DISPLAY_TIMEZONE);

	return differenceInDays(startOfDay(laterGerman), startOfDay(earlierGerman));
}
export function formatDateStringShort(date: Date): string {
	return formatInTimeZone(date, DISPLAY_TIMEZONE, "dd.MM.yyyy", { locale: de });
}

export function formatDateString(date: Date, format: string): string {
	return formatInTimeZone(date, DISPLAY_TIMEZONE, format, { locale: de });
}

export function formatDateStringFull(date: Date): string {
	return formatInTimeZone(date, DISPLAY_TIMEZONE, "Pp", { locale: de });
}

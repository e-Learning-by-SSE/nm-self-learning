import { differenceInDays, formatDistanceToNow, intervalToDuration, startOfDay } from "date-fns";
import { formatInTimeZone, toZonedTime } from "date-fns-tz";
import { de, enUS } from "date-fns/locale";
import type { TFunction } from "i18next";

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
	if (Number.isNaN(seconds) || seconds < 0) return "";
	const hours = Math.floor(seconds / 3600);
	const minutes = Math.floor((seconds % 3600) / 60);
	const secondsLeft = seconds % 60;
	return `${hours > 0 ? `${hours}:` : ""}${
		hours > 0 ? minutes.toString().padStart(2, "0") : minutes
	}:${secondsLeft.toString().padStart(2, "0")}`;
}

export function isInThePast(date: Date): boolean {
	return date.getTime() - Date.now() < 0;
}

/**
 * Formats a date as a relative (to now) time string (e.g., "vor 3 Tagen"/"3 days ago" or "in 3 Tagen"/"in 3 days").
 * @param date - The date to format
 * @param locale - The locale to use ("de" for German, "en" for English)
 * @returns A relative time string
 */
export function formatDateDistanceToNow(date: Date | string | number, locale: "de" | "en" = "de") {
	return formatDistanceToNow(new Date(date), {
		addSuffix: true,
		locale: locale === "de" ? de : enUS
	});
}

/**
 * Formats an interval down to whole minutes using the supplied common-namespace translator.
 * Unit plurals, numbers and list conjunctions follow the translator's active language.
 * Do not use for long time intervals (years, months) as it becomes unreadable.
 * @param ms
 * @param t - A translator bound to the common namespace; use useTimeIntervalFormatter in React.
 * @returns
 */
export function formatTimeIntervalToString(ms: number, t: TFunction<"common">): string {
	const duration = intervalToDuration({ start: 0, end: ms });
	const units = [
		["years", "Duration_Year"],
		["months", "Duration_Month"],
		["days", "Duration_Day"],
		["hours", "Duration_Hour"],
		["minutes", "Duration_Minute"]
	] as const;
	const parts = units
		.filter(([unit]) => (duration[unit] ?? 0) > 0)
		.map(([unit, key]) => t(key, { count: duration[unit] }));

	return parts.length ? t("Duration_List", { parts }) : t("Duration_Minute", { count: 0 });
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

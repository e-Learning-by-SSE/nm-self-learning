import { DISPLAY_TIMEZONE } from "@self-learning/util/common";

export function formatDiaryDate(date: Date | string, locale: string) {
	return new Intl.DateTimeFormat(locale, {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
		timeZone: DISPLAY_TIMEZONE
	}).format(new Date(date));
}

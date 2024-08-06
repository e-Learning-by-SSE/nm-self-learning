import { formatDistance } from "date-fns";
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

export function formatMillisecondToString(ms: number): string {
	const totalMinutes = Math.floor(ms / 60000);
	const totalHours = Math.floor(totalMinutes / 60);
	const days = Math.floor(totalHours / 24);
	const hours = totalHours % 24;
	const minutes = totalMinutes % 60;

	let result = "";

	if (days > 0) {
		result += `${days} ${days > 1 ? "Tage" : "Tag"}`;
	}

	if (hours > 0) {
		if (result) result += " und ";
		result += `${hours} ${hours > 1 ? "Stunden" : "Stunde"}`;
	}

	if (minutes > 0) {
		if (result) result += " und ";
		result += `${minutes} ${minutes > 1 ? "Minuten" : "Minute"}`;
	}

	return result || "0 Minuten";
}

export function formatDateToString(date: Date): string {
	const day = String(date.getDate()).padStart(2, "0");
	const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-based
	const year = date.getFullYear();
	return `${day}.${month}.${year}`;
}

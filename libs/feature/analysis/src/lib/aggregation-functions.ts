import { intervalToDuration } from "date-fns";

export type NumericProperty<T> = {
	[K in keyof T]: T[K] extends number ? K : never;
}[keyof T];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type MetricData = Record<string, any> & { createdAt: string };

/**
 * Adapted function to compute the week of the year.
 * However, usually IsoWeek will start the week by Thursday, this function
 * starts a week by Monday.
 * @param date The date to compute the week
 * @returns year-week
 * @see https://weeknumber.com/how-to/javascript
 */
function getWeek(date: Date): string {
	const tempDate = new Date(date.getTime());
	tempDate.setUTCHours(0, 0, 0, 0);
	tempDate.setUTCDate(tempDate.getUTCDate() + 1 - (tempDate.getUTCDay() || 7));
	const yearStart = new Date(Date.UTC(tempDate.getUTCFullYear(), 0, 1));
	const weekNo = Math.ceil(((tempDate.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
	return `${tempDate.getUTCFullYear()}-W${weekNo.toString().padStart(2, "0")}`;
}

export function sumByDate<T extends MetricData>(data: T[], key: NumericProperty<T>) {
	return data.reduce(
		(acc, event) => {
			const date = new Date(event.createdAt).toISOString().split("T")[0]; // Extract the YYYY-MM-DD part
			let prevValue = acc[date] ?? 0;
			prevValue += event[key];
			acc[date] = prevValue;
			return acc;
		},
		{} as Record<string, number>
	);
}

export function sumByWeek<T extends MetricData>(data: T[], key: NumericProperty<T>) {
	return data.reduce(
		(acc, event) => {
			const week = getWeek(new Date(event.createdAt));
			let prevValue = acc[week] ?? 0;
			prevValue += event[key];
			acc[week] = prevValue;
			return acc;
		},
		{} as Record<string, number>
	);
}

export function toInterval(ms: number) {
	const { hours, minutes, seconds } = intervalToDuration({ start: 0, end: ms });
	return `${String(hours ?? 0).padStart(2, "0")}:${String(minutes ?? 0).padStart(2, "0")}:${String(seconds ?? 0).padStart(2, "0")}`;
}

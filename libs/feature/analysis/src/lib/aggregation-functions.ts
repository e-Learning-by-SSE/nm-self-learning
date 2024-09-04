import { intervalToDuration, format } from "date-fns";

export type NumericProperty<T> = {
	[K in keyof T]: T[K] extends number ? K : never;
}[keyof T];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type MetricData = Record<string, any> & { createdAt: string };

function sumUpByFormat<T extends MetricData>(
	data: T[],
	key: NumericProperty<T>,
	dateFormat: string
) {
	const groupedTotals = data.reduce(
		(acc, event) => {
			const grouped = format(new Date(event.createdAt), dateFormat);

			// Initialize the grouped date key if it doesn't exist
			if (!acc[grouped]) {
				acc[grouped] = 0;
			}

			// Add the amount to the corresponding range
			acc[grouped] += event[key];
			return acc;
		},
		{} as Record<string, number>
	);

	// Convert the grouped totals object to an array of objects
	return Object.keys(groupedTotals).map(group => ({
		date: group,
		value: groupedTotals[group]
	}));
}

export function sumByDate<T extends MetricData>(data: T[], key: NumericProperty<T>) {
	return sumUpByFormat(data, key, "yyyy-MM-dd");
}

export function sumByWeek<T extends MetricData>(data: T[], key: NumericProperty<T>) {
	return sumUpByFormat(data, key, "yyyy-'W'II");
}

// Function to sum amounts by month
export function sumByMonth<T extends MetricData>(data: T[], key: NumericProperty<T>) {
	return sumUpByFormat(data, key, "yyyy-MM");
}

export function toInterval(ms: number) {
	const { hours, minutes, seconds } = intervalToDuration({ start: 0, end: ms });
	return `${String(hours ?? 0).padStart(2, "0")}:${String(minutes ?? 0).padStart(2, "0")}:${String(seconds ?? 0).padStart(2, "0")}`;
}

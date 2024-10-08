import { intervalToDuration, format, parse, isBefore } from "date-fns";
import { MetricResult } from "./metrics";

export type NumericProperty<T> = {
	[K in keyof T]: T[K] extends number ? K : never;
}[keyof T];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type MetricData = Record<string, any> & { createdAt: Date };

// function sumUpByFormat<T extends MetricData>(
// 	data: T[],
// 	key: NumericProperty<T>,
// 	dateFormat: string
// ) {
// 	const groupedTotals = data.reduce(
// 		(acc, event) => {
// 			const grouped = format(event.createdAt, dateFormat);

// 			// Initialize the grouped date key if it doesn't exist
// 			if (!acc[grouped]) {
// 				acc[grouped] = 0;
// 			}

// 			// Add the amount to the corresponding range
// 			acc[grouped] += event[key];
// 			return acc;
// 		},
// 		{} as Record<string, number>
// 	);

// 	// Convert the grouped totals object to an array of objects
// 	return Object.keys(groupedTotals).map(group => ({
// 		date: group,
// 		value: groupedTotals[group]
// 	}));
// }

function sumUpByFormatMultiple(data: MetricResult[], dateFormat: string) {
	const groupedTotals: Record<string, MetricResult> = {};

	data.forEach(event => {
		const grouped = format(event.createdAt, dateFormat);

		// Initialize the grouped date key if it doesn't exist
		if (!groupedTotals[grouped]) {
			groupedTotals[grouped] = {
				createdAt: parse(grouped, dateFormat, new Date()),
				values: {}
			};
		}

		// Add the amount to the corresponding range
		Object.keys(event.values).forEach(key => {
			if (key !== "createdAt") {
				if (!groupedTotals[grouped].values[key]) {
					groupedTotals[grouped].values[key] = 0;
				}
				groupedTotals[grouped].values[key] += event.values[key];
			}
		});
	});

	return Object.values(groupedTotals);
}

export function sumByDate(data: MetricResult[]) {
	return sumUpByFormatMultiple(data, "yyyy-MM-dd");
}

export function sumByWeek(data: MetricResult[]) {
	// RRRR: ISO year (the year associated with the ISO week number)
	// II: ISO week number
	return sumUpByFormatMultiple(data, "RRRR-'W'II");
}

// Function to sum amounts by month
export function sumByMonth(data: MetricResult[]) {
	return sumUpByFormatMultiple(data, "yyyy-MM");
}

export function toInterval(ms: number) {
	const { hours, minutes, seconds } = intervalToDuration({ start: 0, end: ms });
	return `${String(hours ?? 0).padStart(2, "0")}:${String(minutes ?? 0).padStart(2, "0")}:${String(seconds ?? 0).padStart(2, "0")}`;
}

export function getSemester(date: Date) {
	const year = date.getFullYear();

	// Semester 1 starts on April 1st and ends on September 30th
	const semester1Start = new Date(year, 3, 1); // April 1st
	const semester2Start = new Date(year, 9, 1); // October 1st

	if (isBefore(date, semester1Start)) {
		// Before April 1st -> Belongs to semester 2 of the previous year
		return {
			start: new Date(year - 1, 9, 1),
			end: new Date(year, 2, 31)
		};
	} else if (isBefore(date, semester2Start)) {
		// Between April 1st and September 30th -> Semester 1 of the current year
		return {
			start: semester1Start,
			end: new Date(year, 8, 30)
		};
	} else {
		// From October 1st -> Semester 2 of the current year
		return {
			start: semester2Start,
			end: new Date(year + 1, 2, 31)
		};
	}
}

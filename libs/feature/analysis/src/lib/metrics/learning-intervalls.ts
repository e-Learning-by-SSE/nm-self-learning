import { UserEvent } from "@self-learning/database";
import { EventTypeKeys } from "@self-learning/types";
import { addHours, startOfHour, format, addMilliseconds, isBefore, addDays } from "date-fns";

export type Interval = {
	start: Date;
	end: Date;
};

export type HeatmapEntry = {
	time: number;
	day: string;
	v: number;
};

// Finite events after which we do not extend the interval until the timeout
const EVENT_ENDINGS: EventTypeKeys[] = [
	"USER_LOGOUT",
	"COURSE_STOP",
	"LESSON_EXIT",
	"LESSON_COMPLETE",
	"LESSON_VIDEO_END",
	"LESSON_VIDEO_STOP"
] as const;

export function eventsToIntervalls(events: UserEvent[], timeout: number): Interval[] {
	if (events.length === 0) return [];

	const intervals: Interval[] = [];
	let currentInterval: Interval = { start: events[0].createdAt, end: events[0].createdAt };

	for (let i = 1; i < events.length; i++) {
		const currentEvent = events[i];
		const previousEvent = events[i - 1];

		// Calculate the time difference between the current and previous date
		const timeDifference = currentEvent.createdAt.getTime() - previousEvent.createdAt.getTime();

		if (timeDifference <= timeout) {
			// Extend the current interval if the time difference is within the timeout
			currentInterval.end = currentEvent.createdAt;
		} else {
			const lastAction = previousEvent.type;
			if (!EVENT_ENDINGS.includes(lastAction as EventTypeKeys)) {
				// Assume that the user was active until the timeout and closed the window without an event
				currentInterval.end = addMilliseconds(currentInterval.end, timeout);
			}

			// Push the completed interval and start a new one
			intervals.push(currentInterval);
			currentInterval = { start: currentEvent.createdAt, end: currentEvent.createdAt };
		}
	}

	// Push the last interval
	if (currentInterval.start !== currentInterval.end) {
		intervals.push(currentInterval);
	}

	return intervals;
}

function convertToHeatmapData(intervals: Interval[]): HeatmapEntry[] {
	const heatmapData: HeatmapEntry[] = [];

	intervals.forEach(interval => {
		const start = interval.start;
		const end = interval.end;

		let current = start;

		while (current < end) {
			// Get the start of the next hour
			const nextHour = addHours(startOfHour(current), 1);

			// Calculate how much time is spent in the current hour
			const hourEnd = nextHour < end ? nextHour : end;
			const timeInHour = (hourEnd.getTime() - current.getTime()) / (1000 * 60 * 60); // Time in hours

			// Append to heatmap data
			heatmapData.push({
				day: format(current, "EEEE"), // Get the day of the week
				time: current.getHours(),
				v: timeInHour
			});

			// Move to the next hour
			current = nextHour;
		}
	});

	return heatmapData;
}

export type RangeDefinition = {
	start: Date;
	end: Date;
	format: string;
};

function daysInRange(range: RangeDefinition, matchValue: string) {
	let count = 0;
	let currentDate = range.start;

	// Iterate through the range, checking if the formatted date matches the desired format value
	while (isBefore(currentDate, range.end) || currentDate.getTime() === range.end.getTime()) {
		if (format(currentDate, range.format) === matchValue) {
			count++;
		}
		currentDate = addDays(currentDate, 1); // Move to the next day
	}

	return count;
}

function average(heatmapData: HeatmapEntry[], rangeDef?: RangeDefinition): HeatmapEntry[] {
	// Group entries by day and time
	const groupedData: { [key: string]: { total: number; count: number } } = {};

	heatmapData.forEach(entry => {
		// Construct a unique key for (day, time)
		const key = `${entry.day}-${entry.time}`;

		// Accumulate value totals and counts
		if (!groupedData[key]) {
			groupedData[key] = { total: 0, count: 0 };
		}
		groupedData[key].total += entry.v;
		groupedData[key].count += 1;
	});

	// Compute the range of days
	const nDays: Record<string, number> = {};
	if (rangeDef) {
		for (const entry of heatmapData) {
			if (!nDays[entry.day]) {
				nDays[entry.day] = daysInRange(rangeDef, entry.day);
			}
		}
	}

	// Compute average for each group
	const averagedData: HeatmapEntry[] = Object.keys(groupedData).map(key => {
		const [day, time] = key.split("-");
		const group = groupedData[key];
		const count = nDays[day] || group.count;
		return {
			time: Number.parseInt(time),
			day: day,
			v: group.total / count
		};
	});

	return averagedData;
}

export function computeHeatmapData(intervals: Interval[], rangeDef?: RangeDefinition) {
	const heatmapData = convertToHeatmapData(intervals);
	return average(heatmapData, rangeDef);
}

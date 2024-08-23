import { ChartOptions, ChartTypeRegistry, ScaleOptionsByType } from "chart.js";
import { LearningActivity, LessonContentMediaType } from "@self-learning/types";
import { DeepPartial } from "chart.js/dist/types/utils";
import { format } from "date-fns";
import { isTruthy } from "@self-learning/util/common";
import { LearningAnalyticsType } from "@self-learning/api";

/**
 * This file contains auxiliary functions and constants for the metrics,
 * which should NOT be exported outside of the library.
 * @package @self-learning/learning-analytics
 * @author Fabian Kneer
 * @author El-Sharkawy
 */

/**
 * The function computes the preferred media type and the number of media type changes based on the mediaChangeCount object.
 *
 * @param activity The activity to get the media type from
 * @returns
 */
export function getMediaType(activity: LearningActivity) {
	const { mediaChangeCount } = activity;
	type MediaChangeCount = typeof mediaChangeCount;
	const preferredMediaType = Object.keys(mediaChangeCount).reduce((maxKey, key) => {
		return mediaChangeCount[key as keyof MediaChangeCount] >
			mediaChangeCount[maxKey as keyof MediaChangeCount]
			? key
			: maxKey;
	}, "video" as keyof MediaChangeCount);

	const numberOfChangesMediaType = Object.values(mediaChangeCount).reduce(
		(sum, value) => sum + value,
		0
	);

	return { numberOfChangesMediaType, preferredMediaType };
}

/**
 * Chart options to define the default X-axis format for the line chart:
 * - Unit: days
 * - Tooltip format: dd.MM.yyyy
 */
export const X_AXIS_FORMAT: DeepPartial<ScaleOptionsByType<ChartTypeRegistry["line"]["scales"]>> = {
	type: "time",
	time: {
		parser: "dd.MM.yyyy",
		unit: "day",
		tooltipFormat: "dd.MM.yyyy"
	}
};

/**
 * Chart options to define the default X-axis format for the stacked bar chart:
 * - Unit: days
 * - Tooltip format: dd.MM.yyyy
 */
export const X_AXIS_FORMAT_STACKED: DeepPartial<
	ScaleOptionsByType<ChartTypeRegistry["line"]["scales"]>
> = {
	type: "time",
	time: {
		parser: "dd.MM.yyyy",
		unit: "day",
		tooltipFormat: "dd.MM.yyyy"
	},
	stacked: true
};

/**
 * Default line chart options that should be used for a corporate design among the metrics,
 * unless further options needed.
 */
export const DEFAULT_LINE_CHART_OPTIONS: ChartOptions<"line"> = {
	scales: {
		x: X_AXIS_FORMAT,
		y: {}
	}
};

/**
 * Default line chart options that should be used for a corporate design among the metrics,
 * unless further options needed.
 */
export const DEFAULT_BAR_CHART_OPTIONS: ChartOptions<"bar"> = {
	scales: {
		x: X_AXIS_FORMAT_STACKED,
		y: { stacked: true }
	}
};

/**
 * Auxillary to force that only keys of a specific type may be passed as parameter to a function.
 */
export type KeysOfType<T, TProp> = {
	[P in keyof T]: T[P] extends TProp ? P : never;
}[keyof T];

/**
 * Type Guard to check if a string is a supported LessonContentMediaType to map them back
 * the display name function of its library.
 * @param value The content description string to check.
 * @returns The string type representation of the LessonContentMediaType if it is valid, otherwise noting.
 */
export function isLessonContentMediaType(value: string): value is LessonContentMediaType {
	return ["video", "article", "pdf", "iframe"].includes(value);
}

/**
 * Metric that computes the average uses of a numeric property.
 *
 * @param cumulate a list of learning activities to cumulate the average for
 * @param property numeric prop of the learning activity to cumulate
 * @returns uses / session as string with 1 decimal place
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function averageUsesPerSession<T extends { [key: string]: any }>(
	cumulate: T[],
	property: KeysOfType<T, number | null>
) {
	const sum = cumulate
		.filter(isTruthy)
		.reduce((acc, curr) => (curr[property] ? acc + curr[property] : acc), 0);
	return cumulate.length > 0 ? (sum / cumulate.length).toFixed(1) : "0";
}

type Activities = LearningAnalyticsType[number]["activities"];

export function preferredValuePerSession( // change name
	activities: Activities,
	property: keyof Activities[number]
) {
	const values = new Map<string, number>();
	activities.forEach(activity => {
		const value = activity[property];
		if (value)
			if (values.has(String(value)))
				values.set(String(value), (values.get(String(value)) ?? 0) + 1);
			else values.set(String(value), 1);
	});
	return String(maxKey(values));
}

/**
 * Returns the key with the highest value in a map.
 * @param map A map that stores numbers (e.g., occurrences per key)
 * @returns The key with the highest value.
 */
export function maxKey<T>(map: Map<T, number>) {
	if (map.size > 0) return Array.from(map).sort((a, b) => (a[1] > b[1] ? -1 : 1))[0][0];
	else return "Keine Daten vorhanden";
}

/**
 * Returns the avg.
 * @param sum The sum of all values.
 * @param count The number of values.
 * @param digits The number of decimal places.
 * @returns The avg.
 */
export function avg(sum: number, count: number, digits: number) {
	return count > 0 ? (Math.round((sum / count) * 10 * digits) / 10) * digits : 0;
}

/**
 * Formats the date of a learning analytics session to a human readable format (day format).
 * @param date The date to format
 * @returns A format in form of: dd.MM.yyyy
 */
export function formatDate(date: Date): string {
	// Unfortunately, date objects of the learning analytics are no real Date objects,
	// and thus must be converted to a Date object before formatting.
	return format(new Date(date), "dd.MM.yyyy");
}

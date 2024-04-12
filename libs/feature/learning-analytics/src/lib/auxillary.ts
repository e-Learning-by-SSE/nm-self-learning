import { ChartOptions, ChartTypeRegistry, ScaleOptionsByType } from "chart.js";
import { LearningAnalyticsType, SessionType } from "./learning-analytics";
import { LessonContentMediaType } from "@self-learning/types";
import { DeepPartial } from "chart.js/dist/types/utils";
import { format } from "date-fns";

/**
 * This file contains auxiliary functions and constants for the metrics,
 * which should NOT be exported outside of the library.
 * @package @self-learning/learning-analytics
 * @author Fabian Kneer
 * @author El-Sharkawy
 */

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
 * Auxillary to force that only keys of a specific type may be passed as parameter to a function.
 */
type KeysOfType<T, TProp> = { [P in keyof T]: T[P] extends TProp ? P : never }[keyof T];

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
 * Metric that computes the average uses of a numeric property per session, e.g.,
 * how many hints were used per session.
 * @param lASession The learning analytic session data
 * @param property a numeric property a session to compute the average for
 * @returns uses / session
 */
export function averageUsesPerSession(
	lASession: LearningAnalyticsType,
	property: KeysOfType<SessionType, number | null>
) {
	let nUses = 0;
	let nSessions = 0;
	lASession
		.flatMap(session => session.learningAnalytics)
		.forEach(learningAnalytics => {
			const value = learningAnalytics[property];
			if (value) {
				nUses = nUses + value;
				nSessions = nSessions + 1;
			}
		});

	//TODO SE: @ Fabian Kneer: Please explain why * 10 / 10
	return nSessions > 0 ? "" + Math.round((nUses / nSessions) * 10) / 10 : "0";
}

/**
 * Returns the key with the highest value in a map.
 * @param map A map that stores numbers (e.g., occurrences per key)
 * @returns The key with the highest value.
 */
export function maxKey<T>(map: Map<T, number>) {
	return Array.from(map).sort((a, b) => (a[1] > b[1] ? -1 : 1))[0][0];
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
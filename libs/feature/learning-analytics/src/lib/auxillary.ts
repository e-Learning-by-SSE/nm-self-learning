import { ChartOptions } from "chart.js";
import { LearningAnalyticsType, SessionType } from "./learning-analytics";
import { LessonContentMediaType } from "@self-learning/types";

export const defaultChartOption: ChartOptions<"line"> = {
	scales: {
		x: {
			type: "time",
			time: {
				parser: "dd.MM.yyyy",
				unit: "day",
				tooltipFormat: "dd.MM.yyyy"
			}
		},
		y: {}
	}
};

type KeysOfType<T, TProp> = { [P in keyof T]: T[P] extends TProp ? P : never }[keyof T];

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

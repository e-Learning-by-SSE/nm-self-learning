import { ChartOptions } from "chart.js";
import { format, parseISO } from "date-fns";
import { LearningAnalyticsType, SessionType } from "./learning-analytics";

export const defaultChartOption: ChartOptions<"line"> = {
	scales: {
		x: {
			type: "time",
			time: {
				parser: "dd.MM.yyyy",
				unit: "day"
			},
			max: format(parseISO(new Date().toISOString()), "dd.MM.yyyy")
		},
		y: {}
	}
};

export function getHighestValue(map: Map<any, any>) {
	return Array.from(map.entries()).reduce((a, b) => (a[1] < b[1] ? b : a))[0];
}

type KeysOfType<T, TProp> = { [P in keyof T]: T[P] extends TProp ? P : never }[keyof T];

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

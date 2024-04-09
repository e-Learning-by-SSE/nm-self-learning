import { averageUsesPerSession, DEFAULT_LINE_CHART_OPTIONS, formatDate } from "../auxillary";
import { LearningAnalyticsType } from "../learning-analytics";

/**
 * The displayname of the metric (may be translated to support i18n).
 */
const METRIC_NAME = "Durchschnittliche Anzahl an Hinweisen pro Tag";

/**
 * Generates the Line Chart data for the used hints per day.
 * @param lASession The (filtered) session for which the summary is computed for.
 * @returns  Line Chart data for the used hints per day.
 */
function plotHintsPerDay(lASession: LearningAnalyticsType) {
	const out: { data: number[]; labels: string[] } = { data: [], labels: [] };
	let hints = 0;
	let count = 0;
	let lastsession = formatDate(lASession[0].start);
	let sessionStart = lastsession;
	lASession.forEach(session => {
		sessionStart = formatDate(session.start);
		if (sessionStart !== lastsession) {
			out.data.push(count > 0 ? Math.round((hints / count) * 10) / 10 : 0);
			out.labels.push(lastsession);
			lastsession = sessionStart;
			hints = 0;
			count = 0;
		}
		if (session?.learningAnalytics) {
			session?.learningAnalytics.forEach(learningAnalytics => {
				if (learningAnalytics.numberOfUsedHints != null) {
					hints = hints + learningAnalytics.numberOfUsedHints;
					count++;
				}
			});
		}
	});
	out.data.push(count > 0 ? Math.round((hints / count) * 10) / 10 : 0);
	out.labels.push(sessionStart);
	let data = null;
	if (out)
		data = {
			labels: out.labels,
			datasets: [
				{
					label: METRIC_NAME,
					fill: false,
					backgroundColor: "rgba(75,192,192,0.4)",
					pointBorderColor: "rgba(75,192,192,1)",
					pointBackgroundColor: "#fff",
					pointBorderWidth: 1,
					pointHoverRadius: 5,
					pointHoverBackgroundColor: "rgba(75,192,192,1)",
					pointHoverBorderColor: "rgba(220,220,220,1)",
					pointHoverBorderWidth: 2,
					pointRadius: 1,
					pointHitRadius: 10,
					data: out.data
				}
			]
		};
	return data;
}

export const HINTS_METRIC = {
	metric: "Hints",
	name: METRIC_NAME,
	summary: (lASession: LearningAnalyticsType) =>
		averageUsesPerSession(lASession, "numberOfUsedHints"),
	data: plotHintsPerDay,
	options: DEFAULT_LINE_CHART_OPTIONS
};

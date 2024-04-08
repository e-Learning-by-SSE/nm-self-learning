import { format, parseISO } from "date-fns";
import { averageUsesPerSession, defaultChartOption } from "../auxillary";
import { LearningAnalyticsType } from "../learning-analytics";

const METRIC_NAME = "Durchschnittliche Anzahl an Hinweisen pro Tag";

/**
 * getDataForHints()
 * Returns the average number of hints per day. The result is data for a line chart.
 *
 * lASession: learning analytic session data
 */
function getDataForHints(lASession: LearningAnalyticsType) {
	const out: { data: number[]; labels: string[] } = { data: [], labels: [] };
	let hints = 0;
	let count = 0;
	let lastsession = format(parseISO(new Date(lASession[0].start).toISOString()), "dd.MM.yyyy");
	let sessionStart = lastsession;
	lASession.forEach(session => {
		sessionStart = format(parseISO(new Date(session.start).toISOString()), "dd.MM.yyyy");
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
	data: getDataForHints,
	options: defaultChartOption
};

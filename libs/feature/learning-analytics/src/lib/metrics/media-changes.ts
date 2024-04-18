import { averageUsesPerSession, avg, DEFAULT_LINE_CHART_OPTIONS, formatDate } from "../auxillary";
import { LearningAnalyticsType } from "../learning-analytics";

/**
 * The displayname of the metric (may be translated to support i18n).
 */
const METRIC_NAME = "Durchschnittliche Anzahl an Medienwechsel pro Tag";

/**
 * Generates the Line Chart data for media changes per day.
 * @param lASession The (filtered) session for which the summary is computed for.
 * @returns  Line Chart data for media changes per day.
 */
function plotMediaChanges(lASession: LearningAnalyticsType) {
	const out: { data: number[]; labels: string[] } = { data: [], labels: [] };
	let mediaChanges = 0;
	let count = 0;
	let lastsession = formatDate(lASession[0].start);
	let sessionStart = lastsession;
	lASession.forEach(session => {
		sessionStart = formatDate(session.start);
		if (sessionStart !== lastsession) {
			out.data.push(avg(mediaChanges, count,1));
			out.labels.push(lastsession);
			lastsession = sessionStart;
			mediaChanges = 0;
			count = 0;
		}
		if (session?.learningAnalytics) {
			session?.learningAnalytics.forEach(learningAnalytics => {
				if (learningAnalytics?.numberOfChangesMediaType != null) {
					mediaChanges = mediaChanges + learningAnalytics.numberOfChangesMediaType;
					count = count + 1;
				}
			});
		}
	});
	out.data.push(avg(mediaChanges, count, 1));
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

export const MEDIA_CHANGES_METRIC = {
	metric: "Media Type Changes",
	name: METRIC_NAME,
	summary: (lASession: LearningAnalyticsType) =>
		averageUsesPerSession(lASession, "numberOfChangesMediaType"),
	data: plotMediaChanges,
	options: DEFAULT_LINE_CHART_OPTIONS
};

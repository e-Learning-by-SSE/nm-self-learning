import { DEFAULT_LINE_CHART_OPTIONS, formatDate } from "../auxillary";
import { LearningAnalyticsType } from "../learning-analytics";

/**
 * The displayname of the metric (may be translated to support i18n).
 */
const METRIC_NAME = "Durchschnittliche Videodauer pro Tag";

/**
 * Generates a summary that prints the average video duration in min.
 * @param lASession The (filtered) session for which the summary is computed for.
 * @returns A summary in form of: x.x min
 */
function summary(lASession: LearningAnalyticsType) {
	let duration = 0;
	let count = 0;
	lASession.forEach(session => {
		if (session?.learningAnalytics) {
			session?.learningAnalytics.forEach(learningAnalytics => {
				if (learningAnalytics?.videoStart && learningAnalytics?.videoEnd) {
					duration =
						duration +
						(new Date(learningAnalytics.videoEnd).getTime() -
							new Date(learningAnalytics.videoStart).getTime()) /
							60000;
					count = count + 1;
				}
			});
		}
	});
	return (count > 0 ? Math.round((duration / count) * 10) / 10 : 0) + " min";
}

/**
 * Generates the Line Chart data for the average video duration in min per day.
 * @param lASession The (filtered) session for which the summary is computed for.
 * @returns  Line Chart data for the average video duration in min per day
 */
function plotVideoDuration(lASession: LearningAnalyticsType) {
	const out: { data: number[]; labels: string[] } = { data: [], labels: [] };
	let duration = 0;
	let count = 0;
	let lastsession = formatDate(lASession[0].start);
	let sessionStart = lastsession;
	lASession.forEach(session => {
		sessionStart = formatDate(session.start);
		if (sessionStart !== lastsession) {
			out.data.push(count > 0 ? Math.round((duration / count) * 10) / 10 : 0);
			out.labels.push(lastsession);
			lastsession = sessionStart;
			duration = 0;
			count = 0;
		}
		if (session?.learningAnalytics) {
			session?.learningAnalytics.forEach(learningAnalytics => {
				if (learningAnalytics?.videoStart && learningAnalytics?.videoEnd) {
					duration =
						(new Date(learningAnalytics.videoEnd).getTime() -
							new Date(learningAnalytics.videoStart).getTime()) /
						60000;
					count = count + 1;
				}
			});
		}
	});
	out.data.push(count > 0 ? Math.round((duration / count) * 10) / 10 : 0);
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

export const VIDEO_DURATION_METRIC = {
	metric: "Video Duration",
	name: METRIC_NAME,
	summary: summary,
	data: plotVideoDuration,
	options: DEFAULT_LINE_CHART_OPTIONS
};

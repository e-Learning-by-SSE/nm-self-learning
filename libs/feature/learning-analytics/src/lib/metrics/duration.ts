import { format, parseISO } from "date-fns";
import { defaultChartOption } from "../auxillary";
import { LearningAnalyticsType } from "../learning-analytics";

const METRIC_NAME = "Durchschnittliche Lernzeit pro Tag";

/**
 * getDuration()
 * Returns the average learning duration in min.
 *
 * lASession: learning analytic session data
 */
function getDuration(lASession: LearningAnalyticsType) {
	let duration = 0;
	let count = 0;
	lASession.forEach(session => {
		if (session?.learningAnalytics) {
			session?.learningAnalytics.forEach(learningAnalytics => {
				if (learningAnalytics?.start && learningAnalytics?.end) {
					duration =
						duration +
						(new Date(learningAnalytics.end).getTime() -
							new Date(learningAnalytics.start).getTime()) /
							60000;
					count = count + 1;
				}
				if (learningAnalytics?.quizStart && learningAnalytics?.quizEnd) {
					duration =
						duration +
						(new Date(learningAnalytics.quizEnd).getTime() -
							new Date(learningAnalytics.quizStart).getTime()) /
							60000;
					count = count + 1;
				}
			});
		}
	});
	return (count > 0 ? Math.round((duration / count) * 10) / 10 : 0) + " min";
}

/**
 * getDataForDuration()
 * Returns the average learning duration in min for a day. The result is data for a line chart.
 *
 * lASession: learning analytic session data
 */
function getDataForDuration(lASession: LearningAnalyticsType) {
	const out: { data: number[]; labels: string[] } = { data: [], labels: [] };
	let count = 0;
	let duration = 0;
	let lastsession = format(parseISO(new Date(lASession[0].start).toISOString()), "dd.MM.yyyy");
	let sessionStart = lastsession;
	lASession.forEach(session => {
		sessionStart = format(parseISO(new Date(session.start).toISOString()), "dd.MM.yyyy");
		if (sessionStart !== lastsession) {
			out.data.push(count > 0 ? Math.round((duration / count) * 10) / 10 : 0);
			out.labels.push(lastsession);
			lastsession = sessionStart;
			count = 0;
			duration = 0;
		}
		if (session?.learningAnalytics) {
			session?.learningAnalytics.forEach(learningAnalytics => {
				if (learningAnalytics?.start && learningAnalytics?.end) {
					duration =
						(new Date(learningAnalytics.end).getTime() -
							new Date(learningAnalytics.start).getTime()) /
						60000;
					count = count + 1;
				}
				if (learningAnalytics?.quizStart && learningAnalytics?.quizEnd) {
					duration =
						duration +
						(new Date(learningAnalytics.quizEnd).getTime() -
							new Date(learningAnalytics.quizStart).getTime()) /
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

export const DURATION_METRIC = {
	metric: "Duration",
	name: METRIC_NAME,
	summary: getDuration,
	data: getDataForDuration,
	options: defaultChartOption
};

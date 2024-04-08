import { format, parseISO } from "date-fns";
import { defaultChartOption, getHighestValue } from "../auxillary";
import { LearningAnalyticsType } from "../learning-analytics";

const METRIC_NAME = "Bevorzugte Videogeschwindigkeit";

/**
 * Computes the average video speed.
 * @param lASession The analyzed learning session (can be filtered before)
 * @returns The average video speed
 */
function computeSummary(lASession: LearningAnalyticsType) {
	const videoSpeeds = new Map<number, number>();
	lASession.forEach(session => {
		if (session?.learningAnalytics) {
			session?.learningAnalytics.forEach(learningAnalytics => {
				if (learningAnalytics?.start && learningAnalytics?.videoSpeed != null) {
					if (videoSpeeds.has(learningAnalytics.videoSpeed))
						videoSpeeds.set(
							learningAnalytics.videoSpeed,
							(videoSpeeds.get(learningAnalytics.videoSpeed) ?? 0) + 1
						);
					else videoSpeeds.set(learningAnalytics.videoSpeed, 1);
				}
			});
		}
	});
	return "" + Array.from(videoSpeeds).sort((a, b) => (a[1] > b[1] ? -1 : 1))[0][0];
}

/**
 * getDataForVideoSpeed()
 * Returns the preferred video speed for a day. The result is data for a line chart.
 *
 * lASession: learning analytic session data
 */
function getDataForVideoSpeed(lASession: LearningAnalyticsType) {
	const out: { data: number[]; labels: string[] } = { data: [], labels: [] };
	let videoSpeeds = new Map();
	let lastsession = format(parseISO(new Date(lASession[0].start).toISOString()), "dd.MM.yyyy");
	let sessionStart = lastsession;
	lASession.forEach(session => {
		sessionStart = format(parseISO(new Date(session.start).toISOString()), "dd.MM.yyyy");
		if (sessionStart !== lastsession) {
			if (videoSpeeds.size > 0) {
				out.data.push(getHighestValue(videoSpeeds));
				out.labels.push(lastsession);
				videoSpeeds = new Map();
				lastsession = sessionStart;
			}
		}
		if (session?.learningAnalytics) {
			session.learningAnalytics.forEach(learningAnalytics => {
				if (learningAnalytics.start && learningAnalytics.videoSpeed != null) {
					if (videoSpeeds.has(learningAnalytics.videoSpeed))
						videoSpeeds.set(
							learningAnalytics.videoSpeed,
							videoSpeeds.get(learningAnalytics.videoSpeed) + 1
						);
					else videoSpeeds.set(learningAnalytics.videoSpeed, 1);
				}
			});
		}
	});
	if (videoSpeeds.size > 0) {
		out.data.push(getHighestValue(videoSpeeds));
		out.labels.push(sessionStart);
	}
	const data = {
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

export const VIDEO_SPEED_METRIC = {
	metric: "Video Speed",
	name: METRIC_NAME,
	summary: computeSummary,
	data: getDataForVideoSpeed,
	options: defaultChartOption
};

import { DEFAULT_LINE_CHART_OPTIONS, formatDate, maxKey } from "../auxillary";
import { LearningAnalyticsType } from "../learning-analytics";

/**
 * The displayname of the metric (may be translated to support i18n).
 */
const METRIC_NAME = "Bevorzugte Videogeschwindigkeit";

/**
 * Computes the average video speed.
 * @param lASession The analyzed learning session (can be filtered before)
 * @returns The average video speed: x.x
 */
function summary(lASession: LearningAnalyticsType) {
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
 * Generates the Line Chart data for the preferred video speed per day.
 * @param lASession The (filtered) session for which the summary is computed for.
 * @returns Line Chart data for the preferred video speed per day
 */
function plotPreferredVideoSpeed(lASession: LearningAnalyticsType) {
	const out: { data: number[]; labels: string[] } = { data: [], labels: [] };
	let videoSpeeds = new Map();
	let lastsession = formatDate(lASession[0].start);
	let sessionStart = lastsession;
	lASession.forEach(session => {
		sessionStart = formatDate(session.start);
		if (sessionStart !== lastsession) {
			if (videoSpeeds.size > 0) {
				out.data.push(maxKey(videoSpeeds));
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
		out.data.push(maxKey(videoSpeeds));
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
	summary: summary,
	data: plotPreferredVideoSpeed,
	options: DEFAULT_LINE_CHART_OPTIONS
};

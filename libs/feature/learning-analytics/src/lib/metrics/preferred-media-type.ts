import { format, parseISO } from "date-fns";
import { defaultChartOption, isLessonContentMediaType, maxKey } from "../auxillary";
import { LearningAnalyticsType } from "../learning-analytics";
import { getContentTypeDisplayName } from "@self-learning/types";

const METRIC_NAME = "Bevorzugter Medientyp";

/**
 * getPreferredMediaType()
 * Returns the preferred media type.
 *
 * lASession: learning analytic session data
 */
function getPreferredMediaType(lASession: LearningAnalyticsType) {
	const mediaTypes = new Map<string, number>();
	lASession.forEach(session => {
		if (session?.learningAnalytics) {
			session?.learningAnalytics.forEach(learningAnalytics => {
				if (learningAnalytics.preferredMediaType != null) {
					if (learningAnalytics?.start && learningAnalytics?.end) {
						if (
							learningAnalytics.preferredMediaType &&
							mediaTypes.has(learningAnalytics.preferredMediaType)
						)
							mediaTypes.set(
								learningAnalytics.preferredMediaType,
								(mediaTypes.get(learningAnalytics.preferredMediaType) ?? 0) + 1
							);
						else mediaTypes.set(learningAnalytics.preferredMediaType, 1);
					}
				}
			});
		}
	});

	const preferredMediaType = maxKey(mediaTypes);
	if (isLessonContentMediaType(preferredMediaType)) {
		// Translation in Types package
		return getContentTypeDisplayName(preferredMediaType);
	} else {
		return preferredMediaType;
	}
}

/**
 * getDataMediaChangesDuration()
 * Returns the average learning duration in min for a day. The result is data for a line chart.
 *
 * lASession: learning analytic session data
 */
function getDataForPreferredMediaType(lASession: LearningAnalyticsType) {
	const out: { video: number[]; pdf: number[]; article: number[]; iframe: number[] } = {
		video: [],
		article: [],
		iframe: [],
		pdf: []
	};
	const labels: string[] = [];
	let lastsession = format(parseISO(new Date(lASession[0].start).toISOString()), "dd.MM.yyyy");
	let sessionStart = lastsession;
	let mediaTypes = new Map();
	lASession.forEach(session => {
		if (session?.learningAnalytics) {
			sessionStart = format(parseISO(new Date(session.start).toISOString()), "dd.MM.yyyy");
			if (sessionStart !== lastsession) {
				if (mediaTypes.size > 0) {
					out.video.push(mediaTypes.get("video") ? mediaTypes.get("video") : 0);
					out.article.push(mediaTypes.get("article") ? mediaTypes.get("article") : 0);
					out.pdf.push(mediaTypes.get("pdf") ? mediaTypes.get("pdf") : 0);
					out.iframe.push(mediaTypes.get("iframe") ? mediaTypes.get("iframe") : 0);
					labels.push(lastsession);
					lastsession = sessionStart;
					mediaTypes = new Map();
				}
			}
			session?.learningAnalytics.forEach(learningAnalytics => {
				if (learningAnalytics?.start) {
					if (mediaTypes.has(learningAnalytics.preferredMediaType))
						mediaTypes.set(
							learningAnalytics.preferredMediaType,
							mediaTypes.get(learningAnalytics.preferredMediaType) + 1
						);
					else mediaTypes.set(learningAnalytics.preferredMediaType, 1);
				}
			});
		}
	});
	if (mediaTypes.size > 0) {
		out.video.push(mediaTypes.get("video") ? mediaTypes.get("video") : 0);
		out.article.push(mediaTypes.get("article") ? mediaTypes.get("article") : 0);
		out.pdf.push(mediaTypes.get("pdf") ? mediaTypes.get("pdf") : 0);
		out.iframe.push(mediaTypes.get("iframe") ? mediaTypes.get("iframe") : 0);
		labels.push(sessionStart);
	}
	const data = {
		labels: labels,
		datasets: [
			{
				label: "Video",
				fill: false,
				backgroundColor: "#003f5c",
				borderColor: "#003f5c",
				pointBorderColor: "#003f5c",
				pointBackgroundColor: "#fff",
				pointBorderWidth: 1,
				pointHoverRadius: 5,
				pointHoverBackgroundColor: "#003f5c",
				pointHoverBorderColor: "rgba(220,220,220,1)",
				pointHoverBorderWidth: 2,
				pointRadius: 1,
				pointHitRadius: 10,
				data: out.video
			},
			{
				label: "PDF",
				fill: false,
				backgroundColor: "#7a5195",
				borderColor: "#7a5195",
				pointBorderColor: "#7a5195",
				pointBackgroundColor: "#fff",
				pointBorderWidth: 1,
				pointHoverRadius: 5,
				pointHoverBackgroundColor: "#7a5195",
				pointHoverBorderColor: "rgba(220,220,220,1)",
				pointHoverBorderWidth: 2,
				pointRadius: 1,
				pointHitRadius: 10,
				data: out.pdf
			},
			{
				label: "Webseite",
				fill: false,
				backgroundColor: "#ef5675",
				borderColor: "#ef5675",
				pointBorderColor: "#ef5675",
				pointBackgroundColor: "#fff",
				pointBorderWidth: 1,
				pointHoverRadius: 5,
				pointHoverBackgroundColor: "#ef5675",
				pointHoverBorderColor: "rgba(220,220,220,1)",
				pointHoverBorderWidth: 2,
				pointRadius: 1,
				pointHitRadius: 10,
				data: out.iframe
			},
			{
				label: "Artikel",
				fill: false,
				backgroundColor: "#ffa600",
				borderColor: "#ffa600",
				pointBorderColor: "#ffa600",
				pointBackgroundColor: "#fff",
				pointBorderWidth: 1,
				pointHoverRadius: 5,
				pointHoverBackgroundColor: "#ffa600",
				pointHoverBorderColor: "rgba(220,220,220,1)",
				pointHoverBorderWidth: 2,
				pointRadius: 1,
				pointHitRadius: 10,
				data: out.article
			}
		]
	};
	return data;
}

export const PREFERRED_MEDIA_TYPE_METRIC = {
	metric: "Preferred Media Type",
	name: METRIC_NAME,
	summary: getPreferredMediaType,
	data: getDataForPreferredMediaType,
	options: defaultChartOption
};

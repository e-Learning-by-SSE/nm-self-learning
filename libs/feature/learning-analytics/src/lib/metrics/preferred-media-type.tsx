import {
	DEFAULT_LINE_CHART_OPTIONS,
	X_AXIS_FORMAT,
	formatDate,
	isLessonContentMediaType,
	preferredValuePerSession
} from "../auxillary";
import { LearningAnalyticsType } from "@self-learning/types";
import { getContentTypeDisplayName } from "@self-learning/types";
import { UNARY_METRICS } from "./metrics";

import { Chart as ChartJS, registerables } from "chart.js";
import { Bar, Line } from "react-chartjs-2";
import "chartjs-adapter-date-fns";
import { HTMLAttributes } from "react";

ChartJS.register(...registerables);

function createDataSeries(data: number[], label: string, color: string) {
	return {
		label: isLessonContentMediaType(label) ? getContentTypeDisplayName(label) : label,
		fill: false,
		backgroundColor: color,
		borderColor: color,
		pointBorderColor: color,
		pointBackgroundColor: "#fff",
		pointBorderWidth: 1,
		pointHoverRadius: 5,
		pointHoverBackgroundColor: color,
		pointHoverBorderColor: "rgba(220,220,220,1)",
		pointHoverBorderWidth: 2,
		pointRadius: 1,
		pointHitRadius: 10,
		data: data
	};
}

/**
 * Generates the Line Chart data for the used media types per day.
 * @param lASession The (filtered) session for which the summary is computed for.
 * @returns  Line Chart data for the used media types per day.
 */
function plotPreferredMediaType(lASession: LearningAnalyticsType) {
	const out: { video: number[]; pdf: number[]; article: number[]; iframe: number[] } = {
		video: [],
		article: [],
		iframe: [],
		pdf: []
	};
	const labels: string[] = [];
	let lastsession = formatDate(lASession[0].start);
	let sessionStart = lastsession;
	let mediaTypes = new Map();
	lASession.forEach(session => {
		if (session?.learningAnalytics) {
			sessionStart = formatDate(session.start);
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
			// #003f5c
			createDataSeries(out.video, "video", "#5b9bd5"),
			// #ffa600"
			createDataSeries(out.article, "article", "#0dbb7f"),
			// #7a5195
			createDataSeries(out.pdf, "pdf", "#f1f69e"),
			// #ef5675
			createDataSeries(out.iframe, "iframe", "#f13d57")
		]
	};
	return data;
}

/**
 * Creates a consistent skeleton for the metric "Preferred Media Type".
 * @param mediaName The media type which is preferred by the user.
 * @param emphasisStyle className to emphasize the summary (e.g. font-bold or italic).
 * @param children The chart to display the metric.
 * @returns The component to display the chart and the summary.
 */
function PreferredMediaTypeLayout({
	mediaName,
	emphasisStyle,
	children
}: {
	emphasisStyle?: HTMLAttributes<"span">["className"];
	mediaName: string;
	children: React.ReactNode;
}) {
	const style = emphasisStyle ? emphasisStyle : "";

	return (
		<>
			<h1 className="text-5xl">{UNARY_METRICS["PreferredMediaType"]}</h1>
			<span className="text-xl">
				{`Du bevorzugst `}
				<span className={style}>{mediaName}</span>
				{`.`}
			</span>
			{children}
		</>
	);
}

/**
 * Component to display the metric "Preferred Media Type" in the Learning Analytics Dashboard.
 * @param lASession The (filtered) session for which the metric is computed for.
 * @param emphasisStyle className to emphasize the summary (e.g. font-bold or italic).
 * @returns The component to display the metric "Preferred Media Type".
 */
export function PreferredMediaType({
	lASession,
	emphasisStyle
}: {
	lASession: LearningAnalyticsType;
	emphasisStyle?: HTMLAttributes<"span">["className"];
}) {
	const graphData = plotPreferredMediaType(lASession);
	const preferredMediaType = preferredValuePerSession(lASession, "preferredMediaType");
	const mediaName = isLessonContentMediaType(preferredMediaType)
		? getContentTypeDisplayName(preferredMediaType)
		: preferredMediaType;

	return (
		<PreferredMediaTypeLayout mediaName={mediaName} emphasisStyle={emphasisStyle}>
			<Line data={graphData} options={DEFAULT_LINE_CHART_OPTIONS} />
		</PreferredMediaTypeLayout>
	);
}

/**
 * Component to display the metric "Preferred Media Type" in the Learning Analytics Dashboard.
 * @param lASession The (filtered) session for which the metric is computed for.
 * @param emphasisStyle className to emphasize the summary (e.g. font-bold or italic).
 * @returns The component to display the metric "Preferred Media Type".
 */
export function PreferredMediaTypeStacked({
	lASession,
	emphasisStyle
}: {
	lASession: LearningAnalyticsType;
	emphasisStyle?: HTMLAttributes<"span">["className"];
}) {
	const graphData = plotPreferredMediaType(lASession);

	const preferredMediaType = preferredValuePerSession(lASession, "preferredMediaType");
	const mediaName = isLessonContentMediaType(preferredMediaType)
		? getContentTypeDisplayName(preferredMediaType)
		: preferredMediaType;

	const options = {
		scales: {
			x: {
				...X_AXIS_FORMAT,
				stacked: true
			},
			y: { stacked: true }
		}
	};

	return (
		<PreferredMediaTypeLayout mediaName={mediaName} emphasisStyle={emphasisStyle}>
			<Bar data={graphData} options={options} />
		</PreferredMediaTypeLayout>
	);
}

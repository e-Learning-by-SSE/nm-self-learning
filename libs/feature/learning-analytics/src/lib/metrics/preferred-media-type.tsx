import { DEFAULT_LINE_CHART_OPTIONS, formatDate, preferredValuePerSession } from "../auxillary";
import { LearningAnalyticsType } from "../learning-analytics";
import { getContentTypeDisplayName } from "@self-learning/types";
import { UNARY_METRICS } from "./metrics";

import { Chart as ChartJS, registerables } from "chart.js";
import { Line } from "react-chartjs-2";
import "chartjs-adapter-date-fns";
import { HTMLAttributes } from "react";

ChartJS.register(...registerables);

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
			{
				label: getContentTypeDisplayName("video"),
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
				label: getContentTypeDisplayName("pdf"),
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
				label: getContentTypeDisplayName("iframe"),
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
				label: getContentTypeDisplayName("article"),
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

/**
 * Component to display the metric "Preferred Media Type" in the Learning Analytics Dashboard.
 * @param lASession The (filtered) session for which the metric is computed for.
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
	const style = emphasisStyle ? emphasisStyle : "";

	return (
		<>
			<h1 className="text-5xl">{UNARY_METRICS["PreferredMediaType"]}</h1>
			<span className="text-xl">
				{`Du bevorzugst `}
				<span className={style}>
					{preferredValuePerSession(lASession, "preferredMediaType")}
				</span>
				{`.`}
			</span>
			<Line data={graphData} options={DEFAULT_LINE_CHART_OPTIONS} />
		</>
	);
}

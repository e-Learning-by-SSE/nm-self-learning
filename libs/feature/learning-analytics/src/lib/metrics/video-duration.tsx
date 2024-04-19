import { DEFAULT_LINE_CHART_OPTIONS, avg, formatDate } from "../auxillary";
import { LearningAnalyticsType } from "@self-learning/types";
import { UNARY_METRICS } from "./metrics";

import { Chart as ChartJS, registerables } from "chart.js";
import { Line } from "react-chartjs-2";
import "chartjs-adapter-date-fns";
import { HTMLAttributes } from "react";

ChartJS.register(...registerables);

/**
 * Generates a summary that prints the average video duration in min.
 * @param lASession The (filtered) session for which the summary is computed for.
 * @returns A summary in form of: x.x Minuten
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
	return (count > 0 ? (duration / count).toFixed(1) : "0") + " Minuten";
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
			out.data.push(avg(duration, count, 1));
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
	out.data.push(avg(duration, count, 1));
	out.labels.push(sessionStart);
	return {
		labels: out.labels,
		datasets: [
			{
				label: UNARY_METRICS["VideoDuration"],
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
}

/**
 * Component to display the metric "Video Duration" in the Learning Analytics Dashboard.
 * @param lASession The (filtered) session for which the metric is computed for.
 * @param emphasisStyle className to emphasize the summary (e.g. font-bold or italic).
 * @returns The component to display the metric "Video Duration".
 */
export function VideoDuration({
	lASession,
	emphasisStyle
}: {
	lASession: LearningAnalyticsType;
	emphasisStyle?: HTMLAttributes<"span">["className"];
}) {
	const graphData = plotVideoDuration(lASession);
	const style = emphasisStyle ? emphasisStyle : "";

	return (
		<>
			<h1 className="text-5xl">{UNARY_METRICS["VideoDuration"]}</h1>
			<span className="text-xl">
				{`Durchschnittlich hast pro Tag `}
				<span className={style}>{summary(lASession)}</span>
				{` Lernvideos angeschaut.`}
			</span>
			<Line data={graphData} options={DEFAULT_LINE_CHART_OPTIONS} />
		</>
	);
}

import { averageUsesPerSession, avg, DEFAULT_LINE_CHART_OPTIONS, formatDate } from "../auxillary";
import { LearningAnalyticsType } from "../learning-analytics";
import { UNARY_METRICS } from "./metrics";

import { Chart as ChartJS, registerables } from "chart.js";
import { Line } from "react-chartjs-2";
import "chartjs-adapter-date-fns";
import { HTMLAttributes } from "react";

ChartJS.register(...registerables);

/**
 * Generates the Line Chart data for the average number of video stops per day.
 * @param lASession The (filtered) session for which the summary is computed for.
 * @returns  Line Chart data for the average number of video stops per day
 */
function plotVideoStops(lASession: LearningAnalyticsType) {
	const out: { data: number[]; labels: string[] } = { data: [], labels: [] };
	let stops = 0;
	let count = 0;
	let lastsession = formatDate(lASession[0].start);
	let sessionStart = lastsession;
	lASession.forEach(session => {
		sessionStart = formatDate(session.start);
		if (sessionStart !== lastsession) {
			out.data.push(avg(stops, count, 1));
			out.labels.push(lastsession);
			lastsession = sessionStart;
			stops = 0;
			count = 0;
		}
		if (session?.learningAnalytics) {
			session?.learningAnalytics.forEach(learningAnalytics => {
				if (learningAnalytics?.videoBreaks && learningAnalytics.videoBreaks != null) {
					stops = stops + learningAnalytics.videoBreaks;
					count++;
				}
			});
		}
	});
	out.data.push(avg(stops, count, 1));
	out.labels.push(sessionStart);
	return {
		labels: out.labels,
		datasets: [
			{
				label: UNARY_METRICS["VideoStops"],
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
 * Component to display the metric "Video Stops" in the Learning Analytics Dashboard.
 * @param lASession The (filtered) session for which the metric is computed for.
 * @param emphasisStyle className to emphasize the summary (e.g. font-bold or italic).
 * @returns The component to display the metric "Video Stops".
 */
export function VideoStops({
	lASession,
	emphasisStyle
}: {
	lASession: LearningAnalyticsType;
	emphasisStyle?: HTMLAttributes<"span">["className"];
}) {
	const graphData = plotVideoStops(lASession);
	const style = emphasisStyle ? emphasisStyle : "";

	return (
		<>
			<h1 className="text-5xl">{UNARY_METRICS["VideoStops"]}</h1>
			<span className="text-xl">
				{`Durchschnittlich hast pro Sitzung `}
				<span className={style}>{averageUsesPerSession(lASession, "videoBreaks")}</span>
				{` Mal das Video pausiert.`}
			</span>
			<Line data={graphData} options={DEFAULT_LINE_CHART_OPTIONS} />
		</>
	);
}

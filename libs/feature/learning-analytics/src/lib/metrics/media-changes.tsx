import { averageUsesPerSession, avg, DEFAULT_LINE_CHART_OPTIONS, formatDate } from "../auxillary";
import { UNARY_METRICS } from "./metrics";

import { Chart as ChartJS, registerables } from "chart.js";
import { Line } from "react-chartjs-2";
import "chartjs-adapter-date-fns";
import { HTMLAttributes } from "react";
import { LearningAnalyticsType } from "@self-learning/api";

ChartJS.register(...registerables);

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
			out.data.push(avg(mediaChanges, count, 1));
			out.labels.push(lastsession);
			lastsession = sessionStart;
			mediaChanges = 0;
			count = 0;
		}
		if (session?.activities) {
			session?.activities.forEach(activity => {
				const noOfMediaChanges =
					(activity?.mediaChangeCount.video ?? 0) +
					(activity?.mediaChangeCount.article ?? 0) +
					(activity?.mediaChangeCount.pdf ?? 0) +
					(activity?.mediaChangeCount.iframe ?? 0);

				// TODO SE: Check if minimal value is 1 instead of zero (for consuming at least one media without changing it)
				if (noOfMediaChanges > 0) {
					mediaChanges = noOfMediaChanges;
					count = count + 1;
				}
			});
		}
	});
	out.data.push(avg(mediaChanges, count, 1));
	out.labels.push(sessionStart);
	return {
		labels: out.labels,
		datasets: [
			{
				label: UNARY_METRICS["MediaChanges"],
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
 * Component to display the metric "Media Changes" in the Learning Analytics Dashboard.
 * @param lASession The (filtered) session for which the metric is computed for.
 * @param emphasisStyle className to emphasize the summary (e.g. font-bold or italic).
 * @returns The component to display the metric "Media Changes".
 */
export function MediaChanges({
	lASession,
	emphasisStyle
}: {
	lASession: LearningAnalyticsType;
	emphasisStyle?: HTMLAttributes<"span">["className"];
}) {
	const graphData = plotMediaChanges(lASession);
	const style = emphasisStyle ? emphasisStyle : "";
	const mediaChanges = lASession
		.flatMap(la => la.activities)
		.flatMap(activity => activity.mediaChangeCount)
		.map(no => ({
			mediaChanges: (no.video ?? 0) + (no.article ?? 0) + (no.iframe ?? 0) + (no.pdf ?? 0)
		}));

	return (
		<>
			<h1 className="text-5xl">{UNARY_METRICS["MediaChanges"]}</h1>
			<span className="text-xl">
				{`Durchschnittlich hast du `}
				<span className={style}>{averageUsesPerSession(mediaChanges, "mediaChanges")}</span>
				{` Mal pro Sitzung das bevorzugte Medium gewechselt.`}
			</span>
			<Line data={graphData} options={DEFAULT_LINE_CHART_OPTIONS} />
		</>
	);
}

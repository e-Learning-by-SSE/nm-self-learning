import { DEFAULT_LINE_CHART_OPTIONS, avg, formatDate } from "../auxillary";
import { LearningAnalyticsType } from "../learning-analytics";
import { UNARY_METRICS } from "./metrics";

import { Chart as ChartJS, registerables } from "chart.js";
import { Line } from "react-chartjs-2";
import "chartjs-adapter-date-fns";

ChartJS.register(...registerables);

/**
 * Generates a summary that prints the average learning duration in min.
 * @param lASession The (filtered) session for which the summary is computed for.
 * @returns A summary in form of: x.x min
 */
function summary(lASession: LearningAnalyticsType) {
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
	return (count > 0 ? (duration / count).toFixed(1) : "0") + " min";
}

/**
 * Generates the Line Chart data for learning duration per day.
 * @param lASession The (filtered) session for which the summary is computed for.
 * @returns  Line Chart data for the learning duration per day.
 */
function plotDurationPerDay(lASession: LearningAnalyticsType) {
	const out: { data: number[]; labels: string[] } = { data: [], labels: [] };
	let count = 0;
	let duration = 0;
	let lastsession = formatDate(lASession[0].start);
	let sessionStart = lastsession;
	lASession.forEach(session => {
		sessionStart = formatDate(session.start);
		if (sessionStart !== lastsession) {
			out.data.push(avg(duration, count, 1));
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
	out.data.push(avg(duration, count, 1));
	out.labels.push(sessionStart);
	return {
		labels: out.labels,
		datasets: [
			{
				label: UNARY_METRICS["Duration"],
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
 * Component to display the metric "Learning Duration" in the Learning Analytics Dashboard.
 * @param lASession The (filtered) session for which the metric is computed for.
 * @returns The component to display the metric "Learning Duration".
 */
export function Duration({ lASession }: { lASession: LearningAnalyticsType }) {
	const graphData = plotDurationPerDay(lASession);

	return (
		<>
			<h1 className="text-5xl">{UNARY_METRICS["Duration"]}</h1>
			<span className="text-xl">
				{`Durchschnittlich hast du `}
				<span className="italic">{summary(lASession)}</span>
				{` pro Tag gelernt.`}
			</span>
			<Line data={graphData} options={DEFAULT_LINE_CHART_OPTIONS} />
		</>
	);
}

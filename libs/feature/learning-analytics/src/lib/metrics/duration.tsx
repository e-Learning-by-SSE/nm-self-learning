import { DEFAULT_LINE_CHART_OPTIONS, avg, formatDate } from "../auxillary";
import { LearningAnalyticsType } from "@self-learning/api";
import { UNARY_METRICS } from "./metrics";

import { Chart as ChartJS, registerables } from "chart.js";
import { Line } from "react-chartjs-2";
import "chartjs-adapter-date-fns";
import { HTMLAttributes } from "react";

ChartJS.register(...registerables);

/**
 * Generates a summary that prints the average learning duration in min.
 * @param lASession The (filtered) session for which the summary is computed for.
 * @returns A summary in form of: x.x min
 */
function summary(lASession: LearningAnalyticsType) {
	return calculateAverageForSequence(lASession).averageDuration.toFixed(1) + " min";
}

function calculateAverageForSequence(lASession: LearningAnalyticsType) {
	return lASession
		.map(sequence => sequence.activities)
		.map(calculateAverageDuration)
		.reduce((acc, { averageDuration, sessionCount }) => {
			acc.averageDuration += averageDuration;
			acc.sessionCount += sessionCount;
			return acc;
		});
}

function calculateAverageDuration(activities: LearningAnalyticsType[number]["activities"]) {
	let totalDuration = 0;
	let sessionCount = 0;
	const minutesInMilliseconds = 60000;
	const calculateDurationInMinutes = (start: Date | string, end: Date | string) =>
		(new Date(end).getTime() - new Date(start).getTime()) / minutesInMilliseconds;

	const addDuration = ({ start, end }: { start: Date | string; end: Date | string }) => {
		totalDuration += calculateDurationInMinutes(start, end);
		sessionCount++;
	};

	activities.forEach(activity => {
		const { quizStart, quizEnd, lessonStart, lessonEnd } = activity;
		if (lessonStart && lessonEnd) {
			addDuration({ start: lessonStart, end: lessonEnd });
		}
		if (quizStart && quizEnd) {
			addDuration({ start: quizStart, end: quizEnd });
		}
	});

	const averageDuration = sessionCount > 0 ? totalDuration / sessionCount : 0;
	return { averageDuration, sessionCount };
}

/**
 * Generates the Line Chart data for learning duration per day.
 * @param learningData The (filtered) session for which the summary is computed for.
 * @returns  Line Chart data for the learning duration per day.
 */
function plotDurationPerDay(learningData: LearningAnalyticsType) {
	const out: { data: number[]; labels: string[] } = { data: [], labels: [] };
	learningData
		.map(({ start, activities }) => ({ start, ...calculateAverageDuration(activities) }))
		.forEach(({ start, averageDuration, sessionCount }) => {
			out.data.push(avg(averageDuration, sessionCount, 1));
			out.labels.push(formatDate(start));
		});
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
 * @param emphasisStyle className to emphasize the summary (e.g. font-bold or italic).
 * @returns The component to display the metric "Learning Duration".
 */
export function Duration({
	lASession,
	emphasisStyle
}: {
	lASession: LearningAnalyticsType;
	emphasisStyle?: HTMLAttributes<"span">["className"];
}) {
	const graphData = plotDurationPerDay(lASession);
	const style = emphasisStyle ? emphasisStyle : "";

	return (
		<>
			<h1 className="text-5xl">{UNARY_METRICS["Duration"]}</h1>
			<span className="text-xl">
				{`Durchschnittlich hast du `}
				<span className={style}>{summary(lASession)}</span>
				{` pro Tag gelernt.`}
			</span>
			<Line data={graphData} options={DEFAULT_LINE_CHART_OPTIONS} />
		</>
	);
}

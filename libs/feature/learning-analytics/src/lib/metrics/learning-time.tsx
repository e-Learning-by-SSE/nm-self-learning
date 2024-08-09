import { format } from "date-fns";
import { UNARY_METRICS } from "./metrics";
import { X_AXIS_FORMAT, formatDate, maxKey } from "../auxillary";
import { LearningAnalyticsType } from "@self-learning/api";

import { Chart as ChartJS, registerables, ChartOptions } from "chart.js";
import { Line } from "react-chartjs-2";
import "chartjs-adapter-date-fns";
import { HTMLAttributes } from "react";

ChartJS.register(...registerables);

/**
 * Time axis format (Y-axis range is 0-24 hours).
 */
const learningTimeOptions: ChartOptions<"line"> = {
	scales: {
		x: X_AXIS_FORMAT,
		y: {
			min: 0,
			max: 24,
			beginAtZero: true,
			ticks: {
				stepSize: 1
			}
		}
	}
};

/**
 * Generates a summary that prints the preferred learning time (Morgens 5-12 Uhr, Nachmittags 12-17 Uhr, Abends 17-21 Uhr, Nachts 21-5 Uhr).
 * @param lASession The (filtered) session for which the summary is computed for.
 * @returns A summary in form of: Morgens | Nachmittags | Abends | Nachts
 */
function summary(lASession: LearningAnalyticsType) {
	const learningTimes = new Map();
	lASession.forEach(session => {
		if (session.learningAnalytics)
			session.learningAnalytics.forEach(learningAnalytics => {
				if (learningAnalytics.lessonStart) {
					const hour = format(new Date(learningAnalytics.lessonStart), "HH");
					if (learningTimes.has(hour))
						learningTimes.set(hour, learningTimes.get(hour) + 1);
					else learningTimes.set(hour, 1);
				}
			});
	});
	const maxHour = maxKey(learningTimes);

	return convertToTimeOfDay(maxHour);
}

/**
 * Part of the summary to map a preferred learning time to Morgens | Nachmittags | Abends | Nachts
 * @param hour The preferred hour of learning
 * @returns Morgens | Nachmittags | Abends | Nachts
 */
function convertToTimeOfDay(hour: number) {
	let result = "Keine Daten vorhanden";
	if (hour >= 5 && hour < 12) result = "Morgens";
	else if (hour >= 12 && hour < 17) result = "Nachmittags";
	else if (hour >= 17 && hour < 21) result = "Abends";
	else if (hour >= 21 || hour < 5) result = "Nachts";
	return result;
}

/**
 * Generates the Line Chart data for the preferred learning time as hour for a day.
 * @param lASession The (filtered) session for which the summary is computed for.
 * @returns  Line Chart data for the preferred learning time as hour for a day.
 */
function plotPreferredLearningTime(lASession: LearningAnalyticsType) {
	const out: { data: number[]; labels: string[] } = { data: [], labels: [] };

	let hours = new Map();
	let lastsession = formatDate(lASession[0].start);
	let sessionStart = lastsession;
	lASession.forEach(session => {
		sessionStart = formatDate(session.start);
		if (sessionStart !== lastsession) {
			if (hours.size > 0) {
				out.data.push(maxKey(hours));
				out.labels.push(lastsession);
				lastsession = sessionStart;
				hours = new Map();
			}
		}
		if (session?.learningAnalytics) {
			session.learningAnalytics.forEach(learningAnalytics => {
				if (learningAnalytics.lessonStart) {
					const hour = format(new Date(learningAnalytics.lessonStart), "HH");
					if (hours.has(hour)) hours.set(hour, hours.get(hour) + 1);
					else hours.set(hour, 1);
				}
			});
		}
	});
	if (hours.size > 0) {
		out.data.push(maxKey(hours));
		out.labels.push(sessionStart);
	}
	const data = {
		labels: out.labels,
		datasets: [
			{
				label: UNARY_METRICS["PreferredLearningTime"],
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

/**
 * Component to display the metric "Preferred Learning Time" in the Learning Analytics Dashboard.
 * @param lASession The (filtered) session for which the metric is computed for.
 * @param emphasisStyle className to emphasize the summary (e.g. font-bold or italic).
 * @returns The component to display the metric "Preferred Learning Time".
 */
export function PreferredLearningTime({
	lASession,
	emphasisStyle
}: {
	lASession: LearningAnalyticsType;
	emphasisStyle?: HTMLAttributes<"span">["className"];
}) {
	const graphData = plotPreferredLearningTime(lASession);
	const style = emphasisStyle ? emphasisStyle : "";

	return (
		<>
			<h1 className="text-5xl">{UNARY_METRICS["PreferredLearningTime"]}</h1>
			<span className="text-xl">
				{`Bevorzugt hast du `}
				<span className={style}>{summary(lASession)}</span>
				{` gelernt.`}
			</span>
			<Line data={graphData} options={learningTimeOptions} />
		</>
	);
}

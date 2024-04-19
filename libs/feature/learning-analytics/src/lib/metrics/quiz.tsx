import {
	DEFAULT_BAR_CHART_OPTIONS,
	DEFAULT_LINE_CHART_OPTIONS,
	avg,
	formatDate
} from "../auxillary";
import { UNARY_METRICS } from "./metrics";

import { Chart as ChartJS, registerables } from "chart.js";
import { Bar } from "react-chartjs-2";
import "chartjs-adapter-date-fns";
import { HTMLAttributes } from "react";
import { LearningAnalyticsType } from "@self-learning/types";

ChartJS.register(...registerables);

/**
 * Generates a summary that prints how many questions were answered correctly/incorrectly on average.
 * @param lASession The (filtered) session for which the summary is computed for.
 * @returns A summary in form of: Richtig: x.x, Falsch: y.y
 */
function summary(lASession: LearningAnalyticsType) {
	let correct = 0;
	let incorrect = 0;
	let countCorrect = 0;
	let countIncorrect = 0;
	let hints = 0;
	let countHints = 0;
	lASession.forEach(session => {
		if (session?.learningAnalytics) {
			session?.learningAnalytics.forEach(learningAnalytics => {
				if (learningAnalytics?.numberCorrectAnswers) {
					correct = correct + learningAnalytics.numberCorrectAnswers;
					countCorrect = countCorrect + 1;
				}
				if (learningAnalytics?.numberIncorrectAnswers) {
					incorrect = incorrect + learningAnalytics.numberIncorrectAnswers;
					countIncorrect = countIncorrect + 1;
				}
				if (learningAnalytics?.numberOfUsedHints) {
					hints = hints + learningAnalytics.numberOfUsedHints;
					countHints = countHints + 1;
				}
			});
		}
	});
	const correctAvg = countCorrect > 0 ? (correct / countCorrect).toFixed(1) : "0";
	const incorrectAvg = countIncorrect > 0 ? (incorrect / countIncorrect).toFixed(1) : "0";
	const hintsAvg = countHints > 0 ? (hints / countHints).toFixed(1) : "0";
	return [correctAvg, incorrectAvg, hintsAvg];
}

/**
 * Generates the Line Chart data for the average number of right and wrong numbers of answers per day.
 * @param lASession The (filtered) session for which the summary is computed for.
 * @returns  Line Chart data for the average number of right and wrong numbers of answers per day.
 */
function plotQuizPerDay(lASession: LearningAnalyticsType) {
	const dataPoints: { correct: number[]; incorrect: number[]; hints: number[] } = {
		correct: [],
		incorrect: [],
		hints: []
	};
	const labels: string[] = [];
	let correct = 0;
	let incorrect = 0;
	let countCorrect = 0;
	let countIncorrect = 0;
	let hints = 0;
	let countHints = 0;
	let lastsession = formatDate(lASession[0].start);
	let sessionStart = lastsession;
	lASession.forEach(session => {
		sessionStart = formatDate(session.start);
		if (sessionStart !== lastsession) {
			dataPoints.correct.push(avg(correct, countCorrect, 1));
			dataPoints.incorrect.push(avg(incorrect, countIncorrect, 1));
			dataPoints.hints.push(avg(hints, countHints, 1));
			labels.push(lastsession);
			lastsession = sessionStart;
			correct = 0;
			incorrect = 0;
			countCorrect = 0;
			countIncorrect = 0;
			hints = 0;
			countHints = 0;
		}
		if (session?.learningAnalytics) {
			session.learningAnalytics.forEach(learningAnalytics => {
				if (learningAnalytics.numberCorrectAnswers) {
					correct = correct + learningAnalytics.numberCorrectAnswers;
					countCorrect++;
				}
				if (learningAnalytics.numberIncorrectAnswers) {
					incorrect = incorrect + learningAnalytics.numberIncorrectAnswers;
					countIncorrect++;
				}
				if (learningAnalytics.numberOfUsedHints) {
					hints = hints + learningAnalytics.numberOfUsedHints;
					countHints++;
				}
			});
		}
	});
	dataPoints.correct.push(avg(correct, countCorrect, 1));
	dataPoints.incorrect.push(avg(incorrect, countIncorrect, 1));
	dataPoints.hints.push(avg(hints, countHints, 1));
	labels.push(sessionStart);
	return {
		labels: labels,
		datasets: [
			{
				label: "Richtige Antworten",
				fill: false,
				backgroundColor: "#003f5c",
				borderColor: "#003f5c",
				pointBorderColor: "#003f5c",
				pointBackgroundColor: "#fff",
				pointBorderWidth: 1,
				pointHoverRadius: 5,
				pointHoverBackgroundColor: "#003f5c",
				pointHoverBorderColor: "#003f5c",
				pointHoverBorderWidth: 2,
				pointRadius: 1,
				pointHitRadius: 10,
				data: dataPoints.correct
			},
			{
				label: "Falsche Antworten",
				fill: false,
				backgroundColor: "#ffa600",
				borderColor: "#ffa600",
				pointBorderColor: "#ffa600",
				pointBackgroundColor: "#fff",
				pointBorderWidth: 1,
				pointHoverRadius: 5,
				pointHoverBackgroundColor: "#ffa600",
				pointHoverBorderColor: "#ffa600",
				pointHoverBorderWidth: 2,
				pointRadius: 1,
				pointHitRadius: 10,
				data: dataPoints.incorrect
			},
			{
				label: "Benötigte Hinweise",
				fill: false,
				backgroundColor: "#ef5675",
				borderColor: "#ef5675",
				pointBorderColor: "#ef5675",
				pointBackgroundColor: "#fff",
				pointBorderWidth: 1,
				pointHoverRadius: 5,
				pointHoverBackgroundColor: "#ef5675",
				pointHoverBorderColor: "#ef5675",
				pointHoverBorderWidth: 2,
				pointRadius: 1,
				pointHitRadius: 10,
				data: dataPoints.hints
			}
		]
	};
}

/**
 * Component to display the metric "Answers" in the Learning Analytics Dashboard.
 * @param lASession The (filtered) session for which the metric is computed for.
 * @param emphasisStyle className to emphasize the summary (e.g. font-bold or italic).
 * @returns The component to display the metric "Answers".
 */
export function Quiz({
	lASession,
	emphasisStyle
}: {
	lASession: LearningAnalyticsType;
	emphasisStyle?: HTMLAttributes<"span">["className"];
}) {
	const graphData = plotQuizPerDay(lASession);
	const [correctAvg, incorrectAvg, hintsAvg] = summary(lASession);
	const style = emphasisStyle ? emphasisStyle : "";

	return (
		<>
			<h1 className="text-5xl">{UNARY_METRICS["Quiz"]}</h1>
			<span className="text-xl">
				{`Durchschnittlich hast du `}
				<span className={style}>{`${correctAvg} korrekte`}</span>
				{` und `}
				<span className={style}>{`${incorrectAvg} fehlerhafte`}</span>
				{` Antworten pro Sitzung und dafür `}
				<span className={style}>{`${hintsAvg} `}</span>
				{` Hilfestellungen benötigt.`}
			</span>
			<Bar data={graphData} options={DEFAULT_BAR_CHART_OPTIONS} />
		</>
	);
}

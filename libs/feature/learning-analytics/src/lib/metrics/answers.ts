import { DEFAULT_LINE_CHART_OPTIONS, avg, formatDate } from "../auxillary";
import { LearningAnalyticsType } from "../learning-analytics";

/**
 * The displayname of the metric (may be translated to support i18n).
 */
const METRIC_NAME = "Durchschnittliche Anzahl an richtigen und falschen Antworten";

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
			});
		}
	});
	return (
		"Richtig: " +
		(countCorrect > 0 ? (correct / countCorrect).toFixed(1) : "0") +
		"\nFalsch: " +
		(countIncorrect > 0 ? (incorrect / countIncorrect).toFixed(1) : "0")
	);
}

/**
 * Generates the Line Chart data for the average number of right and wrong numbers of answers per day.
 * @param lASession The (filtered) session for which the summary is computed for.
 * @returns  Line Chart data for the average number of right and wrong numbers of answers per day.
 */
function plotAnswersPerDay(lASession: LearningAnalyticsType) {
	const dataPoints: { correct: number[]; incorrect: number[] } = { correct: [], incorrect: [] };
	const labels: string[] = [];
	let correct = 0;
	let incorrect = 0;
	let countCorrect = 0;
	let countIncorrect = 0;
	let lastsession = formatDate(lASession[0].start);
	let sessionStart = lastsession;
	lASession.forEach(session => {
		sessionStart = formatDate(session.start);
		if (sessionStart !== lastsession) {
			dataPoints.correct.push(avg(correct, countCorrect, 1));
			dataPoints.incorrect.push(avg(incorrect, countIncorrect, 1));
			labels.push(lastsession);
			lastsession = sessionStart;
			correct = 0;
			incorrect = 0;
			countCorrect = 0;
			countIncorrect = 0;
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
			});
		}
	});
	dataPoints.correct.push(avg(correct, countCorrect, 1));
	dataPoints.incorrect.push(avg(incorrect, countIncorrect, 1));
	labels.push(sessionStart);
	let data = null;
	if (labels.length > 0)
		data = {
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
				}
			]
		};
	return data;
}

export const ANSWERS_METRIC = {
	metric: "Answers",
	name: METRIC_NAME,
	summary: summary,
	data: plotAnswersPerDay,
	options: DEFAULT_LINE_CHART_OPTIONS
};

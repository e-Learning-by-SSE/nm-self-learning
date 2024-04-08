import { format } from "date-fns";
import { defaultChartOption } from "../auxillary";
import { LearningAnalyticsType } from "../learning-analytics";

const METRIC_NAME = "Durchschnittliche Anzahl an richtigen und falschen Antworten";

/**
 * getAnswers()
 * Returns the average number of right and wrong numbers of answers.
 *
 * lASession: learning analytic session data
 */
/**
 * Generates a summary that prints how many questions were answered correctly/incorrectly on average.
 * @param lASession The (filtered) session for which the summary is computed for.
 * @returns A summary in form of Correct: x.x, Incorrect: y.y
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
		(countCorrect > 0 ? Math.round((correct / countCorrect) * 10) / 10 : 0) +
		"\nFalsch: " +
		(countIncorrect > 0 ? Math.round((incorrect / countIncorrect) * 10) / 10 : 0)
	);
}

function avg(sum: number, count: number, digits: number) {
	return count > 0 ? (Math.round((sum / count) * 10 * digits) / 10) * digits : 0;
}

/**
 * getDataForAnswers()
 * Returns the average number of right and wrong numbers of answers per day. The result is data for a line chart.
 *
 * lASession: learning analytic session data
 */
function plotAnswersPerDay(lASession: LearningAnalyticsType) {
	const dataPoints: { correct: number[]; incorrect: number[] } = { correct: [], incorrect: [] };
	const labels: string[] = [];
	let correct = 0;
	let incorrect = 0;
	let countCorrect = 0;
	let countIncorrect = 0;
	let lastsession = format(new Date(lASession[0].start), "dd.MM.yyyy");
	let sessionStart = lastsession;
	lASession.forEach(session => {
		sessionStart = format(new Date(session.start), "dd.MM.yyyy");
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
	options: defaultChartOption
};

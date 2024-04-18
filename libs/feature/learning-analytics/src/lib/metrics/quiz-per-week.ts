import { DEFAULT_LINE_CHART_OPTIONS, avg, formatDate } from "../auxillary";
import { LearningAnalyticsType } from "../learning-analytics";

/**
 * The displayname of the metric (may be translated to support i18n).
 */
const METRIC_NAME = "Lernkontrollen pro Tag";

/**
 * Part of the summary to convert a date to the week number and year.
 * @param date The date to convert
 * @returns The number of the year: 1 - 52
 */
function convertToWeekOfYear(date: Date) {
	const currentDate = new Date(date);

	const d = new Date(
		Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate())
	);
	const dayNum = d.getUTCDay() || 7;
	d.setUTCDate(d.getUTCDate() + 4 - dayNum);
	const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
	return (
		Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7) +
		" - " +
		d.getUTCFullYear()
	);
}

/**
 * Generates a summary that prints the average quizzes per week.
 * @param lASession The (filtered) session for which the summary is computed for.
 * @returns A summary in form of: x.x
 */
function summary(lASession: LearningAnalyticsType) {
	const out: { data: number[]; date: string[] } = { data: [], date: [] };
	let count = 0;
	let lastsession = lASession[0].start;
	let sessionStart = lastsession;
	// Collecting all quizzes from the sessions per day.
	lASession.forEach(session => {
		sessionStart = session.start;
		if (sessionStart !== lastsession) {
			out.data.push(count);
			out.date.push(convertToWeekOfYear(lastsession));
			lastsession = sessionStart;
			count = 0;
		}
		if (session?.learningAnalytics) {
			session?.learningAnalytics.forEach(learningAnalytics => {
				if (learningAnalytics?.quizStart != null && learningAnalytics?.quizEnd != null) {
					count = count + 1;
				}
			});
		}
	});
	out.data.push(count);
	out.date.push(convertToWeekOfYear(sessionStart));

	let sum = 0;
	const avgWeeks: number[] = [];

	// Calculates the average per week based on the week number and year of a date
	for (let i = 0; i < out.data.length - 1; i++) {
		if (out.date[i] !== out.date[i + 1]) {
			avgWeeks.push(avg(sum + out.data[i], 7, 1));
			sum = 0;
		} else {
			sum = sum + out.data[i];
		}
	}
	avgWeeks.push(avg(sum + out.data[out.data.length - 1], 7, 1));
	sum = 0;
	// Summe all average per week values and return the calculated average per week value
	avgWeeks.forEach(element => {
		sum = sum + element;
	});
	return avgWeeks.length > 0 ? (sum / avgWeeks.length).toFixed(1) : "0";
}

/**
 * Generates the Line Chart data for the quizzes per day.
 * @param lASession The (filtered) session for which the summary is computed for.
 * @returns  Line Chart data for the quizzes per day
 */
export function plotQuizPerWeek(lASession: LearningAnalyticsType) {
	const out: { data: number[]; labels: string[] } = { data: [], labels: [] };
	let count = 0;
	let lastsession = formatDate(lASession[0].start);
	let sessionStart = lastsession;
	lASession.forEach(session => {
		sessionStart = formatDate(session.start);
		if (sessionStart !== lastsession) {
			out.data.push(count);
			out.labels.push(lastsession);
			lastsession = sessionStart;
			count = 0;
		}
		if (session?.learningAnalytics) {
			session?.learningAnalytics.forEach(learningAnalytics => {
				if (learningAnalytics?.quizStart && learningAnalytics?.quizEnd) {
					count = count + 1;
				}
			});
		}
	});
	out.data.push(count);
	out.labels.push(sessionStart);
	let data = null;
	if (out)
		data = {
			labels: out.labels,
			datasets: [
				{
					label: METRIC_NAME,
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

export const QUIZ_PER_WEEK_METRIC = {
	metric: "Quiz per Week",
	name: METRIC_NAME,
	summary: summary,
	data: plotQuizPerWeek,
	options: DEFAULT_LINE_CHART_OPTIONS
};

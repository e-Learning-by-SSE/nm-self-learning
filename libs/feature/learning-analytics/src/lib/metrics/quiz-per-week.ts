import { format, parseISO } from "date-fns";
import { DEFAULT_LINE_CHART_OPTIONS } from "../auxillary";
import { LearningAnalyticsType } from "../learning-analytics";

const METRIC_NAME = "Lernkontrollen pro Tag";

/**
 * getWeekYear()
 * Calculates the week number of a data.
 *
 * date: a date
 */
function getWeekYear(date: Date) {
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
 * getQuizPerWeek()
 * Calculates the average quizzes per weak.
 *
 * lASession: learning analytic session data
 */
function getQuizPerWeek(lASession: LearningAnalyticsType) {
	const out: { data: number[]; date: string[] } = { data: [], date: [] };
	let count = 0;
	let lastsession = lASession[0].start;
	let sessionStart = lastsession;
	// Collecting all quizzes from the sessions per day.
	lASession.forEach(session => {
		sessionStart = session.start;
		if (sessionStart !== lastsession) {
			out.data.push(count);
			out.date.push(getWeekYear(lastsession));
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
	out.date.push(getWeekYear(sessionStart));

	let sum = 0;
	const avgWeeks: number[] = [];

	// Calculates the average per week based on the week number and year of a date
	for (let i = 0; i < out.data.length - 1; i++) {
		if (out.date[i] !== out.date[i + 1]) {
			avgWeeks.push(Math.round(((sum + out.data[i]) / 7) * 10) / 10);
			sum = 0;
		} else {
			sum = sum + out.data[i];
		}
	}
	avgWeeks.push(Math.round(((sum + out.data[out.data.length - 1]) / 7) * 10) / 10);
	sum = 0;
	// Summe all average per week values and return the calculated average per week value
	avgWeeks.forEach(element => {
		sum = sum + element;
	});
	return avgWeeks.length > 0 ? "" + Math.round((sum / avgWeeks.length) * 10) / 10 : "0";
}

/**
 * getDataQuizPerWeek()
 * Collects the quizzes per day as data for a line chart
 *
 * lASession: learning analytic session data
 */
export function getDataQuizPerWeek(lASession: LearningAnalyticsType) {
	const out: { data: number[]; labels: string[] } = { data: [], labels: [] };
	let count = 0;
	let lastsession = format(parseISO(new Date(lASession[0].start).toISOString()), "dd.MM.yyyy");
	let sessionStart = lastsession;
	lASession.forEach(session => {
		sessionStart = format(parseISO(new Date(session.start).toISOString()), "dd.MM.yyyy");
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
	summary: getQuizPerWeek,
	data: getDataQuizPerWeek,
	options: DEFAULT_LINE_CHART_OPTIONS
};

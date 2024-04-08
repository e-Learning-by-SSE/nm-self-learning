import { format, parseISO } from "date-fns";
import { MetricType } from "./metrics";
import { ChartOptions } from "chart.js";
import { maxKey } from "../auxillary";
import { LearningAnalyticsType } from "../learning-analytics";

const METRIC_NAME = "Präferierte Lernzeit";

const learningTimeOptions: ChartOptions<"line"> = {
	scales: {
		x: {
			type: "time",
			time: {
				parser: "dd.MM.yyyy",
				unit: "day",
				tooltipFormat: "dd.MM.yyyy"
			}
		},
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
 * getPreferredLearningTime()
 * Returns the preferred learning time.
 *
 * lASession: learning analytic session data
 */
function getPreferredLearningTime(lASession: LearningAnalyticsType) {
	const learningTimes = new Map();
	lASession.forEach(session => {
		if (session.learningAnalytics)
			session.learningAnalytics.forEach(learningAnalytics => {
				if (learningAnalytics.start && learningAnalytics.end) {
					const hour = format(parseISO(new Date(session.start).toISOString()), "HH");
					if (learningTimes.has(hour))
						learningTimes.set(hour, learningTimes.get(hour) + 1);
					else learningTimes.set(hour, 1);
				}
			});
	});
	const maxHour = Array.from(learningTimes).sort((a, b) => (a[1] > b[1] ? -1 : 1))[0][0];

	return getDayTimeByHour(maxHour);
}

/**
 * getDayTimeByHour()
 * Returns the day time (Morgens 5-12 Uhr, Nachmittags 12-17 Uhr, Abends 17-21 Uhr, Nachts 21-5 Uhr) based on the hour.
 *
 * hour: hour, which need to be checked
 */
function getDayTimeByHour(hour: number) {
	let result = "Keine Daten vorhanden";
	if (hour >= 5 && hour < 12) result = "Morgens";
	else if (hour >= 12 && hour < 17) result = "Nachmittags";
	else if (hour >= 17 && hour < 21) result = "Abends";
	else if (hour >= 21 || hour < 5) result = "Nachts";
	return result;
}

/**
 * getDataForPreferredLearningTime()
 * Returns the preferred learning time as hour for a day. The result is the data for a line chart diagram.
 *
 * lASession: learning analytic session data
 */
function getDataForPreferredLearningTime(lASession: LearningAnalyticsType) {
	const out: { data: number[]; labels: string[] } = { data: [], labels: [] };

	let hours = new Map();
	let lastsession = format(parseISO(new Date(lASession[0].start).toISOString()), "dd.MM.yyyy");
	let sessionStart = lastsession;
	lASession.forEach(session => {
		sessionStart = format(parseISO(new Date(session.start).toISOString()), "dd.MM.yyyy");
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
				if (learningAnalytics.start) {
					const hour = format(parseISO(new Date(session.start).toISOString()), "HH");
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

export const PREFERRED_LEARNING_TIME_METRIC: MetricType = {
	metric: "preferredLearningTime",
	name: METRIC_NAME,
	summary: getPreferredLearningTime,
	data: getDataForPreferredLearningTime,
	options: learningTimeOptions
};

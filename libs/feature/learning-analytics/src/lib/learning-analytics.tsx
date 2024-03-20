import { trpc } from "@self-learning/api-client";
import { format, parseISO } from "date-fns";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { LessonLayoutProps } from "@self-learning/lesson";
import { ResolvedValue } from "@self-learning/types";

export enum LearningAnalyticsMetric {
	preferredLearningTime,
	duration,
	videoSpeed,
	videoDuration,
	mediaTypeChanges,
	preferredMediaType,
	anzQuizPerWeek,
	answers,
	hints,
	videoStops
}
export type LearningAnalyticsMetricType = ResolvedValue<typeof getMetrics>;

/**
 * getMetricName()
 * returns the german name for the metric
 *
 * metric: metric
 *
 */
export function getMetricName(metric: LearningAnalyticsMetric) {
	let result = "nicht gefunden";
	switch (metric) {
		case LearningAnalyticsMetric.anzQuizPerWeek:
			result = "Durchschnittliche Anzahl an Lernkontrollen pro Woche";
			break;
		case LearningAnalyticsMetric.answers:
			result = "Durchschnittliche Fragen pro Lernkontrolle";
			break;
		case LearningAnalyticsMetric.duration:
			result = "Durchschnittliche Lerndauer";
			break;
		case LearningAnalyticsMetric.mediaTypeChanges:
			result = "Durchschnittliche Anzahl an Wechseln zwischen Inhaltstypen";
			break;
		case LearningAnalyticsMetric.preferredLearningTime:
			result = "Präferierte Lernzeit";
			break;
		case LearningAnalyticsMetric.preferredMediaType:
			result = "Präferierter Inhaltstyp";
			break;
		case LearningAnalyticsMetric.videoDuration:
			result = "Durchschnittliche Video Abspieldauer";
			break;
		case LearningAnalyticsMetric.videoSpeed:
			result = "Präferierte Videogeschwindigkeit";
			break;
		case LearningAnalyticsMetric.hints:
			result = "Benötigte Hinweise pro Lernkontrolle";
			break;
		case LearningAnalyticsMetric.videoStops:
			result = "Durchschnittliche Anzahl an Pausen pro abgespielten Video";
			break;
	}
	return result;
}

export type LearningAnalyticsType = {
	start: Date;
	end: Date | null;
	learningAnalytics: {
		start: Date | null;
		end: Date | null;
		sessionId: number;
		lessonId: string | null;
		quizStart: Date | null;
		quizEnd: Date | null;
		numberCorrectAnswers: number | null;
		numberIncorrectAnswers: number | null;
		numberOfUsedHints: number | null;
		numberOfChangesMediaType: number | null;
		preferredMediaType: string | null;
		videoStart: Date | null;
		videoEnd: Date | null;
		videoBreaks: number | null;
		videoSpeed: number | null;
	}[];
}[];

/**
 * getSessionInfo()
 * returns the learning analytic session infos, which are stored in the local storage.
 *
 */
export function getSessionInfo() {
	let lASession = JSON.parse(localStorage.getItem("la_session") + "");
	if (!(lASession && lASession !== "")) {
		lASession = { start: null, end: null, sessionId: null };
	}
	return lASession;
}
/**
 * getLessonsInfo()
 * returns the learning analytic lesson infos, which are stored in the local storage.
 *
 */
export function getLessonsInfo() {
	const timestamp = new Date();
	let lALessonInfo = JSON.parse(localStorage.getItem("la_lessonInfo") + "");
	if (lALessonInfo && lALessonInfo !== "") {
		if (lALessonInfo.lessonId && lALessonInfo.lessonId !== "") {
			if (lALessonInfo.start !== "" && lALessonInfo.end === "") {
				lALessonInfo.end = timestamp;
			} else if (lALessonInfo.start === "") {
				lALessonInfo.start = null;
				lALessonInfo.end = null;
			}
		}
	} else {
		lALessonInfo = null;
	}
	return lALessonInfo;
}

/**
 * saveEnds()
 * Checks if ends of all leaning analytic data is set, if not sets the current date.
 *
 */
export function saveEnds() {
	const lALessonInfo = getLessonsInfo();
	const lAVideoInfo = getVideoInfo();
	const lAQuizInfo = getQuizInfo();
	if (lALessonInfo && lALessonInfo.start !== "" && lALessonInfo.end === "") {
		lALessonInfo.end = new Date() + "";
		window.localStorage.setItem("la_lessonInfo", JSON.stringify(lALessonInfo));
	}
	if (lAVideoInfo && lAVideoInfo.start !== "" && lAVideoInfo.end === "") {
		lAVideoInfo.end = new Date() + "";
		window.localStorage.setItem("la_videoInfo", JSON.stringify(lAVideoInfo));
	}
	if (lAQuizInfo && lAQuizInfo.start !== "" && lAQuizInfo.end === "") {
		lAQuizInfo.end = new Date() + "";
		window.localStorage.setItem("la_quizInfo", JSON.stringify(lAQuizInfo));
	}
}

/**
 * saveLA()
 * Saves all learning analytic data from the local storage in the database.
 *
 */
export function saveLA() {
	const laSession = JSON.parse(localStorage.getItem("la_session") + "");
	const lALessonInfo = getLessonsInfo();
	const lAVideoInfo = getVideoInfo();
	const lAQuizInfo = getQuizInfo();
	const lAMediaType = getMediaType();
	let data = null;
	if (lALessonInfo != null && lALessonInfo?.id !== "" && laSession?.id > -1) {
		resetLA();
		data = {
			sessionId: laSession.id,
			lessonId: lALessonInfo.lessonId,
			courseId: lALessonInfo.courseId,
			start: new Date(lALessonInfo.start).toISOString(),
			end: new Date(lALessonInfo.end).toISOString(),
			quizStart: lAQuizInfo ? new Date(lAQuizInfo.start).toISOString() : null,
			quizEnd: lAQuizInfo ? new Date(lAQuizInfo.end).toISOString() : null,
			numberCorrectAnswers: lAQuizInfo ? lAQuizInfo.right : null,
			numberIncorrectAnswers: lAQuizInfo ? lAQuizInfo.wrong : null,
			numberOfUsedHints: lAQuizInfo ? lAQuizInfo.hint : null,
			numberOfChangesMediaType: lAMediaType ? lAMediaType.numberOfChangesMediaType : 0,
			preferredMediaType: lAMediaType ? lAMediaType.preferredMediaType : "video",
			videoStart: lAVideoInfo ? new Date(lAVideoInfo.start).toISOString() : null,
			videoEnd: lAVideoInfo ? new Date(lAVideoInfo.end).toISOString() : null,
			videoBreaks: lAVideoInfo ? lAVideoInfo.stops : null,
			videoSpeed: lAVideoInfo ? lAVideoInfo.speed : null
		};
	}
	return data;
}

/**
 * getVideoInfo()
 * returns the learning analytic video infos, which are stored in the local storage.
 *
 */
export function getVideoInfo() {
	let lAVideoInfo = JSON.parse(localStorage.getItem("la_videoInfo") + "");
	if (lAVideoInfo && lAVideoInfo.start === "") {
		lAVideoInfo = null;
	}
	return lAVideoInfo;
}

/**
 * getQuizInfo()
 * returns the learning analytic quiz infos, which are stored in the local storage.
 *
 */
export function getQuizInfo() {
	let lAQuizInfo = JSON.parse(localStorage.getItem("la_quizInfo") + "");
	if (lAQuizInfo && lAQuizInfo.start === "") {
		lAQuizInfo = null;
	}
	return lAQuizInfo;
}

/**
 * getMediaType()
 * returns the learning analytic preferred media type, which is stored in the local storage.
 *
 */
export function getMediaType() {
	let lANumberOfChangesMediaTypeSum: number | null = 0;
	let lAPreferredMediaType: string | null = "video";
	const lANumberOfChangesMediaType = JSON.parse(
		localStorage.getItem("la_numberOfChangesMediaType") + ""
	);
	if (lANumberOfChangesMediaType && lANumberOfChangesMediaType !== "") {
		lANumberOfChangesMediaTypeSum =
			lANumberOfChangesMediaType.video +
			lANumberOfChangesMediaType.pdf +
			lANumberOfChangesMediaType.iframe +
			lANumberOfChangesMediaType.article;
		let max = lANumberOfChangesMediaType.video;
		if (lANumberOfChangesMediaType.article > max) {
			max = lANumberOfChangesMediaType.article;
			lAPreferredMediaType = "article";
		}
		if (lANumberOfChangesMediaType.pdf > max) {
			max = lANumberOfChangesMediaType.pdf;
			lAPreferredMediaType = "pdf";
		}
		if (lANumberOfChangesMediaType.iframe > max) {
			lAPreferredMediaType = "iframe";
		}
	} else {
		lAPreferredMediaType = null;
		lANumberOfChangesMediaTypeSum = null;
	}
	return {
		preferredMediaType: lAPreferredMediaType,
		numberOfChangesMediaType: lANumberOfChangesMediaTypeSum
	};
}

/**
 * resetLASession()
 * Clears the local storage from all learning analytic data.
 *
 */
export async function resetLASession() {
	window.localStorage.removeItem("la_session");
	window.localStorage.removeItem("la_lessonInfo");
	window.localStorage.removeItem("la_videoInfo");
	window.localStorage.removeItem("la_numberOfChangesMediaType");
	window.localStorage.removeItem("la_quizInfo");
}

/**
 * resetLASession()
 * Clears the local storage from video, media changes and quiz learning analytic data.
 *
 */
export async function resetLA() {
	window.localStorage.removeItem("la_videoInfo");
	window.localStorage.removeItem("la_numberOfChangesMediaType");
	window.localStorage.removeItem("la_quizInfo");
}

/**
 * getOptions()
 * Return the options(scales) for the line chart.
 *
 * lASession: learning analytic session data
 * metric: 	  current selected metric
 */
export function getOptions(lASession: LearningAnalyticsType, metric: LearningAnalyticsMetric) {
	const x = {
		type: "time",
		time: {
			parser: "dd.MM.yyyy",
			unit: "day"
		},
		max: format(parseISO(new Date().toISOString()), "dd.MM.yyyy")
	};

	let result: any = {
		scales: {
			x: x,
			y: {}
		}
	};
	switch (metric) {
		case LearningAnalyticsMetric.anzQuizPerWeek:
		case LearningAnalyticsMetric.answers:
		case LearningAnalyticsMetric.duration:
		case LearningAnalyticsMetric.mediaTypeChanges:
			break;
		case LearningAnalyticsMetric.preferredLearningTime:
			result = {
				scales: {
					x: x,
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
			break;
		case LearningAnalyticsMetric.preferredMediaType:
		case LearningAnalyticsMetric.videoDuration:
		case LearningAnalyticsMetric.videoSpeed:
		case LearningAnalyticsMetric.hints:
	}
	return result;
}

/**
 * getLineChartData()
 * Returns data for a line chart based on the selected metric.
 *
 * lASession: learning analytic session data
 * metric: 	  selected metric
 */
export function getLineChartData(
	lASession: LearningAnalyticsType,
	metric: LearningAnalyticsMetric
) {
	let result = null;
	switch (metric) {
		case LearningAnalyticsMetric.anzQuizPerWeek:
			result = getDataQuizPerWeek(lASession);
			break;
		case LearningAnalyticsMetric.answers:
			result = getDataForAnswers(lASession);
			break;
		case LearningAnalyticsMetric.duration:
			result = getDataForDuration(lASession);
			break;
		case LearningAnalyticsMetric.mediaTypeChanges:
			result = getDataForMediaChanges(lASession);
			break;
		case LearningAnalyticsMetric.preferredLearningTime:
			result = getDataForPreferredLearningTime(lASession);
			break;
		case LearningAnalyticsMetric.preferredMediaType:
			result = getDataForPreferredMediaType(lASession);
			break;
		case LearningAnalyticsMetric.videoDuration:
			result = getDataForVideoDuration(lASession);
			break;
		case LearningAnalyticsMetric.videoSpeed:
			result = getDataForVideoSpeed(lASession);
			break;
		case LearningAnalyticsMetric.hints:
			result = getDataForHints(lASession);
			break;
		case LearningAnalyticsMetric.videoStops:
			result = getDataForVideoStops(lASession);
			break;
	}
	return result;
}

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
export function getQuizPerWeek(lASession: LearningAnalyticsType) {
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
	return avgWeeks.length > 0 ? Math.round((sum / avgWeeks.length) * 10) / 10 : 0;
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
					label: "Lernkontrollen pro Tag",
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
 * getPreferredLearningTime()
 * Returns the preferred learning time.
 *
 * lASession: learning analytic session data
 */
export function getPreferredLearningTime(lASession: LearningAnalyticsType) {
	const learningTimes = new Map();
	lASession.forEach(session => {
		if (session?.learningAnalytics)
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

function getHighestValue(map: Map<any, any>) {
	return Array.from(map.entries()).reduce((a, b) => (a[1] < b[1] ? b : a))[0];
}
/**
 * getDataForPreferredLearningTime()
 * Returns the preferred learning time as hour for a day. The result is the data for a line chart diagram.
 *
 * lASession: learning analytic session data
 */
export function getDataForPreferredLearningTime(lASession: LearningAnalyticsType) {
	const out: { data: number[]; labels: string[] } = { data: [], labels: [] };

	let hours = new Map();
	let lastsession = format(parseISO(new Date(lASession[0].start).toISOString()), "dd.MM.yyyy");
	let sessionStart = lastsession;
	lASession.forEach(session => {
		sessionStart = format(parseISO(new Date(session.start).toISOString()), "dd.MM.yyyy");
		if (sessionStart !== lastsession) {
			if (hours.size > 0) {
				out.data.push(getHighestValue(hours));
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
		out.data.push(getHighestValue(hours));
		out.labels.push(sessionStart);
	}
	const data = {
		labels: out.labels,
		datasets: [
			{
				label: getMetricName(LearningAnalyticsMetric.preferredLearningTime),
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
 * getDuration()
 * Returns the average learning duration in min.
 *
 * lASession: learning analytic session data
 */
export function getDuration(lASession: LearningAnalyticsType) {
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
	return (count > 0 ? Math.round((duration / count) * 10) / 10 : 0) + " min";
}

/**
 * getDataForDuration()
 * Returns the average learning duration in min for a day. The result is data for a line chart.
 *
 * lASession: learning analytic session data
 */
export function getDataForDuration(lASession: LearningAnalyticsType) {
	const out: { data: number[]; labels: string[] } = { data: [], labels: [] };
	let count = 0;
	let duration = 0;
	let lastsession = format(parseISO(new Date(lASession[0].start).toISOString()), "dd.MM.yyyy");
	let sessionStart = lastsession;
	lASession.forEach(session => {
		sessionStart = format(parseISO(new Date(session.start).toISOString()), "dd.MM.yyyy");
		if (sessionStart !== lastsession) {
			out.data.push(count > 0 ? Math.round((duration / count) * 10) / 10 : 0);
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
	out.data.push(count > 0 ? Math.round((duration / count) * 10) / 10 : 0);
	out.labels.push(sessionStart);
	let data = null;
	if (out)
		data = {
			labels: out.labels,
			datasets: [
				{
					label: getMetricName(LearningAnalyticsMetric.duration),
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
 * getVideoSpeed()
 * Returns the preferred video speed.
 *
 * lASession: learning analytic session data
 */
export function getVideoSpeed(lASession: LearningAnalyticsType) {
	const videoSpeeds = new Map();
	lASession.forEach(session => {
		if (session?.learningAnalytics) {
			session?.learningAnalytics.forEach(learningAnalytics => {
				if (learningAnalytics?.start && learningAnalytics?.videoSpeed != null) {
					if (videoSpeeds.has(learningAnalytics.videoSpeed))
						videoSpeeds.set(
							learningAnalytics.videoSpeed,
							videoSpeeds.get(learningAnalytics.videoSpeed) + 1
						);
					else videoSpeeds.set(learningAnalytics.videoSpeed, 1);
				}
			});
		}
	});
	return Array.from(videoSpeeds).sort((a, b) => (a[1] > b[1] ? -1 : 1))[0][0];
}
/**
 * getDataForVideoSpeed()
 * Returns the preferred video speed for a day. The result is data for a line chart.
 *
 * lASession: learning analytic session data
 */
export function getDataForVideoSpeed(lASession: LearningAnalyticsType) {
	const out: { data: number[]; labels: string[] } = { data: [], labels: [] };
	let videoSpeeds = new Map();
	let lastsession = format(parseISO(new Date(lASession[0].start).toISOString()), "dd.MM.yyyy");
	let sessionStart = lastsession;
	lASession.forEach(session => {
		sessionStart = format(parseISO(new Date(session.start).toISOString()), "dd.MM.yyyy");
		if (sessionStart !== lastsession) {
			if (videoSpeeds.size > 0) {
				out.data.push(getHighestValue(videoSpeeds));
				out.labels.push(lastsession);
				videoSpeeds = new Map();
				lastsession = sessionStart;
			}
		}
		if (session?.learningAnalytics) {
			session.learningAnalytics.forEach(learningAnalytics => {
				if (learningAnalytics.start && learningAnalytics.videoSpeed != null) {
					if (videoSpeeds.has(learningAnalytics.videoSpeed))
						videoSpeeds.set(
							learningAnalytics.videoSpeed,
							videoSpeeds.get(learningAnalytics.videoSpeed) + 1
						);
					else videoSpeeds.set(learningAnalytics.videoSpeed, 1);
				}
			});
		}
	});
	if (videoSpeeds.size > 0) {
		out.data.push(getHighestValue(videoSpeeds));
		out.labels.push(sessionStart);
	}
	const data = {
		labels: out.labels,
		datasets: [
			{
				label: getMetricName(LearningAnalyticsMetric.videoSpeed),
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
 * getVideoDuration()
 * Returns the average video duration in min.
 *
 * lASession: learning analytic session data
 */
export function getVideoDuration(lASession: LearningAnalyticsType) {
	let duration = 0;
	let count = 0;
	lASession.forEach(session => {
		if (session?.learningAnalytics) {
			session?.learningAnalytics.forEach(learningAnalytics => {
				if (learningAnalytics?.videoStart && learningAnalytics?.videoEnd) {
					duration =
						duration +
						(new Date(learningAnalytics.videoEnd).getTime() -
							new Date(learningAnalytics.videoStart).getTime()) /
							60000;
					count = count + 1;
				}
			});
		}
	});
	return (count > 0 ? Math.round((duration / count) * 10) / 10 : 0) + " min";
}

/**
 * getDataForVideoDuration()
 * Returns the average video duration in min for a day. The result is data for a line chart.
 *
 * lASession: learning analytic session data
 */
export function getDataForVideoDuration(lASession: LearningAnalyticsType) {
	const out: { data: number[]; labels: string[] } = { data: [], labels: [] };
	let duration = 0;
	let count = 0;
	let lastsession = format(parseISO(new Date(lASession[0].start).toISOString()), "dd.MM.yyyy");
	let sessionStart = lastsession;
	lASession.forEach(session => {
		sessionStart = format(parseISO(new Date(session.start).toISOString()), "dd.MM.yyyy");
		if (sessionStart !== lastsession) {
			out.data.push(count > 0 ? Math.round((duration / count) * 10) / 10 : 0);
			out.labels.push(lastsession);
			lastsession = sessionStart;
			duration = 0;
			count = 0;
		}
		if (session?.learningAnalytics) {
			session?.learningAnalytics.forEach(learningAnalytics => {
				if (learningAnalytics?.videoStart && learningAnalytics?.videoEnd) {
					duration =
						(new Date(learningAnalytics.videoEnd).getTime() -
							new Date(learningAnalytics.videoStart).getTime()) /
						60000;
					count = count + 1;
				}
			});
		}
	});
	out.data.push(count > 0 ? Math.round((duration / count) * 10) / 10 : 0);
	out.labels.push(sessionStart);
	let data = null;
	if (out)
		data = {
			labels: out.labels,
			datasets: [
				{
					label: getMetricName(LearningAnalyticsMetric.videoDuration),
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
 * getMediaChanges()
 * Returns the average number of media changes in min per day. The result is data for a line chart.
 *
 * lASession: learning analytic session data
 */
export function getMediaChanges(lASession: LearningAnalyticsType) {
	let mediaChanges = 0;
	let count = 0;
	lASession.forEach(session => {
		if (session?.learningAnalytics) {
			session?.learningAnalytics.forEach(learningAnalytics => {
				if (learningAnalytics?.numberOfChangesMediaType != null) {
					mediaChanges = mediaChanges + learningAnalytics.numberOfChangesMediaType;
					count = count + 1;
				}
			});
		}
	});
	return count > 0 ? Math.round((mediaChanges / count) * 10) / 10 : 0;
}

/**
 * getDataMediaChangesDuration()
 * Returns the average number of media changes per day. The result is data for a line chart.
 *
 * lASession: learning analytic session data
 */
export function getDataForMediaChanges(lASession: LearningAnalyticsType) {
	const out: { data: number[]; labels: string[] } = { data: [], labels: [] };
	let mediaChanges = 0;
	let count = 0;
	let lastsession = format(parseISO(new Date(lASession[0].start).toISOString()), "dd.MM.yyyy");
	let sessionStart = lastsession;
	lASession.forEach(session => {
		sessionStart = format(parseISO(new Date(session.start).toISOString()), "dd.MM.yyyy");
		if (sessionStart !== lastsession) {
			out.data.push(count > 0 ? Math.round((mediaChanges / count) * 10) / 10 : 0);
			out.labels.push(lastsession);
			lastsession = sessionStart;
			mediaChanges = 0;
			count = 0;
		}
		if (session?.learningAnalytics) {
			session?.learningAnalytics.forEach(learningAnalytics => {
				if (learningAnalytics?.numberOfChangesMediaType != null) {
					mediaChanges = mediaChanges + learningAnalytics.numberOfChangesMediaType;
					count = count + 1;
				}
			});
		}
	});
	out.data.push(count > 0 ? Math.round((mediaChanges / count) * 10) / 10 : 0);
	out.labels.push(sessionStart);
	let data = null;
	if (out)
		data = {
			labels: out.labels,
			datasets: [
				{
					label: getMetricName(LearningAnalyticsMetric.mediaTypeChanges),
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
 * getPreferredMediaType()
 * Returns the preferred media type.
 *
 * lASession: learning analytic session data
 */
export function getPreferredMediaType(lASession: LearningAnalyticsType) {
	const mediaTypes = new Map();
	lASession.forEach(session => {
		if (session?.learningAnalytics) {
			session?.learningAnalytics.forEach(learningAnalytics => {
				if (learningAnalytics?.start && learningAnalytics?.end) {
					if (mediaTypes.has(learningAnalytics.preferredMediaType))
						mediaTypes.set(
							learningAnalytics.preferredMediaType,
							mediaTypes.get(learningAnalytics.preferredMediaType) + 1
						);
					else mediaTypes.set(learningAnalytics.preferredMediaType, 1);
				}
			});
		}
	});
	return Array.from(mediaTypes).sort((a, b) => (a[1] > b[1] ? -1 : 1))[0][0];
}

/**
 * getDataMediaChangesDuration()
 * Returns the average learning duration in min for a day. The result is data for a line chart.
 *
 * lASession: learning analytic session data
 */
export function getDataForPreferredMediaType(lASession: LearningAnalyticsType) {
	const out: { video: number[]; pdf: number[]; article: number[]; iframe: number[] } = {
		video: [],
		article: [],
		iframe: [],
		pdf: []
	};
	const labels: string[] = [];
	let lastsession = format(parseISO(new Date(lASession[0].start).toISOString()), "dd.MM.yyyy");
	let sessionStart = lastsession;
	let mediaTypes = new Map();
	lASession.forEach(session => {
		if (session?.learningAnalytics) {
			sessionStart = format(parseISO(new Date(session.start).toISOString()), "dd.MM.yyyy");
			if (sessionStart !== lastsession) {
				if (mediaTypes.size > 0) {
					out.video.push(mediaTypes.get("video") ? mediaTypes.get("video") : 0);
					out.article.push(mediaTypes.get("article") ? mediaTypes.get("article") : 0);
					out.pdf.push(mediaTypes.get("pdf") ? mediaTypes.get("pdf") : 0);
					out.iframe.push(mediaTypes.get("iframe") ? mediaTypes.get("iframe") : 0);
					labels.push(lastsession);
					lastsession = sessionStart;
					mediaTypes = new Map();
				}
			}
			session?.learningAnalytics.forEach(learningAnalytics => {
				if (learningAnalytics?.start) {
					if (mediaTypes.has(learningAnalytics.preferredMediaType))
						mediaTypes.set(
							learningAnalytics.preferredMediaType,
							mediaTypes.get(learningAnalytics.preferredMediaType) + 1
						);
					else mediaTypes.set(learningAnalytics.preferredMediaType, 1);
				}
			});
		}
	});
	if (mediaTypes.size > 0) {
		out.video.push(mediaTypes.get("video") ? mediaTypes.get("video") : 0);
		out.article.push(mediaTypes.get("article") ? mediaTypes.get("article") : 0);
		out.pdf.push(mediaTypes.get("pdf") ? mediaTypes.get("pdf") : 0);
		out.iframe.push(mediaTypes.get("iframe") ? mediaTypes.get("iframe") : 0);
		labels.push(sessionStart);
	}
	const data = {
		labels: labels,
		datasets: [
			{
				label: "Video",
				fill: false,
				backgroundColor: "#003f5c",
				borderColor: "#003f5c",
				pointBorderColor: "#003f5c",
				pointBackgroundColor: "#fff",
				pointBorderWidth: 1,
				pointHoverRadius: 5,
				pointHoverBackgroundColor: "#003f5c",
				pointHoverBorderColor: "rgba(220,220,220,1)",
				pointHoverBorderWidth: 2,
				pointRadius: 1,
				pointHitRadius: 10,
				data: out.video
			},
			{
				label: "PDF",
				fill: false,
				backgroundColor: "#7a5195",
				borderColor: "#7a5195",
				pointBorderColor: "#7a5195",
				pointBackgroundColor: "#fff",
				pointBorderWidth: 1,
				pointHoverRadius: 5,
				pointHoverBackgroundColor: "#7a5195",
				pointHoverBorderColor: "rgba(220,220,220,1)",
				pointHoverBorderWidth: 2,
				pointRadius: 1,
				pointHitRadius: 10,
				data: out.pdf
			},
			{
				label: "iFrame",
				fill: false,
				backgroundColor: "#ef5675",
				borderColor: "#ef5675",
				pointBorderColor: "#ef5675",
				pointBackgroundColor: "#fff",
				pointBorderWidth: 1,
				pointHoverRadius: 5,
				pointHoverBackgroundColor: "#ef5675",
				pointHoverBorderColor: "rgba(220,220,220,1)",
				pointHoverBorderWidth: 2,
				pointRadius: 1,
				pointHitRadius: 10,
				data: out.iframe
			},
			{
				label: "Artikel",
				fill: false,
				backgroundColor: "#ffa600",
				borderColor: "#ffa600",
				pointBorderColor: "#ffa600",
				pointBackgroundColor: "#fff",
				pointBorderWidth: 1,
				pointHoverRadius: 5,
				pointHoverBackgroundColor: "#ffa600",
				pointHoverBorderColor: "rgba(220,220,220,1)",
				pointHoverBorderWidth: 2,
				pointRadius: 1,
				pointHitRadius: 10,
				data: out.article
			}
		]
	};
	return data;
}

/**
 * getAnswers()
 * Returns the average number of right and wrong numbers of answers.
 *
 * lASession: learning analytic session data
 */
export function getAnswers(lASession: LearningAnalyticsType) {
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

function getAverage(sum: number, count: number, digits: number) {
	return count > 0 ? (Math.round((sum / count) * 10 * digits) / 10) * digits : 0;
}

/**
 * getDataForAnswers()
 * Returns the average number of right and wrong numbers of answers per day. The result is data for a line chart.
 *
 * lASession: learning analytic session data
 */
export function getDataForAnswers(lASession: LearningAnalyticsType) {
	const dataPoints: { correct: number[]; incorrect: number[] } = { correct: [], incorrect: [] };
	const labels: string[] = [];
	let correct = 0;
	let incorrect = 0;
	let countCorrect = 0;
	let countIncorrect = 0;
	let lastsession = format(parseISO(new Date(lASession[0].start).toISOString()), "dd.MM.yyyy");
	let sessionStart = lastsession;
	lASession.forEach(session => {
		sessionStart = format(parseISO(new Date(session.start).toISOString()), "dd.MM.yyyy");
		if (sessionStart !== lastsession) {
			dataPoints.correct.push(getAverage(correct, countCorrect, 1));
			dataPoints.incorrect.push(getAverage(incorrect, countIncorrect, 1));
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
	dataPoints.correct.push(getAverage(correct, countCorrect, 1));
	dataPoints.incorrect.push(getAverage(incorrect, countIncorrect, 1));
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

/**
 * getHints()
 * Returns the average number of hints.
 *
 * lASession: learning analytic session data
 */
export function getHints(lASession: LearningAnalyticsType) {
	let hints = 0;
	let count = 0;
	lASession.forEach(session => {
		if (session?.learningAnalytics) {
			session?.learningAnalytics.forEach(learningAnalytics => {
				if (learningAnalytics.numberOfUsedHints != null) {
					hints = hints + learningAnalytics.numberOfUsedHints;
					count = count + 1;
				}
			});
		}
	});
	return count > 0 ? Math.round((hints / count) * 10) / 10 : 0;
}

/**
 * getDataForHints()
 * Returns the average number of hints per day. The result is data for a line chart.
 *
 * lASession: learning analytic session data
 */
export function getDataForHints(lASession: LearningAnalyticsType) {
	const out: { data: number[]; labels: string[] } = { data: [], labels: [] };
	let hints = 0;
	let count = 0;
	let lastsession = format(parseISO(new Date(lASession[0].start).toISOString()), "dd.MM.yyyy");
	let sessionStart = lastsession;
	lASession.forEach(session => {
		sessionStart = format(parseISO(new Date(session.start).toISOString()), "dd.MM.yyyy");
		if (sessionStart !== lastsession) {
			out.data.push(count > 0 ? Math.round((hints / count) * 10) / 10 : 0);
			out.labels.push(lastsession);
			lastsession = sessionStart;
			hints = 0;
			count = 0;
		}
		if (session?.learningAnalytics) {
			session?.learningAnalytics.forEach(learningAnalytics => {
				if (learningAnalytics.numberOfUsedHints != null) {
					hints = hints + learningAnalytics.numberOfUsedHints;
					count++;
				}
			});
		}
	});
	out.data.push(count > 0 ? Math.round((hints / count) * 10) / 10 : 0);
	out.labels.push(sessionStart);
	let data = null;
	if (out)
		data = {
			labels: out.labels,
			datasets: [
				{
					label: getMetricName(LearningAnalyticsMetric.hints),
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
 * getVideoStops()
 * Returns the average number of stops per video.
 *
 * lASession: learning analytic session data
 */
export function getVideoStops(lASession: LearningAnalyticsType) {
	let stops = 0;
	let count = 0;
	lASession.forEach(session => {
		if (session?.learningAnalytics) {
			session?.learningAnalytics.forEach(learningAnalytics => {
				if (learningAnalytics?.videoBreaks && learningAnalytics.videoBreaks != null) {
					stops = stops + learningAnalytics.videoBreaks;
					count = count + 1;
				}
			});
		}
	});
	return count > 0 ? Math.round((stops / count) * 10) / 10 : 0;
}

/**
 * getDataForVideoStops()
 * Returns the average number of stops of a video for a day. The result is data for a line chart.
 *
 * lASession: learning analytic session data
 */
export function getDataForVideoStops(lASession: LearningAnalyticsType) {
	const out: { data: number[]; labels: string[] } = { data: [], labels: [] };
	let stops = 0;
	let count = 0;
	let lastsession = format(parseISO(new Date(lASession[0].start).toISOString()), "dd.MM.yyyy");
	let sessionStart = lastsession;
	lASession.forEach(session => {
		sessionStart = format(parseISO(new Date(session.start).toISOString()), "dd.MM.yyyy");
		if (sessionStart !== lastsession) {
			out.data.push(count > 0 ? Math.round((stops / count) * 10) / 10 : 0);
			out.labels.push(lastsession);
			lastsession = sessionStart;
			stops = 0;
			count = 0;
		}
		if (session?.learningAnalytics) {
			session?.learningAnalytics.forEach(learningAnalytics => {
				if (learningAnalytics?.videoBreaks && learningAnalytics.videoBreaks != null) {
					stops = stops + learningAnalytics.videoBreaks;
					count = count + 1;
				}
			});
		}
	});
	out.data.push(count > 0 ? Math.round((stops / count) * 10) / 10 : 0);
	out.labels.push(sessionStart);
	let data = null;
	if (out)
		data = {
			labels: out.labels,
			datasets: [
				{
					label: getMetricName(LearningAnalyticsMetric.videoStops),
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
 * getMetric()
 * Returns all metrics and the collected or calculated values for the specific metrics.
 *
 * lASession: learning analytic session data
 */
export function getMetrics(lASession: LearningAnalyticsType) {
	const metric = [
		{
			metric: LearningAnalyticsMetric.preferredLearningTime,
			value: getPreferredLearningTime(lASession)
		},
		{
			metric: LearningAnalyticsMetric.duration,
			value: getDuration(lASession)
		},
		{
			metric: LearningAnalyticsMetric.videoSpeed,
			value: getVideoSpeed(lASession)
		},
		{
			metric: LearningAnalyticsMetric.videoDuration,
			value: getVideoDuration(lASession)
		},
		{
			metric: LearningAnalyticsMetric.videoStops,
			value: getVideoStops(lASession)
		},
		{
			metric: LearningAnalyticsMetric.mediaTypeChanges,
			value: getMediaChanges(lASession)
		},
		{
			metric: LearningAnalyticsMetric.preferredMediaType,
			value: getPreferredMediaType(lASession)
		},
		{
			metric: LearningAnalyticsMetric.anzQuizPerWeek,
			value: getQuizPerWeek(lASession)
		},
		{
			metric: LearningAnalyticsMetric.answers,
			value: getAnswers(lASession)
		},
		{
			metric: LearningAnalyticsMetric.hints,
			value: getHints(lASession)
		}
	];

	return metric;
}

export function LearningAnalyticsSession() {
	const { mutateAsync: createLASession } = trpc.learningAnalytics.createSession.useMutation();
	const { mutateAsync: setEndOfSession } = trpc.learningAnalytics.setEndOfSession.useMutation();
	const { mutateAsync: createLearningAnalytics } =
		trpc.learningAnalytics.createLearningAnalytics.useMutation();

	// Learning Analytics: Session handling
	useEffect(() => {
		const handleClose = () => {
			const laSession = JSON.parse(localStorage.getItem("la_session") + "");
			if (laSession && laSession !== "" && laSession.start) {
				laSession.end = "" + new Date();
				window.localStorage.setItem("la_session", JSON.stringify(laSession));
			}
		};

		window.addEventListener("unload", handleClose, false);
		return () => {
			window.removeEventListener("unload", handleClose);
		};
	}, [createLearningAnalytics, setEndOfSession]);

	useEffect(() => {
		const setData = async () => {
			const data = saveLA();
			if (data) {
				try {
					await createLearningAnalytics(data);
					const date = new Date();
					const isoDateTime = new Date(
						date.getTime() - date.getTimezoneOffset() * 60000
					).toISOString();
					await setEndOfSession({ end: isoDateTime, id: data.sessionId });
				} catch (e) {
					resetLASession();
				}
			}
			resetLASession();
		};
		const createNewLASession = async () => {
			window.localStorage.setItem(
				"la_session",
				JSON.stringify({ start: "" + new Date(), end: "", id: "" })
			);
			const id = await createLASession();
			window.localStorage.setItem(
				"la_session",
				JSON.stringify({ start: "" + new Date(), end: "", id: id.id })
			);
		};
		const laSession = JSON.parse(localStorage.getItem("la_session") + "");
		const start = laSession
			? format(parseISO(new Date(laSession.start).toISOString()), "dd.MM.yyyy")
			: "";
		const today = format(parseISO(new Date().toISOString()), "dd.MM.yyyy");

		if (!(laSession && laSession !== "")) {
			createNewLASession();
		} else if (laSession.start !== "" && laSession.end !== "" && start !== today) {
			setData();
		}
	}, [createLASession, createLearningAnalytics, setEndOfSession]);

	return null;
}

export function LearningAnalyticsLesson({ lesson, course }: LessonLayoutProps) {
	// Learning Analytics: navigate from page
	const router = useRouter();
	const { mutateAsync: createLearningAnalytics } =
		trpc.learningAnalytics.createLearningAnalytics.useMutation();

	useEffect(() => {
		const saveData = async () => {
			const data = saveLA();
			if (data) {
				try {
					await createLearningAnalytics(data);
				} catch (e) {}
			}
		};
		const navigateFromPage = (url: string) => {
			if (!url.includes(lesson.slug)) {
				saveEnds();
				saveData();
			}
			const lALessonInfo = JSON.parse(localStorage.getItem("la_lessonInfo") + "");
			if (lALessonInfo && lALessonInfo !== "") {
				lALessonInfo.end = "" + new Date();
				window.localStorage.setItem("la_lessonInfo", JSON.stringify(lALessonInfo));
			}
		};
		router.events.on("routeChangeStart", navigateFromPage);
		return () => {
			router.events.off("routeChangeStart", navigateFromPage);
		};
	}, [createLearningAnalytics, lesson.slug, router.events]);

	// Learning Analytics: init or save lesson info
	useEffect(() => {
		const saveData = async () => {
			const data = saveLA();
			if (data) {
				try {
					await createLearningAnalytics(data);
				} catch (e) {}
			}
		};
		if (window !== undefined) {
			const lALessonInfo = JSON.parse(localStorage.getItem("la_lessonInfo") + "");
			if (lALessonInfo && lALessonInfo !== "") {
				if (lALessonInfo.lessonId !== lesson.lessonId) {
					saveData();
					window.localStorage.setItem(
						"la_lessonInfo",
						JSON.stringify({
							lessonId: lesson.lessonId,
							courseId: course.courseId,
							start: "" + new Date(),
							end: "",
							source: document.referrer
						})
					);
				}
			} else {
				window.localStorage.setItem(
					"la_lessonInfo",
					JSON.stringify({
						lessonId: lesson.lessonId,
						courseId: course.courseId,
						start: "" + new Date(),
						end: "",
						source: document.referrer
					})
				);
			}
		}
	}, [course.courseId, createLearningAnalytics, lesson.lessonId]);
	return null;
}

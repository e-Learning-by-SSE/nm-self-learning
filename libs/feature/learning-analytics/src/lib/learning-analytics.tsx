import { trpc } from "@self-learning/api-client";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { LessonLayoutProps } from "@self-learning/lesson";
import { formatDate } from "./auxillary";

export function notNull<T>(val: T | null): val is T {
	return val != null;
}

export type LearningAnalyticsType = {
	start: Date;
	end: Date | null;
	learningAnalytics: SessionType[];
}[];

export type SessionType = {
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
};

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
 * When saving a session, the end time of consumed learning content & quizzes will be saved.
 * This will check if the end times are specified or can be loaded from the local storage, i.e.,
 * after the user has closed the website and started a new session at a later time.
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
 * Computes the preferred media type and the number media type changes.
 *
 * Preferred media type: This is computed based on the maximum amount of
 * content changes (not duration) of a specific media type.
 * A changes would required to implement distinct timer hooks and local
 * storage items for each media type.
 *
 * Number of changes media type: The sum of all media type changes.
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
 * Enables the recording of Learning Analytics Sessions for the whole application.
 * Session Handling: Ensures that on all sides learning analytics can be recorded and saved.
 *
 * Records the current session in the local storage after leaving/closing the website and will
 * copy locally saved sessions when re-entering the website. This procedure is chosen, as all
 * hooks are disabled and saving of incomplete data cannot be guaranteed after the "leaving the site"
 * event was triggered.
 *
 * Each session has an unique ID to ensure that sessions are not mixed when the user changes its browser,
 * e.g., when leaving switching from PC to mobile device. Incomplete sessions may only get lost,
 * when the user cleared his locally storage.
 *
 * @returns An empty component (no rendering, but session handling)
 */
export function LearningAnalyticsProvider() {
	const { mutateAsync: createLASession } = trpc.learningAnalytics.createSession.useMutation();
	const { mutateAsync: setEndOfSession } = trpc.learningAnalytics.setEndOfSession.useMutation();
	const { mutateAsync: createLearningAnalytics } =
		trpc.learningAnalytics.createLearningAnalytics.useMutation();

	// Learning Analytics: Session handling
	// Sets the end of the session in the local storage after leaving the website
	// This data will be copied to the database after re-entering the website.
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

	// Creates a new session and saves a previously started session if there is an incomplete one.
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
					// TODO SE: @ Fabian: Please clarify why the session is reset and not a new one is created
					resetLASession();
				}
			}
			// TODO SE: @ Fabian: Please clarify why the session is reset and not a new one is created
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
		const start = laSession ? formatDate(laSession.start) : "";
		const today = formatDate(new Date());

		if (!(laSession && laSession !== "")) {
			createNewLASession();
		} else if (laSession.start !== "" && laSession.end !== "" && start !== today) {
			// Stores the previous session if exists and starts a new one
			// TODO SE: @ Fabian: Please clarify why the session is reset and not a new one is created
			setData();
		}
	}, [createLASession, createLearningAnalytics, setEndOfSession]);

	return null;
}

/**
 * When the user ends a lesson / moves to another one / quits a lesson / ... the learning analytics for the current
 * lesson will be recorded and saved to the database (because website is still running).
 *
 * @param lesson The currently displayed lesson
 * @param course The currently displayed course
 * @returns An empty component (no rendering, but session handling)
 */
export function LearningAnalyticsLesson({ lesson, course }: LessonLayoutProps) {
	// Learning Analytics: navigate from page
	const router = useRouter();
	const { mutateAsync: createLearningAnalytics } =
		trpc.learningAnalytics.createLearningAnalytics.useMutation();

	// Stores the data of the current session when leaving a lesson
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

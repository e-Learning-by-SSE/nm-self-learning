import { trpc } from "@self-learning/api-client";
import { format, parseISO } from "date-fns";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { LessonLayoutProps } from "@self-learning/lesson";

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

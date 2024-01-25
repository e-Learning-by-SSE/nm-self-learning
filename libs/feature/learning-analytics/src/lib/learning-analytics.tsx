import { trpc } from "@self-learning/api-client";

export function createSession() {
	const { mutateAsync: createLASession } = trpc.learningAnalytics.createSession.useMutation();
	const lASessionDb = createLASession();
	return lASessionDb;
}

export function getSessionInfo() {
	let lASession = JSON.parse(localStorage.getItem("la_session") + "");
	if (!(lASession && lASession !== "")) {
		lASession = { start: null, end: null, sessionId: null };
	}
	return lASession;
}

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
export function getVideoInfo() {
	const timestamp = new Date();
	let lAVideoInfo = JSON.parse(localStorage.getItem("la_videoInfo") + "");
	if (lAVideoInfo && lAVideoInfo !== "") {
		if (lAVideoInfo.start !== "" && lAVideoInfo.end === "") {
			lAVideoInfo.end = timestamp;
		} else if (lAVideoInfo.start === "") {
			lAVideoInfo.start = null;
			lAVideoInfo.end = null;
			lAVideoInfo.speed = null;
			lAVideoInfo.stops = null;
		}
	} else {
		lAVideoInfo = null;
	}
	return lAVideoInfo;
}

export function getQuizInfo() {
	const timestamp = new Date();
	let lAQuizInfo = JSON.parse(localStorage.getItem("la_quizInfo") + "");
	if (lAQuizInfo && lAQuizInfo !== "") {
		if (lAQuizInfo.start !== "" && lAQuizInfo.end === "") {
			lAQuizInfo.end = timestamp;
		} else if (lAQuizInfo.start === "") {
			lAQuizInfo.start = null;
			lAQuizInfo.end = null;
			lAQuizInfo.hint = null;
			lAQuizInfo.right = null;
			lAQuizInfo.wrong = null;
		}
	} else {
		lAQuizInfo = null;
	}
	return lAQuizInfo;
}
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

export async function resetLASession() {
	window.localStorage.removeItem("la_session");
	window.localStorage.removeItem("la_lessonInfo");
	window.localStorage.removeItem("la_videoInfo");
	window.localStorage.removeItem("la_numberOfChangesMediaType");
	window.localStorage.removeItem("la_quizInfo");
}

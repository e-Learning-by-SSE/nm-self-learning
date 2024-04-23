import { trpc } from "@self-learning/api-client";
import router, { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { LessonLayoutProps } from "@self-learning/lesson";
import { KeysOfType } from "./auxillary";
import { Switch } from "@headlessui/react";
import { ButtonActions, SimpleDialogXL, showToast } from "@self-learning/ui/common";
import { TRPCClientError } from "@trpc/client";
import {
	LessonInfoType,
	MediaTypeChangesInfoType,
	MediaTypeInfoType,
	QuizInfoType,
	SessionInfoType,
	StorageKeys,
	VideoInfoType
} from "@self-learning/types";

export function notNull<T>(val: T | null): val is T {
	return val != null;
}

export function loadFromStorage<T>(key: StorageKeys): T | null {
	const rawData = localStorage.getItem(key);
	let data: T | null = null;
	if (rawData) {
		data = JSON.parse(rawData) as T;
	}
	return data;
}

export function saveToStorage<T>(key: StorageKeys, data: T) {
	window.localStorage.setItem(key, JSON.stringify(data));
}

export function addMediaTypeChanges(property: KeysOfType<MediaTypeChangesInfoType, number | null>) {
	const mediaTypeChanges = loadFromStorage<MediaTypeChangesInfoType>(StorageKeys.LAMediaType);
	if (mediaTypeChanges) {
		if (mediaTypeChanges[property]) {
			mediaTypeChanges[property]++;
		} else {
			mediaTypeChanges[property] = 1;
		}
		saveToStorage<MediaTypeChangesInfoType>(StorageKeys.LAMediaType, mediaTypeChanges);
	}
}

/**
 * When saving a session, the end time of consumed learning content & quizzes will be saved.
 * This will check if the end times are specified or can be loaded from the local storage, i.e.,
 * after the user has closed the website and started a new session at a later time.
 */
export function saveEnds() {
	const lASession = loadFromStorage<SessionInfoType>(StorageKeys.LASession);
	const lALessonInfo = loadFromStorage<LessonInfoType>(StorageKeys.LALesson);
	const lAVideoInfo = loadFromStorage<VideoInfoType>(StorageKeys.LAVideo);
	const lAQuizInfo = loadFromStorage<QuizInfoType>(StorageKeys.LAQuiz);

	const endDates = [
		lASession?.end ? new Date(lASession.end).getTime() : 0,
		lALessonInfo?.end ? new Date(lALessonInfo.end).getTime() : 0,
		lAVideoInfo?.videoEnd ? new Date(lAVideoInfo.videoEnd).getTime() : 0,
		lAQuizInfo?.quizEnd ? new Date(lAQuizInfo.quizEnd).getTime() : 0
	];

	const maxDate = new Date(Math.max(...endDates));

	if (lALessonInfo?.start != null && lALessonInfo.end == null) {
		lALessonInfo.end = maxDate;
		saveToStorage<LessonInfoType>(StorageKeys.LALesson, lALessonInfo);
	}
	if (lAVideoInfo?.videoStart != null && lAVideoInfo.videoEnd == null) {
		lAVideoInfo.videoEnd = maxDate;
		saveToStorage<VideoInfoType>(StorageKeys.LAVideo, lAVideoInfo);
	}
	if (lAQuizInfo?.quizStart != null && lAQuizInfo.quizEnd == null) {
		lAQuizInfo.quizEnd = maxDate;
		saveToStorage<QuizInfoType>(StorageKeys.LAQuiz, lAQuizInfo);
	}
}

/**
 * Saves all learning analytic data from the local storage in the database.
 *
 * @return The new entry for the learning analytics that was saved in the database.
 */
export function saveLA() {
	saveEnds();
	const lASession = loadFromStorage<SessionInfoType>(StorageKeys.LASession);
	const lALessonInfo = loadFromStorage<LessonInfoType>(StorageKeys.LALesson);
	const lAVideoInfo = loadFromStorage<VideoInfoType>(StorageKeys.LAVideo);
	const lAQuizInfo = loadFromStorage<QuizInfoType>(StorageKeys.LAQuiz);
	const lAMediaType = getMediaType();
	let data = null;
	if (
		lALessonInfo?.lessonId != null &&
		lALessonInfo?.courseId != null &&
		lASession?.start != null
	) {
		resetLA();
		console.log(lAQuizInfo);
		data = {
			sessionId: lASession.id ? lASession.id : -1,
			lessonId: lALessonInfo.lessonId,
			courseId: lALessonInfo.courseId,
			start: parseDateToISOString(lALessonInfo?.start),
			end: parseDateToISOString(lALessonInfo?.end),
			quizStart: parseDateToISOString(lAQuizInfo?.quizStart),
			quizEnd: parseDateToISOString(lAQuizInfo?.quizEnd),
			numberCorrectAnswers: checkUndefined<number>(lAQuizInfo?.numberCorrectAnswers),
			numberIncorrectAnswers: checkUndefined<number>(lAQuizInfo?.numberIncorrectAnswers),
			numberOfUsedHints: checkUndefined<number>(lAQuizInfo?.numberOfUsedHints),
			numberOfChangesMediaType: lAMediaType.numberOfChangesMediaType,
			preferredMediaType: lAMediaType?.preferredMediaType,
			videoStart: parseDateToISOString(lAVideoInfo?.videoStart),
			videoEnd: parseDateToISOString(lAVideoInfo?.videoEnd),
			videoBreaks: checkUndefined<number>(lAVideoInfo?.videoBreaks),
			videoSpeed: checkUndefined<number>(lAVideoInfo?.videoSpeed)
		};
		console.log(data);
	}
	return data;
}

/**
 * 	Checks if an object is undefined.
 *
 * @param data object that will be checked for undefined.
 * @returns null for undefined objects or the object itself.
 */
export function checkUndefined<T>(data: T | null | undefined): T | null {
	if (data === undefined) return null;
	else return data;
}

/**
 * 	Checks if a date is undefined or null or parse it to ISOString.
 *
 * @param data date that will be checked for undefined.
 * @returns null for undefined objects or a date ISOString.
 */
export function parseDateToISOString(data: Date | null | undefined): string | null {
	if (data === undefined || data == null) return null;
	else return new Date(data).toISOString();
}

/**
 * Computes the preferred media type and the number media type changes.
 *
 * Preferred media type: This is computed based on the maximum amount of
 * content changes (not duration) of a specific media type.
 * A changes would required to implement distinct timer hooks and local
 * storage items for each media type.
 *
 * @return Number of changes media type: The sum of all media type changes.
 */
export function getMediaType(): MediaTypeInfoType {
	const lAMediaTypeInfo: MediaTypeInfoType = {
		numberOfChangesMediaType: null,
		preferredMediaType: null
	};
	const lANumberOfChangesMediaType = loadFromStorage<MediaTypeChangesInfoType>(
		StorageKeys.LAMediaType
	);
	if (lANumberOfChangesMediaType) {
		lAMediaTypeInfo.numberOfChangesMediaType =
			lANumberOfChangesMediaType.video +
			lANumberOfChangesMediaType.pdf +
			lANumberOfChangesMediaType.iframe +
			lANumberOfChangesMediaType.article;
		let max = lANumberOfChangesMediaType.video;
		if (lANumberOfChangesMediaType.article > max) {
			max = lANumberOfChangesMediaType.article;
			lAMediaTypeInfo.preferredMediaType = "article";
		}
		if (lANumberOfChangesMediaType.pdf > max) {
			max = lANumberOfChangesMediaType.pdf;
			lAMediaTypeInfo.preferredMediaType = "pdf";
		}
		if (lANumberOfChangesMediaType.iframe > max) {
			lAMediaTypeInfo.preferredMediaType = "iframe";
		}
	}
	return lAMediaTypeInfo;
}

/**
 * Clears the local storage from all learning analytic data.
 *
 */
export async function resetLASession() {
	window.localStorage.removeItem(StorageKeys.LASession);
	window.localStorage.removeItem(StorageKeys.LALesson);
	window.localStorage.removeItem(StorageKeys.LAVideo);
	window.localStorage.removeItem(StorageKeys.LAMediaType);
	window.localStorage.removeItem(StorageKeys.LAQuiz);
}

/**
 * Clears the local storage from video, media changes and quiz learning analytic data.
 *
 */
export async function resetLA() {
	window.localStorage.removeItem(StorageKeys.LAVideo);
	window.localStorage.removeItem(StorageKeys.LAMediaType);
	window.localStorage.removeItem(StorageKeys.LAQuiz);
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
	const { data: systemAnalytics } = trpc.me.systemAnalyticsAgreement.useQuery();

	// Learning Analytics: Session handling
	// Sets the end of the session in the local storage after leaving the website
	// This data will be copied to the database after re-entering the website.
	useEffect(() => {
		const handleClose = () => {
			const laSession = loadFromStorage<SessionInfoType>(StorageKeys.LASession);
			if (laSession?.start) {
				laSession.end = new Date();
				saveToStorage<SessionInfoType>(StorageKeys.LASession, laSession);
			}
		};
		// Events from different browser desktop and mobile https://stackoverflow.com/questions/61351103/jquery-detect-mobile-browser-close-event
		// Chrome (desktop) - change tab, close tab, close browser
		// Safari (desktop) - refresh, close tab, close browser
		// Firefox (desktop) - close browser
		window.addEventListener("beforeunload", handleClose, false);
		// Chrome (mobile) - refresh, navigate away
		// Safari (desktop) - navigate away
		// Safari (mobile) - refresh, navigate away
		// Firefox (mobile) - refresh, navigate away
		window.addEventListener("pagehide", handleClose, false);
		// Chrome (desktop) - refresh, navigate away
		// Chrome (mobile) - background mode
		// Safari (desktop) - change tab
		// Safari (mobile) - background mode
		// Firefox (desktop) - refresh, navigate away, change tab, close tab
		// Firefox (mobile) - background mode
		window.addEventListener(
			"visibilitychange",
			() => {
				if (document.visibilityState === "hidden") handleClose();
			},
			false
		);
		return () => {
			window.removeEventListener("beforeunload", handleClose);
			window.removeEventListener("pagehide", handleClose);
			window.removeEventListener("visibilitychange", handleClose);
		};
	}, []);

	// Creates a new session and saves a previously started session if there is an incomplete one.
	useEffect(() => {
		const saveData = async () => {
			const data = saveLA();
			if (data) {
				try {
					const laSession = loadFromStorage<SessionInfoType>(StorageKeys.LASession);
					// Checks if a session is available
					if (laSession) {
						if (laSession.end == null) {
							laSession.end = new Date();
						}
						// Checks if the session is in the database
						if (data.sessionId < 0) {
							const session = await createLASession({
								start: new Date(laSession.start).toISOString(),
								end: new Date(laSession.end).toISOString()
							});
							data.sessionId = session.id;
						}
						// Saves last learning Analytics and end date of a session
						await createLearningAnalytics(data);
						await setEndOfSession({
							end: new Date(laSession.end).toISOString(),
							id: data.sessionId
						});
					}
				} catch (e) {}
			}
			resetLASession();
			createNewLASession();
		};

		const createNewLASession = async () => {
			saveToStorage<SessionInfoType>(StorageKeys.LASession, {
				start: new Date(),
				end: null,
				id: null
			});
		};

		if (systemAnalytics?.systemAnalyticsAgreement) {
			const laSession = loadFromStorage<SessionInfoType>(StorageKeys.LASession);
			if (!laSession) {
				createNewLASession();
			} else if (laSession.start !== null && laSession.end !== null) {
				const end = laSession.end;
				const now = new Date();
				now.setMinutes(new Date().getMinutes() - 30);
				// Stores the previous session if exists and starts a new one
				if (now > end) saveData();
			}
		}
	}, [
		createLASession,
		createLearningAnalytics,
		setEndOfSession,
		systemAnalytics?.systemAnalyticsAgreement
	]);

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
	const { data: systemAnalytics } = trpc.me.systemAnalyticsAgreement.useQuery();
	const { mutateAsync: createLASession } = trpc.learningAnalytics.createSession.useMutation();
	// Stores the data of the current session when leaving a lesson
	useEffect(() => {
		const saveData = async () => {
			if (systemAnalytics?.systemAnalyticsAgreement) {
				const data = saveLA();
				if (data) {
					try {
						// Checks if the session is not in the database id < 0
						if (data.sessionId < 0) {
							const laSession = loadFromStorage<SessionInfoType>(
								StorageKeys.LALesson
							);
							// Creates new Session in the database if session data is available
							if (laSession) {
								const session = await createLASession({
									start: new Date(laSession.start).toISOString(),
									end: parseDateToISOString(laSession?.end)
								});
								laSession.id = session.id;
								saveToStorage<SessionInfoType>(StorageKeys.LASession, laSession);
								data.sessionId = session.id;
								await createLearningAnalytics(data);
							}
						} else {
							await createLearningAnalytics(data);
						}
					} catch (e) {}
				}
			}
		};
		const navigateFromPage = (url: string) => {
			const lALessonInfo = loadFromStorage<LessonInfoType>(StorageKeys.LALesson);
			if (lALessonInfo?.start != null) {
				lALessonInfo.end = new Date();
				saveToStorage<LessonInfoType>(StorageKeys.LALesson, lALessonInfo);
			}
			if (!url.includes(lesson.slug)) {
				saveData();
			}
		};
		router.events.on("routeChangeStart", navigateFromPage);
		return () => {
			router.events.off("routeChangeStart", navigateFromPage);
		};
	}, [
		createLASession,
		createLearningAnalytics,
		lesson.slug,
		router.events,
		systemAnalytics?.systemAnalyticsAgreement
	]);

	// Learning Analytics: init or save lesson info
	useEffect(() => {
		const saveData = async () => {
			if (systemAnalytics?.systemAnalyticsAgreement) {
				const data = saveLA();
				if (data) {
					try {
						await createLearningAnalytics(data);
					} catch (e) {}
				}
			}
		};
		if (window !== undefined) {
			const lALessonInfo = loadFromStorage<LessonInfoType>(StorageKeys.LALesson);
			if (lALessonInfo?.start != null) {
				if (lALessonInfo.lessonId !== lesson.lessonId) {
					saveData();
				}
			}
			saveToStorage<LessonInfoType>(StorageKeys.LALesson, {
				lessonId: lesson.lessonId,
				courseId: course.courseId,
				start: new Date(),
				end: null
			});
		}
	}, [
		course.courseId,
		createLearningAnalytics,
		lesson.lessonId,
		systemAnalytics?.systemAnalyticsAgreement
	]);
	return null;
}

/**
 * Component for managing the opt-in for learning analytics. It contains two dialogs for the consent to either save
 * all information required for learning analytics or to delete all entries in the database for the active user.
 *
 * @returns A headlessui switch component with two dialogs
 */
export function SystemAnalyticsAgreementToggle() {
	const { mutateAsync: updateStudent } =
		trpc.me.updateStudentSystemAnalyticsAgreement.useMutation();
	const { mutateAsync: deleteLearningAnalytics } =
		trpc.learningAnalytics.deleteSessions.useMutation();
	const { data: systemAnalytics } = trpc.me.systemAnalyticsAgreement.useQuery();
	const [enabled, setEnabled] = useState(false);
	const [enabledDialog, setEnabledDialog] = useState(false);

	// fetch initial value for the switch component from the database
	useEffect(() => {
		if (systemAnalytics) setEnabled(systemAnalytics.systemAnalyticsAgreement);
	}, [systemAnalytics]);

	// enables the dialogs
	function toggleDialog(enabled: boolean) {
		setEnabled(enabled);
		setEnabledDialog(true);
	}

	/**
	 * Evaluation of the user's decision to activate the learning analysis and update
	 * the user information in the database.
	 *
	 * @param action dialog result for enable the learning analytics (Cancel | OK)
	 */
	async function agreeToSystemAnalytics(action: ButtonActions) {
		if (action === ButtonActions.CANCEL) {
			setEnabled(false);
		} else {
			try {
				const updated = await updateStudent({ agreement: true });
				showToast({
					type: "success",
					title: "Zustimmung für die Nutzung der Lernstatistik",
					subtitle: updated.name
				});
				setEnabled(true);
				router.replace(router.asPath);
			} catch (error) {
				console.error(error);
				if (error instanceof TRPCClientError) {
					showToast({ type: "error", title: "Fehler", subtitle: error.message });
				}
			}
		}
		setEnabledDialog(false);
	}

	/**
	 * Evaluate the user's decision to deactivate the learning analysis and update the user information
	 * and delete all corresponding entries from the learning analysis in the database.
	 *
	 * @param action dialog result for the deactivation of learning analytics (Cancel | OK)
	 */
	async function disagreeToSystemAnalytics(action: ButtonActions) {
		if (action === ButtonActions.CANCEL) {
			setEnabled(true);
		} else {
			try {
				await deleteLearningAnalytics();
				resetLASession();
				const updated = await updateStudent({ agreement: false });
				showToast({
					type: "success",
					title: "Nutzung der Lernstatistik deaktivieren",
					subtitle: updated.name
				});
				setEnabled(false);
				router.replace(router.asPath);
			} catch (error) {
				console.error(error);

				if (error instanceof TRPCClientError) {
					showToast({ type: "error", title: "Fehler", subtitle: error.message });
				}
			}
		}
		setEnabledDialog(false);
	}
	//TODO SE: Update information on the dialogs (e.g. suitable data protection notice)
	return (
		<div>
			<Switch
				checked={enabled}
				onChange={toggleDialog}
				className={`${
					enabled ? "bg-blue-600" : "bg-gray-200"
				} relative inline-flex h-6 w-11 items-center rounded-full`}
			>
				<span className="sr-only">Enable notifications</span>
				<span
					className={`${
						enabled ? "translate-x-6" : "translate-x-1"
					} inline-block h-4 w-4 transform rounded-full bg-white transition`}
				/>
			</Switch>
			{enabled && enabledDialog && (
				<SimpleDialogXL name={"Lernstatistiken"} onClose={agreeToSystemAnalytics}>
					<span>
						Wir möchten Sie bitten, uns Ihre Einwilligung zur Speicherung und
						Verarbeitung Ihrer personenbezogenen Daten zu erteilen. Diese Daten umfassen
						Information über Ihr Lernverhalten. Nach Ihrer Bestätigung können sie auf
						Ihre persönliche Lernstatistik zugreifen.
					</span>
				</SimpleDialogXL>
			)}
			{!enabled && enabledDialog && (
				<SimpleDialogXL name={"Lernstatistiken"} onClose={disagreeToSystemAnalytics}>
					<span>
						Durch die Deaktivierung der Lernstatistik werden alle gespeicherten Daten
						von Ihnen gelöscht. Sind Sie sicher, das Sie die Lernstatistiken
						deaktivieren wollen?
					</span>
				</SimpleDialogXL>
			)}
		</div>
	);
}

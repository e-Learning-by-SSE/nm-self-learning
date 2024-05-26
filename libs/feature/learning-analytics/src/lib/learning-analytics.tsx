import { trpc } from "@self-learning/api-client";
import router, { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { LessonLayoutProps } from "@self-learning/lesson";
import { KeysOfType } from "./auxillary";
import { Switch } from "@headlessui/react";
import { ButtonActions, SimpleDialogXL, showToast } from "@self-learning/ui/common";
import { TRPCClientError } from "@trpc/client";
import {
	LearningPeriodType,
	LessonInfoType,
	MediaTypeChangesInfoType,
	MediaTypeInfoType,
	QuizInfoType,
	StorageKeys,
	StorageTypeMap,
	VideoInfoType
} from "@self-learning/types";
import { isTruthy } from "@self-learning/util/common";

export function loadFromStorage<K extends keyof StorageTypeMap>(key: K): StorageTypeMap[K] | null {
	const rawData = localStorage.getItem(key);
	if (rawData) {
		return JSON.parse(rawData) as StorageTypeMap[K];
	}
	return null;
}

export function saveToStorage<K extends StorageKeys>(key: K, data: StorageTypeMap[K]): void {
	window.localStorage.setItem(key, JSON.stringify(data));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isLessonInfoType(data: any): data is LessonInfoType {
	return (data as LessonInfoType).lessonStart !== undefined;
}
type ExcludeKey<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
type StorageTypeMapWithoutLearningPeriod = ExcludeKey<StorageTypeMap, "la_period">;

export function useActivityStorage() {
	const { mutateAsync: createLearningPeriod } = trpc.learningPeriod.create.useMutation();

	const storeActivity = useCallback(
		async <K extends keyof StorageTypeMapWithoutLearningPeriod>(
			key: K,
			data: StorageTypeMapWithoutLearningPeriod[K]
		) => {
			let learningPeriod = loadFromStorage("la_period");
			if (!learningPeriod || !learningPeriod.id) {
				const start = isLessonInfoType(data) ? data.lessonStart : new Date();
				const lp = await createLearningPeriod({ start });
				learningPeriod = { ...lp, end: lp.end ?? undefined };
				saveToStorage("la_period", learningPeriod);
			}
			return learningPeriod.id;
		},
		[createLearningPeriod]
	);

	return storeActivity;
}

export function addMediaTypeChanges(property: KeysOfType<MediaTypeChangesInfoType, number | null>) {
	const key = "la_mediaType";
	const mediaTypeChanges = loadFromStorage(key);
	if (mediaTypeChanges) {
		if (mediaTypeChanges[property]) {
			mediaTypeChanges[property]++;
		} else {
			mediaTypeChanges[property] = 1;
		}
		saveToStorage(key, mediaTypeChanges);
	}
}

/**
 * When saving a session, the end time of consumed learning content & quizzes will be saved.
 * This will check if the end times are specified or can be loaded from the local storage, i.e.,
 * after the user has closed the website and started a new session at a later time.
 */
function commitEndTimestampsToStorage() {
	const learningPeriod = loadFromStorage("la_period");
	const lALessonInfo = loadFromStorage("la_lessonInfo");
	const lAVideoInfo = loadFromStorage("la_videoInfo");
	const lAQuizInfo = loadFromStorage("la_quizInfo");

	const endDates = [
		learningPeriod?.end,
		lALessonInfo?.lessonEnd,
		lAVideoInfo?.videoEnd,
		lAQuizInfo?.quizEnd
	];
	const latestDate = endDates
		.filter(isTruthy)
		.reduce((current, latest) => (current > latest ? current : latest));

	if (lALessonInfo?.lessonStart != null && lALessonInfo.lessonEnd == null) {
		lALessonInfo.lessonEnd = latestDate;
		saveToStorage("la_lessonInfo", lALessonInfo);
	}
	if (lAVideoInfo?.videoStart != null && lAVideoInfo.videoEnd == null) {
		lAVideoInfo.videoEnd = latestDate;
		saveToStorage("la_videoInfo", lAVideoInfo);
	}
	if (lAQuizInfo?.quizStart != null && lAQuizInfo.quizEnd == null) {
		lAQuizInfo.quizEnd = latestDate;
		saveToStorage("la_quizInfo", lAQuizInfo);
	}
}

/**
 * Saves all learning analytic data from the local storage in the database.
 *
 * @return The new entry for the learning analytics that extracted from the local storage. Content is no longer present in local storage
 */
export function gatherLearningActivity() {
	commitEndTimestampsToStorage();
	const data = retrieveFullAnalyticsFromStorage();
	if (data.lessonInfo && data.lessonInfo.lessonId && data.lessonInfo.courseId) {
		removeLearningActivityStore();
		console.debug(data);
	}
	return data;
}

export function retrieveFullAnalyticsFromStorage() {
	const learningPeriod = loadFromStorage("la_period");
	const lessonInfo = loadFromStorage("la_lessonInfo");
	const videoInfo = loadFromStorage("la_videoInfo");
	const quizInfo = loadFromStorage("la_quizInfo");
	const mediaTypeInfo = getMediaType();
	return { learningPeriod, lessonInfo, videoInfo, quizInfo, mediaTypeInfo };
}

export function toLa({
	learningPeriod,
	lessonInfo,
	videoInfo,
	quizInfo,
	mediaTypeInfo
}: {
	learningPeriod: LearningPeriodType;
	lessonInfo: LessonInfoType;
	videoInfo: VideoInfoType;
	quizInfo: QuizInfoType;
	mediaTypeInfo: MediaTypeChangesInfoType;
}) {
	return {
		periodId: learningPeriod.id,
		...lessonInfo,
		...videoInfo,
		...quizInfo,
		...mediaTypeInfo
	};
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
	const lANumberOfChangesMediaType = loadFromStorage("la_mediaType");
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
export async function removeLearningPeriodStore() {
	window.localStorage.removeItem("la_sessionInfo");
	window.localStorage.removeItem("la_lessonInfo");
	removeLearningActivityStore();
}

/**
 * Clears the local storage from video, media changes and quiz learning analytic data.
 *
 */
export async function removeLearningActivityStore() {
	window.localStorage.removeItem("la_videoInfo");
	window.localStorage.removeItem("la_quizInfo");
	window.localStorage.removeItem("la_mediaType");
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
	const { mutateAsync: createLearningPeriod } = trpc.learningPeriod.create.useMutation();
	const { mutateAsync: updateLearningPeriod } = trpc.learningPeriod.update.useMutation();
	const { mutateAsync: createLearningActivity } = trpc.learningActivity.create.useMutation();
	const { data: systemAnalytics } = trpc.me.systemAnalyticsAgreement.useQuery();

	// Learning Analytics: Session handling
	// Sets the end of the session in the local storage after leaving the website
	// This data will be copied to the database after re-entering the website.
	useEffect(() => {
		const handleClose = () => {
			const learningPeriod = loadFromStorage("la_period");
			if (learningPeriod?.start) {
				learningPeriod.end = new Date();
				saveToStorage("la_period", learningPeriod);
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
	const saveData = async () => {
		// if (data) {
		// 	try {
		// 		if (!data.laSessionId) {
		// 			const session = await createLASession({
		// 				...data,
		// 				start: data.start ?? new Date()
		// 			});
		// 			data.laSessionId = session.id;
		// 		}

		// 		await createLearningAnalytics({ ...data, start: date.start ?? new Date() });
		// 		await setEndOfSession({ ...data, end: data.end ?? new Date() });
		// 	} catch (e) {}
		// }
		const data = gatherLearningActivity();
		if (data) {
			try {
				const test = toLa(data);
				const analytics = await createLearningActivity();
				await updateLearningPeriod({
					id: analytics.periodId,
					end: data.lessonInfo?.lessonEnd ?? new Date() // warum wird hier die ganze lernperiode beendet?
				});
			} catch (e) {}
		}
		removeLearningPeriodStore();
		createNewLASession();
	};

	const createNewLASession = async () => {
		saveToStorage("la_period", {
			start: new Date(),
			end: null,
			id: null
		});
	};

	if (systemAnalytics?.systemAnalyticsAgreement) {
		const laSession = loadFromStorage("la_period");
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
	const { mutateAsync: createLearningActivity } = trpc.learningActivity.create.useMutation();
	const { data: systemAnalytics } = trpc.me.systemAnalyticsAgreement.useQuery();
	const { mutateAsync: createLearningPeriod } = trpc.learningPeriod.create.useMutation();
	// Stores the data of the current session when leaving a lesson
	useEffect(() => {
		const saveData = async () => {
			if (systemAnalytics?.systemAnalyticsAgreement) {
				const data = gatherLearningActivity();
				if (data) {
					try {
						if (!data.learningPeriod?.id) {
							const laSession = loadFromStorage("la_period");
							// Creates new Session in the database if session data is available
							if (laSession) {
								const session = await createLearningPeriod({
									start: data.lessonInfo?.lessonStart ?? new Date()
								});
							}
							await createLearningActivity(data);
						}
					} catch (e) {}
				}
			}
		};
		const navigateFromPage = (url: string) => {
			const lALessonInfo = loadFromStorage("la_lessonInfo");
			if (lALessonInfo?.lessonStart != null) {
				lALessonInfo.lessonEnd = new Date();
				saveToStorage("la_lessonInfo", lALessonInfo);
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
		createLearningPeriod,
		createLearningActivity,
		lesson.slug,
		router.events,
		systemAnalytics?.systemAnalyticsAgreement
	]);

	// Learning Analytics: init or save lesson info
	useEffect(() => {
		const saveData = async () => {
			if (systemAnalytics?.systemAnalyticsAgreement) {
				const data = gatherLearningActivity();
				if (data) {
					try {
						await createLearningActivity(data);
					} catch (e) {}
				}
			}
		};
		if (window !== undefined) {
			const lALessonInfo = loadFromStorage("la_lessonInfo");
			if (lALessonInfo?.lessonStart != null) {
				if (lALessonInfo.lessonId !== lesson.lessonId) {
					saveData();
				}
			}
			saveToStorage("la_lessonInfo", {
				lessonId: lesson.lessonId,
				courseId: course.courseId,
				lessonStart: new Date(),
				lessonEnd: null
			});
		}
	}, [
		course.courseId,
		createLearningActivity,
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
				removeLearningPeriodStore();
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

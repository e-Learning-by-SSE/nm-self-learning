import { Switch } from "@headlessui/react";
import { trpc } from "@self-learning/api-client";
import { LessonLayoutProps } from "@self-learning/lesson";
import {
	loadFromLocalStorage,
	removeFromLocalStorage,
	saveToLocalStorage
} from "@self-learning/local-storage";
import { ButtonActions, SimpleDialogXL, showToast } from "@self-learning/ui/common";
import { isTruthy } from "@self-learning/util/common";
import { TRPCClientError } from "@trpc/client";
import router, { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { recordMediaTypeChange, useActivityStorage } from "./analytics-data-management";

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
export function useLearningAnalytics() {
	const { storeAndRestartAnalytics } = useActivityStorage();
	const { data: systemAnalytics } = trpc.me.systemAnalyticsAgreement.useQuery();

	// Learning Analytics: Session handling
	// Sets the end of the session in the local storage after leaving the website
	// This data will be copied to the database after re-entering the website.
	useEffect(() => {
		const handleClose = () => {
			const learningSequence = loadFromLocalStorage("la_sequence");
			if (learningSequence?.start) {
				learningSequence.end = new Date();
				saveToLocalStorage("la_sequence", learningSequence);
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

	if (systemAnalytics?.systemAnalyticsAgreement) {
		const sequence = loadFromLocalStorage("la_sequence");
		if (!sequence) {
			saveToLocalStorage("la_sequence", { start: new Date() });
		} else if (sequence.start && sequence.end) {
			// old sequence, save and replace
			const now = new Date();
			const end = sequence.end ?? now;
			now.setMinutes(new Date().getMinutes() - 30);
			// Stores the previous session if exists and starts a new one
			if (now > end) storeAndRestartAnalytics();
		}
	}
}

/**
 * When saving a session, the end time of consumed learning content & quizzes will be saved.
 * This will check if the end times are specified or can be loaded from the local storage, i.e.,
 * after the user has closed the website and started a new session at a later time.
 */
function retrieveActivityEndTimes() {
	const currentActivity = loadFromLocalStorage("la_activity");
	const learningSequence = loadFromLocalStorage("la_sequence");

	const dates = [
		learningSequence?.end,
		currentActivity?.lessonEnd,
		currentActivity?.videoEnd,
		currentActivity?.quizEnd
	];
	const latestDate = dates
		.filter(isTruthy)
		.reduce((current, latest) => (current > latest ? current : latest), new Date(0));

	if (currentActivity) {
		if (currentActivity.quizStart) currentActivity.quizEnd = latestDate;
		if (currentActivity.videoStart) currentActivity.videoEnd = latestDate;
		if (currentActivity.lessonStart) currentActivity.lessonEnd = latestDate;
	}
	return currentActivity;
}

/**
 * When the user ends a lesson / moves to another one / quits a lesson / ... the learning analytics for the current
 * lesson will be recorded and saved to the database (because website is still running).
 *
 * @param lesson The currently displayed lesson
 * @param course The currently displayed course
 * @returns An empty component (no rendering, but session handling)
 */
export function useRecordLearningActivity({ lesson, course }: LessonLayoutProps) {
	// Learning Analytics: navigate from page
	const router = useRouter();
	const { data: systemAnalytics } = trpc.me.systemAnalyticsAgreement.useQuery();
	const { localStoreActivity, storeAndRestartAnalytics, initActivity } = useActivityStorage();

	// Stores the data of the current session when leaving a lesson
	useEffect(() => {
		const navigateFromPage = (url: string) => {
			const activity = retrieveActivityEndTimes();
			activity && localStoreActivity(activity);
			if (!url.includes(lesson.slug)) {
				// what is this
				//saveData();
			}
		};
		router.events.on("routeChangeStart", navigateFromPage);
		return () => {
			router.events.off("routeChangeStart", navigateFromPage);
		};
	}, [lesson.slug, router.events, systemAnalytics?.systemAnalyticsAgreement, localStoreActivity]);

	// Learning Analytics: init or save lesson info
	if (window) {
		const activity = loadFromLocalStorage("la_activity");
		if (activity?.lessonStart && activity?.lessonId !== lesson.lessonId) {
			// old activity
			if (systemAnalytics?.systemAnalyticsAgreement) {
				storeAndRestartAnalytics();
			}
		}
		const initialLearningActivity = {
			lessonId: lesson.lessonId,
			courseId: course.courseId,
			lessonStart: new Date()
		};
		initActivity(initialLearningActivity);
	}
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
	const { mutateAsync: deleteLearningAnalytics } = trpc.learningSequence.delete.useMutation();
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
				removeFromLocalStorage("la_sequence");
				removeFromLocalStorage("la_activity");

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
export { recordMediaTypeChange };

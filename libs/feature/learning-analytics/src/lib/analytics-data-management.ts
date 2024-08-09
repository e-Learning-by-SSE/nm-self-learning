import { trpc } from "@self-learning/api-client";
import { loadFromLocalStorage, saveToLocalStorage } from "@self-learning/local-storage";
import { LearningActivity, PartialWithRequired } from "@self-learning/types";
import { useCallback } from "react";

type MediaType = keyof LearningActivity["mediaChangeCount"];
export function recordMediaTypeChange(preferredMediaType: MediaType) {
	const activity = loadFromLocalStorage("la_activity");
	if (activity) {
		activity.mediaChangeCount[preferredMediaType] =
			activity.mediaChangeCount[preferredMediaType] ?? 0 + 1;
		saveToLocalStorage("la_activity", activity);
	}
}

export function useActivityStorage() {
	const { mutateAsync: createSequence } = trpc.learningSequence.create.useMutation();
	const { mutateAsync: createActivity } = trpc.learningActivity.create.useMutation();

	const initLearningSequence = useCallback(
		async (data: LearningActivity) => {
			let learningPeriod = loadFromLocalStorage("la_sequence");
			if (!learningPeriod || !learningPeriod.id) {
				const lp = await createSequence({ start: data.lessonStart ?? new Date() });
				learningPeriod = { ...lp, end: lp.end ?? undefined };
				learningPeriod && saveToLocalStorage("la_sequence", learningPeriod);
			}
		},
		[createSequence]
	);

	const initActivity = useCallback(
		async (data: PartialWithRequired<LearningActivity, "lessonId" | "courseId">) => {
			const initialLearningActivity: LearningActivity = {
				lessonStart: new Date(),
				lessonEnd: null,
				videoStart: null ?? new Date(), // Todo
				videoEnd: null,
				videoBreaks: null,
				videoSpeed: null,
				mediaChangeCount: {
					video: 0,
					article: 0,
					iframe: 0,
					pdf: 0
				},
				preferredMediaType: null,
				quizStart: null ?? new Date(), // fix
				quizEnd: null,
				numberCorrectAnswers: 0,
				numberIncorrectAnswers: 0,
				numberOfUsedHints: 0,
				...data
			};
			initLearningSequence(initialLearningActivity);
			saveToLocalStorage("la_activity", initialLearningActivity);
		},
		[initLearningSequence]
	);

	const localStoreActivity = useCallback(
		async (data: LearningActivity) => {
			initLearningSequence(data);
			saveToLocalStorage("la_activity", data);
		},
		[initLearningSequence]
	);

	const persistentlyStoreActivity = useCallback(
		async (data: LearningActivity) => {
			initLearningSequence(data);
			await createActivity(data);
		},
		[createActivity, initLearningSequence]
	);

	const storeAndRestartAnalytics = useCallback(async () => {
		const activity = loadFromLocalStorage("la_activity");
		if (activity) {
			persistentlyStoreActivity(activity);
		}
		saveToLocalStorage("la_sequence", { start: new Date() });
	}, [persistentlyStoreActivity]);

	return {
		localStoreActivity,
		persistentlyStoreActivity,
		storeAndRestartAnalytics,
		initActivity
	};
}

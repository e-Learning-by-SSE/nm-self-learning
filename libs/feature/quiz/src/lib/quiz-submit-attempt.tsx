import { loadLessonSessionSafe } from "@self-learning/lesson";
import { useEventLog } from "@self-learning/util/eventlog";
import { useCallback, useState } from "react";

export function useAttemptSubmission({
	lessonId,
	courseId
}: {
	lessonId: string;
	courseId: string;
}) {
	const { newEvent } = useEventLog();
	const [lessonAttemptId, setAttemptId] = useState<string | null>(null);

	const load = useCallback(() => {
		const lessonSession = loadLessonSessionSafe(lessonId);
		if (!lessonSession || !lessonSession.lessonAttemptId) {
			console.log("useAttemptSubmission: probably a manipulation attempt");
			return;
		}
		if (lessonAttemptId !== lessonSession?.lessonAttemptId) {
			setAttemptId(lessonSession.lessonAttemptId);
		}
		return lessonSession;
	}, [lessonAttemptId, lessonId]);

	const logStartAttempt = useCallback(
		async function () {
			const lessonSession = load();
			if (!lessonSession) return;
			if (!lessonSession.lessonAttemptId) return;
			if (lessonSession.lessonAttemptId !== lessonAttemptId) {
				return newEvent({
					type: "LESSON_LEARNING_START",
					resourceId: lessonId,
					courseId: courseId,
					payload: { lessonAttemptId: lessonSession.lessonAttemptId }
				});
			}
		},
		[load, lessonAttemptId, newEvent, lessonId, courseId]
	);

	const logAttemptSubmit = useCallback(
		async function (completionState: "completed" | "failed", performanceScore: number) {
			const lessonSession = load();
			if (!lessonSession || !lessonSession.lessonAttemptId) return;
			return newEvent({
				type: "LESSON_LEARNING_SUBMIT",
				resourceId: lessonId,
				courseId,
				payload: {
					lessonAttemptId: lessonSession.lessonAttemptId,
					pauseCount: lessonSession.pauseCount,
					effectiveTimeLearned: lessonSession.totalDurationSec,
					completionState,
					performanceScore
				}
			});
		},
		[load, newEvent, lessonId, courseId]
	);

	return { logAttemptSubmit, logStartAttempt };
}

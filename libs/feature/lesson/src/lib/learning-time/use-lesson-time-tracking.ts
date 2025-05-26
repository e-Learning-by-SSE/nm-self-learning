import { useCallback, useEffect, useRef, useState } from "react";

import { useRequiredSession } from "@self-learning/ui/layouts";
import { useEventLog } from "@self-learning/util/eventlog";
import {
	loadLessonSession,
	isLessonSessionValid,
	createNewLessonSession,
	saveLessonSession,
	clearLessonSession,
	LessonLearningSession
} from "./time-tracker";

export function useLessonSession(lessonId: string, courseId: string) {
	const { data: user } = useRequiredSession();
	const username = user?.user?.name ?? "";
	const { newEvent } = useEventLog();

	// State für UI-Updates
	const [lessonSession, setLessonSession] = useState<LessonLearningSession | null>(null);
	const [duration, setDuration] = useState(0);
	const [pauseCount, setPauseCount] = useState(0);
	const [isTracking, setTrackingState] = useState(true);

	// Ref for current session. This avoid re-creating submit on every tracking update.
	const currentSessionRef = useRef<LessonLearningSession | null>(null);

	// Setup
	useEffect(() => {
		if (!lessonId || !username) return;

		const existing = loadLessonSession(lessonId);
		const valid = existing && isLessonSessionValid(existing);
		const newSession = valid ? existing : createNewLessonSession(lessonId, username);

		if (!valid) {
			newEvent({
				type: "LESSON_LEARNING_START",
				resourceId: lessonId,
				courseId,
				payload: { lessonAttemptId: newSession.lessonAttemptId }
			});
		}
		if (newSession) {
			setLessonSession(newSession);
			currentSessionRef.current = newSession;
			saveLessonSession(newSession);
		}
	}, [lessonId, username, courseId, newEvent]);

	// Tracking
	useEffect(() => {
		if (!lessonSession) return;

		const interval = setInterval(() => {
			const current = currentSessionRef.current;
			if (!current) return;
			if (!isTracking) return;

			const updated = {
				...current,
				totalDurationSec: current.totalDurationSec + 1,
				lastActiveTime: Date.now()
			};

			currentSessionRef.current = updated;
			saveLessonSession(updated);
			setDuration(updated.totalDurationSec);
		}, 1000);

		return () => clearInterval(interval);
	}, [isTracking, lessonSession]);

	// Pause handling
	useEffect(() => {
		if (!isTracking) return;

		let pausedAt: number | null = null;

		function onHide(): void {
			pausedAt = Date.now();
		}

		function onShow(): void {
			if (!pausedAt || !currentSessionRef.current) return;

			const diff = Date.now() - pausedAt;
			const current = currentSessionRef.current;

			const updated = {
				...current,
				...(diff < 30
					? { totalDurationSec: current.totalDurationSec + diff }
					: { pauseCount: current.pauseCount + 1 })
			};

			currentSessionRef.current = updated;
			saveLessonSession(updated);
			setDuration(updated.totalDurationSec);
			setPauseCount(updated.pauseCount);
			pausedAt = null;
		}

		const handleVisibilityChange = (): void => {
			document.hidden ? onHide() : onShow();
		};

		document.addEventListener("visibilitychange", handleVisibilityChange);
		return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
	}, [isTracking, lessonSession?.lessonAttemptId]);

	// Submit mit stabiler Referenz
	const submit = useCallback(
		async function (completionState: "completed" | "failed", performanceScore: number) {
			const current = currentSessionRef.current;
			if (!current) return null;

			const final = { ...current };
			clearLessonSession(lessonId);

			await newEvent({
				type: "LESSON_LEARNING_SUBMIT",
				resourceId: lessonId,
				courseId,
				payload: {
					lessonAttemptId: final.lessonAttemptId,
					pauseCount: final.pauseCount,
					effectiveTimeLearned: final.totalDurationSec,
					completionState,
					performanceScore
				}
			});
			return final;
		},
		[lessonId, courseId, newEvent]
	);

	const reset = useCallback(() => {
		clearLessonSession(lessonId);
		setLessonSession(null);
		setDuration(0);
		setPauseCount(0);
		currentSessionRef.current = null;
	}, [lessonId]);

	return {
		lessonAttemptId: lessonSession?.lessonAttemptId ?? null,
		totalDuration: duration,
		pauseCount,
		isTracking,
		setTrackingState,
		submit,
		reset
	};
}

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

export function useLessonSession({
	lessonId,
	initialSession
}: {
	lessonId: string;
	initialSession?: LessonLearningSession | null;
}) {
	const { data: user } = useRequiredSession();
	const username = user?.user?.name ?? "";
	const { newEvent } = useEventLog();

	// State für UI-Updates
	const [lessonSession, setLessonSession] = useState<LessonLearningSession | null | undefined>(
		initialSession
	);
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
		if (newSession) {
			setLessonSession(newSession);
			currentSessionRef.current = newSession;
			saveLessonSession(newSession);
		}
	}, [lessonId, username, newEvent]);

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
			setPauseCount(updated.pauseCount);
			pausedAt = null;
		}

		const handleVisibilityChange = (): void => {
			document.hidden ? onHide() : onShow();
		};

		document.addEventListener("visibilitychange", handleVisibilityChange);
		return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
	}, [isTracking, lessonSession?.lessonAttemptId]);

	const reset = useCallback(() => {
		clearLessonSession(lessonId);
		setLessonSession(null);
		setPauseCount(0);
		setTrackingState(false);
		currentSessionRef.current = null;
	}, [lessonId]);

	const getCurrentDuration = useCallback((): number => {
		return currentSessionRef.current?.totalDurationSec ?? 0;
	}, []);

	return {
		lessonAttemptId: lessonSession?.lessonAttemptId ?? null,
		getCurrentDuration,
		pauseCount,
		isTracking,
		setTrackingState,
		reset,
		init: () => createNewLessonSession(lessonId, username)
	};
}

/**
 * Hook to provide lesson session data for UI components.
 * Renders every timer interval to keep the UI updated with the current duration.
 */
export function useLessonSessionUI(lessonSession: ReturnType<typeof useLessonSession>) {
	const [liveDuration, setLiveDuration] = useState(0);

	useEffect(() => {
		// Initial value
		setLiveDuration(lessonSession.getCurrentDuration());

		// Update every second
		const interval = setInterval(() => {
			setLiveDuration(lessonSession.getCurrentDuration());
		}, 1000);

		return () => clearInterval(interval);
	}, [lessonSession]);

	return {
		...lessonSession,
		liveDuration
	};
}

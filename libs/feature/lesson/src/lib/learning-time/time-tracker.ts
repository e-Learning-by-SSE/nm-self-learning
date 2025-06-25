import { getRandomId } from "@self-learning/util/common";
import { z } from "zod";

export const lessonLearningSessionSchema = z.object({
	lessonAttemptId: z.string().min(1, "lessonAttemptId cannot be empty"),
	lessonId: z.string().min(1, "lessonId cannot be empty"),
	username: z.string().min(1, "username cannot be empty"),
	startTime: z.number().positive("startTime must be positive"),
	totalDurationSec: z.number().nonnegative("totalDurationSec cannot be negative"),
	pauseCount: z.number().int().nonnegative("pauseCount must be non-negative integer"),
	isActive: z.boolean(),
	lastActiveTime: z.number().positive("lastActiveTime must be positive"),
	createdAt: z.number().positive("createdAt must be positive")
});

export const lessonTrackingStateSchema = z.object({
	lessonSession: lessonLearningSessionSchema.nullable(),
	pausedAt: z.number().nullable(),
	intervalId: z.any().nullable() // NodeJS.Timeout kann nicht direkt validiert werden
});

export const TRACKING_CONFIG = {
	UPDATE_INTERVAL_MS: 1000, // 1 second
	GRACE_PERIOD_MS: 30000, // 30 seconds - kurze Pausen werden ignoriert
	MAX_SESSION_AGE_MS: 86400000, // 24 hours
	STORAGE_PREFIX: "learning_session_",
	VALIDATION_INTERVAL_MS: 600000, // 10 minutes - attempt validation
	VALIDATION_STALE_TIME_MS: 300000 // 5 minutes - cache validation result
} as const;

/**
 * Domain Models (derived from Zod schemas)
 */
export type LessonLearningSession = z.infer<typeof lessonLearningSessionSchema>;
export type LessonTrackingState = z.infer<typeof lessonTrackingStateSchema>;

function saveLessonSession(lessonSession: LessonLearningSession): void {
	// Validate session before saving
	const validationResult = lessonLearningSessionSchema.safeParse(lessonSession);

	if (!validationResult.success) {
		console.error("Cannot save invalid lesson session:", validationResult.error.format());
		return;
	}

	const key = `${TRACKING_CONFIG.STORAGE_PREFIX}${lessonSession.lessonId}`;
	try {
		sessionStorage.setItem(key, JSON.stringify(validationResult.data));
	} catch (error) {
		console.warn("Failed to save lesson session:", error);
	}
}

function loadLessonSession(lessonId: string): LessonLearningSession | null {
	const key = `${TRACKING_CONFIG.STORAGE_PREFIX}${lessonId}`;
	const data = sessionStorage.getItem(key);

	if (!data) return null;

	try {
		const parsed = JSON.parse(data);

		// Zod validation
		const validationResult = lessonLearningSessionSchema.safeParse(parsed);

		if (!validationResult.success) {
			console.warn(
				"Invalid lesson session data found in storage:",
				validationResult.error.format()
			);
			// Optionally clear corrupted data
			clearLessonSession(lessonId);
			return null;
		}

		return validationResult.data;
	} catch (error) {
		console.warn("Failed to parse lesson session from storage:", error);
		// Clear corrupted data
		clearLessonSession(lessonId);
		return null;
	}
}

/**
 * Entfernt eine Learning Session aus dem sessionStorage
 */
function clearLessonSession(lessonId: string): void {
	const key = `${TRACKING_CONFIG.STORAGE_PREFIX}${lessonId}`;
	try {
		sessionStorage.removeItem(key);
	} catch (error) {
		console.warn("Failed to clear lesson session:", error);
	}
}

/**
 * Prüft ob eine Lesson Session noch gültig ist (Alter + letzte Aktivität)
 */
function isLessonSessionValid(lessonSession: LessonLearningSession): boolean {
	const now = Date.now();
	const sessionAge = now - lessonSession.createdAt;
	const timeSinceLastActivity = now - lessonSession.lastActiveTime;

	// Session ist ungültig wenn:
	// - älter als 24 Stunden
	// - letzte Aktivität länger als 24 Stunden her
	const isAgeValid = sessionAge < TRACKING_CONFIG.MAX_SESSION_AGE_MS;
	const isActivityValid = timeSinceLastActivity < TRACKING_CONFIG.MAX_SESSION_AGE_MS;

	return isAgeValid && isActivityValid;
}

/**
 * Erstellt eine neue Learning Session mit Validation
 */
function createNewLessonSession(lessonId: string, username: string): LessonLearningSession {
	const lessonSession = {
		lessonAttemptId: getRandomId(),
		lessonId,
		username,
		startTime: Date.now(),
		totalDurationSec: 0,
		pauseCount: 0,
		isActive: true,
		lastActiveTime: Date.now(),
		createdAt: Date.now()
	};

	// Validate the created session
	const validationResult = lessonLearningSessionSchema.safeParse(lessonSession);

	if (!validationResult.success) {
		throw new Error(`Failed to create valid lesson session: ${validationResult.error.message}`);
	}

	return validationResult.data;
}

function validateLessonSessionData(lessonSession: unknown): {
	isValid: boolean;
	errors?: string[];
} {
	const validationResult = lessonLearningSessionSchema.safeParse(lessonSession);

	if (validationResult.success) {
		return { isValid: true };
	}

	const errors = validationResult.error.issues.map(
		issue => `${issue.path.join(".")}: ${issue.message}`
	);

	if (process.env.NODE_ENV === "development") {
		console.warn("Lesson session validation failed:", errors);
	}

	return { isValid: false, errors };
}

export function loadLessonSessionSafe(lessonId: string) {
	const lessonSession = loadLessonSession(lessonId);
	const result = validateLessonSessionData(lessonSession);
	if (!result.isValid) return null;

	return lessonSession as LessonLearningSession;
}

export {
	clearLessonSession,
	createNewLessonSession,
	isLessonSessionValid,
	loadLessonSession,
	saveLessonSession
};

import { EventTypeKeys, EventTypeMap } from "@self-learning/types";
import { UserEvent } from "./types";

export function isEventType<K extends EventTypeKeys>(
	event: UserEvent,
	type: K
): event is UserEvent & { payload: EventTypeMap[K] } {
	return event.type === type;
}

/**
 * Counts the number of used hints of an array of Lesson_Quiz_Submission events.
 *
 * @example Usage:
 * ```
 * const nHints = data.filter(e => isEventType(e, "LESSON_QUIZ_SUBMISSION")).reduce(hintsUsed, 0);
 * ```
 * @param accumulator The number of hints used so far.
 * @param event May only be applied to Lesson_Quiz_Submission events.
 * @returns The number of used hints.
 */
export function hintsUsed(
	accumulator: number,
	event: UserEvent & { payload: EventTypeMap["LESSON_QUIZ_SUBMISSION"] }
) {
	return accumulator + event.payload.hintsUsed.length;
}

/**
 * Counts the number of successful and failed quiz attempts of an array of Lesson_Quiz_Submission events.
 * @example Usage:
 * ```
 * const { successful, failed } = events
	    .filter(e => isEventType(e, "LESSON_QUIZ_SUBMISSION"))
		.reduce(quizAttempts, { successful: 0, failed: 0 });
 * ```
 * @param accumulator The number of successful and failed quiz attempts so far.
 * @param event May only be applied to Lesson_Quiz_Submission events.
 * @returns The number of successful and failed quiz attempts.
 */
export function quizAttempts(
	accumulator: { successful: number; failed: number },
	event: UserEvent & { payload: EventTypeMap["LESSON_QUIZ_SUBMISSION"] }
): { successful: number; failed: number } {
	// Values of the event
	const attempts = event.payload.attempts;
	const successfulAttempts = event.payload.solved ? 1 : 0;
	const failedAttempts = attempts - successfulAttempts;

	// Values of the accumulator
	let { successful, failed } = accumulator;
	successful += successfulAttempts;
	failed += failedAttempts;

	// Return the new values
	return { successful, failed };
}

import { UserEvent } from "@self-learning/database";
import { differenceInMilliseconds } from "date-fns";

/**
 * Computes the total duration of already filtered user events.
 * Does not consider pauses between resource changes.
 * For instance:
 * - Resource A: 10:00 - 10:05
 * - Resource B: 10:05 - 10:10
 * - Resource A: 10:20 - 10:25
 * - Will return 15 minutes, not 25 minutes.
 * @param events Filtered user events for which the total duration (without pauses) should be computed.
 * @returns The total duration in milliseconds (without pauses between resource changes).
 */
export function computeTotalDuration(events: Pick<UserEvent, "createdAt" | "resourceId">[]) {
	let totalDuration = 0;
	if (events.length < 2) return totalDuration;

	let segmentStart = events[0].createdAt;
	let currentResource = events[0].resourceId;

	for (let i = 1; i < events.length; i++) {
		const event = events[i];

		if (event.resourceId !== currentResource) {
			// Compute duration for the segment that just ended
			const duration = differenceInMilliseconds(events[i - 1].createdAt, segmentStart);
			totalDuration += duration;

			// Start new segment
			segmentStart = event.createdAt;
			currentResource = event.resourceId;
		}
	}

	// Add duration for the final segment
	const lastEvent = events[events.length - 1];
	const lastDuration = differenceInMilliseconds(lastEvent.createdAt, segmentStart);
	totalDuration += lastDuration;

	return totalDuration;
}

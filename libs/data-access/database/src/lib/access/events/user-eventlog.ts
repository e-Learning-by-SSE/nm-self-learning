import {
	EventLogQueryInput,
	EventType,
	EventTypesToAlwaysSave,
	ResolvedValue
} from "@self-learning/types";
import { database } from "@self-learning/database";
import { Prisma } from "@prisma/client";
import { createHash } from "crypto";

export async function createUserEvent<K extends keyof EventType>(event: {
	username: string;
	type: K;
	resourceId?: string;
	courseId?: string;
	payload: EventType[K];
}) {
	const enabledLearningStatistics = (
		await database.user.findUnique({ where: { name: event.username } })
	)?.enabledLearningStatistics;

	// Return null if the user or setting is not found
	if (enabledLearningStatistics === undefined || enabledLearningStatistics === null) {
		return null;
	}

	// Anonymizes the username using SHA-256 when user event tracking is disabled,
	// unless the event type is in the list of events that should always be saved (e.g., error events).
	if (!enabledLearningStatistics && !EventTypesToAlwaysSave.includes(event.type)) {
		event.username = createHash("sha256").update(event.username).digest("hex");
	}

	return database.eventLog.create({ data: event });
}

export async function loadUserEvents(input: EventLogQueryInput) {
	// No query if undefined, equality check if 1 string provided, else in list query for arrays
	const where = (input: string | string[] | undefined) => {
		let query: Prisma.StringFilter<"EventLog"> | string | undefined = undefined;
		if (input) {
			query = Array.isArray(input) ? { in: input } : input;
		}
		return query;
	};

	const results = await database.eventLog.findMany({
		where: {
			username: input.username,
			createdAt: {
				gte: input.start,
				lte: input.end
			},
			type: where(input.type),
			resourceId: where(input.resourceId),
			courseId: where(input.courseId)
		},
		orderBy: {
			createdAt: "asc"
		}
	});
	/*
	 * Do this for real type inference from the db return. But this has impact on the performance through the additional iteration.
	 * This matters when loading large chunks of user events.
	 */
	// return results.map(result => {
	// 	const a = result.type as Actions;
	// 	return {
	// 		...result,
	// 		payload: result.payload as ActionPayloadTypes[typeof a]
	// 	};
	// });
	type Result = (typeof results)[0] & { payload: EventType };
	// type Result = (typeof results)[0];
	return results as Result[];
}

export type UserEvent = ResolvedValue<typeof loadUserEvents>[number];

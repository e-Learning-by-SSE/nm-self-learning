import { EventType, EventLogQueryInput, ResolvedValue } from "@self-learning/types";
import { database } from "@self-learning/database";
import { Prisma } from "@prisma/client";

export function createUserEvent<K extends keyof EventType>(event: {
	username: string;
	type: K;
	resourceId?: string;
	courseId?: string;
	payload: EventType[K];
}) {
	return database.eventLog.create({ data: event });
}

export async function loadUserEvents(input: EventLogQueryInput) {
	// No query if undefined, equality check if 1 type provided, else in list query
	let typeWhereQuery: Prisma.StringFilter<"EventLog"> | string | undefined = undefined;
	if (input.type && input.type.length > 0) {
		typeWhereQuery = input.type.length > 1 ? { in: input.type } : input.type[0];
	}

	const results = await database.eventLog.findMany({
		where: {
			username: input.username,
			createdAt: {
				gte: input.start,
				lte: input.end
			},
			type: typeWhereQuery,
			resourceId: input.resourceId
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

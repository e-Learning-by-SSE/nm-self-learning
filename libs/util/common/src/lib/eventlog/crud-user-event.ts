import {
	ActionPayloadTypes,
	Actions,
	EventLogQueryInput,
	ResolvedValue
} from "@self-learning/types";
import { database } from "@self-learning/database";
import { Prisma } from "@prisma/client";

export function createUserEvent<K extends Actions>(event: {
	userId: string;
	action: K;
	resourceId?: string;
	payload: ActionPayloadTypes[K];
}) {
	return database.eventLog.create({ data: event });
}

export async function loadUserEvents(input: EventLogQueryInput) {
	// No query if undefined, equality check if 1 action provided, else in list query
	let actionWhereQuery: Prisma.StringFilter<"EventLog"> | string | undefined = undefined;
	if (input.action && input.action.length > 0) {
		actionWhereQuery = input.action.length > 1 ? { in: input.action } : input.action[0];
	}

	const results = await database.eventLog.findMany({
		where: {
			userId: input.userId,
			createdAt: {
				gte: input.start,
				lte: input.end
			},
			action: actionWhereQuery,
			resourceId: input.resourceId
		}
	});
	/*
	 * Do this for real type inference from the db return. But this has impact on the performance through the additional iteration.
	 * This matters when loading large chunks of user events.
	 */
	// return results.map(result => {
	// 	const a = result.action as Actions;
	// 	return {
	// 		...result,
	// 		payload: result.payload as ActionPayloadTypes[typeof a]
	// 	};
	// });
	type Result = (typeof results)[0] & { payload: ActionPayloadTypes };
	return results as Result[];
}
export type UserEvent = ResolvedValue<typeof loadUserEvents>[number];

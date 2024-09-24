import {
	EventType,
	evenTypePayloadSchema,
	eventWhereSchema,
	eventLogSchema
} from "@self-learning/types";
import { authProcedure, t } from "../trpc";

import { createUserEvent, loadUserEvents } from "@self-learning/database";

export const userEventRouter = t.router({
	// !!!! not for direct use; use useEventLog hook instead !!!!
	create: authProcedure.input(eventLogSchema).mutation(async ({ ctx, input }) => {
		// Log only events if user has agreed to data logging
		if (ctx.user?.eventLogEnabled === true) {
			// Validate playload matches action
			const schema = evenTypePayloadSchema.shape[input.type];
			schema.parse(input.payload);

			return createUserEvent({
				username: ctx.user.name,
				...input,
				payload: input.payload satisfies EventType[typeof input.type]
			});
		} else {
			return null;
		}
	}),
	findMany: authProcedure.input(eventWhereSchema).query(async ({ ctx, input }) => {
		return loadUserEvents({
			...input,
			username: ctx.user?.name
		});
	})
});

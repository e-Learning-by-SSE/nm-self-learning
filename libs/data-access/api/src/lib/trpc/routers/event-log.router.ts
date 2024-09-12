import {
	EventType,
	evenTypePayloadSchema,
	eventWhereSchema,
	eventLogSchema
} from "@self-learning/types";
import { authProcedure, t } from "../trpc";

import { createUserEvent, loadUserEvents } from "@self-learning/database";

// !!!! not for direct use; use useEventLog hook instead !!!!
export const userEventRouter = t.router({
	create: authProcedure.input(eventLogSchema).mutation(async ({ ctx, input }) => {
		// Validate playload matches action
		const schema = evenTypePayloadSchema.shape[input.type];
		schema.parse(input.payload);

		return createUserEvent({
			username: ctx.user.name,
			...input,
			payload: input.payload satisfies EventType[typeof input.type]
		});
	}),
	get: authProcedure.input(eventWhereSchema).query(async ({ ctx, input }) => {
		return loadUserEvents({
			username: ctx.user?.name,
			...input
		});
	})
});

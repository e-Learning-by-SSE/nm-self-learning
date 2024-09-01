import {
	ActionPayloadTypes,
	ActionPayloadTypesSchema,
	eventWhereSchema,
	userEventSchema
} from "@self-learning/types";
import { authProcedure, t } from "../trpc";

import { createUserEvent, loadUserEvents } from "@self-learning/util/common";

// !!!! not for direct use; use useEventLog hook instead !!!!
export const userEventRouter = t.router({
	create: authProcedure.input(userEventSchema).mutation(async ({ ctx, input }) => {
		// Validate playload matches action
		const schema = ActionPayloadTypesSchema.shape[input.action];
		schema.parse(input.payload);

		return createUserEvent({
			userId: ctx.user.id,
			...input,
			payload: input.payload satisfies ActionPayloadTypes[typeof input.action]
		});
	}),
	get: authProcedure.input(eventWhereSchema).query(async ({ ctx, input }) => {
		return loadUserEvents({
			userId: ctx.user.id,
			...input
		});
	})
});

import {
	ActionPayloadTypes,
	ActionPayloadTypesSchema,
	userEventSchema
} from "@self-learning/types";
import { createUserEvent } from "@self-learning/ui/common";
import { authProcedure, t } from "../trpc";

import { database } from "@self-learning/database";

import { z } from "zod";

const querySchema = z.object({
	start: z.date().optional(),
	end: z.date().optional()
});

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
	get: authProcedure.input(querySchema).query(async ({ ctx, input }) => {
		return database.eventLog.findMany({
			where: {
				userId: ctx.user.id,
				createdAt: {
					gte: input.start,
					lte: input.end
				}
			}
		});
	})
});

import {
	ActionPayloadTypes,
	ActionPayloadTypesSchema,
	ResolvedValue,
	Actions,
	userEventSchema
} from "@self-learning/types";
import { createUserEvent } from "@self-learning/ui/common";
import { authProcedure, t } from "../trpc";

import { database } from "@self-learning/database";

import { z } from "zod";
import { Prisma } from "@prisma/client";

const whereSchema = z.object({
	start: z.date().optional(),
	end: z.date().optional(),
	action: z
		.array(z.enum(Object.keys(ActionPayloadTypesSchema.shape) as [Actions, ...Actions[]]))
		.optional(),
	resourceId: z.string().optional()
});

const querySchema = whereSchema.extend({
	userId: z.string()
});

type QueryInput = z.input<typeof querySchema>;

export type UserEvent = ResolvedValue<typeof loadUserEvents>[number];

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
	get: authProcedure.input(whereSchema).query(async ({ ctx, input }) => {
		return loadUserEvents({
			userId: ctx.user.id,
			...input
		});
	})
});

function loadUserEvents(input: QueryInput) {
	// No query if undefined, equality check if 1 action provided, else in list query
	let actionWhereQuery: Prisma.StringFilter<"EventLog"> | string | undefined = undefined;
	if (input.action && input.action.length > 0) {
		actionWhereQuery = input.action.length > 1 ? { in: input.action } : input.action[0];
	}

	return database.eventLog.findMany({
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
}

import { ActionPayloadTypes, userEventSchema } from "@self-learning/types";
import { createUserEvent } from "@self-learning/ui/common";
import { authProcedure, t } from "../trpc";

// !!!! not for direct use; use useEvetLog hook instead !!!!
export const userEventRouter = t.router({
	create: authProcedure.input(userEventSchema).mutation(async ({ ctx, input }) => {
		return createUserEvent({
			userId: ctx.user.id,
			...input,
			payload: input.payload satisfies ActionPayloadTypes[typeof input.action]
		});
	})
});

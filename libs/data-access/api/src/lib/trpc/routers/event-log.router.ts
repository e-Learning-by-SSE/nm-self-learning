import { eventWhereSchema, eventLogSchema } from "@self-learning/types";
import { authProcedure, t } from "../trpc";
import { createEventLogEntry, loadUserEventLogs } from "@self-learning/util/eventlog";

export const userEventRouter = t.router({
	// !!!! Do not use this router directly in the client code, use the useEventLog hook instead. !!!!
	// The hook created compiler errors in case payload and type do not match.
	create: authProcedure.input(eventLogSchema).mutation(async ({ ctx, input }) => {
		return await createEventLogEntry({
			username: ctx.user.name,
			...input
		});
	}),
	findMany: authProcedure.input(eventWhereSchema).query(async ({ ctx, input }) => {
		return loadUserEventLogs({
			...input,
			username: ctx.user?.name
		});
	})
});

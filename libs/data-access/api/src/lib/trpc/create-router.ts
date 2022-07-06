import * as trpc from "@trpc/server";
import { TRPCError } from "@trpc/server";
import { Context } from "./context";

export function createRouter() {
	return trpc.router<Context>();
}

export function createProtectedRouter() {
	return trpc.router<Context>().middleware(({ ctx, next }) => {
		if (!ctx?.username) {
			throw new TRPCError({ code: "UNAUTHORIZED" });
		}

		return next({ ctx: { ...ctx, username: ctx.username } });
	});
}

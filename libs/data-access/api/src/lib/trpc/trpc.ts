import { initTRPC, TRPCError } from "@trpc/server";
import { Context } from "./context";
import superjson from "superjson";
import { OpenApiMeta } from "trpc-to-openapi";

export const t = initTRPC.context<Context>().meta<OpenApiMeta>().create({
	transformer: superjson
});

const authMiddleware = t.middleware(async ({ ctx, next }) => {
	if (!ctx?.user) {
		throw new TRPCError({ code: "UNAUTHORIZED" });
	}

	return next({ ctx: ctx as Required<Context> });
});

const adminMiddleware = t.middleware(async ({ ctx, next }) => {
	if (!ctx?.user) {
		throw new TRPCError({ code: "UNAUTHORIZED" });
	}

	if (ctx.user.role !== "ADMIN") {
		throw new TRPCError({ code: "FORBIDDEN", message: "Requires 'ADMIN' role." });
	}

	return next({ ctx: ctx as Required<Context> });
});

const isAuthorMiddleware = t.middleware(async ({ ctx, next }) => {
	if (!ctx?.user) {
		throw new TRPCError({ code: "UNAUTHORIZED" });
	}

	if (!ctx.user.isAuthor && ctx.user.role !== "ADMIN") {
		throw new TRPCError({
			code: "FORBIDDEN",
			message: "Requires 'AUTHOR' or 'ADMIN' role."
		});
	}

	return next({ ctx: ctx as Required<Context> });
});

/** Creates a `t.procedure` that requires an authenticated user. */
export const authProcedure = t.procedure.use(authMiddleware);
/** Creates a `t.procedure` that requires an authenticated user with `ADMIN` role. */
export const adminProcedure = t.procedure.use(adminMiddleware);
/** Creates a `t.procedure` that requires an authenticated user with `AUTHOR` role. */
export const authorProcedure = t.procedure.use(isAuthorMiddleware);

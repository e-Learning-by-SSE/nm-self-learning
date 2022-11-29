import { initTRPC, TRPCError } from "@trpc/server";
import * as trpcNext from "@trpc/server/adapters/next";
import { Session, unstable_getServerSession } from "next-auth";
import { authOptions } from "../auth";

export const t = initTRPC.context<Context>().create();

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

/** Creates a `t.procedure` that requires an authenticated user. */
export const authProcedure = t.procedure.use(authMiddleware);
/** Creates a `t.procedure` that requires an authenticated user with `ADMIN` role. */
export const adminProcedure = t.procedure.use(adminMiddleware);

export async function createTrpcContext({
	req,
	res
}: trpcNext.CreateNextContextOptions): Promise<Context> {
	const session = await unstable_getServerSession(req, res, authOptions);

	if (!session) {
		return {};
	}

	return {
		user: session.user
	};
}

type Context = {
	user?: Session["user"];
};

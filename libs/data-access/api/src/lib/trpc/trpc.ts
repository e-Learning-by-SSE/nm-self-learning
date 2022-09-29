import { initTRPC, TRPCError } from "@trpc/server";
import * as trpcNext from "@trpc/server/adapters/next";
import { unstable_getServerSession } from "next-auth";
import { authOptions } from "../auth";

export const t = initTRPC.context<Context>().create();

const authMiddleware = t.middleware(async ({ ctx, next }) => {
	if (!ctx?.username) {
		throw new TRPCError({ code: "UNAUTHORIZED" });
	}

	return next({ ctx: ctx as { username: string } });
});

/** Creates a `t.procedure` that requires an authenticated user. The `username` is available in the `ctx`. */
export const authProcedure = t.procedure.use(authMiddleware);

export async function createTrpcContext({
	req,
	res
}: trpcNext.CreateNextContextOptions): Promise<Context> {
	const session = await unstable_getServerSession(req, res, authOptions);

	if (!session) {
		return {};
	}

	return {
		username: session.user?.name as string
	};
}

type Context = {
	username?: string;
};

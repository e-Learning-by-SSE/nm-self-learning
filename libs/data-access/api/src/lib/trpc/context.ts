import * as trpc from "@trpc/server";
import * as trpcNext from "@trpc/server/adapters/next";
import { unstable_getServerSession } from "next-auth";
import { authOptions } from "../auth";

export async function createContext({ req, res }: trpcNext.CreateNextContextOptions) {
	const session = await unstable_getServerSession(req, res, authOptions);

	if (!session) {
		return null;
	}

	return {
		username: session.user?.name as string
	};
}

export type Context = trpc.inferAsyncReturnType<typeof createContext>;

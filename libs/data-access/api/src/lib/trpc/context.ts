import { getServerSession, Session } from "next-auth";
import * as trpcNext from "@trpc/server/adapters/next";
import { authOptions } from "../auth/auth";

export type UserFromSession = Session["user"];

export type Context = {
	user?: UserFromSession;
};

export async function createTrpcContext({
	req,
	res
}: trpcNext.CreateNextContextOptions): Promise<Context> {
	const session = await getServerSession(req, res, authOptions);

	if (!session) {
		return {};
	}

	return {
		user: session.user
	};
}

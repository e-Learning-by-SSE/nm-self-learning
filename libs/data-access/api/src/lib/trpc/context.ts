import * as trpcNext from "@trpc/server/adapters/next";
import { getServerSession, Session } from "next-auth";
import { getToken } from "next-auth/jwt";
import { authOptions, createToken, incomingToLocalRole } from "@self-learning/util/auth/server";
import jwt from "jsonwebtoken";
import { introspectToken } from "./introspect-oidc-token";

export type UserFromSession = Session["user"];

export type Context = {
	user?: UserFromSession;
};

export async function createTrpcContext({
	req,
	res
}: trpcNext.CreateNextContextOptions): Promise<Context> {
	const session = await getServerSession(req, res, authOptions);
	const authHeader = req.headers.authorization;
	const user = session?.user;
	const tokenRaw = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
	if (!tokenRaw && req.headers.authorization?.startsWith("Bearer ")) {
		// not authenticated via next-auth
		if (!user && authHeader) {
			// Auth header is present, but no session found
			// This could be a REST API call with a non-valid token, possibly an OIDC token
			// or manually generated via getJWTToken.
			// We will try to introspect the token and create a user session if possible
			// This is a fallback for non-NextAuth authentication, e.g., direct REST-API calls with Bearer tokens.

			// getJWTToken
			const token = authHeader.split(" ")[1];
			const decodedToken = jwt.verify(token, process.env.NEXTAUTH_SECRET ?? "default");
			if (
				decodedToken &&
				typeof decodedToken === "object" &&
				"id" in decodedToken &&
				"name" in decodedToken &&
				"role" in decodedToken &&
				"isAuthor" in decodedToken &&
				"featureFlags" in decodedToken
			) {
				return {
					user: decodedToken as Session["user"]
				};
			}

			// OIDC token
			try {
				const claims = await introspectToken(token);
				if (claims.username || claims.preferred_username) {
					console.log(
						"Introspecting token for user:",
						claims.username || claims.preferred_username
					);
					const username = claims.username || claims.preferred_username;
					const role = incomingToLocalRole(claims.realm_access?.roles || []);
					const userSession = await createToken(username, role);
					return {
						user: userSession
					};
				}
			} catch (error) {
				console.error("Failed to introspect token", error);
			}
		}
	}

	if (!user) {
		return {};
	}
	return { user };
}

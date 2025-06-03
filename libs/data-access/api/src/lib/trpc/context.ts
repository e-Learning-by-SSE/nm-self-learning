import * as trpcNext from "@trpc/server/adapters/next";
import { getServerSession, Session } from "next-auth";
import { getToken } from "next-auth/jwt";
import { authOptions } from "../auth/auth";
import { createToken, incomingToLocalRole } from "../auth/create-user-session";

export type UserFromSession = Session["user"];

export type Context = {
	user?: UserFromSession;
};

/*
 * We have two options: call jwks endpoint to verify the token or introspect it.
 * or use the introspection endpoint to see the (and validate) the content of the token.
 * We used introspection endpoint here, because we don't have to add jwt decoding mechanisms.
 */
async function introspectToken(token: string): Promise<any> {
	const response = await fetch(
		`${process.env.KEYCLOAK_ISSUER_URL}/protocol/openid-connect/token/introspect`,
		{
			method: "POST",
			headers: {
				"Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
			},
			body: new URLSearchParams({
				token,
				client_id: process.env.KEYCLOAK_CLIENT_ID as string,
				client_secret: process.env.KEYCLOAK_CLIENT_SECRET as string
			})
		}
	);

	if (!response.ok) {
		throw new Error("Failed to introspect token");
	}

	const data = await response.json();
	if (!data.active) {
		throw new Error("Token is invalid or expired");
	}

	return data; // Contains user claims if the token is valid
}

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
			// This could be a REST API call with a non-valid token, possibly a Keycloak token.
			// We will try to introspect the token and create a user session if possible
			// This is a fallback for non-NextAuth authentication, e.g., direct REST-API calls with Bearer tokens.
			const token = authHeader.split(" ")[1];
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

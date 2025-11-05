import { getServerSession, Session } from "next-auth";
import * as trpcNext from "@trpc/server/adapters/next";
import { authOptions } from "../auth/auth";
import { createUserSession } from "../auth/data-access";

export type UserFromSession = Session["user"];

export type Context = {
	user?: UserFromSession;
};

async function introspectToken(token: string) {
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
	if (!session && authHeader) {
		// REST API call: Check for valid Bearer token and create session on the fly
		// to handle authenticated requests transparently
		const token = authHeader.split(" ")[1];
		try {
			const claims = await introspectToken(token);
			if (claims.preferred_username) {
				const userSession = await createUserSession({
					username: claims.preferred_username
				});
				return {
					user: userSession
				};
			}
		} catch (error) {
			console.error("Failed to introspect token", error);
		}
	}

	if (!session) {
		return {};
	}

	return {
		user: session.user
	};
}

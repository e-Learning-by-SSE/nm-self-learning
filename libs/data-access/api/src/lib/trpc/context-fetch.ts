// Used for SSE (Server-Sent Events) trpc endpoint in Next.js App Router
// Events will be sent via trpc-sse/[trpc] route and only used for trpc.subscriptions
import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { getServerSession } from "next-auth";
import { getToken } from "next-auth/jwt";
import { authOptions, createToken, incomingToLocalRole } from "@self-learning/util/auth/server";

async function introspectToken(token: string) {
	const response = await fetch(
		`${process.env.KEYCLOAK_ISSUER_URL}/protocol/openid-connect/token/introspect`,
		{
			method: "POST",
			headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
			body: new URLSearchParams({
				token,
				client_id: process.env.KEYCLOAK_CLIENT_ID as string,
				client_secret: process.env.KEYCLOAK_CLIENT_SECRET as string
			})
		}
	);
	if (!response.ok) throw new Error("Failed to introspect token");
	const data = await response.json();
	if (!data.active) throw new Error("Token is invalid or expired");
	return data;
}

export async function createTrpcContextFetch({ req }: FetchCreateContextFnOptions) {
	// NextAuth in Route Handlers: getServerSession(authOptions) (ohne req/res)
	const session = await getServerSession(authOptions);

	// Authorization header aus Fetch Request
	const authHeader = req.headers.get("authorization") ?? undefined;

	// next-auth/jwt: getToken erwartet ein Request-Objekt; wir reichen minimal weiter
	// (funktioniert i.d.R. in Next Route Handlers, da req ein Web-Request ist)
	const tokenRaw = await getToken({
		req: req as any,
		secret: process.env.NEXTAUTH_SECRET
	});

	const user = session?.user;

	if (!tokenRaw && authHeader?.startsWith("Bearer ")) {
		if (!user) {
			const token = authHeader.split(" ")[1];
			try {
				const claims = await introspectToken(token);
				const username = claims.username || claims.preferred_username;
				if (username) {
					const role = incomingToLocalRole(claims.realm_access?.roles || []);
					const userSession = await createToken(username, role);
					return { user: userSession };
				}
			} catch (e) {
				// optional: log
			}
		}
	}

	if (!user) return {};
	return { user };
}

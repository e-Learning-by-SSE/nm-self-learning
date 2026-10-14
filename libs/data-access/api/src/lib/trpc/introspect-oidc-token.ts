import { authOptions } from "@self-learning/util/auth/server";
import type { OAuthConfig } from "next-auth/providers/oauth";

function getTokenIssuer(token: string): string | undefined {
	const parts = token.split(".");
	if (parts.length !== 3 || !parts[1]) return undefined;

	try {
		const claims: unknown = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8"));
		if (!claims || typeof claims !== "object" || !("iss" in claims)) return undefined;
		const issuer = claims.iss;
		return typeof issuer === "string" && issuer.trim() ? issuer.replace(/\/+$/, "") : undefined;
	} catch {
		return undefined;
	}
}

/** Validate external bearer tokens using the configured OIDC clients. */
export async function introspectToken(token: string) {
	const issuer = getTokenIssuer(token);
	if (!issuer) {
		throw new Error("Token must be a JWT with an issuer matching a configured OIDC provider");
	}

	const oidc = authOptions.providers.find(provider => {
		if (provider.type !== "oauth") return false;
		return (provider as OAuthConfig<unknown>).issuer?.replace(/\/+$/, "") === issuer;
	}) as OAuthConfig<unknown> | undefined;
	if (!oidc?.wellKnown || !oidc.clientId || !oidc.clientSecret) {
		throw new Error("No configured OIDC provider matches the token issuer");
	}

	try {
		const discoveryResponse = await fetch(oidc.wellKnown);
		if (!discoveryResponse.ok) throw new Error();
		const discovery = await discoveryResponse.json();
		if (typeof discovery.introspection_endpoint !== "string") throw new Error();

		const response = await fetch(discovery.introspection_endpoint, {
			method: "POST",
			headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
			body: new URLSearchParams({
				token,
				client_id: oidc.clientId,
				client_secret: oidc.clientSecret
			})
		});
		if (!response.ok) throw new Error();
		const claims = await response.json();
		if (claims.active === true) return claims;
	} catch {
		throw new Error("OIDC token introspection request failed");
	}

	throw new Error("The token issuer's OIDC provider did not accept the token");
}

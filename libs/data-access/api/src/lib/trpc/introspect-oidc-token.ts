import { authOptions } from "@self-learning/util/auth/server";
import type { OAuthConfig } from "next-auth/providers/oauth";

/** Validate external bearer tokens using the configured OIDC clients. */
export async function introspectToken(token: string) {
	for (const provider of authOptions.providers) {
		if (provider.type !== "oauth") continue;
		const oidc = provider as OAuthConfig<unknown>;
		if (!oidc.wellKnown || !oidc.clientId || !oidc.clientSecret) continue;

		try {
			const discoveryResponse = await fetch(oidc.wellKnown);
			if (!discoveryResponse.ok) continue;
			const discovery = await discoveryResponse.json();
			if (typeof discovery.introspection_endpoint !== "string") continue;

			const response = await fetch(discovery.introspection_endpoint, {
				method: "POST",
				headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
				body: new URLSearchParams({
					token,
					client_id: oidc.clientId,
					client_secret: oidc.clientSecret
				})
			});
			if (!response.ok) continue;
			const claims = await response.json();
			if (claims.active === true) return claims;
		} catch {
			// An unavailable provider must not prevent trying the other configured IdPs.
		}
	}

	throw new Error("No configured OIDC provider accepted the token");
}

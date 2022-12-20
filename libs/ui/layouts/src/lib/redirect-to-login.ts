import { signIn } from "next-auth/react";

/**
 * Redirects the user to the login page.
 *
 * If the application is a demo instance, the user will be redirected to the demo login page.
 * Otherwise, they will redirected directly to the Keycloak login page.
 */
export function redirectToLogin(): void {
	if (process.env.NEXT_PUBLIC_IS_DEMO_INSTANCE === "true") {
		signIn();
	} else {
		signIn("keycloak");
	}
}

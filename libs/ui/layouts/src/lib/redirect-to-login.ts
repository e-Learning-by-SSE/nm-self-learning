import { signIn, signOut } from "next-auth/react";

/**
 * Redirects the user to the login page.
 *
 * If the application is a demo instance, the user will be redirected to the demo login page.
 * Otherwise, they will redirected directly to the Keycloak login page.
 */
export function redirectToLogin(): void {
	const callbackUrl = `${window.location.origin}/${process.env.NEXT_PUBLIC_BASE_PATH}`;
	if (process.env.NEXT_PUBLIC_IS_DEMO_INSTANCE === "true") {
		signIn();
	} else {
		signIn("keycloak", { callbackUrl: callbackUrl });
	}
}

/**
 * Redirect the user to the main app after logout.
 */
export function redirectToLogout() : void {
	const callbackUrl = `${window.location.origin}/${process.env.NEXT_PUBLIC_BASE_PATH}`;
	signOut({callbackUrl: callbackUrl });
}

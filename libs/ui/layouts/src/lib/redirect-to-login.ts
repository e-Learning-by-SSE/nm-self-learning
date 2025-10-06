import { signIn, signOut } from "next-auth/react";

function getRelativeBasePath(): string {
	const basePath = process.env.NEXT_PUBLIC_BASE_PATH;
	if (basePath) {
		return `${window.location.origin}${basePath}`;
	} else {
		return window.location.origin;
	}
}
export const testExportGetRelativeBasePath = getRelativeBasePath;

/**
 * Redirects the user to the login page.
 *
 * If the application is a demo instance, the user will be redirected to the demo login page.
 * Otherwise, they will redirected directly to the Keycloak login page.
 */
export function redirectToLogin(): void {
	const callbackUrl = `${getRelativeBasePath()}/dashboard`;
	if (process.env.NEXT_PUBLIC_IS_DEMO_INSTANCE === "true") {
		signIn(undefined, { callbackUrl: callbackUrl });
	} else {
		signIn("keycloak", { callbackUrl: callbackUrl });
	}
}

/**
 * Redirect the user to the main app after logout.
 */
export function redirectToLogout(): void {
	signOut({ callbackUrl: getRelativeBasePath() });
}

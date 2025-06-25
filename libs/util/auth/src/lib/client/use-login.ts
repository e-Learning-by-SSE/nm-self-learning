import { useRouter } from "next/router";
import { signIn, signOut } from "next-auth/react";
import { useCallback } from "react";

export function useLoginRedirect() {
	const router = useRouter();

	const loginRedirect = useCallback(
		(callback = "/profile") => {
			const callbackUrl = `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${callback ?? router.asPath}`;
			const provider =
				process.env.NEXT_PUBLIC_IS_DEMO_INSTANCE === "true" ? undefined : "keycloak";
			return signIn(provider, { callbackUrl });
		},
		[router.asPath, router.query]
	);

	const logoutRedirect = useCallback(
		(callback = "/") =>
			signOut({
				callbackUrl: callback.startsWith("/") ? callback : `/${callback}`
			}),
		[]
	);

	return { loginRedirect, logoutRedirect };
}

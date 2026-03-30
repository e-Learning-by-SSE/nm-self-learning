import { useRouter } from "next/router";
import { signIn, signOut } from "next-auth/react";
import { useCallback } from "react";

export function useLoginRedirect() {
	const router = useRouter();
	const basePath = router.basePath || process.env.NEXT_PUBLIC_BASE_PATH || "";

	const loginRedirect = useCallback(
		(callback = "/profile") => {
			const callbackUrl = `${basePath}${callback ?? router.asPath}`;
			const provider =
				process.env.NEXT_PUBLIC_IS_DEMO_INSTANCE === "true" ? undefined : "keycloak";
			return signIn(provider, { callbackUrl });
		},
		[router.asPath, router.query]
	);

	const logoutRedirect = useCallback((callback = "/") => {
		const callbackUrl = `${basePath}${callback ?? router.asPath}`;
		signOut({
			callbackUrl: callbackUrl.startsWith("/") ? callbackUrl : `/${callbackUrl}`
		});
	}, []);

	return { loginRedirect, logoutRedirect };
}

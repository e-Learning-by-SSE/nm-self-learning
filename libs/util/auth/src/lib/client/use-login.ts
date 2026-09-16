import { useRouter } from "next/router";
import { getProviders, signIn, signOut } from "next-auth/react";
import { useCallback } from "react";

export function useLoginRedirect() {
	const router = useRouter();
	const basePath = router.basePath || process.env.NEXT_PUBLIC_BASE_PATH || "";

	const loginRedirect = useCallback(
		async (callback = "/profile") => {
			const callbackUrl = `${basePath}${callback ?? router.asPath}`;

			if (process.env.NEXT_PUBLIC_IS_DEMO_INSTANCE === "true") {
				return signIn(undefined, { callbackUrl });
			}

			const providers = await getProviders();
			const oidcProvider = Object.values(providers ?? {}).find(
				provider => provider.type === "oauth"
			);

			return signIn(oidcProvider?.id, { callbackUrl });
		},
		[basePath, router.asPath]
	);

	const logoutRedirect = useCallback((callback = "/") => {
		const callbackUrl = `${basePath}${callback ?? router.asPath}`;
		signOut({
			callbackUrl: callbackUrl.startsWith("/") ? callbackUrl : `/${callbackUrl}`
		});
	}, []);

	return { loginRedirect, logoutRedirect };
}

import { useRouter } from "next/router";
import { getProviders, signIn, signOut } from "next-auth/react";
import { useCallback } from "react";

export function useLoginRedirect() {
	const router = useRouter();
	const basePath = router.basePath;

	const loginRedirect = useCallback(
		async (callback = "/profile") => {
			const callbackUrl = `${basePath}${callback ?? router.asPath}`;

			const providers = await getProviders();
			const availableProviders = Object.values(providers ?? {});
			const provider = availableProviders.length === 1 ? availableProviders[0] : undefined;

			return signIn(provider?.type === "oauth" ? provider.id : undefined, {
				callbackUrl
			});
		},
		[basePath, router.asPath]
	);

	const logoutRedirect = useCallback(
		(callback = "/") => {
			const callbackUrl = `${basePath}${callback ?? router.asPath}`;
			signOut({
				callbackUrl: callbackUrl.startsWith("/") ? callbackUrl : `/${callbackUrl}`
			});
		},
		[basePath, router.asPath]
	);

	return { loginRedirect, logoutRedirect };
}

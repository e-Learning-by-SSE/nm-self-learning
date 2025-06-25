// this file is used to call the useLoginRedirect hook. In SSP we want to login the user from time to time

import { useLoginRedirect } from "@self-learning/util/auth";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function Login() {
	const router = useRouter();
	const { loginRedirect } = useLoginRedirect();
	const callbackUrl = router.query.callbackUrl as string | undefined;
	useEffect(() => {
		if (router.isReady) {
			console.log("Login page callbackUrl:", callbackUrl);
			void loginRedirect(callbackUrl);
		}
	}, [callbackUrl, loginRedirect, router.isReady, router.query]);

	return <></>;
}

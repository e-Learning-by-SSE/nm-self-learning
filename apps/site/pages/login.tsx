import { signIn } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { withTranslations } from "@self-learning/api";

export const getServerSideProps = withTranslations(["common"]);

export default function Login() {
	const router = useRouter();

	useEffect(() => {
		const callbackUrl = router.query.callbackUrl;
		signIn(undefined, { callbackUrl: `${window.origin}/${callbackUrl ?? ""}` });
	}, [router.query]);

	return <></>;
}

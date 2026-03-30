import { useRouter } from "next/router";
import { useEffect } from "react";

export default function ExperimentRedirect() {
	const router = useRouter();

	useEffect(() => {
		router.replace("/experiment/consent");
	}, [router]);
	return <>Weiterleitung</>;
}

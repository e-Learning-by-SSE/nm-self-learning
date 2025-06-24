"use client";
import { NotificationsRenderer } from "@self-learning/ui/notifications";
import { useEventLog } from "@self-learning/util/eventlog";
import { init } from "@socialgouv/matomo-next";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { Toaster } from "react-hot-toast";

// TODO find a better place for this file - should be easy if we migrate to app router.

function usePageTracking(): void {
	const router = useRouter();
	const session = useSession();

	const { newEvent } = useEventLog();
	// load user agent

	useEffect(() => {
		// Früher Return wenn nicht authentifiziert
		console.log("usePageTracking: Session status:", session.status);
		if (session.status !== "authenticated") return;

		async function handleRouteChange(url: string) {
			// Erstelle Promise, aber handle es nicht im Effect
			return newEvent({
				type: "PAGE_VIEW",
				resourceId: url,
				payload: {
					userAgent: navigator.userAgent ?? "Unknown User Agent"
				}
			});
		}

		// Track initial page load
		handleRouteChange(router.asPath);

		// Listen for route changes
		router.events.on("routeChangeComplete", handleRouteChange);

		return () => {
			router.events.off("routeChangeComplete", handleRouteChange);
		};
	}, [newEvent, router.asPath, router.events, session]);
}

export function GlobalFeatures() {
	useMatomo();
	usePageTracking();
	return (
		<>
			<Toaster containerStyle={{ top: 96 }} position="top-right" />
			<NotificationsRenderer />
		</>
	);
}

function useMatomo() {
	useEffect(() => {
		const MATOMO_URL = process.env.NEXT_PUBLIC_MATOMO_URL;
		const MATOMO_SITE_ID = process.env.NEXT_PUBLIC_MATOMO_SITE_ID;
		if (MATOMO_URL && MATOMO_SITE_ID) {
			init({ url: MATOMO_URL, siteId: MATOMO_SITE_ID, excludeUrlsPatterns: [/\/api\//] });
		}
	}, []);
}

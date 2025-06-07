"use client";
import { NotificationsRenderer } from "@self-learning/ui/notifications";
import { init } from "@socialgouv/matomo-next";
import { useEffect } from "react";
import { Toaster } from "react-hot-toast";

// TODO find a better place for this file - should be easy if we migrate to app router.

export function GlobalFeatures() {
	useMatomo();
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

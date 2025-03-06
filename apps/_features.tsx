"use client";
import { trpc } from "@self-learning/api-client";
import { FirstLoginDialog } from "@self-learning/settings";
import { MessagePortal } from "@self-learning/ui/notifications";
import { init } from "@socialgouv/matomo-next";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";

// TODO find a better place for this file - should be easy if we migrate to app router.

export function GlobalFeatures() {
	useMatomo();
	return (
		<>
			<ControlledMsgPortal />
			<ControlledFirstLoginDialog />
			<Toaster containerStyle={{ top: 96 }} position="top-right" />
		</>
	);
}

export function ControlledFirstLoginDialog() {
	const session = useSession();
	const { data, isLoading } = trpc.me.registrationStatus.useQuery(undefined, {
		enabled: session.data?.user?.name !== undefined
	});
	const router = useRouter();
	const [onboardingDialogClosed, setDialogClosed] = useState<boolean | null>(null);

	if (onboardingDialogClosed === null && data) {
		setDialogClosed(data.registrationCompleted ?? false);
	}
	const [shouldRender, setShouldRender] = useState<boolean>(false);

	useEffect(() => {
		const storageKey = "lastRenderTime";

		const now = Date.now();

		const twentyFourHours = 24 * 60 * 60 * 1000; // 86,400,000 ms in a day

		const lastRenderTime = localStorage.getItem(storageKey);

		if (!lastRenderTime) {
			setShouldRender(true);
			localStorage.setItem(storageKey, now.toString());
		} else {
			const lastTime: number = parseInt(lastRenderTime, 10);

			if (now - lastTime >= twentyFourHours) {
				setShouldRender(true);
				localStorage.setItem(storageKey, now.toString());
			}
		}
	}, []);

	if (isLoading) {
		return null;
	}

	if (!shouldRender) {
		return null;
	}

	const registrationCompleted = data?.registrationCompleted ?? true;

	if (registrationCompleted || onboardingDialogClosed) {
		return null;
	}

	return (
		<FirstLoginDialog
			onClose={() => {
				setDialogClosed(true);
				router.reload();
			}}
		/>
	);
}

function ControlledMsgPortal() {
	const globalMessage = process.env.NEXT_PUBLIC_SYSTEM_MSG;
	if (!globalMessage) return null;
	return <MessagePortal htmlMessage={globalMessage} />;
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

import { FirstLoginDialog } from "@self-learning/settings";
import { MessagePortal } from "@self-learning/ui/notifications";
import { init } from "@socialgouv/matomo-next";
import { useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";

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

function ControlledFirstLoginDialog() {
	const [studentSettingsDialogOpen, setStudentSettingsDialogOpen] = useState(true);

	if (!studentSettingsDialogOpen) {
		return null;
	}
	return <FirstLoginDialog onClose={() => setStudentSettingsDialogOpen(false)} />;
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

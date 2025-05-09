"use client";
import { trpc } from "@self-learning/api-client";
import { StreakSlotMachineDialog } from "@self-learning/settings";
import { NotificationEntry, StreakInfo } from "@self-learning/types";
import { useState } from "react";
import { MessagePortal } from "./message-portal/message-portal";
import { MotdDialog } from "./motd/motd-dialog";

export function NotificationsRenderer() {
	const { data: notifications } = trpc.notification.getOwn.useQuery(undefined, {
		refetchOnWindowFocus: false,
		refetchOnReconnect: false,
		refetchOnMount: false,
		refetchIntervalInBackground: false
	});
	if (!notifications) return null;

	return (
		<>
			{notifications.map(entry => {
				// we assume, that the only valid notification are written to the database
				const notification = entry as unknown as NotificationEntry;
				return (
					<DynamicNotificationRenderer
						key={notification.id}
						notification={notification}
					/>
				);
			})}
		</>
	);
}

export function DynamicNotificationRenderer({ notification }: { notification: NotificationEntry }) {
	switch (notification.component) {
		case "MotdDialog":
			return <MotdDialog {...notification.props} />;
		case "BannerMessage":
			return <MessagePortal {...notification.props} />;
		case "StreakInfoDialog":
			return (
				<StreakInfoDialogWrapper notificationId={notification.id} {...notification.props} />
			);
		default:
			return null;
	}
}

function StreakInfoDialogWrapper(props: StreakInfo & { notificationId: string }) {
	const [open, setOpen] = useState(true);
	const { mutateAsync: deleteNotification } = trpc.notification.delete.useMutation();

	const handleClose = async () => {
		setOpen(false);
		// we need to wait for the dialog to close before deleting the notification
		// otherwise the animation will be interrupted. so we don't wait for the deletion
		void deleteNotification({ notificationIds: [props.notificationId] });
	};

	return <StreakSlotMachineDialog open={open} onClose={handleClose} {...props} />;
}

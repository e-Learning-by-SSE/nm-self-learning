"use client";
import { trpc } from "@self-learning/api-client";
import { OnboardingDialog, StreakSlotMachineDialog } from "@self-learning/profile";
import { flamesSchema, loginStreakSchema, streakDialogTriggerEnum } from "@self-learning/types";
import { useState } from "react";
import { z } from "zod";
import { MessagePortal } from "./message-portal/message-portal";
import { useRouter } from "next/router";

export const notificationPropSchema = {
	StreakInfoDialog: z.object({
		trigger: streakDialogTriggerEnum,
		loginStreak: loginStreakSchema,
		flames: flamesSchema
	}),
	BannerMessage: z.object({
		htmlMessage: z.string(),
		dismissible: z.boolean().optional(),
		autoDismiss: z.boolean().optional(),
		visibleTime: z.number().optional()
	}),
	OnboardingDialog: z.object({}).optional()
} as const;

export type NotificationPropsMap = {
	[K in keyof typeof notificationPropSchema]: z.infer<(typeof notificationPropSchema)[K]>;
};

export type NotificationEntry = {
	[K in keyof NotificationPropsMap]: {
		id: string;
		component: K;
		props: NotificationPropsMap[K];
	};
}[keyof NotificationPropsMap];

export function validateNotification<T extends NotificationEntry>(
	notification: T
): { success: true; value: T } | { success: false; error: z.ZodError } {
	const schema = notificationPropSchema[notification.component] as z.ZodType<
		typeof notification.props
	>;
	const result = schema.safeParse(notification.props);

	if (result.success) {
		return { success: true, value: notification };
	} else {
		return { success: false, error: result.error };
	}
}

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
		case "BannerMessage":
			return <MessagePortal {...notification.props} />;
		case "StreakInfoDialog":
			return (
				<StreakInfoDialogWrapper {...notification.props} notificationId={notification.id} />
			);
		case "OnboardingDialog":
			return <NotificationOnboardingDialog {...notification} {...notification.props} />;
		default:
			return null;
	}
}

function StreakInfoDialogWrapper(
	props: NotificationPropsMap["StreakInfoDialog"] & { notificationId: string }
) {
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

/**
 * Controlling dialog for the onboarding. Used in notification module.
 */
export function NotificationOnboardingDialog({ id }: { id: string }) {
	const { mutateAsync: deleteNotification } = trpc.notification.delete.useMutation();
	const router = useRouter();

	return (
		<OnboardingDialog
			onClose={() => {
				void deleteNotification({ notificationIds: [id] });
			}}
			onSubmit={() => {
				void router.reload();
			}}
		/>
	);
}

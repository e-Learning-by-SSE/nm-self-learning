"use client";
import { trpc } from "@self-learning/api-client";
import { OnboardingDialog, StreakSlotMachineDialog } from "@self-learning/profile";
import { loginStreakSchema, streakDialogTriggerEnum } from "@self-learning/types";
import { LightningLoadingDialog } from "@self-learning/ui/common";
import { useRequiredSession } from "@self-learning/ui/layouts";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { MessagePortal } from "./message-portal/message-portal";
import { NotificationEntry, NotificationPropsMap } from "./notification-types";

export const notificationPropSchema = {
	StreakInfoDialog: z.object({
		trigger: streakDialogTriggerEnum,
		loginStreak: loginStreakSchema,
		energy: z.number().int().nonnegative()
	}),
	BannerMessage: z.object({
		htmlMessage: z.string(),
		dismissible: z.boolean().optional(),
		autoDismiss: z.boolean().optional(),
		visibleTime: z.number().optional()
	}),
	OnboardingDialog: z.object({}).optional(),
	ExperimentConsentForwarder: z.object({}).optional(),
	NewEnergy: z.object({
		count: z.number()
	})
} as const;

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
		case "ExperimentConsentForwarder":
			return <ExperimentConsentForwarder {...notification} {...notification.props} />;
		case "NewEnergy":
			return <NewEnergyNotification {...notification} {...notification.props} />;
		default:
			return null;
	}
}

// TODO Marcel check. Previous use of NotificationPropsMap with ExperimentConsentForwarder: z.object({}).optional() lead to type error:
// Type '{ id: string; component: "ExperimentConsentForwarder"; props: Record<string, never>; }' is not assignable to type 'Record<string, never>'
type ExperimentConsentForwarderNotification = Extract<
	NotificationEntry,
	{ component: "ExperimentConsentForwarder" }
>;

function ExperimentConsentForwarder(props: ExperimentConsentForwarderNotification) {
	const { mutateAsync: deleteNotification } = trpc.notification.delete.useMutation();
	const session = useRequiredSession();
	const { data: registrationStatus, isLoading } = trpc.me.getRegistrationStatus.useQuery(
		undefined,
		{
			enabled: session.data?.user?.name !== undefined
		}
	);
	const router = useRouter();

	useEffect(() => {
		if (!isLoading && registrationStatus?.registrationCompleted === false) {
			deleteNotification({ notificationIds: [props.id] }).then(() => {
				router.push("/experiment/consent");
			});
		}
	}, [isLoading, registrationStatus, props.id, deleteNotification, router]);

	return null;
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

export function NewEnergyNotification({
	count,
	id
}: NotificationPropsMap["NewEnergy"] & { id: string }) {
	const { mutateAsync: deleteNotification } = trpc.notification.delete.useMutation();
	const [open, setOpen] = useState(true);

	return (
		<LightningLoadingDialog
			open={open}
			onClose={async () => {
				await deleteNotification({ notificationIds: [id] });
				setOpen(false);
			}}
			animationMode="once"
			text={"Du hast gerade +" + count + " Energie erhalten!"}
			showOkButton={true}
		/>
	);
}

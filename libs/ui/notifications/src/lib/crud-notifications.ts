import {
	Notification,
	NotificationChannel,
	NotificationType,
	Prisma,
	PrismaClient
} from "@prisma/client";
import { database } from "@self-learning/database";
import { addBusinessDays } from "date-fns";
import {
	NotificationEntry,
	NotificationPropsMap,
	validateNotification
} from "./notification-renderer-registry";

type DbInputNotification = Partial<
	Omit<Notification, "id" | "createdAt" | "updatedAt" | "component" | "props">
>;

export async function createNotification<K extends keyof NotificationPropsMap>(
	input: {
		component: K;
		props: NotificationPropsMap[K];
		tx?: Prisma.TransactionClient;
		targetUser?: string[] | string;
	} & DbInputNotification
) {
	const { component, props, tx, targetUser, targetAudience = "user", ...rest } = input;
	// we want to make sure that when the targetAudience is not set, we make set it to the most restrictive one
	// which is the user, because then specific targets needs to be defined.
	// Sicherstellen, dass die Props valide sind
	const validation = validateNotification({ component, props } as NotificationEntry);
	if (!validation.success) throw validation.error;

	const execution = async (client: Prisma.TransactionClient) => {
		const newNotification = await client.notification.create({
			data: {
				component,
				props: props ?? {},
				displayFrom: new Date(),
				displayUntil: addBusinessDays(new Date(), 5),
				targetAudience,
				...rest
			}
		});

		if (targetUser && targetAudience === "user") {
			const userIds = Array.isArray(targetUser) ? targetUser : [targetUser];
			await client.notificationUser.createMany({
				data: userIds.map(userId => ({
					userId,
					notificationId: newNotification.id
				}))
			});
		}
		return newNotification;
	};
	return tx ? execution(tx) : database.$transaction(execution);
}

export async function createInitialNotificationSettings(
	user: { id: string },
	client: Prisma.TransactionClient | PrismaClient = database
) {
	await client.userNotificationSetting.createMany({
		data: getDefaultNotificationData().map(setting => ({
			...setting,
			userId: user.id
		}))
	});
}

function getDefaultNotificationData(defaultValue?: boolean) {
	const types = Object.values(NotificationType);
	const channels = Object.values(NotificationChannel);
	return types.flatMap(type =>
		channels.map(channel => ({
			type,
			channel,
			enabled: defaultValue // if undefined -> prisma default
		}))
	);
}

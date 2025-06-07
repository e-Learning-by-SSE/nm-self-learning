import { Notification, Prisma } from "@prisma/client";
import { database } from "@self-learning/database";
import {
	NotificationEntry,
	NotificationPropsMap,
	validateNotification
} from "./notification-renderer-registry";
import { addBusinessDays } from "date-fns";

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

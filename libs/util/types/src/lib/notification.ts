import { z } from "zod";
import { flamesSchema, loginStreakSchema, streakDialogTriggerEnum } from "./gamificationProfile";

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
	})
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

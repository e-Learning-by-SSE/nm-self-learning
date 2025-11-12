import { z } from "zod";
import { notificationPropSchema } from "./notification-renderer-registry";

/**
 * Own file since the auth library is not able to import .tsx files but still need the types to create notifications.
 */

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

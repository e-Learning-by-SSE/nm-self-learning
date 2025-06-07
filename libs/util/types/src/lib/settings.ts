import * as z from "zod";
import { EmailContext } from "@self-learning/ui/notifications";

export const editFeatureSettingsSchema = z.object({
	enabledLearningStatistics: z.boolean(),
	enabledFeatureLearningDiary: z.boolean()
});
export type EditFeatureSettings = z.infer<typeof editFeatureSettingsSchema>;

export const editPersonalSettingSchema = z.object({
	displayName: z.string().min(3).max(50)
});
export type EditPersonalSettings = z.infer<typeof editPersonalSettingSchema>;

export const editNotificationSettingsSchema = z.object({
	courseReminder: z.boolean().default(true),
	streakReminder: z.boolean().default(true)
});
// add a compiler check to be sure that every email context type is covered and can be used in the settings
const _assert = editNotificationSettingsSchema.shape satisfies Record<
	EmailContext["type"],
	z.ZodTypeAny
>;
export type NotificationSettings = z.infer<typeof editNotificationSettingsSchema>;

export const editUserSettingsSchema = z
	.object({
		user: z
			.object({
				...editPersonalSettingSchema.shape,
				...editFeatureSettingsSchema.shape,
				...editNotificationSettingsSchema.shape,
				registrationCompleted: z.boolean()
			})
			.partial()
	})
	.partial();

export type EditUserSettings = z.infer<typeof editUserSettingsSchema>;

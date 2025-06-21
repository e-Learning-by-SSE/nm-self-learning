import { NotificationChannel, NotificationType } from "@prisma/client";
import * as z from "zod";

export const editFeatureSettingsSchema = z
	.object({
		learningStatistics: z.boolean().default(true),
		// experimental: z.boolean().default(false), // Uncomment if you want to let the user change this setting via the default setting page
		learningDiary: z.boolean().default(false)
	})
	.partial();

export type EditFeatureSettings = z.infer<typeof editFeatureSettingsSchema>;

export const editPersonalSettingSchema = z.object({
	displayName: z.string().min(3).max(50)
});
export type EditPersonalSettings = z.infer<typeof editPersonalSettingSchema>;

export const editUserSchema = z
	.object({
		user: z
			.object({
				...editPersonalSettingSchema.shape,
				registrationCompleted: z.boolean()
			})
			.partial()
	})
	.partial();

export type EditUserInput = z.input<typeof editUserSchema>;

// compatible with prisma schema
export const userNotificationSettingSchema = z.object({
	id: z.string().optional(), // optional for create, required for update
	userId: z.string(),
	type: z.nativeEnum(NotificationType),
	channel: z.nativeEnum(NotificationChannel),
	enabled: z.boolean().default(true)
});
export type UserNotificationSetting = z.infer<typeof userNotificationSettingSchema>;

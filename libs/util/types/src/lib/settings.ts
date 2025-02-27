// import { editFeatureSettingsSchema, editPersonalSettingSchema } from "@self-learning/settings";
import * as z from "zod";

export const editFeatureSettingsSchema = z.object({
	enabledLearningStatistics: z.boolean(),
	enabledFeatureLearningDiary: z.boolean()
});
export type EditFeatureSettings = z.infer<typeof editFeatureSettingsSchema>;

export const editPersonalSettingSchema = z.object({
	displayName: z.string().min(3).max(50)
});
export type EditPersonalSettings = z.infer<typeof editPersonalSettingSchema>;

export const editUserSettingsSchema = z
	.object({
		user: z
			.object({
				...editPersonalSettingSchema.shape,
				...editFeatureSettingsSchema.shape,
				registrationCompleted: z.boolean()
			})
			.partial()
	})
	.partial();

export type EditUserSettings = z.infer<typeof editUserSettingsSchema>;

import { database } from "@self-learning/database";
import { editNotificationSettingsSchema } from "@self-learning/types";
export async function getUserWithSettings(username: string) {
	const data = await database.user.findUniqueOrThrow({
		where: {
			name: username
		},
		select: {
			name: true,
			displayName: true,
			email: true,
			image: true,
			enabledLearningStatistics: true,
			enabledFeatureLearningDiary: true,
			notificationSettings: true
		}
	});
	return {
		...data,
		notificationSettings: editNotificationSettingsSchema.parse(data.notificationSettings ?? {})
	};
}

import { database } from "@self-learning/database";
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
			notificationSettings: true,
			featureFlags: {
				select: {
					experimental: true,
					learningDiary: true,
					learningStatistics: true
				}
			}
		}
	});
	if (!data.featureFlags) {
		throw new Error("Feature flags not found for user");
	}
	return {
		...data,
		featureFlags: data.featureFlags // now non-null after check
	};
}

import { database } from "@self-learning/database";

export async function getUserWithSettings(username: string) {
	return await database.user.findUnique({
		where: {
			name: username
		},
		select: {
			name: true,
			displayName: true,
			email: true,
			image: true,
			enabledLearningStatistics: true,
			enabledFeatureLearningDiary: true
		}
	});
}

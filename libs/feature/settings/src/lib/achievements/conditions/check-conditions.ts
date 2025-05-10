import { AchievementTrigger } from "@prisma/client";
import { database } from "@self-learning/database";
import { Achievement, achievementSchema } from "@self-learning/types";
import { conditionCheckers } from ".";

export async function checkAndAwardAchievements(
	trigger: AchievementTrigger,
	userId: string,
	context = {}
): Promise<Achievement[]> {
	const newAchievements: Achievement[] = [];

	const achievements = await database.achievement.findMany({ where: { trigger } });

	for (const achievement of achievements) {
		if (!achievement.meta) continue;

		let parsedAchievement;
		try {
			parsedAchievement = achievementSchema.parse(achievement);
		} catch {
			console.warn(`Invalid meta for achievement ${achievement.code}`);
			continue;
		}
		if (!parsedAchievement.meta) continue;

		const checker = conditionCheckers[parsedAchievement.meta.group];
		if (!checker) continue;

		const hasAchievement = await database.earnedAchievement.findUnique({
			where: {
				userId_achievementId: {
					userId,
					achievementId: achievement.id
				}
			}
		});

		if (!hasAchievement) {
			const fulfilled = await checker(parsedAchievement, userId, context);
			if (fulfilled) {
				await database.earnedAchievement.create({
					data: {
						userId,
						achievementId: achievement.id,
						earnedAt: new Date()
					}
				});
				newAchievements.push(parsedAchievement);
			}
		}
	}

	return newAchievements;
}

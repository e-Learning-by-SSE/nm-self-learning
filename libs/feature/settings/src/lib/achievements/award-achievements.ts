import { AchievementTrigger } from "@prisma/client";
import { database } from "@self-learning/database";
import {
	AchievementDb,
	achievementFullSchema,
	AchievementWithProgress,
	achievementWithProgressSchema
} from "@self-learning/types";
import { ACHIEVEMENT_CONDITION_CHECKERS } from "./achievement-registry";

export async function checkAndAwardAchievements({
	trigger,
	userId,
	context = {}
}: {
	trigger: AchievementTrigger;
	userId: string;
	context?: Record<string, unknown>;
}) {
	const updatedAchievements: AchievementWithProgress[] = [];

	const achievements = await database.achievement.findMany({
		where: { trigger },
		include: {
			progressBy: {
				where: { userId },
				select: { progressValue: true }
			}
		}
	});

	for (const achievement of achievements) {
		if (!achievement.meta) continue;

		let parsedAchievement: AchievementDb;
		try {
			parsedAchievement = achievementFullSchema.parse(achievement);
		} catch {
			console.warn(`Invalid meta for achievement ${achievement.code}`);
			continue;
		}
		if (!parsedAchievement.meta) continue;

		const checker = ACHIEVEMENT_CONDITION_CHECKERS[parsedAchievement.meta.group];
		if (!checker) continue;

		// Use the progress value directly from the query
		const progressValue = achievement.progressBy[0]?.progressValue ?? 0;
		const hasAchievement = progressValue >= achievement.requiredValue;

		if (!hasAchievement) {
			const achievementWithProgress = {
				...parsedAchievement,
				progressValue
			};
			const evaluation = await checker(achievementWithProgress, userId, context);

			if (evaluation.type !== "unchanged") {
				console.debug(
					`Update achievement progress ${achievement.code} (${achievement.id}) to user ${userId}`
				);
				const newValue = evaluation.newValue ?? 0; // as an alternative we could use evaluation.type to check on "earned"
				const completed = newValue >= achievement.requiredValue;
				const completedAt = completed ? new Date() : null;

				await database.achievementProgress.upsert({
					create: {
						userId,
						achievementId: achievement.id,
						progressValue: newValue,
						completedAt
					},
					update: {
						progressValue: evaluation.newValue, // allow undefined
						completedAt
					},
					where: {
						userId_achievementId: {
							userId,
							achievementId: achievement.id
						}
					}
				});
				updatedAchievements.push({
					...achievementWithProgress,
					progressValue: newValue
				});
			}
		}
	}
	return updatedAchievements;
}

import { AchievementTrigger } from "@prisma/client";
import { database } from "@self-learning/database";
import {
	AchievementDb,
	achievementFullSchema,
	AchievementWithProgress
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
	const achievements = await database.achievement.findMany({ where: { trigger } });

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

		const progressOnAchievement = await database.achievementProgress.findUnique({
			select: {
				progressValue: true
			},

			where: {
				userId_achievementId: {
					userId,
					achievementId: achievement.id
				}
			}
		});
		const hasAchievement =
			(progressOnAchievement?.progressValue ?? 0) >= achievement.requiredValue;

		if (!hasAchievement) {
			const achievementWithProgress = {
				...parsedAchievement,
				progressValue: progressOnAchievement?.progressValue ?? 0
			};
			const evaluation = await checker(achievementWithProgress, userId, context);
			if (evaluation.type !== "unchanged") {
				console.log(
					`Update achievement progress ${achievement.code} (${achievement.id}) to user ${userId}
					`
				);
				await database.achievementProgress.upsert({
					create: {
						userId,
						achievementId: achievement.id,
						progressValue: evaluation.newValue ?? 0
					},
					update: {
						progressValue: evaluation.newValue
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
					progressValue: evaluation.newValue ?? 0
				});
			}
		}
	}
	return updatedAchievements;
}

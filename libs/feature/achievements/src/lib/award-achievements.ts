import { AchievementTrigger } from "@prisma/client";
import { database } from "@self-learning/database";
import {
	AchievementDb,
	achievementFullSchema,
	AchievementWithProgress
} from "@self-learning/types";
import { ACHIEVEMENT_CONDITION_CHECKERS } from "./achievement-registry";

type CheckAndAwardParams = {
	trigger: AchievementTrigger;
	username: string;
	context?: Record<string, unknown>;
};

export async function checkAndAwardAchievements({
	trigger,
	username,
	context = {}
}: CheckAndAwardParams): Promise<AchievementWithProgress[]> {
	const achievements = await loadAchievementsWithProgress(trigger, username);
	const updatedAchievements: AchievementWithProgress[] = []; //return value

	for (const achievement of achievements) {
		const parsedAchievement = parseAchievement(achievement);
		if (!parsedAchievement) continue;
		if (!parsedAchievement.meta) continue;

		const checker = ACHIEVEMENT_CONDITION_CHECKERS[parsedAchievement.meta.group];
		if (!checker) continue;

		const progress = achievement.progressBy[0];
		const alreadyRedeemed = !!progress?.redeemedAt;
		const currentValue = progress?.progressValue ?? 0;

		if (alreadyRedeemed) continue;

		const achievementWithProgress = { ...parsedAchievement, progressValue: currentValue };
		const evaluation = await checker(achievementWithProgress, username, context);

		if (evaluation.type === "unchanged") continue;

		const newValue = evaluation.newValue ?? 0;

		await updateProgress(achievement.id, username, newValue);
		updatedAchievements.push({
			...achievementWithProgress,
			progressValue: newValue,
			redeemedAt: achievement.progressBy[0]?.redeemedAt
		});
	}

	return updatedAchievements;
}

async function loadAchievementsWithProgress(trigger: AchievementTrigger, username: string) {
	return database.achievement.findMany({
		where: { trigger },
		include: {
			progressBy: {
				where: { username },
				select: { progressValue: true, redeemedAt: true }
			}
		}
	});
}

function parseAchievement(raw: unknown): AchievementDb | null {
	try {
		const parsed = achievementFullSchema.parse(raw);
		if (!parsed.meta) return null;
		return parsed;
	} catch {
		if (typeof raw === "object" && raw && "code" in raw) {
			console.warn(`Invalid meta for achievement ${(raw as any).code}`);
		}
		return null;
	}
}

async function updateProgress(achievementId: string, username: string, progressValue: number) {
	console.debug(`Updating progress for achievement ${achievementId} and user ${username}`);
	await database.achievementProgress.upsert({
		create: {
			username,
			achievementId,
			progressValue
		},
		update: { progressValue },
		where: {
			username_achievementId: {
				username,
				achievementId
			}
		}
	});
}

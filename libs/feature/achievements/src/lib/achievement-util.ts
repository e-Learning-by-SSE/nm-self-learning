import { achievementMetaSchema } from "@self-learning/types";

export function convertAchievement<
	T extends {
		progressBy: { progressValue: number; redeemedAt: Date | null; updatedAt: Date | null }[];
		meta: unknown;
	}
>(
	achievement: T
):
	| (T & {
			meta: unknown;
			progressValue: number;
			redeemedAt: Date | null;
			lastProgressUpdate: Date | null;
	  })
	| undefined {
	const { progressValue, redeemedAt, updatedAt } = achievement.progressBy[0] || {
		progressValue: 0,
		redeemedAt: null,
		updatedAt: null
	};
	const meta = achievementMetaSchema.safeParse(achievement.meta);
	if (meta.success) {
		return {
			...achievement,
			meta: meta.data,
			progressValue,
			redeemedAt,
			lastProgressUpdate: updatedAt
		};
	} else {
		console.warn("Invalid achievement meta; skipping:", achievement.meta);
		return;
	}
}

import { database } from "@self-learning/database";
import { ConditionChecker } from "@self-learning/types";

export const checkStreak: ConditionChecker = async (achievement, userId, _context) => {
	if (achievement.meta?.group !== "streak") throw new Error("Invalid achievement group");

	const requiredDays = achievement.meta.requiredDays;

	const data = await database.gamificationProfile.findUnique({
		where: { userId },
		select: {
			loginStreak: true,
			meta: true
		}
	});

	if (!data) return false;
	return data.loginStreak > requiredDays;
};

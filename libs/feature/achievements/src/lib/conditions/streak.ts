import { database } from "@self-learning/database";
import { ConditionChecker } from "../achievement-registry";
import { LoginStreak } from "@self-learning/types";

export const checkDailyStreak: ConditionChecker = async (achievement, username, _context) => {
	if (achievement.meta?.group !== "daily_streak") throw new Error("Invalid achievement group");

	const data = await database.gamificationProfile.findUnique({
		where: { username },
		select: {
			loginStreak: true
		}
	});
	if (!data) return {};

	return {
		newValue: (data.loginStreak as unknown as LoginStreak).count
	};
};

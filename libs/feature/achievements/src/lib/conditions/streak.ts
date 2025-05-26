import { database } from "@self-learning/database";
import { ConditionChecker } from "../achievement-registry";
import { LoginStreak } from "@self-learning/types";

export const checkStreak: ConditionChecker = async (achievement, username, _context) => {
	if (achievement.meta?.group !== "streak") throw new Error("Invalid achievement group");

	const data = await database.gamificationProfile.findUnique({
		where: { username },
		select: {
			loginStreak: true,
			meta: true
		}
	});
	if (!data) return {};

	return {
		newValue: (data.loginStreak as unknown as LoginStreak).count
	};
};

import { database } from "@self-learning/database";
import { ConditionChecker } from "../achievement-registry";

export const checkStreak: ConditionChecker = async (achievement, username, _context) => {
	if (achievement.meta?.group !== "streak") throw new Error("Invalid achievement group");

	const requiredDays = achievement.requiredValue;

	const data = await database.gamificationProfile.findUnique({
		where: { username },
		select: {
			loginStreak: true,
			meta: true
		}
	});
	if (!data) return { type: "unchanged" };

	const changeType = (() => {
		if (data.loginStreak > requiredDays) {
			return "earned";
		} else if (data.loginStreak > achievement.progressValue) {
			return "progressed";
		} else if (data.loginStreak < achievement.progressValue) {
			return "regressed";
		} else {
			return "unchanged";
		}
	})();

	return {
		type: changeType,
		newValue: data.loginStreak
	};
};

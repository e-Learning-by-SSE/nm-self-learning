import { database } from "@self-learning/database";
import { ConditionChecker } from "../achievement-registry";
import { LoginStreak } from "@self-learning/types";

export const checkDailyStreak: ConditionChecker = async (achievement, username, _context) => {
	if (achievement.meta?.group !== "daily_streak") throw new Error("Invalid achievement group");

	const data = await database.gamificationProfile.findUnique({
		where: { username },
		select: {
			loginStreak: true,
			achievementProgress: {
				where: { achievementId: achievement.id },
				select: { progressValue: true }
			}
		}
	});
	if (!data) return {};

	const loginStreak = data.loginStreak as unknown as LoginStreak;
	let newValue: number | undefined;

	if (data.achievementProgress.length > 0) {
		// bereits Fortschritt vorhanden
		const progress = data.achievementProgress[0];
		if (progress.progressValue !== loginStreak.count) {
			console.log(
				`Achievement check for daily_streak: ${username} has a streak of ${loginStreak.count} days, but progress is ${progress.progressValue} days`
			);
			// Fortschritt hat sich geändert
			newValue = loginStreak.count; // decrease möglich; immer aktuellsten Wert nehmen
		}
	}
	return { newValue };
};

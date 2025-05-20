import { database } from "@self-learning/database";
import { ConditionChecker } from "../achievement-registry";
import { GRADE_THRESHOLD } from "@self-learning/completion";

export const checkGradeLessonTotal: ConditionChecker = async (achievement, userId, _context) => {
	if (achievement.meta?.group !== "grade_lessons_total") return { type: "unchanged" };
	const { grade: achievementGrade } = achievement.meta;
	const { threshold } = GRADE_THRESHOLD.find(({ grade }) => grade === achievementGrade) ?? {
		threshold: null
	};
	if (threshold === null) {
		console.warn(
			`Achievement ${achievement.code} has invalid grade threshold: ${achievementGrade}`
		);
		return { type: "unchanged" };
	}

	const count = await database.lessonPerformance.count({
		where: {
			userId,
			score: {
				gte: threshold
			}
		}
	});

	let progressValue = 0;
	let changeType: "earned" | "progressed" | "unchanged" = "unchanged";

	if (count > achievement.requiredValue) {
		changeType = "earned";
		progressValue = achievement.requiredValue;
	} else if (count > achievement.progressValue) {
		changeType = "progressed";
		progressValue = count;
	} else {
		changeType = "unchanged";
		progressValue = achievement.progressValue;
	}

	console.debug(
		`Checking achievement ${achievement.code} for user ${userId}: ${count} >= ${achievement.requiredValue}`
	);

	return {
		type: changeType,
		newValue: progressValue
	};
};

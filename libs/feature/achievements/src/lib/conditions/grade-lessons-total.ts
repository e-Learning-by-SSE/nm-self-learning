import { database } from "@self-learning/database";
import { ConditionChecker } from "../achievement-registry";
import { GRADE_THRESHOLD } from "@self-learning/completion";

export const checkGradeLessonTotal: ConditionChecker = async (achievement, username, _context) => {
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

	const data = await database.completedLesson.findMany({
		where: {
			username,
			performanceScore: {
				gte: threshold
			}
		},
		select: {
			performanceScore: true
		},
		distinct: ["username", "performanceScore"]
	});
	const count = data.length; // we cant use prisma.count here since it does not support distinct https://github.com/prisma/prisma/issues/4228

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
		`Checking achievement ${achievement.code} for user ${username}: ${count} >= ${achievement.requiredValue}`
	);

	return {
		type: changeType,
		newValue: progressValue
	};
};

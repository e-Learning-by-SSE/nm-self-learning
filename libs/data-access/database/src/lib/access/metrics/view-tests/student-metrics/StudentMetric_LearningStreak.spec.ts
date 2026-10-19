/**
 * @jest-environment node
 */
import {
	createMetricStudent,
	createMetricLearningSession,
	studentMetricTest
} from "./student-metric.fixture";

describe("Learning Streak for Student", () => {
	it(
		"should return learning streak for student",
		studentMetricTest(async prisma => {
			const user = await createMetricStudent(prisma);
			await createMetricLearningSession(prisma, user.name);

			const result = await prisma.studentMetric_LearningStreak.findMany({
				where: { userId: user.id }
			});

			expect(result).toEqual([
				{
					userId: user.id,
					username: user.name,
					currentStreakDays: 1,
					longestStreakDays: 1
				}
			]);
		})
	);
});

/**
 * @jest-environment node
 */
import {
	createMetricStudent,
	createMetricLearningSession,
	studentMetricTest
} from "./student-metric.fixture";

describe("Daily Learning Time for Student", () => {
	it(
		"should return daily learning time for student",
		studentMetricTest(async prisma => {
			const user = await createMetricStudent(prisma);
			await createMetricLearningSession(prisma, user.name);

			const result = await prisma.studentMetric_DailyLearningTime.findMany({
				where: { userId: user.id }
			});

			expect(result).toEqual([
				{
					userId: user.id,
					username: user.name,
					day: new Date("2024-01-01T00:00:00Z"),
					timeSeconds: 1800
				}
			]);
		})
	);
});

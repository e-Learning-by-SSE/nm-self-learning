/**
 * @jest-environment node
 */
import {
	createMetricStudent,
	createMetricLearningSession,
	studentMetricTest
} from "./student-metric.fixture";

describe("Learning Time for Student", () => {
	it(
		"should return learning time for student",
		studentMetricTest(async prisma => {
			const user = await createMetricStudent(prisma);
			await createMetricLearningSession(prisma, user.name);

			const result = await prisma.studentMetric_LearningTime.findMany({
				where: { userId: user.id }
			});

			expect(result).toEqual([
				{
					userId: user.id,
					username: user.name,
					timeSeconds: 1800
				}
			]);
		})
	);
});

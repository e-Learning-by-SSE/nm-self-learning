/**
 * @jest-environment node
 */
import {
	createMetricStudent,
	createMetricCourse,
	createMetricLearningSession,
	studentMetricTest
} from "./student-metric.fixture";

describe("Daily Learning Time by Course for Student", () => {
	it(
		"should return daily learning time by course for student",
		studentMetricTest(async prisma => {
			const user = await createMetricStudent(prisma);
			const course = await createMetricCourse(prisma);
			await createMetricLearningSession(prisma, user.name, course.courseId);

			const result = await prisma.studentMetric_DailyLearningTimeByCourse.findMany({
				where: { userId: user.id }
			});

			expect(result).toEqual([
				{
					userId: user.id,
					username: user.name,
					courseId: course.courseId,
					courseTitle: course.title,
					day: new Date("2024-01-01T00:00:00Z"),
					timeSeconds: 1800
				}
			]);
		})
	);
});

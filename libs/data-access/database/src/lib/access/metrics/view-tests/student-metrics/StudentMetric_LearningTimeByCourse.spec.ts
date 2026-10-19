/**
 * @jest-environment node
 */
import {
	createMetricStudent,
	createMetricCourse,
	createMetricLearningSession,
	studentMetricTest
} from "./student-metric.fixture";

describe("Learning Time by Course for Student", () => {
	it(
		"should return learning time by course for student",
		studentMetricTest(async prisma => {
			const user = await createMetricStudent(prisma);
			const course = await createMetricCourse(prisma);
			await createMetricLearningSession(prisma, user.name, course.courseId);

			const result = await prisma.studentMetric_LearningTimeByCourse.findMany({
				where: { userId: user.id }
			});

			expect(result).toEqual([
				{
					userId: user.id,
					username: user.name,
					courseId: course.courseId,
					courseTitle: course.title,
					timeSeconds: 1800
				}
			]);
		})
	);
});

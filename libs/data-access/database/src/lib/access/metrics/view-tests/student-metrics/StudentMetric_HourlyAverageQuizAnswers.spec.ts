/**
 * @jest-environment node
 */
import {
	createMetricStudent,
	createMetricCourse,
	createMetricQuizAnswer,
	studentMetricTest
} from "./student-metric.fixture";

describe("Hourly Average Quiz Answers for Student", () => {
	it(
		"should calculate 100% hourly average quiz answers for student",
		studentMetricTest(async prisma => {
			const user = await createMetricStudent(prisma);
			const course = await createMetricCourse(prisma);
			const lesson = await createMetricQuizAnswer(prisma, user.name, course.courseId);

			const result = await prisma.studentMetric_HourlyAverageQuizAnswers.findMany({
				where: { userId: user.id }
			});

			expect(result).toEqual([
				{
					userId: user.id,
					username: user.name,
					courseId: course.courseId,
					courseTitle: course.title,
					lessonId: lesson.lessonId,
					lessonTitle: lesson.title,
					hour: new Date("2024-01-01T10:00:00Z"),
					wrongAnswers: 0,
					correctAnswers: 1,
					averageAccuracyRate: 100
				}
			]);
		})
	);
});

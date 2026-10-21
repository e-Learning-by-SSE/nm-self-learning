/**
 * @jest-environment node
 */
import {
	createMetricStudent,
	createMetricCourse,
	createMetricQuizAnswer,
	studentMetricTest
} from "./student-metric.fixture";

describe("Average Quiz Answers for Student", () => {
	it(
		"should calculate 100% average quiz answers for student",
		studentMetricTest(async prisma => {
			const user = await createMetricStudent(prisma);
			const course = await createMetricCourse(prisma);
			const lesson = await createMetricQuizAnswer(prisma, user.name, course.courseId);

			const result = await prisma.studentMetric_AverageQuizAnswers.findMany({
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
					wrongAnswers: 0,
					correctAnswers: 1,
					averageAccuracyRate: 100
				}
			]);
		})
	);
});

/**
 * @jest-environment node
 */
import { randomUUID } from "node:crypto";
import {
	createMetricStudent,
	createMetricCourse,
	studentMetricTest
} from "./student-metric.fixture";

describe("Courses Completed by Subject for Student", () => {
	it(
		"should return completed courses by subject for student",
		studentMetricTest(async prisma => {
			const user = await createMetricStudent(prisma);
			const course = await createMetricCourse(prisma);
			const subjectId = `student-metric-subject-${randomUUID()}`;
			const subject = await prisma.subject.create({
				data: {
					subjectId,
					slug: subjectId,
					title: "Student Metric Test Subject",
					subtitle: "A subject for student metric tests",
					courses: { connect: { courseId: course.courseId } }
				}
			});
			await prisma.enrollment.create({
				data: {
					courseId: course.courseId,
					username: user.name,
					status: "COMPLETED"
				}
			});

			const result = await prisma.studentMetric_CoursesCompletedBySubject.findMany({
				where: { userId: user.id }
			});

			expect(result).toEqual([
				{
					userId: user.id,
					username: user.name,
					subjectId: subject.subjectId,
					subjectTitle: subject.title,
					completedCoursesCount: 1,
					completedCourses: course.title
				}
			]);
		})
	);
});

import { getAuthorMetric_AverageCourseCompletionRate } from "../../author-metrics";
import { createPrismaClient } from "../../../../prisma-client";
import { createAuthorMetricFixture, AuthorMetricFixture } from "./author-metrics.fixture";

const prisma = createPrismaClient();
let fixture: AuthorMetricFixture | undefined;

describe("Average Course Completion Rate", () => {
	beforeAll(async () => {
		fixture = await createAuthorMetricFixture(prisma, {
			name: "average-course-completion-rate",
			studentCount: 2,
			lessonCount: 3
		});
	});

	afterAll(async () => {
		try {
			await fixture?.cleanup();
		} finally {
			await prisma.$disconnect();
		}
	});

	it("averages each enrolled student's completion of the current course lessons", async () => {
		const { course, lessons, students, authorUser } = fixture!;
		await prisma.course.update({
			where: { courseId: course.courseId },
			data: {
				content: [
					{
						title: "Chapter 1",
						content: [
							{ lessonId: lessons[0].lessonId },
							{ lessonId: lessons[1].lessonId }
						]
					},
					{ title: "Chapter 2", content: [{ lessonId: lessons[0].lessonId }] }
				]
			}
		});
		await prisma.completedLesson.createMany({
			data: [
				{
					courseId: course.courseId,
					username: students[0].username,
					lessonId: lessons[0].lessonId
				},
				{
					courseId: course.courseId,
					username: students[0].username,
					lessonId: lessons[0].lessonId
				},
				{
					courseId: course.courseId,
					username: students[0].username,
					lessonId: lessons[2].lessonId
				}
			]
		});

		const result = (await getAuthorMetric_AverageCourseCompletionRate(authorUser.id)).find(
			row => row.courseId === course.courseId
		);
		expect(result?.totalEnrollments).toBe(1);
		// The second student has no completed course lesson and does not count.
		// Duplicates and lessons removed from the course content do not count.
		expect(result?.averageCompletionRate).toBe(50);

		await prisma.completedLesson.createMany({
			data: lessons.slice(0, 2).map(lesson => ({
				courseId: course.courseId,
				username: students[1].username,
				lessonId: lesson.lessonId
			}))
		});
		const withBothStudents = (
			await getAuthorMetric_AverageCourseCompletionRate(authorUser.id)
		).find(row => row.courseId === course.courseId);
		expect(withBothStudents?.averageCompletionRate).toBe(75);

		// An author of another course still counts as a learner here.
		const otherAuthor = await prisma.author.create({
			data: {
				username: students[1].username,
				displayName: students[1].username,
				slug: `${students[1].username}-author`
			}
		});
		const withOtherCourseAuthor = (
			await getAuthorMetric_AverageCourseCompletionRate(authorUser.id)
		).find(row => row.courseId === course.courseId);
		expect(withOtherCourseAuthor?.totalEnrollments).toBe(2);
		expect(withOtherCourseAuthor?.averageCompletionRate).toBe(75);

		await prisma.course.update({
			where: { courseId: course.courseId },
			data: { authors: { connect: { id: otherAuthor.id } } }
		});
		const withoutCourseAuthor = (
			await getAuthorMetric_AverageCourseCompletionRate(authorUser.id)
		).find(row => row.courseId === course.courseId);
		expect(withoutCourseAuthor?.totalEnrollments).toBe(1);
		expect(withoutCourseAuthor?.averageCompletionRate).toBe(50);
	});

	it("returns zero for an empty course", async () => {
		const { course, authorUser } = fixture!;
		await prisma.course.update({ where: { courseId: course.courseId }, data: { content: [] } });
		const result = (await getAuthorMetric_AverageCourseCompletionRate(authorUser.id)).find(
			row => row.courseId === course.courseId
		);
		expect(result?.averageCompletionRate).toBe(0);
	});
});

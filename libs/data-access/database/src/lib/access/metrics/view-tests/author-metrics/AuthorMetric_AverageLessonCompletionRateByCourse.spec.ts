/**
 * @jest-environment node
 */
import { PrismaClient } from "@prisma/client";
import { createAuthorMetricFixture, AuthorMetricFixture } from "./author-metrics.fixture";

const prisma = new PrismaClient();
let fixture: AuthorMetricFixture | undefined;

describe("Average Lesson Completion Rate by Course", () => {
	beforeAll(async () => {
		fixture = await createAuthorMetricFixture(prisma, {
			name: "average-lesson-completion-rate-by-course",
			studentCount: 8,
			lessonCount: 1,
			withLessonActivity: true
		});
	});

	afterAll(async () => {
		try {
			await fixture?.cleanup();
		} finally {
			await prisma.$disconnect();
		}
	});

	it("should calculate 100% average lesson completion rate by course for author", async () => {
		const result = await prisma.authorMetric_AverageLessonCompletionRateByCourse.findFirst({
			where: { authorId: fixture!.authorUser.id }
		});

		expect(result).not.toBeNull();
		expect(result?.authorId).toBe(fixture!.authorUser.id);
		expect(result?.authorUsername).toBe(fixture!.authorUser.name);
		expect(result?.courseId).toBe(fixture!.course.courseId);
		expect(result?.courseTitle).toBe(fixture!.course.title);
		expect(result?.numLessons).toBe(1);
		expect(result?.totalLessonsStarted).toBe(8);
		expect(result?.totalLessonsFinished).toBe(8);
		expect(result?.averageCourseCompletionRate).toBe(100);
	});
});

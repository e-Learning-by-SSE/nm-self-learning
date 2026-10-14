/**
 * @jest-environment node
 */
import { PrismaClient } from "@prisma/client";
import { createAuthorMetricFixture, AuthorMetricFixture } from "./author-metrics.fixture";

const prisma = new PrismaClient();
let fixture: AuthorMetricFixture | undefined;

describe("Average Lesson Completion Rate", () => {
	beforeAll(async () => {
		fixture = await createAuthorMetricFixture(prisma, {
			name: "average-lesson-completion-rate",
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

	it("should calculate 100% average lesson completion rate for author", async () => {
		const lesson = fixture!.lessons[0];
		const result = await prisma.authorMetric_AverageLessonCompletionRate.findFirst({
			where: { authorId: fixture!.authorUser.id }
		});

		expect(result).not.toBeNull();
		expect(result?.authorId).toBe(fixture!.authorUser.id);
		expect(result?.authorUsername).toBe(fixture!.authorUser.name);
		expect(result?.courseId).toBe(fixture!.course.courseId);
		expect(result?.courseTitle).toBe(fixture!.course.title);
		expect(result?.lessonId).toBe(lesson.lessonId);
		expect(result?.lessonTitle).toBe(lesson.title);
		expect(result?.usersStarted).toBe(8);
		expect(result?.usersFinished).toBe(8);
		expect(result?.averageCompletionRate).toBe(100);
	});
});

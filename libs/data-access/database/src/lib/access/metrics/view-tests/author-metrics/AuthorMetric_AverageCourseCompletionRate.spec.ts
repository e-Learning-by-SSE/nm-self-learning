/**
 * @jest-environment node
 */
import { PrismaClient } from "@prisma/client";
import { createAuthorMetricFixture, AuthorMetricFixture } from "./author-metrics.fixture";

const prisma = new PrismaClient();
let fixture: AuthorMetricFixture | undefined;

describe("Average Course Completion Rate", () => {
	beforeAll(async () => {
		fixture = await createAuthorMetricFixture(prisma, {
			name: "average-course-completion-rate",
			studentCount: 1
		});
	});

	afterAll(async () => {
		try {
			await fixture?.cleanup();
		} finally {
			await prisma.$disconnect();
		}
	});

	it("should calculate 100% average course completion rate for author", async () => {
		const result = await prisma.authorMetric_AverageCourseCompletionRate.findFirst({
			where: { authorId: fixture!.authorUser.id }
		});

		expect(result).not.toBeNull();
		expect(result?.authorId).toBe(fixture!.authorUser.id);
		expect(result?.authorUsername).toBe(fixture!.authorUser.name);
		expect(result?.courseId).toBe(fixture!.course.courseId);
		expect(result?.courseTitle).toBe(fixture!.course.title);
		expect(result?.totalEnrollments).toBe(1);
		expect(result?.completedEnrollments).toBe(1);
		expect(result?.averageCompletionRate).toBe(100);
	});
});

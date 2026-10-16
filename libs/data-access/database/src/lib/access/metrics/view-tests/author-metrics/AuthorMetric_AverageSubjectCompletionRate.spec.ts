/**
 * @jest-environment node
 */
import { PrismaClient } from "@prisma/client";
import { createAuthorMetricFixture, AuthorMetricFixture } from "./author-metrics.fixture";

const prisma = new PrismaClient();
let fixture: AuthorMetricFixture | undefined;

describe("Average Subject Completion Rate for Author", () => {
	beforeAll(async () => {
		fixture = await createAuthorMetricFixture(prisma, {
			name: "average-subject-completion-rate",
			studentCount: 1,
			withSubject: true
		});
	});

	afterAll(async () => {
		try {
			await fixture?.cleanup();
		} finally {
			await prisma.$disconnect();
		}
	});

	it("should calculate 100% average subject completion rate for author", async () => {
		const result = await prisma.authorMetric_AverageSubjectCompletionRate.findFirst({
			where: { authorId: fixture!.authorUser.id }
		});

		expect(result).not.toBeNull();
		expect(result?.authorId).toBe(fixture!.authorUser.id);
		expect(result?.authorUsername).toBe(fixture!.authorUser.name);
		expect(result?.subjectId).toBe(fixture!.subject!.subjectId);
		expect(result?.subjectTitle).toBe(fixture!.subject!.title);
		expect(result?.totalEnrollments).toBe(1);
		expect(result?.completedEnrollments).toBe(1);
		expect(result?.averageCompletionRate).toBe(100);
	});
});

/**
 * @jest-environment node
 */
import { PrismaClient } from "@prisma/client";
import { createAuthorMetricFixture, AuthorMetricFixture } from "./author-metrics.fixture";

const prisma = new PrismaClient();
let fixture: AuthorMetricFixture | undefined;

describe("Average Completion Rate", () => {
	beforeAll(async () => {
		fixture = await createAuthorMetricFixture(prisma, {
			name: "average-completion-rate",
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

	it("should calculate 100% average completion rate for author", async () => {
		const result = await prisma.authorMetric_AverageCompletionRate.findUnique({
			where: { authorId: fixture!.authorUser.id }
		});

		expect(result).not.toBeNull();
		expect(result?.authorId).toBe(fixture!.authorUser.id);
		expect(result?.authorUsername).toBe(fixture!.authorUser.name);
		expect(result?.averageCompletionRate).toBe(100);
	});
});

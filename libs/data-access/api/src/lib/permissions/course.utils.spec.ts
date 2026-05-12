import { database } from "@self-learning/database";
import { getCourseResource } from "./course.utils";
import { TRPCError } from "@trpc/server";

jest.mock("@self-learning/database", () => ({
	__esModule: true,
	database: {
		course: {
			findUnique: jest.fn()
		}
	}
}));

describe("course permission utils", () => {
	describe("getCourseResource", () => {
		beforeEach(() => {
			jest.clearAllMocks();
		});

		it("should return courseId for valid slug", async () => {
			const mockCourse = { courseId: "123" };
			(database.course.findUnique as jest.Mock).mockResolvedValue(mockCourse);

			const result = await getCourseResource("test-slug");

			expect(result.courseId).toBe("123");
			expect(database.course.findUnique).toHaveBeenCalledWith({
				where: { slug: "test-slug" },
				select: { courseId: true }
			});
		});

		it("should throw if not found", async () => {
			(database.course.findUnique as jest.Mock).mockResolvedValue(null);

			await expect(getCourseResource("invalid")).rejects.toThrow(TRPCError);
		});
	});
});

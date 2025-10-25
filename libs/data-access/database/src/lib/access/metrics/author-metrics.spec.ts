import { database } from "../../prisma";
import {
	getAuthorMetric_AverageCompletionRate,
	getAuthorMetric_AverageSubjectCompletionRate,
	getAuthorMetric_AverageCourseCompletionRate,
	getAuthorMetric_AverageLessonCompletionRate,
	getAuthorMetric_AverageLessonCompletionRateByCourse
} from "./author-metrics";

jest.mock("../../prisma", () => ({
	database: {
		authorMetric_AverageCompletionRate: { findUnique: jest.fn() },
		authorMetric_AverageSubjectCompletionRate: { findMany: jest.fn() },
		authorMetric_AverageCourseCompletionRate: { findMany: jest.fn() },
		authorMetric_AverageLessonCompletionRate: { findUnique: jest.fn() },
		authorMetric_DailyAverageLessonCompletionRate: { findMany: jest.fn() },
		authorMetric_AverageLessonCompletionRateByCourse: { findMany: jest.fn() },
		authorMetric_DailyAverageLessonCompletionRateByCourse: { findMany: jest.fn() }
	}
}));

describe("KPI Database Access Functions", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	const userId = "user-123";

	it("getAuthorMetric_AverageCompletionRate calls Prisma with correct where clause", async () => {
		const mockResult = { authorId: userId, averageCompletionRate: 75 };
		(database.authorMetric_AverageCompletionRate.findUnique as jest.Mock).mockResolvedValue(
			mockResult
		);

		const result = await getAuthorMetric_AverageCompletionRate(userId);
		expect(database.authorMetric_AverageCompletionRate.findUnique).toHaveBeenCalledWith({
			where: { authorId: userId }
		});
		expect(result).toEqual(mockResult);
	});

	it("getAuthorMetric_AverageSubjectCompletionRate calls Prisma with correct where clause", async () => {
		const mockResult = [{ authorId: userId, averageSubjectCompletionRate: 80 }];
		(
			database.authorMetric_AverageSubjectCompletionRate.findMany as jest.Mock
		).mockResolvedValue(mockResult);

		const result = await getAuthorMetric_AverageSubjectCompletionRate(userId);
		expect(database.authorMetric_AverageSubjectCompletionRate.findMany).toHaveBeenCalledWith({
			where: { authorId: userId }
		});
		expect(result).toEqual(mockResult);
	});

	it("getAuthorMetric_AverageCourseCompletionRate calls Prisma with correct where clause", async () => {
		const mockResult = [{ authorId: userId, averageCourseCompletionRate: 70 }];
		(database.authorMetric_AverageCourseCompletionRate.findMany as jest.Mock).mockResolvedValue(
			mockResult
		);

		const result = await getAuthorMetric_AverageCourseCompletionRate(userId);
		expect(database.authorMetric_AverageCourseCompletionRate.findMany).toHaveBeenCalledWith({
			where: { authorId: userId }
		});
		expect(result).toEqual(mockResult);
	});

	it("getAuthorMetric_AverageLessonCompletionRate calls Prisma with correct where clause", async () => {
		const mockResult = [{ authorId: userId, averageLessonCompletionRate: 85 }];
		(database.authorMetric_AverageLessonCompletionRate.findMany as jest.Mock).mockResolvedValue(
			mockResult
		);

		const result = await getAuthorMetric_AverageLessonCompletionRate(userId);
		expect(database.authorMetric_AverageLessonCompletionRate.findMany).toHaveBeenCalledWith({
			where: { authorId: userId }
		});
		expect(result).toEqual(mockResult);
	});

	it("getAuthorMetric_AverageLessonCompletionRateByCourse calls Prisma with correct where clause", async () => {
		const mockResult = [
			{ authorId: userId, courseId: "course-456", averageLessonCompletionRate: 90 }
		];
		(
			database.authorMetric_AverageLessonCompletionRateByCourse.findMany as jest.Mock
		).mockResolvedValue(mockResult);

		const result = await getAuthorMetric_AverageLessonCompletionRateByCourse(userId);
		expect(
			database.authorMetric_AverageLessonCompletionRateByCourse.findMany
		).toHaveBeenCalledWith({
			where: { authorId: userId }
		});
		expect(result).toEqual(mockResult);
	});
});

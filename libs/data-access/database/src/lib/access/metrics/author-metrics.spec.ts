import { database } from "../../prisma";
import {
	getAuthorMetric_AverageLessonCompletionRate,
	getAuthorMetric_DailyAverageLessonCompletionRate,
	getAuthorMetric_AverageLessonCompletionRateByCourse,
	getAuthorMetric_DailyAverageLessonCompletionRateByCourse
} from "./author-metrics";

jest.mock("../../prisma", () => ({
	database: {
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

	it("getAuthorMetric_DailyAverageLessonCompletionRate calls Prisma with correct where clause", async () => {
		const mockResult = [
			{ authorId: userId, day: "2024-01-01", averageLessonCompletionRate: 80 }
		];
		(
			database.authorMetric_DailyAverageLessonCompletionRate.findMany as jest.Mock
		).mockResolvedValue(mockResult);

		const result = await getAuthorMetric_DailyAverageLessonCompletionRate(userId);
		expect(
			database.authorMetric_DailyAverageLessonCompletionRate.findMany
		).toHaveBeenCalledWith({
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

	it("getAuthorMetric_DailyAverageLessonCompletionRateByCourse calls Prisma with correct where clause", async () => {
		const mockResult = [
			{
				authorId: userId,
				courseId: "course-456",
				day: "2024-01-01",
				averageLessonCompletionRate: 88
			}
		];
		(
			database.authorMetric_DailyAverageLessonCompletionRateByCourse.findMany as jest.Mock
		).mockResolvedValue(mockResult);

		const result = await getAuthorMetric_DailyAverageLessonCompletionRateByCourse(userId);
		expect(
			database.authorMetric_DailyAverageLessonCompletionRateByCourse.findMany
		).toHaveBeenCalledWith({
			where: { authorId: userId }
		});
		expect(result).toEqual(mockResult);
	});
});

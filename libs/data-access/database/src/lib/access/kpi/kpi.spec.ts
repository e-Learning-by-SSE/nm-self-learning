import { database } from "../../prisma";
import {
	getUserTotalLearningTime,
	getUserDailyLearningTime,
	getUserDailyQuizStats,
	getUserTotalLearningTimeByCourse,
	getUserAverageCompletionRateByAuthorByCourse,
	getUserAverageCompletionRateByAuthor,
	getUserAverageCompletionRateByAuthorBySubject
} from "./kpi";

jest.mock("../../prisma", () => ({
	database: {
		kPITotalLearningTime: { findUnique: jest.fn() },
		kPIDailyLearningTime: { findMany: jest.fn() },
		kPIDailyQuizStats: { findMany: jest.fn() },
		kPITotalLearningTimeByCourse: { findMany: jest.fn() },
		kPIAverageCompletionRateByAuthorByCourse: { findMany: jest.fn() },
		kPIAverageCompletionRateByAuthor: { findUnique: jest.fn() },
		kPIAverageCompletionRateByAuthorBySubject: { findMany: jest.fn() }
	}
}));

describe("KPI Database Access Functions", () => {
	const userId = "user_123";

	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("getUserTotalLearningTime calls Prisma with correct where clause", async () => {
		const mockResult = { id: userId, totalTime: 120 };
		(database.kPITotalLearningTime.findUnique as jest.Mock).mockResolvedValue(mockResult);

		const result = await getUserTotalLearningTime(userId);

		expect(database.kPITotalLearningTime.findUnique).toHaveBeenCalledWith({
			where: { id: userId }
		});
		expect(result).toEqual(mockResult);
	});

	it("getUserDailyLearningTime orders by day ascending", async () => {
		const mockResult = [{ day: "2025-10-01", time: 30 }];
		(database.kPIDailyLearningTime.findMany as jest.Mock).mockResolvedValue(mockResult);

		const result = await getUserDailyLearningTime(userId);

		expect(database.kPIDailyLearningTime.findMany).toHaveBeenCalledWith({
			where: { id: userId },
			orderBy: { day: "asc" }
		});
		expect(result).toEqual(mockResult);
	});

	it("getUserDailyQuizStats orders by day ascending", async () => {
		const mockResult = [{ day: "2025-10-02", quizzes: 4 }];
		(database.kPIDailyQuizStats.findMany as jest.Mock).mockResolvedValue(mockResult);

		const result = await getUserDailyQuizStats(userId);

		expect(database.kPIDailyQuizStats.findMany).toHaveBeenCalledWith({
			where: { id: userId },
			orderBy: { day: "asc" }
		});
		expect(result).toEqual(mockResult);
	});

	it("getUserTotalLearningTimeByCourse orders by courseId ascending", async () => {
		const mockResult = [{ courseId: "C1", totalTime: 100 }];
		(database.kPITotalLearningTimeByCourse.findMany as jest.Mock).mockResolvedValue(mockResult);

		const result = await getUserTotalLearningTimeByCourse(userId);

		expect(database.kPITotalLearningTimeByCourse.findMany).toHaveBeenCalledWith({
			where: { id: userId },
			orderBy: { courseId: "asc" }
		});
		expect(result).toEqual(mockResult);
	});

	it("getUserAverageCompletionRateByAuthorByCourse queries correctly", async () => {
		const mockResult = [{ courseId: "C2", completionRate: 75 }];
		(database.kPIAverageCompletionRateByAuthorByCourse.findMany as jest.Mock).mockResolvedValue(
			mockResult
		);

		const result = await getUserAverageCompletionRateByAuthorByCourse(userId);

		expect(database.kPIAverageCompletionRateByAuthorByCourse.findMany).toHaveBeenCalledWith({
			where: { id: userId },
			orderBy: { courseId: "asc" }
		});
		expect(result).toEqual(mockResult);
	});

	it("getUserAverageCompletionRateByAuthor queries correctly", async () => {
		const mockResult = { id: userId, averageRate: 82 };
		(database.kPIAverageCompletionRateByAuthor.findUnique as jest.Mock).mockResolvedValue(
			mockResult
		);

		const result = await getUserAverageCompletionRateByAuthor(userId);

		expect(database.kPIAverageCompletionRateByAuthor.findUnique).toHaveBeenCalledWith({
			where: { id: userId }
		});
		expect(result).toEqual(mockResult);
	});

	it("getUserAverageCompletionRateByAuthorBySubject orders by subjectTitle ascending", async () => {
		const mockResult = [{ subjectTitle: "Math", completionRate: 88 }];
		(
			database.kPIAverageCompletionRateByAuthorBySubject.findMany as jest.Mock
		).mockResolvedValue(mockResult);

		const result = await getUserAverageCompletionRateByAuthorBySubject(userId);

		expect(database.kPIAverageCompletionRateByAuthorBySubject.findMany).toHaveBeenCalledWith({
			where: { id: userId },
			orderBy: { subjectTitle: "asc" }
		});
		expect(result).toEqual(mockResult);
	});
});

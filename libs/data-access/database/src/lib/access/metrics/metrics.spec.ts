import { database } from "../../prisma";
import {
	getUserTotalLearningTime,
	getUserDailyLearningTime,
	getUserDailyQuizStats,
	getUserTotalLearningTimeByCourse,
	getUserAverageCompletionRateByAuthorByCourse,
	getUserAverageCompletionRateByAuthor,
	getUserAverageCompletionRateByAuthorBySubject,
	getUserDailyLearningTimeByCourse,
	getUserLearningStreak,
	getUserCoursesCompletedBySubject
} from "./metrics";

jest.mock("../../prisma", () => ({
	database: {
		totalLearningTime: { findUnique: jest.fn() },
		dailyLearningTime: { findMany: jest.fn() },
		dailyQuizStats: { findMany: jest.fn() },
		totalLearningTimeByCourse: { findMany: jest.fn() },
		averageCompletionRateByAuthorByCourse: { findMany: jest.fn() },
		averageCompletionRateByAuthor: { findUnique: jest.fn() },
		averageCompletionRateByAuthorBySubject: { findMany: jest.fn() },
		dailyLearningTimeByCourse: { findMany: jest.fn() },
		learningStreak: { findUnique: jest.fn() }
	}
}));

describe("KPI Database Access Functions", () => {
	const userId = "user_123";

	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("getUserTotalLearningTime calls Prisma with correct where clause", async () => {
		const mockResult = { id: userId, totalTime: 120 };
		(database.totalLearningTime.findUnique as jest.Mock).mockResolvedValue(mockResult);

		const result = await getUserTotalLearningTime(userId);

		expect(database.totalLearningTime.findUnique).toHaveBeenCalledWith({
			where: { id: userId }
		});
		expect(result).toEqual(mockResult);
	});

	it("getUserDailyLearningTime orders by day ascending", async () => {
		const mockResult = [{ day: "2025-10-01", time: 30 }];
		(database.dailyLearningTime.findMany as jest.Mock).mockResolvedValue(mockResult);

		const result = await getUserDailyLearningTime(userId);

		expect(database.dailyLearningTime.findMany).toHaveBeenCalledWith({
			where: { id: userId },
			orderBy: { day: "asc" }
		});
		expect(result).toEqual(mockResult);
	});

	it("getUserDailyQuizStats orders by day ascending", async () => {
		const mockResult = [{ day: "2025-10-02", quizzes: 4 }];
		(database.dailyQuizStats.findMany as jest.Mock).mockResolvedValue(mockResult);

		const result = await getUserDailyQuizStats(userId);

		expect(database.dailyQuizStats.findMany).toHaveBeenCalledWith({
			where: { id: userId },
			orderBy: { day: "asc" }
		});
		expect(result).toEqual(mockResult);
	});

	it("getUserTotalLearningTimeByCourse orders by courseId ascending", async () => {
		const mockResult = [{ courseId: "C1", totalTime: 100 }];
		(database.totalLearningTimeByCourse.findMany as jest.Mock).mockResolvedValue(mockResult);

		const result = await getUserTotalLearningTimeByCourse(userId);

		expect(database.totalLearningTimeByCourse.findMany).toHaveBeenCalledWith({
			where: { id: userId },
			orderBy: { courseId: "asc" }
		});
		expect(result).toEqual(mockResult);
	});

	it("getUserAverageCompletionRateByAuthorByCourse queries correctly", async () => {
		const mockResult = [{ courseId: "C2", completionRate: 75 }];
		(database.averageCompletionRateByAuthorByCourse.findMany as jest.Mock).mockResolvedValue(
			mockResult
		);

		const result = await getUserAverageCompletionRateByAuthorByCourse(userId);

		expect(database.averageCompletionRateByAuthorByCourse.findMany).toHaveBeenCalledWith({
			where: { id: userId },
			orderBy: { courseId: "asc" }
		});
		expect(result).toEqual(mockResult);
	});

	it("getUserAverageCompletionRateByAuthor queries correctly", async () => {
		const mockResult = { id: userId, averageRate: 82 };
		(database.averageCompletionRateByAuthor.findUnique as jest.Mock).mockResolvedValue(
			mockResult
		);

		const result = await getUserAverageCompletionRateByAuthor(userId);

		expect(database.averageCompletionRateByAuthor.findUnique).toHaveBeenCalledWith({
			where: { id: userId }
		});
		expect(result).toEqual(mockResult);
	});

	it("getUserAverageCompletionRateByAuthorBySubject orders by subjectTitle ascending", async () => {
		const mockResult = [{ subjectTitle: "Math", completionRate: 88 }];
		(database.averageCompletionRateByAuthorBySubject.findMany as jest.Mock).mockResolvedValue(
			mockResult
		);

		const result = await getUserAverageCompletionRateByAuthorBySubject(userId);

		expect(database.averageCompletionRateByAuthorBySubject.findMany).toHaveBeenCalledWith({
			where: { id: userId },
			orderBy: { subjectTitle: "asc" }
		});
		expect(result).toEqual(mockResult);
	});

	it("getUserDailyLearningTimeByCourse orders by courseId and day ascending", async () => {
		const mockResult = [{ courseId: "C3", day: "2025-10-03", time: 45 }];
		(database.dailyLearningTimeByCourse.findMany as jest.Mock).mockResolvedValue(mockResult);

		const result = await getUserDailyLearningTimeByCourse(userId);

		expect(database.dailyLearningTimeByCourse.findMany).toHaveBeenCalledWith({
			where: { id: userId },
			orderBy: [{ courseId: "asc" }, { day: "asc" }]
		});
		expect(result).toEqual(mockResult);
	});

	it("getUserLearningStreak queries correctly", async () => {
		const mockResult = { id: userId, currentStreak: 5, longestStreak: 10 };
		(database.learningStreak.findUnique as jest.Mock).mockResolvedValue(mockResult);

		const result = await getUserLearningStreak(userId);

		expect(database.learningStreak.findUnique).toHaveBeenCalledWith({
			where: { id: userId }
		});
		expect(result).toEqual(mockResult);
	});

	it("getUserCoursesCompletedBySubject queries correctly", async () => {
		const mockResult = [{ subjectTitle: "Science", totalCompletedCourses: 3 }];
		(database.coursesCompletedBySubject.findMany as jest.Mock).mockResolvedValue(mockResult);

		const result = await getUserCoursesCompletedBySubject(userId);

		expect(database.coursesCompletedBySubject.findMany).toHaveBeenCalledWith({
			where: { id: userId }
		});
		expect(result).toEqual(mockResult);
	});
});

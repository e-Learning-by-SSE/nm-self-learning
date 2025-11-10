import { database } from "../../prisma";
import {
	getStudentMetric_LearningTime,
	getStudentMetric_DailyLearningTime,
	getStudentMetric_HourlyLearningTime,
	getStudentMetric_LearningTimeByCourse,
	getStudentMetric_DailyLearningTimeByCourse,
	getStudentMetric_LearningStreak,
	getStudentMetric_CoursesCompletedBySubject,
	getStudentMetric_AverageQuizAnswers,
	getStudentMetric_HourlyAverageQuizAnswers
} from "./student-metrics";

jest.mock("../../prisma", () => ({
	database: {
		studentMetric_LearningTime: { findUnique: jest.fn() },
		studentMetric_DailyLearningTime: { findMany: jest.fn() },
		studentMetric_HourlyLearningTime: { findMany: jest.fn() },
		studentMetric_LearningTimeByCourse: { findMany: jest.fn() },
		studentMetric_DailyLearningTimeByCourse: { findMany: jest.fn() },
		studentMetric_LearningStreak: { findUnique: jest.fn() },
		studentMetric_CoursesCompletedBySubject: { findMany: jest.fn() },
		studentMetric_AverageQuizAnswers: { findMany: jest.fn() },
		studentMetric_HourlyAverageQuizAnswers: { findMany: jest.fn() }
	}
}));

describe("Metrics Database Access Functions", () => {
	const userId = "user_123";

	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("getStudentMetric_LearningTime calls Prisma with correct where clause", async () => {
		const mockResult = { userId: userId, totalLearningTime: 120 };
		(database.studentMetric_LearningTime.findUnique as jest.Mock).mockResolvedValue(mockResult);

		const result = await getStudentMetric_LearningTime(userId);
		expect(database.studentMetric_LearningTime.findUnique).toHaveBeenCalledWith({
			where: { userId: userId }
		});
		expect(result).toEqual(mockResult);
	});

	it("getStudentMetric_DailyLearningTime calls Prisma with correct where clause", async () => {
		const mockResult = [{ userId: userId, day: "2024-01-01", learningTime: 30 }];
		(database.studentMetric_DailyLearningTime.findMany as jest.Mock).mockResolvedValue(
			mockResult
		);

		const result = await getStudentMetric_DailyLearningTime(userId);
		expect(database.studentMetric_DailyLearningTime.findMany).toHaveBeenCalledWith({
			where: { userId: userId }
		});
		expect(result).toEqual(mockResult);
	});

	it("getStudentMetric_HourlyLearningTime calls Prisma with correct where clause", async () => {
		const mockResult = [{ userId: userId, hour: "10:00", learningTime: 5 }];
		(database.studentMetric_HourlyLearningTime.findMany as jest.Mock).mockResolvedValue(
			mockResult
		);

		const result = await getStudentMetric_HourlyLearningTime(userId);
		expect(database.studentMetric_HourlyLearningTime.findMany).toHaveBeenCalledWith({
			where: { userId: userId }
		});
		expect(result).toEqual(mockResult);
	});

	it("getStudentMetric_LearningTimeByCourse calls Prisma with correct where clause", async () => {
		const mockResult = [{ userId: userId, courseId: "course_1", learningTime: 60 }];
		(database.studentMetric_LearningTimeByCourse.findMany as jest.Mock).mockResolvedValue(
			mockResult
		);

		const result = await getStudentMetric_LearningTimeByCourse(userId);
		expect(database.studentMetric_LearningTimeByCourse.findMany).toHaveBeenCalledWith({
			where: { userId: userId }
		});
		expect(result).toEqual(mockResult);
	});

	it("getStudentMetric_DailyLearningTimeByCourse calls Prisma with correct where clause", async () => {
		const mockResult = [
			{ userId: userId, courseId: "course_1", day: "2024-01-01", learningTime: 20 }
		];
		(database.studentMetric_DailyLearningTimeByCourse.findMany as jest.Mock).mockResolvedValue(
			mockResult
		);

		const result = await getStudentMetric_DailyLearningTimeByCourse(userId);
		expect(database.studentMetric_DailyLearningTimeByCourse.findMany).toHaveBeenCalledWith({
			where: { userId: userId }
		});
		expect(result).toEqual(mockResult);
	});

	it("getStudentMetric_CoursesCompletedBySubject calls Prisma with correct where clause", async () => {
		const mockResult = [{ userId: userId, subjectId: "subject_1", coursesCompleted: 3 }];
		(database.studentMetric_CoursesCompletedBySubject.findMany as jest.Mock).mockResolvedValue(
			mockResult
		);

		const result = await getStudentMetric_CoursesCompletedBySubject(userId);
		expect(database.studentMetric_CoursesCompletedBySubject.findMany).toHaveBeenCalledWith({
			where: { userId: userId }
		});
		expect(result).toEqual(mockResult);
	});

	it("getStudentMetric_LearningStreak calls Prisma with correct where clause", async () => {
		const mockResult = { userId: userId, currentStreak: 5, longestStreak: 10 };
		(database.studentMetric_LearningStreak.findUnique as jest.Mock).mockResolvedValue(
			mockResult
		);

		const result = await getStudentMetric_LearningStreak(userId);
		expect(database.studentMetric_LearningStreak.findUnique).toHaveBeenCalledWith({
			where: { userId: userId }
		});
		expect(result).toEqual(mockResult);
	});

	it("getStudentMetric_AverageQuizAnswers calls Prisma with correct where clause", async () => {
		const mockResult = [{ userId: userId, averageQuizAnswers: 8 }];
		(database.studentMetric_AverageQuizAnswers.findMany as jest.Mock).mockResolvedValue(
			mockResult
		);

		const result = await getStudentMetric_AverageQuizAnswers(userId);
		expect(database.studentMetric_AverageQuizAnswers.findMany).toHaveBeenCalledWith({
			where: { userId: userId }
		});
		expect(result).toEqual(mockResult);
	});

	it("getStudentMetric_HourlyAverageQuizAnswers calls Prisma with correct where clause", async () => {
		const mockResult = [{ userId: userId, hour: "10:00", averageQuizAnswers: 2 }];
		(database.studentMetric_HourlyAverageQuizAnswers.findMany as jest.Mock).mockResolvedValue(
			mockResult
		);

		const result = await getStudentMetric_HourlyAverageQuizAnswers(userId);
		expect(database.studentMetric_HourlyAverageQuizAnswers.findMany).toHaveBeenCalledWith({
			where: { userId: userId }
		});
		expect(result).toEqual(mockResult);
	});
});

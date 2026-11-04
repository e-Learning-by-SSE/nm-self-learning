import { database } from "../../prisma";
import { subMonths } from "date-fns";
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
		author: { findFirst: jest.fn() },
		authorMetric_AverageLessonCompletionRate: { findMany: jest.fn() },
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

	it("calculates the average course completion from enrolled students and current lessons", async () => {
		(database.author.findFirst as jest.Mock).mockResolvedValue({
			username: "teacher",
			courses: [
				{
					courseId: "course-1",
					title: "Course",
					content: [
						{ title: "Chapter 1", content: [{ lessonId: "one" }, { lessonId: "two" }] },
						{ title: "Chapter 2", content: [{ lessonId: "one" }] }
					],
					authors: [{ username: "teacher" }, { username: "course-author" }],
					enrollments: [
						{
							username: "course-author",
							status: "COMPLETED",
							completedAt: null,
							createdAt: new Date()
						},
						{
							username: "student-1",
							status: "ACTIVE",
							completedAt: null,
							createdAt: new Date()
						},
						{
							username: "student-2",
							status: "COMPLETED",
							completedAt: null,
							createdAt: new Date()
						}
					],
					completions: [
						{ username: "course-author", lessonId: "one" },
						{ username: "course-author", lessonId: "two" },
						{ username: "student-1", lessonId: "one" },
						{ username: "student-1", lessonId: "removed" },
						{ username: "not-enrolled", lessonId: "two" }
					]
				},
				{
					courseId: "empty",
					title: "Empty",
					content: [],
					authors: [{ username: "teacher" }],
					enrollments: [
						{
							username: "student-1",
							status: "ACTIVE",
							completedAt: null,
							createdAt: new Date()
						}
					],
					completions: []
				},
				{
					courseId: "no-students",
					title: "No students",
					content: [{ title: "Chapter 2", content: [{ lessonId: "one" }] }],
					authors: [{ username: "teacher" }],
					enrollments: [],
					completions: []
				}
			]
		});
		const result = await getAuthorMetric_AverageCourseCompletionRate(userId);
		expect(result).toEqual([
			expect.objectContaining({
				courseId: "course-1",
				averageCompletionRate: 50,
				averageCompletionRateLastSixMonths: 50,
				enrollmentsLastSixMonths: 1,
				totalEnrollments: 1,
				completedEnrollments: 0
			}),
			expect.objectContaining({
				courseId: "empty",
				averageCompletionRate: 0,
				totalEnrollments: 0
			}),
			expect.objectContaining({ courseId: "no-students", averageCompletionRate: 0 })
		]);
		expect(database.author.findFirst).toHaveBeenCalledWith(
			expect.objectContaining({
				where: { user: { id: userId } },
				select: expect.objectContaining({
					courses: expect.objectContaining({
						select: expect.objectContaining({
							authors: { select: { username: true } }
						})
					})
				})
			})
		);
	});

	it("uses recent enrollments as the six-month completion cohort", async () => {
		(database.author.findFirst as jest.Mock).mockResolvedValue({
			username: "teacher",
			courses: [
				{
					courseId: "course-1",
					title: "Course",
					content: [
						{ title: "Chapter", content: [{ lessonId: "one" }, { lessonId: "two" }] }
					],
					authors: [{ username: "teacher" }],
					enrollments: [
						{
							username: "older",
							status: "ACTIVE",
							completedAt: null,
							createdAt: subMonths(new Date(), 7)
						},
						{
							username: "recent",
							status: "ACTIVE",
							completedAt: null,
							createdAt: subMonths(new Date(), 1)
						}
					],
					completions: [
						{ username: "older", lessonId: "one" },
						{ username: "older", lessonId: "two" },
						{ username: "recent", lessonId: "one" }
					]
				}
			]
		});

		expect(await getAuthorMetric_AverageCourseCompletionRate(userId)).toEqual([
			expect.objectContaining({
				totalEnrollments: 2,
				enrollmentsLastSixMonths: 1,
				averageCompletionRate: 75,
				averageCompletionRateLastSixMonths: 50
			})
		]);
	});

	it("returns no course metrics when the user is not an author", async () => {
		(database.author.findFirst as jest.Mock).mockResolvedValue(null);
		expect(await getAuthorMetric_AverageCourseCompletionRate(userId)).toEqual([]);
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

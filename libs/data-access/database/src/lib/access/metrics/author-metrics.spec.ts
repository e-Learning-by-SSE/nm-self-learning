import { database } from "../../prisma";
import { subMonths } from "date-fns";
import {
	getAuthorMetric_AverageCompletionRate,
	getAuthorMetric_AverageSubjectCompletionRate,
	getAuthorMetric_AverageCourseCompletionRate,
	getAuthorMetric_AverageLessonCompletionRate,
	getAuthorMetric_AverageLessonCompletionRateByCourse,
	getAuthorCourseLessonActivity
} from "./author-metrics";

jest.mock("../../prisma", () => ({
	database: {
		authorMetric_AverageCompletionRate: { findUnique: jest.fn() },
		authorMetric_AverageSubjectCompletionRate: { findMany: jest.fn() },
		author: { findFirst: jest.fn() },
		course: { findFirst: jest.fn() },
		lesson: { findMany: jest.fn() },
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
				enrollmentsLastSixMonths: 2,
				totalEnrollments: 2,
				completedEnrollments: 1
			}),
			expect.objectContaining({
				courseId: "empty",
				averageCompletionRate: 0,
				totalEnrollments: 1
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
						},
						{
							username: "recent-without-progress",
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
				totalEnrollments: 3,
				enrollmentsLastSixMonths: 2,
				averageCompletionRate: 75,
				averageCompletionRateLastSixMonths: 50
			})
		]);
	});

	it("returns no course metrics when the user is not an author", async () => {
		(database.author.findFirst as jest.Mock).mockResolvedValue(null);
		expect(await getAuthorMetric_AverageCourseCompletionRate(userId)).toEqual([]);
	});

	it("counts first completions by weekly period in course order, excluding course authors", async () => {
		jest.useFakeTimers().setSystemTime(new Date("2026-04-20T12:00:00Z"));
		try {
			// Setup
			(database.course.findFirst as jest.Mock).mockResolvedValue({
				content: [
					{
						title: "Chapter",
						content: [{ lessonId: "b" }, { lessonId: "a" }]
					},
					{ title: "Second chapter", content: [{ lessonId: "b" }] }
				],
				authors: [{ username: "teacher" }, { username: "coauthor" }],
				enrollments: [
					{ username: "student", createdAt: new Date("2026-03-01T00:00:00Z") },
					{ username: "other", createdAt: new Date("2026-03-01T00:00:00Z") },
					{ username: "coauthor", createdAt: new Date("2026-03-01T00:00:00Z") }
				],
				completions: [
					{
						username: "student",
						lessonId: "b",
						createdAt: new Date("2026-04-02T12:00:00Z")
					},
					{
						username: "student",
						lessonId: "b",
						createdAt: new Date("2026-04-08T12:00:00Z")
					},
					{
						username: "other",
						lessonId: "b",
						createdAt: new Date("2026-04-15T00:00:00Z")
					},
					{
						username: "coauthor",
						lessonId: "b",
						createdAt: new Date("2026-04-02T12:00:00Z")
					}
				]
			});
			(database.lesson.findMany as jest.Mock).mockResolvedValue([
				{ lessonId: "a", title: "A" },
				{ lessonId: "b", title: "B" }
			]);

			// Exercise
			const result = await getAuthorCourseLessonActivity(userId, "course-1");

			// Verify
			expect(database.course.findFirst).toHaveBeenCalledWith(
				expect.objectContaining({
					where: { courseId: "course-1", authors: { some: { user: { id: userId } } } }
				})
			);
			expect(result?.periods).toEqual([
				{ start: "2026-04-01", end: "2026-04-08" },
				{ start: "2026-04-08", end: "2026-04-15" },
				{ start: "2026-04-15", end: "2026-04-20" }
			]);
			expect(
				result?.chapters.map(chapter => [
					chapter.title,
					chapter.lessons.map(lesson => lesson.title)
				])
			).toEqual([
				["Chapter", ["B", "A"]],
				["Second chapter", ["B"]]
			]);
			expect(result?.chapters[0].lessons[0].totalCompletions).toBe(2);
			expect(result?.chapters[0].lessons[0].periodCompletions).toEqual([1, 1, 2]);
		} finally {
			jest.useRealTimers();
		}
	});

	it("does not return lesson activity for a course the user does not author", async () => {
		(database.course.findFirst as jest.Mock).mockResolvedValue(null);
		expect(await getAuthorCourseLessonActivity(userId, "other-course")).toBeNull();
		expect(database.lesson.findMany).not.toHaveBeenCalled();
	});

	it("uses the winter semester across the year boundary", async () => {
		jest.useFakeTimers().setSystemTime(new Date("2027-03-31T12:00:00Z"));
		try {
			(database.course.findFirst as jest.Mock).mockResolvedValue({
				content: [],
				authors: [],
				completions: []
			});
			(database.lesson.findMany as jest.Mock).mockResolvedValue([]);
			const result = await getAuthorCourseLessonActivity(userId, "course-1");
			expect(result?.periods[0].start).toBe("2026-10-01");
			expect(result?.periods.at(-1)?.end).toBe("2027-03-31");
		} finally {
			jest.useRealTimers();
		}
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

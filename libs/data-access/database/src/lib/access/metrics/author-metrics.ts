import { courseContentSchema, extractLessonIds } from "@self-learning/types";
import { subMonths } from "date-fns";
import { fromZonedTime, toZonedTime } from "date-fns-tz";
import { database } from "../../prisma";

/**
 * Fetch average completion rate by author for a user.
 */
export async function getAuthorMetric_AverageCompletionRate(userId: string) {
	return database.authorMetric_AverageCompletionRate.findUnique({
		where: { authorId: userId }
	});
}

/**
 * Fetch average subject completion rate by author for a user.
 */
export async function getAuthorMetric_AverageSubjectCompletionRate(userId: string) {
	return database.authorMetric_AverageSubjectCompletionRate.findMany({
		where: { authorId: userId }
	});
}

/**
 * Average the share of current course lessons completed by enrolled learners
 * who have completed at least one lesson. Authors of that course are excluded.
 */
export async function getAuthorMetric_AverageCourseCompletionRate(userId: string) {
	const recentEnrollmentStart = subMonths(new Date(), 6);
	// Fetch author's courses
	const authorsCourses = await database.author.findFirst({
		where: { user: { id: userId } },
		select: {
			username: true,
			courses: {
				select: {
					courseId: true,
					title: true,
					content: true,
					authors: { select: { username: true } },
					enrollments: {
						select: { username: true, status: true, completedAt: true, createdAt: true }
					},
					completions: {
						select: { username: true, lessonId: true },
						distinct: ["username", "lessonId"]
					}
				}
			}
		}
	});
	if (!authorsCourses) return [];

	return authorsCourses.courses.map(course => {
		// Fetch lessons of course
		const parsedContent = courseContentSchema.safeParse(course.content);
		const lessonIds = new Set(
			extractLessonIds(parsedContent.success ? parsedContent.data : [])
		);

		// Course authors are excluded from enrollment counts and completion rates.
		const courseAuthorUsernames = new Set(course.authors.map(author => author.username));
		const learnersWithCompletion = new Set(
			course.completions
				.filter(completion => lessonIds.has(completion.lessonId))
				.map(completion => completion.username)
		);
		const eligibleEnrollments = course.enrollments.filter(
			enrollment => !courseAuthorUsernames.has(enrollment.username)
		);
		const recentEnrollments = eligibleEnrollments.filter(
			enrollment => enrollment.createdAt >= recentEnrollmentStart
		);

		const completionRate = (enrollments: typeof eligibleEnrollments) => {
			// Only learners with progress in the current course content contribute to the rate.
			const withProgress = enrollments.filter(enrollment =>
				learnersWithCompletion.has(enrollment.username)
			);
			const enrolledUsernames = new Set(withProgress.map(enrollment => enrollment.username));
			const completedCount = course.completions.filter(
				completion =>
					enrolledUsernames.has(completion.username) && lessonIds.has(completion.lessonId)
			).length;
			const possible = lessonIds.size * withProgress.length;
			return possible ? Math.round((completedCount / possible) * 10000) / 100 : 0;
		};

		return {
			authorId: userId,
			authorUsername: authorsCourses.username,
			courseId: course.courseId,
			courseTitle: course.title,
			totalEnrollments: eligibleEnrollments.length,
			enrollmentsLastSixMonths: recentEnrollments.length,
			completedEnrollments: eligibleEnrollments.filter(
				e => e.status === "COMPLETED" || e.completedAt !== null
			).length,
			averageCompletionRate: completionRate(eligibleEnrollments),
			averageCompletionRateLastSixMonths: completionRate(recentEnrollments)
		};
	});
}

/**
 * Fetch average lesson completion rate by author for a user.
 */
export async function getAuthorMetric_AverageLessonCompletionRate(userId: string) {
	return database.authorMetric_AverageLessonCompletionRate.findMany({
		where: { authorId: userId }
	});
}

/**
 * Fetch average lesson completion rate by author and by course for a user.
 */
export async function getAuthorMetric_AverageLessonCompletionRateByCourse(userId: string) {
	return database.authorMetric_AverageLessonCompletionRateByCourse.findMany({
		where: { authorId: userId }
	});
}

/** Fortnightly lesson completions for the current semester, restricted to course authors. */
export async function getAuthorCourseLessonActivity(userId: string, courseId: string) {
	const course = await database.course.findFirst({
		where: { courseId, authors: { some: { user: { id: userId } } } },
		select: {
			content: true,
			authors: { select: { username: true } },
			completions: { select: { username: true, lessonId: true, createdAt: true } }
		}
	});
	if (!course) return null;

	const parsed = courseContentSchema.safeParse(course.content);
	const lessonIds = [...new Set(extractLessonIds(parsed.success ? parsed.data : []))];
	const lessons = await database.lesson.findMany({
		where: { lessonId: { in: lessonIds } },
		select: { lessonId: true, title: true }
	});
	const titles = new Map(lessons.map(lesson => [lesson.lessonId, lesson.title]));
	const authors = new Set(course.authors.map(author => author.username));
	const now = new Date();
	const localNow = toZonedTime(now, "Europe/Berlin");
	const year = localNow.getFullYear();
	const month = localNow.getMonth();
	const semesterStart = new Date(
		Date.UTC(month < 3 ? year - 1 : year, month >= 3 && month < 9 ? 3 : 9, 1)
	);
	const semesterEnd = new Date(
		Date.UTC(month < 3 ? year : month < 9 ? year : year + 1, month >= 3 && month < 9 ? 9 : 3, 1)
	);
	const periods: { start: string; end: string; endTime: number }[] = [];
	for (let start = semesterStart; start < semesterEnd;) {
		const end = new Date(Math.min(start.getTime() + 14 * 86400000, semesterEnd.getTime()));
		const startDate = start.toISOString().slice(0, 10);
		const endDate = end.toISOString().slice(0, 10);
		if (fromZonedTime(startDate, "Europe/Berlin").getTime() > now.getTime()) break;
		periods.push({
			start: startDate,
			end: endDate,
			endTime: fromZonedTime(endDate, "Europe/Berlin").getTime()
		});
		start = end;
	}
	const firstCompletions = new Map<string, Map<string, Date>>();
	for (const completion of course.completions) {
		if (authors.has(completion.username)) continue;
		const byUser = firstCompletions.get(completion.lessonId) ?? new Map<string, Date>();
		const previous = byUser.get(completion.username);
		if (!previous || completion.createdAt < previous)
			byUser.set(completion.username, completion.createdAt);
		firstCompletions.set(completion.lessonId, byUser);
	}
	const metricsByLesson = new Map(
		lessonIds.flatMap(lessonId => {
			const title = titles.get(lessonId);
			if (title === undefined) return [];
			const completions = firstCompletions.get(lessonId) ?? new Map<string, Date>();
			return [
				[
					lessonId,
					{
						lessonId,
						title,
						totalCompletions: completions.size,
						periodCompletions: periods.map(period => {
							const cutoff = Math.min(period.endTime, now.getTime() + 1);
							return [...completions.values()].filter(date => date.getTime() < cutoff)
								.length;
						})
					}
				] as const
			];
		})
	);
	return {
		periods: periods.map(({ start, end }) => ({ start, end })),
		chapters: (parsed.success ? parsed.data : []).map(chapter => ({
			title: chapter.title,
			lessons: chapter.content.flatMap(({ lessonId }) => {
				const lesson = metricsByLesson.get(lessonId);
				return lesson ? [lesson] : [];
			})
		}))
	};
}

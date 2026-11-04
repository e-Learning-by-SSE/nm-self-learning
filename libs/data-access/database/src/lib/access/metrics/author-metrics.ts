import { courseContentSchema, extractLessonIds } from "@self-learning/types";
import { subMonths } from "date-fns";
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

		// Only learners with a completed lesson in the current course content count.
		// Course authors are excluded from the eligible learners
		const courseAuthorUsernames = new Set(course.authors.map(author => author.username));
		const learnersWithCompletion = new Set(
			course.completions
				.filter(completion => lessonIds.has(completion.lessonId))
				.map(completion => completion.username)
		);
		const eligibleEnrollments = course.enrollments.filter(
			enrollment =>
				!courseAuthorUsernames.has(enrollment.username) &&
				learnersWithCompletion.has(enrollment.username)
		);
		const recentEnrollments = eligibleEnrollments.filter(
			enrollment => enrollment.createdAt >= recentEnrollmentStart
		);

		const completionRate = (enrollments: typeof eligibleEnrollments) => {
			const enrolledUsernames = new Set(enrollments.map(enrollment => enrollment.username));
			const completedCount = course.completions.filter(
				completion =>
					enrolledUsernames.has(completion.username) && lessonIds.has(completion.lessonId)
			).length;
			const possible = lessonIds.size * enrollments.length;
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

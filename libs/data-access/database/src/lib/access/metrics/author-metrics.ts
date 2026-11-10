import { courseContentSchema, extractLessonIds } from "@self-learning/types";
import { subMonths } from "date-fns";
import { fromZonedTime, toZonedTime } from "date-fns-tz";
import { database } from "../../prisma";

/**
 * Average the share of current course lessons completed by enrolled learners
 * who have completed at least one lesson. Authors of that course are excluded.
 */
export async function getAuthorMetric_AverageCourseCompletionRate(
	userId: string,
	period?: { startDate: string; endDate: string } | null
) {
	const now = new Date();
	const periodStart = period
		? fromZonedTime(`${period.startDate}T00:00:00`, "Europe/Berlin")
		: subMonths(now, 6);
	const nextDay = period ? new Date(`${period.endDate}T00:00:00Z`) : null;
	if (nextDay) nextDay.setUTCDate(nextDay.getUTCDate() + 1);
	const periodEnd = nextDay
		? fromZonedTime(`${nextDay.toISOString().slice(0, 10)}T00:00:00`, "Europe/Berlin")
		: new Date(now.getTime() + 1);
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
					}
				}
			}
		}
	});
	if (!authorsCourses) return [];
	const courseIds = authorsCourses.courses.map(course => course.courseId);
	const [completions, recentCompletions] = await Promise.all([
		database.completedLesson.groupBy({
			by: ["courseId", "username", "lessonId"],
			where: { courseId: { in: courseIds } }
		}),
		database.completedLesson.groupBy({
			by: ["courseId", "username", "lessonId"],
			where: { courseId: { in: courseIds }, createdAt: { gte: periodStart, lt: periodEnd } }
		})
	]);
	const byCourse = (rows: typeof completions) => {
		const result = new Map<string, typeof completions>();
		for (const row of rows) {
			if (!row.courseId) continue;
			const courseRows = result.get(row.courseId) ?? [];
			courseRows.push(row);
			result.set(row.courseId, courseRows);
		}
		return result;
	};
	const completionsByCourse = byCourse(completions);
	const recentCompletionsByCourse = byCourse(recentCompletions);

	return authorsCourses.courses.map(course => {
		const courseCompletions = completionsByCourse.get(course.courseId) ?? [];
		// Fetch lessons of course
		const parsedContent = courseContentSchema.safeParse(course.content);
		const lessonIds = new Set(
			extractLessonIds(parsedContent.success ? parsedContent.data : [])
		);

		// Course authors are excluded from enrollment counts and completion rates.
		const courseAuthorUsernames = new Set(course.authors.map(author => author.username));
		const learnersWithCompletion = new Set(
			courseCompletions
				.filter(completion => lessonIds.has(completion.lessonId))
				.map(completion => completion.username)
		);
		const eligibleEnrollments = course.enrollments.filter(
			enrollment => !courseAuthorUsernames.has(enrollment.username)
		);
		const recentEnrollments = eligibleEnrollments.filter(
			enrollment => enrollment.createdAt >= periodStart && enrollment.createdAt < periodEnd
		);

		const eligibleUsernames = new Set(
			eligibleEnrollments.map(enrollment => enrollment.username)
		);
		const participation = new Set<string>();
		const recentParticipation = new Set<string>();
		for (const completion of courseCompletions) {
			if (!eligibleUsernames.has(completion.username) || !lessonIds.has(completion.lessonId))
				continue;
			participation.add(completion.username);
		}
		for (const completion of recentCompletionsByCourse.get(course.courseId) ?? []) {
			if (eligibleUsernames.has(completion.username) && lessonIds.has(completion.lessonId))
				recentParticipation.add(completion.username);
		}

		const completionRate = (enrollments: typeof eligibleEnrollments) => {
			// Only learners with progress in the current course content contribute to the rate.
			const withProgress = enrollments.filter(enrollment =>
				learnersWithCompletion.has(enrollment.username)
			);
			const enrolledUsernames = new Set(withProgress.map(enrollment => enrollment.username));
			const completedByUser = new Map<string, Set<string>>();
			for (const completion of courseCompletions) {
				if (
					!enrolledUsernames.has(completion.username) ||
					!lessonIds.has(completion.lessonId)
				)
					continue;
				const lessons = completedByUser.get(completion.username) ?? new Set<string>();
				lessons.add(completion.lessonId);
				completedByUser.set(completion.username, lessons);
			}
			const completedCount = [...completedByUser.values()].reduce(
				(sum, lessons) => sum + lessons.size,
				0
			);
			const possible = lessonIds.size * withProgress.length;
			return possible ? Math.round((completedCount / possible) * 10000) / 100 : 0;
		};

		return {
			authorId: userId,
			authorUsername: authorsCourses.username,
			courseId: course.courseId,
			courseTitle: course.title,
			totalEnrollments: eligibleEnrollments.length,
			enrollmentsSemester: recentEnrollments.length,
			totalParticipation: participation.size,
			participationSemester: recentParticipation.size,
			completedEnrollments: eligibleEnrollments.filter(
				e => e.status === "COMPLETED" || e.completedAt !== null
			).length,
			averageCompletionRate: completionRate(eligibleEnrollments),
			averageCompletionRateSemester: completionRate(recentEnrollments)
		};
	});
}

/** Weekly lesson completion snapshots for a date range, restricted to course authors. */
export async function getAuthorCourseLessonActivity(
	userId: string,
	courseId: string,
	startDate?: string,
	endDate?: string
) {
	const course = await database.course.findFirst({
		where: { courseId, authors: { some: { user: { id: userId } } } },
		select: {
			slug: true,
			content: true,
			authors: { select: { username: true } },
			enrollments: { select: { username: true, createdAt: true } },
			completions: {
				select: { username: true, lessonId: true, createdAt: true, performanceScore: true }
			}
		}
	});
	if (!course) return null;

	const parsed = courseContentSchema.safeParse(course.content);
	const lessonIds = [...new Set(extractLessonIds(parsed.success ? parsed.data : []))];
	const lessons = await database.lesson.findMany({
		where: { lessonId: { in: lessonIds } },
		select: { lessonId: true, title: true, slug: true }
	});
	const lessonsById = new Map(lessons.map(lesson => [lesson.lessonId, lesson]));
	const authors = new Set(course.authors.map(author => author.username));
	const now = new Date();
	const localNow = toZonedTime(now, "Europe/Berlin");
	const year = localNow.getFullYear();
	const month = localNow.getMonth();
	const currentSemesterStart = new Date(
		Date.UTC(month < 3 ? year - 1 : year, month >= 3 && month < 9 ? 3 : 9, 1)
	);
	const currentSemesterEnd = new Date(
		Date.UTC(month < 3 ? year : month < 9 ? year : year + 1, month >= 3 && month < 9 ? 9 : 3, 1)
	);
	const rangeStartDate = startDate ?? currentSemesterStart.toISOString().slice(0, 10);
	const rangeEndDate =
		endDate ?? new Date(currentSemesterEnd.getTime() - 86400000).toISOString().slice(0, 10);
	const rangeStart = new Date(`${rangeStartDate}T00:00:00Z`);
	const rangeEndExclusiveUtc = new Date(`${rangeEndDate}T00:00:00Z`);
	rangeEndExclusiveUtc.setUTCDate(rangeEndExclusiveUtc.getUTCDate() + 1);
	const rangeEndExclusive = rangeEndExclusiveUtc;
	const periods: { start: string; end: string; endTime: number }[] = [];
	const tomorrowInBerlin = new Date(
		Date.UTC(localNow.getFullYear(), localNow.getMonth(), localNow.getDate() + 1)
	)
		.toISOString()
		.slice(0, 10);
	const effectiveEndExclusive = new Date(
		Math.min(
			rangeEndExclusive.getTime(),
			fromZonedTime(tomorrowInBerlin, "Europe/Berlin").getTime()
		)
	);
	for (let start = rangeStart; start < effectiveEndExclusive;) {
		const end = new Date(
			Math.min(start.getTime() + 7 * 86400000, effectiveEndExclusive.getTime())
		);
		const periodStart = start.toISOString().slice(0, 10);
		const endDate = end.toISOString().slice(0, 10);
		periods.push({
			start: periodStart,
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
	const eligibleEnrollments = (course.enrollments ?? []).filter(
		enrollment => !authors.has(enrollment.username)
	);
	const periodStartTime = fromZonedTime(`${rangeStartDate}T00:00:00`, "Europe/Berlin").getTime();
	const periodEndExclusiveDate = new Date(`${rangeEndDate}T00:00:00Z`);
	periodEndExclusiveDate.setUTCDate(periodEndExclusiveDate.getUTCDate() + 1);
	const periodEndTime = fromZonedTime(
		`${periodEndExclusiveDate.toISOString().slice(0, 10)}T00:00:00`,
		"Europe/Berlin"
	).getTime();
	const enrolledUsers = new Set(eligibleEnrollments.map(enrollment => enrollment.username));
	const currentLessons = new Set(lessonIds);
	const lessonChartForRange = (range?: { start: number; end: number }) => {
		const learners = new Set<string>();
		const scoresByLesson = new Map<string, Map<string, number | null>>();
		for (const completion of course.completions) {
			const timestamp = completion.createdAt.getTime();
			if (
				!enrolledUsers.has(completion.username) ||
				!currentLessons.has(completion.lessonId) ||
				(range && (timestamp < range.start || timestamp >= range.end))
			)
				continue;
			learners.add(completion.username);
			const scores =
				scoresByLesson.get(completion.lessonId) ?? new Map<string, number | null>();
			const score = completion.performanceScore;
			const validScore = Number.isFinite(score) && score >= 0 && score <= 1 ? score : null;
			const previous = scores.get(completion.username);
			scores.set(
				completion.username,
				validScore === null ? (previous ?? null) : Math.max(previous ?? 0, validScore)
			);
			scoresByLesson.set(completion.lessonId, scores);
		}
		return lessonIds.flatMap(lessonId => {
			const lesson = lessonsById.get(lessonId);
			if (!lesson) return [];
			const completions = scoresByLesson.get(lessonId);
			const scores = [...(completions?.values() ?? [])].filter(
				(score): score is number => score !== null
			);
			return [
				{
					lessonId,
					title: lesson.title,
					completionRate: learners.size
						? ((completions?.size ?? 0) / learners.size) * 100
						: null,
					averageScore: scores.length
						? (scores.reduce((sum, score) => sum + score, 0) / scores.length) * 100
						: null
				}
			];
		});
	};
	const lessonChart = {
		period: lessonChartForRange({ start: periodStartTime, end: periodEndTime }),
		total: lessonChartForRange()
	};
	const summarizeCompletedLessons = (range?: { start: number; end: number }) => {
		const completedByUser = new Map<string, Set<string>>();
		for (const completion of course.completions) {
			if (
				authors.has(completion.username) ||
				!lessonIds.includes(completion.lessonId) ||
				(range &&
					(completion.createdAt.getTime() < range.start ||
						completion.createdAt.getTime() >= range.end))
			)
				continue;
			const completedForUser = completedByUser.get(completion.username) ?? new Set<string>();
			completedForUser.add(completion.lessonId);
			completedByUser.set(completion.username, completedForUser);
		}
		const counts = [...completedByUser.values()].map(completed => completed.size);
		const summary = counts.reduce(
			(result, count) => ({
				min: Math.min(result.min, count),
				max: Math.max(result.max, count),
				sum: result.sum + count
			}),
			{ min: Number.POSITIVE_INFINITY, max: 0, sum: 0 }
		);
		return {
			min: counts.length ? summary.min : null,
			max: counts.length ? summary.max : null,
			avg: counts.length ? Math.round((summary.sum / counts.length) * 10) / 10 : null
		};
	};
	const countParticipation = (range?: { start: number; end: number }) =>
		new Set(
			course.completions
				.filter(completion => {
					const timestamp = completion.createdAt.getTime();
					return (
						enrolledUsers.has(completion.username) &&
						currentLessons.has(completion.lessonId) &&
						(!range || (timestamp >= range.start && timestamp < range.end))
					);
				})
				.map(completion => completion.username)
		).size;
	const analytics = {
		period: {
			enrollments: eligibleEnrollments.filter(
				enrollment =>
					enrollment.createdAt.getTime() >= periodStartTime &&
					enrollment.createdAt.getTime() < periodEndTime
			).length,
			participation: countParticipation({ start: periodStartTime, end: periodEndTime }),
			completedLessons: summarizeCompletedLessons({
				start: periodStartTime,
				end: periodEndTime
			})
		},
		total: {
			enrollments: eligibleEnrollments.length,
			participation: countParticipation(),
			completedLessons: summarizeCompletedLessons()
		}
	};
	const metricsByLesson = new Map(
		lessonIds.flatMap(lessonId => {
			const lesson = lessonsById.get(lessonId);
			if (!lesson) return [];
			const completions = firstCompletions.get(lessonId) ?? new Map<string, Date>();
			return [
				[
					lessonId,
					{
						lessonId,
						title: lesson.title,
						slug: lesson.slug,
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
		courseSlug: course.slug,
		periods: periods.map(({ start, end }) => ({ start, end })),
		analytics,
		lessonChart,
		chapters: (parsed.success ? parsed.data : []).map(chapter => ({
			title: chapter.title,
			lessons: chapter.content.flatMap(({ lessonId }) => {
				const lesson = metricsByLesson.get(lessonId);
				return lesson ? [lesson] : [];
			})
		}))
	};
}

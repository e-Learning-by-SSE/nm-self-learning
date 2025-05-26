import { database } from "@self-learning/database";
import { CourseContent, extractLessonIds } from "@self-learning/types";
import { createEventLogEntry } from "@self-learning/util/eventlog";

export async function markAsCompleted({
	lessonId,
	courseSlug,
	username,
	performanceScore
}: {
	lessonId: string;
	courseSlug: string | null;
	username: string;
	performanceScore: number;
}) {
	const course = courseSlug
		? await database.course.findUniqueOrThrow({
				where: { slug: courseSlug },
				select: {
					courseId: true,
					content: true
				}
			})
		: null;

	const oldData = await database.completedLesson.findUnique({
		where: { username_lessonId: { username, lessonId } },
		select: {
			performanceScore: true
		}
	});

	const existingPerformance = oldData?.performanceScore ?? 0;

	let updatePerformance = performanceScore;
	if (existingPerformance > performanceScore) {
		updatePerformance = performanceScore;
	}

	const result = await database.completedLesson.upsert({
		where: {
			username_lessonId: {
				username,
				lessonId
			}
		},
		create: {
			courseId: course?.courseId,
			lessonId,
			username,
			performanceScore: updatePerformance
		},
		update: {
			performanceScore: updatePerformance
		},
		select: {
			createdAt: true,
			username: true,
			lessonId: true,
			lesson: {
				select: {
					lessonId: true,
					title: true,
					slug: true
				}
			}
		}
	});

	// TODO remove since it is depricated
	await createEventLogEntry({
		username,
		type: "LESSON_COMPLETE",
		resourceId: lessonId,
		courseId: course?.courseId,
		payload: {
			completedLessonId: result.lessonId
		}
	});

	if (course) {
		await updateCourseProgress(course.courseId, course.content as CourseContent, username);
	}

	return result;
}

async function updateCourseProgress(courseId: string, content: CourseContent, username: string) {
	const completedLessons = await database.completedLesson.findMany({
		where: { AND: { username, courseId } },
		select: { lessonId: true }
	});

	// Remove duplicates to support re-visiting a lesson
	const completedIds = new Set(completedLessons.map(({ lessonId }) => lessonId));
	const lessons = new Set(extractLessonIds(content));

	const progress = Math.floor((completedIds.size / lessons.size) * 100);

	if (progress === 100) {
		await createEventLogEntry({
			username,
			type: "COURSE_COMPLETE",
			resourceId: courseId,
			courseId,
			payload: undefined
		});
	}

	// TODO: Student must be enrolled in course, otherwise this will fail
	await database.enrollment.update({
		where: { courseId_username: { courseId, username } },
		select: null,
		data: {
			progress,
			lastProgressUpdate: new Date()
		}
	});
}

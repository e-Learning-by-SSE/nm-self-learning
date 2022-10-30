import { database } from "@self-learning/database";
import { CourseContent, extractLessonIds } from "@self-learning/types";

export async function markAsCompleted({
	lessonId,
	courseSlug,
	username
}: {
	lessonId: string;
	courseSlug: string | null;
	username: string;
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

	const result = await database.completedLesson.create({
		data: {
			courseId: course?.courseId,
			lessonId,
			username
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

	const lessons = extractLessonIds(content);

	const progress = Math.floor((completedLessons.length / lessons.length) * 100);

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

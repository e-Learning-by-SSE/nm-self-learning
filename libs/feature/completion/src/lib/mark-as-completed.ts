import { getCombinedCourses } from "@self-learning/course";
import { createUserEvent, database } from "@self-learning/database";
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
	let course = null;
	if (courseSlug) {
		const result = await getCombinedCourses({
			slug: courseSlug
		});
		course = result[0] ?? null;
	}

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

	await addEarnedSkillsToUser(lessonId, username);

	await createUserEvent({
		username,
		type: "LESSON_COMPLETE",
		resourceId: lessonId,
		courseId: course?.courseId,
		payload: undefined
	});

	if (course) {
		await updateCourseProgress(course.courseId, course.content as CourseContent, username);
	}

	return result;
}

async function updateCourseProgress(courseId: string, content: CourseContent, username: string) {
	const completedLessons = await database.completedLesson.findMany({
		where: {
			AND: [
				{ username },
				{
					OR: [{ courseId }, { dynCourseId: courseId }]
				}
			]
		}
	});

	// Remove duplicates to support re-visiting a lesson
	const completedIds = new Set(completedLessons.map(({ lessonId }) => lessonId));
	const lessons = new Set(extractLessonIds(content));

	const progress = Math.floor((completedIds.size / lessons.size) * 100);

	if (progress === 100) {
		await createUserEvent({
			username,
			type: "COURSE_COMPLETE",
			resourceId: courseId,
			courseId,
			payload: undefined
		});
	}

	// TODO: Student must be enrolled in course, otherwise this will fail
	await database.enrollment.updateMany({
		where: {
			username,
			OR: [{ courseId }, { dynCourseId: courseId }]
		},
		data: {
			progress,
			lastProgressUpdate: new Date()
		}
	});
}

async function addEarnedSkillsToUser(lessonId: string, username: string) {
	return await database.$transaction(async tx => {
		const lesson = await tx.lesson.findUniqueOrThrow({
			where: {
				lessonId
			},
			select: {
				provides: {
					select: {
						id: true
					}
				}
			}
		});

		await tx.student.update({
			where: { username },
			data: {
				received: {
					connect: lesson.provides.map(skill => ({ id: skill.id }))
				}
			}
		});
	});
}

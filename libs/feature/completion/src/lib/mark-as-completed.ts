import { CourseType } from "@prisma/client";
import { getCourseData } from "@self-learning/course";
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
	const course = courseSlug ? await getCourseData(courseSlug, username) : null;
	// TODO duplicated at all getCourseData call sites
	const rawContent =
		course?.type === CourseType.DYNAMIC
			? course?.generatedLessonPaths?.at(0)?.content
			: course?.content;
	const content = (rawContent ?? []) as CourseContent;

	const result = await database.completedLesson.create({
		data: {
			courseId: course?.courseId,
			lessonId,
			username,
			performanceScore
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

	// TODO remove since it is deprecated
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
		await updateCourseProgress(course.courseId, content, username);
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
	// CompletedLesson is the source of truth for individual lessons. Persist the
	// derived course completion on Enrollment, which is what analytics queries.
	const completedAt = progress === 100 ? new Date() : null;

	let completedAt = null;
	if (progress === 100) {
		await createEventLogEntry({
			username,
			type: "COURSE_COMPLETE",
			resourceId: courseId,
			courseId,
			payload: undefined
		});
		// CompletedLesson is the source of truth for individual lessons. Persist the
		// derived course completion on Enrollment, which is what analytics queries.
		completedAt = progress === 100 ? new Date() : null;
	}

	await database.enrollment.upsert({
		where: {
			courseId_username: { courseId, username }
		},
		create: {
			courseId,
			username,
			progress,
			status: "ACTIVE",
			lastProgressUpdate: new Date()
		},
		update: {
			progress,
			lastProgressUpdate: new Date(),
			...(completedAt && {
				status: "COMPLETED" as const,
				completedAt
			})
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

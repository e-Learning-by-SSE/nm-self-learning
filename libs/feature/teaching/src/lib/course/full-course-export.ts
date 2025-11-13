import { database } from "@self-learning/database";
import { CourseContent } from "@self-learning/types";
import { LessonData, getLessons } from "@self-learning/lesson";
import { ResolvedValue } from "@self-learning/types";

async function loadFullCourse(slug: string) {
	return database.course.findUniqueOrThrow({
		where: { slug: slug },
		select: {
			courseId: true,
			slug: true,
			imgUrl: true,
			title: true,
			subtitle: true,
			description: true,
			content: true,
			meta: true,
			authors: {
				select: {
					displayName: true,
					user: {
						select: {
							email: true
						}
					}
				}
			},
			subject: {
				select: {
					subjectId: true,
					title: true
				}
			},
			specializations: {
				select: {
					specializationId: true,
					title: true
				}
			}
		}
	});
}

export type FullCourseData = ResolvedValue<typeof loadFullCourse>;

export async function getFullCourseExport(slug: string) {
	const course = await loadFullCourse(slug);

	const courseContent = (course.content ?? []) as CourseContent;
	const lessonIds = courseContent.flatMap(chapter =>
		chapter.content.map(lesson => lesson.lessonId)
	);
	const lessons: LessonData[] = await getLessons(lessonIds);
	// Todo add lesson data to above query to improve performance and reduce dependencies to lesson-data-access which was not designed for this purpose

	return { course: course, lessons: lessons } as const;
}

export type FullCourseExport = ResolvedValue<typeof getFullCourseExport>;

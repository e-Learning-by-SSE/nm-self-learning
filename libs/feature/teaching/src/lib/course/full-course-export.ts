import { database } from "@self-learning/database";
import { CourseContent } from "@self-learning/types";
import { LessonContent, getLessons } from "@self-learning/lesson";
import { ResolvedValue } from "@self-learning/types";

export async function getFullCourseExport(slug: string) {
	const course = await database.course.findUniqueOrThrow({
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
					displayName: true
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

	const courseContent = (course.content ?? []) as CourseContent;
	const lessonIds = courseContent.flatMap(chapter =>
		chapter.content.map(lesson => lesson.lessonId)
	);
	const lessons: LessonContent[] = await getLessons(lessonIds);

	return { course: course, lessons: lessons } as const;
}

export type FullCourseExport = ResolvedValue<typeof getFullCourseExport>;

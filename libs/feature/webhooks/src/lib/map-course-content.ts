import { CourseEntry } from "./schemas";

type Chapter = {
	title: string;
	description?: string | null;
	lessons: { lessonId: string }[];
};

export function mapCourseContent(contentFromCms: CourseEntry["content"]): Chapter[] {
	return (
		contentFromCms?.map(chapter => ({
			title: chapter.title,
			description: chapter.description,
			lessons: chapter.lessons?.map(lesson => ({ lessonId: lesson.lesson.lessonId })) ?? []
		})) ?? []
	);
}

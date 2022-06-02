import { CourseChapter } from "@self-learning/types";
import { CourseEntry } from "./schemas";

export function mapCourseContent(contentFromCms: CourseEntry["content"]): CourseChapter[] {
	return (
		contentFromCms?.map(chapter => ({
			title: chapter.title,
			description: chapter.description,
			lessons: chapter.lessons?.map(lesson => ({ lessonId: lesson.lesson.lessonId })) ?? []
		})) ?? []
	);
}

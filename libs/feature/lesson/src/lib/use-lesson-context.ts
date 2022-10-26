import { trpc } from "@self-learning/api-client";
import { extractLessonIds } from "@self-learning/types";
import { useMemo } from "react";

export function useLessonContext(lessonId: string, courseSlug: string) {
	const { data: content } = trpc.course.getContent.useQuery({ slug: courseSlug });

	const chapterName = useMemo(() => {
		if (!content) return "";

		for (const chapter of content.content) {
			for (const _lesson of chapter.content) {
				if (_lesson.lessonId === lessonId) {
					return chapter.title;
				}
			}
		}

		return "";
	}, [content, lessonId]);

	const nextLesson = useMemo(() => {
		if (!content) return null;

		const lessonIds = extractLessonIds(content.content);
		const index = lessonIds.indexOf(lessonId);
		if (index === -1) return null;

		const nextLessonId = lessonIds[index + 1] ?? null;

		if (nextLessonId) {
			return content.lessonMap[nextLessonId];
		}

		return null;
	}, [content, lessonId]);

	return { chapterName, nextLesson };
}

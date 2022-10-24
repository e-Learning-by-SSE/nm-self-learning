import { trpc } from "@self-learning/api-client";
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

	return { chapterName };
}

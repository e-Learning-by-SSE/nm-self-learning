import { CourseContent } from "@self-learning/types";
import { useCallback, useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { Summary } from "./types";

export type NewChapterDialogResult = { title: string; description?: string };

export function useCourseContentForm() {
	const { setValue, getValues } = useFormContext<{ content: CourseContent }>();
	const [content, setContent] = useState<CourseContent>(getValues().content);

	useEffect(() => {
		// Update form whenever the internally managed `content` changes
		setValue("content", content);
	}, [content, setValue]);

	// const summary = useMemo(() => {
	// 	const sum = createSummary(content);
	// 	return { count: sum.count, competences: [...sum.competences.values()] };
	// }, [content]);

	const [openNewChapterDialog, setOpenNewChapterDialog] = useState(false);

	const onAddChapter = useCallback(() => {
		setOpenNewChapterDialog(true);
	}, [setOpenNewChapterDialog]);

	function addChapterDialogClosed(result?: NewChapterDialogResult) {
		console.log(result);
		setOpenNewChapterDialog(false);

		if (result) {
			//
		}
	}

	const onAddLesson = useCallback(
		(chapterId: string, lesson: { lessonId: string }) => {
			setContent(prev => {
				return prev;
			});
		},
		[setContent]
	);

	const moveLesson = useCallback(
		(lessonId: string, direction: "up" | "down") => {
			const newContent = [...content];

			for (let chapterIndex = 0; chapterIndex < newContent.length; chapterIndex++) {
				const chapter = newContent[chapterIndex];

				for (let lessonIndex = 0; lessonIndex < chapter.content.length; lessonIndex++) {
					const lesson = chapter.content[lessonIndex];

					if (lesson.lessonId === lessonId) {
						const newChapter = { ...chapter, content: [...chapter.content] };

						if (direction === "up" && lessonIndex > 0) {
							const previousLesson = newChapter.content[lessonIndex - 1];
							newChapter.content[lessonIndex - 1] = lesson;
							newChapter.content[lessonIndex] = previousLesson;
						} else if (
							direction === "down" &&
							lessonIndex < chapter.content.length - 1
						) {
							const nextLesson = { ...chapter.content[lessonIndex + 1] };
							newChapter.content[lessonIndex] = nextLesson;
							newChapter.content[lessonIndex + 1] = lesson;
						}

						newContent[chapterIndex] = newChapter;
						setContent(newContent);
						return;
					}
				}
			}
		},
		[content]
	);

	return {
		content,
		moveLesson,
		// summary,
		openNewChapterDialog,
		addChapterDialogClosed,
		onAddChapter,
		onAddLesson
	};
}

function createSummary(content: any) {
	const summary: Summary = {
		count: {
			chapters: 0,
			lessons: 0,
			quizzes: 0
		}
	};

	return summary;
}

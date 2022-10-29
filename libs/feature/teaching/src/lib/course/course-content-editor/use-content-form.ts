import { CourseChapter, CourseContent, CourseLesson } from "@self-learning/types";
import { useCallback, useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";

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

	const addChapter = useCallback((chapter: CourseChapter) => {
		setContent(prev => [...prev, chapter]);
	}, []);

	const updateChapter = useCallback(
		(index: number, chapter: CourseChapter) => {
			setContent(prev => {
				const newContent = [...prev];
				newContent[index] = chapter;
				return newContent;
			});
		},
		[setContent]
	);

	const addLesson = useCallback(
		(chapterIndex: number, lesson: CourseLesson) => {
			setContent(prev => {
				const newContent = [...prev];
				const chapter = newContent[chapterIndex];
				chapter.content = [...chapter.content, { lessonId: lesson.lessonId }];
				return newContent;
			});
		},
		[setContent]
	);

	const moveChapter = useCallback(
		(index: number, direction: "up" | "down") => {
			setContent(prev => {
				if (
					(direction === "up" && index === 0) ||
					(direction === "down" && index === prev.length - 1)
				) {
					return prev;
				}

				const chapters = [...prev];
				const chapter = chapters[index];
				chapters.splice(index, 1);
				chapters.splice(index + (direction === "up" ? -1 : 1), 0, chapter);
				return chapters;
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

						if (direction === "up") {
							if (lessonIndex === 0 && chapterIndex === 0) {
								return;
							}

							if (lessonIndex === 0 && chapterIndex > 0) {
								// Move to previous chapter
								// Remove from current chapter
								newChapter.content = newChapter.content.filter(
									x => x.lessonId !== lessonId
								);
								// Add to end of previous chapter
								newContent[chapterIndex - 1].content = [
									...newContent[chapterIndex - 1].content,
									lesson
								];
							} else {
								const previousLesson = newChapter.content[lessonIndex - 1];
								newChapter.content[lessonIndex - 1] = lesson;
								newChapter.content[lessonIndex] = previousLesson;
							}
						}

						if (direction === "down") {
							if (
								lessonIndex === chapter.content.length - 1 &&
								chapterIndex === newContent.length - 1
							) {
								return;
							}

							if (
								lessonIndex === chapter.content.length - 1 &&
								chapterIndex < newContent.length - 1
							) {
								// Last lesson -> Move to next chapter
								// Remove from current chapter
								newChapter.content.pop();
								// Add to start of next chapter
								newContent[chapterIndex + 1].content = [
									lesson,
									...newContent[chapterIndex + 1].content
								];
							} else {
								// Not last lesson -> Move down
								const nextLesson = { ...chapter.content[lessonIndex + 1] };
								newChapter.content[lessonIndex] = nextLesson;
								newChapter.content[lessonIndex + 1] = lesson;
							}
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

	const removeChapter = useCallback(
		(index: number) => {
			setContent(prev => {
				const newContent = [...prev];
				newContent.splice(index, 1);
				return newContent;
			});
		},
		[setContent]
	);

	const removeLesson = useCallback(
		(chapterIndex: number, lessonId: string) => {
			setContent(prev => {
				const newContent = [...prev];

				const chapter = newContent[chapterIndex];
				newContent[chapterIndex] = {
					...chapter,
					content: chapter.content.filter(x => x.lessonId !== lessonId)
				};

				return newContent;
			});
		},
		[setContent]
	);

	return {
		content,
		updateChapter,
		removeChapter,
		removeLesson,
		moveChapter,
		moveLesson,
		addChapter,
		addLesson
	};
}

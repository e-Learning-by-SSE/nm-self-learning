import { CourseContent, CourseLesson } from "@self-learning/types";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { CourseFormModel } from "../course-form-model";

/**
 * content lives only in react-hook-form. No local useState, no syncing useEffect.
 */
export function useCourseContentForm(defaultContent?: CourseContent) {
	const { control, getValues, setValue } = useFormContext<CourseFormModel>();
	// insert default content if the form is empty & defaultContent is specified
	const watched = useWatch({ control, name: "content" }) ?? [];
	const content = watched.length > 0 ? watched : (defaultContent ?? []);
	// chapter list
	const {
		append: addChapter,
		remove: removeChapter,
		move,
		update: updateChapter,
		replace
	} = useFieldArray({ control, name: "content" });

	function addLesson(chapterIndex: number, lesson: CourseLesson) {
		// put default content if content was not set
		if (!(getValues("content") ?? []).length && defaultContent?.length) {
			setValue("content", defaultContent, { shouldDirty: false });
		}
		const lessons = getValues(`content.${chapterIndex}.content`) ?? [];
		setValue(`content.${chapterIndex}.content`, [...lessons, { lessonId: lesson.lessonId }], {
			shouldDirty: true
		});
	}

	function removeLesson(chapterIndex: number, lessonId: string) {
		const lessons = getValues(`content.${chapterIndex}.content`) ?? [];
		setValue(
			`content.${chapterIndex}.content`,
			lessons.filter(item => item.lessonId !== lessonId),
			{ shouldDirty: true }
		);
	}

	function moveChapter(index: number, direction: "up" | "down") {
		const next = direction === "up" ? index - 1 : index + 1;
		if (next < 0 || next >= content.length) return;
		move(index, next);
	}

	function moveLesson(lessonId: string, direction: "up" | "down") {
		const moved = moveLessonInContent(getValues("content") ?? [], lessonId, direction);
		if (moved) replace(moved);
	}
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

function moveLessonInContent(
	chapters: CourseContent,
	lessonId: string,
	direction: "up" | "down"
): CourseContent | null {
	const next = chapters.map(chapter => ({ ...chapter, content: [...chapter.content] }));
	for (let chapterIndex = 0; chapterIndex < next.length; chapterIndex++) {
		const lessonIndex = next[chapterIndex].content.findIndex(l => l.lessonId === lessonId);
		if (lessonIndex < 0) continue;
		const lesson = next[chapterIndex].content[lessonIndex];
		const lastIndex = next[chapterIndex].content.length - 1;
		if (direction === "up") {
			if (lessonIndex === 0 && chapterIndex === 0) return null; // already first
			if (lessonIndex === 0) {
				// Move to previous chapter
				// Remove from current chapter
				next[chapterIndex].content.splice(0, 1);
				// Add to end of previous chapter
				next[chapterIndex - 1].content.push(lesson);
				return next;
			}
			next[chapterIndex].content[lessonIndex] = next[chapterIndex].content[lessonIndex - 1];
			next[chapterIndex].content[lessonIndex - 1] = lesson;
			return next;
		}
		if (lessonIndex === lastIndex && chapterIndex === next.length - 1) return null; // already last
		if (lessonIndex === lastIndex) {
			// Last lesson -> Move to next chapter
			// Remove from current chapter
			next[chapterIndex].content.pop();
			// Add to start of next chapter
			next[chapterIndex + 1].content.unshift(lesson);
			return next;
		}
		next[chapterIndex].content[lessonIndex] = next[chapterIndex].content[lessonIndex + 1];
		next[chapterIndex].content[lessonIndex + 1] = lesson;
		return next;
	}
	return null;
}

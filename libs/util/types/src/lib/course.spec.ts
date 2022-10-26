import { CourseContent, createChapter, createLesson, extractLessonIds } from "./course";

describe("extractLessonIds", () => {
	it("Collects lessonIds in order", () => {
		const content: CourseContent = [
			createChapter("Chapter 1", [createLesson("lesson-1"), createLesson("lesson-2")]),
			createChapter("Chapter 2", [createLesson("lesson-3")])
		];

		const result = extractLessonIds(content);

		expect(result).toHaveLength(3);
		expect(result).toEqual(["lesson-1", "lesson-2", "lesson-3"]);
	});
});

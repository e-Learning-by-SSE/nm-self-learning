import {
	CourseContent,
	createChapter,
	createLesson,
	extractLessonIds,
	traverseCourseContent
} from "./course";

describe("extractLessonIds", () => {
	it("Flat -> Collects lessonIds in order", () => {
		const content: CourseContent = [createLesson("lesson-1"), createLesson("lesson-2")];

		const result = extractLessonIds(content);

		expect(result).toHaveLength(2);
		expect(result).toEqual(["lesson-1", "lesson-2"]);
	});

	it("Nested -> Collects lessonIds (depth-first)", () => {
		const content: CourseContent = [
			createLesson("lesson-1"),
			createChapter("chapter-1", [
				createLesson("lesson-2"),
				createChapter("chapter-2", [createLesson("lesson-3"), createLesson("lesson-4")])
			]),
			createChapter("chapter-3", [createLesson("lesson-5")]),
			createLesson("lesson-6")
		];

		const result = extractLessonIds(content);

		expect(result).toHaveLength(6);
		expect(result).toEqual([
			"lesson-1",
			"lesson-2",
			"lesson-3",
			"lesson-4",
			"lesson-5",
			"lesson-6"
		]);
	});
});

describe("traverseCourseContent", () => {
	it("Nested -> Visits all chapters and lessons", () => {
		const content: CourseContent = [
			createLesson("lesson-1"),
			createChapter("chapter-1", [
				createLesson("lesson-2"),
				createChapter("chapter-2", [createLesson("lesson-3"), createLesson("lesson-4")])
			]),
			createChapter("chapter-3", [createLesson("lesson-5")]),
			createLesson("lesson-6")
		];

		let lessonCount = 0;
		let chapterCount = 0;

		traverseCourseContent(content, chapterOrLesson => {
			if (chapterOrLesson.type === "chapter") chapterCount++;
			else if (chapterOrLesson.type === "lesson") lessonCount++;
		});

		expect(chapterCount).toBe(3);
		expect(lessonCount).toBe(6);
	});
});

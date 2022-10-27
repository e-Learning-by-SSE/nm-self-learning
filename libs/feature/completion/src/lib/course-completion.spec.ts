import {
	CourseContent,
	createChapter,
	createLesson,
	createCourseContent,
	CompletedLessonsMap
} from "@self-learning/types";
import { mapToCourseCompletion } from "./course-completion";

function completedLessonMap(...lessonIds: string[]) {
	const lessonIdMap: CompletedLessonsMap = {};

	for (const lessonId of lessonIds) {
		lessonIdMap[lessonId] = {
			dateIso: new Date(2022).toISOString(),
			slug: `${lessonId}`,
			title: `${lessonId}`
		};
	}

	return lessonIdMap;
}

describe("mapToCourseCompletion", () => {
	it("Flat", () => {
		const content: CourseContent = createCourseContent([
			createChapter("Chapter 1", [createLesson("lesson-1"), createLesson("lesson-2")]),
			createChapter("Chapter 2", [createLesson("lesson-3"), createLesson("lesson-4")]),
			createChapter("Chapter 3", [createLesson("lesson-5"), createLesson("lesson-6")])
		]);

		const courseCompletion = mapToCourseCompletion(
			content,
			completedLessonMap("lesson-1", "lesson-2", "lesson-3")
		);

		expect(courseCompletion.courseCompletion.lessonCount).toEqual(6);
		expect(courseCompletion.courseCompletion.completedLessonCount).toEqual(3);
		expect(courseCompletion.courseCompletion.completionPercentage).toEqual(50);
		expect(courseCompletion).toMatchInlineSnapshot(`
		Object {
		  "chapterCompletion": Array [
		    Object {
		      "completedLessonCount": 2,
		      "completionPercentage": 100,
		      "lessonCount": 2,
		    },
		    Object {
		      "completedLessonCount": 1,
		      "completionPercentage": 50,
		      "lessonCount": 2,
		    },
		    Object {
		      "completedLessonCount": 0,
		      "completionPercentage": 0,
		      "lessonCount": 2,
		    },
		  ],
		  "courseCompletion": Object {
		    "completedLessonCount": 3,
		    "completionPercentage": 50,
		    "lessonCount": 6,
		  },
		}
	`);
	});
});

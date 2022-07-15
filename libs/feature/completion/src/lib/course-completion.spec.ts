import {
	CourseContent,
	createChapter,
	createLesson,
	createCourseContent
} from "@self-learning/types";
import { mapToCourseCompletion, mapToCourseCompletionFlat } from "./course-completion";

function completedLessonMap(...lessonIds: string[]) {
	const lessonIdMap: { [lessonId: string]: { createdAt: Date; slug: string; title: string } } =
		{};

	for (const lessonId of lessonIds) {
		lessonIdMap[lessonId] = {
			createdAt: new Date(),
			slug: `${lessonId}`,
			title: `${lessonId}`
		};
	}

	return lessonIdMap;
}

describe("mapToCourseCompletion", () => {
	it("Flat", () => {
		const content: CourseContent = createCourseContent([
			createLesson("lesson-1"),
			createLesson("lesson-2")
		]);

		const courseCompletion = mapToCourseCompletion(content, completedLessonMap("lesson-1"));

		expect(courseCompletion.completion.lessonCount).toEqual(2);
		expect(courseCompletion.completion.completedLessonCount).toEqual(1);
		expect(courseCompletion).toMatchInlineSnapshot(`
		Object {
		  "completion": Object {
		    "completedLessonCount": 1,
		    "completionPercentage": 50,
		    "lessonCount": 2,
		  },
		  "content": Array [
		    Object {
		      "isCompleted": true,
		      "lessonId": "lesson-1",
		      "lessonNr": 1,
		      "type": "lesson",
		    },
		    Object {
		      "isCompleted": false,
		      "lessonId": "lesson-2",
		      "lessonNr": 2,
		      "type": "lesson",
		    },
		  ],
		}
	`);
	});

	it("Chapter with lessons", () => {
		const content: CourseContent = createCourseContent([
			createChapter("chapter-1", [createLesson("lesson-1"), createLesson("lesson-2")])
		]);

		const courseCompletion = mapToCourseCompletion(content, completedLessonMap("lesson-1"));

		expect(courseCompletion.completion.lessonCount).toEqual(2);
		expect(courseCompletion.completion.completedLessonCount).toEqual(1);
	});

	it("Mixed chapters and lessons on same level", () => {
		const content: CourseContent = [
			createLesson("lesson-1"),
			createChapter("chapter-1", [createLesson("lesson-2"), createLesson("lesson-3")]),
			createLesson("lesson-4")
		];

		const courseCompletion = mapToCourseCompletion(
			content,
			completedLessonMap("lesson-1", "lesson-2")
		);

		expect(courseCompletion.completion.lessonCount).toEqual(4);
		expect(courseCompletion.completion.completedLessonCount).toEqual(2);
	});

	it("Multiple chapters on same level", () => {
		const content: CourseContent = createCourseContent([
			createChapter("chapter-1", [createLesson("lesson-1"), createLesson("lesson-2")]),
			createChapter("chapter-2", [createLesson("lesson-3"), createLesson("lesson-4")])
		]);

		const courseCompletion = mapToCourseCompletion(
			content,
			completedLessonMap("lesson-1", "lesson-3")
		);

		expect(courseCompletion.completion.lessonCount).toEqual(4);
		expect(courseCompletion.completion.completedLessonCount).toEqual(2);

		const [chapter1, chapter2] = courseCompletion.content;

		if (chapter1.type === "chapter" && chapter2.type === "chapter") {
			expect(chapter1.completion).toMatchInlineSnapshot(`
			Object {
			  "completedLessonCount": 1,
			  "completionPercentage": 50,
			  "lessonCount": 2,
			}
		`);
			expect(chapter2.completion).toMatchInlineSnapshot(`
			Object {
			  "completedLessonCount": 1,
			  "completionPercentage": 50,
			  "lessonCount": 2,
			}
		`);
		}
	});

	it("Nested chapter", () => {
		const content: CourseContent = createCourseContent([
			createChapter("chapter-1", [
				createLesson("lesson-1"),
				createChapter("chapter-2", [createLesson("lesson-2"), createLesson("lesson-3")]),
				createLesson("lesson-4")
			])
		]);

		const courseCompletion = mapToCourseCompletion(
			content,
			completedLessonMap("lesson-1", "lesson-2")
		);

		expect(courseCompletion.completion.lessonCount).toEqual(4);
		expect(courseCompletion.completion.completedLessonCount).toEqual(2);
		expect(courseCompletion).toMatchInlineSnapshot(`
		Object {
		  "completion": Object {
		    "completedLessonCount": 2,
		    "completionPercentage": 50,
		    "lessonCount": 4,
		  },
		  "content": Array [
		    Object {
		      "chapterNr": "1",
		      "completion": Object {
		        "completedLessonCount": 2,
		        "completionPercentage": 50,
		        "lessonCount": 4,
		      },
		      "content": Array [
		        Object {
		          "isCompleted": true,
		          "lessonId": "lesson-1",
		          "lessonNr": 1,
		          "type": "lesson",
		        },
		        Object {
		          "chapterNr": "1.1",
		          "completion": Object {
		            "completedLessonCount": 1,
		            "completionPercentage": 50,
		            "lessonCount": 2,
		          },
		          "content": Array [
		            Object {
		              "isCompleted": true,
		              "lessonId": "lesson-2",
		              "lessonNr": 2,
		              "type": "lesson",
		            },
		            Object {
		              "isCompleted": false,
		              "lessonId": "lesson-3",
		              "lessonNr": 3,
		              "type": "lesson",
		            },
		          ],
		          "description": null,
		          "title": "chapter-2",
		          "type": "chapter",
		        },
		        Object {
		          "isCompleted": false,
		          "lessonId": "lesson-4",
		          "lessonNr": 4,
		          "type": "lesson",
		        },
		      ],
		      "description": null,
		      "title": "chapter-1",
		      "type": "chapter",
		    },
		  ],
		}
	`);
	});

	it("Nested chapters (multiple levels)", () => {
		const content: CourseContent = createCourseContent([
			createChapter("chapter-1", [
				createLesson("lesson-1"),
				createChapter("chapter-2", [
					createLesson("lesson-2"),
					createChapter("chapter-3", [
						createLesson("lesson-3"),
						createLesson("lesson-4")
					]),
					createLesson("lesson-5")
				]),
				createLesson("lesson-6")
			])
		]);

		const courseCompletion = mapToCourseCompletion(
			content,
			completedLessonMap(
				"lesson-1",
				"lesson-2",
				"lesson-3",
				"lesson-4",
				"lesson-5",
				"lesson-6"
			)
		);

		expect(courseCompletion.completion.lessonCount).toEqual(6);
		expect(courseCompletion.completion.completedLessonCount).toEqual(6);
		expect(courseCompletion).toMatchInlineSnapshot(`
		Object {
		  "completion": Object {
		    "completedLessonCount": 6,
		    "completionPercentage": 100,
		    "lessonCount": 6,
		  },
		  "content": Array [
		    Object {
		      "chapterNr": "1",
		      "completion": Object {
		        "completedLessonCount": 6,
		        "completionPercentage": 100,
		        "lessonCount": 6,
		      },
		      "content": Array [
		        Object {
		          "isCompleted": true,
		          "lessonId": "lesson-1",
		          "lessonNr": 1,
		          "type": "lesson",
		        },
		        Object {
		          "chapterNr": "1.1",
		          "completion": Object {
		            "completedLessonCount": 4,
		            "completionPercentage": 100,
		            "lessonCount": 4,
		          },
		          "content": Array [
		            Object {
		              "isCompleted": true,
		              "lessonId": "lesson-2",
		              "lessonNr": 2,
		              "type": "lesson",
		            },
		            Object {
		              "chapterNr": "1.1.1",
		              "completion": Object {
		                "completedLessonCount": 2,
		                "completionPercentage": 100,
		                "lessonCount": 2,
		              },
		              "content": Array [
		                Object {
		                  "isCompleted": true,
		                  "lessonId": "lesson-3",
		                  "lessonNr": 3,
		                  "type": "lesson",
		                },
		                Object {
		                  "isCompleted": true,
		                  "lessonId": "lesson-4",
		                  "lessonNr": 4,
		                  "type": "lesson",
		                },
		              ],
		              "description": null,
		              "title": "chapter-3",
		              "type": "chapter",
		            },
		            Object {
		              "isCompleted": true,
		              "lessonId": "lesson-5",
		              "lessonNr": 5,
		              "type": "lesson",
		            },
		          ],
		          "description": null,
		          "title": "chapter-2",
		          "type": "chapter",
		        },
		        Object {
		          "isCompleted": true,
		          "lessonId": "lesson-6",
		          "lessonNr": 6,
		          "type": "lesson",
		        },
		      ],
		      "description": null,
		      "title": "chapter-1",
		      "type": "chapter",
		    },
		  ],
		}
	`);
	});
});

describe("mapToCourseCompletionFlat", () => {
	it("Flat", () => {
		const content: CourseContent = createCourseContent([
			createLesson("lesson-1"),
			createLesson("lesson-2")
		]);

		const courseCompletion = mapToCourseCompletionFlat(content, completedLessonMap("lesson-1"));

		expect(courseCompletion).toMatchInlineSnapshot(`
		Object {
		  "course": Object {
		    "completedLessonCount": 1,
		    "completionPercentage": 50,
		    "lessonCount": 2,
		  },
		}
	`);
	});

	it("", () => {
		const content: CourseContent = createCourseContent([
			createLesson("lesson-1"),
			createChapter("chapter-1", [
				createLesson("lesson-2"),
				createChapter("chapter-1.1", [
					createLesson("lesson-3"),
					createChapter("chapter-1.1.1", [createLesson("lesson-4")])
				]),
				createChapter("chapter-1.2", [
					createLesson("lesson-5"),
					createChapter("chapter-1.2.1", [createLesson("lesson-6")]),
					createChapter("chapter-1.2.2", [createLesson("lesson-7")])
				])
			]),
			createChapter("chapter-2", [createLesson("lesson-8")]),
			createLesson("lesson-9")
		]);

		const courseCompletion = mapToCourseCompletionFlat(
			content,
			completedLessonMap(
				"lesson-1",
				"lesson-2",
				"lesson-3",
				"lesson-4",
				"lesson-5",
				"lesson-6"
			)
		);

		expect(courseCompletion).toMatchInlineSnapshot(`
		Object {
		  "1": Object {
		    "completedLessonCount": 5,
		    "completionPercentage": 83,
		    "lessonCount": 6,
		  },
		  "1.1": Object {
		    "completedLessonCount": 2,
		    "completionPercentage": 100,
		    "lessonCount": 2,
		  },
		  "1.1.1": Object {
		    "completedLessonCount": 1,
		    "completionPercentage": 100,
		    "lessonCount": 1,
		  },
		  "1.2": Object {
		    "completedLessonCount": 2,
		    "completionPercentage": 66,
		    "lessonCount": 3,
		  },
		  "1.2.1": Object {
		    "completedLessonCount": 1,
		    "completionPercentage": 100,
		    "lessonCount": 1,
		  },
		  "1.2.2": Object {
		    "completedLessonCount": 0,
		    "completionPercentage": 0,
		    "lessonCount": 1,
		  },
		  "2": Object {
		    "completedLessonCount": 0,
		    "completionPercentage": 0,
		    "lessonCount": 1,
		  },
		  "course": Object {
		    "completedLessonCount": 6,
		    "completionPercentage": 66,
		    "lessonCount": 9,
		  },
		}
	`);
	});
});

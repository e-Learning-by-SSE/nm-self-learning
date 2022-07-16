import { createEmptyLesson } from "./lesson";
import { createLessonMeta } from "./lesson-meta";

describe("createLessonMeta", () => {
	it("No Quiz -> hasQuiz: false", () => {
		const lesson = createEmptyLesson();
		lesson.quiz = [];
		const meta = createLessonMeta(lesson);
		expect(meta.hasQuiz).toEqual(false);
	});

	it("Adds media type meta", () => {
		const lesson = createEmptyLesson();
		lesson.content = [
			{
				type: "video",
				value: { url: "https://example.com/video.mp4" },
				meta: { duration: 120 }
			},
			{ type: "article", value: { content: "Hello World" }, meta: { estimatedDuration: 300 } }
		];

		const meta = createLessonMeta(lesson);

		expect(meta).toMatchInlineSnapshot(`
		Object {
		  "hasQuiz": false,
		  "mediaTypes": Object {
		    "article": Object {
		      "estimatedDuration": 300,
		    },
		    "video": Object {
		      "duration": 120,
		    },
		  },
		}
	`);
	});

	it("No media types -> Empty mediaTypes object", () => {
		const lesson = createEmptyLesson();
		lesson.content = [];

		const meta = createLessonMeta(lesson);

		expect(meta).toMatchInlineSnapshot(`
		Object {
		  "hasQuiz": false,
		  "mediaTypes": Object {},
		}
	`);
	});
});

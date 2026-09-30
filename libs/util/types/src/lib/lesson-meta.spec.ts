import { createEmptyLesson } from "./lesson";
import { createLessonMeta, getLessonDuration } from "./lesson-meta";

describe("createLessonMeta", () => {
	it("No Quiz -> hasQuiz: false", () => {
		const lesson = createEmptyLesson();
		lesson.quiz = null;
		const meta = createLessonMeta(lesson);
		expect(meta.hasQuiz).toEqual(false);
	});

	it("Empty Quiz -> hasQuiz: false", () => {
		// Setup
		const lesson = createEmptyLesson();
		lesson.quiz = { questions: [], questionOrder: [], config: null };

		// Exercise
		const meta = createLessonMeta(lesson);

		// Verify
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

describe("summed lesson durations", () => {
	it("sums repeated, interleaved content per type without changing the content", () => {
		// Setup
		const lesson = createEmptyLesson();
		lesson.content = [
			{ type: "video", value: { url: "video" }, meta: { duration: 120 } },
			{ type: "pdf", value: { url: "pdf" }, meta: { estimatedDuration: 60 } },
			{ type: "article", value: { content: "text" }, meta: { estimatedDuration: 30.5 } },
			{ type: "iframe", value: { url: "page" }, meta: { estimatedDuration: 10 } },
			{ type: "video", value: { url: "video2" }, meta: { duration: 45 } },
			{ type: "article", value: { content: "text2" }, meta: { estimatedDuration: 20.5 } },
			{ type: "pdf", value: { url: "pdf2" }, meta: { estimatedDuration: 90 } },
			{ type: "iframe", value: { url: "page2" }, meta: { estimatedDuration: 15 } },
			{ type: "video", value: { url: "video3" }, meta: { duration: 0 } }
		];
		const originalContent = structuredClone(lesson.content);

		// Exercise
		const meta = createLessonMeta(lesson);
		const duration = getLessonDuration(meta);
		const repeatedMeta = createLessonMeta(lesson);

		// Verify
		expect(meta.mediaTypes).toEqual({
			video: { duration: 165 },
			article: { estimatedDuration: 51 },
			pdf: { estimatedDuration: 150 },
			iframe: { estimatedDuration: 25 }
		});
		expect(duration).toBe(391);
		expect(lesson.content).toEqual(originalContent);
		expect(repeatedMeta).toEqual(meta);
	});

	// Setup
	it.each([null, undefined, { hasQuiz: false, mediaTypes: {} }])(
		"returns zero for missing or empty metadata: %s",
		meta => {
			// Exercise
			const duration = getLessonDuration(meta);

			// Verify
			expect(duration).toBe(0);
		}
	);

	it("includes estimated durations when a video has zero duration", () => {
		// Setup
		const meta = {
			hasQuiz: false,
			mediaTypes: { video: { duration: 0 }, pdf: { estimatedDuration: 60 } }
		};

		// Exercise
		const duration = getLessonDuration(meta);

		// Verify
		expect(duration).toBe(60);
	});
});

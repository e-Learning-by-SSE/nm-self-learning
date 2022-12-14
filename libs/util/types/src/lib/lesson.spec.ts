import { Lesson, lessonSchema } from "./lesson";

const minValidLesson: Lesson = {
	lessonId: "id-1",
	slug: "slug-1",
	title: "The Title",
	content: [],
	quiz: null,
	authors: []
};

describe("lessonSchema", () => {
	describe("Invalid", () => {
		it("null", () => {
			const result = lessonSchema.safeParse(null);
			expect(result.success).toBeDefined();
		});

		it("{}", () => {
			const result = lessonSchema.safeParse({});
			expect(result.success).toBeFalsy();
		});

		it("Missing title", () => {
			const lesson: Partial<Lesson> = {
				...minValidLesson,
				title: undefined
			};

			const result = lessonSchema.safeParse(lesson);
			expect(result.success).toBeFalsy();
		});

		it("Title with empty string", () => {
			const lesson: Partial<Lesson> = {
				...minValidLesson,
				title: ""
			};

			const result = lessonSchema.safeParse(lesson);
			expect(result.success).toBeFalsy();
		});

		it("Invalid content", () => {
			const lesson: Partial<Lesson> = {
				...minValidLesson,
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				content: null as any
			};

			const result = lessonSchema.safeParse(lesson);

			expect(result).toMatchInlineSnapshot(`
			Object {
			  "error": [ZodError: [
			  {
			    "code": "invalid_type",
			    "expected": "array",
			    "received": "null",
			    "path": [
			      "content"
			    ],
			    "message": "Expected array, received null"
			  }
			]],
			  "success": false,
			}
		`);
		});
	});

	describe("Valid", () => {
		it("Minimal valid lesson", () => {
			const result = lessonSchema.safeParse(minValidLesson);
			expect(result.success).toEqual(true);
			expect(result).toMatchInlineSnapshot(`
			Object {
			  "data": Object {
			    "authors": Array [],
			    "content": Array [],
			    "lessonId": "id-1",
			    "quiz": null,
			    "slug": "slug-1",
			    "title": "The Title",
			  },
			  "success": true,
			}
		`);
		});

		it("With content", () => {
			const lesson: Partial<Lesson> = {
				...minValidLesson,
				content: [
					{
						type: "video",
						value: {
							url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
						},
						meta: {
							duration: 120
						}
					},
					{
						type: "article",
						value: {
							content: "This is an article"
						},
						meta: {
							estimatedDuration: 300
						}
					}
				]
			};

			const result = lessonSchema.safeParse(lesson);
			expect(result.success).toEqual(true);
		});

		it("With quiz", () => {
			const lesson: Partial<Lesson> = {
				...minValidLesson,
				quiz: {
					questions: [
						{
							type: "multiple-choice",
							questionId: "q1",
							statement: "What is the answer to life, the universe and everything?",
							answers: [
								{
									answerId: "a",
									content: "42",
									isCorrect: true
								},
								{
									answerId: "b",
									content: "43",
									isCorrect: false
								}
							],
							hints: [],
							withCertainty: false
						}
					],
					config: {
						hints: {
							enabled: true,
							maxHints: 1
						},
						maxErrors: 0,
						showSolution: false
					}
				}
			};

			const result = lessonSchema.safeParse(lesson);
			expect(result.success).toEqual(true);
		});
	});
});

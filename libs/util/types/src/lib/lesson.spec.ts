import { Lesson, lessonSchema } from "./lesson";

const minValidLesson: Lesson = {
	lessonId: "id-1",
	slug: "slug-1",
	title: "The Title",
	content: [],
	quiz: [],
	authors: []
};

describe("lessonSchema", () => {
	describe("Invalid", () => {
		it("null", () => {
			const result = lessonSchema.safeParse(null);
			expect(result["error"]).toBeDefined();
		});

		it("{}", () => {
			const result = lessonSchema.safeParse({});
			expect(result["error"]).toBeDefined();
		});

		it("Missing title", () => {
			const lesson: Partial<Lesson> = {
				...minValidLesson,
				title: undefined
			};

			const result = lessonSchema.safeParse(lesson);

			expect(result["error"]).toBeDefined();
		});

		it("Title with empty string", () => {
			const lesson: Partial<Lesson> = {
				...minValidLesson,
				title: ""
			};

			const result = lessonSchema.safeParse(lesson);

			expect(result["error"]).toBeDefined();
		});

		it("Invalid content", () => {
			const lesson: Partial<Lesson> = {
				...minValidLesson,
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				content: null as any
			};

			const result = lessonSchema.safeParse(lesson);

			expect(result["error"]).toMatchInlineSnapshot(`
			[ZodError: [
			  {
			    "code": "invalid_type",
			    "expected": "array",
			    "received": "null",
			    "path": [
			      "content"
			    ],
			    "message": "Expected array, received null"
			  }
			]]
		`);
		});
	});

	describe("Valid", () => {
		it("Minimal valid lesson", () => {
			const result = lessonSchema.safeParse(minValidLesson);
			expect(result["error"]).toBeUndefined();
			expect(result.success).toEqual(true);
			expect(result["data"]).toMatchInlineSnapshot(`
			Object {
			  "authors": Array [],
			  "content": Array [],
			  "lessonId": "id-1",
			  "quiz": Array [],
			  "slug": "slug-1",
			  "title": "The Title",
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

			expect(result["error"]).toBeUndefined();
		});
	});
});

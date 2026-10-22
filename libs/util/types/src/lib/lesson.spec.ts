import { AccessLevel, LessonType } from "@prisma/client";
import { Lesson, lessonSchema } from "./lesson";

const minValidLesson: Lesson = {
	lessonId: "id-1",
	slug: "slug-1",
	title: "The Title",
	licenseId: 1,
	content: [],
	quiz: null,
	authors: [],
	lessonType: LessonType.TRADITIONAL,
	selfRegulatedQuestion: null,
	requires: [],
	provides: [],
	permissions: [
		{
			groupId: 1,
			groupName: "Group 1",
			accessLevel: AccessLevel.FULL
		}
	],
	ragEnabled: true
};

describe("lessonSchema", () => {
	describe("quiz question order", () => {
		it("accepts an empty quiz without a question order and normalizes it", () => {
			//Setup
			// Exercise
			const result = lessonSchema.parse({
				...minValidLesson,
				quiz: { questions: [] }
			});

			// Verify
			expect(result.quiz).toEqual({ questions: [], questionOrder: [] });
		});

		it("accepts an empty quiz with an empty question order", () => {
			//Setup
			// Exercise
			const result = lessonSchema.safeParse({
				...minValidLesson,
				quiz: { questions: [], questionOrder: [] }
			});

			// Verify
			expect(result.success).toBe(true);
		});

		it.each([undefined, []])("rejects a nonempty quiz with questionOrder %j", questionOrder => {
			//Setup
			// Exercise
			const result = lessonSchema.safeParse({
				...minValidLesson,
				quiz: { questions: [{ questionId: "q1" }], questionOrder }
			});

			// Verify
			expect(result.success).toBe(false);
			expect(result.error?.issues).toEqual(
				expect.arrayContaining([
					expect.objectContaining({ path: ["quiz", "questionOrder"] })
				])
			);
		});

		it.each([null, "q1", [1]])(
			"rejects malformed questionOrder %j even without questions",
			questionOrder => {
				//Setup
				// Exercise
				const result = lessonSchema.safeParse({
					...minValidLesson,
					quiz: { questions: [], questionOrder }
				});

				// Verify
				expect(result.success).toBe(false);
			}
		);
	});

	describe("Invalid", () => {
		it("null", () => {
			// Exercise
			const result = lessonSchema.safeParse(null);
			// Verify
			expect(result.success).toBeDefined();
		});

		it("{}", () => {
			// Exercise
			const result = lessonSchema.safeParse({});
			// Verify
			expect(result.success).toBeFalsy();
		});

		it("Missing title", () => {
			//Setup
			const lesson: Partial<Lesson> = {
				...minValidLesson,
				title: undefined
			};

			// Exercise
			const result = lessonSchema.safeParse(lesson);
			// Verify
			expect(result.success).toBeFalsy();
		});

		it("Missing lesson type", () => {
			//Setup
			const lesson: Partial<Lesson> = {
				...minValidLesson,
				lessonType: undefined
			};

			// Exercise
			const result = lessonSchema.safeParse(lesson);
			// Verify
			expect(result.success).toBeFalsy();
		});

		it("Title with empty string", () => {
			//Setup
			const lesson: Partial<Lesson> = {
				...minValidLesson,
				title: ""
			};

			// Exercise
			const result = lessonSchema.safeParse(lesson);
			// Verify
			expect(result.success).toBeFalsy();
		});

		it("Invalid content", () => {
			//Setup
			const lesson: Partial<Lesson> = {
				...minValidLesson,
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				content: null as any
			};

			// Exercise
			const result = lessonSchema.safeParse(lesson);

			// Verify
			expect(result).toMatchInlineSnapshot(`
			Object {
			  "error": [ZodError: [
			  {
			    "expected": "array",
			    "code": "invalid_type",
			    "path": [
			      "content"
			    ],
			    "message": "Invalid input: expected array, received null"
			  }
			]],
			  "success": false,
			}
		`);
		});
	});

	describe("Valid", () => {
		it("Minimal valid lesson", () => {
			// Exercise
			const result = lessonSchema.safeParse(minValidLesson);
			// Verify
			expect(result.success).toEqual(true);
			expect(result).toMatchInlineSnapshot(`
			Object {
			  "data": Object {
			    "authors": Array [],
			    "content": Array [],
			    "lessonId": "id-1",
			    "lessonType": "TRADITIONAL",
			    "licenseId": 1,
			    "permissions": Array [
			      Object {
			        "accessLevel": "FULL",
			        "groupId": 1,
			        "groupName": "Group 1",
			      },
			    ],
			    "provides": Array [],
			    "quiz": null,
			    "ragEnabled": true,
			    "requires": Array [],
			    "selfRegulatedQuestion": null,
			    "slug": "slug-1",
			    "title": "The Title",
			  },
			  "success": true,
			}
		`);
		});

		it("With content", () => {
			//Setup
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

			// Exercise
			const result = lessonSchema.safeParse(lesson);
			// Verify
			expect(result.success).toEqual(true);
		});

		it("With quiz", () => {
			//Setup
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
					questionOrder: ["q1"],
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

			// Exercise
			const result = lessonSchema.safeParse(lesson);
			// Verify
			expect(result.success).toEqual(true);
		});
	});
});

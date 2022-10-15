import { ZodError } from "zod";
import { CourseFormModel, courseFormSchema } from "./course-form-model";

function getErrors(value: unknown) {
	try {
		courseFormSchema.parse(value);
		throw Error("Expected validation error.");
	} catch (error) {
		return (error as ZodError).errors;
	}
}

const minValidCourse: CourseFormModel = {
	title: "A Course",
	slug: "a-course",
	subtitle: "A Subtitle",
	content: [],
	courseId: null,
	description: null,
	imgUrl: null,
	subjectId: null,
	authors: []
};

describe("courseFormSchema", () => {
	describe("invalid", () => {
		it("null", () => {
			expect(getErrors(null)).toMatchInlineSnapshot(`
			Array [
			  Object {
			    "code": "invalid_type",
			    "expected": "object",
			    "message": "Expected object, received null",
			    "path": Array [],
			    "received": "null",
			  },
			]
		`);
		});

		it("{}", () => {
			expect(getErrors({})).toMatchInlineSnapshot(`
			Array [
			  Object {
			    "code": "invalid_type",
			    "expected": "string",
			    "message": "Required",
			    "path": Array [
			      "courseId",
			    ],
			    "received": "undefined",
			  },
			  Object {
			    "code": "invalid_type",
			    "expected": "number",
			    "message": "Required",
			    "path": Array [
			      "subjectId",
			    ],
			    "received": "undefined",
			  },
			  Object {
			    "code": "invalid_type",
			    "expected": "string",
			    "message": "Required",
			    "path": Array [
			      "slug",
			    ],
			    "received": "undefined",
			  },
			  Object {
			    "code": "invalid_type",
			    "expected": "string",
			    "message": "Required",
			    "path": Array [
			      "title",
			    ],
			    "received": "undefined",
			  },
			  Object {
			    "code": "invalid_type",
			    "expected": "string",
			    "message": "Required",
			    "path": Array [
			      "subtitle",
			    ],
			    "received": "undefined",
			  },
			  Object {
			    "code": "invalid_type",
			    "expected": "string",
			    "message": "Required",
			    "path": Array [
			      "description",
			    ],
			    "received": "undefined",
			  },
			  Object {
			    "code": "invalid_type",
			    "expected": "string",
			    "message": "Required",
			    "path": Array [
			      "imgUrl",
			    ],
			    "received": "undefined",
			  },
			  Object {
			    "code": "invalid_type",
			    "expected": "array",
			    "message": "Required",
			    "path": Array [
			      "authors",
			    ],
			    "received": "undefined",
			  },
			  Object {
			    "code": "invalid_type",
			    "expected": "array",
			    "message": "Required",
			    "path": Array [
			      "content",
			    ],
			    "received": "undefined",
			  },
			]
		`);
		});

		it("missing title", () => {
			const course: Partial<CourseFormModel> = {
				...minValidCourse,
				title: undefined
			};

			expect(getErrors(course)).toMatchInlineSnapshot(`
			Array [
			  Object {
			    "code": "invalid_type",
			    "expected": "string",
			    "message": "Required",
			    "path": Array [
			      "title",
			    ],
			    "received": "undefined",
			  },
			]
		`);
		});

		it("missing slug", () => {
			const course: Partial<CourseFormModel> = {
				...minValidCourse,
				slug: undefined
			};

			expect(getErrors(course)).toMatchInlineSnapshot(`
			Array [
			  Object {
			    "code": "invalid_type",
			    "expected": "string",
			    "message": "Required",
			    "path": Array [
			      "slug",
			    ],
			    "received": "undefined",
			  },
			]
		`);
		});

		it("missing content", () => {
			const course: Partial<CourseFormModel> = {
				...minValidCourse,
				content: undefined
			};

			expect(getErrors(course)).toMatchInlineSnapshot(`
			Array [
			  Object {
			    "code": "invalid_type",
			    "expected": "array",
			    "message": "Required",
			    "path": Array [
			      "content",
			    ],
			    "received": "undefined",
			  },
			]
		`);
		});
	});

	describe("valid", () => {
		it("minimal information", () => {
			expect(courseFormSchema.safeParse(minValidCourse).success).toBeDefined();
		});

		it("full information", () => {
			const course: CourseFormModel = {
				title: "A Course",
				slug: "a-course",
				subtitle: "A Subtitle",
				content: [
					{
						type: "chapter",
						chapterId: "chapter-1",
						chapterNr: "1",
						title: "Chapter 1",
						description: "lorem ipsum",
						content: [
							{ type: "lesson", lessonId: "lesson-1", lessonNr: 1 },
							{ type: "lesson", lessonId: "lesson-2", lessonNr: 2 }
						]
					}
				],
				courseId: "abc",
				description: "A description",
				imgUrl: "http://example.com/image.png",
				subjectId: 1,
				authors: [{ slug: "author-a" }, { slug: "author-b" }]
			};

			expect(courseFormSchema.safeParse(course).success).toBeDefined();
		});
	});
});
